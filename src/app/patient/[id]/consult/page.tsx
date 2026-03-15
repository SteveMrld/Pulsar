'use client'
import Picto from '@/components/Picto'
import { useLang } from '@/contexts/LanguageContext'
import { useState } from 'react'
import { generateConsultBrief, type ConsultBrief } from '@/lib/engines/ConsultEngine'
import { runPipeline } from '@/lib/engines/pipeline'
import { usePatient } from '@/contexts/PatientContext'

const CONSULT_COLOR = '#3B82F6'

export default function ConsultPage() {
  const { t } = useLang()
  const { ps } = usePatient()
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [copied, setCopied] = useState(false)

  const brief: ConsultBrief | null = ps ? generateConsultBrief(runPipeline(ps), lang) : null

  const copyBrief = () => {
    if (!brief) return
    const text = lang === 'fr' ? brief.plainText : brief.plainTextEn
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  if (!brief) return (
    <div style={{ textAlign: 'center', padding: 'var(--p-space-10)', color: 'var(--p-text-dim)' }}>
      <Picto name="clipboard" size={40} glow />
      <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700 }}>{t('Génération du brief...', 'Generating brief...')}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${CONSULT_COLOR}15`, border: `2px solid ${CONSULT_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Picto name="clipboard" size={20} glow /></div>
          <div>
            <h1>PULSAR Consult</h1>
            <p style={{ fontSize: 'var(--p-text-sm)', color: CONSULT_COLOR, margin: 0, fontFamily: 'var(--p-font-mono)' }}>
              {t('Brief expert en 10 secondes', 'Expert brief in 10 seconds')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setLang('fr')} style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: lang === 'fr' ? CONSULT_COLOR : 'var(--p-bg-surface)', color: lang === 'fr' ? '#fff' : 'var(--p-text-muted)', border: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>FR</button>
          <button onClick={() => setLang('en')} style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: lang === 'en' ? CONSULT_COLOR : 'var(--p-bg-surface)', color: lang === 'en' ? '#fff' : 'var(--p-text-muted)', border: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>EN</button>
          <button onClick={copyBrief} style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: copied ? '#10B981' : 'var(--p-bg-card)', color: copied ? '#fff' : 'var(--p-text)', border: '1px solid var(--p-border)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            {copied ? '✓ Copié' : t('Copier le brief', 'Copy brief')}
          </button>
        </div>
      </div>

      {/* Sections */}
      {[brief.clinicalSummary, brief.timeline, brief.neurological, brief.biomarkers, brief.treatments, brief.pulsarAnalysis, brief.delayAlerts, brief.oracleSummary].filter(Boolean).map((section: any, i: number) => (
        <div key={i} style={{ marginBottom: 'var(--p-space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 4, height: 16, borderRadius: 2, background: CONSULT_COLOR }} />
            <h2 style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: 'var(--p-text)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{lang === 'fr' ? section.title : (section.titleEn || section.title)}</h2>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `2px solid ${CONSULT_COLOR}15` }}>
            <pre style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--p-font-mono)' }}>{section.content.join('\n')}</pre>
          </div>
        </div>
      ))}

      {/* Questions auto-générées */}
      {brief.questions && brief.questions.length > 0 && (
        <div style={{ marginTop: 'var(--p-space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#F59E0B' }} />
            <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: '#F59E0B', margin: 0 }}>
              {t('Questions pour l\'expert', 'Questions for the expert')}
            </h2>
          </div>
          {brief.questions.map((q, i) => {
            const urgCol = q.urgency === 'immediate' ? '#EF4444' : q.urgency === 'within24h' ? '#F59E0B' : '#6C7CFF'
            return (
              <div key={i} style={{ padding: '12px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${urgCol}`, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{i + 1}. {lang === 'fr' ? q.question : (q.questionEn || q.question)}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: urgCol, fontFamily: 'var(--p-font-mono)', background: `${urgCol}10`, padding: '2px 8px', borderRadius: 99 }}>
                    {q.urgency === 'immediate' ? t('URGENT', 'URGENT') : q.urgency === 'within24h' ? t('24H', '24H') : 'ÉLECTIF'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5, marginBottom: 4 }}>{q.context}</div>
                <div style={{ fontSize: 9, color: 'var(--p-text-dim)', fontStyle: 'italic' }}>Source : {q.source}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${CONSULT_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: CONSULT_COLOR, fontWeight: 700 }}>PULSAR CONSULT v1.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t('434 lignes · Agrège 11 moteurs · Brief FR/EN · Questions auto-générées avec urgence', '434 lines · Aggregates 11 engines · Brief FR/EN · Auto-generated questions with urgency')}
        </div>
      </div>
    </div>
  )
}
