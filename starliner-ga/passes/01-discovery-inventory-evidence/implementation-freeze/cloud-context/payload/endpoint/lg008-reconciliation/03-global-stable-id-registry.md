# 03 — Global Stable-ID Registry

The registry uses deterministic UUIDv5 IDs:

`urn:quilr:lg008:<kind>:<uuid>`

The UUID material is the fixed LG-008 namespace plus repository ID, full
revision or content revision, item kind, and canonical source locator. Display
names and line numbers are not identity inputs.

Namespace UUID: `6f7f2b17-0bb6-52f6-955b-eeb466c9270a`

| ID kind | Count |
| --- | --- |
| access-recipe | 182 |
| adapter-mapping | 639 |
| api-operation | 47 |
| capability | 31 |
| change-request | 16 |
| component | 37 |
| component-version | 37 |
| defect | 76 |
| diagnostic-signal | 16 |
| entry-point | 37 |
| event-type | 47 |
| evidence-item | 5615 |
| feature | 63 |
| field | 639 |
| file-artifact | 2 |
| health-signal | 40 |
| index | 72 |
| materializer | 3 |
| message-type | 47 |
| normalization-rule | 1 |
| persisted-artifact | 13 |
| queue | 2 |
| record-type | 66 |
| relationship-claim | 40 |
| relationship-type | 36 |
| repository | 6 |
| requirement | 1 |
| revision | 7 |
| runtime-experiment | 81 |
| source-file | 1769 |
| source-profile | 1 |
| table | 99 |
| target-contract | 74 |
| target-field | 2230 |
| topic | 1 |
| ui-fixture | 1 |
| ui-read-model | 32 |
| unresolved-evidence-item | 75 |

## Revision behavior

- Logical components/capabilities have stable logical IDs.
- `component-version` IDs bind a logical component to the pinned source
  revision.
- Current and endpoint-pinned IPC revisions remain distinct.
- The freeze uses a content-bundle revision because repository revision is
  unavailable; its status explicitly records that defect.
- No generated catalog is allowed to introduce an unregistered UUID-shaped ID.

The full registry is
[`global-id-registry.yaml`](../../lg008-endpoint/registries/global-id-registry.yaml).
