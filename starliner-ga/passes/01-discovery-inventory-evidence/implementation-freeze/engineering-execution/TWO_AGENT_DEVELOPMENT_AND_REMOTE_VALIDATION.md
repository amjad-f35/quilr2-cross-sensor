# Development and Optional Exact-SHA Remote Validation

Remote validation is a parallel evidence lane. It is mandatory only for the
release catalog rows that require that environment; it is never a prerequisite
for continued product implementation or local integration. A shared
operational host that cannot provide isolation is read-only observation, not a
validation target.

## Ownership

| Responsibility | Developer agent | Remote Ubuntu validation agent |
|---|---|---|
| Edit production code | yes | no |
| Write feature branch | sole owner | no |
| Run focused/local suites | yes | optional reproduction only |
| Push candidate SHA | yes | no |
| Build/deploy exact candidate in an available isolated environment | optional | yes |
| Run server/native/runtime suites | consumes result | yes |
| Commit fixes | yes | no |
| Record remote evidence | reviews | yes |
| Integrate accepted branch | developer/repository workflow | no |

## Candidate handoff

The developer provides a machine-readable candidate packet:

```yaml
work_item_id: DIE-WP05-LLM
repository: quilrbusiness/macrodata-refinement
branch: feat/DIE-WP05-llm-normalizer
commit_sha: <40-hex>
authority_commit: <40-hex>
contract_digest: sha256:<64-hex>
artifact_digest: sha256:<64-hex>
configuration_digest: sha256:<64-hex>
required_suites:
  - <catalog IDs>
environment: remote-dev/<isolated namespace>
```

No handoff says “test the latest branch.”

## Remote procedure

```text
receive candidate
→ fetch repository
→ clean detached checkout at exact SHA
→ verify locks/toolchains
→ build or resolve digest-bound artifact
→ deploy isolated namespace/cell
→ run declared gates
→ collect logs/metrics/traces/results
→ hash evidence bundle
→ append remote validation row
→ return pass/fail/blocked
→ tear down/reset
```

The environment may host real sensor runtimes, but tests use authorized
synthetic/sanitized inputs and never production/customer data. Credentials are
environment-managed and never enter Git or evidence.

## Failure protocol

When a qualified environment is available, the remote agent records:

- exact SHA and artifact/configuration digests;
- first failing invariant and all required suite results;
- command, timestamp, environment version and evidence path;
- whether the failure is code, test, environment or unresolved;
- smallest reproducible local or remote command.

It does not patch the remote checkout. The developer fixes the same active
work-item branch, commits a new SHA and sends a new candidate. Both failed and
passing evidence remain append-only.

## Success protocol

A remote pass advances only that candidate's evidence axis. The developer:

1. confirms the returned SHA/digests equal the pushed candidate;
2. links evidence in durable state and, if one exists, the PR;
3. reruns any locally required generated-drift or merge-base checks;
4. continues the product item or requests review when the repository workflow
   calls for it;
5. never amends the verified commit without invalidating the result.

## Remote environment hygiene

- Use isolated namespaces, databases/buckets or tenant fixtures.
- Keep environment bootstrap and teardown in versioned automation.
- Pin container images and toolchains.
- Do not install untracked fixes directly on the host.
- Do not reuse mutable volumes across tests unless the test explicitly covers
  upgrade/recovery.
- Record server kernel, architecture, database/provider versions and relevant
  feature flags.
- Keep evidence outside ephemeral pod/container filesystems.
- Use leases/locks so two validation agents cannot mutate the same environment.

## Continuous operation

The two agents may work concurrently:

```text
remote validates candidate N
while developer prepares candidate N+1 locally
```

Candidate N+1 cannot inherit N's pass. If N fails, the developer decides
whether N+1 already contains the fix; the remote agent still validates N+1 as a
new immutable candidate.

If the remote environment is unavailable or unsafe, record
`EXTERNAL_INFRASTRUCTURE` for the affected evidence lane and continue every
independent implementation activity. Never deploy an untracked fix on a shared
host merely to obtain a green result.
