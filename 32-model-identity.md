# 32. Model identity

## Required layers

```text
Model Provider
→ Model Family
→ Model Version / Snapshot
→ optional Model Artifact
→ configuration / fine-tune / adapter / quantized variant
→ Model Deployment
→ Serving Endpoint
→ Model Route / Alias
→ Model-serving Workload
→ Invocation
```

## Current state

The gateway provides provider, model/deployment/endpoint/route, request, usage, outcome, and sometimes cost/account context. Endpoint discovery can add model candidates. These fields are valuable observations, but their identifier stability depends on provider/configuration semantics. A route such as `latest`, `production`, or `preferred-model` is mutable.

Current repository evidence does not establish a canonical cross-provider model identity, a universal model-registry revision, a model-weight digest, or a workload binding for provider-hosted models.

## Provider-hosted models

Store only verifiable/provider-exposed identity:

```text
provider canonical ID
provider account/tenant
provider-native model ID
snapshot/version ID if exposed
deployment/endpoint/region
API version
provider request ID
data-handling tier
route/alias and resolution interval
```

Do not invent a weights digest or internal provider workload identity. Provider assertions have `provider_claim` assurance unless stronger externally verifiable proof exists.

## Self-hosted models

Create a deterministic model manifest covering:

- registry/repository revision;
- every weight shard and its digest;
- tokenizer and configuration;
- quantization parameters;
- adapter/LoRA digests;
- license;
- container image/runtime version;
- evaluation/certification references.

The model artifact identity is the digest of the canonical manifest, not the model name or directory.

## Route resolution

Every invocation records:

```text
observed alias
resolved model version
resolved deployment/endpoint
provider account
valid_from / valid_until
routing policy
resolver version
```

If the provider silently changes a model behind an unchanged alias and exposes no snapshot, the version remains `provider_unresolved`; Quilr records the alias and provider evidence without claiming immutable identity.

## Deployment and serving workload

For self-hosted models:

```text
model artifact
→ deployment
→ endpoint
→ serving workload
→ runtime instance
```

Bind the workload identity to model artifact, image digest, runtime configuration, tenant/environment, and deployment. For remote provider models, the provider endpoint/account is the externally visible execution boundary.

## Variant rules

- Same base weights plus different quantization is a distinct model version/artifact.
- Same base plus different adapter is a distinct behavior version.
- Same version in different region/endpoints creates distinct deployments.
- Same artifact served by several workloads creates several runtime relationships, not several artifacts.
- Model provider/family similarity never merges across incompatible provider-native IDs.

The complete contract is [model-identity.schema.json](schemas/model-identity.schema.json). Current and target identifier treatment is in [identity-types.csv](matrices/identity-types.csv) and [artifact-identifiers.csv](matrices/artifact-identifiers.csv).

## Findings enabled

Target materializers detect:

- unresolved invocation alias;
- unapproved agent model change;
- endpoint without provider account;
- unowned deployment;
- self-hosted weights without digest;
- unknown tokenizer/adapter;
- unidentified serving workload;
- provider model ID conflict across sources.

All are specified in [identity-findings.csv](matrices/identity-findings.csv).

