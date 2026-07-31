# Input admission report

## Gate result

| Profile | Repositories | Revisions | Files accounted | Catalog completeness | Runtime evidence | Admission |
| --- | --- | --- | ---: | --- | --- | --- |
| MCP Gateway | 1 | `1b2f2b3...` | 351/351 | Complete for pinned static dossier; central vocabularies and IDs generated | Targeted run retained; live integrations and two prior transcripts unresolved | `ACCEPTED_WITH_NONBLOCKING_EXTERNAL_BOUNDARIES` |
| Browser | 0 admitted here | none | 0 | Not evaluated in MCP-only scope | Missing | `REJECTED_INCOMPLETE` |
| Browser Backend | 0 admitted here | none | 0 | Not evaluated in MCP-only scope | Missing | `REJECTED_INCOMPLETE` |
| Endpoint | 0 admitted here | none | 0 | Not evaluated in MCP-only scope | Missing | `REJECTED_INCOMPLETE` |
| LLM Gateway | 0 admitted here | none | 0 | Not evaluated in MCP-only scope | Missing | `REJECTED_INCOMPLETE` |

## MCP artifact-class admission

| Required class | Admitted evidence |
| --- | --- |
| Source/evidence manifest | first-pass file metadata and 351 Git-object digests |
| Repository/revision manifest | pinned archaeology scope and new repository registry |
| Components and entry points | first-pass references plus 15-component/13-entry-point catalogs |
| Features and capabilities | 18-row source feature matrix and 18 capability rows |
| Events/messages/records | 20 events, 13 native records, 10 frozen messages |
| Field dictionary | 31 native fields |
| Field lineage | 31 terminal lineage edges; 20 detailed current transformations |
| Relationship claims | 12 claims |
| Persistence | nine durable artifact families plus process-local-state analysis |
| Health/diagnostics | 15 health and nine diagnostic signals |
| Authorized access | 76 recipes |
| Negative observability | 62 MCP classifications |
| Runtime notebook | three experiments, including fresh retained targeted output |
| Unresolved register | nine machine-readable items |
| Source-to-adapter | source-to-adapter/protocol/storage/API/UI mappings |
| Coverage | source, target-field, validator, and closure reports |
| Decision sheet | `LG008_OPEN` closure record |

## Admission limitations

The MCP profile admission means its pinned evidence can enter a later global
merger. It does not mean:

- every target field is supported;
- current adapter output conforms to the frozen profile;
- production reachability is proven;
- post-pin source changes are included;
- LG-008 may close.

The machine source-profile registry is
[here](../../lg008/registries/source-profile-registry.yaml).
