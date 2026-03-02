// ============================================================
// PULSAR V18 — History Service
// Agrège tous les événements patient en timeline unifiée
// ============================================================

import { createClient } from '@/lib/supabase/client'
import type { TimelineEvent } from '@/contexts/PatientContext'

export interface HistoryEvent {
  id: string
  timestamp: string
  day: number
  hour: string
  type: 'admission' | 'vitals' | 'lab' | 'medication' | 'treatment' | 'engine' | 'alert' | 'exam' | 'note' | 'discharge'
  category: 'clinical' | 'diagnostic' | 'therapeutic' | 'system'
  title: string
  detail: string
  severity?: 'critical' | 'warning' | 'info' | 'success'
  source?: string
  author?: string
  raw?: Record<string, unknown>
}

export const historyService = {

  /**
   * Charge l'historique complet d'un patient depuis toutes les tables
   * Retourne les événements triés par date décroissante
   */
  async getFullHistory(patientId: string, limit: number = 200): Promise<HistoryEvent[]> {
    const supabase = createClient()
    const events: HistoryEvent[] = []

    // Récupérer la date d'admission pour calculer le jour
    const { data: patient } = await supabase
      .from('patients')
      .select('admission_date, display_name, status, discharge_date')
      .eq('id', patientId)
      .single()

    const admDate = patient ? new Date(patient.admission_date) : new Date()
    const dayOf = (ts: string) => Math.max(1, Math.ceil((new Date(ts).getTime() - admDate.getTime()) / 86400000))
    const hourOf = (ts: string) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    // ── Admission ──
    if (patient) {
      events.push({
        id: `admission-${patientId}`,
        timestamp: patient.admission_date,
        day: 1, hour: hourOf(patient.admission_date),
        type: 'admission', category: 'system',
        title: `Admission de ${patient.display_name}`,
        detail: 'Patient admis dans le service',
        severity: 'info',
      })
      if (patient.status === 'discharged' && patient.discharge_date) {
        events.push({
          id: `discharge-${patientId}`,
          timestamp: patient.discharge_date,
          day: dayOf(patient.discharge_date), hour: hourOf(patient.discharge_date),
          type: 'discharge', category: 'system',
          title: 'Sortie du patient',
          detail: 'Patient sorti du service',
          severity: 'success',
        })
      }
    }

    // ── Constantes vitales ──
    const { data: vitals } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(50)

    for (const v of vitals || []) {
      const parts: string[] = []
      if (v.gcs != null) parts.push(`GCS ${v.gcs}`)
      if (v.seizures_24h > 0) parts.push(`${v.seizures_24h} crises`)
      if (v.spo2 != null) parts.push(`SpO₂ ${v.spo2}%`)
      if (v.temp != null) parts.push(`T° ${v.temp}°C`)
      if (v.heart_rate != null) parts.push(`FC ${v.heart_rate}`)

      const isCritical = (v.gcs != null && v.gcs <= 8) || (v.spo2 != null && v.spo2 < 90) || v.pupils === 'fixed_both'
      const isWarning = (v.gcs != null && v.gcs <= 12) || (v.temp != null && v.temp >= 39) || v.seizures_24h > 3

      events.push({
        id: v.id, timestamp: v.recorded_at,
        day: dayOf(v.recorded_at), hour: hourOf(v.recorded_at),
        type: 'vitals', category: 'clinical',
        title: 'Constantes vitales',
        detail: parts.join(' · ') || 'Prise de constantes',
        severity: isCritical ? 'critical' : isWarning ? 'warning' : 'info',
        raw: v,
      })
    }

    // ── Biologie ──
    const { data: labs } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(30)

    for (const l of labs || []) {
      const parts: string[] = []
      if (l.crp != null) parts.push(`CRP ${l.crp}`)
      if (l.wbc != null) parts.push(`GB ${l.wbc}`)
      if (l.lactate != null) parts.push(`Lactate ${l.lactate}`)
      if (l.csf_cells != null) parts.push(`LCR ${l.csf_cells} cel`)
      if (l.ferritin != null) parts.push(`Ferritine ${l.ferritin}`)

      const isCritical = (l.crp != null && l.crp > 100) || (l.lactate != null && l.lactate > 4) || (l.csf_cells != null && l.csf_cells > 100)

      events.push({
        id: l.id, timestamp: l.recorded_at,
        day: dayOf(l.recorded_at), hour: hourOf(l.recorded_at),
        type: 'lab', category: 'diagnostic',
        title: 'Résultats biologiques',
        detail: parts.join(' · ') || 'Bilan biologique',
        severity: isCritical ? 'critical' : 'info',
        raw: l,
      })
    }

    // ── Médicaments ──
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(30)

    for (const m of meds || []) {
      events.push({
        id: m.id, timestamp: m.created_at,
        day: dayOf(m.created_at), hour: hourOf(m.created_at),
        type: 'medication', category: 'therapeutic',
        title: m.is_active ? 'Prescription' : 'Arrêt traitement',
        detail: `${m.drug_name}${m.dose ? ` ${m.dose}` : ''}${m.route ? ` (${m.route})` : ''}`,
        severity: m.is_active ? 'info' : 'warning',
      })
    }

    // ── Résultats moteurs ──
    const { data: engines } = await supabase
      .from('engine_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('computed_at', { ascending: false })
      .limit(50)

    for (const e of engines || []) {
      const color = e.engine === 'VPS' ? (e.score! >= 70 ? 'critical' : e.score! >= 50 ? 'warning' : 'info') : 'info'
      events.push({
        id: e.id, timestamp: e.computed_at,
        day: dayOf(e.computed_at), hour: hourOf(e.computed_at),
        type: 'engine', category: 'diagnostic',
        title: `${e.engine} — ${e.level || ''}`,
        detail: `Score: ${e.score}/100`,
        severity: color as HistoryEvent['severity'],
        source: e.engine,
        raw: e.result_data,
      })
    }

    // ── Alertes ──
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(50)

    for (const a of alerts || []) {
      events.push({
        id: a.id, timestamp: a.created_at,
        day: dayOf(a.created_at), hour: hourOf(a.created_at),
        type: 'alert', category: 'clinical',
        title: a.title,
        detail: a.body || '',
        severity: a.severity as HistoryEvent['severity'],
        source: a.source || undefined,
      })
    }

    // ── Examens neuro ──
    const { data: exams } = await supabase
      .from('neuro_exams')
      .select('*')
      .eq('patient_id', patientId)
      .order('performed_at', { ascending: false })
      .limit(20)

    for (const ex of exams || []) {
      events.push({
        id: ex.id, timestamp: ex.performed_at,
        day: dayOf(ex.performed_at), hour: hourOf(ex.performed_at),
        type: 'exam', category: 'diagnostic',
        title: `${ex.exam_type} — ${ex.status || 'résultat'}`,
        detail: ex.raw_report || '',
        severity: ex.status === 'abnormal' ? 'warning' : 'info',
      })
    }

    // ── Notes cliniques ──
    const { data: notes } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(50)

    const noteTypeLabel: Record<string, string> = {
      observation: 'Observation', prescription: 'Prescription',
      decision: 'Décision clinique', handoff: 'Transmission',
      family: 'Entretien famille', other: 'Note',
    }

    for (const n of notes || []) {
      events.push({
        id: n.id, timestamp: n.created_at,
        day: dayOf(n.created_at), hour: hourOf(n.created_at),
        type: 'note', category: n.note_type === 'prescription' ? 'therapeutic' : 'clinical',
        title: noteTypeLabel[n.note_type] || 'Note',
        detail: n.content.length > 120 ? n.content.substring(0, 120) + '…' : n.content,
        severity: n.note_type === 'decision' ? 'warning' : 'info',
      })
    }

    // Trier par date décroissante
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return events.slice(0, limit)
  },

  /**
   * Convertit les HistoryEvents en TimelineEvents (pour le context existant)
   */
  toTimelineEvents(events: HistoryEvent[]): TimelineEvent[] {
    const typeMap: Record<string, TimelineEvent['type']> = {
      admission: 'admission', vitals: 'alert', lab: 'exam',
      medication: 'treatment', treatment: 'treatment', engine: 'milestone',
      alert: 'alert', exam: 'exam', note: 'decision', discharge: 'milestone',
    }
    return events.map(e => ({
      day: e.day,
      hour: e.hour,
      type: typeMap[e.type] || 'milestone',
      title: e.title,
      detail: e.detail,
      severity: e.severity,
      engine: e.source,
    }))
  },

  /**
   * Évolution des scores moteurs dans le temps
   */
  async getScoreEvolution(patientId: string): Promise<{
    engine: string
    points: { score: number; timestamp: string; day: number }[]
  }[]> {
    const supabase = createClient()

    const { data: patient } = await supabase
      .from('patients')
      .select('admission_date')
      .eq('id', patientId)
      .single()

    const admDate = patient ? new Date(patient.admission_date) : new Date()
    const dayOf = (ts: string) => Math.max(1, Math.ceil((new Date(ts).getTime() - admDate.getTime()) / 86400000))

    const { data: results } = await supabase
      .from('engine_results')
      .select('engine, score, computed_at')
      .eq('patient_id', patientId)
      .order('computed_at', { ascending: true })

    const grouped: Record<string, { score: number; timestamp: string; day: number }[]> = {}

    for (const r of results || []) {
      if (!grouped[r.engine]) grouped[r.engine] = []
      grouped[r.engine].push({
        score: r.score || 0,
        timestamp: r.computed_at,
        day: dayOf(r.computed_at),
      })
    }

    return Object.entries(grouped).map(([engine, points]) => ({ engine, points }))
  },

  /**
   * Évolution GCS dans le temps
   */
  async getGcsEvolution(patientId: string): Promise<{ gcs: number; timestamp: string; day: number }[]> {
    const supabase = createClient()

    const { data: patient } = await supabase
      .from('patients')
      .select('admission_date')
      .eq('id', patientId)
      .single()

    const admDate = patient ? new Date(patient.admission_date) : new Date()
    const dayOf = (ts: string) => Math.max(1, Math.ceil((new Date(ts).getTime() - admDate.getTime()) / 86400000))

    const { data: vitals } = await supabase
      .from('vitals')
      .select('gcs, recorded_at')
      .eq('patient_id', patientId)
      .not('gcs', 'is', null)
      .order('recorded_at', { ascending: true })

    return (vitals || []).map(v => ({
      gcs: v.gcs!,
      timestamp: v.recorded_at,
      day: dayOf(v.recorded_at),
    }))
  },
}
