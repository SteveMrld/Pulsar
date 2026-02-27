'use client'

const experts = [
  { name: 'Dr Elaine C. Wirrell', specialty: 'Épileptologue pédiatrique', affiliation: 'Mayo Clinic, Rochester', color: 'var(--p-vps)', reco: 'Protocole d\'escalade antiépileptique en 3 lignes avec monitoring EEG continu.' },
  { name: 'Pr Andreas van Baalen', specialty: 'Neuro-immunologie pédiatrique', affiliation: 'Université de Kiel, Allemagne', color: 'var(--p-tde)', reco: 'Immunothérapie précoce dans les 48h pour les encéphalites auto-immunes suspectées.' },
  { name: 'Pr Sookyong Koh', specialty: 'FIRES / Épilepsie réfractaire', affiliation: 'Emory University, Atlanta', color: 'var(--p-pve)', reco: 'Régime cétogène ratio 3:1 à initier dès J3-J5 en cas de FIRES suspecté.' },
  { name: 'Dr Kevin J. Staley', specialty: 'Neurophysiologie', affiliation: 'Harvard / MGH, Boston', color: 'var(--p-ewe)', reco: 'EEG continu ≥24h avec classification des patterns pour adapter la sédation.' },
  { name: 'Rosemarie', specialty: 'Recherche épilepsie', affiliation: 'Epilepsy Research Institute', color: 'var(--p-tpe)', reco: 'Approche translationnelle : biomarqueurs cytokinaires pour le suivi thérapeutique.' },
]

export default function ExpertsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-pve)' }} />
        <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Consensus Expert</h1>
        <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)' }}>5 experts</span>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-6)' }}>Panel international d&apos;experts référencés dans les règles métier PULSAR</p>

      {experts.map((e, i) => (
        <div key={i} className="animate-in" style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)', borderLeft: `3px solid ${e.color}`, animationDelay: `${i * 100}ms` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)' }}>{e.name}</div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: e.color, fontWeight: 600, marginTop: '2px' }}>{e.specialty}</div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', marginTop: '2px' }}>{e.affiliation}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎓</div>
          </div>
          <div style={{ marginTop: 'var(--p-space-3)', padding: 'var(--p-space-3)', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '4px' }}>RECOMMANDATION</div>
            <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 1.6 }}>{e.reco}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
