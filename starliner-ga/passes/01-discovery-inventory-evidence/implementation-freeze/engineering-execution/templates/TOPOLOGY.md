# Implemented Topology

This records what the repository actually implements at the current commit. It
does not redefine the frozen architecture.

## Repository and release

| Field | Value |
|---|---|
| Repository | `UNASSIGNED` |
| Commit | `UNASSIGNED` |
| Release manifest | `NONE` |
| Generated contract digest | `UNASSIGNED` |
| Runtime manifest | `NONE` |
| Runtime mode | `NONE` |
| Highest coherent product stage | `NONE` |

## Modules

| Module | Path | Authority owned | Inputs | Outputs | Stores/ports | Runtime role | Status |
|---|---|---|---|---|---|---|---|
| example | `UNASSIGNED` | none | none | none | none | none | planned |

## Runtime roles and artifacts

| Role | Entry point | Image/artifact | Credentials | Work lanes/partitions | Health/SLO | Deployment |
|---|---|---|---|---|---|---|
| example | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` |

## Persistence and transport

| Store/transport | Authority or projection | Writers | Readers | Schema/migration | Consistency/rebuild |
|---|---|---|---|---|---|
| example | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` |

## Contract generation

| Authority input | Generator | Generated paths | Drift check |
|---|---|---|---|
| example | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` |

## External repository seams

| Repository | Direction | Contract | Version/digest | Owner |
|---|---|---|---|---|
| example | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` | `UNASSIGNED` |

## Environments

Do not store secrets, customer identifiers or credentials here.

| Environment | Purpose | Deployment mechanism | Evidence location |
|---|---|---|---|
| local | focused development | `UNASSIGNED` | `UNASSIGNED` |
| remote-dev | exact-SHA validation | `UNASSIGNED` | `UNASSIGNED` |

## Product and harness separation

| Path | Classification | Production reachable | Counts as product capability | Removal/guard |
|---|---|---|---|---|
| example | `diagnostic_harness` | no | no | `UNASSIGNED` |

Allowed classifications are `production`, `external_boundary_stub`,
`diagnostic_harness` and `legacy`. An internal Quilr product component cannot
be replaced by an external-boundary stub. Every integrated product claim binds
one runtime manifest and excludes diagnostic/legacy reachability.

## Known implementation debt

Track only verified implementation debt with a work-item ID. Architecture gaps
belong in the frozen decision/risk registers; speculative TODOs do not belong
here.
