# FOOTHOLD Brand Bible v1

**Status:** Foundation established 2026-08-07
**Owner boundary:** Codex owns this `brand/` layer. Claude Code owns web implementation and `05_deliverables/_build/DESIGN.md`.

## 1. Brand purpose

FOOTHOLD is the identity for a five-person Physical AI project that develops a reinforcement-learning policy for a Unitree Go2 quadruped to traverse previously unexperienced rough terrain without falling.

**Canonical one-line definition**

> 사람이 먼저 밟아볼 수 없는 땅을, 로봇이 넘어지지 않고 건너가게 만듭니다.

This is a project identity, not a claim that FOOTHOLD is already a deployed navigation platform or a completed field-operations product.

## 2. Positioning

FOOTHOLD makes the gap between controlled simulation and uneven physical terrain legible. The brand should feel like a verified field notebook: deliberate, clear, and technically grounded.

| We are | We are not |
|---|---|
| Rough-terrain adaptive locomotion policy research and validation | A generic AI navigation platform |
| A Physical AI project with a legible Sim-to-Real story | A neon-SF robot brand |
| Evidence-led technical communication | A claim-heavy product launch |
| A reusable identity across web, research, presentation, and print | A one-off poster style |

## 3. Brand attitude

- **Find the next foothold.** Show progress as an accountable next step, not a grand promise.
- **Make uncertainty visible.** Verified, unverified, caution, and failure are different states.
- **Let information lead.** Hierarchy, evidence, and whitespace come before decoration.
- **Design for real surfaces.** The identity must remain legible on screens, paper, diagrams, and single-colour applications.

## 4. Visual foundation

### Colour is semantic

The canonical values and light/dark variants live only in [`tokens/foothold.tokens.json`](./tokens/foothold.tokens.json).

| Role | Meaning | Typical use |
|---|---|---|
| Brand teal | FOOTHOLD as an identity | Logo, hero accent, key navigation |
| Adopted teal | Verified or selected state | Evidence, confirmed path, check state |
| Amber | Caution or unverified state | Limits, open questions, review markers |
| Red | Failure, prohibition, or absence | Fall risk, rejected claim, explicit limitation |
| Ink and warm paper | Technical editorial reading environment | Primary reading surface and hierarchy |

`--brand` is the brand source. `--dim` is the required web compatibility alias for the adopted state and must remain `var(--brand)` until the web migration is complete.

### Layout and image language

- Use the established 32px grid as an organisational device, not a decorative pattern.
- Prefer warm paper surfaces, engineering ink, clear rules, and measured whitespace.
- Use simplified terrain geometry, contact points, arrows, and labelled diagrams to explain the project.
- Treat a robot render as evidence or an explanatory element; never use it as unlabelled spectacle.
- Use teal, amber, and red sparingly and only when their meaning is needed.

### Typography

- Screen body copy follows the current web stack: `Pretendard`, `Malgun Gothic`, `Segoe UI`, then system fallbacks.
- Use a clean technical sans-serif for headings and the outlined grounded-geometric wordmark for the logo. The wordmark uses a restrained forward slant and must not fall back to live system text.
- Do not use handwritten or script type in the primary lockup. It conflicts with the grid-led technical editorial system.
- Do not create a separate display font decision until it is tested in Korean, English, web, PDF, and print contexts.

## 5. Logo system

The current logo system lives in [`assets/logo/v1`](./assets/logo/v1/); its derivative index is [`assets/ASSET_INDEX.md`](./assets/ASSET_INDEX.md).

- `foothold-symbol-brand.svg`: the reconstructed four-part contact symbol with no apex seam.
- `foothold-wordmark-ink.svg`: the outlined grounded-geometric `FOOTHOLD` wordmark.
- `foothold-lockup-primary-*.svg`: the symbol spans the wordmark and subtitle rows.
- `foothold-lockup-compact-*.svg`: the subtitle is omitted and the symbol is optically sized to the wordmark row.
- `foothold-lockup-stacked-*.svg`: centred use for square formats and goods.
- `foothold-contact-trail.svg`: secondary locomotion language built from the lower contact motif; it is not a logo.

Approved v1 SVGs are font-independent and raster-independent. Their canonical geometry is the frozen path data in `assets/logo/v1/*.svg`; do not regenerate the wordmark or subtitle from a system font and do not manually fork the geometry in derived outputs. The compatibility script `assets/logo/v1/build_logo_assets.py` now verifies hashes only.
The approved A.3 wordmark silhouette is a fixed logo property: its visible width-to-height ratio is `7.841215388`. Do not replace it with the typeface's natural width or alter that proportion in any derivative.

Use brand teal by default; use paper/white only on a verified dark ink background. Keep the logo unmodified: no gradients, shadows, outlines, rotated symbol, or old handwritten subtitle.

The current PNG subtitle, “AI-Powered Safe Navigation & Physical AI Platform,” is retired from new work because it describes a navigation platform rather than an adaptive locomotion-policy project. The approved replacement is **Terrain-Adaptive Locomotion Policy**; see [`VOICE_AND_MESSAGE.md`](./VOICE_AND_MESSAGE.md).

## 6. Evidence and accessibility are brand rules

- On `*-soft` surfaces, use the dedicated accessible text tokens rather than `--dim` or `--note`.
- Do not lower the measured web contrast floor of **4.82:1**.
- When a numerical or externally verifiable statement is used, attach a source and use the project’s established source-grade rule.
- Mark unverified claims as unverified. Do not turn a target, intention, or inference into a completed result.

## 7. Explicit prohibitions

- Do not delete `--dim`, rename an existing web custom property, or add a conflicting token name.
- Do not edit `05_deliverables/*.html`; the true web sources are `05_deliverables/_src/*.base.html` and remain in Claude Code’s scope.
- Do not use generic phrases such as “AI-powered safe navigation platform.”
- Do not make a colour more prominent simply because it looks energetic.
- Do not use glow-heavy neon, visual noise, or an unrelated sci-fi aesthetic.

## 8. Derivative hierarchy

```text
Canonical tokens + SVG assets + approved message
                ↓
Figma Visual Master Board
                ↓
Website · Poster · PPT · README · paper figure · portfolio · roll-up · goods
```

Figma controls visual composition. The token JSON controls values. SVG controls logo geometry. No derived output becomes a new source of truth.
