# Installed-product Lifecycle and Source-vertical Delivery

**Status:** FROZEN EXECUTION AND EDGE-INTEGRATION AUTHORITY; 2026-08-05

**Effect:** this amendment closes the installation, organization-context,
enrollment, missing-input and implementation-order gaps exposed by current
Browser and Endpoint integration. It extends documents 14, 23, 34, 39 and 41
and ADR-0022. It does not change the common evidence, canonicalization, graph,
authorization, storage, API or UI semantics.

## Three different things must not be conflated

```text
architecture scope       = all five source profiles frozen together
implementation order     = one real source through the full funnel at a time
first customer release   = all required profiles and cross-source behavior
```

The architecture is not redesigned sensor by sensor. Each source implements
its already-frozen profile and extends the same central funnel. A source-proven
contradiction reopens only the affected contract under change control.

## Normal installed-product law

Before sensor integration code is accepted, the implementation binds the
normal product path:

```text
official installation or deployment artifact
-> existing organization tenant input
-> Discovery or signed bootstrap configuration
-> persona, device or workload bootstrap prerequisite
-> authenticated producer/installation enrollment
-> renewable workload credential and secure store
-> normal supervisor and entrypoint
-> native capture callback
-> privacy mapper
-> durable WAL owner
-> authenticated sender
-> exact receipt handler
```

The applicable `SOURCE_PRODUCT_PATH.yaml` names exact repositories, commits,
artifacts, symbols, configuration authorities and retained evidence. Chat,
historical analysis, a test fixture and a preview script are not sufficient.

Every retained reference is backed by `evidence_bindings` containing a safe
relative file reference, its exact SHA-256 digest and a closed evidence kind.
The runtime validator resolves every binding beneath the candidate evidence
root, including installation documentation/artifact/observation, enrollment,
each component's installed artifact/installation/configuration, native capture,
WAL, sender, ingest receipt, prerequisite and general evidence. Missing files,
path traversal, symlink escape, digest drift, duplicate refs and kind mismatch
invalidate `COHERENT_E2E`; a path string or prose claim alone proves nothing.

`INSTALLED_OBSERVED` and `COHERENT_E2E` are intentionally different states.
`INSTALLED_OBSERVED` proves only that the complete official package graph was
installed and that every required component, installed artifact, supervisor,
normal entrypoint and installation observation was content-addressed. It does
not claim enrollment, capture, WAL, delivery or receipt. `COHERENT_E2E` adds
the exact organization context, enrollment, runtime configuration and one
continuous capture-to-receipt path. A validator must never require missing
sender facts merely to record a genuine installation, and it must never infer
sender readiness from the installation alone.

The product-path authority for a source begins here; the per-candidate manifest
must resolve it to exact revisions and artifacts rather than copying these
names into an ad hoc installer:

| Source vertical | Normal product that must execute | Installation/deployment authorities |
|---|---|---|
| Endpoint | the signed/notarized Endpoint package as one compound installed product under its ordinary service manager | `sentinel-endpoint-agent`, `QuilrEndpoint-pkg-builder`, `QuilrEndpoint-msi-builder`, `signlab`, and the Endpoint procedure linked from `quilrai/installdocs` |
| Browser installed sensor | the managed or store/development Browser Extension artifact plus the matching packaged native messaging host and registered native-host manifest | `Project-Vanguard`, `project-sentinel`, their current builders/installers, and the Browser procedure linked from `quilrai/installdocs` |
| Browser Backend | the normal hosted Browser Backend deployment, never a device-local substitute | `browser-extension-service` deployment/build authority and its effective service configuration |
| LLM Gateway | the normal LLM Gateway service/container deployment handling real gateway traffic | `macrodata-refinement` deployment/build authority and effective provider/runtime configuration |
| MCP Gateway | the normal MCP Gateway service/container deployment handling real MCP traffic | `quilr-llm-gateway` deployment/build authority and effective MCP/runtime configuration |

The pinned official documentation revisions and package-builder repositories
are listed in `engineering-execution/SOURCE_CONTEXT_AND_REPOSITORY_MAP.md`.
Executable installer/deployer source and a safe observation of the resulting
runtime outrank stale prose. A contradiction is recorded and resolved; it is
not an invitation to create a second installation path.

The customer supplies or selects the existing organization tenant UUID through
the supported install/deployment workflow. That UUID remains the logical
tenant. Discovery/bootstrap may bind it to an internal tenant-cell reference,
but a customer or sensor is never asked to invent a second Quilr 2 tenant.

Tenant identity is not producer authentication. Enrollment creates or binds:

- installation identity;
- delivery producer identity;
- component/artifact identities;
- accepted profile and capability versions;
- certification identity;
- signed edge configuration; and
- renewable workload credentials whose private material is held in the
  platform-appropriate secure store.

Existing persona or device authentication may supply a bounded bootstrap
assertion. Its user token is not reused as the long-lived producer credential.
The normal production path must work after restart without DevTools, clipboard,
manual SQL, environment/plist editing or a parallel daemon.

### Control-plane authority and replay law

The customer has one tenant authority. The public organization/workspace UUID
resolves through the unique `organization_tenant` registry to the bounded
cell-local tenant key used by the ledgers; this is an alias/routing boundary,
not creation of a second Quilr 2 tenant. Bootstrap issuance fails unless both
that binding and the requested business scope already exist.

Enrollment is deliberately two-stage. The network-facing enrollment role may
atomically consume a one-use bootstrap, allocate a pending producer and exact
component set, and issue a short-lived installation-key-bound credential. It
cannot write certification, capability, expected-population or health-policy
authority, cannot verify its own manifest and cannot promote trust. An isolated
verifier validates RFC 7638 key thumbprints, RFC 7797 detached JWS/JCS bytes and
the accepted signer-key revision, then records immutable semantic effects.
Control administration may mark those effects applied but cannot change them.
Trusted or degraded state requires the applied enrollment manifest, a passed
certification for the active component-set digest + sole delivery-owner runtime
artifact + accepted profile version, and a health policy whose required
components exactly equal that component set's health population.

Enrollment, credential renewal and producer revocation each have one canonical
idempotent effect plus immutable attempt rows. A retry with the same
Idempotency-Key and request digest returns the same assignment, credential
generation or terminal revision; a changed request is rejected. A lost
enrollment response may re-deliver a freshly serialized short-lived credential
for the same installation key, but never allocate a new producer,
installation or epoch. Enrollment request digests omit
`installation_proof.request_digest` and `installation_proof.detached_jws`; the
detached JWS signs the canonical request with the computed digest present and
only the signature omitted. Renewal request digests analogously omit
`request_digest` and `detached_jws`, and the protected header requires the
operation-specific `typ`. RFC 9449 proofs are signature-, `htm=POST`-,
normalized HTTPS `htu`-, access-token `ath`-, fresh single-use nonce-, bounded
clock- and `jti`-verified and durably replay-fenced. The nonce and accepted
proof commit together; an idempotent retry returns the same credential
generation/effect but may serialize a new short-lived token. Lexical token
shape is not authentication.

## Required-input and no-bypass protocol

Before modifying a source path, the agent searches current installation docs,
installer/build source, product source, deployment configuration and safe
read-only runtime evidence. Every prerequisite receives one disposition:

| Disposition | Meaning and required action |
|---|---|
| `FOUND` | Exact current authority and evidence are recorded. |
| `MISSING_PRODUCT_CODE` | The normal product lacks the seam; implement it. |
| `EXTERNAL_CREDENTIAL` | Request the exact bounded credential; continue independent work. |
| `EXTERNAL_INFRASTRUCTURE` | Record the exact unavailable environment; continue independent work. |
| `PRIVILEGED_USER_ACTION` | Request the exact install/approval action and success condition. |
| `DESTRUCTIVE_APPROVAL` | Request approval only for one exact delete, erase, reset, uninstall, reimage, destroy, truncate, revoke or overwrite action; record its exact target and recovery or irreversibility. |
| `CONTRACT_CONTRADICTION` | Retain the executable counterexample and pause only that semantic lane. |
| `UNKNOWN_AFTER_EXHAUSTIVE_SEARCH` | Record every searched source and ask one concrete question before changing the affected path. |

The request contains the blocked action, required input/action, why the normal
product requires it, evidence it is unavailable, safe expected scope, objective
success condition and independent work continuing meanwhile.

No disposition permits a fixed tenant/producer/certification ID, synthetic
persona, hand-minted or shared token, unsigned manifest, manual browser storage
injection, manual plist/environment mutation, SQL seed, alternate daemon,
localhost-only substitute, fake artifact digest or fixture interior. An
explicitly authorized diagnostic harness remains `UNIT_HARNESS` or
`DEV_PREVIEW` and cannot advance installed-product integration.

For `COHERENT_E2E`, `prohibited_bypasses` is a closed, complete machine set:
fixed/shared identities or tokens; a second tenant/persona shim; manual
storage/DevTools injection; manual plist/environment/SQL override; an alternate
or parallel daemon; fake/dirty/mixed artifact provenance; fixture-interior
staging; and normal-entrypoint bypass. Omitting an item or writing an arbitrary
assertion such as `none` fails validation.

## Browser product boundary

The installed Browser sensor has two device-local components:

```text
Project-Vanguard WebExtension
        +
project-sentinel native messaging host
        =
one logical Browser source path
```

The supported Browser package installs and configures both components. The
WebExtension owns the Browser profile delivery stream and durable browser WAL.
Native-host results return with exact native component/artifact lineage and the
originating Browser observation ID. They do not create a second counted
Browser activity. If a future native host delivers independently, it requires
a separately certified producer identity and central deduplication contract.

Browser Backend is a hosted service, not part of the device installation. Its
separate producer is authoritative only for facts it directly owns:

- authenticated receipt and validation;
- enrollment/configuration/catalog state;
- heartbeat receipt and backend runtime health;
- queue/publication or downstream processing outcome; and
- backend administrative action outcome.

It never republishes a received Browser action as a second independently
observed user activity. A relay preserves original Browser producer, epoch,
record ID and digest in the sole canonical
`payload.qualified_client_record`; it must not duplicate that tuple in
`envelope.correlation.qualified_parent_record`. The backend record has its own
sequence, but `accepted`, `transformed` and `published` normalize only as
`source_processing` lineage stages with no customer activity candidate,
recent-activity contribution, activity count or risk input.

Browser product integration therefore requires:

1. the exact feature artifact installed through the supported package/policy;
2. the matching native host and NativeMessagingHosts manifest;
3. existing tenant Discovery configuration;
4. a production writer/refresh path for Starliner enrollment and credential;
5. background-runtime startup independent of upload-manager instantiation; and
6. one real Browser record through the complete funnel without storage
   injection.

The Browser `SOURCE_PRODUCT_PATH` therefore carries the exact
`producer-component-set` package graph plus one `package_installations` row for
every package. The rows bind package digest, install-manifest digest,
installation evidence and component membership. A WebExtension-only artifact,
a native-host-only artifact, a component not owned by a package, or a runtime
component-set digest different from the enrolled component set fails the
installed-product gate.

## Endpoint product boundary

Endpoint is one installed compound sensor: app/service manager, monitor,
proxy, IPC broker, template engine, hooks and system/network extension. One
normal package and supervisor own one installation-scoped Starliner runtime and
durable WAL. Component adapters use authenticated bounded local IPC or an
equivalent in-process port; they do not each invent tenant/device identity or
delivery credentials.

Endpoint integration includes every bounded native seam, not only EntityStore
discovery:

- device, process, package, application, agent, model, repository, hook, skill,
  plugin, permission-rule and supported MCP discovery;
- proxy/DLP request, decision and independently observed effect metadata;
- process/hook/tool/runtime activity;
- component lifecycle and health;
- gaps, backpressure and permission degradation; and
- snapshot/reconciliation pages and completion.

The official package, existing tenant/persona bootstrap and normal supervisor
must reach enrollment naturally. `QUILR_DIE_PREVIEW_PERSONA`, synthetic tenant
or fixed identities, manually patched launchd/systemd configuration and a
parallel DIE monitor are forbidden product dependencies.

## Full-funnel source-vertical law

After the real tenant/bootstrap/enrollment path exists, the primary integration
lane proceeds in two deliberately different waves:

1. Endpoint Gate A establishes a real device/application anchor through UI;
2. Browser installed-sensor Gate A joins the same permanent funnel;
3. Endpoint + Browser prove at least one supported cross-source resolution,
   one proof-backed relationship and one truthful unresolved association;
4. Browser Backend, LLM Gateway and MCP Gateway each complete Gate A against
   that same runtime; and
5. Gate B breadth closes for all five profiles while cross-source resolution,
   relationship and activity coverage expands continuously.

This is not horizontal adapter-first work. Every Gate A is a complete native-
to-UI product vertical. It is also not long-tail serialization: Endpoint's
entire proxy/hook/discovery route surface does not postpone the first real
Browser-to-Endpoint graph proof.

For each source:

### Gate A — continuous full-funnel trace

At least one source-native record from the normally installed/deployed exact
artifact traverses, in one coherent runtime and trace:

```text
native capture
-> privacy disposition
-> durable local WAL
-> authenticated batch and exact receipt
-> immutable evidence
-> deterministic normalization
-> source objects and claims
-> canonical entity
-> supported relationship/activity or truthful pending state
-> projection
-> authorized API
-> live UI
```

No fixture replaces an interior stage. One record cannot borrow a later stage
from another run, candidate, tenant or manifest.

`SENSOR_VERTICAL_STATE.csv` is the machine-checkable high-water ledger. Every
stage through `highest_integrated_stage` carries a retained file reference and
its SHA-256 digest; every later stage is `NONE`. The validator resolves each
file below the bounded evidence root, rejects traversal and digest drift, and
requires exact installed/deployed-product provenance. `LIVE_UI` additionally
requires one `COHERENT_E2E` normal path. A prose report or green unit suite
cannot advance this ledger.

The ledger is not allowed to trust a generic `{status: passed}` artifact. Each
retained stage file validates against the closed
`die.sensor-stage-evidence.v1` assertion for that stage. The assertions bind
native record, WAL record, receipt/evidence, normalization run, canonical
entity, relationship/activity or pending dependency, projection, authorized
API operation and live UI route/browser observation through predecessor IDs
and digests. The ledger also parses and semantically validates both the
`SOURCE_PRODUCT_PATH` and `RUNTIME_MANIFEST`, then cross-binds profile, source
commit, source-product-path digest, tenant, producer, installation, component
set, installed/runtime artifact digests and runtime identity. Mixing evidence
from candidates, tenants, producers, runs or manifests fails the gate.

### Gate B — profile completeness

Every `adapter_derivable` route and every launch-scope
`new_capture_required` route in the frozen profile has:

- an exact production native caller;
- privacy and non-admission behavior;
- WAL and receipt proof;
- expected one-or-many normalization outputs;
- correct canonical truth, pending dependency or unsupported state;
- API/UI lineage when customer-facing; and
- replay, duplicate, restart, offline, backpressure, gap, health and
  reconciliation behavior where applicable.

`new_capture_required` is owned production work, not an optional backlog label.
If executable source/runtime evidence proves a route impossible or outside the
bounded product, a focused change-control decision must reclassify it with that
evidence. An agent may not leave it unimplemented and still declare Gate B or
the source capability complete.

The same rule applies at field level: every required LG-008 target trace marked
`requires_new_capture` must terminate in certified capture, an explicit
unsupported disposition approved by change control, or a retained blocking
external condition. Optional-unsourced fields remain absent and must never be
advertised as collected.

This is executable, not a checklist left to memory. The generated
`engineering-execution/registers/gate-b-certification-obligations.csv` contains
one obligation for each of the 47 launch routes and one for each of the 262
required LG-008 target-field traces. It is byte-derived from
`profile-capability-disposition.csv` and `lg008/target-field-traceability.csv`.
`GATE_B_CERTIFICATION.csv` must cover every generated ID exactly once. A
certified row content-addresses exact native caller, artifact/runtime, privacy,
WAL, receipt, normalization, canonical consequence, API/UI disposition and
replay/degraded evidence. Every stage is a typed assertion for the exact route
or target field, chained to the prior stage and to a separately retained raw
execution artifact containing the invoked command, exit status and observed
values; a generic `PASS` JSON is not evidence. The runtime manifest is parsed
and semantically validated, and its enrolled producer component must match the
row's exact source commit and artifact digest. The only other terminal outcome
is focused, evidence-backed `APPROVED_UNSUPPORTED`. It must name one accepted
`DIE-ADR-###` entry that binds the exact obligation in the bounded-pass decision
register loaded from the caller-selected immutable authority commit. An
`EXTERNAL_BLOCKED` row keeps the profile gate open. `COMPLETE` is invalid while
any row is pending or blocked.

`RELEASE_QUALIFIED` and `RELEASABLE` are compositional claims. The exported
product-state library—not only its CLI—semantically validates every included
source's installed-product ledger and requires complete Gate-B evidence for
every included profile. CSV high-water values alone cannot close release.

Gate A proves that the permanent funnel works for the source and authorizes the
next Gate-A vertical only in the order above. Gate B begins immediately for
that source and remains mandatory, but its long-tail breadth can close in
parallel after the Endpoint+Browser cross-source proof. No profile is complete,
advertisable or releasable until its Gate B is complete. Independent common-
module and later-source unit work may run in parallel, but later-source unit
code is not later-source integration progress.

The immediate Endpoint+Browser graph result is independently machine-bound in
`CROSS_SOURCE_GATE.csv`. It cannot become `PROVEN` until the exact Endpoint and
Browser rows in `SENSOR_VERTICAL_STATE.csv` both reach `LIVE_UI` on the same
runtime manifest and one continuous retained run proves: trusted binding,
exactly-once supported relationship, separate unresolved candidates, zero
weak-key merge, durable pending dependency, binding-triggered reevaluation and
replay without duplicate binding or relationship. PI-005 depends on PI-002 and
PI-003A for this baseline; exhaustive all-five graph closure remains its later
exit rather than a prerequisite for the first graph proof.

The proof is identifier-closed, not merely run-labelled. Every retained
cross-source evidence object carries the exact Endpoint and Browser envelope
record IDs from those two validated verticals. The accepted binding names the
same source-object IDs, immutable-evidence IDs and canonical-entity IDs. Its
binding rule must resolve to the frozen Browser identity-assertion authority;
the materialized relationship must name a rule in
`registers/relationship-support.csv`, preserve that rule's predicate, endpoint
types and direction, and use the binding evidence. At the source-vertical
level, the receipt record ID equals the envelope source record, every graph or
activity result resolves to an applicable frozen ontology rule, and every API
claim names a matching operation in `openapi/die-v1.openapi.yaml`. A forged
identifier, invented rule, borrowed run or real-but-inapplicable API operation
fails the gate.

## Why a funnel supports one-source delivery

The central funnel is profile-dispatched, not source-count dependent. Endpoint
does not wait for Browser to create devices and applications. Browser does not
wait for LLM or MCP to create application surfaces and accounts. Missing
counterparts create durable `pending_dependency` state.

When a second source later supplies a qualifying binding:

```text
new accepted binding
-> reverse dependency lookup
-> durable reevaluation work
-> exact relationship support rule
-> one bitemporal relationship/version
-> projection and UI update
```

Email, display name, hostname, timing or tenant co-membership remain hints and
never automatically join source objects. Until proof arrives, the UI shows
separate assets and an unresolved association.

## Implementation-state truth

Source code may be `IMPLEMENTED` and unit verified while product integration is
`NOT_CONNECTED` with highest integrated stage `NONE`. A fixture does not prove
`NATIVE_CAPTURE`. A launch source reaches `NATIVE_CAPTURE` only when the exact
installed/deployed artifact executes its normal capture entrypoint and the
source-product-path and runtime manifests bind that fact.

`INGEST_RECEIPT` and later require one continuous trace. `LIVE_UI` requires a
coherent product runtime with no prohibited bypass or contamination.

## Current remediation boundary

The following current patterns are explicitly non-product until removed:

- Browser `starliner_enrollment` or `starliner_credential` written only through
  test/DevTools injection;
- a Browser candidate that installs only the native host while claiming the
  Browser source vertical;
- Browser delivery runtime reachable only through an incidental upload-manager
  lifecycle;
- Browser Backend staging a relayed client event as independent activity;
- Endpoint preview persona, synthetic tenant/producer/certification identity,
  shared HMAC or manual service configuration;
- Endpoint adapters connected only to discovery while proxy/DLP/activity/
  health/reconciliation paths remain on lossy or separate transports; and
- mixed central role binaries, manual generation activation or overlapping
  preview stacks used as one product result.

These findings do not invalidate the central architecture. They define the
next production work: normal enrollment, exact installation/deployment and one
source at a time through the complete permanent funnel.
