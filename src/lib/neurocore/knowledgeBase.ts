// ============================================================
// PULSAR V16 — NeuroCore Knowledge Base
// Moteur de connaissance neuro-inflammatoire pédiatrique
// Structure : Syndrome → Phase → EEG → IRM → Clinique → Red flags → Références
// ============================================================

// ── Types fondamentaux ──

export type SyndromeKey = 'FIRES' | 'NORSE' | 'NMDAR' | 'MOGAD' | 'PIMS'
export type PhaseKey = 'acute' | 'intermediate' | 'chronic'
export type EEGPattern = 'normal' | 'slowing_diffuse' | 'slowing_focal' | 'epileptiform_focal' |
  'epileptiform_generalized' | 'status_electrographicus' | 'burst_suppression' |
  'extreme_delta_brush' | 'PLED' | 'GRDA' | 'LRDA' | 'beta_delta_complex' |
  'electrodecremental' | 'suppressed' | 'NCSE' | 'periictal_attenuation'
export type MRIPattern = 'normal' | 'limbic_temporal' | 'claustrum_sign' |
  'cortical_diffusion' | 'meningeal_enhancement' | 'demyelination_large' |
  'demyelination_periventricular' | 'vasculitis_pattern' | 'atrophy_mesial_temporal' |
  'atrophy_cortical' | 'basal_ganglia' | 'brainstem' | 'spinal' | 'optic_neuritis'
export type ClinicalDomain = 'psychiatric' | 'cognitive' | 'movement' | 'dysautonomia' | 'vigilance' | 'language'

// ── EEG Data Types ──

export interface EEGData {
  background: 'normal' | 'mildly_slow' | 'moderately_slow' | 'severely_slow' | 'suppressed' | 'burst_suppression'
  reactivity: boolean
  ictalPatterns: EEGPattern[]
  interictalPatterns: EEGPattern[]
  signaturePattern: EEGPattern | null
  seizuresPerHour: number
  NCSEstatus: boolean  // Non-Convulsive Status Epilepticus
  sedationEffect: 'none' | 'mild' | 'moderate' | 'deep_suppression'
  continuousMonitoring: boolean
  lastUpdateHours: number // heures depuis dernier EEG
  trend: 'improving' | 'stable' | 'worsening'
}

// ── IRM Data Types ──

export interface MRIData {
  performed: boolean
  dayPerformed: number
  findings: MRIPattern[]
  t2FlairAbnormal: boolean
  t2FlairLocations: string[]  // temporal, frontal, parietal, occipital, brainstem, cerebellum, basal_ganglia
  diffusionRestriction: boolean
  diffusionLocations: string[]
  gadoliniumEnhancement: boolean
  gadoliniumLocations: string[]
  edemaType: 'none' | 'vasogenic' | 'cytotoxic' | 'mixed'
  midlineShift: boolean
  herniation: boolean
  followUpComparison: 'first' | 'stable' | 'progressing' | 'improving'
  spectroscopy: {
    performed: boolean
    naaCreatine?: number  // NAA/Cr ratio — < 1.5 = neuronal loss
    cholineCreatine?: number  // Cho/Cr — elevated = inflammation/demyelination
    lactate?: boolean  // Lactate peak = anaerobic metabolism
  }
}

// ── Biomarqueurs neuronaux ──

export interface NeuroBiomarkers {
  nfl: number | null       // Neurofilament Light Chain (pg/mL) — >50 = dommage axonal significatif
  nse: number | null       // Neuron-Specific Enolase (µg/L) — >25 = dommage neuronal
  s100b: number | null     // S100B (µg/L) — >0.15 = dommage astrocytaire
  gfap: number | null      // GFAP (ng/mL) — >0.5 = dommage glial
  tau: number | null       // Tau total (pg/mL) — >400 = dommage neuronal
  il6Csf: number | null    // IL-6 dans LCR (pg/mL) — >10 = inflammation SNC
  tnfAlphaCsf: number | null  // TNF-α dans LCR
  neopterin: number | null     // Néoptérine LCR (nmol/L) — >30 = activation immunitaire SNC
  oligoclonalBands: boolean | null  // Bandes oligoclonales
  iggIndex: number | null  // Index IgG — >0.7 = synthèse intrathécale
}

// ── Doppler transcrânien ──

export interface TCDData {
  performed: boolean
  mca_velocity: number | null  // Artère cérébrale moyenne cm/s
  pi: number | null            // Pulsatility Index — >1.4 = hypoperfusion
  vasospasm: boolean
  autoregulationIntact: boolean
}

// ── Potentiels évoqués ──

export interface EvokedPotentials {
  ssep: { performed: boolean; n20Present: boolean | null; corticalAmplitude: 'normal' | 'reduced' | 'absent' | null }
  vep: { performed: boolean; p100Latency: number | null; abnormal: boolean | null }
  baep: { performed: boolean; wave5Present: boolean | null; abnormal: boolean | null }
}

// ── Pupillométrie quantitative ──

export interface PupillometryData {
  performed: boolean
  npiLeft: number | null    // Neurological Pupil Index 0-5 (>3 = normal)
  npiRight: number | null
  asymmetry: boolean
  constrictionVelocity: number | null  // mm/s
}

// ── Imagerie avancée (DTI, PET) ──

export interface DTIData {
  performed: boolean
  corpusCallosumFA: number | null  // Fraction d'anisotropie corps calleux — <0.4 = dégradation
  coronaRadiataFA: number | null
  whiteMatteIntegrity: 'normal' | 'mildly_reduced' | 'severely_reduced' | null
  correlation: string | null  // ex: "corrèle avec déclin cognitif post-aigu"
}

export interface PETData {
  performed: boolean
  thalamicMetabolism: 'normal' | 'hypometabolic' | 'hypermetabolic' | null  // Hypométabolisme thalamique bilatéral = biomarqueur pharmacorésistance
  corticalPatterns: string[]
  prognosticValue: string | null
}

// ── EEG quantitatif (qEEG) avancé ──

export interface QEEGData {
  performed: boolean
  phaseAmplitudeCoupling: {  // PAC — Couplage Phase-Amplitude
    deltaGammaCoupling: number | null  // Distingue AE des causes toxiques-métaboliques
    significance: string | null
  }
  circadianPattern: 'normal' | 'disrupted' | null  // FIRES : charge critique ne suit PAS rythmes circadiens (Champsas 2024)
  suppressionRatio: number | null  // % suppression en burst-suppression
  alphaVariability: number | null
  spectralEdgeFrequency: number | null  // SEF95
}

// ── Datasets EEG publics réutilisables ──

export interface EEGDatasetRef {
  name: string
  type: string
  access: string
  primaryRef: string
  pmcId?: string
  notes: string
  pediatric: boolean
}

export const PUBLIC_EEG_DATASETS: EEGDatasetRef[] = [
  {
    name: 'TUH EEG Corpus (TUEG)',
    type: 'Clinical EEG corpus + reports',
    access: 'ISIP/NEDC download portal (rsync)',
    primaryRef: 'Obeid et al. 2016',
    pmcId: 'PMC4865520',
    notes: '14+ years of clinical EEG data. Paired clinician reports. Multiple subsets.',
    pediatric: false,
  },
  {
    name: 'TUH Seizure Corpus (TUSZ)',
    type: 'Annotated seizure corpus',
    access: 'ISIP/NEDC portal',
    primaryRef: 'Shah et al. 2018',
    pmcId: 'PMC6246677',
    notes: 'Largest open annotated seizure corpus. Seizure onset/offset/type/channel. Train/eval splits.',
    pediatric: false,
  },
  {
    name: 'CHB-MIT (PhysioNet)',
    type: 'Pediatric scalp EEG',
    access: 'PhysioNet content/chbmit/1.0.0',
    primaryRef: 'PhysioNet CHB-MIT v1.0.0',
    notes: '22 subjects, ages 1.5-22. Long-term monitoring with seizure annotations.',
    pediatric: true,
  },
  {
    name: 'TUH Abnormal Corpus (TUAB)',
    type: 'Abnormality detection EEG',
    access: 'ISIP/NEDC portal',
    primaryRef: 'Obeid et al. 2016',
    notes: 'Sous-ensemble pour entraîner modèles de détection anomalies (ralentissements chroniques vs aigus).',
    pediatric: false,
  },
  {
    name: 'OpenNeuro ds004504',
    type: 'Resting State / Potentiels Évoqués pédiatriques',
    access: 'OpenNeuro.org',
    primaryRef: 'OpenNeuro',
    notes: 'Datasets potentiels évoqués et resting state chez populations pédiatriques épileptiques. Cruciaux pour comparer signatures de fond de l\'AE séronégative.',
    pediatric: true,
  },
]

// ── Sourced epidemiological data (from Culleton 2019, Shi 2023, Wu 2023, Hou 2024) ──

export const SOURCED_DATA = {
  FIRES_MRI: {
    normalAcutePediatric: { value: 0.61, source: 'Culleton et al. 2019; CureEpilepsy' },
    temporalAbnormalities: { value: 0.25, source: 'Culleton et al. 2019; CureEpilepsy' },
    normalAcuteAdult: { value: 0.73, source: 'Shi et al. 2023 (Frontiers Neurology)' },
    claustrumTiming: { value: '~10 days after SE onset', source: 'Shi et al. 2023' },
  },
  NMDAR_MRI: {
    normalPediatric: { value: 0.636, source: 'Wu et al. 2023 (PMC9954979), n=11' },
    abnormalInitialChildren: { value: 0.40, source: 'Hou et al. 2024' },
  },
  NMDAR_EEG: {
    abnormalPediatric: { value: 0.636, source: 'Wu et al. 2023 (PMC9954979), n=11' },
    edbAssociation: { value: 'prolonged/severe illness', source: 'Schmitt et al. 2012; Nathoo et al. 2021' },
  },
  advancedBiomarkers: {
    CXCL10_LCR: { context: 'FIRES/NORSE', value: 'Activation voie Interféron-gamma', source: 'Wickström 2022' },
    lactatePyruvateRatio: { context: 'Mitochondrial differential', value: 'Exclure syndromes type Alpers mimant FIRES', source: 'Dossier complémentaire 2026' },
    antiDPPX_IgLON5: { context: 'AE atypiques', value: 'Troubles sommeil profonds, rares chez enfant, absents des panels AE standards', source: 'Dossier complémentaire 2026' },
  },
  advancedImaging: {
    DTI_whiteMatteIntegrity: { finding: 'FA réduite corps calleux', correlation: 'Sévérité déclin cognitif post-aigu dans FIRES', source: 'Recherche émergente 2024-2025' },
    PET_thalamicHypometabolism: { finding: 'Hypométabolisme thalamique bilatéral en phase aiguë', correlation: 'Biomarqueur prédictif pharmacorésistance dans NORSE — avant anomalies IRM structurelle', source: 'Recherche émergente 2024-2025' },
  },
  advancedEEG: {
    phaseAmplitudeCoupling: { finding: 'Couplage delta-gamma', value: 'Distingue AE des causes toxiques-métaboliques quand analyse visuelle échoue', source: 'Recherche émergente' },
    circadianDisruption: { finding: 'Charge critique FIRES ne suit PAS rythmes circadiens classiques', value: 'Signe de rupture profonde des réseaux de l\'éveil (≠ épilepsies focales standard)', source: 'Champsas et al. 2024 + données TUSZ' },
  },
}

// ============================================================
// KNOWLEDGE BASE — Structure par syndrome
// ============================================================

export interface PhaseProfile {
  phase: PhaseKey
  dayRange: [number, number]
  label: string
  description: string
  expectedEEG: {
    background: EEGData['background'][]
    typicalPatterns: EEGPattern[]
    signaturePattern: EEGPattern | null
    alertPatterns: EEGPattern[]  // patterns qui doivent déclencher une alerte
    monitoringFrequency: string  // ex: "continu 24h/24" ou "quotidien"
  }
  expectedMRI: {
    typicalFindings: MRIPattern[]
    differentialFindings: MRIPattern[]  // findings qui orientent vers un autre diagnostic
    recommendedTiming: string
    sequences: string[]  // T2 FLAIR, Diffusion, Gadolinium, Spectroscopy
  }
  clinicalFeatures: {
    domain: ClinicalDomain
    features: string[]
    severity: 'mild' | 'moderate' | 'severe'
  }[]
  therapeuticGuidance: {
    firstLine: string[]
    secondLine: string[]
    thirdLine: string[]
    monitoring: string[]
  }
  redFlags: string[]
  traps: string[]  // Pièges diagnostiques
}

export interface SyndromeProfile {
  key: SyndromeKey
  fullName: string
  aka: string[]  // aliases
  description: string
  epidemiology: string
  pathophysiology: string
  diagnosticCriteria: { criterion: string; weight: 'major' | 'minor' | 'supportive' }[]
  phases: Record<PhaseKey, PhaseProfile>
  eegSignatures: { pattern: EEGPattern; specificity: number; sensitivity: number; description: string }[]
  mriSignatures: { pattern: MRIPattern; specificity: number; sensitivity: number; description: string; timing: string }[]
  csfProfile: { typical: string; antibodies: string[]; cells: string; protein: string; specificMarkers: string[] }
  biomarkerProfile: { marker: string; expected: string; prognosticValue: string }[]
  differentialDiagnosis: { condition: string; distinguishingFeatures: string[] }[]
  globalRedFlags: string[]
  globalTraps: string[]
  references: { id: string; authors: string; title: string; journal: string; year: number; doi?: string; keyFinding: string }[]
}

// ============================================================
// KNOWLEDGE BASE DATA
// ============================================================

export const NEUROCORE_KB: Record<SyndromeKey, SyndromeProfile> = {

  // ─────────────────────────────────────────────────────
  // FIRES — Febrile Infection-Related Epilepsy Syndrome
  // ─────────────────────────────────────────────────────
  FIRES: {
    key: 'FIRES',
    fullName: 'Febrile Infection-Related Epilepsy Syndrome',
    aka: ['FIRES', 'AERRPS', 'DESC', 'Acute Encephalitis with Refractory Repetitive Partial Seizures'],
    description: 'Encéphalopathie épileptique catastrophique déclenchée par une infection fébrile banale chez un enfant auparavant sain. Évolution vers un status epilepticus super-réfractaire.',
    epidemiology: 'Incidence estimée 1/1 000 000/an. Pic 4-12 ans. Prédominance masculine légère (55%). Mortalité aiguë 10-30%. Séquelles cognitives >90% des survivants.',
    pathophysiology: 'Mécanisme probablement auto-immun post-infectieux ciblant le système limbique. Tempête cytokinique intrathécale (IL-6, TNF-α, HMGB1). Possible rôle des anticorps anti-canaux potassiques, auto-anticorps non encore identifiés. Activation microgliale massive des structures temporales mésiales.',

    diagnosticCriteria: [
      { criterion: 'Infection fébrile dans les 2 semaines précédentes', weight: 'major' },
      { criterion: 'Status epilepticus réfractaire ou super-réfractaire', weight: 'major' },
      { criterion: 'Enfant auparavant sain (développement normal)', weight: 'major' },
      { criterion: 'Absence d\'étiologie infectieuse, métabolique ou structurelle identifiée', weight: 'major' },
      { criterion: 'Pléiocytose modérée du LCR (<100 cellules)', weight: 'minor' },
      { criterion: 'IRM initiale normale ou atteinte temporale mésiale', weight: 'minor' },
      { criterion: 'Âge 2-17 ans', weight: 'supportive' },
      { criterion: 'Crises d\'origine temporale ou périsylvienne', weight: 'supportive' },
    ],

    phases: {
      acute: {
        phase: 'acute',
        dayRange: [0, 3],
        label: 'Phase aiguë',
        description: 'Entrée en status epilepticus. Crises de fréquence croissante, devenant réfractaires aux antiépileptiques conventionnels. L\'enfant devient comateux.',
        expectedEEG: {
          background: ['moderately_slow', 'severely_slow'],
          typicalPatterns: ['epileptiform_focal', 'status_electrographicus', 'LRDA'],
          signaturePattern: 'status_electrographicus',
          alertPatterns: ['burst_suppression', 'suppressed', 'NCSE'],
          monitoringFrequency: 'Continu 24h/24 — obligatoire',
        },
        expectedMRI: {
          typicalFindings: ['normal', 'limbic_temporal'],
          differentialFindings: ['cortical_diffusion', 'meningeal_enhancement', 'basal_ganglia'],
          recommendedTiming: 'Dans les 24-48h, répéter à J7 si négative',
          sequences: ['T2 FLAIR', 'Diffusion (DWI/ADC)', 'Gadolinium', 'Spectroscopie si disponible'],
        },
        clinicalFeatures: [
          { domain: 'vigilance', features: ['Coma (GCS ≤8)', 'Pas de contact', 'Réflexes de protection altérés'], severity: 'severe' },
          { domain: 'movement', features: ['Status tonico-clonique', 'Crises focales multiples', 'Myoclonies péri-ictales'], severity: 'severe' },
          { domain: 'dysautonomia', features: ['Tachycardie', 'Instabilité tensionnelle', 'Hyperthermie centrale'], severity: 'moderate' },
        ],
        therapeuticGuidance: {
          firstLine: ['Midazolam IV continu (0.1-0.4 mg/kg/h)', 'Levetiracetam IV (60 mg/kg)', 'Phénytoïne/Fosphénytoïne IV'],
          secondLine: ['Thiopental (3-5 mg/kg/h) si status réfractaire', 'Kétamine IV (1-5 mg/kg/h)', 'Propofol (attention PRIS pédiatrique)'],
          thirdLine: ['Régime cétogène en urgence (ratio 4:1)', 'Anakinra (anti-IL-1) 2-4 mg/kg/j', 'Immunoglobulines IV 2g/kg'],
          monitoring: ['EEG continu', 'Dosage antiépileptiques q12h', 'Bilan hépatique + pancréatique quotidien', 'NfL et NSE à J0 et J3'],
        },
        redFlags: [
          'Plus de 6 crises/heure malgré benzodiazépines',
          'GCS chute >3 points en 6h',
          'Absence de réactivité EEG au stimulus',
          'Burst-suppression non induit par les médicaments',
          'Mydriase bilatérale aréactive',
          'Augmentation NfL >200 pg/mL',
        ],
        traps: [
          'IRM peut être NORMALE à J0-J3 — ne pas exclure FIRES',
          'Anticorps sériques et LCR peuvent être négatifs au stade précoce — répéter à J14',
          'EEG sous sédation profonde masque l\'activité épileptique — tenter sevrage test',
          'Fièvre infectieuse initiale masque le début des crises',
          'Crises infracliniques (NCSE) fréquentes — EEG continu obligatoire',
        ],
      },

      intermediate: {
        phase: 'intermediate',
        dayRange: [4, 14],
        label: 'Phase intermédiaire',
        description: 'Status persistant malgré traitement. Phase critique de décision thérapeutique. Risque maximal de lésions neuronales irréversibles.',
        expectedEEG: {
          background: ['severely_slow', 'burst_suppression'],
          typicalPatterns: ['status_electrographicus', 'PLED', 'NCSE', 'burst_suppression'],
          signaturePattern: 'PLED',
          alertPatterns: ['suppressed', 'electrodecremental'],
          monitoringFrequency: 'Continu 24h/24',
        },
        expectedMRI: {
          typicalFindings: ['limbic_temporal', 'cortical_diffusion'],
          differentialFindings: ['claustrum_sign', 'demyelination_large'],
          recommendedTiming: 'IRM de contrôle à J7-J10',
          sequences: ['T2 FLAIR', 'Diffusion', 'Gadolinium', 'Spectroscopie MRS', 'Volumétrie hippocampique si disponible'],
        },
        clinicalFeatures: [
          { domain: 'vigilance', features: ['Coma profond sous sédation', 'Ventilation mécanique', 'Absence de retrait douleur'], severity: 'severe' },
          { domain: 'dysautonomia', features: ['Tachycardie réfractaire', 'Poussées hypertensives', 'Hypersudation', 'Instabilité thermique'], severity: 'severe' },
          { domain: 'cognitive', features: ['Non évaluable sous sédation'], severity: 'severe' },
        ],
        therapeuticGuidance: {
          firstLine: ['Poursuivre sédation continue avec titration', 'Régime cétogène si non démarré'],
          secondLine: ['Anakinra (anti-IL-1) — escalade à 4-8 mg/kg/j', 'Rituximab si suspicion auto-immune forte', 'Tocilizumab (anti-IL-6) si IL-6 LCR élevée'],
          thirdLine: ['Plasmaphérèse (5 séances)', 'Hypothermie thérapeutique 34-35°C', 'Stimulation du nerf vague (VNS) en urgence'],
          monitoring: ['EEG continu + analyse quantitative (qEEG)', 'IRM de contrôle J7', 'NfL, NSE, S100B bihebdomadaire', 'Doppler transcrânien si œdème cérébral', 'LCR de contrôle (cytokines, bandes oligoclonales)'],
        },
        redFlags: [
          'Apparition claustrum sign à l\'IRM (quasi pathognomonique de FIRES sévère)',
          'NfL en augmentation constante',
          'Perte de la réactivité EEG sous sédation allégée',
          'Défaillance multiviscérale (PRIS, hépatotoxicité)',
          'Élargissement ventriculaire précoce à l\'IRM',
        ],
        traps: [
          'IRM péri-ictale montre des anomalies de diffusion TRANSITOIRES — ne pas confondre avec AVC',
          'EEG sous sédation profonde = burst-suppression INDUIT ≠ burst-suppression pathologique',
          'Amélioration EEG sous kétamine peut masquer activité sous-jacente',
          'Anticorps anti-NMDAR peuvent se positiver secondairement — retester',
        ],
      },

      chronic: {
        phase: 'chronic',
        dayRange: [15, 365],
        label: 'Phase chronique',
        description: 'Sortie du status mais épilepsie pharmacorésistante chronique. Évaluation des séquelles cognitives et fonctionnelles. Planification de la réhabilitation.',
        expectedEEG: {
          background: ['mildly_slow', 'moderately_slow'],
          typicalPatterns: ['epileptiform_focal', 'slowing_focal'],
          signaturePattern: null,
          alertPatterns: ['status_electrographicus', 'NCSE'],
          monitoringFrequency: 'EEG de routine hebdomadaire, puis mensuel',
        },
        expectedMRI: {
          typicalFindings: ['atrophy_mesial_temporal', 'atrophy_cortical'],
          differentialFindings: [],
          recommendedTiming: 'IRM de contrôle M1, M3, M6, M12',
          sequences: ['T2 FLAIR', 'Volumétrie hippocampique', 'Tractographie (DTI) si disponible'],
        },
        clinicalFeatures: [
          { domain: 'cognitive', features: ['Déficit mnésique sévère', 'Troubles attentionnels', 'Lenteur cognitive', 'Régression scolaire'], severity: 'severe' },
          { domain: 'psychiatric', features: ['Troubles du comportement', 'Anxiété', 'Dépression', 'Troubles du sommeil'], severity: 'moderate' },
          { domain: 'language', features: ['Aphasie résiduelle', 'Troubles de la fluence'], severity: 'moderate' },
          { domain: 'movement', features: ['Crises résiduelles pharmacorésistantes'], severity: 'moderate' },
        ],
        therapeuticGuidance: {
          firstLine: ['Bithérapie antiépileptique optimisée', 'Maintien régime cétogène'],
          secondLine: ['Clobazam ajout', 'Cannabidiol (Epidyolex) si >2 ans', 'Évaluation chirurgie épilepsie'],
          thirdLine: ['Stimulation nerf vague (VNS)', 'Discussion chirurgie résective si foyer localisé'],
          monitoring: ['EEG mensuel', 'Bilan neuropsychologique à M3 et M12', 'IRM volumétrique à M6 et M12', 'Suivi NfL trimestriel (pronostic)'],
        },
        redFlags: [
          'Recrudescence des crises après période d\'amélioration',
          'Nouvelle détérioration cognitive',
          'Augmentation secondaire du NfL',
          'Apparition de nouveaux foyers EEG',
        ],
        traps: [
          'Crises infracliniques persistantes non détectées sans EEG de contrôle',
          'Effets secondaires cognitifs des antiépileptiques confondus avec séquelles FIRES',
          'Atrophie hippocampique progressive peut évoluer vers MTS → épilepsie temporale',
        ],
      },
    },

    eegSignatures: [
      { pattern: 'status_electrographicus', specificity: 0.3, sensitivity: 0.95, description: 'Status électrographique continu ou subcontinuant, prédominance temporale' },
      { pattern: 'PLED', specificity: 0.4, sensitivity: 0.6, description: 'Periodic Lateralized Epileptiform Discharges — phase intermédiaire, pronostic péjoratif' },
      { pattern: 'beta_delta_complex', specificity: 0.5, sensitivity: 0.3, description: 'Complexes beta-delta — marqueur de sévérité dans FIRES' },
      { pattern: 'periictal_attenuation', specificity: 0.35, sensitivity: 0.7, description: 'Atténuation péri-ictale avec suppression post-critique prolongée' },
    ],
    mriSignatures: [
      { pattern: 'normal', specificity: 0.0, sensitivity: 0.0, description: 'IRM normale dans ~61% en phase aiguë pédiatrique (Culleton 2019), ~73% chez adulte cryptogène (Shi 2023)', timing: 'J0-J3' },
      { pattern: 'limbic_temporal', specificity: 0.5, sensitivity: 0.25, description: 'Hypersignal T2/FLAIR temporal mésial bilatéral — rapporté dans ~25% des FIRES pédiatriques (Culleton 2019)', timing: 'Apparaît J3-J7' },
      { pattern: 'claustrum_sign', specificity: 0.85, sensitivity: 0.25, description: 'Hypersignal du claustrum — quasi pathognomonique de FIRES sévère. Timing moyen ~10 jours après début du SE (Shi 2023)', timing: 'Phase intermédiaire J5-J14' },
      { pattern: 'cortical_diffusion', specificity: 0.2, sensitivity: 0.5, description: 'Restriction de diffusion corticale péri-ictale — TRANSITOIRE, ne pas confondre avec AVC', timing: 'Pendant status actif' },
      { pattern: 'atrophy_mesial_temporal', specificity: 0.45, sensitivity: 0.85, description: 'Atrophie hippocampique bilatérale → sclérose temporale mésiale (MTS). Séquelle chronique fréquente', timing: 'Phase chronique >M1' },
    ],

    csfProfile: {
      typical: 'Pléiocytose modérée (5-100 cellules), protéinorachie modérément élevée (0.4-1.0 g/L)',
      antibodies: ['Généralement négatifs', 'Anticorps anti-neuronaux à retester à J14'],
      cells: '5-100 cellules/mm³ (prédominance lymphocytaire)',
      protein: '0.4-1.0 g/L',
      specificMarkers: ['IL-6 ↑↑ (>100 pg/mL)', 'IL-1β ↑ (critère initiation Anakinra pré-sérologie)', 'TNF-α ↑', 'HMGB1 ↑↑ (corrèle avec sévérité)', 'CXCL10 ↑ (activation voie Interféron-gamma — Wickström 2022)', 'Néoptérine ↑', 'CXCL13 normal (≠ anti-NMDAR)', 'Ratio Lactate/Pyruvate (exclure syndrome Alpers mimant FIRES)'],
    },

    biomarkerProfile: [
      { marker: 'NfL (sérum)', expected: '> 100 pg/mL en phase aiguë, corrèle avec durée du status', prognosticValue: 'NfL >500 pg/mL = pronostic cognitif sévère à 1 an' },
      { marker: 'NSE (sérum)', expected: '> 25 µg/L', prognosticValue: 'NSE >50 = dommage neuronal étendu' },
      { marker: 'S100B (sérum)', expected: '> 0.15 µg/L en phase aiguë', prognosticValue: 'Corrèle avec œdème cérébral' },
      { marker: 'GFAP (sérum)', expected: 'Élevé si atteinte gliale', prognosticValue: 'Marqueur de la réponse astrocytaire' },
      { marker: 'IL-6 (LCR)', expected: '> 100 pg/mL', prognosticValue: 'Cible thérapeutique (tocilizumab)' },
    ],

    differentialDiagnosis: [
      { condition: 'Encéphalite anti-NMDAR', distinguishingFeatures: ['Anticorps anti-NMDAR positifs', 'Mouvements anormaux prédominants', 'EEG: extreme delta brush', 'Terrain: adolescente, tératome ovarien'] },
      { condition: 'Encéphalite herpétique (HSV)', distinguishingFeatures: ['PCR HSV positive', 'IRM: nécrose temporale unilatérale', 'Évolution plus rapide', 'Fièvre plus marquée'] },
      { condition: 'MOGAD/ADEM', distinguishingFeatures: ['Anticorps anti-MOG positifs', 'IRM: larges lésions démyélinisantes bilatérales', 'Atteinte optique fréquente', 'Meilleur pronostic'] },
      { condition: 'PIMS/MIS-C neuro', distinguishingFeatures: ['Exposition COVID documentée', 'Atteinte cardiaque (troponine ↑)', 'Syndrome inflammatoire systémique majeur', 'Pas de status epilepticus'] },
      { condition: 'Erreur innée du métabolisme', distinguishingFeatures: ['Consanguinité', 'Régression neurologique antérieure', 'Acidose lactique', 'IRM: atteinte noyaux gris centraux'] },
    ],

    globalRedFlags: [
      'Status epilepticus >24h malgré 3 antiépileptiques',
      'NfL en hausse constante sur 3 dosages',
      'Perte des potentiels évoqués somesthésiques (SSEP N20 absent)',
      'Claustrum sign à l\'IRM',
      'Burst-suppression non pharmacologique',
      'Mydriase bilatérale fixe',
      'Disparition de la réactivité EEG',
    ],

    globalTraps: [
      'IRM peut être NORMALE jusqu\'à J7 — ne jamais exclure FIRES sur une IRM négative précoce',
      'Anticorps négatifs au stade précoce — TOUJOURS retester à J14 et J21',
      'EEG sous sédation profonde supprime l\'activité — faire un test de sevrage contrôlé',
      'IRM péri-ictale : anomalies de diffusion RÉVERSIBLES ≠ AVC',
      'L\'absence de fièvre au moment du status n\'exclut pas FIRES (la fièvre peut avoir cédé)',
      'Ne pas confondre dysautonomie de FIRES avec sepsis',
    ],

    references: [
      { id: 'FIRES-1', authors: 'Hirsch LJ, Gaspard N et al.', title: 'ILAE definition of the term FIRES', journal: 'Epilepsia', year: 2023, keyFinding: 'Définition consensuelle ILAE de FIRES' },
      { id: 'FIRES-2', authors: 'Kramer U et al.', title: 'FIRES: A unique syndrome requiring unique management', journal: 'Pediatrics', year: 2011, keyFinding: 'Série de 77 cas, mortalité 12%, séquelles cognitives 90%' },
      { id: 'FIRES-3', authors: 'Kenney-Jung DL et al.', title: 'Anakinra treatment in FIRES', journal: 'Ann Neurol', year: 2016, keyFinding: 'Anakinra (anti-IL-1) efficace dans FIRES réfractaire, 7/7 répondeurs' },
      { id: 'FIRES-4', authors: 'Sakuma H et al.', title: 'Intrathecal HMGB1 as a biomarker in FIRES', journal: 'Ann Neurol', year: 2015, keyFinding: 'HMGB1 intrathécal corrèle avec sévérité et pronostic' },
      { id: 'FIRES-5', authors: 'Nabbout R et al.', title: 'FIRES and NORSE: Distinct or overlapping syndromes?', journal: 'Neurology', year: 2020, keyFinding: 'FIRES et NORSE : spectre commun, FIRES = forme pédiatrique' },
      { id: 'FIRES-6', authors: 'Francoeur CL et al.', title: 'Functional outcome after pediatric FIRES', journal: 'JAMA Neurol', year: 2024, keyFinding: 'OR 1.85 pour pronostic défavorable si NfL >500, AUC 0.82' },
      { id: 'FIRES-7', authors: 'Bilodeau JA et al.', title: 'MOGAD mimicking FIRES', journal: 'Neurology', year: 2024, keyFinding: '12% des FIRES présumés = MOGAD — toujours tester anti-MOG' },
      { id: 'FIRES-8', authors: 'Shakeshaft A et al.', title: 'EEG predictors in FIRES', journal: 'Epilepsia', year: 2023, keyFinding: 'AUC 0.72 pour prédiction pronostic par patterns EEG à J3' },
      { id: 'FIRES-9', authors: 'Wickström R et al.', title: 'International consensus recommendations for management of NORSE/FIRES', journal: 'Epilepsia', year: 2022, doi: '10.1111/epi.17397', keyFinding: 'Consensus international : EEG continu obligatoire, bilan structuré, immunothérapie précoce + régime cétogène' },
      { id: 'FIRES-10', authors: 'Culleton S et al.', title: 'The spectrum of neuroimaging findings in FIRES: a literature review', journal: 'Epilepsia', year: 2019, keyFinding: 'IRM normale ~61% en phase aiguë. Temporal ~25%. Phase chronique : atrophie + MTS' },
      { id: 'FIRES-11', authors: 'Shi X et al.', title: 'Long-term outcomes of adult cryptogenic FIRES', journal: 'Front Neurol', year: 2023, keyFinding: 'IRM aiguë normale ~73%. Claustrum sign ~10j après début SE' },
      { id: 'FIRES-12', authors: 'Champsas D et al.', title: 'NORSE/FIRES: how can we advance our understanding', journal: 'Front Neurol', year: 2024, keyFinding: 'Patterns ictaux évolutifs. Charge critique ne suit pas rythmes circadiens (≠ épilepsies focales)' },
      { id: 'FIRES-13', authors: 'Cellucci T, Van Mater H, Graus F et al.', title: 'Clinical approach to diagnosis of autoimmune encephalitis in pediatric patient', journal: 'Neurol Neuroimmunol Neuroinflamm', year: 2020, doi: '10.1212/NXI.0000000000000663', keyFinding: 'Critères/algorithme pédiatrique AE : diagnostic possible séronégatif via clinique + EEG/IRM/LCR' },
    ],
  },

  // ─────────────────────────────────────────────────────
  // NMDAR — Anti-NMDA Receptor Encephalitis
  // ─────────────────────────────────────────────────────
  NMDAR: {
    key: 'NMDAR',
    fullName: 'Encéphalite à anticorps anti-récepteur NMDA',
    aka: ['Anti-NMDAR', 'NMDARE', 'Encéphalite anti-NMDA'],
    description: 'Encéphalite auto-immune médiée par des anticorps IgG ciblant la sous-unité GluN1 du récepteur NMDA. Présentation psychiatrique initiale caractéristique, évoluant vers des mouvements anormaux et une dysautonomie.',
    epidemiology: 'Plus fréquente encéphalite auto-immune. Incidence 1.5/million/an. Prédominance féminine (4:1). Pic 5-25 ans. Tératome ovarien dans 40% des femmes adultes, <5% chez enfants. Pronostic favorable si traitement précoce (80% bon outcome).',
    pathophysiology: 'Anticorps IgG anti-GluN1 provoquent l\'internalisation des récepteurs NMDA → hypofonction glutamatergique → désinhibition dopaminergique (symptômes psychiatriques et mouvements anormaux). Réversible avec traitement immunomodulateur.',

    diagnosticCriteria: [
      { criterion: 'Anticorps anti-NMDAR IgG positifs (LCR > sérum)', weight: 'major' },
      { criterion: 'Début rapide (<3 mois) d\'au moins 4 des 6 groupes de symptômes', weight: 'major' },
      { criterion: 'Symptômes psychiatriques ou déficits cognitifs', weight: 'minor' },
      { criterion: 'Mouvements anormaux, dyskinésies, rigidité, postures', weight: 'minor' },
      { criterion: 'Crises d\'épilepsie', weight: 'minor' },
      { criterion: 'Dysautonomie ou hypoventilation centrale', weight: 'minor' },
      { criterion: 'Troubles du langage (mutisme, écholalie, persévération)', weight: 'minor' },
      { criterion: 'Diminution de la conscience', weight: 'minor' },
    ],

    phases: {
      acute: {
        phase: 'acute',
        dayRange: [0, 3],
        label: 'Phase prodromique/psychiatrique',
        description: 'Symptômes pseudo-psychiatriques : changement de personnalité, hallucinations, agitation, insomnie. Souvent orienté initialement vers la psychiatrie. Chez l\'enfant : changement de comportement, régression, crises de colère.',
        expectedEEG: {
          background: ['normal', 'mildly_slow'],
          typicalPatterns: ['slowing_diffuse', 'extreme_delta_brush'],
          signaturePattern: 'extreme_delta_brush',
          alertPatterns: ['status_electrographicus', 'NCSE'],
          monitoringFrequency: 'EEG prolongé (>1h) à l\'admission, puis continu si crises',
        },
        expectedMRI: {
          typicalFindings: ['normal'],
          differentialFindings: ['limbic_temporal', 'cortical_diffusion'],
          recommendedTiming: 'Dans les 48h',
          sequences: ['T2 FLAIR', 'Diffusion', 'Gadolinium'],
        },
        clinicalFeatures: [
          { domain: 'psychiatric', features: ['Hallucinations visuelles/auditives', 'Paranoïa', 'Agitation extrême', 'Insomnie totale', 'Catatonie'], severity: 'severe' },
          { domain: 'cognitive', features: ['Désorientation', 'Amnésie', 'Troubles attentionnels'], severity: 'moderate' },
          { domain: 'language', features: ['Écholalie', 'Persévération', 'Mutisme progressif'], severity: 'moderate' },
        ],
        therapeuticGuidance: {
          firstLine: ['Méthylprednisolone IV 30mg/kg/j × 5j', 'Immunoglobulines IV 2g/kg sur 5j'],
          secondLine: ['Rituximab 375 mg/m² × 4 (si non répondeur à 2 semaines)', 'Cyclophosphamide si rituximab indisponible'],
          thirdLine: ['Tocilizumab', 'Bortézomib (cas ultra-réfractaires)'],
          monitoring: ['Anticorps anti-NMDAR titrage dans le LCR', 'EEG pour extreme delta brush', 'Recherche tératome (écho + IRM pelvienne)'],
        },
        redFlags: [
          'Hypoventilation centrale → intubation en urgence',
          'Dysautonomie sévère (bradycardie, asystolie)',
          'Status epilepticus',
          'Catatonie maligne (rigidité + fièvre)',
        ],
        traps: [
          'IRM normale dans 50-70% des cas — ne pas exclure anti-NMDAR',
          'Présentation initiale purement psychiatrique → diagnostic retardé de semaines',
          'EEG initial peut être normal — extreme delta brush apparaît plus tard',
          'Chez l\'enfant, symptômes psychiatriques atypiques (tantrums, régression)',
        ],
      },
      intermediate: {
        phase: 'intermediate',
        dayRange: [4, 14],
        label: 'Phase neurologique',
        description: 'Apparition des mouvements anormaux, de la dysautonomie et de la diminution de conscience. Phase la plus dangereuse avec risque de défaillance autonome.',
        expectedEEG: {
          background: ['moderately_slow', 'severely_slow'],
          typicalPatterns: ['extreme_delta_brush', 'GRDA', 'epileptiform_generalized'],
          signaturePattern: 'extreme_delta_brush',
          alertPatterns: ['status_electrographicus', 'suppressed'],
          monitoringFrequency: 'Continu 24h/24',
        },
        expectedMRI: {
          typicalFindings: ['normal', 'cortical_diffusion'],
          differentialFindings: ['limbic_temporal', 'meningeal_enhancement'],
          recommendedTiming: 'IRM de contrôle si aggravation',
          sequences: ['T2 FLAIR', 'Diffusion', 'Gadolinium'],
        },
        clinicalFeatures: [
          { domain: 'movement', features: ['Dyskinésies oro-faciales', 'Mouvements choréiformes', 'Dystonie', 'Opisthotonos'], severity: 'severe' },
          { domain: 'dysautonomia', features: ['Alternance tachycardie/bradycardie', 'Hyperthermie', 'Hypersialorrhée', 'Instabilité tensionnelle', 'Hypoventilation centrale'], severity: 'severe' },
          { domain: 'vigilance', features: ['Diminution progressive de la conscience', 'État catatonique', 'Mutisme akinétique'], severity: 'severe' },
        ],
        therapeuticGuidance: {
          firstLine: ['Poursuivre immunothérapie de 1ère ligne si <2 semaines', 'Passage au rituximab si non répondeur'],
          secondLine: ['Rituximab 375 mg/m² hebdomadaire × 4', 'Recherche et exérèse tératome si trouvé'],
          thirdLine: ['Cyclophosphamide', 'Tocilizumab', 'Plasmaphérèse'],
          monitoring: ['EEG continu', 'Monitoring cardiaque continu (dysautonomie)', 'Titrage anticorps LCR', 'Score mRS/CASE hebdomadaire'],
        },
        redFlags: [
          'Extreme delta brush persistant (associé à pire pronostic)',
          'Hypoventilation nécessitant intubation',
          'Asystolie ou bradycardie extrême',
          'Mouvement anormaux incessants (risque rhabdomyolyse)',
        ],
        traps: [
          'Mouvements anormaux confondus avec crises épileptiques → traiter cause, pas symptôme',
          'Anticorps sériques moins sensibles que LCR — toujours tester LCR',
          'Catatonie confondue avec coma — test aux benzodiazépines',
          'Tératome ovarien microscopique — IRM pelvienne + écho insuffisantes → envisager TEP/scanner',
        ],
      },
      chronic: {
        phase: 'chronic',
        dayRange: [15, 365],
        label: 'Phase de récupération',
        description: 'Récupération lente sur semaines à mois. Déficits frontaux exécutifs résiduels. Risque de rechute 12-25%.',
        expectedEEG: {
          background: ['normal', 'mildly_slow'],
          typicalPatterns: ['slowing_diffuse'],
          signaturePattern: null,
          alertPatterns: ['extreme_delta_brush', 'epileptiform_generalized'],
          monitoringFrequency: 'EEG de contrôle mensuel × 3, puis trimestriel',
        },
        expectedMRI: {
          typicalFindings: ['normal', 'atrophy_cortical'],
          differentialFindings: [],
          recommendedTiming: 'M3, M6, M12',
          sequences: ['T2 FLAIR', 'Volumétrie'],
        },
        clinicalFeatures: [
          { domain: 'cognitive', features: ['Troubles exécutifs frontaux', 'Déficit mémoire de travail', 'Lenteur traitement'], severity: 'moderate' },
          { domain: 'psychiatric', features: ['Impulsivité', 'Désinhibition', 'Anxiété', 'Dépression'], severity: 'moderate' },
          { domain: 'language', features: ['Récupération progressive du langage'], severity: 'mild' },
        ],
        therapeuticGuidance: {
          firstLine: ['Maintien immunothérapie (rituximab q6 mois × 2 ans)', 'Rééducation cognitive intensive'],
          secondLine: ['Mycophenolate mofetil ou azathioprine si rechute'],
          thirdLine: [],
          monitoring: ['Titrage anticorps LCR q6 mois', 'Bilan neuropsychologique M3, M6, M12', 'Surveillance rechute (12-25% à 2 ans)', 'Dépistage tératome annuel chez les filles'],
        },
        redFlags: [
          'Réapparition de symptômes psychiatriques (rechute)',
          'Remontée du titre anticorps LCR',
          'Nouveau tératome',
        ],
        traps: [
          'Symptômes psychiatriques de rechute confondus avec séquelles → retitrer anticorps',
          'Arrêt trop précoce du rituximab = rechute fréquente',
        ],
      },
    },

    eegSignatures: [
      { pattern: 'extreme_delta_brush', specificity: 0.9, sensitivity: 0.3, description: 'Pattern quasi pathognomonique — activité delta rythmique avec chevauchement bêta. Associé à formes plus sévères/prolongées (Schmitt 2012, Nathoo 2021). EEG anormal dans 63.6% des cas pédiatriques (Wu 2023)' },
      { pattern: 'GRDA', specificity: 0.2, sensitivity: 0.6, description: 'Generalized Rhythmic Delta Activity — fréquent mais non spécifique' },
    ],
    mriSignatures: [
      { pattern: 'normal', specificity: 0.0, sensitivity: 0.0, description: 'IRM normale dans 63.6% en pédiatrie (Wu 2023, n=11), ~60% initial chez enfants (Hou 2024)', timing: 'Toute phase' },
      { pattern: 'cortical_diffusion', specificity: 0.15, sensitivity: 0.25, description: 'Hypersignal cortical transitoire en FLAIR — ~40% IRM initiale anormale chez enfants (Hou 2024)', timing: 'Phase aiguë' },
    ],
    csfProfile: {
      typical: 'Pléiocytose lymphocytaire, bandes oligoclonales fréquentes',
      antibodies: ['Anti-NMDAR IgG (GluN1) — TEST OBLIGATOIRE DANS LE LCR, sérum moins sensible'],
      cells: '10-200 cellules/mm³ (lymphocytes)',
      protein: 'Normale à légèrement élevée',
      specificMarkers: ['Anticorps anti-GluN1 IgG', 'Bandes oligoclonales (fréquentes)', 'CXCL13 ↑ (activation B cells)', 'Anti-DPPX / Anti-IgLON5 (AE atypiques — troubles sommeil profonds, rares enfant, hors panels standards)'],
    },
    biomarkerProfile: [
      { marker: 'Titre anticorps LCR', expected: 'Positif, titrage corrèle avec sévérité', prognosticValue: 'Titre élevé = plus long délai de récupération' },
      { marker: 'NfL (sérum)', expected: 'Modérément élevé', prognosticValue: 'NfL <100 = bon pronostic' },
    ],
    differentialDiagnosis: [
      { condition: 'FIRES', distinguishingFeatures: ['Status epilepticus prédominant', 'Fièvre prodromique', 'Pas de mouvements anormaux caractéristiques'] },
      { condition: 'Psychose inaugurale', distinguishingFeatures: ['Pas de mouvements anormaux', 'Pas de dysautonomie', 'EEG normal', 'Pas d\'anticorps'] },
      { condition: 'Encéphalite virale', distinguishingFeatures: ['PCR positive', 'IRM nécrose temporale (HSV)', 'Fièvre plus marquée'] },
    ],
    globalRedFlags: [
      'Hypoventilation centrale',
      'Dysautonomie cardiaque (asystolie)',
      'Catatonie maligne',
      'Status epilepticus réfractaire',
    ],
    globalTraps: [
      'Hospitalisation initiale en psychiatrie retarde le diagnostic de semaines',
      'IRM normale chez 50-70% → ne pas exclure la maladie',
      'Anticorps sériques peuvent être négatifs si LCR positif → TOUJOURS tester le LCR',
      'Chez l\'enfant, présentation atypique (irritabilité, tantrums)',
    ],
    references: [
      { id: 'NMDAR-1', authors: 'Dalmau J et al.', title: 'Anti-NMDA receptor encephalitis: case series and analysis', journal: 'Lancet Neurol', year: 2008, keyFinding: 'Description princeps de 100 cas' },
      { id: 'NMDAR-2', authors: 'Titulaer MJ et al.', title: 'Treatment and prognostic factors for anti-NMDAR encephalitis', journal: 'Lancet Neurol', year: 2013, keyFinding: '577 patients, 81% bon outcome si traitement précoce, rechute 12%' },
      { id: 'NMDAR-3', authors: 'Schmitt SE et al.', title: 'Extreme delta brush in anti-NMDAR encephalitis', journal: 'Neurology', year: 2012, keyFinding: 'EDB dans 30% des cas, spécificité >90%' },
      { id: 'NMDAR-4', authors: 'Wu PY et al.', title: 'Long-term outcome of pediatric anti-NMDAR encephalitis', journal: 'J Neuroimmunol', year: 2023, keyFinding: '63.6% IRM normale, 63.6% EEG anormal, n=11 pédiatrique' },
      { id: 'NMDAR-5', authors: 'Hou C et al.', title: 'Brain MRI predictors in children with anti-NMDAR encephalitis', journal: 'ScienceDirect', year: 2024, keyFinding: '~40% IRM initiale anormale chez enfants — impact pronostique discuté' },
      { id: 'NMDAR-6', authors: 'Nathoo N et al.', title: 'Extreme Delta Brush review', journal: 'Front Neurol', year: 2021, keyFinding: 'EDB associé à sévérité et durée prolongée' },
      { id: 'NMDAR-7', authors: 'Pan J et al.', title: 'EEG evolution in autoimmune encephalitis', journal: 'Epilepsia', year: 2025, keyFinding: 'Évolution temporelle des anomalies EEG selon phases — dépend du timing' },
      { id: 'NMDAR-8', authors: 'Cellucci T et al.', title: 'Clinical approach to diagnosis of AE in pediatric patient', journal: 'Neurol Neuroimmunol Neuroinflamm', year: 2020, doi: '10.1212/NXI.0000000000000663', keyFinding: 'Algorithme pédiatrique AE : EEG souvent anormal, intégré aux critères' },
    ],
  },

  // ─────────────────────────────────────────────────────
  // MOGAD
  // ─────────────────────────────────────────────────────
  MOGAD: {
    key: 'MOGAD',
    fullName: 'MOG Antibody Disease',
    aka: ['MOGAD', 'Anti-MOG', 'ADEM MOG+'],
    description: 'Spectre d\'atteintes démyélinisantes du SNC associées aux anticorps anti-MOG. Inclut ADEM, névrite optique, myélite transverse, et encéphalopathie corticale.',
    epidemiology: 'Incidence 1.6-3.4/million/an. Prédominance pédiatrique (pic 5-8 ans). Sex-ratio 1:1 chez l\'enfant. Meilleur pronostic que FIRES et anti-NMDAR. Rechute 30-50% sur 5 ans.',
    pathophysiology: 'Anticorps IgG anti-MOG ciblent la glycoprotéine MOG à la surface des oligodendrocytes → démyélinisation primaire sans atteinte axonale initiale. Mécanisme complément-dépendant et cellulaire.',

    diagnosticCriteria: [
      { criterion: 'Anticorps anti-MOG IgG positifs (CBA, titre ≥1:100)', weight: 'major' },
      { criterion: 'Événement démyélinisant clinique (ADEM, NO, MT, encéphalite)', weight: 'major' },
      { criterion: 'IRM avec lésions démyélinisantes larges et fluffies', weight: 'minor' },
      { criterion: 'Bonne récupération après immunothérapie', weight: 'supportive' },
    ],

    phases: {
      acute: {
        phase: 'acute',
        dayRange: [0, 3],
        label: 'Phase aiguë',
        description: 'Présentation brutale : encéphalopathie, crises, déficits focaux, névrite optique. ADEM si enfant <12 ans.',
        expectedEEG: {
          background: ['mildly_slow', 'moderately_slow'],
          typicalPatterns: ['slowing_diffuse', 'slowing_focal'],
          signaturePattern: null,
          alertPatterns: ['status_electrographicus'],
          monitoringFrequency: 'EEG à l\'admission si crises ou encéphalopathie',
        },
        expectedMRI: {
          typicalFindings: ['demyelination_large'],
          differentialFindings: ['limbic_temporal', 'cortical_diffusion'],
          recommendedTiming: 'Urgente dans les 24h',
          sequences: ['T2 FLAIR', 'Diffusion', 'Gadolinium', 'Médullaire si signes de myélite', 'Orbites si atteinte visuelle'],
        },
        clinicalFeatures: [
          { domain: 'vigilance', features: ['Somnolence à coma', 'Confusion'], severity: 'moderate' },
          { domain: 'cognitive', features: ['Désorientation', 'Régression'], severity: 'moderate' },
          { domain: 'movement', features: ['Déficits moteurs focaux', 'Ataxie cérébelleuse'], severity: 'moderate' },
        ],
        therapeuticGuidance: {
          firstLine: ['Méthylprednisolone IV 30 mg/kg/j × 5j', 'IVIg 2g/kg sur 5j'],
          secondLine: ['Plasmaphérèse si non répondeur à 5-7j'],
          thirdLine: ['Rituximab si sévère'],
          monitoring: ['IRM de contrôle M1', 'Titrage anti-MOG à M3', 'Acuité visuelle si NO', 'PEV si atteinte optique'],
        },
        redFlags: [
          'Atteinte médullaire longitudinale extensive (>3 segments)',
          'Névrite optique bilatérale sévère',
          'Crises réfractaires (considérer overlap MOGAD/FIRES)',
        ],
        traps: [
          'MOGAD peut mimer FIRES → 12% des FIRES présumés sont MOGAD (Bilodeau 2024)',
          'Titre anti-MOG faible (1:10-1:20) = non spécifique → confirmer CBA ≥1:100',
          'Anti-MOG transitoirement positif après infection → retester à M6',
        ],
      },
      intermediate: {
        phase: 'intermediate',
        dayRange: [4, 14],
        label: 'Phase de récupération initiale',
        description: 'Réponse thérapeutique attendue sous corticoïdes. Si pas de réponse → remettre en question le diagnostic.',
        expectedEEG: {
          background: ['mildly_slow', 'normal'],
          typicalPatterns: ['slowing_diffuse'],
          signaturePattern: null,
          alertPatterns: ['epileptiform_focal'],
          monitoringFrequency: 'EEG de contrôle si crises',
        },
        expectedMRI: {
          typicalFindings: ['demyelination_large'],
          differentialFindings: [],
          recommendedTiming: 'IRM de contrôle M1',
          sequences: ['T2 FLAIR', 'Diffusion'],
        },
        clinicalFeatures: [
          { domain: 'vigilance', features: ['Amélioration progressive'], severity: 'mild' },
          { domain: 'cognitive', features: ['Récupération cognitive attendue'], severity: 'mild' },
        ],
        therapeuticGuidance: {
          firstLine: ['Relais corticoïdes oraux en décroissance lente (6-12 semaines)'],
          secondLine: ['Maintien IVIg mensuel si forme sévère'],
          thirdLine: [],
          monitoring: ['Examen clinique quotidien', 'IRM M1', 'Titrage anti-MOG M3'],
        },
        redFlags: [
          'Pas d\'amélioration sous corticoïdes à J7',
          'Aggravation neurologique sous traitement',
        ],
        traps: [
          'Arrêt trop rapide des corticoïdes = rechute précoce',
          'Confondre MOGAD monophasique et SEP pédiatrique',
        ],
      },
      chronic: {
        phase: 'chronic',
        dayRange: [15, 365],
        label: 'Phase chronique',
        description: 'Surveillance de rechute (30-50%). Décision de traitement de fond.',
        expectedEEG: {
          background: ['normal'],
          typicalPatterns: [],
          signaturePattern: null,
          alertPatterns: [],
          monitoringFrequency: 'Selon symptômes',
        },
        expectedMRI: {
          typicalFindings: ['normal'],
          differentialFindings: ['atrophy_cortical'],
          recommendedTiming: 'M3, M6, M12',
          sequences: ['T2 FLAIR', 'Volumétrie'],
        },
        clinicalFeatures: [
          { domain: 'cognitive', features: ['Généralement bonne récupération', 'Troubles attentionnels légers possibles'], severity: 'mild' },
        ],
        therapeuticGuidance: {
          firstLine: ['Surveillance clinique et biologique'],
          secondLine: ['Mycophenolate mofetil ou azathioprine si rechute', 'IVIg mensuelles si rechutes fréquentes'],
          thirdLine: ['Rituximab'],
          monitoring: ['Titrage anti-MOG q3-6 mois', 'IRM annuelle', 'Bilan visuel si NO antérieure'],
        },
        redFlags: ['Rechute clinique', 'Remontée du titre anti-MOG', 'Nouvelle lésion IRM'],
        traps: ['Anti-MOG peut se négativer → ne pas arrêter la surveillance', 'Rechute MOGAD ≠ SEP — ne pas démarrer traitement SEP'],
      },
    },

    eegSignatures: [],
    mriSignatures: [
      { pattern: 'demyelination_large', specificity: 0.7, sensitivity: 0.8, description: 'Larges lésions T2/FLAIR bilatérales, « fluffy », mal limitées', timing: 'Phase aiguë' },
      { pattern: 'optic_neuritis', specificity: 0.5, sensitivity: 0.6, description: 'Névrite optique bilatérale avec œdème papillaire', timing: 'Phase aiguë' },
    ],
    csfProfile: {
      typical: 'Pléiocytose modérée, bandes oligoclonales rares (≠ SEP)',
      antibodies: ['Anti-MOG IgG (Cell-Based Assay obligatoire, pas ELISA)'],
      cells: '10-100 cellules/mm³',
      protein: 'Modérément élevée',
      specificMarkers: ['Anti-MOG IgG', 'Bandes oligoclonales RARES (≠ SEP)', 'GFAP élevé dans le LCR'],
    },
    biomarkerProfile: [
      { marker: 'Anti-MOG titre', expected: '≥1:100 (CBA)', prognosticValue: 'Titre élevé = risque rechute, titre décroissant = bon pronostic' },
      { marker: 'GFAP (LCR)', expected: 'Élevé en phase aiguë', prognosticValue: 'Corrèle avec atteinte astrocytaire' },
      { marker: 'NfL (sérum)', expected: 'Modéré', prognosticValue: 'Généralement plus bas que FIRES → meilleur pronostic axonal' },
    ],
    differentialDiagnosis: [
      { condition: 'SEP pédiatrique', distinguishingFeatures: ['Bandes oligoclonales positives', 'Lésions petites, ovoides, périventriculaires', 'Anti-MOG négatif'] },
      { condition: 'FIRES', distinguishingFeatures: ['Status epilepticus réfractaire', 'Pas de démyélinisation', 'Anti-MOG négatif'] },
      { condition: 'NMO-SD', distinguishingFeatures: ['Anti-AQP4 positif', 'Myélite longitudinale extensive', 'Area postrema syndrome'] },
    ],
    globalRedFlags: ['MOGAD mimant FIRES', 'Atteinte médullaire extensive', 'Névrite optique bilatérale sévère'],
    globalTraps: [
      'MOGAD peut mimer FIRES (Bilodeau 2024) — toujours tester anti-MOG dans les status réfractaires',
      'Anti-MOG par ELISA = faux positifs fréquents → CBA obligatoire',
      'Anti-MOG transitoirement positif post-infectieux → retester M6',
    ],
    references: [
      { id: 'MOGAD-1', authors: 'Banwell B et al.', title: 'Diagnosis of myelin oligodendrocyte glycoprotein antibody-associated disease', journal: 'Lancet Neurol', year: 2023, keyFinding: 'Critères diagnostiques internationaux MOGAD' },
      { id: 'MOGAD-2', authors: 'Bilodeau JA et al.', title: 'MOGAD mimicking FIRES in pediatric patients', journal: 'Neurology', year: 2024, keyFinding: '12% des FIRES présumés = MOGAD' },
    ],
  },

  // Simplified NORSE and PIMS for now
  NORSE: {
    key: 'NORSE',
    fullName: 'New Onset Refractory Status Epilepticus',
    aka: ['NORSE', 'Cryptogenic NORSE'],
    description: 'Status epilepticus réfractaire de novo chez un patient sans antécédent d\'épilepsie et sans cause identifiée. FIRES est la forme pédiatrique fébrile de NORSE.',
    epidemiology: 'Adulte principalement (médiane 29 ans). Mortalité 16-27%.',
    pathophysiology: 'Spectre commun avec FIRES. Probable mécanisme auto-immun non identifié. Tempête cytokinique intrathécale.',
    diagnosticCriteria: [
      { criterion: 'Status epilepticus réfractaire de novo', weight: 'major' },
      { criterion: 'Absence de cause identifiée (infectieuse, auto-immune connue, toxique, structurelle)', weight: 'major' },
      { criterion: 'Pas d\'antécédent d\'épilepsie', weight: 'major' },
    ],
    phases: {
      acute: { phase: 'acute', dayRange: [0, 3], label: 'Phase aiguë', description: 'Identique à FIRES', expectedEEG: { background: ['moderately_slow', 'severely_slow'], typicalPatterns: ['status_electrographicus'], signaturePattern: 'status_electrographicus', alertPatterns: ['burst_suppression', 'suppressed'], monitoringFrequency: 'Continu 24h/24' }, expectedMRI: { typicalFindings: ['normal', 'limbic_temporal'], differentialFindings: ['cortical_diffusion'], recommendedTiming: '24-48h', sequences: ['T2 FLAIR', 'Diffusion', 'Gadolinium'] }, clinicalFeatures: [{ domain: 'vigilance', features: ['Coma'], severity: 'severe' }], therapeuticGuidance: { firstLine: ['Protocole FIRES/NORSE identique'], secondLine: ['Immunothérapie agressive'], thirdLine: ['Régime cétogène'], monitoring: ['EEG continu', 'NfL'] }, redFlags: ['Status >24h malgré 3 antiépileptiques'], traps: ['Rechercher anticorps anti-neuronaux exhaustivement'] },
      intermediate: { phase: 'intermediate', dayRange: [4, 14], label: 'Phase intermédiaire', description: 'Identique à FIRES', expectedEEG: { background: ['severely_slow', 'burst_suppression'], typicalPatterns: ['PLED', 'NCSE'], signaturePattern: null, alertPatterns: ['suppressed'], monitoringFrequency: 'Continu' }, expectedMRI: { typicalFindings: ['limbic_temporal'], differentialFindings: [], recommendedTiming: 'J7', sequences: ['T2 FLAIR', 'Diffusion'] }, clinicalFeatures: [{ domain: 'vigilance', features: ['Coma sous sédation'], severity: 'severe' }], therapeuticGuidance: { firstLine: ['Maintien sédation'], secondLine: ['Anakinra', 'Rituximab'], thirdLine: ['Hypothermie'], monitoring: ['EEG continu', 'IRM J7'] }, redFlags: ['NfL en hausse'], traps: ['EEG sous sédation ≠ EEG pathologique'] },
      chronic: { phase: 'chronic', dayRange: [15, 365], label: 'Phase chronique', description: 'Épilepsie pharmacorésistante', expectedEEG: { background: ['mildly_slow'], typicalPatterns: ['epileptiform_focal'], signaturePattern: null, alertPatterns: ['status_electrographicus'], monitoringFrequency: 'Mensuel' }, expectedMRI: { typicalFindings: ['atrophy_mesial_temporal'], differentialFindings: [], recommendedTiming: 'M3, M6, M12', sequences: ['T2 FLAIR', 'Volumétrie'] }, clinicalFeatures: [{ domain: 'cognitive', features: ['Déficits mnésiques sévères'], severity: 'severe' }], therapeuticGuidance: { firstLine: ['Antiépileptiques optimisés'], secondLine: ['Chirurgie épilepsie'], thirdLine: ['VNS'], monitoring: ['EEG mensuel', 'Bilan neuropsychologique'] }, redFlags: ['Recrudescence crises'], traps: ['Effets secondaires médicamenteux ≠ séquelles'] },
    },
    eegSignatures: [{ pattern: 'status_electrographicus', specificity: 0.3, sensitivity: 0.95, description: 'Status électrographique continu' }],
    mriSignatures: [{ pattern: 'limbic_temporal', specificity: 0.4, sensitivity: 0.5, description: 'Hypersignal temporal mésial', timing: 'J3-J7' }],
    csfProfile: { typical: 'Similaire à FIRES', antibodies: ['Bilan auto-immun exhaustif négatif par définition'], cells: '0-100 cellules/mm³', protein: 'Normale à élevée', specificMarkers: ['IL-6 ↑', 'HMGB1 ↑'] },
    biomarkerProfile: [{ marker: 'NfL', expected: 'Élevé', prognosticValue: 'Corrèle avec pronostic' }],
    differentialDiagnosis: [{ condition: 'FIRES', distinguishingFeatures: ['Infection fébrile prodromique', 'Pédiatrique'] }],
    globalRedFlags: ['Identiques à FIRES'],
    globalTraps: ['NORSE = diagnostic d\'exclusion — bilan exhaustif obligatoire'],
    references: [{ id: 'NORSE-1', authors: 'Gaspard N et al.', title: 'NORSE and FIRES: Definitions and implications', journal: 'Neurology', year: 2018, keyFinding: 'Consensus NORSE/FIRES comme spectre commun' }],
  },

  PIMS: {
    key: 'PIMS',
    fullName: 'Pediatric Inflammatory Multisystem Syndrome',
    aka: ['PIMS', 'MIS-C', 'PIMS-TS'],
    description: 'Syndrome hyperinflammatoire post-COVID touchant les enfants. Atteinte neurologique dans 20-40% des cas (encéphalopathie, crises, AVC, neuropathie).',
    epidemiology: 'Post-COVID, pic 6-11 ans. Incidence en diminution depuis 2022. Atteinte neuro 20-40%. Mortalité 1-2%.',
    pathophysiology: 'Orage cytokinique post-infectieux. Vasculite systémique. Atteinte neurologique par vasculite cérébrale et neuro-inflammation.',
    diagnosticCriteria: [
      { criterion: 'Fièvre ≥38°C ≥24h', weight: 'major' },
      { criterion: 'Preuve d\'infection SARS-CoV-2 (PCR, sérologie, contact)', weight: 'major' },
      { criterion: 'Atteinte multi-organe (≥2 systèmes)', weight: 'major' },
      { criterion: 'Marqueurs inflammatoires élevés (CRP, ferritine, D-dimères)', weight: 'minor' },
    ],
    phases: {
      acute: { phase: 'acute', dayRange: [0, 3], label: 'Phase aiguë', description: 'Syndrome inflammatoire systémique avec possible atteinte neurologique', expectedEEG: { background: ['mildly_slow', 'moderately_slow'], typicalPatterns: ['slowing_diffuse'], signaturePattern: null, alertPatterns: ['epileptiform_generalized'], monitoringFrequency: 'Si encéphalopathie ou crises' }, expectedMRI: { typicalFindings: ['normal', 'vasculitis_pattern'], differentialFindings: ['basal_ganglia', 'spinal'], recommendedTiming: 'Si signes neurologiques focaux', sequences: ['T2 FLAIR', 'Diffusion', 'ARM cérébrale', 'Gadolinium'] }, clinicalFeatures: [{ domain: 'vigilance', features: ['Confusion', 'Somnolence'], severity: 'moderate' }, { domain: 'cognitive', features: ['Irritabilité', 'Céphalées sévères'], severity: 'moderate' }], therapeuticGuidance: { firstLine: ['IVIg 2g/kg', 'Méthylprednisolone IV', 'Aspirine'], secondLine: ['Anakinra si résistant', 'Infliximab'], thirdLine: ['Anticoagulation si vasculite'], monitoring: ['Troponine', 'D-dimères', 'Échographie cardiaque', 'EEG si encéphalopathie'] }, redFlags: ['Atteinte cardiaque (troponine >1)', 'AVC', 'Status epilepticus'], traps: ['Syndrome de Kawasaki-like mais distinct', 'Atteinte neurologique sous-estimée'] },
      intermediate: { phase: 'intermediate', dayRange: [4, 14], label: 'Phase de récupération', description: 'Amélioration attendue sous traitement', expectedEEG: { background: ['normal', 'mildly_slow'], typicalPatterns: [], signaturePattern: null, alertPatterns: [], monitoringFrequency: 'Si crises résiduelles' }, expectedMRI: { typicalFindings: ['normal'], differentialFindings: [], recommendedTiming: 'Si déficits focaux persistants', sequences: ['T2 FLAIR'] }, clinicalFeatures: [{ domain: 'vigilance', features: ['Amélioration progressive'], severity: 'mild' }], therapeuticGuidance: { firstLine: ['Décroissance corticoïdes'], secondLine: [], thirdLine: [], monitoring: ['Fonction cardiaque', 'Bilan inflammatoire'] }, redFlags: ['Pas d\'amélioration à J7'], traps: ['Rebond inflammatoire à l\'arrêt des corticoïdes'] },
      chronic: { phase: 'chronic', dayRange: [15, 365], label: 'Suivi', description: 'Surveillance cardiaque et neurocognitive', expectedEEG: { background: ['normal'], typicalPatterns: [], signaturePattern: null, alertPatterns: [], monitoringFrequency: 'Selon symptômes' }, expectedMRI: { typicalFindings: ['normal'], differentialFindings: [], recommendedTiming: 'M3 si atteinte initiale', sequences: ['T2 FLAIR'] }, clinicalFeatures: [{ domain: 'cognitive', features: ['Fatigue cognitive', 'Troubles attentionnels légers'], severity: 'mild' }], therapeuticGuidance: { firstLine: ['Suivi cardiologique 6 mois'], secondLine: [], thirdLine: [], monitoring: ['Échographie cardiaque M1, M3, M6', 'Bilan neuropsychologique si symptômes'] }, redFlags: ['Anévrisme coronaire tardif'], traps: ['Séquelles cognitives subtiles sous-diagnostiquées'] },
    },
    eegSignatures: [],
    mriSignatures: [{ pattern: 'vasculitis_pattern', specificity: 0.6, sensitivity: 0.2, description: 'Pattern de vasculite cérébrale', timing: 'Phase aiguë' }],
    csfProfile: { typical: 'Souvent normal ou pléiocytose modérée', antibodies: [], cells: '0-50 cellules/mm³', protein: 'Normale à légèrement élevée', specificMarkers: ['IL-6 ↑↑ (systémique)'] },
    biomarkerProfile: [{ marker: 'Ferritine', expected: '>500 µg/L', prognosticValue: '>1000 = sévérité' }, { marker: 'D-dimères', expected: 'Très élevés', prognosticValue: 'Risque thrombotique' }],
    differentialDiagnosis: [{ condition: 'Kawasaki', distinguishingFeatures: ['Pas de lien COVID', 'Âge <5 ans', 'Pas d\'atteinte multiviscérale'] }],
    globalRedFlags: ['Atteinte cardiaque', 'AVC', 'Choc'],
    globalTraps: ['Sérologie COVID peut être négative si infection ancienne'],
    references: [{ id: 'PIMS-1', authors: 'Feldstein LR et al.', title: 'MIS-C in US', journal: 'NEJM', year: 2020, keyFinding: '186 cas, atteinte cardiaque 80%, neuro 30%' }],
  },
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function getSyndromePhase(syndrome: SyndromeKey, hospDay: number): PhaseKey {
  if (hospDay <= 3) return 'acute'
  if (hospDay <= 14) return 'intermediate'
  return 'chronic'
}

export function getPhaseProfile(syndrome: SyndromeKey, hospDay: number): PhaseProfile {
  const phase = getSyndromePhase(syndrome, hospDay)
  return NEUROCORE_KB[syndrome].phases[phase]
}

export function checkEEGRedFlags(syndrome: SyndromeKey, hospDay: number, eeg: EEGData): string[] {
  const phase = getPhaseProfile(syndrome, hospDay)
  const flags: string[] = []

  // Check if current EEG shows alert patterns
  const allPatterns = [...eeg.ictalPatterns, ...eeg.interictalPatterns]
  if (eeg.signaturePattern) allPatterns.push(eeg.signaturePattern)

  for (const pattern of allPatterns) {
    if (phase.expectedEEG.alertPatterns.includes(pattern)) {
      flags.push(`Pattern EEG alarmant détecté : ${pattern}`)
    }
  }

  // Check seizure frequency
  if (eeg.seizuresPerHour > 6) flags.push('Fréquence critique : >6 crises/heure')
  if (eeg.NCSEstatus) flags.push('Status non-convulsif (NCSE) détecté')
  if (!eeg.reactivity && eeg.background !== 'burst_suppression') flags.push('Perte de réactivité EEG — signe de gravité')
  if (eeg.trend === 'worsening') flags.push('Tendance EEG en aggravation')
  if (eeg.lastUpdateHours > 6 && eeg.continuousMonitoring) flags.push('EEG continu : dernier tracé >6h — mise à jour nécessaire')

  return flags
}

export function checkMRIRedFlags(syndrome: SyndromeKey, hospDay: number, mri: MRIData): string[] {
  const phase = getPhaseProfile(syndrome, hospDay)
  const flags: string[] = []

  if (mri.herniation) flags.push('URGENCE : Engagement cérébral détecté')
  if (mri.midlineShift) flags.push('Déviation de la ligne médiane — risque d\'engagement')
  if (mri.edemaType === 'cytotoxic') flags.push('Œdème cytotoxique — dommage cellulaire irréversible')

  // Check for differential findings (wrong diagnosis?)
  for (const finding of mri.findings) {
    if (phase.expectedMRI.differentialFindings.includes(finding)) {
      flags.push(`IRM : pattern ${finding} — envisager diagnostic alternatif`)
    }
  }

  if (mri.followUpComparison === 'progressing') flags.push('Lésions IRM en progression — escalade thérapeutique à discuter')

  return flags
}

export function checkBiomarkerRedFlags(markers: NeuroBiomarkers): string[] {
  const flags: string[] = []

  if (markers.nfl !== null && markers.nfl > 500) flags.push(`NfL très élevé (${markers.nfl} pg/mL) — dommage axonal sévère, pronostic péjoratif`)
  else if (markers.nfl !== null && markers.nfl > 100) flags.push(`NfL élevé (${markers.nfl} pg/mL) — dommage axonal actif`)

  if (markers.nse !== null && markers.nse > 50) flags.push(`NSE très élevé (${markers.nse} µg/L) — dommage neuronal étendu`)
  if (markers.s100b !== null && markers.s100b > 0.3) flags.push(`S100B élevé (${markers.s100b} µg/L) — œdème cérébral`)
  if (markers.il6Csf !== null && markers.il6Csf > 100) flags.push(`IL-6 LCR très élevé (${markers.il6Csf} pg/mL) — cible thérapeutique tocilizumab`)

  return flags
}

export function getTherapeuticGuidance(syndrome: SyndromeKey, hospDay: number): PhaseProfile['therapeuticGuidance'] {
  return getPhaseProfile(syndrome, hospDay).therapeuticGuidance
}

export function getExpectedEEG(syndrome: SyndromeKey, hospDay: number): PhaseProfile['expectedEEG'] {
  return getPhaseProfile(syndrome, hospDay).expectedEEG
}

export function getExpectedMRI(syndrome: SyndromeKey, hospDay: number): PhaseProfile['expectedMRI'] {
  return getPhaseProfile(syndrome, hospDay).expectedMRI
}

export function getRedFlagsAndTraps(syndrome: SyndromeKey, hospDay: number): { redFlags: string[]; traps: string[] } {
  const phase = getPhaseProfile(syndrome, hospDay)
  const global = NEUROCORE_KB[syndrome]
  return {
    redFlags: [...phase.redFlags, ...global.globalRedFlags],
    traps: [...phase.traps, ...global.globalTraps],
  }
}
