# FOOTHOLD raster derivatives

SVG remains the canonical source for every approved FOOTHOLD logo and lockup. PNG and JPG files are reproducible convenience exports for software and channels that do not accept SVG.

## Output policy

- `v1/logo/`: transparent RGBA canvases. Reverse variants may look blank on a light image viewer because their white artwork is intended for dark surfaces.
- `v1/web/`, `v1/github/`, `v1/presentation/`, `v1/poster/`, `v1/social/`, and `v1/goods/`: legacy v1 application proofs. They preserve the source SVG canvas but are not current OSMU templates.
- `drafts/v1.2/`: provisional review outputs. Do not present them as approved production assets.
- PNGs must never be edited as a new source or used to recreate SVG paths.

## Background-filled JPG companions

`v1/jpeg/` preserves each source canvas and raster profile exactly; the generator adds no padding. It flattens transparency onto brand paper `#F6F5F1` for light assets or engineering dark `#12161D` for dark/reverse assets. Browser favicon is excluded because JPG cannot preserve the transparency and small-icon behavior it requires.

Lifecycle is physical, not merely descriptive:

- `v1/jpeg/logo/`: 12 approved core logo companions.
- `v1/jpeg/retired/contact-trail/`: the retired contact-trail experiment.
- `v1/jpeg/legacy/`: 11 superseded v1 application proofs, separated by medium.
- `v1/jpeg/provisional/goods/sticker/`: the current sticker review asset; not approved production artwork.

Exact source mapping, dimensions, background, lifecycle, source hash, and JPG hash live in `v1/jpeg/manifest.json`.

## Approved OSMU v1.2 raster outputs

`v1.2/osmu/` contains the current approved six-medium PNG and JPG derivatives generated from `assets/osmu/v1.2`. These are the current Web, GitHub, presentation, poster, social, and sticker designs. Same-named files under `v1/` remain legacy proofs.

The exact source path, pixel dimensions, status (`approved`, `retired`, `legacy`, or `provisional`), alpha policy, and SHA-256 hash are recorded in `v1/manifest.json`.

Regenerate and verify on Windows, macOS, or Linux with:

```bash
npm run generate
npm test
```
