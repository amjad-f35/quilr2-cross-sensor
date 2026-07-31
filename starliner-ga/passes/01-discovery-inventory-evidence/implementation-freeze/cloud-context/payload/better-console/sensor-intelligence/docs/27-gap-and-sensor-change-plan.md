# Gap and Platform-Change Plan

| ID | Gap | Class | Impact | Owner |
| --- | --- | --- | --- | --- |
| GAP-001 | live database schemas/data not available; .env absent | external evidence | blocks live correctness/performance only | platform/data owner |
| GAP-002 | 30 live-service Rust tests ignored without Redis/PostgreSQL/ClickHouse/Neo4j | runtime environment | blocks integration certification | platform owner |
| GAP-003 | published Nexus frontend graph inaccessible locally | build credential | reconstructed Kit source used; published tarball unverified | DevOps |
| GAP-004 | GitHub root reusable build detected repository but skipped build job at pinned commit | CI configuration | green run is not build evidence | DevOps |
| GAP-005 | subtree CI workflow triggers only main and may not execute from monorepo root | CI layout | verification provenance ambiguous | DevOps |
| GAP-006 | Docker/Jenkins not executed locally because Docker absent | runtime environment | image/ABI/startup unverified | DevOps |
| GAP-007 | no graceful shutdown future in Rust axum::serve | implementation | background task drain not explicit | backend |
| GAP-008 | health route checks main ClickHouse but excludes background worker state | implemented limitation | process healthy can coexist with topic degradation | backend/product |
| GAP-009 | TODO backlog lists unimplemented LLM management/agent observability | planned work | feature gaps | product/backend |
| GAP-010 | real-data performance work remains in TODO | validation | performance claims require measurement | backend |
| GAP-011 | 30 frontend Fast Refresh lint warnings | technical debt | development hot-reload risk; lint exit remains zero | frontend |
| GAP-012 | three production chunks exceed 520 kB warning threshold | performance concern | requires measurement/code splitting | frontend |
| GAP-013 | npm audit reported 17 issues in reconstructed install | dependency risk | requires registry-accurate audit and triage | frontend/security |
| GAP-014 | several handwritten Rust files exceed current 1,500-line convention | maintainability contradiction | refactor when touched | backend |
| GAP-015 | no native Starliner source-observation/outbox contract | integration architecture | requires adapter boundary | integration |
| GAP-016 | legacy control proxies generally verify response, not independent sensor effect | control semantics | effect proof incomplete | integration/product |

## Disposition

- Available now: read models, APIs, source-specific metrics, product documents, topic derivation, controls listed implemented.
- Adapter-only: profile pinning, evidence envelopes, privacy gate, WAL/outbox, checkpoints, reconciliation.
- Minor instrumentation: explicit worker capability health and durable runtime artifact retention.
- Substantial change: universal command/effect channel or native sensor emission.
- External: live estate schemas/grants/data, CI secrets, deployment/runtime evidence.
