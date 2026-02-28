// Epidemiological context: surveillance feeds + known triggers per pathology

export interface EpidemioFeed {
  id: string
  source: 'SPF_ODISSE' | 'ECDC_ATLAS' | 'SURSAUD' | 'SENTINELLES'
  indicator: string
  region: string
  country: string
  value: number
  unit: string
  trend: 'rising' | 'stable' | 'declining'
  week: string // e.g. "2026-S08"
  alertLevel: 'normal' | 'elevated' | 'alert' | 'epidemic'
  url: string
}

export interface PathologyTrigger {
  family: string
  triggers: {
    agent: string
    mechanism: string
    evidence: string
    feedIndicators: string[] // which feeds to watch
  }[]
}

// ── Known triggers per pathology (evidence-based) ──
export const PATHOLOGY_TRIGGERS: PathologyTrigger[] = [
  {
    family: 'FIRES',
    triggers: [
      { agent: 'Gastro-entérite virale', mechanism: 'Infection fébrile précédant le status épileptique (2-14j). Activation immunitaire → neuro-inflammation.', evidence: 'Specchio et al. 2022 — 68% des cas FIRES ont une infection prodromique', feedIndicators: ['gastro_enterite', 'rotavirus'] },
      { agent: 'Grippe / Syndrome grippal', mechanism: 'Fièvre + réponse cytokinique intense → rupture BHE → crises', evidence: 'Kramer et al. 2023', feedIndicators: ['grippe', 'syndrome_grippal'] },
      { agent: 'COVID-19', mechanism: 'Neuro-inflammation post-infectieuse. Cas documentés FIRES post-COVID pédiatrique.', evidence: 'Bhatt et al. 2021 — Lancet Child', feedIndicators: ['covid_hospitalisation', 'covid_incidence'] },
      { agent: 'Rhinovirus / Entérovirus', mechanism: 'Infection respiratoire haute → déclencheur prodromique le plus fréquent', evidence: 'Gaspard et al. 2015', feedIndicators: ['bronchiolite', 'rhinovirus'] },
    ],
  },
  {
    family: 'EAIS',
    triggers: [
      { agent: 'Herpès (HSV-1)', mechanism: 'Encéphalite herpétique → libération antigènes neuronaux → auto-immunité anti-NMDAR secondaire', evidence: 'Armangue et al. 2014 — 27% encéphalites anti-NMDAR post-HSV', feedIndicators: ['herpes_encephalite'] },
      { agent: 'Tératome ovarien', mechanism: 'Tissu neuronal ectopique → rupture tolérance immunitaire (adolescentes)', evidence: 'Titulaer et al. 2013', feedIndicators: [] },
    ],
  },
  {
    family: 'PIMS',
    triggers: [
      { agent: 'COVID-19 (2-6 semaines post)', mechanism: 'Réponse immunitaire retardée post-SARS-CoV-2. Tempête cytokinique → atteinte multi-organes.', evidence: 'Belot et al. 2020 — NEJM', feedIndicators: ['covid_incidence', 'covid_hospitalisation'] },
      { agent: 'Variant dominant', mechanism: 'Incidence PIMS corrélée aux vagues COVID. XBB.1.5 : signal résiduel observé.', evidence: 'Francoeur et al. 2024 — OR 1.85', feedIndicators: ['covid_variants'] },
    ],
  },
  {
    family: 'MOGAD',
    triggers: [
      { agent: 'Infection virale respiratoire', mechanism: 'Mimétisme moléculaire → auto-anticorps anti-MOG', evidence: 'Bilodeau et al. 2024', feedIndicators: ['grippe', 'bronchiolite'] },
      { agent: 'Vaccination (rare)', mechanism: 'Post-vaccinale dans de rares cas — ADEM post-vaccinale', evidence: 'Case reports, causalité non établie', feedIndicators: [] },
    ],
  },
  {
    family: 'NORSE',
    triggers: [
      { agent: 'Infection fébrile non identifiée', mechanism: 'Par définition, NORSE = aucune étiologie retrouvée. Mais infection prodromique dans 50-70% des cas.', evidence: 'Gaspard et al. 2015', feedIndicators: ['syndrome_grippal', 'gastro_enterite'] },
    ],
  },
]

// ── Simulated surveillance feeds (would be live API in production) ──
// Sources: Odissé (SPF), ECDC Surveillance Atlas, Réseau Sentinelles, SurSaUD
export const SURVEILLANCE_FEEDS: EpidemioFeed[] = [
  // France — SPF Odissé / Sentinelles
  { id: 'FR-GRIPPE-IDF', source: 'SENTINELLES', indicator: 'grippe', region: 'Île-de-France', country: 'France', value: 287, unit: 'cas/100k/sem', trend: 'rising', week: '2026-S08', alertLevel: 'elevated', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-GRIPPE-ARA', source: 'SENTINELLES', indicator: 'grippe', region: 'Auvergne-Rhône-Alpes', country: 'France', value: 195, unit: 'cas/100k/sem', trend: 'stable', week: '2026-S08', alertLevel: 'normal', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-GASTRO-IDF', source: 'SENTINELLES', indicator: 'gastro_enterite', region: 'Île-de-France', country: 'France', value: 342, unit: 'cas/100k/sem', trend: 'rising', week: '2026-S08', alertLevel: 'alert', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-GASTRO-BRE', source: 'SENTINELLES', indicator: 'gastro_enterite', region: 'Bretagne', country: 'France', value: 198, unit: 'cas/100k/sem', trend: 'declining', week: '2026-S08', alertLevel: 'normal', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-BRONCHIO-IDF', source: 'SURSAUD', indicator: 'bronchiolite', region: 'Île-de-France', country: 'France', value: 156, unit: 'passages SU/sem', trend: 'declining', week: '2026-S08', alertLevel: 'normal', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-COVID-NAT', source: 'SPF_ODISSE', indicator: 'covid_hospitalisation', region: 'National', country: 'France', value: 2.1, unit: '/100k/sem', trend: 'stable', week: '2026-S08', alertLevel: 'normal', url: 'https://odisse.santepubliquefrance.fr' },
  { id: 'FR-MENINGO-NAT', source: 'SPF_ODISSE', indicator: 'meningite_bacterienne', region: 'National', country: 'France', value: 12, unit: 'cas/sem', trend: 'stable', week: '2026-S08', alertLevel: 'normal', url: 'https://odisse.santepubliquefrance.fr' },

  // Europe — ECDC
  { id: 'EU-TBE-2025', source: 'ECDC_ATLAS', indicator: 'encephalite_tiques', region: 'EU/EEA', country: 'Europe', value: 4200, unit: 'cas/an (2025)', trend: 'rising', week: '2025-annuel', alertLevel: 'elevated', url: 'https://atlas.ecdc.europa.eu/public/' },
  { id: 'EU-MENINGO-2025', source: 'ECDC_ATLAS', indicator: 'meningocoque', region: 'EU/EEA', country: 'Europe', value: 3100, unit: 'cas/an (2025)', trend: 'rising', week: '2025-annuel', alertLevel: 'elevated', url: 'https://atlas.ecdc.europa.eu/public/' },
  { id: 'UK-GRIPPE-SE', source: 'ECDC_ATLAS', indicator: 'grippe', region: 'South East England', country: 'UK', value: 210, unit: 'cas/100k/sem', trend: 'stable', week: '2026-S08', alertLevel: 'normal', url: 'https://atlas.ecdc.europa.eu/public/' },
]

// ── Diagnostic relevance engine ──
// Given a pathology family and a region, compute which feeds are relevant and generate diagnostic context alerts
export interface DiagnosticContext {
  family: string
  region: string
  relevantFeeds: EpidemioFeed[]
  alerts: {
    level: 'info' | 'warning' | 'critical'
    message: string
    trigger: string
    mechanism: string
  }[]
}

export function computeDiagnosticContext(family: string, region: string): DiagnosticContext {
  const triggers = PATHOLOGY_TRIGGERS.find(p => p.family === family)
  if (!triggers) return { family, region, relevantFeeds: [], alerts: [] }

  // Collect all relevant feed indicators for this pathology
  const allIndicators = triggers.triggers.flatMap(t => t.feedIndicators)

  // Find matching feeds (same region or national/European)
  const relevantFeeds = SURVEILLANCE_FEEDS.filter(f =>
    allIndicators.includes(f.indicator) &&
    (f.region.toLowerCase().includes(region.toLowerCase()) || f.region === 'National' || f.region === 'EU/EEA')
  )

  // Generate diagnostic context alerts
  const alerts: DiagnosticContext['alerts'] = []

  for (const feed of relevantFeeds) {
    if (feed.alertLevel === 'alert' || feed.alertLevel === 'epidemic') {
      const trigger = triggers.triggers.find(t => t.feedIndicators.includes(feed.indicator))
      if (trigger) {
        alerts.push({
          level: 'critical',
          message: `ALERTE ${feed.indicator.replace(/_/g, ' ').toUpperCase()} — ${feed.region}: ${feed.value} ${feed.unit} (tendance: ${feed.trend === 'rising' ? '↑' : feed.trend === 'declining' ? '↓' : '→'})`,
          trigger: trigger.agent,
          mechanism: trigger.mechanism,
        })
      }
    } else if (feed.alertLevel === 'elevated' || feed.trend === 'rising') {
      const trigger = triggers.triggers.find(t => t.feedIndicators.includes(feed.indicator))
      if (trigger) {
        alerts.push({
          level: 'warning',
          message: `Signal ${feed.indicator.replace(/_/g, ' ')} — ${feed.region}: ${feed.value} ${feed.unit} (${feed.trend === 'rising' ? 'en hausse' : 'élevé'})`,
          trigger: trigger.agent,
          mechanism: trigger.mechanism,
        })
      }
    }
  }

  return { family, region, relevantFeeds, alerts }
}
