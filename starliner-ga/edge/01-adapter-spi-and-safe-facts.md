# Adapter SPI and the Safe-Fact Boundary

Status: **normative**

## Contract

A sensor adapter translates native sensor information into a typed source record. It preserves the strongest source-native identifiers and semantics it actually knows. It does not decide canonical identity.

The adapter interface has five independent paths:

```text
observe(record)
reconcile(snapshot page or delta)
report_health(status)
apply_command(typed command)
report_effect(typed outcome)
```

An implementation may support only the paths declared in its signed capability manifest.

## Safe facts

A safe fact is a statement the producer is qualified to make and allowed to export. Examples:

- “process executable hash H opened a network connection to host X”;
- “browser extension instance E observed SaaS surface S in profile P”;
- “gateway deployment G routed a request carrying source model string M”;
- “MCP gateway G registered server-native identifier R with tool-native identifier T”;
- “endpoint agent A blocked process P under local rule version V.”

Unsafe edge conclusions include:

- “this is canonical application Q”;
- “this user owns application Q”;
- “this model is approved”;
- “this event is a security incident”;
- “two aliases from different sensors are the same enterprise entity.”

Those conclusions require central policy, identity, authority, or multi-source context.

## Adapter API requirements

The production SPI MUST:

- use generated typed contracts, not untyped maps as the primary interface;
- distinguish absence, redaction, unknown, not applicable, and unsupported;
- require source-native identity fields declared by the profile;
- attach event, observation, ingest, and monotonic time as available;
- declare clock quality and source revision quality;
- expose the capture origin and software version;
- return structured admission errors;
- support backpressure without unbounded allocation;
- support pagination and resumable reconciliation;
- be cancellation-aware;
- never log raw restricted content through default diagnostic paths.

## Source identifiers

Adapters MUST preserve stable identifiers in descending preference:

1. source-issued immutable object ID;
2. source-issued scoped stable ID;
3. cryptographic artifact identity such as executable or package digest;
4. normalized tuple explicitly defined by the source profile;
5. ephemeral instance ID, with declared lifetime.

Display names, URLs, user-entered labels, and process names are aliases, not canonical IDs.

Every identifier states:

- issuing system;
- source namespace;
- tenant/account/workspace scope;
- value or privacy-preserving token;
- stability class;
- first and last observed time;
- confidence in parsing, not confidence in cross-source identity.

## Privacy contract

The adapter classifies fields before they enter the runtime:

| Class | Examples | Default |
|---|---|---|
| Structural | protocol name, status, count, capability | Export |
| Enterprise identifier | tenant-scoped user ID, app ID, device ID | Export with declared handling |
| Pseudonymous | stable tenant-keyed token | Export |
| Sensitive metadata | URL path, command line, model arguments | Redact or tokenize by policy |
| Restricted content | prompt, response, document content, tool result | Prohibited from normal telemetry |
| Secret | token, cookie, key, authorization header | Always prohibited |

Restricted content uses the separate content-grant protocol. A producer-supplied “redacted” flag is not sufficient; certification includes adversarial leakage tests.

## Delta and reconciliation

Adapters distinguish:

- an observed upsert;
- an explicit source deletion;
- an inferred absence during a completed full snapshot;
- a correction to a prior record;
- a source reset or epoch change;
- a late record;
- a partial or failed scan.

A snapshot does not authorize absence conclusions until `SnapshotCompleted` is durably accepted with the expected scope and page chain.

## Enforcement SPI

The enforcement adapter accepts only registered command types. Each type defines:

- target selector and required stable source identifiers;
- allowed policy purpose;
- required approval class;
- preconditions;
- idempotency key semantics;
- maximum validity window;
- supported dry-run behavior;
- local fail-open/fail-closed behavior;
- typed terminal and non-terminal outcomes;
- rollback or compensating action, if supported;
- effect observation requirements.

Arbitrary shell commands, scripts, SQL, or opaque executable payloads are prohibited.

## Adapter review checklist

- Does each emitted claim have a named source authority?
- Can a value be confused with a canonical identity?
- Are source namespace and scope explicit?
- Are deletion and reconciliation semantics complete?
- Are all restricted fields classified before persistence?
- Can backpressure propagate safely?
- Are capability claims signed and release-pinned?
- Is enforcement typed, bounded, idempotent, and observable?
- Is the adapter useful during offline operation?
- Are support diagnostics adequate without exposing customer content?
