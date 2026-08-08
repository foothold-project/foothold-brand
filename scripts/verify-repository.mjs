// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  "README.md", "README.ko.md", "LICENSE.md", "LICENSE_SCOPE.md", "TRADEMARKS.md",
  "BRAND_BIBLE.md", "VOICE_AND_MESSAGE.md", "MASTER_BOARD_SPEC.md",
  "tokens/foothold.tokens.json", "tokens/foothold.tokens.css",
  "assets/exports/v1/manifest.json", "figma/plugin/manifest.template.json",
  "figma/plugin/src/code.js", "figma/plugin/code.generated.js", "figma/plugin/ui.html",
  "figma/handoff.schema.json"
];
for (const relative of required) if (!exists(relative)) fail(`Missing required file: ${relative}`);

const tokens = JSON.parse(read("tokens/foothold.tokens.json"));
function leafCount(node) {
  if (node && Object.prototype.hasOwnProperty.call(node, "$value")) return 1;
  return Object.entries(node || {}).filter(([key, value]) => !key.startsWith("$") && value && typeof value === "object").reduce((sum, [, value]) => sum + leafCount(value), 0);
}
const dim = tokens.semantic?.color?.state?.adopted?.$extensions?.foothold;
if (dim?.css !== "--dim" || dim?.cssValue !== "var(--brand)") fail("--dim must remain the var(--brand) compatibility alias");
if (tokens.primitive?.color?.["teal-brand"]?.$value !== "#0e7a6e") fail("Approved light brand teal changed");
const expectedFigmaColors = 2 * (leafCount(tokens.primitive.color) + leafCount(tokens.semantic.color));
if (expectedFigmaColors !== 66) fail(`Starter Figma colour contract changed: expected 66, got ${expectedFigmaColors}`);
if (leafCount(tokens.semantic.layout) !== 2) fail("Starter Figma layout contract requires exactly two exposed variables");

const manifest = JSON.parse(read("assets/exports/v1/manifest.json"));
if (manifest.version !== "1.0.1") fail("Asset manifest must retain the approved v1.0.1 baseline");
if (manifest.approvedWordmarkAspect !== 7.841215388) fail("Approved wordmark aspect changed");
if (!Array.isArray(manifest.assets) || manifest.assets.length !== 26) fail("Asset manifest must contain 26 approved SVGs");

for (const item of manifest.assets || []) {
  const full = path.join(root, item.path);
  if (!fs.existsSync(full)) { fail(`Manifest asset missing: ${item.path}`); continue; }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  if (hash !== item.sha256) fail(`Manifest hash mismatch: ${item.path}`);
  if (item.path.startsWith("assets/logo/v1/") && read(item.path).toLowerCase().includes("<text")) fail(`Canonical logo contains live text: ${item.path}`);
}

const protectedRoots = ["assets/logo/v1", "tokens", "scripts", "figma/plugin"];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|mjs|json|md|py|svg|css|html)$/i.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      if (/[A-Za-z]:\\Windows\\Fonts\\/i.test(content)) fail(`Absolute Windows font path: ${path.relative(root, full)}`);
    }
  }
}
for (const relative of protectedRoots) walk(path.join(root, relative));

const pluginSource = read("figma/plugin/src/code.js");
const generatedPlugin = read("figma/plugin/code.generated.js");
const dataPrefix = "const FOOTHOLD_DATA = ";
const dataStart = generatedPlugin.indexOf(dataPrefix);
const dataEnd = generatedPlugin.indexOf(";\n\n// SPDX-License-Identifier: MIT", dataStart);
if (dataStart < 0 || dataEnd < 0) {
  fail("Generated Figma plugin data payload is missing");
} else {
  const pluginData = JSON.parse(generatedPlugin.slice(dataStart + dataPrefix.length, dataEnd));
  if (pluginData.libraryAssets?.length !== 25) fail(`Figma asset library must embed 25 approved vectors, got ${pluginData.libraryAssets?.length ?? 0}`);
  if (pluginData.libraryAssets?.some((asset) => asset.path.endsWith("FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg"))) fail("Composite asset-pack preview must not be nested inside the Figma asset library");
  if (pluginData.libraryAssets?.some((asset) => /<image\b/i.test(asset.svg))) fail("Figma asset library must embed vector-only SVGs");
}
if (/fetch\s*\(|XMLHttpRequest|WebSocket/.test(pluginSource)) fail("Local Figma plugin must not use network APIs");
if (!pluginSource.includes("JSON + SVG + PNG") && !read("figma/plugin/README.md").includes("JSON + SVG + PNG")) fail("Handoff contract is undocumented");
if (!pluginSource.includes('const name = ["color", ...entry.path].join("/")')) fail("Figma primitive variables must retain the canonical color/ prefix");
for (const styleName of [
  "FOOTHOLD / Display / Hero",
  "FOOTHOLD / Heading / Section",
  "FOOTHOLD / Body / Korean",
  "FOOTHOLD / Label / Technical",
  "FOOTHOLD / Subtitle / English"
]) {
  if (!pluginSource.includes(styleName)) fail(`Missing canonical Figma text style: ${styleName}`);
}
if (!pluginSource.includes("variableNames:")) fail("Figma inspection must expose complete variable names for collision preflight");
if (!/frame\.resize\(1280, 240\);\s*frame\.primaryAxisSizingMode = "AUTO";\s*frame\.minHeight = 240;/.test(pluginSource)) fail("Master Board modules must hug content above their 240px minimum height");
if (!/board\.resize\(1440, 1000\);\s*board\.primaryAxisSizingMode = "AUTO";\s*board\.minHeight = 1000;/.test(pluginSource)) fail("Visual Master Board must expand beyond its 1000px minimum height");

const template = JSON.parse(read("figma/plugin/manifest.template.json"));
if (template.documentAccess !== "dynamic-page") fail("Figma manifest must use dynamic-page access");
if (template.networkAccess?.allowedDomains?.[0] !== "none") fail("Figma plugin must disable network access");

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(`Verified ${manifest.assets.length} assets, ${expectedFigmaColors}+2 Figma variables, canonical tokens, license map, and local plugin policy.`);
