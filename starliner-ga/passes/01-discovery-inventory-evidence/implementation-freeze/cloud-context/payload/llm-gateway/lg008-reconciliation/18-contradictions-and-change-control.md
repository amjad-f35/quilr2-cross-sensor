# Contradictions and change control


| contradiction_id | assertion_a | assertion_b_or_contract | severity | proposed_resolution | change_request_id | closure_blocking |
| --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:defect:e7a1e643-b458-5faf-b846-760e10f96f1f | Current normative binding revision is stale | Binding says 7bbbb8e6; admitted source is 92b0462c583b908f8ce0cadd1bc89d2e702f5a7d | MAJOR | Update binding evidence pin after review | urn:quilr:lg008:change-request:34761a11-04fb-5043-9b90-1c75140589be | BLOCKER |
| urn:quilr:lg008:defect:f2b87693-798e-50ee-a62e-909eb8a4be05 | No current Starliner outbox/ack boundary | Frozen DIE-REQ-020/028 require sidecar WAL; current SQLite/NATS paths are not that boundary | BLOCKER | Implement and certify Starliner outbox | urn:quilr:lg008:change-request:b809b83d-c894-52d6-823d-2f3d4d57690b | BLOCKER |
| urn:quilr:lg008:defect:f8d92a99-bbb8-5934-9149-95a314a4f1a7 | Ordinary evidence privacy conflicts with Axis content | DIE-REQ-027 prohibits prompt/response ordinary evidence; current Axis shape includes original_prompt/final_prompt | BLOCKER | Privacy gate and evidence-reference split | urn:quilr:lg008:change-request:603dd1eb-255f-5422-a8a7-bb203a383e68 | BLOCKER |
| urn:quilr:lg008:defect:5895e613-f2b4-5fcc-bdd0-cf1abb2a01b4 | API key fingerprint identity semantics conflict | Frozen source profile says API keys are never identifiers; sensor dossier proposed api_key_hash as a credential fingerprint candidate | MAJOR | Classify only as credential metadata, never entity identity | urn:quilr:lg008:change-request:00ef5be8-54b9-560a-b3b1-15af84c043d7 | BLOCKER |
| urn:quilr:lg008:defect:f9937f87-7452-5cf1-9c4b-f6db0de374d0 | Axis product classification is wrong | axis_logging_utils emits product=browser.extension with subProduct=llmgateway | MAJOR | Correct source product taxonomy through change control | urn:quilr:lg008:change-request:7c607003-9b71-5954-9b93-debcaf423a4f | BLOCKER |
| urn:quilr:lg008:defect:1bd47d46-5b4e-50cb-8700-8d97d2d320d9 | Provider-health implementation/test disagree | Runtime returned model-router while test requires None | MAJOR | Resolve normalization contract and implementation | urn:quilr:lg008:change-request:dab5769d-dc52-5285-ab9e-468c24dfc893 | BLOCKER |
| urn:quilr:lg008:defect:4349047a-f403-5770-8905-1af3426ea423 | Generic per-call approval is over-specified | Frozen capability mentions REQUIRE_APPROVAL; source proves configuration approval, not universal continuation protocol | MAJOR | Mark per-call approval unsupported until certified | urn:quilr:lg008:change-request:7f6478ce-aa82-585e-9864-1c2de85bab51 | BLOCKER |
| urn:quilr:lg008:defect:d061e868-05ac-5b04-af11-71235ae09e76 | Frozen artifacts lack immutable repository revision | Authority corpus is workspace-unversioned despite freeze status | BLOCKER | Commit/sign/hash a frozen release bundle | urn:quilr:lg008:change-request:b62c23bc-05cb-5ae5-a976-cf1bd59e4db9 | BLOCKER |

`Verified:` every contradiction has concrete source/frozen/runtime evidence as
applicable, a registered change request, a remediation owner, and an explicit
closure impact. No proposed resolution is treated as accepted.

The change-control package contains:

- [`change-requests.yaml`](../../lg008-llm-gateway/change-control/change-requests.yaml);
- [`defect-proposals.yaml`](../../lg008-llm-gateway/change-control/defect-proposals.yaml);
- [`requirement-reopen-proposals.yaml`](../../lg008-llm-gateway/change-control/requirement-reopen-proposals.yaml);
- [`impact-matrix.csv`](../../lg008-llm-gateway/change-control/impact-matrix.csv).
