'use client'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

/* ══════════════════════════════════════════════════════════════
   PATIENT CONTEXT — patient-centric architecture
   Provides PatientState + metadata to all patient sub-pages
   ══════════════════════════════════════════════════════════════ */

export interface PatientInfo {
  id: string
  displayName: string
  age: string
  sex: 'male' | 'female'
  syndrome: string
  hospDay: number
  room: string
  weight: string
  allergies: string[]
}

interface PatientContextValue {
  ps: PatientState
  info: PatientInfo
  scenarioKey: string
}

const PatientCtx = createContext<PatientContextValue | null>(null)

/* ── Patient info from scenario key ── */
const PATIENT_INFO: Record<string, PatientInfo> = {
  FIRES: {
    id: 'ines', displayName: 'Inès M.', age: '4 ans', sex: 'female',
    syndrome: 'FIRES', hospDay: 4, room: 'Réa Neuro — Lit 3',
    weight: '16 kg', allergies: [],
  },
  NMDAR: {
    id: 'lucas', displayName: 'Lucas R.', age: '14 ans', sex: 'male',
    syndrome: 'Anti-NMDAR', hospDay: 7, room: 'Réa Neuro — Lit 7',
    weight: '48 kg', allergies: ['Amoxicilline'],
  },
  CYTOKINE: {
    id: 'amara', displayName: 'Amara T.', age: '8 ans', sex: 'female',
    syndrome: 'MOGAD', hospDay: 2, room: 'Neuropédiatrie — Lit 12',
    weight: '26 kg', allergies: [],
  },
  STABLE: {
    id: 'noah', displayName: 'Noah B.', age: '6 ans', sex: 'male',
    syndrome: 'Épilepsie focale', hospDay: 1, room: 'Neuropédiatrie — Lit 5',
    weight: '21 kg', allergies: ['Sulfamides'],
  },
}

/* ── Map patient ID → scenario key ── */
const ID_TO_SCENARIO: Record<string, string> = {
  ines: 'FIRES', lucas: 'NMDAR', amara: 'CYTOKINE', noah: 'STABLE',
}

export function PatientProvider({ id, children }: { id: string; children: ReactNode }) {
  const scenarioKey = ID_TO_SCENARIO[id] || 'FIRES'

  const { ps, info } = useMemo(() => {
    const demo = DEMO_PATIENTS[scenarioKey]
    if (!demo) {
      const fallback = DEMO_PATIENTS.FIRES
      const ps = new PatientState(fallback.data)
      runPipeline(ps)
      return { ps, info: PATIENT_INFO.FIRES }
    }
    const ps = new PatientState(demo.data)
    runPipeline(ps)
    const info = PATIENT_INFO[scenarioKey] || PATIENT_INFO.FIRES
    return { ps, info: { ...info, hospDay: ps.hospDay } }
  }, [scenarioKey])

  return (
    <PatientCtx.Provider value={{ ps, info, scenarioKey }}>
      {children}
    </PatientCtx.Provider>
  )
}

export function usePatient() {
  const ctx = useContext(PatientCtx)
  if (!ctx) throw new Error('usePatient must be used within PatientProvider')
  return ctx
}

export function usePatientSafe() {
  return useContext(PatientCtx)
}
