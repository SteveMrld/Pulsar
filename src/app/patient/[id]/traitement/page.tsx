'use client'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

/* ══════════════════════════════════════════════════════════════
   TRAITEMENT — TDE + PVE results
   Médicaments actifs · Historique · Recommandations · Interactions
   ══════════════════════════════════════════════════════════════ */

function SectionTitle({ title, color, icon }: { title: string; color: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '24px' }}>
      <Picto name={icon} size={16} glow glowColor={`${color}50`} />
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.5px' }}>{title}</span>
    </div>
  )
}

export default function TraitementPage() {
  const { ps, info } = usePatient()
  const tde = ps.tdeResult
  const pve = ps.pveResult

  const responseColor = (r: string) => {
    switch (r) {
      case 'complete': return '#2ED573'
      case 'good': return '#2FD1C8'
      case 'partial': return '#FFB347'
      case 'none': return '#FF4757'
      default: return 'var(--p-text-dim)'
    }
  }
  const responseLabel = (r: string) => {
    switch (r) {
      case 'complete': return 'Complète'
      case 'good': return 'Bonne'
      case 'partial': return 'Partielle'
      case 'none': return 'Aucune'
      default: return r
    }
  }

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="pill" size={28} glow glowColor="rgba(47,209,200,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Traitement</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            TDE + PVE · {info.displayName} · J+{info.hospDay}
          </span>
        </div>
      </div>

      {/* ── MÉDICAMENTS ACTIFS ── */}
      <SectionTitle title="MÉDICAMENTS EN COURS" color="#2FD1C8" icon="pill" />
      {ps.drugs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {ps.drugs.map((drug, i) => (
            <div key={i} className="glass-card" style={{
              padding: '14px', borderRadius: 'var(--p-radius-lg)',
              borderLeft: '3px solid #2FD1C8',
            }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--p-text)' }}>{drug.name}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '4px' }}>
                {drug.dose && <span>{drug.dose}</span>}
                {drug.route && <span> · {drug.route}</span>}
                {drug.startDay !== undefined && <span> · Depuis J+{drug.startDay}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-lg)' }}>
          <span style={{ fontSize: '12px', color: 'var(--p-text-dim)' }}>Aucun médicament renseigné</span>
        </div>
      )}

      {/* ── HISTORIQUE THÉRAPEUTIQUE ── */}
      {ps.treatmentHistory.length > 0 && (
        <>
          <SectionTitle title="HISTORIQUE THÉRAPEUTIQUE" color="#6C7CFF" icon="chart" />
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-font-mono)', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--p-border)' }}>
                  {['Ligne', 'Traitement', 'Période', 'Réponse'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--p-text-dim)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ps.treatmentHistory.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--p-border)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--p-text-dim)' }}>{t.line ? `L${t.line}` : '—'}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--p-text)', fontWeight: 600 }}>{t.treatment}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--p-text-muted)' }}>{t.period}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                        background: `${responseColor(t.response)}15`,
                        color: responseColor(t.response),
                        fontWeight: 700, fontSize: '9px',
                      }}>{responseLabel(t.response)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── RECOMMANDATIONS TDE ── */}
      {tde && (
        <>
          <SectionTitle title="RECOMMANDATIONS THÉRAPEUTIQUES" color="#2FD1C8" icon="shield" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tde.synthesis.recommendations.map((r, i) => {
              const prioColor = r.priority === 'urgent' ? '#FF4757' : r.priority === 'high' ? '#FFB347' : r.priority === 'medium' ? '#6C7CFF' : '#2ED573'
              return (
                <div key={i} className="glass-card" style={{
                  padding: '14px 16px', borderRadius: 'var(--p-radius-lg)',
                  borderLeft: `3px solid ${prioColor}`,
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
                    padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                    background: `${prioColor}15`, color: prioColor,
                    flexShrink: 0, marginTop: '2px',
                  }}>{r.priority.toUpperCase()}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{r.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '3px', lineHeight: 1.5 }}>{r.body}</div>
                    {r.reference && <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '4px' }}>Réf: {r.reference}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── PHARMACOVIGILANCE PVE ── */}
      {pve && pve.synthesis.alerts.length > 0 && (
        <>
          <SectionTitle title="PHARMACOVIGILANCE" color="#FF6B8A" icon="alert" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pve.synthesis.alerts.map((a, i) => (
              <div key={i} className="glass-card" style={{
                padding: '14px 16px', borderRadius: 'var(--p-radius-lg)',
                borderLeft: `3px solid ${a.severity === 'critical' ? '#FF4757' : '#FFB347'}`,
                background: a.severity === 'critical' ? 'rgba(255,71,87,0.03)' : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: a.severity === 'critical' ? '#FF4757' : '#FFB347' }}>{a.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{a.title}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>{a.body}</div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '4px' }}>Source: {a.source}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── TPE HYPOTHÈSES ── */}
      {ps.tpeResult?.synthesis.hypotheses && ps.tpeResult.synthesis.hypotheses.length > 0 && (
        <>
          <SectionTitle title="PROSPECTION THÉRAPEUTIQUE (J+7/J+14)" color="#FFB347" icon="brain" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ps.tpeResult.synthesis.hypotheses.map((h, i) => {
              const confColor = h.confidenceLevel === 'supported' ? '#2ED573' : h.confidenceLevel === 'emerging' ? '#FFB347' : '#6C7CFF'
              return (
                <div key={i} className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-lg)', borderLeft: `3px solid ${confColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--p-text)' }}>{h.title}</span>
                    <span style={{
                      fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                      background: `${confColor}15`, color: confColor,
                    }}>{h.confidenceLevel}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.5, marginBottom: '6px' }}>{h.rationale}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
                    Cible: {h.targetPathway} · Pathologies: {h.applicablePathologies.join(', ')}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
