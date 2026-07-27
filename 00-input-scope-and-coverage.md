# Input scope and coverage

## Input ledger

**Verified:** [input-coverage.csv](matrices/input-coverage.csv) contains one row for every supplied analysis, inventory, symbol, API, route, evidence, and machine-index document: path, system, type, evidence level, domain, analysis status, byte size, SHA-256, and title. Counts are:

| Analysis set | Documents | Pinned source coverage inherited from its ledger |
| --- | ---: | ---: |
| Browser extension / native host / BES | 121 | 1,226/1,226 tracked files |
| Endpoint agent / dashboard / IPC | 110 | 1,265/1,265 analysis records |
| LLM/DLP gateway | 64 | 1,030/1,030 tracked files |
| Quilr 1 web / query-builder | 124 | 2,903/2,903 tracked files |
| **Total** | **419** | **6,424 source-analysis records** |

The source-coverage claims above are grounded in the browser [coverage ledger](../../Browser-extension-sensor-analysis/outputs/repository-analysis/21-analysis-coverage.md), endpoint [coverage ledger](../../Endpoint-agent-sensor-analysis/repository-analysis/21-analysis-coverage.md), gateway [coverage ledger](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/21-analysis-coverage.md), and Quilr 1 [coverage ledger](../../quilr-platform-analysis/21-analysis-coverage.md).

## Inspection method

1. Every supplied analysis/evidence document was enumerated, read, hashed, typed, and assigned an analysis status.
2. The executive, architecture, feature, data dictionary, storage, API, security/error, contradiction, open-question, dynamic-verification, and coverage narratives were semantically reconciled.
3. Source-field rows were extracted from all four repository-wide data dictionaries and all 137 Browser Extension Service transformation mappings.
4. Complete symbol/inventory documents were used for exact locations and coverage, while semantic claims were taken from corroborated subsystem narratives rather than inferred from names.
5. Source capabilities were admitted only where the supplied material demonstrates a collection or persistence path.
6. Missing runtime systems and absent repositories remain `Unresolved`; they were not filled using general product expectations.

## Evidence anchors

| ID | Evidence | Primary use |
| --- | --- | --- |
| BR-EXEC | [Browser executive overview](../../Browser-extension-sensor-analysis/outputs/repository-analysis/02-executive-overview.md) | Three-runtime architecture and limitations |
| BR-DATA | [Browser data dictionary](../../Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md) | Browser/native/BES fields |
| BR-STORE | [Browser storage](../../Browser-extension-sensor-analysis/outputs/repository-analysis/09-data-models-and-storage.md) | SQLite/PostgreSQL/Neo4j/Redis/Kafka/DWH state |
| BR-API | [Browser API/interface reference](../../Browser-extension-sensor-analysis/outputs/repository-analysis/10-api-and-interface-reference.md) | Message, native, HTTP, and Kafka interfaces |
| BR-SCHEMA | [BES schema ledger](../../Browser-extension-sensor-analysis/outputs/repository-analysis/generated/browser-extension-service-schema-ledger.md) | 137 exact event mappings |
| EP-EXEC | [Endpoint executive overview](../../Endpoint-agent-sensor-analysis/repository-analysis/02-executive-overview.md) | Endpoint system shape |
| EP-ENTITY | [Endpoint entity model](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-runtime-discovery-and-state.md) | Nine entity variants and defective IDs |
| EP-SYNC | [Endpoint sync/enforcement/hooks](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-sync-enforcement-and-hooks.md) | App ID resolution, ingest, delta, IDE activity |
| EP-SCRIPT | [Endpoint scripting/discovery](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-system-monitor-scripting-packages-tests-and-documents.md) | Claude/Cursor/Codex/MCP/model/agent/tool-adjacent discovery |
| EP-DATA | [Endpoint data dictionary](../../Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md) | Endpoint fields, state, sensitivity |
| EP-PROXY | [Endpoint proxy DLP](../../Endpoint-agent-sensor-analysis/repository-analysis/06-endpoint-proxy-dlp-ui-alerts.md) | Network/data/policy observations |
| LLM-EXEC | [Gateway executive overview](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/02-executive-overview.md) | Gateway/services/deployment |
| LLM-DATA | [Gateway data dictionary](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md) | Identity, DLP, model, tool, usage fields |
| LLM-STORE | [Gateway storage](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/09-data-models-and-storage.md) | SQLite/NATS/ClickHouse state |
| LLM-API | [Gateway API reference](../../LLM-gateway-sensor-analysis/outputs/repository-analysis/10-api-and-interface-reference.md) | 287 routes and messaging contracts |
| Q1-EXEC | [Quilr 1 executive overview](../../quilr-platform-analysis/02-executive-overview.md) | Current product architecture |
| Q1-FEATURE | [Quilr 1 feature catalog](../../quilr-platform-analysis/05-feature-catalog.md) | Product features and stores |
| Q1-DATA | [Quilr 1 data dictionary](../../quilr-platform-analysis/08-data-dictionary.md) | Current fields/tables |
| Q1-STORE | [Quilr 1 storage](../../quilr-platform-analysis/09-data-models-and-storage.md) | Current store responsibilities |
| Q1-TRACE | [Frontend/backend traceability](../../quilr-platform-analysis/cross-repository/frontend-to-query-builder.md) | Page/client/API/backend mappings |
| Q1-API | [Query-builder API](../../quilr-platform-analysis/api/quilr-query-builder-http.md) | 141 backend operations |
| Q1-DYNAMIC | [Dynamic verification](../../quilr-platform-analysis/22-dynamic-verification.md) | Build/runtime and external-boundary evidence |

## Derived source list

The complete field-level catalog is [sensor-capabilities.csv](matrices/sensor-capabilities.csv). It contains 17 evidenced source/system profiles. Four require careful interpretation:

- **External MCP Gateway:** verified only through the Quilr frontend and query-builder analytical interfaces. Its native repository/schema is absent.
- **Quilr 1 query-builder/warehouse:** an aggregator, not a sensor; its rows are backfill inputs or analytical projections.
- **Identity/IdP boundary:** verified integration and `quilr_idp_apps`/user/graph usage, but no authoritative provider contract was supplied.
- **SaaS/connector boundary:** verified UI/service integration boundary, but no complete connector repository or event schema was supplied.

## Intentional exclusions

Generated dependency caches, JDK/Maven/npm toolchains, build outputs, GitHub caches, and third-party package trees under `work/` are not treated as Quilr product evidence. They remain discoverable in the workspace but are excluded from the 419-document denominator because the authored repository-analysis sets already record the pinned source trees and because those transient tools would create false sensor/API/schema claims.

No production source was modified.

## Coverage verdict

**Verified:** every supplied analysis document has a status.  
**Verified:** every meaningful row in the four data dictionaries and the 137-entry BES transformation ledger has a disposition.  
**Unresolved:** production-only state and missing source contracts listed in [open questions](23-open-questions.md).  
**Proposed:** the target ontology, contracts, materializers, findings, metrics, and interfaces.
