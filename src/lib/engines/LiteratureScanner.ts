// ============================================================
// PULSAR V18 — Literature Scanner (Discovery Engine · Niveau 2)
// Veille scientifique PubMed + croisement signaux internes
// 3 actions : Vérification, Contradiction, Opportunité
// ============================================================

import type { SignalCard } from '@/lib/types/discovery'

// ── Types Literature Scanner ──

export type ArticleRelevance = 'high' | 'medium' | 'low'
export type ArticleAction = 'confirms' | 'contradicts' | 'extends' | 'neutral'
export type AlertType = 'confirmation' | 'contradiction' | 'opportunity' | 'update'

export interface LiteratureArticle {
  id: string
  pmid: string | null
  doi: string | null
  title: string
  authors: string
  journal: string
  year: number
  abstract: string | null
  // Matching
  relevance: ArticleRelevance
  relevanceScore: number          // 0-1
  matchedKeywords: string[]
  matchedSignalIds: string[]
  action: ArticleAction           // What this article means for PULSAR
  // Clinical trial specific
  isClinicalTrial: boolean
  trialId: string | null          // NCT number
  trialPhase: string | null
  // Metadata
  fetchedAt: string
  source: 'pubmed' | 'cochrane' | 'clinicaltrials' | 'manual' | 'seed'
}

export interface LiteratureAlert {
  id: string
  type: AlertType
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  articleId: string
  signalIds: string[]
  protocolImpact: string | null   // Which TDE line is affected
  actionRequired: string
  createdAt: string
}

export interface ScanResult {
  articles: LiteratureArticle[]
  alerts: LiteratureAlert[]
  stats: {
    articlesScanned: number
    matchesFound: number
    confirmations: number
    contradictions: number
    opportunities: number
    clinicalTrials: number
  }
  scannedAt: string
}

// ── PubMed query builder ──

export const PUBMED_QUERIES: { topic: string; query: string; priority: number }[] = [
  { topic: 'FIRES', query: 'FIRES febrile infection related epilepsy syndrome', priority: 1 },
  { topic: 'NORSE', query: 'new onset refractory status epilepticus', priority: 1 },
  { topic: 'Anti-NMDAR', query: 'anti-NMDA receptor encephalitis pediatric', priority: 1 },
  { topic: 'Anakinra FIRES', query: 'anakinra FIRES status epilepticus', priority: 2 },
  { topic: 'Tocilizumab neuro', query: 'tocilizumab neuroinflammation pediatric', priority: 2 },
  { topic: 'Ketogenic FIRES', query: 'ketogenic diet refractory status epilepticus', priority: 2 },
  { topic: 'Cytokine storm', query: 'cytokine storm epilepsy pediatric IL-1 IL-6', priority: 2 },
  { topic: 'EEG FIRES', query: 'EEG patterns FIRES NORSE continuous monitoring', priority: 3 },
  { topic: 'MOGAD pediatric', query: 'MOGAD ADEM pediatric demyelination', priority: 3 },
  { topic: 'Valproate meropenem', query: 'valproate meropenem carbapenem interaction', priority: 3 },
]

// ── Keyword matching engine ──

const SIGNAL_KEYWORD_MAP: Record<string, string[]> = {
  crp: ['CRP', 'C-reactive protein', 'inflammatory marker', 'inflammation'],
  ferritin: ['ferritin', 'hyperferritinemia', 'macrophage activation', 'MAS'],
  gcs: ['GCS', 'Glasgow', 'consciousness', 'coma scale'],
  seizures_24h: ['seizure', 'crisis', 'convulsion', 'status epilepticus', 'ictal'],
  vps_score: ['severity score', 'organ failure', 'pSOFA', 'clinical deterioration'],
  treatment_response: ['treatment response', 'therapeutic', 'first-line', 'refractory'],
  il1b: ['IL-1', 'interleukin-1', 'IL-1β', 'anakinra', 'inflammasome'],
  il6: ['IL-6', 'interleukin-6', 'tocilizumab', 'cytokine'],
  temp: ['fever', 'temperature', 'febrile', 'hyperthermia'],
  csf_protein: ['CSF', 'cerebrospinal fluid', 'pleocytosis', 'protein'],
  heart_rate: ['tachycardia', 'heart rate', 'hemodynamic'],
  platelets: ['platelets', 'thrombocytopenia', 'coagulation'],
  lactate: ['lactate', 'lactic acid', 'tissue perfusion'],
}

// ── TDE protocol reference (for contradiction detection) ──

const TDE_PROTOCOL = {
  L1: { drugs: ['methylprednisolone', 'corticosteroid', 'IgIV', 'IVIG', 'immunoglobulin'], timeframe: '72h' },
  L2: { drugs: ['rituximab', 'cyclophosphamide', 'ketogenic', 'cétogène'], timeframe: 'J7' },
  L3: { drugs: ['rituximab', 'cyclophosphamide', 'plasmapheresis', 'plasma exchange'], timeframe: 'J14' },
  L4: { drugs: ['tocilizumab', 'anakinra', 'bortezomib', 'anti-IL-1', 'anti-IL-6'], timeframe: 'refractory' },
}

// ══════════════════════════════════════════════════════════════
// LITERATURE SCANNER
// ══════════════════════════════════════════════════════════════

export class LiteratureScanner {

  // ── 1. Match articles against signals ──

  matchArticleToSignals(article: LiteratureArticle, signals: SignalCard[]): {
    matchedIds: string[]
    matchedKeywords: string[]
    relevanceScore: number
  } {
    const text = `${article.title} ${article.abstract || ''}`.toLowerCase()
    const matchedIds: string[] = []
    const matchedKeywords: Set<string> = new Set()
    let score = 0

    for (const signal of signals) {
      const params = signal.parameters.all
      let signalMatch = false

      for (const param of params) {
        const keywords = SIGNAL_KEYWORD_MAP[param] || []
        for (const kw of keywords) {
          if (text.includes(kw.toLowerCase())) {
            matchedKeywords.add(kw)
            signalMatch = true
            score += 0.15
          }
        }
      }

      // Also match signal tags
      for (const tag of signal.tags) {
        if (text.includes(tag.toLowerCase())) {
          matchedKeywords.add(tag)
          signalMatch = true
          score += 0.1
        }
      }

      if (signalMatch) matchedIds.push(signal.id)
    }

    // Bonus for FIRES/NORSE/NMDAR specific mentions
    const highPriorityTerms = ['FIRES', 'NORSE', 'anti-NMDA', 'febrile infection-related', 'refractory status']
    for (const term of highPriorityTerms) {
      if (text.includes(term.toLowerCase())) {
        score += 0.2
        matchedKeywords.add(term)
      }
    }

    return {
      matchedIds,
      matchedKeywords: [...matchedKeywords],
      relevanceScore: Math.min(1, Math.round(score * 100) / 100),
    }
  }

  // ── 2. Detect contradictions with TDE protocol ──

  detectContradictions(article: LiteratureArticle): LiteratureAlert | null {
    const text = `${article.title} ${article.abstract || ''}`.toLowerCase()

    // Look for negative results or contradictions
    const negativeTerms = [
      'no significant', 'failed to', 'not effective', 'no benefit',
      'inferior to', 'worse outcome', 'increased mortality', 'not recommended',
      'should be avoided', 'contraindicated',
    ]

    const hasNegativeFinding = negativeTerms.some(t => text.includes(t))
    if (!hasNegativeFinding) return null

    // Which TDE line is mentioned?
    let affectedLine: string | null = null
    for (const [line, config] of Object.entries(TDE_PROTOCOL)) {
      for (const drug of config.drugs) {
        if (text.includes(drug.toLowerCase())) {
          affectedLine = line
          break
        }
      }
      if (affectedLine) break
    }

    if (!affectedLine) return null

    return {
      id: `alert-contra-${article.pmid || article.id}`,
      type: 'contradiction',
      title: `⚠ Contradiction potentielle — ${affectedLine}`,
      description: `La publication "${article.title}" (${article.journal}, ${article.year}) contient des résultats potentiellement contradictoires avec le protocole TDE ${affectedLine}. Revue recommandée.`,
      severity: 'warning',
      articleId: article.id,
      signalIds: [],
      protocolImpact: affectedLine,
      actionRequired: `Vérifier si les conclusions de l'étude nécessitent un ajustement du protocole ${affectedLine} du TDE Engine.`,
      createdAt: new Date().toISOString(),
    }
  }

  // ── 3. Detect confirmation signals ──

  detectConfirmation(article: LiteratureArticle, signals: SignalCard[]): LiteratureAlert | null {
    const text = `${article.title} ${article.abstract || ''}`.toLowerCase()

    const posTerms = [
      'confirms', 'validates', 'consistent with', 'supports',
      'significant correlation', 'predictor of', 'associated with',
      'biomarker', 'effective', 'improved outcome',
    ]

    const hasPositive = posTerms.some(t => text.includes(t))
    if (!hasPositive || article.matchedSignalIds.length === 0) return null

    return {
      id: `alert-confirm-${article.pmid || article.id}`,
      type: 'confirmation',
      title: `✓ Confirmation externe — ${article.matchedSignalIds.length} signal(s)`,
      description: `"${article.title}" (${article.journal}, ${article.year}) confirme ${article.matchedSignalIds.length} signal(s) Discovery. Les observations internes sont corroborées par une source externe.`,
      severity: 'info',
      articleId: article.id,
      signalIds: article.matchedSignalIds,
      protocolImpact: null,
      actionRequired: 'Considérer la promotion des signaux concernés de "monitoring" à "confirmed".',
      createdAt: new Date().toISOString(),
    }
  }

  // ── 4. Detect clinical trial opportunities ──

  detectTrialOpportunity(article: LiteratureArticle): LiteratureAlert | null {
    if (!article.isClinicalTrial) return null

    return {
      id: `alert-trial-${article.trialId || article.id}`,
      type: 'opportunity',
      title: `🔬 Essai clinique — ${article.trialId || 'N/A'}`,
      description: `"${article.title}" (${article.trialPhase || 'Phase ?'}). Essai potentiellement pertinent pour les patients PULSAR. Vérifier les critères d'inclusion.`,
      severity: 'info',
      articleId: article.id,
      signalIds: article.matchedSignalIds,
      protocolImpact: null,
      actionRequired: 'Vérifier éligibilité des patients actifs pour cet essai clinique.',
      createdAt: new Date().toISOString(),
    }
  }

  // ── 5. Full scan pipeline ──

  scan(articles: LiteratureArticle[], signals: SignalCard[]): ScanResult {
    const alerts: LiteratureAlert[] = []
    let confirmations = 0, contradictions = 0, opportunities = 0, clinicalTrials = 0

    // Enrich articles with signal matching
    for (const article of articles) {
      const match = this.matchArticleToSignals(article, signals)
      article.matchedSignalIds = match.matchedIds
      article.matchedKeywords = match.matchedKeywords
      article.relevanceScore = match.relevanceScore
      article.relevance = match.relevanceScore >= 0.6 ? 'high' :
        match.relevanceScore >= 0.3 ? 'medium' : 'low'

      // Check for contradictions
      const contra = this.detectContradictions(article)
      if (contra) { alerts.push(contra); contradictions++ }

      // Check for confirmations
      const confirm = this.detectConfirmation(article, signals)
      if (confirm) { alerts.push(confirm); confirmations++ }

      // Check for trial opportunities
      if (article.isClinicalTrial) {
        const trial = this.detectTrialOpportunity(article)
        if (trial) { alerts.push(trial); opportunities++ }
        clinicalTrials++
      }
    }

    // Sort articles by relevance
    articles.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Sort alerts: contradictions first, then opportunities, then confirmations
    const alertOrder: Record<AlertType, number> = {
      contradiction: 3, opportunity: 2, confirmation: 1, update: 0,
    }
    alerts.sort((a, b) => (alertOrder[b.type] || 0) - (alertOrder[a.type] || 0))

    return {
      articles,
      alerts,
      stats: {
        articlesScanned: articles.length,
        matchesFound: articles.filter(a => a.matchedSignalIds.length > 0).length,
        confirmations,
        contradictions,
        opportunities,
        clinicalTrials,
      },
      scannedAt: new Date().toISOString(),
    }
  }

  // ── 6. Build PubMed search URL (for future live API) ──

  buildPubMedUrl(query: string, maxResults: number = 10): string {
    const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
    const params = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmax: String(maxResults),
      sort: 'date',
      retmode: 'json',
    })
    return `${base}/esearch.fcgi?${params.toString()}`
  }

  buildPubMedFetchUrl(pmids: string[]): string {
    const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
    })
    return `${base}/efetch.fcgi?${params.toString()}`
  }

  // ── 7. Get available queries ──

  getQueries() {
    return PUBMED_QUERIES
  }
}

// ── Export singleton ──
export const literatureScanner = new LiteratureScanner()
