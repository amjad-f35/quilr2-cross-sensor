import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const schemasDir = path.join(root, "schemas");
const matricesDir = path.join(root, "matrices");
fs.mkdirSync(schemasDir, { recursive: true });
fs.mkdirSync(matricesDir, { recursive: true });

function writeJson(name, value) {
  fs.writeFileSync(path.join(schemasDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(name, headers, rows) {
  const content = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(path.join(matricesDir, name), `${content}\n`);
}

const entityText = fs.readFileSync(path.join(schemasDir, "canonical-entities.yaml"), "utf8");
const canonicalEntities = [...entityText.matchAll(/^  - name:\s*(.+)$/gm)].map((match) => {
  const value = match[1].trim();
  return ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
    ? value.slice(1, -1)
    : value;
});
if (canonicalEntities.length !== 54) {
  throw new Error(`Expected 54 canonical entities, found ${canonicalEntities.length}`);
}

const identityExtensionEntities = [
  "Person",
  "Employment Relationship",
  "Directory Account",
  "IdP Account",
  "SaaS User Account",
  "Local Application Account",
  "Privileged Account",
  "Browser Product",
  "Browser Installation",
  "Browser Profile",
  "Browser Extension Installation",
  "Physical Hardware",
  "OS Installation",
  "Managed Device Record",
  "Cloud VM Instance",
  "Current Boot",
  "Workload Deployment",
  "Workload Instance",
  "Agent Configuration",
  "Agent Artifact",
  "Agent Session",
  "Agent Step",
  "Sub-agent",
  "Agent Account",
  "Model Artifact",
  "Model Configuration",
  "Model Fine-tune",
  "Model Adapter",
  "Model Quantized Variant",
  "Serving Endpoint",
  "Model-serving Workload",
  "MCP Server Definition",
  "MCP Server Version",
  "MCP Connection",
  "Connector Product",
  "Connector Version",
  "OAuth Client",
  "OAuth Grant",
  "Synchronization Job",
  "Source Repository",
  "Source Revision",
  "Build Invocation",
  "Build Platform",
  "Software Artifact",
  "Release",
  "Software Deployment",
  "Runtime Instance",
  "Secret Record",
  "Secret Version",
  "Authorization Grant",
  "Token",
  "Cryptographic Key",
  "Certificate",
  "Trust Anchor",
  "Federation",
  "Delegation",
  "Artifact Signature",
  "Attestation",
  "Provenance Record",
  "SBOM",
  "Policy Version",
  "Compiled Policy Bundle",
  "Policy Deployment",
  "Policy Evaluation",
];
const identityKinds = [...canonicalEntities, ...identityExtensionEntities];

const evidence = {
  quilrOverview: "quilr-platform-analysis/02-executive-overview.md",
  quilrRuntime: "quilr-platform-analysis/04-runtime-entry-points.md",
  quilrData: "quilr-platform-analysis/08-data-dictionary.md",
  quilrStorage: "quilr-platform-analysis/09-data-models-and-storage.md",
  quilrSecurity: "quilr-platform-analysis/12-security-model.md",
  quilrDeploy: "quilr-platform-analysis/15-build-deployment-and-operations.md",
  browserOverview: "Browser-extension-sensor-analysis/outputs/repository-analysis/02-executive-overview.md",
  browserData: "Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md",
  browserSecurity: "Browser-extension-sensor-analysis/outputs/repository-analysis/12-security-model.md",
  endpointOverview: "Endpoint-agent-sensor-analysis/repository-analysis/02-executive-overview.md",
  endpointData: "Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md",
  endpointSecurity: "Endpoint-agent-sensor-analysis/repository-analysis/12-security-model.md",
  gatewayOverview: "LLM-gateway-sensor-analysis/outputs/repository-analysis/02-executive-overview.md",
  gatewayData: "LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md",
  gatewaySecurity: "LLM-gateway-sensor-analysis/outputs/repository-analysis/12-security-model.md",
};

const profileRules = [
  {
    match: /Human User|^Person$|Employment Relationship|Directory Account|IdP Account|SaaS User Account|Local Application Account|Privileged Account/,
    current: "JWT/user context and email-oriented records",
    source: "Quilr auth/user context; gateway JWT/API-key owner; endpoint Persona",
    stability: "Mixed; email is mutable and reassignable",
    proof: "Token validation exists, but a cross-issuer person identity is not demonstrated",
    strong: "OIDC issuer+subject; SCIM provider+resource ID; HRIS+immutable employment ID",
    weak: "email; username; display name",
    authority: "IdP for authentication identity; HRIS for employment; explicit assignment for ownership",
    lifecycle: "pre-hire→active→mover→leave→terminated→archived→rehired",
    status: "Partially implemented",
  },
  {
    match: /Group|Organization Unit/,
    current: "Source-specific group/tenant/department labels and graph records",
    source: "IdP boundary, current graph/warehouse, gateway smart groups",
    stability: "Provider/source scoped; names mutable",
    proof: "Repository-visible mappings; authoritative IdP/HRIS contracts unresolved",
    strong: "directory issuer+object ID; HRIS organization ID",
    weak: "department name; group name",
    authority: "IdP/HRIS or organizational directory",
    lifecycle: "observed→active→renamed/moved→disabled→retired",
    status: "Partially implemented",
  },
  {
    match: /Tenant$/,
    current: "tenant ID plus subscriber context carried in tokens, headers, caches, and tables",
    source: "Quilr auth context and every sensor contract",
    stability: "Tenant scoped; provenance and cryptographic binding vary",
    proof: "Decoder validation is verified for some paths; caller-controlled tenant paths also exist",
    strong: "Quilr tenant canonical ID; provider organization/tenant IDs",
    weak: "tenant name; domain",
    authority: "Quilr tenant registry and verified issuer claims",
    lifecycle: "provisioned→active→suspended→retired",
    status: "Partially implemented",
  },
  {
    match: /Service Account|Workload Identity|Workload Deployment|Workload Instance|Model-serving Workload|Runtime Instance|Synchronization Job|Gateway|Sensor|Enforcement Point/,
    current: "Service/process names, API credentials, deployment context, or caller-supplied component IDs",
    source: "Gateway, browser, endpoint, deployment manifests",
    stability: "Mostly source/deployment scoped; runtime cryptographic identity unresolved",
    proof: "Authenticated channels vary; SPIFFE/SVID/runtime attestation not evidenced",
    strong: "SPIFFE ID; cloud workload subject; Kubernetes pod UID; certificate public-key fingerprint",
    weak: "service name; hostname; process name; deployment label",
    authority: "Workload identity authority plus orchestrator/deployment authority",
    lifecycle: "registered→attested→active→stale→revoked→retired",
    status: "Requires new telemetry",
  },
  {
    match: /Credential|Session|Secret Record|Secret Version|Authorization Grant|OAuth Grant|^Token$|Cryptographic Key|^Certificate$|Trust Anchor|^Federation$|^Delegation$/,
    current: "Bearer/JWT/API-key/cookie/session identifiers and revocation flags",
    source: "Quilr auth, gateway, BES Persona, connector boundaries",
    stability: "Credential/session scoped and intentionally rotating",
    proof: "Issuer/key/signature checks vary by path; raw bearer possession is not identity",
    strong: "issuer+credential ID; issuer+token ID; JWK thumbprint; certificate issuer+serial+fingerprint",
    weak: "key prefix; cookie name; raw token",
    authority: "Credential issuer, authorization server, secret manager",
    lifecycle: "issued→active→rotated/expired/revoked",
    status: "Partially implemented",
  },
  {
    match: /AI Product|Application Surface|Tenant Application|Application Installation|Tenant Subscription|Application Account|Browser Product/,
    current: "Application IDs, names, domains, processes, graph nodes, and source-specific account fields",
    source: "Browser/BES, endpoint, gateway, Quilr warehouse/graph, integration boundary",
    stability: "Mixed; names/domains mutable and IDs source scoped",
    proof: "Observed identifiers exist; no universal account/product proof",
    strong: "catalog product ID; provider tenant/account ID; bundle/package ID; OAuth issuer+subject",
    weak: "display name; domain alone; process filename",
    authority: "Catalog for product; provider for account; runtime sensor for activity",
    lifecycle: "candidate→observed→resolved→managed/unmanaged→stale→retired→reappeared",
    status: "Derivable now",
  },
  {
    match: /Device|Browser Instance|Browser Installation|Browser Profile|Browser Extension Installation|Endpoint Process|Application Installation|Physical Hardware|OS Installation|Managed Device Record|Cloud VM Instance|Current Boot/,
    current: "Device IDs, persona/device fields, browser/process context, PID and path",
    source: "Endpoint and browser sensors",
    stability: "Device IDs vary; PID/path/hostname are weak and mutable",
    proof: "Local observation; MDM/EDR/hardware proof not supplied",
    strong: "MDM/EDR object ID; hardware-backed ID; boot ID+PID+start time; code-signing identity+binary digest",
    weak: "hostname; MAC; PID alone; executable filename",
    authority: "MDM/EDR for device management; endpoint sensor for runtime process",
    lifecycle: "enrolled→active→reimaged/restarted→stale→retired",
    status: "Partially implemented",
  },
  {
    match: /Model Provider|Model Family|Model Version|Model Deployment|Model Route|Model Artifact|Model Configuration|Model Fine-tune|Model Adapter|Model Quantized Variant|Serving Endpoint/,
    current: "Provider/model/deployment/route strings from gateway requests and configuration",
    source: "LLM gateway/provider adapters and endpoint discovery",
    stability: "Provider IDs may be stable; aliases/routes are mutable",
    proof: "Request/provider evidence; provider-hosted weight identity usually unavailable",
    strong: "provider+account+native model snapshot/deployment ID; self-hosted manifest digest",
    weak: "model display name; latest/production alias",
    authority: "Provider API or model registry; orchestrator for deployment",
    lifecycle: "registered→approved→deployed→active→superseded→retired",
    status: "Partially implemented",
  },
  {
    match: /Agent Definition|Agent Version|Agent Deployment|Agent Runtime|Agent Run|Agent Configuration|Agent Artifact|Agent Session|Agent Step|Sub-agent|Agent Account/,
    current: "Agent/MCP labels, activity, local discovery IDs, and external gateway records",
    source: "Endpoint discovery, LLM gateway metadata, external MCP boundary",
    stability: "Logical/run IDs vary; exact version/artifact/runtime binding unresolved",
    proof: "Observed metadata only; signed deployment binding absent",
    strong: "agent canonical ID; manifest digest; deployment ID; run ID; bound workload identity",
    weak: "agent name; worker-pool identity",
    authority: "Agent registry, build/deployment authority, workload identity authority",
    lifecycle: "defined→versioned→approved→deployed→running→suspended→retired",
    status: "Requires new telemetry",
  },
  {
    match: /MCP Client|MCP Server Product|MCP Server Deployment|MCP Server Definition|MCP Server Version|MCP Connection|Tool|Tool Version|Connector|Connector Product|Connector Version|Integration Instance|Connected Account|OAuth Client/,
    current: "External MCP/connector IDs where available; names, endpoints, OAuth settings, and source-specific registrations",
    source: "External MCP gateway, integration boundary, endpoint discovery, Quilr UI/query paths",
    stability: "Source scoped; names and endpoint URIs mutable",
    proof: "Contracts are incomplete because authoritative source repositories were not supplied",
    strong: "registry/registration ID; server public key/workload ID; client ID within issuer; schema digest",
    weak: "tool name; endpoint URI; connector display name",
    authority: "MCP registry/server manifest/provider OAuth system",
    lifecycle: "registered→connected→active→changed→revoked→retired",
    status: "Requires external integration",
  },
  {
    match: /Data Asset|Data Class|Knowledge Base|Vector Index|Memory Store|Prompt Template/,
    current: "Paths, names, table/resource IDs, request attachments, index/model inputs",
    source: "Gateway, endpoint, browser, external data/catalog boundaries",
    stability: "Paths/names mutable; version/digest support uneven",
    proof: "Observed references; authoritative catalog and deletion semantics unresolved",
    strong: "provider resource ID; catalog ID; content/index/prompt-bundle digest",
    weak: "path; filename; label; URI alone",
    authority: "Data catalog/provider; build system for derived index/prompt bundle",
    lifecycle: "created→versioned→active→stale→deleted/retired",
    status: "Requires external integration",
  },
  {
    match: /Source Repository|Source Revision|Build Invocation|Build Platform|Software Artifact|^Release$|Software Deployment|Artifact Signature|^Attestation$|Provenance Record|^SBOM$/,
    current: "Git revision/build/deployment labels, tags, package/image coordinates, and analysis provenance",
    source: "Repository, build, registry, deployment, and supplied analysis evidence",
    stability: "Source objects/artifacts can be content-derived; build/release/deployment IDs are authority scoped",
    proof: "Pinned source and build paths exist; signed end-to-end provenance/runtime verification is absent or unresolved",
    strong: "forge+repository ID; full Git OID; build ID+builder; artifact digest; release/deployment native ID; attestation/signature digest",
    weak: "repository name/URL; branch/tag; package version; image tag; release display name",
    authority: "Forge, build platform, artifact registry, release authority, orchestrator, and trust-policy verifier",
    lifecycle: "observed→built/signed/verified→released→deployed→active→superseded/revoked→retired",
    status: "Requires new telemetry",
  },
  {
    match: /Policy|Control|Exception|Approval|Decision/,
    current: "Table/graph/config IDs, policy settings, approval/status/audit records",
    source: "Quilr platform, BES, endpoint governance, gateway policy/config",
    stability: "Source scoped; exact version/bundle identity is inconsistent",
    proof: "Decision/config records exist; immutable identity snapshots are not universal",
    strong: "policy canonical ID+version+bundle digest; decision/approval/exception canonical ID",
    weak: "policy name; mutable status",
    authority: "Policy/approval service and explicit owner",
    lifecycle: "draft→approved→published→effective→superseded/revoked→retired",
    status: "Partially implemented",
  },
  {
    match: /Finding|Evidence Record|Certification|Cost Record|Outcome/,
    current: "Warehouse/status/audit rows and source-specific evidence/outcome fields",
    source: "Quilr, gateway, browser/BES, endpoint",
    stability: "Record scoped; cross-source canonical IDs not universal",
    proof: "Direct records exist; historical identity snapshot and cryptographic evidence are incomplete",
    strong: "canonical record ID; evidence digest; issuer-scoped certification ID; provider cost ID",
    weak: "title; status label; timestamp-only correlation",
    authority: "Materializer or issuing source, with immutable evidence references",
    lifecycle: "created→updated→resolved/expired→reopened/retired",
    status: "Derivable now",
  },
];

function entityProfile(name) {
  const matched = profileRules.find((rule) => rule.match.test(name));
  if (matched) return matched;
  return {
    current: "Source-specific ID or label",
    source: "Current sensor/Quilr source",
    stability: "Unresolved",
    proof: "Observation only",
    strong: "Tenant-scoped provider-native ID",
    weak: "Display name",
    authority: "Field-specific source authority",
    lifecycle: "candidate→observed→resolved→active→stale→retired",
    status: "Unresolved",
  };
}

const identityTypeRows = identityKinds.map((name) => {
  const profile = entityProfile(name);
  return {
    "Entity type": name,
    "Model layer": canonicalEntities.includes(name) ? "Base canonical object model" : "Continuous identity extension",
    "Canonical ID": `entity:<uuidv7> (${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_")})`,
    "Tenant scope": name === "AI Product" || name === "Model Provider" || name === "Model Family"
      ? "Global catalog with tenant projection"
      : "Tenant required; no cross-tenant resolution",
    "Current identifier": profile.current,
    "Current source": profile.source,
    Stability: profile.stability,
    "Strong native IDs": profile.strong,
    "Weak IDs": profile.weak,
    Proof: profile.proof,
    Authority: profile.authority,
    Lifecycle: profile.lifecycle,
    "Current status": profile.status,
  };
});

writeCsv(
  "identity-types.csv",
  [
    "Entity type",
    "Model layer",
    "Canonical ID",
    "Tenant scope",
    "Current identifier",
    "Current source",
    "Stability",
    "Strong native IDs",
    "Weak IDs",
    "Proof",
    "Authority",
    "Lifecycle",
    "Current status",
  ],
  identityTypeRows,
);

const namespaces = [
  ["quilr", "Tenant canonical entity", "Tenant", "Opaque UUIDv7", "Durable database identity; not proof"],
  ["quilr-catalog", "Global catalog object", "Global", "Opaque UUIDv7", "Curated catalog authority"],
  ["oidc", "Human/account identity", "Issuer", "issuer+subject", "Strong when issuer and token are verified"],
  ["scim", "Directory resource", "Provider tenant", "provider+resource ID", "Authoritative directory record"],
  ["hris", "Person/employment", "Employer", "system+immutable worker ID", "Authoritative employment record"],
  ["saml", "Federated account", "IdP", "issuer+NameID with format/persistence policy", "Depends on IdP guarantees"],
  ["oauth-client", "OAuth client", "Authorization server", "issuer+client_id", "Registration identity"],
  ["oauth-grant", "Authorization grant", "Issuer", "issuer+grant ID", "Authority relationship"],
  ["spiffe", "Logical workload", "Trust domain", "SPIFFE URI", "Cryptographically authenticated by valid SVID"],
  ["x509", "Certificate", "Issuer", "issuer+serial+public-key fingerprint", "Validated chain and policy required"],
  ["jwk", "Public key", "Cryptographic", "RFC 7638 thumbprint+algorithm", "Content-derived public-key identifier"],
  ["kms", "Managed key version", "KMS authority", "resource URI+version", "Provider authoritative"],
  ["kubernetes", "Workload instance", "Cluster", "cluster+pod UID", "Orchestrator authoritative"],
  ["cloud-workload", "Cloud principal/instance", "Cloud account/project", "provider subject/resource ID", "Cloud issuer authoritative"],
  ["mdm", "Managed device", "MDM tenant", "provider+device object ID", "Management authority"],
  ["edr", "Observed device/process", "EDR tenant", "provider+device/process ID", "Runtime authority"],
  ["git", "Git object", "Repository/object format", "full OID+algorithm+object type", "Content-derived within Git semantics"],
  ["swhid", "Archived source object", "SWH scheme", "qualified SWHID", "Intrinsic source-object identifier"],
  ["oci", "Container artifact", "Registry/repository", "manifest/index digest+algorithm", "Content-derived"],
  ["purl", "Package coordinate", "Package ecosystem", "Package URL", "Coordinate; add content digest"],
  ["sbom", "SBOM document", "Issuer/tool", "document ID+digest", "Evidence, not artifact identity alone"],
  ["sigstore", "Signature/transparency entry", "Fulcio/Rekor or private instance", "bundle/log entry UUID+digest", "Verified against explicit trust root"],
  ["in-toto", "Attestation", "Predicate/issuer", "statement digest+subject digest", "Signed claim about subjects"],
  ["slsa", "Provenance", "Builder", "attestation ID+subject digest", "Verified build/source provenance"],
  ["provider-model", "Provider-hosted model", "Provider account", "provider+account+native model/snapshot/deployment ID", "Provider claim/API"],
  ["model-registry", "Self-hosted model artifact", "Registry", "repository revision+manifest digest", "Registry plus content proof"],
  ["mcp", "MCP registration/tool", "Registry/server", "registration ID or server ID+tool namespace+schema digest", "Server/registry claim; verify runtime separately"],
  ["saas", "SaaS tenant/account/resource", "Provider tenant", "provider+organization/account/resource ID", "Provider authoritative"],
  ["sensor", "Sensor instance", "Tenant enrollment", "deployment+instance+certificate/key ID", "Authenticated enrollment/channel"],
  ["event", "Event", "Tenant/source", "event UUIDv7+source native ID", "Authenticated source observation"],
  ["evidence", "Evidence record", "Tenant", "evidence UUIDv7+content digest", "Immutable evidence envelope"],
  ["decision", "Policy decision", "Tenant", "decision UUIDv7", "Decision service record"],
  ["finding", "Finding lineage", "Tenant", "finding UUIDv7+dedup key+generation", "Materializer authority"],
  ["secret-manager", "Secret metadata/version", "Vault/provider", "resource ID+version", "Manager authoritative; never copy value"],
];

writeCsv(
  "identifier-namespaces.csv",
  ["Namespace", "Applies to", "Scope", "Identifier construction", "Assurance or caveat"],
  namespaces.map(([Namespace, applies, Scope, construction, caveat]) => ({
    Namespace,
    "Applies to": applies,
    Scope,
    "Identifier construction": construction,
    "Assurance or caveat": caveat,
  })),
);

const strengthRows = [
  ["OIDC issuer+subject", "Strong deterministic", "Human/account", "Verified issuer and token; account-link policy still required", "Never merge on subject without issuer"],
  ["SCIM provider+resource ID", "Strong deterministic", "Human/group", "Authoritative provider record", "Provider tenant required"],
  ["HRIS+immutable employment ID", "Strong deterministic", "Person/employment", "Authoritative employment record", "Rehire semantics must be explicit"],
  ["Provider organization/account ID", "Strong deterministic", "Tenant/application account", "Provider API", "Provider namespace required"],
  ["SPIFFE ID+valid SVID", "Strong cryptographic", "Logical workload", "Trust-domain bundle and SVID validation", "Logical workload, not runtime instance or artifact"],
  ["Kubernetes cluster+pod UID", "Strong runtime", "Workload instance", "Orchestrator record", "Ephemeral by design"],
  ["Cloud workload subject", "Strong cryptographic", "Workload principal", "Verified cloud issuer token", "Audience and environment required"],
  ["Device MDM/EDR ID", "Strong deterministic", "Managed device", "Provider authority", "Re-enrollment/reimage semantics required"],
  ["Full Git OID", "Content-derived", "Git object", "Algorithm, object type, repository context", "Not a build/runtime identity"],
  ["Qualified SWHID", "Content-derived", "Archived source object", "SWHID syntax/object/qualifiers", "Not universal; private-source policy required"],
  ["OCI manifest digest", "Content-derived", "Container artifact", "Registry retrieval and digest verification", "Tag is not identity"],
  ["Package digest", "Content-derived", "Package artifact", "Digest verification", "Coordinate alone is weaker"],
  ["JWK thumbprint", "Content-derived", "Public key", "Canonicalized JWK per RFC 7638", "Key identity, not owner authorization"],
  ["Certificate issuer+serial+fingerprint", "Strong cryptographic", "Certificate", "Path, time, revocation, and policy validation", "Certificate is not private-key identity by itself"],
  ["KMS resource+version", "Strong deterministic", "Managed key", "KMS authority", "Alias is mutable"],
  ["Agent manifest digest", "Content-derived", "Agent version", "Canonical manifest and digest", "Bind to source, artifact, deployment, workload"],
  ["Model manifest digest", "Content-derived", "Self-hosted model artifact", "All required weight/config/tokenizer/adapter files", "Provider-hosted models may not expose this"],
  ["Tool schema digest", "Content-derived", "Tool version", "Canonical input/output schema", "Also require server identity"],
  ["Application bundle/package ID", "Secondary", "Application surface/install", "OS/package authority", "Code signer and version strengthen match"],
  ["Verified domain", "Secondary", "Product/surface", "DNS/provider/catalog verification", "Domain can move"],
  ["Repository native ID", "Secondary", "Repository", "Forge+installation+repository ID", "URL/name can change"],
  ["Email", "Weak", "Account/person candidate", "Source assertion only", "Mutable and reassignable"],
  ["Display name", "Weak", "Any", "Claim only", "Never auto-merge alone"],
  ["Hostname", "Weak", "Device", "Runtime claim", "Mutable/reusable"],
  ["PID", "Weak", "Process", "OS observation", "Require boot ID and start time"],
  ["Process filename", "Weak", "Application/process", "Endpoint observation", "Ambiguous"],
  ["Model alias", "Weak route", "Model route", "Routing config snapshot", "Mutable; resolve at event time"],
  ["Container/image tag", "Weak route", "Artifact deployment", "Registry tag observation", "Mutable; require digest"],
  ["Tool name", "Weak", "Tool", "Server claim", "Namespace by server and schema"],
  ["API key prefix", "Weak metadata", "Credential", "Issuer-safe fragment", "Not proof of possession or full identity"],
];

writeCsv(
  "identifier-strength.csv",
  ["Identifier", "Strength class", "Entity layer", "Required context or proof", "Prohibited inference"],
  strengthRows.map(([Identifier, strength, layer, context, prohibited]) => ({
    Identifier,
    "Strength class": strength,
    "Entity layer": layer,
    "Required context or proof": context,
    "Prohibited inference": prohibited,
  })),
);

const fieldAuthorityRows = [
  ["Human employment state", "HRIS", "IdP", "Until authoritative HRIS integration, mark unresolved", "Per HRIS event/full reconciliation"],
  ["Human authentication identity", "IdP", "Quilr token/user context", "Issuer+subject only", "At authentication and issuer sync"],
  ["Group membership", "IdP/directory", "Gateway smart group or graph", "Preserve source/type; do not equate smart group with directory group", "Event/change sync plus full reconciliation"],
  ["Department/cost center", "HRIS/org directory", "Tenant/user metadata", "Names are aliases", "Joiner/mover/leaver sync"],
  ["Business ownership", "Explicit assignment", "Source owner/admin fields", "Never infer authentication from ownership", "On assignment/change and certification"],
  ["Device management state", "MDM", "Endpoint device observation", "Observation cannot prove management", "Webhook/change sync plus inventory"],
  ["Device runtime process", "Endpoint sensor", "None", "Bind device+boot+PID+start time", "Event-driven"],
  ["Browser activity", "Browser extension", "BES", "Bind installation/profile/session where possible", "Event-driven plus heartbeat"],
  ["Application product metadata", "Curated catalog", "Sensor name/domain/process", "Runtime signals create candidates", "Catalog update"],
  ["Application last used", "Runtime sensor", "Warehouse aggregation", "Use newest authenticated observation", "Continuous"],
  ["SaaS enterprise account ID", "SaaS provider", "Browser/gateway account hints", "Account type stays unknown without proof", "Provider sync/runtime observation"],
  ["Agent owner", "Explicit agent registry assignment", "Discovery metadata", "Unowned is actionable", "Assignment/certification"],
  ["Agent version", "Agent registry/build authority", "Agent label/source revision", "Require immutable manifest digest", "Build/release/deploy"],
  ["Agent artifact digest", "Build/deployment system", "Image/package labels", "Verify deployed bytes", "Build and runtime verification"],
  ["Workload identity", "SPIFFE/cloud workload authority", "Service account/process", "Credential validation plus attestation", "At connection and renewal"],
  ["Workload instance", "Orchestrator/runtime", "Host/process observation", "Use pod/instance UID", "Start/stop/heartbeat"],
  ["Model provider/native ID", "Provider API", "Gateway request/config", "Namespace by provider account", "Invocation plus catalog sync"],
  ["Model artifact digest", "Model registry", "File/path/model name", "Manifest covers weights/config/tokenizer/adapters", "Publish/deploy/verify"],
  ["Model route resolution", "Routing service", "Gateway config", "Record valid interval and resolver version", "Every invocation/config change"],
  ["Tool schema", "MCP server or signed manifest", "Observed tool call", "Canonical schema digest", "Registration/schema change"],
  ["Data classification", "Data catalog/DLP", "Sensor detector", "Separate declared class from observed classification", "Catalog sync and detection"],
  ["Credential version/status", "Issuer/secret manager", "Usage observation", "Never inventory secret value", "Issue/rotate/revoke/use"],
  ["Artifact provenance", "Build attestation", "Repository/build labels", "Verify signature and subject digest", "Build/release/deploy"],
  ["Current deployment", "Orchestrator", "Configured image tag", "Bind release+artifact digest+config digest", "Deployment and reconciliation"],
  ["Sensor version/artifact", "Deployment authority", "Sensor self-report", "Do not trust caller name alone", "Enrollment/heartbeat/runtime verify"],
  ["Policy version", "Policy service", "Config/table name", "Canonical bundle digest and interval", "Publish/deploy/decision"],
  ["Decision result", "Decision service", "Source action/outcome", "Reference policy/graph/identity snapshot", "Every decision"],
  ["Finding state", "Finding materializer", "Source-specific alert/status", "Preserve source alerts as evidence", "On supporting evidence/change"],
  ["Cost", "Provider billing/usage record", "Gateway estimate", "Mark estimate versus billed", "Usage ingest/reconciliation"],
  ["Last seen", "Most recent valid observation", "Any source", "Per-source freshness and trust", "Continuous"],
];

writeCsv(
  "field-authority.csv",
  ["Canonical field", "Primary authority", "Current fallback", "Conflict rule", "Refresh mechanism"],
  fieldAuthorityRows.map(([field, primary, fallback, conflict, refresh]) => ({
    "Canonical field": field,
    "Primary authority": primary,
    "Current fallback": fallback,
    "Conflict rule": conflict,
    "Refresh mechanism": refresh,
  })),
);

const sourceCapabilityRows = [
  ["Browser extension (Vanguard)", "Persona/email claim", "No", "No", "Application/domain", "Browser interaction", "Account hints", "Persona token", "No", "Authenticated BES path varies", "Event-driven plus heartbeat", evidence.browserOverview],
  ["Browser native host (Project Sentinel)", "Persona claim/OS context", "No", "Process instance only", "No", "No", "No", "Persona token stored locally", "Local files", "No signed event envelope", "Scheduled/overlapping tasks plus local events", evidence.browserSecurity],
  ["Browser Extension Service", "Persona/email and tenant context", "No", "Service deployment only", "No", "Relay/config metadata", "Persona/deployment", "Bearer/persona credentials", "Deployment package metadata", "Proprietary decoder; production details external", "HTTP/Kafka plus partial schedulers", evidence.browserOverview],
  ["Endpoint System Monitor v2", "Email/OS account candidates", "Agent labels/discovery", "Device/process runtime context", "Model discovery", "MCP/hook/tool discovery", "Application/account candidates", "Local vault/persona metadata", "Packages/repositories", "Local observation; workload proof absent", "Runtime discovery plus delta polling", evidence.endpointOverview],
  ["Endpoint proxy/DLP", "OS/process attribution", "Agent only if metadata supplied", "Process/device context", "Provider/model hints", "Destinations/hooks", "Application destination", "No credential inventory", "Binary/process context", "Sensor observation; some failure paths fail open", "Event-driven", evidence.endpointSecurity],
  ["Endpoint IDE hooks", "User/application session hints", "Agent/tool labels", "IDE process/session", "Model hints", "Tool/file/command activity", "IDE/application", "No credential authority", "File/process evidence", "Local socket; production evaluator allows", "Event-driven/batched", evidence.endpointOverview],
  ["Endpoint Persona/email discovery", "Nine local email/account sources", "No", "Device context", "No", "No", "No", "Persona material", "No", "Peer authentication unresolved", "Startup/request-driven", evidence.endpointSecurity],
  ["Endpoint diagnostics", "No", "Component IDs", "Process/component context", "No", "No", "No", "No", "No", "Source identity can be claimed", "Event/batch", evidence.endpointOverview],
  ["Endpoint Dashboard/API", "Tenant/user projection", "Agent/entity projection", "No runtime proof", "Model projection", "Relationship projection", "Asset/account projection", "No secret values", "No provenance authority", "Aggregator, not source authority", "Request-driven", evidence.endpointOverview],
  ["LLM/DLP gateway", "JWT/API-key owner/email", "Agent if client metadata supplies it", "Gateway service only", "Provider/model/deployment/route", "Tool-call payload metadata", "Application/API-key/provider account", "API key/JWT/provider credential metadata", "Runtime image/config labels only", "JWT/API-key validation; provider proof varies", "Request-driven plus watchers/probes", evidence.gatewayData],
  ["LLM/DLP workers", "No", "Worker identity label", "Worker process only", "Detector/model label", "No", "No", "NATS/DB credentials external", "Model/index inputs without consistent provenance", "NATS subject/worker claim", "Streamed/batched", evidence.gatewayOverview],
  ["Endpoint Config Manager", "Caller tenant selection", "No", "Service only", "No", "No", "Tenant configuration", "No application auth visible", "Dependency metadata", "Application-level auth absent", "Request-driven and watcher integration", evidence.gatewayOverview],
  ["Gateway-health probes", "Configured user email for MCP branch", "No", "Probe worker only", "Provider/model target", "MCP target", "API-key scope target", "Probe token", "No", "Synthetic result", "Periodic", evidence.gatewayData],
  ["External MCP Gateway", "Contract incomplete", "Expected agent IDs/runs", "Unknown", "Expected model associations", "Client/server/tool IDs", "Registrations/connections", "OAuth/upstream auth metadata", "Unknown", "Authoritative schemas not supplied", "Unresolved", "docs/quilr2-cross-sensor/02-sensor-capability-catalog.md"],
  ["Quilr 1 query-builder/warehouse", "Bearer/user/tenant/subscriber context", "Warehouse/graph projections", "No cryptographic runtime identity", "Model/provider strings", "MCP analytics projection", "App/account rows", "No centralized credential inventory", "Git hashes only analysis anchors; deployment tags in manifests", "Decoder/authorization partly verified", "Minute/hour/startup/request/manual mix", evidence.quilrRuntime],
  ["Identity/IdP integration boundary", "Expected authoritative user/group/account IDs", "No", "No", "No", "No", "IdP application/account", "Federated token", "No", "External contracts unavailable", "Partial sync", "docs/quilr2-cross-sensor/02-sensor-capability-catalog.md"],
  ["SaaS/connector integration boundary", "Connected user/account", "Possible connector principal", "Connector runtime unknown", "Provider catalog", "Provider resources", "Connected account", "OAuth client/grant/token metadata expected", "Connector artifact unknown", "External contracts unavailable", "OAuth/connect/sync lifecycle", "docs/quilr2-cross-sensor/02-sensor-capability-catalog.md"],
];

writeCsv(
  "identity-sources.csv",
  ["Source", "Human", "Agent", "Workload", "Model", "Tool", "Account", "Credential", "Artifact", "Proof", "Discovery mode", "Evidence"],
  sourceCapabilityRows.map((row) => Object.fromEntries(
    ["Source", "Human", "Agent", "Workload", "Model", "Tool", "Account", "Credential", "Artifact", "Proof", "Discovery mode", "Evidence"]
      .map((header, index) => [header, row[index]]),
  )),
);

writeCsv(
  "identity-resolution-rules.csv",
  ["Entity type", "Candidate keys", "Automatic merge", "Candidate only", "Contradictions", "Authority", "Merge scope", "Split trigger", "Evidence"],
  identityTypeRows.map((row) => ({
    "Entity type": row["Entity type"],
    "Candidate keys": `${row["Strong native IDs"]}; ${row["Weak IDs"]}`,
    "Automatic merge": "Exact strong identifier in the same tenant/namespace, or authoritative mapping, with no contradiction",
    "Candidate only": `Any match relying on ${row["Weak IDs"]}`,
    Contradictions: "Cross-tenant scope; incompatible provider/native IDs; mutually exclusive account/product/runtime state; non-overlapping authoritative history",
    Authority: row.Authority,
    "Merge scope": row["Tenant scope"],
    "Split trigger": "New strong identifier or authoritative evidence proves previously merged observations represent distinct entities",
    Evidence: row.Proof,
  })),
);

const lifecycleRows = [
  ["Resolution state", "candidate", "Observation cannot yet be assigned", "First observation", "resolved or suppressed", "Resolver/manual decision"],
  ["Resolution state", "correlated", "Candidate cluster has supporting matches", "Secondary matches", "resolved, conflict, or candidate", "Resolver"],
  ["Resolution state", "resolved", "Observations assigned to one canonical identity", "Strong/authoritative match", "conflict, merged, split", "Resolver/operator"],
  ["Resolution state", "conflict", "Authoritative or strong identifiers disagree", "Contradiction", "resolved or split", "Resolution center"],
  ["Resolution state", "merged", "Prior canonical ID redirects to survivor", "Approved resolution event", "split only through audited operation", "Resolution service"],
  ["Existence state", "observed", "At least one valid source saw the entity", "Identity observation", "active, stale, deleted", "Observation materializer"],
  ["Existence state", "active", "Fresh confirming observation exists", "Confirmation within window", "stale, deleted", "Reconciler"],
  ["Existence state", "stale", "No required confirmation inside entity/source window", "stale_after reached", "active/reappeared or retired", "Reconciler"],
  ["Existence state", "deleted", "Authoritative source reported deletion", "Source deletion observation", "reappeared or retired", "Authoritative adapter"],
  ["Lifecycle state", "suspended", "Use is intentionally paused", "Administrative/policy action", "active, revoked, retired", "Owner/admin"],
  ["Lifecycle state", "revoked", "Authority or trust was explicitly invalidated", "Revocation event", "reissued or retired", "Issuer/authority"],
  ["Lifecycle state", "retired", "Entity is no longer intended for use", "Owner/authority action and confirmation", "reappeared", "Owner/authority"],
  ["Lifecycle state", "reappeared", "A retired/stale identity is observed again", "New observation", "active or new identity candidate", "Resolver/reconciler"],
  ["Authentication state", "authenticated", "Presenter proved control under accepted method", "Successful verification", "expired/revoked/failed", "Authenticator"],
  ["Attestation state", "attested", "Signed/runtime claims satisfy trust policy", "Attestation verification", "expired/failed", "Attestation verifier"],
  ["Credential state", "active", "Credential is valid, unexpired, unrevoked", "Issuance/validation", "rotated/expired/revoked", "Issuer"],
  ["Ownership state", "owned", "Accountable owner assignment is current", "Explicit assignment", "unowned/review_due", "Registry"],
  ["Management state", "managed", "Entity is under approved governance", "Management record/control", "unmanaged/exception", "Control plane"],
  ["Certification state", "certified", "Review/evaluation is current", "Certification issuance", "expired/revoked", "Certifier"],
  ["Freshness state", "fresh", "Claim reconfirmed within policy window", "Observation/reconciliation", "aging/stale", "Reconciler"],
];

writeCsv(
  "identity-lifecycle.csv",
  ["Dimension", "State", "Meaning", "Entry condition", "Allowed next states", "Authority"],
  lifecycleRows.map(([Dimension, State, Meaning, entry, next, Authority]) => ({
    Dimension,
    State,
    Meaning,
    "Entry condition": entry,
    "Allowed next states": next,
    Authority,
  })),
);

const humanLinkRows = [
  ["OIDC account", "issuer+subject", "Verified issuer metadata/token", "Exact authoritative mapping or approved link", "email-only", "Issuer changed or subject conflict"],
  ["Pairwise OIDC accounts", "issuer+sector/client-specific subject", "Provider account-link claim or authoritative directory mapping", "Authoritative mapping required", "similar claims/email", "Mapping withdrawn"],
  ["SCIM account", "provider tenant+resource ID", "SCIM record and externalId semantics", "Exact provider ID", "displayName/userName", "Provider reports distinct immutable IDs"],
  ["HR employment", "HRIS+immutable employment ID", "HRIS record", "Authoritative crosswalk", "email/manager/name", "Rehire policy creates distinct employment relationship"],
  ["Microsoft Entra account", "tenant issuer+object/sub ID", "Verified Entra token/directory", "Directory crosswalk", "UPN/email", "Tenant/object conflict"],
  ["Okta account", "issuer+user ID/sub", "Verified Okta token/directory", "Directory crosswalk", "email", "Issuer/user conflict"],
  ["Google Workspace account", "issuer+subject/directory ID", "Verified Google token/directory", "Directory crosswalk", "email", "Workspace/subject conflict"],
  ["GitHub account", "forge+numeric user ID", "Provider API", "Explicit employee-account link", "login/email", "Account transfer or link revoked"],
  ["Slack account", "workspace+user ID", "Provider API", "Directory/SCIM crosswalk", "display name/email", "Workspace/user conflict"],
  ["SaaS local account", "provider tenant+account ID", "Provider API/OAuth subject", "Explicit/provider mapping", "account email", "Personal/enterprise split evidence"],
];

writeCsv(
  "human-account-linking.csv",
  ["Account type", "Strong key", "Required proof", "Automatic link", "Candidate only", "Split or unlink trigger"],
  humanLinkRows.map(([type, key, proof, automatic, candidate, split]) => ({
    "Account type": type,
    "Strong key": key,
    "Required proof": proof,
    "Automatic link": automatic,
    "Candidate only": candidate,
    "Split or unlink trigger": split,
  })),
);

const nonHumanRows = [
  "Agent",
  "Sub-agent",
  "Workload",
  "Service account",
  "Cloud service principal",
  "OAuth client",
  "API client",
  "CI/CD job identity",
  "Build service",
  "Deployment service",
  "Model gateway",
  "MCP gateway",
  "MCP client",
  "MCP server",
  "Connector",
  "Browser extension",
  "Endpoint agent",
  "Sensor",
  "Enforcement point",
  "Scheduled job",
  "Database role",
  "Robot account",
  "Webhook sender",
].map((type) => ({
  "Principal type": type,
  "Canonical ID": "entity:<uuidv7>",
  "Required native IDs": "Issuer/provider/source-scoped immutable ID; retain historical aliases",
  Owner: "Business and technical owner; missing owner produces a finding",
  Purpose: "Explicit approved purpose and prohibited use",
  Scope: "Tenant+environment+resource/audience",
  Credentials: "Metadata references only; short-lived where possible",
  Permissions: "Effective access graph plus grant provenance",
  "Last use": "Authenticated event or authoritative activity",
  Expiration: "Required for temporary principals/grants",
  Review: "Risk-based certification cadence",
  Revocation: "Issuer status plus descendant propagation",
}));

writeCsv(
  "non-human-identities.csv",
  ["Principal type", "Canonical ID", "Required native IDs", "Owner", "Purpose", "Scope", "Credentials", "Permissions", "Last use", "Expiration", "Review", "Revocation"],
  nonHumanRows,
);

const workloadRows = [
  ["Quilr web/query-builder Kubernetes workloads", "Deployment/service identity proposed", "Pod UID/process instance", "Kubernetes/cloud/SPIRE selectors", "X.509-SVID or cloud token", "OCI digest+deployment binding", "Automatic short-lived", "Trust/credential/deployment revocation", "Not evidenced in current analysis"],
  ["Browser Extension Service", "Service workload identity proposed", "Pod/process instance", "Orchestrator+image+service account", "X.509-SVID/mTLS", "Service artifact digest", "Automatic", "Stop workload and revoke SVID", "Not evidenced"],
  ["Sentinel native host", "Enrolled installation identity", "Device+process start", "Device certificate/code signature/process digest", "Device/workload certificate", "Binary/package digest", "Rotate on enrollment policy", "Enrollment/device revocation", "Persona token exists; strong workload proof absent"],
  ["Vanguard extension", "Extension installation identity", "Browser profile+installation", "Managed-browser/extension enrollment", "Per-installation key/device-bound credential", "Extension package/version digest", "Policy-driven", "Enrollment/key revocation", "Current request/persona context only"],
  ["Endpoint System Monitor", "Endpoint-agent installation identity", "Device+boot+process", "MDM/device certificate/binary digest", "mTLS/device-bound credential", "Signed binary/package digest", "Automatic", "Device/sensor revocation", "Device/persona context exists; cryptographic binding unresolved"],
  ["Endpoint proxy/DLP", "Endpoint enforcement workload", "Device+boot+process", "Endpoint-agent attestation", "mTLS/workload credential", "Binary/config digest", "Automatic", "Sensor/control revocation", "Current local observation only"],
  ["LLM Gateway", "Gateway logical workload", "Pod/container/process", "Kubernetes/cloud/SPIRE selectors", "X.509-SVID/cloud identity", "OCI digest+config digest", "Automatic", "Trust/domain/deployment revocation", "API/JWT credentials exist; workload identity not shown"],
  ["LLM workers", "Worker logical workload", "Pod/container/process", "Worker image+service account+pod UID", "X.509-SVID/NATS mTLS", "Worker image/model/config digest", "Automatic", "Credential/worker deployment revocation", "NATS/worker identity is not canonicalized"],
  ["External MCP Gateway", "External workload identity", "Provider instance", "Provider attestation/registration", "Federated SPIFFE/cloud/OAuth client", "Provider artifact where exposed", "Provider-defined", "Federation/registration revocation", "Unresolved; source absent"],
  ["Self-hosted model server", "Model-serving logical workload", "Pod/container/process", "Pod/node/model/artifact selectors", "X.509-SVID/cloud identity", "Image+model manifest+config digest", "Automatic", "Deployment/model/workload revocation", "Target capability"],
];

writeCsv(
  "workload-identity-support.csv",
  ["Runtime", "Logical ID", "Instance ID", "Attestation", "Credential", "Artifact binding", "Renewal", "Revocation", "Current support"],
  workloadRows.map(([Runtime, logical, instance, attestation, credential, artifact, renewal, revocation, current]) => ({
    Runtime,
    "Logical ID": logical,
    "Instance ID": instance,
    Attestation: attestation,
    Credential: credential,
    "Artifact binding": artifact,
    Renewal: renewal,
    Revocation: revocation,
    "Current support": current,
  })),
);

const credentialRows = [
  ["OIDC ID token", "OIDC issuer", "Human/account", "Client", "Identity claims", "Issuer signature", "Minutes", "Client/session", "Issuer/session revocation"],
  ["OAuth access token", "Authorization server", "Authorized subject/actor", "Resource server", "Scope+authorization_details", "DPoP/mTLS where feasible", "Minutes", "Memory/secure token cache", "Introspection/revocation/expiry"],
  ["OAuth refresh token", "Authorization server", "Client+grant", "Authorization server", "Renewal authority", "Client binding/rotation", "Hours/days by policy", "Secret manager/encrypted store", "Revocation and rotation"],
  ["OAuth client credential", "Authorization server", "OAuth client", "Token endpoint", "Client grant", "Private key/mTLS preferred", "Rotated", "Secret manager/HSM", "Registration/credential revocation"],
  ["API key", "Provider/Quilr", "Account/service", "Provider API", "Provider-specific", "Usually bearer; sender binding often absent", "Prefer bounded/rotated", "Secret manager", "Provider revoke"],
  ["SPIFFE X.509-SVID", "SPIFFE trust domain", "Workload", "mTLS peer", "Workload authentication", "Private key+certificate", "Short-lived", "Workload API memory", "Registration/trust/expiry"],
  ["SPIFFE JWT-SVID", "SPIFFE trust domain", "Workload", "Audience", "Workload authentication", "Issuer signature; bearer replay caveat", "Short-lived", "Memory", "Trust/expiry"],
  ["Cloud workload token", "Cloud IAM issuer", "Workload/service principal", "Cloud resource", "Cloud IAM", "Platform key/issuer", "Short-lived", "Metadata/workload API", "IAM/expiry"],
  ["Kubernetes service-account token", "Cluster issuer", "Service account/pod", "Specified audience", "Cluster RBAC/federation", "Projected bound token", "Short-lived", "Projected volume", "Pod/service-account/expiry"],
  ["Device certificate", "Enterprise/device CA", "Device/install", "Quilr ingestion", "Sensor/device authentication", "Hardware/software key", "Policy-defined", "Keychain/TPM", "CA/MDM revoke"],
  ["Session cookie", "Quilr/auth service", "Human session", "Quilr web/BFF", "Session authority", "Cookie integrity and TLS", "Hours", "Secure HttpOnly cookie target", "Logout/server revoke/expiry"],
  ["Artifact signing certificate", "Fulcio/enterprise CA", "Signer identity", "Artifact verifier", "Signing only", "Ephemeral/KMS key", "Short-lived or policy", "Ephemeral/KMS", "Trust/signer/cert policy"],
  ["KMS signing key", "KMS", "Signing service", "Verifier", "Signing authority", "HSM/KMS key version", "Long-lived with rotation", "KMS/HSM", "Disable/version revoke"],
  ["Database credential", "Database/IAM", "Workload", "Database", "Database role", "Password/certificate/cloud IAM", "Prefer short-lived", "Secret manager/workload API", "DB/IAM revoke"],
  ["Webhook signature key", "Provider", "Webhook sender", "Receiver", "Event authenticity", "HMAC/asymmetric signature", "Rotated", "Secret manager/public trust", "Key rotation/revoke"],
];

writeCsv(
  "credential-types.csv",
  ["Credential type", "Issuer", "Subject", "Audience", "Scope", "Proof binding", "TTL", "Storage", "Revocation"],
  credentialRows.map((row) => Object.fromEntries(
    ["Credential type", "Issuer", "Subject", "Audience", "Scope", "Proof binding", "TTL", "Storage", "Revocation"]
      .map((header, index) => [header, row[index]]),
  )),
);

const secretFields = [
  ["secret_id", "Canonical secret-record ID", "Yes", "Inventory", "Never secret value"],
  ["manager", "Secret manager/provider", "Yes", "Inventory", "Authority"],
  ["native_resource_id", "Provider-native path/resource ID", "Yes", "Inventory", "Protect topology as appropriate"],
  ["version_id", "Immutable secret version", "Yes", "Inventory", "Separate from secret record"],
  ["owner_id", "Accountable owner", "Yes", "Inventory", "Finding if absent"],
  ["purpose", "Approved use", "Yes", "Inventory", "No confidential material"],
  ["consumer_ids", "Workloads/agents/connectors", "Yes", "Relationship store", "Effective consumers"],
  ["issuer", "Issuing authority", "When applicable", "Inventory", "Namespace identifiers"],
  ["created_at", "Creation time", "Yes", "Inventory", "UTC"],
  ["rotated_at", "Last rotation", "When applicable", "Inventory", "Metric input"],
  ["expires_at", "Expiration", "When applicable", "Inventory", "Finding if missing by policy"],
  ["last_used_at", "Last authenticated use", "When observable", "Event projection", "Do not infer from read alone"],
  ["revoked_at", "Revocation", "When applicable", "Inventory", "Propagate status"],
  ["classification", "Sensitivity category", "Yes", "Inventory", "Metadata only"],
  ["environment", "Prod/dev/etc.", "Yes", "Inventory", "Tenant/environment boundary"],
  ["tenant_id", "Tenant scope", "Yes", "Inventory", "Mandatory lookup predicate"],
  ["keyed_fingerprint", "Tenant-specific HMAC for correlation", "Only when approved", "Protected index", "Never plain unsalted hash for low entropy"],
  ["rotation_policy", "Required cadence/trigger", "Yes", "Inventory", "Policy version"],
  ["storage_compliance", "Approved manager/location result", "Yes", "Finding input", "No value exposure"],
  ["evidence_refs", "Issuance/rotation/use proof", "Yes", "Evidence store", "Immutable references"],
];

writeCsv(
  "secret-metadata.csv",
  ["Field", "Meaning", "Required", "Storage", "Security rule"],
  secretFields.map(([Field, Meaning, Required, Storage, rule]) => ({
    Field,
    Meaning,
    Required,
    Storage,
    "Security rule": rule,
  })),
);

const artifactRows = [
  ["Git blob", "repository+full OID", "git-sha1/git-sha256", "Repository+object type", "Optional source signature", "Source/SWH metadata", "Input to build"],
  ["Git tree", "repository+full tree OID", "git-sha1/git-sha256", "Repository+tree", "Optional", "Source/SWH provenance", "Build input snapshot"],
  ["Git commit", "repository+full commit OID", "git-sha1/git-sha256", "Repository+commit", "Commit/tag signature optional", "Source provenance", "Build input, not artifact"],
  ["SWH source object", "qualified SWHID", "Scheme-defined intrinsic ID", "SWH object+qualifiers", "Archive proof separate", "Archive/provenance metadata", "Source identity only"],
  ["OCI image manifest", "registry/repository@digest", "sha256/sha512", "Source revision/build inputs", "Cosign/enterprise", "SLSA/in-toto", "Deployment must pin digest"],
  ["OCI image index", "registry/repository@index digest", "sha256/sha512", "Platform manifests", "Cosign/enterprise", "SLSA/in-toto", "Resolve platform digest"],
  ["Binary/package", "purl/registry coordinate", "sha256/sha512", "Source revision/build", "Sigstore/enterprise", "SLSA/in-toto", "Deployment package digest"],
  ["Agent manifest", "agent definition+semantic version", "sha256 over canonical manifest", "Source/prompt/tool/model/config inputs", "Release signer", "Release attestation", "Bind to agent version/deployment"],
  ["Prompt bundle", "prompt bundle coordinate", "sha256 over canonical bundle", "Source revision/template set", "Release signer", "Build/release attestation", "Bind to agent version"],
  ["Tool manifest", "server+tool namespace+version", "sha256 over canonical schema/implementation refs", "Server/source", "Server/release signer", "Attestation", "Bind registration/runtime"],
  ["Model manifest", "model registry+revision", "sha256/sha512 manifest and file digests", "Weights/tokenizer/config/adapters", "Registry/release signer", "Model build/release provenance", "Bind model deployment/workload"],
  ["Policy bundle", "policy ID+version", "sha256 over canonical bundle", "Policy source/compiler", "Policy publisher", "Compile/test attestation", "Bind decision/deployment"],
  ["Configuration bundle", "deployment config revision", "sha256 over canonical config", "Config source", "Deployment authority", "Deployment attestation", "Bind workload"],
  ["SBOM", "document namespace/serial", "sha256", "Artifact digest", "Attestation signer", "SBOM attestation", "Verify subject matches deployed artifact"],
  ["Release", "product+release ID/version", "Digest of release manifest", "Source revisions+artifact set", "Publisher", "Release attestation", "Deployment references release"],
  ["Build output collection", "build ID", "Digest per output", "Builder+inputs", "Builder/signing authority", "SLSA build provenance", "Release consumes exact outputs"],
  ["Browser extension package", "store/bundle ID+version", "Package digest", "Source/build", "Store/vendor signer", "Build/release proof", "Installation observed on browser"],
  ["Endpoint installer/binary", "package/release coordinate", "Binary/package digest", "Source/build", "Code signer", "Build/release proof", "Installed/runtime binary verification"],
];

writeCsv(
  "artifact-identifiers.csv",
  ["Artifact type", "Coordinate", "Content digest", "Source ID", "Signature", "Provenance", "Deployment binding"],
  artifactRows.map((row) => Object.fromEntries(
    ["Artifact type", "Coordinate", "Content digest", "Source ID", "Signature", "Provenance", "Deployment binding"]
      .map((header, index) => [header, row[index]]),
  )),
);

const provenanceRows = [
  ["Quilr web", "Git commit analysis anchor", "Docker image tag/manifests", "Jenkins build path", "No explicit verified signature", "No supplied SLSA/in-toto", "Requires digest+provenance+runtime binding", evidence.quilrDeploy],
  ["Quilr query-builder", "Git commit analysis anchor", "JAR/container tag", "Jenkins/Maven build path", "No explicit verified signature", "No supplied SLSA/in-toto", "Requires digest+provenance+runtime binding", evidence.quilrDeploy],
  ["Browser Vanguard", "Pinned Git revision in analysis", "Extension package/build output", "Build machinery documented", "Unresolved", "Unresolved", "Add package digest/signature/store identity", "Browser-extension-sensor-analysis/outputs/repository-analysis/15-build-deployment-and-operations.md"],
  ["Browser Sentinel", "Pinned Git revision in analysis", "Native binary/updater release", "Build/updater path documented", "Code/update signing unresolved", "Unresolved", "Add binary/manifest digest and verified updater provenance", "Browser-extension-sensor-analysis/outputs/repository-analysis/15-build-deployment-and-operations.md"],
  ["Browser Extension Service", "Pinned Git revision in analysis", "JAR/container", "Build/deploy path documented", "Unresolved", "Unresolved", "Add OCI/JAR digest and runtime binding", "Browser-extension-sensor-analysis/outputs/repository-analysis/15-build-deployment-and-operations.md"],
  ["Endpoint System Monitor", "Pinned Git revision in analysis", "Binary/package/container outputs", "Jenkins/workflows documented", "No explicit signing stage verified", "No SBOM/provenance stage verified", "Add signed release manifest and deployment verification", "Endpoint-agent-sensor-analysis/repository-analysis/15-build-deployment-and-operations.md"],
  ["Endpoint proxy/DLP", "Pinned Git revision in analysis", "Binary/package", "Build path documented", "Unresolved", "Unresolved", "Add digest/signature/provenance", "Endpoint-agent-sensor-analysis/repository-analysis/15-build-deployment-and-operations.md"],
  ["Endpoint Dashboard", "Pinned Git revision in analysis", "Container image", "Jenkins builds/pushes", "No explicit signing stage", "No explicit SBOM/provenance stage", "Pin digest and attest build", "Endpoint-agent-sensor-analysis/repository-analysis/15-build-deployment-and-operations.md"],
  ["LLM Gateway", "Pinned Git revision in analysis", "Container images and model assets", "Shell/Docker build paths", "No tracked signature proof", "No tracked SLSA/in-toto/SBOM proof", "Add per-image/model/config provenance", "LLM-gateway-sensor-analysis/outputs/repository-analysis/15-build-deployment-and-operations.md"],
  ["LLM workers", "Pinned Git revision in analysis", "Worker images/binaries/models", "Mixed Python/Rust/container builds", "Unresolved", "Regeneration provenance inconsistent", "Attest each worker/model/index artifact", "LLM-gateway-sensor-analysis/outputs/repository-analysis/09-data-models-and-storage.md"],
  ["External MCP Gateway", "Not supplied", "Unknown", "Unknown", "Unknown", "Unknown", "Integration contract required", "docs/quilr2-cross-sensor/23-open-questions.md"],
  ["Target agent release", "Full Git OID and optional SWHID", "Agent/prompt/tool/runtime manifests", "Hermetic build target", "Sigstore or enterprise PKI", "SLSA/in-toto", "Signed binding to deployment/workload", "Proposed"],
  ["Target self-hosted model", "Repository/registry revision", "Weights/tokenizer/config/adapter manifest", "Model publication pipeline", "Registry/Sigstore/enterprise", "Model provenance attestation", "Bind to serving workload", "Proposed"],
  ["Target policy bundle", "Policy source revision", "Compiled bundle digest", "Policy compiler", "Policy publisher", "Compile/test attestation", "Decision references exact bundle", "Proposed"],
];

writeCsv(
  "provenance-support.csv",
  ["Component", "Source identity", "Artifact identity", "Build identity", "Signature support", "Provenance support", "Target action", "Evidence"],
  provenanceRows.map((row) => Object.fromEntries(
    ["Component", "Source identity", "Artifact identity", "Build identity", "Signature support", "Provenance support", "Target action", "Evidence"]
      .map((header, index) => [header, row[index]]),
  )),
);

const delegationRows = [
  ["Direct human action", "Human/account", "Human/account", "Session", "No delegation", "Session/token", "Session/policy expiry", "Revoke session/grant"],
  ["Agent on behalf of human", "Human", "Agent/effective principal", "Agent+action+resource+data+spend", "No broader than user grant", "Token exchange/RAR/resource-bound token", "Run/grant TTL", "Revoke parent and descendants"],
  ["Agent as own principal", "Agent/service principal", "Agent principal", "Approved autonomous scope", "Service policy", "Workload-bound credential", "Short-lived", "Agent/workload/grant revocation"],
  ["Parent agent to child agent", "Parent agent/run", "Child agent/run", "Subset of parent authority", "Depth/actions/resources/data/audience/duration/spend", "Exchanged capability/credential", "Child run TTL", "Cascade from parent"],
  ["Service impersonation", "Service/admin", "Effective human/service", "Explicit impersonation scope", "Preserve actor and subject", "Exchange/assume-role credential", "Very short", "Stop session and revoke assumption"],
  ["Temporary admin elevation", "Human admin", "Elevated role", "Approved role/resources/environment", "Separation of duties and expiry", "Step-up session/grant", "Minutes/hours", "Approval/session revoke"],
  ["Connector delegated access", "Human/admin/provider account", "Connector/OAuth client", "Provider scopes/resources", "Consent and audience constraints", "OAuth grant/access token", "Provider token TTL", "Revoke provider grant/connection"],
  ["CI/CD delegation", "Human/workflow", "Build/deploy job", "Repository/environment/action", "Workflow/ref/environment policy", "OIDC federation short-lived token", "Job TTL", "Cancel job/revoke federation"],
];

writeCsv(
  "delegation-types.csv",
  ["Delegation type", "Original principal", "Current actor", "Authority", "Attenuation", "Credential mechanism", "Expiration", "Revocation"],
  delegationRows.map((row) => Object.fromEntries(
    ["Delegation type", "Original principal", "Current actor", "Authority", "Attenuation", "Credential mechanism", "Expiration", "Revocation"]
      .map((header, index) => [header, row[index]]),
  )),
);

const identityEventGroups = {
  "Discovery and resolution": [
    "identity.observed",
    "identity.candidate_created",
    "identity.resolved",
    "identity.verified",
    "identity.attested",
    "identity.merge_proposed",
    "identity.merged",
    "identity.split",
    "identity.rekeyed",
    "identity.alias_added",
    "identity.alias_removed",
    "identity.conflict_detected",
    "identity.stale",
    "identity.reactivated",
    "identity.revoked",
    "identity.retired",
    "identity.reappeared",
  ],
  "Human and account lifecycle": [
    "person.created",
    "person.updated",
    "employment.changed",
    "account.created",
    "account.linked",
    "account.unlinked",
    "account.disabled",
    "account.deleted",
    "group.membership_added",
    "group.membership_removed",
    "role.assigned",
    "role.revoked",
    "session.started",
    "session.revoked",
  ],
  "Non-human identity": [
    "service_account.created",
    "service_account.rotated",
    "service_account.revoked",
    "workload.observed",
    "workload.attested",
    "workload.attestation_failed",
    "workload.identity_issued",
    "workload.identity_renewed",
    "workload.identity_revoked",
    "agent.deployed",
    "agent.version_changed",
    "agent.runtime_started",
    "agent.runtime_stopped",
  ],
  "Credentials and keys": [
    "credential.issued",
    "credential.used",
    "credential.rotated",
    "credential.expired",
    "credential.revoked",
    "credential.replay_detected",
    "secret.created",
    "secret.version_created",
    "secret.accessed",
    "secret.rotated",
    "secret.revoked",
    "key.created",
    "key.rotated",
    "key.revoked",
    "certificate.issued",
    "certificate.expired",
  ],
  Delegation: [
    "delegation.created",
    "delegation.attenuated",
    "delegation.used",
    "delegation.expired",
    "delegation.revoked",
    "delegation.child_created",
  ],
  "Artifacts and provenance": [
    "source.revision_observed",
    "artifact.built",
    "artifact.signed",
    "artifact.signature_verified",
    "artifact.provenance_verified",
    "release.published",
    "deployment.created",
    "deployment.artifact_changed",
    "runtime.artifact_verified",
    "runtime.artifact_mismatch",
  ],
  Federation: [
    "federation.created",
    "federation.metadata_changed",
    "federation.trust_bundle_rotated",
    "federation.verification_failed",
    "federation.expired",
    "federation.revoked",
  ],
};

const identityEventRows = Object.entries(identityEventGroups).flatMap(([category, types]) =>
  types.map((type) => ({
    "Event type": type,
    Category: category,
    Subject: type.split(".")[0],
    "Required identity context": "tenant; canonical subject; source/native identifier; actor chain where consequential",
    "Required time": "occurred_at; observed_at; ingested_at; valid_from/valid_until when stateful",
    "Required evidence": "source observation; authenticated sensor; immutable evidence reference",
    "Correlation key": "tenant+subject canonical ID+source native ID+event-specific generation/version",
    "Replay rule": "Idempotent by source+native event ID or deterministic event fingerprint; preserve later corrections",
    "Current producibility": /identity\.(observed|stale)|session\.started|credential\.used|agent\.deployed|deployment\.created/.test(type)
      ? "Partially derivable from current source-specific events"
      : "Requires canonical identity/event implementation or new telemetry",
  })),
);

writeCsv(
  "identity-events.csv",
  ["Event type", "Category", "Subject", "Required identity context", "Required time", "Required evidence", "Correlation key", "Replay rule", "Current producibility"],
  identityEventRows,
);

const findingGroups = {
  "Human and account identity": [
    "Human activity cannot be linked to a stable directory identity",
    "One person appears as several unresolved accounts",
    "Two people may have been incorrectly merged",
    "Email was reassigned to a different person",
    "Account remains active after employment ended",
    "Privileged account has no current owner",
    "Guest account has no sponsor",
    "Personal and enterprise AI accounts are conflated",
    "Authentication issuer is unknown",
    "Authentication audience does not match the service",
  ],
  "Agent identity": [
    "Agent has no stable definition ID",
    "Agent run cannot be linked to an exact version",
    "Agent version cannot be linked to an artifact",
    "Agent deployment differs from approved version",
    "Agent owner is missing",
    "Several agents share one credential without attribution",
    "Agent runs under an unrelated service identity",
    "Agent-to-agent delegation has no parent chain",
    "Child agent received broader authority than parent",
    "Agent is active after retirement",
  ],
  "Workload identity": [
    "Workload has no cryptographically verifiable identity",
    "Workload identity is shared across unrelated services",
    "Workload identity is shared across tenants",
    "Workload credential is expired",
    "Workload attestation failed",
    "Workload artifact digest differs from deployment record",
    "Workload identity cannot be bound to an agent deployment",
    "Production workload uses an unverified mutable image tag",
    "Runtime instance is unknown",
  ],
  "Model identity": [
    "Model invocation uses an unresolved model alias",
    "Agent changed model versions without an approved change",
    "Model endpoint cannot be linked to a provider account",
    "Model deployment has no owner",
    "Self-hosted model weights have no digest",
    "Tokenizer or adapter version is unknown",
    "Serving workload cannot be identified",
    "Provider model ID differs across sources",
  ],
  "Application and account identity": [
    "Same application is duplicated across sensors",
    "Different applications were incorrectly merged",
    "Application account type is unknown",
    "Enterprise subscription cannot be linked to observed use",
    "Tenant account has no owner",
    "Application identity relies only on display name",
    "Domain alias changed without reconciliation",
  ],
  "Tools and connectors": [
    "MCP server identity cannot be verified",
    "Tool name is ambiguous across servers",
    "Tool schema changed without version change",
    "Connector credential cannot be attributed to a connection",
    "OAuth client has no owner",
    "Connected account cannot be identified",
    "Tool execution cannot be attributed to an agent or human",
  ],
  "Credentials and secrets": [
    "Long-lived credential used by an agent",
    "Credential has no owner",
    "Credential has no expiration",
    "Shared credential used across several unrelated identities",
    "Credential remains valid after owner retirement",
    "Secret is stored outside an approved manager",
    "Secret version cannot be determined",
    "Signing key is untrusted",
    "Certificate expired but is still presented",
    "Key rotation is incomplete",
    "Token appears to have been replayed",
    "Bearer token is used where sender binding is required",
  ],
  "Artifact and provenance": [
    "Production artifact has no immutable digest",
    "Artifact has no build provenance",
    "Artifact signer is unknown",
    "Artifact signature does not satisfy trust policy",
    "Same source revision produced unexplained different artifacts",
    "Deployed artifact differs from certified artifact",
    "Release contains an unapproved artifact",
    "Git revision cannot be linked to the build",
    "Source SWHID or Git OID conflicts with recorded provenance",
    "SBOM does not match deployed artifact",
  ],
  "Sensors and evidence": [
    "Sensor identity cannot be authenticated",
    "Sensor version is unknown",
    "Event signature cannot be verified",
    "Sensor certificate is expired",
    "Sensor reports for the wrong tenant",
    "Evidence references a mutable identity state",
    "Historical decision lacks the identity snapshot used at evaluation time",
  ],
};

function findingRequirements(category) {
  if (category === "Human and account identity") return ["Human User; Application Account; Session", "IdP/HRIS/Quilr/gateway observations", "Identity administrator or account owner"];
  if (category === "Agent identity") return ["Agent Definition; Agent Version; Agent Deployment; Agent Runtime; Agent Run; Human User", "Agent registry/deployment/runtime/gateway observations", "Agent business and technical owner"];
  if (category === "Workload identity") return ["Workload Identity; Agent Deployment; Agent Runtime; Evidence Record", "Workload issuer/orchestrator/runtime attestation", "Platform or workload owner"];
  if (category === "Model identity") return ["Model Provider; Model Version; Model Deployment; Model Route; Agent Definition", "Gateway/provider/model-registry/runtime observations", "Model or agent owner"];
  if (category === "Application and account identity") return ["AI Product; Application Surface; Tenant Application; Application Account; Tenant Subscription", "Browser/endpoint/gateway/provider/catalog observations", "Application owner"];
  if (category === "Tools and connectors") return ["MCP Client; MCP Server Deployment; Tool Version; Connector; Integration Instance; Connected Account", "MCP/connector/endpoint/gateway observations", "Connector/MCP owner"];
  if (category === "Credentials and secrets") return ["Credential; Service Account; Workload Identity; Agent Definition", "Issuer/secret-manager/authentication-use observations", "Credential owner or security"];
  if (category === "Artifact and provenance") return ["Agent Version; Agent Deployment; Model Version; Model Deployment; Certification; Evidence Record", "Repository/build/registry/release/deployment/attestation observations", "Release/platform owner"];
  return ["Sensor; Enforcement Point; Evidence Record; Decision", "Sensor enrollment/authenticated event/evidence verification", "Sensor/platform owner"];
}

const identityFindingRows = Object.entries(findingGroups).flatMap(([category, names]) =>
  names.map((name) => {
    const [identities, observations, owner] = findingRequirements(category);
    return {
      Finding: name,
      Category: category,
      "Detection condition": `Open when evidence establishes or strongly indicates: ${name.toLowerCase()}.`,
      "Required observations": observations,
      "Required identities": identities,
      "Required relationships": "Typed ownership, identity, deployment, authorization, delegation, provenance, or observation edges applicable to the condition",
      Confidence: "Versioned function of identifier strength, source authority, proof assurance, freshness, independence, and contradiction",
      Evidence: "Immutable source observations, claim/proof records, identity snapshot, resolver/materializer versions",
      Owner: owner,
      "Recommended action": "Resolve identity/proof gap, revoke or constrain unsafe authority, assign ownership, reconcile sources, and document exception when accepted",
      "Resolution condition": "Close only when the violating condition is false under fresh authoritative or cryptographically verified evidence for the configured confirmation window",
      "Reopen condition": "Reopen on renewed observation, expired proof, changed identity binding, or recurrence after closure",
      "Product location": "Identity & Authority Overview; relevant entity detail; Findings; Resolution Center",
      "Current producibility": /duplicate|display name|owner|account type|alias|unresolved model alias/i.test(name)
        ? "Partially derivable now; confidence limited by source identity"
        : "Requires new telemetry or external integration",
    };
  }),
);

writeCsv(
  "identity-findings.csv",
  ["Finding", "Category", "Detection condition", "Required observations", "Required identities", "Required relationships", "Confidence", "Evidence", "Owner", "Recommended action", "Resolution condition", "Reopen condition", "Product location", "Current producibility"],
  identityFindingRows,
);

const metricGroups = {
  Coverage: [
    "Percentage of events linked to canonical identities",
    "Percentage of actions with complete actor chains",
    "Percentage of agent runs linked to exact agent versions",
    "Percentage of runs linked to runtime workload identity",
    "Percentage of production artifacts with immutable digests",
    "Percentage of artifacts with verified provenance",
    "Percentage of non-human identities with owners",
    "Percentage of credentials with expiration",
    "Percentage of delegated actions with preserved parent chains",
  ],
  Hygiene: [
    "Unresolved identity candidates",
    "Identity conflicts",
    "Duplicate candidates",
    "Orphaned accounts",
    "Orphaned non-human identities",
    "Stale workload identities",
    "Expired credentials still observed",
    "Unowned secrets",
    "Mutable image tags in production",
    "Unattributed model invocations",
    "Unattributed tool calls",
  ],
  Lifecycle: [
    "Mean time from discovery to resolution",
    "Mean time from identity revocation to enforcement",
    "Mean time to remove leaver access",
    "Credential rotation age",
    "Certificate expiration horizon",
    "Identity reconciliation lag",
    "IdP synchronization lag",
    "Workload-attestation freshness",
    "Artifact-verification freshness",
  ],
};

const identityMetricRows = Object.entries(metricGroups).flatMap(([category, names]) =>
  names.map((name) => ({
    Metric: name,
    Category: category,
    Definition: name.startsWith("Percentage")
      ? "100 × qualifying canonical entities/events ÷ in-scope eligible canonical entities/events"
      : name.startsWith("Mean time")
        ? "Mean duration between the named start and completion events over the selected population"
        : /age|horizon|lag|freshness/i.test(name)
          ? "Distribution and risk-threshold count for the named duration"
          : "Count of open canonical entities/events satisfying the named condition",
    Numerator: name.startsWith("Percentage") ? "Qualifying in-scope records" : "Affected records or elapsed duration",
    Denominator: name.startsWith("Percentage") ? "All eligible in-scope records with coverage denominator known" : "Not applicable; show population and unknowns",
    "Required data": "Canonical identities, identity events, relationships, claims/proofs, freshness, and coverage telemetry",
    Dimensions: "tenant; environment; entity kind; source; owner; risk; provider; time",
    "Unknown handling": "Unknown is a separate population and never counted as compliant",
    "Drill-down": "Affected canonical entities with current state, evidence, and responsible owner",
    "Current availability": /unresolved|duplicate|orphaned|unattributed model/i.test(name)
      ? "Partially derivable now"
      : "Requires identity materializers or new telemetry",
    "Decision supported": "Prioritize identity remediation, coverage investment, access revocation, credential rotation, or supply-chain controls",
  })),
);

writeCsv(
  "identity-metrics.csv",
  ["Metric", "Category", "Definition", "Numerator", "Denominator", "Required data", "Dimensions", "Unknown handling", "Drill-down", "Current availability", "Decision supported"],
  identityMetricRows,
);

writeCsv(
  "current-to-target-identity.csv",
  ["Entity", "Current identifier", "Current source", "Stability", "Proof", "Target canonical ID", "Target strong identifiers", "Required migration"],
  identityTypeRows.map((row) => ({
    Entity: row["Entity type"],
    "Current identifier": row["Current identifier"],
    "Current source": row["Current source"],
    Stability: row.Stability,
    Proof: row.Proof,
    "Target canonical ID": row["Canonical ID"],
    "Target strong identifiers": row["Strong native IDs"],
    "Required migration": "Create tenant-safe canonical record; preserve every current ID as a namespaced identifier; ingest observations; backfill provenance; resolve deterministic matches; queue weak/conflicting matches; materialize lifecycle and relationships",
  })),
);

const currentFieldRows = [
  ["JWT/user ID", "Request/account subject under current decoder/auth service", "Account authentication", "Yes", "issuer+subject identifier record", "Unqualified user_id as person identity", "Subject is issuer-scoped and may identify an account, not a person"],
  ["user_email/email", "User/account attribute and frequent correlation key", "Display/account alias", "Yes", "Case/domain normalization with source and valid interval", "Email as permanent person key", "Mutable and reassignable"],
  ["tenant_id", "Tenant isolation/context key", "Tenant scope", "Yes", "Verified tenant canonical ID and source claim", "Caller-controlled/unverified tenant selection", "Every lookup requires verified tenant boundary"],
  ["subscriber_id", "Customer/subscriber context", "Tenant/account attribute", "Yes", "Namespaced identifier/relationship", "Universal tenant identity", "Semantics vary across sources"],
  ["app_id/application ID", "Source/warehouse application identifier", "Application/product/account", "Yes", "Namespaced alias on correct layer", "Cross-sensor identity authority", "May identify product, tenant app, or record"],
  ["application name", "Display/correlation field", "Display identity", "Yes", "Alias with source/validity", "Automatic merge key", "Weak and mutable"],
  ["domain/origin", "Browser/application surface indicator", "Surface identifier", "Yes", "Verified domain alias with validity", "Product/account identity by itself", "Domains move and host several products"],
  ["device ID", "Sensor/persona/native device key", "Device/installation", "Yes", "Namespace by issuer/source and map to canonical device", "Universal hardware identity", "May change on reimage/enrollment"],
  ["hostname/MAC", "Endpoint attributes", "Display/network alias", "Yes", "Historical aliases", "Sole device key", "Mutable/recyclable"],
  ["PID/process name/path", "Runtime process attribution", "Process observation", "Yes", "device+boot+PID+start and binary identity", "Stable process/application identity", "Ephemeral/ambiguous"],
  ["agent name", "Agent label/discovered application concept", "Agent definition display", "Yes", "Agent definition alias", "Agent version/runtime identity", "Does not bind behavior or execution"],
  ["model/model_name", "Provider model or route label", "Model route/family/version candidate", "Yes", "Provider-account scoped ID plus resolved version/deployment", "Immutable model identity", "Aliases are mutable"],
  ["request_id/context_id", "Request/conversation correlation", "Event/session", "Yes", "Namespaced source event/run alias", "Actor identity", "Execution-scoped only"],
  ["api_key_hash/prefix/name", "Credential lookup/display metadata", "Credential", "Yes", "Issuer+credential record and safe fingerprint", "Agent/person/account identity", "Shared/rotated credentials break attribution"],
  ["Authorization bearer value", "Authentication/authorization credential", "Credential presentation", "No raw value", "Token metadata and proof reference", "Inventory identifier", "Sensitive and short-lived"],
  ["OAuth client/connection fields", "Integration registration and connection", "Client/grant/connected account", "Yes", "Separate canonical client, grant, credential, connection", "Single integration identity", "Several layers and lifecycles"],
  ["Git commit hashes", "Repository-analysis anchors and some build/source labels", "Source revision", "Yes, full values", "algorithm+object type+repository context", "Universal entity/artifact identity", "Commit is source object, not build/deployment/runtime"],
  ["image tag/latest", "Deployment artifact reference", "Mutable route", "Yes as observation", "Resolve and store immutable OCI digest", "Artifact identity", "Tag can move"],
  ["policy/config IDs", "Source-specific policy/config identity", "Policy/version/deployment", "Yes", "Canonical policy+version+bundle digest", "Mutable name as decision proof", "Historical decisions need exact snapshot"],
  ["finding/status IDs", "Source-specific alert/finding state", "Finding/evidence", "Yes", "Canonical finding lineage and evidence aliases", "Cross-source canonical finding ID", "Current IDs are fragmented"],
];

writeCsv(
  "current-identity-field-mapping.csv",
  ["Current field", "Current meaning", "Identity layer", "Preserve", "Normalize", "Replace", "Reason"],
  currentFieldRows.map((row) => Object.fromEntries(
    ["Current field", "Current meaning", "Identity layer", "Preserve", "Normalize", "Replace", "Reason"]
      .map((header, index) => [header, row[index]]),
  )),
);

const mechanismRows = [
  ["JWT user context", "Federated human/account identity", "Preserve verified token claims as observations; add issuer+subject identifiers and person/account separation"],
  ["tenant/subscriber headers", "Verified tenant context", "Preserve as aliases; require decoder/issuer binding and tenant predicate on every lookup"],
  ["app IDs", "Canonical product/surface/tenant application/account identities", "Retain every app ID under a source namespace; resolve only at the correct layer"],
  ["Neo4j nodes", "Rebuildable typed relationship graph", "Backfill nodes/edges with provenance; operational ledger becomes authority"],
  ["Git commit references", "Source provenance identifiers", "Store full OID, algorithm, object type, repository; optionally add appropriate SWHID"],
  ["API keys", "Credential inventory", "Index metadata/issuer/key ID/safe fingerprint only; map consumers and rotate toward short-lived credentials"],
  ["deployment image tag", "Immutable artifact digest", "Observe tag but resolve registry digest at deploy and runtime"],
  ["agent name", "Agent definition plus version/deployment/runtime/run", "Keep name as alias; introduce manifest digest and runtime binding"],
  ["model name", "Model family plus version/artifact/deployment/endpoint/route", "Keep observed name; resolve provider/account/version at invocation time"],
  ["email", "Person/account alias", "Keep history and source; never reuse as canonical person ID"],
  ["service account/process identity", "Workload/service principal plus runtime instance", "Preserve source record; add cryptographic workload identity and attestation"],
  ["sensor name", "Sensor product/deployment/instance", "Treat caller name as claim; bind enrolled instance to credential, version, tenant, and artifact"],
  ["OAuth integration", "Client+grant+credential+connection+provider account", "Decompose current connection records and preserve provider-native IDs"],
  ["policy name/version", "Policy definition+version+bundle+deployment", "Backfill exact version/digest and decision snapshot"],
];

writeCsv(
  "current-identity-mechanism-mapping.csv",
  ["Current identity mechanism", "Target mechanism", "Reuse plan"],
  mechanismRows.map(([current, target, plan]) => ({
    "Current identity mechanism": current,
    "Target mechanism": target,
    "Reuse plan": plan,
  })),
);

const mechanismStatuses = [
  ["Full Git object IDs", "Referenced only", "Analysis snapshots use commit hashes; runtime canonical use is not established", evidence.quilrDeploy, "Store full OID+algorithm+object type+repository"],
  ["Git commit IDs", "Referenced only", "Pinned repository-analysis anchors and build labels", evidence.quilrDeploy, "Use as source revision identifiers"],
  ["Git tree IDs", "Absent", "No current canonical tree identity found in supplied analysis", evidence.quilrDeploy, "Add when source-tree identity is required"],
  ["SWHIDs", "Absent", "No SWHID use found in supplied analysis", "docs/quilr2-cross-sensor/42-current-quilr1-identity-audit.md", "Optional source-object alias where archive/private-source policy permits"],
  ["OCI image digests", "Unresolved", "Analysis explicitly says rendered production image digests were unavailable", evidence.quilrDeploy, "Resolve and verify at build/deploy/runtime"],
  ["Package digests", "Referenced only", "Checksums/hashes appear in build/update contexts but not as universal canonical artifact identity", "Endpoint-agent-sensor-analysis/repository-analysis/15-build-deployment-and-operations.md", "Normalize algorithm+digest+artifact"],
  ["Package URLs", "Absent", "No PURL identity model found", "docs/quilr2-cross-sensor/42-current-quilr1-identity-audit.md", "Add for package coordinates"],
  ["SBOM identifiers", "Absent", "Analyses note absent/unresolved SBOM stages", "Endpoint-agent-sensor-analysis/repository-analysis/15-build-deployment-and-operations.md", "Add SBOM document+subject digest"],
  ["Agent manifest digests", "Absent", "No canonical behavior manifest digest", "docs/quilr2-cross-sensor/31-agent-identity.md", "Required for Agent Version"],
  ["Prompt-bundle digests", "Absent", "No canonical prompt bundle artifact", "docs/quilr2-cross-sensor/31-agent-identity.md", "Add canonicalized digest"],
  ["Model-weight digests", "Unresolved", "Provider models do not expose them; local model asset provenance is inconsistent", "LLM-gateway-sensor-analysis/outputs/repository-analysis/09-data-models-and-storage.md", "Require manifest for self-hosted only"],
  ["Model-registry revision IDs", "Partially implemented", "Provider/model/deployment strings exist; registry authority is not universal", evidence.gatewayData, "Namespace by provider/account/registry"],
  ["SPIFFE IDs", "Absent", "No SPIFFE/SPIRE evidence in supplied analysis", "docs/quilr2-cross-sensor/42-current-quilr1-identity-audit.md", "Proposed workload identity"],
  ["X.509-SVIDs", "Absent", "No SVID evidence", "docs/quilr2-cross-sensor/42-current-quilr1-identity-audit.md", "Proposed for mTLS workloads"],
  ["JWT-SVIDs", "Absent", "JWT exists, but not SPIFFE JWT-SVID", evidence.quilrSecurity, "Use only where X.509 is impractical"],
  ["Cloud workload identity", "Unresolved", "Cloud/deployed IAM state unavailable", evidence.quilrDeploy, "Integrate where platform-native"],
  ["Kubernetes projected service-account identity", "Unresolved", "Service-account/RBAC and live objects were unresolved", evidence.quilrDeploy, "Audience-bound projected tokens or SPIFFE federation"],
  ["Artifact signatures", "Unresolved", "No verified signing/verification pipeline in supplied analyses", "docs/quilr2-cross-sensor/39-provenance-signing-and-attestation.md", "Sigstore or enterprise PKI under trust policy"],
  ["in-toto attestations", "Absent", "No current evidence", "docs/quilr2-cross-sensor/39-provenance-signing-and-attestation.md", "Proposed attestation envelope"],
  ["SLSA provenance", "Absent", "No current evidence", "docs/quilr2-cross-sensor/39-provenance-signing-and-attestation.md", "Proposed build/source provenance"],
  ["Sigstore certificates/transparency records", "Absent", "No current evidence", "docs/quilr2-cross-sensor/39-provenance-signing-and-attestation.md", "Evaluate public/private Sigstore"],
  ["TPM or hardware attestation", "Unresolved", "Hardware/device proof not available in supplied analysis", evidence.endpointSecurity, "Evaluate for high-assurance devices/nodes"],
  ["Signed deployment manifests", "Absent", "No verified signed deployment binding", evidence.quilrDeploy, "Sign canonical deployment binding"],
  ["JWK thumbprints", "Absent", "JWT kid/public-key configuration exists without canonical JWK identity model", evidence.gatewayData, "Add RFC 7638 thumbprint"],
  ["Certificate fingerprints", "Unresolved", "Some TLS/certificate paths exist, but canonical certificate inventory is not demonstrated", "docs/quilr2-cross-sensor/36-secrets-credentials-and-keys.md", "Normalize issuer+serial+fingerprints"],
  ["KMS key versions", "Unresolved", "Production secret/KMS state external", evidence.quilrDeploy, "Inventory resource+version without key material"],
];

writeCsv(
  "identity-mechanism-status.csv",
  ["Mechanism", "Current classification", "Evidence summary", "Evidence", "Target treatment"],
  mechanismStatuses.map(([Mechanism, classification, summary, Evidence, target]) => ({
    Mechanism,
    "Current classification": classification,
    "Evidence summary": summary,
    Evidence,
    "Target treatment": target,
  })),
);

const attributionRows = [
  ["Browser prompt/upload", "Persona/email claim", "Unknown agent", "Browser installation/native host", "Current user/account", "Persona/bearer token", "Allow/block may exist", "Vanguard/Sentinel/BES"],
  ["Endpoint process/network action", "OS/Persona candidate", "Possible agent label", "Device+process", "OS/service account", "Usually not inventoried", "Proxy/DLP decision", "Endpoint proxy/sensor"],
  ["LLM model invocation", "JWT/API-key owner/email when present", "Client metadata when present", "Gateway only; provider workload unavailable", "API-key/JWT subject", "API key/JWT/provider credential", "Gateway policy outcome", "LLM gateway"],
  ["MCP tool call", "Expected but contract incomplete", "Expected agent/run", "External gateway/server unresolved", "Grant subject unresolved", "OAuth/upstream credential unresolved", "External policy analytics", "External MCP Gateway"],
  ["Agent run", "Not consistently present", "Definition/version often unresolved", "Runtime/workload unresolved", "Credential principal", "Credential not separately bound", "Policy/source-specific", "Gateway/endpoint/MCP sources"],
  ["Child-agent call", "Inherited initiator unresolved", "Parent/child metadata unresolved", "Shared worker possible", "Effective principal unresolved", "Delegated credential unresolved", "Decision unresolved", "Requires new telemetry"],
  ["Policy decision", "Request user context where present", "Agent context inconsistent", "Decision service identity not canonical", "Authorized subject/source-specific", "Credential metadata partial", "Policy/version identity incomplete", "Gateway/BES/endpoint/Quilr"],
  ["Approval", "Approver user record", "N/A", "Application session", "Approver role", "Session/token", "Approval record", "Quilr/gateway"],
  ["Credential issuance", "Issuer subject", "Agent/service possible", "Issuer workload unresolved", "Grant subject", "Credential ID varies", "Issuance policy unresolved", "External issuer/partial gateway"],
  ["Credential use", "User/account when encoded", "Agent often missing", "Presenting workload missing", "Token/key subject", "Key/token", "Resource policy", "Gateway/current services"],
  ["Artifact build", "Commit author not builder identity", "N/A", "CI worker unresolved", "Build service", "CI credential unresolved", "Build policy absent", "Build systems"],
  ["Artifact deployment", "Deployer sometimes pipeline/user", "Agent/model deployment target", "Orchestrator workload unresolved", "Deployment service", "Cloud/cluster credential unresolved", "Deployment policy unresolved", "Manifests/Jenkins"],
  ["Runtime artifact verification", "N/A", "Agent/model identity target", "Exact workload required", "Verifier service", "Verifier workload credential", "Trust policy required", "Target only"],
  ["Finding resolution", "Operator user", "Affected agent if any", "UI/API service", "Operator role", "Session/token", "Resolution workflow", "Quilr source-specific"],
  ["Sensor observation", "Claimed user if available", "Claimed agent if available", "Sensor instance not strongly authenticated everywhere", "Sensor principal", "Persona/token/channel", "N/A", "Every sensor"],
];

writeCsv(
  "attribution-coverage.csv",
  ["Event type", "Human", "Agent", "Workload", "Effective principal", "Credential", "Decision", "Sensor"],
  attributionRows.map((row) => Object.fromEntries(
    ["Event type", "Human", "Agent", "Workload", "Effective principal", "Credential", "Decision", "Sensor"]
      .map((header, index) => [header, row[index]]),
  )),
);

const currentGapRows = [
  ["Canonical identity", "Source-specific IDs and application inventory", "No generalized identifier/proof registry", "Duplicate/conflated entities and brittle joins", "Tenant-safe UUIDv7 canonical registry plus aliases", "P0"],
  ["Continuous discovery", "Minute/hour jobs, event/request paths, startup/manual tasks", "No uniform cursors, tombstones, staleness, reconciliation", "Silent drift and false deletion", "Observation stream+incremental sync+periodic reconciliation", "P0"],
  ["Human identity", "JWT/user/email/tenant context", "Issuer+subject/person/account separation and JML authority", "Misattribution and leaver risk", "IdP/SCIM/HRIS integrations", "P0"],
  ["Agent identity", "Labels and partial discovery/activity", "Definition/version/artifact/deployment/runtime/run binding", "Cannot attest which agent acted", "Agent registry+signed manifests+runtime binder", "P0"],
  ["Workload identity", "Service/process/deployment context", "Cryptographic workload identity/attestation", "Shared or spoofable runtime attribution", "SPIFFE/cloud workload identity", "P0"],
  ["Actor chain", "User/request/agent hints in separate records", "Initiator→agent→workload→grant→decision chain", "Actions not fully attributable", "Canonical actor chain on consequential events", "P0"],
  ["Tenant proof", "Headers/token context; some caller-controlled paths", "Uniform verified tenant binding", "Cross-tenant risk", "Identity context assembler and mandatory tenant predicates", "P0"],
  ["Sensor identity", "Names/persona/tokens/components", "Per-instance credential, version, artifact, replay protection", "Untrusted evidence source", "Sensor enrollment and signed/authenticated envelopes", "P0"],
  ["Credential inventory", "API keys/JWT/cookies/provider secrets fragmented", "Owner/consumer/grant/expiry/revocation graph", "Orphaned/shared long-lived credentials", "Credential broker+metadata inventory", "P0"],
  ["Artifact identity", "Tags/versions/commit anchors", "Immutable digest for every production artifact", "Mutable/unverifiable deployments", "Artifact registry and digest enforcement", "P0"],
  ["Provenance", "Build/deploy paths documented", "Signed source→build→artifact→release→deploy chain", "Cannot prove production origin", "SLSA/in-toto/Sigstore or enterprise equivalent", "P1"],
  ["Model identity", "Provider/model/deployment/route strings", "Snapshot/artifact/account/endpoint/runtime binding", "Model drift and poor attribution", "Provider/model registry adapters", "P1"],
  ["MCP identity", "External analytics/UI boundary", "Authoritative client/server/tool/connection schemas", "Tool ambiguity and unattributed calls", "MCP registry/gateway integration", "P0"],
  ["Federation", "OAuth/SAML/Entra paths exist", "Canonical issuer/trust/audience/mapping registry", "Trust drift not continuously detected", "Federation registry/reconciler", "P1"],
  ["Delegation", "No universal chain/attenuation model", "Parent grants, depth, purpose, resource, spend constraints", "Privilege expansion", "Token exchange/RAR/capability policy", "P0"],
  ["Secrets", "Environment/files/SQLite/Vault references; risky committed defaults identified", "Manager/version/owner/consumer metadata", "Exposure and rotation gaps", "Secret inventory adapter; no values", "P0"],
  ["Device identity", "Persona/device IDs and local attributes", "MDM/EDR/hardware/OS-install separation", "Reimage/reassignment collisions", "MDM/EDR adapters and device layers", "P1"],
  ["Evidence snapshots", "Source events/audits", "Historical identity/graph/policy snapshot per decision", "Cannot reproduce old decisions", "Identity evidence store", "P0"],
  ["Merge/split", "Source-specific deduplication", "Reversible canonical resolution history", "Irreversible wrong merges", "Resolution service and review center", "P0"],
  ["Revocation", "Token/key/account flags in some systems", "Cascade across sessions/grants/delegations/workloads", "Authority persists after revoke", "Revocation and status service", "P0"],
  ["Field authority", "Entity/source-wide implicit precedence", "Claim-level authority/proof/freshness", "Wrong source overwrites truth", "Claim ledger and authority policy", "P0"],
  ["Search", "Source-specific UI/API queries", "Cross-identifier search projection", "Operators cannot resolve identities", "Canonical search projection", "P1"],
  ["Privacy", "Sensitive identity/content crosses several stores", "Purpose/retention/access controls for identity proof", "Overcollection and exposure", "Protected evidence tiers and minimization", "P0"],
];

writeCsv(
  "current-identity-gaps.csv",
  ["Identity domain", "Current support", "Missing proof", "Consequence", "Target mechanism", "Priority"],
  currentGapRows.map((row) => Object.fromEntries(
    ["Identity domain", "Current support", "Missing proof", "Consequence", "Target mechanism", "Priority"]
      .map((header, index) => [header, row[index]]),
  )),
);

const serviceRows = [
  ["Identity Observation Ingestor", "Receive identity claims/events from all sources", "Source observations; authenticated source context", "Immutable identity observations", "P0", "Build"],
  ["Canonical Identity Registry", "Stable entities and separate state dimensions", "Resolved observations/operations", "Canonical identity/claim records", "P0", "Build"],
  ["Identifier and Alias Registry", "Native IDs, historical aliases, fingerprints, digests", "Identifier records", "Tenant-safe lookup index", "P0", "Build"],
  ["Identity Resolution Engine", "Candidates, deterministic matches, contradictions, merge/split", "Observations/identifiers/proofs", "Resolution decisions/events", "P0", "Build"],
  ["Identity Reconciler", "Incremental and full authoritative comparison", "Provider cursors/snapshots", "Freshness, tombstones, discrepancies", "P0", "Build"],
  ["Federation Registry", "Issuers, trust domains, audiences, mappings, bundles", "OIDC/SAML/SPIFFE/cloud metadata", "Verified federation state", "P1", "Build/integrate"],
  ["Workload Identity Service", "Issue or integrate runtime workload credentials", "Attestation selectors/platform identity", "Short-lived workload credential", "P0", "Integrate SPIFFE/cloud"],
  ["Runtime Identity Binder", "Bind workload to deployment/version/artifact/config/tenant", "Attestation+orchestrator+registry", "Signed/verified deployment binding", "P0", "Build"],
  ["Credential Broker", "Issue attenuated, audience-bound, short-lived credentials", "Parent grant+intent+policy", "Credential/grant/delegation records", "P0", "Build/integrate"],
  ["Secret Inventory Adapter", "Index secret metadata without values", "Secret manager APIs", "Secret/consumer/rotation metadata", "P0", "Integrate"],
  ["Access Graph Materializer", "Membership, ownership, entitlement, delegation, effective access", "Identity/authorization relationships", "Bitemporal access projection", "P0", "Build"],
  ["Artifact and Provenance Registry", "Source, build, artifact, signature, release, deployment", "Registry/build/attestation/deploy events", "Verified supply-chain records", "P1", "Build/integrate"],
  ["Identity Context Assembler", "Decision-ready actor, authority, proof, freshness context", "Registry/access/revocation/evidence", "Versioned identity snapshot", "P0", "Build"],
  ["Revocation and Status Service", "Current invalidation state and cascade", "Issuer/admin/policy events", "Low-latency revocation answer", "P0", "Build/integrate"],
  ["Identity Evidence Store", "Proofs, attestations, signatures, snapshots, verification", "Evidence envelopes", "Immutable protected evidence", "P0", "Build"],
  ["Identity Search Projection", "Search aliases/native IDs/fingerprints/owners", "Canonical identity/identifier streams", "Tenant-safe search index", "P1", "Build"],
];

writeCsv(
  "identity-service-catalog.csv",
  ["Service", "Responsibility", "Inputs", "Outputs", "Priority", "Disposition"],
  serviceRows.map((row) => Object.fromEntries(
    ["Service", "Responsibility", "Inputs", "Outputs", "Priority", "Disposition"]
      .map((header, index) => [header, row[index]]),
  )),
);

const apiRows = [
  ["POST", "/identities/resolve", "Resolve one identifier/observation set", "identity.resolve", "Idempotency key", "Resolution decision+evidence", "404 no candidate; 409 conflict; 422 invalid namespace"],
  ["POST", "/identities/resolve/batch", "Resolve bounded batch", "identity.resolve.batch", "Batch+item keys", "Per-item decisions", "207 per-item failures; no cross-item rollback"],
  ["GET", "/identities/{id}", "Canonical identity", "identity.read", "N/A", "Claims/state/provenance/freshness", "404 tenant-scoped"],
  ["GET", "/identities/by-identifier", "Tenant-safe identifier lookup", "identity.read", "N/A", "Exact/candidate results with confidence", "400 namespace missing; 409 ambiguity"],
  ["POST", "/identity-observations", "Ingest immutable observation", "identity.observe", "source+native event ID", "Observation receipt", "409 duplicate mismatch; 422 schema/proof error"],
  ["GET", "/identities/{id}/observations", "Observation history", "identity.evidence.read", "N/A", "Paginated redacted observations", "403 evidence tier"],
  ["GET", "/identities/{id}/identifiers", "Identifier history", "identity.read", "N/A", "Namespaced identifiers", "404 tenant-scoped"],
  ["POST", "/identities/{id}/identifiers", "Add verified/claimed identifier", "identity.identifier.write", "request key", "Identifier record", "409 contradiction"],
  ["POST", "/identity-resolution/merge", "Audited merge", "identity.resolve.approve", "operation key", "Merge event/redirect", "409 cross-tenant/contradiction"],
  ["POST", "/identity-resolution/split", "Audited split", "identity.resolve.approve", "operation key", "Split/reassignment plan", "409 active dependency conflict"],
  ["POST", "/identity-resolution/not-same", "Negative match assertion", "identity.resolve.approve", "pair+version", "Constraint record", "409 stale candidate"],
  ["GET", "/identity-resolution/candidates", "Resolution work queue", "identity.resolve.review", "N/A", "Candidates/evidence", "N/A"],
  ["POST", "/identities/{id}/verify", "Verify claims/proofs", "identity.verify", "proof digest", "Verification record", "422 unverifiable proof"],
  ["POST", "/workloads/attest", "Verify runtime selectors/evidence", "workload.attest", "nonce+instance", "Attestation/binding", "401/403 failed trust or selector"],
  ["POST", "/artifacts/verify", "Verify digest/signature/provenance", "artifact.verify", "artifact digest+policy", "Verification summary", "422 trust/predicate mismatch"],
  ["GET", "/attestations/{id}", "Attestation/evidence metadata", "identity.evidence.read", "N/A", "Redacted attestation", "403 evidence tier"],
  ["GET", "/federations", "Federation inventory", "federation.read", "N/A", "Federation state", "N/A"],
  ["POST", "/federations", "Register trust relationship", "federation.admin", "issuer/trust-domain key", "Federation record", "409 collision"],
  ["POST", "/federations/{id}/verify", "Refresh metadata/bundles/mappings", "federation.verify", "metadata version", "Verification event", "422 trust failure"],
  ["POST", "/federations/{id}/revoke", "Revoke federation", "federation.admin", "operation key", "Revocation event", "409 dependent active grants unless cascade accepted"],
  ["POST", "/delegations", "Create attenuated delegation", "delegation.create", "intent/grant key", "Delegation+credential grant", "403 authority expansion"],
  ["POST", "/delegations/{id}/attenuate", "Create child/subset delegation", "delegation.create", "parent+constraints key", "Child delegation", "403 subset validation failure"],
  ["POST", "/delegations/{id}/revoke", "Revoke delegation/descendants", "delegation.revoke", "operation key", "Revocation/cascade status", "202 propagation pending"],
  ["GET", "/delegations/{id}/chain", "Full authority chain", "delegation.read", "N/A", "Parent/child chain", "404 tenant-scoped"],
  ["POST", "/credential-grants", "Create grant", "credential.grant", "intent+subject+resource", "Grant metadata", "403 policy denial"],
  ["POST", "/credential-grants/{id}/exchange", "Issue attenuated credential", "credential.exchange", "grant+audience+nonce", "Short-lived credential handle/metadata", "403/409 expired/revoked/expansion"],
  ["POST", "/credentials/{id}/revoke", "Revoke credential", "credential.revoke", "operation key", "Revocation status", "202 issuer propagation"],
  ["GET", "/credentials/{id}/metadata", "Credential metadata only", "credential.read", "N/A", "Issuer/subject/audience/scope/expiry/status", "Never returns secret/token value"],
  ["GET", "/runs/{id}/actor-chain", "Run attribution", "attribution.read", "N/A", "Actor chain+evidence", "404/206 incomplete chain"],
  ["GET", "/events/{id}/actor-chain", "Event attribution", "attribution.read", "N/A", "Actor chain+evidence", "404/206 incomplete chain"],
  ["GET", "/actions/{id}/attribution", "Action causality and authority", "attribution.read", "N/A", "Actor/decision/sensor chain", "404/206 incomplete chain"],
  ["POST", "/access/check", "Decision-ready effective access", "access.check", "request/action/resource snapshot", "Decision+identity snapshot", "403 deny; 409 stale context"],
  ["GET", "/identities/{id}/effective-access", "Effective grants/paths", "access.read", "N/A", "Plain-language paths+evidence", "404 tenant-scoped"],
  ["GET", "/resources/{id}/authorized-identities", "Reverse effective access", "access.read", "N/A", "Authorized identities/paths", "404 tenant-scoped"],
];

writeCsv(
  "identity-api-catalog.csv",
  ["Method", "Path", "Purpose", "Authorization", "Idempotency", "Evidence/audit", "Error and staleness behavior"],
  apiRows.map((row) => Object.fromEntries(
    ["Method", "Path", "Purpose", "Authorization", "Idempotency", "Evidence/audit", "Error and staleness behavior"]
      .map((header, index) => [header, row[index]]),
  )),
);

const scenarioGroups = {
  "Human identity": [
    "Employee changes email but remains the same person.",
    "Old email is later assigned to a different person.",
    "Employee moves departments.",
    "Employee leaves and is rehired.",
    "One person has Okta, Entra, GitHub, Slack, and Google identities.",
    "Pairwise OIDC subjects differ across clients.",
    "Contractor becomes employee.",
    "Guest account loses its sponsor.",
  ],
  "Application identity": [
    "Claude appears through browser, endpoint, LLM Gateway, and MCP Gateway.",
    "Claude Web and Claude Desktop remain distinct surfaces.",
    "Personal Claude account remains distinct from enterprise Claude account.",
    "Product is renamed.",
    "Application changes domain.",
    "Two applications have nearly identical names.",
    "One desktop process embeds several AI products.",
  ],
  "Agent identity": [
    "Same agent definition receives a new version.",
    "Same version is deployed in test and production.",
    "Same runtime hosts several agents.",
    "Agent runtime restarts with a new instance identity.",
    "Agent artifact differs from approved deployment.",
    "Child agent receives attenuated authority.",
    "Child agent attempts to expand authority.",
    "Agent runs without a human initiator.",
    "Agent runs from a scheduled workflow.",
    "Agent is retired but still observed.",
  ],
  "Model identity": [
    "Model alias changes its underlying version.",
    "Same model version exists in several regions.",
    "Same model artifact is served by several workloads.",
    "Same source model is quantized differently.",
    "LoRA adapter changes while base weights remain the same.",
    "Remote provider exposes a model name but no weights digest.",
    "Agent silently changes provider through routing.",
  ],
  "Workload identity": [
    "SPIFFE or equivalent credential rotates without changing logical workload.",
    "Workload moves to a new node.",
    "Workload identity is valid but artifact digest is wrong.",
    "Shared worker pool executes several agent versions.",
    "Node attestation fails.",
    "Federation trust bundle changes.",
    "Production and development trust domains remain separate.",
  ],
  "Credentials and secrets": [
    "API key rotates.",
    "Same secret is copied into two systems.",
    "Access token expires during a run.",
    "Refresh token is revoked.",
    "DPoP-bound token is replayed without its private key.",
    "Shared credential is used by several agents.",
    "Credential remains active after agent retirement.",
    "Key ID is reused by another issuer.",
  ],
  "Source and artifacts": [
    "Same Git commit produces two different artifact digests.",
    "Different commits produce the same source tree.",
    "Image tag points to a new digest.",
    "Git SHA-1 and SHA-256 representations must be distinguished.",
    "SWHID exists for source but not for the built artifact.",
    "Artifact signature is valid but signer is not authorized.",
    "Artifact is signed and approved but a different digest is deployed.",
    "Build provenance references the wrong source revision.",
    "Release includes several platform-specific images.",
  ],
  Resolution: [
    "Two identities are automatically merged from a strong provider ID.",
    "Weak name match creates a candidate only.",
    "Operator marks two candidates as not the same.",
    "Previous merge is reversed.",
    "One identity is split into personal and enterprise accounts.",
    "Source observation arrives after retirement.",
    "Entity reappears under a new alias.",
    "Conflicting authoritative sources report different owners.",
  ],
  Attribution: [
    "Human initiates an agent run that calls a child agent.",
    "Child agent calls a tool using a scoped credential.",
    "Approval is granted by a second human.",
    "Workload executes the action.",
    "Sensor observes the action.",
    "Decision service records the policy decision.",
    "Evidence reconstructs the complete actor chain.",
  ],
};

function scenarioInvariant(category) {
  if (category === "Human identity") return "Person, employment, account, alias, and membership histories remain separate; authoritative immutable IDs control linking.";
  if (category === "Application identity") return "Product, surface, tenant account, user account, process, and observed activity remain distinct but related.";
  if (category === "Agent identity") return "Definition, version, artifact, deployment, workload, instance, run, and delegation remain distinct and attributable.";
  if (category === "Model identity") return "Family, version, artifact, configuration, route, deployment, endpoint, and serving workload remain distinct.";
  if (category === "Workload identity") return "Logical workload survives credential/instance rotation while attestation, environment, and artifact bindings are revalidated.";
  if (category === "Credentials and secrets") return "Secret, version, credential, grant, token, key, certificate, owner, and consumer remain distinct; revocation propagates.";
  if (category === "Source and artifacts") return "Algorithm-qualified source objects, builds, artifacts, signatures, releases, deployments, and runtimes form a verified chain.";
  if (category === "Resolution") return "Observations are never destroyed; candidates, negative links, merge redirects, splits, contradictions, and operator evidence are auditable.";
  return "Initiator, delegator, agent, workload, effective principal, credential, approval, decision, sensor, and causality are reconstructable.";
}

let scenarioId = 0;
const goldenScenarioRows = Object.entries(scenarioGroups).flatMap(([category, scenarios]) =>
  scenarios.map((scenario) => {
    scenarioId += 1;
    return {
      ID: scenarioId,
      Category: category,
      Scenario: scenario,
      "Expected invariant": scenarioInvariant(category),
      "Required events": "One or more canonical identity/activity/delegation/provenance events with event-time identity references",
      "Required evidence": "Tenant-scoped source observations, identifier/proof records, resolver or verifier version, and before/after state",
      "Acceptance result": "Deterministic canonical outcome without cross-tenant merge, lost history, authority expansion, mutable artifact identity, or missing attribution",
    };
  }),
);
if (goldenScenarioRows.length !== 71) {
  throw new Error(`Expected 71 golden scenarios, found ${goldenScenarioRows.length}`);
}

writeCsv(
  "identity-golden-scenarios.csv",
  ["ID", "Category", "Scenario", "Expected invariant", "Required events", "Required evidence", "Acceptance result"],
  goldenScenarioRows,
);

const validationChecks = [
  "Discovery is explicitly modeled as continuous.",
  "Every entity has one stable canonical ID.",
  "Every native identifier has a namespace and source.",
  "Mutable names are not used as sole identity.",
  "Email is not treated as permanent person identity.",
  "OIDC subjects are paired with issuer.",
  "Tenant boundaries are present in every identity lookup.",
  "Human, account, agent, workload, credential, and session remain distinct.",
  "Agent definition, version, deployment, workload, instance, session, and run remain distinct.",
  "Model family, version, artifact, deployment, endpoint, and serving workload remain distinct.",
  "Application product, surface, subscription, tenant account, and user account remain distinct.",
  "Workload identity is continuously renewed and revalidated.",
  "Runtime workload is bound to an exact deployment and artifact.",
  "Git OIDs are stored with algorithm, object type, and repository context.",
  "SWHIDs are used only where appropriate and never as universal entity IDs.",
  "Image tags and model aliases are not treated as immutable identities.",
  "Every immutable artifact has a content digest.",
  "Every production artifact can be traced to source and build.",
  "Artifact signatures are verified against an explicit trust policy.",
  "A valid signature is not confused with deployment identity.",
  "Secrets are not stored in plaintext inventory.",
  "Secret records and secret versions are distinct.",
  "Keys, certificates, credentials, grants, and tokens remain distinct.",
  "Key IDs are not assumed globally unique.",
  "Delegation preserves the full actor chain.",
  "Child delegation cannot expand parent authority.",
  "Credentials are scoped, audience-bound, and time-bound where possible.",
  "Every consequential action identifies initiator, agent, workload, effective principal, credential, decision, and sensor.",
  "Every identity claim has source, freshness, and assurance.",
  "Resolver confidence is separate from identity assurance.",
  "Merge and split operations are reversible.",
  "Source observations are never destroyed by canonicalization.",
  "Identity history survives aliases, moves, rotations, and retirement.",
  "Revocation propagation is explicit.",
  "Federation trust and key rotation are continuously monitored.",
  "Historical decisions retain the identity state used at decision time.",
  "Current Quilr 1 identity behavior is separated from proposed behavior.",
  "Every proposed mechanism is marked implemented, derivable, integration-dependent, or future.",
  "The machine-readable identity schemas agree with the narrative documentation.",
  "The platform can reconstruct a complete causal and authority chain for every golden scenario.",
];
if (validationChecks.length !== 40) {
  throw new Error(`Expected 40 validation checks, found ${validationChecks.length}`);
}

function validationArtifact(index) {
  if (index === 0 || index === 11 || index === 32) return "26-continuous-identity-lifecycle.md; matrices/identity-lifecycle.csv";
  if (index >= 1 && index <= 15) return "27-identity-taxonomy.md; 28-canonical-identifier-strategy.md; matrices/identity-types.csv";
  if (index >= 16 && index <= 23) return "38-source-artifact-and-release-identity.md; 39-provenance-signing-and-attestation.md";
  if (index >= 24 && index <= 27) return "37-delegation-attenuation-and-attribution.md; schemas/actor-chain.schema.json";
  if (index >= 28 && index <= 35) return "40-identity-resolution-and-reconciliation.md; schemas/canonical-identity.schema.json";
  if (index >= 36 && index <= 38) return "42-current-quilr1-identity-audit.md; 43-current-to-target-identity-migration.md";
  return "44-identity-golden-scenarios.md; matrices/identity-golden-scenarios.csv";
}

const validationRows = validationChecks.map((check, index) => ({
  ID: index + 1,
  Check: check,
  Status: "Satisfied by target design; current implementation status remains separately classified",
  "Validation artifact": validationArtifact(index),
  "Machine check": index === 38
    ? "All JSON schemas parse; schema and matrix counts reconcile"
    : index === 39
      ? "71 scenarios enumerated with required invariant/evidence"
      : "Narrative/matrix traceability",
}));

writeCsv(
  "identity-validation.csv",
  ["ID", "Check", "Status", "Validation artifact", "Machine check"],
  validationRows,
);

const uuidPattern = "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
const canonicalId = (prefix = "entity") => ({
  type: "string",
  pattern: `^${prefix}:${uuidPattern.slice(1)}`,
});
const timestamp = { type: "string", format: "date-time" };
const nullableTimestamp = { oneOf: [timestamp, { type: "null" }] };
const digest = {
  type: "object",
  additionalProperties: false,
  required: ["algorithm", "value"],
  properties: {
    algorithm: { type: "string", enum: ["sha256", "sha512", "git-sha1", "git-sha256", "swhid", "other"] },
    value: { type: "string", minLength: 1 },
  },
};
const proofRef = {
  type: "object",
  additionalProperties: false,
  required: ["proof_type", "proof_reference", "verification_result"],
  properties: {
    proof_type: { type: "string" },
    proof_issuer: { type: ["string", "null"] },
    proof_reference: { type: "string" },
    verification_result: { type: "string", enum: ["verified", "failed", "unverified", "expired", "revoked", "unresolved"] },
    verified_at: nullableTimestamp,
    expires_at: nullableTimestamp,
    verifier_identity: { type: ["string", "null"] },
    trust_policy_version: { type: ["string", "null"] },
  },
};
const stateEnums = {
  resolution_state: ["candidate", "correlated", "resolved", "conflict", "merged", "split", "suppressed"],
  lifecycle_state: ["observed", "active", "stale", "suspended", "revoked", "retired", "reappeared"],
  existence_state: ["unknown", "observed", "active", "stale", "deleted", "retired", "reappeared"],
  management_state: ["unknown", "managed", "unmanaged", "excepted"],
  authentication_state: ["unknown", "authenticated", "failed", "expired", "revoked"],
  attestation_state: ["unknown", "claimed", "attested", "failed", "expired", "revoked"],
  credential_state: ["none", "unknown", "active", "rotating", "expired", "revoked"],
  ownership_state: ["unknown", "owned", "unowned", "review_due"],
  certification_state: ["unknown", "uncertified", "certified", "expired", "revoked"],
  freshness_state: ["unknown", "fresh", "aging", "stale"],
};
const statesObject = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(stateEnums),
  properties: Object.fromEntries(
    Object.entries(stateEnums).map(([name, values]) => [name, { type: "string", enum: values }]),
  ),
};

writeJson("canonical-identity.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/canonical-identity.schema.json",
  title: "Quilr Canonical Identity",
  description: "Stable tenant-safe identity with independent lifecycle dimensions and claim-level provenance.",
  type: "object",
  additionalProperties: false,
  required: ["canonical_id", "entity_kind", "tenant_scope", "identity_namespace", "created_at", "states", "identifiers", "claims"],
  properties: {
    canonical_id: canonicalId("entity"),
    entity_kind: { type: "string", enum: identityKinds },
    tenant_scope: {
      type: "object",
      additionalProperties: false,
      required: ["scope_type", "tenant_id"],
      properties: {
        scope_type: { type: "string", enum: ["tenant", "global_catalog"] },
        tenant_id: { type: ["string", "null"] },
      },
    },
    identity_namespace: { type: "string", minLength: 1 },
    created_at: timestamp,
    states: statesObject,
    first_seen: nullableTimestamp,
    last_seen: nullableTimestamp,
    last_confirmed: nullableTimestamp,
    stale_after: nullableTimestamp,
    deleted_at: nullableTimestamp,
    retired_at: nullableTimestamp,
    revoked_at: nullableTimestamp,
    identifiers: {
      type: "array",
      items: canonicalId("id-record"),
      minItems: 1,
      uniqueItems: true,
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claim_id", "field", "value", "source_id", "observed_at", "authority_level", "assurance", "confidence", "resolver_version"],
        properties: {
          claim_id: canonicalId("claim"),
          field: { type: "string" },
          value: {},
          source_id: { type: "string" },
          source_native_field: { type: ["string", "null"] },
          observed_at: timestamp,
          valid_from: nullableTimestamp,
          valid_until: nullableTimestamp,
          authority_level: { type: "string", enum: ["authoritative", "cryptographic", "direct_observation", "corroborating", "claimed", "unknown"] },
          assurance: { type: "string", enum: ["claimed", "observed", "correlated", "authoritative_record", "cryptographically_authenticated", "runtime_attested", "hardware_attested"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          proof_reference: { type: ["string", "null"] },
          resolver_version: { type: "string" },
        },
      },
    },
    merged_from: { type: "array", items: canonicalId("entity"), uniqueItems: true },
    merged_into: { oneOf: [canonicalId("entity"), { type: "null" }] },
    split_from: { type: "array", items: canonicalId("entity"), uniqueItems: true },
    superseded_by: { oneOf: [canonicalId("entity"), { type: "null" }] },
  },
});

writeJson("identifier-record.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/identifier-record.schema.json",
  title: "Quilr Identifier Record",
  type: "object",
  additionalProperties: false,
  required: ["identifier_record_id", "tenant_id", "canonical_entity_id", "entity_kind", "namespace", "identifier_type", "identifier_value", "source_id", "first_seen", "last_seen", "assurance", "confidence", "status"],
  properties: {
    identifier_record_id: canonicalId("id-record"),
    tenant_id: { type: ["string", "null"], description: "Null only for approved global catalog identifiers." },
    canonical_entity_id: canonicalId("entity"),
    entity_kind: { type: "string", enum: identityKinds },
    namespace: { type: "string", minLength: 1 },
    identifier_type: { type: "string", minLength: 1 },
    identifier_value: { type: "string", minLength: 1 },
    algorithm: { type: ["string", "null"] },
    object_type: { type: ["string", "null"] },
    issuer_or_authority: { type: ["string", "null"] },
    source_id: { type: "string" },
    first_seen: timestamp,
    last_seen: timestamp,
    valid_from: nullableTimestamp,
    valid_until: nullableTimestamp,
    assurance: { type: "string", enum: ["claimed", "observed", "correlated", "authoritative_source", "cryptographically_verified", "runtime_attested", "hardware_attested"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    status: { type: "string", enum: ["candidate", "active", "superseded", "revoked", "retired", "conflict"] },
    proof: { oneOf: [proofRef, { type: "null" }] },
  },
});

writeJson("identity-observation.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/identity-observation.schema.json",
  title: "Quilr Identity Observation",
  type: "object",
  additionalProperties: false,
  required: ["observation_id", "tenant_id", "source_id", "source_instance_id", "source_event_id", "observed_at", "ingested_at", "entity_kind", "identifiers", "claims", "evidence_ref"],
  properties: {
    observation_id: canonicalId("identity-observation"),
    tenant_id: { type: "string", minLength: 1 },
    source_id: { type: "string" },
    source_instance_id: { type: "string" },
    source_event_id: { type: "string" },
    sequence_number: { type: ["integer", "null"], minimum: 0 },
    observed_at: timestamp,
    ingested_at: timestamp,
    valid_from: nullableTimestamp,
    valid_until: nullableTimestamp,
    entity_kind: { type: "string", enum: identityKinds },
    identifiers: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["namespace", "type", "value"],
        properties: {
          namespace: { type: "string" },
          type: { type: "string" },
          value: { type: "string" },
          algorithm: { type: ["string", "null"] },
          issuer: { type: ["string", "null"] },
        },
      },
    },
    claims: { type: "object", additionalProperties: true },
    deletion_observed: { type: "boolean", default: false },
    authentication: {
      type: "object",
      additionalProperties: false,
      required: ["channel", "result"],
      properties: {
        channel: { type: "string" },
        result: { type: "string", enum: ["authenticated", "unverified", "failed"] },
        credential_id: { type: ["string", "null"] },
        replay_protected: { type: "boolean" },
      },
    },
    evidence_ref: { type: "string" },
    raw_payload_digest: digest,
    schema_version: { type: "string", default: "1.0.0" },
  },
});

writeJson("actor-chain.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/actor-chain.schema.json",
  title: "Quilr Canonical Actor Chain",
  type: "object",
  additionalProperties: false,
  required: ["actor_chain_id", "tenant_id", "agent", "runtime", "authority", "approval", "causality"],
  properties: {
    actor_chain_id: canonicalId("actor-chain"),
    tenant_id: { type: "string" },
    human_initiator: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["person_id", "account_id", "session_id"],
          properties: {
            person_id: canonicalId("entity"),
            account_id: canonicalId("entity"),
            session_id: canonicalId("entity"),
          },
        },
        { type: "null" },
      ],
    },
    agent: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["agent_definition_id", "agent_version_id", "agent_deployment_id"],
          properties: {
            agent_definition_id: canonicalId("entity"),
            agent_version_id: canonicalId("entity"),
            agent_deployment_id: canonicalId("entity"),
            parent_agent_run_id: { type: ["string", "null"] },
          },
        },
        { type: "null" },
      ],
    },
    runtime: {
      type: "object",
      additionalProperties: false,
      required: ["workload_id", "workload_instance_id", "artifact_digest"],
      properties: {
        workload_id: canonicalId("entity"),
        workload_instance_id: { type: "string" },
        process_id: { type: ["string", "null"] },
        artifact_digest: digest,
        attestation_id: { type: ["string", "null"] },
      },
    },
    authority: {
      type: "object",
      additionalProperties: false,
      required: ["effective_principal_id", "grant_id", "credential_id"],
      properties: {
        original_principal_id: { type: ["string", "null"] },
        delegating_principal_id: { type: ["string", "null"] },
        effective_principal_id: canonicalId("entity"),
        delegation_id: { type: ["string", "null"] },
        grant_id: { type: "string" },
        credential_id: canonicalId("entity"),
        purpose: { type: ["string", "null"] },
        audience: { type: ["string", "null"] },
      },
    },
    approval: {
      type: "object",
      additionalProperties: false,
      required: ["required"],
      properties: {
        required: { type: "boolean" },
        approval_id: { type: ["string", "null"] },
        approved_by: { type: ["string", "null"] },
        authentication_strength: { type: ["string", "null"] },
      },
    },
    causality: {
      type: "object",
      additionalProperties: false,
      required: ["run_id", "step_id"],
      properties: {
        session_id: { type: ["string", "null"] },
        run_id: { type: "string" },
        parent_run_id: { type: ["string", "null"] },
        step_id: { type: "string" },
        intent_id: { type: ["string", "null"] },
        decision_id: { type: ["string", "null"] },
        observed_by_sensor_id: { type: ["string", "null"] },
      },
    },
  },
});

writeJson("workload-identity.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/workload-identity.schema.json",
  title: "Quilr Workload Identity",
  type: "object",
  additionalProperties: false,
  required: ["workload_id", "tenant_id", "trust_domain", "logical_identity", "deployment_id", "instance", "credential", "attestation", "artifact_binding", "status"],
  properties: {
    workload_id: canonicalId("entity"),
    tenant_id: { type: "string" },
    trust_domain: { type: "string" },
    logical_identity: {
      type: "object",
      additionalProperties: false,
      required: ["namespace", "identifier"],
      properties: {
        namespace: { type: "string", enum: ["spiffe", "cloud-workload", "kubernetes", "enterprise-pki", "other"] },
        identifier: { type: "string" },
      },
    },
    deployment_id: canonicalId("entity"),
    instance: {
      type: "object",
      additionalProperties: false,
      required: ["runtime_instance_id", "started_at"],
      properties: {
        runtime_instance_id: { type: "string" },
        pod_uid: { type: ["string", "null"] },
        container_id: { type: ["string", "null"] },
        process_identity: { type: ["string", "null"] },
        node_identity: { type: ["string", "null"] },
        region: { type: ["string", "null"] },
        environment: { type: "string" },
        started_at: timestamp,
        stopped_at: nullableTimestamp,
      },
    },
    credential: {
      type: "object",
      additionalProperties: false,
      required: ["credential_id", "type", "issued_at", "expires_at"],
      properties: {
        credential_id: canonicalId("entity"),
        type: { type: "string", enum: ["x509-svid", "jwt-svid", "cloud-token", "projected-service-account-token", "device-certificate", "other"] },
        issued_at: timestamp,
        expires_at: timestamp,
        public_key_fingerprint: { type: ["string", "null"] },
      },
    },
    attestation: {
      type: "object",
      additionalProperties: false,
      required: ["attestation_id", "result", "verified_at", "selectors", "trust_policy_version"],
      properties: {
        attestation_id: { type: "string" },
        result: { type: "string", enum: ["verified", "failed", "expired", "unresolved"] },
        verified_at: timestamp,
        selectors: { type: "object", additionalProperties: { type: ["string", "number", "boolean"] } },
        trust_policy_version: { type: "string" },
      },
    },
    artifact_binding: {
      type: "object",
      additionalProperties: false,
      required: ["artifact_id", "artifact_digest", "configuration_digest", "verified_at"],
      properties: {
        artifact_id: canonicalId("entity"),
        artifact_digest: digest,
        configuration_digest: digest,
        agent_version_id: { type: ["string", "null"] },
        model_deployment_id: { type: ["string", "null"] },
        binding_signature_ref: { type: ["string", "null"] },
        verified_at: timestamp,
      },
    },
    status: { type: "string", enum: ["registered", "attested", "active", "stale", "revoked", "retired"] },
    last_renewed_at: nullableTimestamp,
    revoked_at: nullableTimestamp,
  },
});

writeJson("agent-identity.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/agent-identity.schema.json",
  title: "Quilr Agent Identity Bundle",
  type: "object",
  additionalProperties: false,
  required: ["tenant_id", "definition", "version", "deployment", "runtime_binding"],
  properties: {
    tenant_id: { type: "string" },
    definition: {
      type: "object",
      additionalProperties: false,
      required: ["agent_definition_id", "name", "purpose", "business_owner_id", "technical_owner_id", "lifecycle_state"],
      properties: {
        agent_definition_id: canonicalId("entity"),
        name: { type: "string" },
        purpose: { type: "string" },
        business_owner_id: canonicalId("entity"),
        technical_owner_id: canonicalId("entity"),
        intended_users: { type: "array", items: { type: "string" } },
        intended_systems: { type: "array", items: { type: "string" } },
        intended_data: { type: "array", items: { type: "string" } },
        approved_capabilities: { type: "array", items: { type: "string" } },
        prohibited_capabilities: { type: "array", items: { type: "string" } },
        lifecycle_state: { type: "string", enum: ["defined", "approved", "active", "suspended", "retired"] },
      },
    },
    version: {
      type: "object",
      additionalProperties: false,
      required: ["agent_version_id", "semantic_version", "manifest_digest", "source_revision", "artifact_digest"],
      properties: {
        agent_version_id: canonicalId("entity"),
        semantic_version: { type: "string" },
        manifest_digest: digest,
        source_revision: {
          type: "object",
          required: ["repository_id", "algorithm", "object_type", "oid"],
          properties: {
            repository_id: { type: "string" },
            algorithm: { type: "string", enum: ["git-sha1", "git-sha256"] },
            object_type: { const: "commit" },
            oid: { type: "string" },
            swhid: { type: ["string", "null"] },
          },
          additionalProperties: false,
        },
        artifact_digest: digest,
        prompt_bundle_digest: digest,
        tool_manifest_digests: { type: "array", items: digest },
        model_routing_digest: digest,
        configuration_digest: digest,
        evaluation_suite_digest: digest,
      },
    },
    deployment: {
      type: "object",
      additionalProperties: false,
      required: ["agent_deployment_id", "environment", "region", "deployment_revision", "artifact_digest", "configuration_digest", "deployed_by", "deployed_at"],
      properties: {
        agent_deployment_id: canonicalId("entity"),
        environment: { type: "string" },
        region: { type: "string" },
        deployment_revision: { type: "string" },
        artifact_digest: digest,
        configuration_digest: digest,
        deployed_by: canonicalId("entity"),
        deployed_at: timestamp,
      },
    },
    runtime_binding: {
      type: "object",
      additionalProperties: false,
      required: ["workload_id", "binding_verified_at"],
      properties: {
        workload_id: canonicalId("entity"),
        runtime_instance_id: { type: ["string", "null"] },
        binding_attestation_id: { type: ["string", "null"] },
        binding_verified_at: timestamp,
      },
    },
  },
});

writeJson("model-identity.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/model-identity.schema.json",
  title: "Quilr Model Identity Bundle",
  type: "object",
  additionalProperties: false,
  required: ["tenant_id", "provider", "family", "version", "deployment", "route"],
  properties: {
    tenant_id: { type: "string" },
    provider: {
      type: "object",
      additionalProperties: false,
      required: ["model_provider_id", "name"],
      properties: {
        model_provider_id: canonicalId("entity"),
        name: { type: "string" },
        provider_account_id: { type: ["string", "null"] },
        provider_tenant_id: { type: ["string", "null"] },
      },
    },
    family: {
      type: "object",
      additionalProperties: false,
      required: ["model_family_id", "name"],
      properties: {
        model_family_id: canonicalId("entity"),
        name: { type: "string" },
      },
    },
    version: {
      type: "object",
      additionalProperties: false,
      required: ["model_version_id", "provider_native_id", "identity_availability"],
      properties: {
        model_version_id: canonicalId("entity"),
        provider_native_id: { type: "string" },
        snapshot_id: { type: ["string", "null"] },
        model_artifact_id: { type: ["string", "null"] },
        model_manifest_digest: { oneOf: [digest, { type: "null" }] },
        tokenizer_digest: { oneOf: [digest, { type: "null" }] },
        adapter_digests: { type: "array", items: digest },
        configuration_digest: { oneOf: [digest, { type: "null" }] },
        identity_availability: { type: "string", enum: ["provider_claim_only", "provider_snapshot", "artifact_manifest_verified"] },
      },
    },
    deployment: {
      type: "object",
      additionalProperties: false,
      required: ["model_deployment_id", "endpoint", "region", "environment"],
      properties: {
        model_deployment_id: canonicalId("entity"),
        endpoint: { type: "string" },
        region: { type: "string" },
        environment: { type: "string" },
        serving_workload_id: { type: ["string", "null"] },
        runtime_image_digest: { oneOf: [digest, { type: "null" }] },
        deployed_at: nullableTimestamp,
      },
    },
    route: {
      type: "object",
      additionalProperties: false,
      required: ["model_route_id", "alias", "resolved_model_version_id", "resolved_deployment_id", "valid_from", "resolver_version"],
      properties: {
        model_route_id: canonicalId("entity"),
        alias: { type: "string" },
        resolved_model_version_id: canonicalId("entity"),
        resolved_deployment_id: canonicalId("entity"),
        valid_from: timestamp,
        valid_until: nullableTimestamp,
        routing_policy_id: { type: ["string", "null"] },
        resolver_version: { type: "string" },
      },
    },
  },
});

writeJson("credential-grant.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/credential-grant.schema.json",
  title: "Quilr Credential Grant and Delegation",
  type: "object",
  additionalProperties: false,
  required: ["grant_id", "tenant_id", "issuer", "subject_id", "actor_id", "audiences", "actions", "resources", "issued_at", "expires_at", "status", "delegation"],
  properties: {
    grant_id: canonicalId("grant"),
    tenant_id: { type: "string" },
    issuer: { type: "string" },
    subject_id: canonicalId("entity"),
    actor_id: canonicalId("entity"),
    credential_id: { type: ["string", "null"] },
    parent_grant_id: { type: ["string", "null"] },
    audiences: { type: "array", minItems: 1, items: { type: "string" } },
    actions: { type: "array", minItems: 1, items: { type: "string" } },
    resources: { type: "array", minItems: 1, items: { type: "string" } },
    data_constraints: { type: "array", items: { type: "string" } },
    authorization_details: { type: "array", items: { type: "object", additionalProperties: true } },
    purpose: { type: "string" },
    environment: { type: "string" },
    spend_limit: { type: ["number", "null"], minimum: 0 },
    issued_at: timestamp,
    expires_at: timestamp,
    status: { type: "string", enum: ["pending", "active", "expired", "revoked", "consumed"] },
    key_binding: {
      type: "object",
      additionalProperties: false,
      properties: {
        method: { type: "string", enum: ["none", "dpop", "mtls", "workload", "other"] },
        jwk_thumbprint: { type: ["string", "null"] },
        certificate_fingerprint: { type: ["string", "null"] },
      },
      required: ["method"],
    },
    delegation: {
      type: "object",
      additionalProperties: false,
      required: ["depth", "maximum_depth", "attenuation_verified"],
      properties: {
        delegation_id: { type: ["string", "null"] },
        depth: { type: "integer", minimum: 0 },
        maximum_depth: { type: "integer", minimum: 0 },
        attenuation_verified: { type: "boolean" },
        verified_against_parent_at: nullableTimestamp,
      },
    },
    revocation: {
      type: "object",
      additionalProperties: false,
      properties: {
        revoked_at: nullableTimestamp,
        revoked_by: { type: ["string", "null"] },
        reason: { type: ["string", "null"] },
        descendants_status: { type: "string", enum: ["not_applicable", "pending", "revoked", "failed"] },
      },
    },
  },
});

writeJson("artifact-identity.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/artifact-identity.schema.json",
  title: "Quilr Artifact Identity",
  type: "object",
  additionalProperties: false,
  required: ["artifact_id", "tenant_id", "artifact_type", "coordinate", "digest", "created_at", "source_revisions", "verification_status"],
  properties: {
    artifact_id: canonicalId("entity"),
    tenant_id: { type: ["string", "null"] },
    artifact_type: { type: "string", enum: ["oci_manifest", "oci_index", "package", "binary", "agent_manifest", "prompt_bundle", "tool_manifest", "model_manifest", "policy_bundle", "configuration_bundle", "sbom", "other"] },
    coordinate: { type: "string" },
    digest,
    created_at: timestamp,
    source_revisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["repository_id", "algorithm", "object_type", "oid"],
        properties: {
          repository_id: { type: "string" },
          algorithm: { type: "string", enum: ["git-sha1", "git-sha256"] },
          object_type: { type: "string", enum: ["blob", "tree", "commit", "annotated_tag"] },
          oid: { type: "string" },
          swhid: { type: ["string", "null"] },
        },
      },
    },
    build_id: { type: ["string", "null"] },
    release_id: { type: ["string", "null"] },
    sbom_ids: { type: "array", items: { type: "string" } },
    signature_ids: { type: "array", items: { type: "string" } },
    provenance_ids: { type: "array", items: { type: "string" } },
    verification_status: { type: "string", enum: ["unverified", "verified", "failed", "revoked", "expired"] },
    trust_policy_version: { type: ["string", "null"] },
  },
});

writeJson("provenance-record.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/provenance-record.schema.json",
  title: "Quilr Provenance Record",
  type: "object",
  additionalProperties: false,
  required: ["provenance_id", "tenant_id", "predicate_type", "subjects", "builder_identity", "build_id", "started_at", "finished_at", "materials", "attestation_digest", "verification"],
  properties: {
    provenance_id: canonicalId("provenance"),
    tenant_id: { type: ["string", "null"] },
    statement_type: { type: "string", default: "https://in-toto.io/Statement/v1" },
    predicate_type: { type: "string" },
    subjects: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "digest"],
        properties: { name: { type: "string" }, digest },
      },
    },
    builder_identity: { type: "string" },
    build_id: { type: "string" },
    build_platform: { type: "string" },
    build_definition: { type: "string" },
    external_parameters: { type: "object", additionalProperties: true },
    started_at: timestamp,
    finished_at: timestamp,
    materials: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["uri", "digest"],
        properties: { uri: { type: "string" }, digest },
      },
    },
    attestation_digest: digest,
    signature_ids: { type: "array", items: { type: "string" } },
    transparency_records: { type: "array", items: { type: "string" } },
    verification: {
      type: "object",
      additionalProperties: false,
      required: ["status", "verified_at", "verifier_identity", "trust_policy_version"],
      properties: {
        status: { type: "string", enum: ["verified", "failed", "unverified", "expired", "revoked"] },
        verified_at: timestamp,
        verifier_identity: { type: "string" },
        trust_policy_version: { type: "string" },
        expected_builder: { type: ["string", "null"] },
        subject_match: { type: "boolean" },
        source_match: { type: "boolean" },
      },
    },
  },
});

writeJson("federation.schema.json", {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.quilr.ai/identity/federation.schema.json",
  title: "Quilr Federation Relationship",
  type: "object",
  additionalProperties: false,
  required: ["federation_id", "tenant_id", "federation_type", "local_trust_domain", "remote_issuer_or_trust_domain", "trust_anchors", "accepted_audiences", "subject_mapping", "claim_mapping", "permitted_entity_types", "effective_from", "owner_id", "last_verified", "status"],
  properties: {
    federation_id: canonicalId("federation"),
    tenant_id: { type: "string" },
    federation_type: { type: "string", enum: ["oidc", "saml", "spiffe", "cloud-workload", "kubernetes-cloud", "cicd-cloud", "oauth", "other"] },
    local_trust_domain: { type: "string" },
    remote_issuer_or_trust_domain: { type: "string" },
    trust_anchors: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "reference", "fingerprint_or_version"],
        properties: {
          type: { type: "string", enum: ["jwks", "x509_bundle", "spiffe_bundle", "saml_metadata", "cloud_issuer", "other"] },
          reference: { type: "string" },
          fingerprint_or_version: { type: "string" },
        },
      },
    },
    accepted_audiences: { type: "array", minItems: 1, items: { type: "string" } },
    subject_mapping: { type: "object", additionalProperties: true },
    claim_mapping: { type: "object", additionalProperties: true },
    permitted_entity_types: { type: "array", items: { type: "string", enum: identityKinds } },
    effective_from: timestamp,
    expires_at: nullableTimestamp,
    metadata_version: { type: ["string", "null"] },
    trust_bundle_version: { type: ["string", "null"] },
    owner_id: canonicalId("entity"),
    last_verified: timestamp,
    status: { type: "string", enum: ["configured", "verified", "degraded", "expired", "revoked"] },
    verification_evidence_ref: { type: "string" },
  },
});

const identitySchemaNames = [
  "canonical-identity.schema.json",
  "identifier-record.schema.json",
  "identity-observation.schema.json",
  "actor-chain.schema.json",
  "workload-identity.schema.json",
  "agent-identity.schema.json",
  "model-identity.schema.json",
  "credential-grant.schema.json",
  "artifact-identity.schema.json",
  "provenance-record.schema.json",
  "federation.schema.json",
];
const identityMatrixNames = [
  "identity-types.csv",
  "identifier-namespaces.csv",
  "identifier-strength.csv",
  "field-authority.csv",
  "identity-sources.csv",
  "identity-resolution-rules.csv",
  "identity-lifecycle.csv",
  "human-account-linking.csv",
  "non-human-identities.csv",
  "workload-identity-support.csv",
  "credential-types.csv",
  "secret-metadata.csv",
  "artifact-identifiers.csv",
  "provenance-support.csv",
  "delegation-types.csv",
  "identity-events.csv",
  "identity-findings.csv",
  "identity-metrics.csv",
  "current-to-target-identity.csv",
  "current-identity-field-mapping.csv",
  "current-identity-mechanism-mapping.csv",
  "identity-mechanism-status.csv",
  "attribution-coverage.csv",
  "current-identity-gaps.csv",
  "identity-service-catalog.csv",
  "identity-api-catalog.csv",
  "identity-golden-scenarios.csv",
  "identity-validation.csv",
];

for (const name of [...identitySchemaNames.map((item) => path.join(schemasDir, item)), ...identityMatrixNames.map((item) => path.join(matricesDir, item))]) {
  if (!fs.existsSync(name)) throw new Error(`Missing generated artifact ${name}`);
}

const counts = {
  generated_at: new Date().toISOString(),
  canonical_entity_types_evaluated: canonicalEntities.length,
  identity_extension_entity_types: identityExtensionEntities.length,
  total_identity_types_evaluated: identityKinds.length,
  identifier_namespaces: namespaces.length,
  identifier_strength_rules: strengthRows.length,
  field_authority_rules: fieldAuthorityRows.length,
  identity_sources_evaluated: sourceCapabilityRows.length,
  resolution_rule_sets: identityTypeRows.length,
  lifecycle_states: lifecycleRows.length,
  non_human_principal_types: nonHumanRows.length,
  workload_profiles: workloadRows.length,
  credential_types: credentialRows.length,
  artifact_identifier_types: artifactRows.length,
  identity_event_types: identityEventRows.length,
  identity_finding_types: identityFindingRows.length,
  identity_metrics: identityMetricRows.length,
  current_identity_gaps: currentGapRows.length,
  identity_services: serviceRows.length,
  identity_api_operations: apiRows.length,
  golden_scenarios: goldenScenarioRows.length,
  validation_checks: validationRows.length,
  identity_schemas: identitySchemaNames.length,
  identity_matrices: identityMatrixNames.length,
  generator_sha256: crypto.createHash("sha256").update(fs.readFileSync(fileURLToPath(import.meta.url))).digest("hex"),
};
fs.writeFileSync(path.join(root, "identity-artifact-counts.json"), `${JSON.stringify(counts, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
