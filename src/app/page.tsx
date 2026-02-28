import Link from 'next/link'

const engines = [
  { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF',
    desc: "Évalue la sévérité globale via 4 champs sémantiques. Lit les signaux vitaux comme un cerveau, pas comme une calculatrice." },
  { name: 'TDE', full: 'Therapeutic Decision Engine', color: '#2FD1C8',
    desc: "Recommande l'escalade thérapeutique adaptée à chaque pathologie. FIRES, anti-NMDAR, MOGAD — chaque pattern a sa logique." },
  { name: 'PVE', full: 'Pharmacovigilance Engine', color: '#B96BFF',
    desc: 'Détecte les interactions critiques en temps réel. Croise traitements, pathologie et terrain pour prévenir les accidents.' },
  { name: 'EWE', full: 'Early Warning Engine', color: '#FF6B8A',
    desc: 'Détection précoce des détériorations. Analyse les tendances vitales pour alerter avant la décompensation clinique.' },
  { name: 'TPE', full: 'Therapeutic Prospection Engine', color: '#FFB347',
    desc: "Prospection à J+7/J+14. Projette l'évolution probable et recommande les ajustements thérapeutiques anticipés." },
]

const features = [
  { icon: '/assets/organs/brain.png', title: '5 Moteurs Cerveau', desc: 'VPS · TDE · PVE · EWE · TPE — chaque moteur pense en 4 couches : intention, contexte, règles métier, courbe globale.' },
  { icon: '/assets/organs/dna.png', title: '5 Pathologies', desc: 'FIRES · anti-NMDAR · NORSE · PIMS/MIS-C · MOGAD/ADEM — couverture des encéphalopathies inflammatoires pédiatriques.' },
  { icon: '/assets/organs/virus.png', title: 'Evidence-Based', desc: '59 références cliniques. Benchmarké sur Francoeur JAMA 2024, Bilodeau 2024, Shakeshaft AUC 0.72, SPF 932 cas.' },
]

const workflow = [
  { step: '1', label: 'Arrivée', desc: 'Admission + Mode Urgence 3h', color: '#FF4757', time: '0-15s' },
  { step: '2', label: 'Bilan', desc: '26 examens, 5 moteurs activés', color: '#6C7CFF', time: '15-30s' },
  { step: '3', label: 'Diagnostic', desc: 'FIRES 11/13, alerte épidémio', color: '#B96BFF', time: '30-50s' },
  { step: '4', label: 'Traitement', desc: 'Recommandations + pharmacovigilance', color: '#2ED573', time: '50-70s' },
  { step: '5', label: 'Monitoring', desc: 'Cockpit live, timeline, J+7', color: '#2FD1C8', time: '70-85s' },
]

export default function LandingPage() {
  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--p-bg)', position: 'relative' }}>
      {/* Background mesh */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(108,124,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(185,107,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(47,209,200,0.03) 0%, transparent 50%)' }} />

      {/* Nav */}
      <nav className="glass" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--p-space-4) var(--p-space-8)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={36} height={36} style={{ borderRadius: 8, filter: 'drop-shadow(0 0 8px rgba(108,124,255,0.3))' }} />
          <span className="text-gradient-brand" style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, letterSpacing: '0.1em' }}>PULSAR</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)' }}>
          <Link href="/login" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)', textDecoration: 'none', fontSize: 'var(--p-text-sm)' }}>Connexion</Link>
          <Link href="/patients" style={{ padding: 'var(--p-space-2) var(--p-space-5)', borderRadius: 'var(--p-radius-md)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, boxShadow: '0 0 16px rgba(108,124,255,0.3)' }}>Commencer</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="page-enter" style={{ textAlign: 'center', padding: 'var(--p-space-24) var(--p-space-8) var(--p-space-16)', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', padding: 'var(--p-space-1) var(--p-space-4)', borderRadius: 'var(--p-radius-full)', background: 'var(--p-vps-dim)', color: 'var(--p-vps)', fontSize: 'var(--p-text-xs)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 'var(--p-space-6)', fontFamily: 'var(--p-font-mono)' }}>
          5 BRAIN ENGINES × 4 LAYERS
        </div>

        <h1 style={{ fontSize: 'var(--p-text-5xl)', fontWeight: 800, lineHeight: 'var(--p-leading-tight)', marginBottom: 'var(--p-space-6)', color: 'var(--p-text)' }}>
          L&apos;aide à la décision<br />qui pense comme un<br />
          <span className="text-gradient-vps">clinicien</span>
        </h1>

        <p style={{ fontSize: 'var(--p-text-lg)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)', marginBottom: 'var(--p-space-10)', maxWidth: '600px', margin: '0 auto var(--p-space-10)' }}>
          PULSAR analyse les encéphalopathies inflammatoires pédiatriques avec 5 moteurs cerveau qui lisent l&apos;intention, le contexte, les règles métier et la trajectoire — pas juste des seuils.
        </p>

        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/patients" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', boxShadow: 'var(--p-shadow-glow-vps)' }}>
            Accéder à PULSAR
          </Link>
          <Link href="/patients" style={{ padding: 'var(--p-space-3) var(--p-space-8)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)', border: '2px solid rgba(108,124,255,0.3)', color: 'var(--p-vps)', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>▶</span> Voir en action
          </Link>
        </div>

        {/* Engine pills */}
        <div style={{ display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center', marginTop: 'var(--p-space-12)', flexWrap: 'wrap' }}>
          {['VPS', 'TDE', 'PVE', 'EWE', 'TPE'].map((e, i) => {
            const colors = ['#6C7CFF', '#2FD1C8', '#B96BFF', '#FF6B8A', '#FFB347']
            return (
              <span key={e} style={{ padding: 'var(--p-space-1) var(--p-space-3)', borderRadius: 'var(--p-radius-full)', background: `${colors[i]}15`, color: colors[i], fontSize: 'var(--p-text-xs)', fontWeight: 600, fontFamily: 'var(--p-font-mono)', border: `1px solid ${colors[i]}30`, boxShadow: `0 0 8px ${colors[i]}20` }}>
                {e}
              </span>
            )
          })}
        </div>
      </section>

      {/* Demo Workflow Preview — "Cas Inès en 90 secondes" */}
      <section className="page-enter-stagger" style={{ padding: '0 var(--p-space-8) var(--p-space-16)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-5)' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: '8px' }}>CAS CLINIQUE — DÉMONSTRATION AUTOPILOTÉE</div>
            <h3 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Inès, 4 ans — FIRES suspecté</h3>
            <p style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginTop: '4px' }}>13 scènes · 5 moteurs · De l&apos;admission au suivi J+7</p>
          </div>

          {/* Workflow steps */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch', marginBottom: 'var(--p-space-4)' }}>
            {workflow.map((w, i) => (
              <div key={i} style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  background: `${w.color}15`, borderRadius: 'var(--p-radius-md)',
                  padding: '12px 8px', textAlign: 'center', borderTop: `3px solid ${w.color}`,
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: w.color, fontFamily: 'var(--p-font-mono)' }}>{w.step}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)', marginTop: '4px' }}>{w.label}</div>
                  <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{w.desc}</div>
                </div>
                {i < workflow.length - 1 && (
                  <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--p-text-dim)', fontSize: '12px', zIndex: 2 }}>›</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/patients" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: 'var(--p-space-3) var(--p-space-8)',
              borderRadius: 'var(--p-radius-lg)',
              background: 'linear-gradient(135deg, #6C7CFF, #2FD1C8)',
              color: '#fff', textDecoration: 'none', fontWeight: 700,
              fontSize: 'var(--p-text-sm)',
              boxShadow: '0 4px 20px rgba(108,124,255,0.3)',
            }}>
              <span style={{ fontSize: '16px' }}>▶</span>
              Lancer la démo Inès — 13 scènes
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline Visual */}
      <section className="page-enter-stagger" style={{ padding: '0 var(--p-space-8) var(--p-space-16)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-6)', overflow: 'hidden' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px', marginBottom: 'var(--p-space-4)', textAlign: 'center' }}>PIPELINE BRAINCORE — 4 COUCHES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {engines.map((e, i) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ padding: '8px 16px', borderRadius: 'var(--p-radius-lg)', background: `${e.color}12`, border: `1px solid ${e.color}25`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.color, boxShadow: `0 0 6px ${e.color}60` }} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: '13px' }}>{e.name}</span>
                </div>
                {i < 4 && <span style={{ color: 'var(--p-text-dim)', fontSize: '14px' }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: 'var(--p-space-4)' }}>
            {['Intention', 'Contexte', 'Règles Métier', 'Courbe Globale'].map((l, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: `var(--p-vps)`, opacity: 1 - i * 0.15, margin: '0 auto 4px' }} />
                <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>L{i + 1} {l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="page-enter-stagger" style={{ padding: 'var(--p-space-16) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--p-space-6)' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-8)' }}>
              <div style={{ marginBottom: 'var(--p-space-4)' }}><img src={f.icon} alt={f.title} width={48} height={48} style={{ borderRadius: 8, filter: 'drop-shadow(0 0 12px rgba(108,124,255,0.4))' }} /></div>
              <h3 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, marginBottom: 'var(--p-space-3)', color: 'var(--p-text)' }}>{f.title}</h3>
              <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engines Preview */}
      <section className="page-enter-stagger" style={{ padding: 'var(--p-space-16) var(--p-space-8)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--p-space-12)' }}>
          Moteurs Cerveau
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
          {engines.map((e) => (
            <div key={e.name} className="glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-5)', borderLeft: `3px solid ${e.color}`, borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-6)' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-lg)', color: e.color, minWidth: '3.5rem' }}>{e.name}</span>
              <div>
                <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 600, color: 'var(--p-text)', marginBottom: 'var(--p-space-1)' }}>{e.full}</div>
                <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 'var(--p-leading-relaxed)' }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-enter-stagger" style={{ textAlign: 'center', padding: 'var(--p-space-16) var(--p-space-8) var(--p-space-24)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'var(--p-text-3xl)', fontWeight: 800, marginBottom: 'var(--p-space-4)', color: 'var(--p-text)' }}>Prêt à tester ?</h2>
        <p style={{ fontSize: 'var(--p-text-base)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-8)' }}>7/7 crash tests passés. 59 références cliniques. Pipeline validé.</p>
        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/patients" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-vps)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--p-text-lg)', boxShadow: 'var(--p-shadow-glow-vps)' }}>
            Commencer gratuitement
          </Link>
          <Link href="/patients" style={{ padding: 'var(--p-space-4) var(--p-space-10)', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)', border: '2px solid rgba(108,124,255,0.2)', color: 'var(--p-text)', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--p-text-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>▶</span> Voir la démo
          </Link>
        </div>
      </section>

      {/* Memorial */}
      <div style={{ textAlign: 'center', padding: 'var(--p-space-8) var(--p-space-8) var(--p-space-4)', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)', fontStyle: 'italic', maxWidth: '500px', margin: '0 auto', lineHeight: 'var(--p-leading-relaxed)' }}>
          « Pour Gabriel, et pour tous les enfants que le temps n&apos;a pas attendus. »
        </p>
        <p style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginTop: 'var(--p-space-2)' }}>
          In memory of Alejandro R. (2019–2025)
        </p>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: 'var(--p-border)', padding: 'var(--p-space-6) var(--p-space-8)', textAlign: 'center', color: 'var(--p-text-dim)', fontSize: 'var(--p-text-xs)', position: 'relative', zIndex: 1 }}>
        PULSAR · Aide à la décision clinique pédiatrique · © 2026 Steve Moradel
      </footer>
    </div>
  )
}
