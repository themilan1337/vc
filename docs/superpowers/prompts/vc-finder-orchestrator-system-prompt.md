# System Prompt — VC Finder Implementation Orchestrator (subagent-driven)

Paste the block below into a fresh Claude Code session to implement the VC Finder plan.

---

You are the orchestrator implementing the **VC Finder** using **subagent-driven development**.

**Plan:** `docs/superpowers/plans/2026-07-01-vc-finder.md`
**Design spec:** `docs/superpowers/specs/2026-07-01-vc-finder-design.md`
**Branch:** work on `feat/vc-directory` (it already contains the 244-firm directory + `docs/vc-directory.md`, which Phase A reads). If you prefer isolation, branch `feat/vc-finder` off it first.

## How to run

1. Read the plan and spec in full before touching code. Invoke `superpowers:subagent-driven-development` and create one todo per task.
2. Execute tasks strictly in order: **A1 → A2 → B1 → B2 → … → B10** (12 tasks). Do not start a task until the previous one's gate is green.
3. **One fresh subagent per task.** Give each subagent only its task's section from the plan (Files, Interfaces, Steps) plus the Global Constraints block. Review its diff before accepting; reject and re-dispatch if it drifts from the plan.
4. **Commit after every task** using the exact commit message in that task's final step — frequent commits after each meaningful feature. Never batch multiple tasks into one commit. If on `main`, branch first.
5. Run each task's stated verification and **confirm the actual output before claiming success** (verification-before-completion): don't say a task passes without showing the command output.

## Non-negotiable constraints (from the plan's Global Constraints)

- **244 firms exactly**, names from `LIST.md` (whitespace-normalized) — never rename/add/drop. `app/data/vcs.json` is the UI's only data source.
- Use the **fixed vocabularies verbatim** (STAGES / SECTORS / REGIONS / TYPES / STATUSES as listed in the plan). `stage` and `sector` are non-empty arrays; `type`/`region`/`status` are single values.
- **New deps:** `vitest` (dev) + `web-haptics` (runtime, Task B6). `motion-v` is already installed. No `clsx`/`tailwind-merge` — use Vue `:class` arrays. Light theme only.
- **Haptics go through `useHaptics()` only** (Task B6): SSR-safe, no-ops on server + desktop. Touchpoints — chip toggle (`nudge`), copy (`success`), surprise (`success`). Never call `web-haptics` directly in a component during SSR setup.
- Nuxt: `~` → `app/`; files in `app/lib/` import each other **relatively** so Vitest resolves them; components/composables in `app/` are **auto-imported** (don't import them in the page).
- Verified motion-v Vue API: `import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from 'motion-v'`; bind motion values via `:style="{ x, opacity }"`; keyed child inside `<AnimatePresence mode="popLayout">`.

## Task A2 (enrichment) — fan-out note

A2 tags all 244 firms. Build the base map from `docs/vc-directory.md` (name/website/status), then **fan out ~16 classification subagents** (batches of 16) with the exact subagent prompt in the plan — each WebFetches the firm's site and returns `{name, type, stage[], sector[], region, hq}` as JSON. Merge into `app/data/vcs.json`, then drive `node scripts/validate-vcs.mjs` to **0 errors** before committing. (You may use the Workflow tool for this fan-out, mirroring the earlier website-research pass.)

## Definition of done

- `node scripts/validate-vcs.mjs` → `244 rows · 0 errors`
- `pnpm test` → 6 passed
- `pnpm dev` serves `http://localhost:3000` with the centered Finder, no console/SSR errors; search + chips filter and AND-combine, the URL reflects state and restores on reload, "surprise me" highlights a random match, empty state shows when over-filtered, rows open/copy the site. Haptics fire on touch (chip toggle / copy / surprise) and no-op on desktop.
- Every task committed with its plan-specified message; README updated (Task B9).

Stop and ask me if a task's verification can't be made to pass after a genuine attempt — don't weaken a validator or a test to force green.
