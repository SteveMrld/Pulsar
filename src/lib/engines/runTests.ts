import { runCrashTests } from './crashTests'
import { runIntakeCrashTests } from './intakeCrashTests'

// ── Pipeline crash tests (5 moteurs × 5 cas) ──
const pipeline = runCrashTests()
pipeline.results.forEach(line => console.log(line))

console.log('')

// ── IntakeAnalyzer crash tests (8 scénarios) ──
const intake = runIntakeCrashTests()
intake.results.forEach(line => console.log(line))

// ── Bilan global ──
const totalPass = pipeline.totalPass + intake.totalPass
const totalFail = pipeline.totalFail + intake.totalFail
console.log('')
console.log('═══════════════════════════════════════════════════')
console.log(`  BILAN GLOBAL: ${totalPass}/${totalPass + totalFail}`)
console.log(`  Pipeline: ${pipeline.totalPass}/${pipeline.totalPass + pipeline.totalFail}`)
console.log(`  Intake:   ${intake.totalPass}/${intake.totalPass + intake.totalFail}`)
console.log('═══════════════════════════════════════════════════')

process.exit(totalFail > 0 ? 1 : 0)
