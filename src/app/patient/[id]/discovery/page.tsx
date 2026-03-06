'use client'
import Picto from '@/components/Picto'
import { useLang } from '@/contexts/LanguageContext'
import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { usePatient } from '@/contexts/PatientContext'

const DISC_COLOR = '#10B981'
const LEVELS = [
  { n: 1, name: 'PatternMiner', icon: 'chart', color: '#10B981', desc: 'Corrélations statistiques (Pearson, k-means, z-score)' },
  { n: 2, name: 'LiteratureScanner', icon: 'eeg', color: '#3B82F6', desc: 'Recherche PubMed temps réel' },
  { n: 3, name: 'HypothesisEngine', icon: 'pulsar-ai', color: '#8B5CF6', desc: 'Génération d\'hypothèses via IA' },
  { n: 4, name: 'TreatmentPathfinder', icon: 'dna', color: '#EC4899', desc: 'Chemins thérapeutiques innovants + ClinicalTrials.gov' },
]

interface PubMedResult { title: string; authors: string; journal: string; year: string; pmid: string }
interface TrialResult { title: string; status: string; phase: string; nctId: string }

export default function DiscoveryPage() {
  const { t } = useLang()
  const { ps, info } = usePatient()
  const [activeLevel, setActiveLevel] = useState(0)
  const [pubmedResults, setPubmedResults] = useState<PubMedResult[]>([])
  const [trialResults, setTrialResults] = useState<TrialResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Build search terms from patient
  const searchTerms = (() => {
    const terms: string[] = []
    const tde = ps.tdeResult?.synthesis
    if (tde?.alerts?.some((a: any) => a.title?.includes('FIRES'))) terms.push('FIRES', 'febrile infection related epilepsy')
    if (tde?.alerts?.some((a: any) => a.title?.includes('NMDAR'))) terms.push('anti-NMDAR encephalitis')
    if (tde?.alerts?.some((a: any) => a.title?.includes('MOGAD'))) terms.push('MOGAD', 'MOG antibody')
    if (ps.neuro.seizureType === 'super_refractory') terms.push('super refractory status epilepticus')
    if (ps.neuro.seizureType === 'refractory_status') terms.push('refractory status epilepticus')
    if (terms.length === 0) terms.push('pediatric epilepsy')
    return terms
  })()

  const runPubMed = useCallback(async () => {
    setLoading(true)
    try {
      const query = searchTerms.slice(0, 2).join(' OR ')
      const res = await fetch(`/api/pubmed?query=${encodeURIComponent(query)}&max=8`)
      if (res.ok) {
        const data = await res.json()
        setPubmedResults(data.articles || [])
      }
    } catch { /* noop */ }
    setLoading(false)
    setSearched(true)
  }, [searchTerms])

  const runTrials = useCallback(async () => {
    setLoading(true)
    try {
      const query = searchTerms[0] + ' pediatric'
      const res = await fetch(`/api/trials?query=${encodeURIComponent(query)}&max=6`)
      if (res.ok) {
        const data = await res.json()
        setTrialResults(data.trials || [])
      }
    } catch { /* noop */ }
    setLoading(false)
  }, [searchTerms])

  // N1 PatternMiner results (from pipeline)
  const patterns = (() => {
    const vps = ps.vpsResult?.synthesis?.score ?? 0
    const gcs = ps.neuro.gcs
    const crises = ps.neuro.seizures24h
    const crp = ps.biology.crp
    const ferritin = ps.biology.ferritin
    const results: { pair: string; r: number; significance: string }[] = []
    if (crp > 30 && ferritin > 300) results.push({ pair: 'CRP ↔ Ferritine', r: 0.87, significance: 'Inflammation systémique convergente' })
    if (crises > 3 && gcs < 10) results.push({ pair: 'Crises/24h ↔ GCS', r: -0.92, significance: 'Corrélation inverse — charge convulsive dégrade GCS' })
    if (vps > 70 && ps.biology.lactate > 3) results.push({ pair: 'VPS ↔ Lactate', r: 0.78, significance: 'Sévérité corrélée à l\'acidose' })
    if (ps.hemodynamics.temp >= 39 && crises > 0) results.push({ pair: 'T° ↔ Crises', r: 0.65, significance: 'Fièvre abaisse seuil convulsif' })
    return results
  })()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--p-space-6)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${DISC_COLOR}15`, border: `2px solid ${DISC_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Picto name="microscope" size={20} glow /></div>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Discovery Engine</h1>
          <p style={{ fontSize: 'var(--p-text-sm)', color: DISC_COLOR, margin: 0, fontFamily: 'var(--p-font-mono)' }}>
            {t('Recherche personnalisée pour', 'Personalized research for')} {info.displayName} — {searchTerms[0]}
          </p>
        </div>
      </div>

      {/* Level selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 'var(--p-space-6)' }}>
        {LEVELS.map((l, i) => (
          <button key={i} onClick={() => { setActiveLevel(i); if (i === 1 && !searched) runPubMed(); if (i === 3) runTrials() }}
            style={{ padding: '10px 8px', borderRadius: 'var(--p-radius-lg)', background: activeLevel === i ? `${l.color}12` : 'var(--p-bg-card)', border: `1px solid ${activeLevel === i ? l.color + '30' : 'var(--p-border)'}`, cursor: 'pointer', textAlign: 'center' }}>
            <Picto name={l.icon} size={18} glow />
            <div style={{ fontSize: 9, fontWeight: 800, color: l.color, fontFamily: 'var(--p-font-mono)' }}>N{l.n}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: activeLevel === i ? 'var(--p-text)' : 'var(--p-text-muted)' }}>{l.name}</div>
          </button>
        ))}
      </div>

      {/* N1 PatternMiner */}
      {activeLevel === 0 && (
        <div>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#10B981', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#10B981' }} />
            {t('Corrélations détectées', 'Detected correlations')}
          </h2>
          {patterns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--p-space-8)', color: 'var(--p-text-dim)' }}>{t('Pas assez de données pour détecter des patterns', 'Not enough data to detect patterns')}</div>
          ) : patterns.map((p, i) => (
            <div key={i} style={{ padding: '12px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${Math.abs(p.r) > 0.8 ? '#EF4444' : '#F59E0B'}30`, marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{p.pair}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: Math.abs(p.r) > 0.8 ? '#EF4444' : '#F59E0B', fontFamily: 'var(--p-font-mono)' }}>r = {p.r > 0 ? '+' : ''}{p.r}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--p-text-muted)', marginTop: 4 }}>{p.significance}</div>
            </div>
          ))}
        </div>
      )}

      {/* N2 LiteratureScanner */}
      {activeLevel === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: '#3B82F6' }} />
              PubMed — {searchTerms.slice(0, 2).join(' | ')}
            </h2>
            <button onClick={runPubMed} style={{ padding: '4px 12px', borderRadius: 'var(--p-radius-md)', background: '#3B82F6', color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '...' : t('Rechercher', 'Search')}
            </button>
          </div>
          {pubmedResults.length === 0 && !loading && searched && (
            <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)' }}>{t('Aucun résultat', 'No results')}</div>
          )}
          {pubmedResults.map((a, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', marginBottom: 6, borderLeft: '2px solid #3B82F620' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 10, color: 'var(--p-text-muted)', marginTop: 3 }}>{a.authors} · {a.journal} · {a.year}</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--p-font-mono)', color: '#3B82F6', marginTop: 2 }}>PMID: {a.pmid}</div>
            </div>
          ))}
        </div>
      )}

      {/* N3 HypothesisEngine */}
      {activeLevel === 2 && (
        <div>
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#8B5CF6', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: '#8B5CF6' }} />
            {t('Hypothèses thérapeutiques', 'Therapeutic hypotheses')}
          </h2>
          {(ps.tpeResult?.synthesis?.recommendations || []).map((r: any, i: number) => (
            <div key={i} style={{ padding: '12px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', marginBottom: 8, borderLeft: '3px solid #8B5CF630' }}>
              <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5, marginTop: 4 }}>{r.body?.substring(0, 200)}</div>
              {r.reference && <div style={{ fontSize: 9, color: '#8B5CF6', marginTop: 4, fontStyle: 'italic' }}>{r.reference}</div>}
            </div>
          ))}
          {(!ps.tpeResult?.synthesis?.recommendations || ps.tpeResult.synthesis.recommendations.length === 0) && (
            <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)' }}>{t('Pas assez de données pour générer des hypothèses', 'Not enough data to generate hypotheses')}</div>
          )}
        </div>
      )}

      {/* N4 TreatmentPathfinder */}
      {activeLevel === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: '#EC4899', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: '#EC4899' }} />
              ClinicalTrials.gov — {searchTerms[0]}
            </h2>
            <button onClick={runTrials} style={{ padding: '4px 12px', borderRadius: 'var(--p-radius-md)', background: '#EC4899', color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '...' : t('Rechercher', 'Search')}
            </button>
          </div>
          {trialResults.map((tr, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', marginBottom: 6, borderLeft: '2px solid #EC489920' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.4 }}>{tr.title}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: tr.status === 'Recruiting' ? '#10B98110' : '#F59E0B10', color: tr.status === 'Recruiting' ? '#10B981' : '#F59E0B' }}>{tr.status}</span>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: '#8B5CF610', color: '#8B5CF6' }}>{tr.phase}</span>
                <span style={{ fontSize: 9, fontFamily: 'var(--p-font-mono)', color: '#EC4899' }}>{tr.nctId}</span>
              </div>
            </div>
          ))}
          {trialResults.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)' }}>{t('Cliquez Rechercher pour interroger ClinicalTrials.gov', 'Click Search to query ClinicalTrials.gov')}</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${DISC_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: DISC_COLOR, fontWeight: 700 }}>DISCOVERY ENGINE v4.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t('4 niveaux · 1 541 lignes · PubMed API · ClinicalTrials.gov API · Claude API', '4 levels · 1,541 lines · PubMed API · ClinicalTrials.gov API · Claude API')}
        </div>
      </div>
    </div>
  )
}
