'use client'
import Picto from '@/components/Picto'
import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface DrugSafetyResult {
  drugName: string
  adverseEvents: { reaction: string; count: number; serious: boolean }[]
  cardiacRisks: string[]
  neuroRisks: string[]
  respiratoryRisks: string[]
  warnings: string[]
  source: string
}

export default function DrugSafetyChecker() {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<DrugSafetyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`/api/drugs?drug=${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data.drug)
      } else {
        const data = await res.json()
        setError(data.error || t('Aucun résultat', 'No results'))
      }
    } catch {
      setError(t('Erreur réseau', 'Network error'))
    }
    setLoading(false)
  }

  const serious = result?.adverseEvents?.filter(ae => ae.serious) || []
  const hasCardiac = (result?.cardiacRisks?.length || 0) > 0
  const hasNeuro = (result?.neuroRisks?.length || 0) > 0
  const hasResp = (result?.respiratoryRisks?.length || 0) > 0

  return (
    <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', padding: 16, border: '1px solid var(--p-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Picto name="pill" size={16} />
        <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>
          {t('Vérification médicament', 'Drug Safety Check')}
        </span>
        <span style={{ fontSize: 9, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>OpenFDA FAERS</span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={t('Ex: MEOPA, Dilantin, Keppra...', 'E.g. MEOPA, Dilantin, Keppra...')}
          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-surface)', border: '1px solid var(--p-border)', color: 'var(--p-text)', fontSize: 'var(--p-text-sm)' }} />
        <button onClick={search} disabled={loading}
          style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: '#8B5CF6', color: '#fff', border: 'none', fontSize: 'var(--p-text-sm)', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : t('Vérifier', 'Check')}
        </button>
      </div>

      {error && <div style={{ fontSize: 11, color: '#EF4444', padding: 6 }}>{error}</div>}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Risk badges */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {hasCardiac && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#EF444412', color: '#EF4444', fontWeight: 700 }}><Picto name="heart" size={10} /> Cardiotoxique</span>}
            {hasNeuro && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#F59E0B12', color: '#F59E0B', fontWeight: 700 }}><Picto name="brain" size={10} /> Neurotoxique</span>}
            {hasResp && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#8B5CF612', color: '#8B5CF6', fontWeight: 700 }}><Picto name="lungs" size={10} /> Resp. depression</span>}
            {!hasCardiac && !hasNeuro && !hasResp && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#10B98112', color: '#10B981', fontWeight: 700 }}>✓ Profil standard</span>}
          </div>

          {/* Top serious adverse events */}
          {serious.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 3 }}>
                {t('Effets indésirables graves (FAERS)', 'Serious adverse events (FAERS)')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {serious.slice(0, 8).map((ae, i) => (
                  <span key={i} style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: '#EF444408', color: '#EF4444' }}>
                    {ae.reaction} ({ae.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top all adverse events */}
          {result.adverseEvents && result.adverseEvents.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--p-text-dim)', marginBottom: 3 }}>
                {t('Effets les plus rapportés', 'Most reported effects')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {result.adverseEvents.slice(0, 10).map((ae, i) => (
                  <span key={i} style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: 'var(--p-bg-surface)', color: 'var(--p-text-muted)' }}>
                    {ae.reaction} ({ae.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 8, color: 'var(--p-text-dim)', marginTop: 2 }}>
            Source: {result.source} · {result.adverseEvents?.length || 0} EI · {new Date().toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}
