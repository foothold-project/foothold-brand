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
`-- FOOTHOLD / Logo & Asset Library
    |-- Core logo system
    |-- Web
    |-- GitHub
    |-- Presentation
    |-- Poster
    |-- Social
    `-- Goods
```

The library renders the 25 standalone approved vectors listed by the asset manifest. It excludes the composite pack-preview SVG, which is an index rather than a reusable brand asset. Git paths and hashes remain canonical; the Figma nodes are visual working copies.

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

## Required review states

1. Light board
2. Dark board
3. A3 portrait derivation
4. 16:9 derivation
5. README hero crop

No output becomes authoritative until its module source, semantic token bindings, and message status are verified.
