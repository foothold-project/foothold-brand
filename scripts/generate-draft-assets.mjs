// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "assets/exports/v1/goods/foothold-sticker-round.svg");
const outputPath = path.join(root, "assets/drafts/v1.2/goods/foothold-sticker-round.svg");
const manifestPath = path.join(root, "assets/drafts/v1.2/manifest.json");

const source = fs.readFileSync(sourcePath, "utf8");
const output = source
  .replace("<title id=\"title\">foothold-sticker-round</title>", "<title id=\"title\">FOOTHOLD round sticker draft</title>")
  .replace(
    "<desc id=\"desc\">Round sticker and goods source with the stacked lockup.</desc>",
    "<desc id=\"desc\">Provisional round sticker with the approved stacked lockup, a thinner border, and a larger cut-safe margin.</desc>"
  )
  .replace(
    '<circle cx="400" cy="400" r="384" fill="#f6f5f1" stroke="#0e7a6e" stroke-width="12"/>',
    '<path d="M400 50a350 350 0 1 1 0 700 350 350 0 1 1 0-700Z" fill="#f6f5f1" stroke="#0e7a6e" stroke-width="6"/>'
  );

if (output === source) throw new Error("Draft sticker transform did not match the frozen v1 source.");
const hash = crypto.createHash("sha256").update(output).digest("hex");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.assets[0].sha256 = hash;
const manifestOutput = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== output) {
    console.error("Draft sticker is stale. Run npm run generate.");
    process.exit(1);
  }
  if (fs.readFileSync(manifestPath, "utf8") !== manifestOutput) {
    console.error("Draft asset manifest is stale. Run npm run generate.");
    process.exit(1);
  }
  console.log("Generated draft assets are current.");
} else {
  fs.writeFileSync(outputPath, output, "utf8");
  fs.writeFileSync(manifestPath, manifestOutput, "utf8");
  console.log(`Generated ${path.relative(root, outputPath)} (${hash.slice(0, 12)}).`);
}
