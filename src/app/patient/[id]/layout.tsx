'use client'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { PatientProvider, usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import PulsarAI from '@/components/PulsarAI'

/* ══════════════════════════════════════════════════════════════
   PATIENT LAYOUT V17
   Phase-aware header · Adaptive tabs · Timeline drawer · AI float
   ══════════════════════════════════════════════════════════════ */

function PatientHeader() {
  const { info, engineSummary } = usePatient()
  const { vps, vpsColor, vpsLevel, criticalAlerts } = engineSummary
  const { ps } = usePatient()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '10px 20px',
      background: 'var(--p-bg-card)',
      borderBottom: '1px solid var(--p-border)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Back */}
      <Link href="/patients" style={{
        display: 'flex', alignItems: 'center', padding: '6px',
        borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-dim)',
        textDecoration: 'none',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '0.3px' }}>
            {info.room}
          </span>
          {/* Phase badge */}
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
            padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
            background: `${info.phaseInfo.color}12`,
            color: info.phaseInfo.color,
            border: `1px solid ${info.phaseInfo.color}25`,
          }}>{info.phaseInfo.label}</span>
          {info.allergies.length > 0 && (
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#FF4757', fontWeight: 700 }}>
              ⚠ {info.allergies.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Clinical status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Syndrome */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: 'rgba(108,124,255,0.1)', color: '#6C7CFF',
          border: '1px solid rgba(108,124,255,0.2)',
        }}>{info.syndrome}</span>

        {/* Day */}
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
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: vpsColor, lineHeight: 1 }}>{vps}</div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: vpsColor, letterSpacing: '0.5px', opacity: 0.7 }}>VPS</div>
        </div>

        {/* Alerts */}
        {criticalAlerts > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: 'var(--p-radius-md)',
            background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
          }}>
            <span style={{ fontSize: '12px' }}>⚠</span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: '#FF4757' }}>{criticalAlerts}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PatientTabs() {
  const { info, tabs } = usePatient()
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
      {tabs.map(t => {
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
            position: 'relative',
          }}>
            <Picto name={t.icon} size={14} glow={active || t.pulsing} glowColor={active ? `${t.color}40` : t.pulsing ? `${t.color}30` : undefined} />
            {t.label}
            {t.badge && (
              <span className={t.pulsing ? 'animate-breathe' : ''} style={{
                position: 'absolute', top: '4px', right: '4px',
                width: t.badge === '!' ? '14px' : 'auto', height: '14px',
                borderRadius: t.badge === '!' ? '50%' : 'var(--p-radius-full)',
                background: t.badge === '!' ? '#FF4757' : `${t.color}20`,
                color: t.badge === '!' ? 'white' : t.color,
                fontSize: '7px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: t.badge === '!' ? 0 : '0 4px',
                lineHeight: 1,
              }}>
                {t.badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

function TimelineDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { timeline, info } = usePatient()
  if (!open) return null

  const severityColor = (s?: string) => {
    switch (s) {
      case 'critical': return '#FF4757'
      case 'warning': return '#FFB347'
      case 'success': return '#2ED573'
      default: return '#6C7CFF'
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px', zIndex: 100,
      background: 'var(--p-bg-card)', borderLeft: '1px solid var(--p-border)',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--p-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Timeline</h3>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>{info.displayName} · J0→J+{info.hospDay}</span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--p-text-dim)', fontSize: '18px',
        }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {timeline.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative' }}>
            {/* Timeline line */}
            {i < timeline.length - 1 && (
              <div style={{
                position: 'absolute', left: '5px', top: '14px', bottom: '-16px',
                width: '1px', background: 'var(--p-border)',
              }} />
            )}
            {/* Dot */}
            <div style={{
              width: '11px', height: '11px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
              background: severityColor(ev.severity),
              boxShadow: `0 0 6px ${severityColor(ev.severity)}50`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--p-text)' }}>{ev.title}</span>
                {ev.engine && (
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 700,
                    padding: '1px 5px', borderRadius: 'var(--p-radius-full)',
                    background: 'rgba(108,124,255,0.08)', color: '#6C7CFF',
                  }}>{ev.engine}</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-muted)', marginTop: '2px' }}>{ev.detail}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '3px' }}>
                J+{ev.day}{ev.hour ? ` · ${ev.hour}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const id = (params?.id as string) || 'ines'
  const [showAI, setShowAI] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  return (
    <PatientProvider id={id}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--p-bg)' }}>
        <PatientHeader />
        <PatientTabs />

        {/* Page content */}
        <div style={{ flex: 1, padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>

        {/* Timeline button */}
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          style={{
            position: 'fixed', bottom: '24px', left: '24px', zIndex: 99,
            padding: '10px 16px', borderRadius: 'var(--p-radius-full)',
            background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 600,
            color: showTimeline ? '#6C7CFF' : 'var(--p-text-dim)',
          }}
        >
          <Picto name="chart" size={14} />
          Timeline
        </button>

        <TimelineDrawer open={showTimeline} onClose={() => setShowTimeline(false)} />

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
