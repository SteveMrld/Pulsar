'use client'
import { useState, useMemo, useEffect } from 'react'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

const pathologies = [
  { id: 'fires', name: 'FIRES', fullName: 'Febrile Infection-Related Epilepsy Syndrome', color: 'var(--p-critical)', icon: 'alert',
    criteria: ['Fièvre initiale', 'Crises réfractaires >24h', 'Pas de cause structurelle', 'LCR inflammatoire modéré'],
    overlap: ['norse', 'eais'], mortality: '10-20%', sequelae: '70-90% épilepsie chronique',
    markers: (ps: PatientState) => {
      let s = 0
      if (ps.hemodynamics.temp >= 38) s += 25
      if (ps.neuro.seizures24h >= 3) s += 25
      if (ps.biology.crp > 10 && ps.biology.crp < 100) s += 25
      if (ps.neuro.seizureType === 'generalized_tonic_clonic' || ps.neuro.seizureType === 'status' || ps.neuro.seizureType === 'refractory_status') s += 25
      return s
    }
  },
  { id: 'eais', name: 'EAIS', fullName: 'Encéphalite Auto-Immune Séropositive', color: 'var(--p-vps)', icon: 'dna',
    criteria: ['Anticorps anti-neuronaux +', 'IRM anormale ou EEG altéré', 'Exclusion cause infectieuse', 'Réponse immunothérapie'],
    overlap: ['fires', 'norse', 'mogad'], mortality: '4-7%', sequelae: '50% déficits cognitifs à 1 an',
    markers: (ps: PatientState) => {
      let s = 0
      if (['nmdar','mog','lgi1','caspr2','gaba_b','other_positive'].includes(ps.csf.antibodies)) s += 40
      if (ps.csf.antibodies === 'pending') s += 20
      if (ps.neuro.seizures24h > 0) s += 20
      if (ps.biology.crp > 5) s += 20
      return s
    }
  },
  { id: 'norse', name: 'NORSE', fullName: 'New-Onset Refractory Status Epilepticus', color: 'var(--p-ewe)', icon: 'brain',
    criteria: ['Pas d\'ATCD épileptique', 'Status réfractaire', 'Aucune étiologie retrouvée', 'EEG continu anormal'],
    overlap: ['fires'], mortality: '15-25%', sequelae: '80% épilepsie résiduelle',
    markers: (ps: PatientState) => {
      let s = 0
      if (ps.neuro.seizureDuration > 30) s += 35
      if (ps.neuro.seizures24h >= 5) s += 25
      if (ps.neuro.gcs <= 10) s += 20
      if (ps.csf.antibodies === 'negative') s += 20
      return s
    }
  },
  { id: 'pims', name: 'PIMS', fullName: 'Syndrome Inflammatoire Multisystémique Pédiatrique', color: 'var(--p-tde)', icon: 'heart',
    criteria: ['Post-COVID (2-6 sem)', 'Fièvre >38.5°C ≥3j', 'Atteinte ≥2 organes', 'Marqueurs inflammatoires élevés'],
    overlap: ['mogad'], mortality: '1-2%', sequelae: '20% dysfonction cardiaque résiduelle',
    markers: (ps: PatientState) => {
      let s = 0
      if (ps.hemodynamics.temp >= 38.5) s += 20
      if (ps.biology.crp > 100) s += 25
      if (ps.biology.ferritin > 500) s += 25
      if (ps.hemodynamics.heartRate > 130) s += 15
      if (ps.biology.platelets < 150) s += 15
      return s
    }
  },
  { id: 'mogad', name: 'MOGAD', fullName: 'MOG Antibody Disease', color: 'var(--p-tpe)', icon: 'shield',
    criteria: ['Anti-MOG positif', 'Névrite optique ou myélite', 'ADEM récurrente', 'LCR inflammatoire'],
    overlap: ['eais', 'pims'], mortality: '<1%', sequelae: '30% rechutes à 2 ans',
    markers: (ps: PatientState) => {
      let s = 0
      if (['nmdar','mog','lgi1','caspr2','gaba_b','other_positive'].includes(ps.csf.antibodies)) s += 30
      if (ps.csf.cells > 10) s += 25
      if (ps.csf.protein > 0.5) s += 25
      if (ps.biology.crp < 50) s += 20
      return s
    }
  },
]

export default function CrossPathologiePage() {
  const [selected, setSelected] = useState<string[]>([])
  const [scenario, setScenario] = useState('FIRES')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  // Compute match scores for each pathology
  const matchScores = useMemo(() => {
    return pathologies.map(p => ({ id: p.id, score: p.markers(ps) }))
  }, [ps])

  const bestMatch = matchScores.reduce((a, b) => a.score > b.score ? a : b)

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const overlaps = useMemo(() => {
    if (selected.length < 2) return []
    const results: { a: string; b: string }[] = []
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const pa = pathologies.find(p => p.id === selected[i])
        if (pa?.overlap.includes(selected[j])) {
          results.push({ a: selected[i], b: selected[j] })
        }
      }
    }
    return results
  }, [selected])

  const selectedPaths = pathologies.filter(p => selected.includes(p.id))
  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="cycle" size={36} glow glowColor="rgba(47,209,200,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Cross-Pathologie</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Analyse des chevauchements diagnostiques · Pipeline connecté</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setSelected([]) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Patient Match Banner */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{
        ...card, marginBottom: 'var(--p-space-5)',
        borderLeft: `4px solid ${pathologies.find(p => p.id === bestMatch.id)?.color || 'var(--p-vps)'}`,
      }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>COMPATIBILITÉ PIPELINE</div>
        <div style={{ display: 'flex', gap: 'var(--p-space-4)', flexWrap: 'wrap' }}>
          {matchScores.sort((a, b) => b.score - a.score).map(ms => {
            const p = pathologies.find(x => x.id === ms.id)!
            const isBest = ms.id === bestMatch.id
            return (
              <div key={ms.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: 'var(--p-radius-lg)',
                background: isBest ? `${p.color}15` : 'var(--p-bg-elevated)',
                border: isBest ? `2px solid ${p.color}` : 'var(--p-border)',
              }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, color: p.color, fontSize: '14px' }}>{ms.score}%</span>
                <span style={{ fontSize: '11px', fontWeight: isBest ? 700 : 500, color: isBest ? p.color : 'var(--p-text-muted)' }}>{p.name}</span>
                {isBest && <span style={{ fontSize: '9px', padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: p.color, color: '#fff', fontWeight: 700 }}>BEST</span>}
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-4)' }}>Sélectionnez 2+ pathologies pour visualiser les zones de recouvrement et les diagnostics différentiels.</p>

      {/* Pathology selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-5)' }} className="grid-5-2">
        {pathologies.map(p => {
          const active = selected.includes(p.id)
          const ms = matchScores.find(m => m.id === p.id)!
          return (
            <button key={p.id} onClick={() => toggle(p.id)} className="card-interactive" style={{
              padding: 'var(--p-space-4)', borderRadius: 'var(--p-radius-lg)', cursor: 'pointer', textAlign: 'center',
              border: active ? `2px solid ${p.color}` : 'var(--p-border)',
              background: active ? `${p.color}10` : 'var(--p-bg-elevated)', transition: 'all 200ms',
            }}>
              <Picto name={p.icon} size={28} glow={active} glowColor={p.color} />
              <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: active ? p.color : 'var(--p-text)', marginTop: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.fullName}</div>
              <div style={{ marginTop: '6px', height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
                <div style={{ height: '100%', borderRadius: '2px', background: p.color, width: `${ms.score}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: p.color, marginTop: '4px' }}>{ms.score}%</div>
            </button>
          )
        })}
      </div>

      {/* Comparison table */}
      {selectedPaths.length >= 2 && (
        <div className="glass-card" style={{ padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)' }}>
          <h2 style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-vps)', marginBottom: 'var(--p-space-4)' }}>Comparaison — {selectedPaths.map(p => p.name).join(' vs ')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--p-text-xs)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: 'var(--p-border)', color: 'var(--p-text-dim)', fontWeight: 600 }}>Critère</th>
                  {selectedPaths.map(p => (
                    <th key={p.id} style={{ textAlign: 'center', padding: '8px 12px', borderBottom: `2px solid ${p.color}`, color: p.color, fontWeight: 700 }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', color: 'var(--p-text-muted)', fontWeight: 600 }}>Compatibilité patient</td>
                  {selectedPaths.map(p => {
                    const ms = matchScores.find(m => m.id === p.id)!
                    return (
                      <td key={p.id} style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, color: p.color, fontSize: '16px' }}>{ms.score}%</span>
                      </td>
                    )
                  })}
                </tr>
                {['Mortalité', 'Séquelles'].map(row => (
                  <tr key={row}>
                    <td style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', color: 'var(--p-text-muted)', fontWeight: 600 }}>{row}</td>
                    {selectedPaths.map(p => (
                      <td key={p.id} style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', textAlign: 'center', color: 'var(--p-text)', fontFamily: 'var(--p-font-mono)' }}>
                        {row === 'Mortalité' ? p.mortality : p.sequelae}
                      </td>
                    ))}
                  </tr>
                ))}
                {Array.from({ length: Math.max(...selectedPaths.map(p => p.criteria.length)) }).map((_, ci) => (
                  <tr key={ci}>
                    <td style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', color: 'var(--p-text-muted)' }}>Critère {ci + 1}</td>
                    {selectedPaths.map(p => (
                      <td key={p.id} style={{ padding: '8px 12px', borderBottom: 'var(--p-border)', textAlign: 'center', color: p.criteria[ci] ? 'var(--p-text)' : 'var(--p-text-dim)' }}>
                        {p.criteria[ci] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overlap alerts */}
      {overlaps.length > 0 && (
        <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderLeft: '3px solid var(--p-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-3)' }}>
            <Picto name="warning" size={20} glow glowColor="rgba(255,179,71,0.5)" />
            <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-warning)' }}>Zones de recouvrement détectées</span>
          </div>
          {overlaps.map((o, i) => {
            const pa = pathologies.find(p => p.id === o.a)!
            const pb = pathologies.find(p => p.id === o.b)!
            return (
              <div key={i} style={{ padding: '8px 14px', borderRadius: 'var(--p-radius-md)', background: 'rgba(255,179,71,0.08)', marginBottom: '6px', fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>
                <span style={{ fontWeight: 700, color: pa.color }}>{pa.name}</span>
                <span> ↔ </span>
                <span style={{ fontWeight: 700, color: pb.color }}>{pb.name}</span>
                <span> — Diagnostic différentiel critique. Les anticorps spécifiques et l&apos;imagerie orientent le diagnostic final.</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {selected.length < 2 && (
        <div style={{ textAlign: 'center', padding: 'var(--p-space-8)', color: 'var(--p-text-dim)' }}>
          <Picto name="cycle" size={48} />
          <div style={{ marginTop: 'var(--p-space-3)', fontSize: 'var(--p-text-sm)' }}>Sélectionnez au moins 2 pathologies pour comparer</div>
        </div>
      )}
    </div>
  )
}
