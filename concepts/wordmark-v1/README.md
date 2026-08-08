# FOOTHOLD Wordmark Direction Review v1

**Status:** Provisional visual review only
**Date:** 2026-08-07

This folder compares three wordmark directions before any logo geometry is approved.

- **A — Grounded Geometric:** recommended starting point; stable, wide, and industrial.
- **B — Technical Editorial:** restrained research identity; credible but less distinctive.
- **C — Terrain Motion:** forward movement and terrain response; expressive but at higher risk of feeling sporty.

The comparison intentionally uses the existing symbol so the review isolates the wordmark relationship. The type remains live text at this stage. After one direction is selected, the chosen letterforms must be redrawn or converted to controlled vector outlines before replacing the canonical logo SVG files.

## A.2 refinement

`FOOTHOLD_A2_REFINED_REVIEW.svg` applies the first review feedback without changing the existing symbol:

- keeps the grounded geometric A direction;
- adds a restrained 3-degree forward slant to the wordmark only;
- removes the unexplained short underline;
- aligns the full subtitle width to the full `FOOTHOLD` width;
- keeps the approved spelling `TERRAIN-ADAPTIVE LOCOMOTION POLICY`.

At compact sizes, the subtitle may need to be omitted rather than compressed. That compact-lockup rule will be defined only after the A.2 direction is approved.

### Symbol reference correction

The authoritative visual reference for the symbol review is:

`doyak-final/foothold_logo_symbol_transparent.png`

The earlier comparison mistakenly substituted `brand/assets/logo/foothold-symbol.svg`. That SVG does not preserve the reference image's central vertical structure, separated middle slopes, lower V contact form, or original proportions. It must not be used as the visual source for the next logo revision. `FOOTHOLD_A2_REFINED_REVIEW.svg` now embeds the exact reference PNG by relative link while the accurate vector reconstruction is pending approval.

## A.3 vector candidate

`FOOTHOLD_A3_VECTOR_LOCKUP_REVIEW.svg` replaces the raster reference in the review with clean vector geometry derived from the PNG silhouette.

- The top apex is a single flat path with no vertical highlight or join seam.
- The separated middle slopes and lower V contact shape are retained.
- The primary symbol spans the combined height of the `FOOTHOLD` and subtitle rows.
- The compact lockup omits the subtitle and scales the symbol to the `FOOTHOLD` cap height rather than retaining the two-row symbol size.
- The final compact optical correction oversizes the visible symbol by approximately 18 percent relative to the wordmark cap height and reduces the symbol-to-`F` gap. This compensates for the mark's narrow proportion and open negative space.
- Official candidate colours are Brand Teal `#0E7A6E`, Engineering Ink `#161C26`, and Secondary Ink `#4A5566`.
- The original navy gradient is not carried into the candidate system.

Candidate SVGs live in `vector/` and remain provisional until owner approval.

## Final visual review

The final review board adds two system-level corrections:

- the board embeds the same compact master SVG used for the standalone export, preventing ratio drift;
- `vector/foothold-contact-trail-secondary.svg` defines a four-contact secondary path using only the lower contact motif. The complete logo remains singular and is never duplicated to imply footsteps.

## Source-of-truth boundary

Nothing in this folder is a canonical logo asset. Do not use these concepts in the website, poster, presentation, paper, README, or goods yet.

The existing files in `brand/assets/logo/` remain untouched until a direction is approved.

## Review criteria

1. Does the wordmark balance the weight of the symbol?
2. Is `FOOTHOLD` legible in a compact website header?
3. Does it remain credible at poster scale and in one colour?
4. Can it extend to research, portfolio, apparel, stickers, and banners without becoming a different brand?
5. Does it communicate grounded technical confidence without drifting into generic sci-fi, military, or sports branding?
