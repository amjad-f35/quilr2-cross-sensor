# 42. Current Quilr 1 identity audit

## Audit boundary

This audit describes only behavior evidenced by the supplied Quilr 1, browser, endpoint, and gateway analyses. External production identity, IdP/HRIS, MCP Gateway, connector, cloud IAM, live Kubernetes, registry, and secret-manager state remain unresolved.

## Human identity

| Concern | Verified current behavior | Limitation |
| --- | --- | --- |
| Authentication source | Quilr web supports password/OAuth flows and browser-held auth state; gateway has API-key/JWT/Entra-session paths | No one repository-wide identity authority |
| Token format | Bearer tokens/JWTs, access/refresh tokens, cookies, API keys | Credential type varies by component |
| User identity | User IDs/email and token-derived user context | Issuer+subject person/account model is not universal |
| Tenant/subscriber | Sent in request context and used in cache/table keys | Some components accept caller-selected tenant context; uniform verified binding is not demonstrated |
| Groups/roles/permissions | Auth service/dependencies, frontend permission maps, gateway permission/smart-group data | Frontend visibility is not authoritative backend authorization; source authority varies |
| Session lifecycle | Web login/refresh/logout and gateway sessions exist | Cross-service session/revocation graph is absent |
| Joiner/mover/leaver | User/application sync jobs and account flags exist | Authoritative HR lifecycle and cascade to agents/grants/credentials are absent |

Evidence: [Quilr overview](../../quilr-platform-analysis/02-executive-overview.md), [runtime entry points](../../quilr-platform-analysis/04-runtime-entry-points.md), [security model](../../quilr-platform-analysis/12-security-model.md), and [gateway security model](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/12-security-model.md).

## Application identity

Current application identity is assembled from `app_id`/table IDs, names, domains, processes, source enums, graph nodes, ClickHouse rows, Redis keys, and external integration data. The exact semantics vary:

- browser domain/origin typically identifies an application surface;
- endpoint process/package/discovery data identifies installation or candidate product;
- gateway application/API-key/provider context identifies an access/configuration boundary;
- `quilr_asset_inventory` and graph/query paths project inventory rather than forming one canonical identity authority.

Deduplication is source/path specific. Product, surface, tenant application, subscription, provider account, and user account are not universally separated.

## Agent and MCP identity

- Endpoint discovery has agent/MCP/tool concepts and native/local/backend IDs.
- Gateway/Quilr can carry or display agent/MCP/tool activity depending on source metadata.
- The external MCP Gateway source and authoritative contracts were not supplied.
- No current proof establishes a stable agent-definition ID plus exact version, artifact, deployment, workload, runtime instance, session, run, parent run, and credential.

Current agent identity is therefore **partial observation**, not complete attribution.

## Model identity

Gateway fields include provider, model/deployment/endpoint/route, provider account/config, request ID, user/application, usage, outcome, and sometimes cost. Model names/routes are provider/configuration scoped. No universal model snapshot/artifact/workload identity is demonstrated. Provider-hosted weight digests are often intrinsically unavailable.

## Workload identity

Search across supplied analyses found no verified SPIFFE, SPIRE, SVID, or runtime-attestation implementation. Kubernetes/service/deployment manifests exist, but live service-account/RBAC, image digests, and cloud control-plane state were unresolved. mTLS/client-certificate behavior is component specific, not a canonical workload system.

## Source, build, artifact, and release identity

- Analysis snapshots are pinned by Git commit hashes.
- Build, package, updater, container, Jenkins/workflow, and deployment paths are documented.
- Git hashes in the analyses are provenance anchors, not runtime canonical identity.
- No SWHID use was found.
- Endpoint/other analyses identify absent or unresolved SBOM/signing stages.
- Quilr live image digests/rendered objects were unavailable.
- No supplied evidence establishes a complete signed source→build→artifact→release→deployment→runtime chain.

See [identity-mechanism-status.csv](matrices/identity-mechanism-status.csv) and [provenance-support.csv](matrices/provenance-support.csv).

## Secrets and credentials

Current systems contain fragmented:

- web access/refresh tokens and cookies;
- API keys and JWT application mappings;
- provider credentials;
- Persona/native-host tokens;
- database/broker/service secrets;
- Vault/secret/environment references;
- encryption/signing key configuration.

API-key active/revoked/expired state exists in gateway paths, but there is no cross-system canonical credential/grant/owner/consumer/delegation inventory. Production secret injection/rotation and KMS/key-version state are external.

## Current synchronization inventory

| Trigger | Source/purpose | Identity key/update | Deletion/staleness | Failure behavior |
| --- | --- | --- | --- | --- |
| Application-ready async | Tenant application settings initialization | Source table/settings keys | No identity-wide tombstone | Background failure behavior is component specific |
| Every minute | Applications and tenant settings | Application/source IDs | No canonical lifecycle | Logs failure; retries on later schedule |
| Every minute | Latest users | Current user/source fields | No authoritative JML state | Logs failure; retries |
| Hourly | App DB→tenant settings backfill | App/settings IDs | Backfill only | Later schedule retries |
| Fixed delay, default 5s | Redis app sync queue | IDs popped from set | No canonical tombstone | IDs removed before processing; failure does not requeue |
| Hourly after startup | App-admin-user backfill | Rows plus marker | Marker has no TTL | Row failures can coexist with marker completion |
| Once per JVM | Master CSV/table initialization | Master-data keys | No reconciliation | CAS precedes async work; failure not retried in JVM |
| Browser/endpoint runtime | Activity/discovery/heartbeat | Persona/device/request/local/backend IDs | Source-specific | Overlap, partial failure, or retry varies |
| Gateway request/NATS | Model/DLP/activity/logging | tenant/request/API-key/user/model | Event records, not identity lifecycle | Durable worker handling differs from producer paths |
| Gateway watchers/probes | Config/provider/MCP health | Tenant/config/scope keys | Source-specific | Synthetic health is not identity proof |
| Manual/backfill APIs/scripts | Selected data migration/sync | Tool-specific | Tool-specific | Not a continuous identity contract |

These are useful extraction paths. They must not be renamed “continuous identity” without cursors, source health, proof, reconciliation, tombstones, merge/split, and canonical lifecycle.

## Current mechanism classifications

The required mechanism labels—`Implemented and verified`, `Partially implemented`, `Configured but not proven active`, `Referenced only`, `Absent`, `Unresolved`, and `Proposed`—are applied in [identity-mechanism-status.csv](matrices/identity-mechanism-status.csv).

## Exhaustive current-to-target mapping

- All 54 entities: [current-to-target-identity.csv](matrices/current-to-target-identity.csv)
- Current fields: [current-identity-field-mapping.csv](matrices/current-identity-field-mapping.csv)
- Current mechanisms: [current-identity-mechanism-mapping.csv](matrices/current-identity-mechanism-mapping.csv)
- All 17 sensor/source capabilities: [identity-sources.csv](matrices/identity-sources.csv)
- Attribution gaps: [attribution-coverage.csv](matrices/attribution-coverage.csv)
- Prioritized gaps: [current-identity-gaps.csv](matrices/current-identity-gaps.csv)

No target mapping is presented as a verified current implementation.

