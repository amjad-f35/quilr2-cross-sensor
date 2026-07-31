# Quilr repository analysis

This documentation is a code-evidence-led archaeology of:

- `quilrbusiness/quilr-query-builder`
- `quilrbusiness/quilr-web`

The analysis is pinned to exact commits recorded in [00-analysis-scope.md](00-analysis-scope.md). Evidence language is deliberate:

- **Verified:** directly supported by repository source, configuration, tests, or generated/runtime artifacts.
- **Inference:** strongly suggested, but not directly demonstrated.
- **Unresolved:** evidence is insufficient.
- **Contradiction:** repository evidence disagrees.
- **Potential issue:** behavior deserves validation but is not conclusively defective.
- **Dead-code candidate:** no caller/registration was found after the documented search.
- **Documentation-only:** described but no implementation was found.
- **Implementation-only:** implemented but not described in repository documentation.

## Documentation map

1. [Analysis scope and method](00-analysis-scope.md)
2. [Repository inventory](01-repository-inventory.md)
3. [Executive overview](02-executive-overview.md)
4. [Architecture](03-architecture.md)
5. [Runtime entry points](04-runtime-entry-points.md)
6. [Feature catalog](05-feature-catalog.md)
7. [Module and file reference](06-module-and-file-reference.md)
8. [Symbol reference](07-symbol-reference/README.md)
9. [Data dictionary](08-data-dictionary.md)
10. [Data models and storage](09-data-models-and-storage.md)
11. [API and interface reference](10-api-and-interface-reference.md)
12. [Configuration reference](11-configuration-reference.md)
13. [Security model](12-security-model.md)
14. [Error and recovery model](13-error-and-recovery-model.md)
15. [Concurrency and performance](14-concurrency-and-performance.md)
16. [Build, deployment, and operations](15-build-deployment-and-operations.md)
17. [Test analysis](16-test-analysis.md)
18. [Dependency and call graph](17-dependency-and-call-graph.md)
19. [Documentation consistency audit](18-documentation-consistency-audit.md)
20. [Dead, legacy, and incomplete code](19-dead-legacy-and-incomplete-code.md)
21. [Open questions](20-open-questions.md)
22. [Analysis coverage](21-analysis-coverage.md)
23. [Dynamic verification and external-evidence addendum](22-dynamic-verification.md)
24. [Durable continuation state](ANALYSIS_STATE.md)

## Coverage snapshot

- 2,903/2,903 tracked files classified and accounted for.
- 312/312 Java files and 2,439/2,439 TypeScript/JavaScript modules parsed with zero errors.
- 36,010 source declarations documented.
- 141 backend HTTP operations, 59 backend lifecycle hooks, 112 frontend pages, 20 layouts, and two Next route-handler operations verified.
- 120 frontend query-builder syntax occurrences traced; 71 of 77 normalized candidates match a compatible backend route.
- 124 Markdown deliverables totaling 519,445 lines (approximately 45 MiB) preserve both source-level evidence and semantic narratives.
- Final local-link audit scanned 210 Markdown links and found zero missing or malformed local targets.

The static analysis at the pinned commits is complete. Clean builds, local application starts, live HTTP/browser probes, a 17-test Java/Redis harness, exact CI-run inspection, supporting dependency source, BFF/ingress routing, migration DDL, and deployment charts are now included. Remaining questions require a real service/data/cluster estate rather than unprocessed target files. See [dynamic verification](22-dynamic-verification.md), [analysis coverage](21-analysis-coverage.md), and [open questions](20-open-questions.md).
