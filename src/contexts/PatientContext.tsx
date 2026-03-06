'use client'
import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import { intakePersistenceService } from '@/lib/services/intakePersistenceService'

import type { TriageResult } from '@/lib/engines/IntakeAnalyzer'
import { computeTriageFromPipeline } from '@/lib/engines/IntakeAnalyzer'

/* ══════════════════════════════════════════════════════════════
   PATIENT CONTEXT V17 — patient-centric architecture
   Phase clinique · Timeline · Nav adaptative · Engine results
   ══════════════════════════════════════════════════════════════ */

// ── Clinical phases ──
export type ClinicalPhase = 'acute' | 'stabilization' | 'monitoring' | 'recovery'

export interface PhaseInfo {
  id: ClinicalPhase
  label: string
  labelEn?: string
  color: string
  dayRange: string
  description: string
}

export const PHASES: Record<ClinicalPhase, PhaseInfo> = {
  acute:         { id: 'acute',         label: 'Phase aiguë', labelEn: 'Acute Phase',       color: '#8B5CF6', dayRange: 'J0–J3',  description: 'Urgence · Stabilisation · Bilan initial' },
  stabilization: { id: 'stabilization', label: 'Stabilisation', labelEn: 'Stabilization',     color: '#FFB347', dayRange: 'J3–J7',  description: 'Ajustement thérapeutique · Monitoring renforcé' },
  monitoring:    { id: 'monitoring',    label: 'Monitoring', labelEn: 'Monitoring',        color: '#6C7CFF', dayRange: 'J7–J14', description: 'Suivi évolutif · Réévaluation · Prospection' },
  recovery:      { id: 'recovery',      label: 'Récupération', labelEn: 'Recovery',     color: '#2ED573', dayRange: 'J14+',   description: 'Consolidation · Préparation sortie · Suivi long' },
}

// ── Timeline events ──
export interface TimelineEvent {
  day: number
  hour?: string
  type: 'admission' | 'crisis' | 'treatment' | 'exam' | 'alert' | 'decision' | 'milestone'
  title: string
  detail: string
  severity?: 'critical' | 'warning' | 'info' | 'success'
  engine?: string
}

// ── Patient info ──
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
  phase: ClinicalPhase
  phaseInfo: PhaseInfo
  triage?: TriageResult
}

// ── Tab configuration ──
export interface TabConfig {
  id: string
  label: string
  labelEn?: string
  icon: string
  color: string
  available: boolean    // visible in nav
  priority: number      // sort order (lower = more left)
  badge?: string        // notification badge
  pulsing?: boolean     // animate for attention
}

interface PatientContextValue {
  ps: PatientState
  info: PatientInfo
  scenarioKey: string
  tabs: TabConfig[]
  timeline: TimelineEvent[]
  engineSummary: {
    vps: number
    vpsLevel: string
    vpsColor: string
    criticalAlerts: number
    warningAlerts: number
    totalRecommendations: number
    topRecommendation: string | null
  }
}

const PatientCtx = createContext<PatientContextValue | null>(null)

/* ── Determine clinical phase from hospDay + severity ── */
function detectPhase(hospDay: number, vps: number): ClinicalPhase {
  // VPS override: critical patients stay in acute regardless of day
  if (vps >= 70) return 'acute'
  if (hospDay <= 3) return 'acute'
  if (hospDay <= 7) return 'stabilization'
  if (hospDay <= 14) return 'monitoring'
  return 'recovery'
}

/* ── Build adaptive tabs based on phase + data ── */
function buildTabs(phase: ClinicalPhase, ps: PatientState): TabConfig[] {
  const hasAlerts = ps.alerts.filter(a => a.severity === 'critical').length > 0
  const vps = ps.vpsResult?.synthesis.score ?? 0

  const allTabs: TabConfig[] = [
    {
      id: 'cockpit',     label: 'Cockpit', labelEn: 'Cockpit',     icon: 'heart',      color: '#8B5CF6',
      available: true, priority: 1,
      pulsing: vps >= 70,
    },
    {
      id: 'urgence',     label: 'Urgence', labelEn: 'Emergency',     icon: 'alert',      color: '#A78BFA',
      available: phase === 'acute' || hasAlerts, priority: 2,
      badge: hasAlerts ? '!' : undefined,
      pulsing: hasAlerts,
    },
    {
      id: 'diagnostic',  label: 'Diagnostic', labelEn: 'Diagnosis',  icon: 'brain',      color: '#6C7CFF',
      available: true, priority: 3,
    },
    {
      id: 'traitement',  label: 'Traitement', labelEn: 'Treatment',  icon: 'pill',       color: '#2FD1C8',
      available: true, priority: 4,
      badge: ps.tdeResult ? undefined : 'NEW',
    },
    {
      id: 'oracle',      label: 'Oracle', labelEn: 'Oracle',      icon: 'chart',      color: '#E879F9',
      available: true, priority: 4.5,
      badge: 'NEW',
    },
    {
      id: 'examens',     label: 'Examens', labelEn: 'Tests',     icon: 'microscope', color: '#B96BFF',
      available: true, priority: 5,
    },
    {
      id: 'suivi',       label: 'Suivi', labelEn: 'Follow-up',       icon: 'chart',      color: '#FFB347',
      available: phase !== 'acute', priority: 6,
    },
    {
      id: 'synthese',    label: 'Synthèse', labelEn: 'Summary',    icon: 'clipboard',  color: '#2ED573',
      available: true, priority: 7,
    },
    {
      id: 'ressources',  label: 'Ressources', labelEn: 'Resources',  icon: 'books',      color: '#FFB347',
      available: true, priority: 8,
    },
    {
      id: 'saisie',      label: 'Saisie', labelEn: 'Data Entry',      icon: 'edit',       color: '#A78BFA',
      available: true, priority: 9,
    },
    {
      id: 'historique',   label: 'Historique', labelEn: 'History',  icon: 'clipboard',  color: '#6C7CFF',
      available: true, priority: 10,
    },
    {
      id: 'cascade',     label: 'Cascade', labelEn: 'Cascade',     icon: 'alert',      color: '#FF6B35',
      available: true, priority: 4.8,
      badge: 'NEW',
    },
    {
      id: 'ddd',         label: 'Retard', labelEn: 'Delay',        icon: 'alert',      color: '#DC2626',
      available: true, priority: 4.9,
      badge: hasAlerts ? '!' : undefined,
      pulsing: hasAlerts,
    },
    {
      id: 'consult',     label: 'Consult', labelEn: 'Consult',     icon: 'clipboard',  color: '#3B82F6',
      available: true, priority: 5.5,
    },
    {
      id: 'discovery',   label: 'Discovery', labelEn: 'Discovery',  icon: 'microscope', color: '#10B981',
      available: true, priority: 5.8,
      badge: 'NEW',
    },
    {
      id: 'rapport',     label: 'Rapport', labelEn: 'Report',     icon: 'clipboard',  color: '#F5A623',
      available: true, priority: 11,
    },
    {
      id: 'export',      label: 'Export', labelEn: 'Export',       icon: 'clipboard',  color: '#10B981',
      available: true, priority: 12,
    },
  ]

  return allTabs.filter(t => t.available).sort((a, b) => a.priority - b.priority)
}

/* ── Build timeline from engine results ── */
function buildTimeline(ps: PatientState, info: { hospDay: number; syndrome: string }): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Admission
  events.push({
    day: 0, hour: '08:00', type: 'admission',
    title: 'Admission',
    detail: `Prise en charge pour ${info.syndrome}`,
    severity: 'info',
  })

  // VPS alerts
  if (ps.vpsResult) {
    const score = ps.vpsResult.synthesis.score
    if (score >= 70) {
      events.push({
        day: 0, hour: '08:15', type: 'alert',
        title: `VPS critique: ${score}/100`,
        detail: ps.vpsResult.synthesis.level,
        severity: 'critical', engine: 'VPS',
      })
    }
  }

  // Seizure events
  if (ps.neuro.seizures24h > 0) {
    events.push({
      day: Math.max(0, info.hospDay - 1), type: 'crisis',
      title: `${ps.neuro.seizures24h} crise${ps.neuro.seizures24h > 1 ? 's' : ''} / 24h`,
      detail: `Type: ${ps.neuro.seizureType.replace(/_/g, ' ')}`,
      severity: ps.neuro.seizures24h > 5 ? 'critical' : 'warning',
    })
  }

  // TDE recommendations
  if (ps.tdeResult?.synthesis.recommendations) {
    const urgent = ps.tdeResult.synthesis.recommendations.filter(r => r.priority === 'urgent')
    urgent.forEach((r, i) => {
      events.push({
        day: info.hospDay, type: 'treatment',
        title: r.title, detail: r.body,
        severity: 'warning', engine: 'TDE',
      })
    })
  }

  // PVE alerts (drug interactions)
  if (ps.pveResult?.synthesis.alerts) {
    ps.pveResult.synthesis.alerts.filter(a => a.severity === 'critical').forEach(a => {
      events.push({
        day: info.hospDay, type: 'alert',
        title: a.title, detail: a.body,
        severity: 'critical', engine: 'PVE',
      })
    })
  }

  // EWE predictions
  if (ps.eweResult?.synthesis.riskWindows) {
    ps.eweResult.synthesis.riskWindows.filter(w => w.risk > 0.6).forEach(w => {
      events.push({
        day: info.hospDay, type: 'alert',
        title: `Fenêtre de risque: ${w.window}`,
        detail: w.factors.join(', '),
        severity: 'warning', engine: 'EWE',
      })
    })
  }

  return events.sort((a, b) => a.day - b.day)
}

/* ── Patient info from scenario key ── */
const PATIENT_INFO: Record<string, Omit<PatientInfo, 'phase' | 'phaseInfo'>> = {
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

const ID_TO_SCENARIO: Record<string, string> = {
  ines: 'FIRES', lucas: 'NMDAR', amara: 'CYTOKINE', noah: 'STABLE',
}

export function PatientProvider({ id, children }: { id: string; children: ReactNode }) {
  const scenarioKey = ID_TO_SCENARIO[id] || ''
  const isDemo = !!scenarioKey
  const [dbValue, setDbValue] = useState<PatientContextValue | null>(null)
  const [dbLoading, setDbLoading] = useState(!isDemo)

  // ── Async load for DB patients ──
  useEffect(() => {
    if (isDemo) return

    let cancelled = false
    async function load() {
      try {
        const loaded = await intakePersistenceService.loadForEngines(id)
        if (cancelled || !loaded || !loaded.patient) return

        const ps = new PatientState(loaded.patientData)
        runPipeline(ps)

        const vps = ps.vpsResult?.synthesis.score ?? 0
        const phase = detectPhase(loaded.patient.hosp_day, vps)
        const triage = computeTriageFromPipeline(ps)

        const info: PatientInfo = {
          id: loaded.patient.id,
          displayName: loaded.patient.display_name,
          age: `${Math.floor(loaded.patient.age_months / 12)} ans`,
          sex: loaded.patient.sex,
          syndrome: loaded.patient.syndrome || 'En évaluation',
          hospDay: loaded.patient.hosp_day,
          room: loaded.patient.room || 'Non assigné',
          weight: loaded.patient.weight_kg ? `${loaded.patient.weight_kg} kg` : '—',
          allergies: loaded.patient.allergies || [],
          phase,
          phaseInfo: PHASES[phase],
          triage,
        }

        const tabs = buildTabs(phase, ps)
        const timeline = buildTimeline(ps, info)

        const vpsColor = vps >= 70 ? '#8B5CF6' : vps >= 50 ? '#FFA502' : vps >= 30 ? '#FFB347' : '#2ED573'
        const vpsLevel = vps >= 70 ? 'CRITIQUE' : vps >= 50 ? 'SÉVÈRE' : vps >= 30 ? 'MODÉRÉ' : 'STABLE'

        const allRecs = [
          ...(ps.vpsResult?.synthesis.recommendations || []),
          ...(ps.tdeResult?.synthesis.recommendations || []),
          ...(ps.pveResult?.synthesis.recommendations || []),
        ]

        const engineSummary = {
          vps, vpsLevel, vpsColor,
          criticalAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
          warningAlerts: ps.alerts.filter(a => a.severity === 'warning').length,
          totalRecommendations: allRecs.length,
          topRecommendation: allRecs.find(r => r.priority === 'urgent')?.title || null,
        }

        if (!cancelled) {
          setDbValue({ ps, info, scenarioKey: 'DB', tabs, timeline, engineSummary })
          setDbLoading(false)
        }
      } catch (err) {
        console.error('[PatientContext] Erreur chargement DB:', err)
        if (!cancelled) setDbLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, isDemo])

  // ── Demo patient (synchronous) ──
  const demoValue = useMemo(() => {
    if (!isDemo) return null

    const key = scenarioKey || 'FIRES'
    const demo = DEMO_PATIENTS[key]
    const fallbackKey = demo ? key : 'FIRES'
    const data = demo?.data || DEMO_PATIENTS.FIRES.data

    const ps = new PatientState(data)
    runPipeline(ps)

    const baseInfo = PATIENT_INFO[fallbackKey] || PATIENT_INFO.FIRES
    const vps = ps.vpsResult?.synthesis.score ?? 0
    const phase = detectPhase(ps.hospDay, vps)

    const info: PatientInfo = {
      ...baseInfo,
      hospDay: ps.hospDay,
      phase,
      phaseInfo: PHASES[phase],
      triage: computeTriageFromPipeline(ps),
    }

    const tabs = buildTabs(phase, ps)
    const timeline = buildTimeline(ps, info)

    const vpsColor = vps >= 70 ? '#8B5CF6' : vps >= 50 ? '#FFA502' : vps >= 30 ? '#FFB347' : '#2ED573'
    const vpsLevel = vps >= 70 ? 'CRITIQUE' : vps >= 50 ? 'SÉVÈRE' : vps >= 30 ? 'MODÉRÉ' : 'STABLE'

    const allRecs = [
      ...(ps.vpsResult?.synthesis.recommendations || []),
      ...(ps.tdeResult?.synthesis.recommendations || []),
      ...(ps.pveResult?.synthesis.recommendations || []),
    ]

    const engineSummary = {
      vps, vpsLevel, vpsColor,
      criticalAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: ps.alerts.filter(a => a.severity === 'warning').length,
      totalRecommendations: allRecs.length,
      topRecommendation: allRecs.find(r => r.priority === 'urgent')?.title || null,
    }

    return { ps, info, scenarioKey: key, tabs, timeline, engineSummary }
  }, [scenarioKey, isDemo])

  const value = isDemo ? demoValue : dbValue

  // Loading state
  if (!isDemo && dbLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-bg)' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'var(--p-text-dim)' }}>
          Chargement du patient...
        </div>
      </div>
    )
  }

  if (!value) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-bg)' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: '#8B5CF6' }}>
          Patient introuvable
        </div>
      </div>
    )
  }

  return (
    <PatientCtx.Provider value={value}>
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
