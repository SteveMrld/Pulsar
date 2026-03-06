// ============================================================
// PULSAR V21 — CASCADE ALERT ENGINE (CAE)
// "Détecter l'effet en chaîne AVANT qu'il ne se produise"
//
// Le PVE vérifie les interactions médicament ↔ médicament.
// Le CAE vérifie : intervention planifiée × vulnérabilité patient
//                  × littérature médicale = ALERTE PRÉ-INTERVENTION
//
// Né du cas Alejandro : MEOPA administré à un enfant en prodrome
// FIRES → arrêt respiratoire → convulsions → status epilepticus.
// Si le CAE avait existé, il aurait dit :
//   "⚠️ Ce patient présente un profil fébrile compatible avec un
//    prodrome FIRES. Le MEOPA (N2O) abaisse le seuil convulsif.
//    Cas de convulsions pédiatriques documentés (Zier 2010)."
//
// Couleur identitaire : #FF6B35 (orange vif — pré-alerte)
// ============================================================

import type { PatientState, Alert, Drug } from './PatientState'
import { getDrugSafetyProfile, analyzeSafetyForPatient, type PatientContext } from './DrugDatabase'

// ── Types ──

export interface VulnerabilityProfile {
  id: string
  name: string
  detected: boolean
  confidence: number  // 0-100
  signals: string[]
}

export interface InterventionRisk {
  intervention: string
  riskLevel: 'critical' | 'high' | 'moderate' | 'low'
  mechanism: string
  cascadeChain: string[]  // step by step chain reaction
  references: string[]
  recommendation: string
}

export interface CascadeAlert {
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  intervention: string
  vulnerability: string
  cascadeChain: string[]
  mechanism: string
  references: string[]
  alternativeSuggestion: string
  timestamp: string
}

export interface CAEResult {
  vulnerabilities: VulnerabilityProfile[]
  risks: InterventionRisk[]
  alerts: CascadeAlert[]
  highestRisk: 'critical' | 'high' | 'moderate' | 'low' | 'none'
  message: string
}

// ── Vulnerability detection ──

function detectVulnerabilities(ps: PatientState): VulnerabilityProfile[] {
  const vulns: VulnerabilityProfile[] = []

  // 1. FIRES prodrome
  const firesSignals: string[] = []
  if (ps.hemodynamics.temp >= 38) firesSignals.push('Fièvre active')
  if (ps.hemodynamics.temp >= 39) firesSignals.push('Hyperthermie > 39°C')
  if (ps.biology.crp > 10) firesSignals.push(`CRP élevée (${ps.biology.crp})`)
  if (ps.neuro.seizures24h > 0) firesSignals.push(`${ps.neuro.seizures24h} crises/24h`)
  if (ps.neuro.seizureType !== 'none') firesSignals.push(`Crises: ${ps.neuro.seizureType}`)
  if (ps.neuro.gcs < 15) firesSignals.push(`GCS altéré: ${ps.neuro.gcs}`)
  if (ps.csf.cells > 5) firesSignals.push(`Pléiocytose LCR: ${ps.csf.cells}`)
  // Age range compatible
  if (ps.ageMonths >= 36 && ps.ageMonths <= 180) firesSignals.push('Âge compatible FIRES (3-15 ans)')

  if (firesSignals.length >= 2) {
    vulns.push({
      id: 'fires-prodrome',
      name: 'Prodrome FIRES / encéphalite',
      detected: true,
      confidence: Math.min(95, firesSignals.length * 15),
      signals: firesSignals,
    })
  }

  // 2. Seuil convulsif abaissé
  const seizureSignals: string[] = []
  if (ps.neuro.seizures24h > 0) seizureSignals.push('Crises actives')
  if (ps.neuro.seizureType === 'status' || ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') {
    seizureSignals.push('Status epilepticus')
  }
  if (ps.neuro.gcs <= 10) seizureSignals.push('Altération conscience')
  if (ps.hemodynamics.temp >= 38.5) seizureSignals.push('Fièvre (abaisse seuil)')
  if (ps.biology.lactate > 3) seizureSignals.push('Acidose lactique')
  // Check for AE drugs already given (sign of seizure history)
  const aeKeywords = ['levetiracetam', 'keppra', 'phenytoin', 'dilantin', 'phenobarbital', 'gardenal', 'valproate', 'depakine', 'clonazepam', 'rivotril', 'midazolam']
  const hasAE = ps.drugs?.some(d => aeKeywords.some(k => d.name.toLowerCase().includes(k)))
  if (hasAE) seizureSignals.push('Antiépileptiques déjà prescrits')

  if (seizureSignals.length >= 2) {
    vulns.push({
      id: 'seizure-threshold',
      name: 'Seuil convulsif abaissé',
      detected: true,
      confidence: Math.min(90, seizureSignals.length * 18),
      signals: seizureSignals,
    })
  }

  // 3. Fragilité cardiaque
  const cardiacSignals: string[] = []
  if (ps.hemodynamics.heartRate > 150 || ps.hemodynamics.heartRate < 50) cardiacSignals.push(`FC anormale: ${ps.hemodynamics.heartRate}`)
  if (ps.hemodynamics.map < 50) cardiacSignals.push(`PAM basse: ${ps.hemodynamics.map}`)
  if (ps.hemodynamics.sbp < 70) cardiacSignals.push(`PAS basse: ${ps.hemodynamics.sbp}`)
  if (ps.biology.lactate > 4) cardiacSignals.push(`Lactates élevés: ${ps.biology.lactate}`)
  const cardiotoxicDrugs = ['phenytoin', 'dilantin', 'amiodarone', 'digoxin', 'haloperidol']
  const hasCardiotoxic = ps.drugs?.some(d => cardiotoxicDrugs.some(k => d.name.toLowerCase().includes(k)))
  if (hasCardiotoxic) cardiacSignals.push('Médicaments cardiotoxiques en cours')
  // Inflammation prolongée
  if (ps.biology.crp > 50 && ps.hospDay > 3) cardiacSignals.push('Inflammation systémique prolongée')
  if (ps.biology.ferritin > 500) cardiacSignals.push(`Hyperferritinémie: ${ps.biology.ferritin}`)

  if (cardiacSignals.length >= 2) {
    vulns.push({
      id: 'cardiac-fragility',
      name: 'Fragilité cardiaque',
      detected: true,
      confidence: Math.min(85, cardiacSignals.length * 15),
      signals: cardiacSignals,
    })
  }

  // 4. Fragilité respiratoire
  const respSignals: string[] = []
  if (ps.hemodynamics.spo2 < 95) respSignals.push(`SpO2 basse: ${ps.hemodynamics.spo2}%`)
  if (ps.hemodynamics.respRate > 30) respSignals.push(`FR élevée: ${ps.hemodynamics.respRate}`)
  if (ps.neuro.gcs <= 8) respSignals.push('GCS ≤ 8: risque d\'apnée')

  if (respSignals.length >= 1) {
    vulns.push({
      id: 'respiratory-fragility',
      name: 'Fragilité respiratoire',
      detected: true,
      confidence: Math.min(80, respSignals.length * 25),
      signals: respSignals,
    })
  }

  // 5. Prématurité / terrain néonatal
  // (Would be detected from patient history)

  // 6. Contexte inflammatoire / auto-immun
  const immunoSignals: string[] = []
  if (ps.biology.crp > 30) immunoSignals.push(`CRP élevée: ${ps.biology.crp}`)
  if (ps.biology.ferritin > 500) immunoSignals.push(`Ferritine élevée: ${ps.biology.ferritin}`)
  if (ps.csf.cells > 5) immunoSignals.push(`LCR inflammatoire: ${ps.csf.cells} cellules`)
  if (ps.csf.antibodies !== 'negative') immunoSignals.push(`Anticorps: ${ps.csf.antibodies}`)
  if (ps.cytokines?.il1b && ps.cytokines.il1b > 10) immunoSignals.push('IL-1β élevée')
  if (ps.cytokines?.il6 && ps.cytokines.il6 > 20) immunoSignals.push('IL-6 élevée')

  if (immunoSignals.length >= 2) {
    vulns.push({
      id: 'inflammatory-autoimmune',
      name: 'Contexte inflammatoire / auto-immun',
      detected: true,
      confidence: Math.min(90, immunoSignals.length * 15),
      signals: immunoSignals,
    })
  }

  return vulns
}

// ── Intervention × Vulnerability rules ──

interface CascadeRule {
  intervention: string           // Drug or procedure name (lowercase match)
  interventionAliases: string[]  // Alternative names
  vulnerabilityId: string        // Which vulnerability makes this dangerous
  riskLevel: 'critical' | 'high' | 'moderate' | 'low'
  mechanism: string
  cascadeChain: string[]
  references: string[]
  recommendation: string
  alternativeSuggestion: string
}

const CASCADE_RULES: CascadeRule[] = [
  // ── MEOPA / N2O ──
  {
    intervention: 'meopa',
    interventionAliases: ['n2o', 'protoxyde', 'nitrous oxide', 'kalinox', 'antasol', 'entonox', 'oxynox'],
    vulnerabilityId: 'fires-prodrome',
    riskLevel: 'critical',
    mechanism: 'Le protoxyde d\'azote (N2O) abaisse le seuil convulsif par hypoxie cérébrale transitoire. '
      + 'Chez un enfant en prodrome FIRES (infection fébrile récente → encéphalopathie latente), '
      + 'le N2O peut déclencher la cascade convulsive qui transforme un prodrome silencieux en status epilepticus.',
    cascadeChain: [
      'Infection fébrile → inflammation systémique → neuroinflammation latente (prodrome FIRES)',
      'Administration MEOPA → hypoxie cérébrale transitoire + dépression SNC',
      'Seuil convulsif abaissé → première crise',
      'Crise → libération cytokines → amplification neuroinflammation',
      'Cascade auto-entretenue → status epilepticus réfractaire → FIRES',
    ],
    references: [
      'Zier & Doescher, Pediatr Emerg Care 2010: "Seizures temporally associated with N2O for pediatric procedural sedation"',
      'ANSM 2016: "Quelques cas de convulsions décrits — prudence chez enfants à risque de convulsions"',
      'van Baalen 2023: "FIRES prodrome: children improve briefly before explosive seizure onset"',
      'Perks et al., BJA 2012: "Anaesthesia and epilepsy — N2O and seizure threshold"',
    ],
    recommendation: 'CONTRE-INDICATION RELATIVE du MEOPA chez tout enfant fébrile avec signes neurologiques '
      + '(céphalées, confusion, somnolence). Privilégier analgésie locale ou sédation sans N2O.',
    alternativeSuggestion: 'Alternative : Emla (anesthésie locale) + Paracétamol. '
      + 'Si sédation nécessaire : Midazolam PO/IR à faible dose sous monitoring EEG.',
  },
  {
    intervention: 'meopa',
    interventionAliases: ['n2o', 'protoxyde', 'nitrous oxide', 'kalinox', 'antasol', 'entonox', 'oxynox'],
    vulnerabilityId: 'seizure-threshold',
    riskLevel: 'high',
    mechanism: 'Le N2O peut déclencher des convulsions chez un enfant dont le seuil convulsif est déjà abaissé '
      + '(fièvre, antiépileptiques en cours, crises récentes). L\'hyperventilation induite par le masque '
      + 'est un facteur favorisant supplémentaire.',
    cascadeChain: [
      'Seuil convulsif déjà abaissé (fièvre, crises récentes)',
      'MEOPA → hypoxie transitoire + hyperventilation au masque',
      'Déclenchement convulsif',
      'Risque de status epilepticus si terrain prédisposé',
    ],
    references: [
      'Zier & Doescher 2010: "Seizures temporally associated with N2O"',
      'Babl et al., Emerg Med J 2010: "Convulsions chez 2/2002 enfants sous N2O"',
      'ANSM 2016: Lettre aux professionnels — MEOPA et convulsions',
    ],
    recommendation: 'Évaluation neurologique AVANT administration. Si crises récentes ou AE en cours : '
      + 'contre-indication relative. Monitoring SpO2 + EEG si disponible.',
    alternativeSuggestion: 'Sédation alternative sans N2O. Anesthésie locale privilégiée.',
  },
  {
    intervention: 'meopa',
    interventionAliases: ['n2o', 'protoxyde', 'nitrous oxide', 'kalinox', 'antasol', 'entonox', 'oxynox'],
    vulnerabilityId: 'respiratory-fragility',
    riskLevel: 'high',
    mechanism: 'Le N2O à 50% remplace partiellement l\'O2 inspiré. Chez un enfant avec SpO2 déjà limite, '
      + 'risque de désaturation profonde voire arrêt respiratoire.',
    cascadeChain: [
      'SpO2 déjà abaissée / FR élevée / GCS bas',
      'MEOPA → diminution relative de la FiO2 effective',
      'Désaturation → hypoxie cérébrale',
      'Si GCS bas : risque d\'apnée sous N2O',
    ],
    references: [
      'ANSM 2016: "Si cyanose ne régresse pas, ventiler avec ballon manuel"',
      'Pediadol: "Contre-indication si altération aiguë de conscience"',
    ],
    recommendation: 'CONTRE-INDICATION si GCS < 12 ou SpO2 < 95%. Monitoring SpO2 continu obligatoire.',
    alternativeSuggestion: 'Analgésie IV (morphine faible dose) sous monitoring.',
  },

  // ── PHÉNYTOÏNE ──
  {
    intervention: 'phenytoine',
    interventionAliases: ['dilantin', 'phenytoin', 'diphantoine'],
    vulnerabilityId: 'cardiac-fragility',
    riskLevel: 'critical',
    mechanism: 'La phénytoïne est directement cardiotoxique (bloc AV, bradycardie, hypotension, '
      + 'fibrillation ventriculaire). Sur un cœur déjà fragilisé par inflammation systémique prolongée, '
      + 'hypotension chronique, et polythérapie dépressive, le risque d\'arythmie fatale est majeur.',
    cascadeChain: [
      'Inflammation systémique → myocardite infraclinique potentielle',
      'Polythérapie sédative → dépression myocardique cumulative',
      'Phénytoïne IV → cardiotoxicité directe (propylène glycol + molécule)',
      'Arythmie → bradycardie → arrêt cardiaque',
    ],
    references: [
      'Glauser et al., Epilepsy Curr 2016: "Phenytoin cardiac monitoring required"',
      'Yale SE Algorithm 2023: "Max 1-3 mg/kg/min pediatric, continuous cardiac monitoring"',
      'RCP Dilantin: "Troubles du rythme cardiaque, fibrillation ventriculaire, dépression myocardique"',
    ],
    recommendation: 'Monitoring cardiaque CONTINU (scope + troponine q12h). '
      + 'Si inflammation > 7 jours : échocardiographie de suivi. '
      + 'Envisager switch vers lévétiracétam ou lacosamide (moins cardiotoxique).',
    alternativeSuggestion: 'Alternative : Lévétiracétam (Keppra) IV — profil cardiaque beaucoup plus sûr. '
      + 'Ou Lacosamide IV si disponible.',
  },

  // ── PHENOBARBITAL ──
  {
    intervention: 'phenobarbital',
    interventionAliases: ['gardenal', 'luminal'],
    vulnerabilityId: 'cardiac-fragility',
    riskLevel: 'high',
    mechanism: 'Le phénobarbital provoque une dépression myocardique dose-dépendante et une hypotension. '
      + 'En association avec midazolam + phénytoïne + sufentanil, l\'effet cumulatif sur le cœur est majeur.',
    cascadeChain: [
      'Dépression myocardique (phénobarbital)',
      '+ Dépression myocardique (midazolam)',
      '+ Cardiotoxicité (phénytoïne)',
      '+ Bradycardie (sufentanil)',
      '= Risque cumulatif d\'insuffisance cardiaque aiguë',
    ],
    references: [
      'Glauser 2016: "Barbiturate-induced myocardial depression"',
      'NORSE Institute: "Hemodynamic monitoring essential with barbiturate coma"',
    ],
    recommendation: 'Échocardiographie avant et pendant coma barbiturique. '
      + 'Troponine + BNP q12h. Support vasopresseur anticipé.',
    alternativeSuggestion: 'Considérer kétamine en première intention (profil hémodynamique plus favorable).',
  },

  // ── ASSOCIATION SÉDATION LOURDE ──
  {
    intervention: 'midazolam',
    interventionAliases: ['hypnovel', 'versed'],
    vulnerabilityId: 'cardiac-fragility',
    riskLevel: 'high',
    mechanism: 'Le midazolam en perfusion continue provoque une dépression cardiovasculaire progressive. '
      + 'Combiné à sufentanil + phénytoïne + phénobarbital + kétamine, l\'effet est synergique.',
    cascadeChain: [
      'Midazolam continu → vasodilatation + dépression myocardique',
      '+ Sufentanil → bradycardie',
      '+ Phénytoïne → arythmie',
      '= Défaillance hémodynamique progressive',
    ],
    references: [
      'NORSE Institute: "Minimize concurrent sedatives when possible"',
    ],
    recommendation: 'Réévaluation quotidienne du cocktail. Réduire dès que possible. '
      + 'Monitoring hémodynamique invasif.',
    alternativeSuggestion: 'Envisager monothérapie kétamine + AE non cardiotoxique.',
  },
]

// ── Main CAE function ──

export function runCAE(ps: PatientState, plannedIntervention?: string): CAEResult {
  const vulnerabilities = detectVulnerabilities(ps)
  const risks: InterventionRisk[] = []
  const alerts: CascadeAlert[] = []

  // Check current drugs against vulnerabilities
  const allInterventions: string[] = [
    ...(ps.drugs || []).map(d => d.name.toLowerCase()),
    ...(plannedIntervention ? [plannedIntervention.toLowerCase()] : []),
  ]

  for (const rule of CASCADE_RULES) {
    // Check if this intervention is active or planned
    const interventionMatch = allInterventions.some(i =>
      i.includes(rule.intervention) || rule.interventionAliases.some(a => i.includes(a))
    )
    if (!interventionMatch) continue

    // Check if the vulnerability is present
    const vuln = vulnerabilities.find(v => v.id === rule.vulnerabilityId && v.detected)
    if (!vuln) continue

    // Match found — cascade risk detected
    risks.push({
      intervention: rule.intervention,
      riskLevel: rule.riskLevel,
      mechanism: rule.mechanism,
      cascadeChain: rule.cascadeChain,
      references: rule.references,
      recommendation: rule.recommendation,
    })

    alerts.push({
      severity: rule.riskLevel === 'critical' ? 'critical' : 'warning',
      title: rule.riskLevel === 'critical'
        ? `🚨 CASCADE CRITIQUE : ${rule.intervention.toUpperCase()} × ${vuln.name}`
        : `⚠️ CASCADE : ${rule.intervention.toUpperCase()} × ${vuln.name}`,
      message: rule.mechanism,
      intervention: rule.intervention,
      vulnerability: vuln.name,
      cascadeChain: rule.cascadeChain,
      mechanism: rule.mechanism,
      references: rule.references,
      alternativeSuggestion: rule.alternativeSuggestion,
      timestamp: new Date().toISOString(),
    })
  }

  // Sort by severity
  alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  const highestRisk = risks.length === 0 ? 'none'
    : risks.some(r => r.riskLevel === 'critical') ? 'critical'
    : risks.some(r => r.riskLevel === 'high') ? 'high'
    : risks.some(r => r.riskLevel === 'moderate') ? 'moderate'
    : 'low'

  const message = highestRisk === 'critical'
    ? `⚠️ ${alerts.length} RISQUE(S) DE CASCADE DÉTECTÉ(S). `
      + `Des interventions en cours ou planifiées présentent un risque d'effet en chaîne `
      + `compte tenu du profil de vulnérabilité du patient.`
    : highestRisk === 'high'
    ? `${alerts.length} risque(s) de cascade identifié(s). Vigilance renforcée recommandée.`
    : highestRisk !== 'none'
    ? `Risques de cascade modérés identifiés. Monitoring recommandé.`
    : `Aucun risque de cascade significatif détecté.`

  return {
    vulnerabilities,
    risks,
    alerts,
    highestRisk,
    message,
  }
}

// ══════════════════════════════════════════════════════════════
// LIVE ENRICHMENT — Queries OpenFDA + BDPM in real time
// Adds LIVE adverse event data on top of static rules
// ══════════════════════════════════════════════════════════════


export async function runCAELive(ps: PatientState, plannedIntervention?: string): Promise<CAEResult> {
  // 1. Run static rules first (instant)
  const staticResult = runCAE(ps, plannedIntervention)

  // 2. Build patient context for live analysis
  const context: PatientContext = {
    age: ps.ageMonths,
    hasSeizures: ps.neuro.seizures24h > 0 || ps.neuro.seizureType !== 'none',
    hasCardiacRisk: ps.hemodynamics.heartRate > 150 || ps.hemodynamics.heartRate < 50 || ps.hemodynamics.map < 50,
    hasRespiratoryRisk: ps.hemodynamics.spo2 < 95,
    isFebrile: ps.hemodynamics.temp >= 38,
    hasInflammation: ps.biology.crp > 30 || ps.biology.ferritin > 500,
    gcs: ps.neuro.gcs,
  }

  // 3. Query live drug data for all current + planned drugs
  const allDrugNames = [
    ...(ps.drugs || []).map(d => d.name),
    ...(plannedIntervention ? [plannedIntervention] : []),
  ]

  const liveAlerts: CascadeAlert[] = []

  for (const drugName of allDrugNames) {
    try {
      const profile = await getDrugSafetyProfile(drugName)
      if (!profile) continue

      const analysis = analyzeSafetyForPatient(profile, context)
      
      if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
        // Check if this risk is already covered by static rules
        const alreadyCovered = staticResult.alerts.some(a => 
          a.intervention.toLowerCase() === drugName.toLowerCase() ||
          a.title.toLowerCase().includes(drugName.toLowerCase())
        )

        if (!alreadyCovered) {
          liveAlerts.push({
            severity: analysis.riskLevel === 'critical' ? 'critical' : 'warning',
            title: `📡 LIVE: ${drugName.toUpperCase()} — ${analysis.riskLevel === 'critical' ? 'RISQUE CRITIQUE' : 'RISQUE ÉLEVÉ'}`,
            message: analysis.reasons.join('. '),
            intervention: drugName,
            vulnerability: 'Détecté par analyse temps réel OpenFDA/ANSM',
            cascadeChain: analysis.reasons,
            mechanism: `Données pharmacovigilance en temps réel — ${profile.adverseEvents.length} effets indésirables, ${profile.cardiacRisks.length} risques cardiaques, ${profile.neuroRisks.length} risques neuro.`,
            references: [`OpenFDA FAERS (${profile.adverseEvents.filter(ae => ae.serious).length} EI graves)`, 'ANSM/BDPM — RCP officiel'],
            alternativeSuggestion: 'Consulter le RCP complet via /api/drugs?drug=' + encodeURIComponent(drugName),
            timestamp: new Date().toISOString(),
          })
        }
      }
    } catch {
      // Live lookup failed — static rules still apply
      continue
    }
  }

  // 4. Merge live alerts with static alerts
  return {
    vulnerabilities: staticResult.vulnerabilities,
    risks: staticResult.risks,
    alerts: [...staticResult.alerts, ...liveAlerts],
    highestRisk: liveAlerts.some(a => a.severity === 'critical') && staticResult.highestRisk !== 'critical'
      ? 'critical' 
      : staticResult.highestRisk,
    message: liveAlerts.length > 0
      ? `${staticResult.message} + ${liveAlerts.length} alerte(s) supplémentaire(s) détectée(s) en temps réel (OpenFDA/ANSM).`
      : staticResult.message,
  }
}
