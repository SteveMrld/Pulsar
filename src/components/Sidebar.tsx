'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const NAV_SECTIONS = [
  {
    label: 'GÉNÉRAL',
    items: [
      { href: '/dashboard', icon: '🏠', label: 'Dashboard', badge: '' },
      { href: '/project', icon: '📋', label: 'Nouveau CDC', badge: '' },
    ]
  },
  {
    label: 'PHASE 1 — ARRIVÉE',
    items: [
      { href: '/urgence', icon: '🚨', label: 'Mode Urgence 3h', badge: '' },
      { href: '/bilan', icon: '🔬', label: 'Bilan diagnostique', badge: '26' },
    ]
  },
  {
    label: 'PHASE 2 — DIAGNOSTIC',
    items: [
      { href: '/diagnostic', icon: '🧬', label: 'Diagnostic IA', badge: '' },
      { href: '/interpellation', icon: '⚠️', label: 'Interpellation', badge: '' },
      { href: '/case-matching', icon: '🔄', label: 'Case-Matching', badge: '4' },
    ]
  },
  {
    label: 'PHASE 3 — TRAITEMENT',
    items: [
      { href: '/recommandations', icon: '💊', label: 'Recommandations', badge: '4L' },
      { href: '/pharmacovigilance', icon: '🛡️', label: 'Pharmacovigilance', badge: '' },
    ]
  },
  {
    label: 'PHASE 4 — MONITORING',
    items: [
      { href: '/cockpit', icon: '📊', label: 'Cockpit Vital', badge: '' },
      { href: '/engines/vps', icon: '💜', label: 'VPS Engine', badge: '' },
      { href: '/engines/tde', icon: '💚', label: 'TDE Engine', badge: '' },
      { href: '/engines/pve', icon: '💟', label: 'PVE Engine', badge: '' },
      { href: '/engines/ewe', icon: '🔴', label: 'EWE Engine', badge: '' },
      { href: '/engines/tpe', icon: '🟠', label: 'TPE Engine', badge: '' },
      { href: '/timeline', icon: '📅', label: 'Timeline', badge: '' },
      { href: '/suivi', icon: '📈', label: 'Suivi J+2/5/7', badge: '' },
    ]
  },
  {
    label: 'PHASE 5 — SYNTHÈSE',
    items: [
      { href: '/synthese', icon: '📑', label: 'Synthèse globale', badge: '' },
      { href: '/famille', icon: '👨‍👩‍👧', label: 'Espace Famille', badge: '' },
      { href: '/staff', icon: '👥', label: 'Staff / RCP', badge: '' },
      { href: '/export', icon: '📤', label: 'Export PDF', badge: '' },
    ]
  },
  {
    label: 'RESSOURCES',
    items: [
      { href: '/evidence', icon: '📚', label: 'Evidence Vault', badge: '17' },
      { href: '/experts', icon: '🎓', label: 'Consensus Expert', badge: '5' },
      { href: '/demo', icon: '▶️', label: 'Démo Inès', badge: '13' },
      { href: '/about', icon: '💙', label: 'About / Mémorial', badge: '' },
    ]
  },
]

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: collapsed ? '60px' : '240px',
      minHeight: '100vh',
      background: 'var(--p-bg-card)',
      borderRight: 'var(--p-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 250ms var(--p-ease)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? 'var(--p-space-4) var(--p-space-2)' : 'var(--p-space-4) var(--p-space-5)',
        borderBottom: 'var(--p-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '60px',
      }}>
        {!collapsed && (
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em' }}>PULSAR</span>
            <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', padding: '2px 6px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-sm)' }}>V15</span>
          </Link>
        )}
        <button onClick={onToggle} style={{
          background: 'none', border: 'none', color: 'var(--p-text-muted)',
          cursor: 'pointer', fontSize: '16px', padding: '4px',
        }}>
          {collapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: 'var(--p-space-3) 0' }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 'var(--p-space-3)' }}>
            {!collapsed && (
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)',
                letterSpacing: '1.5px', padding: '0 var(--p-space-5)',
                marginBottom: 'var(--p-space-1)',
              }}>
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)',
                  padding: collapsed ? 'var(--p-space-2)' : 'var(--p-space-2) var(--p-space-5)',
                  textDecoration: 'none', transition: 'all 150ms',
                  background: active ? 'var(--p-vps-dim)' : 'transparent',
                  borderLeft: active ? '3px solid var(--p-vps)' : '3px solid transparent',
                  color: active ? 'var(--p-text)' : 'var(--p-text-muted)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: active ? 600 : 400, flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 600,
                          padding: '1px 6px', borderRadius: 'var(--p-radius-full)',
                          background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)',
                        }}>{item.badge}</span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: 'var(--p-space-3) var(--p-space-4)',
        borderTop: 'var(--p-border)',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <ThemeToggle />
      </div>
    </aside>
  )
}
