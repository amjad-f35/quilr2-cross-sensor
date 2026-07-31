# `mcpgateway` repository analysis

This documentation describes only `mcpgateway/` from `quilrbusiness/quilr-llm-gateway`, branch `add_gateway`, pinned at commit `1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a` (`box fix`, committed 2026-07-28). It is an evidence-first reconstruction of the checked-out tree, not a description of the repository's other directories or of an unobserved deployment.

## Reading order

1. [Scope and method](00-analysis-scope.md)
2. [Complete inventory](01-repository-inventory.md)
3. [Executive overview](02-executive-overview.md)
4. [Architecture](03-architecture.md)
5. [Runtime entry points](04-runtime-entry-points.md)
6. [Feature catalog and traceability](05-feature-catalog.md)
7. [Module and file reference](06-module-and-file-reference.md)
8. [Symbol reference](07-symbol-reference/README.md)
9. [Repository-wide data dictionary](08-data-dictionary.md)
10. [Data models and storage](09-data-models-and-storage.md)
11. [API and interface reference](10-api-and-interface-reference.md)
12. [Configuration reference](11-configuration-reference.md)
13. [Security model](12-security-model.md)
14. [Error and recovery model](13-error-and-recovery-model.md)
15. [Concurrency and performance](14-concurrency-and-performance.md)
16. [Build, deployment, and operations](15-build-deployment-and-operations.md)
17. [Test analysis](16-test-analysis.md)
18. [Dependencies and call graphs](17-dependency-and-call-graph.md)
19. [Documentation consistency audit](18-documentation-consistency-audit.md)
20. [Dead, legacy, and incomplete code](19-dead-legacy-and-incomplete-code.md)
21. [Open questions](20-open-questions.md)
22. [Analysis coverage](21-analysis-coverage.md)

The generated evidence ledgers are deliberately more exhaustive than the narrative:

- [Every tracked file](06-file-reference/README.md)
- [Every indexed symbol](07-symbol-reference/README.md)
- [Active Python HTTP/WebSocket interfaces](evidence/active-interface-registry.md)
- [Rust Axum interfaces](evidence/rust-interface-registry.md)
- [FastMCP tools and resources](evidence/mcp-tool-resource-registry.md)
- [Literal DDL](evidence/ddl-statements.md)
- [Executable environment references](evidence/executable-environment-reference.md)
- [Every Python test case](evidence/test-case-index.md)
- [Call-site ledger](evidence/complete-call-site-ledger.md)
- [Static import ledger](evidence/static-imports.md)
- [Documentation and source-comment ledgers](evidence/documentation-statement-ledger.md), [source comments](evidence/source-comment-ledger.md)

## Evidence language

- `Verified:` directly supported by the pinned source, configuration, tests, or a recorded local test run.
- `Inference:` a conclusion supported by multiple facts but not directly demonstrated at runtime.
- `Unresolved:` the checked-out subtree lacks enough evidence.
- `Contradiction:` two checked-in sources disagree.
- `Potential issue:` a concern grounded in code that still needs operational or threat-model validation.
- `Dead-code candidate:` repository-wide static searches found no caller or registration; dynamic consumers remain possible.
- `Documentation-only:` described but not located in implementation.
- `Implementation-only:` implemented but not described by the relevant checked-in documentation.

Credential values are intentionally not copied into this analysis. Where the repository contains a credential-like default, the documentation records its existence, storage, and consumers without reproducing the value.
