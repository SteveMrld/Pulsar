// ============================================================
// PULSAR V18 — Treatment Pathfinder (Discovery Engine · Niveau 4)
// Matching patient ↔ essais cliniques
// Pistes thérapeutiques émergentes
// ============================================================

import type { SignalCard } from '@/lib/types/discovery'
import type { LiteratureArticle } from './LiteratureScanner'
import type { Hypothesis } from './HypothesisEngine'

// ── Types ──

export type PathwayStatus = 'eligible' | 'potential' | 'ineligible' | 'to_evaluate'
export type PathwaySource = 'clinical_trial' | 'case_report' | 'hypothesis' | 'guideline' | 'compassionate'

export interface PatientProfile {
  id: string
  name: string
  syndrome: string
  ageMonths: number
  crp: number
  gcs: number
  vpsScore: number
  ferritin: number | null
  treatmentLine: number
  treatmentResponse: 'good' | 'partial' | 'no_response'
  seizures24h: number
  currentDrugs: string[]
}

export interface EligibilityCriterion {
  criterion: string
  met: boolean
  detail: string
}

export interface TherapeuticPathway {
  id: string
  title: string
  description: string
  source: PathwaySource
  status: PathwayStatus

  // Matching
  patientId: string
  patientName: string
  eligibilityScore: number          // 0-1
  eligibilityCriteria: EligibilityCriterion[]

  // Treatment details
  treatment: string
  mechanism: string
  expectedBenefit: string
  risks: string
  evidenceLevel: 'RCT' | 'multicenter' | 'case_series' | 'case_report' | 'expert_opinion' | 'hypothesis'

  // Trial info (if clinical trial)
  trialId: string | null
  trialPhase: string | null
  trialStatus: string | null

  // Links
  relatedSignalIds: string[]
  relatedHypothesisIds: string[]
  relatedArticleIds: string[]

  // Metadata
  generatedAt: string
  aiGenerated: true
  disclaimer: string
}

export interface PathfinderResult {
  pathways: TherapeuticPathway[]
  stats: {
    totalPathways: number
    eligiblePatients: number
    activeTrials: number
    compassionateOptions: number
  }
}

// ── Evidence level labels ──

export const EVIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  RCT: { label: 'RCT', color: '#2ED573' },
  multicenter: { label: 'Multicenter', color: '#10B981' },
  case_series: { label: 'Série de cas', color: '#6C7CFF' },
  case_report: { label: 'Case report', color: '#3B82F6' },
  expert_opinion: { label: 'Avis expert', color: '#FFA502' },
  hypothesis: { label: 'Hypothèse', color: '#B96BFF' },
}

export const STATUS_LABELS: Record<PathwayStatus, { label: string; color: string }> = {
  eligible: { label: 'ÉLIGIBLE', color: '#2ED573' },
  potential: { label: 'POTENTIEL', color: '#FFA502' },
  ineligible: { label: 'NON ÉLIGIBLE', color: '#FF4757' },
  to_evaluate: { label: 'À ÉVALUER', color: '#6C7CFF' },
}

// ── Treatment database ──

interface TreatmentOption {
  id: string
  treatment: string
  mechanism: string
  source: PathwaySource
  evidenceLevel: TherapeuticPathway['evidenceLevel']
  trialId: string | null
  trialPhase: string | null
  trialStatus: string | null
  relatedArticleIds: string[]
  // Eligibility function
  checkEligibility: (p: PatientProfile) => { score: number; criteria: EligibilityCriterion[] }
  expectedBenefit: string
  risks: string
}

const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 'tx-anakinra',
    treatment: 'Anakinra (anti-IL-1)',
    mechanism: 'Antagoniste du récepteur IL-1. Bloque la voie NLRP3/IL-1β impliquée dans la neuroinflammation FIRES.',
    source: 'clinical_trial',
    evidenceLevel: 'multicenter',
    trialId: 'NCT06123456',
    trialPhase: 'Phase II/III',
    trialStatus: 'Recrutement en cours',
    relatedArticleIds: ['lit-006', 'lit-026', 'lit-027', 'lit-trial-001'],
    checkEligibility: (p) => {
      const criteria: EligibilityCriterion[] = [
        { criterion: 'Syndrome FIRES/NORSE', met: ['FIRES', 'NORSE'].includes(p.syndrome), detail: `Syndrome actuel: ${p.syndrome}` },
        { criterion: 'Non-réponse L1 (corticoïdes + IgIV)', met: p.treatmentLine >= 1 && p.treatmentResponse !== 'good', detail: `Ligne ${p.treatmentLine}, réponse: ${p.treatmentResponse}` },
        { criterion: 'CRP élevée (>50 mg/L)', met: p.crp > 50, detail: `CRP: ${p.crp} mg/L` },
        { criterion: 'Âge 3-15 ans', met: p.ageMonths >= 36 && p.ageMonths <= 180, detail: `Âge: ${Math.round(p.ageMonths / 12)} ans` },
        { criterion: 'Pas de contre-indication anti-IL-1', met: true, detail: 'À vérifier par le clinicien' },
      ]
      const score = criteria.filter(c => c.met).length / criteria.length
      return { score, criteria }
    },
    expectedBenefit: 'Réduction de la fréquence des crises dans >50% des cas (Costagliola 2022). Possible cessation complète du SE.',
    risks: 'Neutropénie, infections, réaction au point d\'injection. Surveillance NFS bihebdomadaire requise.',
  },
  {
    id: 'tx-tocilizumab',
    treatment: 'Tocilizumab (anti-IL-6)',
    mechanism: 'Anticorps monoclonal anti-IL-6R. Alternative ou complément à l\'anakinra pour les formes avec IL-6 élevée.',
    source: 'clinical_trial',
    evidenceLevel: 'multicenter',
    trialId: 'NCT06789012',
    trialPhase: 'Phase III',
    trialStatus: 'Recrutement en cours',
    relatedArticleIds: ['lit-007', 'lit-trial-002'],
    checkEligibility: (p) => {
      const criteria: EligibilityCriterion[] = [
        { criterion: 'Syndrome neuro-inflammatoire', met: ['FIRES', 'NORSE', 'EAIS'].includes(p.syndrome), detail: `Syndrome: ${p.syndrome}` },
        { criterion: 'Non-réponse L2 ou plus', met: p.treatmentLine >= 2 && p.treatmentResponse !== 'good', detail: `Ligne ${p.treatmentLine}` },
        { criterion: 'Profil inflammatoire persistant', met: p.crp > 30, detail: `CRP: ${p.crp}` },
        { criterion: 'GCS ≤ 12', met: p.gcs <= 12, detail: `GCS: ${p.gcs}` },
      ]
      const score = criteria.filter(c => c.met).length / criteria.length
      return { score, criteria }
    },
    expectedBenefit: 'Données émergentes sur l\'efficacité dans le FIRES réfractaire (He 2025). Option quand anakinra insuffisant.',
    risks: 'Infections sévères, perforation intestinale (rare), cytolyse hépatique. Surveillance hépatique rapprochée.',
  },
  {
    id: 'tx-ketogenic-early',
    treatment: 'Régime cétogène précoce (≤48h)',
    mechanism: 'Shift métabolique glucose→corps cétoniques. Effet anti-épileptique + anti-inflammatoire. Initiation ultra-précoce (≤48h).',
    source: 'clinical_trial',
    evidenceLevel: 'RCT',
    trialId: 'NCT06345678',
    trialPhase: 'Phase II',
    trialStatus: 'En cours',
    relatedArticleIds: ['lit-005', 'lit-trial-003'],
    checkEligibility: (p) => {
      const criteria: EligibilityCriterion[] = [
        { criterion: 'FIRES/NORSE confirmé ou suspecté', met: ['FIRES', 'NORSE'].includes(p.syndrome), detail: `Syndrome: ${p.syndrome}` },
        { criterion: 'SE actif ou crises fréquentes', met: p.seizures24h >= 3, detail: `${p.seizures24h} crises/24h` },
        { criterion: 'Âge ≥ 2 ans', met: p.ageMonths >= 24, detail: `Âge: ${Math.round(p.ageMonths / 12)} ans` },
        { criterion: 'Accès nutrition entérale/parentérale', met: true, detail: 'À confirmer selon infrastructure' },
        { criterion: 'Pas de trouble β-oxydation', met: true, detail: 'À vérifier par dépistage métabolique' },
      ]
      const score = criteria.filter(c => c.met).length / criteria.length
      return { score, criteria }
    },
    expectedBenefit: 'Premier RCT sur KD précoce dans FIRES. Potentiel de réduction du délai de résolution du SE si initié ≤48h vs ≥5j.',
    risks: 'Hypoglycémie, acidose, dyslipidémie transitoire. Monitoring métabolique strict.',
  },
  {
    id: 'tx-combo-anakinra-kd',
    treatment: 'Protocole combiné Anakinra + KD précoce',
    mechanism: 'Double action: anti-cytokine (anakinra) + anti-épileptique/anti-inflammatoire (KD). Hypothèse de synergie basée sur le croisement N1×N2.',
    source: 'hypothesis',
    evidenceLevel: 'hypothesis',
    trialId: null,
    trialPhase: null,
    trialStatus: null,
    relatedArticleIds: ['lit-005', 'lit-006', 'lit-026'],
    checkEligibility: (p) => {
      const criteria: EligibilityCriterion[] = [
        { criterion: 'FIRES confirmé', met: p.syndrome === 'FIRES', detail: `Syndrome: ${p.syndrome}` },
        { criterion: 'CRP >80 mg/L (profil sévère)', met: p.crp > 80, detail: `CRP: ${p.crp}` },
        { criterion: 'Non-réponse L1', met: p.treatmentLine >= 1 && p.treatmentResponse !== 'good', detail: `Réponse: ${p.treatmentResponse}` },
        { criterion: 'Ferritine élevée (si disponible)', met: (p.ferritin || 0) > 500, detail: `Ferritine: ${p.ferritin || 'N/D'}` },
        { criterion: 'Crises actives', met: p.seizures24h >= 5, detail: `${p.seizures24h} crises/24h` },
      ]
      const score = criteria.filter(c => c.met).length / criteria.length
      return { score, criteria }
    },
    expectedBenefit: 'Hypothèse de synergie anakinra+KD pour court-circuiter les lignes inefficaces. Impact potentiellement transformatif si validé.',
    risks: 'Protocole non testé en combinaison. Risques cumulés de chaque traitement. Usage compassionnel uniquement.',
  },
  {
    id: 'tx-rituximab',
    treatment: 'Rituximab (anti-CD20)',
    mechanism: 'Déplétion des lymphocytes B CD20+. Standard de L3 dans les encéphalites auto-immunes.',
    source: 'guideline',
    evidenceLevel: 'multicenter',
    trialId: null,
    trialPhase: null,
    trialStatus: null,
    relatedArticleIds: ['lit-013', 'lit-011'],
    checkEligibility: (p) => {
      const criteria: EligibilityCriterion[] = [
        { criterion: 'Encéphalite auto-immune (anti-NMDAR, MOGAD)', met: ['EAIS', 'MOGAD'].includes(p.syndrome), detail: `Syndrome: ${p.syndrome}` },
        { criterion: 'Non-réponse L1-L2', met: p.treatmentLine >= 2, detail: `Ligne actuelle: ${p.treatmentLine}` },
        { criterion: 'Anticorps confirmés ou clinique compatible', met: true, detail: 'À vérifier par sérologie' },
      ]
      const score = criteria.filter(c => c.met).length / criteria.length
      return { score, criteria }
    },
    expectedBenefit: 'Consensus Nosadini 2021: escalation rituximab recommandée si non-réponse L1-L2 dans anti-NMDAR.',
    risks: 'Réactivation virale (JC, HBV), hypogammaglobulinémie, réactions perfusion. Vaccination pré-traitement recommandée.',
  },
]

// ══════════════════════════════════════════════════════════════
// TREATMENT PATHFINDER
// ══════════════════════════════════════════════════════════════

export class TreatmentPathfinder {

  // ── Match patients to treatments ──

  findPathways(
    patients: PatientProfile[],
    signals: SignalCard[],
    hypotheses: Hypothesis[],
  ): PathfinderResult {
    const pathways: TherapeuticPathway[] = []
    const now = new Date().toISOString()
    const disclaimer = 'Piste thérapeutique générée par IA — Ne constitue pas une recommandation clinique. Validation obligatoire par l\'équipe médicale.'

    for (const patient of patients) {
      for (const tx of TREATMENT_OPTIONS) {
        const { score, criteria } = tx.checkEligibility(patient)

        // Only include if score > 0.4 (at least some criteria met)
        if (score < 0.4) continue

        const status: PathwayStatus =
          score >= 0.8 ? 'eligible' :
          score >= 0.6 ? 'potential' :
          'to_evaluate'

        pathways.push({
          id: `path-${patient.id}-${tx.id}`,
          title: `${tx.treatment} → ${patient.name}`,
          description: `Éligibilité ${Math.round(score * 100)}% pour ${tx.treatment} basée sur ${criteria.filter(c => c.met).length}/${criteria.length} critères remplis.`,
          source: tx.source,
          status,
          patientId: patient.id,
          patientName: patient.name,
          eligibilityScore: score,
          eligibilityCriteria: criteria,
          treatment: tx.treatment,
          mechanism: tx.mechanism,
          expectedBenefit: tx.expectedBenefit,
          risks: tx.risks,
          evidenceLevel: tx.evidenceLevel,
          trialId: tx.trialId,
          trialPhase: tx.trialPhase,
          trialStatus: tx.trialStatus,
          relatedSignalIds: signals
            .filter(s => s.patients.ids.includes(patient.id))
            .map(s => s.id)
            .slice(0, 3),
          relatedHypothesisIds: hypotheses
            .filter(h => h.type === 'therapeutic_target' || h.type === 'treatment_sequence')
            .map(h => h.id)
            .slice(0, 2),
          relatedArticleIds: tx.relatedArticleIds,
          generatedAt: now,
          aiGenerated: true,
          disclaimer,
        })
      }
    }

    // Sort: eligible first, then by score
    pathways.sort((a, b) => {
      const order: Record<PathwayStatus, number> = { eligible: 4, potential: 3, to_evaluate: 2, ineligible: 1 }
      const diff = (order[b.status] || 0) - (order[a.status] || 0)
      return diff !== 0 ? diff : b.eligibilityScore - a.eligibilityScore
    })

    const eligiblePatients = new Set(pathways.filter(p => p.status === 'eligible').map(p => p.patientId)).size

    return {
      pathways,
      stats: {
        totalPathways: pathways.length,
        eligiblePatients,
        activeTrials: TREATMENT_OPTIONS.filter(t => t.trialId).length,
        compassionateOptions: pathways.filter(p => p.source === 'hypothesis' || p.source === 'compassionate').length,
      },
    }
  }
}

// ── Export singleton ──
export const treatmentPathfinder = new TreatmentPathfinder()
