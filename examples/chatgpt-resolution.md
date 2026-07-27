# ChatGPT web versus OpenAI API

| Observation | Object |
| --- | --- |
| Browser visit to verified ChatGPT origin | ChatGPT Web surface and usage event |
| Desktop app bundle/signature | ChatGPT Desktop surface/installation |
| OpenAI API key/organization/project | Credential, provider account/integration, and OpenAI API surface |
| Gateway `model=gpt-*` | Model Version/Deployment and invocation |
| User’s ChatGPT personal login | Separate personal Application Account |
| Enterprise ChatGPT tenant/account | Tenant Subscription and enterprise Application Account |

The catalog may connect ChatGPT Web/Desktop and OpenAI API to the same vendor/product family for navigation, but they remain separate surfaces and commercial/account boundaries. A ChatGPT account does not merge with an API organization/project. GPT model versions/deployments are related model objects, not application rows.

Strong matches: verified origins, bundle IDs/signing, provider organization/project/account IDs, provider-qualified model IDs. Weak names such as `OpenAI`, `ChatGPT`, or `GPT` never auto-merge different object types.
