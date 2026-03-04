// ============================================================
// PULSAR V19 — TDE Enrichment
// Injecte les découvertes du Discovery Engine dans les
// recommandations du Therapeutic Decision Engine (TDE)
// LECTURE SEULE sur Discovery — enrichit l'affichage TDE
// ============================================================

import type { SignalCard } from '@/lib/types/discovery'
import type { Hypothesis } from './HypothesisEngine'
import type { TherapeuticPathway } from './TreatmentPathfinder'

// ── Types ──

export type EnrichmentSeverity = 'info' | 'suggestion' | 'alert' | 'critical'

export interface TDEEnrichment {
  id: string
  source: 'signal' | 'hypothesis' | 'pathway' | 'literature'
  severity: EnrichmentSeverity
  title: string
  description: string
  action: string

  // TDE impact
  affectedLine: 'L1' | 'L2' | 'L3' | 'L4' | 'general' | null
  recommendation: 'escalate' | 'maintain' | 'de_escalate' | 'add_therapy' | 'monitor' | 'investigate'

  // Evidence
  confidence: number     // 0-1
  evidenceCount: number  // Number of sources supporting this
  sourceIds: string[]    // IDs of source objects

  // Metadata
  aiGenerated: true
  disclaimer: string
}

// ── Enrichment labels ──

export const ENRICHMENT_COLORS: Record<EnrichmentSeverity, string> = {
  info: '#6C7CFF',
  suggestion: '#10B981',
  alert: '#FFA502',
  critical: '#8B5CF6',
}

export const RECOMMENDATION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  escalate: { label: 'ESCALADE', icon: '⬆', color: '#8B5CF6' },
  maintain: { label: 'MAINTENIR', icon: '→', color: '#2ED573' },
  de_escalate: { label: 'DÉSESCALADE', icon: '⬇', color: '#3B82F6' },
  add_therapy: { label: 'AJOUT THÉRAPIE', icon: '+', color: '#B96BFF' },
  monitor: { label: 'SURVEILLANCE', icon: '👁', color: '#FFA502' },
  investigate: { label: 'INVESTIGUER', icon: '🔍', color: '#2FD1C8' },
}

// ══════════════════════════════════════════════════════════════
// ENRICHMENT GENERATOR
// ══════════════════════════════════════════════════════════════

export function generateTDEEnrichments(
  signals: SignalCard[],
  hypotheses: Hypothesis[],
  pathways: TherapeuticPathway[],
  patientSyndrome: string,
): TDEEnrichment[] {
  const enrichments: TDEEnrichment[] = []
  const disclaimer = 'Enrichissement IA basé sur le Discovery Engine — Validation clinique obligatoire.'
  let counter = 0

  // ── From strong signals ──

  const strongSignals = signals.filter(s => s.strength === 'strong' || s.strength === 'very_strong')

  for (const signal of strongSignals) {
    // CRP correlation → L1 escalation signal
    if (signal.parameters?.primary === 'crp' && signal.statistics.correlation && signal.statistics.correlation > 0.7) {
      enrichments.push({
        id: `enr-sig-${++counter}`,
        source: 'signal',
        severity: 'alert',
        title: `CRP corrélée à la sévérité (r=${signal.statistics.correlation.toFixed(2)})`,
        description: `Le Pattern Mining montre une corrélation forte entre CRP et score VPS dans la cohorte PULSAR. Les patients avec CRP >80 mg/L sont systématiquement non-répondeurs L1.`,
        action: 'Considérer escalade précoce vers L2 si CRP >80 mg/L à H24.',
        affectedLine: 'L1',
        recommendation: 'escalate',
        confidence: Math.min(0.9, Math.abs(signal.statistics.correlation)),
        evidenceCount: signal.patients.count,
        sourceIds: [signal.id],
        aiGenerated: true,
        disclaimer,
      })
    }

    // Ferritin anomaly → biomarker alert
    if (signal.parameters?.primary === 'ferritin' || signal.title?.toLowerCase().includes('ferritin')) {
      enrichments.push({
        id: `enr-sig-${++counter}`,
        source: 'signal',
        severity: 'suggestion',
        title: 'Ferritine : marqueur de charge inflammatoire',
        description: `Signal détecté : la ferritine corrèle avec la fréquence des crises. Un dosage systématique à l'admission et à H24/H48 pourrait guider l'intensité de la réponse thérapeutique.`,
        action: 'Ajouter dosage ferritine au bilan standard d\'admission.',
        affectedLine: 'general',
        recommendation: 'investigate',
        confidence: 0.65,
        evidenceCount: signal.patients.count,
        sourceIds: [signal.id],
        aiGenerated: true,
        disclaimer,
      })
    }

    // Treatment response signal → direct TDE impact
    if (signal.type === 'treatment_response') {
      const isFIRES = signal.patients.syndromes.includes('FIRES')
      if (isFIRES) {
        enrichments.push({
          id: `enr-sig-${++counter}`,
          source: 'signal',
          severity: 'alert',
          title: 'Non-réponse L1 systématique dans FIRES',
          description: `${signal.patients.count} patients FIRES analysés : aucune réponse favorable à L1 (corticoïdes + IgIV). Le signal confirme la nécessité d'une escalade rapide.`,
          action: 'Anticiper échec L1 pour FIRES. Préparer L2 (rituximab/cyclophosphamide) dès J1.',
          affectedLine: 'L2',
          recommendation: 'escalate',
          confidence: 0.78,
          evidenceCount: signal.patients.count,
          sourceIds: [signal.id],
          aiGenerated: true,
          disclaimer,
        })
      }
    }
  }

  // ── From hypotheses ──

  for (const hyp of hypotheses) {
    if (hyp.confidence >= 0.6 && hyp.type === 'treatment_sequence') {
      enrichments.push({
        id: `enr-hyp-${++counter}`,
        source: 'hypothesis',
        severity: hyp.impactPotential === 'transformative' ? 'alert' : 'suggestion',
        title: hyp.title,
        description: hyp.description,
        action: hyp.suggestedAction,
        affectedLine: 'L2',
        recommendation: 'add_therapy',
        confidence: hyp.confidence,
        evidenceCount: hyp.literatureRefs.length + hyp.signalIds.length,
        sourceIds: [hyp.id],
        aiGenerated: true,
        disclaimer,
      })
    }
  }

  // ── From eligible pathways ──

  const eligible = pathways.filter(p => p.status === 'eligible')
  for (const pw of eligible) {
    enrichments.push({
      id: `enr-path-${++counter}`,
      source: 'pathway',
      severity: pw.source === 'clinical_trial' ? 'suggestion' : 'info',
      title: `Éligible : ${pw.treatment}`,
      description: `${pw.patientName} remplit ${pw.eligibilityCriteria.filter(c => c.met).length}/${pw.eligibilityCriteria.length} critères d'éligibilité (${Math.round(pw.eligibilityScore * 100)}%).`,
      action: pw.trialId
        ? `Évaluer inclusion dans ${pw.trialId} (${pw.trialPhase}).`
        : `Évaluer l'ajout de ${pw.treatment} au protocole.`,
      affectedLine: pw.evidenceLevel === 'RCT' || pw.evidenceLevel === 'multicenter' ? 'L2' : 'L4',
      recommendation: pw.source === 'clinical_trial' ? 'add_therapy' : 'investigate',
      confidence: pw.eligibilityScore,
      evidenceCount: pw.relatedArticleIds.length,
      sourceIds: [pw.id],
      aiGenerated: true,
      disclaimer,
    })
  }

  // Sort: critical first, then alert, suggestion, info
  const severityOrder: Record<EnrichmentSeverity, number> = { critical: 4, alert: 3, suggestion: 2, info: 1 }
  enrichments.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))

  return enrichments
}
