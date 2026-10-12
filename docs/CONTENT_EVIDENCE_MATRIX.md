# Master Board content evidence matrix

This document gates project-specific content before it enters the public FOOTHOLD Master Board. The machine-readable companion is [`content/master-board-evidence.json`](../content/master-board-evidence.json).

## Evidence order

1. Reproducible run logs and preserved outputs
2. Dated meeting records with traceable source material
3. Approved project plans
4. Draft plans, research notes, and proposals

When sources conflict, the more direct record wins. A proposal never upgrades itself into a fact because it appears in a polished layout.

## Current audit (2026-10-12)

Sources are paths in the private project repository `foothold-project/foothold-lab` at commit `fe2cfe9d`. Every number on the board was recomputed from the per-episode raw files before it was admitted.

| Module | State | What may appear now | What remains blocked |
|---|---|---|---|
| M03 Robot / terrain visual | Pending: frame not chosen | Art direction that names the policy, terrain, and run of any frame | A chosen frame with provenance and licence status recorded in this repository |
| M04 Sim-to-Real flow | Partial | NVIDIA checkpoint baseline, foothold-v1 and v2 training, unseen-terrain evaluation, and the MVP report as verified; SIM gate next; stock-gait Go2 with SLAM and Nav2 as target | Any claim that the FOOTHOLD RL policy runs on the physical Go2 (decision 2026-10-12) |
| M05 Why FOOTHOLD | Target vision approved (not re-audited) | `시뮬레이터에서 천 번 넘어지고, 현장에서는 넘어지지 않는다.` with an explicit `TARGET VISION` label; approved problem statement and policy scope | Any zero-fall result, concrete public use context, or demonstrated field benefit |
| M06 Evidence | Partial: simulation metric verified | 43.88 % to 88.46 % on eight unseen terrains (2,400 episodes per policy), with conditions; stepping_stones as 0 to 24 % | Physical-robot results, a v2-over-v1 claim, or any number quoted without its conditions |
| M07 Team | Pending approval | Five people and eight work areas without names | Names and assignments until a dated five-person approval and public-display consent exist |
| M08 Roadmap | Partial, dated | Gates confirmed 2026-10-12: SIM 11-07, NAV 11-30, FINAL 12-07; presentation 12-09 or 12-10 pending | Completion claims for future gates; the twin demo as an MVP deliverable |
| M09 Contexts | Target candidates | Utility conduits, tunnels, and industrial equipment inspection as proposal candidates | Partner, deployment, disaster-response, and explosion-proof claims |

The 2026-08-11 audit of the same modules remains in Git history.

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
