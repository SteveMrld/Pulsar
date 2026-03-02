// ============================================================
// PULSAR V18 — Discovery Engine (7ème moteur)
// Orchestrateur des 4 niveaux
// Phase A : Niveau 1 (PatternMiner) ✓ actif
// Phase B : Niveau 2 (LiteratureScanner) ✓ actif
// Phase C : Niveau 3 (HypothesisEngine) ✓ actif
// Phase D : Niveau 4 (TreatmentPathfinder) — à venir
//
// LECTURE SEULE sur PatientState + 5 moteurs existants
// ============================================================

import { patternMiner, type PatientDataRow } from './PatternMiner'
import { literatureScanner, type LiteratureArticle, type ScanResult } from './LiteratureScanner'
import { hypothesisEngine, type Hypothesis } from './HypothesisEngine'
import type {
  SignalCard, CorrelationMatrix, PatientCluster,
  TemporalPattern, DiscoveryRunResult,
} from '@/lib/types/discovery'

// ── Discovery Engine Status ──

export interface DiscoveryStatus {
  level1_patternMiner: 'active' | 'disabled'
  level2_literatureScanner: 'active' | 'disabled'
  level3_hypothesisEngine: 'active' | 'disabled'
  level4_treatmentPathfinder: 'coming_soon' | 'active' | 'disabled'
  lastRun: string | null
  totalSignals: number
}

// ── Extended result with literature + hypotheses ──

export interface DiscoveryRunResultV2 extends DiscoveryRunResult {
  literature: ScanResult
  hypotheses: Hypothesis[]
}

// ══════════════════════════════════════════════════════════════
// DISCOVERY ENGINE
// ══════════════════════════════════════════════════════════════

export class DiscoveryEngine {
  name = 'Discovery Engine'
  version = '3.0.0-beta'
  phase = 'C'

  private status: DiscoveryStatus = {
    level1_patternMiner: 'active',
    level2_literatureScanner: 'active',
    level3_hypothesisEngine: 'active',
    level4_treatmentPathfinder: 'coming_soon',
    lastRun: null,
    totalSignals: 0,
  }

  // ── Get engine status ──

  getStatus(): DiscoveryStatus {
    return { ...this.status }
  }

  // ── Run discovery pipeline (sync — hypotheses use fallback) ──

  run(patients: PatientDataRow[], articles?: LiteratureArticle[]): DiscoveryRunResultV2 {
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

    // ── Level 4: Treatment Pathfinder (Phase D — placeholder) ──

    // ── Aggregate all signals ──
    const allSignals = [...minerSignals]

    // ── Update status ──
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

  async runAsync(patients: PatientDataRow[], articles?: LiteratureArticle[]): Promise<DiscoveryRunResultV2> {
    const syncResult = this.run(patients, articles)

    // Replace fallback hypotheses with Claude API generated ones
    try {
      const liveHypotheses = await hypothesisEngine.generate(syncResult.signals, syncResult.literature)
      if (liveHypotheses.length > 0) {
        syncResult.hypotheses = liveHypotheses
      }
    } catch (err) {
      console.error('[DiscoveryEngine] Async hypothesis generation failed, using fallback:', err)
    }

    return syncResult
  }

  // ── Run on a single patient (for Cockpit integration) ──

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

  // ── Get sub-engines ──

  getLiteratureScanner() { return literatureScanner }
  getHypothesisEngine() { return hypothesisEngine }

  // ── Get roadmap info ──

  getRoadmap(): { phase: string; level: string; status: string; description: string }[] {
    return [
      {
        phase: 'A',
        level: 'Niveau 1 — Pattern Mining',
        status: '✓ Actif',
        description: 'Corrélation interne, clustering, détection d\'anomalies sur les données patients.',
      },
      {
        phase: 'B',
        level: 'Niveau 2 — Literature Scanner',
        status: '✓ Actif',
        description: 'Veille scientifique PubMed/Cochrane. Croisement publications ↔ signaux internes. Détection de contradictions et opportunités.',
      },
      {
        phase: 'C',
        level: 'Niveau 3 — Hypothesis Engine',
        status: '✓ Actif',
        description: 'Génération d\'hypothèses de recherche via Claude API. Croisement signaux + littérature. Workflow de validation clinique.',
      },
      {
        phase: 'D',
        level: 'Niveau 4 — Treatment Pathfinder',
        status: '◌ Phase D',
        description: 'Matching patient ↔ essais cliniques. Pistes thérapeutiques émergentes.',
      },
    ]
  }
}

// ── Export singleton ──
export const discoveryEngine = new DiscoveryEngine()
