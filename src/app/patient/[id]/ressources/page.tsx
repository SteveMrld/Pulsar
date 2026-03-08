'use client'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

/* Ressources & Connaissances \u2014 KB + Guidelines + R\u00e9f\u00e9rences */

const SYNDROME_GUIDELINES: Record<string, { title: string; refs: { label: string; detail: string; year: string }[] }> = {
  FIRES: {
    title: 'FIRES \u2014 Febrile Infection-Related Epilepsy Syndrome',
    refs: [
      { label: 'Hirsch et al. 2018', detail: 'Proposed definition and classification of FIRES by ILAE Task Force', year: '2018' },
      { label: 'Culleton et al. 2019', detail: 'EEG patterns in pediatric FIRES: normal acute in 61% of cases', year: '2019' },
      { label: 'Wickstr\u00f6m 2022', detail: 'CXCL10 in CSF as interferon-gamma pathway activation marker', year: '2022' },
      { label: 'Francoeur JAMA 2024', detail: 'Prognostic scoring system for pediatric refractory status epilepticus', year: '2024' },
      { label: 'Bilodeau 2024', detail: 'Updated treatment algorithms for super-refractory SE in children', year: '2024' },
    ],
  },
  'Anti-NMDAR': {
    title: 'Enc\u00e9phalite anti-NMDAR',
    refs: [
      { label: 'Dalmau et al. 2008', detail: 'First comprehensive description of anti-NMDAR encephalitis', year: '2008' },
      { label: 'Titulaer et al. 2013', detail: 'Treatment and prognostic factors for long-term outcome (577 patients)', year: '2013' },
      { label: 'Graus et al. 2016', detail: 'Clinical approach to diagnosis of autoimmune encephalitis', year: '2016' },
      { label: 'Cellucci et al. 2020', detail: 'Canadian consensus guidelines for pediatric autoimmune encephalitis', year: '2020' },
    ],
  },
  MOGAD: {
    title: 'MOGAD \u2014 MOG Antibody-Associated Disease',
    refs: [
      { label: 'Banwell et al. 2023', detail: 'International consensus diagnostic criteria for MOGAD', year: '2023' },
      { label: 'Bilodeau 2024', detail: 'Treatment approach for pediatric MOGAD presentations including ADEM', year: '2024' },
      { label: 'Wu et al. 2023', detail: 'MRI abnormalities in pediatric MOGAD (63.6% abnormal, n=11)', year: '2023' },
    ],
  },
  '\u00c9pilepsie focale': {
    title: '\u00c9pilepsie focale p\u00e9diatrique',
    refs: [
      { label: 'ILAE 2017', detail: 'Operational classification of seizure types by the ILAE', year: '2017' },
      { label: 'Kwan & Brodie 2000', detail: 'Early identification of refractory epilepsy', year: '2000' },
      { label: 'Glauser et al. 2013', detail: 'ILAE treatment guidelines for pediatric epilepsy', year: '2013' },
    ],
  },
}

const KB_SECTIONS = [
  {
    title: 'Moteurs PULSAR',
    color: '#6C7CFF',
    icon: 'brain',
    items: [
      { name: 'VPS \u2014 Vital Prognosis Score', desc: '\u00c9value la s\u00e9v\u00e9rit\u00e9 globale via 4 champs : neuro, inflammatoire, h\u00e9modynamique, m\u00e9tabolique.' },
      { name: 'TDE \u2014 Therapeutic Decision Engine', desc: 'Recommande l\u2019escalade adapt\u00e9e \u00e0 chaque pathologie et phase clinique.' },
      { name: 'PVE \u2014 Pharmacovigilance Engine', desc: 'D\u00e9tecte interactions critiques en temps r\u00e9el. Poids, \u00e2ge, pathologie crois\u00e9s.' },
      { name: 'EWE \u2014 Early Warning Engine', desc: 'Analyse les tendances pour pr\u00e9dire les d\u00e9t\u00e9riorations avant la d\u00e9compensation.' },
      { name: 'TPE \u2014 Therapeutic Prospection Engine', desc: 'Projette l\u2019\u00e9volution \u00e0 J+7/J+14 et identifie les pistes th\u00e9rapeutiques \u00e9mergentes.' },
    ],
  },
  {
    title: 'NeuroCore',
    color: '#B96BFF',
    icon: 'microscope',
    items: [
      { name: 'Red Flags', desc: 'D\u00e9tection automatique des signaux d\u2019alerte critiques (EEG, IRM, biomarqueurs).' },
      { name: 'Pi\u00e8ges diagnostiques', desc: 'Identification des patterns trompeurs et diagnostics diff\u00e9rentiels \u00e0 ne pas manquer.' },
      { name: 'Brain Damage Index', desc: 'Score composite int\u00e9grant donn\u00e9es structurelles et fonctionnelles c\u00e9r\u00e9brales.' },
      { name: 'EEG Datasets publics', desc: 'R\u00e9f\u00e9rences TUSZ, CHB-MIT, Bonn University pour validation des patterns.' },
    ],
  },
  {
    title: 'Pathologies couvertes',
    color: '#A78BFA',
    icon: 'alert',
    items: [
      { name: 'FIRES', desc: 'Febrile Infection-Related Epilepsy Syndrome \u2014 status r\u00e9fractaire post-infectieux.' },
      { name: 'Anti-NMDAR', desc: 'Enc\u00e9phalite auto-immune avec anticorps anti-r\u00e9cepteurs NMDA.' },
      { name: 'NORSE', desc: 'New-Onset Refractory Status Epilepticus \u2014 variante adulte du FIRES.' },
      { name: 'PIMS/MIS-C', desc: 'Syndrome inflammatoire multisyst\u00e9mique p\u00e9diatrique post-COVID.' },
      { name: 'MOGAD/ADEM', desc: 'Enc\u00e9phalomy\u00e9lite aigu\u00eb diss\u00e9min\u00e9e avec anticorps anti-MOG.' },
    ],
  },
]

export default function RessourcesPage() {
  const { t } = useLang()
  const { info } = usePatient()
  const guidelines = SYNDROME_GUIDELINES[info.syndrome]

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="books" size={28} glow glowColor="rgba(255,179,71,0.5)" />
        <div>
          <h1>Ressources & Connaissances</h1>
          <span className="page-subtitle">
            NeuroCore KB {'\u00b7'} 59 r\u00e9f\u00e9rences {'\u00b7'} {info.syndrome}
          </span>
        </div>
      </div>

      {/* Syndrome-specific guidelines */}
      {guidelines && (
        <div className="glass-card" style={{
          padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '20px',
          borderLeft: '4px solid #6C7CFF',
        }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#6C7CFF', marginBottom: '12px', letterSpacing: '0.5px' }}>
            R\u00c9F\u00c9RENCES CLINIQUES \u2014 {info.syndrome.toUpperCase()}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)', marginBottom: '12px' }}>{guidelines.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {guidelines.refs.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 'var(--p-radius-md)',
                background: 'rgba(108,124,255,0.04)',
              }}>
                <span style={{
                  fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                  background: 'rgba(108,124,255,0.1)', color: '#6C7CFF',
                  flexShrink: 0, marginTop: '1px',
                }}>{r.year}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{r.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '2px' }}>{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KB Sections */}
      {KB_SECTIONS.map((section, si) => (
        <div key={si} className="glass-card" style={{
          padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px',
          borderLeft: `4px solid ${section.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Picto name={section.icon} size={16} glow glowColor={`${section.color}50`} />
            <span className="page-subtitle">
              {section.title.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
            {section.items.map((item, i) => (
              <div key={i} style={{
                padding: '12px', borderRadius: 'var(--p-radius-md)',
                background: `${section.color}06`, border: `1px solid ${section.color}12`,
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Benchmark data */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', borderLeft: '4px solid #2FD1C8' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#2FD1C8', marginBottom: '14px', letterSpacing: '0.5px' }}>
          BENCHMARKS & VALIDATION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Francoeur JAMA 2024', value: 'OR 1.85/2.18', detail: 'Score pronostique status r\u00e9fractaire' },
            { label: 'Bilodeau 2024', value: 'Consensus tx', detail: 'Algorithme traitement SE super-r\u00e9fractaire' },
            { label: 'Shakeshaft AUC', value: '0.72', detail: 'Performance pr\u00e9dictive EEG patterns' },
            { label: 'SPF Cohorte', value: '932 cas', detail: 'Base de validation \u00e9pid\u00e9miologique' },
            { label: 'Crash tests', value: '7/7', detail: 'Tous sc\u00e9narios valid\u00e9s (edge cases inclus)' },
            { label: 'R\u00e9f\u00e9rences KB', value: '59', detail: 'Articles, guidelines, datasets index\u00e9s' },
          ].map((b, i) => (
            <div key={i} style={{
              padding: '12px', borderRadius: 'var(--p-radius-md)',
              background: 'rgba(47,209,200,0.04)', border: '1px solid rgba(47,209,200,0.1)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: '#2FD1C8', lineHeight: 1 }}>{b.value}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p-text)', marginTop: '4px' }}>{b.label}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{b.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
