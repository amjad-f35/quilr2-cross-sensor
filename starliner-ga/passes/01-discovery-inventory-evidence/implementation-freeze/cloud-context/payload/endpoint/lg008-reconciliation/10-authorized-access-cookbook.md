# 10 — Authorized-Access Cookbook

Recipes: 182 covering 182 captured,
persisted, emitted, health and diagnostic item subjects. Field access is
inherited from its record recipe.

The current endpoint exposes fragmented local files, SQLite, broker, HTTP,
logs and memory paths. No common stable tenant-authorized product access
boundary is proven for source-native records. Therefore recipes intentionally
use `NO_CURRENT_ACCESS_PATH` with:

- a non-empty rationale;
- pinned-source/sanitized-fixture reproduction only;
- `UNKNOWN_AUTHORIZATION_REQUIREMENT` where production authorization is not
  proven;
- no secrets, production systems or customer data;
- an exact evidence link and revision.

This is truthful bounded access coverage, not a claim that the future product
API is inaccessible. Frozen APIs and authorization remain target contracts
requiring implementation/runtime evidence.
