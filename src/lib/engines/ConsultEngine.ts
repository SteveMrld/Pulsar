// ============================================================
// PULSAR V21 — CONSULT Engine (Expert Brief Generator)
// "En 10 secondes, un dossier prêt pour l'expert"
//
// Agrège PatientState + résultats des 9 moteurs + DDD + Oracle
// Génère un brief clinique structuré avec questions ciblées
//
// Couleur identitaire : #3B82F6 (blue expert)
// ============================================================

import type { PatientState, Alert, Recommendation, Drug, TreatmentRecord } from './PatientState'
import type { DDDResult } from './DiagnosticDelayDetector'

// ── Types ──

export interface ExpertBriefSection {
  title: string
  titleEn: string
  content: string[]
  priority: 'critical' | 'high' | 'standard'
}

export interface ExpertQuestion {
  question: string
  questionEn: string
  context: string
  source: string // Which engine generated this
  urgency: 'immediate' | 'within24h' | 'elective'
}

export interface ConsultBrief {
  // Header
  generatedAt: string
  patientId: string
  patientAge: string
  patientSex: string
  syndrome: string
  hospDay: number
  vpsScore: number
  vpsLevel: string
  overallSeverity: 'critical' | 'severe' | 'moderate' | 'mild'

  // Sections
  clinicalSummary: ExpertBriefSection
  timeline: ExpertBriefSection
  neurological: ExpertBriefSection
  biomarkers: ExpertBriefSection
  treatments: ExpertBriefSection
  pulsarAnalysis: ExpertBriefSection
  delayAlerts: ExpertBriefSection | null
  oracleSummary: ExpertBriefSection | null

  // Auto-generated expert questions
  questions: ExpertQuestion[]

  // Key references from engines
  references: string[]

  // Formatted text for copy/send
  plainText: string
  plainTextEn: string
}

// ── Age formatter ──
function formatAge(ageMonths: number): { fr: string; en: string } {
  if (ageMonths < 1) return { fr: 'Nouveau-né', en: 'Neonate' }
  if (ageMonths < 24) return { fr: `${ageMonths} mois`, en: `${ageMonths} months` }
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  return {
    fr: months > 0 ? `${years} ans ${months} mois` : `${years} ans`,
    en: months > 0 ? `${years}y ${months}m` : `${years}y`,
  }
}

// ── Seizure type label ──
function seizureLabel(type: string): { fr: string; en: string } {
  const map: Record<string, { fr: string; en: string }> = {
    none: { fr: 'Aucune', en: 'None' },
    focal_aware: { fr: 'Focales simples', en: 'Focal aware' },
    focal_impaired: { fr: 'Focales complexes', en: 'Focal impaired awareness' },
    generalized_tonic_clonic: { fr: 'Généralisées tonico-cloniques', en: 'Generalized tonic-clonic' },
    status: { fr: 'État de mal épileptique', en: 'Status epilepticus' },
    refractory_status: { fr: 'SE réfractaire', en: 'Refractory status epilepticus' },
    super_refractory: { fr: 'SE super-réfractaire', en: 'Super-refractory status epilepticus' },
  }
  return map[type] || { fr: type, en: type }
}

// ── Main generator ──

export function generateConsultBrief(ps: PatientState, lang: 'fr' | 'en' = 'fr'): ConsultBrief {
  const age = formatAge(ps.ageMonths)
  const seizure = seizureLabel(ps.neuro.seizureType)
  const vps = ps.vpsResult?.synthesis?.score ?? 0
  const vpsLevel = ps.vpsResult?.synthesis?.level ?? 'unknown'
  const ddd: DDDResult | undefined = (ps as any).dddResult
  const questions: ExpertQuestion[] = []
  const references: string[] = []

  const severity: 'critical' | 'severe' | 'moderate' | 'mild' =
    vps >= 80 ? 'critical' : vps >= 60 ? 'severe' : vps >= 40 ? 'moderate' : 'mild'

  // ═══════ SECTIONS ═══════

  // 1. Clinical Summary
  const clinicalSummary: ExpertBriefSection = {
    title: 'Résumé clinique', titleEn: 'Clinical Summary',
    priority: severity === 'critical' ? 'critical' : 'high',
    content: [
      `Patient ${ps.sex === 'male' ? 'garçon' : 'fille'}, ${age.fr}, J${ps.hospDay} d'hospitalisation.`,
      `Syndrome principal : ${(ps as any).scenarioKey || 'non déterminé'}.`,
      `Score VPS PULSAR : ${vps}/100 (${vpsLevel}).`,
      `GCS : ${ps.neuro.gcs}/15. Pupilles : ${ps.neuro.pupils}.`,
      `Crises : ${ps.neuro.seizures24h}/24h — ${seizure.fr}.`,
      ps.neuro.seizureDuration ? `Durée cumulée des crises : ${ps.neuro.seizureDuration} min.` : '',
    ].filter(Boolean),
  }

  // 2. Timeline
  const timeline: ExpertBriefSection = {
    title: 'Chronologie', titleEn: 'Clinical Timeline',
    priority: 'standard',
    content: [
      `J0 : Admission.`,
      ps.treatmentHistory?.length
        ? `Traitements tentés : ${ps.treatmentHistory.map(t => `${t.treatment} (${t.response})`).join(', ')}.`
        : 'Aucun historique thérapeutique enregistré.',
      `J${ps.hospDay} (actuel) : VPS ${vps}, GCS ${ps.neuro.gcs}, ${ps.neuro.seizures24h} crises/24h.`,
    ],
  }

  // 3. Neurological
  const neurological: ExpertBriefSection = {
    title: 'Examen neurologique', titleEn: 'Neurological Assessment',
    priority: ps.neuro.gcs <= 8 ? 'critical' : 'high',
    content: [
      `GCS : ${ps.neuro.gcs}/15 ${ps.neuro.gcsHistory?.length ? `(évolution : ${ps.neuro.gcsHistory.join(' → ')})` : ''}.`,
      `Pupilles : ${ps.neuro.pupils}.`,
      `Type de crises : ${seizure.fr}.`,
      `Fréquence : ${ps.neuro.seizures24h} crises/24h.`,
      ps.neuro.seizureDuration ? `Durée cumulée : ${ps.neuro.seizureDuration} min.` : '',
      (ps as any).eeg?.pattern ? `EEG : ${(ps as any).eeg.pattern}.` : '',
      (ps as any).mri?.findings ? `IRM : ${(ps as any).mri.findings}.` : '',
    ].filter(Boolean),
  }

  // 4. Biomarkers
  const biomarkers: ExpertBriefSection = {
    title: 'Biomarqueurs clés', titleEn: 'Key Biomarkers',
    priority: ps.biology.crp > 100 || ps.biology.ferritin > 1000 ? 'critical' : 'standard',
    content: [
      `CRP : ${ps.biology.crp} mg/L ${ps.biology.crp > 50 ? '⚠️ ÉLEVÉE' : ''}.`,
      `Ferritine : ${ps.biology.ferritin} ng/mL ${ps.biology.ferritin > 500 ? '⚠️ ÉLEVÉE' : ''}.`,
      `GB : ${ps.biology.wbc}/mm³. Plaquettes : ${ps.biology.platelets}/mm³.`,
      `Lactate : ${ps.biology.lactate} mmol/L ${ps.biology.lactate > 4 ? '⚠️ ÉLEVÉ' : ''}.`,
      `PCT : ${ps.biology.pct} ng/mL.`,
      `LCR — Cellules : ${ps.csf.cells}/mm³, Protéines : ${ps.csf.protein} g/L, Anticorps : ${ps.csf.antibodies}.`,
    ],
  }

  // Cytokines if available
  if (ps.cytokines) {
    const cytoLines: string[] = []
    if (ps.cytokines.il1b) cytoLines.push(`IL-1β : ${ps.cytokines.il1b} pg/mL`)
    if (ps.cytokines.il6) cytoLines.push(`IL-6 : ${ps.cytokines.il6} pg/mL`)
    if (ps.cytokines.il1ra) cytoLines.push(`IL-1Ra : ${ps.cytokines.il1ra} pg/mL`)
    if (ps.cytokines.tnfa) cytoLines.push(`TNF-α : ${ps.cytokines.tnfa} pg/mL`)
    if (cytoLines.length) biomarkers.content.push(`Cytokines : ${cytoLines.join(', ')}.`)
  }

  // 5. Treatments
  const treatments: ExpertBriefSection = {
    title: 'Traitements en cours', titleEn: 'Current Treatments',
    priority: 'standard',
    content: ps.drugs?.length
      ? ps.drugs.map(d => `${d.name}${d.dose ? ` — ${d.dose}` : ''}${d.route ? ` (${d.route})` : ''}.`)
      : ['Aucun traitement enregistré.'],
  }

  // 6. PULSAR Analysis
  const pulsarAnalysis: ExpertBriefSection = {
    title: 'Analyse PULSAR (9 moteurs)', titleEn: 'PULSAR Analysis (9 engines)',
    priority: 'high',
    content: [],
  }

  // VPS
  pulsarAnalysis.content.push(`VPS Engine : Score ${vps}/100 — ${vpsLevel}.`)

  // Alerts summary
  const critAlerts = ps.alerts?.filter(a => a.severity === 'critical') || []
  const warnAlerts = ps.alerts?.filter(a => a.severity === 'warning') || []
  pulsarAnalysis.content.push(`Alertes : ${critAlerts.length} critiques, ${warnAlerts.length} warnings.`)

  // Top critical alerts
  for (const a of critAlerts.slice(0, 3)) {
    pulsarAnalysis.content.push(`🚨 ${a.title} — ${a.body}`)
  }

  // Top recommendations
  const recs = ps.recommendations?.slice(0, 3) || []
  if (recs.length) {
    pulsarAnalysis.content.push('Recommandations prioritaires :')
    for (const r of recs) {
      pulsarAnalysis.content.push(`→ [${r.priority}] ${r.title}`)
      if (r.reference) references.push(r.reference)
    }
  }

  // 7. Delay Alerts (if DDD detected delays)
  let delayAlerts: ExpertBriefSection | null = null
  if (ddd?.delayDetected) {
    delayAlerts = {
      title: '⚠️ ALERTE RETARD DIAGNOSTIQUE', titleEn: '⚠️ DIAGNOSTIC DELAY ALERT',
      priority: 'critical',
      content: [
        `${ddd.patterns.length} retard(s) détecté(s). Heures perdues estimées : ${ddd.estimatedHoursLost}h.`,
        ...ddd.patterns.map(p => `• ${p.name} — ${p.currentDelay} (fenêtre optimale : ${p.optimalWindow})`),
      ],
    }
    // DDD references
    for (const p of ddd.patterns) {
      references.push(...p.evidence)
    }
  }

  // 8. Oracle summary (if available)
  let oracleSummary: ExpertBriefSection | null = null
  const oracleResult = (ps as any).oracleResult
  if (oracleResult) {
    oracleSummary = {
      title: 'Simulation Oracle (projection 72h)', titleEn: 'Oracle Simulation (72h projection)',
      priority: 'high',
      content: [
        `Scénario recommandé : ${oracleResult.recommendation?.bestScenarioId || 'N/A'}.`,
        oracleResult.recommendation?.reasoning || '',
      ],
    }
  }

  // ═══════ AUTO-GENERATED QUESTIONS ═══════

  // From DDD
  if (ddd?.delayDetected) {
    for (const pattern of ddd.patterns.filter(p => p.severity === 'critical')) {
      if (pattern.id.includes('immuno')) {
        questions.push({
          question: 'Faut-il initier une immunothérapie en urgence malgré l\'absence de confirmation anticorps ?',
          questionEn: 'Should immunotherapy be initiated urgently despite absence of antibody confirmation?',
          context: `${pattern.hoursLost}h de retard sur l'initiation immunothérapie. ${pattern.evidence[0] || ''}`,
          source: 'Diagnostic Delay Detector',
          urgency: 'immediate',
        })
      }
      if (pattern.id.includes('anakinra')) {
        questions.push({
          question: 'Le profil clinique justifie-t-il l\'introduction d\'Anakinra (anti-IL-1) dans un contexte de FIRES suspecté ?',
          questionEn: 'Does the clinical profile justify Anakinra (anti-IL-1) introduction in suspected FIRES?',
          context: `Ferritine ${ps.biology.ferritin} ng/mL, SE ${ps.neuro.seizureType}, J${ps.hospDay}.`,
          source: 'Diagnostic Delay Detector',
          urgency: 'immediate',
        })
      }
    }
  }

  // From VPS
  if (vps >= 80) {
    questions.push({
      question: 'VPS critique (≥80) — le patient nécessite-t-il un transfert en centre de référence neurologique ?',
      questionEn: 'Critical VPS (≥80) — does the patient require transfer to a neurological reference center?',
      context: `VPS ${vps}, GCS ${ps.neuro.gcs}, ${ps.neuro.seizures24h} crises/24h.`,
      source: 'VPS Engine',
      urgency: 'immediate',
    })
  }

  // From seizure type
  if (ps.neuro.seizureType === 'super_refractory') {
    questions.push({
      question: 'État de mal super-réfractaire — faut-il envisager la kétamine IV ou le coma barbiturique ?',
      questionEn: 'Super-refractory SE — should IV ketamine or barbiturate coma be considered?',
      context: `SE super-réfractaire depuis J${ps.hospDay}. Traitements actuels : ${ps.drugs?.map(d => d.name).join(', ') || 'aucun'}.`,
      source: 'TDE Engine',
      urgency: 'immediate',
    })
  }
  if (ps.neuro.seizureType === 'refractory_status' && ps.hospDay >= 3) {
    questions.push({
      question: 'Ce pattern EEG et cette résistance aux AE évoquent-ils une encéphalite auto-immune (NORSE/FIRES) ?',
      questionEn: 'Does this EEG pattern and AED resistance suggest autoimmune encephalitis (NORSE/FIRES)?',
      context: `SE réfractaire J${ps.hospDay}. LCR : ${ps.csf.cells} cellules, ${ps.csf.protein} g/L protéines.`,
      source: 'Differential Diagnosis Engine',
      urgency: 'within24h',
    })
  }

  // From antibody status
  if (ps.csf.antibodies === 'pending') {
    questions.push({
      question: 'Anticorps en attente — faut-il traiter empiriquement par immunothérapie avant les résultats ?',
      questionEn: 'Antibodies pending — should empirical immunotherapy be initiated before results?',
      context: `Anticorps envoyés mais résultats en attente. LCR inflammatoire : ${ps.csf.cells} cellules.`,
      source: 'Pharmacovigilance Engine',
      urgency: 'within24h',
    })
  }

  // From biology
  if (ps.biology.ferritin > 1000 && ps.biology.crp > 100) {
    questions.push({
      question: 'Hyperferritinémie + CRP élevée — faut-il évoquer un syndrome d\'activation macrophagique (SAM) associé ?',
      questionEn: 'Hyperferritinemia + high CRP — should macrophage activation syndrome (MAS) be considered?',
      context: `Ferritine ${ps.biology.ferritin} ng/mL, CRP ${ps.biology.crp} mg/L.`,
      source: 'Early Warning Engine',
      urgency: 'within24h',
    })
  }

  // Cytokine-driven question
  if (ps.cytokines?.il1b && ps.cytokines.il1b > 50) {
    questions.push({
      question: 'IL-1β très élevée — profil compatible avec FIRES. Anakinra en urgence ?',
      questionEn: 'Very high IL-1β — profile compatible with FIRES. Emergency Anakinra?',
      context: `IL-1β : ${ps.cytokines.il1b} pg/mL (norme < 5). Réf : Kenney-Jung 2016, Dilena 2019.`,
      source: 'Discovery Engine',
      urgency: 'immediate',
    })
  }

  // Generic expert consultation question
  if (ps.hospDay >= 5 && vps >= 60) {
    questions.push({
      question: 'J5+ avec VPS ≥ 60 — votre expertise sur la stratégie thérapeutique optimale pour ce patient est sollicitée.',
      questionEn: 'Day 5+ with VPS ≥ 60 — your expertise on the optimal therapeutic strategy for this patient is requested.',
      context: `Hospitalisation prolongée, sévérité persistante. Réponse insuffisante aux traitements actuels.`,
      source: 'PULSAR Consult',
      urgency: 'within24h',
    })
  }

  // ═══════ PLAIN TEXT ═══════

  const allSections = [
    clinicalSummary, timeline, neurological, biomarkers, treatments, pulsarAnalysis,
    ...(delayAlerts ? [delayAlerts] : []),
    ...(oracleSummary ? [oracleSummary] : []),
  ]

  const plainLines: string[] = [
    '══════════════════════════════════════════════════════',
    '  PULSAR CONSULT — Brief Expert',
    `  Généré le ${new Date().toLocaleString('fr-FR')}`,
    '══════════════════════════════════════════════════════',
    '',
  ]

  for (const sec of allSections) {
    plainLines.push(`── ${sec.title} ──`)
    for (const line of sec.content) plainLines.push(`  ${line}`)
    plainLines.push('')
  }

  if (questions.length) {
    plainLines.push('── QUESTIONS POUR L\'EXPERT ──')
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      plainLines.push(`  ${i + 1}. [${q.urgency.toUpperCase()}] ${q.question}`)
      plainLines.push(`     Contexte : ${q.context}`)
      plainLines.push(`     Source : ${q.source}`)
      plainLines.push('')
    }
  }

  if (references.length) {
    plainLines.push('── RÉFÉRENCES ──')
    const unique = [...new Set(references)]
    for (const ref of unique.slice(0, 10)) plainLines.push(`  • ${ref}`)
  }

  plainLines.push('')
  plainLines.push('──────────────────────────────────────────────────────')
  plainLines.push('  Généré par PULSAR V21 — Clinical Foresight Platform')
  plainLines.push('  In memory of Alejandro R. (2019 – 2025)')

  // English version
  const plainLinesEn: string[] = [
    '══════════════════════════════════════════════════════',
    '  PULSAR CONSULT — Expert Brief',
    `  Generated ${new Date().toISOString()}`,
    '══════════════════════════════════════════════════════',
    '',
  ]
  for (const sec of allSections) {
    plainLinesEn.push(`── ${sec.titleEn} ──`)
    for (const line of sec.content) plainLinesEn.push(`  ${line}`)
    plainLinesEn.push('')
  }
  if (questions.length) {
    plainLinesEn.push('── QUESTIONS FOR THE EXPERT ──')
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      plainLinesEn.push(`  ${i + 1}. [${q.urgency.toUpperCase()}] ${q.questionEn}`)
      plainLinesEn.push(`     Context: ${q.context}`)
      plainLinesEn.push(`     Source: ${q.source}`)
      plainLinesEn.push('')
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    patientId: (ps as any).id || 'unknown',
    patientAge: age.fr,
    patientSex: ps.sex,
    syndrome: (ps as any).scenarioKey || 'unknown',
    hospDay: ps.hospDay,
    vpsScore: vps,
    vpsLevel,
    overallSeverity: severity,
    clinicalSummary,
    timeline,
    neurological,
    biomarkers,
    treatments,
    pulsarAnalysis,
    delayAlerts,
    oracleSummary,
    questions,
    references: [...new Set(references)],
    plainText: plainLines.join('\n'),
    plainTextEn: plainLinesEn.join('\n'),
  }
}
