// ============================================================
// PULSAR V18 — Discovery Engine (7ème moteur)
// Orchestrateur des 4 niveaux — COMPLET
// Phase A : Niveau 1 (PatternMiner) ✓ actif
// Phase B : Niveau 2 (LiteratureScanner) ✓ actif
// Phase C : Niveau 3 (HypothesisEngine) ✓ actif
// Phase D : Niveau 4 (TreatmentPathfinder) ✓ actif
//
// LECTURE SEULE sur PatientState + 5 moteurs existants
// ============================================================

import { patternMiner, type PatientDataRow } from './PatternMiner'
import { literatureScanner, type LiteratureArticle, type ScanResult } from './LiteratureScanner'
import { hypothesisEngine, type Hypothesis } from './HypothesisEngine'
import { treatmentPathfinder, type PatientProfile, type PathfinderResult } from './TreatmentPathfinder'
import type {
  SignalCard, CorrelationMatrix, PatientCluster,
  TemporalPattern, DiscoveryRunResult,
} from '@/lib/types/discovery'

// ── Discovery Engine Status ──

export interface DiscoveryStatus {
  level1_patternMiner: 'active' | 'disabled'
  level2_literatureScanner: 'active' | 'disabled'
  level3_hypothesisEngine: 'active' | 'disabled'
  level4_treatmentPathfinder: 'active' | 'disabled'
  lastRun: string | null
  totalSignals: number
}

// ── Full result with all 4 levels ──

export interface DiscoveryRunResultV2 extends DiscoveryRunResult {
  literature: ScanResult
  hypotheses: Hypothesis[]
  pathfinder: PathfinderResult
}

// ══════════════════════════════════════════════════════════════
// DISCOVERY ENGINE — VERSION FINALE
// ══════════════════════════════════════════════════════════════

export class DiscoveryEngine {
  name = 'Discovery Engine'
  version = '4.0.0'
  phase = 'D'

  private status: DiscoveryStatus = {
    level1_patternMiner: 'active',
    level2_literatureScanner: 'active',
    level3_hypothesisEngine: 'active',
    level4_treatmentPathfinder: 'active',
    lastRun: null,
    totalSignals: 0,
  }

  getStatus(): DiscoveryStatus {
    return { ...this.status }
  }

  // ── Run full discovery pipeline (sync) ──

  run(
    patients: PatientDataRow[],
    articles?: LiteratureArticle[],
    profiles?: PatientProfile[],
  ): DiscoveryRunResultV2 {
    const timestamp = new Date().toISOString()

    // ── Level 1: Pattern Mining ──
    const { signals: minerSignals, correlationMatrix, clusters } =
      patternMiner.mine(patients)

    // ── Level 2: Literature Scanner ──
    const literature = articles
      ? literatureScanner.scan(articles, minerSignals)
      : { articles: [], alerts: [], stats: { articlesScanned: 0, matchesFound: 0, confirmations: 0, contradictions: 0, opportunities: 0, clinicalTrials: 0 }, scannedAt: timestamp }

    // ── Level 3: Hypothesis Engine (fallback — sync) ──
    const hypotheses = hypothesisEngine.getFallbackHypotheses(minerSignals, literature)

    // ── Level 4: Treatment Pathfinder ──
    const pathfinder = profiles
      ? treatmentPathfinder.findPathways(profiles, minerSignals, hypotheses)
      : { pathways: [], stats: { totalPathways: 0, eligiblePatients: 0, activeTrials: 0, compassionateOptions: 0 } }

    // ── Aggregate ──
    const allSignals = [...minerSignals]
    this.status.lastRun = timestamp
    this.status.totalSignals = allSignals.length

    return {
      timestamp,
      signals: allSignals,
      correlationMatrix,
      clusters,
      temporalPatterns: [],
      literature,
      hypotheses,
      pathfinder,
      summary: {
        totalSignals: allSignals.length,
        newSignals: allSignals.filter(s => s.status === 'new').length,
        strongSignals: allSignals.filter(s =>
          s.strength === 'strong' || s.strength === 'very_strong'
        ).length,
        patientsAnalyzed: patients.length,
        parametersScanned: correlationMatrix.parameters.length,
      },
    }
  }

  // ── Run with live Claude API (async) ──

  async runAsync(
    patients: PatientDataRow[],
    articles?: LiteratureArticle[],
    profiles?: PatientProfile[],
  ): Promise<DiscoveryRunResultV2> {
    const syncResult = this.run(patients, articles, profiles)
    try {
      const liveHypotheses = await hypothesisEngine.generate(syncResult.signals, syncResult.literature)
      if (liveHypotheses.length > 0) syncResult.hypotheses = liveHypotheses
    } catch (err) {
      console.error('[DiscoveryEngine] Async hypothesis generation failed:', err)
    }
    return syncResult
  }

  // ── Run on a single patient ──

  runForPatient(
    patient: PatientDataRow,
    allPatients: PatientDataRow[],
    articles?: LiteratureArticle[],
  ): SignalCard[] {
    const fullResult = this.run(allPatients, articles)
    return fullResult.signals.filter(s =>
      s.patients.ids.includes(patient.id)
    )
  }

  // ── Sub-engines ──

  getLiteratureScanner() { return literatureScanner }
  getHypothesisEngine() { return hypothesisEngine }
  getTreatmentPathfinder() { return treatmentPathfinder }

  // ── Roadmap ──

  getRoadmap(): { phase: string; level: string; status: string; description: string }[] {
    return [
      { phase: 'A', level: 'Niveau 1 — Pattern Mining', status: '✓ Actif', description: 'Corrélation interne, clustering, détection d\'anomalies sur les données patients.' },
      { phase: 'B', level: 'Niveau 2 — Literature Scanner', status: '✓ Actif', description: 'Veille scientifique PubMed. Croisement publications ↔ signaux. Détection de contradictions et opportunités.' },
      { phase: 'C', level: 'Niveau 3 — Hypothesis Engine', status: '✓ Actif', description: 'Génération d\'hypothèses via Claude API. Croisement N1×N2. Workflow de validation clinique.' },
      { phase: 'D', level: 'Niveau 4 — Treatment Pathfinder', status: '✓ Actif', description: 'Matching patient ↔ essais cliniques. Pistes thérapeutiques émergentes. Scoring d\'éligibilité.' },
    ]
  }
}

export const discoveryEngine = new DiscoveryEngine()
