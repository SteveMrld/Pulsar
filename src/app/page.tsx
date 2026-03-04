'use client'
import { useLang, LangToggle } from '@/contexts/LanguageContext'
import Link from 'next/link'

// ══════════════════════════════════════════════════════════════
// PULSAR V20 — Landing
// La promesse : plus aucun enfant perdu par manque d'intelligence
// ══════════════════════════════════════════════════════════════


const workflow = [
  { step: '1', label: 'Admission', desc: 'Intake + Triage P1-P4', color: '#8B5CF6' },
  { step: '2', label: 'Pipeline', desc: '5 moteurs activés', color: '#6C7CFF' },
  { step: '3', label: 'Cockpit', desc: 'Monitoring + alertes', color: '#2FD1C8' },
  { step: '4', label: 'Discovery', desc: 'Signaux + hypothèses', color: '#10B981' },
  { step: '5', label: 'Export', desc: 'Brief · JSON · BibTeX', color: '#B96BFF' },
]

export default function LandingPage() {
  const { t } = useLang()

  const engines = [
    { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF',
      desc: "Score de sévérité global via 4 champs sémantiques. Lit les signaux vitaux comme un cerveau clinique." },
    { name: 'TDE', full: 'Therapeutic Decision Engine', color: '#2FD1C8',
      desc: "Escalade thérapeutique adaptée à chaque pathologie. FIRES, anti-NMDAR, MOGAD — chaque pattern, sa logique." },
    { name: 'PVE', full: 'Pharmacovigilance Engine', color: '#B96BFF',
      desc: 'Interactions critiques en temps réel. Croise traitements, pathologie et terrain.' },
    { name: 'EWE', full: 'Early Warning Engine', color: '#A78BFA',
      desc: "Détection précoce des détériorations. Analyse les tendances vitales avant la décompensation." },
    { name: 'TPE', full: 'Therapeutic Prospection Engine', color: '#FFB347',
      desc: "Projection J+7/J+14. Recommandations thérapeutiques anticipées." },
  ]
  
  const discoveryLevels = [
    { name: 'N1', label: 'Pattern Mining', color: '#10B981', icon: '📊',
      desc: 'Corrélation de Pearson sur 34 paramètres cliniques. Clustering k-means. Détection d\'anomalies z-score (2.5σ). Chaque patient génère des signaux qui enrichissent le système.',
      detail: '34 paramètres × 8 patients' },
    { name: 'N2', label: 'Literature Scanner', color: '#3B82F6', icon: '📡',
      desc: 'Veille PubMed live (10 requêtes). ClinicalTrials.gov temps réel. Détection automatique de contradictions avec le protocole thérapeutique en cours.',
      detail: '25 publications + 3 essais NCT actifs' },
    { name: 'N3', label: 'Hypothesis Engine', color: '#8B5CF6', icon: '💡',
      desc: 'Croisement N1×N2 via Claude API. Génération d\'hypothèses de recherche. Workflow de validation : Générée → En revue → Validée → Publiée.',
      detail: '3 hypothèses calibrées + scoring' },
    { name: 'N4', label: 'Treatment Pathfinder', color: '#EC4899', icon: '🧬',
      desc: 'Matching patient↔essais cliniques mondiaux. Scoring d\'éligibilité multicritères. Chaque enfant est connecté aux traitements qui pourraient changer sa trajectoire.',
      detail: 'anakinra · tocilizumab · KD · combo · rituximab' },
  ]
  
  const epidemioStats = [
    { value: '~30 000', label: 'enfants/an', sub: 'touchés par des maladies neuro-inflammatoires dans le monde', color: '#8B5CF6' },
    { value: '12–30%', label: 'mortalité', sub: 'dans les formes réfractaires (FIRES, NORSE, encéphalites sévères)', color: '#A78BFA' },
    { value: '90%', label: 'séquelles', sub: 'des survivants gardent des déficits cognitifs ou une épilepsie chronique', color: '#FFB347' },
    { value: '5', label: 'syndromes', sub: 'FIRES · Anti-NMDAR · NORSE · PIMS · MOGAD/ADEM', color: '#6C7CFF' },
  ]

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--p-bg)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(108,124,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(16,185,129,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(47,209,200,0.03) 0%, transparent 50%)' }} />

      {/* NAV */}
      <nav className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--p-space-4) var(--p-space-8)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={40} height={40} style={{ filter: 'drop-shadow(0 0 12px rgba(108,124,255,0.5))', display: 'block', objectFit: 'contain' }} />
          <span className="text-gradient-brand" style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, letterSpacing: '0.1em' }}>PULSAR</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#6C7CFF', background: '#6C7CFF15', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', border: '1px solid #6C7CFF25' }}>V20</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)' }}>
          <LangToggle />
          <Link href="/login" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)', textDecoration: 'none', fontSize: 'var(--p-text-sm)' }}>{t('Connexion', 'Sign in')}</Link>
          <Link href="/patients" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, boxShadow: '0 0 16px rgba(108,124,255,0.3)' }}>{t('Commencer', 'Get started')}</Link>
        </div>
      </nav>

      {/* ═══════════ MEMORIAL ═══════════ */}
      <div style={{ textAlign: 'center', padding: 'var(--p-space-6) var(--p-space-8) 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-full)', background: 'rgba(108,124,255,0.04)', border: '1px solid rgba(108,124,255,0.10)' }}>
          <p style={{ fontSize: '13px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-muted)', margin: 0, fontWeight: 500, letterSpacing: '0.05em' }}>
            {t('À la mémoire d\'Alejandro R. (2019–2025)', 'In memory of Alejandro R. (2019–2025)')}
          </p>
        </div>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="page-enter" style={{ textAlign: 'center', padding: 'var(--p-space-24) var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', gap: '8px', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: 'var(--p-vps-dim)', color: 'var(--p-vps)', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)' }}>{t('INTELLIGENCE CLINIQUE', 'CLINICAL INTELLIGENCE')}</span>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: '#10B98112', color: '#10B981', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)', border: '1px solid #10B98120' }}>{t('RECHERCHE TRANSLATIONNELLE', 'TRANSLATIONAL RESEARCH')}</span>
        </div>

        <h1 style={{ fontSize: 'var(--p-text-5xl)', fontWeight: 800, lineHeight: 'var(--p-leading-tight)', marginBottom: 'var(--p-space-6)', color: 'var(--p-text)' }}>
          Plus aucun enfant perdu<br />parce que la bonne information<br /><span className="text-gradient-vps">n&apos;était pas là à temps</span>
        </h1>

        <p style={{ fontSize: 'var(--p-text-lg)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)', maxWidth: '720px', margin: '0 auto var(--p-space-6)' }}>
          Chaque année, environ 30 000 enfants dans le monde sont frappés par des maladies neuro-inflammatoires — FIRES, NORSE, encéphalites auto-immunes, ADEM, MOGAD. Des enfants en parfaite santé dont le cerveau s&apos;enflamme sans prévenir.
        </p>

        <p style={{ fontSize: 'var(--p-text-base)', color: 'var(--p-text)', lineHeight: 'var(--p-leading-relaxed)', maxWidth: '720px', margin: '0 auto var(--p-space-10)', fontWeight: 600 }}>
          PULSAR est le premier système d&apos;intelligence artificielle entièrement dédié à ces pathologies. 7 moteurs qui pensent ensemble, un Discovery Engine qui croise chaque patient avec la recherche mondiale, et un principe fondateur : chaque enfant qui entre dans le système rend le système plus intelligent pour le suivant. Rien de tel n&apos;existe aujourd&apos;hui.
        </p>

        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/patients" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', boxShadow: 'var(--p-shadow-glow-vps)' }}>{t('Accéder à PULSAR', 'Access PULSAR')}</Link>
          <Link href="/research" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98130', color: '#10B981', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '18px' }}>🔬</span> Discovery Engine</Link>
        </div>
      </section>

      {/* ═══════════ DOUBLE PROMESSE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-12) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--p-space-6)' }}>

          {/* CÔTÉ CLINIQUE */}
          <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', background: 'linear-gradient(135deg, rgba(108,124,255,0.06) 0%, rgba(47,209,200,0.03) 100%)', border: '1px solid rgba(108,124,255,0.12)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-3)' }}>{t('CÔTÉ CLINIQUE', 'CLINICAL SIDE')}</div>
            <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>Comprimer le temps entre<br />le premier signal et<br /><span style={{ color: '#6C7CFF' }}>la bonne décision</span></h3>
            <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
              Dans ces maladies, la différence entre séquelles et récupération se joue en heures. Le médecin isolé à 3h du matin ne peut pas connaître les 59 protocoles, les 25 publications récentes, les interactions entre 5 traitements simultanés.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
              PULSAR le peut. 5 moteurs d&apos;analyse qui pensent ensemble — sévérité, escalade thérapeutique, pharmacovigilance, alerte précoce, prospection — pour que chaque clinicien, où qu&apos;il soit, ait la puissance de décision du meilleur service de neuropédiatrie au monde.
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--p-space-4)', flexWrap: 'wrap' }}>
              {engines.map((e) => (
                <span key={e.name} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: `${e.color}12`, border: `1px solid ${e.color}25`, fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: e.color }}>{e.name}</span>
              ))}
            </div>
          </div>

          {/* CÔTÉ RECHERCHE */}
          <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(139,92,246,0.03) 100%)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#10B981', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-3)' }}>{t('CÔTÉ RECHERCHE', 'RESEARCH SIDE')}</div>
            <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>Chaque enfant qui passe dans<br />PULSAR rend le système<br /><span style={{ color: '#10B981' }}>plus intelligent pour le suivant</span></h3>
            <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
              Le Discovery Engine fait ce que personne ne fait aujourd&apos;hui. Il prend les données cliniques d&apos;un enfant malade, les croise avec toute la littérature mondiale, et génère des hypothèses de recherche. Chaque cas enrichit les corrélations, affine les hypothèses, identifie les essais cliniques.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
              L&apos;enfant admis à Pointe-à-Pitre enrichit la décision pour l&apos;enfant qui sera admis demain à Lyon, à Dakar ou à Montréal. Chaque tragédie individuelle se transforme en intelligence collective.
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--p-space-4)', flexWrap: 'wrap' }}>
              {discoveryLevels.map((d) => (
                <span key={d.name} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: `${d.color}12`, border: `1px solid ${d.color}25`, fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: d.color }}>{d.name} {d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ÉPIDÉMIOLOGIE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#8B5CF6', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-2)' }}>{t('MALADIES NEURO-INFLAMMATOIRES PÉDIATRIQUES', 'PEDIATRIC NEUROINFLAMMATORY DISEASES')}</div>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)' }}>Quand le cerveau d&apos;un enfant s&apos;enflamme</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--p-space-4)' }}>
          {epidemioStats.map((s, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)', borderTop: `3px solid ${s.color}`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '32px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5) var(--p-space-8)', marginTop: 'var(--p-space-4)', textAlign: 'center', borderLeft: '4px solid #8B5CF6' }}>
          <p style={{ fontSize: '12px', color: 'var(--p-text-muted)', lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: 'var(--p-text)' }}>FIRES</strong> (1/million) · <strong style={{ color: 'var(--p-text)' }}>Encéphalites auto-immunes</strong> (jusqu&apos;à 4,2/million) · <strong style={{ color: 'var(--p-text)' }}>NORSE</strong> (~3 200 cas/an aux USA) · <strong style={{ color: 'var(--p-text)' }}>ADEM</strong> (3–6/million) · <strong style={{ color: 'var(--p-text)' }}>MOGAD</strong> · <strong style={{ color: 'var(--p-text)' }}>PIMS/MIS-C</strong> — des enfants en parfaite santé, foudroyés après un simple épisode infectieux. Les traitements de première ligne échouent dans la majorité des cas.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', textAlign: 'center', marginTop: '8px' }}>Sources : Epilepsia 2018, Frontiers in Neurology 2024, Frontiers in Pediatrics 2019, NORD, CHOP, PMC 2021.</div>
      </section>

      {/* ═══════════ DISCOVERY ENGINE — SHOWCASE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-16) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 'var(--p-radius-full)', background: '#10B98112', border: '1px solid #10B98125', marginBottom: 'var(--p-space-4)' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#10B981', letterSpacing: '1.5px' }}>DISCOVERY ENGINE v4.0</span>
          </div>
          <h2 style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>De la donnée clinique<br />à <span style={{ color: '#10B981' }}>l&apos;hypothèse de recherche</span></h2>
          <p style={{ fontSize: '14px', color: 'var(--p-text-muted)', maxWidth: '660px', margin: '0 auto', lineHeight: 1.8 }}>
            4 niveaux d&apos;analyse. PubMed et ClinicalTrials.gov en temps réel. Génération d&apos;hypothèses par intelligence artificielle. Un pipeline de recherche translationnelle complet — du chevet de l&apos;enfant à la publication scientifique.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {discoveryLevels.map((d) => (
            <div key={d.name} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)', borderTop: `3px solid ${d.color}`, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{d.icon}</span>
                <div>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 900, fontSize: '14px', color: d.color }}>{d.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)', marginLeft: '8px' }}>{d.label}</span>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.7, margin: '0 0 10px 0' }}>{d.desc}</p>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: d.color, fontWeight: 700, padding: '4px 0', borderTop: `1px solid ${d.color}15` }}>{d.detail}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: 'var(--p-space-6)', flexWrap: 'wrap' }}>
          {[
            { label: 'Veille PubMed live', color: '#10B981' },
            { label: 'ClinicalTrials.gov', color: '#3B82F6' },
            { label: 'Enrichissement TDE', color: '#2FD1C8' },
            { label: 'Brief FR/EN', color: '#8B5CF6' },
            { label: 'JSON + BibTeX', color: '#EC4899' },
          ].map((t, i) => (
            <span key={i} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: `${t.color}10`, border: `1px solid ${t.color}20`, fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600, color: t.color }}>{t.label}</span>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--p-space-6)' }}>
          <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>🔬 Explorer le Discovery Engine</Link>
        </div>
      </section>

      {/* ═══════════ TREATMENT PATHFINDER — PROMESSE THÉRAPEUTIQUE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8) var(--p-space-8)', background: 'linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.04) 50%, rgba(16,185,129,0.03) 100%)', border: '1px solid rgba(236,72,153,0.12)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-6)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-4)' }}>
                <img src="/assets/organs/microscope.png" alt="" width={32} height={32} style={{ filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))' }} />
                <div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#EC4899', letterSpacing: '2px', fontWeight: 800 }}>TREATMENT PATHFINDER</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Discovery Engine · Niveau 4</div>
                </div>
              </div>
              <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>Pour chaque enfant, PULSAR<br />cherche activement <span style={{ color: '#EC4899' }}>des pistes de traitement</span></h3>
              <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
                Le Treatment Pathfinder ne se contente pas d&apos;analyser — il agit. À partir du profil clinique de chaque patient, il interroge les essais cliniques mondiaux, évalue l&apos;éligibilité à des traitements ciblés, et remonte des pistes thérapeutiques directement dans les recommandations du clinicien.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
                Quand un enfant ne répond plus aux traitements de première ligne, le Pathfinder cherche ce qui pourrait fonctionner — dans la littérature, dans les essais en cours, dans les combinaisons que personne n&apos;a encore testées sur ce profil précis.
              </p>
            </div>
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { mol: 'Anakinra', type: 'Anti-IL-1', usage: 'FIRES réfractaire', color: '#EC4899' },
                { mol: 'Tocilizumab', type: 'Anti-IL-6', usage: 'Encéphalite auto-immune', color: '#8B5CF6' },
                { mol: 'Régime cétogène', type: 'Métabolique', usage: 'FIRES / épilepsie réfractaire', color: '#10B981' },
                { mol: 'Rituximab', type: 'Anti-CD20', usage: 'Anti-NMDAR réfractaire', color: '#3B82F6' },
                { mol: 'Combinaisons', type: 'Multi-cibles', usage: 'Profils complexes', color: '#FFB347' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: 'var(--p-radius-lg)', background: `${t.color}08`, border: `1px solid ${t.color}15` }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: `0 0 6px ${t.color}60` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{t.mol} <span style={{ fontWeight: 400, color: 'var(--p-text-dim)', fontSize: '10px' }}>({t.type})</span></div>
                    <div style={{ fontSize: '9px', color: t.color, fontFamily: 'var(--p-font-mono)', fontWeight: 600 }}>{t.usage}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textAlign: 'center', marginTop: '4px', fontFamily: 'var(--p-font-mono)' }}>Scoring d&apos;éligibilité multicritères · ClinicalTrials.gov live</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ INGÉNIERIE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-2)' }}>{t('CE QUI REND PULSAR UNIQUE', 'WHAT MAKES PULSAR UNIQUE')}</div>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)' }}>Un vrai système.<br /><span className="text-gradient-brand">Pas un chatbot.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: 'var(--p-space-6)' }}>
          {[
            { icon: '/assets/pictos-v17/brain-hero-128.png', title: '7 moteurs qui pensent ensemble', desc: 'Pas 7 outils séparés. Un pipeline intégré où chaque moteur enrichit les autres : la pharmacovigilance tient compte de l\'escalade thérapeutique, l\'alerte précoce intègre le score de sévérité, le Discovery Engine injecte ses signaux dans les recommandations.', color: '#6C7CFF' },
            { icon: '/assets/organs/microscope.png', title: 'De la donnée brute à l\'hypothèse publiable', desc: 'Le Discovery Engine fait ce que personne ne fait : il prend les constantes d\'un enfant malade, les croise avec PubMed et ClinicalTrials.gov en temps réel, détecte les contradictions avec le protocole en cours, et génère des hypothèses de recherche prêtes à être validées.', color: '#10B981' },
            { icon: '/assets/organs/shield.png', title: '95 scénarios cliniques validés', desc: 'FIRES avec drépanocytose. Anti-NMDAR en contexte tropical-VIH. NORSE post-transfert. Chaque moteur est testé contre des cas réels, pas des exemples théoriques. 95 tests, 0 erreur. Ce système ne devine pas — il calcule.', color: '#A78BFA' },
            { icon: '/assets/organs/books.png', title: 'Connecté à la science mondiale', desc: 'Veille PubMed automatique (10 requêtes). ClinicalTrials.gov en temps réel. 59 références cliniques intégrées. Export publication en 3 formats. Le savoir n\'est plus enfermé dans des PDF que personne n\'a le temps de lire.', color: '#3B82F6' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <img src={item.icon} alt="" width={24} height={24} style={{ filter: `drop-shadow(0 0 6px ${item.color}60)` }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.title}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WORKFLOW ═══════════ */}
      <section style={{ padding: '0 var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>PARCOURS PATIENT — DE L&apos;ADMISSION À LA PUBLICATION</div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch', marginBottom: 'var(--p-space-4)' }}>
            {workflow.map((w, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: '4px', borderRadius: '2px', background: w.color, boxShadow: `0 0 8px ${w.color}40`, marginBottom: '10px' }} />
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: w.color }}>{w.step}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)', marginTop: '2px' }}>{w.label}</div>
                <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{w.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'linear-gradient(135deg, #6C7CFF, #2FD1C8)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', boxShadow: '0 4px 20px rgba(108,124,255,0.3)' }}><span style={{ fontSize: '16px' }}>▶</span> Lancer la démo</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PIPELINE MOTEURS ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>PIPELINE — 6+1 MOTEURS × 4 COUCHES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {engines.map((e) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ padding: '8px 14px', borderRadius: 'var(--p-radius-lg)', background: `${e.color}12`, border: `1px solid ${e.color}25`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.color, boxShadow: `0 0 6px ${e.color}60` }} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: '12px' }}>{e.name}</span>
                </div>
                <span style={{ color: 'var(--p-text-dim)', fontSize: '14px' }}>→</span>
              </div>
            ))}
            <div style={{ padding: '8px 14px', borderRadius: 'var(--p-radius-lg)', background: '#10B98112', border: '1px solid #10B98125', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B98160' }} />
              <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: '#10B981', fontSize: '12px' }}>DISC</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MOTEURS DÉTAIL ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>6+1 moteurs qui pensent ensemble</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {engines.map((e) => (
            <div key={e.name} className="glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-5)', borderLeft: `3px solid ${e.color}`, borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-5) var(--p-space-6)' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-base)', color: e.color, minWidth: '3rem' }}>{e.name}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--p-text)', marginBottom: '2px' }}>{e.full}</div>
                <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6, margin: 0 }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="page-enter-stagger" style={{ textAlign: 'center', padding: 'var(--p-space-12) var(--p-space-8) var(--p-space-24)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-10) var(--p-space-8)', background: 'linear-gradient(135deg, rgba(108,124,255,0.04) 0%, rgba(16,185,129,0.04) 50%, rgba(236,72,153,0.02) 100%)', border: '1px solid rgba(108,124,255,0.08)' }}>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, marginBottom: 'var(--p-space-4)', color: 'var(--p-text)', lineHeight: 1.3 }}>La bonne information.<br />Au bon endroit. <span className="text-gradient-vps">Au bon moment.</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', maxWidth: '560px', margin: '0 auto var(--p-space-8)', lineHeight: 1.8 }}>
            95/95 tests. 59 références cliniques. 25 publications Discovery. Veille PubMed live. 5 pathologies. 15 tables de données. Parce que chaque minute gagnée peut changer une vie.
          </p>
          <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/patients" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-lg)', boxShadow: 'var(--p-shadow-glow-vps)' }}>Commencer</Link>
            <Link href="/research" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98125', color: '#10B981', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--p-text-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>🔬 Discovery</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ MÉMORIAL + FOOTER ═══════════ */}


      <footer style={{ borderTop: 'var(--p-border)', padding: 'var(--p-space-6) var(--p-space-8)', textAlign: 'center', color: 'var(--p-text-dim)', fontSize: 'var(--p-text-xs)', position: 'relative', zIndex: 1 }}>
        PULSAR V20 · Intelligence clinique pédiatrique · Discovery Engine v4.0 · © 2026 Steve Moradel
      </footer>
    </div>
  )
}
