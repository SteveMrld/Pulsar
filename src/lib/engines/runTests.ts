import { runCrashTests } from './crashTests'
const { totalPass, totalFail, results } = runCrashTests()
results.forEach(line => console.log(line))
process.exit(totalFail > 0 ? 1 : 0)
