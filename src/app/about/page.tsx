import Picto from '@/components/Picto'

export default function AboutPage() {
  return (
    <div className="page-enter" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      {/* Logo */}
      <div style={{ marginBottom: 'var(--p-space-6)', paddingTop: 'var(--p-space-4)' }}>
        <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={80} height={80} style={{ borderRadius: 16, margin: '0 auto var(--p-space-4)', display: 'block', filter: 'drop-shadow(0 0 20px rgba(108,124,255,0.4))' }} />
        <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde), var(--p-pve))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PULSAR</h1>
        <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-2)' }}>Pediatric Urgent Limbic &amp; Systemic Alert Response</div>
        <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', padding: '3px 12px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', color: 'var(--p-vps)' }}>Version 15 — Fusion Définitive</span>
      </div>

      {/* Memorial */}
      <div className="glass-card" style={{ padding: 'var(--p-space-6)', marginBottom: 'var(--p-space-6)', borderTop: '2px solid var(--p-vps)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--p-vps-dim)', border: '2px solid var(--p-vps)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--p-space-4)' }}>
          <Picto name="heart" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        </div>
        <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--p-space-3)' }}>In Memoriam</div>
        <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-2)' }}>Alejandro R.</div>
        <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-4)' }}>2019 — 2025</div>
        <div style={{ fontStyle: 'italic', color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
          &laquo; Pour Gabriel, et pour tous les enfants que le temps n&apos;a pas attendus. &raquo;
        </div>
      </div>

      {/* Architecture */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)', textAlign: 'left' }}>
        <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-4)' }}>Architecture V15</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--p-space-3)' }}>
          {[
            { label: 'Brain Engines', value: '5', sub: 'VPS·TDE·PVE·EWE·TPE', color: 'var(--p-vps)' },
            { label: 'Couches/moteur', value: '4', sub: 'Intention·Contexte·Règles·Courbe', color: 'var(--p-tde)' },
            { label: 'Crash tests', value: '7/7', sub: 'Tous scénarios validés', color: 'var(--p-success)' },
            { label: 'Modules', value: '30', sub: 'Fonctionnels, 0 placeholder', color: 'var(--p-pve)' },
            { label: 'Publications', value: '17', sub: 'Référencées dans les moteurs', color: 'var(--p-info)' },
            { label: 'Pathologies', value: '5', sub: 'FIRES·EAIS·NORSE·PIMS·MOGAD', color: 'var(--p-ewe)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
              <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--p-text)' }}>{s.label}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', textAlign: 'left' }}>
        <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>Crédits</h2>
        <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', lineHeight: 2 }}>
          <div><span style={{ color: 'var(--p-text)', fontWeight: 600 }}>Conception &amp; Direction</span> — Steve Moraldo</div>
          <div><span style={{ color: 'var(--p-text)', fontWeight: 600 }}>Développement &amp; IA</span> — Claude (Anthropic)</div>
          <div><span style={{ color: 'var(--p-text)', fontWeight: 600 }}>Design Pictogrammes</span> — GPT-4o (OpenAI)</div>
          <div><span style={{ color: 'var(--p-text)', fontWeight: 600 }}>Stack</span> — Next.js 14, TypeScript, Supabase, Vercel</div>
          <div><span style={{ color: 'var(--p-text)', fontWeight: 600 }}>Benchmark</span> — Francoeur 2023, Bilodeau 2024, Shakeshaft 2024, SPF 932 cas</div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--p-space-6)', fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 · Fusion Définitive · Février 2026
      </div>
    </div>
  )
}
