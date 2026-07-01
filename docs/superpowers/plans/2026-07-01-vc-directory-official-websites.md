# VC Directory — Official Websites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the flat `LIST.md` of 244 venture firms into one clean, verified Markdown directory (`docs/vc-directory.md`) where every firm has its official website, filled in by a fan-out of web-search subagents.

**Architecture:** Test-first data build. A tiny Node validator (`scripts/validate-vc-directory.mjs`) is the single source of truth for "done" — it checks coverage (all 244 firms, no extras, no dupes) and URL quality (real https homepages, no aggregators). We scaffold the directory with every firm and a `⏳ pending` marker (validator red), then a fan-out of ~16 research subagents each resolve a contiguous batch of firms; the orchestrator writes their rows into the table. The build is done when the validator is green.

**Tech Stack:** Node ≥ 18 (built-in `node:fs`, `URL`, `fetch` — **no new npm deps**), Markdown, WebSearch + WebFetch tools, superpowers:subagent-driven-development for the fan-out.

## Global Constraints

- **244 firms, exactly.** Names come from `LIST.md`, whitespace-normalized (`\s+` → single space, trimmed). Never rename, merge, drop, or add a firm.
- **Official primary websites only.** Reject aggregator/social domains: `crunchbase.com`, `linkedin.com`, `pitchbook.com`, `twitter.com`, `x.com`, `facebook.com`, `instagram.com`, `angel.co`, `wellfound.com`, `tracxn.com`, `dealroom.co`, `signal.nfx.com`, `medium.com`, `wikipedia.org`.
- **URLs are canonical `https://` homepages** — no tracking params, no deep path unless the fund lives on a parent's subpage (corporate ventures arms).
- **Final status set:** `✅` verified · `⚠️` best-guess/ambiguous · `❌` none found (defunct / no web presence). `⏳` is a scaffold-only placeholder and must not survive to the finished file.
- **No new dependencies.** Use Node built-ins only. **English only** throughout the deliverable.
- **Never invent a URL.** Unsure → `⚠️` with best candidate, or `❌` with website `—`.

## File Structure

| Path | Responsibility | Created in |
|------|----------------|------------|
| `scripts/validate-vc-directory.mjs` | The "test": coverage + URL-quality gate. Exit 1 on any hard error. | Task 1 |
| `docs/vc-directory.md` | The deliverable: pretty Markdown table, one row per firm, kept in `LIST.md` order. | Task 2 |
| `LIST.md` | Raw source of firm names (kept as-is except trailing-whitespace cleanup). Coverage source of truth. | Task 2 (cleanup) |
| `README.md` | Gets a one-line pointer to the new directory. | Task 5 |

Canonical data lives in the single Markdown table (what the user asked for — "красивый markdown"). A structured JSON export for the Nuxt frontend is **deliberately deferred** (YAGNI until the frontend consumes it).

---

### Task 1: Validation script (the test)

**Files:**
- Create: `scripts/validate-vc-directory.mjs`

**Interfaces:**
- Consumes: `LIST.md` (names), `docs/vc-directory.md` (table rows — may not exist yet).
- Produces: CLI validator run as `node scripts/validate-vc-directory.mjs`; exit `0` = green, `1` = errors. Parses table rows matching `^| <n> | <firm> | <site> | <status> |`.

- [ ] **Step 1: Write the validator**

```js
// scripts/validate-vc-directory.mjs
// Gate for docs/vc-directory.md: coverage vs LIST.md + URL quality.
// Run: node scripts/validate-vc-directory.mjs   (exit 1 on any hard error)
import { readFileSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname
const SOURCE = ROOT + 'LIST.md'
const DIR = ROOT + 'docs/vc-directory.md'

const BANNED = [
  'crunchbase.com', 'linkedin.com', 'pitchbook.com', 'twitter.com', 'x.com',
  'facebook.com', 'instagram.com', 'angel.co', 'wellfound.com', 'tracxn.com',
  'dealroom.co', 'signal.nfx.com', 'medium.com', 'wikipedia.org',
]
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const cleanStatus = (s) => s.replace(/️/g, '').trim() // strip emoji variation selector
const VALID_STATUS = new Set(['✅', '⚠', '❌'])            // ⚠️ -> ⚠ after strip

const sourceNames = readFileSync(SOURCE, 'utf8').split('\n').map(norm).filter(Boolean)

let dirText
try { dirText = readFileSync(DIR, 'utf8') }
catch { console.log('❌ docs/vc-directory.md does not exist yet'); process.exit(1) }

const rows = dirText.split('\n')
  .filter((l) => /^\|\s*\d+\s*\|/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim())) // [#, Firm, Site, Status]

const errors = []
const warnings = []

// 1) coverage
const tableNames = rows.map((r) => norm(r[1]))
const srcSet = new Set(sourceNames)
const tblSet = new Set(tableNames)
for (const n of sourceNames) if (!tblSet.has(n)) errors.push(`Missing firm: "${n}"`)
for (const n of tableNames) if (!srcSet.has(n)) errors.push(`Unknown firm (not in LIST.md): "${n}"`)
if (tableNames.length !== new Set(tableNames).size) errors.push('Duplicate firm rows present')
if (rows.length !== sourceNames.length) errors.push(`Row count ${rows.length} != source ${sourceNames.length}`)

// 2) per-row url + status
const urlRe = /^https:\/\/[^\s)]+$/
const seenUrls = new Map()
for (const [, firm, site, status] of rows) {
  const st = cleanStatus(status)
  if (!VALID_STATUS.has(st)) { errors.push(`${firm}: bad/pending status "${status}"`); continue }
  if (st === '❌') { if (site !== '—') warnings.push(`${firm}: ❌ but site is "${site}"`); continue }
  if (!urlRe.test(site)) { errors.push(`${firm}: invalid website "${site}"`); continue }
  const host = new URL(site).host.replace(/^www\./, '')
  if (BANNED.some((b) => host === b || host.endsWith('.' + b)))
    errors.push(`${firm}: aggregator/social URL not allowed (${host})`)
  const prev = seenUrls.get(site)
  if (prev) warnings.push(`Duplicate URL ${site}: "${firm}" & "${prev}"`)
  else seenUrls.set(site, firm)
}

for (const w of warnings) console.log('⚠️ ', w)
for (const e of errors) console.log('❌', e)
console.log(`\n${rows.length} rows · ${errors.length} errors · ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
```

- [ ] **Step 2: Run it to verify it fails (no directory file yet)**

Run: `node scripts/validate-vc-directory.mjs`
Expected: prints `❌ docs/vc-directory.md does not exist yet`, exit code `1`.

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-vc-directory.mjs
git commit -m "test: add vc-directory coverage + url validator"
```

---

### Task 2: Scaffold the directory (red state)

**Files:**
- Create: `docs/vc-directory.md`
- Modify: `LIST.md` (strip trailing whitespace on 6 lines)

**Interfaces:**
- Consumes: `LIST.md` (244 names).
- Produces: `docs/vc-directory.md` with header + a table of all 244 rows, each `| n | Firm | — | ⏳ |`, in `LIST.md` order. This locks the layout every later task edits.

- [ ] **Step 1: Clean trailing whitespace in `LIST.md`**

Run: `perl -i -pe 's/[ \t]+$//' LIST.md`
Then confirm none remain: `grep -nE ' +$' LIST.md` → Expected: no output.

- [ ] **Step 2: Generate the scaffold**

Save this to a scratch file (e.g. `/private/tmp/claude-501/-Users-milan-Documents-GitHub-vc/6ad604a1-b00a-490f-912d-9983ddc814dd/scratchpad/gen.mjs`) and run it with `node`, then delete it:

```js
import { readFileSync, writeFileSync } from 'node:fs'
const names = readFileSync('LIST.md', 'utf8')
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
const rows = names.map((n, i) => `| ${i + 1} | ${n} | — | ⏳ |`).join('\n')
const doc = `# Venture Capital Firms — Official Website Directory

> Directory of ${names.length} venture capital firms, accelerators, and funds with their verified official websites.

**Last updated:** 2026-07-01
**Total firms:** ${names.length}
**Verified:** 0 / ${names.length}

## Legend

- ✅ Verified official website (primary domain confirmed via its homepage)
- ⚠️ Best guess — ambiguous name, needs manual confirmation
- ❌ No official website found (defunct / no web presence)
- ⏳ Pending research

## Directory

| # | Firm | Official Website | Status |
|--:|------|------------------|:------:|
${rows}
`
writeFileSync('docs/vc-directory.md', doc)
console.log('wrote', names.length, 'rows')
```

Expected: `wrote 244 rows`.

- [ ] **Step 3: Run the validator to confirm it fails on pending rows**

Run: `node scripts/validate-vc-directory.mjs`
Expected: many `❌ ...: bad/pending status "⏳"` lines, exit code `1`. (Coverage lines — missing/unknown/count — must be **absent**: all 244 names present exactly once.)

- [ ] **Step 4: Commit**

```bash
git add LIST.md docs/vc-directory.md
git commit -m "feat: scaffold vc-directory with all 244 firms (pending websites)"
```

---

### Task 3: Research fan-out — resolve official websites (subagent-driven)

This is the bulk of the work. Sixteen contiguous, non-overlapping batches cover all 244 rows. Dispatch one research subagent per batch (in parallel where the harness allows); each returns a Markdown table fragment; the **orchestrator is the only writer** — it edits the returned rows into `docs/vc-directory.md`. No parallel file writes, no fragment files.

**Files:**
- Modify: `docs/vc-directory.md` (fill website + status for each row; `⏳` → `✅`/`⚠️`/`❌`).

**Interfaces:**
- Consumes: `LIST.md` row ranges (below), the scaffolded table.
- Produces: per row, `| n | Firm | https://… or — | ✅|⚠️|❌ |`.

**Batch ranges (line numbers in `LIST.md`, inclusive):**

| Batch | Lines | Batch | Lines |
|------:|:------|------:|:------|
| 1 | 1–16 | 9 | 129–144 |
| 2 | 17–32 | 10 | 145–160 |
| 3 | 33–48 | 11 | 161–176 |
| 4 | 49–64 | 12 | 177–192 |
| 5 | 65–80 | 13 | 193–208 |
| 6 | 81–96 | 14 | 209–224 |
| 7 | 97–112 | 15 | 225–240 |
| 8 | 113–128 | 16 | 241–244 |

Extract any batch's exact names with: `sed -n '<start>,<end>p' LIST.md` (row number = line number).

- [ ] **Step 1: Dispatch a research subagent per batch**

Use `superpowers:subagent-driven-development`. For each batch, spawn a subagent with **this exact prompt** (substitute the batch's row-numbered name list from `sed`):

````text
You are a VC website research subagent. Below is a numbered batch of venture-capital / accelerator / fund names (the number is its row in the master directory). For EACH name, find the firm's OFFICIAL primary website.

Per firm:
1. WebSearch: `"<name>" venture capital official site` — add "ventures"/"VC"/"accelerator"/"fund" and, if the name is a common word, a disambiguating hint (a known partner, a portfolio company, or a city).
2. Pick the firm's OWN domain from the results. REJECT aggregators/social: crunchbase, linkedin, pitchbook, twitter/x, facebook, instagram, angellist/wellfound, tracxn, dealroom, signal.nfx, medium, wikipedia.
3. WebFetch the candidate homepage. Confirm it is THIS firm (name matches) AND an investor site (mentions venture / fund / invest / portfolio / accelerator).
4. Record the canonical https homepage: root domain, no tracking params, no deep path — UNLESS the fund is a subpage of a parent (corporate ventures arm), then use that subpage.

Status:
- ✅ homepage fetched and confirmed to be this firm.
- ⚠️ plausible but ambiguous / not fully confirmed.
- ❌ no official site (defunct / no web presence) → website = —

Disambiguation (apply judgment; mark ⚠️ if unsure — never invent a URL):
- Coinbase → Coinbase Ventures (ventures.coinbase.com)
- Gradient → Gradient Ventures (Google's AI fund)
- Variant → Variant Fund, crypto (variant.fund)
- Mantis → Mantis VC (mantisvc.com)
- Konvoy → gaming VC (konvoy.vc)
- NFDG → Nat Friedman + Daniel Gross fund (may be defunct/absorbed in 2024)
- JPMorgan / Morgan Stanley / Point72 / Bain Capital → the named ventures/investing-arm page, not the parent bank homepage
- Bullish → bullish.com (crypto exchange/investor)
- Founders, Inc. → f.inc
- a16z → a16z.com · 8VC → 8vc.com · IVP → ivp.com

Output ONLY a Markdown table fragment — one row per input firm, IN THE GIVEN ORDER, reusing the master row numbers:

| <n> | <exact firm name> | <https url or —> | <✅|⚠️|❌> |

After the table, add a short `Notes:` list explaining every ⚠️ and ❌ row. No other commentary.

BATCH:
<paste the `sed -n 'start,endp' LIST.md` output here, numbered with the master row numbers>
````

- [ ] **Step 2: Write each returned fragment into the table**

As each subagent returns, edit `docs/vc-directory.md`, replacing that batch's rows (match by `| <n> |`) with the returned rows. Keep row order = row number. Do not touch other batches' rows.

- [ ] **Step 3: Run the validator after every few batches**

Run: `node scripts/validate-vc-directory.mjs`
Expected: the pending-status (`⏳`) and invalid-website errors shrink as batches land; aggregator/coverage errors must stay at zero. Fix any aggregator URL a subagent slipped through before continuing.

- [ ] **Step 4: Commit in waves (resumability)**

Commit after roughly every 4 batches so a crash never loses research:

```bash
git add docs/vc-directory.md
git commit -m "feat: resolve official websites for vc-directory batches N–M"
```

---

### Task 4: Final validation & resolve flags (green state)

**Files:**
- Modify: `docs/vc-directory.md`

**Interfaces:**
- Consumes: fully-filled table (no `⏳` left), validator warnings.
- Produces: validator exit `0`; `Verified:` counter updated to real numbers.

- [ ] **Step 1: Run the validator — must be green**

Run: `node scripts/validate-vc-directory.mjs`
Expected: `... · 0 errors · N warnings`, exit code `0`. If any error remains, it is a real coverage/URL bug — fix the offending row, do not weaken the validator.

- [ ] **Step 2: Resolve every warning**

For each `Duplicate URL` warning, confirm two firms really do share a domain (rare — usually one is wrong; re-research it). For each `❌ but site is …`, set the site to `—`. Re-run until warnings are either zero or individually justified.

- [ ] **Step 3: Manually spot-check the `⚠️` rows**

Open each `⚠️` row's URL (WebFetch) and either promote to `✅` (confirmed) or leave `⚠️` with a one-line reason. Aim to minimize `⚠️`.

- [ ] **Step 4: Update the counters in the header**

Set `**Verified:** <count of ✅> / 244`. (Quick count: `grep -c '✅' docs/vc-directory.md` minus the 1 legend line.)

- [ ] **Step 5: Commit**

```bash
git add docs/vc-directory.md
git commit -m "feat: complete vc-directory — validator green"
```

---

### Task 5: Polish & link from README

**Files:**
- Modify: `docs/vc-directory.md`, `README.md`

**Interfaces:**
- Consumes: green directory.
- Produces: discoverable, consistently-formatted deliverable.

- [ ] **Step 1: Consistency pass**

Skim the table: every URL `https://`, no trailing slashes-only inconsistencies, names byte-identical to `LIST.md`. Re-run `node scripts/validate-vc-directory.mjs` → still `0 errors`.

- [ ] **Step 2: Add a pointer in `README.md`**

Add under the title:

```markdown
## VC Directory

See [`docs/vc-directory.md`](docs/vc-directory.md) — 244 venture firms with verified official websites. Validate with `node scripts/validate-vc-directory.mjs`.
```

- [ ] **Step 3: Final commit**

```bash
git add README.md docs/vc-directory.md
git commit -m "docs: link vc-directory from README"
```

---

## Self-Review

**1. Spec coverage.**
- "Normal layout of the file" → Task 2 scaffolds the single-table layout (header, legend, `# | Firm | Website | Status`). ✅
- "Web-search each VC, find official website" → Task 3 fan-out with WebSearch + WebFetch verification. ✅
- "Beautiful markdown with each company's official site" → Tasks 2–5 produce `docs/vc-directory.md`. ✅
- "Subagent-driven development, maximally detailed search" → Task 3 uses superpowers:subagent-driven-development, 16 batches, per-firm verify + disambiguation. ✅
- System prompt for the run → delivered separately in `docs/superpowers/prompts/vc-research-orchestrator-system-prompt.md`. ✅

**2. Placeholder scan.** No `TBD`/`handle edge cases`/"write tests for the above" — validator code, scaffold generator, and subagent prompt are all complete and runnable. Batch names are extracted deterministically via `sed` from `LIST.md` (present in-repo), not paraphrased. ✅

**3. Type/name consistency.** Status set `✅/⚠️/❌` (+ scaffold-only `⏳`) is identical in the validator (`VALID_STATUS`, with `⏳` rejected), the scaffold legend, and the subagent prompt. Column order `# | Firm | Official Website | Status` matches the validator's `slice(1,-1)` parse and the scaffold. File paths (`scripts/validate-vc-directory.mjs`, `docs/vc-directory.md`) are identical across tasks. ✅

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-01-vc-directory-official-websites.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per research batch, orchestrator reviews and writes rows between batches, fast iteration. Matches this plan's Task 3 design.

**2. Inline Execution** — run tasks in this session with checkpoints.

**Which approach?**
