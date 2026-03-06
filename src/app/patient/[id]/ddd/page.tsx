'use client'
import Picto from '@/components/Picto'
import { useLang } from '@/contexts/LanguageContext'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'

const DDD_COLOR = '#DC2626'

export default function DDDPage() {
  const { t } = useLang()
  const params = useParams()
  const [ddd, setDdd] = useState<any>(null)
  const [vps, setVps] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(`pulsar-patient-${params.id}`)
    if (stored) {
      try {
        const ps = new PatientState(JSON.parse(stored))
        const result = runPipeline(ps)
        setDdd((result as any).dddResult)
        setVps(result.vpsResult?.synthesis?.score ?? 0)
      } catch { /* noop */ }
    }
  }, [params.id])

  if (!ddd) return (
    <div style={{ textAlign: 'center', padding: 'var(--p-space-10)', color: 'var(--p-text-dim)' }}>
      <Picto name="urgence-chrono" size={40} glow />
      <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700 }}>{t('Chargement DDD...', 'Loading DDD...')}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--p-space-6)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${DDD_COLOR}15`, border: `2px solid ${DDD_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Picto name="urgence-chrono" size={20} glow /></div>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Diagnostic Delay Detector</h1>
          <p style={{ fontSize: 'var(--p-text-sm)', color: DDD_COLOR, margin: 0, fontFamily: 'var(--p-font-mono)' }}>
            {t('Le garde-fou contre l\'inertie clinique', 'The safeguard against clinical inertia')}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--p-space-6)', flexWrap: 'wrap' }}>
        <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: ddd.delayDetected ? '#DC262612' : '#10B98112', border: `1px solid ${ddd.delayDetected ? '#DC262625' : '#10B98125'}` }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>{t('RETARD', 'DELAY')}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: ddd.delayDetected ? DDD_COLOR : '#10B981', fontFamily: 'var(--p-font-mono)' }}>
            {ddd.delayDetected ? t('DÉTECTÉ', 'DETECTED') : t('AUCUN', 'NONE')}
          </div>
        </div>
        <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-card)', border: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>{t('HEURES PERDUES', 'HOURS LOST')}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: DDD_COLOR, fontFamily: 'var(--p-font-mono)' }}>{ddd.estimatedHoursLost || 0}h</div>
        </div>
        <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-card)', border: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>VPS</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: vps >= 80 ? '#EF4444' : '#F59E0B', fontFamily: 'var(--p-font-mono)' }}>{vps}</div>
        </div>
      </div>

      {/* Message */}
      {ddd.message && (
        <div style={{ padding: '12px 16px', background: ddd.delayDetected ? '#DC262608' : '#10B98108', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${ddd.delayDetected ? '#DC262615' : '#10B98115'}`, marginBottom: 'var(--p-space-6)' }}>
          <div style={{ fontSize: 'var(--p-text-sm)', color: ddd.delayDetected ? DDD_COLOR : '#10B981', lineHeight: 1.5 }}>{ddd.message}</div>
        </div>
      )}

      {/* Patterns */}
      {ddd.patterns && ddd.patterns.length > 0 && (
        <div style={{ marginBottom: 'var(--p-space-6)' }}>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: DDD_COLOR, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: DDD_COLOR }} />
            {t('Retards détectés', 'Detected delays')} ({ddd.patterns.length})
          </h2>
          {ddd.patterns.map((p: any, i: number) => {
            const col = p.severity === 'critical' ? '#EF4444' : '#F59E0B'
            return (
              <div key={i} style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${col}15`, marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: col }}>{p.severity === 'critical' ? '!' : '!'} {p.name}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: col, background: `${col}10`, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{p.currentDelay}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>

                  {/* Timeline bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, position: 'relative', height: 20, background: 'var(--p-bg-surface)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: `${col}20`, borderRadius: 10 }} />
                      <div style={{ position: 'absolute', left: '40%', top: 0, height: '100%', width: '60%', background: `${col}08` }} />
                      <div style={{ position: 'absolute', left: '40%', top: 0, height: '100%', width: 2, background: col }} />
                      <span style={{ position: 'absolute', left: 8, top: 3, fontSize: 9, color: '#10B981', fontWeight: 700 }}>{t('Fenêtre optimale', 'Optimal window')}</span>
                      <span style={{ position: 'absolute', right: 8, top: 3, fontSize: 9, color: col, fontWeight: 700 }}>{t('Retard', 'Delay')}</span>
                    </div>
                  </div>

                  {/* References */}
                  {p.evidence && p.evidence.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--p-border)', paddingTop: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--p-text-dim)', marginBottom: 4 }}>{t('Références', 'References')}</div>
                      {p.evidence.map((e: string, j: number) => (
                        <div key={j} style={{ fontSize: 10, color: 'var(--p-text-muted)', paddingLeft: 8, borderLeft: `2px solid ${col}20`, marginBottom: 3 }}>{e}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alerts */}
      {ddd.alerts && ddd.alerts.length > 0 && (
        <div style={{ marginBottom: 'var(--p-space-6)' }}>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#EF4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#EF4444' }} />
            {t('Alertes DDD', 'DDD Alerts')}
          </h2>
          {ddd.alerts.map((a: any, i: number) => {
            const col = a.severity === 'critical' ? '#EF4444' : '#F59E0B'
            return (
              <div key={i} style={{ padding: '12px 16px', background: `${col}06`, borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${col}`, marginBottom: 6 }}>
                <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: col, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5, marginBottom: 6 }}>{a.message}</div>
                <div style={{ padding: '6px 10px', background: `${col}08`, borderRadius: 'var(--p-radius-md)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{t('Action requise', 'Action required')} : </span>
                  <span style={{ fontSize: 10, color: 'var(--p-text)' }}>{a.actionRequired}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No delay */}
      {!ddd.delayDetected && (
        <div style={{ textAlign: 'center', padding: 'var(--p-space-10)', color: '#10B981' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700 }}>{t('Aucun retard diagnostique détecté', 'No diagnostic delay detected')}</div>
          <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginTop: 6 }}>{t('Les fenêtres thérapeutiques sont respectées.', 'Therapeutic windows are respected.')}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${DDD_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: DDD_COLOR, fontWeight: 700 }}>DIAGNOSTIC DELAY DETECTOR v1.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t('442 lignes · 8 règles sourées · Gaspard 2015, Titulaer 2013, Dilena 2019, Kenney-Jung 2016', '442 lines · 8 sourced rules · Gaspard 2015, Titulaer 2013, Dilena 2019, Kenney-Jung 2016')}
        </div>
      </div>
    </div>
  )
}
