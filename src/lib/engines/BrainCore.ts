// ============================================================
// PULSAR V15 — BrainCore
// Classe abstraite 4 couches — Framework pour les 5 moteurs
// Couche 1: Intention | Couche 2: Contexte
// Couche 3: Règles | Couche 4: Courbe
// ============================================================

import {
  PatientState,
  IntentionResult, ContextResult, RuleResult, CurveResult,
  SynthesisResult, EngineResult, FieldResult, SignalDetail, PatternResult,
} from './PatientState'

// ── Semantic Signal ──
export interface Signal {
  name: string
  unit?: string
  weight: number
  extract: (ps: PatientState) => unknown
  normalize: (value: any, ps: PatientState) => number
}

// ── Semantic Field ──
export class SemanticField {
  name: string
  category: string
  color: string
  signals: Signal[]

  constructor(cfg: { name: string; category: string; color: string; signals: Signal[] }) {
    this.name = cfg.name
    this.category = cfg.category
    this.color = cfg.color
    this.signals = cfg.signals
  }

  computeIntensity(ps: PatientState): number {
    let totalWeight = 0
    let weightedSum = 0
    for (const s of this.signals) {
      const raw = s.extract(ps)
      if (raw == null) continue
      const norm = s.normalize(raw, ps)
      const w = s.weight || 1
      weightedSum += norm * w
      totalWeight += w
    }
    return totalWeight === 0 ? 0 : Math.min(100, Math.round(weightedSum / totalWeight))
  }

  getSignalDetails(ps: PatientState): SignalDetail[] {
    return this.signals.map(s => {
      const raw = s.extract(ps)
      const norm = raw != null ? s.normalize(raw, ps) : 0
      return {
        name: s.name,
        rawValue: raw,
        normalized: norm,
        unit: s.unit || '',
        status: norm > 75 ? 'critical' : norm > 50 ? 'warning' : norm > 25 ? 'moderate' : 'normal',
      }
    })
  }

  static interpret(intensity: number): string {
    if (intensity >= 80) return 'Défaillance sévère'
    if (intensity >= 60) return 'Atteinte significative'
    if (intensity >= 40) return 'Atteinte modérée'
    if (intensity >= 20) return 'Atteinte légère'
    return 'Normal'
  }
}

// ── Pattern ──
export interface Pattern {
  name: string
  match: (ps: PatientState, fields: FieldResult[]) => { confidence: number; description: string; implications: string }
}

// ── Rule ──
export interface Rule {
  name: string
  reference: string
  evaluate: (ps: PatientState, ir: IntentionResult, cr: ContextResult) => {
    triggered: boolean
    type: 'guard' | 'correction' | 'validation'
    message: string
    adjustment?: Record<string, unknown>
  }
}

// ── BrainCore Abstract Class ──
export abstract class BrainCore {
  name: string
  semanticFields: SemanticField[] = []
  patterns: Pattern[] = []
  rules: Rule[] = []

  constructor(name: string) {
    this.name = name
  }

  // Couche 1 — Intention
  analyzeIntention(ps: PatientState): IntentionResult {
    const fields: FieldResult[] = this.semanticFields.map(f => ({
      name: f.name,
      category: f.category,
      intensity: f.computeIntensity(ps),
      signals: f.getSignalDetails(ps),
      color: f.color,
      interpretation: SemanticField.interpret(f.computeIntensity(ps)),
    }))

    const patterns: PatternResult[] = []
    for (const p of this.patterns) {
      const m = p.match(ps, fields)
      if (m.confidence > 0.4) {
        patterns.push({ name: p.name, confidence: m.confidence, description: m.description, implications: m.implications })
      }
    }
    patterns.sort((a, b) => b.confidence - a.confidence)

    return { fields, patterns }
  }

  // Couche 2 — Contexte (override par chaque moteur)
  analyzeContext(ps: PatientState, ir: IntentionResult): ContextResult {
    return { trend: 'stable', details: [], contextModifier: 1.0 }
  }

  // Couche 3 — Règles métier
  applyRules(ps: PatientState, ir: IntentionResult, cr: ContextResult): RuleResult[] {
    const applied: RuleResult[] = []
    for (const r of this.rules) {
      const res = r.evaluate(ps, ir, cr)
      if (res.triggered) {
        applied.push({
          name: r.name,
          type: res.type,
          message: res.message,
          reference: r.reference,
          adjustment: res.adjustment,
        })
      }
    }
    return applied
  }

  // Couche 4 — Courbe (override par chaque moteur)
  computeCurve(ps: PatientState, ir: IntentionResult, cr: ContextResult): CurveResult {
    return { trajectory: [], currentPosition: 0, currentValue: 0, globalIntensity: 0, trend: 'stable', curveData: [], labels: [] }
  }

  // Synthèse (override obligatoire)
  abstract synthesize(
    ps: PatientState,
    intention: IntentionResult,
    context: ContextResult,
    rules: RuleResult[],
    curve: CurveResult
  ): SynthesisResult

  // Pipeline d'exécution : Intention → Contexte → Règles → Courbe → Synthèse
  run(ps: PatientState): EngineResult {
    const intention = this.analyzeIntention(ps)
    const context = this.analyzeContext(ps, intention)
    const rules = this.applyRules(ps, intention, context)
    const curve = this.computeCurve(ps, intention, context)
    const synthesis = this.synthesize(ps, intention, context, rules, curve)
    return { engine: this.name, intention, context, rules, curve, synthesis }
  }
}
