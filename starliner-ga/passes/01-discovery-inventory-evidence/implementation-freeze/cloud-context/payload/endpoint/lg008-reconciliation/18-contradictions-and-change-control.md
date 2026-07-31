# 18 — Contradictions and Change Control

| ID | Severity | Contradiction | Blocks | Change request |
| --- | --- | --- | --- | --- |
| CON-EP-001 | BLOCKER | Freeze candidate lacks immutable repository revision | Yes | urn:quilr:lg008:change-request:6074e966-244c-59eb-a3cc-afadb4e12be8 |
| CON-EP-002 | BLOCKER | Endpoint-only pass cannot satisfy five-profile admission | Yes | urn:quilr:lg008:change-request:87675a90-0ba3-50e1-aa25-15ef048328d8 |
| CON-EP-003 | BLOCKER | Current Starliner SourceObservation canonical identity mismatch | Yes | urn:quilr:lg008:change-request:b8bbda21-27b8-5216-9267-3b54afd9b8a3 |
| CON-EP-004 | BLOCKER | Delivery wrapper and validator mismatch | Yes | urn:quilr:lg008:change-request:6f7957a0-9fd1-5559-af9b-bf64a7c23398 |
| CON-EP-005 | BLOCKER | In-flight delivery recovery not proven | Yes | urn:quilr:lg008:change-request:5bde2304-5160-5a5b-a000-bb4d607c86fc |
| CON-EP-006 | BLOCKER | Missing per-record receipt can be treated as accepted | Yes | urn:quilr:lg008:change-request:dd42952b-ffb3-554d-86c6-ac2410b46704 |
| CON-EP-007 | BLOCKER | Endpoint adapter and Edge WAL are target-only | Yes | urn:quilr:lg008:change-request:8eaa1825-6670-5391-8888-33e10e0087fe |
| CON-EP-008 | MAJOR | Hook enforcement contract exceeds current effect | Yes | urn:quilr:lg008:change-request:a0cd250f-11c0-50fc-b67b-c340db24934b |
| CON-EP-009 | MAJOR | Proxy redaction effect is not proven | Yes | urn:quilr:lg008:change-request:217f60b4-22cd-5fea-a74a-09efcbfc493c |
| CON-EP-010 | MAJOR | Quarantine UI/action semantics exceed implementation | Yes | urn:quilr:lg008:change-request:fcf15111-9445-5808-b0a9-3176abc7d427 |
| CON-EP-011 | MAJOR | Endpoint profile contains new-capture payload kinds | Yes | urn:quilr:lg008:change-request:0e37ec92-de36-58d1-b7b6-dbf83b5e7410 |
| CON-EP-012 | MAJOR | Endpoint source field breadth exceeds curated freeze field register | Yes | urn:quilr:lg008:change-request:f5f44c8e-3f45-58cc-a3c0-b6ef8217b539 |
| CON-EP-013 | MAJOR | No active Linux endpoint implementation | Yes | urn:quilr:lg008:change-request:a1eb9353-1a2a-5063-9e1e-7f15b5deec0a |
| CON-EP-014 | MINOR | Dormant gRPC surface is incompatible and unreachable | No | urn:quilr:lg008:change-request:1f273b79-5899-5ff8-9ec9-6a7cef90fb67 |
| CON-EP-015 | BLOCKER | Frozen live storage gates not executed | Yes | urn:quilr:lg008:change-request:98cd5798-25ab-540a-aff8-6945dd05b96f |
| CON-EP-016 | MAJOR | Target UI repository/runtime not admitted | Yes | urn:quilr:lg008:change-request:3656a007-d069-5421-ace7-6f412ddb0b0d |

The principal blockers are immutable freeze authority, missing four-profile
admission, current/frozen Starliner contract mismatch, delivery validation and
recovery defects, absent endpoint Edge Runtime/WAL, new-capture snapshot/gap,
unreviewed 639-field mapping breadth, live storage gates and missing target UI
source.

Potential issues are not called vulnerabilities. Security-relevant statements
are bounded to visible code/evidence: unauthenticated/insufficiently proven
local IPC, fail-open hook/policy paths, secret/content privacy rules and
unresolved ACL/deployment evidence.
