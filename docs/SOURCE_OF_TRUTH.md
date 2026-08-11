# Source-of-truth and round-trip contract

## Authority order

1. Human-approved decision recorded in Git
2. Canonical token JSON, SVG geometry, and message files
3. Machine-readable project evidence status
4. Figma Master Board composition
5. Derived SVG, PNG, PDF, presentation, web, and social outputs
6. Concepts and experiments

## Conflict rules

- Git wins for values, logo geometry, approved wording, evidence status, and versions.
- SVG paths remain canonical. PNG files are deterministic derivatives governed by `assets/raster/v1/manifest.json`; a PNG edit can never change the logo source.
- `content/master-board-evidence.json` gates project-specific claims in M03 through M09.
- Figma may propose layout, spacing, composition, and hierarchy changes.
- A Figma edit is not authoritative until its handoff package is reviewed and promoted.
- No tool may overwrite Git from Figma automatically.
- No tool may delete a Figma node using a fuzzy name match. Exact plugin-owned IDs or deterministic plugin keys are required.

## Handoff package

The plugin exports:

- `foothold-handoff.json`: structured nodes, tokens, text, status, and source revision;
- `foothold-master-board.svg`: vector visual truth;
- `foothold-master-board.png`: Master Board review preview;
- `foothold-osmu-review.svg`: vector review of medium-specific compositions;
- `foothold-osmu-review.png`: OSMU review preview.

Codex compares the JSON to canonical files, visually checks the SVG/PNG, and presents the proposed changes for human approval. Only approved changes are implemented at their canonical source and regenerated.
