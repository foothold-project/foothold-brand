# Master Board content evidence matrix

This document gates project-specific content before it enters the public FOOTHOLD Master Board. The machine-readable companion is [`content/master-board-evidence.json`](../content/master-board-evidence.json).

## Evidence order

1. Reproducible run logs and preserved outputs
2. Dated meeting records with traceable source material
3. Approved project plans
4. Draft plans, research notes, and proposals

When sources conflict, the more direct record wins. A proposal never upgrades itself into a fact because it appears in a polished layout.

## Current audit

| Module | State | What may appear now | What remains blocked |
|---|---|---|---|
| M03 Robot / terrain visual | Blocked: media missing | Captioned statement that the official Go2 checkpoint replay was recorded | The original run capture must be copied from AI-WS01 and provenance-checked |
| M04 Sim-to-Real flow | Partial | Verified checkpoint → replay → ONNX/PT export, followed by clearly labelled planned stages | Custom terrain, training, sim2sim, alignment, and physical deployment |
| M05 Why FOOTHOLD | Partial | Approved problem statement and policy scope | Concrete public use context and any demonstrated benefit |
| M06 Evidence | Partial, no performance metric | Environment versions, built-in task verification, checkpoint replay, exported formats | Training throughput, success rate, improvement, and physical results |
| M07 Team | Pending approval | Five-person team and overlapping ownership model | Final names-to-role matrix and public-display consent |
| M08 Roadmap | Partial proposal | Q0 and Q2 completed; Q3 next; later gates visibly planned or blocked | Committed dates and completion claims for future gates |
| M09 Contexts | Pending approval | Rough terrain and reduced human exposure as narrative themes | Partner, deployment, industry, and field-operation claims |

## Conflict found during the 2026-08-09 audit

`04_plan/PLAN.md` presents `21,385 steps/s` and `1,500 iter ≈ 113 minutes` as current evidence. The primary run record `01_research/mvp-install-log.md` states that training was not run and training steps per second was not measured. M06 must exclude both numbers until a reproducible training log verifies them.

## Promotion checklist

A pending item can become public Master Board content only when all are true:

1. The source file and capture date are recorded.
2. Raw output or a first-party media file is preserved when applicable.
3. The claim says whether it is verified, planned, blocked, or hypothetical.
4. Private commercial terms and unnamed third parties are excluded.
5. A human approves the public wording.

Figma remains a composition workspace. Changing a pending label in Figma does not change evidence status in Git.
