'use client'
import Picto from '@/components/Picto'
import { useLang } from '@/contexts/LanguageContext'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { runCAE, type CAEResult, type CascadeAlert, type VulnerabilityProfile } from '@/lib/engines/CascadeAlertEngine'
import { PatientState } from '@/lib/engines/PatientState'

const CAE_COLOR = '#FF6B35'

function VulnCard({ v }: { v: VulnerabilityProfile }) {
  const confCol = v.confidence >= 80 ? '#EF4444' : v.confidence >= 50 ? '#F59E0B' : '#6C7CFF'
  return (
    <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${confCol}15`, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{v.name}</span>
        <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, color: confCol, fontFamily: 'var(--p-font-mono)', background: `${confCol}12`, padding: '2px 8px', borderRadius: 99 }}>{v.confidence}%</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {v.signals.map((s, i) => (
          <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${confCol}08`, color: confCol, border: `1px solid ${confCol}15` }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function CascadeCard({ a, t }: { a: CascadeAlert; t: (fr: string, en: string) => string }) {
  const [open, setOpen] = useState(false)
  const col = a.severity === 'critical' ? '#EF4444' : a.severity === 'warning' ? '#F59E0B' : '#6C7CFF'
  return (
    <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${col}20`, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: col, marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{a.message.substring(0, 200)}{a.message.length > 200 ? '...' : ''}</div>
        </div>
        <span style={{ color: 'var(--p-text-dim)', fontSize: 16, flexShrink: 0 }}>{open ? '▼' : '▶'}</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${col}10` }}>
          {/* Cascade chain */}
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: CAE_COLOR, fontFamily: 'var(--p-font-mono)', letterSpacing: 1, marginBottom: 6 }}>
              {t('CHAÎNE DE CASCADE', 'CASCADE CHAIN')}
            </div>
            {a.cascadeChain.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: `${col}15`, border: `1px solid ${col}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: col, fontFamily: 'var(--p-font-mono)', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 11, color: 'var(--p-text)', lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
          {/* References */}
          {a.references.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--p-text-dim)', marginBottom: 4 }}>
                {t('Références', 'References')}
              </div>
              {a.references.map((ref, i) => (
                <div key={i} style={{ fontSize: 10, color: 'var(--p-text-muted)', paddingLeft: 8, borderLeft: '2px solid var(--p-border)', marginBottom: 3 }}>{ref}</div>
              ))}
            </div>
          )}
          {/* Alternative */}
          <div style={{ padding: '8px 10px', background: `${CAE_COLOR}08`, borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${CAE_COLOR}40` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: CAE_COLOR, marginBottom: 2 }}>
              {t('Alternative recommandée', 'Recommended alternative')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--p-text)', lineHeight: 1.4 }}>{a.alternativeSuggestion}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CascadePage() {
  const { t } = useLang()
  const params = useParams()
  const [result, setResult] = useState<CAEResult | null>(null)
  const [intervention, setIntervention] = useState('')

  useEffect(() => {
    // Load patient from localStorage
    const stored = localStorage.getItem(`pulsar-patient-${params.id}`)
    if (stored) {
      try {
        const ps = new PatientState(JSON.parse(stored))
        setResult(runCAE(ps))
      } catch { /* noop */ }
    }
  }, [params.id])

  const runWithIntervention = () => {
    const stored = localStorage.getItem(`pulsar-patient-${params.id}`)
    if (!stored || !intervention.trim()) return
    const ps = new PatientState(JSON.parse(stored))
    setResult(runCAE(ps, intervention.trim()))
  }

  const criticals = result?.alerts.filter(a => a.severity === 'critical') || []
  const warnings = result?.alerts.filter(a => a.severity === 'warning') || []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--p-space-6)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${CAE_COLOR}15`, border: `2px solid ${CAE_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Picto name="alert" size={20} glow /></div>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Cascade Alert Engine</h1>
          <p style={{ fontSize: 'var(--p-text-sm)', color: CAE_COLOR, margin: 0, fontFamily: 'var(--p-font-mono)' }}>
            {t('Détection des effets en chaîne — Intervention × Vulnérabilité × Littérature', 'Cascade effect detection — Intervention × Vulnerability × Literature')}
          </p>
        </div>
      </div>

      {/* Planned intervention input */}
      <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', padding: 16, marginBottom: 'var(--p-space-6)', border: `1px solid ${CAE_COLOR}15` }}>
        <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 8 }}>
          {t('Tester une intervention planifiée', 'Test a planned intervention')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={intervention}
            onChange={e => setIntervention(e.target.value)}
            placeholder={t('Ex: MEOPA, Phénytoïne, Midazolam...', 'E.g. MEOPA, Phenytoin, Midazolam...')}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-surface)', border: '1px solid var(--p-border)', color: 'var(--p-text)', fontSize: 'var(--p-text-sm)' }}
          />
          <button onClick={runWithIntervention} style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-md)', background: CAE_COLOR, color: '#fff', border: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', cursor: 'pointer' }}>
            {t('Analyser', 'Analyze')}
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 6 }}>
          {t('PULSAR vérifie si cette intervention risque de déclencher un effet en chaîne sur ce patient.', 'PULSAR checks if this intervention may trigger a cascade effect on this patient.')}
        </div>
      </div>

      {/* Risk level badge */}
      {result && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--p-space-6)', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: result.highestRisk === 'critical' ? '#EF444412' : result.highestRisk === 'high' ? '#F59E0B12' : '#10B98112', border: `1px solid ${result.highestRisk === 'critical' ? '#EF444425' : result.highestRisk === 'high' ? '#F59E0B25' : '#10B98125'}` }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>RISQUE CASCADE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: result.highestRisk === 'critical' ? '#EF4444' : result.highestRisk === 'high' ? '#F59E0B' : '#10B981', fontFamily: 'var(--p-font-mono)' }}>
              {result.highestRisk === 'none' ? '—' : result.highestRisk.toUpperCase()}
            </div>
          </div>
          <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-card)', border: '1px solid var(--p-border)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>{t('VULNÉRABILITÉS', 'VULNERABILITIES')}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: CAE_COLOR, fontFamily: 'var(--p-font-mono)' }}>{result.vulnerabilities.length}</div>
          </div>
          <div style={{ padding: '10px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-card)', border: '1px solid var(--p-border)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700 }}>ALERTES</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#EF4444', fontFamily: 'var(--p-font-mono)' }}>{result.alerts.length}</div>
          </div>
        </div>
      )}

      {/* Vulnerabilities */}
      {result && result.vulnerabilities.length > 0 && (
        <div style={{ marginBottom: 'var(--p-space-6)' }}>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: CAE_COLOR, marginBottom: 10 }}>
            {t('Profils de vulnérabilité détectés', 'Detected vulnerability profiles')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {result.vulnerabilities.map((v, i) => <VulnCard key={i} v={v} />)}
          </div>
        </div>
      )}

      {/* Critical cascades */}
      {criticals.length > 0 && (
        <div style={{ marginBottom: 'var(--p-space-6)' }}>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#EF4444', marginBottom: 10 }}>
            {t('Cascades critiques', 'Critical cascades')} ({criticals.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {criticals.map((a, i) => <CascadeCard key={i} a={a} t={t} />)}
          </div>
        </div>
      )}

      {/* Warning cascades */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: 'var(--p-space-6)' }}>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#F59E0B', marginBottom: 10 }}>
            {t('Cascades à surveiller', 'Cascades to monitor')} ({warnings.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {warnings.map((a, i) => <CascadeCard key={i} a={a} t={t} />)}
          </div>
        </div>
      )}

      {/* No risk */}
      {result && result.alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--p-space-10)', color: '#10B981' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700 }}>{t('Aucun risque de cascade détecté', 'No cascade risk detected')}</div>
          <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginTop: 6 }}>{t('Les interventions en cours sont compatibles avec le profil du patient.', 'Current interventions are compatible with the patient profile.')}</div>
        </div>
      )}

      {/* Engine info */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${CAE_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: CAE_COLOR, fontWeight: 700 }}>CASCADE ALERT ENGINE v1.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t(
            '415 lignes · 6 profils de vulnérabilité · Règles sourées (Zier 2010, Gaspard 2015, ANSM 2016) · Connecté OpenFDA + BDPM',
            '415 lines · 6 vulnerability profiles · Sourced rules (Zier 2010, Gaspard 2015, ANSM 2016) · Connected OpenFDA + BDPM'
          )}
        </div>
      </div>
    </div>
  )
}
