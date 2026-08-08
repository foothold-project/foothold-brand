# Figma Variables Mapping

## Source and status

The token JSON is canonical: [`../tokens/foothold.tokens.json`](../tokens/foothold.tokens.json). This document is a mapping plan for the Figma file; it does not duplicate token values.

## Collections — Starter-compatible implementation

| Figma collection | Mode | Source group | Notes |
|---|---|---|---|
| `FOOTHOLD / Light Primitives` | Value | `primitive.color` / light | Raw light values; hidden from component pickers. |
| `FOOTHOLD / Dark Primitives` | Value | `primitive.color` / dark | Raw dark values; hidden from component pickers. |
| `FOOTHOLD / Light Semantic` | Value | `semantic.color` / light | Alias semantic variables to light primitives. |
| `FOOTHOLD / Dark Semantic` | Value | `semantic.color` / dark | Alias semantic variables to dark primitives. |
| `FOOTHOLD / Layout` | Value | `primitive.layout`, `semantic.layout` | Exactly two exposed variables, `measure` and `nav`; values resolve from primitives and carry semantic web code syntax. This is the Starter-compatible exception to the normal Figma alias pattern. |

Primitive variables use the canonical `color/<token>` path inside both primitive collections (for example, `color/paper` and `color/teal-brand`). Semantic variables use `color/<role>/<name>`, and layout variables use `layout/<name>`. The local sync plugin must match these complete paths; omitting the `color/` prefix creates duplicate variables.

Starter limits a collection to one variable mode. The duplicated Light/Dark local collections preserve the canonical values, but do not enable one-click mode switching. If the plan returns to Professional, migrate them to one primitive and one semantic collection with Light/Dark modes.

## Web code syntax

| Semantic Figma variable | Web code syntax |
|---|---|
| `color/surface/canvas` | `var(--paper)` |
| `color/surface/card` | `var(--card)` |
| `color/content/primary` | `var(--ink)` |
| `color/brand/primary` | `var(--brand)` |
| `color/state/adopted` | `var(--dim)` |
| `color/state/caution` | `var(--note)` |
| `color/state/danger` | `var(--stop)` |
| `layout/measure` | `var(--measure)` |
| `layout/nav` | `var(--nav)` |

## Canonical local text styles

- `FOOTHOLD / Display / Hero`
- `FOOTHOLD / Heading / Section`
- `FOOTHOLD / Body / Korean`
- `FOOTHOLD / Label / Technical`
- `FOOTHOLD / Subtitle / English`

The sync plugin preserves existing user-owned canonical styles. It only creates a missing style or updates a style that it previously created and marked with its ownership key.

## Required scopes

- Surfaces: `FRAME_FILL`, `SHAPE_FILL`
- Content: `TEXT_FILL`
- Borders: `STROKE_COLOR`
- Layout dimensions: scopes appropriate to spacing/size only; do not expose a document measure as a generic colour control.

## Alias rule

`color/state/adopted` aliases `color/brand/primary` while the web compatibility alias `--dim` exists. Figma must not introduce a duplicate teal value for it.

## Accessibility rule

Soft surfaces use the dedicated semantic content variables (`adopted-on-soft`, `caution-on-soft`). Never bind ordinary adopted/caution teal or amber text directly on a soft background.
