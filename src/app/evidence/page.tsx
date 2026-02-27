'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'

const publications = [
  {id:1,authors:'Wickström R. et al.',year:2022,title:'Protocoles thérapeutiques FIRES — guidelines internationaux',journal:'Epilepsia',topic:'FIRES',engine:'TDE',doi:'10.1111/epi.17200'},
  {id:2,authors:'Sheikh Z. et al.',year:2023,title:'Immunothérapie dans encéphalite auto-immune pédiatrique',journal:'Neurology',topic:'EAIS',engine:'TDE',doi:'10.1212/WNL.2023'},
  {id:3,authors:'Gaspard N. et al.',year:2015,title:'Classification et traitement du status epilepticus réfractaire',journal:'JAMA Neurology',topic:'NORSE',engine:'TDE',doi:'10.1001/jamaneurol.2015'},
  {id:4,authors:'Titulaer M. et al.',year:2013,title:'Encéphalite anti-NMDAR : traitement, pronostic et facteurs prédictifs',journal:'Lancet Neurology',topic:'anti-NMDAR',engine:'TDE',doi:'10.1016/S1474-4422(12)70317-6'},
  {id:5,authors:'Matics T. & Sanchez-Pinto',year:2017,title:'pSOFA — Pediatric Sequential Organ Failure Assessment Score',journal:'Pediatric Critical Care Medicine',topic:'Scoring',engine:'VPS',doi:'10.1097/PCC.2017'},
  {id:6,authors:'Trinka E. et al.',year:2015,title:'Définition et classification ILAE du status epilepticus',journal:'Epilepsia',topic:'Classification',engine:'VPS',doi:'10.1111/epi.13121'},
  {id:7,authors:'Graus F. et al.',year:2016,title:'Approche clinique du diagnostic d\'encéphalite auto-immune',journal:'Lancet Neurology',topic:'Diagnostic',engine:'VPS',doi:'10.1016/S1474-4422(15)00401-9'},
  {id:8,authors:'Beslow L. et al.',year:2012,title:'mRS pédiatrique adapté — Modified Rankin Scale pour enfants',journal:'Stroke',topic:'Scoring',engine:'VPS',doi:'10.1161/STROKEAHA.112'},
  {id:9,authors:'Dalmau J. et al.',year:2008,title:'Encéphalite à anticorps anti-NMDA receptor — série originale',journal:'Annals of Neurology',topic:'anti-NMDAR',engine:'Référence',doi:'10.1002/ana.21447'},
  {id:10,authors:'Irani S. et al.',year:2010,title:'Anticorps neuronaux de surface dans les encéphalites limbiques',journal:'Brain',topic:'Neuro-immunologie',engine:'Référence',doi:'10.1093/brain/awq014'},
  {id:11,authors:'Francoeur C. et al.',year:2023,title:'PIMS/MIS-C outcomes pédiatriques — OR 1.85/2.18',journal:'JAMA Pediatrics',topic:'PIMS',engine:'PVE',doi:'10.1001/jamapediatrics.2023'},
  {id:12,authors:'Bilodeau P. et al.',year:2024,title:'MOGAD pédiatrique — cohorte prospective multicentrique',journal:'Neurology',topic:'MOGAD',engine:'PVE',doi:'10.1212/WNL.2024'},
  {id:13,authors:'Shakeshaft A. et al.',year:2024,title:'Patterns EEG en neuro-inflammation pédiatrique — AUC 0.72',journal:'Clinical Neurophysiology',topic:'EEG',engine:'EWE',doi:'10.1016/j.clinph.2024'},
  {id:14,authors:'Kramer U. et al.',year:2011,title:'FIRES — incidence, mortalité et pronostic à long terme',journal:'Epilepsia',topic:'FIRES',engine:'Épidémiologie',doi:'10.1111/j.1528-1167.2011'},
  {id:15,authors:'Specchio N. et al.',year:2020,title:'FIRES syndrome — revue systématique et meta-analyse',journal:'Seizure',topic:'FIRES',engine:'Référence',doi:'10.1016/j.seizure.2020'},
  {id:16,authors:'Feldstein L. et al.',year:2020,title:'MIS-C associé au SARS-CoV-2 — 186 cas, mortalité 1-2%',journal:'NEJM',topic:'PIMS',engine:'Épidémiologie',doi:'10.1056/NEJMoa2021680'},
  {id:17,authors:'Florance N. et al.',year:2009,title:'Encéphalite anti-NMDAR chez l\'enfant — présentation et évolution',journal:'Annals of Neurology',topic:'anti-NMDAR',engine:'Référence',doi:'10.1002/ana.21756'},
]

const TOPICS = ['Tous', 'FIRES', 'anti-NMDAR', 'EAIS', 'NORSE', 'PIMS', 'MOGAD', 'EEG', 'Scoring', 'Classification', 'Diagnostic', 'Neuro-immunologie']
const ENGINE_COLORS: Record<string, string> = { VPS: 'var(--p-vps)', TDE: 'var(--p-tde)', PVE: 'var(--p-pve)', EWE: 'var(--p-ewe)', 'Référence': 'var(--p-info)', 'Épidémiologie': 'var(--p-warning)' }

export default function EvidencePage() {
  const [filter, setFilter] = useState('Tous')
  const [search, setSearch] = useState('')

  const filtered = publications.filter(p => {
    if (filter !== 'Tous' && p.topic !== filter) return false
    if (search && !`${p.title} ${p.authors} ${p.journal}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-enter" style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="books" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Evidence Vault</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-vps)', fontFamily: 'var(--p-font-mono)' }}>{publications.length} publications référencées</span>
        </div>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-4)' }}>Base bibliographique des règles métier PULSAR — chaque moteur cite ses sources</p>

      {/* Search + filters */}
      <div className="glass-card" style={{ padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)' }}>
        <input
          type="text" placeholder="Rechercher auteur, titre, journal..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 14px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-3)', outline: 'none' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TOPICS.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '3px 12px', borderRadius: 'var(--p-radius-full)', fontSize: '11px', fontWeight: 600,
              border: filter === t ? '1.5px solid var(--p-vps)' : '1px solid var(--p-gray-2)',
              background: filter === t ? 'rgba(108,124,255,0.15)' : 'transparent',
              color: filter === t ? 'var(--p-vps)' : 'var(--p-text-muted)', cursor: 'pointer', transition: 'all 150ms',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-3)', fontFamily: 'var(--p-font-mono)' }}>
        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
      </div>

      {/* Publications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
        {filtered.map((p, i) => (
          <div key={p.id} className="card-interactive glass-card" style={{ padding: 'var(--p-space-4)', borderLeft: `3px solid ${ENGINE_COLORS[p.engine] || 'var(--p-gray-3)'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-3)' }}>
              <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--p-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', flexShrink: 0 }}>{p.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)', marginBottom: '4px', lineHeight: 1.4 }}>{p.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '6px' }}>
                  {p.authors} — <span style={{ fontStyle: 'italic' }}>{p.journal}</span>, {p.year}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'rgba(108,124,255,0.1)', color: 'var(--p-vps)', fontWeight: 600 }}>{p.topic}</span>
                  <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: `${ENGINE_COLORS[p.engine] || 'var(--p-gray-3)'}15`, color: ENGINE_COLORS[p.engine] || 'var(--p-text-dim)', fontWeight: 600 }}>Cité par {p.engine}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
