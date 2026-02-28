// ============================================================
// PULSAR V16 — NeuroCore Engine
// Analyse EEG + IRM + Biomarqueurs contre la base de connaissances
// Alimente les alertes, red flags, pièges et guidance thérapeutique
// ============================================================

import type { PatientState } from '@/lib/engines/PatientState'
import {
  type SyndromeKey, type PhaseKey,
  NEUROCORE_KB, getSyndromePhase, getPhaseProfile,
  checkEEGRedFlags, checkMRIRedFlags, checkBiomarkerRedFlags,
  getRedFlagsAndTraps, getTherapeuticGuidance,
} from './knowledgeBase'

export interface NeuroCoreAnalysis {
  syndrome: SyndromeKey
  phase: PhaseKey
  phaseLabel: string
  phaseDayRange: [number, number]

  // EEG Analysis
  eegSummary: string
  eegAlerts: string[]
  eegSignatureMatch: { pattern: string; description: string; specificity: number } | null
  eegMonitoringAdvice: string

  // MRI Analysis
  mriSummary: string
  mriAlerts: string[]
  mriSignatureMatch: { pattern: string; description: string; timing: string } | null
  mriNextAction: string

  // Biomarker Analysis
  biomarkerSummary: string
  biomarkerAlerts: string[]
  prognosticMarkers: { marker: string; value: number | string; interpretation: string; severity: 'critical' | 'warning' | 'normal' }[]

  // Clinical integration
  redFlags: string[]
  traps: string[]
  therapeuticGuidance: { firstLine: string[]; secondLine: string[]; thirdLine: string[]; monitoring: string[] }
  differentialDiagnosis: { condition: string; distinguishingFeatures: string[] }[]
  references: { id: string; authors: string; title: string; journal: string; year: number; keyFinding: string }[]

  // Severity scores
  neuroCoreScore: number  // 0-100
  brainDamageIndex: number  // 0-100 based on biomarkers
  monitoringUrgency: 'routine' | 'elevated' | 'high' | 'critical'
}

function detectSyndrome(ps: PatientState): SyndromeKey {
  // Use antibody status and clinical features to detect syndrome
  if (ps.csf.antibodies === 'nmdar') return 'NMDAR'
  if (ps.csf.antibodies === 'mog') return 'MOGAD'
  if (ps.mogad?.mogAntibody) return 'MOGAD'
  if (ps.pims?.confirmed) return 'PIMS'

  // FIRES vs NORSE: FIRES if pediatric + febrile
  if (ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') {
    if (ps.ageMonths < 216 && ps.hemodynamics.temp > 38) return 'FIRES'
    return 'NORSE'
  }

  // Default based on severity
  if (ps.neuro.seizures24h > 3) return 'FIRES'
  return 'FIRES' // default for demo
}

function analyzeEEG(ps: PatientState, syndrome: SyndromeKey, hospDay: number): Pick<NeuroCoreAnalysis, 'eegSummary' | 'eegAlerts' | 'eegSignatureMatch' | 'eegMonitoringAdvice'> {
  const eeg = ps.eeg
  const phase = getPhaseProfile(syndrome, hospDay)
  const kb = NEUROCORE_KB[syndrome]

  if (!eeg) {
    return {
      eegSummary: 'EEG non disponible — EXAMEN URGENT RECOMMANDÉ',
      eegAlerts: ['EEG non réalisé — obligatoire dans ce contexte clinique'],
      eegSignatureMatch: null,
      eegMonitoringAdvice: phase.expectedEEG.monitoringFrequency,
    }
  }

  // Build summary
  const bgLabels: Record<string, string> = {
    normal: 'Normal', mildly_slow: 'Ralenti léger', moderately_slow: 'Ralenti modéré',
    severely_slow: 'Ralenti sévère', suppressed: 'Supprimé', burst_suppression: 'Burst-suppression',
  }
  let summary = `Fond : ${bgLabels[eeg.background] || eeg.background}`
  summary += ` · Réactivité : ${eeg.reactivity ? 'Oui' : 'NON'}`
  summary += ` · Crises/h : ${eeg.seizuresPerHour}`
  if (eeg.NCSEstatus) summary += ' · NCSE ACTIF'
  if (eeg.signaturePattern) summary += ` · Pattern signature : ${eeg.signaturePattern}`
  summary += ` · Tendance : ${eeg.trend === 'worsening' ? 'AGGRAVATION' : eeg.trend === 'improving' ? 'Amélioration' : 'Stable'}`

  // Check red flags
  const alerts = checkEEGRedFlags(syndrome, hospDay, eeg)

  // Check for signature pattern match
  let signatureMatch: NeuroCoreAnalysis['eegSignatureMatch'] = null
  const allPatterns = [...eeg.ictalPatterns, ...eeg.interictalPatterns]
  if (eeg.signaturePattern) allPatterns.push(eeg.signaturePattern)

  for (const sig of kb.eegSignatures) {
    if (allPatterns.includes(sig.pattern)) {
      signatureMatch = { pattern: sig.pattern, description: sig.description, specificity: sig.specificity }
      break
    }
  }

  return {
    eegSummary: summary,
    eegAlerts: alerts,
    eegSignatureMatch: signatureMatch,
    eegMonitoringAdvice: phase.expectedEEG.monitoringFrequency,
  }
}

function analyzeMRI(ps: PatientState, syndrome: SyndromeKey, hospDay: number): Pick<NeuroCoreAnalysis, 'mriSummary' | 'mriAlerts' | 'mriSignatureMatch' | 'mriNextAction'> {
  const mri = ps.mri
  const phase = getPhaseProfile(syndrome, hospDay)
  const kb = NEUROCORE_KB[syndrome]

  if (!mri || !mri.performed) {
    return {
      mriSummary: 'IRM non réalisée',
      mriAlerts: hospDay <= 3 ? ['IRM urgente recommandée dans les 24-48h'] : ['IRM non réalisée — envisager'],
      mriSignatureMatch: null,
      mriNextAction: phase.expectedMRI.recommendedTiming,
    }
  }

  // Build summary
  const findingLabels: Record<string, string> = {
    normal: 'Normal', limbic_temporal: 'Atteinte temporale mésiale', claustrum_sign: 'Claustrum sign',
    cortical_diffusion: 'Restriction diffusion corticale', meningeal_enhancement: 'Rehaussement méningé',
    demyelination_large: 'Démyélinisation étendue', vasculitis_pattern: 'Vasculite',
    atrophy_mesial_temporal: 'Atrophie temporale mésiale', atrophy_cortical: 'Atrophie corticale',
    basal_ganglia: 'Noyaux gris centraux', brainstem: 'Tronc cérébral',
  }

  let summary = `IRM J${mri.dayPerformed} : `
  if (mri.findings.length === 0 || (mri.findings.length === 1 && mri.findings[0] === 'normal')) {
    summary += 'Normale'
  } else {
    summary += mri.findings.map(f => findingLabels[f] || f).join(', ')
  }
  if (mri.t2FlairAbnormal) summary += ` · T2/FLAIR+ (${mri.t2FlairLocations.join(', ')})`
  if (mri.diffusionRestriction) summary += ` · Diffusion+ (${mri.diffusionLocations.join(', ')})`
  if (mri.gadoliniumEnhancement) summary += ` · Gado+ (${mri.gadoliniumLocations.join(', ')})`
  if (mri.edemaType !== 'none') summary += ` · Œdème ${mri.edemaType}`
  if (mri.spectroscopy.performed) {
    summary += ` · MRS: NAA/Cr=${mri.spectroscopy.naaCreatine}`
    if (mri.spectroscopy.lactate) summary += ', pic lactate'
  }

  // Alerts
  const alerts = checkMRIRedFlags(syndrome, hospDay, mri)

  // Signature match
  let signatureMatch: NeuroCoreAnalysis['mriSignatureMatch'] = null
  for (const sig of kb.mriSignatures) {
    if (mri.findings.includes(sig.pattern)) {
      signatureMatch = { pattern: sig.pattern, description: sig.description, timing: sig.timing }
      break
    }
  }

  // Next action
  let nextAction = phase.expectedMRI.recommendedTiming
  if (mri.followUpComparison === 'progressing') nextAction = 'IRM de contrôle urgente — lésions en progression'

  return { mriSummary: summary, mriAlerts: alerts, mriSignatureMatch: signatureMatch, mriNextAction: nextAction }
}

function analyzeBiomarkers(ps: PatientState, syndrome: SyndromeKey): Pick<NeuroCoreAnalysis, 'biomarkerSummary' | 'biomarkerAlerts' | 'prognosticMarkers' | 'brainDamageIndex'> {
  const bio = ps.neuroBiomarkers
  const kb = NEUROCORE_KB[syndrome]

  if (!bio) {
    return {
      biomarkerSummary: 'Biomarqueurs neuronaux non dosés',
      biomarkerAlerts: ['Dosage NfL + NSE recommandé pour évaluer le dommage neuronal'],
      prognosticMarkers: [],
      brainDamageIndex: 0,
    }
  }

  const alerts = checkBiomarkerRedFlags(bio)
  const markers: NeuroCoreAnalysis['prognosticMarkers'] = []

  // NfL
  if (bio.nfl !== null) {
    const sev = bio.nfl > 500 ? 'critical' as const : bio.nfl > 100 ? 'warning' as const : 'normal' as const
    const interp = bio.nfl > 500 ? 'Dommage axonal sévère — pronostic péjoratif'
      : bio.nfl > 100 ? 'Dommage axonal actif — surveillance rapprochée'
      : 'Normal — bon pronostic axonal'
    markers.push({ marker: 'NfL', value: bio.nfl, interpretation: interp, severity: sev })
  }

  // NSE
  if (bio.nse !== null) {
    const sev = bio.nse > 50 ? 'critical' as const : bio.nse > 25 ? 'warning' as const : 'normal' as const
    markers.push({ marker: 'NSE', value: bio.nse, interpretation: bio.nse > 50 ? 'Dommage neuronal étendu' : bio.nse > 25 ? 'Dommage neuronal modéré' : 'Normal', severity: sev })
  }

  // S100B
  if (bio.s100b !== null) {
    const sev = bio.s100b > 0.3 ? 'critical' as const : bio.s100b > 0.15 ? 'warning' as const : 'normal' as const
    markers.push({ marker: 'S100B', value: bio.s100b, interpretation: bio.s100b > 0.3 ? 'Œdème cérébral significatif' : bio.s100b > 0.15 ? 'Atteinte astrocytaire' : 'Normal', severity: sev })
  }

  // GFAP
  if (bio.gfap !== null) {
    const sev = bio.gfap > 1.0 ? 'critical' as const : bio.gfap > 0.5 ? 'warning' as const : 'normal' as const
    markers.push({ marker: 'GFAP', value: bio.gfap, interpretation: bio.gfap > 1.0 ? 'Atteinte gliale sévère' : bio.gfap > 0.5 ? 'Réponse astrocytaire' : 'Normal', severity: sev })
  }

  // IL-6 CSF
  if (bio.il6Csf !== null) {
    const sev = bio.il6Csf > 100 ? 'critical' as const : bio.il6Csf > 10 ? 'warning' as const : 'normal' as const
    markers.push({ marker: 'IL-6 LCR', value: bio.il6Csf, interpretation: bio.il6Csf > 100 ? 'Inflammation SNC majeure — cible tocilizumab' : bio.il6Csf > 10 ? 'Inflammation SNC active' : 'Normal', severity: sev })
  }

  // Neopterin
  if (bio.neopterin !== null) {
    const sev = bio.neopterin > 50 ? 'critical' as const : bio.neopterin > 30 ? 'warning' as const : 'normal' as const
    markers.push({ marker: 'Néoptérine', value: bio.neopterin, interpretation: bio.neopterin > 50 ? 'Activation immunitaire SNC intense' : bio.neopterin > 30 ? 'Activation immunitaire SNC' : 'Normal', severity: sev })
  }

  // Brain Damage Index (0-100)
  let bdi = 0
  if (bio.nfl !== null) bdi += Math.min(bio.nfl / 10, 30)  // max 30 points
  if (bio.nse !== null) bdi += Math.min(bio.nse / 2, 20)    // max 20 points
  if (bio.s100b !== null) bdi += Math.min(bio.s100b * 50, 15) // max 15 points
  if (bio.gfap !== null) bdi += Math.min(bio.gfap * 10, 15)  // max 15 points
  if (bio.tau !== null) bdi += Math.min(bio.tau / 40, 20)    // max 20 points
  bdi = Math.min(Math.round(bdi), 100)

  const critCount = markers.filter(m => m.severity === 'critical').length
  const warnCount = markers.filter(m => m.severity === 'warning').length

  let summary = `${markers.length} biomarqueurs dosés`
  if (critCount > 0) summary += ` · ${critCount} CRITIQUE${critCount > 1 ? 'S' : ''}`
  if (warnCount > 0) summary += ` · ${warnCount} attention`
  summary += ` · Index lésion cérébrale : ${bdi}/100`

  return { biomarkerSummary: summary, biomarkerAlerts: alerts, prognosticMarkers: markers, brainDamageIndex: bdi }
}

export function runNeuroCore(ps: PatientState): NeuroCoreAnalysis {
  const syndrome = detectSyndrome(ps)
  const phase = getSyndromePhase(syndrome, ps.hospDay)
  const phaseProfile = getPhaseProfile(syndrome, ps.hospDay)
  const kb = NEUROCORE_KB[syndrome]

  // Analyze each modality
  const eegAnalysis = analyzeEEG(ps, syndrome, ps.hospDay)
  const mriAnalysis = analyzeMRI(ps, syndrome, ps.hospDay)
  const bioAnalysis = analyzeBiomarkers(ps, syndrome)
  const { redFlags, traps } = getRedFlagsAndTraps(syndrome, ps.hospDay)
  const guidance = getTherapeuticGuidance(syndrome, ps.hospDay)

  // Compute NeuroCore score (0-100, higher = worse)
  let score = 0
  // EEG contribution (0-35)
  if (ps.eeg) {
    if (ps.eeg.NCSEstatus) score += 15
    score += Math.min(ps.eeg.seizuresPerHour * 2, 10)
    if (!ps.eeg.reactivity) score += 5
    if (ps.eeg.trend === 'worsening') score += 5
  }
  // MRI contribution (0-25)
  if (ps.mri?.herniation) score += 25
  else if (ps.mri?.midlineShift) score += 15
  else if (ps.mri?.edemaType === 'cytotoxic') score += 10
  else if (ps.mri?.t2FlairAbnormal) score += 5
  // Biomarker contribution (0-40)
  score += Math.round(bioAnalysis.brainDamageIndex * 0.4)

  score = Math.min(score, 100)

  // Monitoring urgency
  const allAlerts = [...eegAnalysis.eegAlerts, ...mriAnalysis.mriAlerts, ...bioAnalysis.biomarkerAlerts]
  const urgency: NeuroCoreAnalysis['monitoringUrgency'] =
    allAlerts.length > 4 || score > 70 ? 'critical' :
    allAlerts.length > 2 || score > 40 ? 'high' :
    allAlerts.length > 0 || score > 20 ? 'elevated' : 'routine'

  // Store on PatientState
  ps.neuroCoreResult = {
    redFlags, traps,
    eegAlerts: eegAnalysis.eegAlerts,
    mriAlerts: mriAnalysis.mriAlerts,
    biomarkerAlerts: bioAnalysis.biomarkerAlerts,
    phase: phaseProfile.label,
    guidance,
    score,
    urgency,
    brainDamageIndex: bioAnalysis.brainDamageIndex,
  }

  // Inject alerts into PatientState
  for (const alert of eegAnalysis.eegAlerts) {
    ps.alerts.push({ severity: 'critical', title: 'EEG', body: alert, source: 'NeuroCore' })
  }
  for (const alert of mriAnalysis.mriAlerts) {
    ps.alerts.push({ severity: 'warning', title: 'IRM', body: alert, source: 'NeuroCore' })
  }
  for (const alert of bioAnalysis.biomarkerAlerts) {
    ps.alerts.push({ severity: ps.neuroBiomarkers?.nfl && ps.neuroBiomarkers.nfl > 500 ? 'critical' : 'warning', title: 'Biomarqueur', body: alert, source: 'NeuroCore' })
  }

  return {
    syndrome, phase,
    phaseLabel: phaseProfile.label,
    phaseDayRange: phaseProfile.dayRange,
    ...eegAnalysis,
    ...mriAnalysis,
    ...bioAnalysis,
    redFlags, traps,
    therapeuticGuidance: guidance,
    differentialDiagnosis: kb.differentialDiagnosis,
    references: kb.references,
    neuroCoreScore: score,
    monitoringUrgency: urgency,
  }
}
