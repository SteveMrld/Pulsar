'use client'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

function Spark({ data, color, w = 64, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(' ')
  const lastY = pts.split(' ').pop()?.split(',')[1] || '12'
  const gid = `spk${color.replace(/[^a-z0-9]/gi,'')}`
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={Number(lastY)} r="2.5" fill={color} />
    </svg>
  )
}

function MiniGauge({ score, color, size = 44 }: { score: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        className="gauge-ring" style={{ '--gauge-circumference': c, '--gauge-target': off } as React.CSSProperties} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fill={color} fontSize="12" fontWeight="800" fontFamily="var(--p-font-mono)">{score}</text>
    </svg>
  )
}

const phases = [
  { label: 'PHASE 1 — ARRIVÉE', modules: [
    { href: '/project', icon: '📋', title: 'Nouveau CDC', desc: 'Saisie patient complète', color: 'var(--p-vps)' },
    { href: '/urgence', icon: '🚨', title: 'Mode Urgence 3h', desc: '6 champs essentiels', color: 'var(--p-critical)' },
    { href: '/bilan', icon: '🔬', title: 'Bilan diagnostique', desc: '26 examens, 6 catégories', color: 'var(--p-pve)' },
  ]},
  { label: 'PHASE 2 — DIAGNOSTIC', modules: [
    { href: '/diagnostic', icon: '🧬', title: 'Diagnostic IA', desc: 'Scoring FIRES/EAIS/PIMS', color: 'var(--p-tde)' },
    { href: '/interpellation', icon: '⚠️', title: 'Interpellation', desc: 'Drapeaux rouges, seuils', color: 'var(--p-warning)' },
    { href: '/case-matching', icon: '🔄', title: 'Case-Matching', desc: '4 cas documentés', color: 'var(--p-info)' },
  ]},
  { label: 'PHASE 3 — TRAITEMENT', modules: [
    { href: '/recommandations', icon: '💊', title: 'Recommandations', desc: '4 lignes thérapeutiques', color: 'var(--p-ewe)' },
    { href: '/pharmacovigilance', icon: '🛡️', title: 'Pharmacovigilance', desc: 'Interactions, PVE Engine', color: 'var(--p-pve)' },
  ]},
  { label: 'PHASE 4 — MONITORING', modules: [
    { href: '/cockpit', icon: '📊', title: 'Cockpit Vital', desc: '5 paramètres + 5 moteurs', color: 'var(--p-vps)' },
    { href: '/timeline', icon: '📅', title: 'Timeline', desc: 'Chronologie du séjour', color: 'var(--p-tde)' },
    { href: '/suivi', icon: '📈', title: 'Suivi J+2/5/7', desc: "Points d'étape", color: 'var(--p-tpe)' },
  ]},
  { label: 'PHASE 5 — SYNTHÈSE', modules: [
    { href: '/staff', icon: '👥', title: 'Staff / RCP', desc: 'Réunion pluridisciplinaire', color: 'var(--p-info)' },
    { href: '/famille', icon: '👨‍👩‍👧', title: 'Espace Famille', desc: 'Langage accessible', color: 'var(--p-tde)' },
    { href: '/synthese', icon: '📑', title: 'Synthèse', desc: 'Vue consolidée', color: 'var(--p-pve)' },
    { href: '/export', icon: '📤', title: 'Export PDF', desc: 'Rapport complet', color: 'var(--p-tpe)' },
  ]},
  { label: 'RESSOURCES', modules: [
    { href: '/demo', icon: '▶️', title: 'Démo Inès', desc: '13 scènes autopilotées', color: 'var(--p-ewe)' },
    { href: '/engines/vps', icon: '💜', title: 'VPS Engine', desc: '4 couches BrainCore', color: 'var(--p-vps)' },
    { href: '/engines/tde', icon: '💚', title: 'TDE Engine', desc: '4 couches BrainCore', color: 'var(--p-tde)' },
    { href: '/engines/pve', icon: '💟', title: 'PVE Engine', desc: '4 couches BrainCore', color: 'var(--p-pve)' },
    { href: '/engines/ewe', icon: '🔴', title: 'EWE Engine', desc: '4 couches BrainCore', color: 'var(--p-ewe)' },
    { href: '/engines/tpe', icon: '🟠', title: 'TPE Engine', desc: '4 couches BrainCore', color: 'var(--p-tpe)' },
  ]},
]

const enginesDef = [
  { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF' },
  { name: 'TDE', full: 'Therapeutic Decision', color: '#2FD1C8' },
  { name: 'PVE', full: 'Pharmacovigilance', color: '#B96BFF' },
  { name: 'EWE', full: 'Early Warning', color: '#FF6B8A' },
  { name: 'TPE', full: 'Therapeutic Prospection', color: '#FFB347' },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS['FIRES'].data)
    runPipeline(p)
    return p
  }, [])

  const enginesLive = [
    { ...enginesDef[0], score: ps.vpsResult?.synthesis.score ?? 0, level: ps.vpsResult?.synthesis.level ?? '—' },
    { ...enginesDef[1], score: ps.tdeResult?.synthesis.score ?? 0, level: ps.tdeResult?.synthesis.level ?? '—' },
    { ...enginesDef[2], score: ps.pveResult?.synthesis.score ?? 0, level: ps.pveResult?.synthesis.level ?? '—' },
    { ...enginesDef[3], score: ps.eweResult?.synthesis.score ?? 0, level: ps.eweResult?.synthesis.level ?? '—' },
    { ...enginesDef[4], score: ps.tpeResult?.synthesis.score ?? 0, level: ps.tpeResult?.synthesis.level ?? '—' },
  ]

  const mkSpk = (base: number) => [Math.max(0,base-15), Math.max(0,base-8), Math.max(0,base-12), Math.max(0,base-3), base]
  const critCount = ps.alerts.filter(a => a.severity === 'critical').length

  const card: React.CSSProperties = {
    background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)',
    padding: 'var(--p-space-5)',
  }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero Banner */}
      <div className="glass-card" style={{
        padding: 'var(--p-space-6) var(--p-space-8)', borderRadius: 'var(--p-radius-2xl)',
        marginBottom: 'var(--p-space-6)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(108,124,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(47,209,200,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>PULSAR V15</h1>
            <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', margin: '6px 0 0', maxWidth: '500px' }}>
              Pediatric Urgent Lifesaving System — 5 moteurs × 4 couches BrainCore
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Moteurs', value: '5/5', color: 'var(--p-vps)' },
              { label: 'Crash tests', value: '7/7', color: 'var(--p-success)' },
              { label: 'Pathologies', value: '5', color: 'var(--p-tde)' },
              { label: 'Alertes', value: String(critCount), color: critCount > 0 ? 'var(--p-critical)' : 'var(--p-success)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engine Pipeline with Live Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-6)' }} className="grid-5">
        {enginesLive.map((e) => (
          <Link key={e.name} href={`/engines/${e.name.toLowerCase()}`} style={{ textDecoration: 'none' }}>
            <div className="card-interactive glass-card" style={{
              padding: 'var(--p-space-4)', borderRadius: 'var(--p-radius-xl)',
              borderTop: `3px solid ${e.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: '11px', letterSpacing: '1px' }}>{e.name}</span>
                <div className="dot-alive" />
              </div>
              <MiniGauge score={e.score} color={e.color} />
              <Spark data={mkSpk(e.score)} color={e.color} />
              <div style={{ padding: '2px 10px', borderRadius: 'var(--p-radius-full)', background: `${e.color}15`, fontSize: '8px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.level}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Module Cards */}
      {phases.map((phase, pi) => (
        <div key={pi} style={{ marginBottom: 'var(--p-space-5)' }}>
          <div className="section-label" style={{ marginBottom: 'var(--p-space-3)', paddingLeft: '2px' }}>{phase.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--p-space-3)' }}>
            {phase.modules.map((m, mi) => (
              <Link key={mi} href={m.href} style={{ textDecoration: 'none' }}>
                <div className={`${mounted ? 'animate-in' : ''} card-interactive`} style={{
                  ...card, cursor: 'pointer', borderTop: `3px solid ${m.color}`,
                  animationDelay: `${(pi * 3 + mi) * 50}ms`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--p-space-3)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                  </div>
                  <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)', marginBottom: '4px' }}>{m.title}</div>
                  <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>{m.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Actions */}
      <div className="accent-line" style={{ margin: 'var(--p-space-4) 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--p-space-3)' }} className="grid-3">
        {[
          { href: '/evidence', icon: '📚', label: 'Evidence Vault', badge: '17 publis' },
          { href: '/experts', icon: '🎓', label: 'Consensus Expert', badge: '5 experts' },
          { href: '/about', icon: '💙', label: 'Mémorial', badge: '' },
        ].map((a, i) => (
          <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
            <div className="card-interactive" style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-3)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
              <span>{a.icon}</span>
              <span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', flex: 1 }}>{a.label}</span>
              {a.badge && <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{a.badge}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
