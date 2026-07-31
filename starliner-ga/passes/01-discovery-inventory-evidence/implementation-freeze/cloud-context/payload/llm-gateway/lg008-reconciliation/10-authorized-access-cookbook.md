# Authorized-access cookbook


Recipes: **1,199**.

| Access mode | Recipes |
| --- | --- |
| NO_CURRENT_ACCESS_PATH | 14 |
| SAFE_LOCAL_RUNTIME | 1185 |

Every source blob, admitted analysis artifact, and native record has a recipe.
Source recipes hash the pinned Git object without printing it. Analysis recipes
hash the retained generated artifact. Live record paths use
`NO_CURRENT_ACCESS_PATH` because exact deployment authorization and object names
were not established.

`Verified:` recipes contain roles, permissions, entitlements, credential type
without credential values, privacy constraints, expected results, evidence,
reachability, owner, and rationale where required. Secret-like assignments are
mechanically rejected.

Cookbook: [`authorized-access-recipes.yaml`](../../lg008-llm-gateway/catalogs/authorized-access-recipes.yaml).
