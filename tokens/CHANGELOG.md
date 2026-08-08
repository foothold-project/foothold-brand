# Token changelog

## 1.0.0 — 2026-08-07

- Established `foothold.tokens.json` as the only canonical token source.
- Preserved the web v0.1 light/dark values without alteration.
- Kept `--brand` as the brand token and `--dim: var(--brand)` as the required compatibility alias.
- Added contextual `--dim-ink` and `--note-ink` mappings for accessible text on soft surfaces; these are already specified by the web accessibility rules.
- Generated `foothold.tokens.css`; it is not yet wired into the web build. Claude Code owns that migration.

## 1.0.1 — 2026-08-07

- Confirmed the canonical Figma grid alpha as `.04`; existing `.045` page-specific web values remain untouched until Claude Code’s build migration.
- Recorded the Starter-compatible Figma implementation: separate local Light/Dark collections in place of unavailable variable modes.
