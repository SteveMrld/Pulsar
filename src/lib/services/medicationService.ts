// ============================================================
// PULSAR V18 — Medication Service
// Prescriptions actives + historique thérapeutique
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { Medication, MedicationInsert, TreatmentHistoryRow, TreatmentHistoryInsert } from '@/lib/types/database'
import { logAudit } from './auditService'

export const medicationService = {

  // ── Médicaments en cours ──

  async prescribe(med: MedicationInsert): Promise<Medication> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('medications')
      .insert({ ...med, prescribed_by: user?.id || null })
      .select()
      .single()

    if (error) throw new Error(`[MedicationService] prescribe: ${error.message}`)

    await logAudit('medication.prescribe', 'medications', data.id, {
      patient_id: med.patient_id,
      drug: med.drug_name,
      dose: med.dose,
      route: med.route,
    })

    return data
  },

  async getActive(patientId: string): Promise<Medication[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('start_date', { ascending: true })

    if (error) throw new Error(`[MedicationService] getActive: ${error.message}`)
    return data || []
  },

  async stop(medicationId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('medications')
      .update({
        is_active: false,
        end_date: new Date().toISOString(),
      })
      .eq('id', medicationId)

    if (error) throw new Error(`[MedicationService] stop: ${error.message}`)

    await logAudit('medication.stop', 'medications', medicationId)
  },

  async getAll(patientId: string): Promise<Medication[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false })

    if (error) throw new Error(`[MedicationService] getAll: ${error.message}`)
    return data || []
  },

  // ── Historique traitements (lignes thérapeutiques) ──

  async recordTreatment(treatment: TreatmentHistoryInsert): Promise<TreatmentHistoryRow> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('treatment_history')
      .insert({ ...treatment, recorded_by: user?.id || null })
      .select()
      .single()

    if (error) throw new Error(`[MedicationService] recordTreatment: ${error.message}`)

    await logAudit('treatment.record', 'treatment_history', data.id, {
      patient_id: treatment.patient_id,
      treatment: treatment.treatment,
      response: treatment.response,
    })

    return data
  },

  async getTreatmentHistory(patientId: string): Promise<TreatmentHistoryRow[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('treatment_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('line_number', { ascending: true })

    if (error) throw new Error(`[MedicationService] getTreatmentHistory: ${error.message}`)
    return data || []
  },

  // Nombre de médicaments actifs (pour check PVE)
  async countActive(patientId: string): Promise<number> {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patientId)
      .eq('is_active', true)

    if (error) throw new Error(`[MedicationService] countActive: ${error.message}`)
    return count || 0
  },
}
