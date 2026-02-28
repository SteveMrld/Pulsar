'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import Picto from './Picto'

/* ───────────────────────────────────────────────
   4 couloirs cliniques : Arriver → Diagnostiquer → Traiter → Surveiller
   ─────────────────────────────────────────────── */

type Corridor = {
  id: string; icon: string; label: string; color: string; glow: string
  pages: { href: string; label: string; icon: string; badge?: string }[]
}

const CORRIDORS: Corridor[] = [
  {
    id: 'urgence', icon: 'alert', label: 'Urgence', color: '#FF4757', glow: 'rgba(255,71,87,0.4)',
    pages: [
      { href: '/urgence', label: 'Mode Urgence 3h', icon: 'alert' },
      { href: '/admission', label: 'Admission', icon: 'clipboard' },
      { href: '/bilan', label: 'Bilan diagnostique', icon: 'microscope', badge: '26' },
    ],
  },
  {
    id: 'diagnostic', icon: 'dna', label: 'Diagnostic', color: '#6C7CFF', glow: 'rgba(108,124,255,0.4)',
    pages: [
      { href: '/diagnostic', label: 'Diagnostic IA', icon: 'dna' },
      { href: '/interpellation', label: 'Interpellation', icon: 'warning' },
      { href: '/case-matching', label: 'Case-Matching', icon: 'cycle', badge: '4' },
      { href: '/cross-pathologie', label: 'Cross-Pathologie', icon: 'cycle' },
    ],
  },
  {
    id: 'traitement', icon: 'pill', label: 'Traitement', color: '#2ED573', glow: 'rgba(46,213,115,0.4)',
    pages: [
      { href: '/recommandations', label: 'Recommandations', icon: 'pill', badge: '4L' },
      { href: '/pharmacovigilance', label: 'Pharmacovigilance', icon: 'shield' },
      { href: '/experts', label: 'Consensus Expert', icon: 'books', badge: '5' },
    ],
  },
  {
    id: 'monitoring', icon: 'eeg', label: 'Monitoring', color: '#2FD1C8', glow: 'rgba(47,209,200,0.4)',
    pages: [
      { href: '/cockpit', label: 'Cockpit Vital', icon: 'eeg' },
      { href: '/engines', label: 'Pipeline 5 Moteurs', icon: 'brain' },
      { href: '/timeline', label: 'Timeline', icon: 'chart' },
      { href: '/suivi', label: 'Suivi J+2/5/7', icon: 'chart' },
    ],
  },
  {
    id: 'neurocore', icon: 'brain', label: 'NeuroCore', color: '#B96BFF', glow: 'rgba(185,107,255,0.4)',
    pages: [
      { href: '/neurocore', label: 'Moteur de Connaissance', icon: 'brain' },
      { href: '/neurocore?tab=eeg', label: 'EEG', icon: 'eeg' },
      { href: '/neurocore?tab=irm', label: 'IRM', icon: 'brain' },
      { href: '/neurocore?tab=biomarkers', label: 'Biomarqueurs', icon: 'dna' },
      { href: '/neurocore?tab=redflags', label: 'Red Flags & Pièges', icon: 'warning' },
    ],
  },
]

const SECONDARY = [
  {
    label: 'SYNTHÈSE',
    pages: [
      { href: '/synthese', label: 'Synthèse globale', icon: 'clipboard' },
      { href: '/famille', label: 'Espace Famille', icon: 'family' },
      { href: '/staff', label: 'Staff / RCP', icon: 'family' },
      { href: '/audit', label: 'Audit Trail', icon: 'clipboard' },
      { href: '/export', label: 'Export PDF', icon: 'export' },
    ],
  },
  {
    label: 'RESSOURCES',
    pages: [
      { href: '/observatory', label: 'Observatory', icon: 'cycle' },
      { href: '/evidence', label: 'Evidence Vault', icon: 'books' },
      { href: '/demo', label: 'Démo Inès', icon: 'play' },
      { href: '/onboarding', label: 'Onboarding', icon: 'play' },
      { href: '/about', label: 'About', icon: 'heart' },
    ],
  },
]

function isInCorridor(pathname: string, corridor: Corridor) {
  return corridor.pages.some(p => pathname === p.href || pathname.startsWith(p.href + '/'))
}

export default function Sidebar({ onToggle, isMobile = false }: { collapsed?: boolean; onToggle: () => void; isMobile?: boolean }) {
  const pathname = usePathname()
  const [openPanel, setOpenPanel] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpenPanel(null); setShowMore(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenPanel(null); setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /* ── Mobile: full labels ── */
  if (isMobile) {
    return (
      <aside className="glass-card" style={{
        width: '280px', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        borderRight: '1px solid rgba(108,124,255,0.08)', borderRadius: 0,
      }}>
        <div style={{
          padding: 'var(--p-space-4) var(--p-space-5)', borderBottom: 'var(--p-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px',
        }}>
          <Link href="/welcome" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
            <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={28} height={28} style={{ borderRadius: 6, filter: 'drop-shadow(0 0 6px rgba(108,124,255,0.3))' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em' }}>PULSAR</span>
            <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', padding: '2px 6px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-sm)' }}>V16</span>
          </Link>
          <button onClick={onToggle} style={{ background: 'none', border: 'none', color: 'var(--p-text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          <MobItem href="/dashboard" icon="chart" label="Cockpit" active={pathname === '/dashboard'} color="var(--p-vps)" />
          {CORRIDORS.map(c => (
            <div key={c.id}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: c.color, letterSpacing: '1.5px', padding: '12px 20px 4px' }}>{c.label.toUpperCase()}</div>
              {c.pages.map(p => <MobItem key={p.href} href={p.href} icon={p.icon} label={p.label} active={pathname === p.href} color={c.color} badge={p.badge} />)}
            </div>
          ))}
          {SECONDARY.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1.5px', padding: '12px 20px 4px' }}>{s.label}</div>
              {s.pages.map(p => <MobItem key={p.href} href={p.href} icon={p.icon} label={p.label} active={pathname === p.href} color="var(--p-text-muted)" />)}
            </div>
          ))}
        </nav>
        <div style={{ padding: 'var(--p-space-3)', borderTop: 'var(--p-border)', display: 'flex', justifyContent: 'center' }}><ThemeToggle /></div>
      </aside>
    )
  }

  /* ── Desktop: Rail + slide panel ── */
  return (
    <div ref={panelRef} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, display: 'flex' }}>
      {/* Rail — 64px */}
      <aside className="glass-card" style={{
        width: '64px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderRight: '1px solid rgba(108,124,255,0.08)', borderRadius: 0, paddingTop: '8px',
      }}>
        <Link href="/welcome" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px', borderBottom: 'var(--p-border)', width: '100%', marginBottom: '8px' }}>
          <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={32} height={32} style={{ borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(108,124,255,0.4))' }} />
          <span style={{ fontSize: '7px', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.15em', marginTop: '4px' }}>PULSAR</span>
        </Link>

        <RailBtn icon="chart" label="Cockpit" color="var(--p-vps)" active={pathname === '/dashboard'} onClick={() => { setOpenPanel(null); setShowMore(false) }} href="/dashboard" />
        <div style={{ width: '32px', height: '1px', background: 'var(--p-gray-1)', margin: '4px 0' }} />

        {CORRIDORS.map(c => (
          <RailBtn key={c.id} icon={c.icon} label={c.label} color={c.color} active={isInCorridor(pathname, c)} highlight={openPanel === c.id}
            onClick={() => { setOpenPanel(openPanel === c.id ? null : c.id); setShowMore(false) }} />
        ))}

        <div style={{ width: '32px', height: '1px', background: 'var(--p-gray-1)', margin: '4px 0' }} />
        <RailBtn icon="books" label="Plus" color="var(--p-text-muted)" active={false} highlight={showMore}
          onClick={() => { setShowMore(!showMore); setOpenPanel(null) }} />

        <div style={{ flex: 1 }} />
        <RailBtn icon="clipboard" label="CDC" color="var(--p-tpe)" active={pathname === '/project'}
          onClick={() => { setOpenPanel(null); setShowMore(false) }} href="/project" />
        <div style={{ padding: '8px 0', borderTop: 'var(--p-border)', width: '100%', display: 'flex', justifyContent: 'center' }}><ThemeToggle /></div>
      </aside>

      {/* Slide panel — corridor */}
      {openPanel && (() => {
        const c = CORRIDORS.find(x => x.id === openPanel)!
        return (
          <div className="glass-card" style={{
            width: '220px', minHeight: '100vh',
            borderRight: '1px solid rgba(108,124,255,0.08)', borderRadius: 0,
            animation: 'slideInLeft 0.2s var(--p-ease) both',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: `2px solid ${c.color}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Picto name={c.icon} size={20} glow glowColor={c.glow} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: c.color, letterSpacing: '0.05em' }}>{c.label.toUpperCase()}</span>
            </div>
            <nav style={{ padding: '8px 0' }}>
              {c.pages.map(p => {
                const a = pathname === p.href
                return (
                  <Link key={p.href} href={p.href} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none',
                    background: a ? `${c.color}15` : 'transparent',
                    borderLeft: a ? `3px solid ${c.color}` : '3px solid transparent',
                    color: a ? 'var(--p-text)' : 'var(--p-text-muted)', transition: 'all 150ms',
                  }}>
                    <Picto name={p.icon} size={16} glow={a} glowColor={a ? c.glow : undefined} />
                    <span style={{ fontSize: '13px', fontWeight: a ? 600 : 400, flex: 1 }}>{p.label}</span>
                    {p.badge && <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 600, padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: `${c.color}20`, color: c.color }}>{p.badge}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        )
      })()}

      {/* Slide panel — more */}
      {showMore && (
        <div className="glass-card" style={{
          width: '220px', minHeight: '100vh',
          borderRight: '1px solid rgba(108,124,255,0.08)', borderRadius: 0,
          animation: 'slideInLeft 0.2s var(--p-ease) both', overflowY: 'auto',
        }}>
          {SECONDARY.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1.5px', padding: '16px 16px 6px' }}>{s.label}</div>
              {s.pages.map(p => {
                const a = pathname === p.href
                return (
                  <Link key={p.href} href={p.href} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', textDecoration: 'none',
                    background: a ? 'var(--p-vps-dim)' : 'transparent',
                    borderLeft: a ? '3px solid var(--p-vps)' : '3px solid transparent',
                    color: a ? 'var(--p-text)' : 'var(--p-text-muted)',
                  }}>
                    <Picto name={p.icon} size={15} />
                    <span style={{ fontSize: '13px', fontWeight: a ? 600 : 400 }}>{p.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ── */

function RailBtn({ icon, label, color, active, highlight, onClick, href }: {
  icon: string; label: string; color: string; active: boolean; highlight?: boolean; onClick: () => void; href?: string
}) {
  const s: React.CSSProperties = {
    width: '48px', height: '48px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '2px',
    borderRadius: 'var(--p-radius-lg)', cursor: 'pointer', border: 'none',
    background: active ? `${color}18` : highlight ? 'var(--p-bg-hover)' : 'transparent',
    color: active ? color : 'var(--p-text-muted)',
    transition: 'all 150ms', margin: '2px 0', position: 'relative', textDecoration: 'none',
  }
  const inner = (
    <>
      {active && <div style={{ position: 'absolute', left: 0, top: '8px', bottom: '8px', width: '3px', borderRadius: '0 3px 3px 0', background: color }} />}
      <Picto name={icon} size={20} glow={active} glowColor={active ? `${color}60` : undefined} />
      <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1 }}>{label}</span>
    </>
  )
  if (href) return <Link href={href} onClick={onClick} style={s}>{inner}</Link>
  return <button onClick={onClick} style={s}>{inner}</button>
}

function MobItem({ href, icon, label, active, color, badge }: {
  href: string; icon: string; label: string; active: boolean; color: string; badge?: string
}) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', textDecoration: 'none',
      background: active ? `${color}15` : 'transparent',
      borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
      color: active ? 'var(--p-text)' : 'var(--p-text-muted)',
    }}>
      <Picto name={icon} size={16} glow={active} />
      <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)' }}>{badge}</span>}
    </Link>
  )
}
