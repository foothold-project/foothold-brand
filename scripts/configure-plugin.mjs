// SPDX-License-Identifier: MIT
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginId = process.argv[2];
if (!/^\d{8,}$/.test(pluginId || "")) {
  console.error("Usage: node scripts/configure-plugin.mjs FIGMA_NUMERIC_PLUGIN_ID");
  process.exit(1);
}

const templatePath = path.join(root, "figma", "plugin", "manifest.template.json");
const outputPath = path.join(root, "figma", "plugin", "manifest.json");
const template = fs.readFileSync(templatePath, "utf8");
fs.writeFileSync(outputPath, template.replace("__FIGMA_PLUGIN_ID__", pluginId), "utf8");
console.log(`Created ${path.relative(root, outputPath)} for local development.`);
