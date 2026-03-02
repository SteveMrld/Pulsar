// ============================================================
// PULSAR V18 — Lab Service
// Résultats biologiques : saisie, historique, tendances
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { LabResult, LabResultInsert } from '@/lib/types/database'
import { logAudit } from './auditService'

export const labService = {

  async record(lab: LabResultInsert): Promise<LabResult> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('lab_results')
      .insert({ ...lab, recorded_by: user?.id || null })
      .select()
      .single()

    if (error) throw new Error(`[LabService] record: ${error.message}`)

    await logAudit('lab.record', 'lab_results', data.id, {
      patient_id: lab.patient_id,
      crp: lab.crp, pct: lab.pct, lactate: lab.lactate,
    })

    return data
  },

  async getLatest(patientId: string): Promise<LabResult | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`[LabService] getLatest: ${error.message}`)
    }
    return data
  },

  async getHistory(patientId: string, limit: number = 20): Promise<LabResult[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`[LabService] getHistory: ${error.message}`)
    return (data || []).reverse()
  },

  // Tendance d'un biomarqueur
  async getTrend(patientId: string, field: string, days: number = 7): Promise<{ value: number; recorded_at: string }[]> {
    const supabase = createClient()
    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: true })

    if (error) throw new Error(`[LabService] getTrend: ${error.message}`)
    return (data || [])
      .filter(r => r[field as keyof typeof r] != null)
      .map(r => ({
        value: r[field as keyof typeof r] as number,
        recorded_at: r.recorded_at,
      }))
  },
}
