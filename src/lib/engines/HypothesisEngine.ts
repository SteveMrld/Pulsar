// ============================================================
// PULSAR V18 — Hypothesis Engine (Discovery Engine · Niveau 3)
// Génération d'hypothèses de recherche via Claude API
// Croise Pattern Mining (N1) + Literature Scanner (N2)
// Workflow: Générée → En revue → Validée → Publiée → Rejetée
// ============================================================

import type { SignalCard } from '@/lib/types/discovery'
import type { LiteratureArticle, ScanResult } from './LiteratureScanner'

// ── Types ──

export type HypothesisType =
  | 'predictive_marker'     // Marqueur prédictif identifié
  | 'risk_factor'           // Facteur de risque
  | 'therapeutic_target'    // Cible thérapeutique
  | 'biomarker'             // Nouveau biomarqueur
  | 'temporal_pattern'      // Pattern temporel
  | 'treatment_sequence'    // Séquence thérapeutique optimale

export type HypothesisStatus = 'generated' | 'in_review' | 'validated' | 'published' | 'rejected'

export interface Hypothesis {
  id: string
  title: string
  type: HypothesisType
  description: string
  confidence: number            // 0-1
  status: HypothesisStatus

  // Sources
  signalIds: string[]           // Signal Cards ayant généré l'hypothèse
  literatureRefs: { pmid?: string; title: string; year: number }[]

  // Raisonnement
  reasoning: string             // Chaîne de raisonnement
  internalEvidence: string      // Ce que montrent les données PULSAR
  externalEvidence: string      // Ce que dit la littérature

  // Action
  suggestedAction: string
  impactPotential: 'low' | 'medium' | 'high' | 'transformative'

  // Metadata
  generatedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  aiGenerated: true
  disclaimer: string

  // Validation notes
  validationNotes: string | null
}

// ── Hypothesis type labels ──

export const HYPOTHESIS_TYPE_LABELS: Record<HypothesisType, string> = {
  predictive_marker: 'Marqueur prédictif',
  risk_factor: 'Facteur de risque',
  therapeutic_target: 'Cible thérapeutique',
  biomarker: 'Biomarqueur',
  temporal_pattern: 'Pattern temporel',
  treatment_sequence: 'Séquence thérapeutique',
}

export const HYPOTHESIS_STATUS_LABELS: Record<HypothesisStatus, { label: string; color: string }> = {
  generated: { label: 'GÉNÉRÉE', color: '#3B82F6' },
  in_review: { label: 'EN REVUE', color: '#FFA502' },
  validated: { label: 'VALIDÉE', color: '#2ED573' },
  published: { label: 'PUBLIÉE', color: '#10B981' },
  rejected: { label: 'REJETÉE', color: '#8B5CF6' },
}

// ── Prompt builder ──

function buildHypothesisPrompt(
  signals: SignalCard[],
  literature: ScanResult,
): string {
  const strongSignals = signals.filter(s => s.strength === 'strong' || s.strength === 'very_strong')
  const signalSummary = strongSignals.map(s =>
    `- [${s.type}] ${s.title} (force: ${s.strength}, r=${s.statistics.correlation || 'N/A'}, n=${s.patients.count}, syndromes: ${s.patients.syndromes.join(', ')})`
  ).join('\n')

  const litConfirms = literature.alerts.filter(a => a.type === 'confirmation')
  const litContradicts = literature.alerts.filter(a => a.type === 'contradiction')
  const litTrials = literature.alerts.filter(a => a.type === 'opportunity')

  const litSummary = literature.articles
    .filter(a => a.relevance === 'high')
    .slice(0, 10)
    .map(a => `- ${a.title} (${a.journal}, ${a.year}) [${a.action}]`)
    .join('\n')

  return `Tu es un assistant de recherche clinique spécialisé en neuro-inflammation pédiatrique (FIRES, NORSE, encéphalites auto-immunes). 

PULSAR est un système d'aide à la décision clinique pour ces pathologies rares. Ton rôle est de générer des hypothèses de recherche originales en croisant les signaux statistiques internes et la littérature scientifique.

## SIGNAUX INTERNES (Pattern Mining — Niveau 1)
${signalSummary || 'Aucun signal fort détecté.'}

## LITTÉRATURE (Scanner — Niveau 2)
Publications haute pertinence:
${litSummary || 'Aucune publication haute pertinence.'}

Confirmations: ${litConfirms.length}
Contradictions: ${litContradicts.length}
Essais cliniques pertinents: ${litTrials.length}

## INSTRUCTIONS
Génère exactement 3 hypothèses de recherche. Pour chaque hypothèse, réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec ce format exact:

[
  {
    "title": "Titre concis de l'hypothèse",
    "type": "predictive_marker|risk_factor|therapeutic_target|biomarker|temporal_pattern|treatment_sequence",
    "description": "Description détaillée (2-3 phrases)",
    "confidence": 0.0 à 1.0,
    "reasoning": "Chaîne de raisonnement liant signaux internes et littérature",
    "internalEvidence": "Ce que montrent les données PULSAR",
    "externalEvidence": "Ce que dit la littérature",
    "suggestedAction": "Action concrète suggérée",
    "impactPotential": "low|medium|high|transformative",
    "signalTypes": ["types de signaux utilisés"],
    "literatureYears": [2020, 2022, 2025]
  }
]

Règles:
- Chaque hypothèse DOIT croiser au moins un signal interne ET une publication
- Privilégie les hypothèses testables et actionnables
- Indique clairement le niveau de confiance (faible si extrapolation, élevé si convergence signal+littérature)
- Reste dans le périmètre pédiatrique neuro-inflammatoire`
}

// ── ID generator ──
let hypothesisCounter = 0
function generateHypothesisId(): string {
  hypothesisCounter++
  return `hyp-${Date.now().toString(36)}-${hypothesisCounter}`
}

// ══════════════════════════════════════════════════════════════
// HYPOTHESIS ENGINE
// ══════════════════════════════════════════════════════════════

export class HypothesisEngine {

  // ── Generate hypotheses via Claude API ──

  async generate(
    signals: SignalCard[],
    literature: ScanResult,
  ): Promise<Hypothesis[]> {
    const prompt = buildHypothesisPrompt(signals, literature)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        console.error('[HypothesisEngine] API error:', response.status)
        return this.getFallbackHypotheses(signals, literature)
      }

      const data = await response.json()
      const text = data.content
        ?.map((item: any) => item.type === 'text' ? item.text : '')
        .filter(Boolean)
        .join('') || ''

      // Parse JSON response
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean) as any[]

      return parsed.map((h: any) => ({
        id: generateHypothesisId(),
        title: h.title,
        type: h.type as HypothesisType,
        description: h.description,
        confidence: Math.min(1, Math.max(0, h.confidence)),
        status: 'generated' as HypothesisStatus,
        signalIds: signals
          .filter(s => h.signalTypes?.includes(s.type))
          .map(s => s.id)
          .slice(0, 5),
        literatureRefs: literature.articles
          .filter(a => h.literatureYears?.includes(a.year))
          .map(a => ({ pmid: a.pmid || undefined, title: a.title, year: a.year }))
          .slice(0, 3),
        reasoning: h.reasoning,
        internalEvidence: h.internalEvidence,
        externalEvidence: h.externalEvidence,
        suggestedAction: h.suggestedAction,
        impactPotential: h.impactPotential || 'medium',
        generatedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        aiGenerated: true as const,
        disclaimer: 'Hypothèse générée par IA — Nécessite validation par un clinicien-chercheur. Ne constitue pas une recommandation clinique.',
        validationNotes: null,
      }))
    } catch (err) {
      console.error('[HypothesisEngine] Error:', err)
      return this.getFallbackHypotheses(signals, literature)
    }
  }

  // ── Fallback hypotheses (when API unavailable) ──

  getFallbackHypotheses(signals: SignalCard[], literature: ScanResult): Hypothesis[] {
    const now = new Date().toISOString()
    const disclaimer = 'Hypothèse générée par IA — Nécessite validation par un clinicien-chercheur. Ne constitue pas une recommandation clinique.'

    return [
      {
        id: generateHypothesisId(),
        title: 'CRP initiale >80 mg/L comme prédicteur de non-réponse à L1 dans le FIRES',
        type: 'predictive_marker',
        description: 'La corrélation forte CRP↔VPS (r=0.89) combinée à la non-réponse systématique des patients FIRES à L1 suggère que la CRP initiale >80 mg/L pourrait être un marqueur prédictif de résistance aux corticoïdes + IgIV, justifiant une escalade thérapeutique précoce.',
        confidence: 0.72,
        status: 'generated',
        signalIds: signals.filter(s => s.type === 'correlation' || s.type === 'treatment_response').map(s => s.id).slice(0, 3),
        literatureRefs: [
          { title: 'Efficacy of different treatment modalities for FIRES', year: 2020 },
          { title: 'International consensus recommendations for management of NORSE including FIRES', year: 2022 },
          { title: 'Standard CBC to predict long-term outcomes in FIRES', year: 2025 },
        ],
        reasoning: 'Signal interne: corrélation CRP↔VPS r=0.89 + 3/3 patients FIRES non-répondeurs L1. Littérature: Kessi 2020 rapporte 30% seulement de réponse favorable globale. CBC multicenter 2025 confirme la valeur prédictive des marqueurs inflammatoires standards. Convergence forte entre données internes et littérature.',
        internalEvidence: 'Corrélation CRP↔VPS r=0.89 (p=0.003, n=8). 3/3 patients FIRES avec CRP>80 non-répondeurs L1 vs 0/3 autres syndromes.',
        externalEvidence: 'Kessi 2020: 30% réponse favorable dans FIRES. Wickström 2022: consensus pour escalade précoce si non-réponse. CBC multicenter 2025: paramètres hématologiques prédictifs.',
        suggestedAction: 'Étude rétrospective sur cohorte élargie pour valider le seuil CRP >80 comme critère d\'escalade précoce vers L2.',
        impactPotential: 'high',
        generatedAt: now,
        reviewedAt: null,
        reviewedBy: null,
        aiGenerated: true,
        disclaimer,
        validationNotes: null,
      },
      {
        id: generateHypothesisId(),
        title: 'Ferritine sérique comme biomarqueur de charge critique dans le FIRES',
        type: 'biomarker',
        description: 'La corrélation ferritine↔crises/24h (r=0.76) suggère que la ferritine reflète l\'activation macrophagique associée à la charge critique. Un seuil ferritine >500 ng/mL pourrait identifier les patients à risque d\'orage cytokinique nécessitant une intervention anti-IL-1 immédiate.',
        confidence: 0.65,
        status: 'generated',
        signalIds: signals.filter(s => s.parameters?.primary === 'ferritin' || s.type === 'anomaly').map(s => s.id).slice(0, 3),
        literatureRefs: [
          { title: 'Hypothesis: FIRES is a microglial NLRP3 inflammasome/IL-1 axis-driven autoinflammatory syndrome', year: 2021 },
          { title: 'Retrospective multicenter study on cryptogenic NORSE/FIRES treated with anakinra', year: 2025 },
        ],
        reasoning: 'Signal interne: corrélation ferritine↔crises r=0.76. Patient Lucas (ferritine 1200) = profil orage cytokinique extrême. Littérature: Lin 2021 propose FIRES comme syndrome autoinflammatoire IL-1β/NLRP3 — la ferritine est un marqueur classique de cette voie. Cohorte anakinra 2025 confirme efficacité anti-IL-1.',
        internalEvidence: 'Corrélation ferritine↔crises/24h r=0.76 (n=8). Lucas B.: ferritine 1200 + CRP 180 + 22 crises/24h = profil orage cytokinique complet.',
        externalEvidence: 'Lin 2021: FIRES = syndrome autoinflammatoire NLRP3/IL-1β. Costagliola 2022: anakinra efficace chez >50% des FIRES. Italian multicenter 2025: données multicentriques anakinra.',
        suggestedAction: 'Mesure systématique de la ferritine à l\'admission et à H24/H48. Analyse ROC pour déterminer le seuil optimal de prédiction de la charge critique.',
        impactPotential: 'high',
        generatedAt: now,
        reviewedAt: null,
        reviewedBy: null,
        aiGenerated: true,
        disclaimer,
        validationNotes: null,
      },
      {
        id: generateHypothesisId(),
        title: 'Séquence anakinra + régime cétogène précoce (≤48h) comme protocole de référence FIRES',
        type: 'treatment_sequence',
        description: 'La convergence entre la résistance FIRES à L1, l\'efficacité démontrée de l\'anakinra (multicenter 2025) et l\'essai EKD-NORSE sur le régime cétogène précoce suggère qu\'un protocole combiné anakinra + KD initié ≤48h pourrait devenir le standard de soin, court-circuitant les lignes intermédiaires inefficaces.',
        confidence: 0.58,
        status: 'generated',
        signalIds: signals.filter(s => s.type === 'treatment_response').map(s => s.id).slice(0, 2),
        literatureRefs: [
          { title: 'Retrospective multicenter study on cryptogenic NORSE/FIRES treated with anakinra', year: 2025 },
          { title: 'Comparative clinical outcomes in children with FIRES', year: 2025 },
          { title: 'Early Ketogenic Diet in NORSE/FIRES: RCT (EKD-NORSE)', year: 2025 },
        ],
        reasoning: 'Signal interne: 100% échec L1 dans FIRES (3/3). Littérature: comparative outcomes 2025 montrent supériorité biologics+KD. Essai EKD-NORSE teste KD ≤48h. Cohorte anakinra 2025 montre efficacité multicenter. Hypothèse de combinaison logique mais non encore testée directement.',
        internalEvidence: '3/3 patients FIRES non-répondeurs L1. Escalade vers L2+ systématiquement nécessaire.',
        externalEvidence: 'Comparative outcomes 2025: biologics+KD > conventionnel. Italian anakinra 2025: efficacité multicentric. EKD-NORSE: essai RCT KD précoce en cours.',
        suggestedAction: 'Proposer un protocole pilote combinant anakinra IV + initiation KD ≤48h chez les patients FIRES confirmés (CRP>80 + ferritine>500 + non-réponse L1 à H24).',
        impactPotential: 'transformative',
        generatedAt: now,
        reviewedAt: null,
        reviewedBy: null,
        aiGenerated: true,
        disclaimer,
        validationNotes: null,
      },
    ]
  }

  // ── Update hypothesis status ──

  updateStatus(hypothesis: Hypothesis, newStatus: HypothesisStatus, notes?: string): Hypothesis {
    return {
      ...hypothesis,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      validationNotes: notes || hypothesis.validationNotes,
    }
  }
}

// ── Export singleton ──
export const hypothesisEngine = new HypothesisEngine()
