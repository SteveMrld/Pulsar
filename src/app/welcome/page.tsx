'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import Picto from '@/components/Picto'

const QUICK_ACCESS = [
  {
    href: '/dashboard', icon: 'eeg', label: 'Cockpit Patient',
    desc: 'Vue temps réel · Alertes · Actions prioritaires',
    color: '#6C7CFF', primary: true,
  },
  {
    href: '/diagnostic', icon: 'brain', label: 'Diagnostic IA',
    desc: 'Scoring multi-pathologique',
    color: '#B96BFF', primary: false,
  },
  {
    href: '/engines', icon: 'dna', label: 'Pipeline 5 Moteurs',
    desc: 'VPS · TDE · PVE · EWE · TPE',
    color: '#2FD1C8', primary: false,
  },
  {
    href: '/neurocore', icon: 'brain', label: 'NeuroCore',
    desc: 'EEG · IRM · Biomarqueurs · Red Flags',
    color: '#B96BFF', primary: false,
  },
  {
    href: '/recommandations', icon: 'pill', label: 'Recommandations',
    desc: 'Lignes thérapeutiques',
    color: '#2ED573', primary: false,
  },
  {
    href: '/demo', icon: 'play', label: 'Démo guidée',
    desc: '13 scènes · Cas Inès',
    color: '#FFB347', primary: false,
  },
  {
    href: '/timeline', icon: 'chart', label: 'Timeline',
    desc: 'Chronologie du séjour',
    color: '#FF6B8A', primary: false,
  },
  {
    href: '/observatory', icon: 'virus', label: 'Observatoire',
    desc: 'Veille épidémiologique',
    color: '#FFA502', primary: false,
  },
]

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)
  const [hour, setHour] = useState(12)

  useEffect(() => {
    setMounted(true)
    setHour(new Date().getHours())
  }, [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS['FIRES'].data)
    runPipeline(p)
    return p
  }, [])

  const critAlerts = ps.alerts.filter(a => a.severity === 'critical').length
  const warnAlerts = ps.alerts.filter(a => a.severity === 'warning').length
  const vps = ps.vpsResult?.synthesis.score ?? 0

  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="page-enter" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--p-space-4)' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 'var(--p-space-6)', paddingTop: 'var(--p-space-4)' }}>
        <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
          {greeting} <span className="text-gradient-vps">Docteur</span>
        </h1>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginTop: '6px' }}>
          Bienvenue sur PULSAR — votre assistant d&apos;aide à la décision clinique.
        </p>
      </div>

      {/* Patient summary banner */}
      <div className="glass-card" style={{
        borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-4)',
        marginBottom: 'var(--p-space-5)',
        borderLeft: critAlerts > 0 ? '4px solid #FF4757' : '4px solid #6C7CFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>
            PATIENT ACTIF
          </div>
          {critAlerts > 0 && (
            <div style={{
              padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
              background: 'rgba(255,71,87,0.15)', color: '#FF4757',
              fontSize: '10px', fontWeight: 700, fontFamily: 'var(--p-font-mono)',
              animation: 'breathe 2s ease-in-out infinite',
            }}>
              {critAlerts} ALERTE{critAlerts > 1 ? 'S' : ''} CRITIQUE{critAlerts > 1 ? 'S' : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(108,124,255,0.2), rgba(47,209,200,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(108,124,255,0.3)',
          }}>
            <span style={{ fontSize: '20px' }}>👧</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)' }}>
              Inès · 4 ans · F
            </div>
            <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '2px' }}>
              FIRES suspecté · J+1 · GCS 7/15
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#6C7CFF', fontFamily: 'var(--p-font-mono)' }}>{vps}</div>
            <div style={{ fontSize: '8px', color: '#FF4757', fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>VPS</div>
          </div>
        </div>

        <Link href="/dashboard" style={{
          display: 'block', textAlign: 'center', marginTop: '12px',
          padding: '10px', borderRadius: 'var(--p-radius-lg)',
          background: critAlerts > 0 ? 'rgba(255,71,87,0.12)' : 'rgba(108,124,255,0.1)',
          color: critAlerts > 0 ? '#FF4757' : '#6C7CFF',
          fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          border: critAlerts > 0 ? '1px solid rgba(255,71,87,0.2)' : '1px solid rgba(108,124,255,0.15)',
        }}>
          {critAlerts > 0 ? '⚠ Ouvrir le Cockpit — Alertes en attente' : 'Ouvrir le Cockpit Patient →'}
        </Link>
      </div>

      {/* Navigation grid */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>
        ACCÈS RAPIDE
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: 'var(--p-space-5)' }}>
        {QUICK_ACCESS.map((item, i) => (
          <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="card-interactive" style={{
              padding: '14px', borderRadius: 'var(--p-radius-lg)',
              borderLeft: `3px solid ${item.color}`,
              background: item.primary ? `${item.color}10` : 'var(--p-bg-elevated)',
              transition: 'all 150ms',
              minHeight: '80px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Picto name={item.icon} size={20} glow glowColor={`${item.color}50`} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', paddingLeft: '30px' }}>
                {item.desc}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div className="glass-card" style={{
        borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-4)',
        marginBottom: 'var(--p-space-5)',
      }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>
          RÉSUMÉ PIPELINE
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { name: 'VPS', score: ps.vpsResult?.synthesis.score ?? 0, color: '#6C7CFF' },
            { name: 'TDE', score: ps.tdeResult?.synthesis.score ?? 0, color: '#2FD1C8' },
            { name: 'PVE', score: ps.pveResult?.synthesis.score ?? 0, color: '#B96BFF' },
            { name: 'EWE', score: ps.eweResult?.synthesis.score ?? 0, color: '#FF6B8A' },
            { name: 'TPE', score: ps.tpeResult?.synthesis.score ?? 0, color: '#FFB347' },
          ].map(e => (
            <Link key={e.name} href={`/engines?tab=${e.name.toLowerCase()}`} style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: e.color, fontFamily: 'var(--p-font-mono)' }}>
                {e.score}
              </div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginTop: '2px' }}>
                {e.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center', fontSize: '9px', color: 'var(--p-text-dim)',
        fontFamily: 'var(--p-font-mono)', padding: 'var(--p-space-2) 0',
      }}>
        PULSAR V16 · Aide à la décision · Ne remplace pas le jugement clinique
      </div>
    </div>
  )
}
