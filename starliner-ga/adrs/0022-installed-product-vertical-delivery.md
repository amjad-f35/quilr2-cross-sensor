# ADR-0022: Installed-product source verticals

Status: **accepted**

## Context

The complete five-profile DIE architecture, schemas and ontology were frozen
before implementation. Execution nevertheless advanced horizontal component
and fixture work while the normal Browser and Endpoint installation,
organization-tenant discovery, enrollment and runtime-entrypoint paths remained
unconnected. Diagnostic storage injection, synthetic personas, fixed producer
identities, manually modified service configuration and parallel preview
daemons then obscured the difference between implemented code and a working
installed product.

ADR-0012 retains the requirement that the first customer release is
cross-sensor. It does not require all sensor adapters to be completed before a
single source traverses the permanent platform.

## Decision

The semantic authority remains frozen for all five profiles. Production
integration proceeds through normally installed or normally deployed source
verticals over the same permanent funnel:

```text
real control and enrollment
-> Endpoint
-> Browser Extension plus native host
-> Browser Backend server-owned facts
-> LLM Gateway
-> MCP Gateway
-> exhaustive cross-source resolution and graph behavior
```

Each source first proves one real native record from the exact supported
artifact through WAL, receipt, immutable evidence, normalization, canonical
truth, relationships/activity where supported, projection, authorized API and
live UI. Endpoint Gate A is followed by Browser Gate A and an immediate real
cross-source identity/relationship proof. Browser Backend, LLM Gateway and MCP
Gateway then complete Gate A on the same runtime. Gate B route, health, gap,
reconciliation, replay, restart and offline breadth begins immediately per
source and may close in parallel after that cross-source proof; all Gate B work
remains mandatory before release.

Parallel work on frozen common interfaces and independent modules remains
allowed. It cannot advance a later source's integration state without its own
normal installation/deployment and continuous trace.

The existing organization tenant UUID remains the customer routing identity.
The normal installer or deployment uses Discovery/bootstrap and an
authenticated enrollment exchange to obtain installation-scoped producer,
certification and renewable workload identity. A second user-entered Quilr 2
tenant, fixed IDs, persona shim, hand-minted token or manual configuration
override is not a product path.

The external organization UUID and the cell-local `tenant_id` are two names
for the same customer authority, joined by the unique
`die_control.organization_tenant` registry. They are not two customer tenants.
An enrollment bootstrap must resolve that registry and an existing business
scope before any producer identity is allocated.

Network enrollment may create only an untrusted pending producer, its measured
component set and a short-lived proof-of-possession credential. It cannot
author certification, capabilities, health policy, expected populations,
signer keys, manifest verification or trusted state. An isolated verifier
records the cryptographically verified JWS and immutable derived effects under
one accepted signer-key revision; control administration can only apply those
exact effects. Trust promotion additionally requires a passing certification
bound to the active component-set digest, its sole delivery-owner runtime
artifact and the accepted source-profile version.

Browser Extension and its native messaging host are components of one logical
Browser source path. The extension-owned delivery stream retains native-host
component lineage. Browser Backend is a distinct hosted producer only for
server-owned receipt, validation, configuration, catalog, heartbeat,
publication and runtime facts. Relayed client evidence preserves the original
Browser producer identity and is never counted as a second user activity.

## Consequences

- Endpoint can establish the device/application anchor before Browser exists.
- The defining cross-source graph is tested after the first two Gate-A
  verticals rather than waiting behind one sensor's long-tail route breadth.
- Missing cross-source counterparts create durable pending dependencies and
  visible unresolved state, not fabricated joins.
- New profiles implement frozen contracts without redesigning the common
  schema or central authority.
- An implementation can be unit-complete while integration remains
  `NOT_CONNECTED`.
- Installed-product provenance, normal entrypoint and enrollment evidence are
  mandatory for a native integration claim.
- Missing internal code is implemented. A genuinely external tenant,
  credential, infrastructure or privileged action is requested explicitly and
  blocks only that action. It is never silently replaced.

## Rejected

- completing all adapters against fixtures before one real source reaches UI;
- treating work packages as a horizontal implementation sequence;
- passive Quilr 1 tables as the primary live sensor architecture;
- Browser native host as a second counted Browser observation producer;
- Browser Backend re-emitting client activity as independent activity;
- any ad hoc install, credential or daemon bypass presented as product E2E.

## Validation

- a source-product-path manifest binds install/deployment, tenant/bootstrap,
  enrollment, supervisor, capture, WAL, sender and receipt ownership;
- a coherent runtime binds installed artifacts and configuration rather than
  only source commits;
- unit/fixture evidence cannot claim a native integration stage;
- source vertical state rejects missing stages and prohibited substitutes;
- Browser relay and cross-source relationship negative tests prevent duplicate
  activity and weak joins.
