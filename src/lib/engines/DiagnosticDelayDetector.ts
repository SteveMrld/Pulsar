// ============================================================
// PULSAR V21 — Diagnostic Delay Detector (DDD)
// "Le garde-fou contre l'inertie clinique"
//
// Le vrai problème dans FIRES/NORSE/encéphalites auto-immunes :
// le retard de diagnostic.
//
// Ce moteur détecte les patterns de retard diagnostique et alerte
// le médecin AVANT qu'il ne soit trop tard.
//
// 24h peuvent changer le pronostic neurologique.
//
// Couleur identitaire : #DC2626 (urgence absolue)
// ============================================================

import type { PatientState, Drug, TreatmentRecord, Alert } from './PatientState'

// ── Types ──

export interface DelayPattern {
  id: string
  name: string
  description: string
  severity: 'critical' | 'warning'
  hoursLost: number
  optimalWindow: string
  currentDelay: string
  evidence: string[]
  recommendation: string
}

export interface CarePathDeviation {
  expected: string
  actual: string
  deviationHours: number
  impact: string
}

export interface DDDAlert {
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  hoursLost: number
  actionRequired: string
  references: string[]
  timestamp: string
}

export interface DDDResult {
  delayDetected: boolean
  overallRisk: 'critical' | 'high' | 'moderate' | 'low'
  estimatedHoursLost: number
  patterns: DelayPattern[]
  deviations: CarePathDeviation[]
  alerts: DDDAlert[]
  optimalCareComparison: {
    optimalPath: string[]
    actualPath: string[]
    missingSteps: string[]
    delayedSteps: string[]
  }
  message: string
}

// ── Optimal care timelines (evidence-based) ──

interface CareWindowRule {
  id: string
  condition: (ps: PatientState) => boolean
  optimalHours: number
  action: string
  category: string
  references: string[]
}

const CARE_WINDOW_RULES: CareWindowRule[] = [
  // ── Immunotherapy initiation ──
  {
    id: 'immuno-48h',
    condition: (ps) => {
      const autoImmuneSignals = countAutoImmuneSignals(ps)
      return autoImmuneSignals >= 3 && ps.hospDay >= 2
    },
    optimalHours: 48,
    action: 'Initiation immunothérapie de 1ère ligne (IVIG ou corticothérapie IV)',
    category: 'immunotherapy',
    references: [
      'Gaspard et al. Neurology 2015: "Early immunotherapy improves outcome in autoimmune encephalitis"',
      'Titulaer et al. Lancet Neurol 2013: "Delay >48h associated with worse cognitive outcome"',
    ],
  },
  // ── CSF analysis ──
  {
    id: 'csf-24h',
    condition: (ps) => {
      return ps.neuro.seizureType === 'status' || ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory'
    },
    optimalHours: 24,
    action: 'Ponction lombaire avec analyse complète (cellularité, protéines, anticorps, cytokines)',
    category: 'diagnostic',
    references: [
      'NORSE Institute Guidelines 2024: "LP should be performed within 24h of SE onset"',
    ],
  },
  // ── Antibody panel ──
  {
    id: 'antibody-48h',
    condition: (ps) => {
      const inflammatoryCSF = ps.csf.cells > 5 || ps.csf.protein > 0.45
      const refractorySeizures = ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory'
      return inflammatoryCSF || (refractorySeizures && ps.hospDay >= 2)
    },
    optimalHours: 48,
    action: 'Panel anticorps complet (sérum + LCR) : NMDAR, MOG, LGI1, CASPR2, GABA-B/A, GAD65',
    category: 'diagnostic',
    references: [
      'Graus et al. Lancet Neurol 2016: "Comprehensive antibody testing within 48h"',
    ],
  },
  // ── EEG continuous monitoring ──
  {
    id: 'eeg-12h',
    condition: (ps) => {
      return ps.neuro.gcs <= 10 && ps.neuro.seizures24h >= 3
    },
    optimalHours: 12,
    action: 'EEG continu (minimum 24h) pour détection NCSE et classification pattern',
    category: 'monitoring',
    references: [
      'Claassen et al. Neurology 2004: "cEEG within 12h for patients with altered consciousness and seizures"',
    ],
  },
  // ── MRI ──
  {
    id: 'mri-48h',
    condition: (ps) => {
      return ps.neuro.seizureType !== 'none' && ps.neuro.gcs <= 12
    },
    optimalHours: 48,
    action: 'IRM cérébrale avec séquences FLAIR, DWI, gadolinium',
    category: 'diagnostic',
    references: [
      'ILAE Guidelines 2023: "MRI within 48h for new-onset refractory status epilepticus"',
    ],
  },
  // ── Anakinra/IL-1 blockade for FIRES ──
  {
    id: 'anakinra-72h',
    condition: (ps) => {
      const firesSuspect = ps.neuro.seizureType === 'super_refractory' &&
        ps.biology.ferritin > 500 &&
        ps.hospDay >= 3
      const il1bElevated = ps.cytokines?.il1b && ps.cytokines.il1b > 10
      return firesSuspect || (il1bElevated === true && ps.hospDay >= 3)
    },
    optimalHours: 72,
    action: 'Anakinra (anti-IL-1) — traitement ciblé FIRES/NORSE. Initiation recommandée < 72h.',
    category: 'targeted_therapy',
    references: [
      'Kenney-Jung et al. Ann Neurol 2016: "Anakinra for FIRES: early initiation associated with seizure freedom"',
      'Dilena et al. Epilepsia 2019: "IL-1 receptor antagonist in FIRES: best outcomes when started < 72h"',
    ],
  },
  // ── 2nd line immunotherapy if 1st fails ──
  {
    id: 'immuno-2nd-line',
    condition: (ps) => {
      const firstLineGiven = hasTreatmentCategory(ps, ['IVIG', 'methylprednisolone', 'corticoid'])
      const noImprovement = ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory'
      return firstLineGiven && noImprovement && ps.hospDay >= 5
    },
    optimalHours: 120, // 5 days
    action: 'Immunothérapie 2ème ligne (Rituximab ou Plasmaphérèse) si pas de réponse à J5',
    category: 'immunotherapy',
    references: [
      'Titulaer et al. Lancet Neurol 2013: "2nd line immunotherapy if no improvement within 2 weeks, earlier if worsening"',
    ],
  },
  // ── Ketogenic diet for refractory SE ──
  {
    id: 'ketogenic-7d',
    condition: (ps) => {
      const superRefractory = ps.neuro.seizureType === 'super_refractory'
      return superRefractory && ps.hospDay >= 7
    },
    optimalHours: 168, // 7 days
    action: 'Régime cétogène (ratio 4:1) — efficace dans 50-70% des SE super-réfractaires',
    category: 'targeted_therapy',
    references: [
      'Nabbout et al. Epilepsia 2010: "Ketogenic diet in FIRES: seizure freedom in 7/9 patients"',
    ],
  },
]

// ── Helper functions ──

function countAutoImmuneSignals(ps: PatientState): number {
  let signals = 0

  // Inflammatory CSF
  if (ps.csf.cells > 5) signals++
  if (ps.csf.protein > 0.45) signals++

  // Refractory seizures (not responding to standard AEDs)
  if (ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') signals++

  // High inflammation
  if (ps.biology.crp > 50) signals++
  if (ps.biology.ferritin > 500) signals++

  // Elevated cytokines
  if (ps.cytokines?.il1b && ps.cytokines.il1b > 10) signals++
  if (ps.cytokines?.il6 && ps.cytokines.il6 > 20) signals++

  // Positive or pending antibodies
  if (ps.csf.antibodies !== 'negative' && ps.csf.antibodies !== 'pending') signals++

  // Recent febrile illness + seizures (FIRES pattern)
  if (ps.neuro.seizures24h >= 5 && ps.biology.crp > 10) signals++

  // GCS deterioration
  if (ps.neuro.gcs <= 8) signals++

  return signals
}

function hasTreatmentCategory(ps: PatientState, keywords: string[]): boolean {
  const allDrugs = [
    ...(ps.drugs || []).map(d => d.name.toLowerCase()),
    ...(ps.treatmentHistory || []).map(t => t.treatment.toLowerCase()),
  ]
  return keywords.some(kw => allDrugs.some(d => d.includes(kw.toLowerCase())))
}

function hasImmunoTherapy(ps: PatientState): boolean {
  return hasTreatmentCategory(ps, [
    'IVIG', 'immunoglobulin', 'plasmapheresis', 'plasmaphérèse',
    'rituximab', 'tocilizumab', 'anakinra', 'methylprednisolone',
    'corticoid', 'prednisolone', 'dexamethasone',
  ])
}

function hasAntibodyPanel(ps: PatientState): boolean {
  return ps.csf.antibodies !== 'pending' && ps.csf.antibodies !== 'negative'
  // In real implementation, this would check if antibody panel was ordered
}

// ── Main DDD Engine ──

export function runDDD(ps: PatientState): DDDResult {
  const patterns: DelayPattern[] = []
  const deviations: CarePathDeviation[] = []
  const alerts: DDDAlert[] = []
  let totalHoursLost = 0
  const currentHours = (ps.hospDay || 1) * 24

  // ── Check each care window rule ──
  for (const rule of CARE_WINDOW_RULES) {
    if (!rule.condition(ps)) continue

    // Check if the action has been taken
    let actionTaken = false

    switch (rule.category) {
      case 'immunotherapy':
        actionTaken = hasImmunoTherapy(ps)
        break
      case 'diagnostic':
        if (rule.id === 'csf-24h') {
          actionTaken = ps.csf.cells > 0 || ps.csf.protein > 0 // CSF was analyzed
        } else if (rule.id === 'antibody-48h') {
          actionTaken = hasAntibodyPanel(ps)
        } else if (rule.id === 'mri-48h') {
          actionTaken = ps.mogad?.demyelinatingLesions !== undefined // MRI was done
        }
        break
      case 'monitoring':
        actionTaken = ps.neuro.seizureType !== 'none' // Assumed if seizure type is classified
        break
      case 'targeted_therapy':
        if (rule.id === 'anakinra-72h') {
          actionTaken = hasTreatmentCategory(ps, ['anakinra', 'kineret'])
        } else if (rule.id === 'ketogenic-7d') {
          actionTaken = hasTreatmentCategory(ps, ['ketogenic', 'cétogène', 'ketogen'])
        }
        break
    }

    if (!actionTaken && currentHours > rule.optimalHours) {
      const hoursLost = currentHours - rule.optimalHours
      totalHoursLost = Math.max(totalHoursLost, hoursLost)

      patterns.push({
        id: rule.id,
        name: rule.action,
        description: `Action recommandée dans les ${rule.optimalHours}h. Délai actuel : ${currentHours}h.`,
        severity: hoursLost > 48 ? 'critical' : 'warning',
        hoursLost,
        optimalWindow: `< ${rule.optimalHours}h`,
        currentDelay: `${currentHours}h (+ ${hoursLost}h de retard)`,
        evidence: rule.references,
        recommendation: rule.action,
      })

      deviations.push({
        expected: `${rule.action} avant H${rule.optimalHours}`,
        actual: `Non initié à H${currentHours}`,
        deviationHours: hoursLost,
        impact: hoursLost > 48
          ? 'Risque significatif de séquelles neurologiques permanentes'
          : 'Fenêtre thérapeutique optimale dépassée',
      })

      alerts.push({
        severity: hoursLost > 48 ? 'critical' : 'warning',
        title: hoursLost > 48
          ? '🚨 RETARD DIAGNOSTIQUE CRITIQUE'
          : '⚠️ Fenêtre thérapeutique en cours de fermeture',
        message: buildAlertMessage(rule, hoursLost, currentHours, ps),
        hoursLost,
        actionRequired: rule.action,
        references: rule.references,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // ── Pattern spécifique FIRES non diagnostiqué ──
  const firesSuspectScore = countAutoImmuneSignals(ps)
  if (firesSuspectScore >= 4 && !hasImmunoTherapy(ps) && ps.hospDay >= 3) {
    const hoursLost = currentHours - 48
    if (!patterns.find(p => p.id === 'fires-undiagnosed')) {
      patterns.push({
        id: 'fires-undiagnosed',
        name: 'Suspicion FIRES/NORSE non explorée',
        description: `${firesSuspectScore} signaux compatibles avec une encéphalite auto-immune/FIRES. `
          + `Aucune immunothérapie initiée à J${ps.hospDay}.`,
        severity: 'critical',
        hoursLost,
        optimalWindow: '< 48h après suspicion',
        currentDelay: `${currentHours}h depuis admission`,
        evidence: [
          'Gaspard et al. 2015: "64% des cas similaires reçoivent immunothérapie < 48h"',
          'Bien et al. 2012: "Chaque jour de retard réduit les chances de récupération complète"',
        ],
        recommendation: 'URGENT : Panel anticorps complet + Initiation IVIG/Corticothérapie IV immédiate',
      })

      alerts.unshift({
        severity: 'critical',
        title: '🚨 RETARD DIAGNOSTIQUE — SUSPICION ENCÉPHALITE AUTO-IMMUNE',
        message: `Le profil clinique présente ${firesSuspectScore} signaux compatibles avec une encéphalite auto-immune ou FIRES. `
          + `Dans 64% des cas similaires dans la littérature, une immunothérapie est initiée avant 48h. `
          + `Le délai actuel (J${ps.hospDay}) dépasse significativement la fenêtre optimale. `
          + `Chaque heure de retard augmente le risque de séquelles neurologiques permanentes.`,
        hoursLost,
        actionRequired: 'Panel anticorps URGENT + Initiation immunothérapie 1ère ligne IMMÉDIATE',
        references: [
          'Gaspard et al. Neurology 2015',
          'Titulaer et al. Lancet Neurol 2013',
          'Bien et al. Lancet Neurol 2012',
        ],
        timestamp: new Date().toISOString(),
      })
    }
  }

  // ── Build optimal care path comparison ──
  const optimalPath = [
    'H0: Admission, constantes, biologie urgente',
    'H2: Antiépileptiques 1ère ligne',
    'H6-12: EEG continu si GCS ≤ 10',
    'H12-24: Ponction lombaire si crises persistantes',
    'H24-48: Panel anticorps si LCR inflammatoire',
    'H24-48: IRM cérébrale',
    'H48: Immunothérapie 1ère ligne si ≥ 3 signaux auto-immuns',
    'H72: Anakinra si suspicion FIRES',
    'J5: 2ème ligne immunothérapie si pas de réponse',
    'J7: Régime cétogène si SE super-réfractaire',
  ]

  const actualPath: string[] = []
  actualPath.push(`H0: Admission J${ps.hospDay}`)
  if (ps.drugs?.length) {
    actualPath.push(`Traitements : ${ps.drugs.map(d => d.name).join(', ')}`)
  }
  if (ps.csf.cells > 0 || ps.csf.protein > 0) actualPath.push('PL réalisée')
  if (hasImmunoTherapy(ps)) actualPath.push('Immunothérapie initiée')

  const missingSteps = patterns.map(p => p.recommendation)
  const delayedSteps = patterns.filter(p => p.hoursLost > 0).map(p => `${p.name} (+${p.hoursLost}h retard)`)

  // ── Overall risk ──
  const criticalCount = patterns.filter(p => p.severity === 'critical').length
  const overallRisk = criticalCount >= 2 ? 'critical'
    : criticalCount >= 1 ? 'high'
    : patterns.length >= 2 ? 'moderate'
    : 'low'

  // ── Final message ──
  let message = ''
  if (overallRisk === 'critical') {
    message = `⚠️ ALERTE RETARD DIAGNOSTIQUE : ${patterns.length} actions critiques en retard. `
      + `Estimation ${totalHoursLost}h perdues par rapport au parcours de soins optimal. `
      + `Le profil est compatible avec une urgence neurologique auto-immune nécessitant une intervention immédiate.`
  } else if (overallRisk === 'high') {
    message = `Retard potentiel détecté : ${patterns.length} action(s) recommandée(s) non initiée(s). `
      + `La fenêtre thérapeutique optimale est en cours de fermeture.`
  } else if (overallRisk === 'moderate') {
    message = `Quelques actions pourraient être anticipées pour optimiser la prise en charge.`
  } else {
    message = `Parcours de soins conforme aux recommandations actuelles.`
  }

  return {
    delayDetected: patterns.length > 0,
    overallRisk,
    estimatedHoursLost: totalHoursLost,
    patterns,
    deviations,
    alerts,
    optimalCareComparison: { optimalPath, actualPath, missingSteps, delayedSteps },
    message,
  }
}

function buildAlertMessage(rule: CareWindowRule, hoursLost: number, currentHours: number, ps: PatientState): string {
  const base = `${rule.action} — recommandé dans les ${rule.optimalHours}h. `
    + `Délai actuel : ${currentHours}h (+${hoursLost}h de retard). `

  if (rule.category === 'immunotherapy') {
    return base + `Dans la littérature, un retard d'immunothérapie > ${rule.optimalHours}h `
      + `est associé à un pronostic neurologique significativement plus défavorable.`
  }

  if (rule.category === 'targeted_therapy') {
    return base + `Les données disponibles montrent une efficacité maximale lorsque ce traitement `
      + `est initié dans la fenêtre optimale.`
  }

  return base + `Action recommandée par les guidelines internationales.`
}
