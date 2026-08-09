// SPDX-License-Identifier: MIT
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonical = [
  "assets/logo/v1/foothold-lockup-compact-light.svg",
  "assets/logo/v1/foothold-lockup-compact-dark.svg"
];
const embedded = [
  "assets/exports/v1/web/foothold-web-header-light.svg",
  "assets/exports/v1/web/foothold-web-header-dark.svg"
];
const targets = [...canonical, ...embedded];

function corrected(relative, source) {
  let output = source.replace('transform="translate(76 72)"', 'transform="translate(88 72)"');
  if (canonical.includes(relative)) {
    output = output
      .replace('width="525.108"', 'width="537.108"')
      .replace('viewBox="0 0 525.108 96"', 'viewBox="0 0 537.108 96"');
  }
  return output;
}

let stale = false;
for (const relative of targets) {
  const full = path.join(root, relative);
  const source = fs.readFileSync(full, "utf8");
  const output = corrected(relative, source);
  const valid = output.includes('transform="translate(88 72)"') &&
    (!canonical.includes(relative) || (output.includes('width="537.108"') && output.includes('viewBox="0 0 537.108 96"')));
  if (!valid) throw new Error(`Compact spacing contract could not be established: ${relative}`);
  if (source !== output) {
    stale = true;
    if (!process.argv.includes("--check")) fs.writeFileSync(full, output, "utf8");
  }
}

if (process.argv.includes("--check") && stale) {
  console.error("Compact spacing correction is stale. Run node scripts/update-compact-spacing.mjs.");
  process.exit(1);
}
console.log(stale ? "Applied Compact +12px spacing correction." : "Compact +12px spacing correction is current.");
