// ============================================================
// PULSAR V15 — PVE Engine (Pharmacovigilance Engine)
// Interactions critiques · Patterns cocktail · Couleur : #B96BFF
// ============================================================

import { BrainCore, SemanticField } from './BrainCore'
import { PatientState, IntentionResult, ContextResult, RuleResult, CurveResult, SynthesisResult } from './PatientState'

interface Interaction {
  drugs: string[]
  also?: string[]
  severity: 'critical' | 'warning' | 'info'
  mechanism: string
  action: string
  reference: string
  conditionCheck?: (ps: PatientState) => boolean
}

export class PVEEngine extends BrainCore {
  interactions: Interaction[]

  constructor() {
    super('PVE')

    // ── Base d'interactions documentées ──
    this.interactions = [
      { drugs: ['valproate', 'méropénème'], severity: 'critical', mechanism: 'Chute VPA -66 à -88% en 24h — inhibition acylpeptide hydrolase', action: 'Switch LEV, dosage sérique VPA urgent', reference: 'Spriet 2007 / Al-Quteimat 2020 / Park et al.' },
      { drugs: ['midazolam', 'fluconazole'], severity: 'warning', mechanism: 'Inhibition CYP3A4 → midazolam ×200-400%', action: 'Réduire midazolam 50-75%', reference: 'Pharmacopée internationale' },
      { drugs: ['propofol'], severity: 'warning', mechanism: 'PRIS (rhabdomyolyse, acidose, hyperkaliémie)', action: 'CPK/lactates/TG q12h, limiter durée', reference: 'Bray 1998', conditionCheck: ps => ps.hospDay > 2 },
      { drugs: ['cyclophosphamide'], severity: 'warning', mechanism: 'Myélosuppression dose-dépendante', action: 'NFS J7-J14, MESNA systématique', reference: 'Guidelines NMDARE' },
      { drugs: ['aminoside', 'vancomycine'], also: ['amikacine', 'gentamicine'], severity: 'warning', mechanism: 'Néphrotoxicité additive', action: 'Dosage sérique, éviter >5j combiné', reference: 'Consensus réanimation pédiatrique' },
      // V15 — PIMS-specific
      { drugs: ['tocilizumab', 'héparine'], also: ['enoxaparine'], severity: 'warning', mechanism: 'Tocilizumab normalise CRP → masque infection + risque hémorragique', action: 'Surveillance clinique renforcée, fibrinogène q24h', reference: 'Guidelines PIMS/MIS-C' },
      { drugs: ['ivIg'], severity: 'info', mechanism: 'Surcharge volumique chez patient avec dysfonction cardiaque', action: 'Débit lent, monitoring FEVG si PIMS cardiaque', reference: 'Feldstein NEJM 2020', conditionCheck: ps => ps.pims.cardiacInvolvement },
    ]

    // ── Champ 1 : Charge médicamenteuse ──
    this.semanticFields.push(new SemanticField({
      name: 'Charge médicamenteuse', category: 'drug_burden', color: '#F08A2B',
      signals: [
        { name: 'Nb médicaments', weight: 2, extract: ps => ps.drugs.length, normalize: v => Math.min(100, (v as number) * 15) },
        { name: 'Durée hospit', weight: 1.5, unit: 'j', extract: ps => ps.hospDay, normalize: v => Math.min(100, (v as number) * 8) },
      ],
    }))

    // ── Champ 2 : Risque interaction ──
    this.semanticFields.push(new SemanticField({
      name: 'Risque interaction', category: 'interaction_risk', color: '#D63C3C',
      signals: [
        { name: 'Interactions détectées', weight: 3, extract: ps => this.countInteractions(ps), normalize: (v) => { const c = v as { critical: number; warning: number; info: number }; return Math.min(100, c.critical * 40 + c.warning * 20 + c.info * 5) } },
      ],
    }))

    // ── Champ 3 : Vulnérabilité organique ──
    this.semanticFields.push(new SemanticField({
      name: 'Vulnérabilité organique', category: 'organ_vulnerability', color: '#B96BFF',
      signals: [
        { name: 'Lactates', weight: 2, unit: 'mmol/L', extract: ps => ps.biology.lactate, normalize: v => Math.min(100, (v as number) * 20) },
        { name: 'Plaquettes', weight: 1.5, unit: 'G/L', extract: ps => ps.biology.platelets, normalize: v => { const n = v as number; return n < 50 ? 90 : n < 100 ? 50 : n < 150 ? 20 : 0 } },
        { name: 'Âge', weight: 1, extract: ps => ps.ageMonths, normalize: v => { const n = v as number; return n < 6 ? 80 : n < 24 ? 50 : n < 60 ? 25 : 10 } },
      ],
    }))

    // ── Champ 4 (V16) : Validation neuro-imagerie/biomarqueurs (×1.5) ──
    this.semanticFields.push(new SemanticField({
      name: 'Validation neuro-imagerie', category: 'neuro_imaging', color: '#B96BFF',
      signals: [
        { name: 'IRM T2/FLAIR', weight: 2, extract: ps => ps.mri?.t2FlairAbnormal, normalize: v => v === true ? 70 : 0 },
        { name: 'Restriction diffusion', weight: 2.5, extract: ps => ps.mri?.diffusionRestriction, normalize: v => v === true ? 80 : 0 },
        { name: 'Œdème cérébral', weight: 2, extract: ps => ps.mri?.edemaType, normalize: v => ({ none: 0, vasogenic: 30, cytotoxic: 80, mixed: 60 }[v as string] || 0) },
        { name: 'Engagement cérébral', weight: 3, extract: ps => ps.mri?.herniation, normalize: v => v === true ? 100 : 0 },
        { name: 'Spectroscopie NAA/Cr', weight: 1.5, extract: ps => ps.mri?.spectroscopy?.naaCreatine, normalize: v => v == null ? 0 : (v as number) < 1.0 ? 90 : (v as number) < 1.5 ? 50 : (v as number) < 2.0 ? 20 : 0 },
        { name: 'SSEP N20', weight: 2.5, extract: ps => ps.evokedPotentials?.ssep?.n20Present, normalize: v => v == null ? 0 : v === false ? 100 : 0 },
        { name: 'SSEP amplitude', weight: 1.5, extract: ps => ps.evokedPotentials?.ssep?.corticalAmplitude, normalize: v => ({ absent: 100, reduced: 55, normal: 0 }[v as string] || 0) },
        { name: 'Bandes oligoclonales', weight: 1, extract: ps => ps.neuroBiomarkers?.oligoclonalBands, normalize: v => v === true ? 60 : 0 },
        { name: 'Index IgG', weight: 1, extract: ps => ps.neuroBiomarkers?.iggIndex, normalize: v => v == null ? 0 : (v as number) > 0.7 ? 70 : (v as number) > 0.6 ? 35 : 0 },
      ],
    }))

    // ── Patterns ──
    this.patterns.push({
      name: 'Cocktail réanimation',
      match: (ps) => {
        const dn = ps.drugs.map(d => d.name.toLowerCase())
        const sedatives = ['midazolam', 'propofol', 'kétamine', 'thiopental'].filter(s => dn.some(d => d.includes(s)))
        const antiep = ['phénytoïne', 'valproate', 'levetiracetam', 'lacosamide'].filter(s => dn.some(d => d.includes(s)))
        if (sedatives.length >= 1 && antiep.length >= 1 && ps.drugs.length >= 4)
          return { confidence: 0.7, description: `Cocktail: ${sedatives.join('+')} + ${antiep.join('+')}`, implications: 'Risque cumulatif sédation + antiépileptique' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Cumul immunosuppresseur',
      match: (ps) => {
        const dn = ps.drugs.map(d => d.name.toLowerCase())
        const immuno = ['méthylprednisolone', 'rituximab', 'cyclophosphamide', 'tocilizumab', 'anakinra', 'bortezomib'].filter(s => dn.some(d => d.includes(s)))
        if (immuno.length >= 2) return { confidence: 0.8, description: `${immuno.length} immunosuppresseurs simultanés`, implications: 'Risque infectieux majeur — monitoring NFS + infections' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // V15 — Pattern surcharge PIMS
    this.patterns.push({
      name: 'Surcharge thérapeutique PIMS',
      match: (ps) => {
        if (!ps.pims.confirmed && !ps.pims.covidExposure) return { confidence: 0, description: '', implications: '' }
        const dn = ps.drugs.map(d => d.name.toLowerCase())
        const hasIVIg = dn.some(d => d.includes('ivig') || d.includes('immunoglobuline'))
        const hasCortico = dn.some(d => d.includes('méthylprednisolone') || d.includes('prednisolone'))
        const hasAnticoag = dn.some(d => d.includes('héparine') || d.includes('enoxaparine'))
        if (hasIVIg && hasCortico && hasAnticoag)
          return { confidence: 0.75, description: 'IVIg + Corticos + Anticoagulation simultanée', implications: 'Triple charge PIMS — surveiller surcharge volumique + hémorragie' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // ── Règles ──
    this.rules.push({
      name: 'Scan interactions', reference: 'ANSM / Littérature',
      evaluate: (ps) => {
        const dn = ps.drugs.map(d => d.name.toLowerCase())
        const detected: Interaction[] = []
        for (const inter of this.interactions) {
          const allNames = [...inter.drugs, ...(inter.also || [])]
          let found = false
          if (inter.drugs.length === 1) {
            found = allNames.some(n => dn.some(d => d.includes(n) || n.includes(d)))
            if (found && inter.conditionCheck && !inter.conditionCheck(ps)) found = false
          } else {
            const matched = inter.drugs.filter(d => dn.some(x => x.includes(d.toLowerCase())) || (inter.also || []).some(a => dn.some(x => x.includes(a.toLowerCase()))))
            found = matched.length >= 2
          }
          if (found) detected.push(inter)
        }
        if (detected.length > 0) return {
          triggered: true,
          type: detected.some(d => d.severity === 'critical') ? 'correction' : 'guard',
          message: detected.map(d => `${d.drugs.join('+')} [${d.severity}]`).join(', '),
          adjustment: { detectedInteractions: detected },
        }
        return { triggered: false, type: 'validation' as const, message: '' }
      },
    })

    this.rules.push({
      name: 'Toxicité cumulée', reference: 'Réanimation pédiatrique',
      evaluate: (ps) => {
        const dn = ps.drugs.map(d => d.name.toLowerCase())
        const warnings: string[] = []
        if (dn.some(d => d.includes('propofol')) && ps.hospDay > 2) warnings.push('PRIS risk (propofol >48h)')
        if (dn.some(d => d.includes('méthylprednisolone')) && ps.hospDay > 5) warnings.push('Cortico >5j — surveillance glycémie + HTA')
        if (warnings.length > 0) return { triggered: true, type: 'guard' as const, message: warnings.join(', ') }
        return { triggered: false, type: 'validation' as const, message: '' }
      },
    })
  }

  private countInteractions(ps: PatientState): { critical: number; warning: number; info: number } {
    const dn = ps.drugs.map(d => d.name.toLowerCase())
    let critical = 0, warning = 0, info = 0
    for (const inter of this.interactions) {
      const allNames = [...inter.drugs, ...(inter.also || [])]
      let found = false
      if (inter.drugs.length === 1) {
        found = allNames.some(n => dn.some(d => d.includes(n) || n.includes(d)))
        if (found && inter.conditionCheck && !inter.conditionCheck(ps)) found = false
      } else {
        const matched = allNames.filter(n => dn.some(d => d.includes(n) || n.includes(d)))
        found = matched.length >= 2
      }
      if (found) { if (inter.severity === 'critical') critical++; else if (inter.severity === 'warning') warning++; else info++ }
    }
    return { critical, warning, info }
  }

  analyzeContext(ps: PatientState): ContextResult {
    const details: { type: string; label: string; detail: string; icon: string }[] = []
    let cm = 1.0
    if (ps.tdeResult) {
      const recs = ps.tdeResult.synthesis.recommendations
      if (recs.length > 0) { details.push({ type: 'tde_reco', label: 'Reco TDE', detail: recs.map(x => x.title).join(', '), icon: '💊' }); cm = 1.1 }
    }
    if (ps.drugs.length >= 6) { details.push({ type: 'polypharm', label: 'Polypharmacie', detail: `${ps.drugs.length} médicaments`, icon: '⚗️' }); cm = Math.max(cm, 1.2) }
    return { trend: details[0]?.type || 'stable', details, contextModifier: cm }
  }

  computeCurve(ps: PatientState): CurveResult {
    const d: number[] = [], lb: string[] = []
    for (let i = 1; i <= ps.hospDay; i++) {
      d.push(Math.min(100, Math.round(ps.drugs.length * 10 * (i / ps.hospDay))))
      lb.push(`J${i}`)
    }
    return { trajectory: d, currentPosition: d.length - 1, currentValue: d[d.length - 1] || 0, globalIntensity: d[d.length - 1] || 0, trend: (d[d.length - 1] || 0) > 60 ? 'high_risk' : 'moderate', curveData: d, labels: lb }
  }

  synthesize(ps: PatientState, intention: IntentionResult, context: ContextResult, rules: RuleResult[]): SynthesisResult {
    const bi = intention.fields.find(f => f.category === 'drug_burden')?.intensity || 0
    const ii = intention.fields.find(f => f.category === 'interaction_risk')?.intensity || 0
    const vi = intention.fields.find(f => f.category === 'organ_vulnerability')?.intensity || 0
    let score = Math.min(100, Math.round((ii * 0.5 + bi * 0.25 + vi * 0.25) * context.contextModifier))

    const alerts: PatientState['alerts'] = []
    const recs: PatientState['recommendations'] = []
    const ir = rules.find(r => r.adjustment?.detectedInteractions)
    if (ir) {
      const detected = ir.adjustment!.detectedInteractions as Interaction[]
      detected.forEach(inter => {
        alerts.push({ severity: inter.severity === 'critical' ? 'critical' : 'warning', title: `Interaction: ${inter.drugs.join('+')}`, body: inter.mechanism, source: 'PVE' })
        recs.push({ priority: inter.severity === 'critical' ? 'urgent' : 'high', title: `Action: ${inter.drugs.join('+')}`, body: inter.action, reference: inter.reference })
      })
    }
    intention.patterns.filter(p => p.confidence > 0.5).forEach(p =>
      alerts.push({ severity: 'warning', title: p.name, body: p.description, source: 'PVE Patterns' })
    )

    let level: string
    if (score >= 75) level = 'RISQUE ÉLEVÉ'
    else if (score >= 50) level = 'RISQUE MODÉRÉ'
    else if (score >= 25) level = 'RISQUE FAIBLE'
    else level = 'RISQUE MINIMAL'

    return { score, level, alerts, recommendations: recs }
  }
}
