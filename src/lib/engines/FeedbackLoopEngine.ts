// ============================================================
// PULSAR V20 — FeedbackLoop Engine (Moteur 8)
// "Chaque enfant rend le systeme plus intelligent pour le suivant"
//
// 4 fonctions :
//   1. Snapshot : anonymise + capture etat PULSAR a admission
//   2. Checkpoint : programme le suivi (J3, J7, J14, sortie, M6, M12)
//   3. Learn : compare predictions vs realite
//   4. Insights : extrait des patterns de la cohorte
//
// Couleur identitaire : #10B981 (emerald)
// ============================================================

import type { PatientState } from './PatientState'

// ── Types ──

export interface OutcomeSnapshot {
  anonId: string
  syndrome: string
  ageMonths: number
  region: string
  admission: {
    gcs: number
    crp: number
    ferritin: number
    wbc: number
    csfCells: number
    csfProtein: number
    antibody: string
    il1b: number | null
    il6: number | null
    il1ra: number | null
    cxcl10: number | null
    eegPattern: string | null
    mriAbnormal: boolean
  }
  pulsar: {
    triageScore: number
    triagePriority: string
    vpsScore: number
    tdeScore: number
    tdeLine: number
    eweScore: number
    pveScore: number
  }
  predictions: PredictionRecord[]
  hypotheses: { id: string; title: string; type: string; confidence: number }[]
  treatments: { treatment: string; line: number; startDay: number; response: string }[]
  capturedAt: string
}

export interface PredictionRecord {
  engine: string
  type: string
  prediction: string
  confidence: number
  reasoning: string
}

export interface Checkpoint {
  type: 'J3' | 'J7' | 'J14' | 'discharge' | 'M6' | 'M12' | 'annual'
  scheduledAt: Date
  measures: string[]
  domains: string[]
}

export interface FeedbackEntry {
  predictionType: string
  engine: string
  predicted: string
  actual: string
  accuracy: 'correct' | 'partially_correct' | 'incorrect'
  delta: number | null
  learning: string
}

export interface CohortInsight {
  pattern: string
  n: number
  finding: string
  confidence: number
  actionable: boolean
  source: string
}

// ══════════════════════════════════════════════════════════════
// FEEDBACK LOOP ENGINE
// ══════════════════════════════════════════════════════════════

export class FeedbackLoopEngine {
  cohort: OutcomeSnapshot[] = []

  // ──────────────────────────────────────────────────────────
  // 1. SNAPSHOT — Capturer etat anonymise a admission
  // ──────────────────────────────────────────────────────────

  captureSnapshot(ps: PatientState): OutcomeSnapshot {
    const anonId = this.anonymize(ps.ageMonths + '-' + ps.hospDay + '-' + ps.neuro.gcs + '-' + Date.now())
    const predictions: PredictionRecord[] = []

    if (ps.vpsResult) {
      predictions.push({
        engine: 'VPS',
        type: 'severity',
        prediction: ps.vpsResult.synthesis.level,
        confidence: ps.vpsResult.synthesis.score / 100,
        reasoning: 'Score ' + ps.vpsResult.synthesis.score + '/100',
      })
    }

    if (ps.tdeResult) {
      predictions.push({
        engine: 'TDE',
        type: 'treatment_response',
        prediction: ps.tdeResult.synthesis.level,
        confidence: ps.tdeResult.synthesis.score / 100,
        reasoning: (ps.tdeResult.synthesis.recommendations || [])[0]?.title || 'L1',
      })
    }

    if (ps.eweResult) {
      predictions.push({
        engine: 'EWE',
        type: 'deterioration_risk',
        prediction: ps.eweResult.synthesis.level,
        confidence: ps.eweResult.synthesis.score / 100,
        reasoning: 'Score anticipation ' + ps.eweResult.synthesis.score + '/100',
      })
    }

    if (ps.tpeResult) {
      predictions.push({
        engine: 'TPE',
        type: 'therapeutic_hypothesis',
        prediction: ps.tpeResult.synthesis.level,
        confidence: ps.tpeResult.synthesis.score / 100,
        reasoning: (ps.tpeResult.synthesis.recommendations?.length || 0) + ' hypothese(s)',
      })
    }

    return {
      anonId,
      syndrome: this.detectSyndrome(ps),
      ageMonths: ps.ageMonths,
      region: 'non_specified',

      admission: {
        gcs: ps.neuro.gcs,
        crp: ps.biology.crp,
        ferritin: ps.biology.ferritin,
        wbc: ps.biology.wbc,
        csfCells: ps.csf.cells,
        csfProtein: ps.csf.protein,
        antibody: ps.csf.antibodies,
        il1b: ps.neuroBiomarkers?.il1bCsf ?? null,
        il6: ps.neuroBiomarkers?.il6Csf ?? null,
        il1ra: ps.neuroBiomarkers?.il1raCsf ?? null,
        cxcl10: ps.neuroBiomarkers?.cxcl10Csf ?? null,
        eegPattern: ps.eeg?.signaturePattern ?? null,
        mriAbnormal: ps.mri?.t2FlairAbnormal ?? false,
      },

      pulsar: {
        triageScore: 0,
        triagePriority: 'P4',
        vpsScore: ps.vpsResult?.synthesis.score ?? 0,
        tdeScore: ps.tdeResult?.synthesis.score ?? 0,
        tdeLine: this.extractLine(ps),
        eweScore: ps.eweResult?.synthesis.score ?? 0,
        pveScore: ps.pveResult?.synthesis.score ?? 0,
      },

      predictions,

      hypotheses: (ps.tpeResult?.synthesis.recommendations || []).map((r, i) => ({
        id: 'hyp-' + anonId + '-' + i,
        title: r.title,
        type: 'therapeutic',
        confidence: 0.5,
      })),

      treatments: ps.treatmentHistory.map(t => ({
        treatment: t.treatment,
        line: this.treatmentLine(t.treatment),
        startDay: ps.hospDay,
        response: t.response,
      })),

      capturedAt: new Date().toISOString(),
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. CHECKPOINTS — Programmer le suivi
  // Base sur Wickstrom 2022 (J3/J7) + Espino 2025 (M6/M12)
  // ──────────────────────────────────────────────────────────

  generateCheckpoints(admissionDate: Date): Checkpoint[] {
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)

    return [
      // J3 — Deadline immunotherapie H72 (Wickstrom 2022 Delphi consensus)
      {
        type: 'J3',
        scheduledAt: addDays(admissionDate, 3),
        measures: [
          'GCS', 'CRP', 'Ferritine', 'Crises/24h', 'EEG pattern',
          'BHB si KD initie', 'IL-6 LCR si disponible',
        ],
        domains: ['Reponse L1', 'Decision escalade H72'],
      },

      // J7 — Deadline L2 + KD (Wickstrom 2022)
      {
        type: 'J7',
        scheduledAt: addDays(admissionDate, 7),
        measures: [
          'GCS', 'CRP', 'Ferritine', 'Crises/24h', 'EEG', 'IRM controle',
          'BHB (objectif >4.0 mmol/L)', 'IL-6 LCR', 'IL-1b LCR',
        ],
        domains: ['Reponse therapeutique', 'Resolution SE', 'Sevrage sedation'],
      },

      // J14 — Controle intermediaire
      {
        type: 'J14',
        scheduledAt: addDays(admissionDate, 14),
        measures: [
          'GCS', 'EEG', 'IRM', 'Bilan neurocognitif preliminaire',
          'Projet de sortie',
        ],
        domains: ['Stabilisation', 'Orientation pronostique'],
      },

      // Sortie
      {
        type: 'discharge',
        scheduledAt: addDays(admissionDate, 21),
        measures: [
          'GCS sortie', 'Traitements sortie', 'EEG sortie',
          'Destination (domicile/SSR/transfert)', 'Plan suivi',
        ],
        domains: ['Etat neurologique', 'Epilepsie residuelle', 'Orientation'],
      },

      // M6 — Premier bilan LTO complet (Espino 2025, 8 domaines)
      {
        type: 'M6',
        scheduledAt: addDays(admissionDate, 180),
        measures: [
          'Eval neuropsychologique (QI, memoire, attention)',
          'Bilan epilepsie (frequence crises, ASM)',
          'Screening psychiatrique (depression, anxiete, TSPT)',
          'Qualite de vie (PedsQL ou equivalent)',
          'Eval sociale (scolarite, PAI)',
          'Questionnaire charge aidants (Zarit)',
          'IRM controle', 'EEG controle',
        ],
        domains: [
          'Neuropsychologique', 'Neurologique', 'Psychiatrique',
          'Qualite de vie', 'Social', 'Charge aidants',
        ],
      },

      // M12 — Deuxieme bilan LTO complet
      {
        type: 'M12',
        scheduledAt: addDays(admissionDate, 365),
        measures: [
          'Reeval neuropsychologique complete',
          'Bilan epilepsie + tentative sevrage ASM',
          'Screening psychiatrique',
          'Qualite de vie',
          'Eval sociale et scolaire',
          'Charge aidants',
          'Trajectoire recuperation vs M6',
        ],
        domains: [
          'Neuropsychologique', 'Neurologique', 'Psychiatrique',
          'Qualite de vie', 'Social', 'Charge aidants', 'Mortalite',
        ],
      },
    ]
  }

  // ──────────────────────────────────────────────────────────
  // 3. LEARN — Comparer predictions vs realite
  // ──────────────────────────────────────────────────────────

  comparePredictions(
    snapshot: OutcomeSnapshot,
    actual: {
      seResolved?: boolean
      seResolutionDay?: number
      anestheticWeaningSuccess?: boolean
      dischargeGcs?: number
      dischargeDay?: number
      dischargeDestination?: string
      ltoNeuropsychM6?: string
      mortality?: boolean
    },
  ): FeedbackEntry[] {
    const fb: FeedbackEntry[] = []

    // ── Triage accuracy ──
    if (actual.mortality !== undefined) {
      const triageCorrect =
        (snapshot.pulsar.triagePriority === 'P1' && actual.mortality) ||
        (snapshot.pulsar.triagePriority !== 'P1' && !actual.mortality)
      fb.push({
        predictionType: 'triage',
        engine: 'IntakeAnalyzer',
        predicted: snapshot.pulsar.triagePriority,
        actual: actual.mortality ? 'P1 (deces)' : 'survie',
        accuracy: triageCorrect ? 'correct' : 'incorrect',
        delta: snapshot.pulsar.triageScore,
        learning: (triageCorrect ? 'Triage correct' : 'SOUS-TRIAGE') +
          '. ' + snapshot.syndrome +
          ', GCS=' + snapshot.admission.gcs +
          ', CRP=' + snapshot.admission.crp +
          ', Ferritine=' + snapshot.admission.ferritin + '.',
      })
    }

    // ── TDE : Reponse traitement ──
    if (actual.seResolved !== undefined) {
      const predicted = snapshot.pulsar.tdeScore >= 60 ? 'escalade' : 'L1_suffisante'
      const realLine = snapshot.treatments.some(t => t.line >= 2) ? 'escalade' : 'L1_suffisante'
      fb.push({
        predictionType: 'treatment_response',
        engine: 'TDE',
        predicted: predicted,
        actual: realLine,
        accuracy: predicted === realLine ? 'correct' : 'incorrect',
        delta: snapshot.pulsar.tdeScore,
        learning: 'TDE ' + snapshot.pulsar.tdeScore +
          '. SE resolu J' + (actual.seResolutionDay || '?') + '.',
      })
    }

    // ── EWE : Deterioration ──
    if (actual.dischargeGcs !== undefined) {
      const delta = actual.dischargeGcs - snapshot.admission.gcs
      const eweCorrect =
        (snapshot.pulsar.eweScore >= 50 && delta < 0) ||
        (snapshot.pulsar.eweScore < 30 && delta >= 0)
      fb.push({
        predictionType: 'deterioration',
        engine: 'EWE',
        predicted: 'EWE ' + snapshot.pulsar.eweScore,
        actual: 'GCS ' + snapshot.admission.gcs + ' -> ' + actual.dischargeGcs + ' (delta ' + (delta >= 0 ? '+' : '') + delta + ')',
        accuracy: eweCorrect ? 'correct' : 'partially_correct',
        delta: delta,
        learning: 'EWE ' + snapshot.pulsar.eweScore + '. GCS delta ' + delta + '.',
      })
    }

    // ── VPS : Pronostic vital ──
    if (actual.mortality !== undefined) {
      const vpsCorrect =
        (snapshot.pulsar.vpsScore >= 70 && actual.mortality) ||
        (snapshot.pulsar.vpsScore < 40 && !actual.mortality)
      fb.push({
        predictionType: 'vital_prognosis',
        engine: 'VPS',
        predicted: 'VPS ' + snapshot.pulsar.vpsScore,
        actual: actual.mortality ? 'decede' : 'survie',
        accuracy: vpsCorrect ? 'correct' : 'partially_correct',
        delta: snapshot.pulsar.vpsScore,
        learning: 'VPS ' + snapshot.pulsar.vpsScore +
          ' pour ' + snapshot.syndrome + '. ' +
          (actual.mortality ? 'Deces' : 'Survie') + '.',
      })
    }

    // ── LTO neuropsychologique ──
    if (actual.ltoNeuropsychM6) {
      const severeActual = ['moderate', 'severe'].includes(actual.ltoNeuropsychM6)
      const predictedSevere = snapshot.pulsar.vpsScore >= 60
      const acc = predictedSevere === severeActual ? 'correct' :
        Math.abs(snapshot.pulsar.vpsScore - 60) < 15 ? 'partially_correct' : 'incorrect'
      fb.push({
        predictionType: 'lto_neuropsych',
        engine: 'TPE',
        predicted: predictedSevere ? 'sequelles moderees-severes' : 'sequelles legeres',
        actual: actual.ltoNeuropsychM6,
        accuracy: acc,
        delta: null,
        learning: 'TPE base sur VPS ' + snapshot.pulsar.vpsScore +
          '. Neuropsych M6 : ' + actual.ltoNeuropsychM6 + '.',
      })
    }

    return fb
  }

  // ──────────────────────────────────────────────────────────
  // 4. INSIGHTS — Extraire des patterns de la cohorte
  // C'est ici que PULSAR genere des connaissances nouvelles
  // ──────────────────────────────────────────────────────────

  generateCohortInsights(
    outcomes: OutcomeSnapshot[],
    feedbacks: FeedbackEntry[],
  ): CohortInsight[] {
    const insights: CohortInsight[] = []
    if (outcomes.length < 5) return insights

    // ── Taux echec L1 par syndrome ──
    const syndromes = [...new Set(outcomes.map(o => o.syndrome))]
    for (const syn of syndromes) {
      const synO = outcomes.filter(o => o.syndrome === syn)
      const l1Fail = synO.filter(o =>
        o.treatments.some(t => t.line === 1 && t.response === 'none')
      )
      if (synO.length >= 3) {
        const rate = Math.round((l1Fail.length / synO.length) * 100)
        insights.push({
          pattern: 'Echec L1 ' + syn,
          n: synO.length,
          finding: rate + '% echec L1 (' + l1Fail.length + '/' + synO.length + ') dans ' + syn,
          confidence: synO.length >= 10 ? 0.8 : 0.5,
          actionable: rate > 60,
          source: 'FeedbackLoop - Cohorte PULSAR',
        })
      }
    }

    // ── Validation hypothese H1 : CRP >80 predicteur ──
    const fires = outcomes.filter(o => o.syndrome === 'FIRES')
    if (fires.length >= 5) {
      const hiCRP = fires.filter(o => o.admission.crp > 80)
      const loCRP = fires.filter(o => o.admission.crp <= 80)
      const hiFail = hiCRP.filter(o =>
        o.treatments.some(t => t.line === 1 && t.response === 'none')
      )
      const loFail = loCRP.filter(o =>
        o.treatments.some(t => t.line === 1 && t.response === 'none')
      )
      if (hiCRP.length >= 2 && loCRP.length >= 2) {
        const hiRate = Math.round((hiFail.length / hiCRP.length) * 100)
        const loRate = Math.round((loFail.length / loCRP.length) * 100)
        insights.push({
          pattern: 'CRP >80 predicteur echec L1 (FIRES)',
          n: fires.length,
          finding: 'Echec L1 : ' + hiRate + '% si CRP>80 (n=' + hiCRP.length +
            ') vs ' + loRate + '% si CRP<=80 (n=' + loCRP.length + ')',
          confidence: fires.length >= 15 ? 0.75 : 0.45,
          actionable: hiRate - loRate > 30,
          source: 'FeedbackLoop - Validation hypothese H1',
        })
      }
    }

    // ── Precision moteurs ──
    const engines = [...new Set(feedbacks.map(f => f.engine))]
    for (const eng of engines) {
      const ef = feedbacks.filter(f => f.engine === eng)
      if (ef.length >= 5) {
        const correct = ef.filter(f => f.accuracy === 'correct').length
        const acc = Math.round((correct / ef.length) * 100)
        insights.push({
          pattern: 'Precision ' + eng,
          n: ef.length,
          finding: eng + ' : ' + acc + '% correct (' + correct + '/' + ef.length + ')',
          confidence: ef.length >= 20 ? 0.85 : 0.5,
          actionable: acc < 60,
          source: 'FeedbackLoop - Auto-evaluation',
        })
      }
    }

    // ── Timing anakinra ──
    const anakinra = outcomes.filter(o =>
      o.treatments.some(t => t.treatment.toLowerCase().includes('anakinra'))
    )
    if (anakinra.length >= 3) {
      const early = anakinra.filter(o => {
        const tx = o.treatments.find(t => t.treatment.toLowerCase().includes('anakinra'))
        return (tx?.startDay ?? 99) <= 7
      })
      const late = anakinra.filter(o => {
        const tx = o.treatments.find(t => t.treatment.toLowerCase().includes('anakinra'))
        return (tx?.startDay ?? 0) > 7
      })
      if (early.length >= 1 && late.length >= 1) {
        insights.push({
          pattern: 'Timing anakinra et reponse',
          n: anakinra.length,
          finding: 'Anakinra <=J7 : ' + early.length + ' pts | >J7 : ' + late.length +
            ' pts - Comparer outcomes M6',
          confidence: 0.4,
          actionable: true,
          source: 'FeedbackLoop - Wickstrom 2018 (avant J14 = 50% reduction crises)',
        })
      }
    }

    // ── Ferritine seuil ──
    if (fires.length >= 5) {
      const hiFerr = fires.filter(o => o.admission.ferritin > 500)
      const loFerr = fires.filter(o => o.admission.ferritin <= 500)
      if (hiFerr.length >= 2 && loFerr.length >= 2) {
        insights.push({
          pattern: 'Ferritine >500 et orage cytokinique (FIRES)',
          n: fires.length,
          finding: 'Ferritine >500 : ' + hiFerr.length + ' pts | <=500 : ' + loFerr.length +
            ' pts - Corr avec reponse anakinra a evaluer',
          confidence: 0.4,
          actionable: true,
          source: 'FeedbackLoop - Validation hypothese H2 (transfert MAS->FIRES)',
        })
      }
    }

    return insights
  }

  // ── Helpers ──

  private anonymize(id: string): string {
    let h = 0
    for (let i = 0; i < id.length; i++) {
      h = ((h << 5) - h) + id.charCodeAt(i)
      h |= 0
    }
    return 'ANON-' + Math.abs(h).toString(36).toUpperCase()
  }

  private detectSyndrome(ps: PatientState): string {
    if (ps.csf.antibodies === 'nmdar') return 'NMDAR'
    if (ps.csf.antibodies === 'mog' || ps.mogad.mogAntibody) return 'MOGAD'
    if (ps.pims.confirmed) return 'PIMS'
    if (ps.hemodynamics.temp >= 38 &&
      (ps.neuro.seizureType === 'refractory_status' ||
       ps.neuro.seizureType === 'super_refractory') &&
      (ps.csf.antibodies === 'negative' ||
       ps.csf.antibodies === 'pending')) {
      return 'FIRES'
    }
    return 'NORSE'
  }

  private extractLine(ps: PatientState): number {
    const ts = ps.treatmentHistory.map(t => t.treatment)
    if (['Tocilizumab', 'Anakinra', 'Bortezomib'].some(t => ts.includes(t))) return 3
    if (['Rituximab', 'Cyclophosphamide', 'Plasmapherese'].some(t => ts.includes(t))) return 2
    return 1
  }

  private treatmentLine(t: string): number {
    const tl = t.toLowerCase()
    if (['tocilizumab', 'anakinra', 'bortezomib'].some(l => tl.includes(l))) return 3
    if (['rituximab', 'cyclophosphamide', 'plasmapherese'].some(l => tl.includes(l))) return 2
    return 1
  }
}

// ── Export singleton ──
export const feedbackLoop = new FeedbackLoopEngine()


// ══════════════════════════════════════════════════════════════
// CASE INGESTION — Alejandro R. as Patient 0
// ══════════════════════════════════════════════════════════════

export const PATIENT_ZERO: OutcomeSnapshot = {
  anonId: 'PULSAR-000',
  syndrome: 'FIRES',
  ageMonths: 72,
  region: 'IDF',
  admission: {
    gcs: 8, crp: 80, ferritin: 800, wbc: 18000,
    csfCells: 15, csfProtein: 0.8, antibody: 'pending',
    il1b: null, il6: null, il1ra: null, cxcl10: null,
    eegPattern: 'burst_suppression', mriAbnormal: true,
  },
  pulsar: {
    triageScore: 85, triagePriority: 'P1',
    vpsScore: 100, tdeScore: 100, tdeLine: 3,
    eweScore: 74, pveScore: 50,
  },
  predictions: [
    { engine: 'VPS', type: 'severity', prediction: 'VPS 100 — critical', confidence: 100, reasoning: 'All parameters at maximum' },
    { engine: 'TDE', type: 'pattern', prediction: 'FIRES pattern detected', confidence: 95, reasoning: 'Refractory SE + febrile prodrome + age 6' },
    { engine: 'DDD', type: 'delay', prediction: '4 delays, 48h lost', confidence: 90, reasoning: 'No IVIG, no anakinra, no KD, no Ab panel' },
    { engine: 'CAE', type: 'cascade', prediction: 'Phenytoin × cardiac fragility', confidence: 85, reasoning: 'Cardiotoxicity + polytherapy + inflammation' },
  ],
  hypotheses: [
    { id: 'h1', title: 'FIRES pattern', type: 'diagnostic', confidence: 95 },
    { id: 'h2', title: 'Phenytoin cardiotoxicity', type: 'pharmacovigilance', confidence: 85 },
    { id: 'h3', title: 'MEOPA cascade trigger', type: 'cascade', confidence: 75 },
  ],
  treatments: [
    { treatment: 'midazolam', line: 2, startDay: 0, response: 'partial' },
    { treatment: 'phenytoin', line: 2, startDay: 0, response: 'none' },
    { treatment: 'phenobarbital', line: 2, startDay: 1, response: 'none' },
    { treatment: 'ketamine', line: 3, startDay: 2, response: 'partial' },
    { treatment: 'levetiracetam', line: 1, startDay: 0, response: 'none' },
  ],
  capturedAt: '2025-04-17T00:00:00Z',
}

// Learnings from Patient Zero — seed for future cases
export const PATIENT_ZERO_LEARNINGS = [
  'FIRES prodrome (febrile illness + headache + abdominal pain) → immediate FIRES suspicion age 3-15',
  'MEOPA contraindicated in febrile children with neurological signs — cascade risk (Zier 2010)',
  'Immunotherapy (IVIG) empirically within 48h of refractory SE (Titulaer 2013)',
  'Anakinra within 72h if FIRES suspected (Kenney-Jung 2016, Dilena 2019)',
  'Phenytoin >7 days + concurrent sedatives → cardiac monitoring (troponin + echo)',
  'Ketogenic diet by J2 in suspected FIRES (van Baalen 2023)',
  'Cytokine panel: standard FIRES workup',
  'FIRES must appear explicitly in the medical record when pattern suspected',
]

// Seed
feedbackLoop.cohort = feedbackLoop.cohort || []
feedbackLoop.cohort.push(PATIENT_ZERO)
