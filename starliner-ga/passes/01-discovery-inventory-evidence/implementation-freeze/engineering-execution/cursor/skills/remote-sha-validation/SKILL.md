---
name: remote-sha-validation
description: Use when validating a pushed DIE candidate on the Ubuntu dev platform or native sensor environment.
---

# Remote Exact-SHA Validation

1. Receive a work item, repository, expected branch, exact commit SHA, artifact
   digest, configuration digest, test catalog and environment target.
2. Refuse a dirty checkout. Fetch the repository, detach at the exact SHA and
   verify `git rev-parse HEAD`.
3. Build or pull only the artifact bound to that SHA. Record toolchain,
   dependency lock, image and configuration digests.
4. Deploy into an isolated namespace/cell with no production or customer data.
5. Run the required smoke, contract, integration, negative, security,
   concurrency, recovery or native certification cases. Capture commands,
   timestamps, logs, metrics and artifacts.
6. Do not fix code on the server. A failure records the exact failing SHA,
   assertion and evidence, then returns ownership to the developer agent.
7. Append one immutable row to `REMOTE_VALIDATION_LEDGER.csv` and attach the
   evidence bundle. Report pass, fail or blocked; never reinterpret absence of
   evidence as a pass.
8. Tear down or reset the isolated deployment according to the runbook.

A result proves only the exact SHA, artifact, configuration and environment
recorded. It does not automatically qualify later commits or other supported
platforms.
