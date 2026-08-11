// SPDX-License-Identifier: MIT
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const approvalPath = "assets/osmu/v1.2/APPROVAL.json";
const manifestPath = "assets/osmu/v1.2/manifest.json";
const check = process.argv.includes("--check");
const approval = JSON.parse(fs.readFileSync(path.join(root, approvalPath), "utf8"));
const backgrounds = { light: "#F6F5F1", dark: "#12161D" };
const specs = [
  ["web", "foothold-web-header", "light"],
  ["github", "foothold-readme-hero", "light"],
  ["presentation", "foothold-presentation-opener-16x9", "dark"],
  ["poster", "foothold-poster-header", "light"],
  ["social", "foothold-social-square", "dark"],
  ["goods", "foothold-sticker-round", "light"]
];

const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
function svgDimensions(source) {
  const tag = source.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const width = Number(tag.match(/\bwidth="([\d.]+)"/)?.[1]);
  const height = Number(tag.match(/\bheight="([\d.]+)"/)?.[1]);
  if (!width || !height) throw new Error("Approved OSMU SVG must declare numeric width and height.");
  return { width, height };
}

const rendered = [];
for (const [medium, name, theme] of specs) {
  const svgPath = `assets/osmu/v1.2/${medium}/${name}.svg`;
  const svg = fs.readFileSync(path.join(root, svgPath), "utf8");
  if (/<text\b|<image\b/i.test(svg)) throw new Error(`Approved OSMU SVG must be outlined and self-contained: ${svgPath}`);
  const sourceSize = svgDimensions(svg);
  const png = Buffer.from(new Resvg(svg, {
    fitTo: { mode: "width", value: sourceSize.width * 2 },
    font: { loadSystemFonts: false },
    logLevel: "off"
  }).render().asPng());
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (png.readUInt8(25) !== 6) throw new Error(`Approved OSMU PNG must retain RGBA: ${name}`);
  rendered.push({
    medium,
    name,
    theme,
    background: backgrounds[theme],
    svg: { path: svgPath, width: sourceSize.width, height: sourceSize.height, sha256: sha256(Buffer.from(svg)) },
    png: { path: `assets/raster/v1.2/osmu/${medium}/${name}.png`, width, height, sha256: sha256(png) },
    jpg: { path: `assets/raster/v1.2/osmu/${medium}/${name}.jpg`, width, height },
    pngBytes: png
  });
}

const base = {
  name: "FOOTHOLD Approved OSMU v1.2",
  version: "1.2.0",
  status: approval.status,
  approvedAt: approval.approvedAt,
  figmaExportedAt: approval.figmaExportedAt,
  figmaSourceDigest: approval.figmaSourceDigest,
  policy: {
    canonicalFormat: "outlined self-contained SVG",
    png: "2x RGBA derivative",
    jpg: "2x background-filled derivative; exact source canvas with no added padding",
    lightBackground: backgrounds.light,
    darkBackground: backgrounds.dark
  }
};

let stale = false;
if (check) {
  if (!fs.existsSync(path.join(root, manifestPath))) throw new Error(`Missing ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
  const expectedBase = JSON.stringify(base);
  const actualBase = JSON.stringify({ ...manifest, assets: undefined });
  if (expectedBase !== actualBase) { console.error("Approved OSMU manifest policy is stale."); stale = true; }
  if (!Array.isArray(manifest.assets) || manifest.assets.length !== rendered.length) { console.error("Approved OSMU manifest must contain six assets."); stale = true; }
  else for (let index = 0; index < rendered.length; index += 1) {
    const item = rendered[index];
    const actual = manifest.assets[index];
    const pngPath = path.join(root, item.png.path);
    const jpgPath = path.join(root, item.jpg.path);
    if (JSON.stringify({ ...actual, jpg: { ...actual.jpg, sha256: undefined } }) !== JSON.stringify({ ...item, pngBytes: undefined, jpg: { ...item.jpg, sha256: undefined } })) { console.error(`Approved OSMU metadata is stale: ${item.name}`); stale = true; continue; }
    if (!fs.existsSync(pngPath) || !fs.readFileSync(pngPath).equals(item.pngBytes)) { console.error(`Approved OSMU PNG is stale: ${item.png.path}`); stale = true; }
    if (!fs.existsSync(jpgPath)) { console.error(`Approved OSMU JPG is missing: ${item.jpg.path}`); stale = true; continue; }
    const jpgBytes = fs.readFileSync(jpgPath);
    const metadata = await sharp(jpgBytes).metadata();
    if (sha256(jpgBytes) !== actual.jpg.sha256 || metadata.format !== "jpeg" || metadata.width !== item.jpg.width || metadata.height !== item.jpg.height || metadata.hasAlpha) { console.error(`Approved OSMU JPG failed integrity checks: ${item.jpg.path}`); stale = true; }
  }
  if (stale) process.exit(1);
  console.log("Verified 6 approved OSMU SVG/PNG/JPG asset sets.");
} else {
  const assets = [];
  for (const item of rendered) {
    fs.mkdirSync(path.dirname(path.join(root, item.png.path)), { recursive: true });
    fs.writeFileSync(path.join(root, item.png.path), item.pngBytes);
    const jpgBytes = await sharp(item.pngBytes).flatten({ background: item.background }).jpeg({ quality: 95, chromaSubsampling: "4:4:4", progressive: true }).toBuffer();
    fs.writeFileSync(path.join(root, item.jpg.path), jpgBytes);
    const { pngBytes, ...metadata } = item;
    assets.push({ ...metadata, jpg: { ...metadata.jpg, sha256: sha256(jpgBytes) } });
  }
  fs.writeFileSync(path.join(root, manifestPath), `${JSON.stringify({ ...base, assets }, null, 2)}\n`, "utf8");
  console.log("Generated 6 approved OSMU PNG/JPG asset sets.");
}
