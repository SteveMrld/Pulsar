// ============================================================
// PULSAR V15 — EWE Engine (Early Warning Engine)
// Moteur de prévention — Que va-t-il se passer dans 6-24h ?
// Micro-signaux, vélocité des changements, fenêtres de risque
// Couleur identitaire : #FF6B8A (rose)
// ============================================================

import { BrainCore, SemanticField } from './BrainCore'
import {
  PatientState, IntentionResult, ContextResult, RuleResult,
  CurveResult, SynthesisResult, EWEResult,
} from './PatientState'

export class EWEEngine extends BrainCore {
  constructor() {
    super('EWE')

    // ── Champ 1 : Vélocité neurologique ──
    // Pas le niveau absolu mais la VITESSE de changement
    this.semanticFields.push(new SemanticField({
      name: 'Vélocité neurologique', category: 'neuro_velocity', color: '#FF6B8A',
      signals: [
        {
          name: 'Delta GCS', weight: 3,
          extract: ps => {
            const h = ps.neuro.gcsHistory
            if (h.length < 1) return 0
            return ps.neuro.gcs - h[h.length - 1]
          },
          normalize: v => {
            const delta = v as number
            // Negative delta = deterioration = high risk
            if (delta <= -3) return 100
            if (delta <= -2) return 75
            if (delta <= -1) return 50
            if (delta === 0) return 10 // Stagnation quand GCS bas = signal
            return 0 // Improvement
          },
        },
        {
          name: 'Accélération crises', weight: 2.5,
          extract: ps => ps.neuro.seizures24h,
          normalize: v => {
            const n = v as number
            // > 6 crises/24h = trajectoire explosive
            return n >= 10 ? 100 : n >= 6 ? 80 : n >= 3 ? 50 : n >= 1 ? 20 : 0
          },
        },
        {
          name: 'Progression vers SE', weight: 3,
          extract: ps => ps.neuro.seizureType,
          normalize: v => {
            // Chaque step vers le haut = risque de bascule
            const progression: Record<string, number> = {
              none: 0, focal_aware: 10, focal_impaired: 30,
              generalized_tonic_clonic: 55, status: 80,
              refractory_status: 95, super_refractory: 100,
            }
            return progression[v as string] || 0
          },
        },
      ],
    }))

    // ── Champ 2 : Vélocité inflammatoire ──
    this.semanticFields.push(new SemanticField({
      name: 'Vélocité inflammatoire', category: 'inflam_velocity', color: '#F08A2B',
      signals: [
        {
          name: 'CRP montante', weight: 2, unit: 'mg/L',
          extract: ps => ps.biology.crp,
          // CRP entre 20-100 = zone de montée pré-orage
          normalize: v => { const n = v as number; return n >= 50 ? 80 : n >= 20 ? 60 : n >= 10 ? 35 : n >= 5 ? 15 : 0 },
        },
        {
          name: 'Ferritine en ascension', weight: 2.5, unit: 'µg/L',
          extract: ps => ps.biology.ferritin,
          // Ferritine 200-500 = signal précoce avant orage
          normalize: v => { const n = v as number; return n >= 500 ? 90 : n >= 300 ? 65 : n >= 200 ? 45 : n >= 100 ? 20 : 0 },
        },
        {
          name: 'Fièvre persistante', weight: 1.5, unit: '°C',
          extract: ps => ps.hemodynamics.temp,
          normalize: v => { const t = v as number; return t >= 39 ? 80 : t >= 38.5 ? 55 : t >= 38 ? 30 : 0 },
        },
      ],
    }))

    // ── Champ 3 : Fragilité hémodynamique ──
    this.semanticFields.push(new SemanticField({
      name: 'Fragilité hémodynamique', category: 'hemo_fragility', color: '#B96BFF',
      signals: [
        {
          name: 'Tachycardie relative', weight: 2, unit: 'bpm',
          extract: ps => ps.hemodynamics.heartRate,
          normalize: (v, ps) => {
            const r = ps.getNormalRanges(); const n = v as number
            // Tachycardie modérée = signal précoce de stress
            return n > r.hrHigh + 10 ? 70 : n > r.hrHigh ? 40 : 0
          },
        },
        {
          name: 'Lactates limites', weight: 2.5, unit: 'mmol/L',
          extract: ps => ps.biology.lactate,
          // Lactates 1.5-3 = zone grise pré-hypoperfusion
          normalize: v => { const n = v as number; return n >= 3 ? 80 : n >= 2 ? 55 : n >= 1.5 ? 30 : 0 },
        },
        {
          name: 'SpO2 borderline', weight: 2, unit: '%',
          extract: ps => ps.hemodynamics.spo2,
          // SpO2 93-96 = pas critique mais fragile
          normalize: v => { const n = v as number; return n < 93 ? 90 : n < 95 ? 55 : n < 96 ? 25 : 0 },
        },
      ],
    }))

    // ── Champ 4 (V16) : Signaux d'alerte neuro-monitoring (×2.5) ──
    this.semanticFields.push(new SemanticField({
      name: 'Alerte neuro-monitoring', category: 'neuro_alert', color: '#FF4757',
      signals: [
        { name: 'Tendance EEG', weight: 3, extract: ps => ps.eeg?.trend, normalize: v => ({ worsening: 100, stable: 20, improving: 0 }[v as string] || 0) },
        { name: 'NCSE actif', weight: 3, extract: ps => ps.eeg?.NCSEstatus, normalize: v => v === true ? 100 : 0 },
        { name: 'Sédation EEG', weight: 2, extract: ps => ps.eeg?.sedationEffect, normalize: v => ({ none: 0, mild: 15, moderate: 40, severe: 70, burst_suppression: 90 }[v as string] || 0) },
        { name: 'TCD Vasospasme', weight: 2, extract: ps => ps.tcd?.vasospasm, normalize: v => v === true ? 85 : 0 },
        { name: 'TCD Vélocité ACM', weight: 1.5, unit: 'cm/s', extract: ps => ps.tcd?.mca_velocity, normalize: v => v == null ? 0 : (v as number) > 200 ? 100 : (v as number) > 150 ? 65 : (v as number) > 120 ? 30 : 0 },
        { name: 'Asymétrie pupillaire', weight: 2.5, extract: ps => ps.pupillometry?.asymmetry, normalize: v => v === true ? 90 : 0 },
        { name: 'NPI minimal', weight: 2, extract: ps => ps.pupillometry?.npiLeft, normalize: (v, ps) => {
          if (v == null) return 0
          const npi = Math.min(v as number, ps.pupillometry?.npiRight ?? v as number)
          return npi < 1 ? 100 : npi < 2 ? 75 : npi < 3 ? 40 : npi < 3.5 ? 15 : 0
        }},
        { name: 'GFAP', weight: 1.5, unit: 'ng/mL', extract: ps => ps.neuroBiomarkers?.gfap, normalize: v => v == null ? 0 : (v as number) > 2 ? 100 : (v as number) > 1 ? 70 : (v as number) > 0.5 ? 35 : 0 },
      ],
    }))

    // ── Patterns EWE ──
    this.patterns.push({
      name: 'Fenêtre pré-critique FIRES',
      match: (ps) => {
        // Fièvre récente + crises débutantes + inflammation montante
        // = fenêtre 12-48h avant état de mal réfractaire (van Baalen 2010)
        let signals = 0
        if (ps.hemodynamics.temp >= 38) signals++
        if (ps.neuro.seizures24h >= 1 && ps.neuro.seizures24h <= 5) signals++
        if (ps.biology.crp >= 10 && ps.biology.crp < 100) signals++
        if (ps.ageMonths >= 36 && ps.ageMonths <= 180) signals++
        if (ps.neuro.gcs >= 12 && ps.neuro.gcs <= 14) signals++ // Altération légère, pas encore sévère
        if (signals >= 3) return { confidence: Math.min(0.9, signals / 5), description: `${signals}/5 signaux pré-FIRES`, implications: 'Fenêtre critique 12-48h — van Baalen 2010. EEG continu + bilan auto-immun en urgence' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Ascension silencieuse',
      match: (ps, fields) => {
        // Tous les champs entre 20-50 = rien de critique isolément, mais tout monte
        const avgIntensity = fields.length > 0 ? fields.reduce((s, f) => s + f.intensity, 0) / fields.length : 0
        const allModerate = fields.every(f => f.intensity >= 15 && f.intensity <= 60)
        if (allModerate && avgIntensity >= 25) return { confidence: Math.min(0.85, avgIntensity / 50), description: `Intensité moyenne ${Math.round(avgIntensity)}% sur ${fields.length} champs`, implications: 'Ascension multi-systémique silencieuse — risque de basculement dans 6-12h' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Rebond inflammatoire post-sevrage',
      match: (ps) => {
        // Patient amélioré (GCS remonté) + inflammation qui remonte + arrêt récent immunothérapie
        const h = ps.neuro.gcsHistory
        if (h.length < 2) return { confidence: 0, description: '', implications: '' }
        const wasImproving = h[h.length - 1] > h[h.length - 2]
        const inflammRising = ps.biology.crp > 20 || ps.biology.ferritin > 200
        const hadTreatment = ps.treatmentHistory.length > 0
        if (wasImproving && inflammRising && hadTreatment) {
          return { confidence: 0.7, description: 'Amélioration clinique + inflammation remontante', implications: 'Risque rebond 24-72h — Titulaer 2013. Ne pas interrompre immunothérapie' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // ── Règles EWE ──
    this.rules.push({
      name: 'PEWS adapté', reference: 'Pediatric Early Warning Score — littérature PEWS',
      evaluate: (ps) => {
        let pews = 0
        if (ps.neuro.gcs < 15) pews++
        if (ps.neuro.gcs < 12) pews++
        const r = ps.getNormalRanges()
        if (ps.hemodynamics.heartRate > r.hrHigh) pews++
        if (ps.hemodynamics.spo2 < 95) pews++
        if (ps.hemodynamics.temp >= 38.5) pews++
        if (pews >= 3) return { triggered: true, type: 'guard' as const, message: `PEWS adapté: ${pews}/5 — Surveillance rapprochée recommandée` }
        return { triggered: false, type: 'validation' as const, message: '' }
      },
    })

    this.rules.push({
      name: 'Fenêtre thérapeutique critique', reference: 'Kessi 2020 / van Baalen 2023',
      evaluate: (ps) => {
        if (ps.hospDay >= 3 && ps.hospDay <= 7 && ps.treatmentHistory.filter(t => t.response === 'none').length >= 1) {
          return { triggered: true, type: 'guard' as const, message: `J${ps.hospDay} + échec L1 = fenêtre d'escalade critique. Retard = séquelles irréversibles` }
        }
        return { triggered: false, type: 'validation' as const, message: '' }
      },
    })
  }

  // ── Couche 2 : Contexte EWE ──
  analyzeContext(ps: PatientState, ir: IntentionResult): ContextResult {
    const details: { type: string; label: string; detail: string; icon: string }[] = []
    let cm = 1.0

    // Lit VPS + TDE + PVE
    if (ps.vpsResult) {
      const vps = ps.vpsResult.synthesis.score
      if (vps >= 40 && vps < 70) {
        details.push({ type: 'vps_rising', label: 'VPS zone intermédiaire', detail: `${vps}/100 — zone de basculement`, icon: '⚠️' })
        cm = 1.25
      }
    }

    if (ps.pveResult && ps.pveResult.synthesis.score >= 40) {
      details.push({ type: 'pve_load', label: 'Charge pharma élevée', detail: `PVE ${ps.pveResult.synthesis.score}`, icon: '💊' })
      cm = Math.max(cm, 1.15)
    }

    if (ps.hospDay <= 3) {
      details.push({ type: 'early', label: 'Phase précoce', detail: `J${ps.hospDay} — données limitées`, icon: '🕐' })
    }

    return { trend: details[0]?.type || 'stable', details, contextModifier: cm }
  }

  // ── Couche 4 : Courbe prédictive ──
  computeCurve(ps: PatientState, ir: IntentionResult): CurveResult {
    const avgIntensity = ir.fields.length > 0 ? ir.fields.reduce((s, f) => s + f.intensity, 0) / ir.fields.length : 0
    // Projection simple : extrapoler la tendance
    const current = Math.round(avgIntensity)
    const h6 = Math.min(100, Math.round(current * 1.15))
    const h12 = Math.min(100, Math.round(current * 1.30))
    const h24 = Math.min(100, Math.round(current * 1.45))

    return {
      trajectory: [current, h6, h12, h24],
      currentPosition: 0,
      currentValue: current,
      globalIntensity: current,
      trend: current >= 40 ? 'worsening' : current >= 20 ? 'cautious' : 'stable',
      curveData: [current, h6, h12, h24],
      labels: ['Maintenant', '+6h', '+12h', '+24h'],
    }
  }

  // ── Synthèse EWE ──
  synthesize(ps: PatientState, intention: IntentionResult, context: ContextResult, rules: RuleResult[], curve: CurveResult): SynthesisResult {
    const avgIntensity = intention.fields.length > 0 ? intention.fields.reduce((s, f) => s + f.intensity, 0) / intention.fields.length : 0
    let score = Math.min(100, Math.round(avgIntensity * context.contextModifier))
    intention.patterns.forEach(p => { score = Math.min(100, score + Math.round(p.confidence * 15)) })

    const alerts: PatientState['alerts'] = []
    const recs: PatientState['recommendations'] = []

    intention.patterns.filter(p => p.confidence > 0.5).forEach(p =>
      alerts.push({ severity: p.confidence > 0.7 ? 'critical' : 'warning', title: `⚡ ${p.name}`, body: p.description, source: 'EWE' })
    )

    if (score >= 50) recs.push({ priority: 'urgent', title: 'Surveillance rapprochée', body: 'Constantes q30min, EEG continu, bilan biologique de contrôle', reference: 'EWE — Détection précoce' })
    if (score >= 30) recs.push({ priority: 'high', title: 'Anticipation thérapeutique', body: 'Préparer escalade si détérioration confirmée dans les prochaines heures', reference: 'EWE — Fenêtre d\'action' })

    let level: string
    if (score >= 70) level = 'ALERTE PRÉCOCE CRITIQUE'
    else if (score >= 50) level = 'ALERTE PRÉCOCE'
    else if (score >= 30) level = 'VIGILANCE'
    else level = 'SURVEILLANCE STANDARD'

    return { score, level, alerts, recommendations: recs }
  }
}
