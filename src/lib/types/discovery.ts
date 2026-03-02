// ============================================================
// PULSAR V18 — Discovery Engine Types
// Phase A : SignalCard, CorrelationResult, PatternMiner output
// ============================================================

// ── Signal Card (output principal du Pattern Mining) ──

export type SignalStatus = 'new' | 'confirmed' | 'monitoring' | 'archived' | 'rejected'
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong'
export type SignalType =
  | 'correlation'         // Corrélation entre 2+ paramètres
  | 'temporal_pattern'    // Pattern temporel (trajectoire)
  | 'cluster'             // Cluster de patients similaires
  | 'anomaly'             // Valeur hors distribution
  | 'treatment_response'  // Pattern de réponse thérapeutique
  | 'biomarker_predictor' // Biomarqueur prédictif

export interface SignalCard {
  id: string
  type: SignalType
  title: string
  description: string
  strength: SignalStrength
  status: SignalStatus

  // Données statistiques
  statistics: {
    pValue?: number           // p-value si applicable
    correlation?: number      // coefficient r (-1 à 1)
    effectSize?: number       // taille d'effet
    sampleSize: number        // n patients
    confidenceInterval?: [number, number]
  }

  // Paramètres impliqués
  parameters: {
    primary: string           // Paramètre principal (ex: "crp")
    secondary?: string        // Paramètre corrélé (ex: "gcs")
    all: string[]             // Tous les paramètres impliqués
  }

  // Patients concernés
  patients: {
    ids: string[]
    count: number
    syndromes: string[]       // Distribution par syndrome
  }

  // Visualisation
  chart?: {
    type: 'scatter' | 'line' | 'bar' | 'heatmap'
    data: { x: number; y: number; label?: string }[]
    xLabel: string
    yLabel: string
  }

  // Metadata
  discoveredAt: string
  updatedAt: string
  source: 'pattern_miner' | 'literature_scanner' | 'hypothesis_engine'
  evidenceLevel: 'observational' | 'correlational' | 'suggestive' | 'supported'
  tags: string[]

  // Flag IA obligatoire
  aiGenerated: true
  disclaimer: string
}

// ── Correlation Matrix ──

export interface CorrelationPair {
  paramA: string
  paramB: string
  coefficient: number       // Pearson r
  pValue: number
  sampleSize: number
  significant: boolean      // p < 0.05
}

export interface CorrelationMatrix {
  parameters: string[]
  matrix: number[][]        // Matrice symétrique
  significantPairs: CorrelationPair[]
  computedAt: string
}

// ── Patient Cluster ──

export interface PatientCluster {
  id: string
  label: string
  centroid: Record<string, number>  // Valeurs moyennes des paramètres
  patientIds: string[]
  size: number
  dominantSyndrome: string
  distinctiveFeatures: string[]     // Ce qui distingue ce cluster
}

// ── Temporal Pattern ──

export interface TemporalPattern {
  id: string
  name: string
  description: string
  sequence: {
    hourOffset: number
    parameter: string
    direction: 'rising' | 'falling' | 'spike' | 'plateau'
    magnitude: number
  }[]
  frequency: number          // Combien de patients montrent ce pattern
  associatedOutcome?: string
}

// ── Discovery Engine Run Result ──

export interface DiscoveryRunResult {
  timestamp: string
  signals: SignalCard[]
  correlationMatrix: CorrelationMatrix
  clusters: PatientCluster[]
  temporalPatterns: TemporalPattern[]
  summary: {
    totalSignals: number
    newSignals: number
    strongSignals: number
    patientsAnalyzed: number
    parametersScanned: number
  }
}

// ── Supabase Row Types ──

export interface DiscoverySignalRow {
  id: string
  type: SignalType
  title: string
  description: string
  strength: SignalStrength
  status: SignalStatus
  statistics: Record<string, unknown>
  parameters: Record<string, unknown>
  patients_data: Record<string, unknown>
  chart_data: Record<string, unknown> | null
  source: string
  evidence_level: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DiscoveryHypothesisRow {
  id: string
  title: string
  type: string
  description: string
  confidence: number
  status: 'generated' | 'in_review' | 'validated' | 'published' | 'rejected'
  signal_ids: string[]
  literature_refs: Record<string, unknown>[]
  reasoning: string
  suggested_action: string
  impact: string
  created_at: string
  updated_at: string
}

export interface DiscoveryArticleRow {
  id: string
  pmid: string | null
  doi: string | null
  title: string
  authors: string
  journal: string
  year: number
  abstract: string | null
  relevance_score: number
  matched_signals: string[]
  source: string
  fetched_at: string
}

// ── Filter & Sort ──

export interface SignalFilters {
  type?: SignalType | 'all'
  strength?: SignalStrength | 'all'
  status?: SignalStatus | 'all'
  syndrome?: string | 'all'
  search?: string
}

export type SignalSortBy = 'strength' | 'date' | 'patients' | 'correlation'

// ── Discovery Engine Config ──

export const DISCOVERY_CONFIG = {
  MIN_SAMPLE_SIZE: 3,
  CORRELATION_THRESHOLD: 0.4,
  P_VALUE_THRESHOLD: 0.05,
  STRONG_CORRELATION: 0.7,
  VERY_STRONG_CORRELATION: 0.85,
  MAX_SIGNALS_PER_RUN: 50,
  DISCLAIMER: 'Signal généré par IA — Nécessite validation clinique. Ne constitue pas un avis médical.',
} as const

// ── 34 Paramètres cliniques scannés ──

export const SCANNED_PARAMETERS = [
  // Neuro (6)
  'gcs', 'pupils', 'seizures_24h', 'seizure_duration', 'seizure_type', 'consciousness',
  // Biology (6)
  'crp', 'pct', 'ferritin', 'wbc', 'platelets', 'lactate',
  // Hemodynamics (7)
  'heart_rate', 'sbp', 'dbp', 'map', 'spo2', 'temp', 'resp_rate',
  // CSF (3)
  'csf_cells', 'csf_protein', 'csf_antibodies',
  // Treatment (4)
  'treatment_line', 'treatment_response', 'drug_count', 'days_to_response',
  // Demographics (3)
  'age_months', 'weight_kg', 'sex',
  // Engine scores (5)
  'vps_score', 'tde_score', 'pve_score', 'ewe_score', 'tpe_score',
] as const

export type ScannedParameter = typeof SCANNED_PARAMETERS[number]

// ── Parameter metadata ──

export const PARAMETER_META: Record<string, { label: string; category: string; unit?: string; color: string }> = {
  gcs: { label: 'GCS', category: 'Neuro', unit: '/15', color: '#6C7CFF' },
  pupils: { label: 'Pupilles', category: 'Neuro', color: '#6C7CFF' },
  seizures_24h: { label: 'Crises/24h', category: 'Neuro', unit: '/24h', color: '#6C7CFF' },
  seizure_duration: { label: 'Durée crise', category: 'Neuro', unit: 'min', color: '#6C7CFF' },
  seizure_type: { label: 'Type crise', category: 'Neuro', color: '#6C7CFF' },
  consciousness: { label: 'Conscience', category: 'Neuro', color: '#6C7CFF' },
  crp: { label: 'CRP', category: 'Bio', unit: 'mg/L', color: '#FF6B8A' },
  pct: { label: 'PCT', category: 'Bio', unit: 'ng/mL', color: '#FF6B8A' },
  ferritin: { label: 'Ferritine', category: 'Bio', unit: 'ng/mL', color: '#FF6B8A' },
  wbc: { label: 'Leucocytes', category: 'Bio', unit: 'G/L', color: '#FF6B8A' },
  platelets: { label: 'Plaquettes', category: 'Bio', unit: 'G/L', color: '#FF6B8A' },
  lactate: { label: 'Lactate', category: 'Bio', unit: 'mmol/L', color: '#FF6B8A' },
  heart_rate: { label: 'FC', category: 'Hémodynamique', unit: 'bpm', color: '#2FD1C8' },
  sbp: { label: 'PAS', category: 'Hémodynamique', unit: 'mmHg', color: '#2FD1C8' },
  dbp: { label: 'PAD', category: 'Hémodynamique', unit: 'mmHg', color: '#2FD1C8' },
  map: { label: 'PAM', category: 'Hémodynamique', unit: 'mmHg', color: '#2FD1C8' },
  spo2: { label: 'SpO₂', category: 'Hémodynamique', unit: '%', color: '#2FD1C8' },
  temp: { label: 'Température', category: 'Hémodynamique', unit: '°C', color: '#2FD1C8' },
  resp_rate: { label: 'FR', category: 'Hémodynamique', unit: '/min', color: '#2FD1C8' },
  csf_cells: { label: 'Cellules LCR', category: 'LCR', unit: '/mm³', color: '#B96BFF' },
  csf_protein: { label: 'Protéines LCR', category: 'LCR', unit: 'g/L', color: '#B96BFF' },
  csf_antibodies: { label: 'Anticorps LCR', category: 'LCR', color: '#B96BFF' },
  treatment_line: { label: 'Ligne thérapeutique', category: 'Traitement', color: '#FFB347' },
  treatment_response: { label: 'Réponse', category: 'Traitement', color: '#FFB347' },
  drug_count: { label: 'Nb médicaments', category: 'Traitement', color: '#FFB347' },
  days_to_response: { label: 'Délai réponse', category: 'Traitement', unit: 'j', color: '#FFB347' },
  age_months: { label: 'Âge', category: 'Démographie', unit: 'mois', color: '#8E8EA3' },
  weight_kg: { label: 'Poids', category: 'Démographie', unit: 'kg', color: '#8E8EA3' },
  sex: { label: 'Sexe', category: 'Démographie', color: '#8E8EA3' },
  vps_score: { label: 'VPS', category: 'Moteurs', unit: '/100', color: '#6C7CFF' },
  tde_score: { label: 'TDE', category: 'Moteurs', unit: '/100', color: '#2FD1C8' },
  pve_score: { label: 'PVE', category: 'Moteurs', unit: '/100', color: '#B96BFF' },
  ewe_score: { label: 'EWE', category: 'Moteurs', unit: '/100', color: '#FF6B8A' },
  tpe_score: { label: 'TPE', category: 'Moteurs', unit: '/100', color: '#FFB347' },
}
