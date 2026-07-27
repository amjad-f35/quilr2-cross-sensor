# Enterprise question catalog

Each question below is finite, queryable, and tied to an action. `Current` means the present system has relevant rows/APIs; it does not imply canonical correctness.

## Discovery and identity

| Question | Required model/query | Support/gap | Page/action |
| --- | --- | --- | --- |
| What AI applications exist? | Active Tenant Applications → AI Product/Surface | Current rows; resolver/MVS needed | AI Estate; review/manage |
| Which are managed, restricted, blocked, or unknown? | Governance dimension at current validity | Current settings/approvals; normalize | AI Estate; approve/restrict/block |
| Which observations formed this application? | Entity → source observations/evidence | New observation ledger | Sources; inspect |
| Why are two records the same? | Merge decision, identifiers, rules, conflicts | New resolver | Resolution Center; confirm/split |
| Which matches are unresolved? | Candidate clusters by confidence/age | New resolver | Resolution Center |
| Which products have several surfaces? | Product ←SURFACE_OF/INSTANCE_OF | Derivable after catalog | Application detail |
| Which use personal accounts? | User→Application Account with type evidence | Account telemetry missing | Estate/finding; migrate/restrict |
| Which have no owner? | Entity minus valid OWNED_BY | Partial owner data | Estate/finding; assign |
| Which disappeared from healthy sensors? | Last observations + expected coverage | Derivable after coverage registry | Estate/Coverage; retire/repair |
| What changed this week? | Entity/relationship lifecycle events | New state-transition events | Estate activity; review |

## Relationships and impact

| Question | Required model/query | Support/gap | Page/action |
| --- | --- | --- | --- |
| Which users use this application? | Human User USES Tenant Application in window | Derivable now | Application detail |
| Which devices/installations? | Installation INSTALLED_ON Device | Endpoint/BES available | Application detail |
| Which agents depend on this model? | Agent USES Model Deployment | Partial config/activity; stable agent IDs needed | Model impact; migrate |
| Which tools does an agent call? | Agent Run CALLED Tool | MCP/run telemetry missing | Agent detail; restrict |
| Which MCP servers expose this tool? | Server PROVIDES Tool | Endpoint partial; MCP contract needed | Tool detail |
| Which data can this agent access? | Authorization graph to Data Assets | External access/data integration | Agent impact; reduce access |
| Which policies apply? | Policy APPLIES_TO entity + scope resolution | Current policy data fragmented | Entity policy facet |
| What breaks if connector/model/tool is disabled? | Reverse dependency traversal + recent activity | Relationship materializer needed | Impact preview |
| Which agents are affected by model retirement? | Model Deployment ←USES Agent | Stable dependencies needed | Model detail; plan migration |

## Governance

| Question | Required model/query | Support/gap | Page/action |
| --- | --- | --- | --- |
| Which AI activity bypasses approved gateways? | Endpoint/browser activity minus correlated gateway events + coverage | Partial; stronger correlation | Findings; block/reroute |
| Where is sensitive activity unenforced? | Data events + Policy→Enforcement coverage | Coverage registry required | Coverage/Findings |
| Which actions lack actor identity? | Canonical actions missing required actor links | New action contract | Findings; fix identity |
| Which applications have conflicting controls? | Effective policy evaluation/conflict set | Policy model required | Findings/policy |
| Why was an action permitted? | Decision→Policy/inputs/relationships/evidence | Partial current fields; versioning needed | Activity decision detail |
| Where can this policy enforce? | Policy scope→Surface→Enforcement Point→Sensor health | New registry | Coverage; deploy sensor |
| Which exceptions apply/expired? | Bitemporal Policy/Exception evaluation | Unified policy needed | Policy detail |
| Which destructive actions lack approval? | Action capability + Approval validity | MCP/action telemetry needed | Findings |

## Findings and investigations

| Question | Required model/query | Support/gap | Page/action |
| --- | --- | --- | --- |
| What is the root cause? | Finding CAUSED_BY entity + derivation | New correlation | Finding detail |
| Which sensors support or contradict it? | Finding→Evidence/Event→Sensor | New evidence graph | Finding evidence |
| What else is affected? | Typed impact traversal | Relationship projection | Finding impact |
| Is it one occurrence or recurring? | Finding generation + canonical events | MVS | Finding timeline |
| What action resolves it? | Finding type action contract + owner | MVS | Finding action |
| Has it returned? | Reopen generations/dedup key | MVS | Finding history |

## Cost, value, and assurance

| Question | Required model/query | Support/gap | Page/action |
| --- | --- | --- | --- |
| Total spend for one product across browser/API/agents? | Cost records → canonical product/surface/agent without duplicates | Browser cost/account and agent attribution incomplete | Cost detail; optimize |
| Which products create redundant spend? | Capability catalog + billing + usage | External integration | Recommendation/finding |
| Which agents have high cost/low success? | Run cost + verified outcomes | New telemetry | Agent detail; tune/suspend |
| Which department owns spend? | Cost→entity→event-time owner/org | IdP/HR/ownership needed | Cost allocation |
| Which policy changed cost? | Policy version event + causal window | New version events | Policy/cost insight |
| Which sensor/version observed this action? | Event→Sensor + version | Available partly; standardize | Evidence |
| Can historical state be reproduced? | Event-time entity/relationship/policy/evidence versions | Target bitemporal/evidence model | Assurance |
| Which evidence supports a relationship? | Relationship assertions→observations/evidence | New ledger | Relationship detail |

## API shapes

```text
Estate/filter questions:
  POST /v2/estate/query {entity_types, states, relationships, time, coverage}

Impact/path questions:
  POST /v2/graph/query {start_ids, relationship_types, direction, valid_at, depth}

Activity/evidence:
  POST /v2/events/query {entity_ids, event_types, event_time, sources, confidence}

Findings:
  POST /v2/findings/query {status, type, root, owner, severity, time}

Metrics:
  POST /v2/metrics/query {metric, grain, time, filters, restatement_version}
```

Every response includes snapshot/watermark, coverage, unknown/conflict counts, and permitted drill-down/action links.
