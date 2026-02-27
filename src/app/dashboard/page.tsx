'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const phases = [
  {
    label: 'PHASE 1 — ARRIVÉE',
    modules: [
      { href: '/project', icon: '📋', title: 'Nouveau CDC', desc: 'Saisie patient complète', color: 'var(--p-vps)', status: 'actif' },
      { href: '/urgence', icon: '🚨', title: 'Mode Urgence 3h', desc: '6 champs essentiels', color: 'var(--p-critical)', status: 'actif' },
      { href: '/bilan', icon: '🔬', title: 'Bilan diagnostique', desc: '26 examens, 6 catégories', color: 'var(--p-pve)', status: 'actif' },
    ]
  },
  {
    label: 'PHASE 2 — DIAGNOSTIC',
    modules: [
      { href: '/diagnostic', icon: '🧬', title: 'Diagnostic IA', desc: 'Scoring FIRES/EAIS/PIMS', color: 'var(--p-tde)', status: 'actif' },
      { href: '/interpellation', icon: '⚠️', title: 'Interpellation', desc: 'Drapeaux rouges, seuils', color: 'var(--p-warning)', status: 'actif' },
      { href: '/case-matching', icon: '🔄', title: 'Case-Matching', desc: '4 cas documentés', color: 'var(--p-info)', status: 'actif' },
    ]
  },
  {
    label: 'PHASE 3 — TRAITEMENT',
    modules: [
      { href: '/recommandations', icon: '💊', title: 'Recommandations', desc: '4 lignes thérapeutiques', color: 'var(--p-ewe)', status: 'actif' },
      { href: '/pharmacovigilance', icon: '🛡️', title: 'Pharmacovigilance', desc: 'Interactions, PVE Engine', color: 'var(--p-pve)', status: 'actif' },
    ]
  },
  {
    label: 'PHASE 4 — MONITORING',
    modules: [
      { href: '/cockpit', icon: '📊', title: 'Cockpit Vital', desc: '5 paramètres + 5 moteurs', color: 'var(--p-vps)', status: 'actif' },
      { href: '/timeline', icon: '📅', title: 'Timeline', desc: 'Chronologie du séjour', color: 'var(--p-tde)', status: 'actif' },
      { href: '/suivi', icon: '📈', title: 'Suivi J+2/5/7', desc: 'Points d\'étape', color: 'var(--p-tpe)', status: 'actif' },
    ]
  },
  {
    label: 'PHASE 5 — SYNTHÈSE',
    modules: [
      { href: '/staff', icon: '👥', title: 'Staff / RCP', desc: 'Réunion pluridisciplinaire', color: 'var(--p-info)', status: 'actif' },
      { href: '/famille', icon: '👨‍👩‍👧', title: 'Espace Famille', desc: 'Langage accessible', color: 'var(--p-tde)', status: 'actif' },
      { href: '/synthese', icon: '📑', title: 'Synthèse', desc: 'Vue consolidée', color: 'var(--p-pve)', status: 'actif' },
      { href: '/export', icon: '📤', title: 'Export PDF', desc: 'Rapport complet', color: 'var(--p-tpe)', status: 'actif' },
    ]
  },
  {
    label: 'RESSOURCES',
    modules: [
      { href: '/demo', icon: '▶️', title: 'Démo Inès', desc: '13 scènes autopilotées', color: 'var(--p-ewe)', status: 'actif' },
      { href: '/engines/vps', icon: '💜', title: 'VPS Engine', desc: '4 couches BrainCore', color: 'var(--p-vps)', status: 'actif' },
      { href: '/engines/tde', icon: '💚', title: 'TDE Engine', desc: '4 couches BrainCore', color: 'var(--p-tde)', status: 'actif' },
      { href: '/engines/pve', icon: '💟', title: 'PVE Engine', desc: '4 couches BrainCore', color: 'var(--p-pve)', status: 'actif' },
      { href: '/engines/ewe', icon: '🔴', title: 'EWE Engine', desc: '4 couches BrainCore', color: 'var(--p-ewe)', status: 'actif' },
      { href: '/engines/tpe', icon: '🟠', title: 'TPE Engine', desc: '4 couches BrainCore', color: 'var(--p-tpe)', status: 'actif' },
    ]
  },
]

const stats = [
  { label: 'Moteurs actifs', value: '5/5', icon: '🧠', color: 'var(--p-vps)' },
  { label: 'Crash tests', value: '7/7', icon: '✅', color: 'var(--p-success)' },
  { label: 'Pathologies', value: '5', icon: '🧬', color: 'var(--p-tde)' },
  { label: 'Publications', value: '17', icon: '📚', color: 'var(--p-tpe)' },
]

const engines = [
  { name: 'VPS', full: 'Vital Prognosis Score', color: 'var(--p-vps)' },
  { name: 'TDE', full: 'Therapeutic Decision', color: 'var(--p-tde)' },
  { name: 'PVE', full: 'Pharmacovigilance', color: 'var(--p-pve)' },
  { name: 'EWE', full: 'Early Warning', color: 'var(--p-ewe)' },
  { name: 'TPE', full: 'Therapeutic Prospection', color: 'var(--p-tpe)' },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-6)' }}>
        {stats.map((s, i) => (
          <div key={i} className={mounted ? 'animate-in' : ''} style={{
            background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)',
            padding: 'var(--p-space-4)', animationDelay: `${i * 80}ms`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>{s.label}</div>
                <div style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: s.color, fontFamily: 'var(--p-font-mono)' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Engines strip */}
      <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-6)' }}>
        <div style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: 'var(--p-space-3)' }}>PIPELINE V15</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
          {engines.map((e, i) => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)', flex: 1 }}>
              <div style={{
                flex: 1, padding: 'var(--p-space-2) var(--p-space-3)', background: 'var(--p-bg-elevated)',
                borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${e.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: 'var(--p-text-sm)' }}>{e.name}</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-success)', background: 'var(--p-success-bg)', padding: '1px 6px', borderRadius: 'var(--p-radius-full)' }}>● OK</span>
              </div>
              {i < 4 && <span style={{ color: 'var(--p-text-dim)', fontSize: '10px', flexShrink: 0 }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Module cards by phase */}
      {phases.map((phase, pi) => (
        <div key={pi} style={{ marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-3)', paddingLeft: '2px' }}>{phase.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`, gap: 'var(--p-space-3)' }}>
            {phase.modules.map((m, mi) => (
              <Link key={mi} href={m.href} style={{ textDecoration: 'none' }}>
                <div className={`${mounted ? 'animate-in' : ''} hover-lift`} style={{
                  background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)',
                  padding: 'var(--p-space-4)', cursor: 'pointer',
                  borderTop: `3px solid ${m.color}`, animationDelay: `${(pi * 3 + mi) * 60}ms`,
                  opacity: m.status === 'bientôt' ? 0.5 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--p-space-3)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    {m.status === 'bientôt' && <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-warning-bg)', color: 'var(--p-warning)', fontWeight: 600 }}>Bientôt</span>}
                  </div>
                  <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)', marginBottom: '4px' }}>{m.title}</div>
                  <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>{m.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--p-space-3)', marginTop: 'var(--p-space-4)' }}>
        <Link href="/evidence" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-md)', padding: 'var(--p-space-3)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', cursor: 'pointer' }}>
            <span>📚</span><span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>Evidence Vault</span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>17 publis</span>
          </div>
        </Link>
        <Link href="/experts" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-md)', padding: 'var(--p-space-3)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', cursor: 'pointer' }}>
            <span>🎓</span><span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>Consensus Expert</span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>5 experts</span>
          </div>
        </Link>
        <Link href="/about" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-md)', padding: 'var(--p-space-3)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', cursor: 'pointer' }}>
            <span>💙</span><span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>Mémorial</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
