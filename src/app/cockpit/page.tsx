'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

// ── Level chip color ──
function levelColor(level: string): string {
  const l = level.toUpperCase()
  if (l.includes('CRITIQUE') || l.includes('URGENTE')) return 'var(--p-critical)'
  if (l.includes('SÉVÈRE') || l.includes('RECOMMANDÉE') || l.includes('PRÉ-CRITIQUE') || l.includes('ÉLEVÉ')) return 'var(--p-warning)'
  if (l.includes('MODÉRÉ') || l.includes('ACTIVE') || l.includes('VIGILANCE')) return 'var(--p-tpe)'
  return 'var(--p-success)'
}

// ── Sparkline mini SVG ──
function Sparkline({ data, color, w = 80, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - mn) / rng) * (h - 4) - 2} r="3" fill={color} />
    </svg>
  )
}

// ── Score Card (engine) ──
function EngineCard({ name, fullName, score, level, color, sparkData, alerts }: {
  name: string; fullName: string; score: number; level: string; color: string; sparkData: number[]; alerts: number
}) {
  const lc = levelColor(level)
  return (
    <div style={{
      background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
      padding: 'var(--p-space-5)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700, color, letterSpacing: '1px' }}>{name}</div>
          <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginTop: '1px' }}>{fullName}</div>
        </div>
        {alerts > 0 && (
          <span style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'var(--p-critical)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700,
          }}>{alerts}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: 'var(--p-text)', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>/100</div>
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>

      <div style={{
        marginTop: '10px', display: 'inline-block',
        padding: '3px 12px', borderRadius: 'var(--p-radius-full)',
        background: `${lc}15`, border: `1px solid ${lc}30`,
        fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: lc,
      }}>{level}</div>
    </div>
  )
}

// ── Vital Param Card ──
function VitalCard({ label, value, unit, icon, isNormal, normalRange }: {
  label: string; value: number | string; unit: string; icon: string; isNormal: boolean; normalRange: string
}) {
  const sc = isNormal ? 'var(--p-success)' : 'var(--p-critical)'
  return (
    <div style={{
      background: 'var(--p-bg-card)', border: `1px solid ${isNormal ? 'var(--p-border-color)' : 'var(--p-critical)'}`,
      borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-4)',
      borderLeft: `3px solid ${sc}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <span style={{
          padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
          background: isNormal ? 'var(--p-success-bg)' : 'var(--p-critical-bg)',
          fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
          color: sc,
        }}>{isNormal ? 'NORMAL' : 'ANORMAL'}</span>
      </div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)' }}>
        {value}<span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)', marginLeft: '4px' }}>{unit}</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '2px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginTop: '2px' }}>N: {normalRange}</div>
    </div>
  )
}

// ── Main ──
export default function CockpitPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const nr = ps.getNormalRanges()
  const age = ps.getAgeGroup()

  // Vital params
  const vitals = [
    { label: 'Fréquence cardiaque', value: ps.hemodynamics.heartRate, unit: 'bpm', icon: '❤️', isNormal: ps.hemodynamics.heartRate >= nr.hrLow && ps.hemodynamics.heartRate <= nr.hrHigh, normalRange: `${nr.hrLow}-${nr.hrHigh}` },
    { label: 'Pression artérielle', value: `${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp}`, unit: 'mmHg', icon: '🩸', isNormal: ps.hemodynamics.sbp >= nr.sbpLow && ps.hemodynamics.sbp <= nr.sbpHigh, normalRange: `${nr.sbpLow}-${nr.sbpHigh}` },
    { label: 'SpO₂', value: ps.hemodynamics.spo2, unit: '%', icon: '💨', isNormal: ps.hemodynamics.spo2 >= 95, normalRange: '95-100' },
    { label: 'Température', value: ps.hemodynamics.temp, unit: '°C', icon: '🌡️', isNormal: ps.hemodynamics.temp >= 36.5 && ps.hemodynamics.temp <= 37.5, normalRange: '36.5-37.5' },
    { label: 'Fréq. respiratoire', value: ps.hemodynamics.respRate, unit: '/min', icon: '🫁', isNormal: ps.hemodynamics.respRate >= 12 && ps.hemodynamics.respRate <= 25, normalRange: '12-25' },
  ]

  // Engines
  const engines = [
    { name: 'VPS', full: 'Vital Prognosis Score', color: 'var(--p-vps)', result: ps.vpsResult },
    { name: 'TDE', full: 'Therapeutic Decision', color: 'var(--p-tde)', result: ps.tdeResult },
    { name: 'PVE', full: 'Pharmacovigilance', color: 'var(--p-pve)', result: ps.pveResult },
    { name: 'EWE', full: 'Early Warning', color: 'var(--p-ewe)', result: ps.eweResult },
    { name: 'TPE', full: 'Therapeutic Prospection', color: 'var(--p-tpe)', result: ps.tpeResult },
  ]

  // Generate pseudo-sparkline data from history
  const makeSparkData = (current: number) => {
    const base = Math.max(0, current - 20)
    return [base + 5, base + 12, base + 8, base + 15, current]
  }

  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  const activeAlerts = ps.alerts.filter(a => a.severity === 'critical')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Cockpit Vital</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 4 — Monitoring continu</span>
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

      {/* Patient Context Bar */}
      <div className={mounted ? 'animate-in' : ''} style={{
        ...card, marginBottom: 'var(--p-space-5)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-6)', flexWrap: 'wrap' }}>
          {[
            { l: 'Âge', v: `${ps.getAgeYears()} ans` },
            { l: 'Poids', v: `${ps.weightKg} kg` },
            { l: 'Groupe', v: age },
            { l: 'Jour hospit.', v: `J${ps.hospDay}` },
            { l: 'GCS', v: `${ps.neuro.gcs}/15` },
            { l: 'Médicaments', v: `${ps.drugs.length}` },
          ].map((x, i) => (
            <div key={i}>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', letterSpacing: '0.5px' }}>{x.l}</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>{x.v}</div>
            </div>
          ))}
        </div>
        {activeAlerts.length > 0 && (
          <div style={{
            padding: '4px 14px', borderRadius: 'var(--p-radius-full)',
            background: 'var(--p-critical)', color: '#fff',
            fontSize: '11px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            {activeAlerts.length} ALERTE{activeAlerts.length > 1 ? 'S' : ''} CRITIQUE{activeAlerts.length > 1 ? 'S' : ''}
          </div>
        )}
      </div>

      {/* Critical Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className={mounted ? 'animate-in stagger-1' : ''} style={{ marginBottom: 'var(--p-space-5)' }}>
          {activeAlerts.slice(0, 3).map((a, i) => (
            <div key={i} style={{
              ...card, marginBottom: '8px',
              borderLeft: '4px solid var(--p-critical)', background: 'var(--p-critical-bg)',
              padding: 'var(--p-space-3) var(--p-space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-critical)' }}>{a.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginLeft: '10px' }}>{a.body}</span>
                </div>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', flexShrink: 0 }}>{a.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5 Engine Score Cards */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>5 MOTEURS IA</div>
      <div className={mounted ? 'animate-in stagger-2' : ''} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--p-space-4)',
        marginBottom: 'var(--p-space-6)',
      }}>
        {engines.map(e => (
          <EngineCard key={e.name}
            name={e.name} fullName={e.full} color={e.color}
            score={e.result?.synthesis.score ?? 0}
            level={e.result?.synthesis.level ?? 'N/A'}
            sparkData={makeSparkData(e.result?.synthesis.score ?? 0)}
            alerts={e.result?.synthesis.alerts.filter(a => a.severity === 'critical').length ?? 0}
          />
        ))}
      </div>

      {/* 5 Vital Parameters */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>5 PARAMÈTRES VITAUX</div>
      <div className={mounted ? 'animate-in stagger-3' : ''} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--p-space-4)',
        marginBottom: 'var(--p-space-6)',
      }}>
        {vitals.map((v, i) => (
          <VitalCard key={i} {...v} />
        ))}
      </div>

      {/* Engine Details Panels */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>DÉTAILS MOTEURS</div>
      <div className={mounted ? 'animate-in stagger-4' : ''} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-6)' }}>
        {/* Semantic Fields (VPS) */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--p-vps)', marginBottom: '12px' }}>VPS — Champs sémantiques</div>
          {ps.vpsResult?.intention.fields.map((f, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{f.name}</span>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: f.color }}>{f.intensity}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--p-dark-4)' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', background: f.color,
                  width: `${f.intensity}%`, transition: 'width 0.8s var(--p-ease)',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{f.interpretation}</div>
            </div>
          ))}
        </div>

        {/* Context & Rules */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--p-tde)', marginBottom: '12px' }}>CONTEXTE & RÈGLES</div>
          {/* Context */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '8px' }}>CONTEXTE VPS (×{ps.vpsResult?.context.contextModifier.toFixed(2)})</div>
            {ps.vpsResult?.context.details.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px', marginBottom: '4px',
                borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)',
              }}>
                <span style={{ fontSize: '14px' }}>{d.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginLeft: 'auto', fontFamily: 'var(--p-font-mono)' }}>{d.detail}</span>
              </div>
            ))}
          </div>
          {/* Rules fired */}
          <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '8px' }}>RÈGLES MÉTIER ACTIVÉES</div>
          {[...(ps.vpsResult?.rules || []), ...(ps.tdeResult?.rules || [])].filter(r => r.message).slice(0, 6).map((r, i) => (
            <div key={i} style={{
              padding: '6px 10px', marginBottom: '4px',
              borderRadius: 'var(--p-radius-md)',
              borderLeft: `3px solid ${r.type === 'guard' ? 'var(--p-critical)' : r.type === 'correction' ? 'var(--p-warning)' : 'var(--p-success)'}`,
              background: 'var(--p-bg-elevated)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--p-text)' }}>{r.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-muted)' }}>{r.message}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginTop: '1px' }}>{r.reference}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns Summary */}
      {ps.vpsResult && ps.vpsResult.intention.patterns.length > 0 && (
        <div className={mounted ? 'animate-in stagger-5' : ''} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>PATTERNS DÉTECTÉS</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[...(ps.vpsResult?.intention.patterns || []), ...(ps.tdeResult?.intention.patterns || [])].map((p, i) => (
              <div key={i} style={{
                padding: '8px 16px', borderRadius: 'var(--p-radius-lg)',
                background: p.confidence >= 0.8 ? 'var(--p-critical-bg)' : 'var(--p-warning-bg)',
                border: `1px solid ${p.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)'}30`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
                    padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
                    background: p.confidence >= 0.8 ? 'var(--p-critical)' : 'var(--p-warning)',
                    color: '#fff',
                  }}>{Math.round(p.confidence * 100)}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '4px' }}>{p.implications}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Outil d'aide à la décision · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
