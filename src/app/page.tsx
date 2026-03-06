'use client'
import { useLang, LangToggle } from '@/contexts/LanguageContext'
import { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'

// ── Cycling Video Background ──
const VIDEOS = [
  '/assets/videos/hero-child.mp4',
  '/assets/videos/data-particles.mp4',
  '/assets/videos/star-light.mp4',
  '/assets/videos/wheat-hope.mp4',
]

function CyclingVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const playNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % VIDEOS.length)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.src = VIDEOS[currentIndex]
    video.load()
    video.play().catch(() => {})
    const onEnded = () => playNext()
    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [currentIndex, playNext])

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, opacity: 0.35,
          transition: 'opacity 1.5s ease',
        }}
      />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'linear-gradient(180deg, rgba(12,20,36,0.55) 0%, rgba(12,20,36,0.35) 40%, rgba(12,20,36,0.45) 70%, rgba(12,20,36,0.6) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  )
}

// ══════════════════════════════════════════════════════════════
// PULSAR V21 — Landing
// La promesse : plus aucun enfant perdu par manque d'intelligence
// ══════════════════════════════════════════════════════════════



export default function LandingPage() {
  const { t } = useLang()

const workflow = [
  { step: '1', label: 'Admission', desc: 'Intake + Triage P1-P4', color: '#8B5CF6' },
  { step: '2', label: 'Pipeline', desc: t('5 moteurs activés', '5 engines activated'), color: '#6C7CFF' },
  { step: '3', label: 'Cockpit', desc: t('Monitoring + alertes', 'Monitoring + alerts'), color: '#2FD1C8' },
  { step: '4', label: 'Discovery', desc: t('Signaux + hypothèses', 'Signals + hypotheses'), color: '#10B981' },
  { step: '5', label: 'Export', desc: 'Brief · JSON · BibTeX', color: '#B96BFF' },
]

  const engines = [
    { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF',
      desc: t("Score de sévérité global via 4 champs sémantiques. Lit les signaux vitaux comme un cerveau clinique.", "Global severity score across 4 semantic fields. Reads vital signs like a clinical brain.") },
    { name: 'TDE', full: 'Therapeutic Decision Engine', color: '#2FD1C8',
      desc: t("Escalade thérapeutique adaptée à chaque pathologie. FIRES, anti-NMDAR, MOGAD — chaque pattern, sa logique.", "Therapeutic escalation adapted to each pathology. FIRES, anti-NMDAR, MOGAD — each pattern, its logic.") },
    { name: 'PVE', full: 'Pharmacovigilance Engine', color: '#B96BFF',
      desc: t('Interactions critiques en temps réel. Croise traitements, pathologie et terrain.', 'Critical interactions in real time. Cross-references treatments, pathology, and patient profile.') },
    { name: 'EWE', full: 'Early Warning Engine', color: '#A78BFA',
      desc: t("Détection précoce des détériorations. Analyse les tendances vitales avant la décompensation.", "Early detection of deterioration. Analyzes vital trends before decompensation.") },
    { name: 'TPE', full: 'Therapeutic Prospection Engine', color: '#FFB347',
      desc: t("Projection J+7/J+14. Recommandations thérapeutiques anticipées.", "D+7/D+14 projection. Anticipated therapeutic recommendations.") },
  ]
  
  const discoveryLevels = [
    { name: 'N1', label: 'Pattern Mining', color: '#10B981', icon: '📊',
      desc: t('Corrélation de Pearson sur 34 paramètres cliniques. Clustering k-means. Détection d\'anomalies z-score (2.5σ). Chaque patient génère des signaux qui enrichissent le système.', 'Pearson correlation on 34 clinical parameters. K-means clustering. Z-score anomaly detection (2.5σ). Each patient generates signals that enrich the system.'),
      detail: t('34 paramètres × 8 patients', '34 parameters × 8 patients') },
    { name: 'N2', label: 'Literature Scanner', color: '#3B82F6', icon: '📡',
      desc: t('Veille PubMed live (10 requêtes). ClinicalTrials.gov temps réel. Détection automatique de contradictions avec le protocole thérapeutique en cours.', 'Live PubMed monitoring (10 queries). ClinicalTrials.gov real-time. Automatic detection of contradictions with the current therapeutic protocol.'),
      detail: t('25 publications + 3 essais NCT actifs', '25 publications + 3 active NCT trials') },
    { name: 'N3', label: 'Hypothesis Engine', color: '#8B5CF6', icon: '💡',
      desc: t('Croisement N1×N2 via Claude API. Génération d\'hypothèses de recherche. Workflow de validation : Générée → En revue → Validée → Publiée.', 'N1×N2 cross-analysis via Claude API. Research hypothesis generation. Validation workflow: Generated → Under review → Validated → Published.'),
      detail: t('3 hypothèses calibrées + scoring', '3 calibrated hypotheses + scoring') },
    { name: 'N4', label: 'Treatment Pathfinder', color: '#EC4899', icon: '🧬',
      desc: t('Matching patient↔essais cliniques mondiaux. Scoring d\'éligibilité multicritères. Chaque enfant est connecté aux traitements qui pourraient changer sa trajectoire.', 'Patient↔global clinical trial matching. Multi-criteria eligibility scoring. Every child is connected to treatments that could change their trajectory.'),
      detail: 'anakinra · tocilizumab · KD · combo · rituximab' },
  ]
  
  const epidemioStats = [
    { value: '~30 000', label: t('enfants/an', 'children/year'), sub: t('touchés par des maladies neuro-inflammatoires dans le monde', 'affected by neuroinflammatory diseases worldwide'), color: '#8B5CF6' },
    { value: '12–30%', label: t('mortalité', 'mortality'), sub: t('dans les formes réfractaires (FIRES, NORSE, encéphalites sévères)', 'in refractory forms (FIRES, NORSE, severe encephalitis)'), color: '#A78BFA' },
    { value: '90%', label: t('séquelles', 'sequelae'), sub: t('des survivants gardent des déficits cognitifs ou une épilepsie chronique', 'of survivors retain cognitive deficits or chronic epilepsy'), color: '#FFB347' },
    { value: '5', label: 'syndromes', sub: 'FIRES · Anti-NMDAR · NORSE · PIMS · MOGAD/ADEM', color: '#6C7CFF' },
  ]

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#0C1424', position: 'relative', color: '#E8EAF0' }}>
      {/* ── Global cycling video background ── */}
      <CyclingVideoBackground />
      {/* ── Cinematic atmosphere layers ── */}
      {/* Warm golden halo top-left */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, rgba(245,166,35,0.02) 40%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: '40vw', height: '40vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(108,124,255,0.05) 0%, rgba(108,124,255,0.02) 40%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '35vw', height: '35vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '10%', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,166,35,0.04) 0%, transparent 60%)', filter: 'blur(50px)' }} />
        {/* Grain overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '256px' }} />
      </div>

      {/* ── Floating light particles ── */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 0,
          width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(245,166,35,0.5)' : i % 3 === 1 ? 'rgba(108,124,255,0.4)' : 'rgba(47,209,200,0.4)',
          boxShadow: i % 3 === 0 ? '0 0 6px rgba(245,166,35,0.3)' : i % 3 === 1 ? '0 0 6px rgba(108,124,255,0.3)' : '0 0 6px rgba(47,209,200,0.3)',
          left: `${5 + Math.random() * 90}%`,
          bottom: '-5%',
          animation: `float-particle ${15 + Math.random() * 20}s linear ${Math.random() * 15}s infinite`,
        }} />
      ))}

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--p-space-4) var(--p-space-8)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,20,36,0.85)', backdropFilter: 'blur(20px) saturate(1.3)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={40} height={40} style={{ filter: 'drop-shadow(0 0 12px rgba(108,124,255,0.5))', display: 'block', objectFit: 'contain' }} />
          <span className="text-gradient-brand" style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, letterSpacing: '0.1em' }}>PULSAR</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#6C7CFF', background: '#6C7CFF15', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', border: '1px solid #6C7CFF25' }}>V21</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)' }}>
          <LangToggle />
          <Link href="/login" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)', textDecoration: 'none', fontSize: 'var(--p-text-sm)' }}>{t('Connexion', 'Sign in')}</Link>
          <Link href="/login" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, boxShadow: '0 0 16px rgba(108,124,255,0.3)' }}>{t('Commencer', 'Get started')}</Link>
        </div>
      </nav>

      {/* ═══════════ MEMORIAL ═══════════ */}
      <style>{`
        @keyframes memorial-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes star-glow { 0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 4px rgba(245,166,35,0.3)); } 50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(245,166,35,0.6)); } }
        @keyframes line-grow { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        .landing-glass { background: rgba(16,22,40,0.6); backdrop-filter: blur(16px) saturate(1.2); border: 1px solid rgba(245,166,35,0.06); }
        .landing-glass:hover { border-color: rgba(245,166,35,0.12); }
      `}</style>
      <div style={{ textAlign: 'center', padding: 'var(--p-space-8) var(--p-space-8) 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(245,166,35,0.3))', animation: 'line-grow 1.8s ease-out 0.3s both', transformOrigin: 'right' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', animation: 'memorial-fade 2s ease-out 0.5s both' }}>
            <span style={{ fontSize: '16px', lineHeight: 1, animation: 'star-glow 3s ease-in-out 1.5s infinite' }}>✦</span>
            <p style={{ fontSize: '13px', color: 'rgba(245,166,35,0.7)', margin: 0, fontWeight: 300, letterSpacing: '0.08em', fontStyle: 'italic' }}>
              {t('À la mémoire d\'Alejandro R.', 'In memory of Alejandro R.')}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--p-text-dim)', margin: 0, fontFamily: 'var(--p-font-mono)', fontWeight: 500, letterSpacing: '0.15em' }}>
              2019 – 2025
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(245,166,35,0.55)', margin: '8px 0 0', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.6, maxWidth: 380, textAlign: 'center' }}>
              {t(
                'Je t\'avais fait une promesse, petit lion. Elle est désormais tenue. Aujourd\'hui, elle protégera d\'autres enfants.',
                'I made you a promise, little lion. It is now kept. Today, it will protect other children.'
              )}
            </p>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.3))', animation: 'line-grow 1.8s ease-out 0.3s both', transformOrigin: 'left' }} />
        </div>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="page-enter" style={{ textAlign: 'center', padding: 'var(--p-space-24) var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', gap: '8px', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: 'var(--p-vps-dim)', color: 'var(--p-vps)', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)' }}>{t('INTELLIGENCE CLINIQUE', 'CLINICAL INTELLIGENCE')}</span>
          <span style={{ padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: '#10B98112', color: '#10B981', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--p-font-mono)', border: '1px solid #10B98120' }}>{t('RECHERCHE TRANSLATIONNELLE', 'TRANSLATIONAL RESEARCH')}</span>
        </div>

        <h1 style={{ fontSize: 'var(--p-text-5xl)', fontWeight: 800, lineHeight: 'var(--p-leading-tight)', marginBottom: 'var(--p-space-6)', color: 'var(--p-text)' }}>
          {t("Quand le cerveau d'un enfant s'enflamme,", "When a child's brain ignites,")}<br /><span className="text-gradient-vps">{t('chaque seconde d\'avance sauve une vie.', 'every second ahead saves a life.')}</span>
        </h1>

        <p style={{ fontSize: 'var(--p-text-lg)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)', maxWidth: '720px', margin: '0 auto var(--p-space-6)' }}>
          {t("Chaque année, environ 30 000 enfants dans le monde sont frappés par des maladies neuro-inflammatoires — FIRES, NORSE, encéphalites auto-immunes, ADEM, MOGAD. Des enfants en parfaite santé dont le cerveau s'enflamme sans prévenir.", "Every year, approximately 30,000 children worldwide are struck by neuroinflammatory diseases — FIRES, NORSE, autoimmune encephalitis, ADEM, MOGAD. Perfectly healthy children whose brains ignite without warning.")}
        </p>

        <p style={{ fontSize: 'var(--p-text-base)', color: 'var(--p-text)', lineHeight: 'var(--p-leading-relaxed)', maxWidth: '720px', margin: '0 auto var(--p-space-10)', fontWeight: 600 }}>
          {t("PULSAR est le premier système d'intelligence artificielle entièrement dédié à ces pathologies. 7 moteurs qui pensent ensemble, un Discovery Engine qui croise chaque patient avec la recherche mondiale, et un principe fondateur : chaque enfant qui entre dans le système rend le système plus intelligent pour le suivant. Rien de tel n'existe aujourd'hui.", "PULSAR is the first AI system entirely dedicated to these conditions. 7 engines that think together, a Discovery Engine that cross-references each patient with global research, and a founding principle: every child who enters the system makes it smarter for the next one. Nothing like this exists today.")}
        </p>

        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', boxShadow: 'var(--p-shadow-glow-vps)' }}>{t('Accéder à PULSAR', 'Access PULSAR')}</Link>
          <Link href="/research" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98130', color: '#10B981', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '18px' }}>🔬</span> Discovery Engine</Link>
        </div>
      </section>

      {/* ═══════════ DOUBLE PROMESSE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-12) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--p-space-6)' }}>

          {/* CÔTÉ CLINIQUE */}
          <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', background: 'linear-gradient(135deg, rgba(108,124,255,0.05) 0%, rgba(245,166,35,0.03) 100%)', border: '1px solid rgba(108,124,255,0.10)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-3)' }}>{t('CÔTÉ CLINIQUE', 'CLINICAL SIDE')}</div>
            <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>{t('Comprimer le temps entre', 'Compress the time between')}<br />{t('le premier signal et', 'the first signal and')}<br /><span style={{ color: '#6C7CFF' }}>{t('la bonne décision', 'the right decision')}</span></h3>
            <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
              {t("Dans ces maladies, la différence entre séquelles et récupération se joue en heures. Le médecin isolé à 3h du matin ne peut pas connaître les 59 protocoles, les 25 publications récentes, les interactions entre 5 traitements simultanés.", "In these diseases, the difference between lasting damage and recovery is measured in hours. A doctor alone at 3 AM cannot know all 59 protocols, 25 recent publications, and interactions between 5 simultaneous treatments.")}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
              {t("PULSAR le peut. 5 moteurs d'analyse qui pensent ensemble — sévérité, escalade thérapeutique, pharmacovigilance, alerte précoce, prospection — pour que chaque clinicien, où qu'il soit, ait la puissance de décision du meilleur service de neuropédiatrie au monde.", "PULSAR can. 5 analysis engines that think together — severity, therapeutic escalation, pharmacovigilance, early warning, prospection — so that every clinician, wherever they are, has the decision-making power of the world's best neuropediatrics unit.")}
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--p-space-4)', flexWrap: 'wrap' }}>
              {engines.map((e) => (
                <span key={e.name} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: `${e.color}12`, border: `1px solid ${e.color}25`, fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: e.color }}>{e.name}</span>
              ))}
            </div>
          </div>

          {/* CÔTÉ RECHERCHE */}
          <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(245,166,35,0.03) 100%)', border: '1px solid rgba(16,185,129,0.10)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#10B981', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-3)' }}>{t('CÔTÉ RECHERCHE', 'RESEARCH SIDE')}</div>
            <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>{t('Chaque enfant qui passe dans', 'Every child who passes through')}<br />{t('PULSAR rend le système', 'PULSAR makes the system')}<br /><span style={{ color: '#10B981' }}>{t('plus intelligent pour le suivant', 'smarter for the next one')}</span></h3>
            <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
              {t("Le Discovery Engine fait ce que personne ne fait aujourd'hui. Il prend les données cliniques d'un enfant malade, les croise avec toute la littérature mondiale, et génère des hypothèses de recherche. Chaque cas enrichit les corrélations, affine les hypothèses, identifie les essais cliniques.", "The Discovery Engine does what no one does today. It takes clinical data from a sick child, cross-references it with all global literature, and generates research hypotheses. Each case enriches correlations, refines hypotheses, identifies clinical trials.")}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
              {t("L'enfant admis à Pointe-à-Pitre enrichit la décision pour l'enfant qui sera admis demain à Lyon, à Dakar ou à Montréal. Chaque tragédie individuelle se transforme en intelligence collective.", "A child admitted in Pointe-à-Pitre enriches decisions for the child who will be admitted tomorrow in Lyon, Dakar, or Montreal. Every individual tragedy transforms into collective intelligence.")}
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
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#F5A623', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-2)' }}>{t('MALADIES NEURO-INFLAMMATOIRES PÉDIATRIQUES', 'PEDIATRIC NEUROINFLAMMATORY DISEASES')}</div>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)' }}>{t("Quand le cerveau d'un enfant s'enflamme", "When a child's brain ignites")}</h2>
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
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5) var(--p-space-8)', marginTop: 'var(--p-space-4)', textAlign: 'center', borderLeft: '4px solid #F5A623' }}>
          <p style={{ fontSize: '12px', color: 'var(--p-text-muted)', lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: 'var(--p-text)' }}>FIRES</strong> (1/million) · <strong style={{ color: 'var(--p-text)' }}>Encéphalites auto-immunes</strong> (jusqu&apos;à 4,2/million) · <strong style={{ color: 'var(--p-text)' }}>NORSE</strong> (~3 200 cas/an aux USA) · <strong style={{ color: 'var(--p-text)' }}>ADEM</strong> (3–6/million) · <strong style={{ color: 'var(--p-text)' }}>MOGAD</strong> · <strong style={{ color: 'var(--p-text)' }}>PIMS/MIS-C</strong> — {t('des enfants en parfaite santé, foudroyés après un simple épisode infectieux. Les traitements de première ligne échouent dans la majorité des cas.', 'perfectly healthy children, struck down after a simple infection. First-line treatments fail in the majority of cases.')}
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
          <h2 style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>{t('De la donnée clinique', 'From clinical data')}<br />{t('à', 'to')} <span style={{ color: '#10B981' }}>{t("l'hypothèse de recherche", 'the research hypothesis')}</span></h2>
          <p style={{ fontSize: '14px', color: 'var(--p-text-muted)', maxWidth: '660px', margin: '0 auto', lineHeight: 1.8 }}>
            {t("4 niveaux d'analyse. PubMed et ClinicalTrials.gov en temps réel. Génération d'hypothèses par intelligence artificielle. Un pipeline de recherche translationnelle complet — du chevet de l'enfant à la publication scientifique.", "4 levels of analysis. PubMed and ClinicalTrials.gov in real time. AI-powered hypothesis generation. A complete translational research pipeline — from the child's bedside to scientific publication.")}
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
          <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>{t('🔬 Explorer le Discovery Engine', '🔬 Explore the Discovery Engine')}</Link>
        </div>
      </section>

      {/* ═══════════ TREATMENT PATHFINDER — PROMESSE THÉRAPEUTIQUE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8) var(--p-space-8)', background: 'linear-gradient(135deg, rgba(236,72,153,0.04) 0%, rgba(245,166,35,0.03) 50%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(236,72,153,0.10)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-6)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-4)' }}>
                <Picto name="microscope" size={32} glow glowColor="rgba(236,72,153,0.4)" />
                <div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#EC4899', letterSpacing: '2px', fontWeight: 800 }}>TREATMENT PATHFINDER</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Discovery Engine · Niveau 4</div>
                </div>
              </div>
              <h3 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)', lineHeight: 1.3 }}>{t('Pour chaque enfant, PULSAR', 'For every child, PULSAR')}<br />{t('cherche activement', 'actively searches for')} <span style={{ color: '#EC4899' }}>{t('des pistes de traitement', 'treatment pathways')}</span></h3>
              <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 'var(--p-space-4)' }}>
                {t("Le Treatment Pathfinder ne se contente pas d'analyser — il agit. À partir du profil clinique de chaque patient, il interroge les essais cliniques mondiaux, évalue l'éligibilité à des traitements ciblés, et remonte des pistes thérapeutiques directement dans les recommandations du clinicien.", "The Treatment Pathfinder doesn't just analyze — it acts. From each patient's clinical profile, it queries global clinical trials, evaluates eligibility for targeted treatments, and surfaces therapeutic leads directly in clinician recommendations.")}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.8, fontWeight: 600 }}>
                {t("Quand un enfant ne répond plus aux traitements de première ligne, le Pathfinder cherche ce qui pourrait fonctionner — dans la littérature, dans les essais en cours, dans les combinaisons que personne n'a encore testées sur ce profil précis.", "When a child no longer responds to first-line treatments, the Pathfinder searches for what might work — in the literature, in ongoing trials, in combinations no one has yet tested on this specific profile.")}
              </p>
            </div>
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { mol: 'Anakinra', type: 'Anti-IL-1', usage: t('FIRES réfractaire', 'Refractory FIRES'), color: '#EC4899' },
                { mol: 'Tocilizumab', type: 'Anti-IL-6', usage: t('Encéphalite auto-immune', 'Autoimmune encephalitis'), color: '#8B5CF6' },
                { mol: t('Régime cétogène', 'Ketogenic diet'), type: t('Métabolique', 'Metabolic'), usage: t('FIRES / épilepsie réfractaire', 'FIRES / refractory epilepsy'), color: '#10B981' },
                { mol: 'Rituximab', type: 'Anti-CD20', usage: t('Anti-NMDAR réfractaire', 'Refractory anti-NMDAR'), color: '#3B82F6' },
                { mol: t('Combinaisons', 'Combinations'), type: t('Multi-cibles', 'Multi-target'), usage: t('Profils complexes', 'Complex profiles'), color: '#FFB347' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: 'var(--p-radius-lg)', background: `${t.color}08`, border: `1px solid ${t.color}15` }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: `0 0 6px ${t.color}60` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{t.mol} <span style={{ fontWeight: 400, color: 'var(--p-text-dim)', fontSize: '10px' }}>({t.type})</span></div>
                    <div style={{ fontSize: '9px', color: t.color, fontFamily: 'var(--p-font-mono)', fontWeight: 600 }}>{t.usage}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', textAlign: 'center', marginTop: '4px', fontFamily: 'var(--p-font-mono)' }}>{t("Scoring d'éligibilité multicritères · ClinicalTrials.gov live", 'Multi-criteria eligibility scoring · ClinicalTrials.gov live')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ INGÉNIERIE ═══════════ */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-16)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', letterSpacing: '2px', fontWeight: 800, marginBottom: 'var(--p-space-2)' }}>{t('CE QUI REND PULSAR UNIQUE', 'WHAT MAKES PULSAR UNIQUE')}</div>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)' }}>{t('Un vrai système.', 'A real system.')}<br /><span className="text-gradient-brand">{t('Pas un chatbot.', 'Not a chatbot.')}</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: 'var(--p-space-6)' }}>
          {[
            { icon: 'brain', title: t('7 moteurs qui pensent ensemble', '7 engines that think together'), desc: t('Pas 7 outils séparés. Un pipeline intégré où chaque moteur enrichit les autres : la pharmacovigilance tient compte de l\'escalade thérapeutique, l\'alerte précoce intègre le score de sévérité, le Discovery Engine injecte ses signaux dans les recommandations.', 'Not 7 separate tools. An integrated pipeline where each engine enriches the others: pharmacovigilance accounts for therapeutic escalation, early warning integrates the severity score, the Discovery Engine injects its signals into recommendations.'), color: '#6C7CFF' },
            { icon: 'microscope', title: t("De la donnée brute à l'hypothèse publiable", 'From raw data to publishable hypothesis'), desc: t("Le Discovery Engine fait ce que personne ne fait : il prend les constantes d'un enfant malade, les croise avec PubMed et ClinicalTrials.gov en temps réel, détecte les contradictions avec le protocole en cours, et génère des hypothèses de recherche prêtes à être validées.", 'The Discovery Engine does what no one else does: it takes a sick child\'s vitals, cross-references them with PubMed and ClinicalTrials.gov in real time, detects contradictions with the current protocol, and generates research hypotheses ready for validation.'), color: '#10B981' },
            { icon: 'shield', title: t('95 scénarios cliniques validés', '95 validated clinical scenarios'), desc: t('FIRES avec drépanocytose. Anti-NMDAR en contexte tropical-VIH. NORSE post-transfert. Chaque moteur est testé contre des cas réels, pas des exemples théoriques. 95 tests, 0 erreur. Ce système ne devine pas — il calcule.', 'FIRES with sickle cell disease. Anti-NMDAR in tropical-HIV context. Post-transfer NORSE. Each engine is tested against real cases, not theoretical examples. 95 tests, 0 errors. This system doesn\'t guess — it calculates.'), color: '#A78BFA' },
            { icon: 'books', title: t('Connecté à la science mondiale', 'Connected to global science'), desc: t('Veille PubMed automatique (10 requêtes). ClinicalTrials.gov en temps réel. 59 références cliniques intégrées. Export publication en 3 formats. Le savoir n\'est plus enfermé dans des PDF que personne n\'a le temps de lire.', 'Automatic PubMed monitoring (10 queries). ClinicalTrials.gov in real time. 59 integrated clinical references. Publication export in 3 formats. Knowledge is no longer locked in PDFs that no one has time to read.'), color: '#3B82F6' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Picto name={item.icon} size={24} glow glowColor={item.color + '60'} />
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
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>{t("PARCOURS PATIENT — DE L'ADMISSION À LA PUBLICATION", 'PATIENT PATHWAY — FROM ADMISSION TO PUBLICATION')}</div>
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
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'linear-gradient(135deg, #6C7CFF, #2FD1C8)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', boxShadow: '0 4px 20px rgba(108,124,255,0.3)' }}><span style={{ fontSize: '16px' }}>▶</span> Accéder à PULSAR</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PIPELINE MOTEURS ═══════════ */}

      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-8)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>{t('PIPELINE — 6+1 MOTEURS × 4 COUCHES', 'PIPELINE — 6+1 ENGINES × 4 LAYERS')}</div>
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
        <h2 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>{t('6+1 moteurs qui pensent ensemble', '6+1 engines that think together')}</h2>
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
        <div style={{ maxWidth: '700px', margin: '0 auto', borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-10) var(--p-space-8)', background: 'linear-gradient(135deg, rgba(108,124,255,0.04) 0%, rgba(245,166,35,0.04) 50%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(245,166,35,0.08)', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, marginBottom: 'var(--p-space-4)', color: 'var(--p-text)', lineHeight: 1.3 }}>{t('La bonne information.', 'The right information.')}<br />{t('Au bon endroit.', 'In the right place.')} <span className="text-gradient-vps">{t('Au bon moment.', 'At the right time.')}</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', maxWidth: '560px', margin: '0 auto var(--p-space-8)', lineHeight: 1.8 }}>
            {t('95/95 tests. 59 références cliniques. 25 publications Discovery. Veille PubMed live. 5 pathologies. 15 tables de données. Parce que chaque minute gagnée peut changer une vie.', '95/95 tests. 59 clinical references. 25 Discovery publications. Live PubMed monitoring. 5 pathologies. 15 data tables. Because every minute saved can change a life.')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-lg)', boxShadow: 'var(--p-shadow-glow-vps)' }}>{t('Commencer', 'Get started')}</Link>
            <Link href="/research" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: '#10B98110', border: '2px solid #10B98125', color: '#10B981', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--p-text-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>🔬 Discovery</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ MÉMORIAL + FOOTER ═══════════ */}


      <footer style={{ borderTop: '1px solid rgba(245,166,35,0.08)', padding: 'var(--p-space-6) var(--p-space-8)', textAlign: 'center', color: 'var(--p-text-dim)', fontSize: 'var(--p-text-xs)', position: 'relative', zIndex: 1 }}>
        {t('PULSAR V21 · Intelligence clinique pédiatrique · Discovery Engine v4.0 · © 2026 Steve Moradel', 'PULSAR V21 · Pediatric Clinical Intelligence · Discovery Engine v4.0 · © 2026 Steve Moradel')}
      </footer>
    </div>
  )
}
