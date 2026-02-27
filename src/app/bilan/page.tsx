'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'

const categories = [
  { name: 'Biologie standard', icon: 'blood', color: 'var(--p-vps)', exams: [
    { name: 'NFS + frottis', hint: 'Leucocytes, hémoglobine, plaquettes — dépistage infection/hémorragie' },
    { name: 'CRP / PCT', hint: 'Marqueurs inflammatoires — CRP ≥50 = alerte, PCT ≥2 = bactérien probable' },
    { name: 'Iono + glycémie + lactates', hint: 'Déséquilibres métaboliques, lactates >4 = hypoperfusion' },
    { name: 'Bilan hépatique', hint: 'ASAT/ALAT — toxicité médicamenteuse, atteinte hépatique' },
    { name: 'Coagulation', hint: 'TP, TCA, fibrinogène — risque hémorragique, CIVD' },
    { name: 'Ferritine + LDH + TG', hint: 'Ferritine ≥500 = activation macrophagique, SAM?' },
    { name: 'Vit B12 + folates', hint: 'Carences — diagnostic différentiel neurologique' },
    { name: 'TSH + T4L', hint: 'Thyroïde — encéphalopathie de Hashimoto?' },
  ]},
  { name: 'Auto-immunité', icon: 'dna', color: 'var(--p-tde)', exams: [
    { name: 'ANA + anti-dsDNA + C3/C4', hint: 'Lupus, connectivite — complément consommé?' },
    { name: 'Dosage cytokinaire', hint: 'IL-1β, IL-6, IL-10, TNF-α — profil tempête inflammatoire' },
    { name: 'Panel anticorps complet', hint: 'Anti-NMDAR, LGI1, CASPR2, AMPAR, GABAR — clé diagnostique' },
  ]},
  { name: 'LCR', icon: 'virus', color: 'var(--p-pve)', exams: [
    { name: 'Cytologie + protéinorachie + glycorachie', hint: 'Pléiocytose >5 cellules, protéines >0.4g/L = inflammation' },
    { name: 'Culture + PCR virale', hint: 'Exclusion infection — HSV, VZV, entérovirus' },
    { name: 'Bandes oligoclonales + index IgG', hint: 'Synthèse intrathécale — marqueur auto-immunité' },
    { name: 'Anti-neuronaux LCR', hint: 'Plus sensible que sérum pour anti-NMDAR' },
    { name: 'Cytokines LCR', hint: 'IL-6 élevé = inflammation active du SNC' },
    { name: 'Métagénomique', hint: 'Séquençage non biaisé — agents rares ou inattendus' },
  ]},
  { name: 'Imagerie', icon: 'eeg', color: 'var(--p-ewe)', exams: [
    { name: 'IRM initiale (FLAIR, diffusion, T1 gado)', hint: 'Hypersignaux temporaux/insulaires = encéphalite limbique' },
    { name: 'IRM contrôle J+7-14', hint: 'Évolution lésionnelle — réponse au traitement' },
    { name: 'Angio-IRM si vasculite', hint: 'Sténoses vasculaires — vasculite cérébrale?' },
  ]},
  { name: 'Neurophysiologie', icon: 'brain', color: 'var(--p-tpe)', exams: [
    { name: 'EEG continu ≥24h', hint: 'Crises infracliniques, extreme delta brush = anti-NMDAR' },
    { name: 'Réévaluation post-sédation', hint: 'EEG contrôle — crises persistantes sous sédation?' },
    { name: 'Classification pattern', hint: 'Pattern EEG : LPD, GPD, GRDA — AUC 0.72 (Shakeshaft)' },
  ]},
  { name: 'Immunologie', icon: 'shield', color: 'var(--p-info)', exams: [
    { name: 'Anti-neuronaux sériques', hint: 'Anti-NMDAR, LGI1, CASPR2 — à confirmer dans le LCR' },
    { name: 'Immunophénotypage', hint: 'Lymphocytes B/T — expansion clonale?' },
    { name: 'Complément CH50/C3/C4 + Panel génétique', hint: 'Déficit immunitaire sous-jacent' },
  ]},
]

type Status = 'pending' | 'inprogress' | 'done'
const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'À faire', color: 'var(--p-text-dim)', bg: 'var(--p-bg-elevated)', dot: 'var(--p-gray-3)' },
  inprogress: { label: 'En cours', color: 'var(--p-warning)', bg: 'rgba(255,179,71,0.1)', dot: 'var(--p-warning)' },
  done: { label: 'Résultat ✓', color: 'var(--p-success)', bg: 'rgba(46,213,115,0.1)', dot: 'var(--p-success)' },
}

export default function BilanPage() {
  const total = categories.reduce((s, c) => s + c.exams.length, 0)
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const cycleStatus = (exam: string) => {
    const current = statuses[exam] || 'pending'
    const next: Status = current === 'pending' ? 'inprogress' : current === 'inprogress' ? 'done' : 'pending'
    setStatuses({ ...statuses, [exam]: next })
  }

  const doneCount = Object.values(statuses).filter(s => s === 'done').length
  const inProgressCount = Object.values(statuses).filter(s => s === 'inprogress').length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="page-enter" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="microscope" size={36} glow glowColor="rgba(185,107,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Bilan diagnostique</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{total} examens · 6 catégories · Cliquer pour changer le statut</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--p-space-4) var(--p-space-5)', marginBottom: 'var(--p-space-5)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-6)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 600, color: 'var(--p-text-muted)' }}>Progression</span>
            <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 800, fontFamily: 'var(--p-font-mono)', color: pct === 100 ? 'var(--p-success)' : 'var(--p-vps)' }}>{pct}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--p-gray-1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--p-success)' : 'linear-gradient(90deg, var(--p-vps), var(--p-tde))', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: 'var(--p-success)' }}>{doneCount}</div>
          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textTransform: 'uppercase' }}>résultats</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: 'var(--p-warning)' }}>{inProgressCount}</div>
          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textTransform: 'uppercase' }}>en cours</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: 'var(--p-text-dim)' }}>{total - doneCount - inProgressCount}</div>
          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textTransform: 'uppercase' }}>à faire</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-4)' }} className="grid-2-1">
        {categories.map((cat, ci) => {
          const catDone = cat.exams.filter(e => statuses[e.name] === 'done').length
          const catPct = Math.round((catDone / cat.exams.length) * 100)
          return (
            <div key={ci} className="card-interactive glass-card" style={{ padding: 'var(--p-space-4)', borderTop: `3px solid ${cat.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-3)' }}>
                <Picto name={cat.icon} size={24} glow glowColor={cat.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: cat.color }}>{cat.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{catDone}/{cat.exams.length}</div>
                </div>
                {catPct === 100 && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'rgba(46,213,115,0.15)', color: 'var(--p-success)', fontWeight: 700 }}>COMPLET</span>}
              </div>
              <div style={{ height: '2px', background: 'var(--p-gray-1)', borderRadius: '1px', overflow: 'hidden', marginBottom: 'var(--p-space-3)' }}>
                <div style={{ width: `${catPct}%`, height: '100%', background: cat.color, transition: 'width 0.3s' }} />
              </div>
              {cat.exams.map((exam, ei) => {
                const st = statuses[exam.name] || 'pending'
                const cfg = statusConfig[st]
                const isExp = expanded === exam.name
                return (
                  <div key={ei} style={{ marginBottom: '2px' }}>
                    <div onClick={() => cycleStatus(exam.name)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 10px', borderRadius: 'var(--p-radius-md)',
                      cursor: 'pointer', transition: 'all 150ms',
                      background: st !== 'pending' ? cfg.bg : 'transparent',
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--p-text-xs)', color: st === 'done' ? 'var(--p-text)' : 'var(--p-text-muted)', flex: 1, fontWeight: st === 'done' ? 600 : 400 }}>{exam.name}</span>
                      <span style={{ fontSize: '9px', padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: cfg.bg, color: cfg.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                      <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : exam.name) }}
                        style={{ background: 'none', border: 'none', color: 'var(--p-text-dim)', cursor: 'pointer', fontSize: '10px', padding: '2px', transform: isExp ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</button>
                    </div>
                    {isExp && (
                      <div style={{ padding: '6px 10px 8px 24px', fontSize: '11px', color: 'var(--p-text-dim)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: `2px solid ${cat.color}30`, marginLeft: '3px' }}>{exam.hint}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
