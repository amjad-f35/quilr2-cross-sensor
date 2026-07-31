# Proposed reconciliation diffs


| reconciliation_diff_id | current_contract | source_truth | proposed_change | classification | owner | closure_blocking |
| --- | --- | --- | --- | --- | --- | --- |
| urn:quilr:lg008:reconciliation-diff:8a2fa31e-b17d-5de9-b9eb-52761460e391 | Binding says 7bbbb8e6; admitted source is 92b0462c583b908f8ce0cadd1bc89d2e702f5a7d | Current normative binding revision is stale | Update binding evidence pin after review | CLARIFICATION_ONLY | program_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:baff1009-b644-5a05-8721-bc99bfb19971 | Frozen DIE-REQ-020/028 require sidecar WAL; current SQLite/NATS paths are not that boundary | No current Starliner outbox/ack boundary | Implement and certify Starliner outbox | OPEN_DEFECT | edge_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:52bf19cb-7f0e-5254-846b-57b51d4f9f7b | DIE-REQ-027 prohibits prompt/response ordinary evidence; current Axis shape includes original_prompt/final_prompt | Ordinary evidence privacy conflicts with Axis content | Privacy gate and evidence-reference split | OPEN_DEFECT | privacy_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:72921a1a-fba1-59dc-aeba-191c83897e7e | Frozen source profile says API keys are never identifiers; sensor dossier proposed api_key_hash as a credential fingerprint candidate | API key fingerprint identity semantics conflict | Classify only as credential metadata, never entity identity | CLARIFICATION_ONLY | data_identity_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:55e62bcc-a7e8-5e6e-b240-42e870bb67e1 | axis_logging_utils emits product=browser.extension with subProduct=llmgateway | Axis product classification is wrong | Correct source product taxonomy through change control | CLARIFICATION_ONLY | llm_gateway_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:457bd336-d9c8-58a1-ac1a-04ceca68edf9 | Runtime returned model-router while test requires None | Provider-health implementation/test disagree | Resolve normalization contract and implementation | CLARIFICATION_ONLY | quality_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:8c76109a-a469-5423-acd3-a986d8ece82e | Frozen capability mentions REQUIRE_APPROVAL; source proves configuration approval, not universal continuation protocol | Generic per-call approval is over-specified | Mark per-call approval unsupported until certified | CLARIFICATION_ONLY | policy_lead | BLOCKER |
| urn:quilr:lg008:reconciliation-diff:5e66a4f7-4f61-5572-9874-486ff31ff28c | Authority corpus is workspace-unversioned despite freeze status | Frozen artifacts lack immutable repository revision | Commit/sign/hash a frozen release bundle | OPEN_DEFECT | release_lead | BLOCKER |

All diffs are `PROPOSED_NOT_ACCEPTED`. None was written into the frozen
artifacts. Every diff names affected requirements/defects, concrete evidence
IDs, downstream compatibility surfaces, tests/fixtures, rollout effect, owner,
approval requirement, and closure impact.

Machine file:
[`reconciliation-diffs.yaml`](../../lg008-llm-gateway/reconciliation/reconciliation-diffs.yaml).
