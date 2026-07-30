# Quilr GitHub Organization Source Reconciliation

**Cutoff:** 2026-07-30
**Purpose:** replace developer-interview dependencies with direct organization
source evidence for `LG-008`
**Current verdict:** the user does not need to obtain more repository analyses;
the central five-profile semantic saturation and current Browser/Backend/MCP
delta reconciliation are complete.

## Direct correction

Earlier documents incorrectly described several inputs as unavailable or
owner-only. The authenticated `quilrbusiness` organization contains the
referenced ingress service, native libraries, Java libraries, configuration
repositories, schema owner, read API, routing manifests, build workflows and
the complete current gateway checkout.

Therefore:

- no developer interview is a prerequisite for `LG-008`;
- no live customer configuration is required to design the complete source
  profile—configuration-gated behavior is represented as such;
- default-branch source at the cutoff is the analysis authority, while the
  latest successful build and published release are independent evidence;
- native runtime execution moves to `LG-005`, not into an `LG-008` owner-input
  blocker;
- current deployment claims still require an artifact digest/effective
  configuration, but the bounded target architecture does not depend on making
  those claims.

## Organization evidence

The repeatable organization snapshot found 377 repositories:

| Classification | Count |
|---|---:|
| primary native producer | 5 |
| direct source-available build/runtime dependency | 10 |
| current ingress/schema/read consumer | 8 |
| deployment reachability evidence | 8 |
| sensor configuration | 3 |
| platform or target context | 6 |
| related candidate without a proven production edge | 22 |
| POC/demo/test | 11 |
| archived/deprecated | 164 |
| active outside the selected trace | 140 |

The machine inventory is
[GitHub repository relevance](registers/github-repository-relevance.csv). It
does not infer production status from a repository name: manually traced rows
state their evidence, while the remaining rows are explicit triage outcomes.
The selected revisions and Actions evidence are content-addressed in
[`selected-revision-and-build-evidence.json`](evidence/github/selected-revision-and-build-evidence.json).

## Five source authorities

The exact producer cutoff is in
[source revision selection](registers/source-revision-selection.csv). The key
decisions are:

1. Browser Extension uses current
   `Project-Vanguard@8e7a3e0c22c3ec29d0c642b211d59e9abc0071cb`.
2. Browser native host uses current
   `project-sentinel@6f55960ff5c3bf3cf1838985acd4155fc9f16334`.
3. Browser Backend uses current
   `browser-extension-service@496b8c216025e5d21871f5959e61dcdd01836106`.
4. Endpoint uses
   `sentinel-endpoint-agent@a022e52bf2fff6a9445ebad96c3afeaf277e259f`
   for source saturation and separately records published
   `Release-1.1.84@1a976e47ff47e33ff98e3f0e3022ecd8703dc9de`.
5. LLM uses
   `macrodata-refinement@92b0462c583b908f8ce0cadd1bc89d2e702f5a7d`
   plus the selected gateway tree; MCP uses the distinct `mcpgateway/` source
   profile from the same selected checkout,
   `quilr-llm-gateway@99f759d75aa8260f97db6904433c941647a755e5`.

The shared repository does not collapse LLM and MCP into one profile. Producer,
record, transport, storage, access and relationship semantics remain separate.

## Browser package delta

The delivered Browser archive remains an important, validated historical
baseline, but its pinned source is not the current cutoff:

| Component | Packaged revision | Selected revision | Delta |
|---|---|---|---:|
| Project Vanguard | `fc09f3a...` | `8e7a3e0...` | 102 files, +10,043/-424 |
| Project Sentinel | `88ae4e3...` | `6f55960...` | one 448-line on-demand build workflow |
| Browser Extension Service | `99e9599...` | `496b8c2...` | 6 files, +145/-25 |

The Vanguard delta is semantically material. It adds or changes managed
persona ingestion, persona email discovery, login-control verdicts and
provider gates, main-world login/OAuth bridges, request/response joining,
diagnostic response capture, app-specific interceptors, navigation and
about-blank behavior, identity artifacts, trail/log packaging and host-extension
configuration. Those additions must be imported field-by-field before Browser
is current-source saturated.

The backend delta changes graph/deployment/organizational behavior and
configuration. It is smaller but cannot be ignored.

## MCP package delta

The prior MCP dossier pinned `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a`.
The selected source is `99f759d75aa8260f97db6904433c941647a755e5`.
The delta is 32 files, +4,165/-322 and includes:

- upstream protocol cache persistence;
- streamable HTTP handling;
- MCP protocol capability/cache tests;
- backend, OAuth, direct proxy, registry and OneMCP changes;
- event-session and transport validation changes.

This is a real saturation delta, not a release-owner question. Engineering can
derive it from the checkout. Because the selected source is newer than the
latest successful default-branch build (`e845013...`), post-build changes must
be marked `SOURCE_ONLY` until `LG-005`.

## Current legacy source-to-platform path

The actual source-controlled paths are frozen in
[production source reachability](registers/production-source-reachability.csv).
They establish:

```text
Browser ─┬─ native messaging → Sentinel native host
         ├─ HTTP/BFF → extension-api-service
         └─ HTTP/BFF → extension-log-service
                              ├─ Kafka → quilr-ingestion-service
                              ├─ extension_listing → extension-ingestion-service
                              │                         └─ PostgreSQL
                              └─ discovered app → quilr-entities-service

Endpoint ├─ HTTP/BFF → extension-api-service
         └─ HTTP/BFF → extension-log-service

LLM/MCP gateway routes → gateway-owned transports/stores
```

This lineage is evidence about existing behavior, not the Quilr 2
architecture. In particular, direct graph writes, frontend/API composition,
configuration-selected entity output and legacy PostgreSQL extension tables
do not become target canonical authority.

## New contradictions found

### Legacy extension global upsert lacks matching source DDL

`extension-ingestion-service` executes:

```sql
ON CONFLICT (tenant_id, tp_extension_id, tp_extension_version)
```

for `global_tp_extensions`. The organization schema owner,
`quilr-migration-service@18d256c...`, creates the table without a primary or
unique constraint on those columns and contains no later matching migration.
Unless a live database has an undocumented constraint, PostgreSQL cannot use
that conflict target.

This does not change the target architecture. It proves why the new platform
must own explicit constraints and conformance tests rather than assume the
legacy inventory table is reliable.

### `quilr-entities-service` is not a graph publication authority

Its output modes are `LOG` and `DATABASE`; `KAFKA` and `REST_API` are explicit
TODOs. No source edge from the selected entity service to
`quilr-graph-service` was found. The graph service is therefore inspected but
classified as an unproven adjacent consumer, not part of the production chain.

### Legacy failure semantics are not target patterns

Examples include Endpoint validation commented out in `extension-log-service`,
per-record failures followed by successful batch completion in current
consumers, and malformed graph messages dropped with a no-op DLQ hook. These
facts are preserved as migration/continuity evidence and negative tests. They
must not be copied into Starliner admission, work leasing, quarantine or
replay.

## LG-008 closure

All nine engineering actions are complete. The current Browser and Browser
Backend deltas are classified, Endpoint dispositions were semantically
re-reviewed, the LLM lexical dump was replaced with reachable serialized
structures, the MCP delta and access recipes are reconciled, all five profiles
use global stable IDs, and the affected schema/ontology/SQL/API/UI/privacy/test
contracts were updated. Two full regenerations produced no new item or digest
drift. The machine authority is [the LG-008 package](lg008/README.md).

## Validation performed

The freeze validator, schema fixtures, PostgreSQL grammar parser, OpenAPI
validator and shell parser pass. The selected MCP checkout's full local test
suite is not clean: 595 tests passed, six failed and one xfailed. Three failures
are restricted-network tokenizer downloads, one is the repository's own module
size guard, and two require the separately installed historical
`project-starliner` package. With that checkout on `PYTHONPATH`, the selected
Starliner subset reached 87 passed and two launcher/package-install failures.

Exact commands and dispositions are retained in
[organization source validation](evidence/runtime/2026-07-30-org-source-validation.md).
This is source/runtime evidence, not a claim that `LG-005` was performed.

## Boundary after LG-008

The architecture can consume every selected-source-proven fact and explicitly represent
configuration/build/certification gaps. It still cannot truthfully claim a
specific customer deployment enables a capability, or that OS-native capture
works, until the relevant artifact runs under `LG-005`. PostgreSQL,
ClickHouse, object-store and UI gates remain separately governed by
`LG-001..004` and `LG-007`.
