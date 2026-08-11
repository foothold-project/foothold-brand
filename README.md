# FOOTHOLD Brand System

[한국어](./README.ko.md) · English

![FOOTHOLD asset preview](./assets/exports/v1/FOOTHOLD_ASSET_PACK_V1_PREVIEW.svg)

FOOTHOLD is the shared visual and verbal system for a terrain-adaptive quadruped locomotion project. This repository is the canonical source for brand tokens, approved logo geometry, messaging, the ratio-independent Visual Master Board, and reusable delivery assets.

> Find the next foothold.

## Current status

- `v1.0.2`: approved logo geometry with SVG sources and reproducible PNG derivatives, including the Compact spacing correction
- `v1.1.0`: public, cross-platform foundation and local Figma synchronization infrastructure
- `v1.2.0`: planned content-complete M01–M10 modules and OSMU templates

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
assets/          approved SVG geometry, reproducible PNG derivatives, and delivery exports
concepts/        review history; never use as production assets
content/         machine-readable evidence gates for project-specific claims
figma/           mappings, Master Board specification, local plugin
templates/       OSMU templates as they are approved
tokens/          canonical DTCG JSON and generated CSS
scripts/         deterministic cross-platform validation
docs/            governance, source-of-truth, and roadmap
```

## Quick checks

Node.js 20 or newer is recommended.

```bash
npm run generate
npm test
```

The committed generated files must remain byte-for-byte current after `npm run generate`.

## Ready-to-use asset packs

- [`FOOTHOLD_SVG_ASSET_PACK_V1.zip`](./assets/FOOTHOLD_SVG_ASSET_PACK_V1.zip): SVG-only vector package.
- [`FOOTHOLD_ASSET_PACK_V1.zip`](./assets/FOOTHOLD_ASSET_PACK_V1.zip): combined SVG + PNG package.
- [`assets/raster/v1/manifest.json`](./assets/raster/v1/manifest.json): source mapping, pixel dimensions, alpha policy, status, and hashes for every PNG derivative.

SVG remains canonical. PNG logo files keep a transparent RGBA canvas; application PNGs preserve the canvas defined by their source SVG. Legacy and provisional outputs remain explicitly labelled and must not be mistaken for approved OSMU templates.

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
