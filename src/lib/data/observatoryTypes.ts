// Observatory module types

export type Family = 'FIRES' | 'EAIS' | 'NORSE' | 'PIMS' | 'MOGAD' | 'ALL'

export interface SignalItem {
  id: string
  title: string
  region: string
  family: Family
  year: number
  score: number // z-score
  status: 'active' | 'under_review' | 'validated' | 'dismissed'
  rationale: string
  source?: string
}

export interface EvidenceItem {
  topic: string
  metric: string
  value: string
  unit: string
  population?: string
  geography?: string
  note?: string
  sourceTitle: string
  sourceUrl: string
  year: number
}

export interface RegistryRow {
  case_id: string
  family: Family
  region: string
  country: string
  lat: number
  lon: number
  seizure_onset: string
  severity_1to5: number | null
  outcome_12m: string
  age_months: number
  sex: 'M' | 'F'
}

export interface AggregateData {
  family: Family
  incidence: string
  mortality: string
  medianAge: string
  cohortSize: number
  geography: string
  source: string
}
