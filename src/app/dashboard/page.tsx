'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'
import { RoleBadge } from '@/components/RoleGate'
import { patientService, alertService } from '@/lib/services'
import { intakePersistenceService } from '@/lib/services/intakePersistenceService'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { computeTriageFromPipeline } from '@/lib/engines/IntakeAnalyzer'
import type { Patient, Alert } from '@/lib/types/database'
import dynamic from 'next/dynamic'
import UseCaseButton from '@/components/UseCaseButton';
import EngineStatusBar from '@/components/EngineStatusBar';
import ResearchPulse from '@/components/ResearchPulse';
import AlertBadge from '@/components/AlertBadge';

const AlejandroCasePage = dynamic(() => import('@/app/usecase/alejandro/page'), { ssr: false })

function UseCaseGate() {
  const [showInput, setShowInput] = useState(false)
  const [code, setCode] = useState('')
  const [showCase, setShowCase] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (code === '0513') {
      setShowCase(true)
      setShowInput(false)
      setError(false)
    } else {
      setError(true)
      setCode('')
    }
  }

  if (showCase) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'var(--p-bg, #0C1424)', overflowY: 'auto' }}>
      <button onClick={() => setShowCase(false)} style={{ position: 'fixed', top: 12, right: 16, zIndex: 1000, background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#6B7280', fontSize: 11, padding: '4px 14px', borderRadius: 16, cursor: 'pointer' }}>Fermer ✕</button>
      <AlejandroCasePage />
    </div>
  )

  return (
    <div style={{ marginTop: 'var(--p-space-6)', padding: '16px 20px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: '1px solid var(--p-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Picto name="shield" size={18} glow />
        <div>
          <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>Use Case — Accès protégé</div>
          <div style={{ fontSize: 10, color: 'var(--p-text-dim)' }}>Analyse de cas clinique réel — code requis</div>
        </div>
      </div>
      {!showInput ? (
        <button onClick={() => setShowInput(true)} style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-md)', background: '#F5A62315', border: '1px solid #F5A62325', color: '#F5A623', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Accéder
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="password" value={code} onChange={e => { setCode(e.target.value); setError(false) }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Code" maxLength={4}
            style={{ width: 80, padding: '6px 10px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-surface)', border: `1px solid ${error ? '#EF4444' : 'var(--p-border)'}`, color: 'var(--p-text)', fontSize: 14, fontFamily: 'var(--p-font-mono)', textAlign: 'center', letterSpacing: 4 }} autoFocus />
          <button onClick={handleSubmit} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', background: '#F5A623', color: '#000', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>OK</button>
          {error && <span style={{ fontSize: 10, color: '#EF4444' }}>Code incorrect</span>}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD — Vue chef de service
   Stats · Alertes · Triage · Activité récente
   ══════════════════════════════════════════════════════════════ */

interface DashboardStats {
  total: number
  byPhase: Record<string, number>
  byTriage: Record<string, number>
  avgVps: number
  critAlerts: number
  warnAlerts: number
  gcsBelow8: number
  feverCount: number
}

interface PatientSummary {
  id: string
  name: string
  room: string
  hospDay: number
  vps: number
  vpsColor: string
  triage: string
  triageColor: string
  critAlerts: number
  phase: string
}

const PHASE_COLORS: Record<string, string> = {
  acute: '#8B5CF6', stabilization: '#FFA502', monitoring: '#FFB347', recovery: '#2ED573',
}
const PHASE_LABELS: Record<string, string> = {
  acute: 'Aigu', stabilization: 'Stabilisation', monitoring: 'Surveillance', recovery: 'Récupération',
}
const TRIAGE_COLORS: Record<string, string> = {
  P1: '#8B5CF6', P2: '#FFA502', P3: '#FFB347', P4: '#2ED573',
}

function StatCard({ value, label, color, icon, sub }: {
  value: number | string; label: string; color: string; icon: string; sub?: string
}) {
  return (
    <div className="glass-card" style={{
      padding: '14px 16px', borderRadius: 'var(--p-radius-xl)', flex: '1 1 130px', minWidth: '120px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Picto name={icon} size={14} />
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '24px', fontWeight: 900, color }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function MiniBar({ data, colors, labels }: { data: Record<string, number>; colors: Record<string, string>; labels: Record<string, string> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  if (total === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
        {Object.entries(data).filter(([, v]) => v > 0).map(([k, v]) => (
          <div key={k} style={{ width: `${(v / total) * 100}%`, background: colors[k] || '#6C7CFF', transition: 'width 0.5s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {Object.entries(data).filter(([, v]) => v > 0).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors[k] || '#6C7CFF' }} />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
              {labels[k] || k}: <strong style={{ color: 'var(--p-text)' }}>{v}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useLang()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [patients, setPatients] = useState<PatientSummary[]>([])
  const [critAlerts, setCritAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const dbPatients = await patientService.getActive()
        const alerts = await alertService.getAllCritical()
        setCritAlerts(alerts)

        const byPhase: Record<string, number> = { acute: 0, stabilization: 0, monitoring: 0, recovery: 0 }
        const byTriage: Record<string, number> = { P1: 0, P2: 0, P3: 0, P4: 0 }
        let totalVps = 0
        let gcsBelow8 = 0
        let feverCount = 0
        let totalCrit = 0
        let totalWarn = 0
        const summaries: PatientSummary[] = []

        for (const p of dbPatients) {
          const loaded = await intakePersistenceService.loadForEngines(p.id)
          if (!loaded) continue

          const ps = new PatientState(loaded.patientData)
          runPipeline(ps)

          const vps = ps.vpsResult?.synthesis.score ?? 0
          const triage = computeTriageFromPipeline(ps)
          const hospDay = p.hosp_day || 1
          const phase = vps >= 70 || hospDay <= 3 ? 'acute' : hospDay <= 7 || vps >= 50 ? 'stabilization' : hospDay <= 14 || vps >= 30 ? 'monitoring' : 'recovery'

          byPhase[phase] = (byPhase[phase] || 0) + 1
          byTriage[triage.priority] = (byTriage[triage.priority] || 0) + 1
          totalVps += vps

          const crit = ps.alerts.filter(a => a.severity === 'critical').length
          const warn = ps.alerts.filter(a => a.severity === 'warning').length
          totalCrit += crit
          totalWarn += warn

          if (ps.neuro.gcs <= 8) gcsBelow8++
          if (ps.hemodynamics.temp >= 38.5) feverCount++

          summaries.push({
            id: p.id,
            name: p.display_name,
            room: p.room || '—',
            hospDay,
            vps,
            vpsColor: vps >= 70 ? '#8B5CF6' : vps >= 50 ? '#FFA502' : vps >= 30 ? '#FFB347' : '#2ED573',
            triage: triage.priority,
            triageColor: TRIAGE_COLORS[triage.priority] || '#FFB347',
            critAlerts: crit,
            phase,
          })
        }

        summaries.sort((a, b) => b.vps - a.vps)

        setStats({
          total: dbPatients.length,
          byPhase, byTriage,
          avgVps: dbPatients.length > 0 ? Math.round(totalVps / dbPatients.length) : 0,
          critAlerts: totalCrit,
          warnAlerts: totalWarn,
          gcsBelow8,
          feverCount,
        })
        setPatients(summaries)
      } catch (err) {
        console.error('[Dashboard] Erreur:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="chart" size={28} glow glowColor="rgba(108,124,255,0.5)" />
          <div>
            <h1>Dashboard</h1>
            <span className="page-subtitle">
              Vue d'ensemble du service · Neuropédiatrie
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/patients" style={{
            padding: '6px 14px', borderRadius: 'var(--p-radius-md)', textDecoration: 'none',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
            background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)', color: '#fff',
          }}>
            File active
          </Link>
          <Link href="/patients/intake" style={{
            padding: '6px 14px', borderRadius: 'var(--p-radius-md)', textDecoration: 'none',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
            background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)', border: 'var(--p-border)',
          }}>
            + Admission
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
          Chargement du dashboard...
        </div>
      ) : stats ? (
        <>
          {/* Stats cards */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <StatCard value={stats.total} label="PATIENTS ACTIFS" color="#6C7CFF" icon="heart" />
            <StatCard value={stats.avgVps} label="VPS MOYEN" color={stats.avgVps >= 50 ? '#8B5CF6' : '#2ED573'} icon="brain" sub="/100" />
            <StatCard value={stats.critAlerts} label="ALERTES CRITIQUES" color="#8B5CF6" icon="alert" sub={`+ ${stats.warnAlerts} warning`} />
            <StatCard value={stats.gcsBelow8} label="GCS ≤ 8" color={stats.gcsBelow8 > 0 ? '#8B5CF6' : '#2ED573'} icon="brain" />
          </div>

          {/* Phase + Triage distribution */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)', flex: '1 1 300px' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '10px' }}>
                RÉPARTITION PAR PHASE
              </div>
              <MiniBar data={stats.byPhase} colors={PHASE_COLORS} labels={PHASE_LABELS} />
            </div>
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)', flex: '1 1 300px' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '10px' }}>
                RÉPARTITION PAR TRIAGE
              </div>
              <MiniBar data={stats.byTriage} colors={TRIAGE_COLORS} labels={{ P1: 'Critique', P2: 'Urgent', P3: 'Semi-urgent', P4: 'Stable' }} />
            </div>
          </div>

          {/* Critical alerts */}
          {critAlerts.length > 0 && (
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px', border: '1px solid #8B5CF620' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.5px', marginBottom: '8px' }}>
                ⚠ ALERTES CRITIQUES NON RÉSOLUES ({critAlerts.length})
              </div>
              {critAlerts.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--p-dark-4)' }}>
                  <span className="page-subtitle">
                    {a.title}
                  </span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
                    {new Date(a.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Patient list */}
          <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '10px' }}>
              PATIENTS PAR SÉVÉRITÉ VPS
            </div>
            {patients.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
                Aucun patient actif — <Link href="/patients/intake" style={{ color: '#6C7CFF' }}>Admettre un patient</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {patients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/patient/${p.id}/cockpit`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                      borderRadius: 'var(--p-radius-md)', cursor: 'pointer',
                      borderLeft: `3px solid ${p.vpsColor}`,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--p-bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* VPS score */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: `${p.vpsColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, border: `2px solid ${p.vpsColor}40`,
                    }}>
                      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 900, color: p.vpsColor }}>
                        {p.vps}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--p-text)' }}>
                          {p.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
                          padding: '1px 5px', borderRadius: '3px',
                          background: `${p.triageColor}15`, color: p.triageColor,
                        }}>
                          {p.triage}
                        </span>
                        {p.critAlerts > 0 && (
                          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: '#8B5CF6', fontWeight: 800 }}>
                            ⚠ {p.critAlerts}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
                        {p.room} · J{p.hospDay} · {PHASE_LABELS[p.phase] || p.phase}
                      </div>
                    </div>

                    {/* Arrow */}
                    <span style={{ color: 'var(--p-text-dim)', fontSize: '12px' }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'var(--p-text-dim)' }}>
            Erreur de chargement du dashboard
          </div>
        </div>
      )}

      {/* ── Use Case Alejandro — accès protégé par code ── */}
      <UseCaseGate />
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:100 }}><UseCaseButton /></div>
  </div>
  )
}
