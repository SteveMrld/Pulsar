'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

// ── Known interaction pairs for the matrix ──
const INTERACTION_DB = [
  { a: 'Valproate', b: 'Méropénème', severity: 'critical' as const, mechanism: 'Chute VPA -66 à -88% en 24h — inhibition acylpeptide hydrolase', action: 'Switch LEV, dosage VPA urgent', ref: 'Spriet 2007' },
  { a: 'Midazolam', b: 'Fluconazole', severity: 'warning' as const, mechanism: 'Inhibition CYP3A4 → midazolam ×200-400%', action: 'Réduire midazolam 50-75%', ref: 'Pharmacopée' },
  { a: 'Propofol', b: '> 48h', severity: 'warning' as const, mechanism: 'PRIS (rhabdomyolyse, acidose, hyperkaliémie)', action: 'CPK/lactates/TG q12h', ref: 'Bray 1998' },
  { a: 'Aminoside', b: 'Vancomycine', severity: 'warning' as const, mechanism: 'Néphrotoxicité additive', action: 'Dosage sérique, éviter >5j combiné', ref: 'Consensus réa péd.' },
  { a: 'Tocilizumab', b: 'Héparine', severity: 'warning' as const, mechanism: 'Normalise CRP → masque infection + risque hémorragique', action: 'Fibrinogène q24h', ref: 'Guidelines PIMS' },
  { a: 'Rituximab', b: 'Méthylprednisolone', severity: 'info' as const, mechanism: 'Double immunosuppression — infections opportunistes', action: 'Prophylaxie Bactrim, monitoring CD4', ref: 'Guidelines NMDARE' },
  { a: 'Cyclophosphamide', b: 'Corticoïdes', severity: 'warning' as const, mechanism: 'Myélosuppression + immunosuppression cumulée', action: 'NFS J7-J14, MESNA', ref: 'BNFc' },
  { a: 'IVIg', b: 'Dysfonction cardiaque', severity: 'info' as const, mechanism: 'Surcharge volumique chez patient PIMS', action: 'Débit lent, FEVG', ref: 'Feldstein 2020' },
]

const sevColor = (s: string) => s === 'critical' ? 'var(--p-critical)' : s === 'warning' ? 'var(--p-warning)' : 'var(--p-info)'
const sevLabel = (s: string) => s === 'critical' ? 'CRITIQUE' : s === 'warning' ? 'ATTENTION' : 'INFO'

export default function PharmacovigilancePage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('CYTOKINE')
  const [selectedInteraction, setSelectedInteraction] = useState<number | null>(null)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const pveResult = ps.pveResult!
  const detectedRule = pveResult.rules.find(r => r.adjustment?.detectedInteractions)
  const detectedInteractions = (detectedRule?.adjustment?.detectedInteractions as any[] || [])
  const patterns = pveResult.intention.patterns
  const score = pveResult.synthesis.score
  const level = pveResult.synthesis.level
  const lc = score >= 75 ? 'var(--p-critical)' : score >= 50 ? 'var(--p-warning)' : score >= 25 ? 'var(--p-tpe)' : 'var(--p-success)'

  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <span style={{ fontSize: '2rem' }}>🛡️</span>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Pharmacovigilance</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-pve)', fontFamily: 'var(--p-font-mono)' }}>Phase 3 — Interactions médicamenteuses · PVE Engine</span>
        </div>
      </div>

      {/* Scenarios */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setSelectedInteraction(null) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-pve)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-pve-dim)' : 'var(--p-bg-card)',
            color: scenario === k ? 'var(--p-pve)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* PVE Score Header */}
      <div className={mounted ? 'animate-in' : ''} style={{
        ...card, marginBottom: 'var(--p-space-5)', borderLeft: '4px solid var(--p-pve)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>PVE SCORE</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: 'var(--p-pve)' }}>{score}<span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)' }}>/100</span></div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>NIVEAU</div>
            <div style={{ padding: '3px 14px', borderRadius: 'var(--p-radius-full)', background: `${lc}15`, color: lc, fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px' }}>{level}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>MÉDICAMENTS</div>
            <div style={{ fontWeight: 700, color: 'var(--p-text)' }}>{ps.drugs.length} actifs</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>INTERACTIONS</div>
            <div style={{ fontWeight: 700, color: detectedInteractions.length > 0 ? 'var(--p-critical)' : 'var(--p-success)' }}>{detectedInteractions.length} détectée{detectedInteractions.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Active Drugs Grid */}
      <div className={mounted ? 'animate-in stagger-1' : ''} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>MÉDICAMENTS ACTIFS</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ps.drugs.map((d, i) => {
            const involved = detectedInteractions.some((inter: any) =>
              [...inter.drugs, ...(inter.also || [])].some((n: string) => d.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(d.name.toLowerCase()))
            )
            return (
              <span key={i} style={{
                padding: '6px 14px', borderRadius: 'var(--p-radius-lg)',
                background: involved ? 'var(--p-critical-bg)' : 'var(--p-bg-elevated)',
                border: `1px solid ${involved ? 'var(--p-critical)' : 'var(--p-border-color)'}`,
                fontSize: 'var(--p-text-sm)', fontWeight: involved ? 700 : 500,
                color: involved ? 'var(--p-critical)' : 'var(--p-text)',
              }}>{involved && '⚠ '}{d.name}</span>
            )
          })}
        </div>
      </div>

      {/* Detected Interactions */}
      {detectedInteractions.length > 0 && (
        <div className={mounted ? 'animate-in stagger-2' : ''} style={{ marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>INTERACTIONS DÉTECTÉES</div>
          {detectedInteractions.map((inter: any, i: number) => (
            <div key={i} style={{
              ...card, marginBottom: '10px',
              borderLeft: `4px solid ${sevColor(inter.severity)}`,
              cursor: 'pointer',
              background: selectedInteraction === i ? `${sevColor(inter.severity)}08` : 'var(--p-bg-card)',
            }} onClick={() => setSelectedInteraction(selectedInteraction === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                      background: sevColor(inter.severity), color: '#fff',
                      fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                    }}>{sevLabel(inter.severity)}</span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{inter.drugs.join(' + ')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--p-text)' }}>Mécanisme :</strong> {inter.mechanism}
                  </div>
                  {selectedInteraction === i && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
                      <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                        <strong style={{ color: sevColor(inter.severity) }}>Action recommandée :</strong>
                        <span style={{ marginLeft: '6px', color: 'var(--p-text)' }}>{inter.action}</span>
                      </div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Réf: {inter.reference}</div>
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--p-text-dim)', fontSize: '12px', transform: selectedInteraction === i ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patterns */}
      {patterns.length > 0 && (
        <div className={mounted ? 'animate-in stagger-3' : ''} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>PATTERNS PVE</div>
          {patterns.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '10px 14px', marginBottom: '8px',
              borderRadius: 'var(--p-radius-md)', background: 'var(--p-pve-dim)',
            }}>
              <span style={{
                padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                background: p.confidence >= 0.7 ? 'var(--p-pve)' : 'var(--p-dark-5)',
                color: p.confidence >= 0.7 ? '#fff' : 'var(--p-pve)',
                fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, flexShrink: 0,
              }}>{Math.round(p.confidence * 100)}%</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--p-text-sm)' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{p.description}</div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{p.implications}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interaction Reference Matrix */}
      <div className={mounted ? 'animate-in stagger-4' : ''} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>BASE D'INTERACTIONS RÉFÉRENCÉES</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['Méd. A', 'Méd. B', 'Sévérité', 'Mécanisme', 'Réf.'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--p-dark-4)',
                    fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700, letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INTERACTION_DB.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--p-dark-4)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.a}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.b}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                      background: sevColor(row.severity), color: '#fff',
                      fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                    }}>{sevLabel(row.severity)}</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--p-text-muted)', maxWidth: '280px' }}>{row.mechanism}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{row.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semantic Fields */}
      <div className={mounted ? 'animate-in stagger-5' : ''} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>CHAMPS SÉMANTIQUES PVE</div>
        {pveResult.intention.fields.map((f, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>{f.name}</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: f.color, fontSize: '12px' }}>{f.intensity}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--p-dark-4)', marginBottom: '6px' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: f.color, width: `${f.intensity}%`, transition: 'width 0.8s' }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{f.interpretation}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Pharmacovigilance · PVE Engine · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
