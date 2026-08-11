# Figma Master Board Structure

## Starter-compatible file pages

```text
Cover & Guide
Foundations
Master Board
```

Starter files are limited to three pages. Detailed component and utility guidance stays in the repository rather than becoming extra Figma pages. Restore the full page hierarchy after upgrading to Professional.

## `Foundations` frame hierarchy

```text
FOOTHOLD / Foundations
|-- Canonical colour primitives
`-- FOOTHOLD / Identity & Asset Status
    |-- Symbols (approved)
    |-- Wordmarks (approved)
    |-- Lockups (approved)
    |-- Retired and superseded notices
    `-- Draft applications / review required
```

The library renders only the 13 approved core vectors from the v1.0.2 manifest. The retired `foothold-contact-trail.svg`, composite pack preview, and 11 legacy application proofs stay in Git but are excluded from the approved Figma library. Draft applications are shown separately and carry a visible `PROVISIONAL` status. Git paths and hashes remain canonical; the Figma nodes are visual working copies.

## `Master Board` frame hierarchy

```text
FOOTHOLD / Visual Master Board
├─ M01 Brand Core
├─ M02 Hero Statement
├─ M03 Robot and Terrain Visual
├─ M04 Sim-to-Real Flow
├─ M05 Why FOOTHOLD
├─ M06 Evidence
├─ M07 Team
├─ M08 Roadmap
├─ M09 Contexts
└─ M10 Closing
```

Each module is an auto-layout frame with a description that identifies its approved source and intended derivations. Components come only after token foundations and the module inventory are validated.

### Ready-module composition

- `M01 Brand Core` presents the canonical Primary, Compact, and Stacked SVG lockups, the approved definition, the frozen wordmark aspect, and the approved subtitle. It never reconstructs the wordmark from a font.
- `M02 Hero Statement` presents the approved English and Korean slogans with the precise project scope. It does not add an unqualified `How` claim before its project evidence is verified.
- `M10 Closing` uses the canonical reverse Compact lockup and the approved sentence `Find the next foothold.` on the dark semantic surface.
- `M03` through `M09` remain visibly pending until their named repository sources contain verified content.

## Required review states

1. Light board
2. Dark board
3. A3 portrait derivation
4. 16:9 derivation
5. README hero crop

No output becomes authoritative until its module source, semantic token bindings, and message status are verified.

## `OSMU Review` frame

The `Master Board` page also contains a separate `FOOTHOLD / OSMU Review` frame because Starter permits only three pages. It compares six provisional applications without treating them as approved exports:

| Medium | Communication job |
|---|---|
| Web header | Compact identity and navigation |
| GitHub README hero | Project definition and technical orientation |
| Presentation opener | One memorable spoken-story opening |
| Poster header | Evidence-led editorial hierarchy |
| Social square | Recognition at small size |
| Round sticker | Print-safe, symbol-only production |

These previews intentionally differ in information density, hierarchy, and composition. They reuse the same canonical logo geometry, but they are not one generic logo panel resized six times.

**Review note — 2026-08-09:** the Poster Header is currently the strongest OSMU direction in human review. Treat its editorial hierarchy as the leading reference for the next refinement, but keep it provisional until the remaining media are reviewed alongside it.
