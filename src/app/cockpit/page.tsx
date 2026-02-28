'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import dynamic from 'next/dynamic'
import Silhouette from '@/components/Silhouette'
import SilhouetteNeon from '@/components/SilhouetteNeon'
import Picto from '@/components/Picto'

const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false })
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false })
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

function levelColor(level: string): string {
  const l = level.toUpperCase()
  if (l.includes('CRITIQUE') || l.includes('URGENTE')) return 'var(--p-critical)'
  if (l.includes('SÉVÈRE') || l.includes('RECOMMANDÉE') || l.includes('PRÉ-CRITIQUE') || l.includes('ÉLEVÉ')) return 'var(--p-warning)'
  if (l.includes('MODÉRÉ') || l.includes('ACTIVE') || l.includes('VIGILANCE')) return 'var(--p-tpe)'
  return 'var(--p-success)'
}

// ── Animated Circular Gauge ──
function CircularGauge({ score, color, size = 80, label }: { score: number; color: string; size?: number; label: string }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="gauge-ring" style={{ '--gauge-circumference': c, '--gauge-target': offset } as React.CSSProperties} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="animate-number" style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: `${size * 0.28}px`, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{label}</span>
      </div>
    </div>
  )
}

// ── Mini Sparkline ──
function Sparkline({ data, color, w = 80, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /><circle cx={w} cy={h - ((data[data.length - 1] - mn) / rng) * (h - 4) - 2} r="3" fill={color} /></svg>
}

export default function CockpitPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => { const p = new PatientState(DEMO_PATIENTS[scenario].data); runPipeline(p); return p }, [scenario])
  const nr = ps.getNormalRanges()

  const engines = [
    { name: 'VPS', full: 'Vital Prognosis', color: '#6C7CFF', result: ps.vpsResult },
    { name: 'TDE', full: 'Therapeutic Decision', color: '#2FD1C8', result: ps.tdeResult },
    { name: 'PVE', full: 'Pharmacovigilance', color: '#B96BFF', result: ps.pveResult },
    { name: 'EWE', full: 'Early Warning', color: '#FF6B8A', result: ps.eweResult },
    { name: 'TPE', full: 'Therapeutic Prosp.', color: '#FFB347', result: ps.tpeResult },
  ]

  const radarData = engines.map(e => ({ engine: e.name, score: e.result?.synthesis.score ?? 0, fullMark: 100 }))
  const makeSparkData = (current: number) => { const b = Math.max(0, current - 20); return [b + 5, b + 12, b + 8, b + 15, current] }

  const vitals = [
    { l: 'FC', v: ps.hemodynamics.heartRate, u: 'bpm', icon: 'heart', ok: ps.hemodynamics.heartRate >= nr.hrLow && ps.hemodynamics.heartRate <= nr.hrHigh, nr: `${nr.hrLow}-${nr.hrHigh}` },
    { l: 'TA', v: `${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp}`, u: 'mmHg', icon: 'blood', ok: ps.hemodynamics.sbp >= nr.sbpLow && ps.hemodynamics.sbp <= nr.sbpHigh, nr: `${nr.sbpLow}-${nr.sbpHigh}` },
    { l: 'SpO₂', v: ps.hemodynamics.spo2, u: '%', icon: 'lungs', ok: ps.hemodynamics.spo2 >= 95, nr: '95-100' },
    { l: 'T°', v: ps.hemodynamics.temp, u: '°C', icon: 'thermo', ok: ps.hemodynamics.temp >= 36.5 && ps.hemodynamics.temp <= 37.5, nr: '36.5-37.5' },
    { l: 'FR', v: ps.hemodynamics.respRate, u: '/min', icon: 'lungs', ok: ps.hemodynamics.respRate >= 12 && ps.hemodynamics.respRate <= 25, nr: '12-25' },
  ]

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }
  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')

  // VPS field intensities for silhouette
  const vpsFields = ps.vpsResult?.intention?.fields ?? []
  const getFieldIntensity = (name: string) => vpsFields.find(f => f.name.toLowerCase().includes(name))?.intensity ?? 0

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="eeg" size={40} glow glowColor="#6C7CFF" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Cockpit Vital</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 4 — Monitoring continu · 5 moteurs × 4 couches</span>
        </div>
      </div>

      {/* Scenario */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} className="hover-lift" style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-lg)', border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)', background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-elevated)', color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>

      {/* Critical Alert Banner */}
      {critAlerts.length > 0 && (
        <div className="animate-toast animate-glow-crit" style={{ ...card, marginBottom: 'var(--p-space-4)', background: 'var(--p-critical-bg)', borderColor: 'var(--p-critical)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 14px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-critical)', color: '#fff', fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '11px' }}>{critAlerts.length} ALERTE{critAlerts.length > 1 ? 'S' : ''}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-critical)' }}>{critAlerts[0]?.title}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{critAlerts[0]?.source}</span>
        </div>
      )}

      {/* Patient Context */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, marginBottom: 'var(--p-space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-6)', flexWrap: 'wrap' }}>
          {[
            { l: 'Âge', v: `${ps.getAgeYears()} ans` }, { l: 'Poids', v: `${ps.weightKg} kg` },
            { l: 'Jour', v: `J${ps.hospDay}` }, { l: 'GCS', v: `${ps.neuro.gcs}/15` },
            { l: 'Crises', v: `${ps.neuro.seizures24h}/24h` }, { l: 'Drugs', v: `${ps.drugs.length}` },
          ].map((x, i) => (
            <div key={i}>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{x.l}</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: SilhouetteNeon + Radar + Engines */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 'var(--p-space-5)', marginBottom: 'var(--p-space-5)' }} className="grid-2-1">

        {/* Left: Neon Silhouette with vital overlays */}
        <div className={mounted ? 'animate-in stagger-1' : ''}>
          <SilhouetteNeon
            sex={ps.sex === 'female' ? 'F' : 'M'}
            vpsScore={ps.vpsResult?.synthesis.score ?? 0}
            vitals={[
              { label: 'NEURO', icon: '🧠', value: `GCS: ${ps.neuro.gcs}/15 · Crises: ${ps.neuro.seizures24h}/24h`, color: '#6C7CFF',
                severity: ps.neuro.gcs <= 8 ? 2 : ps.neuro.gcs <= 12 ? 1 : 0 },
              { label: 'CARDIO', icon: '❤️', value: `FC: ${ps.hemodynamics.heartRate} bpm · TA: ${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp}`, color: '#FF6B8A',
                severity: ps.hemodynamics.heartRate > 140 ? 2 : ps.hemodynamics.heartRate > 120 ? 1 : 0 },
              { label: 'RESP', icon: '🫁', value: `SpO₂: ${ps.hemodynamics.spo2}% · FR: ${ps.hemodynamics.respRate}/min`, color: '#2FD1C8',
                severity: ps.hemodynamics.spo2 < 92 ? 2 : ps.hemodynamics.spo2 < 95 ? 1 : 0 },
              { label: 'INFLAM', icon: '🔥', value: `CRP: ${ps.biology.crp} mg/L · Ferritine: ${ps.biology.ferritin}`, color: '#FFB347',
                severity: ps.biology.crp > 100 ? 2 : ps.biology.crp > 20 ? 1 : 0 },
              { label: 'TEMP', icon: '🌡️', value: `${ps.hemodynamics.temp}°C`, color: '#B96BFF',
                severity: ps.hemodynamics.temp >= 39 ? 2 : ps.hemodynamics.temp >= 38 ? 1 : 0 },
            ]}
          />
        </div>

        {/* Right: Radar + Engine Cards */}
        <div>
          {/* Radar Chart */}
          <div className={`glass-card ${mounted ? 'animate-in stagger-2' : ''}`} style={{ ...card, marginBottom: 'var(--p-space-4)', height: '220px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>RADAR 5 MOTEURS</div>
            {mounted && (
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                  <PolarGrid stroke="var(--p-dark-4)" />
                  <PolarAngleAxis dataKey="engine" tick={{ fill: 'var(--p-text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Radar name="Score" dataKey="score" stroke="#6C7CFF" fill="#6C7CFF" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Engine Score Cards */}
          <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {engines.map((e, i) => {
              const score = e.result?.synthesis.score ?? 0
              const level = e.result?.synthesis.level ?? '—'
              const alerts = e.result?.synthesis.alerts?.length ?? 0
              return (
                <div key={e.name} className={`glass-card ${mounted ? 'animate-in' : ''} hover-lift`} style={{ ...card, padding: '12px', position: 'relative', animationDelay: `${(i + 3) * 80}ms`, cursor: 'default' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: e.color, borderRadius: '12px 12px 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: e.color, letterSpacing: '1px' }}>{e.name}</span>
                    {alerts > 0 && <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--p-critical)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>{alerts}</span>}
                  </div>
                  <CircularGauge score={score} color={e.color} size={60} label={e.name} />
                  <div style={{ marginTop: '6px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: `${levelColor(level)}15`, fontSize: '8px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: levelColor(level), display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{level}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className={`${mounted ? 'animate-in stagger-4' : ''}`} style={{ marginBottom: 'var(--p-space-5)' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>PARAMÈTRES VITAUX</div>
        <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {vitals.map((v, i) => (
            <div key={i} className="glass-card hover-lift" style={{ ...card, padding: '12px', borderLeft: `3px solid ${v.ok ? 'var(--p-success)' : 'var(--p-critical)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Picto name={v.icon} size={22} glow={!v.ok} glowColor={v.ok ? undefined : 'rgba(255,107,138,0.6)'} />
                <span style={{ padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: v.ok ? 'var(--p-success-bg)' : 'var(--p-critical-bg)', fontSize: '8px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: v.ok ? 'var(--p-success)' : 'var(--p-critical)' }}>{v.ok ? 'OK' : '!'}</span>
              </div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-xl)', fontWeight: 800 }}>{v.v}<span style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginLeft: '2px' }}>{v.u}</span></div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{v.l}</div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>N: {v.nr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* VPS Semantic Fields */}
      {ps.vpsResult && (
        <div className={`glass-card ${mounted ? 'animate-in stagger-5' : ''}`} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>CHAMPS SÉMANTIQUES VPS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {vpsFields.map((f, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', borderLeft: `3px solid ${f.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px', color: f.color }}>{f.intensity}%</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)', overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ height: '100%', borderRadius: '2px', background: f.color, '--target-width': `${f.intensity}%` } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {ps.alerts.length > 0 && (
        <div className={`glass-card ${mounted ? 'animate-in stagger-6' : ''}`} style={{ ...card }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>ALERTES ({ps.alerts.length})</div>
          {ps.alerts.slice(0, 8).map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: 'var(--p-bg-elevated)' }}>
              <span style={{ padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)', color: '#fff', fontSize: '8px', fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>{a.severity === 'critical' ? 'CRIT' : 'WARN'}</span>
              <span style={{ fontWeight: 600, fontSize: '11px', flex: 1 }}>{a.title}</span>
              <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{a.source}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>PULSAR V15 — Cockpit Vital · 5 moteurs × 4 couches · Ne se substitue pas au jugement clinique</div>
    </div>
  )
}
