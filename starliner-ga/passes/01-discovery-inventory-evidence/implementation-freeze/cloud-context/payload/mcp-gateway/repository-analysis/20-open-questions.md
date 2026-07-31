# Open questions

## Runtime and deployment

1. `Unresolved:` Which parent-repository or platform manifests start the workflow runner API, execution worker, retention worker, scheduler, and ClickHouse syncer in production?
2. `Unresolved:` Are gateway replicas always fixed at one, and are sticky sessions configured for OneMCP/direct SSE?
3. `Unresolved:` What backup, restore, migration rollback, disk-capacity, and corruption procedures protect the SQLite volume/artifact directory?
4. `Unresolved:` Are missing `Dockerfile.dev` and `Dockerfile.preprod` supplied on other branches or is the Jenkins mapping broken?
5. `Unresolved:` What do the external Jenkins shared-library functions test, scan, sign, deploy, or retain?

## Security and identity

6. `Unresolved:` Are all committed/default credentials replaced in every deployed environment, and have committed secrets been revoked?
7. `Unresolved:` Should external RS512 tokens enforce issuer, audience, and token-type claims in addition to signature/expiry/tenant/email?
8. `Unresolved:` Is legacy tenant/subscriber header auth still required, and which trusted proxy strips/spoof-protects those headers?
9. `Unresolved:` Is the Quilr “ghost admin” proxy behavior an approved tenant-support policy, and is its audit footprint sufficient?
10. `Unresolved:` Are OAuth token databases and memory/log databases protected by volume encryption/OS permissions and retention rules?
11. `Unresolved:` Should `/healthx` use a provisioned secret or be network-restricted, and should log-export keys be random rather than deterministically derived?
12. `Unresolved:` What egress controls prevent configured backend/OAuth/ZIA URLs from reaching forbidden internal destinations?
13. `Unresolved:` Is permissive credentialed CORS overridden in production?

## Optional/external dependencies

14. `Unresolved:` What exact `starliner_contracts` and legacy `starliner.adapters` versions satisfy the pinned ABI, and should default pytest install them or skip those tests cleanly?
15. `Unresolved:` What are the behavior and precedence of repository-root `mcp_secrets.py`, `SECRETS_PASSWORD`, and secret-file migration tools for Google Workspace?
16. `Unresolved:` Are repository-root Starliner install/validation scripts part of the supported `mcpgateway` release artifact?
17. `Unresolved:` Does `fdclient`/the embedding service guarantee behavior when the remote service is absent?

## Protocol and state

18. `Unresolved:` What is the accepted remediation for the strict xfail where duplicate cross-tenant system slugs choose an arbitrary tenant for challenge logging?
19. `Unresolved:` Is raw OneMCP OAuth-token acceptance enabled in production, and which clients require it?
20. `Unresolved:` What delivery guarantees are required for dropped background logs/notifications and the durable Starliner outbox?
21. `Unresolved:` How should sessions/confirmations/OAuth refresh locks migrate to distributed state if horizontal scaling is required?
22. `Unresolved:` Are OAuth access/refresh columns intentionally plaintext despite their names, and is an at-rest migration planned?

## Tests and operations

23. `Unresolved:` Should tokenizer data be bundled/pre-cached so token-saving works without first-use internet access?
24. `Unresolved:` Should top-level tests move under configured `testpaths` or receive a separate CI job?
25. `Unresolved:` What is the intended fix/split for `services/onemcp_client_apps.py` exceeding 1,100 lines?
26. `Unresolved:` Is the `run_dev.sh` empty-array behavior specific to supported macOS Bash, and should the launcher be made shell-version portable?
27. `Unresolved:` Why is `bcrypt` declared while local passwords use SHA-256; is a password-hash migration intended?
28. `Unresolved:` Are Rust compilation, schema compatibility, and Python/Rust API parity tested elsewhere?

## Data/catalog

29. `Unresolved:` Who generates and consumes `backup_mcps.json`, and should it be removed, moved to `testdata`, or documented?
30. `Unresolved:` What are production retention limits for tool logs, events, rejected requests, workflow chat/runs, memories, and artifacts?
31. `Unresolved:` Are ClickHouse destination tables replicated/deduplicated operationally, and what recovery handles a crash between SQLite read and ClickHouse insert?
32. `Unresolved:` Are default catalog endpoints/credentials expected to be environment-specific rather than embedded constants?

## Evidence needed to close these questions

The missing evidence is primarily parent-repository files, private package source, deployment manifests/effective environment, live service contracts, CI job history, database snapshots, and threat-model/operational policy. None can be inferred safely from this subtree alone.
