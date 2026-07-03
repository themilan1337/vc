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

export interface ProgramInfo {
  description: string
  tier: 1 | 2 // 1 = internationally famous; 2 = strong regional/vertical. Sorts programs to the top.
  funding?: string | null // e.g. "$500,000 ($125k for 7% + $375k MFN SAFE)"
  equity?: string | null // e.g. "7%"
  duration?: string | null // e.g. "3 months"
  location?: string | null // e.g. "San Francisco — in person"
  cadence?: string | null // e.g. "2 batches/year"
}

export interface Vc {
  name: string
  website: string // '' when status === 'none'
  status: Status
  type: VcType
  stage: Stage[] // >= 1
  sector: Sector[] // >= 1
  region: Region
  hq: string // display-only, e.g. "Menlo Park, US"
  program?: ProgramInfo // present for application-based accelerator/incubator programs
}

export interface FilterCriteria {
  q: string
  status: Status[]
  type: VcType[]
  stage: Stage[]
  sector: Sector[]
  region: Region[]
}
