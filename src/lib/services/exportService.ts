// ============================================================
// PULSAR V19 — Export Publication Service
// Génère des documents publiables à partir des résultats
// du Discovery Engine (hypothèses, signaux, littérature)
// Formats: Markdown (research brief), JSON (data), BibTeX
// ============================================================

import type { SignalCard } from '@/lib/types/discovery'
import type { Hypothesis } from '@/lib/engines/HypothesisEngine'
import type { LiteratureArticle, ScanResult } from '@/lib/engines/LiteratureScanner'
import type { TherapeuticPathway, PathfinderResult } from '@/lib/engines/TreatmentPathfinder'
import type { DiscoveryRunResultV2 } from '@/lib/engines/DiscoveryEngine'

// ── Types ──

export interface ExportOptions {
  includeSignals: boolean
  includeHypotheses: boolean
  includeLiterature: boolean
  includePathways: boolean
  format: 'markdown' | 'json' | 'bibtex'
  language: 'fr' | 'en'
}

const DEFAULT_OPTIONS: ExportOptions = {
  includeSignals: true,
  includeHypotheses: true,
  includeLiterature: true,
  includePathways: true,
  format: 'markdown',
  language: 'fr',
}

// ══════════════════════════════════════════════════════════════
// MARKDOWN — Research Brief
// ══════════════════════════════════════════════════════════════

export function exportMarkdown(result: DiscoveryRunResultV2, opts: Partial<ExportOptions> = {}): string {
  const o = { ...DEFAULT_OPTIONS, ...opts }
  const date = new Date().toLocaleDateString(o.language === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const strongSignals = result.signals.filter(s => s.strength === 'strong' || s.strength === 'very_strong')

  const lines: string[] = []

  // ── Header ──
  lines.push(`# PULSAR Discovery Engine — ${o.language === 'fr' ? 'Rapport de Recherche' : 'Research Report'}`)
  lines.push('')
  lines.push(`**${o.language === 'fr' ? 'Date' : 'Date'}:** ${date}`)
  lines.push(`**${o.language === 'fr' ? 'Version' : 'Version'}:** Discovery Engine v4.0`)
  lines.push(`**${o.language === 'fr' ? 'Patients analysés' : 'Patients analyzed'}:** ${result.summary.patientsAnalyzed}`)
  lines.push(`**${o.language === 'fr' ? 'Signaux détectés' : 'Signals detected'}:** ${result.summary.totalSignals} (${result.summary.strongSignals} ${o.language === 'fr' ? 'forts' : 'strong'})`)
  lines.push(`**${o.language === 'fr' ? 'Publications scannées' : 'Publications scanned'}:** ${result.literature.stats.articlesScanned}`)
  lines.push(`**${o.language === 'fr' ? 'Hypothèses générées' : 'Hypotheses generated'}:** ${result.hypotheses.length}`)
  lines.push(`**${o.language === 'fr' ? 'Pistes thérapeutiques' : 'Therapeutic pathways'}:** ${result.pathfinder.stats.totalPathways}`)
  lines.push('')
  lines.push('> ⚠ **AVERTISSEMENT** : Ce rapport est généré par intelligence artificielle (Discovery Engine PULSAR). Toutes les hypothèses, signaux et recommandations nécessitent une validation par un clinicien-chercheur qualifié. Ce document ne constitue pas une recommandation clinique.')
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── Résumé exécutif ──
  lines.push(`## ${o.language === 'fr' ? 'Résumé exécutif' : 'Executive Summary'}`)
  lines.push('')
  lines.push(o.language === 'fr'
    ? `Le Discovery Engine PULSAR a analysé ${result.summary.patientsAnalyzed} dossiers patients (FIRES, NORSE, encéphalites auto-immunes) en croisant données cliniques internes et ${result.literature.stats.articlesScanned} publications scientifiques. L'analyse a généré ${result.summary.totalSignals} signaux statistiques dont ${result.summary.strongSignals} de force élevée, ${result.hypotheses.length} hypothèses de recherche et ${result.pathfinder.stats.totalPathways} pistes thérapeutiques.`
    : `The PULSAR Discovery Engine analyzed ${result.summary.patientsAnalyzed} patient records (FIRES, NORSE, autoimmune encephalitis) by cross-referencing internal clinical data with ${result.literature.stats.articlesScanned} scientific publications. The analysis generated ${result.summary.totalSignals} statistical signals including ${result.summary.strongSignals} strong ones, ${result.hypotheses.length} research hypotheses and ${result.pathfinder.stats.totalPathways} therapeutic pathways.`)
  lines.push('')

  if (result.literature.stats.contradictions > 0) {
    lines.push(o.language === 'fr'
      ? `**Attention** : ${result.literature.stats.contradictions} contradiction(s) détectée(s) avec le protocole TDE actuel.`
      : `**Warning**: ${result.literature.stats.contradictions} contradiction(s) detected with current TDE protocol.`)
    lines.push('')
  }
  lines.push('---')
  lines.push('')

  // ── Signaux forts ──
  if (o.includeSignals && strongSignals.length > 0) {
    lines.push(`## ${o.language === 'fr' ? 'Signaux statistiques significatifs' : 'Significant Statistical Signals'}`)
    lines.push('')
    for (const s of strongSignals) {
      const stats = []
      if (s.statistics.correlation) stats.push(`r = ${s.statistics.correlation.toFixed(3)}`)
      if (s.statistics.pValue) stats.push(`p = ${s.statistics.pValue.toFixed(4)}`)
      stats.push(`n = ${s.patients.count}`)

      lines.push(`### ${s.title}`)
      lines.push('')
      lines.push(`- **Type** : ${s.type}`)
      lines.push(`- **Force** : ${s.strength}`)
      lines.push(`- **Statistiques** : ${stats.join(', ')}`)
      lines.push(`- **Syndromes** : ${s.patients.syndromes.join(', ')}`)
      lines.push('')
      lines.push(s.description)
      lines.push('')
    }
    lines.push('---')
    lines.push('')
  }

  // ── Hypothèses ──
  if (o.includeHypotheses && result.hypotheses.length > 0) {
    lines.push(`## ${o.language === 'fr' ? 'Hypothèses de recherche' : 'Research Hypotheses'}`)
    lines.push('')
    for (let i = 0; i < result.hypotheses.length; i++) {
      const h = result.hypotheses[i]
      lines.push(`### ${o.language === 'fr' ? 'Hypothèse' : 'Hypothesis'} ${i + 1} : ${h.title}`)
      lines.push('')
      lines.push(`- **Type** : ${h.type}`)
      lines.push(`- **Confiance** : ${Math.round(h.confidence * 100)}%`)
      lines.push(`- **Impact potentiel** : ${h.impactPotential}`)
      lines.push('')
      lines.push(`**Description** : ${h.description}`)
      lines.push('')
      lines.push(`**${o.language === 'fr' ? 'Données internes (N1)' : 'Internal evidence (N1)'}** : ${h.internalEvidence}`)
      lines.push('')
      lines.push(`**${o.language === 'fr' ? 'Littérature (N2)' : 'Literature (N2)'}** : ${h.externalEvidence}`)
      lines.push('')
      lines.push(`**${o.language === 'fr' ? 'Raisonnement' : 'Reasoning'}** : ${h.reasoning}`)
      lines.push('')
      lines.push(`**${o.language === 'fr' ? 'Action suggérée' : 'Suggested action'}** : ${h.suggestedAction}`)
      lines.push('')

      if (h.literatureRefs.length > 0) {
        lines.push(`**${o.language === 'fr' ? 'Références' : 'References'}** :`)
        for (const ref of h.literatureRefs) {
          lines.push(`- ${ref.pmid ? `PMID:${ref.pmid} — ` : ''}${ref.title} (${ref.year})`)
        }
        lines.push('')
      }
    }
    lines.push('---')
    lines.push('')
  }

  // ── Pistes thérapeutiques ──
  if (o.includePathways && result.pathfinder.pathways.length > 0) {
    const eligible = result.pathfinder.pathways.filter(p => p.status === 'eligible' || p.status === 'potential')
    if (eligible.length > 0) {
      lines.push(`## ${o.language === 'fr' ? 'Pistes thérapeutiques' : 'Therapeutic Pathways'}`)
      lines.push('')
      lines.push(`| ${o.language === 'fr' ? 'Traitement' : 'Treatment'} | Patient | ${o.language === 'fr' ? 'Éligibilité' : 'Eligibility'} | ${o.language === 'fr' ? 'Niveau de preuve' : 'Evidence'} | ${o.language === 'fr' ? 'Essai' : 'Trial'} |`)
      lines.push('|---|---|---|---|---|')
      for (const p of eligible) {
        lines.push(`| ${p.treatment} | ${p.patientName} | ${Math.round(p.eligibilityScore * 100)}% | ${p.evidenceLevel} | ${p.trialId || '—'} |`)
      }
      lines.push('')
      lines.push('---')
      lines.push('')
    }
  }

  // ── Littérature ──
  if (o.includeLiterature) {
    const highRel = result.literature.articles.filter(a => a.relevance === 'high')
    if (highRel.length > 0) {
      lines.push(`## ${o.language === 'fr' ? 'Publications haute pertinence' : 'High Relevance Publications'}`)
      lines.push('')
      for (const a of highRel) {
        lines.push(`- ${a.authors} (${a.year}). **${a.title}**. _${a.journal}_. ${a.pmid ? `PMID: ${a.pmid}` : ''}${a.doi ? ` DOI: ${a.doi}` : ''} — [${a.action.toUpperCase()}] (score: ${Math.round(a.relevanceScore * 100)}%)`)
      }
      lines.push('')
    }

    // Contradictions
    const contradictions = result.literature.alerts.filter(a => a.type === 'contradiction')
    if (contradictions.length > 0) {
      lines.push(`### ${o.language === 'fr' ? 'Contradictions détectées' : 'Detected Contradictions'}`)
      lines.push('')
      for (const c of contradictions) {
        lines.push(`- **${c.title}** ${c.protocolImpact ? `[TDE ${c.protocolImpact}]` : ''} — ${c.description}`)
      }
      lines.push('')
    }

    lines.push('---')
    lines.push('')
  }

  // ── Méthodologie ──
  lines.push(`## ${o.language === 'fr' ? 'Méthodologie' : 'Methodology'}`)
  lines.push('')
  lines.push(o.language === 'fr'
    ? `Ce rapport a été généré par le Discovery Engine PULSAR v4.0, un système d'analyse translationnelle à 4 niveaux :`
    : `This report was generated by the PULSAR Discovery Engine v4.0, a 4-level translational analysis system:`)
  lines.push('')
  lines.push(o.language === 'fr'
    ? `1. **Niveau 1 — Pattern Mining** : Corrélation de Pearson sur 34 paramètres cliniques, clustering k-means (k=3), détection d'anomalies par z-score (seuil 2.5σ).`
    : `1. **Level 1 — Pattern Mining**: Pearson correlation on 34 clinical parameters, k-means clustering (k=3), z-score anomaly detection (threshold 2.5σ).`)
  lines.push(o.language === 'fr'
    ? `2. **Niveau 2 — Literature Scanner** : Matching automatique publications PubMed ↔ signaux internes par mots-clés. Détection de contradictions avec le protocole TDE (lignes L1-L4).`
    : `2. **Level 2 — Literature Scanner**: Automatic PubMed publication matching ↔ internal signals by keywords. Contradiction detection with TDE protocol (lines L1-L4).`)
  lines.push(o.language === 'fr'
    ? `3. **Niveau 3 — Hypothesis Engine** : Génération d'hypothèses par croisement N1×N2 via Claude API (Anthropic). Workflow de validation : Générée → En revue → Validée → Publiée.`
    : `3. **Level 3 — Hypothesis Engine**: Hypothesis generation by N1×N2 cross-referencing via Claude API (Anthropic). Validation workflow: Generated → In review → Validated → Published.`)
  lines.push(o.language === 'fr'
    ? `4. **Niveau 4 — Treatment Pathfinder** : Matching patient ↔ essais cliniques (ClinicalTrials.gov). Scoring d'éligibilité multicritères.`
    : `4. **Level 4 — Treatment Pathfinder**: Patient ↔ clinical trial matching (ClinicalTrials.gov). Multi-criteria eligibility scoring.`)
  lines.push('')

  // ── Footer ──
  lines.push('---')
  lines.push('')
  lines.push(`*${o.language === 'fr' ? 'Généré par PULSAR Discovery Engine v4.0' : 'Generated by PULSAR Discovery Engine v4.0'}*`)
  lines.push(`*${date}*`)
  lines.push('')
  lines.push('> PULSAR — Pediatric Unified Longitudinal System for Assessment and Research')
  lines.push('> In memory of Alejandro R. (2019–2025)')

  return lines.join('\n')
}

// ══════════════════════════════════════════════════════════════
// JSON — Structured Data Export
// ══════════════════════════════════════════════════════════════

export function exportJSON(result: DiscoveryRunResultV2, opts: Partial<ExportOptions> = {}): string {
  const o = { ...DEFAULT_OPTIONS, ...opts }
  const payload: any = {
    _meta: {
      generator: 'PULSAR Discovery Engine v4.0',
      exportDate: new Date().toISOString(),
      disclaimer: 'AI-generated research data. Requires clinical validation.',
    },
    summary: result.summary,
  }

  if (o.includeSignals) {
    payload.signals = result.signals.map(s => ({
      id: s.id, title: s.title, type: s.type, strength: s.strength,
      statistics: s.statistics, patients: s.patients, description: s.description,
    }))
  }
  if (o.includeHypotheses) {
    payload.hypotheses = result.hypotheses.map(h => ({
      id: h.id, title: h.title, type: h.type, confidence: h.confidence,
      description: h.description, reasoning: h.reasoning,
      internalEvidence: h.internalEvidence, externalEvidence: h.externalEvidence,
      suggestedAction: h.suggestedAction, impactPotential: h.impactPotential,
      literatureRefs: h.literatureRefs,
    }))
  }
  if (o.includeLiterature) {
    payload.literature = {
      stats: result.literature.stats,
      alerts: result.literature.alerts,
      articles: result.literature.articles.map(a => ({
        pmid: a.pmid, doi: a.doi, title: a.title, authors: a.authors,
        journal: a.journal, year: a.year, relevance: a.relevance,
        relevanceScore: a.relevanceScore, action: a.action,
        isClinicalTrial: a.isClinicalTrial, trialId: a.trialId,
      })),
    }
  }
  if (o.includePathways) {
    payload.pathways = result.pathfinder.pathways.map(p => ({
      treatment: p.treatment, patientName: p.patientName,
      eligibilityScore: p.eligibilityScore, status: p.status,
      evidenceLevel: p.evidenceLevel, trialId: p.trialId,
      eligibilityCriteria: p.eligibilityCriteria,
    }))
  }

  return JSON.stringify(payload, null, 2)
}

// ══════════════════════════════════════════════════════════════
// BibTeX — Bibliography Export
// ══════════════════════════════════════════════════════════════

export function exportBibTeX(articles: LiteratureArticle[]): string {
  const entries: string[] = []
  const highRelevance = articles.filter(a => a.relevance === 'high' || a.relevance === 'medium')

  for (const a of highRelevance) {
    const firstAuthor = (a.authors || 'Unknown').split(',')[0].split(' ').pop() || 'Unknown'
    const key = `${firstAuthor}${a.year}`

    if (a.isClinicalTrial && a.trialId) {
      entries.push(`@misc{${a.trialId},
  title     = {${a.title}},
  year      = {${a.year}},
  note      = {ClinicalTrials.gov Identifier: ${a.trialId}},
  url       = {https://clinicaltrials.gov/study/${a.trialId}},
}`)
    } else {
      entries.push(`@article{${key},
  author    = {${a.authors}},
  title     = {${a.title}},
  journal   = {${a.journal}},
  year      = {${a.year}},${a.pmid ? `\n  pmid      = {${a.pmid}},` : ''}${a.doi ? `\n  doi       = {${a.doi}},` : ''}
}`)
    }
  }

  return `% PULSAR Discovery Engine — Bibliography Export
% Generated: ${new Date().toISOString()}
% Articles: ${entries.length}

${entries.join('\n\n')}
`
}

// ══════════════════════════════════════════════════════════════
// DOWNLOAD TRIGGER
// ══════════════════════════════════════════════════════════════

export function triggerDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
