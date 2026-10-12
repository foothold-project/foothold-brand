# FOOTHOLD Brand System

[한국어](./README.ko.md) · English

![FOOTHOLD approved GitHub medium (OSMU v1.2)](./assets/osmu/v1.2/github/foothold-readme-hero.svg)

FOOTHOLD is the shared visual and verbal system for a terrain-adaptive quadruped locomotion project. This repository is the canonical source for brand tokens, approved logo geometry, messaging, the ratio-independent Visual Master Board, and reusable delivery assets.

> Find the next foothold.

**TARGET VISION** — `시뮬레이터에서 천 번 넘어지고, 현장에서는 넘어지지 않는다.` This is the intended Sim-to-Real outcome, not a verified zero-fall field result.

## Current status

- `v1.0.2`: approved logo geometry with SVG sources and reproducible PNG derivatives, including the Compact spacing correction
- `v1.1.0`: public, cross-platform foundation and local Figma synchronization infrastructure
- `v1.2.0`: approved six-medium OSMU baseline; project-specific M03–M09 evidence remains progressively gated
- `Master Board v1.3` (merged to main 2026-10-12): board **content** for M03, M04, M06, M07, M08, and M09 ([`content/master-board-v1.3.json`](./content/master-board-v1.3.json)) and the Figma plugin that draws it. Status `review-baseline`; content as of 2026-10-12. The Figma board was redrawn from this content on 2026-10-12 (Cover shows `Source 8bab73bfa169`). **Logo and medium assets did not change** (logos: `assets/logo/v1`; approved media: `assets/osmu/v1.2`), so `assets/` has no v1.3 folder.

**Where to view**: [Figma Master Board](https://www.figma.com/design/m5qkVCvqPW76J7pnY3vFEP?node-id=16-70) (Visual Master Board M01–M10, OSMU Review across six media, Foundations). Source files and downloads: [`assets/`](./assets/) and [`assets/ASSET_INDEX.md`](./assets/ASSET_INDEX.md).

## Approved assets at a glance

Everything below is the current approved version; use these files as they are in new work. The image at the top is the approved GitHub medium, [`assets/osmu/v1.2/github/foothold-readme-hero.svg`](./assets/osmu/v1.2/github/foothold-readme-hero.svg).

**Logo** · [`assets/logo/v1`](./assets/logo/v1/)

<table>
<tr>
<td align="center"><img src="./assets/logo/v1/foothold-lockup-primary-light.svg" width="380" alt="FOOTHOLD primary lockup for light surfaces"><br><sub>Primary · symbol, wordmark, and subtitle</sub></td>
<td align="center"><img src="./assets/logo/v1/foothold-lockup-compact-light.svg" width="300" alt="FOOTHOLD compact lockup"><br><sub>Compact · no subtitle, small placements</sub></td>
</tr>
<tr>
<td align="center"><img src="./assets/logo/v1/foothold-lockup-stacked-light.svg" width="190" alt="FOOTHOLD stacked lockup"><br><sub>Stacked · square placements</sub></td>
<td align="center"><img src="./assets/logo/v1/foothold-symbol-brand.svg" width="110" alt="FOOTHOLD symbol"><br><sub>Symbol · icon and favicon placements</sub></td>
</tr>
</table>

**Approved media (OSMU v1.2)** · [`assets/osmu/v1.2`](./assets/osmu/v1.2/) · download all [`FOOTHOLD_OSMU_V1_2.zip`](./assets/FOOTHOLD_OSMU_V1_2.zip)

<table>
<tr>
<td align="center"><img src="./assets/osmu/v1.2/web/foothold-web-header.svg" width="420" alt="Approved web header"><br><sub>Web header</sub></td>
<td align="center"><img src="./assets/osmu/v1.2/presentation/foothold-presentation-opener-16x9.svg" width="320" alt="Approved 16:9 presentation opener"><br><sub>Presentation opener 16:9</sub></td>
</tr>
<tr>
<td align="center"><img src="./assets/osmu/v1.2/poster/foothold-poster-header.svg" width="420" alt="Approved poster header"><br><sub>Poster header</sub></td>
<td align="center"><img src="./assets/osmu/v1.2/social/foothold-social-square.svg" width="170" alt="Approved social square"> <img src="./assets/osmu/v1.2/goods/foothold-sticker-round.svg" width="170" alt="Approved round sticker"><br><sub>Social square · round sticker</sub></td>
</tr>
</table>

For colours and type, load [`tokens/foothold.tokens.css`](./tokens/foothold.tokens.css) and use `var(--brand)`, `var(--paper)`, and `var(--ink)` directly (dark-mode values included). The 3-degree forward slant of the wordmark is part of the SVG; do not retype it in a font.

`assets/exports/v1/FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg` is the old v1 proof sheet. It draws other SVG files from the same folder, so it shows empty logo frames when opened on its own in a README or a browser. To view that sheet, open the [`.png`](./assets/exports/v1/FOOTHOLD_ASSET_PACK_V1_PREVIEW.png) with the same name.

The v1.1 implementation intentionally does not invent robot imagery, metrics, team roles, deployment claims, or roadmap facts that have not been verified.

## Source of truth

| Decision | Canonical source |
|---|---|
| Token values | [`tokens/foothold.tokens.json`](./tokens/foothold.tokens.json) |
| Approved logo geometry | [`assets/logo/v1`](./assets/logo/v1/) canonical SVG paths |
| Approved wording | [`VOICE_AND_MESSAGE.md`](./VOICE_AND_MESSAGE.md) |
| Brand rules | [`BRAND_BIBLE.md`](./BRAND_BIBLE.md) |
| Module structure | [`MASTER_BOARD_SPEC.md`](./MASTER_BOARD_SPEC.md) |
| Project-content evidence | [`content/master-board-evidence.json`](./content/master-board-evidence.json) |
| Visual composition proposals | Figma Master Board, promoted only after review |

Figma is an editable visual workspace, not a second token or logo source. A Figma-only change remains a proposal until it is exported, reviewed, and promoted to this repository.

## Repository map

```text
assets/          approved logo and OSMU SVG sources, reproducible PNG/JPG derivatives, and delivery exports
concepts/        review history; never use as production assets
content/         machine-readable evidence gates for project-specific claims
figma/           mappings, Master Board specification, local plugin
templates/       OSMU templates as they are approved
tokens/          canonical DTCG JSON and generated CSS
scripts/         deterministic cross-platform validation
docs/            governance, source-of-truth, and roadmap
```

## Quick checks

Node.js 20.9 or newer is required.

```bash
npm run generate
npm test
```

The committed generated files must remain byte-for-byte current after `npm run generate`.

## Ready-to-use asset packs

- [`FOOTHOLD_SVG_ASSET_PACK_V1.zip`](./assets/FOOTHOLD_SVG_ASSET_PACK_V1.zip): SVG-only vector package.
- [`FOOTHOLD_ASSET_PACK_V1.zip`](./assets/FOOTHOLD_ASSET_PACK_V1.zip): combined SVG + PNG + background-filled JPG package.
- [`FOOTHOLD_OSMU_V1_2.zip`](./assets/FOOTHOLD_OSMU_V1_2.zip): current approved Web, GitHub, presentation, poster, social, and sticker SVG/PNG/JPG assets.
- [`assets/osmu/v1.2/manifest.json`](./assets/osmu/v1.2/manifest.json): approval provenance, dimensions, lifecycle, and hashes for the current OSMU baseline.
- [`assets/raster/v1/manifest.json`](./assets/raster/v1/manifest.json): source mapping, pixel dimensions, alpha policy, status, and hashes for every PNG derivative.
- [`assets/raster/v1/jpeg/manifest.json`](./assets/raster/v1/jpeg/manifest.json): lifecycle, exact canvas, background, and hashes for every JPG derivative.

SVG remains canonical. PNG logo files keep a transparent RGBA canvas. JPG companions flatten that same canvas onto exact brand paper `#F6F5F1` or engineering dark `#12161D`, without added padding; favicon is intentionally excluded. Legacy, retired, and provisional outputs remain in separate lifecycle directories and must not be mistaken for approved OSMU templates.

Current approved OSMU sources live only in [`assets/osmu/v1.2`](./assets/osmu/v1.2/). Files under `assets/exports/v1` and their raster companions are preserved legacy composition proofs, not the approved current designs.

## Figma workflow

The local plugin does not consume Figma MCP calls and does not require a Professional plan. Use the Figma desktop app, create a development plugin once to obtain a plugin ID, then follow [`figma/plugin/README.md`](./figma/plugin/README.md).

```text
Git canonical source
  -> local Figma plugin sync
  -> visual edit and approval
  -> JSON + SVG + PNG handoff
  -> Codex diff and human approval
  -> Git promotion and regeneration
```

## Licensing

This is a mixed-license repository. Code and token sources use MIT; eligible brand documentation uses CC BY 4.0; FOOTHOLD names, logos, and designated brand assets are excluded from those grants. Read [`LICENSE.md`](./LICENSE.md), [`LICENSE_SCOPE.md`](./LICENSE_SCOPE.md), and [`TRADEMARKS.md`](./TRADEMARKS.md) before reuse.
