// ============================================================
// PULSAR V17.1 — IntakeAnalyzer
// Moteur d'analyse intelligente de dossier à l'admission
// 2 modes : Transfert (examens existants) / Première admission
// Analyse progressive + Scan antécédents + Gap analysis
// ============================================================

import { NEUROCORE_KB, type SyndromeKey } from '@/lib/neurocore/knowledgeBase'
import { REGISTRY } from '@/lib/data/observatoryData'

// ── Types ──

export type AdmissionMode = 'transfer' | 'first_admission'

export interface MedicalHistory {
  // Conditions chroniques
  sickleCellDisease: boolean
  asthma: boolean
  epilepsyKnown: boolean
  immunodeficiency: boolean
  autoimmune: boolean
  renalDisease: boolean
  cardiacDisease: boolean
  otherChronic: string
  // ATCD infectieux
  previousMeningitis: boolean
  meningitisAge: string
  previousEncephalitis: boolean
  recentCovid: boolean
  covidWeeksAgo: number
  recentInfection: boolean
  infectionType: string
  herpesHistory: boolean
  // ATCD neuro
  febrileSeizuresHistory: boolean
  developmentalDelay: boolean
  neuroPsychHistory: boolean
  neuroPsychDetail: string
  // Vaccination
  vaccinationUpToDate: boolean
  recentVaccination: boolean
  recentVaccineName: string
  // Famille
  familyEpilepsy: boolean
  familyAutoimmune: boolean
  familyConsanguinity: boolean
  // Allergies
  drugAllergies: string[]
  // Naissance / Périnatal
  prematurity: boolean
  premWeeks: number
  perinatalComplications: boolean
  perinatalDetail: string
}

export interface ExistingExam {
  type: 'eeg' | 'mri' | 'csf' | 'blood' | 'antibodies' | 'culture' | 'ct' | 'genetic' | 'metabolic'
  name: string
  done: boolean
  result: string
  date: string
  hospital: string
  normal: boolean | null // null = indeterminate
}

export interface IntakeData {
  admissionMode: AdmissionMode
  transferHospital: string
  transferReason: string
  // Identity
  ageMonths: number
  sex: 'male' | 'female' | ''
  weight: number
  // Neuro
  gcs: number
  seizures24h: number
  seizureType: string
  focalSigns: string[]
  consciousness: string
  pupils: string
  // Vitals
  temp: number
  hr: number
  spo2: number
  rr: number
  // Context
  feverBefore: boolean
  feverDays: number
  symptomOnsetDays: number
  // Bio
  crp: number
  wbc: number
  platelets: number
  lactate: number
  ferritin: number
  pct: number
  // CSF
  csfDone: boolean
  csfCells: number
  csfProtein: number
  csfAntibodies: string
  // Imaging
  eegDone: boolean
  eegStatus: string
  mriDone: boolean
  mriFindings: string[]
  // Treatments
  currentDrugs: string[]
  // Medical history
  history: MedicalHistory
  // Existing exams (transfer)
  existingExams: ExistingExam[]
}

// ── Analysis Result Types ──

export interface DiagnosisCandidate {
  syndrome: SyndromeKey
  confidence: number
  matchedCriteria: { criterion: string; weight: 'major' | 'minor' | 'supportive'; matched: boolean }[]
  totalMajor: number; matchedMajor: number
  color: string; urgency: 'critical' | 'high' | 'moderate' | 'low'
}

export interface RedFlagHit {
  flag: string; source: string; severity: 'critical' | 'warning'
}

export interface HistoryAlert {
  title: string
  detail: string
  severity: 'critical' | 'warning' | 'info'
  icon: string
  implications: string[]
}

export interface ExamRecommendation {
  name: string
  urgency: 'immediate' | 'urgent' | 'standard'
  rationale: string
  forSyndromes: SyndromeKey[]
  alreadyDone: boolean
  needsRepeat: boolean
  repeatReason: string
}

export interface ExamGap {
  category: string
  missing: string[]
  urgency: 'critical' | 'high' | 'medium'
  reason: string
}

export interface SimilarCase {
  caseId: string; family: string; region: string
  ageDiff: number; severity: number; outcome: string
}

export interface IntakeAnalysis {
  urgencyScore: number
  urgencyLevel: 'critical' | 'high' | 'moderate' | 'low'
  differentials: DiagnosisCandidate[]
  redFlags: RedFlagHit[]
  historyAlerts: HistoryAlert[]
  examRecommendations: ExamRecommendation[]
  examGaps: ExamGap[]
  similarCases: SimilarCase[]
  engineReadiness: { engine: string; ready: boolean; reason: string }[]
  clinicalSummary: string
  completeness: number
  isTransfer: boolean
}

// ── Syndrome colors ──
const SYNDROME_COLORS: Record<SyndromeKey, string> = {
  FIRES: '#FF4757', NORSE: '#FF6B8A', NMDAR: '#6C7CFF', MOGAD: '#B96BFF', PIMS: '#FFB347',
}

// ── Default history ──
export const DEFAULT_HISTORY: MedicalHistory = {
  sickleCellDisease: false, asthma: false, epilepsyKnown: false,
  immunodeficiency: false, autoimmune: false, renalDisease: false,
  cardiacDisease: false, otherChronic: '',
  previousMeningitis: false, meningitisAge: '', previousEncephalitis: false,
  recentCovid: false, covidWeeksAgo: 0, recentInfection: false, infectionType: '',
  herpesHistory: false,
  febrileSeizuresHistory: false, developmentalDelay: false,
  neuroPsychHistory: false, neuroPsychDetail: '',
  vaccinationUpToDate: true, recentVaccination: false, recentVaccineName: '',
  familyEpilepsy: false, familyAutoimmune: false, familyConsanguinity: false,
  drugAllergies: [],
  prematurity: false, premWeeks: 40, perinatalComplications: false, perinatalDetail: '',
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

export function analyzeIntake(data: Partial<IntakeData>): IntakeAnalysis {
  const h = { ...DEFAULT_HISTORY, ...data.history }
  const d: IntakeData = {
    admissionMode: 'first_admission', transferHospital: '', transferReason: '',
    ageMonths: 0, sex: '', weight: 0,
    gcs: 15, seizures24h: 0, seizureType: '', focalSigns: [], consciousness: 'alert', pupils: 'reactive',
    temp: 37, hr: 80, spo2: 98, rr: 18,
    feverBefore: false, feverDays: 0, symptomOnsetDays: 0,
    crp: 0, wbc: 8, platelets: 250, lactate: 1, ferritin: 0, pct: 0,
    csfDone: false, csfCells: 0, csfProtein: 0, csfAntibodies: 'negative',
    eegDone: false, eegStatus: '', mriDone: false, mriFindings: [],
    currentDrugs: [], existingExams: [],
    ...data,
    history: h,
  }
  const isTransfer = d.admissionMode === 'transfer'

  // ── Completeness ──
  let filled = 0; const total = 14
  if (d.ageMonths > 0) filled++
  if (d.sex) filled++
  if (d.gcs !== 15) filled++
  if (d.temp !== 37) filled++
  if (d.hr !== 80) filled++
  if (d.seizureType) filled++
  if (d.crp > 0) filled++
  if (d.wbc !== 8) filled++
  if (d.csfDone) filled++
  if (d.eegDone) filled++
  if (d.mriDone) filled++
  if (d.consciousness !== 'alert') filled++
  if (h.sickleCellDisease || h.previousMeningitis || h.recentCovid || h.epilepsyKnown || h.herpesHistory || h.autoimmune) filled++
  if (isTransfer && d.existingExams.length > 0) filled++
  const completeness = Math.round((filled / total) * 100)

  // ── Urgency Score ──
  let urgency = 0
  if (d.gcs <= 8) urgency += 35
  else if (d.gcs <= 12) urgency += 20
  else if (d.gcs <= 14) urgency += 10
  if (d.seizures24h >= 10) urgency += 25
  else if (d.seizures24h >= 5) urgency += 15
  else if (d.seizures24h >= 1) urgency += 8
  if (d.seizureType === 'refractory_status' || d.seizureType === 'super_refractory') urgency += 25
  else if (d.seizureType === 'status') urgency += 15
  if (d.temp >= 39.5) urgency += 8
  if (d.spo2 > 0 && d.spo2 < 92) urgency += 12
  if (d.lactate > 4) urgency += 10
  else if (d.lactate > 2) urgency += 5
  if (d.pupils === 'fixed_both') urgency += 20
  else if (d.pupils === 'fixed_one') urgency += 12
  else if (d.pupils === 'sluggish') urgency += 5
  // History modifiers
  if (h.sickleCellDisease) urgency += 5
  if (h.immunodeficiency) urgency += 5
  if (h.previousEncephalitis) urgency += 3
  urgency = Math.min(100, urgency)

  const urgencyLevel: IntakeAnalysis['urgencyLevel'] =
    urgency >= 70 ? 'critical' : urgency >= 45 ? 'high' : urgency >= 20 ? 'moderate' : 'low'

  // ── Differential Diagnosis ──
  const differentials: DiagnosisCandidate[] = []
  for (const [key, profile] of Object.entries(NEUROCORE_KB)) {
    const syndrome = key as SyndromeKey
    const criteria = profile.diagnosticCriteria.map(c => ({
      ...c, matched: matchCriterion(c.criterion, d, h),
    }))
    const totalMajor = criteria.filter(c => c.weight === 'major').length
    const matchedMajor = criteria.filter(c => c.weight === 'major' && c.matched).length
    const matchedMinor = criteria.filter(c => c.weight === 'minor' && c.matched).length
    const matchedSupp = criteria.filter(c => c.weight === 'supportive' && c.matched).length
    let confidence = Math.min(95, Math.round(
      (matchedMajor / Math.max(totalMajor, 1)) * 60 + matchedMinor * 12 + matchedSupp * 5
    ))
    // History boosts
    if (syndrome === 'NMDAR' && h.herpesHistory) confidence = Math.min(95, confidence + 12)
    if (syndrome === 'PIMS' && h.recentCovid) confidence = Math.min(95, confidence + 15)
    if (syndrome === 'FIRES' && h.febrileSeizuresHistory && d.feverBefore) confidence = Math.min(95, confidence + 5)
    if (syndrome === 'MOGAD' && h.autoimmune) confidence = Math.min(95, confidence + 8)

    if (confidence > 5) {
      differentials.push({
        syndrome, confidence, matchedCriteria: criteria,
        totalMajor, matchedMajor, color: SYNDROME_COLORS[syndrome],
        urgency: confidence >= 60 ? 'critical' : confidence >= 40 ? 'high' : confidence >= 20 ? 'moderate' : 'low',
      })
    }
  }
  differentials.sort((a, b) => b.confidence - a.confidence)

  // ── Red Flags ──
  const redFlags: RedFlagHit[] = []
  for (const [key, profile] of Object.entries(NEUROCORE_KB)) {
    for (const flag of profile.globalRedFlags) {
      if (matchRedFlag(flag, d)) redFlags.push({ flag, source: key, severity: 'critical' })
    }
  }
  if (d.gcs <= 8) redFlags.push({ flag: 'GCS ≤ 8 — Intubation à considérer', source: 'Neuro', severity: 'critical' })
  if (d.pupils === 'fixed_both') redFlags.push({ flag: 'Mydriase bilatérale aréactive', source: 'Neuro', severity: 'critical' })
  if (d.seizureType === 'refractory_status') redFlags.push({ flag: 'Status épileptique réfractaire', source: 'Neuro', severity: 'critical' })
  if (d.lactate > 4) redFlags.push({ flag: `Lactate ${d.lactate} mmol/L — Hypoxie tissulaire`, source: 'Bio', severity: 'critical' })
  if (d.temp >= 40) redFlags.push({ flag: 'Hyperthermie ≥ 40°C', source: 'Constantes', severity: 'warning' })
  if (h.sickleCellDisease && d.temp >= 38.5) redFlags.push({ flag: 'Drépanocytaire fébrile — Risque septique majeur', source: 'ATCD', severity: 'critical' })
  if (h.immunodeficiency && d.crp > 50) redFlags.push({ flag: 'Immunodéficient + syndrome inflammatoire', source: 'ATCD', severity: 'critical' })
  const uniqueFlags = redFlags.filter((f, i) => redFlags.findIndex(x => x.flag === f.flag) === i)

  // ── HISTORY ALERTS (Scan du carnet médical) ──
  const historyAlerts = analyzeHistory(d, h, differentials)

  // ── EXAM RECOMMENDATIONS + GAP ANALYSIS ──
  const { recommendations: examRecommendations, gaps: examGaps } = analyzeExams(d, h, differentials, isTransfer)

  // ── Similar Cases ──
  const similarCases: SimilarCase[] = REGISTRY
    .map(r => ({ caseId: r.case_id, family: r.family, region: r.region, ageDiff: Math.abs(r.age_months - (d.ageMonths || 60)), severity: r.severity_1to5 || 0, outcome: r.outcome_12m }))
    .filter(c => {
      const top = differentials[0]?.syndrome
      if (!top) return true
      const map: Record<string, string> = { NMDAR: 'EAIS', FIRES: 'FIRES', NORSE: 'NORSE', MOGAD: 'MOGAD', PIMS: 'PIMS' }
      return c.family === (map[top] || top) || c.family === top
    })
    .sort((a, b) => a.ageDiff - b.ageDiff).slice(0, 4)

  // ── Engine Readiness ──
  const engineReadiness = [
    { engine: 'VPS', ready: d.gcs > 0 && d.hr > 0, reason: d.gcs > 0 ? 'GCS + constantes OK' : 'Besoin GCS + constantes' },
    { engine: 'TDE', ready: differentials.length > 0 && d.seizureType !== '', reason: differentials.length > 0 ? 'Hypothèse diagnostique active' : 'Besoin données cliniques' },
    { engine: 'PVE', ready: d.currentDrugs.length > 0, reason: d.currentDrugs.length > 0 ? `${d.currentDrugs.length} médicament(s)` : 'Aucun traitement' },
    { engine: 'EWE', ready: d.gcs > 0 && d.seizures24h > 0, reason: d.seizures24h > 0 ? 'Données temporelles OK' : 'Besoin historique crises' },
    { engine: 'TPE', ready: differentials.some(dd => dd.confidence >= 40), reason: differentials.some(dd => dd.confidence >= 40) ? 'Confiance suffisante' : 'Confiance trop basse' },
  ]

  // ── Clinical Summary ──
  const topD = differentials[0]
  let summary = ''
  if (completeness < 15) {
    summary = 'Données insuffisantes — renseignez identité, clinique et antécédents.'
  } else {
    const parts: string[] = []
    if (isTransfer) parts.push(`Transfert depuis ${d.transferHospital || 'hôpital externe'}.`)
    if (topD) parts.push(`Orientation : ${topD.syndrome} (${topD.confidence}%, ${topD.matchedMajor}/${topD.totalMajor} critères majeurs).`)
    if (historyAlerts.length > 0) parts.push(`${historyAlerts.filter(a => a.severity === 'critical').length} alerte(s) ATCD critique(s).`)
    if (uniqueFlags.length > 0) parts.push(`${uniqueFlags.length} red flag(s).`)
    const immExams = examRecommendations.filter(e => e.urgency === 'immediate' && !e.alreadyDone)
    if (immExams.length > 0) parts.push(`${immExams.length} examen(s) immédiat(s) à lancer.`)
    if (examGaps.length > 0) parts.push(`${examGaps.length} gap(s) identifié(s) dans le bilan.`)
    summary = parts.join(' ') || 'Analyse en cours — compléter les données.'
  }

  return {
    urgencyScore: urgency, urgencyLevel, differentials, redFlags: uniqueFlags,
    historyAlerts, examRecommendations, examGaps, similarCases,
    engineReadiness, clinicalSummary: summary, completeness, isTransfer,
  }
}

// ═══════════════════════════════════════════════════════════════
// HISTORY ANALYSIS — Scan du carnet médical
// ═══════════════════════════════════════════════════════════════

function analyzeHistory(d: IntakeData, h: MedicalHistory, diffs: DiagnosisCandidate[]): HistoryAlert[] {
  const alerts: HistoryAlert[] = []
  const topSyndromes = diffs.slice(0, 3).map(dd => dd.syndrome)

  // ── Drépanocytose ──
  if (h.sickleCellDisease) {
    const implications = ['Risque AVC accru', 'Bilan vasculaire cérébral prioritaire', 'Attention interactions médicamenteuses (hydroxycarbamide)']
    if (d.temp >= 38.5) implications.unshift('URGENCE : Fièvre chez drépanocytaire → hémocultures + ATB en urgence')
    if (d.gcs <= 12) implications.push('GCS altéré : éliminer AVC ischémique ou hémorragique en priorité')
    alerts.push({
      title: 'Drépanocytose', detail: 'Patient drépanocytaire — terrain à haut risque vasculaire et infectieux.',
      severity: d.temp >= 38.5 ? 'critical' : 'warning', icon: 'blood', implications,
    })
  }

  // ── ATCD méningite ──
  if (h.previousMeningitis) {
    alerts.push({
      title: 'ATCD Méningite', detail: `Méningite antérieure${h.meningitisAge ? ` à ${h.meningitisAge}` : ''}. Terrain fragilisé.`,
      severity: 'warning', icon: 'virus',
      implications: ['Vulnérabilité inflammatoire méningée documentée', 'Seuil bas pour PL', 'Rechercher séquelles neurocognitives préexistantes', 'IRM comparative avec anciens clichés si disponibles'],
    })
  }

  // ── ATCD Encéphalite ──
  if (h.previousEncephalitis) {
    alerts.push({
      title: 'ATCD Encéphalite', detail: 'Encéphalite antérieure — risque de récidive auto-immune.',
      severity: 'critical', icon: 'brain',
      implications: ['Rechercher anticorps anti-neuronaux en priorité', 'Risque encéphalite anti-NMDAR post-herpétique', 'Panel auto-immun élargi recommandé', 'Comparer EEG et IRM avec examens antérieurs'],
    })
  }

  // ── Herpès + suspicion NMDAR ──
  if (h.herpesHistory) {
    const isNmdarSuspect = topSyndromes.includes('NMDAR')
    alerts.push({
      title: 'ATCD Herpès / HSV', detail: 'Antécédent d\'infection herpétique — facteur de risque encéphalite anti-NMDAR post-herpétique.',
      severity: isNmdarSuspect ? 'critical' : 'warning', icon: 'virus',
      implications: [
        'Encéphalite anti-NMDAR post-herpétique : 20-27% des cas pédiatriques',
        'Délai typique : 2-8 semaines post-HSV',
        'Anticorps anti-NMDAR dans LCR à rechercher en URGENCE',
        'PCR HSV dans LCR même si épisode ancien',
      ],
    })
  }

  // ── COVID récent + PIMS ──
  if (h.recentCovid) {
    const isPimsSuspect = topSyndromes.includes('PIMS')
    alerts.push({
      title: 'COVID récent', detail: `Infection SARS-CoV-2 ${h.covidWeeksAgo ? `il y a ${h.covidWeeksAgo} semaines` : 'récente'}.`,
      severity: isPimsSuspect ? 'critical' : 'warning', icon: 'virus',
      implications: [
        'PIMS/MIS-C : délai typique 2-6 semaines post-COVID',
        'Bilan cardiaque systématique (troponine, pro-BNP, écho)',
        'Surveillance D-dimères (risque thrombotique)',
        h.covidWeeksAgo >= 2 && h.covidWeeksAgo <= 6 ? '⚠ Fenêtre temporelle PIMS compatible' : 'Fenêtre temporelle à vérifier',
      ],
    })
  }

  // ── Épilepsie connue ──
  if (h.epilepsyKnown) {
    alerts.push({
      title: 'Épilepsie connue', detail: 'Épilepsie préexistante — distinguer décompensation de nouvelle pathologie.',
      severity: 'warning', icon: 'eeg',
      implications: [
        'Vérifier observance thérapeutique et dosages sanguins',
        'EEG comparatif avec tracés antérieurs indispensable',
        'Nouvelle sémiologie ? Nouveau foyer ? → Suspecter pathologie surajoutée',
        'Interactions médicamenteuses à vérifier (PVE engine)',
      ],
    })
  }

  // ── Immunodéficience ──
  if (h.immunodeficiency) {
    alerts.push({
      title: 'Immunodéficience', detail: 'Déficit immunitaire — spectre étiologique élargi.',
      severity: 'warning', icon: 'shield',
      implications: [
        'Infections opportunistes à rechercher (JC virus, CMV, toxoplasmose)',
        'Immunothérapie : adaptation des doses et protocoles',
        'PCR élargie dans LCR (panel méningite + opportunistes)',
        'Attention : inflammation peut être atténuée → CRP/GB faussement rassurants',
      ],
    })
  }

  // ── Auto-immunité connue ──
  if (h.autoimmune) {
    alerts.push({
      title: 'Maladie auto-immune', detail: 'Terrain auto-immun — risque accru d\'encéphalite auto-immune.',
      severity: 'warning', icon: 'dna',
      implications: [
        'Prédisposition : risque 3-5× supérieur d\'encéphalite auto-immune',
        'Panel anticorps élargi en priorité (sérum + LCR)',
        'MOGAD/ADEM plus probable sur ce terrain',
        'Traitement immunosuppresseur en cours ? → Adapter le bilan infectieux',
      ],
    })
  }

  // ── Convulsions fébriles ──
  if (h.febrileSeizuresHistory && d.seizures24h > 0) {
    alerts.push({
      title: 'ATCD Convulsions fébriles', detail: 'Antécédent de convulsions fébriles + crises actuelles.',
      severity: 'info', icon: 'thermo',
      implications: [
        'Convulsion fébrile complexe à distinguer d\'un status inaugural',
        'Si > 15 min ou focale ou récidivante → ne pas banaliser',
        'FIRES : fièvre prodromique + crises réfractaires = critère diagnostique',
        'Seuil bas pour EEG continu',
      ],
    })
  }

  // ── Prématurité ──
  if (h.prematurity && h.premWeeks < 37) {
    alerts.push({
      title: `Prématurité (${h.premWeeks} SA)`, detail: 'Ancien prématuré — vulnérabilité neurologique.',
      severity: 'info', icon: 'heart',
      implications: [
        'Leucomalacie périventriculaire possible → IRM comparative',
        'Seuil épileptogène potentiellement abaissé',
        'Développement neurologique de base à documenter',
      ],
    })
  }

  // ── Retard de développement ──
  if (h.developmentalDelay) {
    alerts.push({
      title: 'Retard de développement', detail: 'Retard neurodéveloppemental documenté.',
      severity: 'info', icon: 'brain',
      implications: [
        'Évaluation neurologique de base modifiée (GCS à interpréter avec prudence)',
        'Bilan métabolique/génétique si non fait',
        'Anomalie structurelle à rechercher à l\'IRM',
      ],
    })
  }

  // ── Allergies médicamenteuses ──
  if (h.drugAllergies.length > 0) {
    alerts.push({
      title: 'Allergies médicamenteuses', detail: h.drugAllergies.join(', '),
      severity: 'warning', icon: 'pill',
      implications: h.drugAllergies.map(a => `Contre-indication : ${a} — vérifier alternatives et réactions croisées`),
    })
  }

  // ── Consanguinité ──
  if (h.familyConsanguinity) {
    alerts.push({
      title: 'Consanguinité parentale', detail: 'Consanguinité documentée — orientation vers étiologie génétique.',
      severity: 'info', icon: 'dna',
      implications: ['Maladies récessives plus probables', 'Bilan métabolique élargi recommandé', 'Panel génétique ciblé (épilepsies génétiques, leucodystrophies)'],
    })
  }

  // ── ATCD familiaux ──
  if (h.familyEpilepsy) {
    alerts.push({
      title: 'ATCD familial d\'épilepsie', detail: 'Épilepsie dans la famille.',
      severity: 'info', icon: 'family',
      implications: ['Prédisposition génétique possible', 'Panel génétique si épilepsie atypique'],
    })
  }

  // ── Infection récente (non-COVID) ──
  if (h.recentInfection && h.infectionType) {
    alerts.push({
      title: `Infection récente : ${h.infectionType}`, detail: `Épisode infectieux documenté avant l'admission.`,
      severity: 'info', icon: 'virus',
      implications: [
        'Encéphalite post-infectieuse à considérer',
        'Si virale : rechercher anticorps anti-neuronaux (encéphalite auto-immune secondaire)',
        'Culture + PCR adaptées au germe',
      ],
    })
  }

  return alerts
}

// ═══════════════════════════════════════════════════════════════
// EXAM ANALYSIS — Recommandations + Gap analysis
// ═══════════════════════════════════════════════════════════════

function analyzeExams(d: IntakeData, h: MedicalHistory, diffs: DiagnosisCandidate[], isTransfer: boolean): {
  recommendations: ExamRecommendation[]
  gaps: ExamGap[]
} {
  const recs: ExamRecommendation[] = []
  const gaps: ExamGap[] = []
  const topSyndromes = diffs.slice(0, 3).map(dd => dd.syndrome)
  const hasExam = (type: string) => d.existingExams.some(e => e.type === type && e.done)
  const examNormal = (type: string) => d.existingExams.find(e => e.type === type)?.normal

  // ── EEG ──
  const eegDone = d.eegDone || hasExam('eeg')
  if (!eegDone && (d.seizures24h > 0 || d.gcs <= 12)) {
    recs.push({ name: 'EEG continu urgent', urgency: 'immediate', rationale: d.seizures24h > 0 ? `${d.seizures24h} crises/24h — monitoring indispensable` : 'Trouble de conscience — exclure NCSE', forSyndromes: ['FIRES', 'NMDAR', 'NORSE'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
  } else if (eegDone && isTransfer) {
    // Transfer: EEG exists but may need repeat
    const eegOld = d.existingExams.find(e => e.type === 'eeg')
    const daysDiff = eegOld?.date ? Math.round((Date.now() - new Date(eegOld.date).getTime()) / 86400000) : 0
    if (daysDiff > 2 || d.seizures24h > 0) {
      recs.push({ name: 'EEG continu — contrôle', urgency: 'urgent', rationale: `EEG réalisé ${daysDiff > 0 ? `il y a ${daysDiff}j` : 'à l\'hôpital source'} — état clinique à réévaluer`, forSyndromes: ['FIRES', 'NMDAR'], alreadyDone: true, needsRepeat: true, repeatReason: 'Évolution clinique depuis dernier EEG' })
    }
  }

  // ── IRM ──
  const mriDone = d.mriDone || hasExam('mri')
  if (!mriDone && (d.seizures24h > 0 || d.gcs <= 12 || d.focalSigns.length > 0)) {
    recs.push({ name: 'IRM cérébrale + Gadolinium', urgency: 'urgent', rationale: 'Bilan étiologique neurologique — séquences T2/FLAIR, diffusion, gado', forSyndromes: ['FIRES', 'NMDAR', 'MOGAD'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
  } else if (mriDone && isTransfer && examNormal('mri') === false) {
    recs.push({ name: 'IRM de contrôle', urgency: 'standard', rationale: 'IRM anormale à l\'hôpital source — suivi évolutif', forSyndromes: ['FIRES', 'MOGAD'], alreadyDone: true, needsRepeat: true, repeatReason: 'Suivi anomalies IRM' })
  }

  // ── PL / LCR ──
  const csfDone = d.csfDone || hasExam('csf')
  if (!csfDone && (d.seizures24h > 0 || d.gcs <= 12 || d.temp >= 38.5)) {
    recs.push({ name: 'Ponction lombaire', urgency: d.gcs <= 8 ? 'immediate' : 'urgent', rationale: 'Analyse LCR — cellularité, protéines, anticorps, cultures', forSyndromes: ['FIRES', 'NMDAR', 'NORSE'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
  }

  // ── Anticorps ──
  const abDone = hasExam('antibodies') || (d.csfDone && d.csfAntibodies !== 'negative' && d.csfAntibodies !== '')
  if (!abDone && (topSyndromes.includes('NMDAR') || topSyndromes.includes('MOGAD') || d.csfDone)) {
    recs.push({ name: 'Panel anticorps étendu (sérum + LCR)', urgency: 'urgent', rationale: 'Anti-NMDAR, anti-MOG, anti-LGI1, anti-CASPR2, anti-GABA-B — sérum ET LCR', forSyndromes: ['NMDAR', 'MOGAD'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
  }

  // ── Bilan inflammatoire ──
  if (d.crp === 0 && d.wbc === 8 && !hasExam('blood')) {
    recs.push({ name: 'NFS + CRP + PCT + Ferritine + LDH', urgency: 'urgent', rationale: 'Bilan inflammatoire de base indispensable', forSyndromes: ['FIRES', 'PIMS', 'NMDAR', 'MOGAD', 'NORSE'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
  } else if (isTransfer && hasExam('blood')) {
    const bloodExam = d.existingExams.find(e => e.type === 'blood')
    const daysDiff = bloodExam?.date ? Math.round((Date.now() - new Date(bloodExam.date).getTime()) / 86400000) : 0
    if (daysDiff >= 1) {
      recs.push({ name: 'Bilan bio de contrôle', urgency: 'standard', rationale: `Dernier bilan ${daysDiff}j — cinétique inflammatoire à suivre`, forSyndromes: ['FIRES', 'PIMS'], alreadyDone: true, needsRepeat: true, repeatReason: 'Cinétique' })
    }
  }

  // ── PIMS spécifique ──
  if (h.recentCovid || topSyndromes.includes('PIMS') || (d.crp > 100 && d.temp >= 38.5)) {
    if (!hasExam('blood')) {
      recs.push({ name: 'Troponine + D-dimères + Pro-BNP + Écho cœur', urgency: 'urgent', rationale: 'Bilan PIMS/MIS-C — atteinte cardiaque à éliminer', forSyndromes: ['PIMS'], alreadyDone: false, needsRepeat: false, repeatReason: '' })
    }
  }

  // ── Drépanocytose spécifique ──
  if (h.sickleCellDisease) {
    recs.push({ name: 'Hémogramme + réticulocytes + bilan d\'hémolyse', urgency: 'urgent', rationale: 'Drépanocytaire — rechercher crise vaso-occlusive / séquestration', forSyndromes: [], alreadyDone: false, needsRepeat: false, repeatReason: '' })
    if (!mriDone) {
      recs.push({ name: 'Angio-IRM cérébrale', urgency: 'immediate', rationale: 'Drépanocytaire + atteinte neuro → éliminer AVC en urgence', forSyndromes: [], alreadyDone: false, needsRepeat: false, repeatReason: '' })
    }
  }

  // ── Herpès ──
  if (h.herpesHistory || h.previousEncephalitis) {
    recs.push({ name: 'PCR HSV-1/HSV-2 dans LCR', urgency: 'urgent', rationale: 'ATCD herpétique — encéphalite HSV et post-HSV à éliminer', forSyndromes: ['NMDAR'], alreadyDone: hasExam('culture'), needsRepeat: false, repeatReason: '' })
  }

  // ── Metabolic / genetic (si consanguinité ou retard) ──
  if (h.familyConsanguinity || h.developmentalDelay) {
    if (!hasExam('metabolic')) {
      recs.push({ name: 'Bilan métabolique (ammoniémie, lactate, AA, acylcarnitines)', urgency: 'standard', rationale: 'Terrain génétique/neurodéveloppemental — étiologie métabolique à éliminer', forSyndromes: [], alreadyDone: false, needsRepeat: false, repeatReason: '' })
    }
  }

  // ═══ GAP ANALYSIS ═══
  // What's critical but missing?
  const criticalMissing: string[] = []
  const highMissing: string[] = []

  if (!eegDone && d.seizures24h > 0) criticalMissing.push('EEG continu')
  if (!csfDone && d.gcs <= 12) criticalMissing.push('Ponction lombaire')
  if (!mriDone && d.focalSigns.length > 0) criticalMissing.push('IRM cérébrale')
  if (h.sickleCellDisease && !mriDone) criticalMissing.push('Angio-IRM (drépanocytaire)')

  if (!abDone && diffs.some(dd => dd.confidence > 30)) highMissing.push('Panel anticorps anti-neuronaux')
  if (!mriDone && d.seizures24h > 0) highMissing.push('IRM cérébrale')
  if (!eegDone && d.gcs <= 12) highMissing.push('EEG')
  if (d.crp === 0 && d.wbc === 8) highMissing.push('Bilan inflammatoire')

  if (criticalMissing.length > 0) {
    gaps.push({ category: 'Examens critiques manquants', missing: [...new Set(criticalMissing)], urgency: 'critical', reason: 'Examens indispensables non réalisés — lancer immédiatement' })
  }
  if (highMissing.length > 0) {
    gaps.push({ category: 'Bilan incomplet', missing: [...new Set(highMissing.filter(m => !criticalMissing.includes(m)))], urgency: 'high', reason: 'Examens importants pour orienter le diagnostic' })
  }

  // Transfer-specific gaps
  if (isTransfer && d.existingExams.length > 0) {
    const oldExams = d.existingExams.filter(e => {
      if (!e.date) return false
      return (Date.now() - new Date(e.date).getTime()) > 3 * 86400000 // > 3 days old
    })
    if (oldExams.length > 0) {
      gaps.push({
        category: 'Examens à recontrôler (> 72h)',
        missing: oldExams.map(e => `${e.name} (${e.date})`),
        urgency: 'medium',
        reason: 'Résultats datés — cinétique à réévaluer depuis le transfert',
      })
    }
  }

  return { recommendations: recs, gaps }
}

// ═══════════════════════════════════════════════════════════════
// CRITERION MATCHING
// ═══════════════════════════════════════════════════════════════

function matchCriterion(criterion: string, d: IntakeData, h: MedicalHistory): boolean {
  const cl = criterion.toLowerCase()
  if (cl.includes('fièvre') && cl.includes('prodrom')) return d.feverBefore && d.feverDays >= 1
  if (cl.includes('fièvre') && cl.includes('initiale')) return d.feverBefore
  if (cl.includes('status') && cl.includes('réfractaire')) return d.seizureType === 'refractory_status' || d.seizureType === 'super_refractory'
  if (cl.includes('crises') && cl.includes('réfractaire')) return d.seizures24h >= 5 || d.seizureType.includes('refractory')
  if (cl.includes('crises') && cl.includes('récurrent')) return d.seizures24h >= 3
  if (cl.includes('étiologie') && cl.includes('exclue')) return d.csfDone && d.csfAntibodies === 'negative'
  if (cl.includes('lcr') && cl.includes('pléiocytose')) return d.csfDone && d.csfCells > 5
  if (cl.includes('lcr') && cl.includes('inflammatoire')) return d.csfDone && (d.csfCells > 5 || d.csfProtein > 0.45)
  if (cl.includes('eeg') && cl.includes('anormal')) return d.eegDone && d.eegStatus !== 'normal' && d.eegStatus !== ''
  if (cl.includes('irm') && cl.includes('anormal')) return d.mriDone && d.mriFindings.length > 0
  if (cl.includes('irm') && cl.includes('normal')) return d.mriDone && d.mriFindings.length === 0
  if (cl.includes('psychiatri')) return d.consciousness === 'confused'
  if (cl.includes('mouvement') && cl.includes('anorma')) return d.focalSigns.includes('dyskinesia') || d.focalSigns.includes('chorea')
  if (cl.includes('dysautonomie')) return d.hr > 140 || d.temp >= 39.5 || d.spo2 < 92
  if (cl.includes('anticorps') && cl.includes('positif')) return d.csfAntibodies !== 'negative' && d.csfAntibodies !== '' && d.csfAntibodies !== 'pending'
  if (cl.includes('anticorps') && cl.includes('anti-nmdar')) return d.csfAntibodies === 'nmdar'
  if (cl.includes('anti-mog')) return d.csfAntibodies === 'mog'
  if (cl.includes('névrite optique')) return d.focalSigns.includes('optic_neuritis')
  if (cl.includes('démyélinisation')) return d.mriFindings.includes('demyelination_large') || d.mriFindings.includes('demyelination_periventricular')
  if (cl.includes('adem')) return d.mriFindings.includes('demyelination_large')
  if (cl.includes('covid') || cl.includes('sars-cov')) return h.recentCovid
  if (cl.includes('inflammat') && cl.includes('systém')) return d.crp > 50 && d.temp >= 38.5
  if (cl.includes('fièvre') && (cl.includes('>38') || cl.includes('persistante'))) return d.temp >= 38.5
  if (cl.includes('pédiatrique') || cl.includes('<18') || cl.includes('enfant')) return d.ageMonths < 216
  if (cl.includes('trouble') && cl.includes('conscience')) return d.gcs <= 12
  if (cl.includes('coma')) return d.gcs <= 8
  return false
}

function matchRedFlag(flag: string, d: IntakeData): boolean {
  const fl = flag.toLowerCase()
  if (fl.includes('gcs') && fl.includes('chute')) return d.gcs <= 10
  if (fl.includes('status') && fl.includes('>24h')) return d.seizureType === 'super_refractory'
  if (fl.includes('mydriase')) return d.pupils === 'fixed_both'
  if (fl.includes('herniation') || fl.includes('engagement')) return d.pupils === 'fixed_one'
  if (fl.includes('hyperthermie')) return d.temp >= 40
  return false
}
