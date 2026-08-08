# FOOTHOLD Visual Master Board Specification

## Purpose

The Visual Master Board is a ratio-independent source for FOOTHOLD’s visual modules. It is not an A3 poster and not a web page. It supplies recomposable, token-bound modules to A3, 16:9, README, social, and presentation outputs.

## Source hierarchy

1. `tokens/foothold.tokens.json` — values
2. `assets/logo/*.svg` — logo geometry
3. `VOICE_AND_MESSAGE.md` — approved wording
4. Figma Master Board — layout and assembly
5. Derived exports — never edit as sources

## Board modules

| ID | Module | Required content | Evidence status |
|---|---|---|---|
| M01 | Brand core | Symbol, wordmark, canonical definition | Ready |
| M02 | Hero statement | Why → What hierarchy | Ready |
| M03 | Robot / terrain visual | Quadruped, rough terrain, contact points | Illustration direction only; source visual pending |
| M04 | Sim-to-Real flow | Simulation → policy → validation | Use only verified labels and capabilities |
| M05 | Why FOOTHOLD | Problem framing and use context | Do not claim deployed operations |
| M06 | Evidence | Metrics, test conditions, source links | Populate only from verified project records |
| M07 | Team | Five names, primary/secondary roles | Pending verified team-role source |
| M08 | Roadmap | Completed, current, next | Label each state clearly |
| M09 | Application contexts | Terrain and human-risk context | Do not imply formal deployment partners |
| M10 | Closing | Brand sentence / call to action | Use only an approved message |

## Composition rules

- Build M01–M10 as independent auto-layout modules; no module may rely on a fixed poster crop.
- Use the technical grid to align elements, but keep a clear reading path: Why → What → How → Evidence.
- The brand teal identifies FOOTHOLD and adopted states. Amber and red appear only with their semantic labels.
- Every dark panel must use the corresponding dark-mode text token.
- Every evidence block includes a status: verified, unverified, or pending source.

## Derivations

| Output | Composition |
|---|---|
| A3 portrait poster | M01 + M02 + M03 + M04 + concise M06 + M07 + M10 |
| 16:9 opening slide | M01 + M02 + M03 + one M04 cue |
| README hero | M01 + one-line definition + compact M04 |
| Portfolio case study | M02 + M04 + expanded M06 + M08 |
| Social square | M01 + one focused statement or metric |

## Non-negotiable QA

- No manual colour outside the canonical token system.
- No subtitle until it is selected in `VOICE_AND_MESSAGE.md`.
- No metrics, application claims, team roles, or roadmap milestones without source confirmation.
- Inspect light and dark variants before export.
