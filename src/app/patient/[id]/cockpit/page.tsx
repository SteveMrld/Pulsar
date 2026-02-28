'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { usePatient } from '@/contexts/PatientContext'
import { computeDiagnosticContext } from '@/lib/data/epidemioContext'
import Picto from '@/components/Picto'
import SilhouetteNeon from '@/components/SilhouetteNeon'
import BrainMonitor from '@/components/BrainMonitor'
import BrainHeatmap from '@/components/BrainHeatmap'

/* ══════════════════════════════════════════════════════════════
   COCKPIT — Patient-centric
   Landing page patient · Vision temps réel · Que faire ?
   ══════════════════════════════════════════════════════════════ */

function MiniGauge({ score, color, size = 48 }: { score: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c - (score / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--p-dark-4)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s var(--p-ease)' }} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fill={color}
        fontSize="13" fontWeight="800" fontFamily="var(--p-font-mono)">{score}</text>
    </svg>
  )
}

export default function PatientCockpit() {
  const { ps, info, scenarioKey } = usePatient()
  const base = `/patient/${info.id}`

  const enginesDef = [
    { name: 'VPS', full: 'Vital Prognosis', color: '#6C7CFF', href: `${base}/suivi` },
    { name: 'TDE', full: 'Therapeutic Decision', color: '#2FD1C8', href: `${base}/traitement` },
    { name: 'PVE', full: 'Paraclinical', color: '#B96BFF', href: `${base}/examens` },
    { name: 'EWE', full: 'Early Warning', color: '#FF6B8A', href: `${base}/suivi` },
    { name: 'TPE', full: 'Therapeutic Prospection', color: '#FFB347', href: `${base}/traitement` },
    { name: 'NCE', full: 'NeuroCore', color: '#2ED573', href: `${base}/examens` },
  ]

  const engines = enginesDef.map((e, i) => {
    const results = [ps.vpsResult, ps.tdeResult, ps.pveResult, ps.eweResult, ps.tpeResult]
    if (i < 5) return { ...e, score: results[i]?.synthesis.score ?? 0, level: results[i]?.synthesis.level ?? '—' }
    const nce = ps.neuroCoreResult
    const s = nce?.score ?? 0
    return { ...e, score: s, level: s > 70 ? 'Critique' : s > 40 ? 'Élevé' : s > 20 ? 'Modéré' : 'Faible' }
  })

  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')
  const warnAlerts = ps.alerts.filter(a => a.severity === 'warning')
  const allAlerts = [...critAlerts, ...warnAlerts]

  const epiContext = useMemo(() => {
    const f = scenarioKey === 'FIRES' ? 'FIRES' : scenarioKey === 'PIMS' ? 'PIMS' : 'FIRES'
    return computeDiagnosticContext(f as any, 'Île-de-France')
  }, [scenarioKey])

  const actions = useMemo(() => {
    const a: { label: string; desc: string; href: string; color: string; icon: string; p: number }[] = []
    if (critAlerts.length > 0) a.push({ label: 'Alertes critiques', desc: `${critAlerts.length} alerte${critAlerts.length > 1 ? 's' : ''}`, href: `${base}/urgence`, color: '#FF4757', icon: 'alert', p: 0 })
    const top = engines.reduce((m, e) => e.score > m.score ? e : m, engines[0])
    if (top.score >= 60) a.push({ label: 'Recommandations', desc: `Score ${top.name} élevé (${top.score})`, href: `${base}/traitement`, color: '#2ED573', icon: 'pill', p: 1 })
    a.push({ label: 'Diagnostic IA', desc: 'Scoring multi-pathologique', href: `${base}/diagnostic`, color: '#6C7CFF', icon: 'dna', p: 2 })
    a.push({ label: 'Monitoring', desc: '5 paramètres vitaux', href: `${base}/suivi`, color: '#2FD1C8', icon: 'eeg', p: 3 })
    return a.sort((x, y) => x.p - y.p).slice(0, 4)
  }, [critAlerts, engines, base])

  const eegStatus = ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory' ? 'seizure' as const
    : ps.neuro.seizureType === 'status' ? 'seizure' as const
    : ps.neuro.gcs <= 6 ? 'burst_suppression' as const
    : ps.neuro.gcs <= 10 ? 'slowing' as const : 'normal' as const

  return (
    <div className="page-enter-stagger">
      {/* ═══ BrainMonitor ICU ═══ */}
      <div style={{ marginBottom: 'var(--p-space-4)' }}>
        <BrainMonitor
          patientName={info.displayName} age={info.age}
          syndrome={info.syndrome} hospDay={info.hospDay}
          gcs={ps.neuro.gcs}
          seizuresPerHour={ps.neuro.seizures24h > 0 ? Math.round(ps.neuro.seizures24h / 24 * 10) / 10 : 0}
          vpsScore={ps.vpsResult?.synthesis.score ?? 0}
          eegStatus={eegStatus}
          eegBackground={ps.neuro.gcs <= 6 ? 'Fond sévèrement ralenti' : ps.neuro.gcs <= 10 ? 'Fond modérément ralenti' : 'Fond normal'}
          ncsePossible={ps.neuro.seizures24h > 8 || ps.neuro.seizureType === 'refractory_status'}
          vitals={[
            { label: 'FC', value: `${ps.hemodynamics.heartRate}`, unit: 'bpm', color: '#FF6B8A', icon: 'heart',
              severity: ps.hemodynamics.heartRate > 160 ? 2 : ps.hemodynamics.heartRate > 140 ? 1 : 0,
              waveform: 'ecg', numericValue: ps.hemodynamics.heartRate, range: [60, 180] },
            { label: 'SpO₂', value: `${ps.hemodynamics.spo2}`, unit: '%', color: '#2FD1C8', icon: 'lungs',
              severity: ps.hemodynamics.spo2 < 90 ? 2 : ps.hemodynamics.spo2 < 95 ? 1 : 0,
              waveform: 'spo2', numericValue: ps.hemodynamics.spo2, range: [85, 100] },
            { label: 'TEMP', value: `${ps.hemodynamics.temp}`, unit: '°C', color: '#B96BFF', icon: 'thermo',
              severity: ps.hemodynamics.temp >= 39 ? 2 : ps.hemodynamics.temp >= 38 ? 1 : 0,
              waveform: 'flat', numericValue: ps.hemodynamics.temp, range: [36, 40] },
            { label: 'PA', value: `${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp}`, unit: 'mmHg', color: '#FFB347', icon: 'blood',
              severity: ps.hemodynamics.map < 60 ? 2 : 0,
              waveform: 'resp', numericValue: ps.hemodynamics.respRate, range: [10, 40] },
          ]}
        />
      </div>

      {/* ═══ Actions + Silhouette ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-4)' }} className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Picto name="brain" size={28} glow glowColor="rgba(108,124,255,0.5)" />
            <div>
              <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0, lineHeight: 1.2 }}>Cockpit Patient</h1>
              <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Que faire maintenant ?</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-3)' }}>
            {actions.map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
                <div className="glass-card card-interactive" style={{
                  padding: 'var(--p-space-3) var(--p-space-4)', borderRadius: 'var(--p-radius-lg)',
                  borderLeft: `3px solid ${a.color}`, display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px',
                }}>
                  <Picto name={a.icon} size={24} glow glowColor={`${a.color}60`} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{a.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {allAlerts.length > 0 && (
            <div className="glass-card" style={{
              padding: 'var(--p-space-3) var(--p-space-4)', borderRadius: 'var(--p-radius-lg)',
              borderLeft: '3px solid var(--p-critical)', background: 'var(--p-critical-bg)',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-critical)', marginBottom: '8px', letterSpacing: '0.5px' }}>ALERTES ACTIVES</div>
              {allAlerts.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', marginTop: '2px' }}>{a.severity === 'critical' ? '🔴' : '🟡'}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{a.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.body}</div>
                  </div>
                </div>
              ))}
              <Link href={`${base}/urgence`} style={{ fontSize: '10px', color: 'var(--p-critical)', fontWeight: 600 }}>Mode Urgence →</Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
          <SilhouetteNeon
            sex={info.sex === 'female' ? 'F' : 'M'}
            vpsScore={ps.vpsResult?.synthesis.score ?? 0} compact
            vitals={[
              { label: 'NEURO', icon: '🧠', value: `GCS: ${ps.neuro.gcs}/15`, color: '#6C7CFF', severity: ps.neuro.gcs <= 8 ? 2 : ps.neuro.gcs <= 12 ? 1 : 0 },
              { label: 'CARDIO', icon: '❤️', value: `FC: ${ps.hemodynamics.heartRate} bpm`, color: '#FF6B8A', severity: ps.hemodynamics.heartRate > 140 ? 2 : 0 },
              { label: 'RESP', icon: '🫁', value: `SpO₂: ${ps.hemodynamics.spo2}%`, color: '#2FD1C8', severity: ps.hemodynamics.spo2 < 95 ? 1 : 0 },
              { label: 'INFLAM', icon: '🔥', value: `CRP: ${ps.biology.crp} mg/L`, color: '#FFB347', severity: ps.biology.crp > 100 ? 2 : ps.biology.crp > 20 ? 1 : 0 },
              { label: 'TEMP', icon: '🌡️', value: `${ps.hemodynamics.temp}°C`, color: '#B96BFF', severity: ps.hemodynamics.temp >= 38 ? 1 : 0 },
            ]}
          />
          <div className="glass-card" style={{ padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <Picto name="brain" size={14} glow glowColor="rgba(108,124,255,0.3)" />
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1.5px' }}>CARTOGRAPHIE CÉRÉBRALE</span>
            </div>
            <BrainHeatmap eegStatus={eegStatus}
              channelIntensity={[
                ps.neuro.seizureType.includes('refractory') ? 0.95 : ps.neuro.seizures24h > 5 ? 0.7 : 0.3,
                ps.neuro.seizureType.includes('refractory') ? 0.9 : 0.4,
                ps.neuro.gcs <= 8 ? 0.6 : 0.25, ps.neuro.gcs <= 8 ? 0.5 : 0.2,
                ps.neuro.seizureType.includes('refractory') ? 0.85 : 0.35,
                ps.neuro.seizures24h > 8 ? 0.8 : 0.3,
              ]}
              vpsScore={ps.vpsResult?.synthesis.score ?? 0} size={160}
            />
          </div>
        </div>
      </div>

      {/* ═══ Engine Pipeline ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-5)' }} className="grid-6">
        {engines.map((e) => (
          <Link key={e.name} href={e.href} style={{ textDecoration: 'none' }}>
            <div className="card-interactive glass-card" style={{
              padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-xl)',
              borderTop: `3px solid ${e.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: e.color, fontSize: '10px', letterSpacing: '1px' }}>{e.name}</span>
                <div className="dot-alive" />
              </div>
              <MiniGauge score={e.score} color={e.color} />
              <div style={{
                padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                background: `${e.color}15`, fontSize: '8px', fontFamily: 'var(--p-font-mono)',
                fontWeight: 700, color: e.color, maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{e.level}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══ Quick Access ═══ */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: 'var(--p-space-3)' }}>ACCÈS RAPIDES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--p-space-3)' }}>
        {[
          { href: `${base}/examens`, icon: 'microscope', label: 'Examens', color: '#FF4757' },
          { href: `${base}/examens`, icon: 'brain', label: 'NeuroCore', color: '#B96BFF' },
          { href: `${base}/diagnostic`, icon: 'cycle', label: 'Cross-Pathologie', color: '#6C7CFF' },
          { href: `${base}/suivi`, icon: 'chart', label: 'Timeline', color: '#2FD1C8' },
          { href: `${base}/synthese`, icon: 'clipboard', label: 'Synthèse', color: '#B96BFF' },
          { href: `${base}/synthese`, icon: 'export', label: 'Export PDF', color: '#2ED573' },
        ].map((q, i) => (
          <Link key={i} href={q.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card card-interactive" style={{
              padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-lg)',
              borderTop: `2px solid ${q.color}`, display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Picto name={q.icon} size={20} glow glowColor={`${q.color}50`} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{q.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-5) 0 var(--p-space-3)', color: 'var(--p-text-dim)', fontSize: '9px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
