# Source-of-truth and round-trip contract

## Authority order

1. Human-approved decision recorded in Git
2. Canonical token JSON, SVG geometry, and message files
3. Figma Master Board composition
4. Derived SVG, PNG, PDF, presentation, web, and social outputs
5. Concepts and experiments

## Conflict rules

- Git wins for values, logo geometry, approved wording, evidence status, and versions.
- Figma may propose layout, spacing, composition, and hierarchy changes.
- A Figma edit is not authoritative until its handoff package is reviewed and promoted.
- No tool may overwrite Git from Figma automatically.
- No tool may delete a Figma node using a fuzzy name match. Exact plugin-owned IDs or deterministic plugin keys are required.

## Handoff package

The plugin exports:

- `foothold-handoff.json`: structured nodes, tokens, text, status, and source revision;
- `foothold-master-board.svg`: vector visual truth;
- `foothold-master-board.png`: review preview.

Codex compares the JSON to canonical files, visually checks the SVG/PNG, and presents the proposed changes for human approval. Only approved changes are implemented at their canonical source and regenerated.
