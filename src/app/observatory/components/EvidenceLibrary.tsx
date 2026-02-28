'use client'
import { useMemo, useState } from 'react'
import type { EvidenceItem } from '@/lib/data/observatoryTypes'
import Picto from '@/components/Picto'

export default function EvidenceLibrary({ evidence }: { evidence: EvidenceItem[] }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('ALL')

  const topics = useMemo(() => {
    const t = new Set(evidence.map(e => e.topic))
    return ['ALL', ...Array.from(t)]
  }, [evidence])

  const grouped = useMemo(() => {
    const items = filter === 'ALL' ? evidence : evidence.filter(e => e.topic === filter)
    const g: Record<string, EvidenceItem[]> = {}
    for (const e of items) {
      const k = e.topic || 'Autre';
      (g[k] = g[k] || []).push(e)
    }
    return g
  }, [evidence, filter])

  return (
    <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--p-space-4)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="clipboard" size={22} glow glowColor="var(--p-pve)" />
          <div>
            <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Evidence Library</span>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{evidence.length} références sourcées</div>
          </div>
        </div>
        <button onClick={() => setOpen(v => !v)} style={{
          padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
          background: open ? 'var(--p-pve-dim)' : 'var(--p-bg-elevated)',
          border: open ? '1px solid var(--p-pve)' : 'var(--p-border)',
          color: open ? 'var(--p-pve)' : 'var(--p-text-muted)',
          fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        }}>
          {open ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      {!open ? (
        <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '12px' }}>
          Cliquez <strong>Afficher</strong> pour voir les références scientifiques sourcées.
        </div>
      ) : (
        <>
          {/* Topic filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--p-space-4)' }}>
            {topics.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
                background: filter === t ? 'var(--p-pve-dim)' : 'var(--p-dark-4)',
                border: filter === t ? '1px solid var(--p-pve)' : '1px solid transparent',
                color: filter === t ? 'var(--p-pve)' : 'var(--p-text-dim)',
                fontSize: '10px', fontWeight: 600, cursor: 'pointer',
              }}>{t === 'ALL' ? 'Toutes' : t}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(grouped).map(([topic, items]) => (
              <div key={topic} style={{ padding: '12px 16px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--p-pve)' }}>{topic}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-pve-dim)', fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-pve)' }}>{items.length}</span>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} style={{ paddingTop: idx > 0 ? '10px' : 0, borderTop: idx > 0 ? '1px solid var(--p-dark-4)' : 'none', marginTop: idx > 0 ? '10px' : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--p-text)' }}>{it.metric}</div>
                    <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '4px' }}>
                      <strong style={{ color: 'var(--p-text)' }}>{it.value}</strong> {it.unit}
                      {it.population && <> · {it.population}</>}
                      {it.geography && <> · {it.geography}</>}
                    </div>
                    {it.note && <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '4px', fontStyle: 'italic' }}>{it.note}</div>}
                    <div style={{ marginTop: '6px' }}>
                      <a href={it.sourceUrl} target="_blank" rel="noreferrer" style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
                        background: 'var(--p-dark-4)', color: 'var(--p-info)', fontSize: '10px', fontWeight: 600, textDecoration: 'none',
                      }}>↗ {it.sourceTitle}</a>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
