'use client'
import Picto from '@/components/Picto';
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import dynamic from 'next/dynamic'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const RespContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

function simulateDay(baseKey: string, day: number): PatientState {
  const base = JSON.parse(JSON.stringify(DEMO_PATIENTS[baseKey].data))
  const isSevere = baseKey === 'FIRES' || baseKey === 'CYTOKINE'
  const factor = isSevere ? (day <= 2 ? 1.1 : day <= 5 ? 0.95 : 0.85) : (day <= 2 ? 0.9 : day <= 5 ? 0.75 : 0.6)
  if (day > 0) {
    base.neuro.gcs = Math.min(15, Math.max(3, Math.round(base.neuro.gcs + (isSevere ? (day <= 2 ? -1 : day <= 5 ? 1 : 2) : (day * 0.5)))))
    base.neuro.seizures24h = Math.max(0, Math.round(base.neuro.seizures24h * factor))
    base.biology.crp = Math.max(1, Math.round(base.biology.crp * factor))
    base.biology.ferritin = Math.max(10, Math.round(base.biology.ferritin * (factor + 0.05)))
    base.hemodynamics.temp = Math.max(36.5, +(base.hemodynamics.temp * (0.95 + day * 0.005)).toFixed(1))
    base.hospDay = day
  }
  const ps = new PatientState(base)
  runPipeline(ps)
  return ps
}

function Delta({ current, previous, inverse = false }: { current: number; previous: number; inverse?: boolean }) {
  const diff = current - previous
  const isGood = inverse ? diff < 0 : diff > 0
  if (diff === 0) return <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>= 0</span>
  return <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: isGood ? 'var(--p-success)' : 'var(--p-critical)' }}>{diff > 0 ? '↑' : '↓'} {Math.abs(diff)}</span>
}

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 80, h = 24, mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />{data.map((v, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - mn) / rng) * (h - 4) - 2} r={i === data.length - 1 ? 3 : 1.5} fill={color} />)}</svg>
}

const CHECKPOINTS = [
  { day: 0, label: 'J0', title: 'Admission', color: 'var(--p-text-dim)' },
  { day: 2, label: 'J+2', title: 'Première évaluation', color: 'var(--p-info)' },
  { day: 5, label: 'J+5', title: 'Réévaluation thérapeutique', color: 'var(--p-tde)' },
  { day: 7, label: 'J+7', title: 'Bilan de la semaine', color: 'var(--p-tpe)' },
]

export default function SuiviPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [activeDay, setActiveDay] = useState(2)
  useEffect(() => setMounted(true), [])

  const snapshots = useMemo(() => CHECKPOINTS.map(cp => ({ ...cp, ps: simulateDay(scenario, cp.day) })), [scenario])
  const j0 = snapshots[0].ps
  const current = snapshots.find(s => s.day === activeDay)!
  const previous = snapshots[snapshots.findIndex(s => s.day === activeDay) - 1] || snapshots[0]
  const vpsH = snapshots.map(s => s.ps.vpsResult?.synthesis.score ?? 0)
  const tdeH = snapshots.map(s => s.ps.tdeResult?.synthesis.score ?? 0)
  const pveH = snapshots.map(s => s.ps.pveResult?.synthesis.score ?? 0)

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="chart" size={36} glow />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Suivi J+2/5/7</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-tpe)', fontFamily: 'var(--p-font-mono)' }}>Phase 4 — Points d'étape structurés</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-lg)', border: scenario === k ? '2px solid var(--p-tpe)' : 'var(--p-border)', background: scenario === k ? 'var(--p-tpe-dim)' : 'var(--p-bg-elevated)', color: scenario === k ? 'var(--p-tpe)' : 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>

      {/* Timeline Nav */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, marginBottom: 'var(--p-space-5)', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '2px', background: 'var(--p-dark-4)' }} />
        {CHECKPOINTS.map(cp => (
          <button key={cp.day} onClick={() => setActiveDay(cp.day)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activeDay === cp.day ? cp.color : 'var(--p-bg-elevated)', border: `2px solid ${activeDay === cp.day ? cp.color : 'var(--p-dark-4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: activeDay === cp.day ? '#fff' : 'var(--p-text-dim)', transition: 'all 200ms' }}>{cp.label}</div>
            <span style={{ fontSize: '10px', color: activeDay === cp.day ? 'var(--p-text)' : 'var(--p-text-dim)', fontWeight: activeDay === cp.day ? 700 : 400 }}>{cp.title}</span>
          </button>
        ))}
      </div>

      {/* Engine Scores */}
      <div className={mounted ? 'animate-in stagger-1' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)' }}>
        {[
          { name: 'VPS', color: 'var(--p-vps)', history: vpsH, result: current.ps.vpsResult, prevResult: previous.ps.vpsResult, j0Result: j0.vpsResult },
          { name: 'TDE', color: 'var(--p-tde)', history: tdeH, result: current.ps.tdeResult, prevResult: previous.ps.tdeResult, j0Result: j0.tdeResult },
          { name: 'PVE', color: 'var(--p-pve)', history: pveH, result: current.ps.pveResult, prevResult: previous.ps.pveResult, j0Result: j0.pveResult },
        ].map(eng => {
          const score = eng.result?.synthesis.score ?? 0
          const prevScore = eng.prevResult?.synthesis.score ?? 0
          const j0Score = eng.j0Result?.synthesis.score ?? 0
          return (
            <div key={eng.name} className="glass-card" style={{ ...card, borderTop: `3px solid ${eng.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{eng.name}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: eng.color }}>{score}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>vs préc.</div>
                  <Delta current={score} previous={prevScore} inverse />
                  <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>vs J0: <Delta current={score} previous={j0Score} inverse /></div>
                </div>
              </div>
              <MiniSpark data={eng.history} color={eng.color} />
              <div style={{ marginTop: '6px', padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', display: 'inline-block', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{eng.result?.synthesis.level}</div>
            </div>
          )
        })}
      </div>

      {/* Evolution Chart (Recharts) */}
      {mounted && (
        <div className="glass-card animate-in stagger-2" style={{ ...card, marginBottom: 'var(--p-space-5)', height: '220px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>ÉVOLUTION SCORES J0 → J+7</div>
          <RespContainer width="100%" height={170}>
            <LineChart data={CHECKPOINTS.map((cp, i) => ({ name: cp.label, VPS: vpsH[i], TDE: tdeH[i], PVE: pveH[i] }))} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--p-dark-4)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--p-text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--p-text-dim)', fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: 'var(--p-bg-elevated)', border: 'var(--p-border)', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="VPS" stroke="#6C7CFF" strokeWidth={2} dot={{ r: 4, fill: '#6C7CFF' }} />
              <Line type="monotone" dataKey="TDE" stroke="#2FD1C8" strokeWidth={2} dot={{ r: 4, fill: '#2FD1C8' }} />
              <Line type="monotone" dataKey="PVE" stroke="#B96BFF" strokeWidth={2} dot={{ r: 4, fill: '#B96BFF' }} />
            </LineChart>
          </RespContainer>
        </div>
      )}

      {/* Clinical Parameters */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-2' : ''}`} style={{ ...card, marginBottom: 'var(--p-space-5)' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>PARAMÈTRES CLINIQUES — {current.label}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {[
            { label: 'GCS', v: current.ps.neuro.gcs, p: previous.ps.neuro.gcs, j: j0.neuro.gcs, u: '/15', inv: false },
            { label: 'Crises/24h', v: current.ps.neuro.seizures24h, p: previous.ps.neuro.seizures24h, j: j0.neuro.seizures24h, u: '', inv: true },
            { label: 'CRP', v: current.ps.biology.crp, p: previous.ps.biology.crp, j: j0.biology.crp, u: ' mg/L', inv: true },
            { label: 'Ferritine', v: current.ps.biology.ferritin, p: previous.ps.biology.ferritin, j: j0.biology.ferritin, u: ' µg/L', inv: true },
            { label: 'T°', v: current.ps.hemodynamics.temp, p: previous.ps.hemodynamics.temp, j: j0.hemodynamics.temp, u: '°C', inv: true },
            { label: 'SpO₂', v: current.ps.hemodynamics.spo2, p: previous.ps.hemodynamics.spo2, j: j0.hemodynamics.spo2, u: '%', inv: false },
            { label: 'FC', v: current.ps.hemodynamics.heartRate, p: previous.ps.hemodynamics.heartRate, j: j0.hemodynamics.heartRate, u: ' bpm', inv: true },
            { label: 'Médicaments', v: current.ps.drugs.length, p: previous.ps.drugs.length, j: j0.drugs.length, u: '', inv: true },
          ].map((x, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>{x.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: 'var(--p-text-lg)', color: 'var(--p-text)' }}>{x.v}{x.u}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                  <Delta current={x.v} previous={x.p} inverse={x.inv} />
                  <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>J0: {x.j}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Assessment */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-3' : ''}`} style={{ ...card }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>ÉVALUATION RÉPONSE THÉRAPEUTIQUE</div>
        {(() => {
          const vps0 = j0.vpsResult?.synthesis.score ?? 0
          const vpsCur = current.ps.vpsResult?.synthesis.score ?? 0
          const delta = vpsCur - vps0
          const ratio = vps0 > 0 ? Math.round(((vps0 - vpsCur) / vps0) * 100) : 0
          const r = ratio >= 50 ? { label: 'BONNE RÉPONSE', color: 'var(--p-success)', detail: `Réduction VPS de ${ratio}%`, action: 'Maintien traitement. IRM contrôle si non fait.' }
            : ratio >= 20 ? { label: 'RÉPONSE PARTIELLE', color: 'var(--p-warning)', detail: `Réduction VPS de ${ratio}%`, action: 'Réévaluer à J+5. Considérer escalade si plateau.' }
            : delta > 0 ? { label: 'DÉTÉRIORATION', color: 'var(--p-critical)', detail: `Aggravation VPS +${delta} pts`, action: 'Escalade thérapeutique urgente. RCP si 3ème ligne.' }
            : { label: 'STABILISATION', color: 'var(--p-tpe)', detail: `Variation VPS ${delta} pts`, action: 'Surveillance rapprochée. Réévaluer 48h.' }
          return (
            <div style={{ padding: '14px 18px', borderRadius: 'var(--p-radius-lg)', borderLeft: `4px solid ${r.color}`, background: `${r.color}08` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ padding: '3px 14px', borderRadius: 'var(--p-radius-full)', background: r.color, color: '#fff', fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '11px' }}>{r.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--p-text-muted)' }}>{r.detail}</span>
              </div>
              <div style={{ fontSize: '12px' }}><strong style={{ color: r.color }}>Action :</strong> {r.action}</div>
            </div>
          )
        })()}
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>PULSAR V15 — Suivi J+2/5/7 · Ne se substitue pas au jugement clinique</div>
    </div>
  )
}
