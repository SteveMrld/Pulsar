'use client'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { PatientProvider, usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import PulsarAI from '@/components/PulsarAI'

/* ══════════════════════════════════════════════════════════════
   PATIENT LAYOUT
   Sticky header + tab nav + floating AI + timeline drawer
   ══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'cockpit',     label: 'Cockpit',     icon: 'heart',      color: '#FF4757', emoji: '🔴' },
  { id: 'urgence',     label: 'Urgence',     icon: 'alert',      color: '#FF6B8A', emoji: '🚨' },
  { id: 'diagnostic',  label: 'Diagnostic',  icon: 'brain',      color: '#6C7CFF', emoji: '🧠' },
  { id: 'traitement',  label: 'Traitement',  icon: 'pill',       color: '#2FD1C8', emoji: '💊' },
  { id: 'suivi',       label: 'Suivi',       icon: 'chart',      color: '#FFB347', emoji: '📊' },
  { id: 'examens',     label: 'Examens',     icon: 'microscope', color: '#B96BFF', emoji: '🧪' },
  { id: 'synthese',    label: 'Synthèse',    icon: 'clipboard',  color: '#2ED573', emoji: '🧾' },
  { id: 'ressources',  label: 'Ressources',  icon: 'books',      color: '#FFB347', emoji: '📚' },
]

function PatientHeader() {
  const { ps, info } = usePatient()
  const vps = ps.vpsResult?.synthesis.score ?? 0
  const vpsColor = vps >= 70 ? '#FF4757' : vps >= 50 ? '#FFA502' : vps >= 30 ? '#FFB347' : '#2ED573'
  const vpsLevel = vps >= 70 ? 'CRITIQUE' : vps >= 50 ? 'SÉVÈRE' : vps >= 30 ? 'MODÉRÉ' : 'STABLE'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '10px 20px',
      background: 'var(--p-bg-card)',
      borderBottom: '1px solid var(--p-border)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Back to file active */}
      <Link href="/patients" style={{
        display: 'flex', alignItems: 'center', padding: '6px',
        borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-dim)',
        textDecoration: 'none', transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '16px' }}>←</span>
      </Link>

      {/* Live dot */}
      <div className={vps >= 50 ? 'dot-critical' : 'dot-alive'} style={{
        width: '8px', height: '8px',
        background: vpsColor,
        boxShadow: `0 0 8px ${vpsColor}`,
        flexShrink: 0,
      }} />

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '15px', color: 'var(--p-text)' }}>
            {info.displayName}
          </span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', letterSpacing: '0.3px' }}>
            {info.age} · {info.sex === 'female' ? '♀' : '♂'} · {info.weight}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '0.3px', marginTop: '1px' }}>
          {info.room}
          {info.allergies.length > 0 && (
            <span style={{ color: '#FF4757', fontWeight: 700, marginLeft: '8px' }}>⚠ {info.allergies.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Clinical status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Syndrome badge */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: 'rgba(108,124,255,0.1)', color: '#6C7CFF',
          border: '1px solid rgba(108,124,255,0.2)',
        }}>{info.syndrome}</span>

        {/* Day badge */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: `${vpsColor}12`, color: vpsColor,
          border: `1px solid ${vpsColor}25`,
        }}>J+{info.hospDay}</span>

        {/* GCS */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900, color: ps.neuro.gcs <= 8 ? '#FF4757' : 'var(--p-text)', lineHeight: 1 }}>
            {ps.neuro.gcs}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)', letterSpacing: '0.5px' }}>GCS</div>
        </div>

        {/* VPS */}
        <div style={{
          textAlign: 'center', padding: '4px 10px', borderRadius: 'var(--p-radius-md)',
          background: `${vpsColor}10`, border: `1px solid ${vpsColor}20`,
        }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: vpsColor, lineHeight: 1 }}>
            {vps}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: vpsColor, letterSpacing: '0.5px', opacity: 0.7 }}>VPS</div>
        </div>

        {/* Alerts count */}
        {ps.alerts.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: 'var(--p-radius-md)',
            background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
          }}>
            <span style={{ fontSize: '12px' }}>⚠</span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: '#FF4757' }}>
              {ps.alerts.filter(a => a.severity === 'critical').length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function PatientTabs() {
  const { info } = usePatient()
  const pathname = usePathname()
  const currentTab = pathname.split('/').pop() || 'cockpit'

  return (
    <div style={{
      display: 'flex', gap: '2px',
      padding: '0 20px',
      background: 'var(--p-bg)',
      borderBottom: '1px solid var(--p-border)',
      overflowX: 'auto',
      position: 'sticky', top: '52px', zIndex: 49,
    }}>
      {TABS.map(t => {
        const active = currentTab === t.id
        return (
          <Link key={t.id} href={`/patient/${info.id}/${t.id}`} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '10px 14px',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: active ? 800 : 600,
            color: active ? t.color : 'var(--p-text-dim)',
            textDecoration: 'none',
            borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
            background: active ? `${t.color}08` : 'transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            letterSpacing: '0.3px',
          }}>
            <Picto name={t.icon} size={14} glow={active} glowColor={active ? `${t.color}40` : undefined} />
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const id = (params?.id as string) || 'ines'
  const [showAI, setShowAI] = useState(false)

  return (
    <PatientProvider id={id}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--p-bg)' }}>
        <PatientHeader />
        <PatientTabs />

        {/* Page content */}
        <div style={{ flex: 1, padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>

        {/* PulsarAI floating button */}
        <button
          onClick={() => setShowAI(!showAI)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(108,124,255,0.4), 0 0 0 3px rgba(108,124,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
            transform: showAI ? 'rotate(45deg)' : 'none',
          }}
        >
          <span style={{ fontSize: '22px', color: 'white', lineHeight: 1 }}>
            {showAI ? '✕' : '✦'}
          </span>
        </button>

        {/* PulsarAI panel */}
        {showAI && (
          <div style={{
            position: 'fixed', bottom: '90px', right: '24px', zIndex: 99,
            width: '380px', maxHeight: '500px',
            borderRadius: 'var(--p-radius-2xl)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,124,255,0.1)',
            overflow: 'hidden',
          }}>
            <PulsarAI />
          </div>
        )}
      </div>
    </PatientProvider>
  )
}
