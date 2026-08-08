// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const tokensText = read("tokens/foothold.tokens.json");
const tokens = JSON.parse(tokensText);
const version = read("VERSION").trim();

const modules = [
  ["M01", "Brand Core", "ready", "Symbol, wordmark, approved definition", "BRAND_BIBLE.md"],
  ["M02", "Hero Statement", "ready", "Why to What hierarchy", "VOICE_AND_MESSAGE.md"],
  ["M03", "Robot and Terrain Visual", "pending", "Illustration direction only; verified source visual required", "MASTER_BOARD_SPEC.md"],
  ["M04", "Sim-to-Real Flow", "pending", "Use only verified labels and capabilities", "MASTER_BOARD_SPEC.md"],
  ["M05", "Why FOOTHOLD", "pending", "Do not imply deployed operations", "MASTER_BOARD_SPEC.md"],
  ["M06", "Evidence", "pending", "Metrics, conditions, and source links required", "MASTER_BOARD_SPEC.md"],
  ["M07", "Team", "pending", "Five names and roles require verified source", "MASTER_BOARD_SPEC.md"],
  ["M08", "Roadmap", "pending", "Completed, current, and next must be explicit", "MASTER_BOARD_SPEC.md"],
  ["M09", "Contexts", "pending", "Do not imply formal deployment partners", "MASTER_BOARD_SPEC.md"],
  ["M10", "Closing", "ready", "Use only an approved brand sentence", "VOICE_AND_MESSAGE.md"]
].map(([id, name, status, guidance, source]) => ({ id, name, status, guidance, source }));

const canonicalFiles = [
  "tokens/foothold.tokens.json",
  "BRAND_BIBLE.md",
  "VOICE_AND_MESSAGE.md",
  "MASTER_BOARD_SPEC.md",
  "assets/logo/v1/foothold-symbol-brand.svg",
  "assets/logo/v1/foothold-lockup-primary-light.svg",
  "assets/logo/v1/foothold-lockup-primary-dark.svg"
];
const digest = crypto.createHash("sha256");
for (const relative of canonicalFiles) {
  digest.update(relative);
  digest.update(fs.readFileSync(path.join(root, relative)));
}

const data = {
  schemaVersion: "1.0.0",
  brandVersion: version,
  sourceDigest: digest.digest("hex"),
  tokens,
  messages: {
    whyKo: "사람이 먼저 밟아볼 수 없는 땅을, 로봇이 넘어지지 않고 건너가게 만듭니다.",
    whatKo: "4족 보행 로봇을 위한 강화학습 기반 험지 적응 보행 정책",
    subtitleEn: "TERRAIN-ADAPTIVE LOCOMOTION POLICY"
  },
  modules,
  svg: {
    symbolBrand: read("assets/logo/v1/foothold-symbol-brand.svg"),
    primaryLight: read("assets/logo/v1/foothold-lockup-primary-light.svg"),
    primaryDark: read("assets/logo/v1/foothold-lockup-primary-dark.svg")
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
