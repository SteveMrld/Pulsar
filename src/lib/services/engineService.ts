// ============================================================
// PULSAR V18 — Engine Service
// Sauvegarde des snapshots moteurs + historique scores
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { EngineResultRow, EngineName } from '@/lib/types/database'
import { logAudit } from './auditService'

export const engineService = {

  // Sauvegarder le résultat d'un run pipeline complet
  async saveResults(
    patientId: string,
    results: { engine: EngineName; score: number; level: string; data: Record<string, unknown> }[]
  ): Promise<void> {
    const supabase = createClient()

    const rows = results.map(r => ({
      patient_id: patientId,
      engine: r.engine,
      score: r.score,
      level: r.level,
      result_data: r.data,
    }))

    const { error } = await supabase
      .from('engine_results')
      .insert(rows)

    if (error) throw new Error(`[EngineService] saveResults: ${error.message}`)

    await logAudit('engine.compute', 'engine_results', patientId, {
      engines: results.map(r => `${r.engine}:${r.score}`).join(', '),
    })
  },

  // Dernier résultat d'un moteur pour un patient
  async getLatest(patientId: string, engine: EngineName): Promise<EngineResultRow | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('engine_results')
      .select('*')
      .eq('patient_id', patientId)
      .eq('engine', engine)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`[EngineService] getLatest: ${error.message}`)
    }
    return data
  },

  // Tous les derniers résultats d'un patient (1 par moteur)
  async getLatestAll(patientId: string): Promise<EngineResultRow[]> {
    const engines: EngineName[] = ['VPS', 'TDE', 'PVE', 'EWE', 'TPE']
    const results: EngineResultRow[] = []

    for (const engine of engines) {
      const result = await engineService.getLatest(patientId, engine)
      if (result) results.push(result)
    }

    return results
  },

  // Historique d'un score moteur (courbe)
  async getScoreHistory(patientId: string, engine: EngineName, limit: number = 30): Promise<{ score: number; computed_at: string }[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('engine_results')
      .select('score, computed_at')
      .eq('patient_id', patientId)
      .eq('engine', engine)
      .order('computed_at', { ascending: true })
      .limit(limit)

    if (error) throw new Error(`[EngineService] getScoreHistory: ${error.message}`)
    return data || []
  },
}
