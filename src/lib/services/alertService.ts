// ============================================================
// PULSAR V18 — Alert Service
// Alertes avec workflow acquittement → résolution
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { Alert, AlertSeverity } from '@/lib/types/database'
import { logAudit } from './auditService'

export const alertService = {

  // Créer une alerte
  async create(
    patientId: string,
    severity: AlertSeverity,
    title: string,
    body?: string,
    source?: string
  ): Promise<Alert> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        patient_id: patientId,
        severity,
        title,
        body: body || null,
        source: source || null,
      })
      .select()
      .single()

    if (error) throw new Error(`[AlertService] create: ${error.message}`)
    return data
  },

  // Créer des alertes depuis les résultats moteurs
  async createFromEngineAlerts(
    patientId: string,
    alerts: { severity: string; title: string; body: string; source: string }[]
  ): Promise<void> {
    if (alerts.length === 0) return
    const supabase = createClient()

    const rows = alerts.map(a => ({
      patient_id: patientId,
      severity: a.severity as AlertSeverity,
      title: a.title,
      body: a.body,
      source: a.source,
    }))

    const { error } = await supabase.from('alerts').insert(rows)
    if (error) throw new Error(`[AlertService] createFromEngine: ${error.message}`)
  },

  // Alertes actives d'un patient
  async getActive(patientId: string): Promise<Alert[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('patient_id', patientId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`[AlertService] getActive: ${error.message}`)
    return data || []
  },

  // Toutes les alertes critiques non résolues (file active)
  async getAllCritical(): Promise<Alert[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('severity', 'critical')
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`[AlertService] getAllCritical: ${error.message}`)
    return data || []
  },

  // Acquitter une alerte
  async acknowledge(alertId: string): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('alerts')
      .update({
        acknowledged: true,
        acknowledged_by: user?.id || null,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId)

    if (error) throw new Error(`[AlertService] acknowledge: ${error.message}`)
    await logAudit('alert.acknowledge', 'alerts', alertId)
  },

  // Résoudre une alerte
  async resolve(alertId: string): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('alerts')
      .update({
        resolved: true,
        resolved_by: user?.id || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId)

    if (error) throw new Error(`[AlertService] resolve: ${error.message}`)
    await logAudit('alert.resolve', 'alerts', alertId)
  },

  // Compter les alertes par sévérité pour un patient
  async countBySeverity(patientId: string): Promise<Record<AlertSeverity, number>> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('alerts')
      .select('severity')
      .eq('patient_id', patientId)
      .eq('resolved', false)

    if (error) throw new Error(`[AlertService] countBySeverity: ${error.message}`)

    const counts: Record<AlertSeverity, number> = { critical: 0, warning: 0, info: 0 }
    data?.forEach(a => { counts[a.severity as AlertSeverity]++ })
    return counts
  },

  // Subscribe realtime (alertes d'un patient)
  subscribeToPatient(patientId: string, callback: (alert: Alert) => void) {
    const supabase = createClient()
    return supabase
      .channel(`alerts-${patientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `patient_id=eq.${patientId}`,
      }, (payload) => callback(payload.new as Alert))
      .subscribe()
  },
}
