'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import EngineDetailView from '@/components/EngineDetailView'
import { EngineResult } from '@/lib/engines/PatientState'
import Picto from '@/components/Picto'

const ENGINES = [
  { key: 'vpsResult' as const, name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF', icon: 'brain', subtitle: '4 champs sémantiques · 5 patterns · 4 règles métier' },
  { key: 'tdeResult' as const, name: 'TDE', full: 'Therapeutic Decision Engine', color: '#2FD1C8', icon: 'heart', subtitle: 'Arbre décisionnel thérapeutique · 4 lignes' },
  { key: 'pveResult' as const, name: 'PVE', full: 'Paraclinical Validation Engine', color: '#B96BFF', icon: 'blood', subtitle: 'Validation biologique · Cohérence paraclinique' },
  { key: 'eweResult' as const, name: 'EWE', full: 'Early Warning Engine', color: '#FF6B8A', icon: 'thermo', subtitle: 'Détection précoce · Alertes prédictives' },
  { key: 'tpeResult' as const, name: 'TPE', full: 'Therapeutic Prospection Engine', color: '#FFB347', icon: 'lungs', subtitle: 'Projection thérapeutique · Suivi évolutif' },
]

function MiniGauge({ score, color, size = 40 }: { score: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s var(--p-ease)' }} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fill={color}
        fontSize="11" fontWeight="800" fontFamily="var(--p-font-mono)">{score}</text>
    </svg>
  )
}

export default function EnginesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--p-text-dim)' }}>Chargement moteurs…</div>}>
      <EnginesContent />
    </Suspense>
  )
}

function EnginesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')?.toLowerCase()
  const initialTab = ENGINES.findIndex(e => e.name.toLowerCase() === tabParam)

  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0)
  const [scenario, setScenario] = useState('FIRES')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Update tab when URL param changes
  useEffect(() => {
    const idx = ENGINES.findIndex(e => e.name.toLowerCase() === tabParam)
    if (idx >= 0) setActiveTab(idx)
  }, [tabParam])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const engine = ENGINES[activeTab]
  const result = ps[engine.key] as EngineResult | null
  const allScores = ENGINES.map(e => ({ name: e.name, score: (ps[e.key] as EngineResult | null)?.synthesis.score ?? 0, color: e.color }))

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'var(--p-space-4)' }}>
        <Picto name="brain" size={32} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Pipeline BrainCore</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>5 moteurs · 4 couches · Scoring multi-dimensionnel</span>
        </div>
      </div>

      {/* Engine tabs — 5 mini-cards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--p-space-4)', overflowX: 'auto', paddingBottom: '4px' }}>
        {ENGINES.map((e, i) => {
          const score = (ps[e.key] as EngineResult | null)?.synthesis.score ?? 0
          const active = activeTab === i
          return (
            <button key={e.name} onClick={() => setActiveTab(i)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 14px', borderRadius: 'var(--p-radius-lg)',
              border: active ? `2px solid ${e.color}` : '2px solid transparent',
              background: active ? `${e.color}15` : 'var(--p-bg-elevated)',
              cursor: 'pointer', transition: 'all 200ms', minWidth: 'fit-content',
              boxShadow: active ? `0 0 16px ${e.color}30` : 'none',
            }}>
              <MiniGauge score={score} color={e.color} size={36} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px',
                  color: active ? e.color : 'var(--p-text-muted)', letterSpacing: '0.5px',
                }}>{e.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', whiteSpace: 'nowrap' }}>
                  {(ps[e.key] as EngineResult | null)?.synthesis.level ?? '—'}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--p-space-4)', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{
            padding: '4px 14px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? `2px solid ${engine.color}` : 'var(--p-border)',
            background: scenario === k ? `${engine.color}15` : 'var(--p-bg-elevated)',
            color: scenario === k ? engine.color : 'var(--p-text-muted)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Active engine header */}
      <div className="glass-card" style={{
        padding: 'var(--p-space-4)', borderRadius: 'var(--p-radius-xl)',
        borderTop: `3px solid ${engine.color}`, marginBottom: 'var(--p-space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: engine.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'var(--p-font-mono)',
          }}>{engine.name}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>{engine.full}</h2>
            <span style={{ fontSize: 'var(--p-text-xs)', color: engine.color, fontFamily: 'var(--p-font-mono)' }}>{engine.subtitle}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MiniGauge score={result?.synthesis.score ?? 0} color={engine.color} size={56} />
            <div style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: engine.color, marginTop: '2px' }}>
              {result?.synthesis.level ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Engine detail content */}
      <EngineDetailView
        engineName={engine.name}
        fullName={engine.full}
        color={engine.color}
        result={result}
        ps={ps}
      />

      {/* Footer — all scores overview */}
      <div className="accent-line" style={{ margin: 'var(--p-space-5) 0 var(--p-space-3)' }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--p-space-4)', padding: 'var(--p-space-3) 0' }}>
        {allScores.map(s => (
          <div key={s.name} style={{ textAlign: 'center', cursor: 'pointer', opacity: s.name === engine.name ? 1 : 0.5 }}
            onClick={() => setActiveTab(ENGINES.findIndex(e => e.name === s.name))}>
            <MiniGauge score={s.score} color={s.color} size={32} />
            <div style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: s.color, marginTop: '2px' }}>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
