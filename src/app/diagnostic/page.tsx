'use client'
import Picto from '@/components/Picto'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import dynamic from 'next/dynamic'

const RChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false })
const RRadar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false })
const RPolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false })
const RPolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false })
const RResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

// ── FIRES Criteria (0-13) ──
const FIRES_CRITERIA = [
  { id: 'age', label: 'Âge 2-12 ans', pts: 1, test: (ps: PatientState) => ps.ageMonths >= 24 && ps.ageMonths <= 144 },
  { id: 'fever', label: 'Épisode fébrile (≥38°C)', pts: 1, test: (ps: PatientState) => ps.hemodynamics.temp >= 38 },
  { id: 'refractory', label: 'Status réfractaire', pts: 2, test: (ps: PatientState) => ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory' },
  { id: 'status', label: 'Status epilepticus (≥30 min)', pts: 1, test: (ps: PatientState) => ps.neuro.seizureDuration >= 30 || ps.neuro.seizureType === 'status' },
  { id: 'gcs', label: 'GCS < 12', pts: 1, test: (ps: PatientState) => ps.neuro.gcs < 12 },
  { id: 'pleio', label: 'Pléiocytose LCR (>5 cell/µL)', pts: 1, test: (ps: PatientState) => ps.csf.cells > 5 },
  { id: 'abneg', label: 'Anticorps négatifs/pending', pts: 1, test: (ps: PatientState) => ps.csf.antibodies === 'negative' || ps.csf.antibodies === 'pending' },
  { id: 'crp', label: 'CRP élevée (>20 mg/L)', pts: 1, test: (ps: PatientState) => ps.biology.crp > 20 },
  { id: 'multi', label: 'Crises multiples (≥5/24h)', pts: 1, test: (ps: PatientState) => ps.neuro.seizures24h >= 5 },
  { id: 'eeg', label: 'EEG anormal (patterns)', pts: 1, test: (ps: PatientState) => ps.neuro.seizureType !== 'none' },
  { id: 'fail', label: 'Échec antiépileptique', pts: 1, test: (ps: PatientState) => ps.treatmentHistory.some(t => t.response === 'none') },
  { id: 'prot', label: 'Protéinorachie élevée', pts: 1, test: (ps: PatientState) => ps.csf.protein > 0.45 },
]

// ── EAIS & PIMS scoring ──
function scoreEAIS(ps: PatientState) {
  const c = [
    { label: 'Encéphalopathie (GCS < 14)', met: ps.neuro.gcs < 14, pts: 2 },
    { label: 'Crises épileptiques', met: ps.neuro.seizures24h > 0, pts: 2 },
    { label: 'Pléiocytose LCR', met: ps.csf.cells > 5, pts: 2 },
    { label: 'Anticorps positifs', met: !['negative', 'pending'].includes(ps.csf.antibodies), pts: 3 },
    { label: 'Anticorps en attente', met: ps.csf.antibodies === 'pending', pts: 1 },
    { label: 'Protéinorachie élevée', met: ps.csf.protein > 0.45, pts: 1 },
    { label: 'Fièvre ≥ 38°C', met: ps.hemodynamics.temp >= 38, pts: 1 },
  ]
  return { score: c.filter(x => x.met).reduce((s, x) => s + x.pts, 0), max: 12, criteria: c }
}
function scorePIMS(ps: PatientState) {
  const c = [
    { label: 'Exposition COVID', met: ps.pims.covidExposure, pts: 2 },
    { label: 'Ferritine > 500 µg/L', met: ps.biology.ferritin > 500, pts: 2 },
    { label: 'D-dimères élevés', met: (ps.pims.dDimers ?? 0) > 0.5, pts: 2 },
    { label: 'Troponine élevée', met: (ps.pims.troponin ?? 0) > 20, pts: 2 },
    { label: 'Pro-BNP élevé', met: (ps.pims.proBNP ?? 0) > 500, pts: 2 },
    { label: 'Atteinte cardiaque', met: ps.pims.cardiacInvolvement, pts: 3 },
    { label: 'Anomalie coronaire', met: ps.pims.coronaryAnomaly, pts: 2 },
    { label: 'Kawasaki-like', met: ps.pims.kawasaki, pts: 1 },
  ]
  return { score: c.filter(x => x.met).reduce((s, x) => s + x.pts, 0), max: 16, criteria: c }
}

// ── CircularGauge ──
function Gauge({ value, max, label, color, size = 130 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const pct = Math.min(1, value / max)
  const r = (size - 16) / 2, circ = 2 * Math.PI * r, off = circ * (1 - pct)
  const lc = pct >= 0.7 ? 'var(--p-critical)' : pct >= 0.5 ? 'var(--p-warning)' : pct >= 0.25 ? color : 'var(--p-success)'
  const lt = pct >= 0.7 ? 'ÉLEVÉ' : pct >= 0.5 ? 'MODÉRÉ' : pct >= 0.25 ? 'INTERMÉD.' : 'FAIBLE'
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={lc} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="gauge-ring"
          style={{ '--gauge-circumference': circ, '--gauge-target': off } as React.CSSProperties} />
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="var(--p-text)" fontSize="22" fontWeight="800" fontFamily="var(--p-font-mono)">{value}</text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="var(--p-text-dim)" fontSize="11" fontFamily="var(--p-font-mono)">/ {max}</text>
      </svg>
      <div style={{ fontSize: '11px', fontWeight: 700, color: lc, marginTop: '2px' }}>{lt}</div>
      <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>{label}</div>
    </div>
  )
}

// ── RadarChart ──
function DiagRadar({ data, labels, colors }: { data: number[]; labels: string[]; colors: string[] }) {
  const chartData = labels.map((l, i) => ({ axis: l, value: data[i], fullMark: 100 }))
  return (
    <div style={{ width: 250, height: 220 }}>
      <RResponsiveContainer width="100%" height="100%">
        <RChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
          <RPolarGrid stroke="var(--p-dark-4)" />
          <RPolarAngleAxis dataKey="axis" tick={{ fill: 'var(--p-text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <RRadar name="Score" dataKey="value" stroke="#6C7CFF" fill="#6C7CFF" fillOpacity={0.15} strokeWidth={2} />
        </RChart>
      </RResponsiveContainer>
    </div>
  )
}

// ── CriteriaAccordion ──
function CriteriaBlock({ title, color, items, expanded, onToggle }: {
  title: string; color: string; items: { label: string; met: boolean; pts: number }[]
  expanded: boolean; onToggle: () => void
}) {
  const metCount = items.filter(x => x.met).length
  return (
    <div style={{
      background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
      padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)',
    }}>
      <button onClick={onToggle} style={{
        display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text)', padding: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '22px', borderRadius: '2px', background: color }} />
          <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color, fontWeight: 700 }}>{metCount}/{items.length}</span>
          <span style={{ color: 'var(--p-text-dim)', transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
        </div>
      </button>
      {expanded && (
        <div style={{ marginTop: 'var(--p-space-4)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {items.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '7px 12px', borderRadius: 'var(--p-radius-md)',
              background: c.met ? `${color}10` : 'transparent',
              border: `1px solid ${c.met ? color + '25' : 'var(--p-dark-4)'}`,
              opacity: c.met ? 1 : 0.45,
            }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: c.met ? color : 'var(--p-dark-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: c.met ? '#fff' : 'var(--p-text-dim)', flexShrink: 0,
              }}>{c.met ? '✓' : '–'}</span>
              <span style={{ flex: 1, fontSize: 'var(--p-text-sm)', color: c.met ? 'var(--p-text)' : 'var(--p-text-dim)' }}>{c.label}</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: c.met ? color : 'var(--p-text-dim)' }}>+{c.pts}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ──
export default function DiagnosticPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [expanded, setExpanded] = useState<string | null>('fires')
  useEffect(() => setMounted(true), [])

  const computed = useMemo(() => {
    const ps = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(ps)
    const fc = FIRES_CRITERIA.map(c => ({ label: c.label, met: c.test(ps), pts: c.pts }))
    const firesScore = fc.filter(c => c.met).reduce((s, c) => s + c.pts, 0)
    return { ps, fc, firesScore, eais: scoreEAIS(ps), pims: scorePIMS(ps) }
  }, [scenario])

  const { ps, fc, firesScore, eais, pims } = computed
  const tdeP = ps.tdeResult?.intention.patterns || []
  const top = tdeP[0]
  const radarD = [
    Math.round((firesScore / 13) * 100),
    Math.round((eais.score / eais.max) * 100),
    Math.round((pims.score / pims.max) * 100),
    ps.vpsResult?.synthesis.score || 0,
    ps.tdeResult?.synthesis.score || 0,
  ]
  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)' }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="dna" size={40} glow glowColor="#2FD1C8" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Diagnostic IA</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 2 — Scoring FIRES / EAIS / PIMS</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-card)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Pattern Banner */}
      {top && (
        <div className={mounted ? 'animate-in' : ''} style={{
          ...card, marginBottom: 'var(--p-space-5)',
          borderLeft: `4px solid ${top.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)'}`,
          background: top.confidence >= 0.8 ? 'var(--p-critical-bg)' : 'var(--p-warning-bg)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>PATTERN DOMINANT</div>
              <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginTop: '2px' }}>{top.name}</div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginTop: '4px' }}>{top.implications}</div>
            </div>
            <div style={{
              padding: '6px 16px', borderRadius: 'var(--p-radius-full)',
              background: top.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)',
              color: '#fff', fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: 'var(--p-text-sm)',
            }}>{Math.round(top.confidence * 100)}%</div>
          </div>
        </div>
      )}

      {/* 3 Gauges */}
      <div className={mounted ? 'animate-in' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)' }}>
        <div style={{ ...card, textAlign: 'center', borderTop: '3px solid var(--p-critical)' }}><Gauge value={firesScore} max={13} label="FIRES" color="var(--p-critical)" /></div>
        <div style={{ ...card, textAlign: 'center', borderTop: '3px solid var(--p-tde)' }}><Gauge value={eais.score} max={eais.max} label="EAIS" color="var(--p-tde)" /></div>
        <div style={{ ...card, textAlign: 'center', borderTop: '3px solid var(--p-warning)' }}><Gauge value={pims.score} max={pims.max} label="PIMS" color="var(--p-warning)" /></div>
      </div>

      {/* Radar + Hypotheses */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)' }}>
        <div className={mounted ? 'animate-in stagger-1' : ''} style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>RADAR DIAGNOSTIQUE</div>
          <DiagRadar data={radarD} labels={['FIRES', 'EAIS', 'PIMS', 'VPS', 'TDE']}
            colors={['var(--p-critical)', 'var(--p-tde)', 'var(--p-warning)', 'var(--p-vps)', 'var(--p-tde)']} />
        </div>
        <div className={mounted ? 'animate-in stagger-2' : ''} style={card}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '14px' }}>HYPOTHÈSES CLASSÉES</div>
          {[
            { tag: 'FIRES', s: firesScore, m: 13, c: 'var(--p-critical)', desc: 'Febrile Infection-Related Epilepsy Syndrome' },
            { tag: 'EAIS', s: eais.score, m: eais.max, c: 'var(--p-tde)', desc: 'Encéphalite Auto-Immune Suspectée' },
            { tag: 'PIMS', s: pims.score, m: pims.max, c: 'var(--p-warning)', desc: 'Pediatric Inflammatory Multisystem Syndrome' },
          ].sort((a, b) => (b.s / b.m) - (a.s / a.m)).map((h, i) => {
            const pct = Math.round((h.s / h.m) * 100)
            return (
              <div key={h.tag} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', marginBottom: i < 2 ? '10px' : 0,
                borderRadius: 'var(--p-radius-lg)',
                background: i === 0 ? `${h.c}10` : 'transparent',
                border: i === 0 ? `1px solid ${h.c}30` : 'var(--p-border)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `${h.c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: h.c, fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-base)', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{h.tag}</span>
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: h.c, fontSize: 'var(--p-text-sm)' }}>{h.s}/{h.m}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', margin: '2px 0 6px' }}>{h.desc}</div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: h.c, width: `${pct}%`, transition: 'width 1s' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Criteria Accordions */}
      <CriteriaBlock title="Critères FIRES (0-13)" color="var(--p-critical)" items={fc} expanded={expanded === 'fires'} onToggle={() => setExpanded(expanded === 'fires' ? null : 'fires')} />
      <CriteriaBlock title="Critères EAIS" color="var(--p-tde)" items={eais.criteria} expanded={expanded === 'eais'} onToggle={() => setExpanded(expanded === 'eais' ? null : 'eais')} />
      <CriteriaBlock title="Critères PIMS" color="var(--p-warning)" items={pims.criteria} expanded={expanded === 'pims'} onToggle={() => setExpanded(expanded === 'pims' ? null : 'pims')} />

      {/* TDE Patterns */}
      {tdeP.length > 0 && (
        <div className={mounted ? 'animate-in stagger-4' : ''} style={{ ...card, marginBottom: 'var(--p-space-4)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>PATTERNS TDE DÉTECTÉS</div>
          {tdeP.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '8px 14px', marginBottom: i < tdeP.length - 1 ? '6px' : 0,
              borderRadius: 'var(--p-radius-md)', background: 'var(--p-tde-dim)',
            }}>
              <span style={{
                padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                background: p.confidence >= 0.8 ? 'var(--p-tde)' : 'var(--p-dark-5)',
                color: p.confidence >= 0.8 ? '#fff' : 'var(--p-tde)',
                fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700,
              }}>{Math.round(p.confidence * 100)}%</span>
              <div>
                <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{p.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Outil d'aide à la décision · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
