# 44. Identity golden scenarios

## Test contract

Every scenario must prove:

1. tenant isolation;
2. preservation of raw/source observations;
3. stable canonical lineage;
4. namespaced identifiers and claim-level authority;
5. separate assurance and resolver confidence;
6. bitemporal state/relationships;
7. reversible resolution;
8. no authority expansion;
9. immutable artifact identity where applicable;
10. complete event-time actor, decision, sensor, and evidence reconstruction.

The executable scenario catalog, invariants, required events/evidence, and acceptance result are in [identity-golden-scenarios.csv](matrices/identity-golden-scenarios.csv).

## Human identity

1. Employee changes email but remains the same person.
2. Old email is later assigned to a different person.
3. Employee moves departments.
4. Employee leaves and is rehired.
5. One person has Okta, Entra, GitHub, Slack, and Google identities.
6. Pairwise OIDC subjects differ across clients.
7. Contractor becomes employee.
8. Guest account loses its sponsor.

Expected: person, employment, accounts, aliases, memberships, and sessions remain separate; event-time identity does not change when aliases move.

## Application identity

9. Claude appears through browser, endpoint, LLM Gateway, and MCP Gateway.
10. Claude Web and Claude Desktop remain distinct surfaces.
11. Personal Claude account remains distinct from enterprise Claude account.
12. Product is renamed.
13. Application changes domain.
14. Two applications have nearly identical names.
15. One desktop process embeds several AI products.

Expected: one catalog product may relate to several surfaces/accounts/installations while weak names/domains/processes cannot create destructive merges.

## Agent identity

16. Same agent definition receives a new version.
17. Same version is deployed in test and production.
18. Same runtime hosts several agents.
19. Agent runtime restarts with a new instance identity.
20. Agent artifact differs from approved deployment.
21. Child agent receives attenuated authority.
22. Child agent attempts to expand authority.
23. Agent runs without a human initiator.
24. Agent runs from a scheduled workflow.
25. Agent is retired but still observed.

Expected: definition, version, deployment, workload, instance, run, initiator, grant, credential, and artifact remain independently identifiable. Scenario 22 must deny issuance/execution.

## Model identity

26. Model alias changes its underlying version.
27. Same model version exists in several regions.
28. Same model artifact is served by several workloads.
29. Same source model is quantized differently.
30. LoRA adapter changes while base weights remain the same.
31. Remote provider exposes a model name but no weights digest.
32. Agent silently changes provider through routing.

Expected: aliases resolve by valid time; version/artifact/deployment/endpoint/workload remain separate; no invented provider weight digest.

## Workload identity

33. SPIFFE or equivalent credential rotates without changing logical workload.
34. Workload moves to a new node.
35. Workload identity is valid but artifact digest is wrong.
36. Shared worker pool executes several agent versions.
37. Node attestation fails.
38. Federation trust bundle changes.
39. Production and development trust domains remain separate.

Expected: logical workload survives credential/instance rotation while runtime proof is revalidated. Scenarios 35 and 37 fail the sensitive action despite a recognizable logical identity.

## Credentials and secrets

40. API key rotates.
41. Same secret is copied into two systems.
42. Access token expires during a run.
43. Refresh token is revoked.
44. DPoP-bound token is replayed without its private key.
45. Shared credential is used by several agents.
46. Credential remains active after agent retirement.
47. Key ID is reused by another issuer.

Expected: secret record/version, credential, token, key, grant, owner, and consumer remain separate. Raw secret values never enter inventory. Issuer namespaces `kid`; replay/retirement/revocation findings activate.

## Source and artifacts

48. Same Git commit produces two different artifact digests.
49. Different commits produce the same source tree.
50. Image tag points to a new digest.
51. Git SHA-1 and SHA-256 representations must be distinguished.
52. SWHID exists for source but not for the built artifact.
53. Artifact signature is valid but signer is not authorized.
54. Artifact is signed and approved but a different digest is deployed.
55. Build provenance references the wrong source revision.
56. Release includes several platform-specific images.

Expected: algorithm/object/repository-qualified source identity, build inputs, artifact digests, signer authorization, release manifests, deployments, and runtime verification remain distinct. Valid cryptography cannot override a failed trust/deployment policy.

## Resolution

57. Two identities are automatically merged from a strong provider ID.
58. Weak name match creates a candidate only.
59. Operator marks two candidates as not the same.
60. Previous merge is reversed.
61. One identity is split into personal and enterprise accounts.
62. Source observation arrives after retirement.
63. Entity reappears under a new alias.
64. Conflicting authoritative sources report different owners.

Expected: source observations persist, negative matches constrain future rules, merges redirect rather than erase, splits are auditable, reappearance does not restore revoked authority, and authoritative conflicts remain visible.

## Attribution

65. Human initiates an agent run that calls a child agent.
66. Child agent calls a tool using a scoped credential.
67. Approval is granted by a second human.
68. Workload executes the action.
69. Sensor observes the action.
70. Decision service records the policy decision.
71. Evidence reconstructs the complete actor chain.

Expected complete chain:

```text
human initiator/session
→ parent agent definition/version/deployment/run
→ attenuated child agent/run
→ runtime workload/instance/artifact
→ effective principal/grant/credential
→ approver
→ policy version/decision
→ tool/server/resource action
→ sensor/enforcement observation
→ immutable evidence
```

## Test execution

For each scenario:

1. seed authoritative/source observations and source health;
2. run the exact resolver/materializer/policy versions;
3. assert canonical IDs, identifiers, claims, states, and relationships;
4. replay duplicated and out-of-order events;
5. test stale/deletion/reappearance and cross-tenant negatives;
6. assert findings, owner/actions, metrics, and evidence snapshots;
7. rebuild projections from the observation/operational ledgers;
8. compare results byte-for-byte except approved nondeterministic timestamps/IDs.

The final design checklist is [identity-validation.csv](matrices/identity-validation.csv). Passing documentation validation does not claim production implementation; the migration exit requires these scenarios to pass against deployed services and real integrations.

