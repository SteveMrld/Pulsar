'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--p-space-6)',
    }}>
      <div className="page-enter" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div className="glass-card" style={{ padding: 'var(--p-space-8)', borderRadius: 'var(--p-radius-2xl)' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto var(--p-space-4)',
            background: 'var(--p-critical-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', border: '2px solid var(--p-critical)',
          }}>⚠️</div>
          <h2 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 700, color: 'var(--p-critical)', marginBottom: 'var(--p-space-2)' }}>
            Erreur détectée
          </h2>
          <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-2)', lineHeight: 1.6 }}>
            Un problème est survenu dans ce module. Les moteurs PULSAR continuent de fonctionner.
          </p>
          <p style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-5)', padding: '8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)', wordBreak: 'break-all' }}>
            {error.message}
          </p>
          <button onClick={reset} style={{
            padding: '10px 28px', borderRadius: 'var(--p-radius-lg)', border: 'none',
            background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde))',
            color: '#fff', fontSize: 'var(--p-text-sm)', fontWeight: 700, cursor: 'pointer',
            boxShadow: 'var(--p-shadow-glow-vps)',
          }}>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}
