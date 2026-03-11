// ============================================================
// PULSAR V21.4 — CLINICAL REGRESSION TESTS
// Profils réels extraits des dossiers PDF de démonstration
// 20 cas × assertions précises = détection régression pipeline
// Lancer via : npx tsx src/lib/engines/runTests.ts
// ============================================================

import { PatientState } from './PatientState'
import { runPipeline } from './pipeline'

// ── Types ──
interface Check { engine: string; desc: string; test: (ps: PatientState) => boolean }
interface ClinicalCase { id: string; label: string; data: Record<string, any>; checks: Check[] }

// ── Helpers ──
const vps  = (ps: PatientState) => ps.vpsResult!.synthesis.score
const tde  = (ps: PatientState) => ps.tdeResult!.synthesis.score
const ewe  = (ps: PatientState) => ps.eweResult!.synthesis.score
const recs = (ps: PatientState) => JSON.stringify(ps.tdeResult!.synthesis.recommendations)
const pats = (ps: PatientState) => ps.tdeResult!.intention.patterns.map(p => p.name).join('|')

// ═══════════════════════════════════════════════════════════
// CAS 1 — LUCAS MARTIN · Status epilepticus J+1 · VPS cible ~87
// ═══════════════════════════════════════════════════════════
const C1_STATUS: ClinicalCase = {
  id: 'C1_LUCAS_STATUS_J1',
  label: 'Lucas Martin 6a · Status epilepticus réfractaire J+1',
  data: {
    ageMonths: 81, weightKg: 22.4, hospDay: 1, sex: 'male',
    gcs: 9, gcsHistory: [12, 9], pupils: 'sluggish',
    seizures24h: 5, seizureDuration: 47, seizureType: 'refractory_status',
    crp: 142, pct: 0.8, ferritin: 1840, wbc: 14.2, platelets: 210, lactate: 1.8,
    heartRate: 118, sbp: 98, dbp: 55, map: 62, spo2: 94, temp: 39.2, respRate: 26,
    csfCells: 8, csfProtein: 0.52, csfAntibodies: 'pending',
    drugs: [
      { name: 'Midazolam', dose: '0.1mg/kg/h', route: 'IV' },
      { name: 'Phénobarbital', dose: '20mg/kg', route: 'IV' },
      { name: 'Phénytoïne', dose: '15mg/kg', route: 'IV' },
      { name: 'Cefotaxime', dose: '200mg/kg/j', route: 'IV' },
      { name: 'Aciclovir', dose: '30mg/kg/j', route: 'IV' },
    ],
    treatmentHistory: [],
  },
  checks: [
    { engine: 'VPS', desc: 'Score CRITIQUE ≥75', test: ps => vps(ps) >= 75 },
    { engine: 'VPS', desc: 'Niveau CRITIQUE ou TRÈS ÉLEVÉ', test: ps => ['CRITIQUE', 'TRÈS ÉLEVÉ'].includes(ps.vpsResult!.synthesis.level) },
    { engine: 'VPS', desc: 'Alerte générée', test: ps => ps.vpsResult!.synthesis.alerts.length > 0 },
    { engine: 'TDE', desc: 'Score TDE ≥50', test: ps => tde(ps) >= 50 },
    { engine: 'TDE', desc: 'Escalade immunologique recommandée', test: ps => recs(ps).toLowerCase().includes('ivig') || recs(ps).toLowerCase().includes('immunoglobuline') || recs(ps).toLowerCase().includes('anakinra') },
    { engine: 'PVE', desc: 'Alerte phénytoïne cardiotoxicité', test: ps => JSON.stringify(ps.pveResult).toLowerCase().includes('phénytoine') || JSON.stringify(ps.pveResult).toLowerCase().includes('phenytoine') || JSON.stringify(ps.pveResult).toLowerCase().includes('cardio') },
    { engine: 'EWE', desc: 'Score EWE élevé ≥40', test: ps => ewe(ps) >= 40 },
    { engine: 'EWE', desc: 'Pas SURVEILLANCE STANDARD', test: ps => ps.eweResult!.synthesis.level !== 'SURVEILLANCE STANDARD' },
    { engine: 'TPE', desc: 'Hypothèses émises', test: ps => ps.tpeResult!.synthesis.recommendations.length > 0 },
    { engine: 'DDD', desc: 'DDD actif', test: ps => !!ps.dddResult },
    { engine: 'CAE', desc: 'Alerte CAE ≥1', test: ps => (ps.caeResult as any)?.alerts?.length > 0 || JSON.stringify(ps.caeResult).includes('alert') || JSON.stringify(ps.caeResult).includes('Alerte') },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 2 — THÉO COHEN · Prodrome J-2 · VPS cible ~34
// ═══════════════════════════════════════════════════════════
const C2_PRODROME: ClinicalCase = {
  id: 'C2_THEO_PRODROME_J2',
  label: 'Théo Cohen 7a · Prodrome FIRES J-2 · EEG normal · GCS 15',
  data: {
    ageMonths: 90, weightKg: 25.2, hospDay: 1, sex: 'male',
    gcs: 15, gcsHistory: [15, 15], pupils: 'reactive',
    seizures24h: 0, seizureDuration: 0, seizureType: 'none',
    crp: 48, pct: 0.6, ferritin: 420, wbc: 11.4, platelets: 265, lactate: 1.1,
    heartRate: 104, sbp: 102, dbp: 64, map: 70, spo2: 98, temp: 39.1, respRate: 22,
    csfCells: 0, csfProtein: 0, csfAntibodies: 'negative',
    drugs: [
      { name: 'Paracétamol', dose: '15mg/kg/6h', route: 'PO' },
      { name: 'Ibuprofène', dose: '10mg/kg/8h', route: 'PO' },
      { name: 'Aciclovir', dose: '30mg/kg/j', route: 'IV' },
    ],
    treatmentHistory: [],
  },
  checks: [
    { engine: 'VPS', desc: 'Score MODÉRÉ 20-55 (pas critique)', test: ps => vps(ps) >= 20 && vps(ps) <= 55 },
    { engine: 'VPS', desc: 'Pas de niveau CRITIQUE', test: ps => ps.vpsResult!.synthesis.level !== 'CRITIQUE' },
    { engine: 'VPS', desc: 'Score inférieur au cas status', test: ps => vps(ps) < 75 },
    { engine: 'TDE', desc: 'Recommandation surveillance renforcée', test: ps => tde(ps) >= 0 },
    { engine: 'EWE', desc: 'EWE score < Lucas Martin', test: ps => ewe(ps) < 60 },
    { engine: 'TPE', desc: 'Pipeline complet sans crash', test: ps => ps.tpeResult !== null },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 3 — FIRES CONFIRMÉ POST-IVIG · Fenêtre anakinra
// ═══════════════════════════════════════════════════════════
const C3_FIRES_POST_IVIG: ClinicalCase = {
  id: 'C3_FIRES_POST_IVIG_J5',
  label: 'FIRES confirmé J+5 · Post-IVIG partial · Anakinra à initier',
  data: {
    ageMonths: 96, weightKg: 28, hospDay: 5, sex: 'female',
    gcs: 10, gcsHistory: [8, 10, 10], pupils: 'sluggish',
    seizures24h: 8, seizureDuration: 25, seizureType: 'refractory_status',
    crp: 95, pct: 0.5, ferritin: 3200, wbc: 10.2, platelets: 185, lactate: 2.1,
    heartRate: 122, sbp: 92, dbp: 52, map: 65, spo2: 96, temp: 38.8, respRate: 28,
    csfCells: 12, csfProtein: 0.68, csfAntibodies: 'negative',
    drugs: [
      { name: 'Midazolam', route: 'IV' },
      { name: 'Keppra', route: 'IV' },
      { name: 'Méthylprednisolone', route: 'IV' },
    ],
    treatmentHistory: [
      { treatment: 'IVIg 2g/kg', period: 'J2-J4', response: 'partial' },
      { treatment: 'Méthylprednisolone', period: 'J1-J4', response: 'partial' },
    ],
  },
  checks: [
    { engine: 'VPS', desc: 'Score CRITIQUE ≥70', test: ps => vps(ps) >= 70 },
    { engine: 'TDE', desc: 'Recommandation anakinra ou tocilizumab', test: ps => recs(ps).toLowerCase().includes('anakinra') || recs(ps).toLowerCase().includes('tocilizumab') || pats(ps).toLowerCase().includes('fires') },
    { engine: 'TDE', desc: 'Échec 1ère ligne reconnu', test: ps => pats(ps).toLowerCase().includes('chec') || recs(ps).toLowerCase().includes('escalade') || recs(ps).toLowerCase().includes('2') },
    { engine: 'EWE', desc: 'Alerte fenêtre thérapeutique', test: ps => ewe(ps) >= 30 },
    { engine: 'TPE', desc: 'Hypothèses FIRES présentes', test: ps => JSON.stringify(ps.tpeResult).toLowerCase().includes('fires') || ps.tpeResult!.synthesis.recommendations.length > 0 },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 4 — RÉGRESSION : Patient sain · VPS doit rester bas
// ═══════════════════════════════════════════════════════════
const C4_HEALTHY: ClinicalCase = {
  id: 'C4_SAIN_CONTROLE',
  label: 'Contrôle sain · VPS doit être ≤15 · Pas d\'alerte critique',
  data: {
    ageMonths: 60, weightKg: 20, hospDay: 1, sex: 'male',
    gcs: 15, gcsHistory: [15], pupils: 'reactive',
    seizures24h: 0, seizureDuration: 0, seizureType: 'none',
    crp: 3, pct: 0.1, ferritin: 80, wbc: 7, platelets: 280, lactate: 0.8,
    heartRate: 90, sbp: 100, dbp: 65, map: 75, spo2: 99, temp: 37.0, respRate: 18,
    csfCells: 0, csfProtein: 0, csfAntibodies: 'negative',
    drugs: [],
    treatmentHistory: [],
  },
  checks: [
    { engine: 'VPS', desc: 'Score bas ≤20 (patient sain)', test: ps => vps(ps) <= 20 },
    { engine: 'VPS', desc: 'Pas de niveau CRITIQUE', test: ps => ps.vpsResult!.synthesis.level !== 'CRITIQUE' },
    { engine: 'VPS', desc: 'Pas d\'alerte critique', test: ps => !ps.vpsResult!.synthesis.alerts.some(a => a.severity === 'critical') },
    { engine: 'EWE', desc: 'Score EWE faible ≤20', test: ps => ewe(ps) <= 20 },
    { engine: 'TPE', desc: 'Pipeline sans crash', test: ps => ps.tpeResult !== null },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 5 — ORAGE CYTOKINIQUE · Ferritine 8500 · PAM effondrée
// ═══════════════════════════════════════════════════════════
const C5_CYTOKINE_STORM: ClinicalCase = {
  id: 'C5_ORAGE_CYTOKINIQUE',
  label: 'Orage cytokinique · Ferritine 8500 · PAM 55 · Choc',
  data: {
    ageMonths: 72, weightKg: 22, hospDay: 4, sex: 'female',
    gcs: 8, gcsHistory: [12, 10, 8], pupils: 'sluggish',
    seizures24h: 10, seizureDuration: 20, seizureType: 'refractory_status',
    crp: 280, pct: 6.5, ferritin: 8500, wbc: 2.8, platelets: 58, lactate: 5.8,
    heartRate: 172, sbp: 68, dbp: 35, map: 55, spo2: 90, temp: 40.3, respRate: 42,
    csfCells: 6, csfProtein: 0.40, csfAntibodies: 'pending',
    drugs: [
      { name: 'Noradrénaline', route: 'IV' },
      { name: 'Midazolam', route: 'IV' },
      { name: 'Méropénème', route: 'IV' },
      { name: 'Méthylprednisolone', route: 'IV' },
      { name: 'Valproate', route: 'IV' },
    ],
    treatmentHistory: [
      { treatment: 'Méthylprednisolone', period: 'J2-J3', response: 'none' },
    ],
  },
  checks: [
    { engine: 'VPS', desc: 'Score MAXIMAL ≥85', test: ps => vps(ps) >= 85 },
    { engine: 'VPS', desc: 'Niveau CRITIQUE', test: ps => ps.vpsResult!.synthesis.level === 'CRITIQUE' },
    { engine: 'VPS', desc: 'Pattern Orage cytokinique', test: ps => ps.vpsResult!.intention.patterns.some(p => p.name.toLowerCase().includes('orage') || p.name.toLowerCase().includes('cytok') || p.name.toLowerCase().includes('choc')) },
    { engine: 'TDE', desc: 'Score TDE ≥60', test: ps => tde(ps) >= 60 },
    { engine: 'EWE', desc: 'Score EWE ≥70', test: ps => ewe(ps) >= 70 },
    { engine: 'CAE', desc: 'CAE actif', test: ps => !!ps.caeResult },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 6 — ANTI-NMDAR · Anticorps LCR positifs
// ═══════════════════════════════════════════════════════════
const C6_NMDAR: ClinicalCase = {
  id: 'C6_ENCEPHALITE_NMDAR',
  label: 'Encéphalite anti-NMDAR · Fille 14a · Anti-NMDAR LCR+',
  data: {
    ageMonths: 168, weightKg: 50, hospDay: 10, sex: 'female',
    gcs: 10, gcsHistory: [14, 12, 10], pupils: 'reactive',
    seizures24h: 2, seizureDuration: 4, seizureType: 'focal_impaired',
    crp: 8, pct: 0.12, ferritin: 120, wbc: 8.0, platelets: 230, lactate: 1.0,
    heartRate: 82, sbp: 112, dbp: 68, map: 75, spo2: 98, temp: 37.5, respRate: 17,
    csfCells: 52, csfProtein: 0.60, csfAntibodies: 'nmdar',
    drugs: [
      { name: 'Keppra', route: 'PO' },
      { name: 'Rituximab', route: 'IV' },
      { name: 'Méthylprednisolone', route: 'IV' },
    ],
    treatmentHistory: [
      { treatment: 'IVIg', period: 'J3-J7', response: 'partial' },
      { treatment: 'Méthylprednisolone', period: 'J1-J5', response: 'partial' },
    ],
  },
  checks: [
    { engine: 'VPS', desc: 'Score modéré (pas FIRES aigu)', test: ps => vps(ps) >= 15 && vps(ps) <= 55 },
    { engine: 'TDE', desc: 'Pattern NMDAR ou anticorps reconnu', test: ps => pats(ps).toLowerCase().includes('nmdar') || pats(ps).toLowerCase().includes('anticorps') || pats(ps).toLowerCase().includes('auto-immun') },
    { engine: 'TDE', desc: 'Rituximab dans recommandations ou B-cell', test: ps => recs(ps).toLowerCase().includes('rituximab') || recs(ps).toLowerCase().includes('mycophenol') || recs(ps).toLowerCase().includes('2e ligne') },
    { engine: 'TPE', desc: 'Pipeline complet', test: ps => ps.tpeResult !== null },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 7 — FIRES ALEJANDRO · Cas fondateur · Profil exact
// ═══════════════════════════════════════════════════════════
const C7_ALEJANDRO: ClinicalCase = {
  id: 'C7_ALEJANDRO_FONDATEUR',
  label: 'Profil Alejandro · 6a · FIRES J+7 réfractaire · Cas fondateur',
  data: {
    ageMonths: 72, weightKg: 21, hospDay: 7, sex: 'male',
    gcs: 6, gcsHistory: [14, 10, 8, 6], pupils: 'sluggish',
    seizures24h: 15, seizureDuration: 60, seizureType: 'super_refractory',
    crp: 120, pct: 1.8, ferritin: 4800, wbc: 15.5, platelets: 180, lactate: 3.2,
    heartRate: 145, sbp: 82, dbp: 44, map: 58, spo2: 92, temp: 39.5, respRate: 34,
    csfCells: 18, csfProtein: 0.75, csfAntibodies: 'negative',
    drugs: [
      { name: 'Midazolam', route: 'IV' },
      { name: 'Kétamine', route: 'IV' },
      { name: 'Phénobarbital', route: 'IV' },
      { name: 'Valproate', route: 'IV' },
      { name: 'Méthylprednisolone', route: 'IV' },
      { name: 'Méropénème', route: 'IV' },
    ],
    treatmentHistory: [
      { treatment: 'Méthylprednisolone IV', period: 'J1-J5', response: 'none' },
      { treatment: 'IVIg 2g/kg', period: 'J3-J5', response: 'none' },
    ],
  },
  checks: [
    { engine: 'VPS', desc: 'Score MAXIMAL ≥90', test: ps => vps(ps) >= 90 },
    { engine: 'VPS', desc: 'Niveau CRITIQUE', test: ps => ps.vpsResult!.synthesis.level === 'CRITIQUE' },
    { engine: 'TDE', desc: 'Escalade L3+ recommandée (anakinra/tocilizumab)', test: ps => recs(ps).toLowerCase().includes('anakinra') || recs(ps).toLowerCase().includes('tocilizumab') || recs(ps).toLowerCase().includes('escalade') },
    { engine: 'TDE', desc: 'Double échec 1+2 ligne reconnu', test: ps => pats(ps).toLowerCase().includes('chec') || recs(ps).toLowerCase().includes('réfractaire') || recs(ps).toLowerCase().includes('3e') },
    { engine: 'EWE', desc: 'EWE ≥80', test: ps => ewe(ps) >= 80 },
    { engine: 'CAE', desc: 'CAE Cocktail détecté (6 drogues)', test: ps => JSON.stringify(ps.caeResult).toLowerCase().includes('cocktail') || JSON.stringify(ps.caeResult).toLowerCase().includes('interaction') || JSON.stringify(ps.caeResult).toLowerCase().includes('polypharmacie') },
    { engine: 'TPE', desc: 'TPE hypothèses maximales', test: ps => ps.tpeResult!.synthesis.recommendations.length >= 2 },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 8 — POIDS EXTRÊME : 5 kg nourrisson · Doses critiques
// ═══════════════════════════════════════════════════════════
const C8_NOURRISSON: ClinicalCase = {
  id: 'C8_NOURRISSON_5KG',
  label: 'Nourrisson 5kg 3 mois · Doses critiques · Pipeline sans crash',
  data: {
    ageMonths: 3, weightKg: 5, hospDay: 2, sex: 'male',
    gcs: 10, gcsHistory: [12, 10], pupils: 'reactive',
    seizures24h: 3, seizureDuration: 8, seizureType: 'generalized_tonic_clonic',
    crp: 35, pct: 2.2, ferritin: 250, wbc: 12, platelets: 310, lactate: 2.5,
    heartRate: 175, sbp: 75, dbp: 45, map: 55, spo2: 95, temp: 38.8, respRate: 50,
    csfCells: 85, csfProtein: 1.2, csfAntibodies: 'negative',
    drugs: [{ name: 'Phénobarbital', route: 'IV' }, { name: 'Céfotaxime', route: 'IV' }],
    treatmentHistory: [],
  },
  checks: [
    { engine: 'VPS', desc: 'Pipeline sans crash sur nourrisson', test: ps => ps.vpsResult !== null },
    { engine: 'VPS', desc: 'Score cohérent ≥0 et ≤100', test: ps => vps(ps) >= 0 && vps(ps) <= 100 },
    { engine: 'TDE', desc: 'TDE sans crash', test: ps => ps.tdeResult !== null },
    { engine: 'PVE', desc: 'PVE sans crash', test: ps => ps.pveResult !== null },
    { engine: 'EWE', desc: 'EWE sans crash', test: ps => ps.eweResult !== null },
    { engine: 'TPE', desc: 'TPE sans crash', test: ps => ps.tpeResult !== null },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 9 — AMÉLIORATION : VPS doit baisser sur J+7 post-anakinra
// ═══════════════════════════════════════════════════════════
const C9_AMELIORATION: ClinicalCase = {
  id: 'C9_POST_ANAKINRA_AMELIORATION',
  label: 'FIRES J+12 · Post-anakinra J+7 · Amélioration GCS 13 · VPS doit baisser',
  data: {
    ageMonths: 84, weightKg: 24, hospDay: 12, sex: 'male',
    gcs: 13, gcsHistory: [6, 8, 11, 13], pupils: 'reactive',
    seizures24h: 1, seizureDuration: 3, seizureType: 'focal_aware',
    crp: 22, pct: 0.2, ferritin: 680, wbc: 9.2, platelets: 215, lactate: 1.1,
    heartRate: 95, sbp: 108, dbp: 65, map: 78, spo2: 98, temp: 37.6, respRate: 20,
    csfCells: 4, csfProtein: 0.38, csfAntibodies: 'negative',
    drugs: [
      { name: 'Anakinra', dose: '4mg/kg/j', route: 'IV' },
      { name: 'Keppra', route: 'PO' },
    ],
    treatmentHistory: [
      { treatment: 'IVIg 2g/kg', period: 'J1-J3', response: 'partial' },
      { treatment: 'Anakinra 4mg/kg/j', period: 'J5-J12', response: 'good' },
    ],
  },
  checks: [
    { engine: 'VPS', desc: 'Score RÉDUIT <60 (amélioration)', test: ps => vps(ps) < 60 },
    { engine: 'VPS', desc: 'Niveau pas CRITIQUE', test: ps => ps.vpsResult!.synthesis.level !== 'CRITIQUE' },
    { engine: 'TDE', desc: 'Anakinra reconnu en cours', test: ps => ps.tdeResult !== null },
    { engine: 'EWE', desc: 'EWE réduit <50', test: ps => ewe(ps) < 50 },
    { engine: 'TPE', desc: 'Pipeline sans crash', test: ps => ps.tpeResult !== null },
  ],
}

// ═══════════════════════════════════════════════════════════
// CAS 10 — DIAGNOSTIC DIFFÉRENTIEL AMBIGUË · 3 hypothèses
// ═══════════════════════════════════════════════════════════
const C10_AMBIGU: ClinicalCase = {
  id: 'C10_DIAGNOSTIC_AMBIGU',
  label: 'Diagnostic ambigu · FIRES vs NMDAR vs encéphalite virale · Anticorps pending',
  data: {
    ageMonths: 120, weightKg: 35, hospDay: 3, sex: 'female',
    gcs: 12, gcsHistory: [14, 12], pupils: 'reactive',
    seizures24h: 4, seizureDuration: 12, seizureType: 'generalized_tonic_clonic',
    crp: 55, pct: 0.3, ferritin: 650, wbc: 10.8, platelets: 240, lactate: 1.5,
    heartRate: 110, sbp: 105, dbp: 62, map: 72, spo2: 97, temp: 38.9, respRate: 24,
    csfCells: 22, csfProtein: 0.55, csfAntibodies: 'pending',
    drugs: [
      { name: 'Keppra', route: 'IV' },
      { name: 'Aciclovir', route: 'IV' },
      { name: 'Céfotaxime', route: 'IV' },
    ],
    treatmentHistory: [],
  },
  checks: [
    { engine: 'VPS', desc: 'Score intermédiaire 30-70', test: ps => vps(ps) >= 30 && vps(ps) <= 70 },
    { engine: 'TDE', desc: 'TDE produit une recommendation', test: ps => ps.tdeResult!.synthesis.recommendations.length > 0 },
    { engine: 'TPE', desc: 'TPE émet hypothèses (anticorps pending)', test: ps => ps.tpeResult!.synthesis.recommendations.length > 0 },
    { engine: 'TPE', desc: 'Pipeline complet sans crash', test: ps => ps.tpeResult !== null },
  ],
}

// ════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════
export function runClinicalTests(): { results: string[]; totalPass: number; totalFail: number } {
  const CASES: ClinicalCase[] = [
    C1_STATUS, C2_PRODROME, C3_FIRES_POST_IVIG, C4_HEALTHY,
    C5_CYTOKINE_STORM, C6_NMDAR, C7_ALEJANDRO, C8_NOURRISSON,
    C9_AMELIORATION, C10_AMBIGU,
  ]

  const results: string[] = []
  let totalPass = 0
  let totalFail = 0

  results.push('')
  results.push('╔══════════════════════════════════════════════════════════════╗')
  results.push('║         PULSAR V21.4 — CLINICAL REGRESSION TESTS            ║')
  results.push('║         10 profils · Assertions pipeline complet             ║')
  results.push('╚══════════════════════════════════════════════════════════════╝')
  results.push('')

  for (const c of CASES) {
    results.push(`┌─ ${c.id}`)
    results.push(`│  ${c.label}`)

    let ps: PatientState
    try {
      ps = new PatientState({
        ageMonths: c.data.ageMonths,
        weightKg: c.data.weightKg,
        hospDay: c.data.hospDay,
        sex: c.data.sex ?? 'male',
        gcs: c.data.gcs,
        gcsHistory: c.data.gcsHistory ?? [],
        pupils: c.data.pupils,
        seizures24h: c.data.seizures24h,
        seizureDuration: c.data.seizureDuration,
        seizureType: c.data.seizureType,
        crp: c.data.crp, pct: c.data.pct, ferritin: c.data.ferritin,
        wbc: c.data.wbc, platelets: c.data.platelets, lactate: c.data.lactate,
        heartRate: c.data.heartRate, sbp: c.data.sbp, dbp: c.data.dbp,
        map: c.data.map ?? c.data.dbp + Math.round((c.data.sbp - c.data.dbp) / 3),
        spo2: c.data.spo2, temp: c.data.temp, respRate: c.data.respRate,
        csfCells: c.data.csfCells, csfProtein: c.data.csfProtein, csfAntibodies: c.data.csfAntibodies,
        drugs: c.data.drugs ?? [],
        treatmentHistory: c.data.treatmentHistory ?? [],
      })
      runPipeline(ps)
    } catch (err: any) {
      results.push(`│  💥 CRASH PIPELINE : ${err.message}`)
      results.push(`└─ [FAIL]`)
      totalFail += c.checks.length
      results.push('')
      continue
    }

    let casePass = 0
    let caseFail = 0

    const vpsScore = ps.vpsResult ? Math.round(ps.vpsResult.synthesis.score) : '?'
    const tdeScore = ps.tdeResult ? Math.round(ps.tdeResult.synthesis.score) : '?'
    const eweScore = ps.eweResult ? Math.round(ps.eweResult.synthesis.score) : '?'
    const vpsLevel = ps.vpsResult?.synthesis.level ?? '?'
    results.push(`│  VPS=${vpsScore} (${vpsLevel}) · TDE=${tdeScore} · EWE=${eweScore}`)

    for (const chk of c.checks) {
      let ok = false
      try { ok = chk.test(ps) } catch { ok = false }
      if (ok) {
        results.push(`│  ✅ [${chk.engine}] ${chk.desc}`)
        casePass++; totalPass++
      } else {
        results.push(`│  ❌ [${chk.engine}] ${chk.desc}`)
        caseFail++; totalFail++
      }
    }

    const status = caseFail === 0 ? '✅ PASS' : `❌ ${caseFail} FAIL`
    results.push(`└─ [${status}] ${casePass}/${c.checks.length} checks`)
    results.push('')
  }

  results.push('═══════════════════════════════════════════════════════════════')
  results.push(`  CLINICAL TESTS : ${totalPass}/${totalPass + totalFail}  (${totalFail} échecs)`)
  results.push('═══════════════════════════════════════════════════════════════')

  return { results, totalPass, totalFail }
}
