'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'
import SignalPanel from './components/SignalPanel'
import ClinicalAnalytics from './components/ClinicalAnalytics'
import EvidenceLibrary from './components/EvidenceLibrary'
import WorldMap from './components/WorldMap'
import { SIGNALS, EVIDENCE, REGISTRY, AGGREGATES } from '@/lib/data/observatoryData'

type Tab = 'overview' | 'signals' | 'registry' | 'evidence'

export default function ObservatoryPage() {
  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'brain' },
    { id: 'signals', label: 'Signal Lab', icon: 'eeg' },
    { id: 'registry', label: 'Registre mondial', icon: 'lungs' },
    { id: 'evidence', label: 'Evidence Library', icon: 'clipboard' },
  ]

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="cycle" size={40} glow glowColor="rgba(47,209,200,0.5)" />
        <div>
          <h1 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, margin: 0 }}>Observatory</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
            Observatoire neuro-inflammatoire pédiatrique mondial · 5 pathologies · {REGISTRY.length} cas
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '6px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: 'var(--p-radius-lg)',
            border: tab === t.id ? '2px solid var(--p-tde)' : 'var(--p-border)',
            background: tab === t.id ? 'var(--p-tde-dim)' : 'var(--p-bg-elevated)',
            color: tab === t.id ? 'var(--p-tde)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>
            <Picto name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-5)' }}>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--p-space-3)' }} className="grid-4">
            {[
              { label: 'Pathologies', value: '5', color: 'var(--p-vps)', sub: 'FIRES · EAIS · NORSE · PIMS · MOGAD' },
              { label: 'Signaux actifs', value: String(SIGNALS.filter(s => s.status === 'active').length), color: 'var(--p-critical)', sub: `${SIGNALS.length} total monitored` },
              { label: 'Cas registre', value: String(REGISTRY.length), color: 'var(--p-tde)', sub: `${new Set(REGISTRY.map(r => r.country)).size} pays` },
              { label: 'Publications', value: String(EVIDENCE.length), color: 'var(--p-pve)', sub: 'Références sourcées' },
            ].map((kpi, i) => (
              <div key={i} className="glass-card card-interactive" style={{ padding: 'var(--p-space-4)', borderRadius: 'var(--p-radius-xl)', borderTop: `3px solid ${kpi.color}`, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)', marginTop: '4px' }}>{kpi.label}</div>
                <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          <ClinicalAnalytics aggregates={AGGREGATES} />
          <WorldMap rows={REGISTRY} />
          <SignalPanel signals={SIGNALS.filter(s => s.status === 'active')} />
        </div>
      )}

      {/* Signals */}
      {tab === 'signals' && <SignalPanel signals={SIGNALS} />}

      {/* Registry */}
      {tab === 'registry' && <WorldMap rows={REGISTRY} />}

      {/* Evidence */}
      {tab === 'evidence' && <EvidenceLibrary evidence={EVIDENCE} />}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-5)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 · Observatory Module · Données illustratives · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
