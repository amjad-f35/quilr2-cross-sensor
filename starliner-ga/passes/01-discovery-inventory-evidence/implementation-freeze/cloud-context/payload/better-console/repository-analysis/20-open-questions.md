# Open Questions

## GAP-001

**Unresolved:** live database schemas/data not available; .env absent  
**Class:** external evidence  
**Impact:** blocks live correctness/performance only  
**Owner:** platform/data owner

## GAP-002

**Unresolved:** 30 live-service Rust tests ignored without Redis/PostgreSQL/ClickHouse/Neo4j  
**Class:** runtime environment  
**Impact:** blocks integration certification  
**Owner:** platform owner

## GAP-003

**Unresolved:** published Nexus frontend graph inaccessible locally  
**Class:** build credential  
**Impact:** reconstructed Kit source used; published tarball unverified  
**Owner:** DevOps

## GAP-004

**Unresolved:** GitHub root reusable build detected repository but skipped build job at pinned commit  
**Class:** CI configuration  
**Impact:** green run is not build evidence  
**Owner:** DevOps

## GAP-005

**Unresolved:** subtree CI workflow triggers only main and may not execute from monorepo root  
**Class:** CI layout  
**Impact:** verification provenance ambiguous  
**Owner:** DevOps

## GAP-006

**Unresolved:** Docker/Jenkins not executed locally because Docker absent  
**Class:** runtime environment  
**Impact:** image/ABI/startup unverified  
**Owner:** DevOps

## GAP-007

**Unresolved:** no graceful shutdown future in Rust axum::serve  
**Class:** implementation  
**Impact:** background task drain not explicit  
**Owner:** backend

## GAP-008

**Unresolved:** health route checks main ClickHouse but excludes background worker state  
**Class:** implemented limitation  
**Impact:** process healthy can coexist with topic degradation  
**Owner:** backend/product

## GAP-009

**Unresolved:** TODO backlog lists unimplemented LLM management/agent observability  
**Class:** planned work  
**Impact:** feature gaps  
**Owner:** product/backend

## GAP-010

**Unresolved:** real-data performance work remains in TODO  
**Class:** validation  
**Impact:** performance claims require measurement  
**Owner:** backend

## GAP-011

**Unresolved:** 30 frontend Fast Refresh lint warnings  
**Class:** technical debt  
**Impact:** development hot-reload risk; lint exit remains zero  
**Owner:** frontend

## GAP-012

**Unresolved:** three production chunks exceed 520 kB warning threshold  
**Class:** performance concern  
**Impact:** requires measurement/code splitting  
**Owner:** frontend

## GAP-013

**Unresolved:** npm audit reported 17 issues in reconstructed install  
**Class:** dependency risk  
**Impact:** requires registry-accurate audit and triage  
**Owner:** frontend/security

## GAP-014

**Unresolved:** several handwritten Rust files exceed current 1,500-line convention  
**Class:** maintainability contradiction  
**Impact:** refactor when touched  
**Owner:** backend

## GAP-015

**Unresolved:** no native Starliner source-observation/outbox contract  
**Class:** integration architecture  
**Impact:** requires adapter boundary  
**Owner:** integration

## GAP-016

**Unresolved:** legacy control proxies generally verify response, not independent sensor effect  
**Class:** control semantics  
**Impact:** effect proof incomplete  
**Owner:** integration/product

