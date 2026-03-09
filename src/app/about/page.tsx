import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PULSAR - A propos',
  description: 'PULSAR v21.4 - Outil aide decision clinique pediatrique neuro-inflammatoire.',
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', color: '#e2e8f0' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#fff', marginBottom: 8 }}>
        PULSAR v21.4
      </h1>
      <p style={{ fontSize: 13, color: '#6C7CFF', marginBottom: 32, fontFamily: 'monospace' }}>
        Discovery Engine v4.0 &middot; Beta clinique
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {[
          ['Version', 'PULSAR v21.4'],
          ['Statut', 'Beta clinique'],
          ['Stack', 'Next.js 14 / TypeScript / Supabase'],
          ['Collaboration', 'Pierre Sonigo - ex-directeur INSERM'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 13, color: '#e2e8f0' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '28px 32px', marginBottom: 32 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#f87171', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
          In Memoriam &middot; 2019&ndash;2025
        </p>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', marginBottom: 10 }}>
          Alejandro R. &mdash; Patient Zero
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
          FIRES diagnostique a J+5, Anakinra administre a J+10 &mdash; cinq jours trop tard.
          PULSAR est ne pour que cela n&apos;arrive plus.
        </p>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '18px 22px' }}>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.75 }}>
          <strong style={{ color: '#f59e0b' }}>Avertissement :</strong>{' '}
          PULSAR est un outil d&apos;aide a la decision. Il ne remplace pas le jugement du medecin
          et ne constitue pas une prescription medicale.
        </p>
      </div>
    </div>
  )
}
