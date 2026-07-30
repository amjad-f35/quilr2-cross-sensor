#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notices = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
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

const required = [
  "README.md",
  "00-cto-directive-and-release-charter.md",
  "01-scope-claims-and-non-goals.md",
  "02-pass-architecture-freeze.md",
  "03-sensor-discovery-and-event-coverage.md",
  "04-canonical-inventory-and-relationships.md",
  "05-evidence-activity-and-provenance.md",
  "06-runtime-storage-workers-and-scaling.md",
  "07-ingest-normalization-and-resolution.md",
  "08-product-apis-and-read-models.md",
  "09-ui-information-architecture.md",
  "10-quilr1-migration-and-coexistence.md",
  "11-security-privacy-tenancy-and-access.md",
  "12-quality-certification-and-operability.md",
  "13-delivery-plan-and-definition-of-done.md",
  "14-twenty-four-area-disposition-register.md",
  "15-traceability-and-team-review.md",
  "registers/requirements.csv",
  "registers/decisions.yaml",
  "registers/needs-input.yaml",
  "registers/source-coverage.yaml",
  "registers/migration-matrix.csv",
  "registers/risks.csv"
];

required.forEach((item) => {
  if (!fs.existsSync(path.join(root, item))) fail(`missing required file: ${item}`);
});

const files = walk(root);
const markdown = files.filter((file) => file.endsWith(".md"));
const csv = files.filter((file) => file.endsWith(".csv"));
const yaml = files.filter((file) => /\.ya?ml$/.test(file));

for (const file of csv) {
  try {
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    if (rows.length < 2) {
      fail(`${relative(file)} has no data`);
      continue;
    }
    const width = rows[0].length;
    rows.forEach((row, index) => {
      if (row.length !== width) fail(`${relative(file)}:${index + 1} has ${row.length} columns; expected ${width}`);
    });
  } catch (error) {
    fail(`${relative(file)} invalid CSV: ${error.message}`);
  }
}

const requirementsFile = path.join(root, "registers/requirements.csv");
if (fs.existsSync(requirementsFile)) {
  const rows = parseCsv(fs.readFileSync(requirementsFile, "utf8"));
  const header = rows[0];
  const idIndex = header.indexOf("id");
  const gateIndex = header.indexOf("gate");
  const statusIndex = header.indexOf("status");
  const ids = new Set();
  let normativeCount = 0;
  let parallelCount = 0;
  rows.slice(1).forEach((row, offset) => {
    const id = row[idIndex];
    if (!/^DIE-REQ-[0-9]{3}$/.test(id)) fail(`requirements.csv:${offset + 2} invalid ID ${id}`);
    if (ids.has(id)) fail(`requirements.csv:${offset + 2} duplicate ID ${id}`);
    ids.add(id);
    if (!/^(DIE-0|DIE-1|DIE-2|DIE-3|DIE-GA|MIGRATION)$/.test(row[gateIndex])) {
      fail(`requirements.csv:${offset + 2} invalid gate ${row[gateIndex]}`);
    }
    if (!/^(normative|parallel_track)$/.test(row[statusIndex])) {
      fail(`requirements.csv:${offset + 2} has invalid status ${row[statusIndex]}`);
    }
    if (row[statusIndex] === "normative") normativeCount += 1;
    if (row[statusIndex] === "parallel_track") parallelCount += 1;
  });
  if (ids.size < 90) fail(`only ${ids.size} requirements; expected at least 90`);
  notices.push(`${normativeCount} normative pass requirements; ${parallelCount} parallel migration requirements`);
}

for (const file of yaml) {
  const text = fs.readFileSync(file, "utf8");
  const isOpenApi = relative(file).includes("/openapi/") && text.startsWith("openapi:");
  if (!isOpenApi && !text.startsWith("schema_version:")) fail(`${relative(file)} missing schema_version header`);
  if (/\t/.test(text)) fail(`${relative(file)} contains tab indentation`);
}

const decisionsFile = path.join(root, "registers/decisions.yaml");
if (fs.existsSync(decisionsFile)) {
  const text = fs.readFileSync(decisionsFile, "utf8");
  const ids = [...text.matchAll(/^\s+- id: (DIE-ADR-[0-9]{3})$/gm)].map((match) => match[1]);
  if (ids.length < 18) fail(`only ${ids.length} pass decisions; expected at least 18`);
  if (new Set(ids).size !== ids.length) fail("duplicate pass decision IDs");
  const acceptedCount = [...text.matchAll(/^\s+status: accepted$/gm)].length;
  const deferredCount = [...text.matchAll(/^\s+status: deferred_parallel$/gm)].length;
  notices.push(`${acceptedCount} accepted pass decisions; ${deferredCount} parallel migration decisions`);
}

const inputsFile = path.join(root, "registers/needs-input.yaml");
if (fs.existsSync(inputsFile)) {
  const text = fs.readFileSync(inputsFile, "utf8");
  const ids = [...text.matchAll(/^\s+- id: (DIE-NI-[0-9]{3})$/gm)].map((match) => match[1]);
  if (ids.length < 24) fail(`only ${ids.length} pass inputs; expected at least 24`);
  if (new Set(ids).size !== ids.length) fail("duplicate pass input IDs");
  notices.push(`${ids.length} registered pass inputs`);
}

const risksFile = path.join(root, "registers/risks.csv");
if (fs.existsSync(risksFile)) {
  const rows = parseCsv(fs.readFileSync(risksFile, "utf8"));
  const idIndex = rows[0].indexOf("id");
  const ids = rows.slice(1).map((row) => row[idIndex]);
  if (ids.length < 24) fail(`only ${ids.length} pass risks; expected at least 24`);
  if (new Set(ids).size !== ids.length) fail("duplicate pass risk IDs");
  ids.forEach((id) => {
    if (!/^DIE-R-[0-9]{3}$/.test(id)) fail(`invalid pass risk ID ${id}`);
  });
  notices.push(`${ids.length} registered pass risks`);
}

const localLink = /\[[^\]]*]\(([^)]+)\)/g;
for (const file of markdown) {
  const text = fs.readFileSync(file, "utf8");
  let match;
  while ((match = localLink.exec(text)) !== null) {
    let target = match[1].trim();
    if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("#")) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#", 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) fail(`${relative(file)} broken local link ${match[1]}`);
  }
}

if (failures.length > 0) {
  console.error("DIE Pass validation FAILED");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

const markdownLines = markdown.reduce(
  (total, file) => total + fs.readFileSync(file, "utf8").split(/\r?\n/).length,
  0
);

console.log("DIE Pass validation PASSED");
notices.forEach((notice) => console.log(`- ${notice}`));
console.log(`- ${markdown.length} Markdown documents`);
console.log(`- ${markdownLines} Markdown lines`);
console.log(`- ${csv.length} CSV registers`);
console.log(`- ${yaml.length} YAML registers`);
