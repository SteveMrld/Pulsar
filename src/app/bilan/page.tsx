'use client'
import { useState } from 'react'

const categories = [
  { name: 'Biologie standard', color: 'var(--p-vps)', exams: ['NFS + frottis', 'CRP / PCT', 'Iono + glycémie + lactates', 'Bilan hépatique', 'Coagulation', 'Ferritine + LDH + TG', 'Vit B12 + folates', 'TSH + T4L'] },
  { name: 'Auto-immunité', color: 'var(--p-tde)', exams: ['ANA + anti-dsDNA + C3/C4', 'Dosage cytokinaire (IL-1b, IL-6, IL-10, TNF-a)', 'Panel anticorps complet'] },
  { name: 'LCR', color: 'var(--p-pve)', exams: ['Cytologie + protéinorachie + glycorachie', 'Culture + PCR virale', 'Bandes oligoclonales + index IgG', 'Anti-neuronaux LCR', 'Cytokines LCR', 'Métagénomique'] },
  { name: 'Imagerie', color: 'var(--p-ewe)', exams: ['IRM initiale (FLAIR, diffusion, T1 gado)', 'IRM contrôle J+7-14', 'Angio-IRM si vasculite'] },
  { name: 'Neurophysiologie', color: 'var(--p-tpe)', exams: ['EEG continu ≥24h', 'Réévaluation post-sédation', 'Classification pattern'] },
  { name: 'Immunologie', color: 'var(--p-info)', exams: ['Anti-neuronaux sériques', 'Immunophénotypage', 'Complément CH50/C3/C4 + Panel génétique'] },
]

type Status = 'pending' | 'inprogress' | 'done'
const statusLabels: Record<Status, { label: string; color: string; bg: string }> = {
  pending: { label: 'À faire', color: 'var(--p-text-dim)', bg: 'var(--p-bg-elevated)' },
  inprogress: { label: 'En cours', color: 'var(--p-warning)', bg: 'var(--p-warning-bg)' },
  done: { label: 'Résultat', color: 'var(--p-success)', bg: 'var(--p-success-bg)' },
}

export default function BilanPage() {
  const total = categories.reduce((s, c) => s + c.exams.length, 0)
  const [statuses, setStatuses] = useState<Record<string, Status>>({})

  const cycleStatus = (exam: string) => {
    const current = statuses[exam] || 'pending'
    const next: Status = current === 'pending' ? 'inprogress' : current === 'inprogress' ? 'done' : 'pending'
    setStatuses({ ...statuses, [exam]: next })
  }

  const doneCount = Object.values(statuses).filter(s => s === 'done').length

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-pve)' }} />
        <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Bilan diagnostique</h1>
        <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)' }}>{doneCount}/{total}</span>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-4)' }}>26 examens, 6 catégories — Cliquez pour changer le statut</p>

      {/* Progress */}
      <div style={{ height: '4px', background: 'var(--p-gray-1)', borderRadius: '2px', overflow: 'hidden', marginBottom: 'var(--p-space-6)' }}>
        <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: 'var(--p-success)', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-4)' }}>
        {categories.map((cat, ci) => (
          <div key={ci} className="animate-in" style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-4)', borderTop: `3px solid ${cat.color}`, animationDelay: `${ci * 80}ms` }}>
            <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: cat.color, marginBottom: 'var(--p-space-3)' }}>{cat.name}</div>
            {cat.exams.map((exam, ei) => {
              const st = statuses[exam] || 'pending'
              const { label, color, bg } = statusLabels[st]
              return (
                <div key={ei} onClick={() => cycleStatus(exam)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 'var(--p-radius-md)', cursor: 'pointer', marginBottom: '3px', background: st === 'done' ? 'var(--p-success-bg)' : 'transparent', transition: 'all 150ms' }}>
                  <span style={{ fontSize: 'var(--p-text-xs)', color: st === 'done' ? 'var(--p-text)' : 'var(--p-text-muted)' }}>{exam}</span>
                  <span style={{ fontSize: '9px', padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: bg, color, fontWeight: 600 }}>{label}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
