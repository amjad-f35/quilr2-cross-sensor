# Detection and classification

## Detector: native MCP DLP

**Location:** `services/dlp_service.py::DLPService`; external
`dlp_processor.process_mcp_content`.

### Detection logic

Input arguments are JSON-serialized. Output content is reduced to extractable
text. The service supplies enabled categories, global request/response action,
per-category resolved actions, direction, and tenant to the DLP processor.

### Match semantics

The external/local `dlp_processor` implementation returns processed text,
blocked flag, error, enabled predictions, and disabled predictions. The service
does not independently calculate confidence.

### Output semantics

Outcomes are `allowed`, `blocked`, `redacted`, or `monitored`.

- blocked: original content retained internally, error response returned to
  client;
- redacted: processed input is JSON-parsed back to arguments, or output text is
  written back into content blocks;
- monitored: predictions exist for monitor-action categories and content passes
  unchanged;
- allowed: no monitored/blocked/transformed outcome.

If redacted input cannot be parsed as JSON, the original arguments are used.
This is a fail-open transformation fallback and is logged.

### Confidence

`Unresolved:` prediction score/threshold semantics belong to
`dlp_processor` and external services/assets. Current observe output retains
only safe labels and sets block signal confidence to `1.0`, which is confidence
in the observed block outcome, not detector precision.

### False-positive/negative handling

Customer-configured global/per-category actions and enablement determine effect.
Disabled predictions are logged in debug but not mapped. No user-facing appeal
or detector-feedback record is emitted.

### Platform mapping

`Available now without sensor changes`: safe labels, direction-specific
outcome, block booleans, final action status, block signal.

`Available through adapter mapping only`: disabled predictions, configured
category actions, richer log metadata, subject to privacy allowlists.

### Customer controls

Backend/scoped DLP enablement and action configuration. The central platform
cannot currently send a typed command through the observe channel.

## Detector: token-shaped identifier safety

**Location:** `starliner/identity.py::_looks_sensitive_identifier`.

Matches known secret prefixes, JWT-like three-segment tokens, or dense
32+-character alphanumeric/underscore/hyphen strings. Match output is an opaque
SHA-256-derived identifier.

This is a payload-safety classifier, not a credential validator. False positives
can hide legitimate long identifiers; false negatives are possible for secrets
outside the patterns.

## Detector: secret-like label rejection

**Location:** `payload_safety.safe_labels` plus pinned
`starliner_contracts.validation.find_secret_like`.

Labels must match `[A-Za-z0-9_.:-]{1,128}` and must not look like supported
secret patterns. Invalid predictions are silently dropped.

## Detector: response error classification

**Location:** `MCPHandler._observe_completed_tool_call`.

Matches a top-level JSON-RPC `error` or result object with truthy `isError`.
Output is boolean `response_is_error`, then status/error-class mapping.

False-negative conditions include nonstandard error payloads and exceptions that
bypass observation. False positives depend on upstream misuse of `isError`.

## Detector: ZIA URL policy

**Location:** `services/mcp_handler_zia.py`.

The handler recognizes URL-like values, extracts domains, applies configured
override rules by user groups/department, requests ZIA checks, and filters
inputs/outputs for selected search/page tools. Checks are concurrent and have
timeouts/cache behavior.

`Available through adapter mapping only`: safe domain classification outcomes
if a new bounded capture is added to existing logs/state.

`Requires minor sensor instrumentation`: current observe mapper receives no ZIA
decision, rule, blocked-domain count, or degraded-state field.

`Unresolved:` live ZIA response semantics and production availability.

## Detector: smart-group membership

**Location:** `utils/smart_groups.py`.

The service builds indexes from ClickHouse or a local SQLite snapshot and
returns groups for `(user_email, tenant_id)`. Initial sync is bounded/best
effort; failure degrades to local/no groups.

This is authoritative only to the freshness of the upstream/snapshot. It is
used in scoped policy and web-search domain exclusions, but current observe
records do not retain group attribution or freshness.

## Detector: OneMCP rich-client capabilities

**Location:** `services/onemcp_client_profile.py`,
`services/onemcp_diagnostics.py`.

Client initialize capabilities, protocol/session headers, extension/UI support,
and observed follow-up behavior are classified into a client profile and
diagnostic events. Header values are presence-checked or SHA-256 fingerprinted
for diagnostics.

This is a runtime/client-compatibility classifier, not secure client identity.
Product disposition: `Operator-only`, `Coverage and health`.

## Detector: auth/client-agent rejection classification

Direct MCP rejection code resolves path/backend/tenant/user/auth mode,
user-agent/custom-agent keyword/display name, reason, stage, HTTP/JSON-RPC
status, method, and tool. User-agent matching can be heuristic and should not be
treated as cryptographic application identity.

## Detector: token-saving content type/transform opportunity

**Location:** `services/token_saving_service.py` and replacers.

Enabled transforms identify and rewrite JSON, HTML, Markdown, or compressible
text, estimate tokens with the configured tokenizer, and report saved counts.
Inputs above 2,000,000 characters skip transformation. Individual transformer
exceptions preserve the current text and record zero savings.

This is optimization classification, not security detection.

## Detector/classifier admission summary

| Detector | Current Starliner output | Platform availability | Product disposition |
| --- | --- | --- | --- |
| native DLP label/outcome/block | yes, reduced | `Available now without sensor changes` | `Activity explorer`, `Finding signal`, `Analytics` |
| identifier secret-shape | implicit through opaque ID | `Available now without sensor changes` | `Internal implementation only` |
| response error | yes, reduced | `Available now without sensor changes` | `Activity explorer`, `Analytics` |
| ZIA URL policy | no | `Requires minor sensor instrumentation` | `Activity explorer`, possible `Finding signal` |
| smart-group membership/freshness | no | `Available through adapter mapping only` for config/snapshot; instrumentation for decision attribution | `Configuration`, `Evidence drill-down` |
| OneMCP rich-client profile | native event log only | `Available through adapter mapping only` | `Operator-only` |
| client-agent heuristic | rejection/event logs | `Available through adapter mapping only` | `Activity explorer`, `Operator-only` |
| token-saving classifier/metrics | tool metadata only | `Available through adapter mapping only` | `Analytics` |

