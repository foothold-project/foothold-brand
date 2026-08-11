// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTextForDigest } from "./canonical-text.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const tokensText = read("tokens/foothold.tokens.json");
const tokens = JSON.parse(tokensText);
const version = read("VERSION").trim();
const evidence = JSON.parse(read("content/master-board-evidence.json"));

const modules = [
  ["M01", "Brand Core", "ready", "Symbol, wordmark, approved definition", "BRAND_BIBLE.md"],
  ["M02", "Hero Statement", "ready", "Approved English and Korean slogans with precise project scope", "VOICE_AND_MESSAGE.md"],
  ["M03", "Robot and Terrain Visual", "pending", "Illustration direction only; verified source visual required", "MASTER_BOARD_SPEC.md"],
  ["M04", "Sim-to-Real Flow", "pending", "Use only verified labels and capabilities", "MASTER_BOARD_SPEC.md"],
  ["M05", "Why FOOTHOLD", "target", "Approved north star; do not present it as a verified field result", "VOICE_AND_MESSAGE.md"],
  ["M06", "Evidence", "pending", "Metrics, conditions, and source links required", "MASTER_BOARD_SPEC.md"],
  ["M07", "Team", "pending", "Five names and roles require verified source", "MASTER_BOARD_SPEC.md"],
  ["M08", "Roadmap", "pending", "Completed, current, and next must be explicit", "MASTER_BOARD_SPEC.md"],
  ["M09", "Contexts", "pending", "Do not imply formal deployment partners", "MASTER_BOARD_SPEC.md"],
  ["M10", "Closing", "ready", "Use only an approved brand sentence", "VOICE_AND_MESSAGE.md"]
].map(([id, name, status, guidance, source]) => ({ id, name, status, guidance, source }));

const assetManifest = JSON.parse(read("assets/exports/v1/manifest.json"));
const draftManifest = JSON.parse(read("assets/drafts/v1.2/manifest.json"));
function assetCategory(relative) {
  if (/foothold-symbol-|foothold-favicon/.test(relative)) return "Symbols";
  if (/foothold-wordmark-/.test(relative)) return "Wordmarks";
  if (/foothold-lockup-/.test(relative)) return "Lockups";
  if (relative.includes("/web/")) return "Web";
  if (relative.includes("/github/")) return "GitHub";
  if (relative.includes("/presentation/")) return "Presentation";
  if (relative.includes("/poster/")) return "Poster";
  if (relative.includes("/social/")) return "Social";
  if (relative.includes("/goods/")) return "Goods";
  return "Other";
}
const libraryAssets = assetManifest.assets
  .filter((item) => item.path.startsWith("assets/logo/v1/") && !item.path.endsWith("foothold-contact-trail.svg"))
  .map((item) => ({
    path: item.path,
    name: path.basename(item.path, ".svg"),
    category: assetCategory(item.path),
    theme: /(?:dark|reverse)/.test(item.path) ? "dark" : "light",
    width: item.width,
    height: item.height,
    purpose: item.purpose,
    sha256: item.sha256,
    svg: read(item.path)
  }));
const draftAssets = draftManifest.assets.map((item) => ({
  ...item,
  name: path.basename(item.path, ".svg"),
  svg: read(item.path)
}));

const canonicalFiles = [
  "tokens/foothold.tokens.json",
  "BRAND_BIBLE.md",
  "VOICE_AND_MESSAGE.md",
  "MASTER_BOARD_SPEC.md",
  "content/master-board-evidence.json",
  "assets/exports/v1/manifest.json",
  "assets/drafts/v1.2/manifest.json",
  ...libraryAssets.map((item) => item.path),
  ...draftAssets.map((item) => item.path)
];
const digest = crypto.createHash("sha256");
for (const relative of canonicalFiles) {
  digest.update(relative);
  digest.update(normalizeTextForDigest(read(relative)));
}

const data = {
  schemaVersion: "1.0.0",
  brandVersion: version,
  sourceDigest: digest.digest("hex"),
  tokens,
  messages: {
    projectDefinitionKo: "FOOTHOLD는 4족 보행 로봇의 험지 적응을 위한 강화학습 기반 보행 정책을 개발하고 검증하는 프로젝트입니다.",
    whatKo: "4족 보행 로봇을 위한 강화학습 기반 험지 적응 보행 정책",
    subtitleEn: "TERRAIN-ADAPTIVE LOCOMOTION POLICY",
    closingEn: "Find the next foothold.",
    sloganKo: "불확실한 지형에서도, 다음 걸음을 이어갑니다.",
    koreanSloganStatus: "approved",
    whyNorthStarKo: "시뮬레이터에서 천 번 넘어지고, 현장에서는 넘어지지 않는다.",
    whyNorthStarStatus: "target-vision"
  },
  modules,
  evidence: evidence.modules,
  approvedWordmarkAspect: assetManifest.approvedWordmarkAspect,
  libraryAssets,
  draftAssets,
  retiredAssets: ["assets/logo/v1/foothold-contact-trail.svg"],
  legacyApplicationAssets: assetManifest.assets
    .filter((item) => item.path.startsWith("assets/exports/v1/") && !item.path.endsWith("FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg"))
    .map((item) => item.path),
  svg: {
    symbolBrand: read("assets/logo/v1/foothold-symbol-brand.svg"),
    primaryLight: read("assets/logo/v1/foothold-lockup-primary-light.svg"),
    primaryDark: read("assets/logo/v1/foothold-lockup-primary-dark.svg"),
    compactLight: read("assets/logo/v1/foothold-lockup-compact-light.svg"),
    compactDark: read("assets/logo/v1/foothold-lockup-compact-dark.svg"),
    stackedLight: read("assets/logo/v1/foothold-lockup-stacked-light.svg")
  }
};

const source = read("figma/plugin/src/code.js");
const generated = `/* GENERATED FILE. Run npm run generate. SPDX-License-Identifier: MIT */\nconst FOOTHOLD_DATA = ${JSON.stringify(data)};\n\n${source}`;
const output = path.join(root, "figma", "plugin", "code.generated.js");

if (process.argv.includes("--check")) {
  if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== generated) {
    console.error("figma/plugin/code.generated.js is stale. Run npm run generate.");
    process.exit(1);
  }
  console.log("Generated Figma plugin data is current.");
} else {
  fs.writeFileSync(output, generated, "utf8");
  console.log(`Generated ${path.relative(root, output)} (${data.sourceDigest.slice(0, 12)}).`);
}
