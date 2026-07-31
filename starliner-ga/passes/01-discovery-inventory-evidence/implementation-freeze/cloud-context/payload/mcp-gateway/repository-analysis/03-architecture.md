# Architecture

## Component map

```mermaid
flowchart LR
    Browser["Browser/admin/user UI"] --> Gateway["gateway.py FastAPI process"]
    MCPClient["MCP client"] --> Direct["Direct /{backend_id}/mcp"]
    MCPClient --> One["OneMCP /quilrone/.../mcp"]
    Direct --> Handler["services.mcp_handler.MCPHandler"]
    One --> OneHandler["services.onemcp_handler.OneMCPHandler"]
    Handler --> Registry["BackendRegistry in-memory cache"]
    OneHandler --> Registry
    Handler --> Remote["Configured remote MCP backends"]
    OneHandler --> Remote
    Gateway --> SQLite["gateway.db / mcp_logs.db / mcpgateway_logs.db"]
    Gateway --> CH["Optional ClickHouse"]
    Gateway --> IdP["Entra / Google / Auth0 / upstream OAuth"]
    Gateway --> RunnerAPI["workflow_runner.app separate process"]
    RunnerWorker["workflow_runner.worker"] --> RunnerAPI
    Scheduler["workflow_scheduler.worker"] --> Gateway
    RunnerAPI --> RunnerDB["workflow_runner.db + artifacts"]
    Syncer["ClickHouse sync process"] --> SQLite
    Syncer --> CH
```

Every solid edge above is a checked-in call, HTTP request, database access, or route composition. The diagram does not imply that the separately started processes are deployed by the scoped Dockerfile.

## Main-process composition

`gateway.py` imports repository modules, executes `init_database`, `init_log_database`, and `init_event_log_database`, constructs repositories/services/handlers, calls module setter functions, mounts `static/`, and includes routers in this order:

`auth → backends → quilrone → starliner → oauth → mcp → logs → log export → clients → admin dashboard → admin memories → admin audit → user memories → workflow agents → workflow run admin → Entra → Google → Auth0 → store v1 → store v2`.

`Verified:` Router order is source-significant because Starlette/FastAPI match in registration order. No dependency-injection framework is present; setter wiring and module globals are the dependency mechanism.

```mermaid
flowchart TD
    Import["Import gateway.py"] --> DBInit["Initialize three SQLite schemas"]
    DBInit --> Construct["Construct repositories and services"]
    Construct --> Inject["Call route/service setter functions"]
    Inject --> App["Construct FastAPI app and middleware"]
    App --> Routes["Mount static files and include routers in source order"]
    Routes --> Lifespan["ASGI lifespan starts when server runs"]
```

## Startup and shutdown sequence

```mermaid
sequenceDiagram
    participant Server as Uvicorn/ASGI server
    participant Gateway as gateway.lifespan
    participant Registry as BackendRegistry
    participant DB as SQLite repositories
    participant Groups as Smart-group sync
    participant Starliner as Observe runtime
    Server->>Gateway: enter lifespan
    Gateway->>Registry: load()
    Registry->>DB: read backends
    Gateway->>DB: cleanup defaults (best effort)
    Gateway->>DB: seed catalog (best effort)
    Gateway->>DB: backfill slugs/tenants (best effort)
    Gateway->>DB: cleanup expired OAuth states (best effort)
    Gateway->>Groups: sync once, 15-second bound
    Gateway->>Groups: create background sync task
    Gateway->>Starliner: start() (best effort)
    Gateway-->>Server: ready/yield
    Server->>Gateway: shutdown
    Gateway->>Starliner: stop() (best effort)
    Gateway->>Groups: cancel task and await
    Gateway->>Gateway: drain log workers
    Gateway->>DB: close ClickHouse and three SQLite connections
```

`Verified:` `registry.load()` is not caught and is startup-fatal. The later maintenance actions are caught and logged. Database schema creation occurs earlier, at import, and is also fatal if it raises.

## Major MCP request flow

```mermaid
sequenceDiagram
    participant C as MCP client
    participant R as routes.mcp
    participant A as Auth/token repositories
    participant H as MCPHandler
    participant P as DLP/policy/Starliner
    participant U as Remote MCP backend
    participant L as Log/event repositories
    C->>R: POST /{backend_id}/mcp
    R->>A: resolve delegation/OAuth/API/proxy/legacy identity
    R->>H: handle_request(...)
    H->>P: pre-call policy and argument checks
    alt rejected
        P-->>H: JSON-RPC rejection
        H->>L: rejected/request log
    else permitted
        H->>U: forward MCP request
        U-->>H: MCP response/SSE
        H->>P: output metadata/DLP/token-saving transforms
        H->>L: enqueue/persist tool log and events
    end
    H-->>C: JSON-RPC/SSE response
```

Authentication has multiple branches rather than one universal token parser. Exact route evidence is in [API reference](10-api-and-interface-reference.md); security consequences are in [security model](12-security-model.md).

## OneMCP aggregation

```mermaid
flowchart LR
    Request["/quilrone[/tenant]/mcp"] --> Session["onemcp_sessions and event queues"]
    Session --> Native["Native tools: memory/client apps/confirmation"]
    Session --> Discover["Backend/tool discovery"]
    Discover --> Aggregate["Tool namespace/metadata aggregation"]
    Aggregate --> Dispatch["OneMCPHandler dispatch"]
    Dispatch --> Backend["Selected remote backend"]
    Dispatch --> Logs["tool/event logs"]
```

`Verified:` OneMCP has separate session, route, OAuth, confirmation, client-app, discovery, and handler modules. Native tools can be handled without a remote backend. Confirmation state is process-local.

## Workflow topology

```mermaid
flowchart LR
    Admin["Gateway admin APIs"] --> ControlDB["Gateway workflow definitions/schedules/runs"]
    Scheduler["workflow_scheduler.worker"] --> ControlDB
    Scheduler --> RunnerHTTP["workflow_runner.app"]
    Admin --> RunnerHTTP
    RunnerWorker["workflow_runner.worker"] --> RunnerDB["Runner DB leases/runs/steps"]
    RunnerWorker --> Engine["workflow_runner.engine"]
    Engine --> GatewayMCP["Gateway MCP/delegation APIs"]
    Engine --> Artifacts["Artifact filesystem"]
    Retention["workflow_runner.retention_worker"] --> RunnerDB
    Retention --> Artifacts
```

`Verified:` the scheduler claims due schedules, requests runs through runner HTTP, and updates gateway control-plane records. The runner engine executes workflow nodes, records steps/chat/artifacts, and uses delegated gateway access. `Unresolved:` production orchestration and network policy for these processes are not present in the scoped tree.

## Trust boundaries

- Incoming browser and MCP traffic crosses into FastAPI/Axum/FastMCP validation.
- Gateway tokens, external IdP JWTs, API tokens, OAuth credentials, delegation tokens, and internal runner tokens cross authentication boundaries.
- Backend endpoints and the admin-supplied ZIA URL cause outbound network activity.
- SQLite/ClickHouse and artifact paths cross filesystem/database boundaries.
- Remote tool input/output crosses DLP/policy/logging boundaries.
- Static admin/user HTML and JavaScript consume JSON APIs using browser-held credentials.

No diagram edge should be read as an authorization guarantee; enforcement is documented by location in [12-security-model.md](12-security-model.md).
