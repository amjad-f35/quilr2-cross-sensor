# Relationship-claim merger

## Source claims

Twelve MCP source relationship claims are registered with:

- claim and predicate URNs;
- subject/object source candidates;
- source profile and record;
- direct versus inferred status;
- temporal fields;
- proof, reachability, authority, confidence, and evidence;
- adapter mapping and owner.

## Current relationship families

The current evidence supports or can centrally derive:

- actor `CALLS` MCP tool;
- action `TARGETS` tool;
- sensor `OBSERVED` action;
- backend/server `PROVIDES` or `EXPOSES` tool candidate;
- source observation and evidence provenance relationships;
- DLP/policy/effect relationships only when native records retain the required
  decision/effect semantics.

## Frozen target rules

The freeze includes exact MCP rules for:

- server deployment `instance_of` server product;
- server deployment `exposes` tool/resource/prompt;
- agent deployment `instance_of` agent definition;
- application, agent, or workload `invoked` tool under explicit source
  conditions.

## Prohibited automatic joins

The merger does not assert:

- Endpoint MCP configuration equals a gateway deployment based on URL/name;
- agent keyword/name/user-agent equals canonical agent deployment;
- actor email/HMAC equals enterprise person;
- tool name identifies one global tool;
- configured access equals observed invocation;
- policy decision equals effect.

## Conflict handling

Cross-profile conflict records require other admitted profiles. The MCP-only
equivalence file therefore records `DISTINCT` or `UNRESOLVED` boundaries
without creating foreign sensor object IDs.

Machine outputs:

- [relationship claims](../../lg008/catalogs/relationships.csv)
- [cross-profile equivalence boundaries](../../lg008/reconciliation/cross-profile-equivalence.yaml)
