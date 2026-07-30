# ADR-0007: Restricted content separation

Status: **accepted**

## Context

Prompts, responses, tool arguments/results, documents, DOM, command lines, and file paths can contain secrets, personal data, or regulated content. Hashing raw values is often reversible by guessing and does not make content safe.

## Decision

Normal telemetry contains structural metadata and approved safe facts. Restricted content requires an independent, purpose-bound, time-bounded grant, separate upload/store, stricter access, retention, audit, and regional controls. Secrets are always prohibited.

## Consequences

- Core discovery, findings, and analytics must work without content.
- Profile privacy classification happens before normal WAL persistence.
- Restricted-content capability has its own future GA gate.

## Rejected

Plain SHA-256 of arbitrary content, producer-declared redaction as proof, or content fields hidden only in the UI.

## Validation

Secret canaries, low-entropy dictionary attacks, log/export leakage, grant expiry, purpose access, deletion, and regional routing.
