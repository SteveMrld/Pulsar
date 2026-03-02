// ============================================================
// PULSAR V18 — Pattern Miner (Discovery Engine · Niveau 1)
// Corrélation interne · Clustering · Séries temporelles
// Lecture seule sur PatientState + données Supabase
// ============================================================

import type {
  SignalCard, SignalType, SignalStrength, CorrelationPair,
  CorrelationMatrix, PatientCluster, TemporalPattern,
  DISCOVERY_CONFIG as Config,
} from '@/lib/types/discovery'
import { DISCOVERY_CONFIG, PARAMETER_META } from '@/lib/types/discovery'

// ── Types internes ──

interface PatientDataRow {
  id: string
  display_name: string
  syndrome: string | null
  age_months: number
  sex: 'male' | 'female'
  weight_kg: number | null
  // Dernières constantes
  gcs: number | null
  seizures_24h: number
  heart_rate: number | null
  spo2: number | null
  temp: number | null
  // Dernière bio
  crp: number | null
  pct: number | null
  ferritin: number | null
  wbc: number | null
  platelets: number | null
  lactate: number | null
  csf_cells: number | null
  csf_protein: number | null
  // Scores moteurs
  vps_score: number | null
  tde_score: number | null
  pve_score: number | null
  ewe_score: number | null
  tpe_score: number | null
  // Traitement
  drug_count: number
  treatment_line: number | null
  treatment_response: string | null
  hosp_day: number
}

type NumericKey = keyof {
  [K in keyof PatientDataRow as PatientDataRow[K] extends number | null ? K : never]: unknown
}

// ── Constantes ──

const NUMERIC_PARAMS: NumericKey[] = [
  'age_months', 'gcs', 'seizures_24h', 'heart_rate', 'spo2', 'temp',
  'crp', 'pct', 'ferritin', 'wbc', 'platelets', 'lactate',
  'csf_cells', 'csf_protein',
  'vps_score', 'tde_score', 'pve_score', 'ewe_score', 'tpe_score',
  'drug_count', 'hosp_day',
]

// ── Utility: Pearson correlation ──

function pearson(xs: number[], ys: number[]): { r: number; p: number; n: number } {
  const n = Math.min(xs.length, ys.length)
  if (n < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) return { r: 0, p: 1, n }

  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    sumXY += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  const denom = Math.sqrt(sumX2 * sumY2)
  if (denom === 0) return { r: 0, p: 1, n }

  const r = sumXY / denom

  // Approximation p-value via t-distribution
  const t = r * Math.sqrt((n - 2) / (1 - r * r + 1e-10))
  const df = n - 2
  // Simplified p-value approximation (valid for df > 3)
  const p = df > 3 ? Math.exp(-0.5 * t * t / df) * 2 : 1
  return { r: Math.round(r * 1000) / 1000, p: Math.round(p * 10000) / 10000, n }
}

// ── Utility: strength from correlation ──

function strengthFromCorrelation(r: number): SignalStrength {
  const abs = Math.abs(r)
  if (abs >= DISCOVERY_CONFIG.VERY_STRONG_CORRELATION) return 'very_strong'
  if (abs >= DISCOVERY_CONFIG.STRONG_CORRELATION) return 'strong'
  if (abs >= DISCOVERY_CONFIG.CORRELATION_THRESHOLD) return 'moderate'
  return 'weak'
}

// ── Utility: generate unique signal ID ──

let signalCounter = 0
function generateSignalId(type: SignalType): string {
  signalCounter++
  const ts = Date.now().toString(36)
  return `disc-${type.substring(0, 4)}-${ts}-${signalCounter}`
}

// ══════════════════════════════════════════════════════════════
// PATTERN MINER
// ══════════════════════════════════════════════════════════════

export class PatternMiner {

  // ── 1. Compute Correlation Matrix ──

  computeCorrelationMatrix(patients: PatientDataRow[]): CorrelationMatrix {
    const params = NUMERIC_PARAMS.filter(p => {
      // Keep only params with enough non-null values
      const valid = patients.filter(pt => pt[p] != null).length
      return valid >= DISCOVERY_CONFIG.MIN_SAMPLE_SIZE
    })

    const n = params.length
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
    const significantPairs: CorrelationPair[] = []

    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1 // Self-correlation
      for (let j = i + 1; j < n; j++) {
        const paired = patients
          .filter(pt => pt[params[i]] != null && pt[params[j]] != null)
          .map(pt => ({
            x: pt[params[i]] as number,
            y: pt[params[j]] as number,
          }))

        if (paired.length < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) continue

        const { r, p, n: sampleN } = pearson(
          paired.map(d => d.x),
          paired.map(d => d.y),
        )

        matrix[i][j] = r
        matrix[j][i] = r

        const significant = p < DISCOVERY_CONFIG.P_VALUE_THRESHOLD &&
          Math.abs(r) >= DISCOVERY_CONFIG.CORRELATION_THRESHOLD

        if (significant) {
          significantPairs.push({
            paramA: params[i],
            paramB: params[j],
            coefficient: r,
            pValue: p,
            sampleSize: sampleN,
            significant: true,
          })
        }
      }
    }

    // Sort by absolute correlation strength
    significantPairs.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))

    return {
      parameters: params,
      matrix,
      significantPairs,
      computedAt: new Date().toISOString(),
    }
  }

  // ── 2. Generate Signal Cards from correlations ──

  generateCorrelationSignals(
    correlationMatrix: CorrelationMatrix,
    patients: PatientDataRow[],
  ): SignalCard[] {
    const signals: SignalCard[] = []

    for (const pair of correlationMatrix.significantPairs) {
      const metaA = PARAMETER_META[pair.paramA]
      const metaB = PARAMETER_META[pair.paramB]
      if (!metaA || !metaB) continue

      const direction = pair.coefficient > 0 ? 'positive' : 'inverse'
      const strength = strengthFromCorrelation(pair.coefficient)

      // Compute scatter data
      const scatterData = patients
        .filter(pt => (pt as any)[pair.paramA] != null && (pt as any)[pair.paramB] != null)
        .map(pt => ({
          x: (pt as any)[pair.paramA] as number,
          y: (pt as any)[pair.paramB] as number,
          label: pt.display_name,
        }))

      // Find which syndromes are involved
      const syndromes = patients
        .filter(pt => (pt as any)[pair.paramA] != null && (pt as any)[pair.paramB] != null)
        .map(pt => pt.syndrome || 'Non spécifié')
      const uniqueSyndromes = [...new Set(syndromes)]

      const signal: SignalCard = {
        id: generateSignalId('correlation'),
        type: 'correlation',
        title: `Corrélation ${direction} : ${metaA.label} ↔ ${metaB.label}`,
        description: `${direction === 'positive' ? 'Corrélation positive' : 'Corrélation inverse'} (r=${pair.coefficient}) entre ${metaA.label} et ${metaB.label} observée sur ${pair.sampleSize} patients. ${strength === 'very_strong' ? 'Signal très fort nécessitant investigation.' : strength === 'strong' ? 'Signal fort à surveiller.' : 'Signal modéré à confirmer.'}`,
        strength,
        status: 'new',
        statistics: {
          correlation: pair.coefficient,
          pValue: pair.pValue,
          sampleSize: pair.sampleSize,
          effectSize: Math.abs(pair.coefficient),
        },
        parameters: {
          primary: pair.paramA,
          secondary: pair.paramB,
          all: [pair.paramA, pair.paramB],
        },
        patients: {
          ids: patients.filter(pt => (pt as any)[pair.paramA] != null && (pt as any)[pair.paramB] != null).map(pt => pt.id),
          count: pair.sampleSize,
          syndromes: uniqueSyndromes,
        },
        chart: {
          type: 'scatter',
          data: scatterData,
          xLabel: `${metaA.label}${metaA.unit ? ` (${metaA.unit})` : ''}`,
          yLabel: `${metaB.label}${metaB.unit ? ` (${metaB.unit})` : ''}`,
        },
        discoveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'pattern_miner',
        evidenceLevel: strength === 'very_strong' ? 'suggestive' : 'correlational',
        tags: [metaA.category, metaB.category, direction],
        aiGenerated: true,
        disclaimer: DISCOVERY_CONFIG.DISCLAIMER,
      }

      signals.push(signal)
    }

    return signals.slice(0, DISCOVERY_CONFIG.MAX_SIGNALS_PER_RUN)
  }

  // ── 3. Detect treatment response patterns ──

  detectTreatmentPatterns(patients: PatientDataRow[]): SignalCard[] {
    const signals: SignalCard[] = []

    // Group by treatment response
    const withResponse = patients.filter(pt => pt.treatment_response && pt.treatment_line)
    if (withResponse.length < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) return signals

    const responseGroups: Record<string, PatientDataRow[]> = {}
    for (const pt of withResponse) {
      const key = `L${pt.treatment_line}-${pt.treatment_response}`
      if (!responseGroups[key]) responseGroups[key] = []
      responseGroups[key].push(pt)
    }

    // Look for distinguishing features between good and poor responders
    for (const [key, group] of Object.entries(responseGroups)) {
      if (group.length < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) continue

      const isGoodResponse = key.includes('good') || key.includes('complete')
      const avgCRP = group.reduce((s, pt) => s + (pt.crp || 0), 0) / group.length
      const avgVPS = group.reduce((s, pt) => s + (pt.vps_score || 0), 0) / group.length

      signals.push({
        id: generateSignalId('treatment_response'),
        type: 'treatment_response',
        title: `Profil ${isGoodResponse ? 'bon' : 'faible'} répondeur — ${key}`,
        description: `${group.length} patients avec réponse ${key}. CRP moyenne: ${avgCRP.toFixed(1)} mg/L, VPS moyen: ${avgVPS.toFixed(0)}. ${isGoodResponse ? 'Pattern de bonne réponse identifié.' : 'Facteurs de résistance thérapeutique à investiguer.'}`,
        strength: group.length >= 5 ? 'moderate' : 'weak',
        status: 'new',
        statistics: {
          sampleSize: group.length,
          effectSize: isGoodResponse ? 0.6 : 0.4,
        },
        parameters: {
          primary: 'treatment_response',
          secondary: 'treatment_line',
          all: ['treatment_response', 'treatment_line', 'crp', 'vps_score'],
        },
        patients: {
          ids: group.map(pt => pt.id),
          count: group.length,
          syndromes: [...new Set(group.map(pt => pt.syndrome || 'Non spécifié'))],
        },
        chart: {
          type: 'bar',
          data: group.map((pt, i) => ({ x: i, y: pt.vps_score || 0, label: pt.display_name })),
          xLabel: 'Patient',
          yLabel: 'VPS Score',
        },
        discoveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'pattern_miner',
        evidenceLevel: 'observational',
        tags: ['Traitement', key],
        aiGenerated: true,
        disclaimer: DISCOVERY_CONFIG.DISCLAIMER,
      })
    }

    return signals
  }

  // ── 4. Detect anomalies (z-score based) ──

  detectAnomalies(patients: PatientDataRow[]): SignalCard[] {
    const signals: SignalCard[] = []
    if (patients.length < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) return signals

    for (const param of NUMERIC_PARAMS) {
      const values = patients
        .filter(pt => pt[param] != null)
        .map(pt => ({ id: pt.id, name: pt.display_name, val: pt[param] as number, syndrome: pt.syndrome }))

      if (values.length < DISCOVERY_CONFIG.MIN_SAMPLE_SIZE) continue

      const mean = values.reduce((s, v) => s + v.val, 0) / values.length
      const std = Math.sqrt(values.reduce((s, v) => s + (v.val - mean) ** 2, 0) / values.length)
      if (std === 0) continue

      const outliers = values.filter(v => Math.abs((v.val - mean) / std) > 2.5)
      if (outliers.length === 0) continue

      const meta = PARAMETER_META[param]
      if (!meta) continue

      signals.push({
        id: generateSignalId('anomaly'),
        type: 'anomaly',
        title: `Valeur atypique : ${meta.label}`,
        description: `${outliers.length} patient(s) avec ${meta.label} hors distribution (>2.5σ). Moyenne: ${mean.toFixed(1)}, σ: ${std.toFixed(1)}. Valeurs: ${outliers.map(o => `${o.name}=${o.val}`).join(', ')}.`,
        strength: outliers.length >= 3 ? 'strong' : outliers.length >= 2 ? 'moderate' : 'weak',
        status: 'new',
        statistics: {
          sampleSize: values.length,
          effectSize: outliers.length / values.length,
        },
        parameters: {
          primary: param,
          all: [param],
        },
        patients: {
          ids: outliers.map(o => o.id),
          count: outliers.length,
          syndromes: [...new Set(outliers.map(o => o.syndrome || 'Non spécifié'))],
        },
        discoveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'pattern_miner',
        evidenceLevel: 'observational',
        tags: [meta.category, 'Anomalie'],
        aiGenerated: true,
        disclaimer: DISCOVERY_CONFIG.DISCLAIMER,
      })
    }

    return signals
  }

  // ── 5. Simple k-means clustering (k=3) ──

  clusterPatients(patients: PatientDataRow[], k: number = 3): PatientCluster[] {
    const features = ['crp', 'gcs', 'vps_score', 'seizures_24h', 'temp'] as const
    const valid = patients.filter(pt =>
      features.every(f => (pt as any)[f] != null)
    )
    if (valid.length < k * 2) return []

    // Normalize features to 0-1
    const mins: Record<string, number> = {}
    const maxs: Record<string, number> = {}
    for (const f of features) {
      const vals = valid.map(pt => (pt as any)[f] as number)
      mins[f] = Math.min(...vals)
      maxs[f] = Math.max(...vals) || 1
    }

    const normalize = (pt: PatientDataRow) =>
      features.map(f => {
        const range = maxs[f] - mins[f]
        return range === 0 ? 0 : ((pt as any)[f] - mins[f]) / range
      })

    // Initialize centroids (first k patients)
    let centroids = valid.slice(0, k).map(normalize)
    let assignments = new Array(valid.length).fill(0)

    // K-means (10 iterations max)
    for (let iter = 0; iter < 10; iter++) {
      // Assign
      const newAssignments = valid.map((pt) => {
        const vec = normalize(pt)
        let minDist = Infinity, best = 0
        for (let c = 0; c < k; c++) {
          const dist = vec.reduce((s, v, i) => s + (v - centroids[c][i]) ** 2, 0)
          if (dist < minDist) { minDist = dist; best = c }
        }
        return best
      })

      // Check convergence
      if (newAssignments.every((a, i) => a === assignments[i])) break
      assignments = newAssignments

      // Update centroids
      centroids = Array.from({ length: k }, (_, c) => {
        const members = valid.filter((_, i) => assignments[i] === c)
        if (members.length === 0) return centroids[c]
        return features.map((f, fi) => {
          const mean = members.reduce((s, pt) => s + normalize(pt)[fi], 0) / members.length
          return mean
        })
      })
    }

    // Build clusters
    return Array.from({ length: k }, (_, c) => {
      const members = valid.filter((_, i) => assignments[i] === c)
      if (members.length === 0) return null

      const centroid: Record<string, number> = {}
      for (const f of features) {
        centroid[f] = members.reduce((s, pt) => s + ((pt as any)[f] as number), 0) / members.length
      }

      const syndromes = members.map(pt => pt.syndrome || 'Non spécifié')
      const syndromeCounts: Record<string, number> = {}
      for (const s of syndromes) { syndromeCounts[s] = (syndromeCounts[s] || 0) + 1 }
      const dominant = Object.entries(syndromeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixte'

      // Find distinctive features
      const distinctive: string[] = []
      for (const f of features) {
        const meta = PARAMETER_META[f]
        const clusterMean = centroid[f]
        const globalMean = valid.reduce((s, pt) => s + ((pt as any)[f] as number), 0) / valid.length
        const ratio = globalMean !== 0 ? clusterMean / globalMean : 0
        if (ratio > 1.3) distinctive.push(`${meta?.label || f} élevé`)
        else if (ratio < 0.7) distinctive.push(`${meta?.label || f} bas`)
      }

      return {
        id: `cluster-${c + 1}`,
        label: `Cluster ${c + 1} — ${dominant}`,
        centroid,
        patientIds: members.map(pt => pt.id),
        size: members.length,
        dominantSyndrome: dominant,
        distinctiveFeatures: distinctive,
      }
    }).filter(Boolean) as PatientCluster[]
  }

  // ── 6. Run all mining operations ──

  mine(patients: PatientDataRow[]): {
    signals: SignalCard[]
    correlationMatrix: CorrelationMatrix
    clusters: PatientCluster[]
  } {
    const correlationMatrix = this.computeCorrelationMatrix(patients)
    const correlationSignals = this.generateCorrelationSignals(correlationMatrix, patients)
    const treatmentSignals = this.detectTreatmentPatterns(patients)
    const anomalySignals = this.detectAnomalies(patients)

    const clusters = this.clusterPatients(patients)

    // Combine all signals
    const allSignals = [
      ...correlationSignals,
      ...treatmentSignals,
      ...anomalySignals,
    ]

    // Sort by strength
    const strengthOrder: Record<string, number> = { very_strong: 4, strong: 3, moderate: 2, weak: 1 }
    allSignals.sort((a, b) => (strengthOrder[b.strength] || 0) - (strengthOrder[a.strength] || 0))

    return {
      signals: allSignals.slice(0, DISCOVERY_CONFIG.MAX_SIGNALS_PER_RUN),
      correlationMatrix,
      clusters,
    }
  }
}

// ── Export singleton ──
export const patternMiner = new PatternMiner()

// ── Export type for pages ──
export type { PatientDataRow }
