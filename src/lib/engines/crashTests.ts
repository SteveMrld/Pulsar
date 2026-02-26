// ============================================================
// PULSAR V15 — CRASH TESTS
// 5 scénarios × 5 moteurs = validation complète
// ============================================================

import { PatientState } from './PatientState'
import { runPipeline } from './pipeline'

interface Check {
  engine: string
  desc: string
  test: (ps: PatientState) => boolean
}

interface TestCase {
  id: string
  data: Record<string, any>
  checks: Check[]
}

const TESTS: TestCase[] = [
  {
    id: 'FIRES',
    data: {
      ageMonths: 48, weightKg: 16, hospDay: 4, gcs: 7, gcsHistory: [12, 9], pupils: 'sluggish',
      seizures24h: 12, seizureDuration: 45, seizureType: 'refractory_status',
      crp: 85, pct: 1.2, ferritin: 680, wbc: 18, platelets: 195, lactate: 3.5,
      heartRate: 155, sbp: 80, dbp: 45, spo2: 93, temp: 39.2, respRate: 32,
      csfCells: 120, csfProtein: 0.78, csfAntibodies: 'negative',
      drugs: [{ name: 'Midazolam' }, { name: 'Levetiracetam' }, { name: 'Méthylprednisolone' }, { name: 'Céfotaxime' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J1-J3', response: 'none' }],
    },
    checks: [
      { engine: 'VPS', desc: 'Score 70-100', test: ps => ps.vpsResult!.synthesis.score >= 70 && ps.vpsResult!.synthesis.score <= 100 },
      { engine: 'VPS', desc: 'Niveau CRITIQUE', test: ps => ps.vpsResult!.synthesis.level === 'CRITIQUE' },
      { engine: 'VPS', desc: 'Pattern Détérioration', test: ps => ps.vpsResult!.intention.patterns.some(p => p.name.includes('Détérioration')) },
      { engine: 'TDE', desc: 'Score ≥60', test: ps => ps.tdeResult!.synthesis.score >= 60 },
      { engine: 'TDE', desc: 'Pattern FIRES', test: ps => ps.tdeResult!.intention.patterns.some(p => p.name.includes('FIRES')) },
      { engine: 'TDE', desc: 'Échec 1ère ligne', test: ps => ps.tdeResult!.intention.patterns.some(p => p.name.includes('Échec')) },
      { engine: 'TDE', desc: 'Recommandation escalade', test: ps => ps.tdeResult!.synthesis.recommendations.length > 0 },
      { engine: 'PVE', desc: 'Cocktail détecté', test: ps => JSON.stringify(ps.pveResult).includes('Cocktail') },
      { engine: 'EWE', desc: 'Score EWE ≥30', test: ps => ps.eweResult!.synthesis.score >= 30 },
      { engine: 'EWE', desc: 'Fenêtre pré-critique ou vigilance', test: ps => ps.eweResult!.synthesis.level !== 'SURVEILLANCE STANDARD' },
      { engine: 'TPE', desc: 'Hypothèses générées', test: ps => ps.tpeResult!.synthesis.recommendations.length > 0 },
    ],
  },
  {
    id: 'NMDAR',
    data: {
      ageMonths: 168, weightKg: 48, hospDay: 7, gcs: 11, gcsHistory: [13, 12], pupils: 'reactive',
      seizures24h: 3, seizureDuration: 5, seizureType: 'focal_impaired',
      crp: 12, pct: 0.15, ferritin: 180, wbc: 8.5, platelets: 220, lactate: 1.2,
      heartRate: 88, sbp: 110, dbp: 70, spo2: 98, temp: 37.4, respRate: 18,
      csfCells: 45, csfProtein: 0.55, csfAntibodies: 'nmdar',
      drugs: [{ name: 'Levetiracetam' }, { name: 'Rituximab' }, { name: 'Méthylprednisolone' }, { name: 'Oméprazole' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J1-J3', response: 'partial' }, { treatment: 'IVIg', period: 'J2-J6', response: 'partial' }],
    },
    checks: [
      { engine: 'VPS', desc: 'Score 10-40', test: ps => ps.vpsResult!.synthesis.score >= 10 && ps.vpsResult!.synthesis.score <= 40 },
      { engine: 'TDE', desc: 'Score ≥40', test: ps => ps.tdeResult!.synthesis.score >= 40 },
      { engine: 'TDE', desc: 'Pattern NMDAR', test: ps => ps.tdeResult!.intention.patterns.some(p => p.name.includes('NMDAR')) },
      { engine: 'TDE', desc: 'NMDAR confiance ≥90%', test: ps => ps.tdeResult!.intention.patterns.some(p => p.name.includes('NMDAR') && p.confidence >= 0.9) },
      { engine: 'PVE', desc: 'Cumul immunosuppresseur', test: ps => JSON.stringify(ps.pveResult).includes('immunosuppresseur') },
      { engine: 'EWE', desc: 'EWE non critique', test: ps => ps.eweResult!.synthesis.score < 70 },
    ],
  },
  {
    id: 'CYTOKINE',
    data: {
      ageMonths: 72, weightKg: 22, hospDay: 5, gcs: 10, gcsHistory: [14, 13], pupils: 'sluggish',
      seizures24h: 6, seizureDuration: 12, seizureType: 'generalized_tonic_clonic',
      crp: 210, pct: 4.5, ferritin: 8500, wbc: 2.8, platelets: 65, lactate: 5.2,
      heartRate: 165, sbp: 70, dbp: 38, spo2: 91, temp: 40.1, respRate: 38,
      csfCells: 8, csfProtein: 0.42, csfAntibodies: 'pending',
      drugs: [{ name: 'Valproate' }, { name: 'Méropénème' }, { name: 'Midazolam' }, { name: 'Noradrénaline' }, { name: 'Méthylprednisolone' }, { name: 'Amikacine' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J2-J4', response: 'none' }],
    },
    checks: [
      { engine: 'VPS', desc: 'Score 75-100', test: ps => ps.vpsResult!.synthesis.score >= 75 && ps.vpsResult!.synthesis.score <= 100 },
      { engine: 'VPS', desc: 'Orage cytokinique', test: ps => ps.vpsResult!.intention.patterns.some(p => p.name.includes('Orage')) },
      { engine: 'VPS', desc: 'Détérioration', test: ps => ps.vpsResult!.intention.patterns.some(p => p.name.includes('Détérioration')) },
      { engine: 'TDE', desc: 'Score ≥50', test: ps => ps.tdeResult!.synthesis.score >= 50 },
      { engine: 'PVE', desc: 'VPA+Méropénème critique', test: ps => { const r = ps.pveResult!.rules.find(r => r.adjustment?.detectedInteractions); return !!(r && (r.adjustment!.detectedInteractions as any[]).some(i => i.severity === 'critical')) } },
      { engine: 'PVE', desc: 'Score PVE 50-100', test: ps => ps.pveResult!.synthesis.score >= 50 && ps.pveResult!.synthesis.score <= 100 },
      { engine: 'EWE', desc: 'Alerte précoce active', test: ps => ps.eweResult!.synthesis.score >= 40 },
      { engine: 'TPE', desc: 'Hypothèses disponibles', test: ps => ps.tpeResult!.synthesis.recommendations.length > 0 },
    ],
  },
  {
    id: 'REBOND',
    data: {
      ageMonths: 96, weightKg: 28, hospDay: 5, gcs: 11, gcsHistory: [13, 14], pupils: 'reactive',
      seizures24h: 2, seizureDuration: 3, seizureType: 'focal_impaired',
      crp: 25, pct: 0.3, ferritin: 280, wbc: 11, platelets: 210, lactate: 1.8,
      heartRate: 105, sbp: 95, dbp: 60, spo2: 97, temp: 38.2, respRate: 22,
      csfCells: 15, csfProtein: 0.38, csfAntibodies: 'pending',
      drugs: [{ name: 'Levetiracetam' }, { name: 'Méthylprednisolone' }, { name: 'Paracétamol' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J1-J3', response: 'partial' }],
    },
    checks: [
      { engine: 'VPS', desc: 'Score 25-55', test: ps => ps.vpsResult!.synthesis.score >= 25 && ps.vpsResult!.synthesis.score <= 55 },
      { engine: 'VPS', desc: 'Pattern Rebond', test: ps => ps.vpsResult!.intention.patterns.some(p => p.name.includes('Rebond')) },
      { engine: 'VPS', desc: 'Contexte ×1.4', test: ps => ps.vpsResult!.context.contextModifier >= 1.3 },
      { engine: 'TDE', desc: 'Score 20-55', test: ps => ps.tdeResult!.synthesis.score >= 20 && ps.tdeResult!.synthesis.score <= 55 },
      { engine: 'PVE', desc: 'Score 0-35', test: ps => ps.pveResult!.synthesis.score >= 0 && ps.pveResult!.synthesis.score <= 35 },
      { engine: 'EWE', desc: 'Rebond inflammatoire détecté', test: ps => ps.eweResult!.intention.patterns.some(p => p.name.includes('Rebond') || p.name.includes('Ascension')) || ps.eweResult!.synthesis.score >= 15 },
    ],
  },
  {
    id: 'STABLE',
    data: {
      ageMonths: 120, weightKg: 32, hospDay: 2, gcs: 14, gcsHistory: [14, 14], pupils: 'reactive',
      seizures24h: 0, seizureDuration: 0, seizureType: 'none',
      crp: 3, pct: 0.08, ferritin: 90, wbc: 9, platelets: 280, lactate: 0.9,
      heartRate: 85, sbp: 105, dbp: 65, spo2: 99, temp: 37.1, respRate: 18,
      csfCells: 2, csfProtein: 0.28, csfAntibodies: 'negative',
      drugs: [{ name: 'Levetiracetam' }, { name: 'Paracétamol' }],
      treatmentHistory: [],
    },
    checks: [
      { engine: 'VPS', desc: 'Score 0-25', test: ps => ps.vpsResult!.synthesis.score >= 0 && ps.vpsResult!.synthesis.score <= 25 },
      { engine: 'VPS', desc: 'STABLE ou LÉGER', test: ps => ['STABLE', 'LÉGER'].includes(ps.vpsResult!.synthesis.level) },
      { engine: 'VPS', desc: '0 patterns', test: ps => ps.vpsResult!.intention.patterns.length === 0 },
      { engine: 'TDE', desc: 'Score 0-30', test: ps => ps.tdeResult!.synthesis.score >= 0 && ps.tdeResult!.synthesis.score <= 30 },
      { engine: 'TDE', desc: 'MAINTIEN', test: ps => ps.tdeResult!.synthesis.level === 'MAINTIEN' },
      { engine: 'PVE', desc: 'Score 0-20', test: ps => ps.pveResult!.synthesis.score >= 0 && ps.pveResult!.synthesis.score <= 20 },
      { engine: 'EWE', desc: 'SURVEILLANCE STANDARD', test: ps => ps.eweResult!.synthesis.level === 'SURVEILLANCE STANDARD' },
      { engine: 'TPE', desc: 'TRAITEMENT CONVENTIONNEL', test: ps => ps.tpeResult!.synthesis.level === 'TRAITEMENT CONVENTIONNEL' },
    ],
  },
]

export function runCrashTests(): { totalPass: number; totalFail: number; results: string[] } {
  const results: string[] = []
  let totalPass = 0, totalFail = 0

  results.push('═══════════════════════════════════════════════════')
  results.push('  PULSAR V15 — CRASH TESTS — 5 MOTEURS × 5 CAS')
  results.push('═══════════════════════════════════════════════════')

  for (const test of TESTS) {
    const ps = new PatientState(test.data)
    runPipeline(ps)

    results.push('')
    results.push(`▸ CAS: ${test.id}`)
    results.push(`  VPS: ${ps.vpsResult!.synthesis.score}/100 [${ps.vpsResult!.synthesis.level}]`)
    results.push(`  TDE: ${ps.tdeResult!.synthesis.score}/100 [${ps.tdeResult!.synthesis.level}]`)
    results.push(`  PVE: ${ps.pveResult!.synthesis.score}/100 [${ps.pveResult!.synthesis.level}]`)
    results.push(`  EWE: ${ps.eweResult!.synthesis.score}/100 [${ps.eweResult!.synthesis.level}]`)
    results.push(`  TPE: ${ps.tpeResult!.synthesis.score}/100 [${ps.tpeResult!.synthesis.level}]`)

    // Patterns
    const vpsP = ps.vpsResult!.intention.patterns.map(p => `${p.name}(${Math.round(p.confidence * 100)}%)`)
    const tdeP = ps.tdeResult!.intention.patterns.map(p => `${p.name}(${Math.round(p.confidence * 100)}%)`)
    const eweP = ps.eweResult!.intention.patterns.map(p => `${p.name}(${Math.round(p.confidence * 100)}%)`)
    const tpeP = ps.tpeResult!.intention.patterns.map(p => `${p.name}(${Math.round(p.confidence * 100)}%)`)
    if (vpsP.length) results.push(`  VPS Patterns: ${vpsP.join(', ')}`)
    if (tdeP.length) results.push(`  TDE Patterns: ${tdeP.join(', ')}`)
    if (eweP.length) results.push(`  EWE Patterns: ${eweP.join(', ')}`)
    if (tpeP.length) results.push(`  TPE Patterns: ${tpeP.join(', ')}`)

    results.push(`  VPS Context: ×${ps.vpsResult!.context.contextModifier.toFixed(2)}`)
    results.push(`  Alertes totales: ${ps.alerts.length} | Recommandations: ${ps.recommendations.length}`)
    results.push('  ─────────────────────────────────────')

    let pass = 0, fail = 0
    for (const c of test.checks) {
      let ok = false
      try { ok = c.test(ps) } catch { ok = false }
      const symbol = ok ? '✓' : '✗'
      results.push(`  ${symbol} [${c.engine}] ${c.desc}`)
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
