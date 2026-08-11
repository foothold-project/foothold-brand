// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const approvedManifestPath = path.join(root, "assets/exports/v1/manifest.json");
const draftManifestPath = path.join(root, "assets/drafts/v1.2/manifest.json");
const rasterManifestPath = path.join(root, "assets/raster/v1/manifest.json");
const check = process.argv.includes("--check");

const approvedManifest = JSON.parse(fs.readFileSync(approvedManifestPath, "utf8"));
const draftManifest = JSON.parse(fs.readFileSync(draftManifestPath, "utf8"));

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function targetWidth(item) {
  const name = path.basename(item.path);
  if (!item.path.startsWith("assets/logo/v1/")) return Math.round(item.width);
  if (name.startsWith("foothold-symbol-")) return 512;
  if (name.startsWith("foothold-wordmark-")) return 2400;
  if (name.includes("lockup-primary")) return 2400;
  if (name.includes("lockup-compact")) return 1600;
  if (name.includes("lockup-stacked")) return 1600;
  if (name === "foothold-favicon.svg") return 512;
  if (name === "foothold-contact-trail.svg") return 1800;
  throw new Error(`No raster profile for ${item.path}`);
}

function approvedOutputPath(sourcePath) {
  if (sourcePath.startsWith("assets/logo/v1/")) {
    return sourcePath.replace("assets/logo/v1/", "assets/raster/v1/logo/").replace(/\.svg$/i, ".png");
  }
  if (sourcePath.startsWith("assets/exports/v1/")) {
    return sourcePath.replace("assets/exports/v1/", "assets/raster/v1/").replace(/\.svg$/i, ".png");
  }
  throw new Error(`Unsupported approved source path: ${sourcePath}`);
}

function draftOutputPath(sourcePath) {
  return sourcePath.replace("assets/drafts/v1.2/", "assets/raster/drafts/v1.2/").replace(/\.svg$/i, ".png");
}

function render(sourcePath, outputPath, width) {
  const source = fs.readFileSync(path.join(root, sourcePath), "utf8");
  const rendered = new Resvg(source, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
    logLevel: "off"
  }).render();
  const png = Buffer.from(rendered.asPng());
  const signature = png.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error(`Invalid PNG output: ${outputPath}`);
  const pngWidth = png.readUInt32BE(16);
  const pngHeight = png.readUInt32BE(20);
  const colorType = png.readUInt8(25);
  if (colorType !== 6) throw new Error(`PNG must retain an RGBA alpha channel: ${outputPath}`);
  return { png, width: pngWidth, height: pngHeight, sha256: sha256(png) };
}

const v1Assets = [];
for (const item of approvedManifest.assets) {
  // The composite contact sheet contains external SVG references and live review labels.
  // Its existing PNG remains a visual review artifact, not a reusable production asset.
  if (item.path.endsWith("FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg")) continue;
  const outputPath = approvedOutputPath(item.path);
  const result = render(item.path, outputPath, targetWidth(item));
  const status = item.path.startsWith("assets/exports/v1/")
    ? "legacy"
    : item.path.endsWith("foothold-contact-trail.svg")
      ? "retired"
      : "approved";
  v1Assets.push({
    source: item.path,
    path: outputPath,
    width: result.width,
    height: result.height,
    alphaPolicy: item.path.startsWith("assets/logo/v1/") ? "transparent-canvas" : "source-defined",
    status,
    sha256: result.sha256,
    png: result.png
  });
}

const provisionalAssets = [];
for (const item of draftManifest.assets) {
  const outputPath = draftOutputPath(item.path);
  const result = render(item.path, outputPath, 2400);
  provisionalAssets.push({
    source: item.path,
    path: outputPath,
    width: result.width,
    height: result.height,
    alphaPolicy: "source-defined-transparent-outside-cut-line",
    status: "provisional",
    sha256: result.sha256,
    png: result.png
  });
}

const serialise = (item) => {
  const { png, ...metadata } = item;
  return metadata;
};
const rasterManifest = {
  name: "FOOTHOLD PNG Derivatives",
  version: approvedManifest.version,
  generatedFrom: [
    "assets/exports/v1/manifest.json",
    "assets/drafts/v1.2/manifest.json",
    "canonical SVG paths only"
  ],
  renderer: "@resvg/resvg-js 2.6.2",
  policy: {
    canonicalFormat: "SVG",
    logoBackground: "transparent",
    applicationBackground: "preserve source SVG canvas",
    colourEncoding: "8-bit RGBA values interpreted as sRGB; no embedded ICC profile",
    scaling: "fixed pixel profiles; never redraw or re-typeset"
  },
  assets: v1Assets.map(serialise),
  provisionalAssets: provisionalAssets.map(serialise)
};
const manifestOutput = `${JSON.stringify(rasterManifest, null, 2)}\n`;
const statusCounts = v1Assets.reduce((counts, item) => {
  counts[item.status] = (counts[item.status] ?? 0) + 1;
  return counts;
}, {});

let stale = false;
for (const item of [...v1Assets, ...provisionalAssets]) {
  const output = path.join(root, item.path);
  if (check) {
    if (!fs.existsSync(output) || !fs.readFileSync(output).equals(item.png)) {
      console.error(`Raster asset is stale: ${item.path}`);
      stale = true;
    }
  } else {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, item.png);
  }
}

if (check) {
  if (!fs.existsSync(rasterManifestPath) || fs.readFileSync(rasterManifestPath, "utf8") !== manifestOutput) {
    console.error("Raster manifest is stale: assets/raster/v1/manifest.json");
    stale = true;
  }
  if (stale) process.exit(1);
  console.log(`Verified ${statusCounts.approved ?? 0} approved, ${statusCounts.retired ?? 0} retired, ${statusCounts.legacy ?? 0} legacy, and ${provisionalAssets.length} provisional PNG derivatives.`);
} else {
  fs.mkdirSync(path.dirname(rasterManifestPath), { recursive: true });
  fs.writeFileSync(rasterManifestPath, manifestOutput, "utf8");
  console.log(`Generated ${statusCounts.approved ?? 0} approved, ${statusCounts.retired ?? 0} retired, ${statusCounts.legacy ?? 0} legacy, and ${provisionalAssets.length} provisional PNG derivatives.`);
}
