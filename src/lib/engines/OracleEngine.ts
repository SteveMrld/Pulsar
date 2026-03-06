// ============================================================
// PULSAR V21 — ORACLE Engine (Clinical Foresight)
// "Simuler le futur du patient selon les décisions thérapeutiques"
//
// Le médecin ne voit plus seulement OÙ EN EST le patient.
// Il voit OÙ IL VA selon les décisions.
//
// Architecture :
//   1. Clone le PatientState actuel
//   2. Applique les effets pharmacologiques d'un scénario à t+Δ
//   3. Fait tourner le pipeline complet sur l'état simulé
//   4. Compare les trajectoires de chaque scénario
//
// Couleur identitaire : #E879F9 (fuchsia/oracle)
// ============================================================

import { PatientState, type Drug, type Alert } from './PatientState'
import { runPipeline } from './pipeline'

// ── Types ──

export interface TherapeuticScenario {
  id: string
  name: string
  description: string
  drugs: Drug[]
  category: 'standard' | 'aggressive' | 'experimental'
  color: string
  // Effets pharmacologiques attendus (facteurs multiplicatifs par heure)
  effects: PharmacologicalEffects
}

export interface PharmacologicalEffects {
  // Neuro — facteurs de réduction par heure (0.95 = -5%/h)
  seizureReductionRate: number      // Réduction crises/24h par heure
  gcsRecoveryRate: number           // Points GCS récupérés par heure
  seizureDurationFactor: number     // Facteur multiplicatif durée crises
  // Inflammation — facteurs de décroissance
  crpDecayRate: number              // Facteur décroissance CRP par heure
  ferritinDecayRate: number         // Facteur décroissance ferritine par heure
  wbcNormalizationRate: number      // Vitesse retour WBC normal
  // Immunologie
  antibodyResponseDelay: number     // Heures avant début effet sur anticorps
  csfCellsDecayRate: number         // Décroissance cellularité LCR
  // Cytokines
  il6DecayRate: number              // Décroissance IL-6
  il1bDecayRate: number             // Décroissance IL-1β
  // Risques
  infectionRiskPerHour: number      // Risque infectieux supplémentaire/h
  immunosuppressionLevel: number    // 0-1, niveau immunosuppression
  hepatotoxicityRisk: number        // 0-1, risque hépatique
}

export interface TimePoint {
  hours: number
  label: string
  simulatedState: PatientState
  vpsScore: number
  vpsLevel: string
  criticalAlerts: number
  seizureRate: number
  crp: number
  gcs: number
  riskOfRefractory: number
  riskOfDeath: number
  neurologicalOutcome: number       // 0-100, estimation récupération neuro
}

export interface ScenarioResult {
  scenario: TherapeuticScenario
  timePoints: TimePoint[]
  finalVPS: number
  bestVPS: number
  worstVPS: number
  averageVPS: number
  totalAlerts: number
  riskProfile: {
    refractoryStatus: number        // % risque status réfractaire
    mortality: number               // % risque mortalité
    severeSequelae: number          // % risque séquelles sévères
    goodRecovery: number            // % chance bonne récupération
  }
  keyInsights: string[]
}

export interface OracleResult {
  patientId: string
  timestamp: string
  baselineVPS: number
  scenarios: ScenarioResult[]
  recommendation: {
    bestScenario: string
    rationale: string
    confidence: number
  }
  // Comparaison sans traitement
  noTreatmentProjection: TimePoint[]
}

// ── Horizons temporels ──
const TIME_HORIZONS = [
  { hours: 6,  label: '6h' },
  { hours: 12, label: '12h' },
  { hours: 24, label: '24h' },
  { hours: 48, label: '48h' },
  { hours: 72, label: '72h' },
]

// ── Scénarios thérapeutiques prédéfinis ──

const DEFAULT_EFFECTS: PharmacologicalEffects = {
  seizureReductionRate: 0,
  gcsRecoveryRate: 0,
  seizureDurationFactor: 1,
  crpDecayRate: 1,
  ferritinDecayRate: 1,
  wbcNormalizationRate: 0,
  antibodyResponseDelay: 48,
  csfCellsDecayRate: 1,
  il6DecayRate: 1,
  il1bDecayRate: 1,
  infectionRiskPerHour: 0,
  immunosuppressionLevel: 0,
  hepatotoxicityRisk: 0,
}

export const PRESET_SCENARIOS: TherapeuticScenario[] = [
  {
    id: 'standard-aed',
    name: 'Protocole standard — Antiépileptiques',
    description: 'Midazolam IV + Levetiracetam + Valproate. Protocole de 1ère/2ème ligne selon guidelines ILAE.',
    drugs: [
      { name: 'Midazolam', dose: '0.2mg/kg/h IV continu', route: 'IV' },
      { name: 'Levetiracetam', dose: '60mg/kg/j', route: 'IV' },
      { name: 'Valproate', dose: '40mg/kg/j', route: 'IV' },
    ],
    category: 'standard',
    color: '#6C7CFF',
    effects: {
      ...DEFAULT_EFFECTS,
      seizureReductionRate: 0.08,        // ~2 crises de moins par 24h chaque heure
      gcsRecoveryRate: 0.02,             // Récupération lente GCS
      seizureDurationFactor: 0.97,       // Légère réduction durée
      crpDecayRate: 0.998,               // Pas d'effet anti-inflammatoire direct
      ferritinDecayRate: 0.999,
      hepatotoxicityRisk: 0.15,          // Valproate = risque hépatique
    },
  },
  {
    id: 'immunotherapy-ivig',
    name: 'Immunothérapie — IVIG + Méthylprednisolone',
    description: 'IVIG 2g/kg sur 5 jours + Méthylprednisolone 30mg/kg/j 5 jours. 1ère ligne immunothérapie (Graus 2016).',
    drugs: [
      { name: 'IVIG', dose: '0.4g/kg/j × 5j', route: 'IV' },
      { name: 'Méthylprednisolone', dose: '30mg/kg/j × 5j', route: 'IV' },
      { name: 'Midazolam', dose: '0.15mg/kg/h', route: 'IV' },
    ],
    category: 'standard',
    color: '#2FD1C8',
    effects: {
      ...DEFAULT_EFFECTS,
      seizureReductionRate: 0.12,
      gcsRecoveryRate: 0.04,
      seizureDurationFactor: 0.95,
      crpDecayRate: 0.985,               // Corticoïdes = anti-inflammatoire puissant
      ferritinDecayRate: 0.99,
      wbcNormalizationRate: 0.02,
      antibodyResponseDelay: 72,          // IVIG met 3j pour agir
      csfCellsDecayRate: 0.99,
      il6DecayRate: 0.99,
      il1bDecayRate: 0.992,
      infectionRiskPerHour: 0.001,
      immunosuppressionLevel: 0.3,
    },
  },
  {
    id: 'aggressive-plasma',
    name: 'Immunothérapie agressive — Plasmaphérèse + IVIG',
    description: 'Plasmaphérèse 5 séances + IVIG + Rituximab. 2ème ligne (Titulaer 2013, anti-NMDAR).',
    drugs: [
      { name: 'Plasmaphérèse', dose: '5 séances / 10j', route: 'extracorporel' },
      { name: 'IVIG', dose: '0.4g/kg/j × 5j', route: 'IV' },
      { name: 'Rituximab', dose: '375mg/m² × 4', route: 'IV' },
      { name: 'Ketamine', dose: '2-5mg/kg/h', route: 'IV' },
    ],
    category: 'aggressive',
    color: '#F59E0B',
    effects: {
      ...DEFAULT_EFFECTS,
      seizureReductionRate: 0.18,         // Ketamine = puissant antiépileptique
      gcsRecoveryRate: 0.06,
      seizureDurationFactor: 0.92,
      crpDecayRate: 0.975,
      ferritinDecayRate: 0.98,
      wbcNormalizationRate: 0.04,
      antibodyResponseDelay: 48,
      csfCellsDecayRate: 0.98,
      il6DecayRate: 0.98,
      il1bDecayRate: 0.985,
      infectionRiskPerHour: 0.003,        // Risque plus élevé
      immunosuppressionLevel: 0.6,
    },
  },
  {
    id: 'experimental-anakinra',
    name: 'Protocole expérimental — Anakinra (anti-IL-1)',
    description: 'Anakinra (anti-IL-1Ra) + Tocilizumab (anti-IL-6). Ciblage cytokinique direct. (Kenney-Jung 2016, Sa 2019).',
    drugs: [
      { name: 'Anakinra', dose: '5-10mg/kg/j SC', route: 'SC' },
      { name: 'Tocilizumab', dose: '8mg/kg IV', route: 'IV' },
      { name: 'Ketamine', dose: '2mg/kg/h', route: 'IV' },
      { name: 'IVIG', dose: '0.4g/kg/j × 5j', route: 'IV' },
    ],
    category: 'experimental',
    color: '#E879F9',
    effects: {
      ...DEFAULT_EFFECTS,
      seizureReductionRate: 0.22,         // Anakinra = effet rapide sur FIRES
      gcsRecoveryRate: 0.08,              // Meilleure récupération neuro
      seizureDurationFactor: 0.88,
      crpDecayRate: 0.96,                 // Tocilizumab = chute rapide CRP
      ferritinDecayRate: 0.97,
      wbcNormalizationRate: 0.05,
      antibodyResponseDelay: 24,          // Action rapide
      csfCellsDecayRate: 0.97,
      il6DecayRate: 0.94,                 // Tocilizumab cible IL-6 directement
      il1bDecayRate: 0.92,               // Anakinra cible IL-1β directement
      infectionRiskPerHour: 0.004,
      immunosuppressionLevel: 0.7,
    },
  },
]

// ── Moteur ORACLE ──

export class OracleEngine {

  /**
   * Clone profond du PatientState
   */
  private cloneState(ps: PatientState): PatientState {
    const data: Record<string, any> = {
      ageMonths: ps.ageMonths,
      weightKg: ps.weightKg,
      hospDay: ps.hospDay,
      sex: ps.sex,
      gcs: ps.neuro.gcs,
      gcsHistory: [...ps.neuro.gcsHistory],
      pupils: ps.neuro.pupils,
      seizures24h: ps.neuro.seizures24h,
      seizureDuration: ps.neuro.seizureDuration,
      seizureType: ps.neuro.seizureType,
      crp: ps.biology.crp,
      pct: ps.biology.pct,
      ferritin: ps.biology.ferritin,
      wbc: ps.biology.wbc,
      platelets: ps.biology.platelets,
      lactate: ps.biology.lactate,
      heartRate: ps.hemodynamics.heartRate,
      sbp: ps.hemodynamics.sbp,
      dbp: ps.hemodynamics.dbp,
      spo2: ps.hemodynamics.spo2,
      temp: ps.hemodynamics.temp,
      respRate: ps.hemodynamics.respRate,
      csfCells: ps.csf.cells,
      csfProtein: ps.csf.protein,
      csfAntibodies: ps.csf.antibodies,
      drugs: [...ps.drugs],
      treatmentHistory: [...ps.treatmentHistory],
      pims: { ...ps.pims },
      mogad: { ...ps.mogad },
      cytokines: ps.cytokines ? { ...ps.cytokines } : undefined,
      eeg: ps.eeg,
      mri: ps.mri,
      neuroBiomarkers: ps.neuroBiomarkers,
    }
    return new PatientState(data)
  }

  /**
   * Applique les effets pharmacologiques d'un scénario sur Δ heures
   */
  private applyEffects(ps: PatientState, effects: PharmacologicalEffects, hours: number): PatientState {
    const state = this.cloneState(ps)

    // ── Neuro ──
    // Réduction des crises
    const seizureReduction = effects.seizureReductionRate * hours
    state.neuro.seizures24h = Math.max(0, state.neuro.seizures24h - seizureReduction)

    // Récupération GCS
    const gcsGain = effects.gcsRecoveryRate * hours
    state.neuro.gcs = Math.min(15, Math.round((state.neuro.gcs + gcsGain) * 10) / 10)

    // Durée des crises
    state.neuro.seizureDuration = Math.max(0, state.neuro.seizureDuration * Math.pow(effects.seizureDurationFactor, hours))

    // Si crises tombent à 0, améliorer le type
    if (state.neuro.seizures24h < 0.5) {
      state.neuro.seizureType = 'none'
      state.neuro.seizureDuration = 0
    } else if (state.neuro.seizures24h < 3 && state.neuro.seizureType === 'refractory_status') {
      state.neuro.seizureType = 'status'
    } else if (state.neuro.seizures24h < 3 && state.neuro.seizureType === 'super_refractory') {
      state.neuro.seizureType = 'refractory_status'
    }

    // Pupilles — amélioration si GCS remonte
    if (state.neuro.gcs >= 10 && state.neuro.pupils === 'sluggish') {
      state.neuro.pupils = 'reactive'
    }
    if (state.neuro.gcs >= 8 && state.neuro.pupils === 'fixed_one') {
      state.neuro.pupils = 'sluggish'
    }

    // ── Inflammation ──
    state.biology.crp = Math.max(0.5, state.biology.crp * Math.pow(effects.crpDecayRate, hours))
    state.biology.ferritin = Math.max(20, state.biology.ferritin * Math.pow(effects.ferritinDecayRate, hours))

    // WBC normalisation (vers 8000)
    const wbcDiff = state.biology.wbc - 8
    state.biology.wbc = 8 + wbcDiff * Math.pow(1 - effects.wbcNormalizationRate, hours)

    // ── LCR ──
    state.csf.cells = Math.max(0, state.csf.cells * Math.pow(effects.csfCellsDecayRate, hours))

    // ── Cytokines ──
    if (state.cytokines) {
      if (state.cytokines.il6 !== undefined) {
        state.cytokines.il6 = Math.max(0, state.cytokines.il6 * Math.pow(effects.il6DecayRate, hours))
      }
      if (state.cytokines.il1b !== undefined) {
        state.cytokines.il1b = Math.max(0, state.cytokines.il1b * Math.pow(effects.il1bDecayRate, hours))
      }
    }

    // ── Médicaments ──
    state.drugs = [...state.drugs]

    // ── Complications (risque infectieux dû à l'immunosuppression) ──
    const infectionRisk = 1 - Math.pow(1 - effects.infectionRiskPerHour, hours)
    if (infectionRisk > 0.1 && hours >= 48) {
      // Légère remontée CRP si risque infectieux élevé
      state.biology.crp += infectionRisk * 5
    }

    return state
  }

  /**
   * Calcule les métriques de risque à partir d'un état simulé
   */
  private calculateRisks(ps: PatientState, effects: PharmacologicalEffects): {
    riskOfRefractory: number
    riskOfDeath: number
    neurologicalOutcome: number
  } {
    const vps = ps.vpsResult?.synthesis.score ?? 50

    // Risque status réfractaire : basé sur VPS + type crises + durée
    let refractoryRisk = vps / 100 * 0.5
    if (ps.neuro.seizureType === 'status') refractoryRisk += 0.2
    if (ps.neuro.seizureType === 'refractory_status') refractoryRisk += 0.35
    if (ps.neuro.seizureType === 'super_refractory') refractoryRisk += 0.5
    refractoryRisk = Math.min(0.95, refractoryRisk)

    // Risque mortalité : VPS > 80 = danger, > 90 = critique
    let deathRisk = 0
    if (vps > 60) deathRisk = (vps - 60) / 100 * 0.3
    if (vps > 80) deathRisk += (vps - 80) / 100 * 0.5
    if (ps.neuro.pupils === 'fixed_both') deathRisk += 0.3
    deathRisk += effects.infectionRiskPerHour * 24 * 0.5 // Risque nosocomial
    deathRisk = Math.min(0.9, deathRisk)

    // Outcome neurologique : inverse du VPS, bonus si GCS haut
    let neuroOutcome = 100 - vps
    if (ps.neuro.gcs >= 12) neuroOutcome += 15
    if (ps.neuro.gcs >= 14) neuroOutcome += 10
    if (ps.neuro.seizures24h === 0) neuroOutcome += 10
    neuroOutcome = Math.max(5, Math.min(95, neuroOutcome))

    return {
      riskOfRefractory: Math.round(refractoryRisk * 100),
      riskOfDeath: Math.round(deathRisk * 100),
      neurologicalOutcome: Math.round(neuroOutcome),
    }
  }

  /**
   * Simule un scénario thérapeutique sur tous les horizons temporels
   */
  simulateScenario(baseState: PatientState, scenario: TherapeuticScenario): ScenarioResult {
    const timePoints: TimePoint[] = []
    const vpsScores: number[] = []

    for (const horizon of TIME_HORIZONS) {
      // Appliquer les effets sur Δ heures
      const simulatedState = this.applyEffects(baseState, scenario.effects, horizon.hours)
      // Ajouter les médicaments du scénario
      simulatedState.drugs = [...simulatedState.drugs, ...scenario.drugs]
      // Faire tourner le pipeline complet
      const result = runPipeline(simulatedState)
      const vps = result.vpsResult?.synthesis.score ?? 50
      vpsScores.push(vps)

      const risks = this.calculateRisks(result, scenario.effects)

      timePoints.push({
        hours: horizon.hours,
        label: horizon.label,
        simulatedState: result,
        vpsScore: vps,
        vpsLevel: result.vpsResult?.synthesis.level ?? 'unknown',
        criticalAlerts: result.alerts.filter(a => a.severity === 'critical').length,
        seizureRate: result.neuro.seizures24h,
        crp: Math.round(result.biology.crp * 10) / 10,
        gcs: Math.round(result.neuro.gcs),
        riskOfRefractory: risks.riskOfRefractory,
        riskOfDeath: risks.riskOfDeath,
        neurologicalOutcome: risks.neurologicalOutcome,
      })
    }

    // Profil de risque global (basé sur le dernier point)
    const last = timePoints[timePoints.length - 1]
    const keyInsights = this.generateInsights(baseState, timePoints, scenario)

    return {
      scenario,
      timePoints,
      finalVPS: last.vpsScore,
      bestVPS: Math.min(...vpsScores),
      worstVPS: Math.max(...vpsScores),
      averageVPS: Math.round(vpsScores.reduce((a, b) => a + b, 0) / vpsScores.length),
      totalAlerts: timePoints.reduce((sum, tp) => sum + tp.criticalAlerts, 0),
      riskProfile: {
        refractoryStatus: last.riskOfRefractory,
        mortality: last.riskOfDeath,
        severeSequelae: Math.max(5, 100 - last.neurologicalOutcome),
        goodRecovery: last.neurologicalOutcome,
      },
      keyInsights,
    }
  }

  /**
   * Génère des insights comparatifs
   */
  private generateInsights(base: PatientState, tps: TimePoint[], scenario: TherapeuticScenario): string[] {
    const insights: string[] = []
    const baseVPS = base.vpsResult?.synthesis.score ?? 50
    const finalVPS = tps[tps.length - 1].vpsScore
    const delta = baseVPS - finalVPS

    if (delta > 20) {
      insights.push(`Réduction VPS significative : ${baseVPS} → ${finalVPS} (-${delta} points en 72h)`)
    } else if (delta > 10) {
      insights.push(`Amélioration modérée : VPS ${baseVPS} → ${finalVPS} (-${delta} points)`)
    } else if (delta < 0) {
      insights.push(`⚠ Dégradation projetée : VPS ${baseVPS} → ${finalVPS} (+${-delta} points)`)
    }

    // Crises
    const baseCrises = base.neuro.seizures24h
    const finalCrises = tps[tps.length - 1].seizureRate
    if (finalCrises < 1 && baseCrises > 3) {
      insights.push(`Cessation des crises projetée à ${tps.find(t => t.seizureRate < 1)?.label ?? '72h'}`)
    }

    // GCS
    if (tps[tps.length - 1].gcs >= 12 && base.neuro.gcs < 10) {
      insights.push(`Récupération conscience : GCS ${base.neuro.gcs} → ${tps[tps.length - 1].gcs}`)
    }

    // Risques
    if (scenario.effects.immunosuppressionLevel > 0.5) {
      insights.push(`Risque infectieux élevé (immunosuppression ${Math.round(scenario.effects.immunosuppressionLevel * 100)}%)`)
    }

    if (scenario.effects.hepatotoxicityRisk > 0.1) {
      insights.push(`Surveillance hépatique requise (risque ${Math.round(scenario.effects.hepatotoxicityRisk * 100)}%)`)
    }

    return insights
  }

  /**
   * Projette l'évolution SANS traitement
   */
  simulateNoTreatment(baseState: PatientState): TimePoint[] {
    const noTreatmentEffects: PharmacologicalEffects = {
      ...DEFAULT_EFFECTS,
      // Sans traitement, dégradation naturelle
      seizureReductionRate: -0.05,        // Augmentation des crises
      gcsRecoveryRate: -0.03,             // Dégradation GCS
      seizureDurationFactor: 1.02,        // Crises plus longues
      crpDecayRate: 1.005,                // Inflammation monte
      ferritinDecayRate: 1.003,
    }

    const timePoints: TimePoint[] = []
    for (const horizon of TIME_HORIZONS) {
      const simulatedState = this.applyEffects(baseState, noTreatmentEffects, horizon.hours)
      const result = runPipeline(simulatedState)
      const vps = result.vpsResult?.synthesis.score ?? 50
      const risks = this.calculateRisks(result, noTreatmentEffects)

      timePoints.push({
        hours: horizon.hours,
        label: horizon.label,
        simulatedState: result,
        vpsScore: vps,
        vpsLevel: result.vpsResult?.synthesis.level ?? 'unknown',
        criticalAlerts: result.alerts.filter(a => a.severity === 'critical').length,
        seizureRate: result.neuro.seizures24h,
        crp: Math.round(result.biology.crp * 10) / 10,
        gcs: Math.round(result.neuro.gcs),
        ...risks,
      })
    }
    return timePoints
  }

  /**
   * ═══ POINT D'ENTRÉE PRINCIPAL ═══
   * Lance la simulation complète : tous les scénarios + no-treatment
   */
  run(baseState: PatientState, scenarios?: TherapeuticScenario[]): OracleResult {
    const activeScenarios = scenarios || PRESET_SCENARIOS
    const baseVPS = baseState.vpsResult?.synthesis.score ?? 50

    // Simuler chaque scénario
    const results = activeScenarios.map(s => this.simulateScenario(baseState, s))

    // Simuler sans traitement
    const noTreatment = this.simulateNoTreatment(baseState)

    // Trouver le meilleur scénario
    const sorted = [...results].sort((a, b) => {
      // Score composite : VPS bas + bonne récupération neuro + peu d'alertes
      const scoreA = a.finalVPS * 0.4 + (100 - a.riskProfile.goodRecovery) * 0.4 + a.totalAlerts * 2
      const scoreB = b.finalVPS * 0.4 + (100 - b.riskProfile.goodRecovery) * 0.4 + b.totalAlerts * 2
      return scoreA - scoreB
    })

    const best = sorted[0]
    const bestNoTreatVPS = noTreatment[noTreatment.length - 1]?.vpsScore ?? 100

    return {
      patientId: 'current',
      timestamp: new Date().toISOString(),
      baselineVPS: baseVPS,
      scenarios: results,
      noTreatmentProjection: noTreatment,
      recommendation: {
        bestScenario: best.scenario.id,
        rationale: `${best.scenario.name} offre le meilleur profil bénéfice/risque : `
          + `VPS projeté ${best.finalVPS} (vs ${bestNoTreatVPS} sans traitement), `
          + `${best.riskProfile.goodRecovery}% de probabilité de bonne récupération neurologique, `
          + `${best.riskProfile.mortality}% de risque mortalité.`,
        confidence: Math.min(0.85, 0.5 + (bestNoTreatVPS - best.finalVPS) / 100),
      },
    }
  }
}

// ── Export singleton ──
export const oracleEngine = new OracleEngine()
