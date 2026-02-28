import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--p-bg)', padding: 'var(--p-space-6)',
    }}>
      <div className="page-enter" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div className="glass-card" style={{ padding: 'var(--p-space-8)', borderRadius: 'var(--p-radius-2xl)' }}>
          <div style={{
            fontSize: '6rem', fontWeight: 800, fontFamily: 'var(--p-font-mono)',
            background: 'linear-gradient(135deg, var(--p-vps) 0%, var(--p-critical) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1, marginBottom: 'var(--p-space-4)',
          }}>404</div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-2)' }}>
            Signal non détecté
          </h1>
          <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-6)', lineHeight: 1.6 }}>
            Cette page ne fait pas partie du protocole PULSAR.
            Les 5 moteurs sont actifs mais ne trouvent rien ici.
          </p>
          <div style={{ display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/patients" style={{
              padding: '10px 24px', borderRadius: 'var(--p-radius-lg)', border: 'none',
              background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde))',
              color: '#fff', fontSize: 'var(--p-text-sm)', fontWeight: 700,
              textDecoration: 'none', boxShadow: 'var(--p-shadow-glow-vps)',
            }}>
              Dashboard →
            </Link>
            <Link href="/" style={{
              padding: '10px 24px', borderRadius: 'var(--p-radius-lg)',
              border: 'var(--p-border)', background: 'var(--p-bg-elevated)',
              color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600,
              textDecoration: 'none',
            }}>
              Accueil
            </Link>
          </div>
          <div style={{ marginTop: 'var(--p-space-6)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            PULSAR · Aide à la décision clinique pédiatrique
          </div>
        </div>
      </div>
    </div>
  )
}
