'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

// ── Therapeutic Lines Data ──
interface TherapyItem {
  drug: string
  dose: (w: number) => string
  route: string
  duration: string
  monitoring: string[]
}

interface TherapeuticLine {
  line: number
  title: string
  color: string
  condition: string
  reference: string
  items: TherapyItem[]
}

const LINES: TherapeuticLine[] = [
  {
    line: 1, title: 'Immunothérapie 1ère ligne', color: 'var(--p-success)',
    condition: 'Initiation immédiate si suspicion neuro-inflammatoire',
    reference: 'Wickström 2022 / Nosadini 2021',
    items: [
      {
        drug: 'Méthylprednisolone IV', dose: w => `${Math.round(w * 30)} mg/j`, route: 'IV',
        duration: '3-5 jours', monitoring: ['Glycémie', 'Pression artérielle', 'Comportement'],
      },
      {
        drug: 'Immunoglobulines IV (IgIV)', dose: w => `${(w * 0.4).toFixed(1)} g/j × 5j (total ${Math.round(w * 2)}g)`,
        route: 'IV', duration: '5 jours', monitoring: ['Fonction rénale', 'Réaction perfusion', 'Céphalées'],
      },
    ],
  },
  {
    line: 2, title: 'Immunomodulateur + Régime cétogène', color: 'var(--p-tde)',
    condition: 'Échec 1ère ligne après 3-5 jours',
    reference: 'Sheikh 2023 / Koh 2021',
    items: [
      {
        drug: 'Rituximab', dose: w => `375 mg/m²/sem × 4 semaines`,
        route: 'IV', duration: '4 semaines', monitoring: ['CD20/CD19', 'Immunoglobulines sériques', 'Infections'],
      },
      {
        drug: 'Cyclophosphamide', dose: w => `750 mg/m² × 1 dose`,
        route: 'IV', duration: 'Dose unique', monitoring: ['NFS', 'Infections', 'Fonction gonadique'],
      },
      {
        drug: 'Plasmaphérèse', dose: () => '5-7 séances',
        route: 'Extracorporel', duration: '10-14 jours', monitoring: ['Coagulation', 'Hypotension', 'Calcium'],
      },
      {
        drug: 'Régime cétogène', dose: () => 'Ratio 3:1',
        route: 'Entéral', duration: 'Continu', monitoring: ['Cétonémie/cétonurie', 'Bilan lipidique', 'Croissance'],
      },
    ],
  },
  {
    line: 3, title: 'Escalade — 3ème ligne', color: 'var(--p-warning)',
    condition: 'Échec 2ème ligne ou détérioration rapide',
    reference: 'Costagliola 2022 / Shrestha 2023',
    items: [
      {
        drug: 'Tocilizumab', dose: w => `${Math.round(w * 8)} mg (8 mg/kg)`,
        route: 'IV', duration: 'Mensuel', monitoring: ['CRP/IL-6', 'Bilan hépatique', 'NFS'],
      },
      {
        drug: 'Anakinra', dose: w => `${Math.round(w * 3)} mg/j (2-4 mg/kg/j)`,
        route: 'SC', duration: 'Quotidien', monitoring: ['NFS', 'Infections', 'Site injection'],
      },
      {
        drug: 'Bortezomib', dose: () => '1.3 mg/m² J1,J4,J8,J11',
        route: 'SC/IV', duration: 'Cycle 21j', monitoring: ['Neuropathie', 'Plaquettes', 'Fonction rénale'],
      },
    ],
  },
  {
    line: 4, title: 'Expérimental / Compassionnel', color: 'var(--p-critical)',
    condition: 'Résistance à toutes les lignes conventionnelles',
    reference: 'Publications de cas — Usage compassionnel',
    items: [
      {
        drug: 'Hypothermie thérapeutique', dose: () => '33-35°C',
        route: 'Physique', duration: '24-72h', monitoring: ['Température', 'Coagulation', 'Rythme cardiaque'],
      },
      {
        drug: 'Kétamine + Sulfate de magnésium', dose: w => `Kétamine ${Math.round(w * 2)}-${Math.round(w * 5)} mg/h`,
        route: 'IV continu', duration: 'Variable', monitoring: ['Sédation', 'TA', 'Hallucinations'],
      },
    ],
  },
]

// ── Active Line Indicator ──
function getActiveLine(ps: PatientState): number {
  if (!ps.tdeResult) return 1
  const level = ps.tdeResult.synthesis.level
  if (level.includes('3ÈME') || level.includes('URGENTE')) return 3
  if (level.includes('2ÈME') || level.includes('RECOMMANDÉE') || level.includes('ESCALADE')) return 2
  return 1
}

// ── Escalation Arrow ──
function EscalationArrow({ from, to, active }: { from: number; to: number; active: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '4px 0', opacity: active ? 1 : 0.3,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}>
        <div style={{
          width: '2px', height: '16px',
          background: active ? 'var(--p-warning)' : 'var(--p-dark-4)',
        }} />
        <div style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
          borderTop: `8px solid ${active ? 'var(--p-warning)' : 'var(--p-dark-4)'}`,
        }} />
        {active && (
          <span style={{
            fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-warning)',
            fontWeight: 700, letterSpacing: '0.5px',
          }}>ESCALADE</span>
        )}
      </div>
    </div>
  )
}

// ── Main ──
export default function RecommandationsPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [expandedLine, setExpandedLine] = useState<number | null>(null)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const activeLine = getActiveLine(ps)
  const w = ps.weightKg
  const recs = ps.tdeResult?.synthesis.recommendations || []
  const tdeLevel = ps.tdeResult?.synthesis.level || 'N/A'
  const tdeScore = ps.tdeResult?.synthesis.score || 0

  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <span style={{ fontSize: '2rem' }}>💊</span>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Recommandations</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 3 — 4 lignes thérapeutiques · Escalade progressive</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setExpandedLine(null) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-card)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* TDE Summary Bar */}
      <div className={mounted ? 'animate-in' : ''} style={{
        ...card, marginBottom: 'var(--p-space-5)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        borderLeft: `4px solid var(--p-tde)`,
      }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>TDE SCORE</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-tde)' }}>{tdeScore}<span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)' }}>/100</span></div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>DÉCISION</div>
            <div style={{ fontWeight: 700, color: 'var(--p-text)' }}>{tdeLevel}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>LIGNE ACTIVE</div>
            <div style={{ fontWeight: 700, color: LINES[activeLine - 1].color }}>{activeLine}ère/ème ligne</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>POIDS</div>
            <div style={{ fontWeight: 700, color: 'var(--p-text)' }}>{w} kg</div>
          </div>
        </div>
        {ps.vpsResult && (
          <div style={{
            padding: '4px 14px', borderRadius: 'var(--p-radius-full)',
            background: 'var(--p-vps-dim)', border: '1px solid var(--p-vps)',
            fontSize: '11px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-vps)',
          }}>VPS {ps.vpsResult.synthesis.score}/100</div>
        )}
      </div>

      {/* TDE Recommendations */}
      {recs.length > 0 && (
        <div className={mounted ? 'animate-in stagger-1' : ''} style={{ marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>RECOMMANDATIONS TDE ENGINE</div>
          {recs.map((r, i) => (
            <div key={i} style={{
              ...card, marginBottom: '8px',
              borderLeft: `4px solid ${r.priority === 'urgent' ? 'var(--p-critical)' : r.priority === 'high' ? 'var(--p-warning)' : 'var(--p-info)'}`,
              background: r.priority === 'urgent' ? 'var(--p-critical-bg)' : 'var(--p-bg-card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                      background: r.priority === 'urgent' ? 'var(--p-critical)' : 'var(--p-warning)',
                      color: '#fff', fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>{r.priority}</span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{r.title}</span>
                  </div>
                  <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>{r.body}</div>
                </div>
                {r.reference && (
                  <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', flexShrink: 0 }}>{r.reference}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Therapeutic Lines */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>4 LIGNES THÉRAPEUTIQUES</div>

      {LINES.map((line, li) => {
        const isActive = activeLine >= line.line
        const isCurrent = activeLine === line.line
        const isExpanded = expandedLine === line.line

        return (
          <div key={line.line}>
            {li > 0 && <EscalationArrow from={li} to={li + 1} active={activeLine > li} />}
            <div className={mounted ? `animate-in stagger-${Math.min(li + 2, 5)}` : ''} style={{
              ...card,
              opacity: isActive ? 1 : 0.45,
              borderLeft: `4px solid ${line.color}`,
              transition: 'all 300ms var(--p-ease)',
              ...(isCurrent ? { boxShadow: `0 0 20px ${line.color}20` } : {}),
            }}>
              {/* Line Header */}
              <button onClick={() => setExpandedLine(isExpanded ? null : line.line)} style={{
                display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text)', padding: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isActive ? `${line.color}20` : 'var(--p-dark-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-lg)',
                    color: isActive ? line.color : 'var(--p-text-dim)',
                    border: isCurrent ? `2px solid ${line.color}` : 'none',
                  }}>L{line.line}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{line.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{line.condition}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCurrent && (
                    <span style={{
                      padding: '3px 12px', borderRadius: 'var(--p-radius-full)',
                      background: line.color, color: '#fff',
                      fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                    }}>ACTIVE</span>
                  )}
                  <span style={{ color: 'var(--p-text-dim)', transform: isExpanded ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ marginTop: 'var(--p-space-5)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '8px' }}>
                    Réf: {line.reference}
                  </div>

                  {line.items.map((item, ii) => (
                    <div key={ii} style={{
                      padding: '14px 16px', marginBottom: '8px',
                      borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)',
                      border: 'var(--p-border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>{item.drug}</span>
                          <span style={{
                            marginLeft: '8px', padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
                            background: 'var(--p-dark-4)', fontSize: '10px', fontFamily: 'var(--p-font-mono)',
                            color: 'var(--p-text-dim)',
                          }}>{item.route}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{item.duration}</span>
                      </div>

                      {/* Dosage */}
                      <div style={{
                        padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
                        background: `${line.color}08`, border: `1px solid ${line.color}20`,
                        marginBottom: '8px',
                      }}>
                        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: '2px' }}>POSOLOGIE ({w} kg)</div>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: line.color, fontSize: 'var(--p-text-sm)' }}>
                          {item.dose(w)}
                        </div>
                      </div>

                      {/* Monitoring */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>MONITORING:</span>
                        {item.monitoring.map((m, mi) => (
                          <span key={mi} style={{
                            padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
                            background: 'var(--p-bg-card)', border: 'var(--p-border)',
                            fontSize: '10px', color: 'var(--p-text-muted)',
                          }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* MOGAD Warning */}
      {ps.tdeResult?.rules.some(r => r.name.includes('MOGAD')) && (
        <div className={mounted ? 'animate-in' : ''} style={{
          ...card, marginTop: 'var(--p-space-5)',
          borderLeft: '4px solid var(--p-critical)', background: 'var(--p-critical-bg)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--p-critical)', marginBottom: '4px' }}>⚠️ Contre-indication MOGAD</div>
          <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>
            Cyclophosphamide NON recommandé dans MOGAD — Préférer Rituximab (Banwell 2023 / Bilodeau 2024)
          </div>
        </div>
      )}

      {/* Treatment History */}
      {ps.treatmentHistory.length > 0 && (
        <div className={mounted ? 'animate-in stagger-5' : ''} style={{ ...card, marginTop: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>HISTORIQUE THÉRAPEUTIQUE</div>
          {ps.treatmentHistory.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '8px 12px', marginBottom: '6px',
              borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: t.response === 'none' ? 'var(--p-critical)' : t.response === 'partial' ? 'var(--p-warning)' : 'var(--p-success)',
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, fontSize: 'var(--p-text-sm)', fontWeight: 600 }}>{t.treatment}</span>
              <span style={{ fontSize: '11px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{t.period}</span>
              <span style={{
                padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                background: t.response === 'none' ? 'var(--p-critical-bg)' : t.response === 'partial' ? 'var(--p-warning-bg)' : 'var(--p-success-bg)',
                color: t.response === 'none' ? 'var(--p-critical)' : t.response === 'partial' ? 'var(--p-warning)' : 'var(--p-success)',
              }}>
                {t.response === 'none' ? 'ÉCHEC' : t.response === 'partial' ? 'PARTIEL' : t.response === 'good' ? 'BON' : 'COMPLET'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Outil d'aide à la décision · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
