#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const workspace = path.resolve(import.meta.dirname, "../../../");
const outRoot = path.resolve(import.meta.dirname, "..");
const matricesDir = path.join(outRoot, "matrices");
const schemasDir = path.join(outRoot, "schemas");

for (const directory of [matricesDir, schemasDir]) {
  fs.mkdirSync(directory, { recursive: true });
}

const sourceRoots = [
  {
    root: "Browser-extension-sensor-analysis/outputs/repository-analysis",
    system: "Browser extension, native host, and Browser Extension Service",
  },
  {
    root: "Endpoint-agent-sensor-analysis/repository-analysis",
    system: "Endpoint agent, endpoint dashboard/API, and IPC",
  },
  {
    root: "LLM-gateway-sensor-analysis/outputs/repository-analysis",
    system: "LLM/DLP gateway and workers",
  },
  {
    root: "quilr-platform-analysis",
    system: "Current Quilr 1 web and query-builder platform",
  },
];

const documentExtensions = new Set([".md", ".json", ".csv", ".yaml", ".yml", ".txt"]);

function walk(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(workspace, absolute);
    if (entry.isDirectory()) {
      if (
        entry.name === "work" ||
        relative.includes("/work/") ||
        relative.startsWith("docs/quilr2-cross-sensor")
      ) {
        continue;
      }
      result.push(...walk(absolute));
      continue;
    }
    if (documentExtensions.has(path.extname(entry.name).toLowerCase())) {
      result.push(absolute);
    }
  }
  return result;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value).replace(/\r?\n/g, " ");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, headers, rows) {
  const content = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(file, `${content}\n`);
}

function stripMarkdown(value) {
  return value
    .trim()
    .replaceAll("`", "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replaceAll("<br>", "; ")
    .replaceAll("<br/>", "; ")
    .replaceAll("→", " -> ");
}

function firstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function classifyDocument(relative) {
  if (relative.includes("/inventory/") || relative.includes("01-inventory")) return "inventory ledger";
  if (relative.includes("/07-symbol-reference/")) return "symbol reference";
  if (relative.includes("/evidence/") || relative.includes("/generated/")) return "machine evidence ledger";
  if (relative.includes("/api/") || relative.includes("10-api")) return "API/interface reference";
  if (relative.includes("/routes/") || relative.includes("/cross-repository/")) return "route/traceability reference";
  if (relative.endsWith(".json")) return "machine-readable analysis index";
  if (relative.includes("data-dictionary")) return "data dictionary";
  if (relative.includes("data-models")) return "data/storage model";
  if (relative.includes("open-questions")) return "unresolved-evidence ledger";
  if (relative.includes("analysis-coverage")) return "coverage ledger";
  return "analysis narrative";
}

function evidenceLevel(relative) {
  if (
    relative.includes("/inventory/") ||
    relative.includes("/07-symbol-reference/") ||
    relative.includes("/evidence/") ||
    relative.includes("/generated/") ||
    relative.endsWith(".json")
  ) {
    return "Verified mechanical evidence; semantic use requires narrative corroboration";
  }
  if (relative.includes("open-questions")) return "Unresolved evidence boundary";
  return "Mixed labeled evidence (Verified/Inference/Unresolved/Contradiction)";
}

function relevantDomains(relative) {
  const lower = relative.toLowerCase();
  const domains = [];
  for (const [needle, domain] of [
    ["browser", "browser"],
    ["endpoint", "endpoint"],
    ["mcp", "MCP"],
    ["llm", "LLM"],
    ["gateway", "gateway"],
    ["find", "findings"],
    ["data", "data"],
    ["storage", "storage"],
    ["api", "API"],
    ["security", "security"],
    ["event", "events"],
    ["inventory", "inventory"],
    ["relation", "relationships"],
    ["config", "configuration"],
    ["test", "tests"],
  ]) {
    if (lower.includes(needle)) domains.push(domain);
  }
  return domains.length ? [...new Set(domains)].join("; ") : "cross-cutting";
}

const inputRows = [];
for (const root of sourceRoots) {
  const absoluteRoot = path.join(workspace, root.root);
  for (const absolute of walk(absoluteRoot).sort()) {
    const relative = path.relative(workspace, absolute);
    const content = fs.readFileSync(absolute);
    const text = content.toString("utf8");
    inputRows.push({
      Input: relative,
      "System or sensor": root.system,
      "Document type": classifyDocument(relative),
      "Evidence level": evidenceLevel(relative),
      "Relevant domains": relevantDomains(relative),
      "Analysis status": "Analyzed",
      Bytes: content.length,
      "SHA-256": crypto.createHash("sha256").update(content).digest("hex"),
      Title: firstHeading(text),
    });
  }
}

writeCsv(
  path.join(matricesDir, "input-coverage.csv"),
  [
    "Input",
    "System or sensor",
    "Document type",
    "Evidence level",
    "Relevant domains",
    "Analysis status",
    "Bytes",
    "SHA-256",
    "Title",
  ],
  inputRows,
);

const fieldSources = [
  {
    file: "Browser-extension-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md",
    sensor: "Browser extension / native host / BES",
  },
  {
    file: "Endpoint-agent-sensor-analysis/repository-analysis/08-data-dictionary.md",
    sensor: "Endpoint agent ecosystem",
  },
  {
    file: "LLM-gateway-sensor-analysis/outputs/repository-analysis/08-data-dictionary.md",
    sensor: "LLM/DLP gateway ecosystem",
  },
  {
    file: "quilr-platform-analysis/08-data-dictionary.md",
    sensor: "Quilr 1 aggregation/query platform",
  },
];

function tableCells(line) {
  if (!line.trim().startsWith("|")) return [];
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map(stripMarkdown);
}

function dispositionFor(name, section, meaning) {
  const field = name.toLowerCase();
  const context = `${name} ${section}`.toLowerCase();
  if (/^file\.(name|size|type|lastmodified)$/.test(field)) {
    return ["Normalized event field", "Canonical data-transfer event", "Activity/evidence drill-down"];
  }
  if (/(request|event|context|prompt|session|run|step|action)[_. -]?id/.test(field)) {
    return ["Normalized event field", "Canonical event correlation alias", "Activity/evidence drill-down"];
  }
  if (/prompt|content|body|entity.?text|file.?path|justification|secret|authorization|(^|[_. -])token|api.?key|credential/.test(field)) {
    return ["Evidence-only field", "Protected evidence or Credential", "Drill-down with privilege"];
  }
  if (/tenant|subscriber|canonical.?id|device.?id|user.?id|email|account|application|app.?id|model|provider|agent|mcp|tool|fingerprint/.test(field)) {
    return ["Canonical entity identity", "Entity/alias registry", "Yes where actionable"];
  }
  if (/action|decision|policy|detection|sensitive|risk|outcome|status|approval|block|allow/.test(field)) {
    return ["Finding signal", "Canonical event and finding signal", "Findings/event drill-down"];
  }
  if (/timestamp|time|date|seen|created|updated|event/.test(field)) {
    return ["Normalized event field", "Canonical event", "Activity drill-down"];
  }
  if (/cost|usage|latency|count|size|rate/.test(field)) {
    return ["Metric input", "Event usage/economic attributes", "Aggregated only"];
  }
  if (/relationship|owner|member|parent|source.?application|destination/.test(field)) {
    return ["Canonical relationship", "Typed relationship", "Contextual"];
  }
  if (/\b(debug|timeout|queue|buffer|cache|pool|port|path|retry|worker|config|feature|limit|interval)\b/.test(context)) {
    return ["Raw-only retained field", "Operational telemetry/configuration", "No"];
  }
  return ["Source observation attribute", "Source observation", "Drill-down"];
}

const sourceFieldRows = [];
for (const descriptor of fieldSources) {
  const absolute = path.join(workspace, descriptor.file);
  const lines = fs.readFileSync(absolute, "utf8").split(/\r?\n/);
  let section = "";
  let headers = [];
  let rowNumber = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##+\s/.test(line)) section = line.replace(/^##+\s+/, "").trim();
    const cells = tableCells(line);
    if (!cells.length) continue;
    if (cells.every((cell) => /^:?-+:?$/.test(cell.replaceAll(" ", "")))) continue;
    if (!headers.length || !lines[index - 1]?.trim().startsWith("|")) {
      headers = cells;
      continue;
    }
    if (cells[0] === headers[0]) continue;
    rowNumber += 1;
    const nativeField = cells[0];
    const meaning = cells.slice(1).join(" | ");
    const [destination, target, visibility] = dispositionFor(nativeField, section, meaning);
    sourceFieldRows.push({
      "Field ID": `${descriptor.sensor.replaceAll(/[^A-Za-z0-9]/g, "_").toLowerCase()}_${String(rowNumber).padStart(4, "0")}`,
      Sensor: descriptor.sensor,
      "Native field": nativeField,
      Meaning: meaning,
      Section: section,
      Source: `${descriptor.file}:${index + 1}`,
      "Direct or inferred": "Directly documented; see source row for field-specific qualification",
      Type: cells[1] || "Unresolved",
      "Native identifier": /id|key|email|domain|name|hash|fingerprint/i.test(nativeField) ? "Candidate; resolver rules apply" : "No",
      Cardinality: "Source-specific; see evidence",
      Scope: /tenant|subscriber/i.test(nativeField)
        ? "Tenant"
        : /user|email/i.test(nativeField)
          ? "User"
          : /device|process/i.test(nativeField)
            ? "Device/process"
            : /request|event|session|run/i.test(nativeField)
              ? "Event/session"
              : "Source-specific",
      "Collection method": "Existing source path documented in analysis",
      "Extraction point": `${descriptor.file}:${index + 1}`,
      Freshness: "Source-specific; not globally guaranteed",
      History: "Preserve observation history; current source may not",
      Reliability: "See source error/recovery analysis",
      Sensitivity: /prompt|content|email|token|key|credential|path|identity|user/i.test(`${nativeField} ${meaning}`)
        ? "Sensitive or isolation-critical"
        : "Operational",
      Confidence: "Verified source-document datum",
      "Canonical destination": destination,
      "Canonical target": target,
      "Product visibility": visibility,
      Gaps: "Exact runtime population/retention may remain unresolved",
      "User-facing?": visibility,
      Reason: `Disposition follows ${section || "source"} semantics; raw value and provenance are retained.`,
    });
  }
}

const schemaLedger =
  "Browser-extension-sensor-analysis/outputs/repository-analysis/generated/browser-extension-service-schema-ledger.md";
{
  const lines = fs.readFileSync(path.join(workspace, schemaLedger), "utf8").split(/\r?\n/);
  let schema = "";
  let rowNumber = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^## `(.+)`$/);
    if (heading) schema = heading[1];
    const cells = tableCells(lines[index]);
    if (cells.length !== 7 || cells[0] === "Schema key" || /^-+$/.test(cells[0])) continue;
    rowNumber += 1;
    const [destination, target, visibility] = dispositionFor(cells[0], schema, cells[1]);
    sourceFieldRows.push({
      "Field ID": `bes_schema_${String(rowNumber).padStart(4, "0")}`,
      Sensor: "Browser Extension Service transformation schema",
      "Native field": cells[0],
      Meaning: `Source ${cells[1]}; output ${cells[2]}; field kind ${cells[3]}; custom function ${cells[5] || "none"}`,
      Section: schema,
      Source: `${schemaLedger}:${index + 1}`,
      "Direct or inferred": "Direct configured mapping; validation metadata is not enforced by current transformer",
      Type: cells[4] || "Unresolved",
      "Native identifier": /id|email|domain|name|fingerprint/i.test(cells[0]) ? "Candidate; resolver rules apply" : "No",
      Cardinality: "One mapped output per transformed record unless source array",
      Scope: /tenant|subscriber/i.test(cells[0]) ? "Tenant" : "Event",
      "Collection method": "BES event transformation",
      "Extraction point": `${schemaLedger}:${index + 1}`,
      Freshness: "Per ingested event",
      History: "Downstream Kafka/DWH dependent",
      Reliability: "Current transformer maps missing values to null; schema required/type metadata is descriptive",
      Sensitivity: /prompt|user|account|credential|email|content/i.test(`${cells[0]} ${cells[1]}`)
        ? "Sensitive or PII"
        : "Operational",
      Confidence: "Verified configured mapping",
      "Canonical destination": destination,
      "Canonical target": target,
      "Product visibility": visibility,
      Gaps: cells[6] ? `Validation metadata ${cells[6]} is not currently enforced` : "Runtime value population not proven",
      "User-facing?": visibility,
      Reason: `Configured BES mapping in ${schema}. Preserve original payload and transformed value.`,
    });
  }
}

writeCsv(
  path.join(matricesDir, "source-fields.csv"),
  [
    "Field ID",
    "Sensor",
    "Native field",
    "Meaning",
    "Section",
    "Source",
    "Direct or inferred",
    "Type",
    "Native identifier",
    "Cardinality",
    "Scope",
    "Collection method",
    "Extraction point",
    "Freshness",
    "History",
    "Reliability",
    "Sensitivity",
    "Confidence",
    "Canonical destination",
    "Canonical target",
    "Product visibility",
    "Gaps",
  ],
  sourceFieldRows,
);

writeCsv(
  path.join(matricesDir, "field-disposition.csv"),
  ["Field ID", "Sensor", "Native field", "Meaning", "Canonical destination", "Canonical target", "User-facing?", "Reason", "Source"],
  sourceFieldRows,
);

writeCsv(
  path.join(matricesDir, "data-disposition.csv"),
  ["Native datum", "Sensor", "Inventory", "Relationship", "Event", "Finding signal", "Metric", "Evidence", "Raw only", "Source"],
  sourceFieldRows.map((row) => {
    const destination = row["Canonical destination"];
    return {
      "Native datum": row["Native field"],
      Sensor: row.Sensor,
      Inventory: /entity identity|entity attribute/i.test(destination) ? "Yes" : "",
      Relationship: /relationship/i.test(destination) ? "Yes" : "",
      Event: /event field/i.test(destination) ? "Yes" : "",
      "Finding signal": /finding signal/i.test(destination) ? "Yes" : "",
      Metric: /metric input/i.test(destination) ? "Yes" : "",
      Evidence: /evidence/i.test(destination) ? "Yes" : "",
      "Raw only": /raw-only|discarded|unresolved/i.test(destination) ? "Yes" : "",
      Source: row.Source,
    };
  }),
);

const sensorCapabilities = [
  ["Browser extension (Vanguard)", "Web AI application/domain; browser; extension instance; page file metadata", "Page visit/interaction; prompt/copy/paste; upload interception; allow/block/override/cancel; diagnostics", "requestId; domain/origin; persona tenant/subscriber; browser tab", "user USES web surface; browser SUBMITTED interaction; upload TARGETED application", "Extension page/content/background messages and BES routes", "Exact model/provider, durable account identity, local file path, and non-browser activity"],
  ["Browser native host (Project Sentinel)", "Local file candidate; clipboard content; persona; native-host instance", "File resolution/scan; clipboard copy/modify/block/restore; heartbeat; updater/config actions", "SystemEvent.id; file metadata tuple; persona identity", "file RESOLVED_TO local path; event OBSERVED_ON device", "Chrome native messaging frames and local SQLite", "Stable per-file request ID, authoritative user account, exact browser origin without paired message"],
  ["Browser Extension Service", "Persona; deployment; browser/device heartbeat; application/domain; event transformation records", "Heartbeat; DLP/risk/audit ingestion; app settings; registration; export lifecycle", "tenant/subscriber; personaId; device ID; email; context_id/prompt_id", "persona ACCESSED_ON workstation; persona USING_BROWSER browser", "181 Spring mappings; Kafka; PostgreSQL; Neo4j; Redis; ClickHouse/DWH", "Proprietary decoder/graph/DWH semantics and production routing/retention"],
  ["Endpoint System Monitor v2", "Application; MCP server; hook; skill; agent; model; controlled repository; permission; plugin; device/user context", "Discovery; rediscovery; governance sync; process enforcement; IDE hook activity", "local UUIDv5; backend canonical_id; device ID; tenant/email-derived IDs", "artifact BELONGS_TO application; application OBSERVED_ON device; governance APPLIES_TO entity", "Lua/process/package scans; gzip POST discovered-apps; delta poll", "Typed converter discards raw relationships/risk and rich fields; same-name collision defects"],
  ["Endpoint proxy/DLP", "Process attribution; destination; request/response payload; DLP finding; policy action", "HTTP/TLS request; data extraction; allow/block/ask/monitor; alert; justification", "flow tuple; uniqueness hash; process/PID; destination", "process CONNECTED_TO destination; request CARRIED data; decision GOVERNED_BY policy", "Explicit/transparent proxy hooks, DLP adapters, local IPC", "Some analyzer failures fail open; UDP/IPv6/process attribution gaps; external SDK behavior"],
  ["Endpoint IDE hooks", "IDE session; prompts; tools; files; commands; application", "Hook frame; activity batch; evaluator decision", "session ID; app/process context", "human/IDE INITIATED activity; activity MENTIONS tool/file", "Local hook socket and activity HTTP batch", "Production evaluator currently always allows; no DLP/policy enforcement"],
  ["Endpoint Persona/email discovery", "Email candidates; OS accounts; tenant/subscriber; device identity", "Identity discovery and Persona bootstrap", "email; source list; device ID", "user OBSERVED_ON device", "Nine local sources; framed local IPC", "Peer authentication and concurrent fixed endpoint are unresolved"],
  ["Endpoint diagnostics", "Sensor/process component; diagnostic code; context", "Diagnostic event/batch/lifecycle", "UUID; component; code; timestamp", "event OBSERVED_BY component/sensor", "Local broker, NDJSON, OpenSearch bulk", "Source identity is claimable; receiver regenerates some identity/time"],
  ["Endpoint Dashboard/API", "Tenant asset/entity/relationship/policy/config/health records", "Asset ingest; relationship/activity queries; policy edits", "tenant/subscriber and ClickHouse record IDs", "UI-projected relationships", "Go HTTP routes and ClickHouse", "Dashboard is an aggregator, not authoritative observation; deployed contracts may drift"],
  ["LLM/DLP gateway", "Application/API key; user; provider; model/deployment/route; prompt; response; tools; policy config", "Model invocation; prompt/response; DLP/Guardian/hallucination; rate/concurrency; provider outcome; cost/usage", "tenant_id; request_id; user_id/email; api_key_hash; context_id; provider/model", "user/agent INVOKED model THROUGH gateway; request GOVERNED_BY policy", "287 BlackSheep routes; SQLite; NATS; ClickHouse; provider adapters", "Direct-provider bypass is invisible; application/agent attribution varies by credential"],
  ["LLM/DLP workers", "Detector/model worker and versions where emitted; classifications", "Detection result/complete/error; embeddings; red-team; DB write", "request_id and request-scoped NATS subjects", "result SUPPORTED_BY worker; event CLASSIFIED_AS data class", "JetStream/core NATS subjects and Rust/Python workers", "No universal dead-letter; some production consumers absent"],
  ["Endpoint Config Manager", "Tenant endpoint config; exclusions; scoped DLP/hook config", "Config get/save/delete/reset/resolve; dependency-security check", "tenant; config version", "configuration APPLIES_TO scope", "HTTP + tenant_configs.sqlite3", "No application-level authentication; not launched by tracked production supervisor"],
  ["Gateway-health probes", "Provider/MCP endpoint health target", "Periodic probe and rollup", "app key/scope key; hour bucket", "probe TARGETS provider/MCP endpoint", "Outbound probes + SQLite rollup API", "Synthetic reachability only; not usage or authorization evidence"],
  ["External MCP Gateway", "MCP clients, servers, tools, prompts/resources, policies and gateway activity as exposed to UI/QB", "Tool/MCP findings, requests, agent/latency metrics", "External service IDs and warehouse fields (contract incomplete)", "client CONNECTS_TO server; server PROVIDES tool; agent CALLS tool", "Frontend external APIs plus query-builder /mcp/gateway analytics", "Source repository and authoritative schemas were not supplied"],
  ["Quilr 1 query-builder/warehouse", "Inventory rows, users, accounts, applications, devices, alerts, status, compliance, audit", "Request-time queries, enrichment, approvals, resolution and dashboards", "table-specific IDs; tenant/subscriber; source enum-like values", "Mostly reconstructed/projected at query time", "141 Spring routes over ClickHouse/PostgreSQL/Redis/Neo4j", "Not a sensor; source identity is fragmented and graph authority unresolved"],
  ["Identity/IdP integration boundary", "Tenant/user/group and quilr_idp_apps records where synchronized", "Identity/app sync and account existence checks", "IdP user/app IDs where present; email fallback", "user MEMBER_OF group; user HAS account", "External identity APIs, graph, quilr_idp_apps", "Contracts and field authority outside supplied source"],
  ["SaaS/connector integration boundary", "Connected application/account metadata exposed by integrations UI/services", "Connect/disconnect/sync/OAuth lifecycle", "connector instance/account IDs where external service supplies them", "connector AUTHENTICATES connected account", "External instance-manager/integration APIs", "No connector source repository or complete event schema supplied"],
].map(([sensor, directObjects, directEvents, nativeIds, relationships, extractionPoint, blindSpots]) => ({
  Sensor: sensor,
  "Direct objects": directObjects,
  "Direct events": directEvents,
  "Native IDs": nativeIds,
  Relationships: relationships,
  "Extraction point": extractionPoint,
  "Blind spots": blindSpots,
}));

writeCsv(
  path.join(matricesDir, "sensor-capabilities.csv"),
  ["Sensor", "Direct objects", "Direct events", "Native IDs", "Relationships", "Extraction point", "Blind spots"],
  sensorCapabilities,
);

const entityTypes = [
  ["Tenant", "Boundary", "First-class inventory object", "tenant_id", "Tenant-scoped authority boundary"],
  ["Organization Unit", "Boundary", "First-class inventory object", "authoritative external org ID", "Department/team/project/cost-center facets via typed subtype"],
  ["Human User", "Identity", "First-class inventory object", "IdP subject + tenant", "Email is secondary and temporal"],
  ["Group", "Identity", "First-class inventory object", "IdP group ID + tenant", "Membership is temporal"],
  ["Service Account", "Identity", "First-class inventory object", "source account ID + tenant", "Do not merge with a human by display name"],
  ["Workload Identity", "Identity", "First-class inventory object", "issuer + subject + tenant", "Runtime principal"],
  ["Credential", "Identity", "First-class inventory object", "tenant + nonreversible fingerprint", "Secret value never canonicalized"],
  ["Session", "Identity", "Event-only object", "source session ID + source + tenant", "Short-lived correlation"],
  ["AI Product", "Application", "First-class global catalog object", "curated product ID", "Vendor product, not tenant usage"],
  ["Application Surface", "Application", "First-class inventory object", "product + surface type + strong surface key", "Web, desktop, IDE extension, API"],
  ["Tenant Application", "Application", "First-class inventory object", "tenant + product/surface instance key", "Management/ownership unit"],
  ["Application Installation", "Application", "Nested object", "tenant + device + bundle/package/path", "Device-local installation"],
  ["Tenant Subscription", "Application", "First-class inventory object", "tenant + vendor tenant/account ID", "Commercial/enterprise subscription"],
  ["Application Account", "Application", "First-class inventory object", "tenant + product + provider account ID", "Personal/enterprise classification is an attribute with evidence"],
  ["Device", "Runtime", "First-class inventory object", "tenant + authoritative device ID", "Endpoint/workstation"],
  ["Browser Instance", "Runtime", "Nested object", "device + browser profile/installation ID", "Version/profile observation"],
  ["Endpoint Process", "Runtime", "Event-only object", "device + pid + start time", "PID alone is never stable"],
  ["Model Provider", "Model", "First-class global catalog object", "provider catalog ID", "Vendor/operator"],
  ["Model Family", "Model", "First-class global catalog object", "provider + normalized family", "Claude/GPT family"],
  ["Model Version", "Model", "First-class inventory object", "provider + exact model identifier", "Immutable/versioned model identity where possible"],
  ["Model Deployment", "Model", "First-class inventory object", "tenant + provider endpoint/deployment ID", "Callable endpoint/configuration"],
  ["Model Route", "Model", "Configuration object", "tenant + gateway + route/alias ID", "May resolve to different deployments over time"],
  ["Agent Definition", "Agent", "First-class inventory object", "tenant + repository/path/native definition ID", "Logical agent"],
  ["Agent Version", "Agent", "First-class inventory object", "definition + artifact digest/version", "Immutable build/config snapshot"],
  ["Agent Deployment", "Agent", "First-class inventory object", "tenant + deployment ID", "Governed runtime deployment"],
  ["Agent Runtime", "Agent", "Nested object", "deployment + workload/device + start time", "Ephemeral process/container"],
  ["Agent Run", "Agent", "Event-only object", "tenant + source run ID", "Correlates steps/model/tool activity"],
  ["MCP Client", "MCP", "First-class inventory object", "tenant + client instance/strong application key", "Client capability distinct from app product"],
  ["MCP Server Product", "MCP", "First-class global catalog object", "curated server ID", "Known server product"],
  ["MCP Server Deployment", "MCP", "First-class inventory object", "tenant + URL/certificate or stdio manifest/deployment key", "Same name is insufficient"],
  ["Tool", "MCP", "First-class inventory object", "server deployment/product + tool name + schema digest", "Capability exposed by a server"],
  ["Tool Version", "MCP", "Nested object", "tool + schema/version digest", "Schema/capability revision"],
  ["Connector", "Integration", "First-class global catalog object", "curated connector ID", "Connector product"],
  ["Integration Instance", "Integration", "First-class inventory object", "tenant + external instance ID", "Tenant configuration of connector"],
  ["Connected Account", "Integration", "First-class inventory object", "integration instance + provider account ID", "Account accessed through connector"],
  ["Data Asset", "Data", "First-class inventory object", "catalog/source asset ID + tenant", "File/repository/KB can be typed subtypes"],
  ["Data Class", "Data", "First-class global/config object", "classification taxonomy + code", "Classification, not copied content"],
  ["Knowledge Base", "Data", "First-class inventory object", "tenant + provider/source KB ID", "Retrieval source"],
  ["Vector Index", "Data", "Nested object", "knowledge base + index ID", "Implementation dependency"],
  ["Memory Store", "Data", "First-class inventory object", "tenant + agent/app + store ID", "Long-lived agent memory"],
  ["Prompt Template", "Data", "Configuration object", "tenant + template ID + version", "Instruction artifact"],
  ["Gateway", "Control", "First-class inventory object", "tenant + deployment/instance ID", "LLM/MCP/API gateway"],
  ["Sensor", "Control", "First-class inventory object", "tenant + sensor installation ID", "Version/health/coverage authority"],
  ["Enforcement Point", "Control", "First-class inventory object", "tenant + deployment + capability", "Where a decision can be enforced"],
  ["Policy", "Control", "First-class inventory object", "tenant + policy ID + version", "Intent and scope"],
  ["Control", "Control", "Configuration object", "tenant + control ID/version", "Policy rule/control definition"],
  ["Exception", "Control", "Configuration object", "tenant + exception ID", "Temporal policy override"],
  ["Approval", "Control", "Event/configuration object", "tenant + approval ID", "Decision record, not entity inventory by default"],
  ["Decision", "Control", "Event-only object", "tenant + decision ID", "Point-in-time policy result"],
  ["Finding", "Assurance", "First-class workflow object", "tenant + finding dedup key", "Correlated actionable condition"],
  ["Evidence Record", "Assurance", "Evidence-only object", "tenant + immutable evidence ID", "Content-addressed/provenance-bound"],
  ["Certification", "Assurance", "First-class inventory object", "issuer + certification ID/version", "Assurance scope"],
  ["Cost Record", "Economics", "Event-only object", "tenant + source cost record ID", "Attributed economic fact"],
  ["Outcome", "Economics", "Event-only object", "tenant + source outcome ID", "Verified task/business result"],
];

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

fs.writeFileSync(
  path.join(schemasDir, "canonical-entities.yaml"),
  [
    "version: 1",
    "status: Proposed",
    "availability_default: Future capability",
    "entities:",
    ...entityTypes.flatMap(([name, family, productRole, strongKey, note]) => [
      `  - name: ${yamlQuote(name)}`,
      `    family: ${yamlQuote(family)}`,
      `    definition: ${yamlQuote(`Canonical ${name} in the ${family} family, governed at its stated lifecycle layer`)}`,
      `    why_it_exists: ${yamlQuote(note)}`,
      `    what_it_is_not: ${yamlQuote(`Not a source row, display-name alias, transient observation, or a different ${family} lifecycle layer`)}`,
      `    product_role: ${yamlQuote(productRole)}`,
      `    strong_key: ${yamlQuote(strongKey)}`,
      `    note: ${yamlQuote(note)}`,
      `    scope: ${yamlQuote(/global catalog/i.test(productRole) ? "Global catalog; tenant observations remain separate" : "Tenant-scoped")}`,
      `    lifecycle: ${yamlQuote(/Event-only/i.test(productRole) ? "Event-time only" : "Bitemporal current state with discovered/active/stale/retired or type-appropriate states")}`,
      `    owners: ${yamlQuote(/Product|Provider|Family/i.test(name) ? "Catalog steward for global metadata; tenant owner for tenant use" : "Explicit tenant business/technical owner where actionable")}`,
      `    canonical_attributes: ${yamlQuote("Name/type/state/owner/confidence/first-last seen plus type-specific fields with per-field provenance")}`,
      `    source_observations: ${yamlQuote("Only evidenced sensor/connector/catalog observations; see sensor and field matrices")}`,
      `    relationships: ${yamlQuote("Typed relationships from canonical-relationships.yaml only")}`,
      `    relevant_events: ${yamlQuote("Type-appropriate discovery, lifecycle, activity, decision, cost, outcome, and finding events")}`,
      `    relevant_findings: ${yamlQuote("Only cataloged findings whose required entity/relationship/event conditions include this type")}`,
      `    product_interface: ${yamlQuote(productRole.includes("First-class") ? "AI Estate or type-appropriate first-class/contextual view" : "Nested, configuration, activity, or evidence detail")}`,
      `    example: ${yamlQuote(note)}`,
      "    preserve_source_observations: true",
      "    tenant_isolation: required",
    ]),
  ].join("\n") + "\n",
);

const relationships = [
  ["Human User", "MEMBER_OF", "Group", "IdP/HR", "Direct when authoritative", "Temporal", "Available through external integration"],
  ["Group", "PART_OF", "Organization Unit", "IdP/HR", "Direct when authoritative", "Temporal", "Requires external integration"],
  ["Organization Unit", "CHARGED_TO", "Organization Unit", "Finance/CMDB", "Direct with subtype constraint Project->CostCenter", "Temporal", "Requires external integration"],
  ["Agent Definition", "OWNED_BY", "Organization Unit", "Explicit platform assignment", "Authoritative", "Temporal", "Requires assignment/external integration"],
  ["Tenant Application", "OWNED_BY", "Human User", "Explicit platform assignment", "Authoritative", "Temporal", "Requires assignment"],
  ["Data Asset", "OWNED_BY", "Human User", "Data catalog/explicit assignment", "Authoritative", "Temporal", "Requires external integration"],
  ["Human User", "USES", "Tenant Application", "Browser/endpoint/gateway events", "Inferred from activity", "Temporal", "Derivable now"],
  ["Human User", "LOGGED_INTO", "Application Account", "Browser/account/connector evidence", "Direct only where account ID observed", "Temporal", "Requires telemetry for browser account certainty"],
  ["Application Installation", "INSTALLED_ON", "Device", "Endpoint", "Direct", "Temporal", "Available now"],
  ["Application Surface", "SURFACE_OF", "AI Product", "Catalog resolver", "Curated/derived", "Bitemporal", "Derivable now"],
  ["Tenant Application", "INSTANCE_OF", "AI Product", "Resolver/catalog", "Derived", "Bitemporal", "Derivable now"],
  ["Application Account", "ACCOUNT_FOR", "Tenant Application", "Connector/browser/gateway", "Direct or inferred", "Temporal", "Derivable with evidence"],
  ["Tenant Subscription", "SUBSCRIPTION_FOR", "AI Product", "Connector/billing", "Direct", "Temporal", "Requires external integration"],
  ["Human User", "USES", "Agent Definition", "Agent run/IDE/gateway", "Direct or correlated", "Temporal", "Requires stable run identity"],
  ["Agent Definition", "USED_BY", "Organization Unit", "Usage + event-time membership", "Inferred analytical relationship", "Temporal", "Derivable with identity history"],
  ["Agent Definition", "HAS_VERSION", "Agent Version", "Repository/deployment", "Direct", "Bitemporal", "Requires new telemetry for digest"],
  ["Agent Deployment", "DEPLOYS", "Agent Version", "Deployment system", "Direct", "Temporal", "Requires external integration"],
  ["Agent Runtime", "INSTANCE_OF", "Agent Deployment", "Runtime sensor", "Direct", "Temporal", "Requires runtime telemetry"],
  ["Agent Deployment", "RUNS_AS", "Workload Identity", "Cloud/identity", "Direct", "Temporal", "Requires external integration"],
  ["Agent Run", "INITIATED_BY", "Human User", "Run context", "Direct when supplied", "Point-in-time", "Requires new telemetry"],
  ["Agent Definition", "ACTS_ON_BEHALF_OF", "Human User", "Delegation/authorization record", "Authoritative when delegation supplied", "Temporal", "Requires authorization graph"],
  ["Human User", "DELEGATED_TO", "Agent Definition", "Delegation/authorization record", "Authoritative", "Temporal", "Requires authorization graph"],
  ["Agent Run", "EXECUTED_BY", "Agent Runtime", "Agent runtime", "Direct", "Point-in-time", "Requires new telemetry"],
  ["Agent Definition", "USES", "Model Deployment", "Endpoint config/gateway activity", "Direct config or inferred activity", "Temporal", "Derivable partly"],
  ["Agent Definition", "USES", "Tool", "Endpoint config/MCP activity", "Direct config or inferred activity", "Temporal", "Derivable partly"],
  ["Agent Definition", "CONNECTED_THROUGH", "Integration Instance", "Agent config", "Direct", "Temporal", "Requires integration telemetry"],
  ["MCP Client", "CONNECTS_TO", "MCP Server Deployment", "Endpoint config/MCP gateway", "Direct", "Temporal", "Derivable partly"],
  ["MCP Client", "CLIENT_SURFACE_OF", "Application Surface", "Endpoint/application catalog/MCP Gateway", "Derived from strong client/application identity", "Temporal", "Derivable partly"],
  ["MCP Server Deployment", "INSTANCE_OF", "MCP Server Product", "Catalog resolver", "Derived", "Bitemporal", "Future catalog"],
  ["MCP Server Deployment", "PROVIDES", "Tool", "Tool discovery/manifest", "Direct", "Temporal", "Requires MCP source contract"],
  ["Tool", "HAS_VERSION", "Tool Version", "Schema/manifest digest", "Derived", "Temporal", "Requires MCP source contract"],
  ["Model Version", "PROVIDED_BY", "Model Provider", "Gateway/provider catalog", "Direct/curated", "Bitemporal", "Derivable now"],
  ["Model Version", "VERSION_OF", "Model Family", "Gateway/provider catalog", "Curated/derived", "Bitemporal", "Derivable now"],
  ["Model Deployment", "DEPLOYS", "Model Version", "Gateway/provider API", "Direct", "Temporal", "Derivable now in gateway paths"],
  ["Model Route", "RESOLVES_TO", "Model Deployment", "Gateway routing decision", "Direct per invocation/config", "Temporal", "Requires route decision telemetry"],
  ["Agent Definition", "RETRIEVES_FROM", "Knowledge Base", "Agent config/tool events", "Direct or inferred", "Temporal", "Requires new telemetry"],
  ["Agent Definition", "WRITES_TO", "Memory Store", "Agent config/activity", "Direct or inferred", "Temporal", "Requires new telemetry"],
  ["Credential", "AUTHENTICATES", "Integration Instance", "Connector/gateway", "Direct via fingerprint only", "Temporal", "Derivable partly"],
  ["Application Account", "GRANTS_ACCESS_TO", "Data Asset", "Provider/data catalog", "Direct", "Temporal", "Requires external integration"],
  ["Endpoint Process", "INSTANCE_OF", "Application Installation", "Endpoint correlation", "Derived", "Point-in-time", "Derivable now"],
  ["Endpoint Process", "CONNECTED_TO", "Application Surface", "Endpoint proxy", "Direct/correlated", "Point-in-time", "Derivable now"],
  ["Tenant Application", "ACCESSED_FROM", "Browser Instance", "Browser interaction", "Direct observation", "Point-in-time", "Available now"],
  ["Tenant Application", "ACCESSES", "Data Asset", "Gateway/endpoint/DLP correlation", "Inferred", "Temporal", "Requires data identity"],
  ["Model Deployment", "PROCESSES", "Data Class", "DLP + model event", "Inferred from correlated event", "Point-in-time", "Derivable now with correlation"],
  ["Tool", "READS", "Data Asset", "Tool result/action telemetry", "Direct when target ID supplied", "Point-in-time", "Requires new telemetry"],
  ["Tool", "MODIFIES", "Data Asset", "Tool action telemetry", "Direct when target/effect supplied", "Point-in-time", "Requires new telemetry"],
  ["Data Asset", "LOCATED_IN", "Organization Unit", "Data catalog", "Direct", "Temporal", "Requires external integration"],
  ["Policy", "APPLIES_TO", "Tenant Application", "Policy configuration", "Authoritative", "Temporal", "Derivable partly"],
  ["Policy", "ENFORCED_AT", "Enforcement Point", "Control deployment", "Authoritative", "Temporal", "Requires coverage registry"],
  ["Decision", "GOVERNED_BY", "Policy", "Decision record", "Direct", "Point-in-time", "Derivable now in some paths"],
  ["Decision", "ENFORCED_BY", "Enforcement Point", "Sensor result", "Direct", "Point-in-time", "Derivable partly"],
  ["Agent Run", "CONTAINS", "Decision", "Correlation ID", "Direct", "Point-in-time", "Requires new telemetry"],
  ["Agent Run", "CONTAINS", "Canonical Event", "Run/step correlation", "Direct when run/step IDs supplied", "Point-in-time", "Requires new telemetry"],
  ["Agent Run", "INVOKED", "Model Deployment", "Gateway event", "Direct/correlated", "Point-in-time", "Derivable with IDs"],
  ["Agent Run", "CALLED", "Tool", "MCP event", "Direct/correlated", "Point-in-time", "Requires MCP source contract"],
  ["Canonical Event", "OBSERVED_BY", "Sensor", "Observation envelope", "Direct", "Point-in-time", "MVS"],
  ["Canonical Event", "TARGETED", "Data Asset", "Action/event target identity", "Direct when target ID supplied; otherwise inferred", "Point-in-time", "Requires data/action telemetry"],
  ["Finding", "AFFECTS", "Tenant Application", "Finding materializer", "Derived", "Temporal", "MVS"],
  ["Finding", "SUPPORTED_BY", "Evidence Record", "Finding materializer", "Authoritative link", "Temporal", "MVS"],
  ["Evidence Record", "PROVES", "Decision", "Decision/evidence contract", "Authoritative only with sufficient integrity", "Point-in-time", "Requires unified evidence"],
  ["Finding", "CAUSED_BY", "Tenant Application", "Correlation", "Derived", "Temporal", "MVS"],
  ["Certification", "COVERS", "Sensor", "Assurance registry", "Authoritative", "Temporal", "Future capability"],
  ["Cost Record", "ATTRIBUTED_TO", "Agent Run", "Gateway/billing correlation", "Direct/derived", "Point-in-time", "Requires cost telemetry"],
  ["Outcome", "RESULT_OF", "Agent Run", "Outcome verifier", "Direct/verified", "Point-in-time", "Requires outcome telemetry"],
];

writeCsv(
  path.join(matricesDir, "relationships.csv"),
  [
    "Subject",
    "Relation",
    "Object",
    "Meaning",
    "Source",
    "Direct/inferred",
    "Authority",
    "Cardinality",
    "Temporal?",
    "Confidence",
    "Affects access/policy",
    "Authoritative graph?",
    "Removal/expiry",
    "Example use",
    "Availability",
  ],
  relationships.map(([Subject, Relation, Object, Source, Authority, Lifecycle, Availability]) => ({
    Subject,
    Relation,
    Object,
    Meaning: `${Subject} ${Relation} ${Object}`,
    Source,
    "Direct/inferred": /inferred|derived|analytical/i.test(Authority) ? "Inferred/derived" : "Direct or authoritative as stated",
    Authority,
    Cardinality: "Many-to-many unless the entity-specific schema constrains it",
    "Temporal?": Lifecycle,
    Confidence: /Authoritative|Direct/i.test(Authority) ? "High when source identity/integrity is valid; retain conflicts" : "Rule-scored with supporting observations",
    "Affects access/policy": /AUTHENTICATES|GRANTS|RUNS_AS|DELEGATED|ACTS_ON_BEHALF|APPLIES_TO|ENFORCED|GOVERNED|READS|MODIFIES/.test(Relation) ? "Yes" : "Not directly; may affect impact/analytics",
    "Authoritative graph?": /analytical|inferred/i.test(Authority) ? "Analytical projection unless promoted by authoritative evidence" : "Authoritative ledger when source authority is verified; Neo4j remains projection",
    "Removal/expiry": "Close valid_until on authoritative revoke/delete or after source-specific expiry; never delete history",
    "Example use": `Find or assess ${Object} related through ${Relation} from ${Subject}`,
    Availability,
  })),
);

fs.writeFileSync(
  path.join(schemasDir, "canonical-relationships.yaml"),
  [
    "version: 1",
    "relationships:",
    ...relationships.flatMap(([subject, relation, object, source, authority, lifecycle, availability]) => [
      `  - subject: ${yamlQuote(subject)}`,
      `    relation: ${yamlQuote(relation)}`,
      `    object: ${yamlQuote(object)}`,
      `    source: ${yamlQuote(source)}`,
      `    authority: ${yamlQuote(authority)}`,
      `    lifecycle: ${yamlQuote(lifecycle)}`,
      `    availability: ${yamlQuote(availability)}`,
      `    cardinality: ${yamlQuote("Many-to-many unless constrained by the entity-specific schema")}`,
      `    affects_access_or_policy: ${/AUTHENTICATES|GRANTS|RUNS_AS|DELEGATED|ACTS_ON_BEHALF|APPLIES_TO|ENFORCED|GOVERNED|READS|MODIFIES/.test(relation)}`,
      `    removal: ${yamlQuote("Close validity on revoke/delete/expiry; preserve bitemporal history")}`,
      `    example_query: ${yamlQuote(`Find ${object} related through ${relation} from ${subject}`)}`,
      "    tenant_scoped: true",
      "    preserve_supporting_observations: true",
    ]),
  ].join("\n") + "\n",
);

const events = [
  ["asset.observed", "All discovery sensors", "source observation; entity hint", "observation_id, source, occurred/observed time", "source native ID + schema version", "Operational + evidence", "Available now"],
  ["asset.discovered", "Resolver/materializer", "canonical entity", "canonical entity ID, first_seen", "entity ID + first_seen transition", "Inventory timeline", "Derivable now"],
  ["asset.updated", "Materializer", "canonical entity", "entity ID, changed fields, before/after refs", "entity ID + materialization version", "Inventory timeline", "Derivable now"],
  ["asset.merged", "Resolver", "canonical entities/observations", "survivor, absorbed IDs, rule, confidence", "resolver decision ID", "Resolution Center", "MVS"],
  ["asset.split", "Resolver/manual workflow", "canonical entities/observations", "prior merge, resulting IDs, actor/reason", "split decision ID", "Resolution Center", "MVS"],
  ["asset.stale", "Freshness materializer", "canonical entity/source", "last_seen, threshold, coverage", "entity + source + threshold window", "Coverage/inventory", "Derivable now"],
  ["asset.reactivated", "Freshness materializer", "canonical entity", "new observation after stale/retired", "entity + transition version", "Inventory", "Derivable now"],
  ["asset.retired", "Lifecycle workflow", "canonical entity", "entity, actor/policy/reason", "entity + lifecycle version", "Inventory", "MVS"],
  ["ownership.assigned", "Platform/CMDB", "entity + owner", "entity, owner, actor", "assignment ID", "Inventory/action", "Requires assignment/integration"],
  ["ownership.changed", "Platform/CMDB", "entity + owners", "before/after, actor", "assignment version", "Audit", "Requires assignment/integration"],
  ["identity.observed", "Persona/IdP/gateway", "human/service/workload identity", "source IDs, identifiers", "source native identity ID", "Evidence", "Available now"],
  ["account.observed", "Connector/browser/gateway", "application account", "provider account ID/type evidence", "source account ID", "Inventory", "Derivable partly"],
  ["relationship.observed", "All sensors", "typed relationship hint", "subject/object hints, source", "observation + relationship tuple", "Evidence", "MVS"],
  ["relationship.established", "Relationship materializer", "canonical relationship", "subject/object/type/valid_from", "relationship ID + version", "Context graph", "MVS"],
  ["relationship.changed", "Relationship materializer", "canonical relationship", "changed attributes/validity", "relationship ID + version", "Context graph", "MVS"],
  ["relationship.revoked", "Relationship materializer", "canonical relationship", "valid_until/reason", "relationship ID + version", "Context graph", "MVS"],
  ["credential.observed", "Gateway/connector/endpoint", "credential fingerprint", "kind, fingerprint, owner hint", "tenant + fingerprint + source", "Credential inventory/evidence", "Derivable partly"],
  ["credential.revoked", "Provider/platform", "credential", "credential ID, actor, time", "provider revocation event ID", "Finding resolution", "Requires external integration"],
  ["ai.application.used", "Browser/endpoint/gateway", "user + tenant application", "user/app/account/device context", "source event ID", "Activity/adoption", "Available now"],
  ["ai.interaction.started", "Browser/gateway", "interaction/session", "context_id, actor, application", "source context + start", "Activity", "Derivable now"],
  ["ai.interaction.completed", "Browser/gateway", "interaction/session", "outcome, duration, usage", "source context + completion", "Activity", "Derivable now"],
  ["prompt.submitted", "Browser/gateway/IDE", "prompt evidence + actors", "content reference, size, classifications", "source request/prompt ID", "Protected activity", "Available now"],
  ["response.received", "Browser/gateway", "response evidence + actors", "content reference, size, classifications", "source request ID + direction", "Protected activity", "Available now"],
  ["model.invocation.started", "LLM gateway", "model deployment + actor/run", "provider/model/route/request", "request_id + attempt", "Activity/latency", "Available now"],
  ["model.invocation.completed", "LLM gateway", "model deployment + actor/run", "outcome, tokens, latency, cost", "request_id + attempt + terminal state", "Activity/metrics", "Available now"],
  ["agent.session.started", "Agent runtime", "agent session", "agent/runtime/user/workload", "source session ID", "Activity", "Requires new telemetry"],
  ["agent.run.started", "Agent runtime", "agent run", "agent/version/deployment/session", "source run ID", "Activity", "Requires new telemetry"],
  ["agent.run.completed", "Agent runtime", "agent run", "outcome, cost, duration", "source run ID + terminal", "Activity/outcomes", "Requires new telemetry"],
  ["agent.run.failed", "Agent runtime", "agent run", "error class, failed step", "source run ID + terminal", "Finding signal", "Requires new telemetry"],
  ["agent.step.started", "Agent runtime", "run step", "run, parent step, action kind", "run ID + step ID", "Event explorer", "Requires new telemetry"],
  ["agent.step.completed", "Agent runtime", "run step", "outcome/evidence", "run ID + step ID + terminal", "Event explorer", "Requires new telemetry"],
  ["agent.delegated", "Agent runtime", "parent/subagent", "delegator, delegate, scope", "run + delegation ID", "Governance", "Requires new telemetry"],
  ["tool.discovered", "Endpoint/MCP Gateway", "server + tool/schema", "server ID, tool name, schema digest", "server + schema digest", "Tool inventory", "Derivable partly"],
  ["tool.call.requested", "MCP Gateway/agent runtime", "run + tool + target", "arguments evidence ref, actor", "source call ID", "Activity/finding signal", "Requires MCP telemetry"],
  ["tool.call.completed", "MCP Gateway/agent runtime", "run + tool + result", "outcome, result ref, latency", "source call ID + terminal", "Activity/metrics", "Requires MCP telemetry"],
  ["tool.call.failed", "MCP Gateway/agent runtime", "run + tool", "error, retryability", "source call ID + terminal", "Finding signal", "Requires MCP telemetry"],
  ["action.requested", "Endpoint/MCP/agent", "actor + target", "action, target, requested effect", "source action ID", "Activity", "Derivable partly"],
  ["action.decided", "Policy engine", "decision + action", "policy, result, reason", "decision ID", "Explainability", "Derivable partly"],
  ["action.executed", "Endpoint/MCP/agent", "action + target", "observed effect/evidence", "source action/effect ID", "Activity/assurance", "Requires effect telemetry"],
  ["action.failed", "Endpoint/MCP/agent", "action + target", "failure/error", "source action ID + terminal", "Finding signal", "Derivable partly"],
  ["action.reconciled", "Effect reconciler", "requested + observed action", "match/mismatch/confidence", "action ID + reconciliation version", "Assurance", "Future capability"],
  ["data.read", "Endpoint/tool/connector", "actor + data asset/class", "asset/class, size, evidence", "source action ID", "Protected activity", "Requires data identity"],
  ["data.uploaded", "Browser/endpoint/gateway", "actor + destination + data", "file/content ref, size, class", "correlation group + direction", "Activity/finding", "Derivable now"],
  ["data.downloaded", "Browser/endpoint/gateway", "actor + source + data", "file/content ref, size, class", "correlation group + direction", "Activity/finding", "Derivable now"],
  ["data.transferred", "Correlation engine", "source/destination/data", "supporting observations, confidence", "correlation group ID", "Activity/finding", "Derivable with correlation"],
  ["data.redacted", "DLP/gateway", "content + control", "before/after refs, categories", "decision/action ID", "Evidence", "Available now"],
  ["data.retained", "Provider/memory/connector", "data + store", "retention rule/evidence", "provider event ID", "Finding signal", "Requires external integration"],
  ["data.deleted", "Provider/platform", "data + store", "delete actor/proof", "provider event ID", "Finding resolution", "Requires external integration"],
  ["policy.evaluated", "Policy engine/gateway/endpoint", "policy + context", "inputs version, result, explanation", "decision ID", "Explainability", "Derivable partly"],
  ["decision.allowed", "Policy/enforcement", "decision/action", "policy, enforcement point", "decision ID", "Activity", "Available now"],
  ["decision.denied", "Policy/enforcement", "decision/action", "policy, enforcement point", "decision ID", "Activity", "Available now"],
  ["approval.requested", "Policy/workflow", "action + approver", "scope, expiry", "approval ID", "Workflow", "Requires workflow telemetry"],
  ["approval.granted", "Policy/workflow", "approval + actor", "decision, actor, expiry", "approval ID + terminal", "Workflow", "Derivable partly"],
  ["approval.rejected", "Policy/workflow", "approval + actor", "reason", "approval ID + terminal", "Workflow", "Derivable partly"],
  ["control.warned", "Browser/endpoint/gateway", "control + actor/action", "message/decision", "source event ID", "Activity/UX metric", "Available now"],
  ["control.blocked", "Browser/endpoint/gateway", "control + actor/action", "decision/evidence", "source event ID", "Activity/finding", "Available now"],
  ["exception.created", "Policy workflow", "exception + scope", "actor, reason, expiry", "exception ID", "Governance", "Requires unified policy model"],
  ["exception.expired", "Policy workflow", "exception", "expiry/effective state", "exception ID + transition", "Finding signal", "Requires unified policy model"],
  ["sensor.heartbeat", "Browser/endpoint/gateway", "sensor", "version, coverage, last report", "source heartbeat ID/bucket", "Coverage", "Available now"],
  ["sensor.stale", "Coverage materializer", "sensor", "last report, expected cadence", "sensor + threshold window", "Coverage/finding", "Derivable now"],
  ["sensor.self_test_failed", "Sensor", "sensor", "test, error, version", "source diagnostic ID", "Finding", "Requires standardized telemetry"],
  ["connector.degraded", "Connector monitor", "integration instance", "error/rate/lag", "connector + incident window", "Coverage/finding", "Requires external integration"],
  ["provider.degraded", "Gateway health", "provider/deployment", "probe failures/latency", "provider + window", "Finding", "Derivable now"],
  ["runtime.failed", "Endpoint/gateway/agent", "runtime", "error/version/context", "source runtime event ID", "Finding signal", "Available partly"],
  ["cost.recorded", "Gateway/provider/billing", "cost record + attribution", "amount, currency, usage", "source cost record ID", "Metrics", "Derivable partly"],
  ["budget.threshold_crossed", "Cost materializer", "owner/scope", "budget, actual, window", "scope + budget + period", "Finding", "Requires budget integration"],
  ["task.succeeded", "Agent/outcome verifier", "agent run + outcome", "outcome evidence", "run + outcome type", "Value metrics", "Requires outcome telemetry"],
  ["task.failed", "Agent/outcome verifier", "agent run + outcome", "failure evidence", "run + outcome type", "Value metrics/finding", "Requires outcome telemetry"],
  ["outcome.verified", "Outcome verifier", "outcome + evidence", "method/confidence", "outcome + verifier version", "Value", "Future capability"],
  ["finding.opened", "Finding materializer", "finding + affected entities", "condition, severity, owner, evidence", "finding dedup key + generation", "Findings", "MVS"],
  ["finding.updated", "Finding materializer", "finding", "new evidence/severity/confidence", "finding ID + version", "Findings", "MVS"],
  ["finding.assigned", "Workflow", "finding + owner", "actor, assignee", "finding ID + assignment version", "Findings", "MVS"],
  ["finding.suppressed", "Workflow", "finding", "actor, reason, expiry", "finding ID + suppression version", "Findings", "MVS"],
  ["finding.resolved", "Finding materializer/workflow", "finding", "resolution condition/evidence", "finding ID + generation", "Findings", "MVS"],
  ["finding.reopened", "Finding materializer", "finding", "recurrence evidence", "dedup key + new generation", "Findings", "MVS"],
];

writeCsv(
  path.join(matricesDir, "event-types.csv"),
  ["Event type", "Source events", "Entities", "Required fields", "Dedup rule", "Retention", "Product use", "Availability"],
  events.map(([type, source, entities, required, dedup, use, availability]) => ({
    "Event type": type,
    "Source events": source,
    Entities: entities,
    "Required fields": required,
    "Dedup rule": dedup,
    Retention: /prompt|response|tool.call|data\./.test(type)
      ? "Metadata per analytical/audit policy; protected content/evidence has separate minimal retention"
      : /finding|decision|approval|asset.merged|asset.split/.test(type)
        ? "Audit/workflow retention with immutable history"
        : "Tenant/source policy with replay and legal-hold requirements",
    "Product use": use,
    Availability: availability,
  })),
);

function objectSchema(properties, required) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required,
    properties,
  };
}

fs.writeFileSync(
  path.join(schemasDir, "source-observation.schema.json"),
  JSON.stringify(
    {
      ...objectSchema(
        {
          observation_id: { type: "string", minLength: 1 },
          tenant_id: { type: "string", minLength: 1 },
          source_sensor_id: { type: "string", minLength: 1 },
          source_sensor_type: { type: "string", minLength: 1 },
          source_sensor_version: { type: ["string", "null"] },
          source_native_id: { type: ["string", "null"] },
          source_object_type: { type: "string", minLength: 1 },
          entity_kind_hint: { type: ["string", "null"] },
          observed_at: { type: "string", format: "date-time" },
          ingested_at: { type: "string", format: "date-time" },
          valid_from: { type: ["string", "null"], format: "date-time" },
          valid_until: { type: ["string", "null"], format: "date-time" },
          first_observed_at: { type: ["string", "null"], format: "date-time" },
          last_observed_at: { type: ["string", "null"], format: "date-time" },
          collection_method: { type: "string" },
          collection_scope: { type: ["string", "null"] },
          native_identifiers: { type: "object", additionalProperties: true },
          normalized_identifiers: { type: "object", additionalProperties: true },
          native_attributes: { type: "object", additionalProperties: true },
          normalized_attributes: { type: "object", additionalProperties: true },
          proposed_relationships: { type: "array", items: { type: "object" } },
          mentioned_entities: { type: "array", items: { type: "object" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          raw_payload_reference: { type: "string", minLength: 1 },
          schema_version: { type: "string", minLength: 1 },
          ingestion_version: { type: "string", minLength: 1 },
          operation: { enum: ["upsert", "delete", "correct", "tombstone"] },
          sequence: { type: ["integer", "null"], minimum: 0 },
        },
        [
          "observation_id",
          "tenant_id",
          "source_sensor_id",
          "source_sensor_type",
          "source_object_type",
          "observed_at",
          "ingested_at",
          "collection_method",
          "native_identifiers",
          "native_attributes",
          "confidence",
          "raw_payload_reference",
          "schema_version",
          "ingestion_version",
          "operation",
        ],
      ),
      title: "Quilr source observation",
    },
    null,
    2,
  ) + "\n",
);

fs.writeFileSync(
  path.join(schemasDir, "canonical-event.schema.json"),
  JSON.stringify(
    {
      ...objectSchema(
        {
          event_id: { type: "string", minLength: 1 },
          tenant_id: { type: "string", minLength: 1 },
          event_type: { enum: events.map(([type]) => type) },
          event_version: { type: "string", minLength: 1 },
          occurred_at: { type: "string", format: "date-time" },
          observed_at: { type: "string", format: "date-time" },
          ingested_at: { type: "string", format: "date-time" },
          source: {
            type: "object",
            required: ["sensor_id", "sensor_type", "native_event_id", "schema_version"],
            additionalProperties: true,
            properties: {
              sensor_id: { type: "string" },
              sensor_type: { type: "string" },
              native_event_id: { type: "string" },
              schema_version: { type: "string" },
            },
          },
          actors: { type: "object", additionalProperties: { type: ["string", "null"] } },
          correlation: { type: "object", additionalProperties: { type: ["string", "null"] } },
          entities: { type: "object", additionalProperties: { type: ["string", "array", "null"] } },
          action: { type: ["object", "null"], additionalProperties: true },
          data: { type: ["object", "null"], additionalProperties: true },
          governance: { type: ["object", "null"], additionalProperties: true },
          outcome: { type: ["object", "null"], additionalProperties: true },
          usage: { type: ["object", "null"], additionalProperties: true },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          evidence_references: { type: "array", items: { type: "string" }, minItems: 1 },
          raw_payload_references: { type: "array", items: { type: "string" }, minItems: 1 },
        },
        [
          "event_id",
          "tenant_id",
          "event_type",
          "event_version",
          "occurred_at",
          "observed_at",
          "ingested_at",
          "source",
          "actors",
          "correlation",
          "entities",
          "confidence",
          "evidence_references",
          "raw_payload_references",
        ],
      ),
      title: "Quilr canonical event",
    },
    null,
    2,
  ) + "\n",
);

const extractionRows = [
  ["Vanguard browser extension", "page/content/background message bus; BES interaction/event routes", "Push", "requestId/context_id + source native event ID", "No durable browser backfill evidenced", "Retry behavior varies; raw local diagnostics partly unsent", "Observation adapter + usage/event materializer"],
  ["Project Sentinel native host", "Chrome native messaging stdin/stdout; SQLite state", "Push", "SystemEvent.id; file position currently unsafe", "SQLite snapshot/config only", "Reconnect/heartbeat; writes can falsely report success", "Native-host adapter"],
  ["Browser Extension Service", "181 HTTP mappings; Kafka heartbeat/risk/audit; PostgreSQL/Neo4j/Redis/DWH", "Push/stream/query", "route-native IDs; Kafka record identity; queryId", "Table/graph query by tenant/time", "Lossy heartbeat/Kafka paths require reconciliation", "BES adapter + evidence materializer"],
  ["Endpoint System Monitor v2", "POST app/add; POST /ea/v1/sync/discovered-apps; GET /ea/v1/sync/delta", "Push + poll", "local entity UUID/canonical_id; delta cursor", "Snapshot + repeat pending sync", "Five-second retry; no separate backoff; failed flag inconsistently set", "Endpoint discovery adapter"],
  ["Endpoint proxy/DLP", "proxy request/response hooks; local broker; alert/activity APIs", "Interception + push", "flow tuple, process attribution, uniqueness hash", "None durable for all flows", "Mixed fail-open/default action; alert delivery can fail", "Endpoint activity adapter"],
  ["Endpoint IDE hooks", "local hook socket; activity HTTP batch", "Push", "session ID + frame/activity identity", "Raw JSONL only where configured", "Bounded channel/drop; two HTTP attempts; no spool", "IDE activity adapter"],
  ["Endpoint Persona/email discovery", "local framed IPC + Persona service", "Scan/push", "email/source + device/tenant context", "Repeat discovery", "30-second accept deadline; partial sources suppressed", "Identity observation adapter"],
  ["Endpoint diagnostics", "local broker; NDJSON; OpenSearch bulk", "Push + batch", "diagnostic UUID/code/component", "NDJSON replay excluding .sent IDs", "Failed bulk item accounting incomplete", "Operational telemetry adapter"],
  ["Endpoint Dashboard/API", "tenant HTTP routes and ClickHouse tables", "Query/CDC candidate", "table keys + tenant + update times", "ClickHouse time/key scans", "Deployment schema drift unresolved", "Compatibility/backfill adapter"],
  ["LLM/DLP Gateway", "287 HTTP routes; SQLite; NATS; provider callbacks", "Interception + push", "request_id/context_id/api_key_hash", "SQLite/ClickHouse time+ID backfill", "NATS/provider-specific retry; some HTTP errors encoded in stream", "LLM gateway adapter"],
  ["LLM/DLP workers", "JetStream dlp.req/res.*, db.writes; core NATS request/reply", "Stream", "request-scoped subject + request_id", "JetStream retention-dependent", "Explicit ack on workers; no universal DLQ", "Detection/event adapter"],
  ["Endpoint Config Manager", "HTTP + tenant_configs.sqlite3", "Poll/query", "tenant + scoped config version", "Full tenant snapshot", "Optimistic conflict for versioned stores", "Configuration adapter"],
  ["Gateway health", "SQLite rollup and public health API", "Poll", "target/scope + time bucket", "1-90 day query", "Probe schedule/process dependent", "Coverage/health materializer"],
  ["External MCP Gateway", "external management APIs + ClickHouse/query-builder MCP analytics", "Push/query (contract unresolved)", "external IDs required", "Unresolved", "Source repository absent", "MCP adapter requires contract"],
  ["Quilr 1 ClickHouse", "named tables in query-builder data dictionary and migration evidence", "Backfill query/CDC future", "tenant + table native keys + event time", "Partition/time scans", "No single transaction or universal version", "Quilr 1 backfill adapters"],
  ["Quilr 1 Neo4j", "graph/common client reads", "Snapshot/query", "node/relationship IDs + tenant where available", "Full tenant graph snapshot", "Authority/constraints/drift unresolved", "Graph evidence adapter; never direct canonical authority"],
  ["Quilr 1 Redis", "cache/sets/locks/markers", "Snapshot only for reconciliation", "namespaced cache key", "No historical backfill", "Non-atomic queue claim and TTL inconsistencies", "Do not ingest as authority; use operationally"],
];

writeCsv(
  path.join(matricesDir, "source-extraction.csv"),
  [
    "Source",
    "Endpoint/table/topic",
    "Push/pull",
    "Cursor",
    "Cadence",
    "Backfill",
    "Auth",
    "Tenant key",
    "Failure recovery",
    "Pagination/rate limits",
    "Ordering/deletion/retention",
    "Expected volume",
    "Sensitivity",
    "Transformation",
    "Materializer",
  ],
  extractionRows.map(([Source, endpoint, mode, Cursor, Backfill, recovery, Materializer]) => ({
    Source,
    "Endpoint/table/topic": endpoint,
    "Push/pull": mode,
    Cursor,
    Cadence: Source.includes("System Monitor")
      ? "Five-second app-resolution/ingest loop; delta poll is configured"
      : Source.includes("Browser Extension Service")
        ? "Per request/event; heartbeat bucket default five minutes"
        : Source.includes("Gateway health")
          ? "Periodic probe; exact deployment schedule configuration"
          : mode.includes("Push") || mode.includes("Interception") || mode.includes("Stream")
            ? "Per event/message with source batching where documented"
            : "Scheduled/backfill-specific",
    Backfill,
    Auth: Source.includes("Endpoint Config Manager")
      ? "None in application source; require protected service identity before integration"
      : Source.includes("Quilr 1")
        ? "Service/database credentials and tenant-scoped execution"
        : "Existing Persona/JWT/API-key/local-IPC/service credential as documented; adapter must authenticate sensor installation",
    "Tenant key": "Required tenant_id; retain subscriber/source-native tenant aliases where present",
    "Failure recovery": recovery,
    "Pagination/rate limits": mode.includes("Query") || mode.includes("Poll")
      ? "Use opaque cursor or deterministic key/time pagination; honor source retry/rate hints"
      : "Backpressure and batch limits are source-specific; record admitted/dropped counts",
    "Ordering/deletion/retention": "Record source sequence/event time and explicit delete/tombstone; where absent use coverage-aware staleness only; source retention limits replay",
    "Expected volume": /LLM|ClickHouse|Browser Extension Service|Endpoint proxy/.test(Source)
      ? "High-volume event source; partition by tenant/time/source and load-test"
      : "Low-to-medium configuration/inventory source; measure before SLO finalization",
    Sensitivity: /LLM|Browser|Endpoint|MCP|Persona|diagnostics/i.test(Source)
      ? "Potential PII, prompts/content, paths, credentials, policy, or business data"
      : "Tenant operational/configuration data",
    Transformation: "Raw payload -> source observation -> versioned normalization; exact native fields preserved",
    Materializer,
  })),
);

const resolutionRows = [
  ["AI Product", "Curated product ID; exact verified domain/bundle catalog mapping", "Vendor + catalog alias; strong surface mapping", "Normalized name only with corroborating vendor/surface", "Same/similar name; personal vs enterprise; product vs model; tenant-private fork", "Product catalog steward"],
  ["Application Surface", "Bundle/package ID; verified origin/domain; signed binary identity", "Product + surface type + stable provider surface ID", "Name + executable/domain pattern with catalog evidence", "Web vs desktop vs API vs IDE extension", "Endpoint for installation/version; catalog for vendor/product"],
  ["Tenant Application", "Tenant + external application/instance ID", "Tenant + product + authoritative subscription/account ID", "Cross-sensor product match plus tenant context", "Different enterprise tenants/accounts; personal account; separate deployment", "Explicit platform assignment and connector over activity inference"],
  ["Application Account", "Provider account ID + product + tenant", "OAuth subject/tenant; verified login identity", "Email/domain + session evidence", "Personal and enterprise must remain distinct; shared account vs user account", "Connector/IdP; browser only when account evidence exists"],
  ["Human User", "IdP subject + tenant", "Verified email + issuer + tenant", "Normalized email only inside tenant", "Shared/service account; reused email across tenants", "IdP/HR over sensor display name"],
  ["Device", "EDR/MDM device ID + tenant", "Hardware/OS identifiers with authority", "Hostname + user + OS only for review", "Reimaged device or hostname reuse", "MDM/endpoint registry"],
  ["Credential", "Tenant + HMAC fingerprint + credential type/provider", "Provider key ID/OAuth credential ID", "Usage pattern never auto-merges", "Secret rotation; shared key; same suffix", "Provider/connector; never raw secret"],
  ["Model Version", "Provider + exact provider model ID/version", "Provider + normalized fully qualified name", "Family/name similarity for review only", "Aliases, fine-tunes, regional deployments", "Gateway request/provider API"],
  ["Model Deployment", "Provider deployment/endpoint ID + tenant", "Endpoint URL + account/region + model version", "Route history + observed provider/model", "Same model in different regions/accounts/endpoints", "Provider integration then gateway"],
  ["Model Route", "Gateway + route/alias ID + tenant", "Configured route name + version", "Display alias never sufficient", "Alias resolving to multiple deployments over time", "Gateway routing decision/config"],
  ["Agent Definition", "Repository/path/native agent ID + tenant", "Definition manifest ID + owner/project", "Name + path + application only for review", "Same agent name across repos/teams; version/deployment/runtime", "Source repository/deployment registry"],
  ["Agent Version", "Definition + artifact/config digest", "Version tag + commit + immutable config hash", "Timestamp/name never sufficient", "Mutable tag; runtime instance", "Artifact/deployment system"],
  ["MCP Client", "Client instance/provider ID + tenant", "Application installation + MCP config identity", "Product/surface + device/user for review", "Client product vs application surface; two profiles", "MCP Gateway then endpoint config"],
  ["MCP Server Deployment", "Server URL + TLS fingerprint/provider instance ID; or stdio manifest/package digest + host", "Transport + command/package + parent app/device", "Name + tool-schema set for review", "Same name across apps; different transport/account/host", "MCP Gateway/manifest; endpoint current UUID is insufficient"],
  ["Tool", "Server identity + exact name + schema digest/version", "Server product + normalized capability ID", "Name/schema similarity for review", "Same tool name on different servers; changed destructive schema", "MCP discovery/manifest"],
  ["Integration Instance", "External connector/instance ID + tenant", "OAuth client + provider tenant/account", "Display name only for review", "Separate connected accounts/configurations", "Integration service"],
  ["Data Asset", "Catalog/source native ID + tenant", "Repository URI+commit/path; file content ID where lawful", "Name/path only with owner/source/time context", "Copies, versions, same filename, mutable URL", "Data catalog/source system"],
  ["Sensor", "Tenant + installation/deployment ID", "Device/workload + sensor type + certificate", "Hostname/type only for review", "Reinstall/clone; version is an attribute", "Sensor registration/certification"],
];

const explicitResolutionByEntity = new Map(resolutionRows.map((row) => [row[0], row]));
for (const [entity, , , strongKey] of entityTypes) {
  if (!explicitResolutionByEntity.has(entity)) {
    resolutionRows.push([
      entity,
      strongKey,
      `All source-native IDs with field provenance inside tenant; exact validity overlap`,
      "Display-name similarity is review-only and never sufficient alone",
      `Different tenant, lifecycle layer, issuer/provider, or strong native identifier`,
      "Resolution Center review required for ambiguous or conflicting evidence",
    ]);
  }
}

writeCsv(
  path.join(matricesDir, "entity-resolution-rules.csv"),
  ["Entity type", "Strong match", "Secondary match", "Fuzzy match", "Non-merge rule", "Manual review"],
  resolutionRows.map(([type, strong, secondary, fuzzy, nonMerge, authority]) => ({
    "Entity type": type,
    "Strong match": strong,
    "Secondary match": secondary,
    "Fuzzy match": fuzzy,
    "Non-merge rule": nonMerge,
    "Manual review": authority,
  })),
);

const canonicalFieldLineage = [
  ["Tenant", "tenant_id", "tenant / tenant_id / selected tenant", "Decoded identity or authoritative tenant registry", "Validate and map source tenant alias", "Never merge across tenant", "Per identity/config sync"],
  ["Human User", "primary_identity", "IdP subject; Persona email; gateway user_id/email", "IdP subject", "Issuer-qualified subject; email alias is temporal", "Field authority per source and valid time", "Per sync/observation"],
  ["Human User", "department", "IdP/HR department; endpoint currently null", "HR/IdP", "Resolve org unit at event time", "Authoritative source wins; retain conflicts", "Per HR/IdP sync"],
  ["Device", "device_id", "BES device ID; endpoint device ID/serial", "MDM/EDR if integrated; endpoint otherwise", "Tenant-qualified identifier registry", "Strong ID only; hostname never auto-merges", "Heartbeat/discovery"],
  ["Device", "os_version", "BES heartbeat; endpoint device_context", "Endpoint/MDM", "Normalize platform/version", "Newest valid observation with provenance", "Heartbeat/discovery"],
  ["AI Product", "vendor", "apps_db; curated catalog; provider/domain mappings", "Curated catalog", "Catalog mapping from strong surface identifiers", "Catalog authority; tenant observations never overwrite", "Catalog release"],
  ["AI Product", "name", "apps_db/app names; endpoint app name; browser app name", "Curated catalog", "Alias registry and localization", "Catalog canonical name; preserve native names", "Catalog release"],
  ["Application Surface", "domain", "browser source_application_domain/domain", "Verified origin observation + catalog", "Lowercase IDNA origin/registrable domain with scope", "One product may own many domains; shared domains need review", "Per observation/catalog"],
  ["Application Surface", "bundle_or_package_id", "endpoint ApplicationData/package/process info", "Endpoint/MDM", "Platform-qualified exact ID", "Exact signed ID; path is secondary", "Per scan"],
  ["Tenant Application", "governance_state", "app_tenant_settings; endpoint governance; approvals", "Explicit platform assignment/policy", "Separate governance dimension", "Explicit current assignment over inferred defaults", "On decision/sync"],
  ["Tenant Application", "first_seen", "all source observation times", "Observation ledger", "Minimum valid observed_at", "Recomputed excluding invalidated observations", "Streaming/replay"],
  ["Tenant Application", "last_seen", "all source observation times", "Observation ledger", "Maximum valid observed_at by healthy source", "Never take cache write time", "Streaming/replay"],
  ["Application Account", "account_type", "browser auth type; connector/IdP account metadata", "Connector/IdP", "personal/enterprise/unknown with evidence", "Unknown stays unknown; domain inference is weak", "Session/sync"],
  ["Model Version", "provider_model_id", "gateway model field/provider response", "Gateway/provider API", "Provider-qualified exact identifier", "Alias is Model Route, not Model Version", "Per invocation/catalog"],
  ["Model Deployment", "region", "provider endpoint/config", "Provider integration", "Normalize provider region", "Gateway guess is not authoritative", "Config/provider sync"],
  ["Model Route", "target", "gateway routing decision/additional providers", "Gateway decision", "Bitemporal RESOLVES_TO edge", "Preserve every decision target", "Per invocation/config"],
  ["Agent Definition", "definition_id", "endpoint AgentData/path/app; future manifest/repository ID", "Repository/deployment registry", "Tenant + repository/path/native ID", "Name-only records remain unresolved", "Scan/deployment sync"],
  ["Agent Version", "artifact_digest", "future deployment/runtime digest", "Artifact registry", "Cryptographic digest", "Mutable tags retained only as aliases", "Per deployment"],
  ["MCP Server Deployment", "endpoint_identity", "endpoint transport/command/args/env names/url; external MCP ID", "MCP Gateway/manifest", "URL+TLS or stdio package/manifest/host identity", "Current endpoint tenant:name UUID is an alias only", "Discovery/config"],
  ["Tool", "schema_digest", "MCP tool schema", "MCP Gateway/manifest", "Canonical JSON schema digest", "Same name/different server never merges automatically", "Tool discovery"],
  ["Credential", "fingerprint", "gateway api_key_hash; provider key ID; future connector fingerprint", "Provider/connector/gateway", "Tenant HMAC; never raw value", "Rotation creates a new credential unless provider stable ID links it", "Usage/config sync"],
  ["Data Asset", "classification", "DLP detections/category/subcategory", "Data catalog/DLP", "Map source taxonomy to Data Class with confidence", "Catalog authority for asset; DLP for event-time classification", "Per event/catalog sync"],
  ["Gateway", "health", "gateway-health probes; service diagnostics", "Direct health/heartbeat", "Separate health dimension", "Latest valid probe plus SLO", "Probe cadence"],
  ["Sensor", "version", "heartbeat/diagnostic/source sensor version", "Sensor self-report + deployment registry", "Semver/digest where available", "Missing stays unknown", "Heartbeat"],
  ["Policy", "version", "gateway/endpoint config versions; app settings", "Policy system", "Immutable version reference", "Do not reconstruct from current mutable config", "Per change/evaluation"],
  ["Finding", "severity", "legacy alert fields + canonical correlation", "Finding materializer", "Rule + impact + confidence + coverage", "Recompute on evidence change; preserve history", "On signal/graph change"],
  ["Cost Record", "amount", "gateway usage/provider/billing", "Provider/billing", "Currency-normalized amount plus native amount", "Never infer price without rate-card version", "Per event/billing sync"],
];

writeCsv(
  path.join(matricesDir, "canonical-field-lineage.csv"),
  ["Entity", "Canonical field", "Source field", "Source authority", "Transformation", "Merge rule", "Freshness"],
  canonicalFieldLineage.map(([Entity, field, source, authority, transform, merge, freshness]) => ({
    Entity,
    "Canonical field": field,
    "Source field": source,
    "Source authority": authority,
    Transformation: transform,
    "Merge rule": merge,
    Freshness: freshness,
  })),
);

const materializers = [
  ["catalog", "Curated product/provider/model/MCP metadata", "Catalog entities and aliases", "catalog object/version", "On catalog release", "<5 min", "PostgreSQL + search"],
  ["identity", "Identity/Persona/connector observations", "Users, accounts, groups, identities", "tenant + source + native ID + version", "Observation arrival/sync", "<5 min", "PostgreSQL"],
  ["asset", "Resolved application/device/model/agent/MCP/tool observations", "Current canonical entities + source coverage", "entity + resolver/materializer version", "Observation or resolver decision", "<2 min", "PostgreSQL + search"],
  ["relationship", "Resolved relationship observations", "Typed bitemporal edges/projections", "relationship tuple + validity + version", "Observation/resolution/lifecycle", "<5 min", "PostgreSQL ledger + Neo4j projection"],
  ["activity", "Canonical events", "Usage/current activity summaries", "event ID + projection version", "Event arrival/replay", "<2 min", "ClickHouse"],
  ["agent_run", "Agent session/run/step events", "Run/step timelines and outcomes", "tenant + run + step + version", "Event arrival", "<1 min", "ClickHouse + PostgreSQL current state"],
  ["decision", "Policy/approval/enforcement events", "Decision timeline and coverage state", "decision ID + version", "Event arrival", "<1 min", "ClickHouse + PostgreSQL"],
  ["finding", "Signals, entities, relationships, coverage", "Root-cause findings and workflow state", "finding type + root cause + scope + generation", "Signal/relationship/coverage change", "<5 min", "PostgreSQL + ClickHouse evidence links"],
  ["cost", "Usage/cost/provider/billing events", "Attributed cost aggregates", "source cost ID; aggregate grain + window", "Event/billing sync", "<15 min", "ClickHouse"],
  ["outcome", "Agent/task/business outcome events", "Outcome/value aggregates", "outcome ID + verifier version", "Outcome evidence", "<15 min", "ClickHouse + PostgreSQL"],
  ["coverage", "Sensor heartbeat/config/certification", "Coverage/freshness/enforceability", "sensor + capability + window", "Heartbeat/config", "<5 min", "PostgreSQL + ClickHouse"],
  ["evidence", "Raw payload references and hashes", "Immutable evidence records/retention state", "tenant + content hash + source", "Ingestion", "<1 min", "Object storage + PostgreSQL metadata"],
];

fs.writeFileSync(
  path.join(schemasDir, "materializers.yaml"),
  [
    "version: 1",
    "materializers:",
    ...materializers.flatMap(([name, input, output, key, trigger, freshness, storage]) => [
      `  - name: ${yamlQuote(name)}`,
      `    input: ${yamlQuote(input)}`,
      `    output: ${yamlQuote(output)}`,
      `    idempotency_key: ${yamlQuote(key)}`,
      `    trigger: ${yamlQuote(trigger)}`,
      `    freshness_target: ${yamlQuote(freshness)}`,
      `    storage: ${yamlQuote(storage)}`,
      `    owner: ${yamlQuote(`${name} domain team with platform data-contract stewardship`)}`,
      "    retry: exponential_with_jitter",
      "    dead_letter: required",
      "    replay: versioned_and_tenant_scoped",
      "    backfill: uses_same_contract_with_backfill_run_id_and_watermark",
      "    tenant_isolation: required_on_every_key_partition_and_query",
      "    schema_versioning: input_and_output_versions_are_persisted",
      "    failure_behavior: preserve_last_good_projection_and_surface_lag_or_partial_state",
      `    observability: ${yamlQuote("input/output rate, oldest pending, watermark lag, retries, DLQ, reconciliation drift, schema versions")}`,
    ]),
  ].join("\n") + "\n",
);

const findings = [
  ["Unmanaged AI application discovered", "Discovery", "Observed active tenant application has no management record", "Tenant Application; activity", "asset/activity observations", "product+tenant application", "Assign owner; approve, restrict, or block", "Available now", "Launch"],
  ["New AI application appeared", "Discovery", "First canonical discovery after baseline", "Tenant Application", "asset.discovered", "entity+first-seen window", "Review product and management state", "Derivable now", "Launch"],
  ["Unknown AI product or unresolved alias", "Discovery", "Observation cannot resolve above review threshold", "Observation; candidate product", "asset.observed", "normalized identifier cluster", "Map alias or create catalog candidate", "Derivable now", "Launch"],
  ["Duplicate inventory entities likely represent same product", "Identity", "Pair/cluster exceeds review threshold but not auto-merge threshold", "Canonical entities; observations", "resolution candidates", "ordered candidate entity IDs", "Merge or reject candidate", "Derivable now", "Launch"],
  ["Canonical merge confidence is low", "Identity", "Existing auto-merge confidence falls below policy after new/conflicting evidence", "Canonical entity; merge decision", "asset.merged/observation", "merge decision ID", "Review or split", "MVS", "Launch"],
  ["Conflicting sensor identity information", "Identity", "Authoritative fields disagree across valid observations", "Canonical entity", "asset.observed", "entity+field+conflict generation", "Select authority, correct catalog, or split", "Derivable now", "Launch"],
  ["Application has no owner", "Management", "Active/recent tenant application lacks valid owner relationship", "Tenant Application", "asset/ownership events", "entity+unowned generation", "Assign owner", "Derivable now", "Launch"],
  ["Agent has no owner", "Management", "Active agent lacks owner", "Agent Definition/Deployment", "agent activity; ownership", "agent+unowned generation", "Assign team/owner", "Requires stable agent identity", "Next"],
  ["Model deployment has no owner", "Management", "Active deployment lacks owner", "Model Deployment", "model invocation; ownership", "deployment+unowned generation", "Assign owner/cost center", "Derivable partly", "Next"],
  ["Asset remains active after retirement", "Lifecycle", "Activity occurs after effective retirement", "Canonical entity", "asset.retired + activity", "entity+retirement generation", "Disable access or reverse retirement", "Derivable now", "Launch"],
  ["Asset has not been observed recently", "Lifecycle", "All expected sources exceed entity/source freshness threshold", "Canonical entity; sensors", "asset.stale", "entity+stale generation", "Confirm retirement or repair coverage", "Derivable now", "Launch"],
  ["Asset observed by only one low-confidence source", "Coverage", "Active entity has one weak observation and no corroboration", "Canonical entity; sensor", "asset.observed; sensor health", "entity+coverage window", "Verify identity/coverage", "Derivable now", "Next"],
  ["Paid application has no observed usage", "Cost", "Active paid subscription/account has no canonical activity in threshold window", "Subscription; tenant application", "billing + activity", "subscription+period", "Reclaim license", "Requires external integration", "Next"],
  ["Duplicate applications provide same capability", "Cost", "Managed products overlap capability and have redundant adoption/spend", "AI Products; subscriptions", "usage + cost", "capability cluster+period", "Consolidate products", "Requires catalog and billing", "Later"],
  ["Unapproved application is widely adopted", "Governance", "Unapproved app exceeds user/department threshold", "Tenant Application; users", "ai.application.used", "entity+adoption window", "Approve, restrict, or migrate", "Derivable now", "Launch"],
  ["Personal account used for enterprise work", "Identity/Data", "Enterprise actor/data activity tied to account classified personal with sufficient evidence", "Application Account; user; data class", "account + prompt/upload activity", "account+root activity window", "Migrate to enterprise account; restrict personal use", "Requires account telemetry/integration", "Next"],
  ["Agent operates without stable identity", "Identity", "Agent activity cannot resolve to definition/deployment/workload identity", "Agent activity", "agent/tool/model events", "unattributed runtime cluster", "Register agent/deployment identity", "Requires new telemetry", "Next"],
  ["Workload identity mismatches approved agent deployment", "Identity", "Observed issuer/subject differs from approved deployment binding", "Agent Deployment; Workload Identity", "agent.run.started", "deployment+observed identity", "Stop deployment or correct binding", "Requires external integration", "Later"],
  ["Shared credential used by several agents", "Identity", "Same credential fingerprint used by multiple unrelated agents", "Credential; agents", "credential usage events", "credential fingerprint+window", "Issue per-agent credentials", "Requires credential fingerprint telemetry", "Next"],
  ["Human identity missing from agent action", "Identity", "Human attribution required by policy but absent", "Agent Run; action", "action events", "action+policy", "Investigate and require delegation/actor", "Requires new telemetry", "Next"],
  ["Agent acts outside declared delegation", "Authority", "Action target/capability exceeds valid delegation", "Agent; Human User; policy", "action + delegation", "agent+delegation+action scope", "Revoke action; narrow delegation", "Requires authorization graph", "Later"],
  ["Agent delegation broader than required", "Authority", "Granted scope materially exceeds observed/declared need", "Agent; delegation", "delegation + usage", "delegation+review period", "Reduce delegated scope", "Requires authorization graph", "Later"],
  ["Long-lived credential used by an agent", "Identity", "Credential age exceeds policy and is used by agent", "Credential; agent", "credential use + provider metadata", "credential+policy", "Rotate to short-lived identity", "Requires external integration", "Next"],
  ["Orphaned API key", "Identity", "Active key has no active owner/app/agent", "Credential", "gateway key/config/use", "credential+orphan generation", "Revoke or assign owner", "Derivable now in LLM gateway", "Launch"],
  ["Privileged agent has no review owner", "Governance", "High-impact capabilities and no accountable reviewer", "Agent; tools/permissions", "agent/tool discovery", "agent+privilege generation", "Assign reviewer and review access", "Derivable partly", "Next"],
  ["User retains access after role change", "Identity", "Current access conflicts with authoritative org role change", "User; account/resource", "IdP + connector access", "user+access edge", "Remove access", "Requires external integration", "Later"],
  ["Service account used interactively", "Identity", "Service identity shows human/browser interactive pattern", "Service Account", "login/activity events", "account+behavior window", "Disable interactive use or reclassify", "Requires identity integration", "Later"],
  ["Personal and enterprise accounts conflated", "Identity", "Resolver merged or UI aggregates accounts with conflicting account type/tenant IDs", "Application Accounts", "account observations", "account cluster+conflict", "Split identities and correct attribution", "Requires account telemetry", "Next"],
  ["Unapproved model used", "Model", "Invocation targets model/deployment outside approved policy", "Model Deployment; actor", "model.invocation.completed", "deployment+actor+policy window", "Block, approve, or migrate model", "Derivable now", "Launch"],
  ["Deprecated model version still active", "Model", "Invocation after deprecation effective time", "Model Version/Deployment", "model invocation + catalog lifecycle", "model version+deprecation generation", "Migrate or exception", "Requires catalog lifecycle", "Next"],
  ["Model alias resolves to unexpected provider", "Model", "Observed routing decision differs from approved alias targets", "Model Route; Deployment", "model invocation route decision", "route+unexpected target", "Fix route or investigate compromise", "Requires route decision telemetry", "Next"],
  ["Agent changed models without approval", "Model", "Agent dependency transitions outside approved change", "Agent; Model Deployment", "relationship.changed/model invocation", "agent+dependency change", "Rollback or approve", "Requires stable agent identity", "Next"],
  ["Model provider concentration exceeds target", "Resilience", "Attributed critical workload share exceeds provider threshold", "Providers; agents/apps", "model invocation", "scope+period", "Diversify or accept risk", "Derivable now", "Next"],
  ["Restricted data sent to incompatible model", "Data", "Data classification + model policy are incompatible", "Data Class; Model Deployment; actor", "prompt/model invocation/DLP", "root transfer+policy", "Block, delete data, investigate", "Derivable with correlation", "Launch"],
  ["Direct provider usage bypassed approved LLM Gateway", "Coverage", "Endpoint/browser observes provider API activity without matching gateway event", "Process/app; provider; gateway", "endpoint network + gateway events", "actor+provider+time window", "Route through gateway or block", "Requires reliable endpoint destination telemetry", "Next"],
  ["Application identity differs across sensors", "Identity", "Browser/endpoint/gateway observations mapped to conflicting products/surfaces", "Application observations", "asset.observed", "candidate cluster+conflict", "Resolve alias/split catalog mapping", "Derivable now", "Launch"],
  ["Model invocation cannot be attributed", "Identity", "Invocation lacks resolvable user, agent, workload, project, and owner", "Model invocation", "model.invocation.completed", "request+attribution generation", "Fix gateway credentials/context", "Derivable now", "Launch"],
  ["Unmanaged MCP server discovered", "MCP", "Observed server deployment lacks management record", "MCP Server Deployment", "tool/server discovery", "server deployment+generation", "Approve, restrict, or remove", "Derivable from endpoint; stronger MCP contract needed", "Launch"],
  ["Unapproved tool discovered", "MCP", "Tool schema/name outside approved catalog/policy", "Tool; MCP Server", "tool.discovered", "server+tool schema digest", "Approve, disable, or block", "Requires MCP source contract", "Next"],
  ["Tool manifest changed", "MCP", "Tool schema/capabilities digest changed", "Tool/Tool Version", "tool.discovered", "tool+new digest", "Review and approve new version", "Requires MCP source contract", "Next"],
  ["Tool behavior differs from declared capabilities", "MCP", "Observed targets/effects exceed declared schema/capability", "Tool; actions", "tool call + action effect", "tool version+behavior window", "Disable and investigate", "Requires effect telemetry", "Later"],
  ["Agent uses tool outside declared purpose", "MCP", "Tool use conflicts with agent policy/purpose", "Agent; Tool", "tool calls + policy", "agent+tool+scope", "Block or update purpose", "Requires agent/tool telemetry", "Later"],
  ["Tool has destructive capability without approval", "MCP", "Schema/capability indicates destructive action and no approval policy", "Tool; Policy", "tool discovery", "tool version+policy", "Require approval or disable", "Requires MCP schema contract", "Next"],
  ["MCP server requests excessive OAuth scopes", "MCP", "Requested scopes exceed approved baseline/observed need", "MCP Server; Integration", "OAuth/connector config", "server+connected account+scope set", "Reduce scopes or deny", "Requires external integration", "Later"],
  ["Tool call cannot be linked to human or agent", "MCP", "Call has no actor/run attribution", "Tool Call", "tool.call.*", "call+attribution generation", "Repair client identity or investigate", "Requires MCP source contract", "Next"],
  ["Tool call bypassed MCP Gateway", "Coverage", "Endpoint/runtime tool activity lacks matching MCP Gateway event", "MCP Client/Server/Tool", "endpoint + gateway events", "actor+tool+window", "Route through gateway or block", "Requires MCP and endpoint correlation", "Later"],
  ["Tool returns sensitive information unexpectedly", "Data", "Tool result DLP class conflicts with declared capability/policy", "Tool; Data Class", "tool result + DLP", "call+classification", "Block propagation and investigate", "Requires MCP result telemetry", "Later"],
  ["High-impact action has no approval", "Action", "Action capability/target requires approval but no valid approval event", "Action; Tool/Agent; Approval", "action events", "action+approval policy", "Revoke/reconcile and require approval", "Requires unified action telemetry", "Next"],
  ["Repeated blocked destructive actions", "Threat", "Same actor/tool repeatedly requests denied high-impact action", "Actor; Tool; Policy", "control.blocked", "actor+action family+window", "Suspend/review actor", "Derivable partly", "Next"],
  ["Authorized action effect differed", "Assurance", "Observed effect does not match authorized requested effect", "Action; Decision; target", "action.reconciled", "action ID", "Rollback and investigate", "Future capability", "Later"],
  ["Duplicate action may have executed more than once", "Reliability", "Near-identical high-impact actions share idempotency/correlation anomaly", "Actions; target", "action.executed", "actor+target+effect+window", "Reconcile and remediate duplicate", "Requires action idempotency telemetry", "Later"],
  ["Sensitive data sent to unapproved application", "Data", "Correlated transfer has sensitive class and destination governance unapproved", "Data Class; Tenant Application; actor", "data.transferred + DLP + account", "root transfer ID", "Block, investigate, delete provider copy", "Derivable now with correlation", "Launch"],
  ["Secret or credential included in prompt", "Data", "DLP class identifies secret/credential in submitted content", "Prompt event; actor; destination", "prompt.submitted + detection", "prompt/request ID", "Rotate secret and investigate", "Available now", "Launch"],
  ["Source code sent to personal AI account", "Data", "Source-code/file evidence + personal account classification", "Data Asset/Class; Account", "upload/prompt/account", "root transfer ID", "Remove content; migrate account; notify owner", "Requires account certainty", "Next"],
  ["Regulated data processed in unapproved region", "Data", "Data class + deployment region conflicts with policy", "Data Class; Model Deployment", "model invocation + provider integration", "request+region policy", "Block/migrate/exception", "Requires provider region integration", "Later"],
  ["File uploaded to AI without required approval", "Data", "Upload event lacks valid approval under policy", "File/Data Asset; Application", "data.uploaded + approval", "root transfer+policy", "Block or investigate", "Derivable partly", "Launch"],
  ["Bulk data export through an agent", "Data", "Agent transfer volume/cardinality exceeds baseline/policy", "Agent; data assets; destination", "data.transferred", "agent+destination+window", "Suspend and investigate", "Requires agent/data identity", "Later"],
  ["Sensitive data persisted in long-term memory", "Data", "Sensitive content written to memory store contrary to policy", "Agent; Memory Store; Data Class", "memory write/data retained", "memory store+record/class", "Delete/redact and fix policy", "Requires new telemetry", "Later"],
  ["Data retained longer than policy", "Data", "Provider/store retention exceeds policy and no valid exception", "Data Asset/Memory; Policy", "data.retained/deleted", "data+retention obligation", "Delete and fix lifecycle", "Requires external integration", "Later"],
  ["AI application accesses data without known owner", "Data", "App-data relationship exists and owner absent for either endpoint", "Application; Data Asset", "data access", "app+data+owner generation", "Assign owners/restrict", "Requires data identity", "Later"],
  ["Endpoint data movement absent at gateway", "Coverage", "Endpoint sees transfer to AI destination with no gateway event", "Process/App/Gateway", "endpoint transfer + gateway events", "actor+destination+window", "Investigate bypass/coverage", "Requires endpoint correlation", "Next"],
  ["Sensors disagree on data classification", "Data", "Same correlated activity has materially conflicting classifications", "Activity; classifications", "multi-sensor DLP results", "root activity+taxonomy", "Review evidence/tune classifiers", "Derivable with correlation", "Next"],
  ["Data egress through uncovered surface", "Coverage", "Transfer occurs where no enforcing sensor covers the path", "Application Surface; Enforcement Point", "data transfer + coverage", "surface+policy+window", "Deploy sensor or block surface", "Requires coverage registry", "Next"],
  ["Policy conflict affects active entities", "Policy", "Applicable controls resolve inconsistently for active usage", "Policy; entity", "policy evaluation/config", "entity+policy conflict set", "Resolve precedence", "Derivable partly", "Launch"],
  ["More-specific control overrides mandatory control", "Policy", "Effective decision violates mandatory-control precedence", "Policy/Control; Decision", "policy.evaluated", "decision+control set", "Correct policy engine/config", "Requires explainable policy events", "Next"],
  ["Policy has no enforcement point", "Coverage", "Policy scope intersects active surface with zero capable active enforcement points", "Policy; Surface; Enforcement Point", "coverage/config/activity", "policy+surface", "Deploy enforcement or narrow claim", "Requires coverage registry", "Launch"],
  ["Policy claims wider coverage than sensors provide", "Coverage", "Declared scope exceeds observed/certified capabilities", "Policy; Sensors", "coverage/config", "policy+capability gap", "Fix claim or deploy sensors", "Requires coverage registry", "Launch"],
  ["Direct path bypasses policy gateway", "Coverage", "Activity occurs on a path outside mandated gateway", "Application/Agent; Gateway", "activity + gateway absence", "actor+destination+window", "Block direct path", "Derivable partly", "Next"],
  ["Enforcement sensor is stale", "Operations", "Required enforcement sensor misses freshness SLO", "Sensor; Policy", "sensor.stale", "sensor+stale generation", "Repair sensor; fail policy appropriately", "Derivable now", "Launch"],
  ["Enforcement sensor is uncertified", "Assurance", "Sensor version not covered by valid certification", "Sensor; Certification", "heartbeat + certification", "sensor version+certification", "Upgrade/certify/restrict", "Future capability", "Later"],
  ["Control configured but not producing decisions", "Operations", "Active control sees eligible traffic but no decision events", "Control; Enforcement Point", "activity + policy events", "control+window", "Repair deployment/config", "Derivable partly", "Next"],
  ["Control produces excessive user friction", "Governance", "Warn/ask/block/override rates exceed threshold without risk reduction", "Control; users/apps", "control events + outcomes", "control+population+window", "Tune control", "Derivable now", "Next"],
  ["Expired exception remains active", "Policy", "Decision still uses expired exception", "Exception; Decision", "exception.expired + decisions", "exception+recurrence", "Remove exception and review decisions", "Requires unified policy model", "Next"],
  ["Policy decision cannot be explained", "Assurance", "Decision lacks policy/version/input/evidence references", "Decision", "action.decided/policy.evaluated", "decision ID", "Fix logging; investigate action", "Derivable partly", "Launch"],
  ["Policy decision cannot be replayed", "Assurance", "Historical inputs/versions/state unavailable for deterministic replay", "Decision; Evidence", "decision/evidence", "decision ID", "Preserve versions/evidence", "Requires new telemetry/model", "Later"],
  ["Sensors report inconsistent enforcement outcomes", "Assurance", "Correlated action has incompatible allow/block/effect claims", "Decision; events", "multi-sensor events", "root action+outcome set", "Investigate enforcement path", "Derivable with correlation", "Next"],
  ["Prompt injection followed by sensitive tool use", "Threat", "Injection detection precedes privileged/sensitive tool call in same run/session", "Agent Run; Tool; Data", "prompt detection + tool call", "run+attack sequence", "Suspend run and investigate", "Requires MCP/agent correlation", "Later"],
  ["Agent behavior deviates materially", "Threat", "Sequence/targets/cost differ from peer or prior approved baseline", "Agent; runs", "agent/tool/model events", "agent+behavior window", "Investigate/suspend", "Requires stable run telemetry", "Later"],
  ["Agent repeatedly retries denied actions", "Threat", "Denied action recurs above threshold within run/window", "Agent; Action; Policy", "decision.denied", "agent+action family+window", "Suspend/tune agent", "Requires agent attribution", "Next"],
  ["Agent unexpectedly delegates", "Threat", "Delegation edge/event outside approved graph", "Agents; delegation", "agent.delegated", "run+delegation", "Stop delegation and investigate", "Requires new telemetry", "Later"],
  ["Agent reaches unapproved external destination", "Threat", "Network/tool destination outside policy", "Agent; destination", "endpoint proxy/tool events", "agent+destination+window", "Block and investigate", "Requires agent/process correlation", "Later"],
  ["New process begins accessing AI APIs", "Threat/Discovery", "Previously unseen process identity connects to AI provider", "Process; Application; Provider", "endpoint proxy activity", "process identity+provider+generation", "Review/block/map application", "Derivable now", "Next"],
  ["Browser account switching precedes sensitive upload", "Threat/Data", "Account change evidence closely precedes sensitive transfer", "User; accounts; transfer", "browser account/upload events", "user+surface+window", "Investigate personal-account exfiltration", "Requires account-switch telemetry", "Later"],
  ["Credential used on unexpected device", "Threat", "Credential fingerprint appears on device outside approved set/baseline", "Credential; Device", "credential use", "credential+device+window", "Revoke and investigate", "Requires credential/device correlation", "Later"],
  ["Tool sequence suggests privilege escalation", "Threat", "Ordered tool/action pattern matches reviewed escalation rule", "Agent Run; Tools", "tool calls", "run+sequence rule", "Suspend and investigate", "Requires MCP run telemetry", "Later"],
  ["Memory changed before anomalous behavior", "Threat", "Unexpected memory mutation precedes anomaly in same agent context", "Memory Store; Agent Run", "memory write + run events", "agent+memory version+window", "Restore memory and investigate", "Requires new telemetry", "Later"],
  ["Agent success rate dropped", "Reliability", "Success rate decreases beyond minimum volume/baseline", "Agent; runs", "task/agent outcomes", "agent+window", "Investigate model/tool/provider changes", "Requires outcome telemetry", "Later"],
  ["Connector failures prevent completion", "Reliability", "Connector error causally linked to failed tasks above threshold", "Integration; Agent Runs", "connector + run events", "connector+window", "Repair/replace connector", "Requires connector/run telemetry", "Later"],
  ["Provider degradation affects critical agents", "Reliability", "Provider health degradation intersects critical agent dependencies", "Provider; Agents", "provider.degraded + graph", "provider incident+affected set", "Fail over/notify owners", "Derivable with dependency graph", "Next"],
  ["Tool retry loop increases cost", "Reliability/Cost", "Repeated tool attempts in a run exceed count/cost threshold", "Agent Run; Tool", "tool calls + cost", "run+tool+loop", "Stop run/fix retry policy", "Requires tool/run cost telemetry", "Later"],
  ["Agent run remains stuck", "Reliability", "Started run has no terminal/heartbeat beyond SLO", "Agent Run", "run events", "run+stuck generation", "Terminate/retry/investigate", "Requires new telemetry", "Later"],
  ["Sensor stopped reporting", "Operations", "Sensor heartbeat exceeds SLO", "Sensor", "sensor.stale", "sensor+stale generation", "Repair/redeploy sensor", "Derivable now", "Launch"],
  ["Inventory materializer is stale", "Operations", "Watermark lag exceeds SLO", "Materializer", "pipeline telemetry", "materializer+lag incident", "Replay/repair", "Requires platform telemetry", "Launch"],
  ["Relationship materializer is behind", "Operations", "Relationship watermark lags entity/event watermark", "Materializer", "pipeline telemetry", "materializer+lag incident", "Replay/repair", "Requires platform telemetry", "Launch"],
  ["Source sync partially failed", "Operations", "Batch/tenant sync has mixed success or missing mappings", "Source adapter", "adapter telemetry", "source+tenant+batch", "Retry/reconcile", "Derivable from known partial paths", "Launch"],
  ["Entity resolution backlog increased", "Operations", "Unresolved candidates/lag exceed SLO", "Resolver", "resolver telemetry", "tenant+resolver window", "Scale/fix rules/review queue", "Requires platform telemetry", "Launch"],
  ["Evidence pipeline incomplete", "Assurance", "Canonical event/finding references missing raw immutable evidence", "Events/Findings", "evidence materializer", "event/finding+missing evidence", "Repair pipeline; lower confidence", "MVS", "Launch"],
  ["Finding materializer produces duplicates", "Operations", "Multiple open findings share dedup key/root generation", "Findings", "finding events", "dedup key+generation", "Reconcile and repair key", "MVS", "Launch"],
  ["AI spend anomaly", "Cost", "Canonical spend deviates beyond budget/baseline with minimum materiality", "Products/agents/departments", "cost.recorded", "scope+period+anomaly model", "Investigate and optimize", "Derivable partly", "Next"],
  ["Model cost rose without usage growth", "Cost", "Unit cost/mix rises while canonical usage stable", "Models/Deployments", "cost + usage", "deployment/family+period", "Change route/model/contract", "Derivable partly", "Next"],
  ["Failed runs drive material spend", "Cost", "Failed-work cost exceeds threshold", "Agents/Runs", "run outcome + cost", "agent+period", "Fix failures/retries", "Requires outcome telemetry", "Later"],
  ["Duplicate products create redundant spend", "Cost", "Duplicate capability/products have overlapping paid active populations", "Products/Subscriptions", "catalog + billing + usage", "capability cluster+period", "Consolidate licenses", "Requires external integration", "Later"],
  ["Expensive model used for equivalent tasks", "Cost", "Comparable outcome class uses higher-cost model without material quality gain", "Models; Outcomes", "cost + outcome", "task cohort+period", "Route to cheaper model", "Requires verified outcomes", "Later"],
  ["Agent has high cost and low success", "Cost/Value", "Cost per successful task exceeds threshold", "Agent", "cost + outcomes", "agent+period", "Tune/suspend/replace", "Requires outcome telemetry", "Later"],
  ["Paid account has no active users", "Cost", "Paid account/subscription seat has no active user usage", "Account/Subscription", "billing + usage", "account+period", "Reclaim license", "Requires external integration", "Next"],
  ["Provider commitment underused", "Cost", "Attributed provider usage below contractual commitment pace", "Provider/Subscription", "billing + usage", "commitment+period", "Shift workload/renegotiate", "Requires billing integration", "Later"],
  ["Cost cannot be allocated to owner", "Cost", "Material spend lacks owner/project/cost center relationship", "Cost Records; entities", "cost events + graph", "cost scope+period", "Assign owner/allocation", "Derivable partly", "Next"],
  ["Spend cannot be linked to outcome", "Value", "Material spend lacks run/task/outcome link", "Cost; Runs; Outcomes", "cost + run/outcome", "cost scope+period", "Instrument outcomes or stop claim", "Requires new telemetry", "Later"],
  ["Policy change increased cost", "Cost", "Cost change is temporally/causally attributable to policy version", "Policy; cost scope", "policy change + cost", "policy version+period", "Revert/tune policy", "Requires policy version events", "Later"],
  ["Tool/connector cost hidden from agent economics", "Cost", "Agent cost omits known tool/connector charges", "Agent; Tool/Connector", "external billing + runs", "agent+period", "Integrate charges/correct allocation", "Requires external integration", "Later"],
  ["Action lacks complete evidence", "Assurance", "High-impact action missing immutable request/decision/effect evidence", "Action; Evidence", "action/evidence", "action ID", "Investigate; block evidence-deficient actions", "Requires unified evidence", "Next"],
  ["Agent version cannot be identified", "Assurance", "Run/activity cannot resolve immutable agent version", "Agent Run", "run/runtime observations", "run+version gap", "Instrument artifact digest", "Requires new telemetry", "Next"],
  ["Sensor version cannot be identified", "Assurance", "Evidence lacks sensor version", "Sensor/Observation", "observation", "sensor+version gap", "Upgrade registration/telemetry", "Derivable now for some; missing elsewhere", "Launch"],
  ["Certification does not cover action", "Assurance", "Action sensor/version/capability outside certification scope", "Action; Sensor; Certification", "action + certification", "action+certification scope", "Restrict/recertify", "Future capability", "Later"],
  ["Production artifact differs from certified artifact", "Assurance", "Observed digest/version differs from certified artifact", "Agent/Sensor Version", "runtime + certification", "deployment+artifact", "Stop/rollback/re-certify", "Requires artifact telemetry", "Later"],
  ["Historical decision cannot be reproduced", "Assurance", "Missing policy/config/relationship/evidence versions prevent replay", "Decision", "decision/evidence", "decision ID", "Preserve state; investigate", "Requires new architecture", "Later"],
  ["Relationship state at decision time unavailable", "Assurance", "Only mutable current relationship exists for historical decision", "Decision; Relationship", "decision + graph history", "decision+relationship", "Backfill/bitemporalize; lower assurance", "Current gap", "Launch"],
  ["Audit evidence relies on mutable current state", "Assurance", "Audit reconstruction reads current graph/cache rather than immutable event-time state", "Audit/Evidence", "audit + state", "audit claim+evidence version", "Preserve snapshot/evidence", "Current gap", "Launch"],
  ["Finding evidence insufficient for severity", "Assurance", "Severity confidence/evidence admission threshold is not met", "Finding; Evidence", "finding materialization", "finding ID+generation", "Lower severity/suppress/request evidence", "MVS", "Launch"],
];

function requiredSourcesForFinding(name, category) {
  const text = `${name} ${category}`.toLowerCase();
  const sources = [];
  if (/browser|personal account|application|upload/.test(text)) sources.push("Browser/BES");
  if (/endpoint|process|device|sensor|file|egress/.test(text)) sources.push("Endpoint");
  if (/model|provider|prompt|gateway|cost|spend|api key/.test(text)) sources.push("LLM Gateway/provider");
  if (/mcp|tool|action|oauth/.test(text)) sources.push("MCP Gateway/agent runtime");
  if (/identity|owner|department|role|account/.test(text)) sources.push("IdP/HR/connector");
  if (/data|privacy|retention|region|memory/.test(text)) sources.push("DLP/data catalog/provider");
  if (/policy|control|approval|exception|decision|delegation/.test(text)) sources.push("Policy/authorization");
  if (/materializer|pipeline|resolution|duplicate finding/.test(text)) sources.push("Canonical platform telemetry");
  return sources.length ? [...new Set(sources)].join("; ") : "Canonical observation/event/relationship sources";
}

function requiredRelationshipsForFinding(name, data) {
  const text = `${name} ${data}`.toLowerCase();
  const relationships = [];
  if (/owner/.test(text)) relationships.push("OWNED_BY");
  if (/agent.*model|model.*agent/.test(text)) relationships.push("Agent USES Model Deployment");
  if (/agent.*tool|tool.*agent|mcp/.test(text)) relationships.push("Agent USES Tool; MCP Client CONNECTS_TO Server; Server PROVIDES Tool");
  if (/data/.test(text)) relationships.push("Application/Model/Tool ACCESSES|PROCESSES|READS|MODIFIES Data");
  if (/policy|control|approval|exception/.test(text)) relationships.push("Policy APPLIES_TO entity; Policy ENFORCED_AT point; Decision GOVERNED_BY Policy");
  if (/identity|delegation|human/.test(text)) relationships.push("Agent RUNS_AS/ACTS_ON_BEHALF_OF; Human DELEGATED_TO Agent");
  return relationships.length ? [...new Set(relationships)].join("; ") : "Affected/root entity and supporting observation relationships";
}

function productLocationForFinding(category, mvs) {
  if (/Operations|Coverage/i.test(category)) return "Coverage or operator Findings";
  if (/Identity/i.test(category) && mvs === "Launch") return "Resolution Center and Findings";
  if (/Cost|Value/i.test(category)) return "Cost insight or Findings when material";
  return "Findings; entity detail badge/context";
}

writeCsv(
  path.join(matricesDir, "findings.csv"),
  [
    "Finding",
    "Category",
    "Business question",
    "Condition",
    "Required entities",
    "Required relationships",
    "Required events",
    "Required sources",
    "Current support",
    "Evidence",
    "Confidence",
    "Severity",
    "Dedup key",
    "Update behavior",
    "Resolution",
    "Reopen behavior",
    "Owner",
    "Recommended actions",
    "Product location",
    "Availability",
    "MVS status",
  ],
  findings.map(([name, category, derivation, data, evidence, dedup, action, availability, mvs]) => ({
    Finding: name,
    Category: category,
    "Business question": `Does ${derivation.charAt(0).toLowerCase()}${derivation.slice(1)}, and who must take the next action?`,
    Condition: derivation,
    "Required entities": data,
    "Required relationships": requiredRelationshipsForFinding(name, data),
    "Required events": evidence,
    "Required sources": requiredSourcesForFinding(name, category),
    "Current support": availability,
    Evidence: evidence,
    Confidence: "Versioned function of identifier/correlation strength, source independence/integrity, coverage, and contradictions",
    Severity: "Versioned function of business/data/action impact, exposure/recurrence, completion/enforcement outcome, confidence, and exceptions",
    "Dedup key": dedup,
    "Update behavior": "Attach independent evidence, recompute condition/confidence/severity/owner, and preserve every finding version",
    Resolution: `Close only when the condition is false for its configured confirmation window or an authorized risk acceptance is active; reopen on recurrence after closure.`,
    "Reopen behavior": "Reopen the same lineage on recurrence after close; create a new generation when root cause/scope materially changes",
    Owner: "Root entity owner; then data/policy/agent owner; then manager/security/operations queue according to finding type",
    "Recommended actions": action,
    "Product location": productLocationForFinding(category, mvs),
    Availability: availability,
    "MVS status": mvs,
  })),
);

fs.writeFileSync(
  path.join(schemasDir, "finding-types.yaml"),
  [
    "version: 1",
    "finding_types:",
    ...findings.flatMap(([name, category, derivation, data, evidence, dedup, action, availability, mvs]) => [
      `  - name: ${yamlQuote(name)}`,
      `    category: ${yamlQuote(category)}`,
      `    condition: ${yamlQuote(derivation)}`,
      `    required_data: ${yamlQuote(data)}`,
      `    required_relationships: ${yamlQuote(requiredRelationshipsForFinding(name, data))}`,
      `    required_sources: ${yamlQuote(requiredSourcesForFinding(name, category))}`,
      `    evidence: ${yamlQuote(evidence)}`,
      `    dedup_key: ${yamlQuote(dedup)}`,
      `    action: ${yamlQuote(action)}`,
      `    availability: ${yamlQuote(availability)}`,
      `    mvs: ${yamlQuote(mvs)}`,
      "    reopen_on_recurrence: true",
      "    tenant_scoped: true",
    ]),
  ].join("\n") + "\n",
);

const currentTargetRows = [
  ["quilr_asset_inventory; /ai-assets/v1/*; AI Assets UI", "Warehouse rows presented as AI assets; source-specific composite UI", "Canonical entity projections with source observations", "Backfill into canonical model", "Adapter, alias seeding, dual-read, retire direct DAO"],
  ["apps_db", "Application master/details", "AI Product catalog seed / Tenant Application evidence", "Reuse behind adapter", "Separate global catalog facts from tenant state"],
  ["apps_db_cache", "Application cache/materialized copy", "Read cache only", "Deprecate as authority", "Rebuild from canonical materializer"],
  ["app_tenant_settings", "Tenant application settings", "Tenant Application governance attributes", "Backfill/reuse", "Map app IDs to aliases; retain history"],
  ["app_tenant_settings_cache", "Cached tenant settings", "Read cache only", "Deprecate as authority", "Canonical cache projection"],
  ["app_process_info", "Application/process mapping", "Surface/install/process identifier evidence", "Reuse behind adapter", "Normalize bundle/binary/path identifiers"],
  ["quilr_idp_apps", "IdP application records", "Tenant Application/Account observations", "Reuse behind adapter", "Preserve IdP IDs and source authority"],
  ["users", "Warehouse user rows", "Human User observations", "Backfill", "Resolve to IdP subject; email secondary"],
  ["smart_groups", "Derived/managed groups", "Group + membership relationships", "Refactor", "Distinguish IdP authority from platform smart group"],
  ["user_app_approvals", "User/application approval states", "Approval/Decision events and relationship attributes", "Backfill", "Version and link policy/actor/evidence"],
  ["quilr_tenant_action_rel", "Tenant/action relationships", "Policy/control relationship observations", "Investigate then adapt", "Define authority/cardinality before promotion"],
  ["quilr_interaction_logs", "Browser/interaction events", "Canonical interaction/prompt/response events", "Backfill", "Normalize source and entity links"],
  ["quilly_interactions", "Assistant interactions", "Canonical interaction events", "Backfill", "Preserve product-specific fields in observation/evidence"],
  ["quilly_summaries", "Interaction summaries", "Analytical projection", "Reuse behind adapter", "Never use as event/evidence authority"],
  ["visit_app_logs", "Application visits", "ai.application.used events", "Backfill", "Resolve app/user/device aliases"],
  ["enriched_events", "Enriched source events", "Source observations/canonical events", "Backfill conditionally", "Record enrichment version and raw provenance"],
  ["ep_user_devices", "Endpoint user/device rows", "Device and user-device relationships", "Backfill", "Prefer authoritative device IDs; bitemporal edges"],
  ["quilr_alert_events and alert tables", "Sensor-specific alerts/findings inputs", "Finding signals and legacy finding migration", "Refactor", "Correlate root cause; do not import every row as finding"],
  ["quilr_status_event_master/drilldown", "Open/resolved status state", "Finding workflow compatibility projection", "Reuse behind adapter", "Reconcile split writes; migrate dedup/lifecycle"],
  ["quilr_audit_logs / audit master codes", "Audit rows/reference codes", "Canonical audit/evidence events", "Backfill/reuse", "Bind immutable state/evidence references"],
  ["quilr_compliance* and rai_policy_details", "Compliance/policy views", "Policy/control/config + analytical projections", "Refactor", "Separate source policy from calculated compliance"],
  ["redteaming_results", "Red-team result rows", "Security test events/findings evidence", "Reuse behind adapter", "Correlate campaigns/results and admission-test findings"],
  ["aiuser_*_insights_summary", "Precomputed user/group/department metrics", "Canonical analytical aggregates", "Replace/recompute", "Avoid source duplicate counting"],
  ["Neo4j nodes/relationships", "Graph enrichment, cache seeds, counts", "Typed relationship projection", "Refactor", "Authority ledger + bitemporal relationship source; reconcile drift"],
  ["Redis caches/queues/markers", "Caches, sync queues, locks, completion markers", "Read acceleration and job coordination only", "Refactor", "No identity/lifecycle authority; durable outbox/work ledger"],
  ["Frontend source tabs and multi-API joins", "Browser/endpoint/LLM/MCP-specific presentation", "Canonical AI Estate with source facets", "Replace", "Unified query API; retain Sources & Observations drill-down"],
  ["/findings/* and status-event APIs", "Request-time source/static/graph enrichment", "Unified finding API", "Compatibility adapter then deprecate", "Root-cause dedup, evidence/owner/resolution fields"],
  ["/interactions/* strategies and source enum-like field", "Source-specific query selection", "Canonical event explorer API", "Reuse behind adapter", "Global event source registry and canonical event schema"],
  ["/mcp/gateway/* analytics", "MCP warehouse projections", "MCP/Tool activity projections", "Reuse behind adapter", "Obtain authoritative MCP source contract"],
  ["/guardrails/v1/*", "LLM gateway request/KPI/latency projections", "Model invocation/findings/metrics projections", "Reuse behind adapter", "Normalize provider/model/deployment/actor IDs"],
  ["/executive/dashboard/* and /qb/query", "Request-time dashboards/named processors", "Canonical metrics API", "Replace progressively", "Materialized metric definitions with coverage"],
];

writeCsv(
  path.join(matricesDir, "current-to-target.csv"),
  ["Current Quilr object/API/table", "Current meaning", "Target object", "Reuse", "Migration"],
  currentTargetRows.map(([current, meaning, target, reuse, migration]) => ({
    "Current Quilr object/API/table": current,
    "Current meaning": meaning,
    "Target object": target,
    Reuse: reuse,
    Migration: migration,
  })),
);

const gaps = [
  ["Authoritative MCP Gateway schema/source", "MCP entities, calls, policies, OAuth, actions", "Blocks verified MCP event/tool lineage", "Obtain repository/contracts and sample payloads", "P0"],
  ["Stable agent/run/step identity", "Agent attribution and outcomes", "Blocks agent correlation/findings/cost", "Instrument definition/version/deployment/run/step IDs", "P0"],
  ["Browser account identity/type", "Personal vs enterprise account", "Prevents high-confidence personal-account findings", "Capture provider account/tenant ID with consent or connector join", "P0"],
  ["Source observation envelope", "Every source", "No replayable canonical input", "Implement adapter contract and raw evidence reference", "P0"],
  ["Per-field provenance and bitemporal history", "Canonical entities/relationships", "Merge/explain/replay unsafe", "Operational canonical ledger", "P0"],
  ["Manual merge/split workflow", "Entity resolution", "False merges not reversible", "Resolution Center + decision/event history", "P0"],
  ["Immutable raw/evidence store", "All sensors", "Audit/reprocessing incomplete", "Tenant-scoped object storage and evidence metadata", "P0"],
  ["Coverage/capability registry", "Sensors/enforcement points", "Cannot distinguish unknown from absent/enforceable", "Heartbeat + declared/observed capability materializer", "P0"],
  ["Unified policy/decision version contract", "Endpoint/browser/LLM/MCP", "Cannot explain/replay decisions", "Emit policy/control/version/input/decision/enforcement IDs", "P1"],
  ["Tool schema/call/result/effect telemetry", "MCP/agents", "Blocks action and MCP findings", "Standard MCP adapter events and effect reconciliation", "P1"],
  ["Credential fingerprints and owner links", "Gateway/connectors/agents", "Blocks shared/orphan credential findings", "Nonreversible tenant-scoped fingerprints", "P1"],
  ["Data asset identity/catalog integration", "Files/repos/KB/memory", "DLP classes cannot link to governed assets", "Integrate catalog and content-safe identifiers", "P1"],
  ["Model deployment/route decision identity", "LLM gateway/provider", "Aliases/providers can be conflated", "Emit deployment endpoint/account/region/route target", "P1"],
  ["Cost/billing attribution", "Products/models/tools/connectors", "Spend/value findings incomplete", "Provider/billing connectors + cost record contract", "P1"],
  ["Outcome verification", "Agent/task value", "Success/cost-per-outcome unavailable", "Run/outcome contract and verifier", "P2"],
  ["Certification/artifact digests", "Sensors/agents", "Assurance findings unavailable", "Version/digest attestation and certification registry", "P2"],
  ["Search index", "Canonical estate/events", "Cross-object/alias search weak", "Build from canonical projections; no authority", "P2"],
  ["Authoritative IdP/HR org contract", "Users/groups/departments", "Ownership and role-change findings incomplete", "IdP/HR connector with bitemporal sync", "P1"],
  ["Connector/account lifecycle contract", "SaaS integrations", "Account/subscription/access findings incomplete", "Normalize connector instance/account/OAuth events", "P1"],
];

writeCsv(
  path.join(matricesDir, "gaps.csv"),
  ["Gap", "Affected domain", "Consequence", "Required work", "Priority"],
  gaps.map(([Gap, domain, consequence, work, priority]) => ({
    Gap,
    "Affected domain": domain,
    Consequence: consequence,
    "Required work": work,
    Priority: priority,
  })),
);

const metrics = [
  ["Canonical AI products", "Count distinct active AI Product IDs with tenant instances", "AI Product/Tenant Application", "Asset materializer", "Inventory consolidation", "Derivable now"],
  ["Tenant AI application instances", "Count distinct active Tenant Application IDs", "Tenant Application", "Asset materializer", "Estate sizing", "Derivable now"],
  ["Unmanaged applications", "Active tenant applications with governance=unmanaged", "Tenant Application", "Asset/finding materializers", "Triage/approve/block", "Derivable now"],
  ["Unowned assets", "Active assets without valid owner / active assets", "Canonical entities/ownership", "Relationship materializer", "Assign ownership", "Derivable partly"],
  ["Stale assets", "Assets stale across expected healthy sources / monitored assets", "Entities/Sensors", "Coverage materializer", "Retire or repair coverage", "Derivable now"],
  ["Duplicate candidates", "Open resolver candidate clusters by confidence band", "Resolver decisions", "Resolution materializer", "Review merges", "MVS"],
  ["Assets by source coverage", "Distinct entities grouped by healthy observing source set", "Entities/Sensors", "Coverage materializer", "Close blind spots", "MVS"],
  ["Active users", "Distinct Human User IDs with canonical usage in window", "Users/Events", "Usage materializer", "Adoption/governance", "Derivable now"],
  ["Repeat users", "Users active in at least N distinct periods", "Users/Events", "Usage materializer", "Measure durable adoption", "Derivable now"],
  ["Active agents", "Distinct Agent Definitions/Deployments with completed activity", "Agents/Runs", "Agent-run materializer", "Agent estate", "Requires stable agent identity"],
  ["Successful tasks", "Count verified task.succeeded/outcome.verified", "Agent Runs/Outcomes", "Outcome materializer", "Value measurement", "Requires outcome telemetry"],
  ["Usage by department", "Distinct canonical events/users grouped by event-time org membership", "Users/Org/Events", "Usage materializer", "Allocate governance/resources", "Requires IdP/HR history"],
  ["Browser vs API usage", "Canonical interactions grouped by surface channel; denominator all classified interactions", "Application Surfaces/Events", "Usage materializer", "Coverage and channel strategy", "Derivable now"],
  ["Managed vs unmanaged usage", "Canonical interactions by application governance state at event time", "Applications/Events", "Usage materializer", "Prioritize governance", "MVS"],
  ["Policy coverage", "Active in-scope entities with applicable policy / in-scope entities", "Policy/Entities", "Coverage materializer", "Fix ungoverned estate", "Requires unified policy model"],
  ["Enforcement coverage", "Active paths with healthy capable enforcement / policy-required paths", "Surfaces/Sensors/Policy", "Coverage materializer", "Deploy/fix controls", "MVS"],
  ["Identity-bound actions", "Actions with human/agent/workload identity / all actions", "Actions/Identity", "Activity materializer", "Improve attribution", "Requires action telemetry"],
  ["Unattributed actions", "Actions lacking all required actor links / all actions", "Actions/Identity", "Activity/finding materializer", "Repair identity", "Requires action telemetry"],
  ["Conflicting controls", "Active entity-policy intersections with unresolved conflict", "Policies/Entities", "Decision materializer", "Resolve conflicts", "Requires unified policy model"],
  ["Sensitive-data actions", "Canonical activities carrying protected data class", "Events/Data Class", "Activity materializer", "Privacy governance", "Derivable partly"],
  ["Agent-run success", "Successful terminal runs / all terminal runs", "Agent Runs", "Agent-run materializer", "Reliability", "Requires run outcomes"],
  ["Model-call success", "Successful terminal model calls / terminal model calls", "Model Events", "Activity materializer", "Provider/model reliability", "Available now"],
  ["Tool-call success", "Successful terminal tool calls / terminal tool calls", "Tool Events", "Activity materializer", "Tool reliability", "Requires MCP telemetry"],
  ["Sensor freshness", "Now - last valid heartbeat/observation by sensor", "Sensors", "Coverage materializer", "Repair stale sensors", "Available now"],
  ["Materializer lag", "Now - source watermark per materializer", "Pipeline", "Operational materializer", "Operate pipeline", "Requires platform telemetry"],
  ["Unresolved entity matches", "Observation clusters below resolution threshold by age/confidence", "Resolver", "Resolution materializer", "Operate review queue", "MVS"],
  ["Spend by canonical product", "Sum cost records attributed through deployment/app/product without duplicate events", "Cost/Products", "Cost materializer", "Optimize portfolio", "Derivable partly"],
  ["Spend by agent", "Sum attributed costs by Agent Definition/Deployment", "Cost/Agents", "Cost materializer", "Optimize agents", "Requires agent identity"],
  ["Cost per successful task", "Attributed run cost / verified successful tasks", "Cost/Runs/Outcomes", "Cost/outcome materializers", "Optimize value", "Requires outcome telemetry"],
  ["Failed-work cost", "Costs attributed to failed runs/actions", "Cost/Outcomes", "Cost materializer", "Fix waste", "Requires outcome telemetry"],
  ["Duplicate-product spend", "Paid cost for overlapping approved capability cluster above retained baseline", "Products/Cost", "Cost materializer", "Consolidate spend", "Requires billing/catalog"],
  ["Unallocated spend", "Cost without valid owner/project/cost center / total cost", "Cost/Ownership", "Cost materializer", "Assign costs", "Derivable partly"],
  ["Verified savings", "Baseline-adjusted cost reduction linked to approved action and stable outcome", "Cost/Outcome/Decision", "Outcome materializer", "Validate optimization", "Future capability"],
];

writeCsv(
  path.join(matricesDir, "metrics.csv"),
  [
    "Metric",
    "Definition",
    "Numerator",
    "Denominator",
    "Canonical objects",
    "Events",
    "Materializer",
    "Time semantics",
    "Filters",
    "Data freshness",
    "Source coverage",
    "Known blind spots",
    "Drill-down",
    "Action enabled",
    "Availability",
  ],
  metrics.map(([Metric, Definition, objects, materializer, action, availability]) => ({
    Metric,
    Definition,
    Numerator: Definition.includes("/") ? Definition.split("/")[0].trim() : Definition,
    Denominator: Definition.includes("/") ? Definition.split("/").slice(1).join("/").trim() : "Not applicable; distinct count or sum at canonical grain",
    "Canonical objects": objects,
    Events: "Canonical lifecycle/activity/cost/outcome events required by the definition; no raw source-row counting",
    Materializer: materializer,
    "Time semantics": "Event time with explicit window/time zone and versioned restatement; current-state metrics declare snapshot time",
    Filters: "Tenant; owner/org; object type/state; source coverage; confidence; application/model/agent/tool; policy; time",
    "Data freshness": "Return materializer watermark and per-source freshness",
    "Source coverage": "Return observed/in-scope/healthy-source denominator and unknown proportion",
    "Known blind spots": availability.includes("Requires") || availability.includes("Future")
      ? availability
      : "Source-specific coverage and unresolved aliases can undercount; disclose coverage",
    "Drill-down": "Canonical entities/events/findings contributing to numerator and denominator",
    "Action enabled": action,
    Availability: availability,
  })),
);

const targetTraceability = [];
for (const [name, family, productRole, strongKey] of entityTypes) {
  const currentSource =
    family === "Application" ? "quilr_asset_inventory; apps_db/settings/process/IdP; browser/endpoint observations" :
    family === "Identity" ? "users; Persona; gateway/API-key/account data; graph/IdP/connector boundaries" :
    family === "Model" ? "LLM Gateway requests/config; endpoint model observations; query-builder guardrail analytics" :
    family === "Agent" ? "Endpoint AgentData; MCP analytics/UI; LLM gateway context" :
    family === "MCP" ? "Endpoint MCP discovery; external MCP UI/APIs; query-builder MCP analytics" :
    family === "Data" ? "DLP classifications; endpoint files/repos; gateway prompts; external catalog absent" :
    family === "Control" ? "Policy/config/approval/status tables; gateway/endpoint/browser decisions; sensor heartbeat" :
    family === "Assurance" ? "Alert/status/audit/compliance/red-team/evidence records" :
    family === "Economics" ? "Gateway usage/cost and external billing/outcome gaps" :
    "Current source-specific records and external integrations";
  targetTraceability.push({
    "Target kind": "Entity",
    "Target capability": name,
    "Existing Quilr 1/sensor source": currentSource,
    "Current quality": `Source-specific; canonical strong key required: ${strongKey}`,
    "Reuse plan": productRole.includes("First-class") ? "Backfill and materialize canonical entity" : "Retain as nested/configuration/event/evidence projection",
    "Migration work": "Adapter, identifier aliases, per-field provenance, bitemporal history, resolver rules, reconciliation",
  });
}
for (const [subject, relation, object, source, authority, lifecycle, availability] of relationships) {
  targetTraceability.push({
    "Target kind": "Relationship",
    "Target capability": `${subject} ${relation} ${object}`,
    "Existing Quilr 1/sensor source": source,
    "Current quality": `${authority}; ${lifecycle}; ${availability}`,
    "Reuse plan": /Requires|Future/.test(availability) ? "Do not materialize as fact until telemetry/integration exists" : "Ingest as typed assertion and project after resolution",
    "Migration work": "Map source IDs, authority/confidence, validity/delete semantics, provenance; backfill graph only as labeled evidence",
  });
}
for (const [type, source, entities, required, , , availability] of events) {
  targetTraceability.push({
    "Target kind": "Event",
    "Target capability": type,
    "Existing Quilr 1/sensor source": source,
    "Current quality": `${availability}; required ${required}`,
    "Reuse plan": /Requires|Future/.test(availability) ? "Schema reserved; no implemented claim" : "Normalize source events/rows through observation adapter",
    "Migration work": `Resolve ${entities}; assign event/source IDs, event-time, evidence, exact dedup and correlation`,
  });
}
for (const [name, category, derivation, data, evidence, dedup, , availability, mvs] of findings) {
  targetTraceability.push({
    "Target kind": "Finding",
    "Target capability": name,
    "Existing Quilr 1/sensor source": `${requiredSourcesForFinding(name, category)}; current alerts/status where mappable`,
    "Current quality": `${availability}; ${mvs}; condition: ${derivation}`,
    "Reuse plan": /Requires|Future/.test(availability) ? "Do not launch until admission data exists" : "Treat current detections as signals; correlate root cause",
    "Migration work": `Resolve ${data}; normalize ${evidence}; implement dedup ${dedup}, owner, evidence, close/reopen`,
  });
}
for (const [name, definition, objects, materializer, action, availability] of metrics) {
  targetTraceability.push({
    "Target kind": "Metric",
    "Target capability": name,
    "Existing Quilr 1/sensor source": "Current query-builder dashboards/summary tables and canonical source events where available",
    "Current quality": `${availability}; current source-row double counting/coverage must be evaluated`,
    "Reuse plan": "Use current value only as dual-run validation baseline",
    "Migration work": `Recompute ${definition} on ${objects} through ${materializer}; publish coverage/freshness and drill-down; action ${action}`,
  });
}

writeCsv(
  path.join(matricesDir, "target-traceability.csv"),
  ["Target kind", "Target capability", "Existing Quilr 1/sensor source", "Current quality", "Reuse plan", "Migration work"],
  targetTraceability,
);

const currentCounts = {
  generated_at: new Date().toISOString(),
  input_documents: inputRows.length,
  source_fields: sourceFieldRows.length,
  sensors_and_sources: sensorCapabilities.length,
  canonical_entity_types: entityTypes.length,
  relationship_types: relationships.length,
  event_types: events.length,
  actionable_findings: findings.length,
  metrics: metrics.length,
  source_extraction_paths: extractionRows.length,
  current_to_target_rows: currentTargetRows.length,
  gaps: gaps.length,
  target_traceability_rows: targetTraceability.length,
};
fs.writeFileSync(path.join(outRoot, "artifact-counts.json"), `${JSON.stringify(currentCounts, null, 2)}\n`);

console.log(JSON.stringify(currentCounts, null, 2));
