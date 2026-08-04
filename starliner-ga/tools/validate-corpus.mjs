#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notices = [];

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function relative(target) {
  return path.relative(root, target).split(path.sep).join("/");
}

function fail(message) {
  failures.push(message);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted && character === '"' && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("unterminated quoted CSV field");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function yamlItemBlocks(text) {
  const matches = [...text.matchAll(/^  - id: ([A-Za-z0-9_-]+)$/gm)];
  return new Map(matches.map((match, index) => [
    match[1],
    text.slice(match.index, matches[index + 1]?.index ?? text.length),
  ]));
}

function inlineYamlList(block, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const value = block.match(new RegExp(`^    ${escaped}: \\[(.*)\\]$`, "m"))?.[1];
  if (value === undefined) return null;
  if (value.trim() === "") return [];
  return value.split(",").map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""));
}

function markdownSection(text, heading) {
  const start = text.indexOf(`${heading}\n`);
  if (start < 0) return null;
  const level = heading.match(/^#+/)?.[0];
  if (!level) return null;
  const bodyStart = start + heading.length + 1;
  const nextHeading = new RegExp(`^${level} `, "gm");
  nextHeading.lastIndex = bodyStart;
  const next = nextHeading.exec(text);
  return text.slice(start, next?.index ?? text.length);
}

const requiredPaths = [
  "README.md",
  "00-initial-tdd-audit.md",
  "02-architecture-constitution.md",
  "09-capability-and-workflow-taxonomy.md",
  "evidence/source-inputs.yaml",
  "evidence/01-context-disposition.md",
  "evidence/02-current-sensor-repository-audit.md",
  "protocol/00-protocol-overview.md",
  "edge/00-edge-runtime-architecture.md",
  "platform/02-continuous-identity-resolution.md",
  "platform/11-integration-role-taxonomy.md",
  "platform/12-finding-definition-governance.md",
  "platform/13-bidirectional-sensor-flow.md",
  "product/00-overview-and-navigation.md",
  "operations/00-security-and-threat-model.md",
  "operations/07-actor-security-and-authority-model.md",
  "implementation/03-increments-and-ga-gates.md",
  "implementation/06-ga-definition-of-done.md",
  "implementation/10-engineering-control-system.md",
  "implementation/11-feature-evidence-traceability.md",
  "implementation/12-browser-sensor-binding.md",
  "implementation/13-endpoint-sensor-binding.md",
  "implementation/14-llm-gateway-sensor-binding.md",
  "implementation/15-mcp-gateway-sensor-binding.md",
  "implementation/16-sensor-architecture-freeze-status.md",
  "adrs/README.md",
  "adrs/0019-first-customer-release-is-discovery-inventory-evidence.md",
  "adrs/0020-die-migration-is-a-separate-parallel-track.md",
  "passes/01-discovery-inventory-evidence/README.md",
  "passes/01-discovery-inventory-evidence/registers/requirements.csv",
  "passes/01-discovery-inventory-evidence/registers/decisions.yaml",
  "passes/01-discovery-inventory-evidence/registers/needs-input.yaml",
  "registers/requirements.csv",
  "registers/decisions.yaml",
  "registers/needs-input.yaml",
  "registers/ga-gates.yaml",
  "contracts/starliner-envelope.schema.json"
];

for (const item of requiredPaths) {
  if (!fs.existsSync(path.join(root, item))) fail(`missing required path: ${item}`);
}

// The portable cloud-context payload contains exact, non-normative copies of
// independently validated source-analysis artifacts. Validate its content and
// digests with the bounded pass validator; do not reinterpret historical
// JSON/YAML/CSV conventions or intentionally unresolved local links as
// Starliner corpus contracts.
const cloudContextPayload = path.join(
  root,
  "passes",
  "01-discovery-inventory-evidence",
  "implementation-freeze",
  "cloud-context",
  "payload",
);
const files = walk(root).filter((file) => !file.startsWith(`${cloudContextPayload}${path.sep}`));
const markdownFiles = files.filter((file) => file.endsWith(".md"));
const jsonFiles = files.filter((file) => file.endsWith(".json"));
const csvFiles = files.filter((file) => file.endsWith(".csv"));
const yamlFiles = files.filter((file) => /\.ya?ml$/.test(file));

function validateSchemaNode(node, schemaRoot, location, file) {
  if (Array.isArray(node)) {
    node.forEach((value, index) => validateSchemaNode(value, schemaRoot, `${location}[${index}]`, file));
    return;
  }
  if (node === null || typeof node !== "object") return;

  if (Array.isArray(node.required)) {
    if (!node.properties || typeof node.properties !== "object") {
      fail(`${relative(file)}:${location}: required is present without properties`);
    } else {
      for (const name of node.required) {
        if (!Object.hasOwn(node.properties, name)) {
          fail(`${relative(file)}:${location}: required property ${name} has no schema`);
        }
      }
    }
  }

  if (Array.isArray(node.enum) && new Set(node.enum.map(JSON.stringify)).size !== node.enum.length) {
    fail(`${relative(file)}:${location}: enum contains duplicate values`);
  }

  if (typeof node.$ref === "string" && node.$ref.startsWith("#/$defs/")) {
    const definition = node.$ref.slice("#/$defs/".length);
    if (!schemaRoot.$defs || !Object.hasOwn(schemaRoot.$defs, definition)) {
      fail(`${relative(file)}:${location}: unresolved local schema reference ${node.$ref}`);
    }
  }

  for (const [key, value] of Object.entries(node)) {
    validateSchemaNode(value, schemaRoot, `${location}.${key}`, file);
  }
}

for (const file of jsonFiles) {
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (file.includes(`${path.sep}contracts${path.sep}`) &&
        value.$schema !== "https://json-schema.org/draft/2020-12/schema") {
      fail(`${relative(file)}: contract does not declare JSON Schema 2020-12`);
    }
    if (file.includes(`${path.sep}contracts${path.sep}`)) {
      if (typeof value.$id !== "string" || !value.$id.startsWith("urn:quilr:starliner:schema:")) {
        fail(`${relative(file)}: contract does not use the frozen Starliner schema URN`);
      }
      validateSchemaNode(value, value, "$", file);
    }
  } catch (error) {
    fail(`${relative(file)}: invalid JSON: ${error.message}`);
  }
}

for (const file of csvFiles) {
  try {
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    if (rows.length < 2) {
      fail(`${relative(file)}: CSV has no data rows`);
      continue;
    }
    const width = rows[0].length;
    rows.forEach((row, index) => {
      if (row.length !== width) {
        fail(`${relative(file)}:${index + 1}: expected ${width} columns, found ${row.length}`);
      }
    });
  } catch (error) {
    fail(`${relative(file)}: invalid CSV: ${error.message}`);
  }
}

const gaGatesPath = path.join(root, "registers/ga-gates.yaml");
const gaGateBlocks = fs.existsSync(gaGatesPath)
  ? yamlItemBlocks(fs.readFileSync(gaGatesPath, "utf8"))
  : new Map();
const knownGateIds = new Set(gaGateBlocks.keys());

if (knownGateIds.size === 0) fail("registers/ga-gates.yaml: no gate IDs found");

const requirementsPath = path.join(root, "registers/requirements.csv");
if (fs.existsSync(requirementsPath)) {
  const rows = parseCsv(fs.readFileSync(requirementsPath, "utf8"));
  const header = rows[0];
  const idIndex = header.indexOf("id");
  const domainIndex = header.indexOf("domain");
  const requirementIndex = header.indexOf("requirement");
  const gateIndex = header.indexOf("gate");
  const statusIndex = header.indexOf("status");
  const ids = new Set();
  const requirementsById = new Map();
  for (const [offset, row] of rows.slice(1).entries()) {
    const line = offset + 2;
    const id = row[idIndex];
    if (!/^REQ-[0-9]{3}$/.test(id)) fail(`registers/requirements.csv:${line}: invalid requirement ID ${id}`);
    if (ids.has(id)) fail(`registers/requirements.csv:${line}: duplicate requirement ID ${id}`);
    ids.add(id);
    requirementsById.set(id, row);
    if (!knownGateIds.has(row[gateIndex])) {
      fail(`registers/requirements.csv:${line}: unknown gate ${row[gateIndex]}`);
    }
    if (row[statusIndex] !== "normative") fail(`registers/requirements.csv:${line}: requirement is not normative`);
  }

  const firstRelease = requirementsById.get("REQ-138");
  if (!firstRelease) {
    fail("registers/requirements.csv: REQ-138 is missing");
  } else {
    const statement = firstRelease[requirementIndex];
    if (firstRelease[gateIndex] !== "DIE-GA") {
      fail("registers/requirements.csv: REQ-138 must be owned by DIE-GA");
    }
    for (const required of [
      "Browser Browser Backend Endpoint LLM Gateway and MCP Gateway",
      "separately authorized parallel track",
      "not DIE implementation or DIE-GA prerequisites",
    ]) {
      if (!statement.includes(required)) {
        fail(`registers/requirements.csv: REQ-138 is missing frozen sequencing clause: ${required}`);
      }
    }
    if (/Quilr 1 legacy evidence on the permanent production path|reversible coexistence before findings/i.test(statement)) {
      fail("registers/requirements.csv: REQ-138 reintroduced migration into bounded DIE");
    }
  }

  for (const id of ["REQ-127", "REQ-128", "REQ-129", "REQ-130", "REQ-131"]) {
    if (requirementsById.get(id)?.[gateIndex] !== "MIGRATION") {
      fail(`registers/requirements.csv: ${id} must remain isolated to MIGRATION`);
    }
  }
  for (const id of ["REQ-132", "REQ-133"]) {
    if (requirementsById.get(id)?.[gateIndex] !== "G6") {
      fail(`registers/requirements.csv: ${id} must remain a G6 retirement requirement`);
    }
  }
  const endpointBoundary = requirementsById.get("REQ-161");
  if (endpointBoundary?.[gateIndex] !== "DIE-GA"
      || endpointBoundary?.[domainIndex] !== "Source profiles"
      || endpointBoundary?.[header.indexOf("owner_role")] !== "endpoint_sensor_lead") {
    fail("registers/requirements.csv: REQ-161 must protect the bounded Endpoint canonical-authority boundary at DIE-GA");
  }
  for (const id of ["REQ-125", "REQ-151", "REQ-159", "REQ-162", "REQ-164"]) {
    if (requirementsById.get(id)?.[gateIndex] !== "DIE-GA") {
      fail(`registers/requirements.csv: ${id} is a five-profile DIE-GA requirement`);
    }
  }
  if (ids.size < 100) fail(`requirements register has only ${ids.size} requirements; minimum frozen baseline is 100`);
  notices.push(`${ids.size} normative requirements`);
}

const expectedDieProfiles = ["browser", "browser_backend", "endpoint", "llm_gateway", "mcp_gateway"];
const dieGate = gaGateBlocks.get("DIE-GA");
if (!dieGate) {
  fail("registers/ga-gates.yaml: DIE-GA is missing");
} else {
  const profiles = inlineYamlList(dieGate, "required_profiles");
  if (JSON.stringify(profiles) !== JSON.stringify(expectedDieProfiles)) {
    fail(`registers/ga-gates.yaml: DIE-GA required_profiles must be exactly ${expectedDieProfiles.join(", ")}`);
  }
  if (/quilr1_legacy|quilr1_member_parity|cohort_fallback|member_parity|coexistence/i.test(dieGate)) {
    fail("registers/ga-gates.yaml: DIE-GA contains a migration profile or proof");
  }
}

const migrationGate = gaGateBlocks.get("MIGRATION");
if (!migrationGate) {
  fail("registers/ga-gates.yaml: independent MIGRATION gate is missing");
} else {
  if (!/^    track: parallel$/m.test(migrationGate)) {
    fail("registers/ga-gates.yaml: MIGRATION must be encoded as a parallel track");
  }
  if (JSON.stringify(inlineYamlList(migrationGate, "required_profiles")) !== JSON.stringify(["quilr1_legacy"])) {
    fail("registers/ga-gates.yaml: MIGRATION must exclusively own quilr1_legacy");
  }
  const independentOf = inlineYamlList(migrationGate, "independent_of") ?? [];
  for (const gate of ["DIE-GA", "G2", "G3", "G4", "G5"]) {
    if (!independentOf.includes(gate)) fail(`registers/ga-gates.yaml: MIGRATION must be independent of ${gate}`);
  }
  for (const proof of ["backfill_lineage", "member_parity", "cutover_rehearsal", "fallback", "rollback", "stabilization"]) {
    if (!migrationGate.includes(proof)) fail(`registers/ga-gates.yaml: MIGRATION is missing ${proof}`);
  }
  if (!(inlineYamlList(migrationGate, "prerequisite_for") ?? []).includes("G6")) {
    fail("registers/ga-gates.yaml: MIGRATION must remain a prerequisite for G6 retirement");
  }
}

const g2Gate = gaGateBlocks.get("G2");
if (g2Gate && /quilr1_legacy|quilr1_coexistence|member_parity|cohort_fallback/i.test(g2Gate)) {
  fail("registers/ga-gates.yaml: G2 contains a migration profile or proof");
}

const riskPath = path.join(root, "registers/risks.csv");
if (fs.existsSync(riskPath)) {
  const rows = parseCsv(fs.readFileSync(riskPath, "utf8"));
  const idIndex = rows[0].indexOf("id");
  const gateIndex = rows[0].indexOf("gate");
  const ids = rows.slice(1).map((row) => row[idIndex]);
  if (new Set(ids).size !== ids.length) fail("registers/risks.csv: duplicate risk IDs");
  ids.forEach((id) => {
    if (!/^R-[0-9]{3}$/.test(id)) fail(`registers/risks.csv: invalid risk ID ${id}`);
  });
  const riskById = new Map(rows.slice(1).map((row) => [row[idIndex], row]));
  for (const row of rows.slice(1)) {
    if (!knownGateIds.has(row[gateIndex])) {
      fail(`registers/risks.csv: ${row[idIndex]} references unknown gate ${row[gateIndex]}`);
    }
  }
  for (const id of ["R-009", "R-010"]) {
    if (riskById.get(id)?.[gateIndex] !== "MIGRATION") {
      fail(`registers/risks.csv: ${id} must remain isolated to MIGRATION`);
    }
  }
  notices.push(`${ids.length} registered risks`);
}

const localLinkPattern = /\[[^\]]*]\(([^)]+)\)/g;
for (const file of markdownFiles) {
  const text = fs.readFileSync(file, "utf8");
  let match;
  while ((match = localLinkPattern.exec(text)) !== null) {
    let target = match[1].trim();
    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("#") ||
      target.startsWith("sandbox:")
    ) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#", 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) {
      fail(`${relative(file)}: broken local link ${match[1]}`);
    }
  }
}

for (const file of yamlFiles) {
  const text = fs.readFileSync(file, "utf8");
  const isOpenApi = relative(file).includes("/openapi/") && text.startsWith("openapi:");
  if (!isOpenApi && !text.startsWith("schema_version:")) fail(`${relative(file)}: missing schema_version header`);
  if (/\t/.test(text)) fail(`${relative(file)}: YAML contains tab indentation`);
}

for (const register of ["decisions.yaml", "needs-input.yaml", "services.yaml", "source-profiles.yaml"]) {
  const file = path.join(root, "registers", register);
  if (!fs.existsSync(file)) continue;
  const ids = [...fs.readFileSync(file, "utf8").matchAll(/^\s+- id: ([A-Za-z0-9_-]+)$/gm)]
    .map((match) => match[1]);
  if (ids.length === 0) fail(`registers/${register}: no IDs found`);
  if (new Set(ids).size !== ids.length) fail(`registers/${register}: duplicate IDs`);
}

const evidenceInventory = path.join(root, "evidence/source-inputs.yaml");
if (fs.existsSync(evidenceInventory)) {
  const text = fs.readFileSync(evidenceInventory, "utf8");
  const ids = [...text.matchAll(/^\s+- id: (CTX-[A-Z0-9-]+)$/gm)].map((match) => match[1]);
  const digests = [...text.matchAll(/^\s+sha256: ([a-f0-9]{64})$/gm)].map((match) => match[1]);
  const lines = [...text.matchAll(/^\s+lines: ([0-9]+)$/gm)].map((match) => Number(match[1]));
  const declaredCount = Number(text.match(/^\s+file_count: ([0-9]+)$/m)?.[1]);
  const declaredLines = Number(text.match(/^\s+total_lines: ([0-9]+)$/m)?.[1]);

  if (ids.length !== declaredCount) fail(`evidence/source-inputs.yaml: declared ${declaredCount} files but found ${ids.length}`);
  if (digests.length !== ids.length) fail("evidence/source-inputs.yaml: every source must have one SHA-256 digest");
  if (new Set(ids).size !== ids.length) fail("evidence/source-inputs.yaml: duplicate source IDs");
  if (new Set(digests).size !== digests.length) fail("evidence/source-inputs.yaml: duplicate source digests");
  if (lines.reduce((sum, value) => sum + value, 0) !== declaredLines) {
    fail(`evidence/source-inputs.yaml: declared ${declaredLines} lines but entry sum differs`);
  }
  notices.push(`${ids.length} hash-locked evidence inputs`);
}

const decisionRegister = path.join(root, "registers/decisions.yaml");
if (fs.existsSync(decisionRegister)) {
  const text = fs.readFileSync(decisionRegister, "utf8");
  const ids = [...text.matchAll(/^\s+- id: (ADR-[0-9]{4})$/gm)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) fail("registers/decisions.yaml: duplicate ADR IDs");
  if (ids.length < 10) fail(`decision register has only ${ids.length} ADRs`);
  const decisions = yamlItemBlocks(text);
  const adr19 = decisions.get("ADR-0019") ?? "";
  const adr20 = decisions.get("ADR-0020") ?? "";
  if (!/^    status: accepted$/m.test(adr19)
      || !/^    superseded_scope: migration_sequence$/m.test(adr19)
      || !/^    superseded_by: ADR-0020$/m.test(adr19)) {
    fail("registers/decisions.yaml: ADR-0019 migration sequencing must be explicitly superseded by ADR-0020");
  }
  if (!/^    status: accepted$/m.test(adr20)
      || !/^    record: \.\.\/adrs\/0020-die-migration-is-a-separate-parallel-track\.md$/m.test(adr20)) {
    fail("registers/decisions.yaml: accepted ADR-0020 record is missing");
  }
  notices.push(`${ids.length} registered ADRs`);
}

const sourceProfilesPath = path.join(root, "registers/source-profiles.yaml");
if (fs.existsSync(sourceProfilesPath)) {
  const profiles = yamlItemBlocks(fs.readFileSync(sourceProfilesPath, "utf8"));
  const expectedGates = new Map([
    ["browser", "DIE-GA"],
    ["browser_backend", "DIE-GA"],
    ["endpoint", "DIE-GA"],
    ["llm_gateway", "DIE-GA"],
    ["mcp_gateway", "DIE-GA"],
    ["enterprise_connector", "G2"],
    ["quilr1_legacy", "MIGRATION"],
  ]);
  for (const [profileId, expectedGate] of expectedGates) {
    if (!new RegExp(`^    launch_gate: ${expectedGate}$`, "m").test(profiles.get(profileId) ?? "")) {
      fail(`registers/source-profiles.yaml: ${profileId} must launch at ${expectedGate}`);
    }
  }
}

const needsInputPath = path.join(root, "registers/needs-input.yaml");
if (fs.existsSync(needsInputPath)) {
  const inputs = yamlItemBlocks(fs.readFileSync(needsInputPath, "utf8"));
  for (const [id, input] of inputs) {
    const blocks = inlineYamlList(input, "blocks") ?? [];
    for (const gate of blocks) {
      if (!knownGateIds.has(gate)) fail(`registers/needs-input.yaml: ${id} references unknown gate ${gate}`);
    }
  }
  for (const id of ["NI-021", "NI-022"]) {
    const blocks = inlineYamlList(inputs.get(id) ?? "", "blocks") ?? [];
    if (!blocks.includes("MIGRATION") || !blocks.includes("G6") || blocks.includes("DIE-GA") || blocks.includes("G2")) {
      fail(`registers/needs-input.yaml: ${id} must block only the migration/retirement path`);
    }
  }
}

const deliveryStrategy = fs.readFileSync(path.join(root, "implementation/00-delivery-strategy.md"), "utf8");
const stageB = markdownSection(deliveryStrategy, "### Stage B — Production foundation") ?? "";
const stageC = markdownSection(deliveryStrategy, "### Stage C — Discovery, Inventory, and Evidence GA") ?? "";
if (!stageB || /Quilr 1|legacy evidence|authoritative identity\/population connector|enterprise connector/i.test(stageB)) {
  fail("implementation/00-delivery-strategy.md: Stage B contains a non-DIE source or migration prerequisite");
}
if (!stageC || /Quilr 1|legacy|migration|coexist|backfill|cohort|cutover|fallback|rollback/i.test(stageC)) {
  fail("implementation/00-delivery-strategy.md: Stage C contains migration execution or proof");
}

const walkingSkeleton = fs.readFileSync(path.join(root, "implementation/01-first-production-walking-skeleton.md"), "utf8");
const permanentComponents = markdownSection(walkingSkeleton, "## Permanent components proven") ?? "";
if (!permanentComponents || /Quilr 1|legacy|migration|coexist|backfill|cohort|cutover|fallback|rollback/i.test(permanentComponents)) {
  fail("implementation/01-first-production-walking-skeleton.md: permanent DIE components contain migration work");
}

const incrementPlan = fs.readFileSync(path.join(root, "implementation/03-increments-and-ga-gates.md"), "utf8");
const dieIncrement = markdownSection(incrementPlan, "## DIE-GA — Discovery, Inventory, and Evidence Pass") ?? "";
const diePositiveScope = dieIncrement.split("Findings, cases, policy", 1)[0];
if (!dieIncrement || /Quilr 1|legacy|migration|coexist|backfill|cohort|cutover|fallback|rollback/i.test(diePositiveScope)) {
  fail("implementation/03-increments-and-ga-gates.md: DIE-GA positive scope contains migration work");
}
const g2Increment = markdownSection(incrementPlan, "## G2 — Unified AI Estate GA") ?? "";
if (!g2Increment || /Quilr 1|quilr1_legacy|migration|coexist|backfill|cohort|cutover|fallback/i.test(g2Increment)) {
  fail("implementation/03-increments-and-ga-gates.md: G2 contains migration work or proof");
}

const freezeStatus = fs.readFileSync(path.join(root, "implementation/16-sensor-architecture-freeze-status.md"), "utf8");
const immediateWork = markdownSection(freezeStatus, "## What can start immediately") ?? "";
if (!immediateWork || /dual-run against Quilr 1|legacy evidence adapters/i.test(immediateWork)) {
  fail("implementation/16-sensor-architecture-freeze-status.md: immediate bounded work contains migration execution");
}

for (const [file, forbidden] of new Map([
  ["implementation/00-delivery-strategy.md", [
    "all four sensor families plus Browser Backend and Quilr 1 legacy evidence",
    "Quilr 1 backfill, semantic parity, cohort pilot, fallback and rollback",
  ]],
  ["implementation/01-first-production-walking-skeleton.md", [
    "an approved tenant cohort can move between Quilr 1 and Quilr 2 reads",
    "Quilr 1 backfill, semantic parity, cohort cutover, fallback, and rollback;",
  ]],
  ["implementation/03-increments-and-ga-gates.md", [
    "transition tenant cohorts without breaking the existing Quilr 1 experience",
    "Quilr 1 production inventory, backfill, member-level semantic parity",
    "Quilr 1 coexistence/parity for covered features",
  ]],
  ["implementation/16-sensor-architecture-freeze-status.md", [
    "10. dual-run against Quilr 1 using legacy evidence adapters.",
  ]],
])) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (!text.includes("ADR-0020")) {
    fail(`${file}: missing ADR-0020 sequencing authority`);
  }
  for (const phrase of forbidden) {
    if (text.includes(phrase)) fail(`${file}: reintroduced superseded migration sequencing: ${phrase}`);
  }
}

for (const file of [
  "implementation/02-workstreams-and-deliverables.md",
  "implementation/04-quilr1-migration-and-cutover.md",
  "implementation/06-ga-definition-of-done.md",
  "implementation/08-engineering-backlog.md",
]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (!text.includes("ADR-0020") || !text.includes("MIGRATION")) {
    fail(`${file}: separate parallel migration authority is not explicit`);
  }
}

const markdownLines = markdownFiles.reduce(
  (sum, file) => sum + fs.readFileSync(file, "utf8").split(/\r?\n/).length,
  0
);
notices.push(`${markdownFiles.length} Markdown documents`);
notices.push(`${markdownLines} Markdown lines`);
notices.push(`${jsonFiles.length} JSON contracts/artifacts`);
notices.push(`${yamlFiles.length} YAML registers`);
notices.push(`${csvFiles.length} CSV registers`);

if (failures.length > 0) {
  console.error("Starliner GA corpus validation FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Starliner GA corpus validation PASSED");
notices.forEach((notice) => console.log(`- ${notice}`));
