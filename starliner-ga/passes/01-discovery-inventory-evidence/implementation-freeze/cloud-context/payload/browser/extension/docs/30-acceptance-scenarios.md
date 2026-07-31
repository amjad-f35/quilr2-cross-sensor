# Acceptance Scenarios

**Analysis status:** Complete for the pinned source scope.  
**Evidence rule:** Current-behavior statements use the mission labels; target behavior is `Proposed`.  
**Purpose:** Specify complete sensor-to-adapter-to-Starliner behavior for normal, adverse, offline and control paths.


| Scenario | Input | Expected sensor/adapter behavior | Expected platform result |
| --- | --- | --- | --- |
| Normal browser visit | Verified VisitCheck fixture | Version, identify, minimize, enqueue, deliver | One activity; retry is duplicate |
| Minimal valid record | Minimum EventLogRequest | Accept only if required native/tenant/instance fields present | Safe activity or observation |
| Invalid record | Missing check/application | Reject/quarantine without poisoning queue | Health/error evidence, no entity |
| Duplicate | Same idempotency key twice | Reuse envelope/key | accepted then duplicate; one materialization |
| Out of order | prompt response before request | Deliver independently with occurred times | Correlate later, no false ordering |
| Late heartbeat | Old occurred time, current receipt | Preserve both | Health shows late source, not current activity |
| Sensitive prompt | Raw text/detections | Raw text excluded from safe summary/body or externalized | Restricted evidence ref only |
| Redacted prompt | Original/final/detections | Separate detector, decision and effect | Activity plus action evidence |
| Offline browser | Network unavailable/restart | Durable enqueue survives restart and retries | Event accepted once |
| Replayed batch | Previously accepted records | Stable IDs/keys | Duplicate results; no duplicate findings |
| Mixed upload files | success/error/reordered native results | Join by stable file element ID | Correct detection per file |
| Unsupported schema | New native version | Quarantine and emit health | No silent best-effort mapping |
| Partial batch acceptance | Some valid/some invalid | Mark statuses per record | Retry only retryable records |
| Native action acknowledgement | Action queued | Record acknowledged only | No effect claimed |
| Enforcement success | Matching result/effect ID | Record executed/effect confirmed | Action timeline complete |
| Enforcement failure | Handler error/no effect | Record failed with evidence | No success claim |
| Linux clipboard | Linux manifest | Declare unsupported | Coverage gap, not zero activity |
| Missing expected native host | Browser heartbeat but no native component | Emit degraded compound health | Coverage finding after grace |
| Extension discovery failure | Batch endpoint down | Durable queue inventory batch | Later accepted without loss |
| Pod kill before heartbeat flush | Accepted heartbeat | Durable/shared pre-publish state | Batch survives restart |
| Secret canary | Token/password/header in input | Redactor/log filters remove from logs/envelopes | Canary absent everywhere except approved vault |

Fixture files covering these classes are under the fixture directory. Every
fixture declares whether it is repository test data, generated from verified
schema, runtime captured, or a proposed target fixture.
