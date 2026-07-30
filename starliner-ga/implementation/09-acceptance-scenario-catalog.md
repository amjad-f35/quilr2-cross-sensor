# Acceptance Scenario Catalog

Status: **normative scenario baseline**

## Identity and estate

### S-001 Web and desktop one product

Browser sees a web surface and endpoint sees a signed desktop artifact. Catalog and enterprise evidence support one application product with two distinct surfaces. UI counts one product and exposes both sources.

### S-002 Similar names remain separate

Two unrelated applications share a display name. Without an authoritative bridge they remain separate and the resolver records ambiguity.

### S-003 False merge split

An incorrect merge is split. Bindings, ownership, relationships, findings, search, metrics, redirects, and audit restate without evidence loss.

### S-004 Source deletion

One source deletes a surface while another continues direct activity. The source claim closes; the canonical application remains active.

### S-005 Reappearance

A previously deleted source ID reappears after an epoch reset. Resolver checks reassignability and does not automatically restore revoked governance.

### S-006 Owner authority conflict

CMDB and user assignment disagree. Authority policy selects the current field or shows conflict; last activity user does not become owner.

## Agent/model/MCP

### S-101 Unapproved model adoption

Three resolved production agent deployments execute a newly discovered model deployment after the effective approval policy. One finding names agents, model, owner, evidence, coverage, and action.

### S-102 Configuration without use

An agent configuration lists a tool but no invocation occurs. Product shows configured dependency and does not claim execution.

### S-103 MCP tool collision

Two MCP servers expose `search`. Tools remain server-scoped; invocations bind to the correct deployment.

### S-104 MCP bypass

Gateway sees no invocation but endpoint observes direct local MCP activity. Gateway metrics disclose bypass; enterprise activity uses supported sources without claiming completeness.

### S-105 Delegated invocation

A human delegates to an agent workload that invokes a tool. Actor chain preserves human, delegation, workload, agent deployment, and tool call.

## Lifecycle, time, and replay

### S-201 Partial snapshot

A connector fails on page three. No absence/tombstone is produced; coverage degrades and prior inventory remains with freshness disclosure.

### S-202 Late correction

Provider corrects model usage after a billing period. Evidence appends; activity, finding, cost, and reports restate under new versions.

### S-203 Duplicate and reordered evidence

Edge retries batches across restart and acknowledgements arrive partially. Ingest accepts once; canonical state and metrics remain deterministic.

### S-204 Normalizer rollback

A new normalizer creates incorrect aliases. Candidate diff detects impact, release is rolled back, and active projection never clears in place.

### S-205 Browser relay lineage

The extension emits an action and the browser backend later receives/relays it. Lineage preserves one native observation plus a backend receipt stage; activity, metrics, and findings do not double count it.

### S-206 Producer canonical ID rejection

An endpoint or MCP adapter submits a deterministic producer-created value in a canonical-ID field. Ingest rejects or quarantines the incompatible profile record. The corrected record preserves the same source-native refs, the central resolver assigns or binds canonical identity, and no source ID becomes canonical by accident.

### S-207 Endpoint local trust boundary

A process hook connects to the device runtime through an unauthenticated or over-permissive local channel. Certification fails. The corrected client proves component/workload identity, uses a bounded frame and least-privilege method, and cannot submit another component's evidence or invoke its controls.

### S-208 LLM transport lifecycle parity

OpenAI chat, a second provider-compatible route, and a streaming/cancel path execute equivalent requests. Each produces the same required lifecycle states and privacy disposition without forcing a central policy call or delaying the client on evidence delivery.

### S-209 MCP surface parity

Direct MCP, OneMCP and a native tool call each pass through their declared policy/observation seam. The capability manifest reports exact coverage; a Direct-only adapter cannot claim OneMCP, resource, prompt, progress or cancellation coverage.

### S-210 Native log is not evidence receipt

The LLM Gateway publishes NATS and the MCP Gateway writes its product log, but the Starliner edge WAL or central ingest is unavailable. Coverage reports the evidence gap; neither product-native success is presented as durable Starliner acceptance.

## Privacy and security

### S-301 Secret in tool arguments

MCP arguments contain a token. Pre-WAL privacy logic rejects prohibited content; safe structural activity survives; diagnostics never contain the token.

### S-302 Low-entropy hashing

A proposed raw SHA-256 field is rejected by contract review. Approved tenant-keyed tokenization is used only for a permitted subset or the field is omitted.

### S-303 Cross-tenant object ID

A user supplies another tenant’s canonical ID. API returns authorization-safe not-found behavior; cache/search/export reveal nothing; audit records the attempt.

### S-304 Producer credential theft

A credential is replayed from the wrong region/profile/artifact. Enrollment/ingest rejects it and revocation does not delete prior evidence.

### S-305 Support elevation

Support obtains time-bounded purpose access to safe evidence for one tenant. Access expires, is audited, and cannot query other tenants or restricted content.

### S-306 Actor privilege isolation

A compromised browser content script cannot read extension policy secrets, use native-host privileges, submit certified backend evidence, or invoke control APIs. Every denied attempt is authorization-safe and auditable.

### S-307 Source-verified signing-key incident

Private signing and CA material is already verified in the audited endpoint source. Promotion remains stopped until incident handling determines built/deployed/customer exposure, revokes and rotates affected trust, produces clean provenance-bound artifacts and a customer update where required, and CI proves the non-exportable signing boundary before release resumes.

## Coverage, findings, and metrics

### S-401 Sensor outage

Endpoint coverage drops for one business unit. “No local AI use” becomes not evaluable; open findings do not auto-resolve; overview reports the gap.

### S-402 New unmanaged application

First direct activity for an unresolved/unapproved application opens one finding after identity and coverage gates. Repeated events update rather than duplicate it.

### S-403 Metric denominator

Governed application percentage uses eligible active applications with sufficient coverage. Drilldown members exactly match numerator and denominator.

### S-404 Cost distinction

Estimated cost is later reconciled to provider billing. Both values and variance are retained with price/currency provenance.

### S-405 Definition rollback

An insight version causes noise in canary. Kill switch stops new evaluation, existing findings follow declared disposition, and prior version can resume.

### S-406 Finding correction and severity decrease

A source correction and identity split remove high-impact members. Candidate recompute shows membership/severity/workload diffs, preserves workflow/audit history, and atomically promotes a lower current severity without rewriting evidence.

## Policy and control

### S-501 Observe before enforce

A proposed model policy runs historical simulation, observe-only, and cohort rollout before block mode. Decision differences and coverage are visible.

### S-502 Wrong target precondition

Identity changes after command authorization. Local/source precondition rejects the stale target and records non-execution.

### S-503 Dispatch is not effect

Command is delivered and adapter reports success, but independent reconciliation shows the route remains enabled. Effect is `not_observed`; case stays open.

### S-504 Offline policy

Sensor is offline from central control. It follows the signed per-policy offline mode until expiry, logs decisions durably, and reconciles later.

### S-505 Emergency stop

Operators disable new commands during an incident while evidence collection and existing product reads remain available.

### S-506 Multi-role connector isolation

An integration has directory discovery and account-disable roles. Discovery credential compromise cannot call disable; control outage does not erase discovery coverage; each role has independent health, queue, scope, audit, and kill switch.

## Scale, failure, and recovery

### S-601 Noisy tenant

One tenant generates a burst and large exports. Quotas throttle it without violating another tenant’s ingest/control SLO.

### S-602 Edge disk pressure

Runtime follows the capture degradation ladder, preserves admitted evidence, reserves lifecycle/control records, and later reports exact visibility gaps.

### S-603 Tenant-cell restore

Canonical/evidence authorities restore to the approved point, projectors rebuild in new namespaces, edges replay without duplication, and in-flight commands reconcile.

### S-604 Projection corruption

Search/graph/analytics is discarded and rebuilt from canonical/evidence inputs while writes continue. Atomic switch restores correct product reads.

### S-605 Engineering trace

A customer claim is challenged during a release review. The reviewer follows the feature record through requirement, source authority, coverage, contracts, services, actors, tests, exact artifact/configuration, pilot, SLO, risks, and gate approval without relying on a conflicting ticket or wiki.

## Quilr 1 migration

### S-701 Equal counts different membership

Legacy and Quilr 2 both show 100 apps but membership differs. Semantic parity fails and blocks cohort cutover.

### S-702 Legacy composite splits

One legacy asset row represents product, account, and surface. Import creates legacy evidence and multiple resolved canonical objects with compatibility mapping.

### S-703 Cohort rollback

A pilot tenant discovers an incompatible export consumer. Read authority returns to Quilr 1 for that domain, Quilr 2 evidence is retained, and the mapping issue is fixed before retry.

### S-704 Decommission

Final tenant cutover closes; external consumers are verified, retention/legal hold is honored, credentials/jobs/stores are removed, and evidence is approved.
