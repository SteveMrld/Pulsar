// ============================================================
// PULSAR V18 — Vitals Service
// Saisie, historique et monitoring constantes vitales
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { Vitals, VitalsInsert } from '@/lib/types/database'
import { logAudit } from './auditService'

export const vitalsService = {

  // Enregistrer une prise de constantes
  async record(vitals: VitalsInsert): Promise<Vitals> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const row = {
      ...vitals,
      recorded_by: user?.id || null,
    }

    const { data, error } = await supabase
      .from('vitals')
      .insert(row)
      .select()
      .single()

    if (error) throw new Error(`[VitalsService] record: ${error.message}`)

    await logAudit('vitals.record', 'vitals', data.id, {
      patient_id: vitals.patient_id,
      gcs: vitals.gcs,
      spo2: vitals.spo2,
      temp: vitals.temp,
    })

    return data
  },

  // Dernières constantes d'un patient
  async getLatest(patientId: string): Promise<Vitals | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`[VitalsService] getLatest: ${error.message}`)
    }
    return data
  },

  // Historique (N dernières prises)
  async getHistory(patientId: string, limit: number = 24): Promise<Vitals[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`[VitalsService] getHistory: ${error.message}`)
    return (data || []).reverse() // chronologique
  },

  // Historique GCS (pour courbe)
  async getGcsHistory(patientId: string, days: number = 7): Promise<{ gcs: number; recorded_at: string }[]> {
    const supabase = createClient()
    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data, error } = await supabase
      .from('vitals')
      .select('gcs, recorded_at')
      .eq('patient_id', patientId)
      .not('gcs', 'is', null)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: true })

    if (error) throw new Error(`[VitalsService] getGcsHistory: ${error.message}`)
    return data || []
  },

  // Subscribe realtime (monitoring)
  subscribeToPatient(patientId: string, callback: (vitals: Vitals) => void) {
    const supabase = createClient()
    return supabase
      .channel(`vitals-${patientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'vitals',
        filter: `patient_id=eq.${patientId}`,
      }, (payload) => callback(payload.new as Vitals))
      .subscribe()
  },
}
