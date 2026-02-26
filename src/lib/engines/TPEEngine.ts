// ============================================================
// PULSAR V15 — TPE Engine (Therapeutic Prospection Engine)
// Moteur prédictif — Le traitement de demain
// Croise les données inter-pathologies pour générer des hypothèses
// Couleur identitaire : #FFB347 (ambre doré)
// ============================================================

import { BrainCore, SemanticField } from './BrainCore'
import {
  PatientState, IntentionResult, ContextResult, RuleResult,
  CurveResult, SynthesisResult, TherapeuticHypothesis,
} from './PatientState'

export class TPEEngine extends BrainCore {
  private hypothesesBank: TherapeuticHypothesis[]

  constructor() {
    super('TPE')

    // ── Banque d'hypothèses thérapeutiques ──
    // Construite à partir des croisements inter-pathologies et littérature émergente
    this.hypothesesBank = [
      {
        id: 'H1_ANAKINRA_FIRES_IL1',
        title: 'Anakinra précoce dans le FIRES à profil IL-1β',
        rationale: 'L\'hypothèse inflammasome NLRP3/IL-1β (Lin & Hsu 2021) suggère que le FIRES est un syndrome auto-inflammatoire. L\'anakinra (antagoniste IL-1R) a montré une réduction des crises chez >50% des patients (Costagliola 2022, 37 patients). L\'initiation PRÉCOCE (avant J5) pourrait prévenir les séquelles irréversibles.',
        mechanismOfAction: 'Blocage du récepteur IL-1 → inhibition de la cascade inflammasome NLRP3 → réduction de la neuro-inflammation et de l\'excitotoxicité glutamatergique',
        supportingEvidence: ['Lin & Hsu, Clin Transl Immunol 2021 (hypothèse NLRP3)', 'Costagliola et al., Front Neurol 2022 (37 patients, >50% réponse)', 'Shrestha et al., Front Neurol 2023 (6 patients péd, réduction crises)', 'Clarkson et al., Ann Neurol 2019 (déficit endogène IL-1Ra dans FIRES)'],
        confidenceLevel: 'emerging',
        targetPathway: 'IL-1β / Inflammasome NLRP3',
        applicablePathologies: ['FIRES', 'NORSE'],
      },
      {
        id: 'H2_TOCILIZUMAB_CROSS',
        title: 'Tocilizumab pour FIRES à profil IL-6 élevé (croisement PIMS)',
        rationale: 'Le tocilizumab (anti-IL-6R) est efficace dans le PIMS/MIS-C. Kothur et al. ont montré des élévations IL-6 dans le LCR de patients FIRES. Si un patient FIRES présente un profil cytokinique dominé par l\'IL-6 plutôt que l\'IL-1β, le tocilizumab pourrait être plus adapté que l\'anakinra.',
        mechanismOfAction: 'Blocage du récepteur IL-6 → inhibition de la signalisation JAK/STAT → réduction de la cascade inflammatoire systémique et neurologique',
        supportingEvidence: ['Kothur et al., Cytokine 2016 (IL-6 élevée dans LCR FIRES)', 'Feldstein NEJM 2020 (efficacité tocilizumab dans PIMS)', 'Costagliola et al. 2022 (anti-cytokiniques dans épilepsie)'],
        confidenceLevel: 'exploratory',
        targetPathway: 'IL-6 / JAK-STAT',
        applicablePathologies: ['FIRES', 'PIMS/MIS-C'],
      },
      {
        id: 'H3_RITUXIMAB_MOGAD_EARLY',
        title: 'Rituximab précoce dans MOGAD récidivant pédiatrique',
        rationale: 'Les données Bilodeau 2024 et Banwell 2023 montrent un taux de rechute élevé dans le MOGAD pédiatrique. L\'initiation précoce du rituximab (sans passer par cyclophosphamide, CI dans MOGAD) pourrait réduire les rechutes et les séquelles visuelles.',
        mechanismOfAction: 'Déplétion des lymphocytes B CD20+ → réduction de la production d\'anticorps anti-MOG pathogènes → prévention des poussées démyélinisantes',
        supportingEvidence: ['Banwell et al., Lancet Neurol 2023 (critères MOGAD)', 'Bilodeau et al. 2024 (outcomes thérapeutiques)', 'Kurd 2024 (séries pédiatriques européennes)'],
        confidenceLevel: 'supported',
        targetPathway: 'Lymphocytes B / Anti-MOG',
        applicablePathologies: ['MOGAD/ADEM'],
      },
      {
        id: 'H4_KETOGENIC_NEUROPROTECTION',
        title: 'Régime cétogène comme neuroprotecteur précoce dans FIRES',
        rationale: 'Le régime cétogène est utilisé en L2 dans le FIRES mais souvent tardivement. Les données précliniques et les séries de cas (van Baalen 2023) suggèrent un effet neuroprotecteur indépendant de l\'effet antiépileptique, via la réduction du stress oxydatif et la modulation de l\'inflammasome.',
        mechanismOfAction: 'Production de corps cétoniques → substrat énergétique alternatif neuronal + inhibition NLRP3 + réduction ROS + stabilisation GABAergique',
        supportingEvidence: ['Van Baalen 2023 (approche pratique FIRES)', 'Gofshteyn et al., J Child Neurol 2017 (régime cétogène FIRES)'],
        confidenceLevel: 'emerging',
        targetPathway: 'Métabolisme cétogène / NLRP3',
        applicablePathologies: ['FIRES', 'NORSE'],
      },
      {
        id: 'H5_COMBINED_ANTI_CYTOKINE',
        title: 'Double blocage cytokinique IL-1β + IL-6 dans l\'orage réfractaire',
        rationale: 'Dans les cas de FIRES avec orage cytokinique réfractaire au traitement unique, le croisement avec les protocoles MAS/PIMS suggère qu\'un double blocage (anakinra + tocilizumab) pourrait être envisagé, à l\'image des protocoles rhumatologiques pour le MAS réfractaire.',
        mechanismOfAction: 'Blocage simultané des deux axes inflammatoires majeurs → suppression large de la cascade cytokinique → effet synergique anti-inflammatoire',
        supportingEvidence: ['Lin & Hsu 2021 (NLRP3/IL-1β)', 'Kothur et al. 2016 (IL-6 dans LCR)', 'Protocoles MAS rhumatologiques (double blocage)'],
        confidenceLevel: 'exploratory',
        targetPathway: 'IL-1β + IL-6 dual',
        applicablePathologies: ['FIRES', 'NORSE', 'PIMS/MIS-C'],
      },
      {
        id: 'H6_PIMS_NEURO_SCREENING',
        title: 'Screening neurologique systématique dans PIMS/MIS-C',
        rationale: 'L\'étude Francoeur JAMA 2024 (3568 patients, 46 centres) montre que l\'atteinte neurologique PIMS est sous-diagnostiquée (8.5-32.1%) avec des séquelles à la sortie (OR 1.85-2.18). Un screening EEG + IRM systématique à l\'admission PIMS pourrait identifier les patients à risque neuro.',
        mechanismOfAction: 'Détection précoce de l\'atteinte neuro-inflammatoire PIMS → initiation ciblée de neuroprotection → réduction des séquelles neurocognitives',
        supportingEvidence: ['Francoeur et al., JAMA Network Open 2024 (3568 pts, OR 1.85/2.18)', 'Feldstein NEJM 2020 (atteinte multi-organe PIMS)'],
        confidenceLevel: 'supported',
        targetPathway: 'Screening / Détection précoce',
        applicablePathologies: ['PIMS/MIS-C'],
      },
    ]

    // ── Champ 1 : Profil cytokinique ──
    this.semanticFields.push(new SemanticField({
      name: 'Profil cytokinique', category: 'cytokine_profile', color: '#FFB347',
      signals: [
        { name: 'CRP comme proxy IL-6', weight: 2, extract: ps => ps.biology.crp, normalize: v => Math.min(100, (v as number) / 2) },
        { name: 'Ferritine comme proxy activation macrophagique', weight: 2, extract: ps => ps.biology.ferritin, normalize: v => { const n = v as number; return n >= 1000 ? 100 : n >= 500 ? 70 : n >= 200 ? 40 : n >= 100 ? 15 : 0 } },
        { name: 'IL-6 directe', weight: 3, extract: ps => ps.cytokines?.il6, normalize: v => v == null ? 0 : Math.min(100, (v as number) / 10) },
        { name: 'IL-1β directe', weight: 3, extract: ps => ps.cytokines?.il1b, normalize: v => v == null ? 0 : Math.min(100, (v as number) / 5) },
      ],
    }))

    // ── Champ 2 : Réponse aux traitements actuels ──
    this.semanticFields.push(new SemanticField({
      name: 'Résistance thérapeutique', category: 'resistance', color: '#D63C3C',
      signals: [
        { name: 'Échecs cumulés', weight: 3, extract: ps => ps.treatmentHistory.filter(t => t.response === 'none').length, normalize: v => Math.min(100, (v as number) * 30) },
        { name: 'Durée sans amélioration', weight: 2, extract: ps => ps.hospDay, normalize: v => Math.min(100, (v as number) * 8) },
        { name: 'Réponses partielles', weight: 1.5, extract: ps => ps.treatmentHistory.filter(t => t.response === 'partial').length, normalize: v => Math.min(80, (v as number) * 20) },
      ],
    }))

    // ── Patterns TPE ──
    this.patterns.push({
      name: 'Profil IL-1β dominant',
      match: (ps) => {
        // FIRES classique + ferritine élevée + pas d'Ac spécifiques
        const firesLike = ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory'
        const highFerritin = ps.biology.ferritin > 500
        const noAb = ps.csf.antibodies === 'negative' || ps.csf.antibodies === 'pending'
        const il1High = (ps.cytokines?.il1b ?? 0) > 10
        if ((firesLike && highFerritin && noAb) || il1High) {
          return { confidence: il1High ? 0.9 : 0.65, description: 'Profil inflammasome NLRP3/IL-1β', implications: 'Hypothèse anakinra précoce — Lin & Hsu 2021' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Profil IL-6 dominant (croisement PIMS)',
      match: (ps) => {
        const highCRP = ps.biology.crp > 100
        const il6High = (ps.cytokines?.il6 ?? 0) > 50
        const pimsFeatures = ps.pims.confirmed || ps.pims.cardiacInvolvement
        if (il6High || (highCRP && pimsFeatures)) {
          return { confidence: il6High ? 0.85 : 0.55, description: 'Axe IL-6/JAK-STAT prédominant', implications: 'Hypothèse tocilizumab — croisement données PIMS' }
        }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    this.patterns.push({
      name: 'Résistance multi-lignes',
      match: (ps) => {
        const fails = ps.treatmentHistory.filter(t => t.response === 'none')
        if (fails.length >= 2) return { confidence: Math.min(1, fails.length / 3), description: `${fails.length} échecs — résistance thérapeutique`, implications: 'Explorer hypothèses non conventionnelles' }
        return { confidence: 0, description: '', implications: '' }
      },
    })

    // ── Règles TPE ──
    this.rules.push({
      name: 'Disclaimer éthique', reference: 'PULSAR — Cadre déontologique',
      evaluate: () => ({
        triggered: true,
        type: 'validation' as const,
        message: 'Les hypothèses TPE sont des pistes de recherche, PAS des prescriptions. Discussion obligatoire en RCP avant toute application.',
      }),
    })
  }

  // ── Couche 2 : Contexte TPE ──
  analyzeContext(ps: PatientState, ir: IntentionResult): ContextResult {
    const details: { type: string; label: string; detail: string; icon: string }[] = []
    let cm = 1.0

    // Plus le patient résiste aux traitements, plus les hypothèses sont pertinentes
    const fails = ps.treatmentHistory.filter(t => t.response === 'none').length
    if (fails >= 2) { details.push({ type: 'multi_failure', label: 'Résistance multi-lignes', detail: `${fails} échecs`, icon: '🔬' }); cm = 1.3 }

    // Lit les résultats des 4 autres moteurs
    if (ps.vpsResult && ps.vpsResult.synthesis.score >= 60) {
      details.push({ type: 'high_severity', label: 'Sévérité élevée', detail: `VPS ${ps.vpsResult.synthesis.score}`, icon: '🔴' })
      cm = Math.max(cm, 1.2)
    }

    if (ps.eweResult && ps.eweResult.synthesis.score >= 40) {
      details.push({ type: 'ewe_alert', label: 'Alerte précoce active', detail: `EWE ${ps.eweResult.synthesis.score}`, icon: '⚡' })
      cm = Math.max(cm, 1.15)
    }

    return { trend: details[0]?.type || 'stable', details, contextModifier: cm }
  }

  // ── Couche 4 : Courbe ──
  computeCurve(ps: PatientState): CurveResult {
    const fails = ps.treatmentHistory.filter(t => t.response === 'none').length
    const partials = ps.treatmentHistory.filter(t => t.response === 'partial').length
    const data = [fails * 30, (fails + partials) * 20, Math.min(100, fails * 30 + ps.hospDay * 5)]
    return {
      trajectory: data, currentPosition: data.length - 1, currentValue: data[data.length - 1] || 0,
      globalIntensity: data[data.length - 1] || 0, trend: fails >= 2 ? 'exploration_needed' : 'conventional',
      curveData: data, labels: ['Échecs', 'Résistance', 'Score global'],
    }
  }

  // ── Sélection des hypothèses pertinentes ──
  private selectHypotheses(ps: PatientState, intention: IntentionResult): TherapeuticHypothesis[] {
    const selected: TherapeuticHypothesis[] = []

    for (const hyp of this.hypothesesBank) {
      let relevance = 0

      // Check pathology match — élargi aux marqueurs biologiques
      const detectedPathologies: string[] = []
      if (ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') detectedPathologies.push('FIRES', 'NORSE')
      // Orage cytokinique avec crises = profil FIRES-like même sans SE réfractaire
      if (ps.biology.ferritin > 500 && ps.neuro.seizures24h >= 3) detectedPathologies.push('FIRES', 'NORSE')
      if (ps.csf.antibodies === 'nmdar') detectedPathologies.push('anti-NMDAR')
      if (ps.csf.antibodies === 'mog' || ps.mogad.mogAntibody) detectedPathologies.push('MOGAD/ADEM')
      if (ps.pims.confirmed || ps.pims.covidExposure) detectedPathologies.push('PIMS/MIS-C')

      const pathologyMatch = hyp.applicablePathologies.some(p => detectedPathologies.includes(p))
      if (pathologyMatch) relevance += 30

      // Check pattern match
      const il1Pattern = intention.patterns.find(p => p.name.includes('IL-1'))
      const il6Pattern = intention.patterns.find(p => p.name.includes('IL-6'))
      if (il1Pattern && hyp.targetPathway.includes('IL-1')) relevance += 40
      if (il6Pattern && hyp.targetPathway.includes('IL-6')) relevance += 40

      // Check resistance
      const fails = ps.treatmentHistory.filter(t => t.response === 'none').length
      if (fails >= 2) relevance += 20

      // Confidence boost
      if (hyp.confidenceLevel === 'supported') relevance += 10
      if (hyp.confidenceLevel === 'emerging') relevance += 5

      if (relevance >= 30) selected.push(hyp)
    }

    return selected.slice(0, 4) // Max 4 hypotheses
  }

  // ── Synthèse TPE ──
  synthesize(ps: PatientState, intention: IntentionResult, context: ContextResult, rules: RuleResult[], curve: CurveResult): SynthesisResult {
    const resistance = intention.fields.find(f => f.category === 'resistance')?.intensity || 0
    const cytokine = intention.fields.find(f => f.category === 'cytokine_profile')?.intensity || 0
    let score = Math.min(100, Math.round((resistance * 0.5 + cytokine * 0.5) * context.contextModifier))

    const hypotheses = this.selectHypotheses(ps, intention)

    const alerts: PatientState['alerts'] = []
    const recs: PatientState['recommendations'] = []

    if (hypotheses.length > 0) {
      alerts.push({ severity: 'info', title: `${hypotheses.length} hypothèse(s) thérapeutique(s) identifiée(s)`, body: hypotheses.map(h => h.title).join(' · '), source: 'TPE' })
      hypotheses.forEach(h => {
        recs.push({
          priority: h.confidenceLevel === 'supported' ? 'medium' : 'low',
          title: `💡 ${h.title}`,
          body: h.rationale.substring(0, 200) + '...',
          reference: h.supportingEvidence[0],
        })
      })
    }

    let level: string
    if (score >= 70) level = 'EXPLORATION URGENTE'
    else if (score >= 50) level = 'EXPLORATION RECOMMANDÉE'
    else if (score >= 25) level = 'HYPOTHÈSES DISPONIBLES'
    else level = 'TRAITEMENT CONVENTIONNEL'

    // Extend synthesis with hypotheses
    return { score, level, alerts, recommendations: recs }
  }
}
