'use client'
import Picto from '@/components/Picto'
import { useLang } from '@/contexts/LanguageContext'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { runCAE, type CAEResult } from '@/lib/engines/CascadeAlertEngine'

type PipelineResult = ReturnType<typeof runPipeline>

function Badge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 16px', background: `${color}08`, borderRadius: 'var(--p-radius-lg)', border: `1px solid ${color}12`, minWidth: 80 }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'var(--p-font-mono)' }}>{value}</div>
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'var(--p-bg-surface)', borderRadius: 3 }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--p-space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
        <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function AlertRow({ severity, title, body, source }: { severity: string; title: string; body: string; source: string }) {
  const col = severity === 'critical' ? '#EF4444' : severity === 'warning' ? '#F59E0B' : '#6C7CFF'
  const iconName = severity === 'critical' ? 'warning' : severity === 'warning' ? 'alert' : 'shield'
  return (
    <div style={{ padding: '10px 14px', background: `${col}06`, borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${col}`, marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: col }}><Picto name={iconName} size={12} /> {title}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', background: 'var(--p-bg-surface)', padding: '1px 6px', borderRadius: 4 }}>{source}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{body}</div>
    </div>
  )
}

function RecoRow({ priority, title, body, reference }: { priority: string; title: string; body: string; reference?: string }) {
  const col = priority === 'urgent' ? '#EF4444' : priority === 'high' ? '#F59E0B' : priority === 'medium' ? '#6C7CFF' : '#10B981'
  return (
    <div style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${col}`, marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{title}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: col, fontFamily: 'var(--p-font-mono)', background: `${col}10`, padding: '1px 6px', borderRadius: 4 }}>{priority.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{body.substring(0, 300)}{body.length > 300 ? '...' : ''}</div>
      {reference && <div style={{ fontSize: 9, color: col, marginTop: 3, fontStyle: 'italic' }}>{reference}</div>}
    </div>
  )
}

export default function RapportPage() {
  const { t } = useLang()
  const params = useParams()
  const [ps, setPs] = useState<PatientState | null>(null)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [caeResult, setCaeResult] = useState<CAEResult | null>(null)
  const [generated, setGenerated] = useState(false)

  const exportPDF = () => {
    window.print()
  }
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(`pulsar-patient-${params.id}`)
    if (stored) {
      try {
        const patient = new PatientState(JSON.parse(stored))
        setPs(patient)
        const pipelineResult = runPipeline(patient)
        setResult(pipelineResult)
        setCaeResult(runCAE(patient))
        setGenerated(true)
      } catch { /* noop */ }
    }
  }, [params.id])

  if (!generated || !result || !ps) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--p-space-10)' }}>
        <Picto name="chart" size={40} glow />
        <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)' }}>
          {t('Génération du rapport PULSAR...', 'Generating PULSAR report...')}
        </div>
      </div>
    )
  }

  const vps = result.vpsResult?.synthesis || { score: 0, level: 'unknown', alerts: [], recommendations: [] }
  const vpsCol = vps.score >= 80 ? '#EF4444' : vps.score >= 60 ? '#F59E0B' : vps.score >= 40 ? '#F5A623' : '#10B981'
  const totalAlerts = result.alerts?.length || 0
  const criticals = result.alerts?.filter(a => a.severity === 'critical') || []
  const warnings = result.alerts?.filter(a => a.severity === 'warning') || []
  const recos = result.recommendations || []
  const ddd = (result as any).dddResult
  const cascades = caeResult?.alerts || []

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; color: #1E293B !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, .demo-close, button, [class*="AppShell"] > nav { display: none !important; }
          .no-print { display: none !important; }
          * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
        }
      `}</style>
    <div ref={reportRef} style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#6C7CFF', fontWeight: 700, letterSpacing: 1.5 }}>PULSAR RAPPORT</div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: '4px 0' }}>
            {t('Rapport complet', 'Complete Report')}
          </h1>
          <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)' }}>
            {t('Généré automatiquement par les 11 moteurs PULSAR', 'Auto-generated by PULSAR\'s 11 engines')} · J{ps.hospDay}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Badge label="VPS" value={vps.score} color={vpsCol} />
          <Badge label="ALERTES" value={totalAlerts} color="#EF4444" />
          <Badge label="CASCADES" value={cascades.length} color="#FF6B35" />
          <button className="no-print" onClick={exportPDF} style={{ padding: '10px 16px', borderRadius: 'var(--p-radius-lg)', background: '#6C7CFF', color: '#fff', border: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Picto name="export" size={14} /> {t('Exporter PDF', 'Export PDF')}
          </button>
        </div>
      </div>

      {/* Patient summary */}
      <Section title={t('Résumé patient', 'Patient Summary')} color="#6C7CFF">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {[
            { l: 'GCS', v: `${ps.neuro.gcs}/15`, c: ps.neuro.gcs <= 8 ? '#EF4444' : '#F59E0B', max: 15, val: ps.neuro.gcs },
            { l: t('Crises/24h', 'Seizures/24h'), v: ps.neuro.seizures24h, c: ps.neuro.seizures24h > 5 ? '#EF4444' : '#F59E0B', max: 20, val: ps.neuro.seizures24h },
            { l: 'CRP', v: ps.biology.crp, c: ps.biology.crp > 50 ? '#EF4444' : '#F59E0B', max: 200, val: ps.biology.crp },
            { l: t('Ferritine', 'Ferritin'), v: ps.biology.ferritin, c: ps.biology.ferritin > 500 ? '#EF4444' : '#F59E0B', max: 2000, val: ps.biology.ferritin },
            { l: 'SpO2', v: `${ps.hemodynamics.spo2}%`, c: ps.hemodynamics.spo2 < 95 ? '#EF4444' : '#10B981', max: 100, val: ps.hemodynamics.spo2 },
            { l: 'T°', v: `${ps.hemodynamics.temp}°`, c: ps.hemodynamics.temp >= 38.5 ? '#EF4444' : '#10B981', max: 42, val: ps.hemodynamics.temp },
            { l: 'FC', v: ps.hemodynamics.heartRate, c: ps.hemodynamics.heartRate > 150 ? '#EF4444' : '#F59E0B', max: 200, val: ps.hemodynamics.heartRate },
            { l: t('Lactate', 'Lactate'), v: ps.biology.lactate, c: ps.biology.lactate > 4 ? '#EF4444' : '#F59E0B', max: 10, val: ps.biology.lactate },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${item.c}20` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--p-text-dim)' }}>{item.l}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: item.c, fontFamily: 'var(--p-font-mono)' }}>{item.v}</span>
              </div>
              <MiniBar value={typeof item.val === 'number' ? item.val : 0} max={item.max} color={item.c} />
            </div>
          ))}
        </div>
      </Section>

      {/* Cascade alerts */}
      {cascades.length > 0 && (
        <Section title={t('Alertes cascade (CAE)', 'Cascade Alerts (CAE)')} color="#FF6B35">
          {cascades.map((a, i) => (
            <AlertRow key={i} severity={a.severity} title={a.title} body={a.message} source="CAE" />
          ))}
        </Section>
      )}

      {/* DDD */}
      {ddd?.delayDetected && (
        <Section title={t('Retards diagnostiques (DDD)', 'Diagnostic Delays (DDD)')} color="#DC2626">
          <div style={{ padding: '10px 14px', background: '#DC262608', borderRadius: 'var(--p-radius-md)', border: '1px solid #DC262615', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: '#DC2626' }}>
              {ddd.patterns?.length || 0} {t('retard(s) détecté(s)', 'delay(s) detected')} · {ddd.estimatedHoursLost}h {t('perdues', 'lost')}
            </span>
          </div>
          {(ddd.alerts || []).map((a: any, i: number) => (
            <AlertRow key={i} severity={a.severity} title={a.title} body={a.message} source="DDD" />
          ))}
        </Section>
      )}

      {/* All alerts */}
      <Section title={t(`Alertes complètes (${totalAlerts})`, `All alerts (${totalAlerts})`)} color="#EF4444">
        {criticals.map((a, i) => (
          <AlertRow key={`c-${i}`} severity="critical" title={a.title} body={a.body} source={a.source} />
        ))}
        {warnings.slice(0, 8).map((a, i) => (
          <AlertRow key={`w-${i}`} severity="warning" title={a.title} body={a.body} source={a.source} />
        ))}
        {warnings.length > 8 && (
          <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', textAlign: 'center', padding: 8 }}>
            +{warnings.length - 8} {t('autres warnings', 'more warnings')}
          </div>
        )}
      </Section>

      {/* Recommendations */}
      <Section title={t(`Recommandations (${recos.length})`, `Recommendations (${recos.length})`)} color="#2FD1C8">
        {recos.slice(0, 10).map((r, i) => (
          <RecoRow key={i} priority={r.priority} title={r.title} body={r.body} reference={r.reference} />
        ))}
      </Section>

      {/* Medications */}
      {ps.drugs && ps.drugs.length > 0 && (
        <Section title={t('Médicaments en cours', 'Current medications')} color="#8B5CF6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
            {ps.drugs.map((d, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: '3px solid #8B5CF620' }}>
                <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{d.name}</div>
                {d.dose && <div style={{ fontSize: 10, color: 'var(--p-text-muted)' }}>{d.dose}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Vulnerabilities */}
      {caeResult && caeResult.vulnerabilities.length > 0 && (
        <Section title={t('Vulnérabilités détectées (CAE)', 'Detected Vulnerabilities (CAE)')} color="#FF6B35">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
            {caeResult.vulnerabilities.map((v, i) => {
              const confCol = v.confidence >= 80 ? '#EF4444' : v.confidence >= 50 ? '#F59E0B' : '#6C7CFF'
              return (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${confCol}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{v.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: confCol, fontFamily: 'var(--p-font-mono)' }}>{v.confidence}%</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {v.signals.map((s, j) => (
                      <span key={j} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${confCol}08`, color: confCol }}>{s}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Engine footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: '14px 16px', background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-lg)', borderTop: '2px solid #6C7CFF20' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#6C7CFF', fontWeight: 700 }}>PULSAR RAPPORT — {t('Généré automatiquement', 'Auto-generated')}</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 4 }}>
          {t(
            '11 moteurs · VPS · TDE · PVE · EWE · TPE · NeuroCore · Discovery · FeedbackLoop · Oracle · DDD · CAE · 8 854 lignes de logique clinique · OpenFDA + BDPM connectés',
            '11 engines · VPS · TDE · PVE · EWE · TPE · NeuroCore · Discovery · FeedbackLoop · Oracle · DDD · CAE · 8,854 lines of clinical logic · OpenFDA + BDPM connected'
          )}
        </div>
      </div>
    </div>
    </>
  )
}
