// ============================================================
// PULSAR V15 — PatientState
// L'objet central : 5 pathologies, 5 moteurs
// ============================================================

// ── Types fondamentaux ──

export type AgeGroup = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent'
export type PupilStatus = 'reactive' | 'sluggish' | 'fixed_one' | 'fixed_both'
export type SeizureType = 'none' | 'focal_aware' | 'focal_impaired' | 'generalized_tonic_clonic' | 'status' | 'refractory_status' | 'super_refractory'
export type AntibodyStatus = 'negative' | 'pending' | 'nmdar' | 'mog' | 'lgi1' | 'caspr2' | 'gaba_b' | 'other_positive'
export type TreatmentResponse = 'none' | 'partial' | 'good' | 'complete'
export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Drug { name: string; dose?: string; route?: string; startDay?: number }
export interface TreatmentRecord { treatment: string; period: string; response: TreatmentResponse; line?: number }
export interface Alert { severity: AlertSeverity; title: string; body: string; source: string }
export interface Recommendation { priority: 'urgent' | 'high' | 'medium' | 'low'; title: string; body: string; reference?: string }

// ── Engine result types ──

export interface SignalDetail { name: string; rawValue: unknown; normalized: number; unit: string; status: 'critical' | 'warning' | 'moderate' | 'normal' }
export interface FieldResult { name: string; category: string; intensity: number; signals: SignalDetail[]; color: string; interpretation: string }
export interface PatternResult { name: string; confidence: number; description: string; implications: string }
export interface ContextDetail { type: string; label: string; detail: string; icon: string }
export interface RuleResult { name: string; type: 'guard' | 'correction' | 'validation'; message: string; reference: string; adjustment?: Record<string, unknown> }

export interface IntentionResult { fields: FieldResult[]; patterns: PatternResult[] }
export interface ContextResult { trend: string; details: ContextDetail[]; contextModifier: number }
export interface CurveResult { trajectory: number[]; currentPosition: number; currentValue: number; globalIntensity: number; trend: string; curveData: number[]; labels: string[] }
export interface SynthesisResult { score: number; level: string; alerts: Alert[]; recommendations: Recommendation[] }

export interface EngineResult {
  engine: string
  intention: IntentionResult
  context: ContextResult
  rules: RuleResult[]
  curve: CurveResult
  synthesis: SynthesisResult
}

// ── EWE specific ──
export interface EWEResult extends EngineResult {
  synthesis: SynthesisResult & {
    riskWindows: { window: string; risk: number; factors: string[] }[]
    predictedTrajectory: { hours: number; estimatedVPS: number }[]
  }
}

// ── TPE specific ──
export interface TPEResult extends EngineResult {
  synthesis: SynthesisResult & {
    hypotheses: TherapeuticHypothesis[]
  }
}

export interface TherapeuticHypothesis {
  id: string
  title: string
  rationale: string
  mechanismOfAction: string
  supportingEvidence: string[]
  confidenceLevel: 'exploratory' | 'emerging' | 'supported'
  targetPathway: string
  applicablePathologies: string[]
}

// ── PIMS/MIS-C ──
export interface PIMSData {
  confirmed: boolean
  covidExposure: boolean
  weeksPostCovid?: number
  troponin?: number
  dDimers?: number
  proBNP?: number
  ejectionFraction?: number
  coronaryAnomaly: boolean
  cardiacInvolvement: boolean
  kawasaki: boolean
}

// ── MOGAD/ADEM ──
export interface MOGADData {
  mogAntibody: boolean
  mogTiter?: number
  opticNeuritis: boolean
  transverseMyelitis: boolean
  ademPresentation: boolean
  bilateralOptic: boolean
  demyelinatingLesions: boolean
}

// ── Normal Ranges ──
export interface NormalRanges {
  hrLow: number; hrHigh: number
  sbpLow: number; sbpHigh: number
  mapLow: number
}

// ── PatientState ──
export class PatientState {
  // Demographics
  ageMonths: number
  weightKg: number
  hospDay: number
  sex: 'male' | 'female'

  // Neuro
  neuro: {
    gcs: number
    gcsHistory: number[]
    pupils: PupilStatus
    seizures24h: number
    seizureDuration: number
    seizureType: SeizureType
  }

  // Biology
  biology: {
    crp: number; pct: number; ferritin: number
    wbc: number; platelets: number; lactate: number
  }

  // Hemodynamics
  hemodynamics: {
    heartRate: number; sbp: number; dbp: number
    map: number; spo2: number; temp: number; respRate: number
  }

  // CSF
  csf: {
    cells: number; protein: number; antibodies: AntibodyStatus
  }

  // Medications
  drugs: Drug[]
  treatmentHistory: TreatmentRecord[]

  // V15 — Extended pathologies
  pims: PIMSData
  mogad: MOGADData

  // Cytokines (for TPE hypothesis generation)
  cytokines?: {
    il1b?: number; il6?: number; il10?: number; tnfa?: number
    ccl2?: number; cxcl1?: number
  }

  // Engine results (filled by pipeline)
  vpsResult: EngineResult | null
  tdeResult: EngineResult | null
  pveResult: EngineResult | null
  eweResult: EWEResult | null
  tpeResult: TPEResult | null

  // Aggregated
  alerts: Alert[]
  recommendations: Recommendation[]

  constructor(data: Record<string, unknown>) {
    const d = data as Record<string, any>

    this.ageMonths = d.ageMonths ?? 0
    this.weightKg = d.weightKg ?? 0
    this.hospDay = d.hospDay ?? 1
    this.sex = d.sex ?? 'male'

    this.neuro = {
      gcs: d.gcs ?? 15,
      gcsHistory: d.gcsHistory ?? [],
      pupils: d.pupils ?? 'reactive',
      seizures24h: d.seizures24h ?? 0,
      seizureDuration: d.seizureDuration ?? 0,
      seizureType: d.seizureType ?? 'none',
    }

    this.biology = {
      crp: d.crp ?? 0, pct: d.pct ?? 0, ferritin: d.ferritin ?? 0,
      wbc: d.wbc ?? 8, platelets: d.platelets ?? 250, lactate: d.lactate ?? 1,
    }

    this.hemodynamics = {
      heartRate: d.heartRate ?? 80,
      sbp: d.sbp ?? 100, dbp: d.dbp ?? 65,
      map: Math.round((d.dbp ?? 65) + ((d.sbp ?? 100) - (d.dbp ?? 65)) / 3),
      spo2: d.spo2 ?? 98, temp: d.temp ?? 37, respRate: d.respRate ?? 18,
    }

    this.csf = {
      cells: d.csfCells ?? 0,
      protein: d.csfProtein ?? 0.3,
      antibodies: d.csfAntibodies ?? 'negative',
    }

    this.drugs = d.drugs ?? []
    this.treatmentHistory = d.treatmentHistory ?? []

    this.pims = d.pims ?? {
      confirmed: false, covidExposure: false,
      coronaryAnomaly: false, cardiacInvolvement: false, kawasaki: false,
    }

    this.mogad = d.mogad ?? {
      mogAntibody: false, opticNeuritis: false, transverseMyelitis: false,
      ademPresentation: false, bilateralOptic: false, demyelinatingLesions: false,
    }

    this.cytokines = d.cytokines

    this.vpsResult = null
    this.tdeResult = null
    this.pveResult = null
    this.eweResult = null
    this.tpeResult = null
    this.alerts = []
    this.recommendations = []
  }

  getAgeGroup(): AgeGroup {
    if (this.ageMonths < 1) return 'neonate'
    if (this.ageMonths < 12) return 'infant'
    if (this.ageMonths < 60) return 'toddler'
    if (this.ageMonths < 144) return 'child'
    return 'adolescent'
  }

  getNormalRanges(): NormalRanges {
    const ranges: Record<AgeGroup, NormalRanges> = {
      neonate: { hrLow: 100, hrHigh: 170, sbpLow: 60, sbpHigh: 90, mapLow: 40 },
      infant: { hrLow: 100, hrHigh: 160, sbpLow: 70, sbpHigh: 100, mapLow: 45 },
      toddler: { hrLow: 80, hrHigh: 140, sbpLow: 75, sbpHigh: 110, mapLow: 50 },
      child: { hrLow: 70, hrHigh: 120, sbpLow: 80, sbpHigh: 120, mapLow: 55 },
      adolescent: { hrLow: 60, hrHigh: 100, sbpLow: 90, sbpHigh: 130, mapLow: 60 },
    }
    return ranges[this.getAgeGroup()]
  }

  getAgeYears(): number {
    return Math.round(this.ageMonths / 12 * 10) / 10
  }
}
