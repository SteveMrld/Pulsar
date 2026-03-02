// ============================================================
// PULSAR V19 — Live Scanner
// Appelle les API routes /api/pubmed et /api/trials
// Convertit les résultats en LiteratureArticle pour le Discovery Engine
// ============================================================

import type { LiteratureArticle } from '@/lib/engines/LiteratureScanner'
import { PUBMED_QUERIES } from '@/lib/engines/LiteratureScanner'

// ── PubMed Live Search ──

export interface PubMedSearchResult {
  articles: LiteratureArticle[]
  totalFound: number
  query: string
}

export async function searchPubMed(query: string, max: number = 10): Promise<PubMedSearchResult> {
  try {
    const res = await fetch(`/api/pubmed?query=${encodeURIComponent(query)}&max=${max}`)
    if (!res.ok) throw new Error(`PubMed API error: ${res.status}`)
    const data = await res.json()

    const articles: LiteratureArticle[] = (data.articles || []).map((a: any, idx: number) => ({
      id: `pubmed-live-${a.pmid}`,
      pmid: a.pmid,
      doi: a.doi || null,
      title: a.title,
      authors: a.authors,
      journal: a.journal,
      year: a.year,
      abstract: a.abstract || '',
      relevance: 'medium' as const, // Will be rescored by LiteratureScanner
      relevanceScore: 0.5,
      matchedKeywords: [],
      matchedSignalIds: [],
      action: 'neutral' as const,
      isClinicalTrial: false,
      trialId: null,
      trialPhase: null,
      source: 'pubmed' as const,
      fetchedAt: new Date().toISOString(),
    }))

    return { articles, totalFound: data.count || 0, query }
  } catch (err) {
    console.error('[LiveScanner] PubMed search failed:', err)
    return { articles: [], totalFound: 0, query }
  }
}

// ── ClinicalTrials.gov Live Search ──

export interface TrialSearchResult {
  trials: LiteratureArticle[]
  totalFound: number
  query: string
}

export async function searchTrials(query: string, max: number = 10): Promise<TrialSearchResult> {
  try {
    const res = await fetch(`/api/trials?query=${encodeURIComponent(query)}&max=${max}`)
    if (!res.ok) throw new Error(`ClinicalTrials API error: ${res.status}`)
    const data = await res.json()

    const trials: LiteratureArticle[] = (data.trials || []).map((t: any) => ({
      id: `ct-live-${t.nctId}`,
      pmid: null,
      doi: null,
      title: t.title || t.briefTitle,
      authors: t.locations?.map((l: any) => l.facility).join(', ') || 'Multicenter',
      journal: `ClinicalTrials.gov · ${t.phase}`,
      year: t.startDate ? parseInt(t.startDate.substring(0, 4)) : new Date().getFullYear(),
      abstract: t.briefSummary || '',
      relevance: 'high' as const,
      relevanceScore: 0.8,
      matchedKeywords: t.conditions || [],
      matchedSignalIds: [],
      action: 'extends' as const,
      isClinicalTrial: true,
      trialId: t.nctId,
      trialPhase: t.phase,
      source: 'clinicaltrials' as const,
      fetchedAt: new Date().toISOString(),
    }))

    return { trials, totalFound: data.totalCount || 0, query }
  } catch (err) {
    console.error('[LiveScanner] ClinicalTrials search failed:', err)
    return { trials: [], totalFound: 0, query }
  }
}

// ── Fetch single trial by NCT ID ──

export async function fetchTrial(nctId: string): Promise<LiteratureArticle | null> {
  try {
    const res = await fetch(`/api/trials?nct=${encodeURIComponent(nctId)}`)
    if (!res.ok) return null
    const data = await res.json()
    const t = data.trial
    if (!t) return null

    return {
      id: `ct-live-${t.nctId}`,
      pmid: null,
      doi: null,
      title: t.title || t.briefTitle,
      authors: t.locations?.map((l: any) => l.facility).join(', ') || 'Multicenter',
      journal: `ClinicalTrials.gov · ${t.phase}`,
      year: t.startDate ? parseInt(t.startDate.substring(0, 4)) : new Date().getFullYear(),
      abstract: t.briefSummary || '',
      relevance: 'high' as const,
      relevanceScore: 0.85,
      matchedKeywords: t.conditions || [],
      matchedSignalIds: [],
      action: 'extends' as const,
      isClinicalTrial: true,
      trialId: t.nctId,
      trialPhase: t.phase,
      source: 'clinicaltrials' as const,
      fetchedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[LiveScanner] Trial fetch failed:', err)
    return null
  }
}

// ── Run all configured PubMed queries ──

export async function runFullPubMedScan(maxPerQuery: number = 5): Promise<{
  articles: LiteratureArticle[]
  totalFound: number
  queriesRun: number
}> {
  const allArticles: LiteratureArticle[] = []
  let totalFound = 0
  const seenPmids = new Set<string>()

  for (const pq of PUBMED_QUERIES) {
    const result = await searchPubMed(pq.query, maxPerQuery)
    totalFound += result.totalFound

    for (const article of result.articles) {
      if (article.pmid && !seenPmids.has(article.pmid)) {
        seenPmids.add(article.pmid)
        allArticles.push(article)
      }
    }

    // Respect NCBI rate limit (3 requests/sec without API key)
    await new Promise(resolve => setTimeout(resolve, 400))
  }

  return { articles: allArticles, totalFound, queriesRun: PUBMED_QUERIES.length }
}

// ── Run pediatric neuro-inflammatory trial search ──

export async function runTrialScan(): Promise<{
  trials: LiteratureArticle[]
  totalFound: number
}> {
  const queries = [
    'FIRES febrile infection-related epilepsy syndrome',
    'NORSE new onset refractory status epilepticus pediatric',
    'anti-NMDAR encephalitis children treatment',
    'anakinra neuroinflammation pediatric',
    'ketogenic diet status epilepticus',
  ]

  const allTrials: LiteratureArticle[] = []
  let totalFound = 0
  const seenNcts = new Set<string>()

  for (const q of queries) {
    const result = await searchTrials(q, 5)
    totalFound += result.totalFound

    for (const trial of result.trials) {
      if (trial.trialId && !seenNcts.has(trial.trialId)) {
        seenNcts.add(trial.trialId)
        allTrials.push(trial)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return { trials: allTrials, totalFound }
}
