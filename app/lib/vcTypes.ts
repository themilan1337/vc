// app/lib/vcTypes.ts
export const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth'] as const
export const SECTORS = ['AI/ML', 'Fintech', 'Crypto/Web3', 'Climate', 'Health/Bio', 'Consumer', 'Enterprise/SaaS', 'Deep Tech', 'Dev Tools', 'Gaming', 'Hardware', 'Generalist'] as const
export const REGIONS = ['US', 'Europe', 'India', 'MENA', 'LatAm', 'Asia', 'Global'] as const
export const TYPES = ['Fund', 'Accelerator', 'Corporate', 'Angel', 'Community'] as const
export const STATUSES = ['verified', 'ambiguous', 'none'] as const

export type Stage = (typeof STAGES)[number]
export type Sector = (typeof SECTORS)[number]
export type Region = (typeof REGIONS)[number]
export type VcType = (typeof TYPES)[number]
export type Status = (typeof STATUSES)[number]

export interface Vc {
  name: string
  website: string // '' when status === 'none'
  status: Status
  type: VcType
  stage: Stage[] // >= 1
  sector: Sector[] // >= 1
  region: Region
  hq: string // display-only, e.g. "Menlo Park, US"
}

export interface FilterCriteria {
  q: string
  status: Status[]
  type: VcType[]
  stage: Stage[]
  sector: Sector[]
  region: Region[]
}
