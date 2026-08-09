// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTextForDigest } from "./canonical-text.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  "README.md", "README.ko.md", "LICENSE.md", "LICENSE_SCOPE.md", "TRADEMARKS.md",
  "BRAND_BIBLE.md", "VOICE_AND_MESSAGE.md", "MASTER_BOARD_SPEC.md",
  "content/master-board-evidence.json", "docs/CONTENT_EVIDENCE_MATRIX.md",
  "tokens/foothold.tokens.json", "tokens/foothold.tokens.css",
  "assets/exports/v1/manifest.json", "assets/drafts/v1.2/manifest.json",
  "assets/drafts/v1.2/goods/foothold-sticker-round.svg", "figma/plugin/manifest.template.json",
  "figma/plugin/src/code.js", "figma/plugin/code.generated.js", "figma/plugin/ui.html",
  "figma/handoff.schema.json", "scripts/canonical-text.mjs", "scripts/generate-draft-assets.mjs",
  "scripts/update-compact-spacing.mjs", "scripts/build_asset_pack.py"
];
for (const relative of required) if (!exists(relative)) fail(`Missing required file: ${relative}`);

const tokens = JSON.parse(read("tokens/foothold.tokens.json"));
const lfDigest = crypto.createHash("sha256").update(normalizeTextForDigest("alpha\nbeta\n")).digest("hex");
const crlfDigest = crypto.createHash("sha256").update(normalizeTextForDigest("alpha\r\nbeta\r\n")).digest("hex");
const crDigest = crypto.createHash("sha256").update(normalizeTextForDigest("alpha\rbeta\r")).digest("hex");
if (lfDigest !== crlfDigest || lfDigest !== crDigest) fail("Canonical text digest must be independent of line endings");
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
if (manifest.version !== "1.0.2") fail("Asset manifest must retain the approved v1.0.2 baseline");
if (manifest.approvedWordmarkAspect !== 7.841215388) fail("Approved wordmark aspect changed");
if (!Array.isArray(manifest.assets) || manifest.assets.length !== 26) fail("Asset manifest must contain 26 approved SVGs");
for (const relative of ["assets/logo/v1/foothold-lockup-compact-light.svg", "assets/logo/v1/foothold-lockup-compact-dark.svg"]) {
  const svg = read(relative);
  const item = manifest.assets.find((asset) => asset.path === relative);
  if (!svg.includes('width="537.108"') || !svg.includes('viewBox="0 0 537.108 96"') || !svg.includes('transform="translate(88 72)"')) fail(`Compact lockup spacing contract changed: ${relative}`);
  if (item?.width !== 537.108 || item?.height !== 96) fail(`Compact manifest dimensions changed: ${relative}`);
}

const draftManifest = JSON.parse(read("assets/drafts/v1.2/manifest.json"));
if (draftManifest.status !== "provisional") fail("v1.2 draft manifest must remain provisional until human approval");
if (!Array.isArray(draftManifest.assets) || draftManifest.assets.length !== 1) fail("v1.2 draft manifest must contain the current sticker review asset");

const evidence = JSON.parse(read("content/master-board-evidence.json"));
const evidenceModuleIds = Object.keys(evidence.modules || {});
if (evidenceModuleIds.join(",") !== "M03,M04,M05,M06,M07,M08,M09") fail("Evidence matrix must gate exactly M03 through M09 in order");
if (!evidence.rules?.primaryEvidenceWins || !evidence.rules?.proposalIsNotFact) fail("Evidence authority rules must remain explicit");
if (!evidence.modules?.M06?.prohibitedClaims?.some((claim) => claim.includes("21,385 steps/s"))) fail("Known training-throughput conflict must remain blocked");
if (!evidence.modules?.M07?.status?.startsWith("pending")) fail("Team roles must remain pending until five-person approval exists");

for (const item of manifest.assets || []) {
  const full = path.join(root, item.path);
  if (!fs.existsSync(full)) { fail(`Manifest asset missing: ${item.path}`); continue; }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  if (hash !== item.sha256) fail(`Manifest hash mismatch: ${item.path}`);
  if (item.path.startsWith("assets/logo/v1/") && read(item.path).toLowerCase().includes("<text")) fail(`Canonical logo contains live text: ${item.path}`);
}
for (const item of draftManifest.assets || []) {
  const full = path.join(root, item.path);
  if (!fs.existsSync(full)) { fail(`Draft manifest asset missing: ${item.path}`); continue; }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  if (hash !== item.sha256) fail(`Draft manifest hash mismatch: ${item.path}`);
  if (item.status !== "provisional") fail(`Draft asset must remain provisional: ${item.path}`);
  if (/<text\b/i.test(read(item.path))) fail(`Draft sticker must remain outlined and font-independent: ${item.path}`);
  if (!read(item.path).includes('stroke-width="6"') || !read(item.path).includes('transform="translate(100 92)"')) fail(`Draft sticker must retain the stacked lockup with the approved thin-border review geometry: ${item.path}`);
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
  if (pluginData.libraryAssets?.length !== 13) fail(`Figma approved library must embed 13 core vectors, got ${pluginData.libraryAssets?.length ?? 0}`);
  if (pluginData.libraryAssets?.some((asset) => asset.path.endsWith("foothold-contact-trail.svg"))) fail("Retired contact trail must not appear in the approved Figma library");
  if (pluginData.libraryAssets?.some((asset) => asset.path.endsWith("FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg"))) fail("Composite asset-pack preview must not be nested inside the Figma asset library");
  if (pluginData.libraryAssets?.some((asset) => /<image\b/i.test(asset.svg))) fail("Figma asset library must embed vector-only SVGs");
  if (pluginData.draftAssets?.length !== 1 || pluginData.draftAssets[0]?.status !== "provisional") fail("Figma payload must separate the provisional sticker draft from approved assets");
  if (pluginData.approvedWordmarkAspect !== manifest.approvedWordmarkAspect) fail("Figma payload must retain the approved wordmark aspect");
  if (pluginData.messages?.closingEn !== "Find the next foothold.") fail("Figma payload must retain the approved closing statement");
  if (pluginData.messages?.koreanSloganStatus !== "approved") fail("Korean slogan must remain approved");
  if (pluginData.messages?.sloganKo !== "불확실한 지형에서도, 다음 걸음을 이어갑니다.") fail("Figma payload must retain the approved Korean slogan");
  if (pluginData.messages?.projectDefinitionKo !== "FOOTHOLD는 4족 보행 로봇의 험지 적응을 위한 강화학습 기반 보행 정책을 개발하고 검증하는 프로젝트입니다.") fail("Figma payload must retain the approved Korean project definition");
  if (Object.values(pluginData.messages || {}).some((value) => typeof value === "string" && value.includes("사람이 먼저 밟아볼 수 없는 땅을"))) fail("Retired Korean draft must not enter the production Figma payload");
  for (const key of ["primaryLight", "compactLight", "compactDark", "stackedLight"]) {
    if (!pluginData.svg?.[key]?.includes("<svg")) fail(`Figma payload is missing canonical SVG: ${key}`);
    if (/<text\b/i.test(pluginData.svg?.[key] || "")) fail(`Figma canonical SVG must not contain live text: ${key}`);
  }
}
if (/fetch\s*\(|XMLHttpRequest|WebSocket/.test(pluginSource)) fail("Local Figma plugin must not use network APIs");
for (const exportName of ["foothold-handoff.json", "foothold-master-board.svg", "foothold-master-board.png", "foothold-osmu-review.svg", "foothold-osmu-review.png"]) {
  if (!pluginSource.includes(exportName)) fail(`Figma handoff contract is missing export: ${exportName}`);
}
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
if (!pluginSource.includes("safeWidth / artwork.width") || !pluginSource.includes("safeHeight / artwork.height")) fail("Figma asset previews must scale from imported vector bounds with a safe area");
for (const readyModuleHelper of ["appendBrandCore", "appendHeroHierarchy", "appendClosing"]) {
  if (!pluginSource.includes(`async function ${readyModuleHelper}`)) fail(`Missing approved Master Board helper: ${readyModuleHelper}`);
}
if (pluginSource.includes("async function createCandidateStrip") || pluginSource.includes("KOREAN SLOGAN REVIEW · PROVISIONAL")) fail("Approved Korean slogan must replace the provisional candidate review UI");
if (!pluginSource.includes('createMessageCard("Approved Korean slogan", FOOTHOLD_DATA.messages.sloganKo, 1208)')) fail("M02 must present the approved Korean slogan in a full-width card");
for (const reviewHelper of ["createWebHeaderReview", "createReadmeHeroReview", "createPresentationReview", "createPosterHeaderReview", "createSocialReview", "createStickerReview", "createOsmuReview"]) {
  if (!pluginSource.includes(`async function ${reviewHelper}`)) fail(`Missing medium-specific OSMU review helper: ${reviewHelper}`);
}
if (!pluginSource.includes("foothold-osmu-review.svg") || !pluginSource.includes("foothold-osmu-review.png")) fail("Figma review export must include OSMU SVG and PNG previews");

const template = JSON.parse(read("figma/plugin/manifest.template.json"));
if (template.documentAccess !== "dynamic-page") fail("Figma manifest must use dynamic-page access");
if (template.networkAccess?.allowedDomains?.[0] !== "none") fail("Figma plugin must disable network access");

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(`Verified ${manifest.assets.length} frozen v1 assets, ${draftManifest.assets.length} provisional v1.2 asset, ${expectedFigmaColors}+2 Figma variables, canonical tokens, license map, and local plugin policy.`);
