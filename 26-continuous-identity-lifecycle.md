# 26. Continuous identity lifecycle

## Operating model

Identity is a continuously maintained projection over immutable observations:

```text
event/webhook/change stream ─┐
incremental provider sync ───┼→ identity observation ledger
periodic full reconciliation ┤   → resolver and claim authority
runtime verification ────────┘   → current identity/lifecycle projection
```

The platform must support all four mechanisms. Event streams give speed, incremental sync limits provider load, full reconciliation repairs gaps, and runtime verification prevents stale inventory from authorizing a live action.

## Required behavior for every discovered entity

| Question | Target answer |
| --- | --- |
| What first creates it? | The first valid tenant-scoped source observation creates a candidate canonical identity; it does not automatically authenticate or verify it. |
| What confirms it exists? | A fresh observation from an accepted source, or an authoritative reconciliation record, updates `last_confirmed`. |
| What updates it? | New immutable claims compete under field-level authority and valid-time rules; history is not overwritten. |
| What marks it stale? | Source/entity-specific `stale_after` expires without required confirmation. |
| What marks it deleted? | An authoritative source-deletion observation sets the source state; absence from one source is insufficient. |
| What retires it? | Explicit owner/authority action or corroborated authoritative absence after the retention/confirmation policy. |
| What if it reappears? | Emit `identity.reappeared`; restore the prior canonical ID when strong identity remains valid, otherwise create a candidate. |
| What if identifiers change? | End-date the old identifier and add a new identifier record; preserve redirects and history. |
| What if two records are one entity? | Deterministic or reviewed merge event; retain both canonical IDs and redirect the losing ID. |
| What if a merge was wrong? | Split event reassigns observations/claims/relationships by evidence without deleting the historical merge. |

## Independent state dimensions

Never compress these into one `status`:

```text
existence
management
authentication
attestation
credential
lifecycle
ownership
resolution
certification
freshness
```

The normative state vocabulary and transition authority are in [identity-lifecycle.csv](matrices/identity-lifecycle.csv). For example, an agent may simultaneously be:

```text
existence=active
management=managed
authentication=authenticated
attestation=failed
credential=active
lifecycle=suspended
ownership=owned
resolution=resolved
certification=expired
freshness=fresh
```

This combination is meaningful: the runtime is present and authenticated, but must not execute because its attestation failed and certification expired.

## Observation timing

Every observation or stateful relationship carries:

```text
first_seen
last_seen
last_confirmed
observed_at
ingested_at
valid_from
valid_until
stale_after
deleted_at
retired_at
revoked_at
source_deletion_observed
```

`observed_at` is source time; `ingested_at` is platform receipt time; valid time describes the claim’s real-world interval. The operational stores must preserve both valid time and system time.

## Source-specific freshness policy

| Source class | Fast confirmation | Reconciliation | Deletion rule |
| --- | --- | --- | --- |
| Runtime browser/endpoint/gateway event | Per event or heartbeat | Daily coverage reconciliation | Never infer deletion from silence alone |
| IdP/SCIM/HRIS | Webhook/change cursor | Daily full or partitioned sync | Authoritative deactivation/deletion event |
| SaaS/provider/connector | Webhook/change cursor | Daily/weekly by provider risk | Provider deletion plus connector health |
| Kubernetes/cloud workload | Watch/audit event and credential renewal | Minutes-to-hourly inventory | Orchestrator UID deletion/termination |
| Repository/build/registry | Push/build/publish event | Daily registry/repository comparison | Tombstone/retention policy; source deletion does not delete provenance |
| Secret manager | Rotation/revoke event | Daily metadata inventory | Manager version/status event |
| MCP registry | Registration/schema event | Frequent registry comparison | Revoked registration plus connection absence |

Exact windows are tenant/risk configurable and must be recorded with the materializer version. A failed source connection pauses deletion inference and produces a coverage finding.

## Reconciliation algorithm

```text
read authoritative page/change cursor
→ validate tenant, source, schema, sequence, and authentication
→ append observations and source tombstones
→ normalize identifiers without discarding originals
→ evaluate deterministic matches and contradictions
→ update claim valid intervals and freshness
→ recompute lifecycle, relationships, findings, and metrics
→ commit cursor only after durable observation write
→ publish reconciliation report
```

Cursor advancement and observation persistence must be atomic or recoverably idempotent. Current queue paths that remove work before successful processing must not be reused as the identity cursor pattern.

## Runtime verification

At each consequential action, the Identity Context Assembler revalidates:

- human session and authentication strength;
- tenant and audience;
- workload credential, trust bundle, and attestation;
- exact agent/model deployment and artifact digests;
- grant/delegation scope and descendant revocation;
- connector/provider account;
- policy and relationship snapshot;
- sensor identity and freshness.

An inventory record alone cannot authorize execution.

## Tombstone and reappearance rules

1. Store source tombstones separately from canonical retirement.
2. Retain tombstones at least as long as native IDs may be recycled.
3. Keep historical identifiers searchable under privileged evidence access.
4. Never resurrect revoked authority merely because an entity reappeared.
5. Re-run verification, ownership, management, certification, and credential checks.
6. Emit a new lifecycle generation while retaining the canonical lineage.

## Availability

- **Available now:** source-specific scheduled, event, request, startup, and manual observation paths.
- **Derivable now:** last-seen/freshness for selected objects after adapters normalize current timestamps.
- **Requires external integration:** authoritative IdP/HRIS/SaaS/cloud/registry deletion and change events.
- **Requires new telemetry:** workload renewal/attestation, stable agent run/version binding, signed sensor sequences, full reconciliation cursors.

