// test/filterVcs.test.ts
import { describe, it, expect } from 'vitest'
import { filterVcs } from '../app/lib/filterVcs'
import type { Vc, FilterCriteria } from '../app/lib/vcTypes'

const base: FilterCriteria = { q: '', status: [], type: [], stage: [], sector: [], region: [] }
const sample: Vc[] = [
  { name: 'a16z', website: 'https://a16z.com/', status: 'verified', type: 'Fund', stage: ['Seed', 'Growth'], sector: ['AI/ML', 'Crypto/Web3'], region: 'US', hq: 'Menlo Park, US' },
  { name: 'Antler', website: 'https://antler.co/', status: 'verified', type: 'Accelerator', stage: ['Pre-seed'], sector: ['Generalist'], region: 'Global', hq: 'Singapore' },
  { name: 'Blume Ventures', website: 'https://blume.vc/', status: 'verified', type: 'Fund', stage: ['Seed', 'Series A'], sector: ['Consumer', 'Fintech'], region: 'India', hq: 'Mumbai, India' },
]

describe('filterVcs', () => {
  it('returns all with empty criteria', () => {
    expect(filterVcs(sample, base)).toHaveLength(3)
  })
  it('filters by name query, case-insensitive', () => {
    expect(filterVcs(sample, { ...base, q: 'BLUME' }).map((v) => v.name)).toEqual(['Blume Ventures'])
  })
  it('filters by single-value facet (region)', () => {
    expect(filterVcs(sample, { ...base, region: ['India'] }).map((v) => v.name)).toEqual(['Blume Ventures'])
  })
  it('filters by multi-value facet (sector intersection)', () => {
    expect(filterVcs(sample, { ...base, sector: ['Fintech'] }).map((v) => v.name)).toEqual(['Blume Ventures'])
  })
  it('combines facets with AND', () => {
    expect(filterVcs(sample, { ...base, type: ['Fund'], stage: ['Growth'] }).map((v) => v.name)).toEqual(['a16z'])
  })
  it('status filter matches membership', () => {
    expect(filterVcs(sample, { ...base, status: ['none'] })).toHaveLength(0)
  })
})
