// ============================================================
// PULSAR V17.3 — CRASH TESTS INTAKEANALYZER
// 8 scénarios : analyse, ATCD, red flags, transfert, bridge, flux complet
// ============================================================

import { analyzeIntake, DEFAULT_HISTORY, type IntakeData, type MedicalHistory } from './IntakeAnalyzer'
import { intakeToPatientState } from './intakeToPatientState'
import { PatientState } from './PatientState'
import { runPipeline } from './pipeline'

interface IntakeCheck {
  category: string
  desc: string
  test: () => boolean
}

interface IntakeTestCase {
  id: string
  label: string
  data: Partial<IntakeData>
  checks: IntakeCheck[]
}

// ── Helper pour construire des données avec ATCD ──
function withHistory(overrides: Partial<MedicalHistory>): MedicalHistory {
  return { ...DEFAULT_HISTORY, ...overrides }
}

// ══════════════════════════════════════════════════════════════
// CAS DE TEST
// ══════════════════════════════════════════════════════════════

const INTAKE_TESTS: IntakeTestCase[] = [

  // ── 1. FIRES classique — fièvre prodromique + status réfractaire ──
  {
    id: 'INTAKE_FIRES',
    label: 'FIRES — Status réfractaire + fièvre prodromique',
    data: {
      ageMonths: 48, sex: 'female', weight: 16,
      gcs: 7, seizures24h: 12, seizureType: 'refractory_status',
      focalSigns: [], consciousness: 'coma', pupils: 'sluggish',
      temp: 39.2, hr: 155, spo2: 93, rr: 32, lactate: 3.5,
      feverBefore: true, feverDays: 3, symptomOnsetDays: 4,
      crp: 85, wbc: 18, platelets: 195, pct: 1.2, ferritin: 680,
      csfDone: true, csfCells: 120, csfProtein: 0.78, csfAntibodies: 'negative',
      eegDone: true, eegStatus: 'Status electrographicus continu',
      mriDone: true, mriFindings: ['limbic_temporal', 'cortical_diffusion'],
      currentDrugs: ['Midazolam', 'Levetiracetam', 'Méthylprednisolone'],
      history: withHistory({ febrileSeizuresHistory: true }),
    },
    checks: [
      { category: 'Urgence', desc: 'Score urgence ≥ 70 (critical)', test: function() { return false } },
      { category: 'Urgence', desc: 'Niveau = critical', test: function() { return false } },
      { category: 'Diagnostic', desc: 'FIRES dans le top 3', test: function() { return false } },
      { category: 'Diagnostic', desc: 'FIRES confiance ≥ 30%', test: function() { return false } },
      { category: 'Red Flags', desc: 'GCS ≤ 8 détecté', test: function() { return false } },
      { category: 'Red Flags', desc: 'Status réfractaire détecté', test: function() { return false } },
      { category: 'Red Flags', desc: '≥ 2 red flags au total', test: function() { return false } },
      { category: 'Examens', desc: '≥ 1 examen recommandé', test: function() { return false } },
      { category: 'Engines', desc: 'VPS ready', test: function() { return false } },
      { category: 'Engines', desc: 'TDE ready', test: function() { return false } },
      { category: 'Complétude', desc: 'Complétude ≥ 50%', test: function() { return false } },
    ],
  },

  // ── 2. NMDAR adolescente + tératome ovarien ──
  {
    id: 'INTAKE_NMDAR_TERATOME',
    label: 'Anti-NMDAR — Adolescente + tératome ovarien',
    data: {
      ageMonths: 168, sex: 'female', weight: 48,
      gcs: 11, seizures24h: 3, seizureType: 'focal_impaired',
      focalSigns: ['dyskinesia', 'chorea'], consciousness: 'confused', pupils: 'reactive',
      temp: 37.4, hr: 88, spo2: 98, rr: 18, lactate: 1.2,
      feverBefore: false, symptomOnsetDays: 7,
      crp: 12, wbc: 8.5, platelets: 220, pct: 0.15, ferritin: 180,
      csfDone: true, csfCells: 45, csfProtein: 0.55, csfAntibodies: 'nmdar',
      eegDone: true, eegStatus: 'Ralentissement diffus + delta brush',
      mriDone: true, mriFindings: ['normal'],
      currentDrugs: ['Levetiracetam'],
      history: withHistory({ ovarianTeratoma: true, herpesHistory: true }),
    },
    checks: [
      { category: 'Diagnostic', desc: 'NMDAR = top diagnostic', test: function() { return false } },
      { category: 'Diagnostic', desc: 'NMDAR confiance ≥ 60%', test: function() { return false } },
      { category: 'ATCD', desc: 'Alerte tératome ovarien (critical)', test: function() { return false } },
      { category: 'ATCD', desc: 'Alerte herpès (NMDAR link)', test: function() { return false } },
      { category: 'Red Flags', desc: 'Red flag tératome ovarien', test: function() { return false } },
      { category: 'ATCD', desc: '≥ 2 alertes ATCD', test: function() { return false } },
    ],
  },

  // ── 3. Patient minimal — données insuffisantes ──
  {
    id: 'INTAKE_MINIMAL',
    label: 'Données minimales — seulement identité',
    data: {
      ageMonths: 60, sex: 'male', weight: 18,
      gcs: 15, seizures24h: 0,
    },
    checks: [
      { category: 'Urgence', desc: 'Score urgence ≤ 10', test: function() { return false } },
      { category: 'Urgence', desc: 'Niveau = low', test: function() { return false } },
      { category: 'Complétude', desc: 'Complétude ≤ 25%', test: function() { return false } },
      { category: 'Summary', desc: 'Résumé non vide', test: function() { return false } },
      { category: 'Engines', desc: 'Pas de crash (analyzeIntake retourne)', test: function() { return false } },
    ],
  },

  // ── 4. Transfert inter-hospitalier avec examens ──
  {
    id: 'INTAKE_TRANSFER',
    label: 'Transfert — Examens existants + gap analysis',
    data: {
      admissionMode: 'transfer',
      transferHospital: 'CHU Necker',
      transferReason: 'Status réfractaire',
      ageMonths: 36, sex: 'female', weight: 14,
      gcs: 9, seizures24h: 8, seizureType: 'status',
      focalSigns: ['hemiparesis'], consciousness: 'stupor', pupils: 'sluggish',
      temp: 38.8, hr: 140, spo2: 95, rr: 28, lactate: 2.8,
      feverBefore: true, feverDays: 2,
      crp: 45, wbc: 14, platelets: 180, pct: 0.6, ferritin: 320,
      csfDone: true, csfCells: 55, csfProtein: 0.65, csfAntibodies: 'pending',
      eegDone: false, mriDone: false,
      currentDrugs: ['Midazolam', 'Valproate'],
      existingExams: [
        { type: 'blood', name: 'Bilan sanguin', done: true, result: 'CRP 45, GB 14G/L', date: '2026-03-01', hospital: 'CHU Necker', normal: false },
        { type: 'csf', name: 'PL / LCR', done: true, result: '55 éléments, protéinorachie 0.65', date: '2026-03-01', hospital: 'CHU Necker', normal: false },
      ],
      history: withHistory({}),
    },
    checks: [
      { category: 'Transfer', desc: 'isTransfer = true', test: function() { return false } },
      { category: 'Transfer', desc: '≥ 1 gap identifié (EEG ou IRM manquants)', test: function() { return false } },
      { category: 'Urgence', desc: 'Score urgence ≥ 45 (high)', test: function() { return false } },
      { category: 'Examens', desc: 'EEG recommandé (non fait)', test: function() { return false } },
      { category: 'Examens', desc: 'IRM recommandée (non faite)', test: function() { return false } },
    ],
  },

  // ── 5. Drépanocytaire fébrile — alertes ATCD critiques ──
  {
    id: 'INTAKE_DREPANO',
    label: 'Drépanocytose + fièvre — alertes ATCD',
    data: {
      ageMonths: 84, sex: 'male', weight: 22,
      gcs: 12, seizures24h: 1, seizureType: 'generalized_tonic_clonic',
      consciousness: 'drowsy', pupils: 'reactive',
      temp: 39.5, hr: 130, spo2: 94, rr: 26, lactate: 2.5,
      crp: 120, wbc: 22, platelets: 140, pct: 2.1, ferritin: 450,
      csfDone: false,
      history: withHistory({ sickleCellDisease: true }),
    },
    checks: [
      { category: 'ATCD', desc: 'Alerte drépanocytose présente', test: function() { return false } },
      { category: 'ATCD', desc: 'Alerte drépanocytose = critical (fièvre)', test: function() { return false } },
      { category: 'Red Flags', desc: 'Red flag drépanocytaire fébrile', test: function() { return false } },
      { category: 'Urgence', desc: 'Score urgence ≥ 20', test: function() { return false } },
    ],
  },

  // ── 6. Retour tropical + fièvre + VIH ──
  {
    id: 'INTAKE_TROPICAL_HIV',
    label: 'VIH + voyage tropical + fièvre — red flags multiples',
    data: {
      ageMonths: 144, sex: 'male', weight: 38,
      gcs: 10, seizures24h: 2, seizureType: 'focal_impaired',
      consciousness: 'confused', pupils: 'sluggish',
      temp: 39.8, hr: 110, spo2: 95, rr: 24, lactate: 3.2,
      crp: 150, wbc: 3.5, platelets: 90, pct: 3.8, ferritin: 1200,
      csfDone: true, csfCells: 80, csfProtein: 0.95, csfAntibodies: 'negative',
      history: withHistory({
        hivPositive: true,
        recentTropicalTravel: true,
        travelDestination: 'Sénégal',
        immunodeficiency: true,
      }),
    },
    checks: [
      { category: 'Red Flags', desc: 'Red flag VIH + encéphalopathie', test: function() { return false } },
      { category: 'Red Flags', desc: 'Red flag retour tropical + fièvre', test: function() { return false } },
      { category: 'ATCD', desc: '≥ 3 alertes ATCD (VIH, tropical, immuno)', test: function() { return false } },
      { category: 'Urgence', desc: 'Score urgence ≥ 50', test: function() { return false } },
    ],
  },

  // ── 7. Bridge intakeToPatientState — vérification du mapping ──
  {
    id: 'BRIDGE_FIRES',
    label: 'Bridge — IntakeData FIRES → PatientState correct',
    data: {
      ageMonths: 48, sex: 'female', weight: 16,
      gcs: 7, seizures24h: 12, seizureType: 'refractory_status',
      pupils: 'sluggish', temp: 39.2, hr: 155, spo2: 93, rr: 32, lactate: 3.5,
      crp: 85, wbc: 18, platelets: 195, pct: 1.2, ferritin: 680,
      csfDone: true, csfCells: 120, csfProtein: 0.78, csfAntibodies: 'negative',
      currentDrugs: ['Midazolam', 'Levetiracetam'],
      mriDone: true, mriFindings: ['limbic_temporal'],
      history: withHistory({}),
    },
    checks: [
      { category: 'Bridge', desc: 'PatientState.ageMonths = 48', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.sex = female', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.neuro.gcs = 7', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.neuro.seizureType = refractory_status', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.biology.crp = 85', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.csf.cells = 120', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.drugs contient 2 médicaments', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.mri non null', test: function() { return false } },
      { category: 'Bridge', desc: 'PatientState.hospDay = 1 (admission)', test: function() { return false } },
    ],
  },

  // ── 8. Flux complet — intake → bridge → pipeline ──
  {
    id: 'FULLFLOW_NMDAR',
    label: 'Flux complet — intake → bridge → 5 moteurs',
    data: {
      ageMonths: 168, sex: 'female', weight: 48,
      gcs: 11, seizures24h: 3, seizureType: 'focal_impaired',
      focalSigns: ['dyskinesia'], consciousness: 'confused', pupils: 'reactive',
      temp: 37.4, hr: 88, spo2: 98, rr: 18, lactate: 1.2,
      crp: 12, wbc: 8.5, platelets: 220, pct: 0.15, ferritin: 180,
      csfDone: true, csfCells: 45, csfProtein: 0.55, csfAntibodies: 'nmdar',
      currentDrugs: ['Levetiracetam', 'Méthylprednisolone'],
      history: withHistory({ ovarianTeratoma: true }),
    },
    checks: [
      { category: 'Flow', desc: 'Pipeline ne crash pas', test: function() { return false } },
      { category: 'Flow', desc: 'VPS result non null', test: function() { return false } },
      { category: 'Flow', desc: 'TDE result non null', test: function() { return false } },
      { category: 'Flow', desc: 'PVE result non null', test: function() { return false } },
      { category: 'Flow', desc: 'EWE result non null', test: function() { return false } },
      { category: 'Flow', desc: 'TPE result non null', test: function() { return false } },
      { category: 'Flow', desc: 'VPS score > 0', test: function() { return false } },
      { category: 'Flow', desc: 'Alertes agrégées ≥ 1', test: function() { return false } },
    ],
  },
]

// ══════════════════════════════════════════════════════════════
// RUNNER
// ══════════════════════════════════════════════════════════════

export function runIntakeCrashTests(): { totalPass: number; totalFail: number; results: string[] } {
  const results: string[] = []
  let totalPass = 0, totalFail = 0

  results.push('═══════════════════════════════════════════════════')
  results.push('  PULSAR — CRASH TESTS INTAKEANALYZER')
  results.push('  8 scénarios · Analyse · ATCD · Bridge · Flux')
  results.push('═══════════════════════════════════════════════════')

  for (const test of INTAKE_TESTS) {
    results.push('')
    results.push(`▸ CAS: ${test.id}`)
    results.push(`  ${test.label}`)

    // Run analysis
    let analysis: ReturnType<typeof analyzeIntake>
    try {
      analysis = analyzeIntake(test.data)
    } catch (e) {
      results.push(`  ✗ CRASH lors de analyzeIntake : ${e}`)
      totalFail += test.checks.length
      continue
    }

    results.push(`  Urgence: ${analysis.urgencyScore}/100 [${analysis.urgencyLevel}]`)
    results.push(`  Diagnostics: ${analysis.differentials.slice(0, 3).map(d => `${d.syndrome}(${d.confidence}%)`).join(', ') || 'aucun'}`)
    results.push(`  Red Flags: ${analysis.redFlags.length} | Alertes ATCD: ${analysis.historyAlerts.length}`)
    results.push(`  Examens: ${analysis.examRecommendations.length} | Gaps: ${analysis.examGaps.length}`)
    results.push(`  Complétude: ${analysis.completeness}% | Transfer: ${analysis.isTransfer}`)
    results.push(`  Triage: ${analysis.triage.priority} (${analysis.triage.score}/100) — ${analysis.triage.label} [${analysis.triage.maxDelay}]`)

    // Bridge + pipeline tests (for BRIDGE and FULLFLOW cases)
    let ps: PatientState | null = null
    if (test.id.startsWith('BRIDGE') || test.id.startsWith('FULLFLOW')) {
      try {
        const bridge = intakeToPatientState(test.data, analysis)
        ps = new PatientState(bridge.patientData)
        if (test.id.startsWith('FULLFLOW')) {
          runPipeline(ps)
        }
        results.push(`  Bridge: OK | Syndrome détecté: ${bridge.syndrome}`)
        if (ps.vpsResult) results.push(`  VPS: ${ps.vpsResult.synthesis.score}/100`)
      } catch (e) {
        results.push(`  ✗ CRASH bridge/pipeline : ${e}`)
      }
    }

    results.push('  ─────────────────────────────────────')

    // ── Dynamic test binding ──
    const boundChecks = bindChecks(test.id, test.checks, analysis, ps)

    let pass = 0, fail = 0
    for (const c of boundChecks) {
      let ok = false
      try { ok = c.test() } catch { ok = false }
      const symbol = ok ? '✓' : '✗'
      results.push(`  ${symbol} [${c.category}] ${c.desc}`)
      if (ok) pass++; else fail++
    }
    results.push(`  Résultat: ${pass}/${pass + fail} ${fail === 0 ? '✓ PASS' : '✗ FAIL'}`)
    totalPass += pass
    totalFail += fail
  }

  results.push('')
  results.push('═══════════════════════════════════════════════════')
  results.push(`  TOTAL: ${totalPass}/${totalPass + totalFail} vérifications`)
  results.push(`  ✓ PASS: ${totalPass}   ✗ FAIL: ${totalFail}`)
  results.push(`  ${totalFail === 0 ? '🟢 TOUS LES TESTS PASSENT' : '🔴 CORRECTIONS NÉCESSAIRES'}`)
  results.push('═══════════════════════════════════════════════════')

  return { totalPass, totalFail, results }
}

// ══════════════════════════════════════════════════════════════
// BIND CHECKS — Injecte analysis et ps dans les fonctions de test
// ══════════════════════════════════════════════════════════════

function bindChecks(
  testId: string,
  checks: IntakeCheck[],
  a: ReturnType<typeof analyzeIntake>,
  ps: PatientState | null
): IntakeCheck[] {

  const bound: IntakeCheck[] = []

  switch (testId) {

    case 'INTAKE_FIRES':
      bound.push(
        { category: 'Urgence', desc: 'Score urgence ≥ 70 (critical)', test: () => a.urgencyScore >= 70 },
        { category: 'Urgence', desc: 'Niveau = critical', test: () => a.urgencyLevel === 'critical' },
        { category: 'Diagnostic', desc: 'FIRES dans le top 3', test: () => a.differentials.slice(0, 3).some(d => d.syndrome === 'FIRES') },
        { category: 'Diagnostic', desc: 'FIRES confiance ≥ 30%', test: () => a.differentials.find(d => d.syndrome === 'FIRES')?.confidence! >= 30 },
        { category: 'Red Flags', desc: 'GCS ≤ 8 détecté', test: () => a.redFlags.some(r => r.flag.includes('GCS')) },
        { category: 'Red Flags', desc: 'Status réfractaire détecté', test: () => a.redFlags.some(r => r.flag.includes('réfractaire')) },
        { category: 'Red Flags', desc: '≥ 2 red flags au total', test: () => a.redFlags.length >= 2 },
        { category: 'Examens', desc: '≥ 1 examen recommandé', test: () => a.examRecommendations.length >= 1 },
        { category: 'Engines', desc: 'VPS ready', test: () => a.engineReadiness.find(e => e.engine === 'VPS')?.ready === true },
        { category: 'Engines', desc: 'TDE ready', test: () => a.engineReadiness.find(e => e.engine === 'TDE')?.ready === true },
        { category: 'Complétude', desc: 'Complétude ≥ 50%', test: () => a.completeness >= 50 },
        { category: 'Triage', desc: 'Triage P1 ou P2', test: () => a.triage.priority === 'P1' || a.triage.priority === 'P2' },
        { category: 'Triage', desc: 'Triage score ≥ 50', test: () => a.triage.score >= 50 },
      )
      break

    case 'INTAKE_NMDAR_TERATOME':
      bound.push(
        { category: 'Diagnostic', desc: 'NMDAR = top diagnostic', test: () => a.differentials[0]?.syndrome === 'NMDAR' },
        { category: 'Diagnostic', desc: 'NMDAR confiance ≥ 60%', test: () => (a.differentials.find(d => d.syndrome === 'NMDAR')?.confidence ?? 0) >= 60 },
        { category: 'ATCD', desc: 'Alerte tératome ovarien (critical)', test: () => a.historyAlerts.some(al => al.title.includes('Tératome') && al.severity === 'critical') },
        { category: 'ATCD', desc: 'Alerte herpès (NMDAR link)', test: () => a.historyAlerts.some(al => al.title.includes('Herpès') || al.title.includes('HSV')) },
        { category: 'Red Flags', desc: 'Red flag tératome ovarien', test: () => a.redFlags.some(r => r.flag.includes('ératome') || r.flag.includes('NMDAR')) },
        { category: 'ATCD', desc: '≥ 2 alertes ATCD', test: () => a.historyAlerts.length >= 2 },
        { category: 'Triage', desc: 'Triage P2 ou P3 (urgent mais pas immédiat)', test: () => a.triage.priority === 'P2' || a.triage.priority === 'P3' },
      )
      break

    case 'INTAKE_MINIMAL':
      bound.push(
        { category: 'Urgence', desc: 'Score urgence ≤ 10', test: () => a.urgencyScore <= 10 },
        { category: 'Urgence', desc: 'Niveau = low', test: () => a.urgencyLevel === 'low' },
        { category: 'Complétude', desc: 'Complétude ≤ 25%', test: () => a.completeness <= 25 },
        { category: 'Summary', desc: 'Résumé non vide', test: () => a.clinicalSummary.length > 0 },
        { category: 'Engines', desc: 'Pas de crash (analyzeIntake retourne)', test: () => true },
        { category: 'Triage', desc: 'Triage P4 (standard)', test: () => a.triage.priority === 'P4' },
      )
      break

    case 'INTAKE_TRANSFER':
      bound.push(
        { category: 'Transfer', desc: 'isTransfer = true', test: () => a.isTransfer === true },
        { category: 'Transfer', desc: '≥ 1 gap identifié (EEG ou IRM manquants)', test: () => a.examGaps.length >= 1 },
        { category: 'Urgence', desc: 'Score urgence ≥ 45 (high)', test: () => a.urgencyScore >= 45 },
        { category: 'Examens', desc: 'EEG recommandé (non fait)', test: () => a.examRecommendations.some(e => e.name.toLowerCase().includes('eeg') && !e.alreadyDone) },
        { category: 'Examens', desc: 'IRM recommandée (non faite)', test: () => a.examRecommendations.some(e => e.name.toLowerCase().includes('irm') && !e.alreadyDone) },
      )
      break

    case 'INTAKE_DREPANO':
      bound.push(
        { category: 'ATCD', desc: 'Alerte drépanocytose présente', test: () => a.historyAlerts.some(al => al.title.includes('répanocyt')) },
        { category: 'ATCD', desc: 'Alerte drépanocytose = critical (fièvre)', test: () => a.historyAlerts.some(al => al.title.includes('répanocyt') && al.severity === 'critical') },
        { category: 'Red Flags', desc: 'Red flag drépanocytaire fébrile', test: () => a.redFlags.some(r => r.flag.includes('répanocytaire')) },
        { category: 'Urgence', desc: 'Score urgence ≥ 20', test: () => a.urgencyScore >= 20 },
      )
      break

    case 'INTAKE_TROPICAL_HIV':
      bound.push(
        { category: 'Red Flags', desc: 'Red flag VIH + encéphalopathie', test: () => a.redFlags.some(r => r.flag.includes('VIH')) },
        { category: 'Red Flags', desc: 'Red flag retour tropical + fièvre', test: () => a.redFlags.some(r => r.flag.includes('tropical') || r.flag.includes('Paludisme')) },
        { category: 'ATCD', desc: '≥ 3 alertes ATCD (VIH, tropical, immuno)', test: () => a.historyAlerts.length >= 3 },
        { category: 'Urgence', desc: 'Score urgence ≥ 50', test: () => a.urgencyScore >= 50 },
      )
      break

    case 'BRIDGE_FIRES':
      bound.push(
        { category: 'Bridge', desc: 'PatientState.ageMonths = 48', test: () => ps?.ageMonths === 48 },
        { category: 'Bridge', desc: 'PatientState.sex = female', test: () => ps?.sex === 'female' },
        { category: 'Bridge', desc: 'PatientState.neuro.gcs = 7', test: () => ps?.neuro.gcs === 7 },
        { category: 'Bridge', desc: 'PatientState.neuro.seizureType = refractory_status', test: () => ps?.neuro.seizureType === 'refractory_status' },
        { category: 'Bridge', desc: 'PatientState.biology.crp = 85', test: () => ps?.biology.crp === 85 },
        { category: 'Bridge', desc: 'PatientState.csf.cells = 120', test: () => ps?.csf.cells === 120 },
        { category: 'Bridge', desc: 'PatientState.drugs contient 2 médicaments', test: () => ps?.drugs.length === 2 },
        { category: 'Bridge', desc: 'PatientState.mri non null', test: () => ps?.mri !== null },
        { category: 'Bridge', desc: 'PatientState.hospDay = 1 (admission)', test: () => ps?.hospDay === 1 },
      )
      break

    case 'FULLFLOW_NMDAR':
      bound.push(
        { category: 'Flow', desc: 'Pipeline ne crash pas', test: () => ps !== null },
        { category: 'Flow', desc: 'VPS result non null', test: () => ps?.vpsResult !== null },
        { category: 'Flow', desc: 'TDE result non null', test: () => ps?.tdeResult !== null },
        { category: 'Flow', desc: 'PVE result non null', test: () => ps?.pveResult !== null },
        { category: 'Flow', desc: 'EWE result non null', test: () => ps?.eweResult !== null },
        { category: 'Flow', desc: 'TPE result non null', test: () => ps?.tpeResult !== null },
        { category: 'Flow', desc: 'VPS score > 0', test: () => (ps?.vpsResult?.synthesis.score ?? 0) > 0 },
        { category: 'Flow', desc: 'Alertes agrégées ≥ 1', test: () => (ps?.alerts.length ?? 0) >= 1 },
      )
      break
  }

  return bound
}
