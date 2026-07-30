# Privacy, Capture, and Restricted Content

## Privacy pipeline

```text
native object in source memory
→ field allowlist
→ tenant collection policy
→ local classification/redaction/HMAC
→ capture-state annotation
→ bounded safe fact
→ profile validation
→ edge WAL
```

No native object reaches logs or general serialization before safe extraction.

## Capture states

```text
collected
redacted
tenant_hmac
classified_locally
omitted_by_policy
unavailable_to_source
not_applicable
sampled
gapped
expired
```

Missing/null/empty cannot substitute for capture state.

## Default prohibited content

- raw prompts/responses/messages;
- raw tool arguments/results;
- files/clipboard/page HTML;
- headers/cookies/tokens/JWTs;
- OAuth/provider/cloud credentials;
- private keys or secret values;
- raw DLP matched values;
- upstream errors that may echo customer content.

Profiles and tenant policy must explicitly authorize exceptions.

## HMAC and correlation

Plain hashes of sensitive or low-entropy values are prohibited for privacy correlation. Approved correlation uses:

```text
HMAC-SHA-256(tenant-versioned-correlation-key, canonical allowed subset)
```

The record stores key version, purpose, input-class declaration, and retention. HMAC values are tenant-bound and are not global content identities.

## Restricted-content protocol

When enabled:

1. Edge requests a short-lived upload grant bound to tenant, source, purpose, region, size, hash, content class, and retention.
2. Content is encrypted and uploaded directly to approved storage.
3. Content service verifies authorization, hash, size, encryption metadata, and completion.
4. A committed content reference is returned.
5. Evidence ingestion validates the reference and producer binding.
6. Access requires purpose, role, tenant, legal/retention state, and audit.
7. Expiry or deletion removes content and appends an expiry/tombstone record while preserving explanatory metadata.

No dangling reference is treated as available evidence.

## Content reference

```text
content_ref_id
tenant_id
content_class
source binding
storage region
encryption/key version
hash and size
retention class
purpose
access-policy ref
capture state
commit state
created/expires/deleted
```

## Privacy failure behavior

- Missing collection policy: collect only profile-minimal non-sensitive metadata.
- Classifier unavailable: follow field/action fail policy; do not persist content speculatively.
- Payload firewall detects forbidden content: reject local persistence and emit safe health.
- Content service unavailable: ordinary safe evidence may continue; content-dependent claims become unavailable/not-evaluable.

## Customer controls

Customers configure source/field/purpose collection, content retention, residency, keys where supported, legal hold, evidence access, export, and deletion workflows.
