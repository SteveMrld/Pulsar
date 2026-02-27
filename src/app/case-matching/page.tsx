'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

// ── Reference cases database ──
interface RefCase {
  id: string; name: string; age: string; pathology: string; color: string; emoji: string
  outcome: string; summary: string
  features: { label: string; value: string | number; extractor: (ps: PatientState) => number; refValue: number; weight: number }[]
}

const REF_CASES: RefCase[] = [
  {
    id: 'alejandro', name: 'Alejandro R.', age: '6 ans', pathology: 'FIRES', color: 'var(--p-critical)', emoji: '🕯️',
    outcome: 'Décédé (2019-2025) — Séquelles sévères, état de mal réfractaire prolongé',
    summary: 'FIRES typique : fièvre, crises réfractaires J3, GCS 5, échec multi-ligne. Orage cytokinique secondaire.',
    features: [
      { label: 'GCS', value: 5, extractor: ps => ps.neuro.gcs, refValue: 5, weight: 3 },
      { label: 'Crises/24h', value: '15+', extractor: ps => ps.neuro.seizures24h, refValue: 15, weight: 2 },
      { label: 'CRP', value: '145 mg/L', extractor: ps => ps.biology.crp, refValue: 145, weight: 1.5 },
      { label: 'Anticorps', value: 'Négatifs', extractor: ps => ps.csf.antibodies === 'negative' ? 1 : 0, refValue: 1, weight: 2 },
      { label: 'Âge (mois)', value: '72', extractor: ps => ps.ageMonths, refValue: 72, weight: 1 },
      { label: 'Pléiocytose', value: '85 cell/µL', extractor: ps => ps.csf.cells, refValue: 85, weight: 1.5 },
    ],
  },
  {
    id: 'lina', name: 'Lina B.', age: '14 ans', pathology: 'Anti-NMDAR', color: 'var(--p-tde)', emoji: '👧',
    outcome: 'Rémission sous Rituximab — mRS 1 à 6 mois',
    summary: 'Encéphalite anti-NMDAR : troubles psychiatriques, crises focales, Ac anti-NMDAR+ dans LCR.',
    features: [
      { label: 'GCS', value: 11, extractor: ps => ps.neuro.gcs, refValue: 11, weight: 3 },
      { label: 'Anticorps', value: 'NMDAR+', extractor: ps => ps.csf.antibodies === 'nmdar' ? 1 : 0, refValue: 1, weight: 3 },
      { label: 'Pléiocytose', value: '52 cell/µL', extractor: ps => ps.csf.cells, refValue: 52, weight: 1.5 },
      { label: 'Crises/24h', value: 4, extractor: ps => ps.neuro.seizures24h, refValue: 4, weight: 2 },
      { label: 'CRP', value: '8 mg/L', extractor: ps => ps.biology.crp, refValue: 8, weight: 1 },
      { label: 'Âge (mois)', value: '168', extractor: ps => ps.ageMonths, refValue: 168, weight: 1 },
    ],
  },
  {
    id: 'emma', name: 'Emma S.', age: '8 ans', pathology: 'FIRES + Orage', color: 'var(--p-warning)', emoji: '👧',
    outcome: 'Survie avec séquelles modérées — Régime cétogène continu',
    summary: 'FIRES avec orage cytokinique : ferritine >5000, état de mal super-réfractaire, réponse partielle kétamine.',
    features: [
      { label: 'GCS', value: 8, extractor: ps => ps.neuro.gcs, refValue: 8, weight: 3 },
      { label: 'Ferritine', value: '5400 µg/L', extractor: ps => ps.biology.ferritin, refValue: 5400, weight: 2 },
      { label: 'CRP', value: '180 mg/L', extractor: ps => ps.biology.crp, refValue: 180, weight: 1.5 },
      { label: 'Temp', value: '39.8°C', extractor: ps => ps.hemodynamics.temp, refValue: 39.8, weight: 1 },
      { label: 'Crises/24h', value: 8, extractor: ps => ps.neuro.seizures24h, refValue: 8, weight: 2 },
      { label: 'Plaquettes', value: '78 G/L', extractor: ps => ps.biology.platelets, refValue: 78, weight: 1 },
    ],
  },
  {
    id: 'noah', name: 'Noah & Sofia', age: '5 & 10 ans', pathology: 'PIMS/MIS-C', color: 'var(--p-tpe)', emoji: '👦👧',
    outcome: 'Rémission IVIg+Corticos — Suivi cardiaque 6 mois',
    summary: 'PIMS post-COVID : fièvre prolongée, troponine élevée, dysfonction VG, traitement 1ère ligne efficace.',
    features: [
      { label: 'GCS', value: 14, extractor: ps => ps.neuro.gcs, refValue: 14, weight: 1 },
      { label: 'CRP', value: '95 mg/L', extractor: ps => ps.biology.crp, refValue: 95, weight: 1.5 },
      { label: 'Ferritine', value: '850 µg/L', extractor: ps => ps.biology.ferritin, refValue: 850, weight: 1.5 },
      { label: 'Temp', value: '39.5°C', extractor: ps => ps.hemodynamics.temp, refValue: 39.5, weight: 1 },
      { label: 'Plaquettes', value: '120 G/L', extractor: ps => ps.biology.platelets, refValue: 120, weight: 1 },
      { label: 'Âge (mois)', value: '60-120', extractor: ps => ps.ageMonths, refValue: 90, weight: 1 },
    ],
  },
]

// ── Compute similarity (0-100%) ──
function computeSimilarity(ps: PatientState, refCase: RefCase): { total: number; details: { label: string; sim: number }[] } {
  const details = refCase.features.map(f => {
    const patientVal = f.extractor(ps)
    const refVal = f.refValue
    if (refVal === 0 && patientVal === 0) return { label: f.label, sim: 100 }
    if (typeof patientVal === 'number' && typeof refVal === 'number') {
      if (refVal <= 1 && patientVal <= 1) {
        return { label: f.label, sim: patientVal === refVal ? 100 : 0 }
      }
      const diff = Math.abs(patientVal - refVal) / Math.max(refVal, 1)
      return { label: f.label, sim: Math.max(0, Math.round((1 - Math.min(1, diff)) * 100)) }
    }
    return { label: f.label, sim: 0 }
  })
  const totalWeight = refCase.features.reduce((s, f) => s + f.weight, 0)
  const weightedSum = details.reduce((s, d, i) => s + d.sim * refCase.features[i].weight, 0)
  return { total: Math.round(weightedSum / totalWeight), details }
}

// ── Mini Radar ──
function MiniRadar({ data, color, size = 120 }: { data: number[]; color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, R = (size - 30) / 2, n = data.length
  const pt = (i: number, v: number) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: cx + R * (v / 100) * Math.cos(a), y: cy + R * (v / 100) * Math.sin(a) }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[50, 100].map(lv => (
        <polygon key={lv} points={Array.from({ length: n }, (_, i) => pt(i, lv)).map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="var(--p-dark-4)" strokeWidth="1" />
      ))}
      <polygon points={data.map((v, i) => { const p = pt(i, v); return `${p.x},${p.y}` }).join(' ')}
        fill={`${color}18`} stroke={color} strokeWidth="2" />
      {data.map((v, i) => <circle key={i} cx={pt(i, v).x} cy={pt(i, v).y} r="3" fill={color} />)}
    </svg>
  )
}

export default function CaseMatchingPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [expanded, setExpanded] = useState<string | null>(null)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const matches = useMemo(() => {
    return REF_CASES.map(rc => ({ ...rc, similarity: computeSimilarity(ps, rc) })).sort((a, b) => b.similarity.total - a.similarity.total)
  }, [ps])

  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <span style={{ fontSize: '2rem' }}>🔄</span>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Case-Matching</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 2 — Comparaison avec 4 cas documentés</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setExpanded(null) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-info)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-info-bg)' : 'var(--p-bg-card)',
            color: scenario === k ? 'var(--p-info)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Best Match Banner */}
      {matches.length > 0 && (
        <div className={mounted ? 'animate-in' : ''} style={{
          ...card, marginBottom: 'var(--p-space-5)',
          borderLeft: `4px solid ${matches[0].color}`,
          background: `${matches[0].color}08`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>CAS LE PLUS PROCHE</div>
              <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginTop: '2px' }}>
                {matches[0].emoji} {matches[0].name} — {matches[0].pathology}
              </div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginTop: '2px' }}>{matches[0].outcome}</div>
            </div>
            <div style={{
              fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: matches[0].color,
            }}>{matches[0].similarity.total}%</div>
          </div>
        </div>
      )}

      {/* 4 Case Cards */}
      {matches.map((m, mi) => (
        <div key={m.id} className={mounted ? `animate-in stagger-${Math.min(mi + 1, 5)}` : ''} style={{
          ...card, marginBottom: 'var(--p-space-4)',
          borderLeft: `4px solid ${m.color}`,
          opacity: m.similarity.total < 20 ? 0.5 : 1,
        }}>
          <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} style={{
            display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text)', padding: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
                border: mi === 0 ? `2px solid ${m.color}` : 'none',
              }}>{m.emoji}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{m.name} — {m.age}</div>
                <div style={{ fontSize: '11px', color: m.color, fontFamily: 'var(--p-font-mono)' }}>{m.pathology}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-xl)', fontWeight: 800, color: m.color }}>{m.similarity.total}%</div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>similarité</div>
              </div>
              <span style={{ color: 'var(--p-text-dim)', transform: expanded === m.id ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
            </div>
          </button>

          {expanded === m.id && (
            <div style={{ marginTop: 'var(--p-space-4)' }}>
              <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', marginBottom: '12px', padding: '8px 12px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
                {m.summary}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '8px', fontStyle: 'italic' }}>{m.outcome}</div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <MiniRadar data={m.similarity.details.map(d => d.sim)} color={m.color} />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>CRITÈRES DE MATCHING</div>
                  {m.similarity.details.map((d, di) => (
                    <div key={di} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--p-text-muted)', width: '80px', flexShrink: 0 }}>{d.label}</span>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
                        <div style={{ height: '100%', borderRadius: '2px', background: d.sim >= 70 ? 'var(--p-success)' : d.sim >= 40 ? 'var(--p-warning)' : 'var(--p-critical)', width: `${d.sim}%`, transition: 'width 0.8s' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: d.sim >= 70 ? 'var(--p-success)' : d.sim >= 40 ? 'var(--p-warning)' : 'var(--p-critical)', width: '32px', textAlign: 'right' }}>{d.sim}%</span>
                      <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', width: '60px' }}>réf: {m.features[di].value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Case-Matching · 4 cas documentés · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
