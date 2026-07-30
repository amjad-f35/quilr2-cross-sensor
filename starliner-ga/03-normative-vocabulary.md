# Normative Vocabulary

## Core terms

| Term | Normative meaning |
|---|---|
| Native fact | Object or behavior observed inside a product runtime before collection policy |
| Safe fact | Bounded source representation after allowlisting, classification, redaction, and collection policy |
| Source record | Versioned profile-specific protocol body carried by the Starliner envelope |
| Evidence | Immutable admitted source record plus authenticated producer, contract, integrity, privacy, and provenance metadata |
| Observation | Normalized source-scoped assertion derived from evidence |
| Identifier claim | Claim that a namespaced value refers to a source or canonical entity for a validity interval |
| Attribute claim | Source statement about a field value, authority, validity, proof, and confidence |
| Canonical entity | Durable tenant object assigned by the central resolver |
| Source binding | Versioned mapping from a source object to a canonical entity |
| Relationship assertion | Source-scoped proposed edge between source objects |
| Canonical relationship | Typed bitemporal edge between canonical entities after resolution/materialization |
| Activity | Canonical representation of something that happened |
| Signal | Local/source-specific condition requiring central evaluation |
| Finding | Admitted actionable conclusion with evidence, coverage, lifecycle, owner, and action |
| Metric | Versioned aggregate at a declared canonical grain and coverage |
| Policy | Governed intent and scope |
| Bundle | Signed deterministic edge-executable policy artifact |
| Decision | Point-in-time verdict over subject, action, resource, context, authority, and policy |
| Enforcement | Intervention applied by a policy enforcement point |
| Execution outcome | What the native runtime reports happened |
| Verified effect | Evidence satisfying the command/action verification policy |
| Capability | What a source implementation can potentially observe, decide, enforce, or verify |
| Certification | Evidence-backed claim that a specific artifact/profile/version passed defined tests |
| Coverage | Whether a certified capability is deployed, in scope, healthy, fresh, complete, and operating in a stated mode |

## Identity layers that MUST remain separate

```text
person
directory account
application account
service account
credential
session
device
process
application product
application surface
tenant application
installation
agent definition
agent version
agent deployment
agent runtime
agent run
agent step
model family
model version
model deployment
model route
MCP client
MCP server product
MCP server deployment
tool
tool version
tool call
software artifact
release
deployment
workload identity
```

## Forbidden equivalences

- email ≠ person;
- name ≠ canonical identity;
- API key ≠ agent;
- model alias ≠ exact model version;
- agent configuration ≠ runtime use;
- tool name ≠ server-qualified tool identity;
- process ≠ application installation;
- sensor name ≠ enrolled sensor instance;
- request ID ≠ actor;
- source deletion ≠ canonical retirement;
- signal ≠ finding;
- decision ≠ enforcement;
- command receipt ≠ verified effect;
- graph node ≠ authority;
- metric row ≠ evidence.

## Requirement language

- **MUST/MUST NOT:** required for conformance.
- **SHOULD/SHOULD NOT:** required unless an approved ADR records a justified exception.
- **MAY:** optional behavior with a defined compatibility effect.
- **NEEDS_INPUT:** real external value or ownership decision not inferable from evidence.
- **DEFERRED:** intentionally outside the current frozen GA scope but schema-compatible.
- **NOT_EVALUABLE:** required evidence or coverage is unavailable.
