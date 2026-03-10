'use client'
import { useState, useMemo, useEffect} from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { useTrackAction } from '@/hooks/useTrackAction'

/* ── FIRES Criteria ── */
const FIRES_CRITERIA = [
  { label: 'Âge 2-12 ans', pts: 1, test: (ps: PatientState) => ps.ageMonths >= 24 && ps.ageMonths <= 144 },
  { label: 'Épisode fébrile ≥38°C', pts: 1, test: (ps: PatientState) => ps.hemodynamics.temp >= 38 },
  { label: 'Status réfractaire', pts: 2, test: (ps: PatientState) => ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory' },
  { label: 'Status ≥30 min', pts: 1, test: (ps: PatientState) => ps.neuro.seizureDuration >= 30 || ps.neuro.seizureType === 'status' },
  { label: 'GCS < 12', pts: 1, test: (ps: PatientState) => ps.neuro.gcs < 12 },
  { label: 'Pléiocytose LCR (>5)', pts: 1, test: (ps: PatientState) => ps.csf.cells > 5 },
  { label: 'Anticorps négatifs/pending', pts: 1, test: (ps: PatientState) => ps.csf.antibodies === 'negative' || ps.csf.antibodies === 'pending' },
  { label: 'CRP > 20 mg/L', pts: 1, test: (ps: PatientState) => ps.biology.crp > 20 },
  { label: 'Crises ≥5/24h', pts: 1, test: (ps: PatientState) => ps.neuro.seizures24h >= 5 },
  { label: 'Échec antiépileptique', pts: 1, test: (ps: PatientState) => ps.treatmentHistory.some(t => t.response === 'none') },
  { label: 'Protéinorachie élevée', pts: 1, test: (ps: PatientState) => ps.csf.protein > 0.45 },
]

function Gauge({ value, max, label, color, size = 100 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const pct = Math.min(1, value / max)
  const r = (size - 12) / 2, circ = 2 * Math.PI * r, off = circ * (1 - pct)
  const lc = pct >= 0.7 ? '#8B5CF6' : pct >= 0.5 ? '#FFA502' : pct >= 0.25 ? color : '#2ED573'
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={lc} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="var(--p-text)" fontSize="18" fontWeight="800" fontFamily="var(--p-font-mono)">{value}</text>
        <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill="var(--p-text-dim)" fontSize="9" fontFamily="var(--p-font-mono)">/ {max}</text>
      </svg>
      <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

export default function DiagnosticPage() {
  const { t } = useLang()
  const { ps, info, scenarioKey } = usePatient()

  const { track } = useTrackAction()

  useEffect(() => {
    track('view_diagnostic', 'diagnostic', info?.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [expandedSection, setExpandedSection] = useState<string>('hypothesis')

  const fc = useMemo(() => FIRES_CRITERIA.map(c => ({ ...c, met: c.test(ps) })), [ps])
  const firesScore = fc.filter(c => c.met).reduce((s, c) => s + c.pts, 0)
  const vps = ps.vpsResult?.synthesis.score ?? 0
  const tdePatterns = ps.tdeResult?.intention.patterns || []
  const topPattern = tdePatterns[0]

  /* Red flags from NeuroCore */
  const redFlags = ps.neuroCoreResult?.redFlags || []
  const traps = ps.neuroCoreResult?.traps || []

  /* Missing data for diagnosis */
  const missing: string[] = []
  if (!ps.eeg) missing.push('EEG continu')
  if (!ps.mri || !ps.mri.performed) missing.push('IRM cérébrale')
  if (!ps.neuroBiomarkers) missing.push('Biomarqueurs neuronaux (NfL, NSE)')
  if (ps.csf.antibodies === 'pending') missing.push('Résultats anticorps en attente')

  return (
    <div className="page-enter-stagger">
      <div className="page-header">
        <Picto name="brain" size={28} glow glowColor="rgba(108,124,255,0.5)" />
        <div className="page-header-text">
          <h1>Diagnostic</h1>
          <span className="page-subtitle">
            Raisonnement clinique · {info.displayName}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

        {/* LEFT: Main diagnostic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Hypothesis principale */}
          {topPattern && (
            <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #6C7CFF' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#6C7CFF', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>HYPOTHÈSE PRINCIPALE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>{topPattern.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>{topPattern.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', fontWeight: 700 }}>
                  Confiance: {Math.round(topPattern.confidence * 100)}%
                </div>
                <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
                  <div style={{ width: `${topPattern.confidence * 100}%`, height: '100%', borderRadius: '2px', background: '#6C7CFF', transition: 'width 0.6s' }} />
                </div>
              </div>
              {topPattern.implications && (
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '8px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(108,124,255,0.04)' }}>
                  💡 {topPattern.implications}
                </div>
              )}
            </div>
          )}

          {/* Scoring FIRES */}
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderTop: '3px solid #8B5CF6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '1px' }}>CRITÈRES FIRES</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: firesScore >= 8 ? '#8B5CF6' : firesScore >= 5 ? '#FFA502' : '#6C7CFF' }}>
                {firesScore}/13
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {fc.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px', borderRadius: '6px',
                  background: c.met ? 'rgba(139,92,246,0.06)' : 'transparent',
                  opacity: c.met ? 1 : 0.4,
                }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: c.met ? '#8B5CF6' : 'var(--p-dark-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', color: 'white', fontWeight: 800,
                  }}>{c.met ? '✓' : ''}</div>
                  <span style={{ flex: 1, fontSize: '10px', color: 'var(--p-text-muted)' }}>{c.label}</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: c.met ? '#8B5CF6' : 'var(--p-text-dim)' }}>+{c.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags & Pièges */}
          {(redFlags.length > 0 || traps.length > 0) && (
            <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
              {redFlags.length > 0 && (
                <div style={{ marginBottom: traps.length > 0 ? '12px' : 0 }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#8B5CF6', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>⚠ RED FLAGS</div>
                  {redFlags.map((rf, i) => (
                    <div key={i} style={{ padding: '5px 8px', fontSize: '10px', color: '#8B5CF6', background: 'rgba(139,92,246,0.05)', borderRadius: '4px', marginBottom: '3px' }}>
                      {rf}
                    </div>
                  ))}
                </div>
              )}
              {traps.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#FFA502', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>🪤 PIÈGES DIAGNOSTIQUES</div>
                  {traps.map((t, i) => (
                    <div key={i} style={{ padding: '5px 8px', fontSize: '10px', color: '#FFA502', background: 'rgba(255,165,2,0.05)', borderRadius: '4px', marginBottom: '3px' }}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Gauges + Missing data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <Gauge value={firesScore} max={13} label="FIRES" color="#8B5CF6" />
            <Gauge value={vps} max={100} label="VPS" color="#6C7CFF" />
          </div>

          {/* Données manquantes */}
          {missing.length > 0 && (
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #FFA502' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#FFA502', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>DONNÉES MANQUANTES</div>
              {missing.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
                  <span style={{ fontSize: '10px' }}>❓</span>
                  <span style={{ fontSize: '10px', color: 'var(--p-text-muted)' }}>{m}</span>
                </div>
              ))}
            </div>
          )}

          {/* Other hypotheses */}
          {tdePatterns.length > 1 && (
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>AUTRES HYPOTHÈSES</div>
              {tdePatterns.slice(1, 4).map((p, i) => (
                <div key={i} style={{ padding: '6px 8px', marginBottom: '4px', borderRadius: '6px', background: 'var(--p-bg-elevated)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p-text-muted)' }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>{Math.round(p.confidence * 100)}% confiance</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ILLUSTRATIONS CLINIQUES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="pulsar-illus-wrap" style={{ border: "rgba(108,124,255,0.2)" }}>
            <img src="/assets/illustrations/PULSAR_BRAIN_NORMAL_VS_FIRES.png" alt="Cerveau normal vs FIRES" />
          </div>
          <div style={{ padding: '8px 12px', fontFamily: 'var(--p-font-mono)', fontSize: 9, color: 'rgba(139,92,246,0.7)', borderTop: '1px solid rgba(139,92,246,0.1)' }}>Cerveau normal vs FIRES · NeuroCore</div>
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="pulsar-illus-wrap" style={{ border: "rgba(239,68,68,0.2)" }}>
            <img src="/assets/illustrations/PULSAR_FIRES_TIMELINE.png" alt="Timeline FIRES" />
          </div>
          <div style={{ padding: '8px 12px', fontFamily: 'var(--p-font-mono)', fontSize: 9, color: 'rgba(239,68,68,0.7)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>Chronologie FIRES · Délais DDD identifiés</div>
        </div>
      </div>
    </div>
  )
}
