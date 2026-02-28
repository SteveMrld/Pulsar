'use client'
import Picto from '@/components/Picto';
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

const EXPERTS = [
  { name: 'Dr Elsa Wirrell', role: 'Neuropédiatre', affiliation: 'Mayo Clinic, Rochester', specialty: 'FIRES, Status réfractaire', color: 'var(--p-vps)' },
  { name: 'Pr Andreas van Baalen', role: 'Neuropédiatre', affiliation: 'Université de Kiel', specialty: 'FIRES, Encéphalites pédiatriques', color: 'var(--p-tde)' },
  { name: 'Pr Sookyong Koh', role: 'Neuro-immunologue', affiliation: 'Emory University', specialty: 'Régime cétogène, Immunothérapie', color: 'var(--p-pve)' },
  { name: 'Dr Kevin Staley', role: 'Neuroscientifique', affiliation: 'Harvard/MGH', specialty: 'Mécanismes épileptogénèse', color: 'var(--p-ewe)' },
  { name: 'Rosemarie', role: 'Chercheuse', affiliation: 'Epilepsy Research Institute', specialty: 'Biomarqueurs, Recherche translationnelle', color: 'var(--p-tpe)' },
]

export default function StaffPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [rcpNotes, setRcpNotes] = useState('')
  const [decisions, setDecisions] = useState<{ text: string; status: 'pending' | 'approved' | 'rejected' }[]>([])
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => { const p = new PatientState(DEMO_PATIENTS[scenario].data); runPipeline(p); return p }, [scenario])
  const vps = ps.vpsResult!, tde = ps.tdeResult!, pve = ps.pveResult!

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)' }

  // Auto-generate RCP propositions
  const propositions = useMemo(() => {
    const props: string[] = []
    if (vps.synthesis.score >= 70) props.push('Transfert en réanimation pédiatrique si non déjà fait')
    if (tde.intention.patterns.some(p => p.name === 'FIRES' && p.confidence > 0.5)) props.push('Confirmer diagnostic FIRES et initier protocole spécifique')
    if (tde.synthesis.level.includes('ESCALADE')) props.push(`Escalade thérapeutique recommandée (score TDE: ${tde.synthesis.score})`)
    if (pve.synthesis.alerts.length > 0) props.push('Revoir interactions médicamenteuses identifiées par PVE')
    if (ps.neuro.seizures24h >= 5) props.push('EEG continu ≥24h si non en place')
    if (ps.treatmentHistory.some(t => t.response === 'none')) props.push('Discussion 2ème/3ème ligne thérapeutique suite aux échecs')
    if (props.length === 0) props.push('Maintien surveillance actuelle, réévaluation J+2')
    return props
  }, [ps, vps, tde, pve])

  const addDecision = (text: string) => setDecisions(prev => [...prev, { text, status: 'pending' }])
  const updateDecision = (i: number, status: 'approved' | 'rejected') => setDecisions(prev => prev.map((d, idx) => idx === i ? { ...d, status } : d))

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="family" size={36} glow />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Staff / RCP</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 5 — Réunion de Concertation Pluridisciplinaire</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-lg)', border: scenario === k ? '2px solid var(--p-info)' : 'var(--p-border)', background: scenario === k ? 'var(--p-info-bg)' : 'var(--p-bg-elevated)', color: scenario === k ? 'var(--p-info)' : 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>

      {/* RCP Header */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, borderLeft: '4px solid var(--p-info)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>RCP NEURO-PÉDIATRIQUE</div>
            <div style={{ fontWeight: 700, marginTop: '4px' }}>{DEMO_PATIENTS[scenario].label}</div>
            <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
              {Math.round(ps.ageMonths / 12)} ans · J{ps.hospDay} · GCS {ps.neuro.gcs}/15 · {ps.drugs.length} médicaments
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ n: 'VPS', s: vps.synthesis.score, c: 'var(--p-vps)' }, { n: 'TDE', s: tde.synthesis.score, c: 'var(--p-tde)' }, { n: 'PVE', s: pve.synthesis.score, c: 'var(--p-pve)' }].map(e => (
              <div key={e.n} style={{ padding: '4px 10px', borderRadius: 'var(--p-radius-md)', background: `${e.c}10`, textAlign: 'center' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{e.n}</div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, color: e.c }}>{e.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Context */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-1' : ''}`} style={card}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>CONTEXTE CLINIQUE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>Hypothèse principale</div>
            <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{tde.intention.patterns[0]?.name || 'Non déterminée'} ({Math.round((tde.intention.patterns[0]?.confidence || 0) * 100)}%)</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>Niveau de gravité</div>
            <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px', color: vps.synthesis.score >= 70 ? 'var(--p-critical)' : 'var(--p-warning)' }}>{vps.synthesis.level}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>Ligne thérapeutique</div>
            <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{tde.synthesis.level}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>Échecs thérapeutiques</div>
            <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px', color: ps.treatmentHistory.filter(t => t.response === 'none').length > 0 ? 'var(--p-critical)' : 'var(--p-text)' }}>{ps.treatmentHistory.filter(t => t.response === 'none').length} échec(s)</div>
          </div>
        </div>
      </div>

      {/* Questions clés */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-2' : ''}`} style={card}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>QUESTIONS CLÉS À DISCUTER</div>
        {[
          vps.synthesis.score >= 50 ? `Le score VPS à ${vps.synthesis.score} justifie-t-il un transfert en centre de référence ?` : null,
          tde.synthesis.level.includes('ESCALADE') ? `Faut-il escalader vers la ligne thérapeutique suivante ?` : null,
          ps.neuro.seizures24h >= 5 ? `Les ${ps.neuro.seizures24h} crises/24h nécessitent-elles un burst-suppression ?` : null,
          pve.synthesis.alerts.length > 0 ? `Comment gérer les ${pve.synthesis.alerts.length} interaction(s) médicamenteuse(s) identifiée(s) ?` : null,
          'Quel est le plan de surveillance pour les prochaines 48h ?',
          'Faut-il planifier une IRM de contrôle ?',
        ].filter(Boolean).map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--p-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--p-info)', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: '12px' }}>{q}</span>
          </div>
        ))}
      </div>

      {/* Propositions */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-3' : ''}`} style={card}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>PROPOSITIONS THÉRAPEUTIQUES</div>
        {propositions.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', marginBottom: '6px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <span style={{ fontSize: '12px', flex: 1 }}>{p}</span>
            <button onClick={() => addDecision(p)} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-info)', color: '#fff', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}>+ Décision</button>
          </div>
        ))}
      </div>

      {/* Decisions */}
      {decisions.length > 0 && (
        <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={card}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>DÉCISIONS RCP ({decisions.length})</div>
          {decisions.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', marginBottom: '6px', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${d.status === 'approved' ? 'var(--p-success)' : d.status === 'rejected' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: 'var(--p-bg-elevated)' }}>
              <span style={{ fontSize: '12px', flex: 1 }}>{d.text}</span>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button onClick={() => updateDecision(i, 'approved')} style={{ padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: d.status === 'approved' ? 'var(--p-success)' : 'var(--p-bg-elevated)', border: '1px solid var(--p-success)', color: d.status === 'approved' ? '#fff' : 'var(--p-success)', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>✓</button>
                <button onClick={() => updateDecision(i, 'rejected')} style={{ padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: d.status === 'rejected' ? 'var(--p-critical)' : 'var(--p-bg-elevated)', border: '1px solid var(--p-critical)', color: d.status === 'rejected' ? '#fff' : 'var(--p-critical)', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>✗</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-4' : ''}`} style={card}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>NOTES DE RÉUNION</div>
        <textarea value={rcpNotes} onChange={e => setRcpNotes(e.target.value)} placeholder="Saisir les notes de la RCP..." style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical' }} />
      </div>

      {/* Expert Panel */}
      <div className={`glass-card ${mounted ? 'animate-in stagger-5' : ''}`} style={card}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>PANEL D'EXPERTS DE RÉFÉRENCE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
          {EXPERTS.map((e, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', borderLeft: `3px solid ${e.color}` }}>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{e.name}</div>
              <div style={{ fontSize: '10px', color: e.color }}>{e.role}</div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{e.affiliation}</div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginTop: '2px' }}>{e.specialty}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>PULSAR V15 — Staff/RCP · Ne se substitue pas au jugement clinique</div>
    </div>
  )
}
