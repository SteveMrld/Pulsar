'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'
import SignalPanel from './components/SignalPanel'
import ClinicalAnalytics from './components/ClinicalAnalytics'
import EvidenceLibrary from './components/EvidenceLibrary'
import WorldMap from './components/WorldMap'
import EpidemioPanel from './components/EpidemioPanel'
import { SIGNALS, EVIDENCE, REGISTRY, AGGREGATES } from '@/lib/data/observatoryData'

/* ══════════════════════════════════════════════════════════════
   OBSERVATORY V17
   Observatoire neuro-inflammatoire pédiatrique mondial
   5 onglets : Vue d'ensemble · Épidémio · Signaux · Registre · Evidence
   ══════════════════════════════════════════════════════════════ */

type Tab = 'overview' | 'signals' | 'registry' | 'evidence' | 'epidemio'

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: 'brain', color: '#6C7CFF' },
  { id: 'epidemio', label: 'Contexte Épidémio', icon: 'virus', color: '#FF6B8A' },
  { id: 'signals', label: 'Signal Lab', icon: 'alert', color: '#FFB347' },
  { id: 'registry', label: 'Registre mondial', icon: 'heart', color: '#2FD1C8' },
  { id: 'evidence', label: 'Evidence Library', icon: 'clipboard', color: '#B96BFF' },
]

export default function ObservatoryPage() {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>('overview')
  const activeTab = TABS.find(t => t.id === tab) || TABS[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── TOP BAR ── */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/patients" style={{
            display: 'flex', alignItems: 'center', padding: '6px',
            borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-dim)',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '16px' }}>←</span>
          </Link>
          <Picto name="dna" size={28} glow glowColor="rgba(47,209,200,0.5)" />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-text)', margin: 0, lineHeight: 1.2 }}>Observatory</h1>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>
              OBSERVATOIRE NEURO-INFLAMMATOIRE · {REGISTRY.length} CAS · {new Set(REGISTRY.map(r => r.country)).size} PAYS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: '#FF4757',
          }}>{SIGNALS.filter(s => s.status === 'active').length} signal actif</div>
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)',
          }}>5 pathologies</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: '2px', padding: '0 24px',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg)',
        overflowX: 'auto',
      }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '10px 16px', background: active ? `${t.color}08` : 'transparent',
              border: 'none', borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '10px',
              fontWeight: active ? 800 : 600, color: active ? t.color : 'var(--p-text-dim)',
              letterSpacing: '0.3px', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}>
              <Picto name={t.icon} size={14} glow={active} glowColor={active ? `${t.color}40` : undefined} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Overview */}
        {tab === 'overview' && (
          <div className="page-enter-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Pathologies', value: '5', color: '#6C7CFF', sub: 'FIRES · EAIS · NORSE · PIMS · MOGAD' },
                { label: 'Signaux actifs', value: String(SIGNALS.filter(s => s.status === 'active').length), color: '#FF4757', sub: `${SIGNALS.length} total monitorés` },
                { label: 'Cas registre', value: String(REGISTRY.length), color: '#2FD1C8', sub: `${new Set(REGISTRY.map(r => r.country)).size} pays` },
                { label: 'Publications', value: String(EVIDENCE.length), color: '#B96BFF', sub: 'Références sourcées' },
              ].map((kpi, i) => (
                <div key={i} className="glass-card" style={{
                  padding: '16px', borderRadius: 'var(--p-radius-xl)',
                  borderTop: `3px solid ${kpi.color}`, textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)', marginTop: '6px' }}>{kpi.label}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <ClinicalAnalytics aggregates={AGGREGATES} />
            <WorldMap rows={REGISTRY} />
            <SignalPanel signals={SIGNALS.filter(s => s.status === 'active')} />
          </div>
        )}

        {tab === 'epidemio' && <EpidemioPanel />}
        {tab === 'signals' && <SignalPanel signals={SIGNALS} />}
        {tab === 'registry' && <WorldMap rows={REGISTRY} />}
        {tab === 'evidence' && <EvidenceLibrary evidence={EVIDENCE} />}

        <div style={{
          textAlign: 'center', padding: '24px', color: 'var(--p-text-dim)',
          fontSize: '10px', fontFamily: 'var(--p-font-mono)',
        }}>
          PULSAR V17 · Observatory · Données illustratives · Ne se substitue pas au jugement clinique
        </div>
      </div>
    </div>
  )
}
