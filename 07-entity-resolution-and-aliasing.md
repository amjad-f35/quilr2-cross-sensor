# Entity resolution and aliasing

The complete entity-specific matrix is [entity-resolution-rules.csv](matrices/entity-resolution-rules.csv).

## Resolution pipeline

```text
validate tenant/source/schema
→ normalize identifiers without deleting native values
→ exact strong-key lookup
→ catalog mapping
→ deterministic secondary rules
→ candidate generation
→ conflict/non-merge checks
→ scored decision
→ auto-link, auto-create, or review
→ materialize entity/aliases/relationships
→ emit merge/split/relationship events
```

## Confidence bands

| Score/policy | Result |
| --- | --- |
| Deterministic rule with no non-merge conflict | Auto-link or auto-create |
| ≥ tenant/entity auto-merge threshold | Auto-merge only if policy permits and evidence spans required independent fields |
| Review threshold to auto threshold | Candidate in Resolution Center; entities remain separate |
| Below review threshold | No candidate shown by default |
| Any hard non-merge condition | Reject merge regardless of fuzzy score |

Scores are calibrated per entity type. They include evidence independence, source reliability, identifier strength, validity overlap, catalog version, contradiction penalties, and sensor known defects. A numeric score without contributing facts is not explainable enough.

## Hard rules

- Never match across tenants, except linking tenant entities to a global catalog object.
- Never merge product, surface, account, model, agent, client, server, tool, deployment, run, or event types.
- Never auto-merge on normalized display name alone.
- Never use Redis/cache presence as source authority.
- Never treat current endpoint UUID formulas as canonical.
- Never merge personal and enterprise accounts without a shared authoritative provider account ID and explicit evidence that they are the same account.
- Never merge model alias with model version/deployment; model routes create temporal target relationships.
- Never merge same-name tools from different server deployments.
- Never discard native IDs or observations after merge.

## Merge record

Every decision records:

```text
decision_id
tenant_id
entity_type
candidate/survivor/source entity IDs
matched identifiers and source observations
non-matched/conflicting identifiers
rule IDs and versions
catalog version
score and threshold
actor (resolver or human)
reason
effective and transaction time
manual constraints
replay lineage
```

The survivor ID is stable. Absorbed canonical IDs become redirect aliases with historical validity; they are not reused.

## Split

Manual or automatic split:

1. freezes the affected resolver cluster;
2. selects observations/aliases/relationships/events to detach;
3. creates one or more new canonical IDs;
4. replays materializers from the earliest affected validity time;
5. creates compensating `asset.split` and relationship state transitions;
6. recalculates findings/metrics and records changed conclusions;
7. keeps the original decision and redirects auditable.

Historical reports can be viewed as originally materialized or restated under the corrected identity version.

## Field-level authority

| Field | Preferred authority | Fallback / conflict behavior |
| --- | --- | --- |
| Product vendor/name | Curated catalog | Source names remain aliases |
| Surface domain | Verified origin observation + catalog | Shared/custom domains require review |
| Installed application version | Endpoint/MDM | Preserve conflicting scans with validity |
| User department/team | IdP/HR | Endpoint/browser value is hint |
| Application account type | Provider connector/IdP | Browser auth type/domain is weaker; unknown remains unknown |
| Model version | Gateway request/provider response/API | Endpoint config is declared dependency, not proof of use |
| Model deployment/region/account | Provider integration, then gateway routing decision | Name alone insufficient |
| Agent owner | Explicit platform/CMDB/source repository assignment | User who ran agent is not owner |
| Last seen | Latest valid source observation | Never use cache write time |
| Data classification | Data catalog for asset; DLP for event-time content | App name does not imply data class |
| Governance/approval | Explicit platform policy/decision | Sensor default does not overwrite |

Canonical entities retain every conflicting field value with provenance; presentation selects the current effective value but offers “why this value.”

## Temporal rules

- Identifier aliases and catalog mappings have valid intervals.
- A domain rebrand or model alias target change does not rewrite old events.
- A source observation arriving after merge is evaluated against the current cluster and its validity time.
- A retired entity may receive new activity and become `reactivated`; do not silently create a duplicate.
- Email, hostname, path, account type, ownership, department, deployment route, and policy are temporal.

## Required golden outcomes

| Scenario | Resolution |
| --- | --- |
| Claude browser + desktop + model + MCP | One AI Product; separate surfaces/account/model/deployment/client/activity; typed relationships |
| ChatGPT web + OpenAI API | One OpenAI product family only if catalog says so; distinct Web/API surfaces and accounts; API model deployments separate |
| GitHub Copilot extension + model/service | Extension surface links to Copilot product; model/service remains separate unless provider contract supports relationship |
| Custom agent using several models | One Agent Definition/Version/Deployment; many temporal `USES` edges; invocations remain events |
| One MCP server exposing tools | One deployment; one Tool per server-qualified name/schema; calls are events |
| Same SaaS app through web/desktop | One product, distinct surfaces/installations; one tenant application may group them for management |
| Personal vs enterprise accounts | Separate Application Accounts even if same email/name; relate both to product/application |
| One alias routing to providers | One Model Route with bitemporal `RESOLVES_TO` edges; never merge deployments |

Full worked cases: [Claude](examples/claude-resolution.md), [ChatGPT](examples/chatgpt-resolution.md), and [agent/model/tool](examples/agent-model-tool-resolution.md).

## Current defects to correct

- Endpoint `find_by_name` can collapse same-name applications across install paths.
- Endpoint user-scoped UUID omits entity kind.
- Endpoint MCP UUID omits parent application/transport.
- Quilr 1 application, asset, account, model, agent, and source concepts can meet only at request/UI time.
- Current graph/master/cache values do not provide one versioned merge ledger.

Those IDs become native aliases and evidence; no legacy ID is promoted without an entity-specific rule.
