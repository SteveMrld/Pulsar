'use client'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProjectPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── Top bar ── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--p-space-4) var(--p-space-6)',
        borderBottom: 'var(--p-border)',
        background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em', fontSize: 'var(--p-text-lg)' }}>
              PULSAR
            </span>
          </Link>
          <span style={{ color: 'var(--p-text-dim)' }}>›</span>
          <span style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)' }}>Nouveau CDC</span>
        </div>
        <ThemeToggle />
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--p-space-8) var(--p-space-6)' }}>
        <h1 style={{
          fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)',
          marginBottom: 'var(--p-space-2)',
        }}>
          Cahier des Charges Clinique
        </h1>
        <p style={{
          color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)',
          marginBottom: 'var(--p-space-8)',
        }}>
          Renseignez les données patient pour lancer le pipeline VPS → TDE → PVE → EWE → TPE
        </p>

        {/* ── Placeholder sections ── */}
        {[
          { title: 'Identité Patient', desc: 'Âge, poids, sexe, antécédents', icon: '👤' },
          { title: 'Tableau Neurologique', desc: 'GCS, crises, pupilles, mouvements anormaux', icon: '🧠' },
          { title: 'Biologie & LCR', desc: 'NFS, CRP, ponction lombaire, anticorps', icon: '🔬' },
          { title: 'Traitements en cours', desc: 'Antiépileptiques, immunothérapie, réanimation', icon: '💊' },
          { title: 'Imagerie & EEG', desc: 'IRM, EEG continu, patterns spécifiques', icon: '📊' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--p-bg-card)',
            border: 'var(--p-border)',
            borderRadius: 'var(--p-radius-lg)',
            padding: 'var(--p-space-6)',
            marginBottom: 'var(--p-space-4)',
            opacity: 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
              <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
              <h3 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)' }}>
                {s.title}
              </h3>
              <span style={{
                fontSize: 'var(--p-text-xs)',
                fontFamily: 'var(--p-font-mono)',
                padding: 'var(--p-space-1) var(--p-space-2)',
                borderRadius: 'var(--p-radius-full)',
                background: 'var(--p-warning-bg)',
                color: 'var(--p-warning)',
              }}>
                Session 2
              </span>
            </div>
            <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)' }}>
              {s.desc}
            </p>
          </div>
        ))}

        {/* ── Pipeline visualization ── */}
        <div style={{
          background: 'var(--p-bg-card)',
          border: 'var(--p-border)',
          borderRadius: 'var(--p-radius-xl)',
          padding: 'var(--p-space-6)',
          marginTop: 'var(--p-space-8)',
        }}>
          <h3 style={{
            fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)',
            marginBottom: 'var(--p-space-4)',
          }}>
            Pipeline séquentiel
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)',
            flexWrap: 'wrap',
          }}>
            {[
              { name: 'VPS', color: '#6C7CFF' },
              { name: 'TDE', color: '#2FD1C8' },
              { name: 'PVE', color: '#B96BFF' },
              { name: 'EWE', color: '#FF6B8A' },
              { name: 'TPE', color: '#FFB347' },
            ].map((e, i) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
                <span style={{
                  fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                  padding: 'var(--p-space-2) var(--p-space-3)',
                  borderRadius: 'var(--p-radius-md)',
                  background: `${e.color}15`,
                  color: e.color,
                  border: `1px solid ${e.color}30`,
                  fontSize: 'var(--p-text-sm)',
                }}>
                  {e.name}
                </span>
                {i < 4 && <span style={{ color: 'var(--p-text-dim)' }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 'var(--p-space-8)',
          padding: 'var(--p-space-8)',
          background: 'var(--p-bg-elevated)',
          borderRadius: 'var(--p-radius-xl)',
          border: '2px dashed var(--p-gray-1)',
        }}>
          <p style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontStyle: 'italic' }}>
            Les formulaires de saisie et la scénarisation seront implémentés en Session 2.<br />
            Les moteurs cerveau (VPS/TDE/PVE/EWE/TPE) sont déjà intégrés dans <code style={{ color: 'var(--p-tde)', fontFamily: 'var(--p-font-mono)' }}>src/lib/engines/</code>
          </p>
        </div>
      </main>
    </div>
  )
}
