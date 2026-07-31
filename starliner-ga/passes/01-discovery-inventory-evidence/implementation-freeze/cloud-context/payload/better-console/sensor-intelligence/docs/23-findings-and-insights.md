# Findings and Insights

## Finding: `platform-process-degraded`

**Business question:** main dependency/background state indicates degraded capability  
**Evidence:** health/log/capability evidence  
**Surface:** operator  
**Status:** implemented partial

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `activity-topic-stalled`

**Business question:** topic cursor/heartbeat stops beyond threshold  
**Evidence:** runner state + logs  
**Surface:** operator  
**Status:** derivable; threshold external

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `source-coverage-gap`

**Business question:** one sensor read model unavailable or stale  
**Evidence:** readiness/coverage state  
**Surface:** customer+operator  
**Status:** implemented partial

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `identity-drift`

**Business question:** principal/directory grants disagree or mirror unsynchronized  
**Evidence:** platform access projection  
**Surface:** operator  
**Status:** implemented

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `risky-llm-usage`

**Business question:** source detections/findings indicate risk  
**Evidence:** LLM rows and detector semantics  
**Surface:** customer  
**Status:** signal only pending canonical admission

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `mcp-rejection-pattern`

**Business question:** repeated rejected tool calls  
**Evidence:** MCP rejection rows  
**Surface:** customer  
**Status:** derived candidate

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `endpoint-dlp-activity`

**Business question:** Endpoint DLP evidence meets detector definition  
**Evidence:** Endpoint rows  
**Surface:** customer  
**Status:** signal only

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `browser-alert-lifecycle`

**Business question:** browser alert row status and evidence  
**Evidence:** browser rows  
**Surface:** customer  
**Status:** source finding projection

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `configuration-drift`

**Business question:** current service configuration differs from expected policy  
**Evidence:** config snapshots/audit  
**Surface:** operator/customer  
**Status:** partially derivable

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `control-effect-missing`

**Business question:** control accepted without later independent effect  
**Evidence:** control response + absent observation  
**Surface:** operator  
**Status:** proposed cross-source finding

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `adapter-reconciliation-gap`

**Business question:** source extraction balance fails  
**Evidence:** future adapter metrics  
**Surface:** operator  
**Status:** not implemented

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

## Finding: `unsupported-source-version`

**Business question:** profile/schema not supported  
**Evidence:** future capability manifest  
**Surface:** operator/customer coverage  
**Status:** not implemented

Admission requires tenant scope, evidence/provenance, temporal semantics, deduplication, lifecycle, coverage, and an actionable owner. Source label alone is insufficient.

