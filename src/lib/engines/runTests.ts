import { runCrashTests } from './crashTests'
import { runIntakeCrashTests } from './intakeCrashTests'
import { runClinicalTests } from './clinicalTests'

// ── Pipeline crash tests (5 moteurs × 5 cas) ──
const pipeline = runCrashTests()
pipeline.results.forEach(line => console.log(line))

console.log('')

// ── IntakeAnalyzer crash tests (8 scénarios) ──
const intake = runIntakeCrashTests()
intake.results.forEach(line => console.log(line))

console.log('')

// ── Clinical regression tests (10 profils réels) ──
const clinical = runClinicalTests()
clinical.results.forEach(line => console.log(line))

// ── Bilan global ──
const totalPass = pipeline.totalPass + intake.totalPass + clinical.totalPass
const totalFail = pipeline.totalFail + intake.totalFail + clinical.totalFail
console.log('')
console.log('═══════════════════════════════════════════════════')
console.log(`  BILAN GLOBAL: ${totalPass}/${totalPass + totalFail}`)
console.log(`  Pipeline:  ${pipeline.totalPass}/${pipeline.totalPass + pipeline.totalFail}`)
console.log(`  Intake:    ${intake.totalPass}/${intake.totalPass + intake.totalFail}`)
console.log(`  Clinical:  ${clinical.totalPass}/${clinical.totalPass + clinical.totalFail}`)
console.log('═══════════════════════════════════════════════════')

process.exit(totalFail > 0 ? 1 : 0)
