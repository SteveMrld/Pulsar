// ============================================================
// PULSAR V15 — Pipeline séquentiel
// VPS → TDE → PVE → EWE → TPE
// Chaque moteur enrichit le PatientState pour le suivant
// ============================================================

import { PatientState } from './PatientState'
import { VPSEngine } from './VPSEngine'
import { TDEEngine } from './TDEEngine'
import { PVEEngine } from './PVEEngine'
import { EWEEngine } from './EWEEngine'
import { TPEEngine } from './TPEEngine'
import { runNeuroCore } from '@/lib/neurocore/engine'

export function runPipeline(ps: PatientState): PatientState {
  const vps = new VPSEngine()
  const tde = new TDEEngine()
  const pve = new PVEEngine()
  const ewe = new EWEEngine()
  const tpe = new TPEEngine()

  // Étape 1 — VPS : Où en est le patient ?
  const vpsResult = vps.run(ps)
  ps.vpsResult = vpsResult

  // Étape 2 — TDE : Quel traitement ? (lit VPS)
  const tdeResult = tde.run(ps)
  ps.tdeResult = tdeResult

  // Étape 3 — PVE : Quels risques médicamenteux ? (lit VPS + TDE)
  const pveResult = pve.run(ps)
  ps.pveResult = pveResult

  // Étape 4 — EWE : Que va-t-il se passer ? (lit VPS + TDE + PVE)
  const eweResult = ewe.run(ps)
  ps.eweResult = eweResult as any

  // Étape 5 — TPE : Quelles pistes de demain ? (lit tout)
  const tpeResult = tpe.run(ps)
  ps.tpeResult = tpeResult as any

  // Agrégation des alertes et recommandations
  ps.alerts = [
    ...vpsResult.synthesis.alerts,
    ...tdeResult.synthesis.alerts,
    ...pveResult.synthesis.alerts,
    ...eweResult.synthesis.alerts,
    ...tpeResult.synthesis.alerts,
  ]

  ps.recommendations = [
    ...tdeResult.synthesis.recommendations,
    ...pveResult.synthesis.recommendations,
    ...eweResult.synthesis.recommendations,
    ...tpeResult.synthesis.recommendations,
  ]

  // Étape 6 — NeuroCore : Analyse cerveau (EEG + IRM + Biomarqueurs)
  // Tourne en dernier, enrichit les alertes avec les données neuro
  if (ps.eeg || ps.mri || ps.neuroBiomarkers) {
    runNeuroCore(ps)
  }

  return ps
}

// ── Export all engines for individual use ──
export { VPSEngine, TDEEngine, PVEEngine, EWEEngine, TPEEngine }
export { PatientState }
