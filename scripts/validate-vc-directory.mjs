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
