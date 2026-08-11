# FOOTHOLD PNG derivatives

SVG remains the canonical source for every approved FOOTHOLD logo and lockup. The PNG files in this directory are reproducible convenience exports for software and channels that do not accept SVG.

## Output policy

- `v1/logo/`: transparent RGBA canvases. Reverse variants may look blank on a light image viewer because their white artwork is intended for dark surfaces.
- `v1/web/`, `v1/github/`, `v1/presentation/`, `v1/poster/`, `v1/social/`, and `v1/goods/`: legacy v1 application proofs. They preserve the source SVG canvas but are not current OSMU templates.
- `drafts/v1.2/`: provisional review outputs. Do not present them as approved production assets.
- PNGs must never be edited as a new source or used to recreate SVG paths.

The exact source path, pixel dimensions, status (`approved`, `retired`, `legacy`, or `provisional`), alpha policy, and SHA-256 hash are recorded in `v1/manifest.json`.

Regenerate and verify on Windows, macOS, or Linux with:

```bash
npm run generate
npm test
```
