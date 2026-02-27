'use client'
import { useState, useMemo } from 'react'
import Picto from '@/components/Picto'

const pathologies = [
  { id: 'fires', name: 'FIRES', fullName: 'Febrile Infection-Related Epilepsy Syndrome', color: 'var(--p-critical)', icon: 'alert',
    criteria: ['Fièvre initiale', 'Crises réfractaires >24h', 'Pas de cause structurelle', 'LCR inflammatoire modéré'],
    overlap: ['norse', 'eais'], mortality: '10-20%', sequelae: '70-90% épilepsie chronique' },
  { id: 'eais', name: 'EAIS', fullName: 'Encéphalite Auto-Immune Séropositive', color: 'var(--p-vps)', icon: 'dna',
    criteria: ['Anticorps anti-neuronaux +', 'IRM anormale ou EEG altéré', 'Exclusion cause infectieuse', 'Réponse immunothérapie'],
    overlap: ['fires', 'norse', 'mogad'], mortality: '4-7%', sequelae: '50% déficits cognitifs à 1 an' },
  { id: 'norse', name: 'NORSE', fullName: 'New-Onset Refractory Status Epilepticus', color: 'var(--p-ewe)', icon: 'brain',
    criteria: ['Pas d\'ATCD épileptique', 'Status réfractaire', 'Aucune étiologie retrouvée', 'EEG continu anormal'],
    overlap: ['fires'], mortality: '15-25%', sequelae: '80% épilepsie résiduelle' },
  { id: 'pims', name: 'PIMS', fullName: 'Syndrome Inflammatoire Multisystémique Pédiatrique', color: 'var(--p-tde)', icon: 'heart',
    criteria: ['Post-COVID (2-6 sem)', 'Fièvre >38.5°C ≥3j', 'Atteinte ≥2 organes', 'Marqueurs inflammatoires élevés'],
    overlap: ['mogad'], mortality: '1-2%', sequelae: '20% dysfonction cardiaque résiduelle' },
  { id: 'mogad', name: 'MOGAD', fullName: 'MOG Antibody Disease', color: 'var(--p-tpe)', icon: 'shield',
    criteria: ['Anti-MOG positif', 'Névrite optique ou myélite', 'ADEM récurrente', 'LCR inflammatoire'],
    overlap: ['eais', 'pims'], mortality: '<1%', sequelae: '30% rechutes à 2 ans' },
]

export default function CrossPathologiePage() {
  const [selected, setSelected] = useState<string[]>([])

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

  return (
    <div className="page-enter" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="cycle" size={36} glow glowColor="rgba(47,209,200,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Cross-Pathologie</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Analyse des chevauchements diagnostiques — 5 pathologies</span>
        </div>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-5)' }}>Sélectionnez 2+ pathologies pour visualiser les zones de recouvrement et les diagnostics différentiels.</p>

      {/* Pathology selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-5)' }} className="grid-5-2">
        {pathologies.map(p => {
          const active = selected.includes(p.id)
          return (
            <button key={p.id} onClick={() => toggle(p.id)} className="card-interactive" style={{
              padding: 'var(--p-space-4)', borderRadius: 'var(--p-radius-lg)', cursor: 'pointer', textAlign: 'center',
              border: active ? `2px solid ${p.color}` : 'var(--p-border)',
              background: active ? `${p.color}10` : 'var(--p-bg-card)', transition: 'all 200ms',
            }}>
              <Picto name={p.icon} size={28} glow={active} glowColor={p.color} />
              <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: active ? p.color : 'var(--p-text)', marginTop: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.fullName}</div>
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
