# 25. Identity foundations

## Mandate

This section is a mandatory extension of the cross-sensor architecture. Where an earlier document could be read as treating identity as a one-time resolution step, this section supersedes it:

> Discovery and identity are continuous, evidence-backed processes. A canonical ID is a durable database identity, not proof that the represented entity is authentic, current, authorized, or executing the approved artifact.

The target lifecycle is:

```text
observe
→ identify
→ resolve
→ verify
→ authenticate
→ attest
→ authorize
→ delegate
→ execute
→ attribute
→ reconcile
→ rotate
→ revoke
→ retire
```

## Direct answers

### Is current discovery one-time or continuous?

**Verified: it is a combination, but not a complete continuous identity system.**

| Mode | Current evidence | Conclusion |
| --- | --- | --- |
| Startup-only | Quilr master-data bootstrap runs once per JVM; several stores initialize/migrate at process start | Implemented for selected data, not identity-wide |
| Scheduled | Quilr application/settings and user sync run every minute; settings backfill and admin-user backfill run hourly; endpoint/browser/gateway components have periodic jobs | Implemented but fragmented |
| Event-driven | Browser activity, endpoint process/proxy/hook activity, gateway requests, Kafka/NATS events | Implemented for activity observations |
| Request-driven | API queries, authorization, gateway requests, configuration mutation, provider probes | Implemented |
| Continuously streamed | Kafka/NATS and runtime event paths exist, but no repository-wide identity observation contract or resolver exists | Partial |
| Manually triggered | Sync, deployment, onboarding, export, backfill, and operations endpoints/scripts exist | Implemented for selected functions |
| Full reconciliation | No common source cursor, tombstone, freshness, authoritative comparison, reversible merge/split, or identity-wide reconciliation system is demonstrated | Absent |

Evidence: [Quilr runtime entry points](../../quilr-platform-analysis/04-runtime-entry-points.md), [browser overview](../../Browser-extension-sensor-analysis/outputs/repository-analysis/02-executive-overview.md), [endpoint overview](../../Endpoint-agent-sensor-analysis/repository-analysis/02-executive-overview.md), and [gateway overview](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/02-executive-overview.md).

### What currently identifies each domain?

| Domain | Current identity | Assessment |
| --- | --- | --- |
| Human, group, tenant | Bearer/JWT-derived user context, email/user IDs, tenant and subscriber context, source-specific group/role data | Partial account identity; no universal person identity |
| Device, browser, process | Persona/device IDs, local account/email candidates, browser/process/PID/path fields | Observational and source scoped; reimage/restart semantics are not canonical |
| Application and account | `app_id`, names, domains, processes, graph nodes, warehouse rows, gateway application/API-key context | Several layers are conflated or joined at query time |
| Agent | Endpoint/MCP/gateway names, discovery records, partial activity metadata | Definition/version/deployment/runtime/run binding is missing |
| Model | Provider, model, deployment, endpoint, route/alias strings | Useful observations; alias and version semantics vary |
| MCP/tool/connector | External IDs where supplied, names, endpoints, OAuth/integration records | Authoritative MCP/connector contracts are not supplied |
| Workload/service | Service/process/deployment names, API credentials, Kubernetes manifests | No verified SPIFFE/SVID or cryptographically bound runtime identity |
| Credential/secret | JWTs, API keys, cookies, provider credentials, local vault/secret references | Fragmented; no canonical credential-to-owner/consumer/grant inventory |
| Source/build/artifact/release | Git commit hashes as analysis/build anchors, versions/tags, build and deployment paths | No complete signed source→build→artifact→release→deployment→runtime chain |
| Policy/decision/finding/evidence | Source-specific IDs, status rows, audit and outcome records | Exact versioned identity snapshot is not universal |

The exhaustive answer covers all 54 base canonical entity types plus 64 required continuous-identity types—118 total—in [identity-types.csv](matrices/identity-types.csv). The full current mechanism classification is [identity-mechanism-status.csv](matrices/identity-mechanism-status.csv).

### Are Git OIDs, SWHIDs, or workload identities currently universal?

- **Git OIDs:** used as repository-analysis anchors and sometimes source/build references. They are not the current universal canonical identity system.
- **SWHIDs:** no use was found in the supplied analysis.
- **SPIFFE IDs, X.509-SVIDs, JWT-SVIDs:** no use was found in the supplied analysis.
- **OCI digests, artifact signatures, SLSA/in-toto provenance, Sigstore records:** live/current use is absent or unresolved; analysis documents explicitly identify missing or unavailable digest, signing, SBOM, and deployment evidence.
- **JWT and API-key identity:** implemented on several request paths, but possession of a bearer credential is not workload, agent, person, or artifact identity.

## Identity mechanism decision

No identifier class is universal:

| Thing | Correct identity mechanism |
| --- | --- |
| Mutable real/logical entity | Stable tenant-safe canonical ID plus identifiers and claims |
| Human account | Verified issuer+subject or authoritative directory resource ID |
| Immutable source object | Full Git OID with algorithm/object/repository; optional appropriate SWHID |
| Built artifact | Algorithm-qualified content digest |
| Executing workload | Cryptographic workload identity plus runtime attestation |
| Agent behavior | Agent definition plus immutable version/manifest/artifact |
| Delegated action | Actor chain plus grant, credential, policy decision, and causality |
| Secret | Secret-manager resource and version metadata; never the value |
| Public key | Algorithm-qualified fingerprint or JWK thumbprint |
| Certificate | Issuer+serial+public-key/certificate fingerprint plus validation result |

## Target invariants

1. Every identity lookup is tenant constrained unless it explicitly addresses the global product catalog.
2. Every native identifier has a namespace, source, observed/valid interval, assurance, and status.
3. Every claim records source, field, time, authority, proof, assurance, resolver version, and confidence.
4. Authentication, attestation, authorization, ownership, and resolver confidence are independent facts.
5. Canonicalization never destroys observations or historical identifiers.
6. Merge, split, negative-match, rekey, revoke, and retire operations are append-only events.
7. Every consequential action references a complete actor chain or is explicitly marked incomplete.
8. Every production artifact is content addressed; tags and aliases remain mutable routes.
9. Every historical decision retains the identity, relationship, policy, and proof snapshot it evaluated.
10. “Unknown” is a first-class state and is never counted as compliant.

## Standards baseline for proposed mechanisms

These sources define the proposed mechanism semantics; they do not prove current Quilr implementation:

- [RFC 9562 UUIDv7](https://www.rfc-editor.org/info/rfc9562/) for time-ordered opaque internal IDs.
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) for issuer-scoped subjects.
- [SPIFFE Workload API](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/) and [X.509-SVID](https://spiffe.io/docs/latest/spiffe-specs/x509-svid/) for workload credentials.
- [OAuth Token Exchange, RFC 8693](https://www.rfc-editor.org/info/rfc8693/), [Resource Indicators, RFC 8707](https://www.rfc-editor.org/info/rfc8707/), [Rich Authorization Requests, RFC 9396](https://www.rfc-editor.org/info/rfc9396/), and [DPoP, RFC 9449](https://www.rfc-editor.org/info/rfc9449/) for delegated and sender-constrained authority.
- [SWHID specification](https://docs.softwareheritage.org/devel/swh-model/persistent-identifiers.html) for persistent source-object identifiers.
- [SLSA 1.2](https://slsa.dev/spec/v1.2/), [Sigstore signing](https://docs.sigstore.dev/cosign/signing/overview/), and [Rekor](https://docs.sigstore.dev/logging/overview/) for provenance and signing design.

## Machine contracts

- [Canonical identity schema](schemas/canonical-identity.schema.json)
- [Identifier record schema](schemas/identifier-record.schema.json)
- [Identity observation schema](schemas/identity-observation.schema.json)
- [Identity mechanism status](matrices/identity-mechanism-status.csv)
- [Identity source capability](matrices/identity-sources.csv)
- [Identity gaps](matrices/current-identity-gaps.csv)
