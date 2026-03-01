// ============================================================
// PULSAR V17 — IntakeAnalyzer
// Moteur d'analyse intelligente de dossier à l'admission
// Analyse progressive : chaque champ enrichit le diagnostic
// ============================================================

import { NEUROCORE_KB, type SyndromeKey } from '@/lib/neurocore/knowledgeBase'
import { REGISTRY } from '@/lib/data/observatoryData'

// ── Types ──

export interface IntakeData {
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
  recentInfection: boolean
  infectionType: string
  covidRecent: boolean
  vaccinationRecent: boolean
  // Bio
  crp: number
  wbc: number
  platelets: number
  lactate: number
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
}

export interface DiagnosisCandidate {
  syndrome: SyndromeKey
  confidence: number // 0-100
  matchedCriteria: { criterion: string; weight: 'major' | 'minor' | 'supportive'; matched: boolean }[]
  totalMajor: number
  matchedMajor: number
  color: string
  urgency: 'critical' | 'high' | 'moderate' | 'low'
}

export interface RedFlagHit {
  flag: string
  source: SyndromeKey
  severity: 'critical' | 'warning'
}

export interface RecommendedExam {
  name: string
  urgency: 'immediate' | 'urgent' | 'standard'
  rationale: string
  forSyndromes: SyndromeKey[]
}

export interface SimilarCase {
  caseId: string
  family: string
  region: string
  ageDiff: number
  severity: number
  outcome: string
}

export interface IntakeAnalysis {
  urgencyScore: number // 0-100
  urgencyLevel: 'critical' | 'high' | 'moderate' | 'low'
  differentials: DiagnosisCandidate[]
  redFlags: RedFlagHit[]
  recommendedExams: RecommendedExam[]
  similarCases: SimilarCase[]
  engineReadiness: { engine: string; ready: boolean; reason: string }[]
  clinicalSummary: string
  completeness: number // 0-100
}

// ── Syndrome colors ──
const SYNDROME_COLORS: Record<SyndromeKey, string> = {
  FIRES: '#FF4757', NORSE: '#FF6B8A', NMDAR: '#6C7CFF', MOGAD: '#B96BFF', PIMS: '#FFB347',
}

// ── Analysis Engine ──

export function analyzeIntake(data: Partial<IntakeData>): IntakeAnalysis {
  const d = {
    ageMonths: 0, sex: '', weight: 0,
    gcs: 15, seizures24h: 0, seizureType: '', focalSigns: [], consciousness: 'alert', pupils: 'reactive',
    temp: 37, hr: 80, spo2: 98, rr: 18,
    feverBefore: false, feverDays: 0, recentInfection: false, infectionType: '', covidRecent: false, vaccinationRecent: false,
    crp: 0, wbc: 8, platelets: 250, lactate: 1,
    csfDone: false, csfCells: 0, csfProtein: 0, csfAntibodies: 'negative',
    eegDone: false, eegStatus: '', mriDone: false, mriFindings: [],
    currentDrugs: [],
    ...data,
  } as IntakeData

  // ── Completeness ──
  let filled = 0; let total = 12
  if (d.ageMonths > 0) filled++
  if (d.sex) filled++
  if (d.gcs < 15 || d.gcs > 0) filled++
  if (d.temp > 0) filled++
  if (d.hr > 0) filled++
  if (d.seizureType) filled++
  if (d.crp > 0) filled++
  if (d.wbc > 0) filled++
  if (d.csfDone) filled++
  if (d.eegDone) filled++
  if (d.mriDone) filled++
  if (d.consciousness !== 'alert') filled++
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
  urgency = Math.min(100, urgency)

  const urgencyLevel: IntakeAnalysis['urgencyLevel'] =
    urgency >= 70 ? 'critical' : urgency >= 45 ? 'high' : urgency >= 20 ? 'moderate' : 'low'

  // ── Differential Diagnosis ──
  const differentials: DiagnosisCandidate[] = []

  for (const [key, profile] of Object.entries(NEUROCORE_KB)) {
    const syndrome = key as SyndromeKey
    const criteria = profile.diagnosticCriteria.map(c => ({
      ...c,
      matched: matchCriterion(c.criterion, d),
    }))
    const totalMajor = criteria.filter(c => c.weight === 'major').length
    const matchedMajor = criteria.filter(c => c.weight === 'major' && c.matched).length
    const matchedMinor = criteria.filter(c => c.weight === 'minor' && c.matched).length
    const matchedSupp = criteria.filter(c => c.weight === 'supportive' && c.matched).length

    const confidence = Math.min(95, Math.round(
      (matchedMajor / Math.max(totalMajor, 1)) * 60 +
      matchedMinor * 12 +
      matchedSupp * 5
    ))

    if (confidence > 5) {
      differentials.push({
        syndrome, confidence, matchedCriteria: criteria,
        totalMajor, matchedMajor,
        color: SYNDROME_COLORS[syndrome],
        urgency: confidence >= 60 ? 'critical' : confidence >= 40 ? 'high' : confidence >= 20 ? 'moderate' : 'low',
      })
    }
  }
  differentials.sort((a, b) => b.confidence - a.confidence)

  // ── Red Flags ──
  const redFlags: RedFlagHit[] = []
  for (const [key, profile] of Object.entries(NEUROCORE_KB)) {
    const syndrome = key as SyndromeKey
    for (const flag of profile.globalRedFlags) {
      if (matchRedFlag(flag, d)) {
        redFlags.push({ flag, source: syndrome, severity: 'critical' })
      }
    }
  }
  // Generic red flags
  if (d.gcs <= 8) redFlags.push({ flag: 'GCS ≤ 8 — Intubation à considérer', source: 'FIRES', severity: 'critical' })
  if (d.pupils === 'fixed_both') redFlags.push({ flag: 'Mydriase bilatérale aréactive', source: 'FIRES', severity: 'critical' })
  if (d.seizureType === 'refractory_status') redFlags.push({ flag: 'Status épileptique réfractaire', source: 'FIRES', severity: 'critical' })
  if (d.lactate > 4) redFlags.push({ flag: `Lactate ${d.lactate} mmol/L — Hypoxie tissulaire`, source: 'FIRES', severity: 'critical' })
  if (d.temp >= 40) redFlags.push({ flag: 'Hyperthermie ≥ 40°C', source: 'FIRES', severity: 'warning' })
  // Deduplicate
  const uniqueFlags = redFlags.filter((f, i) => redFlags.findIndex(x => x.flag === f.flag) === i)

  // ── Recommended Exams ──
  const exams: RecommendedExam[] = []
  if (!d.eegDone && d.seizures24h > 0) {
    exams.push({ name: 'EEG continu urgent', urgency: 'immediate', rationale: 'Crises documentées — monitoring EEG indispensable', forSyndromes: ['FIRES', 'NMDAR', 'NORSE'] })
  }
  if (!d.eegDone && d.gcs <= 12) {
    exams.push({ name: 'EEG standard', urgency: 'urgent', rationale: 'Trouble de conscience — exclure NCSE', forSyndromes: ['FIRES', 'NMDAR'] })
  }
  if (!d.mriDone && (d.seizures24h > 0 || d.gcs <= 12 || d.focalSigns.length > 0)) {
    exams.push({ name: 'IRM cérébrale + Gadolinium', urgency: 'urgent', rationale: 'Bilan étiologique neurologique', forSyndromes: ['FIRES', 'NMDAR', 'MOGAD'] })
  }
  if (!d.csfDone && (d.seizures24h > 0 || d.gcs <= 12 || d.temp >= 38.5)) {
    exams.push({ name: 'Ponction lombaire', urgency: d.gcs <= 8 ? 'immediate' : 'urgent', rationale: 'Analyse LCR — cellularité, anticorps, cultures', forSyndromes: ['FIRES', 'NMDAR', 'NORSE'] })
  }
  if (d.csfDone && d.csfAntibodies === 'negative') {
    exams.push({ name: 'Panel anticorps étendu (sérum + LCR)', urgency: 'urgent', rationale: 'Anticorps de surface et intracellulaires', forSyndromes: ['NMDAR', 'MOGAD'] })
  }
  if (d.covidRecent || (d.crp > 100 && d.temp >= 38.5)) {
    exams.push({ name: 'Troponine + D-dimères + Pro-BNP', urgency: 'urgent', rationale: 'Bilan PIMS/MIS-C — atteinte cardiaque', forSyndromes: ['PIMS'] })
  }
  if (d.crp === 0 && d.wbc === 8) {
    exams.push({ name: 'NFS + CRP + PCT + Ferritine', urgency: 'standard', rationale: 'Bilan inflammatoire de base', forSyndromes: ['FIRES', 'PIMS', 'NMDAR', 'MOGAD', 'NORSE'] })
  }

  // ── Similar Cases ──
  const similarCases: SimilarCase[] = REGISTRY
    .map(r => ({
      caseId: r.case_id,
      family: r.family,
      region: r.region,
      ageDiff: Math.abs(r.age_months - (d.ageMonths || 60)),
      severity: r.severity_1to5 || 0,
      outcome: r.outcome_12m,
    }))
    .filter(c => {
      const topSyndrome = differentials[0]?.syndrome
      if (!topSyndrome) return true
      // EAIS in registry = NMDAR in our syndromes
      const familyMap: Record<string, string> = { NMDAR: 'EAIS', FIRES: 'FIRES', NORSE: 'NORSE', MOGAD: 'MOGAD', PIMS: 'PIMS' }
      return c.family === (familyMap[topSyndrome] || topSyndrome) || c.family === topSyndrome
    })
    .sort((a, b) => a.ageDiff - b.ageDiff)
    .slice(0, 4)

  // ── Engine Readiness ──
  const engineReadiness = [
    { engine: 'VPS', ready: d.gcs > 0 && d.hr > 0, reason: d.gcs > 0 ? 'GCS + constantes disponibles' : 'Besoin GCS + constantes' },
    { engine: 'TDE', ready: differentials.length > 0 && d.seizureType !== '', reason: differentials.length > 0 ? 'Hypothèse diagnostique active' : 'Besoin données cliniques' },
    { engine: 'PVE', ready: d.currentDrugs.length > 0, reason: d.currentDrugs.length > 0 ? `${d.currentDrugs.length} médicament(s) à surveiller` : 'Aucun traitement renseigné' },
    { engine: 'EWE', ready: d.gcs > 0 && d.seizures24h > 0, reason: d.seizures24h > 0 ? 'Données temporelles suffisantes' : 'Besoin historique crises' },
    { engine: 'TPE', ready: differentials.some(dd => dd.confidence >= 40), reason: differentials.some(dd => dd.confidence >= 40) ? 'Confiance diagnostique suffisante' : 'Confiance diagnostique trop basse' },
  ]

  // ── Clinical Summary ──
  const topD = differentials[0]
  let summary = ''
  if (completeness < 20) {
    summary = 'Données insuffisantes — renseignez l\'identité et les données cliniques.'
  } else if (completeness < 50) {
    summary = `Analyse préliminaire. ${topD ? `Orientation vers ${topD.syndrome} (${topD.confidence}%).` : 'Pas d\'orientation diagnostique claire.'} Compléter le bilan.`
  } else {
    summary = topD
      ? `${topD.syndrome} en tête (${topD.confidence}%). ${topD.matchedMajor}/${topD.totalMajor} critères majeurs. ${uniqueFlags.length} red flag${uniqueFlags.length > 1 ? 's' : ''} identifié${uniqueFlags.length > 1 ? 's' : ''}. ${exams.filter(e => e.urgency === 'immediate').length} examen(s) immédiats recommandés.`
      : `Pas d'orientation diagnostique forte. ${uniqueFlags.length > 0 ? `${uniqueFlags.length} red flag(s) à surveiller.` : ''} Compléter les examens.`
  }

  return {
    urgencyScore: urgency,
    urgencyLevel,
    differentials,
    redFlags: uniqueFlags,
    recommendedExams: exams,
    similarCases,
    engineReadiness,
    clinicalSummary: summary,
    completeness,
  }
}

// ── Criterion Matching ──

function matchCriterion(criterion: string, d: IntakeData): boolean {
  const cl = criterion.toLowerCase()
  // FIRES criteria
  if (cl.includes('fièvre') && cl.includes('prodrom')) return d.feverBefore && d.feverDays >= 1
  if (cl.includes('fièvre') && cl.includes('initiale')) return d.feverBefore
  if (cl.includes('status') && cl.includes('réfractaire')) return d.seizureType === 'refractory_status' || d.seizureType === 'super_refractory'
  if (cl.includes('crises') && cl.includes('réfractaire')) return d.seizures24h >= 5 || d.seizureType.includes('refractory')
  if (cl.includes('crises') && cl.includes('récurrent')) return d.seizures24h >= 3
  if (cl.includes('étiologie') && cl.includes('exclue')) return d.csfDone && d.csfAntibodies === 'negative'
  if (cl.includes('lcr') && cl.includes('pléiocytose')) return d.csfDone && d.csfCells > 5
  if (cl.includes('lcr') && cl.includes('inflammatoire')) return d.csfDone && (d.csfCells > 5 || d.csfProtein > 0.45)
  if (cl.includes('eeg') && cl.includes('anormal')) return d.eegDone && d.eegStatus !== 'normal'
  if (cl.includes('irm') && cl.includes('anormal')) return d.mriDone && d.mriFindings.length > 0
  if (cl.includes('irm') && cl.includes('normal')) return d.mriDone && d.mriFindings.length === 0
  // NMDAR / autoimmune
  if (cl.includes('psychiatri')) return d.consciousness === 'agitated' || d.consciousness === 'confused'
  if (cl.includes('mouvement') && cl.includes('anorma')) return d.focalSigns.includes('dyskinesia') || d.focalSigns.includes('chorea')
  if (cl.includes('dysautonomie')) return d.hr > 140 || d.temp >= 39.5 || d.spo2 < 92
  if (cl.includes('anticorps') && cl.includes('positif')) return d.csfAntibodies !== 'negative' && d.csfAntibodies !== ''
  if (cl.includes('anticorps') && cl.includes('anti-nmdar')) return d.csfAntibodies === 'nmdar'
  if (cl.includes('anti-mog')) return d.csfAntibodies === 'mog'
  // MOGAD
  if (cl.includes('névrite optique')) return d.focalSigns.includes('optic_neuritis')
  if (cl.includes('démyélinisation')) return d.mriFindings.includes('demyelination_large') || d.mriFindings.includes('demyelination_periventricular')
  if (cl.includes('adem')) return d.mriFindings.includes('demyelination_large')
  // PIMS
  if (cl.includes('covid') || cl.includes('sars-cov')) return d.covidRecent
  if (cl.includes('inflammat') && cl.includes('systém')) return d.crp > 50 && d.temp >= 38.5
  if (cl.includes('fièvre') && cl.includes('>38') || cl.includes('persistante')) return d.temp >= 38.5
  if (cl.includes('pédiatrique') || cl.includes('<18') || cl.includes('enfant')) return d.ageMonths < 216
  // Generic
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
  if (fl.includes('nfl')) return false // Need biomarker data
  return false
}
