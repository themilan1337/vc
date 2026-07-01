// scripts/validate-vcs.mjs
// Gate for app/data/vcs.json: coverage vs LIST.md + legal enum values.
// Run: node scripts/validate-vcs.mjs   (exit 1 on any error)
import { readFileSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname
const names = readFileSync(ROOT + 'LIST.md', 'utf8')
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)

// keep in sync with app/lib/vcTypes.ts (ponytail: tiny duplication; Node can't import .ts)
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth']
const SECTORS = ['AI/ML', 'Fintech', 'Crypto/Web3', 'Climate', 'Health/Bio', 'Consumer', 'Enterprise/SaaS', 'Deep Tech', 'Dev Tools', 'Gaming', 'Hardware', 'Generalist']
const REGIONS = ['US', 'Europe', 'India', 'MENA', 'LatAm', 'Asia', 'Global']
const TYPES = ['Fund', 'Accelerator', 'Corporate', 'Angel', 'Community']
const STATUSES = ['verified', 'ambiguous', 'none']

let data
try { data = JSON.parse(readFileSync(ROOT + 'app/data/vcs.json', 'utf8')) }
catch { console.log('❌ app/data/vcs.json missing or invalid JSON'); process.exit(1) }

const norm = (s) => String(s).replace(/\s+/g, ' ').trim()
const errors = []
const tblNames = data.map((d) => norm(d.name))
const srcSet = new Set(names), tblSet = new Set(tblNames)
for (const n of names) if (!tblSet.has(n)) errors.push(`Missing firm: ${n}`)
for (const n of tblNames) if (!srcSet.has(n)) errors.push(`Unknown firm: ${n}`)
if (data.length !== names.length) errors.push(`Count ${data.length} != ${names.length}`)

const ok = (v, set) => set.includes(v)
for (const d of data) {
  if (!ok(d.status, STATUSES)) errors.push(`${d.name}: bad status "${d.status}"`)
  if (!ok(d.type, TYPES)) errors.push(`${d.name}: bad type "${d.type}"`)
  if (!ok(d.region, REGIONS)) errors.push(`${d.name}: bad region "${d.region}"`)
  if (!Array.isArray(d.stage) || !d.stage.length || d.stage.some((s) => !ok(s, STAGES)))
    errors.push(`${d.name}: bad stage ${JSON.stringify(d.stage)}`)
  if (!Array.isArray(d.sector) || !d.sector.length || d.sector.some((s) => !ok(s, SECTORS)))
    errors.push(`${d.name}: bad sector ${JSON.stringify(d.sector)}`)
  if (typeof d.website !== 'string') errors.push(`${d.name}: website not a string`)
  else if (d.website !== '' && !/^https?:\/\//.test(d.website)) errors.push(`${d.name}: website not http(s) "${d.website}"`)
}
for (const e of errors) console.log('❌', e)
console.log(`\n${data.length} rows · ${errors.length} errors`)
process.exit(errors.length ? 1 : 0)
