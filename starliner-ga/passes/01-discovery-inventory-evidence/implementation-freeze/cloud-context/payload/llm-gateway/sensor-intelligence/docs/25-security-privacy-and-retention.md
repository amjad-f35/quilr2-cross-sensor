# Security, privacy, and retention


| datum | sensitivity | required | minimization | local_processing | retention | customer_visibility | platform_disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original_prompt/final_prompt | Prompt content; may contain PII/PHI/secrets/source code | Only for evidence where policy permits | metadata/digest/classification can substitute by default | Yes | Unresolved production policy | Restricted evidence drill-down | Raw-only retention/EvidenceReference |
| provider response text | Customer/model content | Detector/evidence paths only | store classifications/digest unless investigation policy requires content | Yes | Unresolved | Restricted evidence | Raw-only retention |
| user_email/user_id/JWT claims | Identity/PII | Attribution | normalize identifier candidates; avoid full JWT | Yes | Align identity/event retention | Entity/activity where authorized | Identifier candidate |
| api_key/provider credentials | Secrets | Runtime routing only | never emit raw; hash/key ID only | Required | Encrypted runtime store per source; production details unresolved | Never raw | Discard secret; preserve metadata |
| tool arguments/results | Potential secrets/customer data | Only supported safety/evidence use | structured metadata/digest and selective evidence | Partially | Unresolved | Restricted evidence | EvidenceReference/raw-only |
| request/trace/context IDs | Correlation metadata | Yes | preserve namespace and source | Yes | event/evidence lifetime | drill-down | Identifier/correlation |

Tenant context exists in keys/logs/Axis records but a future adapter must bind
it to authenticated sensor identity at capture, outbox, transport and ingest.
Credential values are runtime-only: documentation and telemetry preserve only
hashes/IDs/metadata. Production retention, backup, deletion and data-residency
policy remain unresolved from the checked-in source.
