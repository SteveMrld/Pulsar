'use client'
import PulsarLogo from '@/components/PulsarLogo'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useLang, LangToggle } from '@/contexts/LanguageContext'

const AlejandroCasePage = dynamic(() => import('@/app/usecase/alejandro/page'), { ssr: false })

function UseCaseGate() {
  const [showInput, setShowInput] = useState(false)
  const [code, setCode] = useState('')
  const [showCase, setShowCase] = useState(false)
  const [error, setError] = useState(false)
  const handleSubmit = () => {
    if (code === '0513') { setShowCase(true); setShowInput(false); setError(false) }
    else { setError(true); setCode('') }
  }
  if (showCase) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'var(--p-bg, #0C1424)', overflowY: 'auto' }}>
      <HypothesisGauges />
      <button onClick={() => setShowCase(false)} style={{ position: 'fixed', top: 12, right: 16, zIndex: 1000, background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#6B7280', fontSize: 11, padding: '4px 14px', borderRadius: 16, cursor: 'pointer' }}>Fermer ×</button>
      <AlejandroCasePage />
    </div>
  )
  return (
    <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: '1px solid var(--p-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>ð</span>
        <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-text)' }}>Use Case · Accès protégé</div><div style={{ fontSize: 10, color: 'var(--p-text-dim)' }}>Analyse de cas clinique réel</div></div>
      </div>
      {!showInput ? (
        <button onClick={() => setShowInput(true)} style={{ padding: '5px 14px', borderRadius: 8, background: '#F5A62315', border: '1px solid #F5A62325', color: '#F5A623', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Accéder</button>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="password" value={code} onChange={e => { setCode(e.target.value); setError(false) }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Code" maxLength={4} style={{ width: 72, padding: '5px 8px', borderRadius: 6, background: 'var(--p-bg-surface)', border: '1px solid ' + (error ? '#EF4444' : 'var(--p-border)'), color: 'var(--p-text)', fontSize: 14, fontFamily: 'var(--p-font-mono)', textAlign: 'center', letterSpacing: 4 }} autoFocus />
          <button onClick={handleSubmit} style={{ padding: '5px 10px', borderRadius: 6, background: '#F5A623', color: '#000', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>OK</button>
          {error && <span style={{ fontSize: 10, color: '#EF4444' }}>Code incorrect</span>}
        </div>
      )}
      <UseCaseGate />
    </div>
  )
}
import { AVATAR_DATA } from '@/lib/avatarData'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import { PHASES, type ClinicalPhase } from '@/contexts/PatientContext'
import { patientService } from '@/lib/services'
import { intakePersistenceService } from '@/lib/services/intakePersistenceService'
import { computeTriageFromPipeline } from '@/lib/engines/IntakeAnalyzer'
import UseCaseButton from '@/components/UseCaseButton';
import HypothesisGauges from '@/components/HypothesisGauges';
import PatientTimeline from '@/components/PatientTimeline';
import AlertBadge from '@/components/AlertBadge';

/* ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   FILE ACTIVE · PULSAR V17
   Tour de contrôle · Avatars · Phases · Quick access · Démo
   ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

interface PatientCard {
  id: string; name: string; age: string; sex: 'male' | 'female'
  syndrome: string; hospDay: number; room: string
  vps: number; gcs: number; critAlerts: number
  phase: ClinicalPhase; lastEvent: string; isDemo: boolean
  vpsHistory: number[]; avatar?: string
  triageScore?: number; triagePriority?: string; triageColor?: string; triageLabel?: string
}

const PATIENT_MAP: Record<string, { id: string; name: string; age: string; sex: 'male' | 'female'; room: string; syndrome: string; avatar: string }> = {
  FIRES:    { id: 'ines',  name: 'Inès M.',  age: '4 ans',  sex: 'female', room: 'Réa Neuro · Lit 3',  syndrome: 'FIRES',       avatar: '/assets/avatars/avatar-ines.png' },
  NMDAR:    { id: 'lucas', name: 'Lucas R.', age: '14 ans', sex: 'male',   room: 'Réa Neuro · Lit 7',  syndrome: 'Anti-NMDAR',  avatar: '/assets/avatars/avatar-lucas.png' },
  CYTOKINE: { id: 'amara', name: 'Amara T.', age: '8 ans',  sex: 'female', room: 'Neuropéd. · Lit 12', syndrome: 'MOGAD',       avatar: '/assets/avatars/avatar-amara.png' },
  STABLE:   { id: 'noah',  name: 'Noah B.',  age: '6 ans',  sex: 'male',   room: 'Neuropéd. · Lit 5',  syndrome: 'Épil. focale', avatar: '/assets/avatars/avatar-noah.png' },
}

function detectPhase(hospDay: number, vps: number): ClinicalPhase {
  if (vps >= 70) return 'acute'
  if (hospDay <= 3) return 'acute'
  if (hospDay <= 7) return 'stabilization'
  if (hospDay <= 14) return 'monitoring'
  return 'recovery'
}

function buildDemoPatients(): PatientCard[] {
  return Object.entries(DEMO_PATIENTS).map(([key, demo]) => {
    const meta = PATIENT_MAP[key]
    if (!meta) return null
    const ps = new PatientState(demo.data)
    runPipeline(ps)
    const vps = ps.vpsResult?.synthesis.score ?? 0
    const vpsHistory = ps.vpsResult?.curve?.curveData?.slice(-6) ?? [vps]
    const triage = computeTriageFromPipeline(ps)
    return {
      ...meta,
      hospDay: ps.hospDay,
      vps,
      gcs: ps.neuro.gcs,
      critAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
      phase: detectPhase(ps.hospDay, vps),
      lastEvent: ps.neuro.seizureType.includes('refractory') ? 'Status réfractaire en cours'
        : ps.neuro.seizures24h > 3 ? `${ps.neuro.seizures24h} crises/24h`
        : ps.neuro.gcs <= 8 ? 'GCS critique'
        : 'Stable',
      isDemo: true,
      vpsHistory,
      triageScore: triage.score,
      triagePriority: triage.priority,
      triageColor: triage.color,
      triageLabel: triage.label,
    }
  }).filter(Boolean) as PatientCard[]
}

/* ââ Mini Avatar SVG ââ */
function MiniAvatar({ vpsColor, size = 36, name, sex }: { vpsColor: string; size?: number; name?: string; sex?: 'male' | 'female' }) {
  const avatarKey = sex === 'male'
    ? (name?.startsWith('Lucas') ? 'avatar-lucas' : 'avatar-noah')
    : (name?.startsWith('Amara') ? 'avatar-amara' : 'avatar-ines')
  const avatarSrc = AVATAR_DATA[avatarKey] || ''
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${vpsColor}18`, border: `2px solid ${vpsColor}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
      boxShadow: `0 0 8px ${vpsColor}20`,
    }}>
      {avatarSrc && (
        <img src={avatarSrc} alt={name || ''} 
          style={{ 
            width: '100%', height: '100%', 
            objectFit: 'cover', objectPosition: 'center 30%',
            display: 'block',
          }} />
      )}
    </div>
  )
}

/* ââ Mini VPS Sparkline ââ */
function VPSSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 100)
  const w = 48, h = 20
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ opacity: 0.7 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * h} r="2" fill={color} />
    </svg>
  )
}

/* ââ Phase Bar ââ */
function PhaseBar({ phase }: { phase: ClinicalPhase }) {
  const p = PHASES[phase]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
      <div style={{
        width: '40px', height: '3px', borderRadius: '2px',
        background: p.color, boxShadow: `0 0 6px ${p.color}40`,
      }} />
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: p.color, fontWeight: 700 }}>{p.label}</span>
    </div>
  )
}

/* ââ Patient Card Row ââ */
function PatientRow({ p }: { p: PatientCard }) {
  const { t } = useLang()
  const vpsColor = p.vps >= 70 ? '#8B5CF6' : p.vps >= 50 ? '#FFA502' : p.vps >= 30 ? '#FFB347' : '#2ED573'
  const hasTriage = !!p.triagePriority
  return (
    <Link href={`/patient/${p.id}/cockpit`} style={{ textDecoration: 'none' }}>
      <div className="card-interactive" style={{
        padding: '14px 18px', borderRadius: 'var(--p-radius-lg)',
        background: 'var(--p-bg-card)',
        border: p.vps >= 70 ? '1px solid rgba(139,92,246,0.15)' : 'var(--p-border)',
        display: 'grid', gridTemplateColumns: hasTriage ? '44px 1fr auto auto auto auto auto auto' : '44px 1fr auto auto auto auto auto',
        alignItems: 'center', gap: '14px',
        boxShadow: p.vps >= 70 ? '0 0 20px rgba(139,92,246,0.05)' : 'none',
        transition: 'all 0.2s',
      }}>
        {/* Avatar */}
        <MiniAvatar vpsColor={vpsColor} size={40} name={p.name} sex={p.sex} />

        {/* Identity + phase */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--p-text)' }}>{p.name}</span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{p.age} · {p.room}</span>
            {p.isDemo && (
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
                padding: '2px 7px', borderRadius: 4,
                background: 'rgba(108,124,255,0.15)', color: '#6C7CFF',
                border: '1px solid rgba(108,124,255,0.3)',
              }}>{t('DÉMO', 'DEMO')}</span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.lastEvent}</div>
          <PhaseBar phase={p.phase} />
        </div>

        {/* Triage badge */}
        {hasTriage && (
          <div style={{
            textAlign: 'center', padding: '4px 10px', borderRadius: 'var(--p-radius-md)',
            background: `${p.triageColor}12`, border: `1px solid ${p.triageColor}25`,
            minWidth: '44px',
          }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: p.triageColor, lineHeight: 1 }}>{p.triagePriority}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: p.triageColor, opacity: 0.7, marginTop: '1px' }}>{p.triageLabel}</div>
          </div>
        )}

        {/* Syndrome */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: 'rgba(108,124,255,0.08)', color: '#6C7CFF',
        }}>{p.syndrome}</span>

        {/* Sparkline */}
        <VPSSparkline data={p.vpsHistory} color={vpsColor} />

        {/* Day */}
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: vpsColor }}>J+{p.hospDay}</span>

        {/* GCS */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: p.gcs <= 8 ? '#8B5CF6' : 'var(--p-text)', lineHeight: 1 }}>{p.gcs}</div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>GCS</div>
        </div>

        {/* VPS */}
        <div style={{
          textAlign: 'center', padding: '6px 12px', borderRadius: 'var(--p-radius-md)',
          background: `${vpsColor}10`, border: `1px solid ${vpsColor}20`, minWidth: '50px',
        }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: vpsColor, lineHeight: 1 }}>{p.vps}</div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: vpsColor, opacity: 0.7 }}>VPS</div>
        </div>
      </div>
    </Link>
  )
}

/* ââ Pulsing Brain Animation ââ */
function PulsingBrain() {
  return (
    <div className="animate-breathe" style={{
      width: '100px', height: '100px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(108,124,255,0.15) 0%, rgba(108,124,255,0.03) 70%, transparent 100%)',
      border: '1px solid rgba(108,124,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 0 40px rgba(108,124,255,0.1), inset 0 0 30px rgba(108,124,255,0.05)',
    }}>
      
    </div>
  )
}

/* ââ Empty State ââ */
function EmptyState({ onDemo, onNew }: { onDemo: () => void; onNew: () => void }) {
  const { t } = useLang()
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <PulsingBrain />

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '8px' }}>
        {t('Aucun patient actif', 'No active patients')}
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
        Lancez l&apos;analyse intelligente pour un nouveau patient ·
        {t('diagnostic différentiel, red flags et parcours clinique en', 'differential diagnosis, red flags and clinical pathway in')} {t('temps réel.', 'real time.')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button onClick={onNew} style={{
          padding: '14px 32px', borderRadius: 'var(--p-radius-lg)',
          background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--p-font-mono)', fontSize: '13px', fontWeight: 700,
          color: 'white', letterSpacing: '0.5px', width: '300px',
          boxShadow: '0 4px 20px rgba(108,124,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
           {t('Analyse intelligente', 'Smart Analysis')}
        </button>
        <button onClick={onDemo} style={{
          padding: '12px 32px', borderRadius: 'var(--p-radius-lg)',
          background: 'var(--p-bg-elevated)',
          border: '1px solid rgba(108,124,255,0.15)', cursor: 'pointer',
          fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 600,
          color: 'var(--p-text-muted)', letterSpacing: '0.3px', width: '300px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>â¶</span> {t('Explorer avec des cas fictifs', 'Explore with demo cases')}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '48px',
        padding: '16px 0', borderTop: '1px solid var(--p-border)',
      }}>
        {[
          { value: '5', label: t('Moteurs IA', 'AI Engines') },
          { value: '59', label: t('Références', 'References') },
          { value: '5', label: t('Pathologies', 'Pathologies') },
          { value: '15', label: t('Cas registre', 'Registry cases') },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: '#6C7CFF', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px',
      }}>
        {[
          { href: '/observatory', label: 'Observatory', icon: 'dna', color: '#2FD1C8' },
          { href: '/neurocore', label: 'NeuroCore', icon: 'brain', color: '#B96BFF' },
          { href: '/cross-pathologie', label: 'Cross-Patho', icon: 'virus', color: '#A78BFA' },
        ].map((link, i) => (
          <Link key={i} href={link.href} style={{
            padding: '8px 16px', borderRadius: 'var(--p-radius-lg)',
            background: `${link.color}08`, border: `1px solid ${link.color}15`,
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 600,
            color: link.color, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Picto name={link.icon} size={12} />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ââ Main ââ */
export default function FileActivePage() {
  const { t } = useLang()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [sortMode, setSortMode] = useState<'triage' | 'vps' | 'jour' | 'phase' | 'gcs' | 'alertes'>('triage')

  const [realPatients, setRealPatients] = useState<PatientCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadPatients() {
      try {
        const dbPatients = await patientService.getActive()
        if (cancelled) return

        const cards: PatientCard[] = []
        for (const p of dbPatients) {
          const loaded = await intakePersistenceService.loadForEngines(p.id)
          if (!loaded || cancelled) continue

          const ps = new PatientState(loaded.patientData)
          runPipeline(ps)
          const vps = ps.vpsResult?.synthesis.score ?? 0
          const vpsHistory = ps.vpsResult?.curve?.curveData?.slice(-6) ?? [vps]
          const triage = computeTriageFromPipeline(ps)

          cards.push({
            id: p.id,
            name: p.display_name,
            age: `${Math.floor(p.age_months / 12)} ans`,
            sex: p.sex,
            syndrome: p.syndrome || 'En évaluation',
            hospDay: p.hosp_day,
            room: p.room || 'Non assigné',
            vps,
            gcs: ps.neuro.gcs,
            critAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
            phase: detectPhase(p.hosp_day, vps),
            lastEvent: ps.neuro.seizureType.includes('refractory') ? 'Status réfractaire en cours'
              : ps.neuro.seizures24h > 3 ? `${ps.neuro.seizures24h} crises/24h`
              : ps.neuro.gcs <= 8 ? 'GCS critique'
              : 'Admis via Analyse Intelligente',
            isDemo: false,
            vpsHistory,
            triageScore: triage.score,
            triagePriority: triage.priority,
            triageColor: triage.color,
            triageLabel: triage.label,
          })
        }

        if (!cancelled) {
          setRealPatients(cards)
          setLoading(false)
        }
      } catch (err) {
        console.error('[FileActive] Erreur chargement:', err)
        if (!cancelled) setLoading(false)
      }
    }
    loadPatients()

    // Subscribe realtime
    const channel = patientService.subscribeToChanges(() => { loadPatients() })
    return () => { cancelled = true; if (channel && typeof channel === 'object' && 'unsubscribe' in channel) { (channel as { unsubscribe: () => void }).unsubscribe() } }
  }, [])
  const demoPatients = useMemo(() => buildDemoPatients(), [])
  const activePatients = showDemo ? [...realPatients, ...demoPatients] : realPatients

  const PHASE_ORDER: Record<ClinicalPhase, number> = { acute: 0, stabilization: 1, monitoring: 2, recovery: 3 }

  const filtered = activePatients
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.syndrome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortMode) {
        case 'triage': {
          const ta = a.triageScore ?? 0
          const tb = b.triageScore ?? 0
          if (ta !== tb) return tb - ta
          return b.vps - a.vps
        }
        case 'vps': return b.vps - a.vps
        case 'jour': return b.hospDay - a.hospDay
        case 'phase': {
          const pa = PHASE_ORDER[a.phase]
          const pb = PHASE_ORDER[b.phase]
          if (pa !== pb) return pa - pb
          return b.vps - a.vps
        }
        case 'gcs': return a.gcs - b.gcs  // lower GCS = more critical = first
        case 'alertes': return b.critAlerts - a.critAlerts
        default: return 0
      }
    })

  const criticalCount = activePatients.filter(p => p.vps >= 70).length
  const warningCount = activePatients.filter(p => p.vps >= 40 && p.vps < 70).length
  const totalAlerts = activePatients.reduce((s, p) => s + p.critAlerts, 0)
  const hasPatients = activePatients.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', padding: '0' }}>

      {/* ââ CONTENT ââ */}
      {!hasPatients ? (
        <EmptyState onDemo={() => setShowDemo(true)} onNew={() => router.push('/patients/intake')} />
      ) : (
        <div style={{ padding: '20px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
            }}>
              <Picto name="microscope" size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('Rechercher un patient...', 'Search patients...')}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'var(--p-font-body)', fontSize: '13px', color: 'var(--p-text)' }}
              />
            </div>
            <button onClick={() => router.push('/patients/intake')} style={{
              padding: '10px 20px', borderRadius: 'var(--p-radius-lg)',
              background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700,
              color: 'white', letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(108,124,255,0.3)',
            }}>{t('+ Analyse intelligente', '+ Smart Analysis')}</button>
          </div>

          {/* Sort options */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {([
              { mode: 'triage' as const, label: 'Triage', icon: 'alert', color: '#8B5CF6' },
              { mode: 'vps' as const, label: 'VPS', icon: 'heart', color: '#6C7CFF' },
              { mode: 'gcs' as const, label: 'GCS', icon: 'brain', color: '#B96BFF' },
              { mode: 'alertes' as const, label: 'Alertes', icon: 'alert', color: '#FFA502' },
              { mode: 'phase' as const, label: 'Phase', icon: 'eeg', color: '#2FD1C8' },
              { mode: 'jour' as const, label: 'Jour', icon: 'clipboard', color: '#2ED573' },
            ]).map(opt => {
              const active = sortMode === opt.mode
              return (
                <button key={opt.mode} onClick={() => setSortMode(opt.mode)} style={{
                  padding: '5px 12px', borderRadius: 'var(--p-radius-full)',
                  background: active ? `${opt.color}15` : 'transparent',
                  border: active ? `1px solid ${opt.color}30` : '1px solid var(--p-border)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: active ? 800 : 600,
                  color: active ? opt.color : 'var(--p-text-dim)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <Picto name={opt.icon} size={10} />
                  {opt.label}
                  {active && <span style={{ fontSize: '7px', opacity: 0.7 }}>â¼</span>}
                </button>
              )
            })}
          </div>

          {totalAlerts > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)',
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <Picto name="alert" size={18} glow glowColor="rgba(139,92,246,0.4)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.5px' }}>
                  {totalAlerts} ALERTE{totalAlerts > 1 ? 'S' : ''} CRITIQUE{totalAlerts > 1 ? 'S' : ''}
                </div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                  {filtered.filter(p => p.critAlerts > 0).map(p => p.name).join(' · ')}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(p => <PatientRow key={p.id} p={p} />)}
          </div>

          {/* Quick tools */}
          <div style={{
            display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap',
          }}>
            {[
              { href: '/neurocore', label: 'NeuroCore', icon: 'brain', color: '#B96BFF' },
              { href: '/case-matching', label: 'Case Matching', icon: 'heart', color: '#A78BFA' },
              { href: '/patients/intake', label: 'Analyse IA', icon: 'brain', color: '#6C7CFF' },
              { href: '/cross-pathologie', label: 'Cross-Patho', icon: 'virus', color: '#FFB347' },
              { href: '/bilan', label: 'Bilan', icon: 'clipboard', color: '#2FD1C8' },
              { href: '/export', label: 'Export', icon: 'shield', color: '#6C7CFF' },
              { href: '/staff', label: 'Experts', icon: 'books', color: '#2ED573' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                padding: '6px 14px', borderRadius: 'var(--p-radius-full)',
                background: `${link.color}08`, border: `1px solid ${link.color}15`,
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600,
                color: link.color, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <Picto name={link.icon} size={11} />
                {link.label}
              </Link>
            ))}
          </div>

          {showDemo && (
            <div style={{
              marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'rgba(108,124,255,0.04)', border: '1px solid rgba(108,124,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
                Mode démo actif · {demoPatients.length} cas fictifs
              </span>
              <button onClick={() => setShowDemo(false)} style={{
                padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
                background: 'rgba(108,124,255,0.08)', border: '1px solid rgba(108,124,255,0.15)',
                cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '9px',
                color: '#6C7CFF', fontWeight: 600,
              }}>{t(t('Masquer la démo', 'Hide demo'), 'Hide demo')}</button>
            </div>
          )}
        </div>
      )}
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:1000 }}><UseCaseButton /></div>
  </div>
  )
}
