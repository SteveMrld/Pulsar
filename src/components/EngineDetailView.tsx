'use client'
import { useState } from 'react'
import { EngineResult, PatientState, FieldResult } from '@/lib/engines/PatientState'

// ── Mini Sparkline ──
function Spark({ data, color, w = 100, h = 32 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 6) - 3}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - mn) / rng) * (h - 6) - 3}
          r={i === data.length - 1 ? 4 : 2} fill={i === data.length - 1 ? color : `${color}60`} />
      ))}
    </svg>
  )
}

// ── Signal Bar ──
function SignalBar({ name, normalized, rawValue, unit, status, color }: {
  name: string; normalized: number; rawValue: unknown; unit: string; status: string; color: string
}) {
  const sc = status === 'critical' ? 'var(--p-critical)' : status === 'warning' ? 'var(--p-warning)' : status === 'moderate' ? 'var(--p-tpe)' : 'var(--p-success)'
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc, flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--p-text)' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            {rawValue != null ? String(rawValue) : '—'}{unit ? ` ${unit}` : ''}
          </span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: sc, minWidth: '32px', textAlign: 'right' }}>{normalized}%</span>
        </div>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: sc, width: `${normalized}%`, transition: 'width 0.8s var(--p-ease)' }} />
      </div>
    </div>
  )
}

// ── Layer Section ──
function LayerSection({ index, title, color, children, defaultOpen = false }: {
  index: number; title: string; color: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
      marginBottom: 'var(--p-space-4)', overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--p-space-4) var(--p-space-5)', background: 'none', border: 'none',
        borderLeft: `4px solid ${color}`, cursor: 'pointer', color: 'var(--p-text)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '12px', color, flexShrink: 0,
          }}>{index}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{title}</div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>COUCHE {index}</div>
          </div>
        </div>
        <span style={{ color: 'var(--p-text-dim)', transform: open ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
      </button>
      {open && <div style={{ padding: '0 var(--p-space-5) var(--p-space-5)', borderLeft: `4px solid ${color}` }}>{children}</div>}
    </div>
  )
}

// ── Main Component ──
export default function EngineDetailView({ engineName, fullName, color, result, ps }: {
  engineName: string; fullName: string; color: string; result: EngineResult | null; ps: PatientState
}) {
  if (!result) return <div style={{ color: 'var(--p-text-dim)', textAlign: 'center', padding: 'var(--p-space-8)' }}>Aucun résultat moteur</div>

  const { intention, context, rules, curve, synthesis } = result
  const lc = synthesis.score >= 70 ? 'var(--p-critical)' : synthesis.score >= 50 ? 'var(--p-warning)' : synthesis.score >= 30 ? 'var(--p-tpe)' : 'var(--p-success)'

  return (
    <div>
      {/* Synthesis Header */}
      <div style={{
        background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
        padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-5)',
        borderLeft: `4px solid ${color}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>SCORE</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-4xl)', fontWeight: 800, color, lineHeight: 1 }}>
                {synthesis.score}<span style={{ fontSize: 'var(--p-text-base)', color: 'var(--p-text-dim)' }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>NIVEAU</div>
              <div style={{
                display: 'inline-block', padding: '4px 16px', borderRadius: 'var(--p-radius-full)',
                background: `${lc}15`, border: `1px solid ${lc}30`,
                fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px', color: lc,
              }}>{synthesis.level}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>CONTEXTE</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: context.contextModifier > 1.1 ? 'var(--p-warning)' : 'var(--p-text)' }}>
                ×{context.contextModifier.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
              {intention.patterns.length} pattern{intention.patterns.length !== 1 ? 's' : ''}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
              {rules.length} règle{rules.length !== 1 ? 's' : ''}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
              {synthesis.alerts.length} alerte{synthesis.alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* COUCHE 1 — Intention */}
      <LayerSection index={1} title="Intention — Champs sémantiques" color={color} defaultOpen={true}>
        {intention.fields.map((f, fi) => (
          <div key={fi} style={{
            padding: '12px', marginBottom: '10px',
            borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: f.color }} />
                <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{f.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-lg)', color: f.color }}>{f.intensity}%</span>
                <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{f.interpretation}</span>
              </div>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--p-dark-4)', marginBottom: '10px' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: f.color, width: `${f.intensity}%`, transition: 'width 0.8s' }} />
            </div>
            {f.signals.map((s, si) => (
              <SignalBar key={si} name={s.name} normalized={s.normalized} rawValue={s.rawValue} unit={s.unit} status={s.status} color={f.color} />
            ))}
          </div>
        ))}

        {/* Patterns */}
        {intention.patterns.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>PATTERNS DÉTECTÉS</div>
            {intention.patterns.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '10px 14px', marginBottom: '6px',
                borderRadius: 'var(--p-radius-md)',
                background: p.confidence >= 0.8 ? 'var(--p-critical-bg)' : 'var(--p-warning-bg)',
                border: `1px solid ${p.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)'}25`,
              }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 'var(--p-radius-full)', flexShrink: 0,
                  background: p.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)',
                  color: '#fff', fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
                }}>{Math.round(p.confidence * 100)}%</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--p-text-sm)' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.description}</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{p.implications}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LayerSection>

      {/* COUCHE 2 — Contexte */}
      <LayerSection index={2} title={`Contexte — Modificateur ×${context.contextModifier.toFixed(2)}`} color={color}>
        {context.details.length > 0 ? context.details.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', marginBottom: '6px',
            borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)',
          }}>
            <span style={{ fontSize: '16px' }}>{d.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{d.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{d.detail}</div>
            </div>
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
              background: 'var(--p-dark-4)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)',
            }}>{d.type}</span>
          </div>
        )) : (
          <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', padding: '8px 0' }}>Aucun modificateur contextuel actif</div>
        )}
        <div style={{
          marginTop: '10px', padding: '10px 14px', borderRadius: 'var(--p-radius-md)',
          background: context.contextModifier > 1.1 ? 'var(--p-warning-bg)' : 'var(--p-success-bg)',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Résultat : </span>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontWeight: 700,
            color: context.contextModifier > 1.2 ? 'var(--p-warning)' : context.contextModifier > 1 ? 'var(--p-tpe)' : 'var(--p-success)',
          }}>×{context.contextModifier.toFixed(2)}</span>
          <span style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginLeft: '8px' }}>
            {context.contextModifier > 1.2 ? 'Aggravation significative' : context.contextModifier > 1 ? 'Léger ajustement' : 'Pas d\'aggravation'}
          </span>
        </div>
      </LayerSection>

      {/* COUCHE 3 — Règles métier */}
      <LayerSection index={3} title={`Règles métier — ${rules.length} activée${rules.length !== 1 ? 's' : ''}`} color={color}>
        {rules.length > 0 ? rules.map((r, i) => (
          <div key={i} style={{
            padding: '10px 14px', marginBottom: '6px',
            borderRadius: 'var(--p-radius-md)',
            borderLeft: `3px solid ${r.type === 'guard' ? 'var(--p-critical)' : r.type === 'correction' ? 'var(--p-warning)' : 'var(--p-success)'}`,
            background: 'var(--p-bg-elevated)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{
                    padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
                    background: r.type === 'guard' ? 'var(--p-critical-bg)' : r.type === 'correction' ? 'var(--p-warning-bg)' : 'var(--p-success-bg)',
                    fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, textTransform: 'uppercase',
                    color: r.type === 'guard' ? 'var(--p-critical)' : r.type === 'correction' ? 'var(--p-warning)' : 'var(--p-success)',
                  }}>{r.type}</span>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{r.name}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '2px' }}>{r.message}</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', flexShrink: 0, marginLeft: '12px' }}>{r.reference}</span>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', padding: '8px 0' }}>Aucune règle activée</div>
        )}
      </LayerSection>

      {/* COUCHE 4 — Courbe */}
      <LayerSection index={4} title={`Courbe — Trajectoire ${curve.trend}`} color={color}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>INTENSITÉ GLOBALE</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-2xl)', fontWeight: 800, color }}>{curve.globalIntensity}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>TENDANCE</div>
            <span style={{
              padding: '3px 12px', borderRadius: 'var(--p-radius-full)',
              background: curve.trend === 'worsening' || curve.trend === 'escalating' || curve.trend === 'high_risk' ? 'var(--p-critical-bg)' : curve.trend === 'improving' ? 'var(--p-success-bg)' : 'var(--p-bg-elevated)',
              fontSize: '11px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
              color: curve.trend === 'worsening' || curve.trend === 'escalating' || curve.trend === 'high_risk' ? 'var(--p-critical)' : curve.trend === 'improving' ? 'var(--p-success)' : 'var(--p-text-dim)',
            }}>
              {curve.trend === 'worsening' ? '↗ DÉTÉRIORATION' : curve.trend === 'improving' ? '↘ AMÉLIORATION' : curve.trend === 'escalating' ? '↗ ESCALADE' : curve.trend === 'high_risk' ? '⚠ RISQUE ÉLEVÉ' : '→ STABLE'}
            </span>
          </div>
        </div>
        {curve.curveData.length >= 2 && (
          <div style={{ padding: '12px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)' }}>
            <Spark data={curve.curveData} color={color} w={400} h={60} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              {curve.labels.map((lb, i) => (
                <span key={i} style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{lb}</span>
              ))}
            </div>
          </div>
        )}
      </LayerSection>

      {/* Alerts */}
      {synthesis.alerts.length > 0 && (
        <div style={{
          background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
          padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)',
        }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>
            ALERTES {engineName} ({synthesis.alerts.length})
          </div>
          {synthesis.alerts.map((a, i) => (
            <div key={i} style={{
              padding: '8px 14px', marginBottom: '6px',
              borderRadius: 'var(--p-radius-md)',
              borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : a.severity === 'warning' ? 'var(--p-warning)' : 'var(--p-info)'}`,
              background: a.severity === 'critical' ? 'var(--p-critical-bg)' : a.severity === 'warning' ? 'var(--p-warning-bg)' : 'var(--p-info-bg)',
            }}>
              <span style={{ fontWeight: 700, fontSize: '12px', color: a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-text)' }}>{a.title}</span>
              <span style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginLeft: '8px' }}>{a.body}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
