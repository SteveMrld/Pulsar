'use client'
import AnakinraAnimation from '@/components/AnakinraAnimation'
import { useMemo, useState, useEffect} from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import DrugSafetyChecker from '@/components/DrugSafetyChecker'
import Link from 'next/link'
import { discoveryEngine } from '@/lib/engines/DiscoveryEngine'
import { DEMO_PATIENTS } from '@/lib/data/discoveryData'
import { SEED_ARTICLES } from '@/lib/data/literatureData'
import { PATIENT_PROFILES } from '@/lib/data/patientProfiles'
import { generateTDEEnrichments, ENRICHMENT_COLORS, RECOMMENDATION_LABELS } from '@/lib/engines/TDEEnrichment'
import type { TDEEnrichment } from '@/lib/engines/TDEEnrichment'
import { useTrackAction } from '@/hooks/useTrackAction'

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
  const { t, lang } = useLang()
  const { ps, info } = usePatient()

  const { track } = useTrackAction()

  useEffect(() => {
    track('view_traitement', 'traitement', info?.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const tde = ps.tdeResult
  const pve = ps.pveResult

  const responseColor = (r: string) => {
    switch (r) {
      case 'complete': return '#2ED573'
      case 'good': return '#2FD1C8'
      case 'partial': return '#FFB347'
      case 'none': return '#8B5CF6'
      default: return 'var(--p-text-dim)'
    }
  }
  const responseLabel = (r: string) => {
    switch (r) {
      case 'complete': return t('Complète', 'Complete')
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
          <h1>Traitement</h1>
          <span className="page-subtitle">
            TDE + PVE · {info.displayName} · J+{info.hospDay}
          </span>
        </div>
      </div>

      {/* ── MÉDICAMENTS ACTIFS ── */}
      <SectionTitle title={t('MÉDICAMENTS EN COURS', 'CURRENT MEDICATIONS')} color="#2FD1C8" icon="pill" />
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
          <SectionTitle title={t('HISTORIQUE THÉRAPEUTIQUE', 'TREATMENT HISTORY')} color="#6C7CFF" icon="chart" />
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-font-mono)', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--p-border)' }}>
                  {[t('Ligne', 'Line'), t('Traitement', 'Treatment'), t('Période', 'Period'), t('Réponse', 'Response')].map(h => (
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
          <SectionTitle title={t('RECOMMANDATIONS THÉRAPEUTIQUES', 'THERAPEUTIC RECOMMENDATIONS')} color="#2FD1C8" icon="shield" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tde.synthesis.recommendations.map((r, i) => {
              const prioColor = r.priority === 'urgent' ? '#8B5CF6' : r.priority === 'high' ? '#FFB347' : r.priority === 'medium' ? '#6C7CFF' : '#2ED573'
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
          <SectionTitle title="PHARMACOVIGILANCE" color="#A78BFA" icon="alert" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pve.synthesis.alerts.map((a, i) => (
              <div key={i} className="glass-card" style={{
                padding: '14px 16px', borderRadius: 'var(--p-radius-lg)',
                borderLeft: `3px solid ${a.severity === 'critical' ? '#8B5CF6' : '#FFB347'}`,
                background: a.severity === 'critical' ? 'rgba(139,92,246,0.03)' : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: a.severity === 'critical' ? '#8B5CF6' : '#FFB347' }}>{a.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION'}</span>
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

      {/* ═══ Discovery Engine → TDE Enrichments ═══ */}
      <DiscoveryEnrichmentPanel syndrome={info.syndrome} />
    </div>
  )
}

// ── Discovery Enrichment Panel ──

const DISC = '#10B981'

function DiscoveryEnrichmentPanel({ syndrome }: { syndrome: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const enrichments = useMemo(() => {
    const result = discoveryEngine.run(DEMO_PATIENTS, SEED_ARTICLES, PATIENT_PROFILES)
    return generateTDEEnrichments(
      result.signals,
      result.hypotheses,
      result.pathfinder.pathways,
      syndrome,
    )
  }, [syndrome])

  if (enrichments.length === 0) return null

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', background: DISC,
          boxShadow: `0 0 8px ${DISC}80`,
        }} />
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: DISC, letterSpacing: '0.5px' }}>
          DISCOVERY ENGINE → TDE
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
          background: `${DISC}12`, fontSize: '9px', fontFamily: 'var(--p-font-mono)',
          fontWeight: 700, color: DISC,
        }}>
          {enrichments.length} enrichissements
        </span>
        <Link href="/research" style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
          background: `${DISC}10`, border: `1px solid ${DISC}25`,
          fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
          color: DISC, textDecoration: 'none',
        }}>EXPLORE →</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {enrichments.map(enr => {
          const color = ENRICHMENT_COLORS[enr.severity]
          const rec = RECOMMENDATION_LABELS[enr.recommendation]
          const isOpen = expanded === enr.id

          return (
            <div key={enr.id}
              onClick={() => setExpanded(isOpen ? null : enr.id)}
              style={{
                background: 'var(--p-bg-card)',
                border: `1px solid ${isOpen ? color + '40' : 'var(--p-border)'}`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 'var(--p-radius-lg)',
                padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                  background: `${rec.color}15`, fontFamily: 'var(--p-font-mono)',
                  fontSize: '8px', fontWeight: 800, color: rec.color,
                }}>{rec.icon} {rec.label}</span>
                {enr.affectedLine && enr.affectedLine !== 'general' && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                    background: '#FFB34715', fontFamily: 'var(--p-font-mono)',
                    fontSize: '8px', fontWeight: 700, color: '#FFB347',
                  }}>TDE {enr.affectedLine}</span>
                )}
                <span style={{
                  padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                  background: `${DISC}10`, fontFamily: 'var(--p-font-mono)',
                  fontSize: '8px', fontWeight: 700, color: DISC,
                }}>{Math.round(enr.confidence * 100)}% confiance</span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{enr.title}</div>

              {isOpen && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--p-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>{enr.description}</div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
                    background: `${DISC}06`, border: `1px solid ${DISC}12`,
                    marginBottom: '6px',
                  }}>
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: DISC }}>ACTION : </span>
                    <span style={{ fontSize: '11px', color: 'var(--p-text)' }}>{enr.action}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: '#FFA502' }}>⚠ {enr.disclaimer}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Drug Safety Checker — OpenFDA */}
      <div style={{ marginTop: 'var(--p-space-6)' }}>
        <DrugSafetyChecker />
      </div>

      {/* ── ILLUSTRATION ANAKINRA ── */}
      <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="pulsar-illus-wrap" style={{ border: "rgba(16,185,129,0.2)" }}>
          <AnakinraAnimation />
        </div>
        <div style={{ padding: '8px 14px', fontFamily: 'var(--p-font-mono)', fontSize: 9, color: 'rgba(16,185,129,0.7)', borderTop: '1px solid rgba(16,185,129,0.1)' }}>Mécanisme d'action Anakinra · Inhibition IL-1β · TPE Engine</div>
      </div>
    </div>
  )
}
