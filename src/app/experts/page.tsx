'use client'
import Picto from '@/components/Picto'

const experts = [
  { name: 'Dr Elaine Wirrell', affiliation: 'Mayo Clinic, Rochester (USA)', specialty: 'Épilepsie pédiatrique, FIRES', contribution: 'Classification FIRES, protocoles antiépileptiques 1ère ligne, critères d\'état de mal réfractaire', engines: ['VPS', 'TDE'], color: 'var(--p-vps)', icon: 'brain' },
  { name: 'Pr Andreas van Baalen', affiliation: 'Universitätsklinikum Schleswig-Holstein, Kiel (DE)', specialty: 'Neuro-inflammation pédiatrique', contribution: 'Cohorte européenne FIRES, protocoles immunothérapie, scoring pronostique', engines: ['TDE', 'PVE'], color: 'var(--p-tde)', icon: 'dna' },
  { name: 'Pr Soojin Koh', affiliation: 'Emory University / Children\'s Healthcare of Atlanta (USA)', specialty: 'Neuro-immunologie pédiatrique', contribution: 'Biomarqueurs inflammatoires, profils cytokiniques, régime cétogène dans FIRES', engines: ['VPS', 'PVE'], color: 'var(--p-pve)', icon: 'virus' },
  { name: 'Dr Kevin Staley', affiliation: 'Harvard Medical School / MGH (USA)', specialty: 'Neurophysiologie, EEG', contribution: 'Patterns EEG en neuro-inflammation, extreme delta brush, critères classification', engines: ['EWE'], color: 'var(--p-ewe)', icon: 'eeg' },
  { name: 'Rosemarie Kobau', affiliation: 'Epilepsy Research Institute (USA)', specialty: 'Épidémiologie, santé publique', contribution: 'Données épidémiologiques FIRES/NORSE, registres nationaux, suivi à long terme', engines: ['VPS', 'TDE'], color: 'var(--p-tpe)', icon: 'chart' },
]

const ENGINE_COLORS: Record<string, string> = { VPS: 'var(--p-vps)', TDE: 'var(--p-tde)', PVE: 'var(--p-pve)', EWE: 'var(--p-ewe)', TPE: 'var(--p-tpe)' }

export default function ExpertsPage() {
  return (
    <div className="page-enter" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="books" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Consensus Expert</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-vps)', fontFamily: 'var(--p-font-mono)' }}>Panel de {experts.length} experts internationaux</span>
        </div>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-6)' }}>
        Les règles métier PULSAR sont calibrées sur les recommandations de ces experts. Chaque moteur référence ses sources.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
        {experts.map((ex, i) => (
          <div key={i} className="card-interactive glass-card" style={{ padding: 'var(--p-space-5)', borderLeft: `3px solid ${ex.color}` }}>
            <div style={{ display: 'flex', gap: 'var(--p-space-4)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${ex.color}15`, border: `2px solid ${ex.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Picto name={ex.icon} size={28} glow glowColor={ex.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', marginBottom: '2px' }}>{ex.name}</div>
                <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginBottom: '2px' }}>{ex.affiliation}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: ex.color, marginBottom: 'var(--p-space-3)' }}>{ex.specialty}</div>
                <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', lineHeight: 1.6, marginBottom: 'var(--p-space-3)' }}>{ex.contribution}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {ex.engines.map(eng => (
                    <span key={eng} style={{ fontSize: '9px', padding: '2px 10px', borderRadius: 'var(--p-radius-full)', background: `${ENGINE_COLORS[eng]}15`, color: ENGINE_COLORS[eng], fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{eng}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
