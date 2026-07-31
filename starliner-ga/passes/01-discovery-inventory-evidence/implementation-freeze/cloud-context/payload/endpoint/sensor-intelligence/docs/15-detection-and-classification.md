# 15 — Detection, Classification, and Matching

## Detection taxonomy

The endpoint uses “detection” for several different mechanisms:

1. process/application correlation;
2. file/marker/config discovery;
3. DLP sensitive-content/adversarial analysis;
4. request/application behavior selection;
5. policy matching;
6. integrity mismatch detection;
7. operational health thresholds.

Only DLP analyzers produce `DlpFinding`. None of these outputs is automatically
a customer finding.

The machine catalog is
[detectors.csv](../../../matrices/sensor-intelligence/endpoint-sensor/detectors.csv).

## Process/application correlation

`Correlator::correlate` evaluates:

1. npm-style `.bin` install-path pattern;
2. backend process map, including command-line patterns;
3. alias cache;
4. application cache;
5. platform path resolution;
6. basename fallback.

It returns app name, optional install path, governance, source and system flag.
This is classification, not proof of installed package ownership. Basename and
alias matches can be ambiguous. Backend process-map exclusions return false if
the lock is poisoned, which is a fail-open observation behavior.

## Marker/Lua and package matching

Marker rules match configured folders/files; only matches run assigned Lua
collectors. Lua parsers classify returned typed objects. npm/Cargo/Go scanners
match package-manager artifacts and executable paths.

Blind spots:

- configuration determines scope;
- permissions and symlinks can hide files;
- no general recursive “all agent artifacts” classifier exists;
- a script error or unsupported schema can skip candidates;
- detected configuration does not prove activity.

## Heuristic DLP analyzer

`heuristic_analyze`:

- requires UTF-8; non-UTF-8 returns non-sensitive;
- applies an early prefilter requiring a digit, `@`, `BEGIN`, `$` or `AKIA`;
- runs a fixed lazy regex set across PII, financial, health and secret-like
  patterns;
- applies extra US SSN range validation;
- returns uppercase **pattern names** as `Detection.entity`, not the matched
  sensitive substring;
- leaves category, subtype, reason, method and snippet empty.

Patterns include SSN, email, phone, address, date of birth, full name, IPv4,
passport, password assignments, multiple card networks, bank/routing/IBAN/SWIFT,
MRN/patient/NPI, generic/API/cloud/GitHub/Slack/JWT/SSH/URL/database secrets,
currency and cryptocurrency addresses.

**Potential issue:** broad patterns such as full name, address, bank-account
length, NPI and passport can produce false positives. Credit-card regexes do
not show Luhn validation. The prefilter can produce false negatives for
sensitive text without the trigger characters.

## Remote analyzer

`RemoteAnalyzer` POSTs raw bytes and expects JSON:

```json
{"sensitive": true, "entities": ["..."]}
```

It does not call `error_for_status` in the shown implementation. Any readable
response body with parseable JSON can become a result regardless of HTTP
status. Parse/read/network failure falls back to heuristic analysis. Returned
entity strings have no category/method/confidence.

## Feature-gated AI analyzer

When `dlp-oob` is compiled and selected, `AIAnalyzer`:

- requires UTF-8;
- obtains token/tenant via Persona IPC;
- streams backend DLP results through the SDK;
- maps adversarial IDs beginning `adverserial_` or `adversarial_` to one
  `AdversarialPrompt` detection;
- maps sensitive entities and optional category/subcategory/id/reason/method;
- generates a first-occurrence snippet of up to five whitespace words before
  and after each entity;
- clears Persona cache on errors containing 401/unauthorized;
- returns non-sensitive if credentials are absent or no detections survive.

Authentication or stream failure can therefore fail open as no finding. The
detector does not expose a numeric confidence in the native `Detection`.

## Dormant monitor detection client

`system-monitor/v2/src/detection::DetectionClient` implements cached,
record-separator-delimited streaming DLP calls. Repository-wide search found
construction in its test but no production caller. It is a
`Dead-code candidate`, not active hook DLP. The hook production evaluator
returns Allow and empty detections.

## Extraction classifiers

Field extraction recognizes Body/Query/Header and transform/select pipelines.
PDF, Office and OCR are compile-feature-dependent. MIME/file-type recognition
sets `is_file_upload`, which selects behavior ID `BID_203`; non-file paths use
Gen-AI DLP or default `BID_24` unapproved SaaS selection based on app details.
This is behavior routing, not a detector finding by itself.

## Integrity and health detectors

- Hook integrity compares semantic JSON hook values, extra keys and expected
  binary path, then restores mismatches.
- Proxy health classifies cumulative failure rate after at least ten requests:
  Healthy, Degraded, Unhealthy or Critical.
- Circuit breakers classify per-host Closed/Open/HalfOpen.
- Destination mismatch counters signal disagreements between resolution
  sources, but no customer finding is currently produced.

## Detector result admission

`Proposed:` a detector result sent to Quilr must state:

- detector name/version/mode;
- input content type and capture point;
- exact policy/config version;
- category/method/confidence where supported;
- match span or explicit absence of span;
- truncation/redaction;
- failure/fallback path;
- coverage and bypass state.

Heuristic pattern names must not be presented as leaked values. Remote/AI
results must identify their upstream detector and fallback.

