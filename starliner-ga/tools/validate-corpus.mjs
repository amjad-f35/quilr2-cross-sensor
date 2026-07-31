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
  "adrs/0019-first-customer-release-is-discovery-inventory-evidence.md",
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

const requirementsPath = path.join(root, "registers/requirements.csv");
if (fs.existsSync(requirementsPath)) {
  const rows = parseCsv(fs.readFileSync(requirementsPath, "utf8"));
  const header = rows[0];
  const idIndex = header.indexOf("id");
  const gateIndex = header.indexOf("gate");
  const statusIndex = header.indexOf("status");
  const ids = new Set();
  for (const [offset, row] of rows.slice(1).entries()) {
    const line = offset + 2;
    const id = row[idIndex];
    if (!/^REQ-[0-9]{3}$/.test(id)) fail(`registers/requirements.csv:${line}: invalid requirement ID ${id}`);
    if (ids.has(id)) fail(`registers/requirements.csv:${line}: duplicate requirement ID ${id}`);
    ids.add(id);
    if (!/^G[0-6]$/.test(row[gateIndex])) fail(`registers/requirements.csv:${line}: invalid gate ${row[gateIndex]}`);
    if (row[statusIndex] !== "normative") fail(`registers/requirements.csv:${line}: requirement is not normative`);
  }
  if (ids.size < 100) fail(`requirements register has only ${ids.size} requirements; minimum frozen baseline is 100`);
  notices.push(`${ids.size} normative requirements`);
}

const riskPath = path.join(root, "registers/risks.csv");
if (fs.existsSync(riskPath)) {
  const rows = parseCsv(fs.readFileSync(riskPath, "utf8"));
  const idIndex = rows[0].indexOf("id");
  const ids = rows.slice(1).map((row) => row[idIndex]);
  if (new Set(ids).size !== ids.length) fail("registers/risks.csv: duplicate risk IDs");
  ids.forEach((id) => {
    if (!/^R-[0-9]{3}$/.test(id)) fail(`registers/risks.csv: invalid risk ID ${id}`);
  });
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
  notices.push(`${ids.length} accepted ADRs`);
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
