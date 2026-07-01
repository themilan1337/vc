// app/lib/filterVcs.ts
import type { Vc, FilterCriteria } from './vcTypes'

export function filterVcs(vcs: Vc[], c: FilterCriteria): Vc[] {
  const q = c.q.trim().toLowerCase()
  return vcs.filter((v) => {
    if (q && !v.name.toLowerCase().includes(q)) return false
    if (c.status.length && !c.status.includes(v.status)) return false
    if (c.type.length && !c.type.includes(v.type)) return false
    if (c.region.length && !c.region.includes(v.region)) return false
    if (c.stage.length && !c.stage.some((s) => v.stage.includes(s))) return false
    if (c.sector.length && !c.sector.some((s) => v.sector.includes(s))) return false
    return true
  })
}

export type { Vc, FilterCriteria } from './vcTypes'
