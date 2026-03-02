// ============================================================
// PULSAR V18 — Patient Profiles for Treatment Pathfinder
// Converts demo patient data to PatientProfile format
// ============================================================

import type { PatientProfile } from '@/lib/engines/TreatmentPathfinder'
import { DEMO_PATIENTS } from './discoveryData'

// Syndrome mapping
const SYNDROME_MAP: Record<string, string> = {
  'FIRES': 'FIRES',
  'EAIS anti-NMDAR': 'EAIS',
  'NORSE': 'NORSE',
  'Méningo-encéphalite': 'Meningo',
  'Vasculite SNC': 'Vasculite',
  'MOGAD/ADEM': 'MOGAD',
}

// Drug mapping from treatment line
const DRUGS_BY_LINE: Record<number, string[]> = {
  0: [],
  1: ['methylprednisolone', 'IgIV'],
  2: ['methylprednisolone', 'IgIV', 'rituximab'],
  3: ['methylprednisolone', 'IgIV', 'rituximab', 'cyclophosphamide'],
  4: ['methylprednisolone', 'IgIV', 'rituximab', 'anakinra'],
}

export const PATIENT_PROFILES: PatientProfile[] = DEMO_PATIENTS.map(p => ({
  id: p.id,
  name: p.display_name,
  syndrome: SYNDROME_MAP[p.syndrome ?? ''] || p.syndrome || 'Unknown',
  ageMonths: p.age_months,
  crp: p.crp ?? 0,
  gcs: p.gcs ?? 15,
  vpsScore: p.vps_score ?? 0,
  ferritin: p.ferritin ?? null,
  treatmentLine: p.treatment_line ?? 0,
  treatmentResponse: (p.treatment_response ?? 'no_response') as 'good' | 'partial' | 'no_response',
  seizures24h: p.seizures_24h,
  currentDrugs: DRUGS_BY_LINE[Math.min(p.treatment_line ?? 0, 4)] || [],
}))
