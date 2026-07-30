# API Endpoint and Product Event Catalog

Status: **normative surface; concrete OpenAPI generated per increment**

## Product API base resources

| Resource | Core operations | Gate |
|---|---|---|
| `/estate/applications` | list, get, relationships, activity summary, governance | G2 |
| `/estate/agents` | list, get, deployments, dependencies, activity | G3 |
| `/estate/models` | list, get, deployments, consumers, usage/cost | G2/G4 |
| `/estate/mcp-servers` | list, get, tools, consumers, exposure | G3 |
| `/estate/tools` | list, get, servers, consumers, invocations | G3 |
| `/findings` | list, get, transitions, evidence, related entities | G2 |
| `/cases` | create, list, get, tasks, findings, actions | G3 |
| `/activity/executions` | list, get, lineage | G3 |
| `/metrics` | definitions, query, drilldown | G4 |
| `/policies` | CRUD by version, validate, simulate, publish, rollback | G5 |
| `/exceptions` | request, approve, expire, revoke | G5 |
| `/decisions` | list, get, explain | G5 |
| `/commands` | create from authorized decision, get, cancel, outcomes/effects | G5 |
| `/coverage` | summary, population/capability detail, gaps | G2 |
| `/resolution` | conflicts, proposals, merge/split/not-same, impact | G2 |
| `/integrations` | configure, status, reconciliation, disconnect | G2 |
| `/producers` | enroll/status/capabilities/versions/health | G2 |
| `/evidence` | safe metadata, lineage, separately granted detail | G2 |
| `/audit` | filtered immutable audit | G2 |
| `/exports` | create, status, cancel, download metadata | G2 |

## Standard subresources

- `/sources`: composing source objects and freshness;
- `/relationships`: typed current/historical edges;
- `/timeline`: material lifecycle and workflow transitions;
- `/findings`: active and historical findings for an entity;
- `/activity`: safe event/execution summaries;
- `/coverage`: source/capability status affecting this resource;
- `/identity`: claims, conflicts, merge/split history;
- `/actions`: currently authorized workflows/commands.

## Mutation conventions

- `Idempotency-Key` required for create/action requests.
- `If-Match` or resource version required for material concurrent updates.
- Mutation response includes canonical version, audit reference, and projection-read guidance.
- Bulk mutations use preview then immutable job scope.
- High-impact policy/control mutations require step-up authentication and approval.

## Product event families

Customer webhooks and internal product events are versioned separately:

```text
estate.entity.discovered
estate.entity.materially_changed
estate.entity.retired
identity.conflict.opened
identity.decision.applied
coverage.materially_degraded
coverage.restored
finding.opened
finding.materially_updated
finding.resolved
finding.reopened
case.task.required
approval.required
policy.published
policy.rolled_back
command.terminal
command.effect_evaluated
integration.degraded
export.ready
```

Internal projection events are not automatically customer events.

## Error families

- authentication/authorization;
- tenant/environment/region mismatch;
- validation and unsupported value;
- version/precondition conflict;
- coverage/not-evaluable;
- identity conflict;
- capability/certification unavailable;
- policy/approval required;
- rate/capacity;
- dependency temporarily unavailable;
- job partial result;
- restricted-content grant required.

Errors include safe request ID, machine code, retry classification, and field detail.

## API release requirements

Concrete OpenAPI must define schemas, examples, auth, pagination, filters, rate limits, idempotency, errors, compatibility, SLO class, audit behavior, and SDK tests. Endpoint existence alone does not satisfy product acceptance.
