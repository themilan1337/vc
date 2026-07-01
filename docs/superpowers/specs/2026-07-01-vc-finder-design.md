# VC Finder — Design Spec

**Date:** 2026-07-01
**Status:** Approved

## Purpose

A single-page, centered "VC Finder": search and filter the 244-firm venture directory, built entirely in the visual language of three Skiper UI references (`references/skiper62|87|106.tsx`), ported from React/framer-motion → **Vue 3 + motion-v**. Scope is deliberately small: one centered column, no nav/footer/marketing.

## Decisions (from brainstorming)

- **Filter data:** enrich first — tag all 244 VCs with structured facets, then filter on them.
- **Facets:** Stage, Sector, Region, Type (+ Status, already known).
- **Theme:** light only (single token set, no toggle).
- **Extras:** open + copy per row · live count + empty state · "surprise me" random pick · shareable filter URL.

## Architecture — two phases

### Phase A — Data enrichment → `app/data/vcs.json`
We already have `name / website / status` for all 244 (from the directory research). This pass *adds* four tags per firm via a subagent fan-out that reads each site. Output is the single source the UI reads. A `scripts/validate-vcs.mjs` gate enforces coverage (244, names match `LIST.md`) and legal enum values.

**Schema** (array of):
```jsonc
{
  "name": "a16z",
  "website": "https://a16z.com/",
  "status": "verified",                       // verified | ambiguous | none
  "type": "Fund",                             // Fund | Accelerator | Corporate | Angel | Community
  "stage": ["Seed", "Series A", "Growth"],    // Pre-seed | Seed | Series A | Series B+ | Growth  (>=1)
  "sector": ["AI/ML", "Fintech", "Crypto/Web3"], // fixed vocab (>=1)
  "region": "US",                             // US | Europe | India | MENA | LatAm | Asia | Global
  "hq": "Menlo Park, US"                        // display-only string
}
```

**Vocabularies (fixed):**
- STAGES = Pre-seed · Seed · Series A · Series B+ · Growth
- SECTORS = AI/ML · Fintech · Crypto/Web3 · Climate · Health/Bio · Consumer · Enterprise/SaaS · Deep Tech · Dev Tools · Gaming · Hardware · Generalist
- REGIONS = US · Europe · India · MENA · LatAm · Asia · Global
- TYPES = Fund · Accelerator · Corporate · Angel · Community
- STATUSES = verified · ambiguous · none

### Phase B — Finder UI (all client-side; 244 rows is trivial)

**Ported components** (`app/components/`, Vue + motion-v):
1. `SmoothInput.vue` ← skiper106 — spring-animated caret input → **search box**.
2. `FadeScrollArea.vue` ← skiper87 — fade-edge scroll (CSS `mask-image`, no reka/Radix dep) → **results list**.
3. `LoopText.vue` + `useLoop` ← skiper62 — cycling headline via `AnimatePresence` → **hero line**.
4. `GradientLabel.vue` — the shared "tiny uppercase label + vertical gradient line" motif, extracted once.
5. `VcRow.vue` — result row: name · type/hq meta · status dot · open-in-new-tab + copy.
6. `FilterChips.vue` — reusable facet of toggle pills (multi-select within a facet).

**Tokens:** `app/assets/css/main.css` gains a Tailwind v4 `@theme` block (light palette) so the Skiper `bg-muted`/`bg-muted2`/`outline-muted3`/`text-foreground`/`bg-primary` classes resolve. **No `cn()` dep** — Vue `:class` arrays replace clsx/tailwind-merge.

**Page** (`app/pages/index.vue`, one centered column): `GradientLabel` + cycling `LoopText` → `SmoothInput` → five `FilterChips` rows (Status · Type · Stage · Sector · Region) → live "N / 244" + "surprise me" + "reset" → `FadeScrollArea` of `VcRow`s → on-brand empty state. Search + filters mirror into the URL query (`?q=&stage=&sector=…`) so any view is linkable.

**Tested core:** `app/lib/filterVcs.ts` — a pure `filterVcs(vcs, criteria)` function, unit-tested with **Vitest** (the only new dev-dep; plain TS, no Nuxt runtime). `app/composables/useVcFilters.ts` holds criteria + URL sync + the filtered `computed` + `surprise()`; verified via the page.

## New dependencies
- `motion-v` — already installed ✅
- `vitest` — new dev-dep (for `filterVcs` tests)
- Nothing else.

## Out of scope (YAGNI)
Dark mode / toggle, favorites, keyboard nav, pagination, backend/API, SSR data fetching (JSON is a static import), auth, the DialKit control panel from skiper106.
