'use client'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import { feedbackLoop, PATIENT_ZERO, PATIENT_ZERO_LEARNINGS } from '@/lib/engines/FeedbackLoopEngine'

const FB_COLOR = '#10B981'

export default function FeedbackPage() {
  const { t } = useLang()
  const { ps, info } = usePatient()

  const vps = ps.vpsResult?.synthesis?.score ?? 0
  const snapshot = feedbackLoop.captureSnapshot(ps)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--p-space-6)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${FB_COLOR}15`, border: `2px solid ${FB_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Picto name="cycle" size={20} glow />
        </div>
        <div>
          <h1>FeedbackLoop</h1>
          <p style={{ fontSize: 'var(--p-text-sm)', color: FB_COLOR, margin: 0, fontFamily: 'var(--p-font-mono)' }}>
            {t('Chaque enfant rend le système plus intelligent pour le suivant', 'Every child makes the system smarter for the next one')}
          </p>
        </div>
      </div>

      {/* Current snapshot */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: FB_COLOR }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', margin: 0 }}>{t('Snapshot actuel', 'Current snapshot')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {[
            { l: 'ID anonyme', v: snapshot.anonId.substring(0, 12), c: FB_COLOR },
            { l: 'Syndrome', v: snapshot.syndrome, c: '#8B5CF6' },
            { l: 'VPS admission', v: vps, c: vps >= 80 ? '#EF4444' : '#F59E0B' },
            { l: 'Jour hospit.', v: `J${info.hospDay}`, c: '#6C7CFF' },
            { l: t('Prédictions', 'Predictions'), v: snapshot.predictions.length, c: '#2FD1C8' },
            { l: t('Hypothèses', 'Hypotheses'), v: snapshot.hypotheses.length, c: '#E879F9' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${item.c}20` }}>
              <div style={{ fontSize: 9, color: 'var(--p-text-dim)' }}>{item.l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: item.c, fontFamily: 'var(--p-font-mono)' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: '#F5A623' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', margin: 0 }}>{t('Checkpoints programmés', 'Scheduled checkpoints')}</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['J3', 'J7', 'J14', t('Sortie', 'Discharge'), 'M6', 'M12'].map((cp, i) => {
            const done = i === 0 && info.hospDay >= 3 || i === 1 && info.hospDay >= 7
            return (
              <div key={i} style={{ padding: '8px 16px', borderRadius: 'var(--p-radius-md)', background: done ? `${FB_COLOR}10` : 'var(--p-bg-card)', border: `1px solid ${done ? FB_COLOR + '25' : 'var(--p-border)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: done ? FB_COLOR : 'var(--p-text-muted)' }}>{cp}</div>
                <div style={{ fontSize: 9, color: done ? FB_COLOR : 'var(--p-text-dim)', marginTop: 2 }}>{done ? '✓' : t('À venir', 'Upcoming')}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Patient Zero — Alejandro */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: '#F5A623' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#F5A623', margin: 0 }}>Patient 0 — PULSAR-000</h2>
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: '1px solid #F5A62315' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>FIRES · 6 ans · IDF</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#EF4444', fontWeight: 700 }}>VPS 100 · J14 · {t('Décédé', 'Deceased')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 4, marginBottom: 10 }}>
            {[
              { l: 'Alertes', v: '14', c: '#EF4444' }, { l: 'Critiques', v: '3', c: '#EF4444' },
              { l: 'Retards DDD', v: '4', c: '#DC2626' }, { l: 'Cascades CAE', v: '2', c: '#FF6B35' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '4px', background: `${s.c}06`, borderRadius: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: s.c, fontFamily: 'var(--p-font-mono)' }}>{s.v}</div>
                <div style={{ fontSize: 8, color: 'var(--p-text-dim)' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#F5A623', marginBottom: 6 }}>{t('Learnings extraits', 'Extracted learnings')}</div>
          {PATIENT_ZERO_LEARNINGS.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 4, height: 4, borderRadius: 2, background: FB_COLOR, marginTop: 5 }} />
              <span style={{ fontSize: 10, color: 'var(--p-text-muted)', lineHeight: 1.4 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort stats */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: '#6C7CFF' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', margin: 0 }}>{t('Cohorte PULSAR', 'PULSAR Cohort')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {[
            { l: t('Patients', 'Patients'), v: '1', c: '#6C7CFF' },
            { l: 'FIRES', v: '1', c: '#EF4444' },
            { l: t('Learnings', 'Learnings'), v: '8', c: FB_COLOR },
            { l: t('Prédictions', 'Predictions'), v: '4', c: '#2FD1C8' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', border: `1px solid ${s.c}12` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: 'var(--p-font-mono)' }}>{s.v}</div>
              <div style={{ fontSize: 9, color: 'var(--p-text-dim)' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 8, fontStyle: 'italic' }}>
          {t('La cohorte grandit avec chaque patient. Chaque cas enrichit les moteurs pour les suivants.', 'The cohort grows with each patient. Every case enriches the engines for the next ones.')}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${FB_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: FB_COLOR, fontWeight: 700 }}>FEEDBACKLOOP ENGINE v1.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t('618 lignes · Snapshots anonymisés · Checkpoints J3/J7/J14/Sortie/M6/M12 · Patient 0 : Alejandro', '618 lines · Anonymized snapshots · Checkpoints J3/J7/J14/Discharge/M6/M12 · Patient 0: Alejandro')}
        </div>
      </div>
    </div>
  )
}
