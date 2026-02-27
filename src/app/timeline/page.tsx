'use client'
import Picto from '@/components/Picto';
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const RespContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

const events = [
  { time: 'J0 08:00', day: 0, type: 'admission', title: 'Admission urgences', desc: 'Enfant 7 ans, fièvre 39.2°C depuis 48h, première crise TC', color: 'var(--p-vps)', icon: 'heart' },
  { time: 'J0 08:15', day: 0, type: 'exam', title: 'Bilan biologique lancé', desc: 'NFS, CRP, PCT, iono, lactates, bilan hépatique', color: 'var(--p-pve)', icon: 'microscope' },
  { time: 'J0 09:30', day: 0, type: 'alert', title: 'État de mal épileptique', desc: '2ème crise TC > 5 min, Midazolam 0.15 mg/kg IV', color: 'var(--p-critical)', icon: 'alert' },
  { time: 'J0 10:00', day: 0, type: 'treatment', title: 'Lévétiracétam 40 mg/kg IV', desc: 'Charge antiépileptique 1ère ligne', color: 'var(--p-ewe)', icon: 'pill' },
  { time: 'J0 11:00', day: 0, type: 'exam', title: 'Ponction lombaire', desc: 'Cellules 18/mm³, protéines 0.52 g/L, glucose normal', color: 'var(--p-pve)', icon: '💉' },
  { time: 'J0 14:00', day: 0, type: 'result', title: 'Résultats biologie', desc: 'CRP 35 mg/L, PCT 0.8 ng/mL, ferritine 280 µg/L', color: 'var(--p-tde)', icon: 'clipboard' },
  { time: 'J0 16:00', day: 0, type: 'alert', title: 'Crises réfractaires', desc: '4 crises en 8h malgré LEV + MDZ, escalade nécessaire', color: 'var(--p-critical)', icon: 'warning' },
  { time: 'J0 17:00', day: 0, type: 'engine', title: 'Pipeline PULSAR — VPS 68/100', desc: 'Niveau SÉVÈRE, pattern détérioration progressive détecté', color: 'var(--p-vps)', icon: 'brain' },
  { time: 'J1 08:00', day: 1, type: 'treatment', title: 'Méthylprednisolone 30 mg/kg', desc: 'Immunothérapie 1ère ligne lancée + IgIV prévues J2', color: 'var(--p-ewe)', icon: 'pill' },
  { time: 'J1 14:00', day: 1, type: 'exam', title: 'IRM cérébrale', desc: 'Pas de lésion structurelle, FLAIR normal', color: 'var(--p-pve)', icon: '🧲' },
  { time: 'J2 10:00', day: 2, type: 'treatment', title: 'IgIV 2 g/kg', desc: 'Immunoglobulines IV, perfusion sur 12h', color: 'var(--p-ewe)', icon: 'pill' },
  { time: 'J3 08:00', day: 3, type: 'engine', title: 'Pipeline PULSAR — VPS 45/100', desc: 'Amélioration modérée, 2 crises/24h vs 12 à J0', color: 'var(--p-tde)', icon: 'brain' },
]

// VPS trend data for area chart
const vpsTrend = [
  { day: 'J0', vps: 68, crises: 12, crp: 35 },
  { day: 'J1', vps: 62, crises: 8, crp: 42 },
  { day: 'J2', vps: 52, crises: 4, crp: 28 },
  { day: 'J3', vps: 45, crises: 2, crp: 18 },
]

const typeFilters = [
  { key: 'all', label: 'Tous', color: 'var(--p-vps)' },
  { key: 'alert', label: 'Alertes', color: 'var(--p-critical)' },
  { key: 'treatment', label: 'Traitements', color: 'var(--p-ewe)' },
  { key: 'exam', label: 'Examens', color: 'var(--p-pve)' },
  { key: 'engine', label: 'Moteurs', color: 'var(--p-vps)' },
]

export default function TimelinePage() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState('all')
  useEffect(() => setMounted(true), [])

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-tde)' }} />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Timeline</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 4 — Chronologie complète du séjour</span>
        </div>
      </div>

      {/* VPS Trend AreaChart */}
      <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-5)', marginTop: 'var(--p-space-5)' }}>
        <div className="section-label" style={{ marginBottom: 'var(--p-space-3)' }}>ÉVOLUTION VPS × CRISES</div>
        {mounted && (
          <RespContainer width="100%" height={180}>
            <AreaChart data={vpsTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="vpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C7CFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C7CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="criseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4757" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF4757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--p-dark-4)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--p-text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--p-text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: 'var(--p-dark-2)', border: '1px solid var(--p-gray-1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Area type="monotone" dataKey="vps" stroke="#6C7CFF" fill="url(#vpsGrad)" strokeWidth={2} name="VPS" />
              <Area type="monotone" dataKey="crises" stroke="#FF4757" fill="url(#criseGrad)" strokeWidth={2} name="Crises/24h" />
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
            background: filter === f.key ? `${f.color}15` : 'var(--p-bg-card)',
            color: filter === f.key ? f.color : 'var(--p-text-muted)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--p-font-mono)',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '40px' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--p-vps) 0%, var(--p-tde) 50%, var(--p-pve) 100%)', opacity: 0.3 }} />

        {filtered.map((e, i) => (
          <div key={i} className={mounted ? 'animate-in' : ''} style={{ position: 'relative', marginBottom: 'var(--p-space-4)', animationDelay: `${i * 60}ms` }}>
            {/* Node */}
            <div style={{
              position: 'absolute', left: '-33px', top: '12px', width: '12px', height: '12px',
              borderRadius: '50%', background: e.color, border: '2px solid var(--p-bg)', zIndex: 1,
              boxShadow: e.type === 'alert' ? `0 0 8px ${e.color}` : 'none',
            }} />

            <div className="card-interactive" style={{
              background: 'var(--p-bg-card)', border: 'var(--p-border)',
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
        PULSAR V15 — Timeline · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
