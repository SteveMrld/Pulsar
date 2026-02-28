'use client'
import Picto from '@/components/Picto';
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import dynamic from 'next/dynamic'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const RespContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

interface TimelineEvent {
  time: string; day: number; type: string; title: string; desc: string; color: string; icon: string
}

function generateEvents(ps: PatientState, label: string): TimelineEvent[] {
  const evts: TimelineEvent[] = []
  const age = `${Math.round(ps.ageMonths / 12)} ans`
  const sex = ps.sex === 'female' ? 'Fille' : 'Garcon'

  evts.push({ time: 'J0 08:00', day: 0, type: 'admission', title: 'Admission urgences',
    desc: `${label} — ${sex}, ${age}, ${ps.weightKg} kg. T ${ps.hemodynamics.temp} C, GCS ${ps.neuro.gcs}/15`,
    color: 'var(--p-vps)', icon: 'heart' })

  evts.push({ time: 'J0 08:30', day: 0, type: 'exam', title: 'Bilan biologique initial',
    desc: `CRP ${ps.biology.crp} mg/L - PCT ${ps.biology.pct} ng/mL - Ferritine ${ps.biology.ferritin} ug/L - GB ${ps.biology.wbc} G/L - Plaq ${ps.biology.platelets} G/L`,
    color: 'var(--p-pve)', icon: 'microscope' })

  if (ps.neuro.seizures24h > 0) {
    const typeLabel = ps.neuro.seizureType === 'refractory_status' ? 'Etat de mal refractaire' :
      ps.neuro.seizureType === 'super_refractory' ? 'Etat de mal super-refractaire' :
      ps.neuro.seizureType === 'status' ? 'Etat de mal epileptique' :
      ps.neuro.seizureType === 'generalized_tonic_clonic' ? 'Crises TC generalisees' :
      ps.neuro.seizureType === 'focal_impaired' ? 'Crises focales' : 'Activite epileptique'
    evts.push({ time: 'J0 09:30', day: 0, type: 'alert', title: typeLabel,
      desc: `${ps.neuro.seizures24h} crises/24h - Duree cumulee ${ps.neuro.seizureDuration} min - Pupilles: ${ps.neuro.pupils}`,
      color: 'var(--p-critical)', icon: 'alert' })
  }

  if (ps.drugs.length > 0) {
    evts.push({ time: 'J0 10:00', day: 0, type: 'treatment', title: `${ps.drugs.length} traitements inities`,
      desc: ps.drugs.map(d => d.name).join(' - '),
      color: 'var(--p-ewe)', icon: 'pill' })
  }

  if (ps.csf.cells > 5 || ps.csf.protein > 0.4) {
    evts.push({ time: 'J0 11:00', day: 0, type: 'exam', title: 'Ponction lombaire',
      desc: `Cellules ${ps.csf.cells}/mm3 - Proteines ${ps.csf.protein} g/L - Anticorps: ${ps.csf.antibodies}`,
      color: 'var(--p-pve)', icon: 'blood' })
  }

  if (ps.hemodynamics.spo2 < 95 || ps.hemodynamics.heartRate > 140 || ps.biology.lactate > 2) {
    evts.push({ time: 'J0 12:00', day: 0, type: 'alert', title: 'Instabilite hemodynamique',
      desc: `FC ${ps.hemodynamics.heartRate} bpm - TA ${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp} - SpO2 ${ps.hemodynamics.spo2}% - Lactates ${ps.biology.lactate}`,
      color: 'var(--p-critical)', icon: 'heart' })
  }

  const vpsScore = ps.vpsResult?.synthesis.score ?? 0
  const vpsLevel = ps.vpsResult?.synthesis.level ?? '—'
  evts.push({ time: 'J0 14:00', day: 0, type: 'engine', title: `Pipeline PULSAR — VPS ${vpsScore}/100`,
    desc: `Niveau ${vpsLevel} - TDE ${ps.tdeResult?.synthesis.score ?? 0}/100 - EWE ${ps.eweResult?.synthesis.score ?? 0}/100 - ${ps.alerts.length} alertes`,
    color: 'var(--p-vps)', icon: 'brain' })

  ps.treatmentHistory.forEach((t, i) => {
    const dayNum = i + 1
    const responseLabel = t.response === 'none' ? 'Pas de reponse' : t.response === 'partial' ? 'Reponse partielle' : t.response === 'good' ? 'Bonne reponse' : 'Reponse complete'
    evts.push({ time: `J${dayNum} 08:00`, day: dayNum, type: 'treatment', title: t.treatment,
      desc: `Periode: ${t.period} - ${responseLabel}`,
      color: t.response === 'none' ? 'var(--p-critical)' : t.response === 'partial' ? 'var(--p-warning)' : 'var(--p-success)', icon: 'pill' })
  })

  const urgentRecos = ps.recommendations.filter(r => r.priority === 'urgent')
  if (urgentRecos.length > 0) {
    const lastDay = Math.max(...evts.map(e => e.day), 0)
    evts.push({ time: `J${lastDay + 1} 08:00`, day: lastDay + 1, type: 'engine', title: `${urgentRecos.length} recommandations urgentes`,
      desc: urgentRecos.slice(0, 3).map(r => r.title).join(' - '),
      color: 'var(--p-tde)', icon: 'clipboard' })
  }

  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')
  if (critAlerts.length > 0) {
    const lastDay = Math.max(...evts.map(e => e.day), 0)
    evts.push({ time: `J${lastDay} 16:00`, day: lastDay, type: 'alert', title: `${critAlerts.length} alertes critiques actives`,
      desc: critAlerts.slice(0, 3).map(a => a.title).join(' - '),
      color: 'var(--p-critical)', icon: 'warning' })
  }

  return evts.sort((a, b) => a.day !== b.day ? a.day - b.day : a.time.localeCompare(b.time))
}

function generateTrend(ps: PatientState) {
  const vps = ps.vpsResult?.synthesis.score ?? 0
  const crises = ps.neuro.seizures24h
  const crp = ps.biology.crp
  const days = Math.max(ps.hospDay, 3)
  const data = []
  for (let d = 0; d <= days; d++) {
    const t = d / days
    data.push({
      day: `J${d}`,
      VPS: Math.round(Math.max(0, vps + (100 - vps) * 0.4 * (1 - t) - vps * 0.15 * t)),
      Crises: Math.round(Math.max(0, crises * (1 - t * 0.7))),
      CRP: Math.round(Math.max(0, crp * (1 - t * 0.3 + Math.sin(t * 3) * 0.1))),
    })
  }
  return data
}

const typeFilters = [
  { key: 'all', label: 'Tous', color: 'var(--p-vps)' },
  { key: 'alert', label: 'Alertes', color: 'var(--p-critical)' },
  { key: 'treatment', label: 'Traitements', color: 'var(--p-ewe)' },
  { key: 'exam', label: 'Examens', color: 'var(--p-pve)' },
  { key: 'engine', label: 'Moteurs', color: 'var(--p-vps)' },
]

export default function TimelinePage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [filter, setFilter] = useState('all')
  useEffect(() => setMounted(true), [])

  const { ps, events, trend } = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return { ps: p, events: generateEvents(p, DEMO_PATIENTS[scenario].label), trend: generateTrend(p) }
  }, [scenario])

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)
  const vpsScore = ps.vpsResult?.synthesis.score ?? 0
  const vpsColor = vpsScore >= 70 ? 'var(--p-critical)' : vpsScore >= 40 ? 'var(--p-warning)' : 'var(--p-success)'

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-tde)' }} />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Timeline</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 4 — Chronologie dynamique · Pipeline connecté</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} className="hover-lift" style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-tde)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-tde-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-tde)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Patient summary */}
      <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderLeft: `4px solid ${vpsColor}` }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-5)', flexWrap: 'wrap' }}>
          {[
            { l: 'Patient', v: DEMO_PATIENTS[scenario].label.split('\u2014')[0]?.trim() || DEMO_PATIENTS[scenario].label.split('-')[0]?.trim() },
            { l: 'Jour', v: `J${ps.hospDay}` },
            { l: 'GCS', v: `${ps.neuro.gcs}/15` },
            { l: 'Crises', v: `${ps.neuro.seizures24h}/24h` },
            { l: 'CRP', v: `${ps.biology.crp}` },
          ].map((x, i) => (
            <div key={i}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{x.l}</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{x.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { n: 'VPS', s: ps.vpsResult?.synthesis.score ?? 0, c: 'var(--p-vps)' },
            { n: 'TDE', s: ps.tdeResult?.synthesis.score ?? 0, c: 'var(--p-tde)' },
            { n: 'EWE', s: ps.eweResult?.synthesis.score ?? 0, c: 'var(--p-ewe)' },
          ].map(e => (
            <div key={e.n} style={{ textAlign: 'center', padding: '4px 10px', borderRadius: 'var(--p-radius-lg)', background: `${e.c}10`, border: `1px solid ${e.c}30` }}>
              <div style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{e.n}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-base)', color: e.c }}>{e.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-5)' }}>
        <div className="section-label" style={{ marginBottom: 'var(--p-space-3)' }}>ÉVOLUTION VPS × CRISES × CRP</div>
        {mounted && (
          <RespContainer width="100%" height={180}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="vpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C7CFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#6C7CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="criseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4757" stopOpacity={0.3} /><stop offset="100%" stopColor="#FF4757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--p-dark-4)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--p-text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--p-text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: 'var(--p-dark-2)', border: '1px solid var(--p-gray-1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Area type="monotone" dataKey="VPS" stroke="#6C7CFF" fill="url(#vpsGrad)" strokeWidth={2} name="VPS" />
              <Area type="monotone" dataKey="Crises" stroke="#FF4757" fill="url(#criseGrad)" strokeWidth={2} name="Crises/24h" />
              <Area type="monotone" dataKey="CRP" stroke="#FFB347" fill="#FFB34710" strokeWidth={1.5} name="CRP" strokeDasharray="4 2" />
            </AreaChart>
          </RespContainer>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--p-space-5)', flexWrap: 'wrap' }}>
        {typeFilters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '5px 14px', borderRadius: 'var(--p-radius-full)',
            border: filter === f.key ? `2px solid ${f.color}` : 'var(--p-border)',
            background: filter === f.key ? `${f.color}15` : 'var(--p-bg-elevated)',
            color: filter === f.key ? f.color : 'var(--p-text-muted)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--p-font-mono)',
          }}>{f.label} {filter === 'all' && f.key !== 'all' ? `(${events.filter(e => e.type === f.key).length})` : ''}</button>
        ))}
      </div>

      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-3)' }}>
        {filtered.length} EVENTS · J0 → J{Math.max(...events.map(e => e.day))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '40px' }}>
        <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--p-vps) 0%, var(--p-tde) 50%, var(--p-pve) 100%)', opacity: 0.3 }} />
        {filtered.map((e, i) => (
          <div key={i} className={mounted ? 'animate-in' : ''} style={{ position: 'relative', marginBottom: 'var(--p-space-4)', animationDelay: `${i * 60}ms` }}>
            <div style={{
              position: 'absolute', left: '-33px', top: '12px', width: '12px', height: '12px',
              borderRadius: '50%', background: e.color, border: '2px solid var(--p-bg)', zIndex: 1,
              boxShadow: e.type === 'alert' ? `0 0 8px ${e.color}` : 'none',
            }} />
            <div className="card-interactive glass-card" style={{
              borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-4)',
              borderLeft: `3px solid ${e.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
                  <Picto name={e.icon} size={18} glow glowColor={e.color} />
                  <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{e.title}</span>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: e.color, fontWeight: 600, padding: '2px 8px', background: `${e.color}12`, borderRadius: 'var(--p-radius-full)' }}>{e.time}</span>
              </div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Timeline · Pipeline connecté · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
