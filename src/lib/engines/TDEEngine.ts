// ============================================================
// PULSAR V15 — TDE Engine (Therapeutic Decision Engine)
// 2 champs sémantiques · 4 patterns (FIRES, NMDAR, MOGAD, Échec L1)
// Escalade 4 lignes · Couleur : #2FD1C8
// ============================================================

import { BrainCore, SemanticField } from './BrainCore'
import { PatientState, IntentionResult, ContextResult, RuleResult, CurveResult, SynthesisResult } from './PatientState'

export class TDEEngine extends BrainCore {
  constructor() {
    super('TDE')

    // ── Champ 1 : Tableau syndromique ──
    this.semanticFields.push(new SemanticField({
      name: 'Tableau syndromique', category: 'syndromic', color: '#5FA8FF',
      signals: [
        { name: 'Crises', weight: 3, extract: ps => ps.neuro.seizureType, normalize: v => ({ none: 0, focal_aware: 10, focal_impaired: 25, generalized_tonic_clonic: 40, status: 65, refractory_status: 85, super_refractory: 100 }[v as string] || 0) },
        { name: 'Encéphalopathie', weight: 2, extract: ps => ps.neuro.gcs, normalize: v => Math.round(((15 - (v as number)) / 12) * 100) },
        { name: 'Pléiocytose', weight: 2, unit: 'cell/µL', extract: ps => ps.csf.cells, normalize: v => { const n = v as number; return n > 500 ? 100 : n > 100 ? 75 : n > 30 ? 50 : n > 5 ? 25 : 0 } },
        { name: 'Fièvre', weight: 1, unit: '°C', extract: ps => ps.hemodynamics.temp, normalize: v => (v as number) >= 38 ? Math.min(100, ((v as number) - 37) * 40) : 0 },
        { name: 'Anticorps', weight: 1.5, extract: ps => ps.csf.antibodies, normalize: v => v === 'negative' ? 30 : v === 'pending' ? 50 : 90 },
      ],
    }))

    // ── Champ 2 : Réponse thérapeutique ──
    this.semanticFields.push(new SemanticField({
      name: 'Réponse thérapeutique', category: 'response', color: '#3BC17A',
      signals: [
        { name: 'Échecs', weight: 3, extract: ps => ps.treatmentHistory.filter(t => t.response === 'none').length, normalize: v => Math.min(100, (v as number) * 35) },
        { name: 'Partiels', weight: 1.5, extract: ps => ps.treatmentHistory.filter(t => t.response === 'partial').length, normalize: v => Math.min(80, (v as number) * 25) },
        { name: 'Durée hospit', weight: 2, unit: 'j', extract: ps => ps.hospDay, normalize: v => Math.min(100, (v as number) * 10) },
      ],
    }))

    // ── Patterns (4) ──
    this.patterns.push({
      name: 'Pattern FIRES',
      match: (ps) => {
        let m = 0
        if (ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') m += 2
        else if (ps.neuro.seizureType === 'status') m++
        if (ps.hemodynamics.temp >= 38) m++
        if (ps.csf.cells > 5) m++
        if (ps.csf.antibodies === 'negative' || ps.csf.antibodies === 'pending') m++
        if (ps.ageMonths >= 24 && ps.ageMonths <= 144) m++
        if (m >= 4) return { confidence: Math.min(1, m / 5), description: 'FIRES pattern détecté', implications: 'Wickström 2022 — Kessi 2020 : mortalité 12%, séquelles 56-100%' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Pattern Encéphalite anti-NMDAR',
      match: (ps) => {
        if (ps.csf.antibodies === 'nmdar') return { confidence: 0.95, description: 'Anti-NMDAR confirmés', implications: 'Titulaer 2013 — Immunothérapie agressive + Nosadini 2021' }
        let m = 0
        if (ps.neuro.gcs < 12) m++
        if (ps.neuro.seizures24h > 2) m++
        if (ps.csf.cells > 10) m++
        if (ps.ageMonths > 12) m++
        if (m >= 3 && ps.csf.antibodies === 'pending') return { confidence: 0.55, description: 'Compatible auto-immun', implications: 'Ne pas attendre Ac — Titulaer 2013' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // V15 — Pattern MOGAD/ADEM (Banwell 2023)
    this.patterns.push({
      name: 'Pattern MOGAD/ADEM',
      match: (ps) => {
        if (ps.csf.antibodies === 'mog' || ps.mogad.mogAntibody) {
          const features: string[] = ['Anti-MOG+']
          if (ps.mogad.opticNeuritis) features.push('névrite optique')
          if (ps.mogad.ademPresentation) features.push('ADEM')
          if (ps.mogad.transverseMyelitis) features.push('myélite')
          if (ps.mogad.demyelinatingLesions) features.push('lésions démyélinisantes')
          return { confidence: 0.90, description: features.join(' + '), implications: 'Banwell 2023 — PAS de cyclophosphamide. Corticos → Rituximab si échec' }
        }
        if (ps.mogad.ademPresentation && ps.mogad.demyelinatingLesions) {
          return { confidence: 0.50, description: 'Présentation ADEM + IRM compatible', implications: 'Rechercher anti-MOG en urgence — Banwell 2023' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Échec première ligne',
      match: (ps) => {
        const failures = ps.treatmentHistory.filter(t => ['Méthylprednisolone IV', 'IVIg'].includes(t.treatment) && t.response === 'none')
        if (failures.length >= 1) return { confidence: 0.9, description: `${failures.length} échec(s) 1ère ligne`, implications: 'Escalade 2ème ligne — Sheikh 2023' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // ── Règles métier ──
    this.rules.push({
      name: 'Escalade thérapeutique', reference: 'Wickström 2022',
      evaluate: (ps) => {
        const fails = ps.treatmentHistory.filter(t => t.response === 'none')
        const tried = ps.treatmentHistory.map(t => t.treatment)
        const L1 = ['Méthylprednisolone IV', 'IVIg']
        const L2 = ['Rituximab', 'Cyclophosphamide', 'Plasmaphérèse']
        const l1Fail = L1.some(t => fails.find(f => f.treatment === t))
        const l2Fail = L2.some(t => fails.find(f => f.treatment === t))
        let line = 1, msg = ''
        if (l2Fail) { line = 3; msg = '3ÈME LIGNE — Tocilizumab/Anakinra/Bortezomib' }
        else if (l1Fail) { line = 2; msg = '2ÈME LIGNE — Rituximab/Cyclophosphamide/Plasmaphérèse' }
        else if (tried.length === 0) { line = 1; msg = '1ÈRE LIGNE — Initier Méthylprednisolone 30mg/kg/j + IVIg 2g/kg' }
        else { msg = '1ÈRE LIGNE en cours' }
        return { triggered: true, type: line >= 2 ? 'guard' : 'validation', message: msg, adjustment: { therapeuticLine: line } }
      },
    })

    this.rules.push({
      name: 'Doses adaptées au poids', reference: 'BNFc / Nosadini 2021',
      evaluate: (ps) => {
        const w = ps.weightKg
        return { triggered: true, type: 'validation', message: `Doses pour ${w}kg : Méthylpred ${Math.round(w * 30)}mg/j · IVIg ${Math.round(w * 0.4 * 10) / 10}g/j ×5j` }
      },
    })

    this.rules.push({
      name: 'Ne pas attendre anticorps', reference: 'Titulaer 2013 — Graus 2016',
      evaluate: (ps) => {
        if (ps.csf.antibodies === 'pending' && ps.neuro.gcs < 12 && ps.neuro.seizures24h > 2)
          return { triggered: true, type: 'guard', message: 'NE PAS attendre résultats Ac — Initier immunothérapie sur tableau clinique' }
        return { triggered: false, type: 'validation', message: '' }
      },
    })

    // V15 — MOGAD-specific rule
    this.rules.push({
      name: 'Contre-indication Cyclophosphamide MOGAD', reference: 'Banwell 2023 / Bilodeau 2024',
      evaluate: (ps) => {
        if ((ps.csf.antibodies === 'mog' || ps.mogad.mogAntibody) &&
          ps.treatmentHistory.some(t => t.treatment === 'Cyclophosphamide')) {
          return { triggered: true, type: 'guard', message: 'ATTENTION : Cyclophosphamide NON recommandé dans MOGAD — Préférer Rituximab' }
        }
        return { triggered: false, type: 'validation', message: '' }
      },
    })
  }

  // ── Couche 2 : Contexte ──
  analyzeContext(ps: PatientState, ir: IntentionResult): ContextResult {
    const details: { type: string; label: string; detail: string; icon: string }[] = []
    let cm = 1.0
    const h = ps.treatmentHistory

    if (h.length > 0) {
      const failures = h.filter(t => t.response === 'none')
      if (failures.length > 0) {
        details.push({ type: 'failure', label: `${failures.length} échec(s)`, detail: failures.map(x => x.treatment).join(', '), icon: '❌' })
        cm = 1 + failures.length * 0.15
      }
    }

    if (ps.hospDay > 5 && ps.neuro.gcs < 12) {
      details.push({ type: 'prolonged', label: 'Prolongé', detail: `J${ps.hospDay}`, icon: '⏰' })
      cm = Math.max(cm, 1.3)
    }

    // Read VPS result
    if (ps.vpsResult) {
      const vps = ps.vpsResult.synthesis.score
      if (vps >= 80) { details.push({ type: 'high_vps', label: 'VPS critique', detail: `${vps}/100`, icon: '🔴' }); cm = Math.max(cm, 1.4) }
      else if (vps >= 60) { details.push({ type: 'elevated_vps', label: 'VPS sévère', detail: `${vps}/100`, icon: '🟠' }); cm = Math.max(cm, 1.2) }
    }

    return { trend: details[0]?.type || 'stable', details, contextModifier: cm }
  }

  // ── Couche 4 : Courbe ──
  computeCurve(ps: PatientState): CurveResult {
    const h = ps.treatmentHistory
    const cd: number[] = [], lb: string[] = []
    const lineMap: Record<string, number> = { 'Méthylprednisolone IV': 1, 'IVIg': 1, 'Rituximab': 2, 'Cyclophosphamide': 2, 'Plasmaphérèse': 2, 'Tocilizumab': 3, 'Anakinra': 3, 'Bortezomib': 3 }
    h.forEach(t => { cd.push((lineMap[t.treatment] || 1) * 33); lb.push(t.treatment.substring(0, 8)) })
    const fails = h.filter(t => t.response === 'none')
    const cl = fails.length >= 2 ? 3 : fails.length >= 1 ? 2 : 1
    return { trajectory: cd, currentPosition: cd.length, currentValue: cl * 33, globalIntensity: cl * 33, trend: cl > 1 ? 'escalating' : 'first_line', curveData: cd, labels: lb }
  }

  // ── Synthèse ──
  synthesize(ps: PatientState, intention: IntentionResult, context: ContextResult, rules: RuleResult[], curve: CurveResult): SynthesisResult {
    const si = intention.fields.find(f => f.category === 'syndromic')?.intensity || 0
    const ri = intention.fields.find(f => f.category === 'response')?.intensity || 0
    let score = Math.min(100, Math.round((si * 0.6 + ri * 0.4) * context.contextModifier))

    const alerts: PatientState['alerts'] = []
    const recs: PatientState['recommendations'] = []
    const line = (curve as any).therapeuticLine || (curve.curveData.length >= 2 ? 3 : curve.curveData.length >= 1 ? 2 : 1)
    const w = ps.weightKg

    if (line === 1 && score > 50) recs.push({ priority: 'urgent', title: 'Immunothérapie 1ère ligne', body: `Méthylprednisolone ${Math.round(w * 30)}mg/j ×3-5j + IVIg ${Math.round(w * 0.4 * 10) / 10}g/j ×5j (total ${Math.round(w * 2)}g)`, reference: 'Wickström 2022 / Nosadini 2021' })
    else if (line === 2) recs.push({ priority: 'urgent', title: 'Escalade 2ème ligne', body: `Rituximab 375mg/m²/sem ×4 | Cyclophosphamide | Plasmaphérèse`, reference: 'Sheikh 2023' })
    else if (line === 3) recs.push({ priority: 'urgent', title: '3ème ligne expérimentale', body: `Tocilizumab 8mg/kg | Anakinra 2-4mg/kg/j SC | Bortezomib`, reference: 'Costagliola 2022 / Shrestha 2023' })

    intention.patterns.filter(p => p.confidence > 0.5).forEach(p =>
      alerts.push({ severity: p.confidence > 0.8 ? 'critical' : 'warning', title: p.name, body: p.description, source: 'TDE' })
    )

    let level: string
    if (score >= 80) level = 'ESCALADE URGENTE'
    else if (score >= 60) level = 'ESCALADE RECOMMANDÉE'
    else if (score >= 40) level = 'SURVEILLANCE ACTIVE'
    else level = 'MAINTIEN'

    return { score, level, alerts, recommendations: recs }
  }
}
