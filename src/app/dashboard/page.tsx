'use client'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import { computeDiagnosticContext } from '@/lib/data/epidemioContext'
import Picto from '@/components/Picto'
import SilhouetteNeon from '@/components/SilhouetteNeon'

/* ── Mini gauge circle ── */
function MiniGauge({ score, color, size = 48 }: { score: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s var(--p-ease)' }} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fill={color}
        fontSize="13" fontWeight="800" fontFamily="var(--p-font-mono)">{score}</text>
    </svg>
  )
}

const enginesDef = [
  { name: 'VPS', full: 'Vital Prognosis', color: '#6C7CFF', href: '/engines/vps' },
  { name: 'TDE', full: 'Therapeutic Decision', color: '#2FD1C8', href: '/engines/tde' },
  { name: 'PVE', full: 'Paraclinical', color: '#B96BFF', href: '/engines/pve' },
  { name: 'EWE', full: 'Early Warning', color: '#FF6B8A', href: '/engines/ewe' },
  { name: 'TPE', full: 'Therapeutic Prospection', color: '#FFB347', href: '/engines/tpe' },
]

export default function CockpitPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const engines = enginesDef.map((e, i) => {
    const results = [ps.vpsResult, ps.tdeResult, ps.pveResult, ps.eweResult, ps.tpeResult]
    return { ...e, score: results[i]?.synthesis.score ?? 0, level: results[i]?.synthesis.level ?? '—' }
  })

  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')
  const warnAlerts = ps.alerts.filter(a => a.severity === 'warning')
  const allAlerts = [...critAlerts, ...warnAlerts]

  // Epidemio context
  const epiContext = useMemo(() => {
    const family = scenario === 'FIRES' ? 'FIRES' : scenario === 'EAIS' ? 'EAIS' : scenario === 'PIMS' ? 'PIMS' : 'FIRES'
    return computeDiagnosticContext(family as any, 'Île-de-France')
  }, [scenario])

  // Smart actions — context-dependent
  const actions = useMemo(() => {
    const a: { label: string; desc: string; href: string; color: string; icon: string; priority: number }[] = []
    if (critAlerts.length > 0) {
      a.push({ label: 'Alertes critiques', desc: `${critAlerts.length} alerte${critAlerts.length > 1 ? 's' : ''} active${critAlerts.length > 1 ? 's' : ''}`, href: '/cockpit', color: '#FF4757', icon: 'alert', priority: 0 })
    }
    const topScore = engines.reduce((max, e) => e.score > max.score ? e : max, engines[0])
    if (topScore.score >= 60) {
      a.push({ label: 'Voir Recommandations', desc: `Score ${topScore.name} élevé (${topScore.score})`, href: '/recommandations', color: '#2ED573', icon: 'pill', priority: 1 })
    }
    a.push({ label: 'Diagnostic IA', desc: 'Scoring multi-pathologique', href: '/diagnostic', color: '#6C7CFF', icon: 'dna', priority: 2 })
    if (epiContext.alerts.length > 0) {
      a.push({ label: 'Contexte épidémio', desc: `${epiContext.alerts.length} signal${epiContext.alerts.length > 1 ? 'aux' : ''} actif${epiContext.alerts.length > 1 ? 's' : ''}`, href: '/observatory', color: '#FFA502', icon: 'virus', priority: 1 })
    }
    a.push({ label: 'Cockpit Monitoring', desc: '5 paramètres vitaux', href: '/cockpit', color: '#2FD1C8', icon: 'eeg', priority: 3 })
    return a.sort((x, y) => x.priority - y.priority).slice(0, 4)
  }, [critAlerts, engines, epiContext])

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Scenario selector (dev/demo only) */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--p-space-4)', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{
            padding: '4px 14px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* ═══ ZONE 1: Patient + Silhouette ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-4)' }} className="grid-2-1">
        
        {/* Left: QUE FAIRE MAINTENANT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Picto name="brain" size={28} glow glowColor="rgba(108,124,255,0.5)" />
            <div>
              <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0, lineHeight: 1.2 }}>Cockpit Patient</h1>
              <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Que faire maintenant ?</span>
            </div>
          </div>

          {/* Smart action cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-3)' }}>
            {actions.map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
                <div className="glass-card card-interactive" style={{
                  padding: 'var(--p-space-3) var(--p-space-4)',
                  borderRadius: 'var(--p-radius-lg)',
                  borderLeft: `3px solid ${a.color}`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                  minHeight: '60px',
                }}>
                  <Picto name={a.icon} size={24} glow glowColor={`${a.color}60`} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{a.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Alerts */}
          {allAlerts.length > 0 && (
            <div className="glass-card" style={{
              padding: 'var(--p-space-3) var(--p-space-4)',
              borderRadius: 'var(--p-radius-lg)',
              borderLeft: '3px solid var(--p-critical)',
              background: 'var(--p-critical-bg)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-critical)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                ALERTES ACTIVES
              </div>
              {allAlerts.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', marginTop: '2px' }}>{a.severity === 'critical' ? '🔴' : '🟡'}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{a.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.body}</div>
                  </div>
                </div>
              ))}
              <Link href="/cockpit" style={{ fontSize: '10px', color: 'var(--p-critical)', fontWeight: 600 }}>Voir le Cockpit Vital →</Link>
            </div>
          )}

          {/* Epidemio context */}
          {epiContext.alerts.length > 0 && (
            <div className="glass-card" style={{
              padding: 'var(--p-space-3) var(--p-space-4)',
              borderRadius: 'var(--p-radius-lg)',
              borderLeft: '3px solid var(--p-warning)',
              background: 'var(--p-warning-bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Picto name="virus" size={14} />
                <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-warning)', letterSpacing: '0.5px' }}>
                  CONTEXTE ÉPIDÉMIOLOGIQUE
                </span>
              </div>
              {epiContext.alerts.slice(0, 2).map((a, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--p-text)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>⚠ {a.trigger}</span>
                  <span style={{ color: 'var(--p-text-dim)' }}> — {a.mechanism}</span>
                </div>
              ))}
              <Link href="/observatory" style={{ fontSize: '10px', color: 'var(--p-warning)', fontWeight: 600 }}>Voir Observatory →</Link>
            </div>
          )}
        </div>

        {/* Right: Silhouette */}
        <div>
          <SilhouetteNeon
            sex={ps.sex === 'female' ? 'F' : 'M'}
            vpsScore={ps.vpsResult?.synthesis.score ?? 0}
            compact
            vitals={[
              { label: 'NEURO', icon: '🧠', value: `GCS: ${ps.neuro.gcs}/15`, color: '#6C7CFF',
                severity: ps.neuro.gcs <= 8 ? 2 : ps.neuro.gcs <= 12 ? 1 : 0 },
              { label: 'CARDIO', icon: '❤️', value: `FC: ${ps.hemodynamics.heartRate} bpm`, color: '#FF6B8A',
                severity: ps.hemodynamics.heartRate > 140 ? 2 : 0 },
              { label: 'RESP', icon: '🫁', value: `SpO₂: ${ps.hemodynamics.spo2}%`, color: '#2FD1C8',
                severity: ps.hemodynamics.spo2 < 95 ? 1 : 0 },
              { label: 'INFLAM', icon: '🔥', value: `CRP: ${ps.biology.crp} mg/L`, color: '#FFB347',
                severity: ps.biology.crp > 100 ? 2 : ps.biology.crp > 20 ? 1 : 0 },
              { label: 'TEMP', icon: '🌡️', value: `${ps.hemodynamics.temp}°C`, color: '#B96BFF',
                severity: ps.hemodynamics.temp >= 38 ? 1 : 0 },
            ]}
          />
        </div>
      </div>

      {/* ═══ ZONE 2: Engine Pipeline ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-5)' }} className="grid-5">
        {engines.map((e) => (
          <Link key={e.name} href={e.href} style={{ textDecoration: 'none' }}>
            <div className="card-interactive glass-card" style={{
              padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-xl)',
              borderTop: `3px solid ${e.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: '10px', letterSpacing: '1px' }}>{e.name}</span>
                <div className="dot-alive" />
              </div>
              <MiniGauge score={e.score} color={e.color} />
              <div style={{
                padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                background: `${e.color}15`, fontSize: '8px', fontFamily: 'var(--p-font-mono)',
                fontWeight: 700, color: e.color, maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{e.level}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══ ZONE 3: Quick access grid ═══ */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: 'var(--p-space-3)' }}>
        ACCÈS RAPIDES
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--p-space-3)' }}>
        {[
          { href: '/bilan', icon: 'microscope', label: 'Bilan diagnostique', color: '#FF4757', badge: '26' },
          { href: '/cross-pathologie', icon: 'cycle', label: 'Cross-Pathologie', color: '#6C7CFF' },
          { href: '/timeline', icon: 'chart', label: 'Timeline', color: '#2FD1C8' },
          { href: '/synthese', icon: 'clipboard', label: 'Synthèse', color: '#B96BFF' },
          { href: '/famille', icon: 'family', label: 'Espace Famille', color: '#FFB347' },
          { href: '/export', icon: 'export', label: 'Export PDF', color: '#2ED573' },
        ].map((q, i) => (
          <Link key={i} href={q.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card card-interactive" style={{
              padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-lg)',
              borderTop: `2px solid ${q.color}`, display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Picto name={q.icon} size={20} glow glowColor={`${q.color}50`} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{q.label}</div>
              </div>
              {q.badge && <span style={{ marginLeft: 'auto', fontSize: '9px', fontFamily: 'var(--p-font-mono)', padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: `${q.color}20`, color: q.color }}>{q.badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: 'var(--p-space-5) 0 var(--p-space-3)', color: 'var(--p-text-dim)', fontSize: '9px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V16 · Cockpit Patient · Aide à la décision — Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
