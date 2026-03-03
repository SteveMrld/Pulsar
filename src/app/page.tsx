import Link from 'next/link'

const engines = [
  { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF', desc: "Score de sévérité global via 4 champs sémantiques. Lit les signaux vitaux comme un cerveau clinique." },
  { name: 'TDE', full: 'Therapeutic Decision Engine', color: '#2FD1C8', desc: "Escalade thérapeutique adaptée à chaque pathologie. FIRES, anti-NMDAR, MOGAD — chaque pattern, sa logique." },
  { name: 'PVE', full: 'Pharmacovigilance Engine', color: '#B96BFF', desc: 'Interactions critiques en temps réel. Croise traitements, pathologie et terrain.' },
  { name: 'EWE', full: 'Early Warning Engine', color: '#FF6B8A', desc: 'Détection précoce des détériorations. Analyse les tendances vitales avant la décompensation.' },
  { name: 'TPE', full: 'Therapeutic Prospection Engine', color: '#FFB347', desc: "Projection J+7/J+14. Recommandations thérapeutiques anticipées." },
]

const discoveryLevels = [
  { name: 'N1', label: 'Pattern Mining', color: '#10B981', desc: "Corrélation de Pearson sur 34 paramètres cliniques, clustering k-means, détection d'anomalies par z-score (seuil 2.5σ).", detail: '34 paramètres × 8 patients' },
  { name: 'N2', label: 'Literature Scanner', color: '#3B82F6', desc: 'Veille PubMed live (10 requêtes), ClinicalTrials.gov temps réel. Détection de contradictions avec le protocole TDE.', detail: '25 publications + 3 essais NCT' },
  { name: 'N3', label: 'Hypothesis Engine', color: '#8B5CF6', desc: "Génération d'hypothèses par croisement N1×N2 via Claude API. Workflow de validation : Générée → En revue → Validée → Publiée.", detail: '3 hypothèses calibrées' },
  { name: 'N4', label: 'Treatment Pathfinder', color: '#EC4899', desc: "Matching patient↔essais cliniques (ClinicalTrials.gov). Scoring d'éligibilité multicritères. 5 traitements évalués.", detail: 'anakinra · tocilizumab · KD · combo · rituximab' },
]

const epidemioStats = [
  { value: '~30 000', label: 'enfants/an', sub: 'touchés par des maladies neuro-inflammatoires dans le monde', color: '#FF4757' },
  { value: '12–30%', label: 'mortalité', sub: 'dans les formes réfractaires (FIRES, NORSE, encéphalites sévères)', color: '#FF6B8A' },
  { value: '90%', label: 'séquelles', sub: 'des survivants gardent des déficits cognitifs ou une épilepsie chronique', color: '#FFB347' },
  { value: '5', label: 'syndromes', sub: 'FIRES · Anti-NMDAR · NORSE · PIMS · MOGAD/ADEM', color: '#6C7CFF' },
]

const features = [
  { title: '6+1 Moteurs IA', desc: 'VPS · TDE · PVE · EWE · TPE + IntakeAnalyzer + Discovery Engine — chaque moteur pense en 4 couches.', stat: '24 935', unit: 'lignes' },
  { title: '5 Pathologies', desc: 'FIRES · anti-NMDAR · NORSE · PIMS/MIS-C · MOGAD/ADEM — encéphalopathies inflammatoires pédiatriques.', stat: '5', unit: 'syndromes' },
  { title: 'Evidence-Based', desc: '59 références cliniques + 25 publications Discovery + 3 essais cliniques actifs.', stat: '95/95', unit: 'tests' },
  { title: 'Veille Live', desc: 'Scan PubMed automatique (10 requêtes). ClinicalTrials.gov temps réel. Export Brief FR/EN + JSON + BibTeX.', stat: '15', unit: 'tables SQL' },
]

const workflow = [
  { step: '1', label: 'Admission', desc: 'Intake + Triage P1-P4', color: '#FF4757' },
  { step: '2', label: 'Pipeline', desc: '5 moteurs activés', color: '#6C7CFF' },
  { step: '3', label: 'Cockpit', desc: 'Monitoring + alertes', color: '#2FD1C8' },
  { step: '4', label: 'Discovery', desc: 'Signaux + hypothèses', color: '#10B981' },
  { step: '5', label: 'Export', desc: 'Brief · JSON · BibTeX', color: '#B96BFF' },
]

export default function LandingPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--p-bg)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(108,124,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(16,185,129,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(47,209,200,0.03) 0%, transparent 50%)' }} />

      <nav className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--p-space-4) var(--p-space-8)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <img src="/assets/logo-pulsar.png" alt="PULSAR" width={40} height={40} style={{ filter: 'drop-shadow(0 0 12px rgba(108,124,255,0.5))', display: 'block', objectFit: 'contain' }} />
          <span className="text-gradient-brand" style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, letterSpacing: '0.1em' }}>PULSAR</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#10B981', background: '#10B98115', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', border: '1px solid #10B98125' }}>V19</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)' }}>
          <Link href="/login" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)', textDecoration: 'none', fontSize: 'var(--p-text-sm)' }}>Connexion</Link>
          <Link href="/patients" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, boxShadow: '0 0 16px rgba(108,124,255,0.3)' }}>Commencer</Link>
        </div>
      </nav>

      <section className="page-enter" style={{ textAlign: 'center', padding: 'var(--p-space-24) var(--p-space-8) var(--p-space-8)', maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', gap: '8px', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: 'var(--p-vps-dim)', color: 'var(--p-vps)', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)' }}>6+1 ENGINES</span>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: '#10B98112', color: '#10B981', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)', border: '1px solid #10B98120' }}>DISCOVERY ENGINE v4.0</span>
        </div>
        <h1 style={{ fontSize: 'var(--p-text-5xl)', fontWeight: 800, lineHeight: 'var(--p-leading-tight)', marginBottom: 'var(--p-space-6)', color: 'var(--p-text)' }}>
          Chaque enfant mérite<br />que l&apos;IA se batte<br /><span className="text-gradient-vps">pour lui</span>
        </h1>
        <p style={{ fontSize: 'var(--p-text-lg)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)', maxWidth: '680px', margin: '0 auto var(--p-space-10)' }}>
          Chaque année, environ 30 000 enfants dans le monde sont frappés par des maladies neuro-inflammatoires — FIRES, NORSE, encéphalites auto-immunes, ADEM, MOGAD. Des enfants en parfaite santé dont le cerveau s&apos;enflamme sans prévenir. Pour la plupart, aucun traitement standard ne fonctionne. PULSAR est né pour changer cette équation.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/patients" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', boxShadow: 'var(--p-shadow-glow-vps)' }}>Accéder à PULSAR</Link>
          <Link href="/research" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98130', color: '#10B981', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '18px' }}>🔬</span> Discovery Engine</Link>
        </div>
      </section>

      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-12) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FF4757', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-2)' }}>MALADIES NEURO-INFLAMMATOIRES PÉDIATRIQUES</div>
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
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6) var(--p-space-8)', marginTop: 'var(--p-space-6)', textAlign: 'center', borderLeft: '4px solid #FF4757' }}>
          <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, margin: 0 }}>
            Les maladies neuro-inflammatoires pédiatriques regroupent un spectre de pathologies dévastatrices : <strong style={{ color: 'var(--p-text)' }}>FIRES</strong> (1 enfant sur 1 million), <strong style={{ color: 'var(--p-text)' }}>encéphalites auto-immunes</strong> (jusqu&apos;à 4,2/million), <strong style={{ color: 'var(--p-text)' }}>NORSE</strong> (~3 200 cas/an aux États-Unis), <strong style={{ color: 'var(--p-text)' }}>ADEM</strong> (3 à 6/million), <strong style={{ color: 'var(--p-text)' }}>MOGAD</strong> et <strong style={{ color: 'var(--p-text)' }}>PIMS/MIS-C</strong>. Elles frappent des enfants en parfaite santé — souvent après un simple épisode infectieux. Les traitements de première ligne échouent dans la majorité des cas, et chaque heure perdue aggrave les séquelles neurologiques.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', textAlign: 'center', marginTop: '10px' }}>Sources : Epilepsia 2018, Frontiers in Neurology 2024, Frontiers in Pediatrics 2019, NORD, CHOP, PMC 2021. FIRES ≈ 1/million, AE 1,5–4,2/million, ADEM 3–6/million, NORSE ≈ 1/100 000.</div>
      </section>

      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-10) var(--p-space-8)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(108,124,255,0.06) 0%, rgba(16,185,129,0.04) 50%, rgba(47,209,200,0.03) 100%)', border: '1px solid rgba(108,124,255,0.12)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-4)' }}>LA PROMESSE DE PULSAR</div>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-6)', lineHeight: 1.4 }}>
            Donner au clinicien l&apos;intelligence<br />de <span className="text-gradient-vps">décider plus vite</span>, <span style={{ color: '#10B981' }}>mieux</span>, et <span style={{ color: '#2FD1C8' }}>plus tôt</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--p-text-muted)', lineHeight: 1.9, maxWidth: '700px', margin: '0 auto', marginBottom: 'var(--p-space-6)' }}>
            Face à une encéphalopathie neuro-inflammatoire pédiatrique, chaque heure compte. Les traitements de première ligne échouent dans la majorité des cas. PULSAR croise en temps réel les signaux vitaux du patient, les 5 pathologies connues, et la littérature scientifique mondiale — pour recommander l&apos;escalade thérapeutique la plus adaptée, détecter les détériorations avant qu&apos;elles ne surviennent, et connecter chaque enfant aux essais cliniques qui pourraient le sauver.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '⚡', text: 'Décisions en minutes, pas en jours', color: '#FF6B8A' },
              { icon: '🧠', text: '6+1 moteurs qui pensent ensemble', color: '#6C7CFF' },
              { icon: '🔬', text: 'La recherche mondiale au chevet', color: '#10B981' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{p.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: p.color }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>PARCOURS PATIENT — DE L&apos;ADMISSION À LA RECHERCHE</div>
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

      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-12) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 'var(--p-radius-full)', background: '#10B98112', border: '1px solid #10B98125', marginBottom: 'var(--p-space-4)' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#10B981', letterSpacing: '1.5px' }}>DISCOVERY ENGINE v4.0</span>
          </div>
          <h2 style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>La recherche mondiale<br /><span style={{ color: '#10B981' }}>au chevet de l&apos;enfant</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
            Le Discovery Engine analyse les données de vos patients, les croise avec PubMed et ClinicalTrials.gov en temps réel, génère des hypothèses de recherche, et identifie les essais cliniques auxquels chaque enfant pourrait être éligible. De la donnée clinique à la publication scientifique — automatiquement.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {discoveryLevels.map((d) => (
            <div key={d.name} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', borderTop: `3px solid ${d.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 900, fontSize: '16px', color: d.color }}>{d.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{d.label}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6, margin: '0 0 8px 0' }}>{d.desc}</p>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: d.color, fontWeight: 600 }}>{d.detail}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--p-space-6)' }}>
          <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: '#10B98115', border: '2px solid #10B98125', color: '#10B981', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>🔬 Explorer le Discovery Engine →</Link>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: 'var(--p-space-6)', flexWrap: 'wrap' }}>
          {[
            { label: 'Veille PubMed live', color: '#10B981' },
            { label: 'ClinicalTrials.gov', color: '#3B82F6' },
            { label: 'Export Brief FR/EN', color: '#8B5CF6' },
            { label: 'JSON + BibTeX', color: '#EC4899' },
            { label: 'Enrichissement TDE', color: '#2FD1C8' },
          ].map((t, i) => (
            <span key={i} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: `${t.color}10`, border: `1px solid ${t.color}20`, fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600, color: t.color }}>{t.label}</span>
          ))}
        </div>
      </section>

      <section className="page-enter-stagger" style={{ padding: '0 var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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

      <section id="features" className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--p-space-4)' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: 'var(--p-vps)', lineHeight: 1 }}>{f.stat}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '12px' }}>{f.unit}</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--p-text)' }}>{f.title}</h3>
              <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-enter-stagger" style={{ padding: '0 var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>Moteurs Cerveau</h2>
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

      <section className="page-enter-stagger" style={{ textAlign: 'center', padding: 'var(--p-space-16) var(--p-space-8) var(--p-space-24)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, marginBottom: 'var(--p-space-4)', color: 'var(--p-text)' }}>Prêt à explorer ?</h2>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', maxWidth: '560px', margin: '0 auto var(--p-space-8)', lineHeight: 1.7 }}>95/95 tests passés. 59 références cliniques + 25 publications Discovery. Pipeline validé. Veille PubMed live. Parce que chaque minute gagnée peut changer une vie.</p>
        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/patients" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-lg)', boxShadow: 'var(--p-shadow-glow-vps)' }}>Commencer</Link>
          <Link href="/research" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98125', color: '#10B981', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--p-text-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>🔬 Discovery</Link>
        </div>
      </section>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-4)', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>In memory of Alejandro R. (2019–2025)</p>
      </div>

      <footer style={{ borderTop: 'var(--p-border)', padding: 'var(--p-space-6) var(--p-space-8)', textAlign: 'center', color: 'var(--p-text-dim)', fontSize: 'var(--p-text-xs)', position: 'relative', zIndex: 1 }}>
        PULSAR V19 · Intelligence clinique pédiatrique · Discovery Engine v4.0 · © 2026 Steve Moradel
      </footer>
    </div>
  )
}
