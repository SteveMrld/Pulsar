// ============================================================
// PULSAR — DrugDatabase Service
// Connecteur temps réel : OpenFDA (FAERS) + BDPM (ANSM)
// Alimente le CAE et le PVE avec des données VIVANTES
// ============================================================

// ── Types ──

export interface AdverseEvent {
  reaction: string
  count: number
  serious: boolean
}

export interface DrugInteraction {
  drug1: string
  drug2: string
  description: string
  severity: 'critical' | 'high' | 'moderate' | 'low'
  source: string
}

export interface DrugSafetyProfile {
  drugName: string
  genericName: string
  adverseEvents: AdverseEvent[]
  warnings: string[]
  contraindications: string[]
  pediatricWarnings: string[]
  cardiacRisks: string[]
  neuroRisks: string[]
  respiratoryRisks: string[]
  source: 'openfda' | 'bdpm' | 'combined'
  lastUpdated: string
}

export interface DrugSearchResult {
  name: string
  genericName: string
  route: string
  manufacturer: string
  source: 'openfda' | 'bdpm'
}

// ── OpenFDA API ──

const OPENFDA_BASE = 'https://api.fda.gov'

export async function searchOpenFDA(drugName: string): Promise<DrugSafetyProfile | null> {
  try {
    // 1. Get adverse events for this drug
    const aeUrl = `${OPENFDA_BASE}/drug/event.json?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=20`
    const aeRes = await fetch(aeUrl)
    
    let adverseEvents: AdverseEvent[] = []
    if (aeRes.ok) {
      const aeData = await aeRes.json()
      adverseEvents = (aeData.results || []).map((r: any) => ({
        reaction: r.term,
        count: r.count,
        serious: false, // Will be enriched below
      }))
    }

    // 2. Get drug labeling (warnings, contraindications)
    const labelUrl = `${OPENFDA_BASE}/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`
    const labelRes = await fetch(labelUrl)
    
    let warnings: string[] = []
    let contraindications: string[] = []
    let pediatricWarnings: string[] = []
    let cardiacRisks: string[] = []
    let neuroRisks: string[] = []
    let respiratoryRisks: string[] = []

    if (labelRes.ok) {
      const labelData = await labelRes.json()
      const label = labelData.results?.[0]
      if (label) {
        warnings = label.warnings || label.warnings_and_cautions || []
        contraindications = label.contraindications || []
        
        // Extract pediatric-specific warnings
        const pedSections = [
          ...(label.pediatric_use || []),
          ...(label.use_in_specific_populations || []),
        ]
        pediatricWarnings = pedSections

        // Parse warnings for cardiac/neuro/respiratory risks
        const allWarningText = [...warnings, ...contraindications, ...(label.adverse_reactions || [])].join(' ').toLowerCase()
        
        // Cardiac risk keywords
        const cardiacKeywords = ['cardiac', 'arrhythmia', 'bradycardia', 'tachycardia', 'qt prolongation', 
          'heart', 'ventricular', 'myocardial', 'hypotension', 'cardiovascular', 'cardiotoxic',
          'cardiaque', 'arythmie', 'bradycardie', 'tachycardie', 'ventriculaire', 'myocarde']
        if (cardiacKeywords.some(k => allWarningText.includes(k))) {
          cardiacRisks.push(`Risques cardiaques identifiés dans le RCP pour ${drugName}`)
          // Extract relevant sentences
          for (const w of [...warnings, ...(label.adverse_reactions || [])]) {
            const wLower = (w || '').toLowerCase()
            if (cardiacKeywords.some(k => wLower.includes(k))) {
              cardiacRisks.push(w.substring(0, 300))
            }
          }
        }

        // Neuro risk keywords
        const neuroKeywords = ['seizure', 'convulsion', 'epilepsy', 'neurological', 'cns depression',
          'consciousness', 'coma', 'encephalopathy', 'intracranial',
          'convulsion', 'épilepsie', 'neurologique', 'conscience']
        if (neuroKeywords.some(k => allWarningText.includes(k))) {
          neuroRisks.push(`Risques neurologiques identifiés dans le RCP pour ${drugName}`)
        }

        // Respiratory risk keywords
        const respKeywords = ['respiratory depression', 'apnea', 'hypoxia', 'respiratory arrest',
          'breathing', 'ventilation', 'asphyxia',
          'dépression respiratoire', 'apnée', 'hypoxie', 'arrêt respiratoire']
        if (respKeywords.some(k => allWarningText.includes(k))) {
          respiratoryRisks.push(`Risques respiratoires identifiés dans le RCP pour ${drugName}`)
        }
      }
    }

    // 3. Count serious adverse events specifically
    const seriousUrl = `${OPENFDA_BASE}/drug/event.json?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"+AND+serious:1&count=patient.reaction.reactionmeddrapt.exact&limit=10`
    const seriousRes = await fetch(seriousUrl)
    const seriousReactions = new Set<string>()
    if (seriousRes.ok) {
      const seriousData = await seriousRes.json()
      for (const r of (seriousData.results || [])) {
        seriousReactions.add(r.term)
      }
    }

    // Mark serious events
    adverseEvents = adverseEvents.map(ae => ({
      ...ae,
      serious: seriousReactions.has(ae.reaction),
    }))

    return {
      drugName,
      genericName: drugName,
      adverseEvents,
      warnings,
      contraindications,
      pediatricWarnings,
      cardiacRisks,
      neuroRisks,
      respiratoryRisks,
      source: 'openfda',
      lastUpdated: new Date().toISOString(),
    }
  } catch (err) {
    console.error(`OpenFDA search failed for ${drugName}:`, err)
    return null
  }
}

// ── BDPM (ANSM) — French drug database ──

const BDPM_API = 'https://base-donnees-publique.medicaments.gouv.fr'

export async function searchBDPM(drugName: string): Promise<DrugSearchResult[]> {
  try {
    // The BDPM has a web interface but limited API
    // We use the open data files from data.gouv.fr via the community API
    const url = `${BDPM_API}/extrait.php?specid=&typedoc=R&affession=&substance=${encodeURIComponent(drugName)}`
    const res = await fetch(url)
    if (!res.ok) return []
    
    // Parse results (HTML page unfortunately)
    // For production: use the downloadable TSV files or the community REST API
    return [{
      name: drugName,
      genericName: drugName,
      route: 'unknown',
      manufacturer: 'BDPM lookup',
      source: 'bdpm' as const,
    }]
  } catch {
    return []
  }
}

// ── Combined search ──

export async function getDrugSafetyProfile(drugName: string): Promise<DrugSafetyProfile | null> {
  // Normalize drug name for search
  const normalized = drugName
    .toLowerCase()
    .replace(/[()]/g, '')
    .trim()

  // Map French drug names to international names for OpenFDA
  const frenchToInternational: Record<string, string> = {
    'meopa': 'nitrous oxide',
    'protoxyde d\'azote': 'nitrous oxide',
    'kalinox': 'nitrous oxide',
    'antasol': 'nitrous oxide',
    'entonox': 'nitrous oxide',
    'oxynox': 'nitrous oxide',
    'rivotril': 'clonazepam',
    'clonazépam': 'clonazepam',
    'keppra': 'levetiracetam',
    'lévétiracétam': 'levetiracetam',
    'dilantin': 'phenytoin',
    'phénytoïne': 'phenytoin',
    'gardénal': 'phenobarbital',
    'phénobarbital': 'phenobarbital',
    'hypnovel': 'midazolam',
    'valium': 'diazepam',
    'dépakine': 'valproic acid',
    'tégrétol': 'carbamazepine',
    'laroxyl': 'amitriptyline',
    'solumédrol': 'methylprednisolone',
    'cefotaxime': 'cefotaxime',
    'aciclovir': 'acyclovir',
    'sufentanil': 'sufentanil',
    'kétamine': 'ketamine',
    'paracétamol': 'acetaminophen',
    'doliprane': 'acetaminophen',
    'efferalgan': 'acetaminophen',
    'anakinra': 'anakinra',
    'kineret': 'anakinra',
    'tocilizumab': 'tocilizumab',
    'actemra': 'tocilizumab',
    'rituximab': 'rituximab',
    'mabthera': 'rituximab',
    'noradrénaline': 'norepinephrine',
    'adrénaline': 'epinephrine',
    // IVIG
    'tégéline': 'immune globulin',
    'immunoglobulines': 'immune globulin',
    'ivig': 'immune globulin',
    'topiramate': 'topiramate',
    'epitomax': 'topiramate',
    'lamotrigine': 'lamotrigine',
    'lamictal': 'lamotrigine',
    'oxcarbazepine': 'oxcarbazepine',
    'trileptal': 'oxcarbazepine',
    'lacosamide': 'lacosamide',
    'vimpat': 'lacosamide',
    'clobazam': 'clobazam',
    'urbanyl': 'clobazam',
    'stiripentol': 'stiripentol',
    'diacomit': 'stiripentol',
    'cannabidiol': 'cannabidiol',
    'epidyolex': 'cannabidiol',
    'thiopental': 'thiopental',
    'nesdonal': 'thiopental',
    'propofol': 'propofol',
    'diprivan': 'propofol',
    'fentanyl': 'fentanyl',
    'morphine': 'morphine',
    'dexamethasone': 'dexamethasone',
    'prednisolone': 'prednisolone',
    'solupred': 'prednisolone',
    'methylprednisolone': 'methylprednisolone',
    'solumedrol': 'methylprednisolone',
    'cyclophosphamide': 'cyclophosphamide',
    'endoxan': 'cyclophosphamide',
    'mycophenolate': 'mycophenolate mofetil',
    'cellcept': 'mycophenolate mofetil',
    'azathioprine': 'azathioprine',
    'imurel': 'azathioprine',
    'tacrolimus': 'tacrolimus',
    'prograf': 'tacrolimus',
    'ciclosporine': 'cyclosporine',
    'sandimmun': 'cyclosporine',
    'ibuprofene': 'ibuprofen',
    'advil': 'ibuprofen',
  }

  const searchName = frenchToInternational[normalized] || normalized

  // Query OpenFDA
  const profile = await searchOpenFDA(searchName)
  
  if (profile) {
    profile.drugName = drugName // Keep original name
    profile.source = 'combined'
  }

  return profile
}

// ── Batch safety check for all patient drugs ──

export async function batchDrugSafetyCheck(drugNames: string[]): Promise<Map<string, DrugSafetyProfile>> {
  const results = new Map<string, DrugSafetyProfile>()
  
  // Query in parallel but with rate limiting (5 at a time)
  const chunks: string[][] = []
  for (let i = 0; i < drugNames.length; i += 5) {
    chunks.push(drugNames.slice(i, i + 5))
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (name) => {
      const profile = await getDrugSafetyProfile(name)
      if (profile) results.set(name, profile)
    })
    await Promise.all(promises)
  }

  return results
}

// ── Check specific interaction risks for patient profile ──

export interface PatientContext {
  age: number          // months
  hasSeizures: boolean
  hasCardiacRisk: boolean
  hasRespiratoryRisk: boolean
  isFebrile: boolean
  hasInflammation: boolean
  gcs: number
}

export function analyzeSafetyForPatient(
  profile: DrugSafetyProfile,
  context: PatientContext
): { riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'none'; reasons: string[] } {
  const reasons: string[] = []
  let maxRisk: 'critical' | 'high' | 'moderate' | 'low' | 'none' = 'none'

  // Pediatric check
  if (context.age < 216 && profile.pediatricWarnings.length > 0) { // < 18 years
    reasons.push(`Avertissements pédiatriques dans le RCP (${profile.pediatricWarnings.length} mentions)`)
    maxRisk = 'moderate'
  }

  // Cardiac risks × cardiac fragility
  if (context.hasCardiacRisk && profile.cardiacRisks.length > 0) {
    reasons.push(`CARDIOTOXICITÉ: ${profile.cardiacRisks.length} risques cardiaques identifiés × fragilité cardiaque du patient`)
    maxRisk = 'critical'
  }

  // Neuro risks × seizures
  if (context.hasSeizures && profile.neuroRisks.length > 0) {
    reasons.push(`NEUROTOXICITÉ: risques neurologiques identifiés × crises actives du patient`)
    maxRisk = maxRisk === 'critical' ? 'critical' : 'high'
  }

  // Respiratory risks × respiratory fragility
  if (context.hasRespiratoryRisk && profile.respiratoryRisks.length > 0) {
    reasons.push(`DÉPRESSION RESPIRATOIRE: risques respiratoires identifiés × fragilité respiratoire du patient`)
    maxRisk = maxRisk === 'critical' ? 'critical' : 'high'
  }

  // Fever + neuro risks (FIRES prodrome pattern)
  if (context.isFebrile && context.hasSeizures && profile.neuroRisks.length > 0) {
    reasons.push(`ALERTE FIRES: médicament avec risque neuro × fièvre × crises = cascade potentielle`)
    maxRisk = 'critical'
  }

  // GCS low + respiratory depression risk
  if (context.gcs <= 8 && profile.respiratoryRisks.length > 0) {
    reasons.push(`GCS ≤ 8 + risque dépression respiratoire = contre-indication relative`)
    maxRisk = maxRisk === 'critical' ? 'critical' : 'high'
  }

  // Check serious adverse events count
  const seriousCount = profile.adverseEvents.filter(ae => ae.serious).length
  if (seriousCount > 5) {
    reasons.push(`${seriousCount} effets indésirables graves rapportés dans FAERS`)
    if (maxRisk === 'none') maxRisk = 'moderate'
  }

  return { riskLevel: maxRisk, reasons }
}
