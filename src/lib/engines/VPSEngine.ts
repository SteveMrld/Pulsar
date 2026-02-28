// ============================================================
// PULSAR V15 — VPS Engine (Vital Prognosis Score)
// 4 champs sémantiques (+1 PIMS) · 5 patterns · 4 règles métier
// Couleur identitaire : #6C7CFF
// ============================================================

import { BrainCore, SemanticField } from './BrainCore'
import {
  PatientState, IntentionResult, ContextResult, RuleResult,
  CurveResult, SynthesisResult, FieldResult,
} from './PatientState'

export class VPSEngine extends BrainCore {
  constructor() {
    super('VPS')

    // ── Champ 1 : Défaillance neurologique (×3) ──
    this.semanticFields.push(new SemanticField({
      name: 'Défaillance neurologique', category: 'neuro', color: '#D63C3C',
      signals: [
        { name: 'GCS', weight: 3, extract: ps => ps.neuro.gcs, normalize: v => Math.round(((15 - v) / 12) * 100) },
        { name: 'Pupilles', weight: 2.5, extract: ps => ps.neuro.pupils, normalize: v => ({ reactive: 0, sluggish: 30, fixed_one: 70, fixed_both: 100 }[v as string] || 0) },
        { name: 'Crises/24h', weight: 2, extract: ps => ps.neuro.seizures24h, normalize: v => Math.min(100, (v as number) * 12) },
        { name: 'Durée crises', weight: 2, unit: 'min', extract: ps => ps.neuro.seizureDuration, normalize: v => (v as number) >= 30 ? 100 : (v as number) >= 15 ? 80 : (v as number) >= 5 ? 50 : (v as number) >= 2 ? 25 : 0 },
        { name: 'Type crises', weight: 2.5, extract: ps => ps.neuro.seizureType, normalize: v => ({ none: 0, focal_aware: 15, focal_impaired: 35, generalized_tonic_clonic: 55, status: 80, refractory_status: 95, super_refractory: 100 }[v as string] || 0) },
      ],
    }))

    // ── Champ 2 : Orage inflammatoire (×1.5) ──
    this.semanticFields.push(new SemanticField({
      name: 'Orage inflammatoire', category: 'inflammatory', color: '#F08A2B',
      signals: [
        { name: 'CRP', weight: 1.5, unit: 'mg/L', extract: ps => ps.biology.crp, normalize: v => (v as number) >= 200 ? 100 : (v as number) >= 100 ? 75 : (v as number) >= 50 ? 50 : (v as number) >= 20 ? 30 : (v as number) >= 5 ? 10 : 0 },
        { name: 'PCT', weight: 2, unit: 'ng/mL', extract: ps => ps.biology.pct, normalize: v => (v as number) >= 10 ? 100 : (v as number) >= 2 ? 75 : (v as number) >= 0.5 ? 50 : (v as number) >= 0.25 ? 25 : 0 },
        { name: 'Ferritine', weight: 1.5, unit: 'µg/L', extract: ps => ps.biology.ferritin, normalize: v => (v as number) >= 10000 ? 100 : (v as number) >= 5000 ? 85 : (v as number) >= 1000 ? 65 : (v as number) >= 500 ? 40 : (v as number) >= 200 ? 15 : 0 },
        { name: 'Leucocytes', weight: 1, unit: 'G/L', extract: ps => ps.biology.wbc, normalize: v => { const n = v as number; return (n > 30 || n < 2) ? 80 : (n > 20 || n < 4) ? 50 : (n > 15 || n < 5) ? 25 : 0 } },
        { name: 'Température', weight: 1, unit: '°C', extract: ps => ps.hemodynamics.temp, normalize: v => { const t = v as number; return t >= 40 ? 90 : t >= 39 ? 60 : t >= 38.5 ? 35 : t >= 38 ? 15 : t < 35 ? 70 : 0 } },
      ],
    }))

    // ── Champ 3 : Défaillance hémodynamique (×2) ──
    this.semanticFields.push(new SemanticField({
      name: 'Défaillance hémodynamique', category: 'hemodynamic', color: '#B96BFF',
      signals: [
        { name: 'FC', weight: 1.5, unit: 'bpm', extract: ps => ps.hemodynamics.heartRate, normalize: (v, ps) => { const r = ps.getNormalRanges(); const n = v as number; return (n > r.hrHigh + 40 || n < r.hrLow - 30) ? 90 : (n > r.hrHigh + 20 || n < r.hrLow - 15) ? 60 : (n > r.hrHigh || n < r.hrLow) ? 30 : 0 } },
        { name: 'PAM', weight: 2.5, unit: 'mmHg', extract: ps => ps.hemodynamics.map, normalize: (v, ps) => { const r = ps.getNormalRanges(); const n = v as number; return n < r.mapLow - 15 ? 100 : n < r.mapLow - 10 ? 75 : n < r.mapLow ? 45 : 0 } },
        { name: 'Lactates', weight: 2, unit: 'mmol/L', extract: ps => ps.biology.lactate, normalize: v => { const n = v as number; return n >= 8 ? 100 : n >= 4 ? 75 : n >= 2 ? 40 : n >= 1 ? 10 : 0 } },
        { name: 'SpO2', weight: 2, unit: '%', extract: ps => ps.hemodynamics.spo2, normalize: v => { const n = v as number; return n < 85 ? 100 : n < 90 ? 75 : n < 92 ? 50 : n < 95 ? 20 : 0 } },
        { name: 'Plaquettes', weight: 1.5, unit: 'G/L', extract: ps => ps.biology.platelets, normalize: v => { const n = v as number; return n < 20 ? 100 : n < 50 ? 75 : n < 100 ? 40 : n < 150 ? 15 : 0 } },
      ],
    }))

    // ── Champ 4 (V15) : Signature PIMS/MIS-C (×1.5) ──
    this.semanticFields.push(new SemanticField({
      name: 'Signature PIMS/MIS-C', category: 'pims', color: '#E5C84B',
      signals: [
        { name: 'Troponine', weight: 2, unit: 'ng/L', extract: ps => ps.pims.troponin, normalize: v => v == null ? 0 : (v as number) > 100 ? 100 : (v as number) > 50 ? 70 : (v as number) > 20 ? 40 : 0 },
        { name: 'D-dimères', weight: 1.5, unit: 'µg/mL', extract: ps => ps.pims.dDimers, normalize: v => v == null ? 0 : (v as number) > 5 ? 100 : (v as number) > 2 ? 65 : (v as number) > 0.5 ? 30 : 0 },
        { name: 'Pro-BNP', weight: 2, unit: 'pg/mL', extract: ps => ps.pims.proBNP, normalize: v => v == null ? 0 : (v as number) > 5000 ? 100 : (v as number) > 2000 ? 75 : (v as number) > 500 ? 45 : (v as number) > 100 ? 20 : 0 },
        { name: 'FEVG', weight: 2, unit: '%', extract: ps => ps.pims.ejectionFraction, normalize: v => v == null ? 0 : (v as number) < 30 ? 100 : (v as number) < 40 ? 75 : (v as number) < 50 ? 45 : (v as number) < 55 ? 15 : 0 },
        { name: 'COVID exposé', weight: 1, extract: ps => ps.pims.covidExposure, normalize: v => v ? 60 : 0 },
      ],
    }))

    // ── Champ 5 (V16) : Neuro-monitoring EEG/Biomarqueurs (×2) ──
    this.semanticFields.push(new SemanticField({
      name: 'Neuro-monitoring cérébral', category: 'neuro_monitoring', color: '#6C7CFF',
      signals: [
        { name: 'EEG Réactivité', weight: 2.5, extract: ps => ps.eeg?.reactivity, normalize: v => v == null ? 0 : v === false ? 80 : 0 },
        { name: 'NCSE', weight: 3, extract: ps => ps.eeg?.NCSEstatus, normalize: v => v === true ? 100 : 0 },
        { name: 'Crises EEG/h', weight: 2, unit: '/h', extract: ps => ps.eeg?.seizuresPerHour, normalize: v => v == null ? 0 : (v as number) > 10 ? 100 : (v as number) > 5 ? 80 : (v as number) > 2 ? 50 : (v as number) > 0 ? 20 : 0 },
        { name: 'Tendance EEG', weight: 2, extract: ps => ps.eeg?.trend, normalize: v => ({ worsening: 90, stable: 30, improving: 0 }[v as string] || 0) },
        { name: 'NfL', weight: 2.5, unit: 'pg/mL', extract: ps => ps.neuroBiomarkers?.nfl, normalize: v => v == null ? 0 : (v as number) > 500 ? 100 : (v as number) > 200 ? 70 : (v as number) > 100 ? 40 : (v as number) > 50 ? 15 : 0 },
        { name: 'NSE', weight: 2, unit: 'µg/L', extract: ps => ps.neuroBiomarkers?.nse, normalize: v => v == null ? 0 : (v as number) > 50 ? 100 : (v as number) > 25 ? 60 : (v as number) > 15 ? 25 : 0 },
        { name: 'S100B', weight: 1.5, unit: 'µg/L', extract: ps => ps.neuroBiomarkers?.s100b, normalize: v => v == null ? 0 : (v as number) > 0.5 ? 100 : (v as number) > 0.3 ? 70 : (v as number) > 0.15 ? 35 : 0 },
        { name: 'NPI pupillaire', weight: 2, extract: ps => ps.pupillometry?.npiLeft, normalize: (v, ps) => {
          if (v == null) return 0
          const npi = Math.min(v as number, ps.pupillometry?.npiRight ?? v as number)
          return npi < 1 ? 100 : npi < 2 ? 70 : npi < 3 ? 35 : 0
        }},
      ],
    }))

    // ── Patterns (5) ──
    this.patterns.push({
      name: 'Détérioration neurologique progressive',
      match: (ps) => {
        const h = ps.neuro.gcsHistory, c = ps.neuro.gcs
        if (h.length < 2) return { confidence: 0, description: '', implications: '' }
        const drop = (h[0] || 15) - c
        if (h.every((v, i) => i === 0 || v <= h[i - 1]) && drop >= 3) {
          return { confidence: Math.min(1, drop / 8), description: `GCS: ${h.join('→')}→${c}`, implications: 'Détérioration continue — van Baalen 2010' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Rebond post-amélioration',
      match: (ps) => {
        const h = ps.neuro.gcsHistory, c = ps.neuro.gcs
        if (h.length < 2) return { confidence: 0, description: '', implications: '' }
        if (h[h.length - 1] > h[h.length - 2] && c < h[h.length - 1]) {
          return { confidence: 0.85, description: `${h[h.length - 2]}→${h[h.length - 1]}→${c}`, implications: 'Rebond — Titulaer 2013 — suspecter arrêt prématuré immunothérapie' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Orage cytokinique',
      match: (ps) => {
        let markers = 0
        if (ps.biology.ferritin > 500) markers++
        if (ps.biology.ferritin > 1000) markers++
        if (ps.biology.crp > 100) markers++
        if (ps.biology.pct > 2) markers++
        if (ps.hemodynamics.temp >= 39) markers++
        if (ps.biology.wbc > 20 || ps.biology.wbc < 4) markers++
        if (ps.biology.lactate > 4) markers++
        if (markers >= 3) return { confidence: Math.min(1, markers / 5), description: `${markers} marqueurs orage`, implications: 'Considérer MAS — Kothur et al. / Dizon 2023' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Dissociation neuro-inflammatoire',
      match: (ps, fields) => {
        const n = fields.find(f => f.category === 'neuro')
        const i = fields.find(f => f.category === 'inflammatory')
        if (!n || !i) return { confidence: 0, description: '', implications: '' }
        if (n.intensity > 50 && i.intensity < 25) {
          return { confidence: 0.75, description: `Neuro ${n.intensity} vs Inflam ${i.intensity}`, implications: 'Auto-immun probable — orientation Graus 2016' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // V15 — Pattern PIMS cardio-neurologique (Francoeur 2024)
    this.patterns.push({
      name: 'Dissociation cardio-neurologique PIMS',
      match: (ps, fields) => {
        if (!ps.pims.confirmed && !ps.pims.covidExposure) return { confidence: 0, description: '', implications: '' }
        const pims = fields.find(f => f.category === 'pims')
        const neuro = fields.find(f => f.category === 'neuro')
        if (!pims || !neuro) return { confidence: 0, description: '', implications: '' }
        if (pims.intensity > 40 && neuro.intensity > 20) {
          return { confidence: Math.min(1, (pims.intensity + neuro.intensity) / 120), description: `PIMS ${pims.intensity} + Neuro ${neuro.intensity}`, implications: 'Atteinte neuro PIMS/MIS-C — OR 1.85/2.18 Francoeur JAMA 2024' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // V16 — Pattern lésion cérébrale multimodale (EEG + biomarqueurs + IRM)
    this.patterns.push({
      name: 'Lésion cérébrale multimodale',
      match: (ps, fields) => {
        const neuroMon = fields.find(f => f.category === 'neuro_monitoring')
        if (!neuroMon || neuroMon.intensity < 30) return { confidence: 0, description: '', implications: '' }
        let multimodal = 0
        if (ps.eeg && (ps.eeg.NCSEstatus || ps.eeg.seizuresPerHour > 3)) multimodal++
        if (ps.mri && ps.mri.t2FlairAbnormal) multimodal++
        if (ps.neuroBiomarkers && (ps.neuroBiomarkers.nfl ?? 0) > 100) multimodal++
        if (ps.pupillometry && Math.min(ps.pupillometry.npiLeft ?? 5, ps.pupillometry.npiRight ?? 5) < 3) multimodal++
        if (multimodal >= 2) {
          return { confidence: Math.min(1, 0.5 + multimodal * 0.15), description: `${multimodal} modalités convergentes (neuro-monitoring ${neuroMon.intensity})`, implications: 'Convergence multimodale → pronostic péjoratif — Shakeshaft 2023' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // ── Règles métier (4) ──
    this.rules.push({
      name: 'pSOFA Neurologique', reference: 'Matics 2017 — AUC 0.94',
      evaluate: (ps) => {
        const g = ps.neuro.gcs
        const s = g < 7 ? 4 : g < 10 ? 3 : g < 13 ? 2 : g < 15 ? 1 : 0
        return { triggered: true, type: 'validation', message: `pSOFA neuro: ${s}/4 (GCS ${g})`, adjustment: { psofa_neuro: s } }
      },
    })

    this.rules.push({
      name: 'Classification ILAE', reference: 'Trinka 2015',
      evaluate: (ps) => {
        const d = ps.neuro.seizureDuration, t = ps.neuro.seizureType
        if (t === 'status' || t === 'refractory_status' || t === 'super_refractory' || d >= 5) {
          const level = d >= 60 || t === 'super_refractory' ? 'Super-réfractaire' : d >= 30 || t === 'refractory_status' ? 'Réfractaire' : 'État de mal'
          return { triggered: true, type: 'guard', message: `ILAE: ${level}` }
        }
        return { triggered: false, type: 'validation', message: '' }
      },
    })

    this.rules.push({
      name: 'Critères de Graus', reference: 'Graus 2016',
      evaluate: (ps) => {
        let count = 0; const details: string[] = []
        if (ps.neuro.gcs < 14) { count++; details.push('conscience') }
        if (ps.neuro.seizures24h > 0) { count++; details.push('crises') }
        if (ps.csf.cells > 5) { count++; details.push('pléiocytose') }
        if (ps.csf.protein > 0.45) { count++; details.push('protéinorachie') }
        if (ps.csf.antibodies !== 'negative' && ps.csf.antibodies !== 'pending') { count++; details.push('Ac+') }
        if (ps.hemodynamics.temp >= 38) { count++; details.push('fièvre') }
        if (count >= 3) return { triggered: true, type: 'guard', message: `${count}/6 Graus: ${details.join(', ')}` }
        return { triggered: false, type: 'validation', message: '' }
      },
    })

    this.rules.push({
      name: 'mRS pédiatrique', reference: 'Beslow 2012',
      evaluate: (ps) => {
        const m = ps.neuro.gcs <= 4 ? 5 : ps.neuro.gcs <= 8 ? 4 : ps.neuro.gcs <= 11 || ps.neuro.pupils === 'fixed_one' ? 3 : ps.neuro.gcs <= 13 ? 2 : ps.neuro.gcs <= 14 ? 1 : 0
        return { triggered: true, type: 'validation', message: `mRS: ${m}/5` }
      },
    })
  }

  // ── Couche 2 : Contexte ──
  analyzeContext(ps: PatientState, ir: IntentionResult): ContextResult {
    const h = ps.neuro.gcsHistory, c = ps.neuro.gcs
    const details: { type: string; label: string; detail: string; icon: string }[] = []
    let cm = 1.0

    if (h.length >= 2) {
      const prev = h[h.length - 1], pp = h.length >= 2 ? h[h.length - 2] : prev
      if (c < prev && prev < pp) { details.push({ type: 'deterioration', label: 'Détérioration continue', detail: `GCS ${pp}→${prev}→${c}`, icon: '📉' }); cm = 1.3 }
      else if (c < prev && prev >= pp) { details.push({ type: 'rebond', label: 'Rebond', detail: `${pp}→${prev}→${c}`, icon: '↗️↘️' }); cm = 1.4 }
      else if (c > prev) { details.push({ type: 'improvement', label: 'Amélioration', detail: `GCS ${prev}→${c}`, icon: '📈' }); cm = 0.85 }
      else { details.push({ type: 'stable', label: 'Stable', detail: `GCS ${c}`, icon: '➡️' }) }
    }

    if (ps.hospDay >= 5 && c <= 10) { details.push({ type: 'prolonged', label: 'Prolongé', detail: `J${ps.hospDay}`, icon: '⏳' }); cm = Math.max(cm, 1.2) }

    // V15 — PIMS context boost (Francoeur 2024 OR 1.85)
    if (ps.pims.confirmed || (ps.pims.covidExposure && ps.pims.cardiacInvolvement)) {
      details.push({ type: 'pims', label: 'PIMS/MIS-C confirmé', detail: 'OR neuro 1.85', icon: '🫀' })
      cm = Math.max(cm, 1.15)
    }

    return { trend: details[0]?.type || 'stable', details, contextModifier: cm }
  }

  // ── Couche 4 : Courbe ──
  computeCurve(ps: PatientState, ir: IntentionResult): CurveResult {
    const h = ps.neuro.gcsHistory.map(g => Math.round(((15 - g) / 12) * 100))
    const c = Math.round(((15 - ps.neuro.gcs) / 12) * 100)
    const full = [...h, c]
    const gi = ir.fields.length > 0 ? ir.fields.reduce((s, f) => s + f.intensity, 0) / ir.fields.length : 0
    const td = full.length >= 2 ? full[full.length - 1] - full[full.length - 2] : 0

    return {
      trajectory: full,
      currentPosition: full.length - 1,
      currentValue: c,
      globalIntensity: Math.round(gi),
      trend: td > 5 ? 'worsening' : td < -5 ? 'improving' : 'stable',
      curveData: full,
      labels: full.map((_, i) => `J${ps.hospDay - full.length + 1 + i}`),
    }
  }

  // ── Synthèse ──
  synthesize(ps: PatientState, intention: IntentionResult, context: ContextResult, rules: RuleResult[], curve: CurveResult): SynthesisResult {
    const weights: Record<string, number> = { neuro: 3, inflammatory: 1.5, hemodynamic: 2, pims: 1.5 }
    let raw = 0, tw = 0

    for (const f of intention.fields) {
      // Skip PIMS field if no PIMS data
      if (f.category === 'pims' && !ps.pims.confirmed && !ps.pims.covidExposure) continue
      const w = weights[f.category] || 1
      raw += f.intensity * w
      tw += w
    }
    if (tw > 0) raw /= tw
    raw *= context.contextModifier
    intention.patterns.forEach(p => { raw += p.confidence * 12 })
    const score = Math.min(100, Math.round(raw))

    let level: string
    if (score >= 70) level = 'CRITIQUE'
    else if (score >= 50) level = 'SÉVÈRE'
    else if (score >= 30) level = 'MODÉRÉ'
    else if (score >= 15) level = 'LÉGER'
    else level = 'STABLE'

    const alerts: PatientState['alerts'] = []
    if (score >= 70) alerts.push({ severity: 'critical', title: 'ALERTE VPS CRITIQUE', body: `Score ${score}/100 — Activation protocole d'urgence`, source: 'VPS' })
    intention.patterns.filter(p => p.confidence > 0.6).forEach(p =>
      alerts.push({ severity: p.confidence > 0.8 ? 'critical' : 'warning', title: p.name, body: p.description, source: 'VPS Patterns' })
    )

    return { score, level, alerts, recommendations: [] }
  }
}
