# Better Console Analysis

Everything produced specifically for the newer Quilr1 / Better Console implementation is contained under this folder.

## Start here

- Repository archaeology: [`better-console-backend-analysis/README.md`](better-console-backend-analysis/README.md)
- Platform/sensor intelligence: [`docs/sensor-intelligence/better-console-backend/README.md`](docs/sensor-intelligence/better-console-backend/README.md)
- Analysis coverage: [`better-console-backend-analysis/21-analysis-coverage.md`](better-console-backend-analysis/21-analysis-coverage.md)
- Dynamic verification: [`docs/sensor-intelligence/better-console-backend/26-runtime-verification.md`](docs/sensor-intelligence/better-console-backend/26-runtime-verification.md)

## Folder map

| Folder | Contents |
| --- | --- |
| `better-console-backend-analysis/` | Deep repository archaeology, inventories, generated indexes, and symbol references |
| `docs/sensor-intelligence/better-console-backend/` | Better Console platform intelligence dossier |
| `matrices/sensor-intelligence/better-console-backend/` | Machine-readable catalogs and traceability matrices |
| `schemas/sensor-intelligence/better-console-backend/` | Generated integration schemas |
| `fixtures/sensor-intelligence/better-console-backend/` | Integration fixture families |
| `work/quilr-ai-config-manager/` | Pinned source worktree containing `better-console-backend` |
| `work/quilr-design-system/` | Pinned frontend design-system dependency used for the verified build |
| `work/*.mjs` | Inventory and documentation generation scripts |
| `archives/` | Portable analysis-only ZIP; source worktrees and build caches remain in this folder but are excluded from the ZIP |

## Pinned repositories

- `quilrbusiness/quilr-ai-config-manager@68132e67d0b494d52aac01a1ad811c03faf21550`
- target path: `better-console-backend`
- `quilrbusiness/quilr-design-system@2fc373cadd43322c47d50750a946e7eb70664374`

Cross-generation LG-008 reconciliation is stored in the sibling `Quilr1-Platform-Analysis/` folder.
