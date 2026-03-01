'use client'
import type { SignalItem } from '@/lib/data/observatoryTypes'
import Picto from '@/components/Picto'

const statusColor: Record<string, string> = {
  active: 'var(--p-critical)',
  under_review: 'var(--p-warning)',
  validated: 'var(--p-success)',
  dismissed: 'var(--p-text-dim)',
}

const statusLabel: Record<string, string> = {
  active: 'ACTIF',
  under_review: 'EN REVUE',
  validated: 'VALIDÉ',
  dismissed: 'REJETÉ',
}

export default function SignalPanel({ signals }: { signals: SignalItem[] }) {
  return (
    <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--p-space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="eeg" size={22} glow glowColor="var(--p-critical)" />
          <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Signal Lab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-critical-bg)', border: '1px solid var(--p-critical)' }}>
          <div className="dot-alive" />
          <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-critical)' }}>LIVE</span>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-4)' }}>
        Signaux statistiques uniquement. Chacun nécessite validation clinique indépendante.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {signals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '12px' }}>
            Aucun signal actif dans la fenêtre courante.
          </div>
        ) : signals.map(s => {
          const sc = statusColor[s.status] || 'var(--p-text-dim)'
          return (
            <div key={s.id} style={{
              padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'var(--p-bg-elevated)', borderLeft: `3px solid ${sc}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--p-text)' }}>{s.title}</span>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: s.score >= 2 ? 'var(--p-critical)' : 'var(--p-warning)' }}>z {s.score.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {[s.region, s.family, String(s.year), statusLabel[s.status]].map((t, i) => (
                  <span key={i} style={{
                    padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                    background: i === 3 ? `${sc}20` : 'var(--p-dark-4)',
                    color: i === 3 ? sc : 'var(--p-text-dim)',
                    fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 600,
                  }}>{t}</span>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{s.rationale}</div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '6px', fontStyle: 'italic' }}>
                Gouvernance : interpréter cliniquement, valider indépendamment. Corrélation ≠ causalité.
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
