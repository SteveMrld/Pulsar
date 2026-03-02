// ============================================================
// PULSAR V17.3 — intakeToPatientState
// Bridge : IntakeData + IntakeAnalysis → PatientState constructor data
// Connecte l'Analyse Intelligente au pipeline des 5 moteurs
// ============================================================

import type { IntakeData, IntakeAnalysis } from '@/lib/engines/IntakeAnalyzer'
import type { AntibodyStatus, SeizureType, PupilStatus } from '@/lib/engines/PatientState'

// ── Map intake seizure type string → PatientState SeizureType ──
function mapSeizureType(raw: string): SeizureType {
  const mapping: Record<string, SeizureType> = {
    focal_aware: 'focal_aware',
    focal_impaired: 'focal_impaired',
    generalized_tonic_clonic: 'generalized_tonic_clonic',
    status: 'status',
    refractory_status: 'refractory_status',
    super_refractory: 'super_refractory',
  }
  return mapping[raw] || 'none'
}

// ── Map intake pupil string → PatientState PupilStatus ──
function mapPupils(raw: string): PupilStatus {
  const mapping: Record<string, PupilStatus> = {
    reactive: 'reactive',
    sluggish: 'sluggish',
    fixed_one: 'fixed_one',
    fixed_both: 'fixed_both',
  }
  return mapping[raw] || 'reactive'
}

// ── Map intake antibody string → PatientState AntibodyStatus ──
function mapAntibodies(raw: string): AntibodyStatus {
  const mapping: Record<string, AntibodyStatus> = {
    negative: 'negative',
    pending: 'pending',
    nmdar: 'nmdar',
    mog: 'mog',
    lgi1: 'lgi1',
    caspr2: 'caspr2',
    other_positive: 'other_positive',
  }
  return mapping[raw] || 'negative'
}

// ── Determine suspected condition from top differential ──
function determineSyndrome(analysis: IntakeAnalysis): string {
  if (analysis.differentials.length === 0) return 'En cours d\'évaluation'
  const top = analysis.differentials[0]
  const syndromeLabels: Record<string, string> = {
    FIRES: 'FIRES',
    NORSE: 'NORSE',
    NMDAR: 'Anti-NMDAR',
    MOGAD: 'MOGAD',
    PIMS: 'PIMS-TS',
  }
  return syndromeLabels[top.syndrome] || top.syndrome
}

// ── Age display string ──
function formatAge(ageMonths: number): string {
  if (ageMonths < 1) return 'Nouveau-né'
  if (ageMonths < 12) return `${ageMonths} mois`
  if (ageMonths < 24) return `${Math.floor(ageMonths / 12)} an`
  return `${Math.floor(ageMonths / 12)} ans`
}

// ── Estimate heart rate normals by age for fallback ──
function defaultHR(ageMonths: number): number {
  if (ageMonths < 12) return 130
  if (ageMonths < 60) return 100
  if (ageMonths < 144) return 85
  return 75
}

// ── Build drugs array from current drugs strings ──
function buildDrugs(currentDrugs: string[]): { name: string }[] {
  return currentDrugs.filter(d => d.trim()).map(d => ({ name: d.trim() }))
}

// ══════════════════════════════════════════════════════════════
// MAIN BRIDGE FUNCTION
// ══════════════════════════════════════════════════════════════

export interface IntakeBridgeResult {
  patientData: Record<string, any>
  displayName: string
  age: string
  syndrome: string
}

export function intakeToPatientState(
  data: Partial<IntakeData>,
  analysis: IntakeAnalysis
): IntakeBridgeResult {
  const d = data as Record<string, any>
  const ageMonths = d.ageMonths || 0
  const sex = d.sex || 'male'

  // ── Build PatientState constructor data ──
  const patientData: Record<string, any> = {
    // Demographics
    ageMonths,
    weightKg: d.weight || 0,
    hospDay: 1, // Jour 1 — admission
    sex,

    // Neuro
    gcs: d.gcs ?? 15,
    gcsHistory: d.gcs && d.gcs !== 15 ? [d.gcs] : [],
    pupils: mapPupils(d.pupils || 'reactive'),
    seizures24h: d.seizures24h || 0,
    seizureDuration: d.seizures24h > 0 ? 30 : 0, // estimation par défaut
    seizureType: mapSeizureType(d.seizureType || ''),

    // Biology
    crp: d.crp || 0,
    pct: d.pct || 0,
    ferritin: d.ferritin || 0,
    wbc: d.wbc || 8,
    platelets: d.platelets || 250,
    lactate: d.lactate || 1,

    // Hemodynamics
    heartRate: d.hr || defaultHR(ageMonths),
    sbp: 100, // valeur par défaut pédiatrique
    dbp: 65,
    spo2: d.spo2 || 98,
    temp: d.temp || 37,
    respRate: d.rr || 18,

    // CSF
    csfCells: d.csfDone ? (d.csfCells || 0) : 0,
    csfProtein: d.csfDone ? (d.csfProtein || 0.3) : 0.3,
    csfAntibodies: mapAntibodies(d.csfAntibodies || 'negative'),

    // Medications
    drugs: buildDrugs(d.currentDrugs || []),
    treatmentHistory: [],
  }

  // ── MOGAD-specific data from ATCD ──
  if (d.history) {
    const h = d.history
    if (h.previousADEM || h.previousOpticNeuritis || h.previousMyelitis) {
      patientData.mogad = {
        mogAntibody: d.csfAntibodies === 'mog',
        opticNeuritis: h.previousOpticNeuritis || (d.focalSigns || []).includes('optic_neuritis'),
        transverseMyelitis: h.previousMyelitis,
        ademPresentation: h.previousADEM,
        bilateralOptic: false,
        demyelinatingLesions: (d.mriFindings || []).some((f: string) => f.includes('demyelination')),
      }
    }

    // ── PIMS-specific data ──
    if (h.recentCovid || h.previousKawasaki) {
      patientData.pims = {
        confirmed: false,
        covidExposure: h.recentCovid,
        weeksPostCovid: h.covidWeeksAgo || undefined,
        coronaryAnomaly: false,
        cardiacInvolvement: false,
        kawasaki: h.previousKawasaki,
      }
    }
  }

  // ── EEG data from intake ──
  if (d.eegDone && d.eegStatus) {
    patientData.eeg = {
      background: d.eegStatus.includes('slow') ? 'moderately_slow' : 'normal',
      reactivity: !d.eegStatus.includes('unreactive'),
      ictalPatterns: d.seizureType?.includes('status') ? ['status_electrographicus'] : [],
      interictalPatterns: d.eegStatus.includes('epileptiform') ? ['epileptiform_focal'] : [],
      signaturePattern: d.eegStatus || 'nonspecific',
      seizuresPerHour: d.seizures24h ? Math.round(d.seizures24h / 24) : 0,
      NCSEstatus: d.seizureType === 'refractory_status' || d.seizureType === 'super_refractory',
      continuousMonitoring: true,
      lastUpdateHours: 0,
      trend: 'stable',
    }
  }

  // ── MRI data from intake ──
  if (d.mriDone && (d.mriFindings || []).length > 0) {
    patientData.mri = {
      performed: true,
      dayPerformed: 1,
      findings: d.mriFindings || [],
      t2FlairAbnormal: d.mriFindings?.some((f: string) => f !== 'normal'),
      t2FlairLocations: d.mriFindings?.includes('limbic_temporal') ? ['temporal'] : [],
      diffusionRestriction: d.mriFindings?.includes('cortical_diffusion'),
      diffusionLocations: d.mriFindings?.includes('cortical_diffusion') ? ['cortical'] : [],
      gadoliniumEnhancement: d.mriFindings?.includes('meningeal_enhancement'),
      gadoliniumLocations: d.mriFindings?.includes('meningeal_enhancement') ? ['meningeal'] : [],
      edemaType: 'none',
      midlineShift: false,
      herniation: false,
      followUpComparison: 'first',
    }
  }

  // ── Determine syndrome label ──
  const syndrome = determineSyndrome(analysis)

  return {
    patientData,
    displayName: '', // sera rempli par le formulaire intake
    age: formatAge(ageMonths),
    syndrome,
  }
}

export { formatAge }
