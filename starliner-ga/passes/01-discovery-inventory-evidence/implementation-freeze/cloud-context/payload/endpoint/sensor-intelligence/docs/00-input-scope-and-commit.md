# 00 — Input Scope and Commit

## Mission boundary

This pass analyzes the endpoint as a sensor and integration source. It does not modify production source.

The local endpoint runtime is the primary sensor. The dashboard/API is included only where it consumes endpoint output, returns governance/configuration, stores endpoint records, or exposes current product surfaces. The endpoint-pinned IPC tree is a runtime dependency. Current IPC `main` is a comparison input and must not be substituted for the pinned tree.

## Pinned source inputs

| Input | Type | Version/commit | Purpose | Sensor relevance | Status |
| --- | --- | --- | --- | --- | --- |
| `work/sentinel-endpoint-agent` | Primary sensor repository | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` | Device-local agent, monitor, proxy, hooks, UI, diagnostics, install/update and platform code | Primary implementation evidence | `Verified in source`; clean worktree at initialization |
| `work/sentinel-endpoint-agent/libs/lib-ipc-event-bus` | Pinned local IPC dependency | `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b` | Typed duplex channels, broker, protocol, macro and platform transports | Runtime-significant local transport | `Verified in source`; detached pinned revision |
| `work/sentinel-dashboard` | Related current server/UI repository | `cd755d37c14b8b86623a15a4dbae41d33b226b2b` | Receives endpoint sync/activity/alerts, returns policy/process maps, stores ClickHouse projections, renders current UI | Current consumer and migration boundary | `Verified in source`; not part of the device-local sensor |
| `work/ipc-event-bus` | Separately requested IPC repository | `0cf45bc50e4121d6a4521c58f1fa52a97c125e19` | Current smaller Unix broadcast library | Compatibility/comparison input | `Verified in source`; not used by endpoint |
| `repository-analysis/` | Existing evidence corpus | pinned to the four revisions above | 1,265-record repository archaeology with symbol, data, interface, security, test and operations analysis | Primary index and evidence base for this pass | 1,265/1,265 records accounted for |
| `docs/quilr2-cross-sensor/` | Cross-sensor target architecture | analysis corpus completed 2026-07-28 | Canonical observation/entity/event/finding/identity/product design | Target mapping input only | `Proposed` except where it cites current source |
| `starliner-ga/implementation/13-endpoint-sensor-binding.md` | Endpoint target binding | current checked local document | Proposed runtime placement, capture seams, migration and blockers | Adapter target input | `Proposed`; current seams are source-verified |
| `profile-endpoint-v1.schema.json` | Proposed endpoint source profile | schema ID `.../endpoint/1.0.0/...` | Target entity, relationship, activity, decision, effect, snapshot, health and gap payloads | Contract-mapping target | `Proposed`; not proof of current emission |
| `edge/01-adapter-spi-and-safe-facts.md` | Proposed adapter contract | current checked local document | Source-safe facts, identifiers, privacy, reconciliation and enforcement SPI | Responsibility boundary | `Proposed` normative target |
| `edge/02-wal-delivery-and-offline.md` | Proposed delivery contract | current checked local document | Durable admission, sequence, batching, acknowledgement, offline and crash recovery | Outbox target | `Proposed`; current sensor does not satisfy it |

The machine-readable form is [input-ledger.csv](../../../matrices/sensor-intelligence/endpoint-sensor/input-ledger.csv).

## Repository coverage inherited from the first pass

| Tree | Accounted paths |
| --- | ---: |
| Endpoint repository | 876 |
| Endpoint-pinned IPC tree | 108 |
| Dashboard repository | 251 |
| Current IPC repository | 30 |
| **Total analysis records** | **1,265** |

`Verified in source`: all local Git revisions were re-read with `git rev-parse HEAD` at this pass's initialization. The endpoint, dashboard and current IPC worktrees had no reported local modifications.

## Main sensor components

| Component | Principal implementation | Sensor role |
| --- | --- | --- |
| Agent/service host | `agent/`, `core/src/service/`, `core/src/defaults/services.rs` | Starts, supervises and stops the default component graph |
| System Monitor v2 | `system-monitor/v2/` | Process/config/package discovery, identity context, governance sync, process enforcement, IDE hooks and activity |
| Proxy | `proxy/` | Explicit/transparent network interception, extraction, DLP analysis, policy, native effects and local UI |
| Platform redirectors | `proxy/src/packet_redirector/`, `proxy/swift/` | Windows WinDivert and macOS Network Extension capture/redirect |
| Hook clients | `system-monitor/v2/src/bin/` | Cursor and Claude local event adapters |
| Template/UI processes | `template-service/`, proxy templating paths | User notification and justification surfaces |
| Persona/identity | `core/src/services/persona*`, `core/src/ipc_clients/persona.rs`, monitor Persona/context | Tenant, user, device and token context |
| Diagnostics | `core/src/diagnostics*`, `diagnostics/` | Structured local diagnostic production and optional receiver/export |
| Email discovery | `email-discovery/`, core local-discovery code | Short-lived user-session discovery helper |
| Pinned IPC broker | `libs/lib-ipc-event-bus/` | Device-local interprocess transport |
| Build/install/update | root, `.github/`, `build/`, `deployment/`, scripts | Artifact construction, signing, installation, update and removal |

## Existing/current versus target authority

| Claim class | Authority in this analysis |
| --- | --- |
| What is compiled, registered, called, read, stored or emitted today | Pinned source, checked configuration and repository tests |
| Whether a behavior was executed in a live environment | Only explicit runtime evidence; otherwise not runtime verified |
| What the endpoint *should* emit to Quilr 2.0 | Cross-sensor/Starliner documents, labeled `Proposed` |
| Canonical identity, enterprise relationships, findings and product UI | Central target architecture, never assigned by current endpoint names/IDs |
| Production deployment state, effective config, ACLs and external services | `Unresolved` without external evidence |

## Controlled vocabularies

### Evidence status

`Verified in source`, `Verified by test`, `Runtime verified`, `Documentation claim`, `Inference`, `Proposed`, `Unresolved`, `Contradiction`.

### Implementation status

`Implemented`, `Partially implemented`, `Configured but runtime-unverified`, `Disabled`, `Experimental`, `Legacy`, `Deprecated`, `Placeholder`, `Stub`, `Dead-code candidate`, `Documentation-only`, `Generated`, `Vendored`.

### Platform availability

`Available now without sensor changes`, `Available through adapter mapping only`, `Derivable centrally from current output`, `Requires minor sensor instrumentation`, `Requires substantial sensor changes`, `Requires an external authoritative source`, `Not observable by this sensor`, `Unresolved`.

### Product disposition

`Overview`, `Inventory list`, `Entity detail`, `Relationship view`, `Activity explorer`, `Finding signal`, `Customer finding`, `Analytics`, `Coverage and health`, `Configuration`, `Evidence drill-down`, `Operator-only`, `Internal implementation only`, `Raw-only retention`, `Discard with reason`.

## Explicit limits at initialization

- No production source has been changed.
- No current runtime build/test claim is made in this checkpoint.
- The previous pass established static path-accounting completeness, not live production completeness.
- Cross-sensor schemas are target contracts and will be mapped field-by-field; they are not treated as native records.
- Secrets and committed credential values will not be reproduced in generated documentation or fixtures.
