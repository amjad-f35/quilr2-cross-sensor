# Architecture Evidence Library

Status: **non-normative evidence with normative disposition**

This directory records the inputs used to amend the Starliner / Quilr 2 GA source of truth. It does not promote an input document, conversation, branch name, number, vendor, or proposed interface into implementation authority.

## Rules

1. [`source-inputs.yaml`](source-inputs.yaml) identifies every reviewed input by SHA-256 and line count.
2. [`01-context-disposition.md`](01-context-disposition.md) records what was retained, changed, superseded, rejected, or left as `NEEDS_INPUT`.
3. [`02-current-sensor-repository-audit.md`](02-current-sensor-repository-audit.md) records the revision-pinned static-source proof for the four launch sensor families and the exact boundary of that proof.
4. The architecture constitution and accepted ADRs remain higher authority.
5. A pinned source audit proves the reviewed bytes, not remote currency, deployed artifacts, effective runtime configuration, customer exposure, or production behavior.
6. Deployment, credential, incident, and production-value claims require current evidence from the accountable owner.
7. The raw conversational files are not vendored into the normative corpus. They contain repetition, speculative assistant output, stale implementation details, and potentially sensitive company context. Preserve the originals in an approved company evidence/archive system if long-term raw retention is required.
8. A changed source file is a new evidence input and requires a new digest and disposition review.

## Disposition vocabulary

| Disposition | Meaning |
|---|---|
| `retained` | Adopted without material semantic change. |
| `incorporated_with_changes` | Valuable principle adopted through a newer, stricter contract. |
| `superseded` | Replaced by a higher-authority decision in this corpus. |
| `historical_evidence` | Useful for live discovery or migration, not an implementation instruction. |
| `rejected` | Incompatible with the constitution, safety boundary, or product direction. |
| `needs_input` | Plausible but not verified or owned; cannot become a production value or claim. |
