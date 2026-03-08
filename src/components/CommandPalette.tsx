'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'

// ══════════════════════════════════════════════════════════════
// COMMAND PALETTE — Ctrl+K
// Navigation rapide + recherche patients + actions
// ══════════════════════════════════════════════════════════════

const PAGES = [
  { label: 'Dashboard',         href: '/dashboard',        icon: '◈', color: '#6C7CFF', tag: 'page' },
  { label: 'File active',       href: '/patients',         icon: '◉', color: '#6C7CFF', tag: 'page' },
  { label: 'Discovery Engine',  href: '/research',         icon: '◎', color: '#10B981', tag: 'page' },
  { label: 'Lab',               href: '/lab',              icon: '⬡', color: '#10B981', tag: 'page' },
  { label: 'NeuroCore',         href: '/neurocore',        icon: '◈', color: '#8B5CF6', tag: 'page' },
  { label: 'Observatory',       href: '/observatory',      icon: '◉', color: '#2FD1C8', tag: 'page' },
  { label: 'Case Matching',     href: '/case-matching',    icon: '◎', color: '#2FD1C8', tag: 'page' },
  { label: 'Cross-Pathologie',  href: '/cross-pathologie', icon: '◈', color: '#FFB347', tag: 'page' },
  { label: 'Bilan',             href: '/bilan',            icon: '◉', color: '#8B5CF6', tag: 'page' },
  { label: 'Équipe / Staff',    href: '/staff',            icon: '◈', color: '#6C7CFF', tag: 'page' },
  { label: 'Export',            href: '/export',           icon: '◎', color: '#2FD1C8', tag: 'page' },
  { label: 'Cas Alejandro',     href: '/usecase/alejandro',icon: '✦', color: '#F5A623', tag: 'cas' },
]

const PATIENTS = [
  { label: 'Inès M. — FIRES',       href: '/patient/ines/cockpit',  icon: '⬡', color: '#EF4444', tag: 'patient', detail: '4 ans · VPS 95' },
  { label: 'Lucas R. — Anti-NMDAR', href: '/patient/lucas/cockpit', icon: '⬡', color: '#F59E0B', tag: 'patient', detail: '14 ans · VPS 78' },
  { label: 'Amara T. — MOGAD',      href: '/patient/amara/cockpit', icon: '⬡', color: '#8B5CF6', tag: 'patient', detail: '8 ans · VPS 62' },
  { label: 'Noah B. — Épil. focale',href: '/patient/noah/cockpit',  icon: '⬡', color: '#10B981', tag: 'patient', detail: '6 ans · VPS 28' },
]

const ALL_ITEMS = [...PATIENTS, ...PAGES]

const TAG_COLOR: Record<string, string> = {
  patient: '#EF4444',
  page:    '#6C7CFF',
  cas:     '#F5A623',
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useLang()

  const filtered = query.trim() === ''
    ? ALL_ITEMS
    : ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.tag === 'patient' && (item as any).detail?.toLowerCase().includes(query.toLowerCase()))
      )

  const handleOpen = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelected(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const handleSelect = useCallback((href: string) => {
    handleClose()
    router.push(href)
  }, [handleClose, router])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        open ? handleClose() : handleOpen()
      }
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleOpen, handleClose])

  // Arrow navigation
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) handleSelect(filtered[selected].href)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected, handleSelect])

  // Reset selection on query change
  useEffect(() => { setSelected(0) }, [query])

  if (!open) return (
    <button
      onClick={handleOpen}
      title="Recherche rapide (Ctrl+K)"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
        background: 'rgba(108,124,255,0.06)',
        border: '1px solid rgba(108,124,255,0.12)',
        color: 'var(--p-text-dim)', fontSize: 10,
        fontFamily: 'var(--p-font-mono)',
        transition: 'all 0.15s',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <span style={{ opacity: 0.6 }}>Ctrl+K</span>
    </button>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, width: '90%', maxWidth: 520,
        background: '#0F1525',
        border: '1px solid rgba(108,124,255,0.2)',
        borderRadius: 16,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid rgba(108,124,255,0.08)',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
            <circle cx="7" cy="7" r="5" stroke="#6C7CFF" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#6C7CFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('Chercher un patient, une page, une action…', 'Search patients, pages, actions…')}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--p-text)', fontFamily: 'var(--p-font-mono)',
            }}
          />
          <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
              {t('Aucun résultat', 'No results')}
            </div>
          ) : filtered.map((item, i) => (
            <div
              key={item.href}
              onClick={() => handleSelect(item.href)}
              onMouseEnter={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 16px', cursor: 'pointer',
                background: i === selected ? 'rgba(108,124,255,0.08)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontSize: 14, color: item.color, minWidth: 18, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: i === selected ? '#fff' : 'var(--p-text)', fontFamily: 'var(--p-font-mono)' }}>{item.label}</div>
                {(item as any).detail && (
                  <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 1 }}>{(item as any).detail}</div>
                )}
              </div>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: TAG_COLOR[item.tag] || '#6C7CFF',
                background: `${TAG_COLOR[item.tag] || '#6C7CFF'}12`,
                border: `1px solid ${TAG_COLOR[item.tag] || '#6C7CFF'}20`,
                padding: '2px 7px', borderRadius: 4,
              }}>{item.tag}</span>
              {i === selected && (
                <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px' }}>↵</kbd>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex', gap: 16, padding: '8px 16px',
          borderTop: '1px solid rgba(108,124,255,0.06)',
          fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--p-font-mono)',
        }}>
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>ESC fermer</span>
        </div>
      </div>
    </>
  )
}
