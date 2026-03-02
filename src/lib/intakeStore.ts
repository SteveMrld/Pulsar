// ============================================================
// PULSAR V17.3 — IntakeStore
// Store client-side pour les patients créés via Analyse Intelligente
// Partagé entre file active, PatientContext, et intake page
// ============================================================

import type { IntakeData } from '@/lib/engines/IntakeAnalyzer'
import type { IntakeAnalysis, TriageResult } from '@/lib/engines/IntakeAnalyzer'

export interface IntakePatient {
  id: string
  displayName: string
  age: string
  ageMonths: number
  sex: 'male' | 'female'
  weight: string
  room: string
  syndrome: string
  hospDay: number
  allergies: string[]
  createdAt: number
  // Raw data for PatientState construction
  patientData: Record<string, any>
  // Intake analysis snapshot
  intakeAnalysis: IntakeAnalysis
  // Triage result
  triage: TriageResult
  // Original intake data
  intakeData: Partial<IntakeData>
}

// ── Module-level store (persists across client-side navigations) ──
const store = new Map<string, IntakePatient>()

let idCounter = 1

export function generatePatientId(): string {
  const ts = Date.now().toString(36)
  const n = (idCounter++).toString().padStart(3, '0')
  return `intake-${ts}-${n}`
}

export function addIntakePatient(patient: IntakePatient): void {
  store.set(patient.id, patient)
}

export function getIntakePatient(id: string): IntakePatient | undefined {
  return store.get(id)
}

export function getAllIntakePatients(): IntakePatient[] {
  return Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt)
}

export function removeIntakePatient(id: string): boolean {
  return store.delete(id)
}

export function getIntakePatientCount(): number {
  return store.size
}
