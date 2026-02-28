"use client"
import { useState, useMemo } from 'react'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

const categories = [
  { name: 'Biologie standard', icon: 'blood', color: 'var(--p-vps)', exams: [
    { name: 'NFS + frottis', hint: 'Leucocytes, hemoglobine, plaquettes', keys: ['wbc','platelets'] },
    { name: 'CRP / PCT', hint: 'Marqueurs inflammatoires — CRP >=50 = alerte, PCT >=2 = bacterien probable', keys: ['crp','pct'] },
    { name: 'Iono + glycemie + lactates', hint: 'Desequilibres metaboliques, lactates >4 = hypoperfusion', keys: ['lactate'] },
    { name: 'Bilan hepatique', hint: 'ASAT/ALAT — toxicite medicamenteuse, atteinte hepatique', keys: [] },
    { name: 'Coagulation', hint: 'TP, TCA, fibrinogene — risque hemorragique, CIVD', keys: ['platelets'] },
    { name: 'Ferritine + LDH + TG', hint: 'Ferritine >=500 = activation macrophagique, SAM?', keys: ['ferritin'] },
    { name: 'Vit B12 + folates', hint: 'Carences — diagnostic differentiel neurologique', keys: [] },
    { name: 'TSH + T4L', hint: 'Thyroide — encephalopathie de Hashimoto?', keys: [] },
  ]},
  { name: 'Auto-immunite', icon: 'dna', color: 'var(--p-tde)', exams: [
    { name: 'ANA + anti-dsDNA + C3/C4', hint: 'Lupus, connectivite — complement consomme?', keys: [] },
    { name: 'Dosage cytokinaire', hint: 'IL-1b, IL-6, IL-10, TNF-a — profil tempete inflammatoire', keys: ['ferritin','crp'] },
    { name: 'Panel anticorps complet', hint: 'Anti-NMDAR, LGI1, CASPR2, AMPAR, GABAR — cle diagnostique', keys: ['antibodies'] },
  ]},
  { name: 'LCR', icon: 'virus', color: 'var(--p-pve)', exams: [
    { name: 'Cytologie + proteinorachie', hint: 'Pleiocytose >5 cellules, proteines >0.4g/L = inflammation', keys: ['csfCells','csfProtein'] },
    { name: 'Culture + PCR virale', hint: 'Exclusion infection — HSV, VZV, enterovirus', keys: [] },
    { name: 'Bandes oligoclonales + index IgG', hint: 'Synthese intrathecale — marqueur auto-immunite', keys: [] },
    { name: 'Anti-neuronaux LCR', hint: 'Plus sensible que serum pour anti-NMDAR', keys: ['antibodies'] },
    { name: 'Cytokines LCR', hint: 'IL-6 eleve = inflammation active du SNC', keys: ['ferritin'] },
    { name: 'Metagenomique', hint: 'Sequencage non biaise — agents rares ou inattendus', keys: [] },
  ]},
  { name: 'Imagerie', icon: 'eeg', color: 'var(--p-ewe)', exams: [
    { name: 'IRM initiale (FLAIR, diffusion, T1 gado)', hint: 'Hypersignaux temporaux/insulaires = encephalite limbique', keys: ['gcs'] },
    { name: 'IRM controle J+7-14', hint: 'Evolution lesionnelle — reponse au traitement', keys: [] },
    { name: 'Angio-IRM si vasculite', hint: 'Stenoses vasculaires — vasculite cerebrale?', keys: [] },
  ]},
  { name: 'Neurophysiologie', icon: 'brain', color: 'var(--p-tpe)', exams: [
    { name: 'EEG continu >=24h', hint: 'Crises infracliniques, extreme delta brush = anti-NMDAR', keys: ['seizures'] },
    { name: 'Reevaluation post-sedation', hint: 'EEG controle — crises persistantes sous sedation?', keys: ['seizures'] },
    { name: 'Classification pattern', hint: 'Pattern EEG : LPD, GPD, GRDA — AUC 0.72 (Shakeshaft)', keys: ['seizures'] },
  ]},
  { name: 'Immunologie', icon: 'shield', color: 'var(--p-info)', exams: [
    { name: 'Anti-neuronaux seriques', hint: 'Anti-NMDAR, LGI1, CASPR2 — a confirmer dans le LCR', keys: ['antibodies'] },
    { name: 'Immunophenotypage', hint: 'Lymphocytes B/T — expansion clonale?', keys: [] },
    { name: 'Complement CH50/C3/C4 + Panel genetique', hint: 'Deficit immunitaire sous-jacent', keys: [] },
  ]},
]

function getPriority(ps: PatientState, keys: string[]): 'urgent' | 'high' | 'normal' {
  for (const k of keys) {
    if (k === 'crp' && ps.biology.crp > 100) return 'urgent'
    if (k === 'pct' && ps.biology.pct > 2) return 'urgent'
    if (k === 'ferritin' && ps.biology.ferritin > 500) return 'urgent'
    if (k === 'lactate' && ps.biology.lactate > 3) return 'urgent'
    if (k === 'wbc' && (ps.biology.wbc > 15 || ps.biology.wbc < 4)) return 'urgent'
    if (k === 'platelets' && ps.biology.platelets < 100) return 'urgent'
    if (k === 'seizures' && ps.neuro.seizures24h > 5) return 'urgent'
    if (k === 'seizures' && ps.neuro.seizures24h > 0) return 'high'
    if (k === 'gcs' && ps.neuro.gcs < 10) return 'urgent'
    if (k === 'gcs' && ps.neuro.gcs < 13) return 'high'
    if (k === 'antibodies' && ps.csf.antibodies !== 'negative') return 'urgent'
    if (k === 'csfCells' && ps.csf.cells > 20) return 'urgent'
    if (k === 'csfCells' && ps.csf.cells > 5) return 'high'
    if (k === 'csfProtein' && ps.csf.protein > 0.6) return 'urgent'
    if (k === 'csfProtein' && ps.csf.protein > 0.4) return 'high'
    if (k === 'crp' && ps.biology.crp > 30) return 'high'
    if (k === 'ferritin' && ps.biology.ferritin > 200) return 'high'
  }
  return 'normal'
}

const priorityConfig = {
  urgent: { label: 'URGENT', color: 'var(--p-critical)', bg: 'rgba(255,71,87,0.12)' },
  high: { label: 'PRIORITAIRE', color: 'var(--p-warning)', bg: 'rgba(255,179,71,0.12)' },
  normal: { label: '', color: '', bg: '' },
}

type Status = 'pending' | 'inprogress' | 'done'
const statusConfig: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'A faire', color: 'var(--p-text-dim)', bg: 'var(--p-bg-elevated)', dot: 'var(--p-gray-3)' },
  inprogress: { label: 'En cours', color: 'var(--p-warning)', bg: 'rgba(255,179,71,0.1)', dot: 'var(--p-warning)' },
  done: { label: 'Resultat OK', color: 'var(--p-success)', bg: 'rgba(46,213,115,0.1)', dot: 'var(--p-success)' },
}

export default function BilanPage() {
  const total = categories.reduce((s, c) => s + c.exams.length, 0)
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [scenario, setScenario] = useState('FIRES')

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const cycleStatus = (exam: string) => {
    const current = statuses[exam] || 'pending'
    const next: Status = current === 'pending' ? 'inprogress' : current === 'inprogress' ? 'done' : 'pending'
    setStatuses({ ...statuses, [exam]: next })
  }

  const doneCount = Object.values(statuses).filter(s => s === 'done').length
  const inProgressCount = Object.values(statuses).filter(s => s === 'inprogress').length
  const pct = Math.round((doneCount / total) * 100)

  const urgentCount = categories.reduce((s, c) => s + c.exams.filter(e => getPriority(ps, e.keys) === 'urgent' && (statuses[e.name] || 'pending') === 'pending').length, 0)

  return (
    <div className="page-enter" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="microscope" size={36} glow glowColor="rgba(185,107,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Bilan diagnostique</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{total} examens - 6 categories - Pipeline connecte - Priorites dynamiques</span>
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} className="hover-lift" style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-pve)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-pve-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-pve)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Progress + urgent banner */}
      <div className="glass-card" style={{ padding: 'var(--p-space-4) var(--p-space-5)', marginBottom: 'var(--p-space-5)', display: 'flex', alignItems: 'center', gap: 'var(--p-space-6)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 600, color: 'var(--p-text-muted)' }}>Progression</span>
            <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 800, fontFamily: 'var(--p-font-mono)', color: pct === 100 ? 'var(--p-success)' : 'var(--p-vps)' }}>{pct}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--p-gray-1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--p-success)' : 'linear-gradient(90deg, var(--p-vps), var(--p-tde))', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
        {urgentCount > 0 && (
          <div style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-lg)', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Picto name="alert" size={14} glow glowColor="var(--p-critical)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-critical)', fontFamily: 'var(--p-font-mono)' }}>{urgentCount} URGENT</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--p-space-4)' }}>
          {[
            { v: doneCount, l: 'resultats', c: 'var(--p-success)' },
            { v: inProgressCount, l: 'en cours', c: 'var(--p-warning)' },
            { v: total - doneCount - inProgressCount, l: 'a faire', c: 'var(--p-text-dim)' },
          ].map((x, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: '50px' }}>
              <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: x.c }}>{x.v}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textTransform: 'uppercase' }}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-4)' }} className="grid-2-1">
        {categories.map((cat, ci) => {
          const catDone = cat.exams.filter(e => statuses[e.name] === 'done').length
          const catPct = Math.round((catDone / cat.exams.length) * 100)
          const catUrgent = cat.exams.filter(e => getPriority(ps, e.keys) === 'urgent' && (statuses[e.name] || 'pending') === 'pending').length
          return (
            <div key={ci} className="card-interactive glass-card" style={{ padding: 'var(--p-space-4)', borderTop: `3px solid ${cat.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-3)' }}>
                <Picto name={cat.icon} size={24} glow glowColor={cat.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: cat.color }}>{cat.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{catDone}/{cat.exams.length}</div>
                </div>
                {catUrgent > 0 && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,71,87,0.15)', color: 'var(--p-critical)', fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{catUrgent} URG</span>}
                {catPct === 100 && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'rgba(46,213,115,0.15)', color: 'var(--p-success)', fontWeight: 700 }}>COMPLET</span>}
              </div>
              <div style={{ height: '2px', background: 'var(--p-gray-1)', borderRadius: '1px', overflow: 'hidden', marginBottom: 'var(--p-space-3)' }}>
                <div style={{ width: `${catPct}%`, height: '100%', background: cat.color, transition: 'width 0.3s' }} />
              </div>
              {cat.exams.map((exam, ei) => {
                const st = statuses[exam.name] || 'pending'
                const cfg = statusConfig[st]
                const isExp = expanded === exam.name
                const pri = getPriority(ps, exam.keys)
                const priCfg = priorityConfig[pri]
                return (
                  <div key={ei} style={{ marginBottom: '2px' }}>
                    <div onClick={() => cycleStatus(exam.name)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 10px', borderRadius: 'var(--p-radius-md)',
                      cursor: 'pointer', transition: 'all 150ms',
                      background: st !== 'pending' ? cfg.bg : pri !== 'normal' ? priCfg.bg : 'transparent',
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0, boxShadow: pri === 'urgent' && st === 'pending' ? `0 0 6px ${priCfg.color}` : 'none' }} />
                      <span style={{ fontSize: 'var(--p-text-xs)', color: st === 'done' ? 'var(--p-text)' : 'var(--p-text-muted)', flex: 1, fontWeight: st === 'done' ? 600 : 400 }}>{exam.name}</span>
                      {pri !== 'normal' && st === 'pending' && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: 'var(--p-radius-full)', background: priCfg.bg, color: priCfg.color, fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{priCfg.label}</span>}
                      <span style={{ fontSize: '9px', padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: cfg.bg, color: cfg.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                      <button onClick={(ev) => { ev.stopPropagation(); setExpanded(isExp ? null : exam.name) }}
                        style={{ background: 'none', border: 'none', color: 'var(--p-text-dim)', cursor: 'pointer', fontSize: '10px', padding: '2px', transform: isExp ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>&#9662;</button>
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

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Bilan diagnostique - Pipeline connecte - Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
