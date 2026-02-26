import Link from 'next/link'

const engines = [
  {
    name: 'VPS',
    full: 'Vital Prognosis Score',
    color: '#6C7CFF',
    desc: 'Évalue la sévérité globale via 4 champs sémantiques. Lit les signaux vitaux comme un cerveau, pas comme une calculatrice.',
  },
  {
    name: 'TDE',
    full: 'Therapeutic Decision Engine',
    color: '#2FD1C8',
    desc: 'Recommande l\'escalade thérapeutique adaptée à chaque pathologie. FIRES, anti-NMDAR, MOGAD — chaque pattern a sa logique.',
  },
  {
    name: 'PVE',
    full: 'Pharmacovigilance Engine',
    color: '#B96BFF',
    desc: 'Détecte les interactions critiques en temps réel. Croise traitements, pathologie et terrain pour prévenir les accidents.',
  },
]

const features = [
  {
    icon: '🧠',
    title: '5 Moteurs Cerveau',
    desc: 'VPS · TDE · PVE · EWE · TPE — chaque moteur pense en 4 couches : intention, contexte, règles métier, courbe globale.',
  },
  {
    icon: '⚡',
    title: '5 Pathologies',
    desc: 'FIRES · anti-NMDAR · NORSE · PIMS/MIS-C · MOGAD/ADEM — couverture des encéphalopathies inflammatoires pédiatriques.',
  },
  {
    icon: '🔬',
    title: 'Evidence-Based',
    desc: '59 références cliniques. Benchmarké sur Francoeur JAMA 2024, Bilodeau 2024, Shakeshaft AUC 0.72, SPF 932 cas.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--p-space-4) var(--p-space-8)',
        borderBottom: 'var(--p-border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(14,14,22,0.85)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <span style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em' }}>
            PULSAR
          </span>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
            V15
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)' }}>
          <Link href="/login" style={{
            padding: 'var(--p-space-2) var(--p-space-5)',
            borderRadius: 'var(--p-radius-md)',
            color: 'var(--p-text-muted)',
            textDecoration: 'none',
            fontSize: 'var(--p-text-sm)',
            transition: 'color 0.2s',
          }}>
            Connexion
          </Link>
          <Link href="/signup" style={{
            padding: 'var(--p-space-2) var(--p-space-5)',
            borderRadius: 'var(--p-radius-md)',
            background: 'var(--p-vps)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 'var(--p-text-sm)',
            fontWeight: 600,
          }}>
            Commencer
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--p-space-24) var(--p-space-8) var(--p-space-16)',
        maxWidth: '800px', margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          padding: 'var(--p-space-1) var(--p-space-4)',
          borderRadius: 'var(--p-radius-full)',
          background: 'var(--p-vps-dim)',
          color: 'var(--p-vps)',
          fontSize: 'var(--p-text-xs)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          marginBottom: 'var(--p-space-6)',
          fontFamily: 'var(--p-font-mono)',
        }}>
          5 BRAIN ENGINES × 4 LAYERS
        </div>

        <h1 style={{
          fontSize: 'var(--p-text-5xl)',
          fontWeight: 800,
          lineHeight: 'var(--p-leading-tight)',
          marginBottom: 'var(--p-space-6)',
          color: 'var(--p-text)',
        }}>
          L&apos;aide à la décision<br />
          qui pense comme un<br />
          <span style={{ color: 'var(--p-vps)' }}>clinicien</span>
        </h1>

        <p style={{
          fontSize: 'var(--p-text-lg)',
          color: 'var(--p-text-muted)',
          lineHeight: 'var(--p-leading-relaxed)',
          marginBottom: 'var(--p-space-10)',
          maxWidth: '600px', margin: '0 auto var(--p-space-10)',
        }}>
          PULSAR analyse les encéphalopathies inflammatoires pédiatriques
          avec 5 moteurs cerveau qui lisent l&apos;intention, le contexte,
          les règles métier et la trajectoire — pas juste des seuils.
        </p>

        <div style={{ display: 'flex', gap: 'var(--p-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: 'var(--p-space-3) var(--p-space-8)',
            borderRadius: 'var(--p-radius-lg)',
            background: 'var(--p-vps)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 'var(--p-text-base)',
            boxShadow: 'var(--p-shadow-glow-vps)',
          }}>
            Accéder à PULSAR
          </Link>
          <a href="#features" style={{
            padding: 'var(--p-space-3) var(--p-space-8)',
            borderRadius: 'var(--p-radius-lg)',
            background: 'var(--p-bg-elevated)',
            border: 'var(--p-border)',
            color: 'var(--p-text)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: 'var(--p-text-base)',
          }}>
            Découvrir
          </a>
        </div>

        {/* Engine pills */}
        <div style={{
          display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center',
          marginTop: 'var(--p-space-12)', flexWrap: 'wrap',
        }}>
          {['VPS', 'TDE', 'PVE', 'EWE', 'TPE'].map((e, i) => {
            const colors = ['#6C7CFF', '#2FD1C8', '#B96BFF', '#FF6B8A', '#FFB347']
            return (
              <span key={e} style={{
                padding: 'var(--p-space-1) var(--p-space-3)',
                borderRadius: 'var(--p-radius-full)',
                background: `${colors[i]}15`,
                color: colors[i],
                fontSize: 'var(--p-text-xs)',
                fontWeight: 600,
                fontFamily: 'var(--p-font-mono)',
                border: `1px solid ${colors[i]}30`,
              }}>
                {e}
              </span>
            )
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{
        padding: 'var(--p-space-16) var(--p-space-8)',
        maxWidth: '1000px', margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--p-space-6)',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--p-bg-card)',
              border: 'var(--p-border)',
              borderRadius: 'var(--p-radius-xl)',
              padding: 'var(--p-space-8)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--p-space-4)' }}>{f.icon}</div>
              <h3 style={{
                fontSize: 'var(--p-text-lg)',
                fontWeight: 700,
                marginBottom: 'var(--p-space-3)',
                color: 'var(--p-text)',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 'var(--p-text-sm)',
                color: 'var(--p-text-muted)',
                lineHeight: 'var(--p-leading-relaxed)',
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Engines Preview ── */}
      <section style={{
        padding: 'var(--p-space-16) var(--p-space-8)',
        maxWidth: '1000px', margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 'var(--p-text-3xl)', fontWeight: 800,
          textAlign: 'center', marginBottom: 'var(--p-space-12)',
          color: 'var(--p-text)',
        }}>
          Moteurs Cerveau
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
          {engines.map((e) => (
            <div key={e.name} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-5)',
              background: 'var(--p-bg-card)',
              border: 'var(--p-border)',
              borderLeft: `3px solid ${e.color}`,
              borderRadius: 'var(--p-radius-lg)',
              padding: 'var(--p-space-6)',
            }}>
              <span style={{
                fontFamily: 'var(--p-font-mono)',
                fontWeight: 800,
                fontSize: 'var(--p-text-lg)',
                color: e.color,
                minWidth: '3.5rem',
              }}>
                {e.name}
              </span>
              <div>
                <div style={{
                  fontSize: 'var(--p-text-sm)',
                  fontWeight: 600,
                  color: 'var(--p-text)',
                  marginBottom: 'var(--p-space-1)',
                }}>
                  {e.full}
                </div>
                <p style={{
                  fontSize: 'var(--p-text-sm)',
                  color: 'var(--p-text-muted)',
                  lineHeight: 'var(--p-leading-relaxed)',
                }}>
                  {e.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--p-space-16) var(--p-space-8) var(--p-space-24)',
      }}>
        <h2 style={{
          fontSize: 'var(--p-text-3xl)', fontWeight: 800,
          marginBottom: 'var(--p-space-4)',
          color: 'var(--p-text)',
        }}>
          Prêt à tester ?
        </h2>
        <p style={{
          fontSize: 'var(--p-text-base)',
          color: 'var(--p-text-muted)',
          marginBottom: 'var(--p-space-8)',
        }}>
          7/7 crash tests passés. 59 références cliniques. Pipeline validé.
        </p>
        <Link href="/signup" style={{
          padding: 'var(--p-space-4) var(--p-space-10)',
          borderRadius: 'var(--p-radius-lg)',
          background: 'var(--p-vps)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 'var(--p-text-lg)',
          boxShadow: 'var(--p-shadow-glow-vps)',
        }}>
          Commencer gratuitement
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: 'var(--p-border)',
        padding: 'var(--p-space-6) var(--p-space-8)',
        textAlign: 'center',
        color: 'var(--p-text-dim)',
        fontSize: 'var(--p-text-xs)',
      }}>
        PULSAR V15 — Pediatric Urgent Lifesaving System for Acute Response · © 2026 Steve Moradel
      </footer>
    </div>
  )
}
