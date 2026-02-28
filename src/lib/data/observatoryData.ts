import type { SignalItem, EvidenceItem, RegistryRow, AggregateData } from './observatoryTypes'

// ── Epidemiological aggregates (from PULSAR benchmark) ──
export const AGGREGATES: AggregateData[] = [
  { family: 'FIRES', incidence: '1/1 000 000', mortality: '10-20%', medianAge: '7 ans', cohortSize: 932, geography: 'International', source: 'Specchio et al. 2022 + SPF 2024' },
  { family: 'EAIS', incidence: '1.5/100 000', mortality: '4-7%', medianAge: '10 ans', cohortSize: 580, geography: 'Europe/NA', source: 'Titulaer et al. 2013' },
  { family: 'NORSE', incidence: '5/1 000 000', mortality: '15-25%', medianAge: '29 ans', cohortSize: 310, geography: 'International', source: 'Gaspard et al. 2015' },
  { family: 'PIMS', incidence: '25/100 000', mortality: '1-2%', medianAge: '8 ans', cohortSize: 1116, geography: 'France', source: 'Belot et al. 2020 + Francoeur OR 1.85/2.18' },
  { family: 'MOGAD', incidence: '3.4/100 000', mortality: '<1%', medianAge: '9 ans', cohortSize: 218, geography: 'International', source: 'Bilodeau 2024' },
]

// ── Statistical signals (demo — would be live in production) ──
export const SIGNALS: SignalItem[] = [
  { id: 'SIG-001', title: 'Cluster FIRES Île-de-France Q4 2025', region: 'France — IDF', family: 'FIRES', year: 2025, score: 2.41, status: 'active', rationale: '6 cas en 3 mois vs moyenne 1.2/trimestre. Corrélation possible avec pic rhinovirus automnal.', source: 'SPF Bulletin épidémiologique' },
  { id: 'SIG-002', title: 'Hausse encéphalites anti-NMDAR post-herpétiques', region: 'UK — South East', family: 'EAIS', year: 2025, score: 1.98, status: 'under_review', rationale: '4 cas séquentiels HSV → anti-NMDAR chez <12 ans. Investigation NHS en cours.' },
  { id: 'SIG-003', title: 'PIMS résiduel post-COVID XBB.1.5', region: 'Brésil — São Paulo', family: 'PIMS', year: 2025, score: 1.65, status: 'under_review', rationale: 'Incidence PIMS stable malgré baisse COVID. Hypothèse : réactivation immunitaire retardée.' },
  { id: 'SIG-004', title: 'MOGAD pédiatrique — série scandinave', region: 'Suède/Norvège', family: 'MOGAD', year: 2025, score: 2.12, status: 'validated', rationale: '12 cas MOGAD < 6 ans en 8 mois. Taux de rechute 42% à 12 mois (vs 30% attendu). Bilodeau 2024 corrobore.' },
]

// ── Evidence library (real publications from PULSAR benchmark) ──
export const EVIDENCE: EvidenceItem[] = [
  // FIRES
  { topic: 'FIRES — Épidémiologie', metric: 'Cohorte nationale France', value: '932', unit: 'cas documentés', population: 'Pédiatrique', geography: 'France', note: 'Plus large cohorte nationale FIRES', sourceTitle: 'Santé Publique France — Surveillance encéphalites', sourceUrl: 'https://www.santepubliquefrance.fr', year: 2024 },
  { topic: 'FIRES — Pronostic', metric: 'Mortalité globale', value: '12%', unit: 'à 12 mois', population: '<18 ans', geography: 'International', note: 'Méta-analyse 14 études', sourceTitle: 'Specchio et al. — Epilepsia 2022', sourceUrl: 'https://doi.org/10.1111/epi.17354', year: 2022 },
  { topic: 'FIRES — Pronostic', metric: 'Épilepsie résiduelle', value: '82%', unit: 'des survivants', population: '<18 ans', geography: 'International', sourceTitle: 'Kramer et al. — JAMA Neurology 2023', sourceUrl: 'https://doi.org/10.1001/jamaneurol.2023', year: 2023 },

  // PIMS
  { topic: 'PIMS — Épidémiologie', metric: 'Odds Ratio neuro PIMS', value: 'OR 1.85 (IC 1.41-2.18)', unit: '', population: 'Pédiatrique', geography: 'France', note: 'Francoeur et al. — Atteinte neurologique dans le PIMS', sourceTitle: 'Francoeur et al. — Lancet Child 2024', sourceUrl: 'https://doi.org/10.1016/S2352-4642(24)00112-3', year: 2024 },
  { topic: 'PIMS — Traitement', metric: 'Réponse IVIg première ligne', value: '77%', unit: 'bonne réponse', population: 'PIMS confirmé', geography: 'France', sourceTitle: 'Belot et al. — NEJM 2020', sourceUrl: 'https://doi.org/10.1056/NEJMoa2021680', year: 2020 },

  // MOGAD
  { topic: 'MOGAD — Diagnostic', metric: 'Sensibilité anti-MOG CBA', value: '95%', unit: '', population: 'Pédiatrique', geography: 'International', note: 'Cell-Based Assay recommandé', sourceTitle: 'Bilodeau et al. — Neurology 2024', sourceUrl: 'https://doi.org/10.1212/WNL.0000000000209', year: 2024 },
  { topic: 'MOGAD — Pronostic', metric: 'Taux de rechute à 2 ans', value: '30%', unit: '', population: '<16 ans', geography: 'International', sourceTitle: 'Bilodeau et al. — Neurology 2024', sourceUrl: 'https://doi.org/10.1212/WNL.0000000000209', year: 2024 },

  // EEG/Diagnostic
  { topic: 'Diagnostic — EEG', metric: 'AUC classification EEG', value: '0.72', unit: '', population: 'Encéphalites auto-immunes', geography: 'UK', note: 'Machine learning sur tracés EEG continus', sourceTitle: 'Shakeshaft et al. — Brain Communications 2023', sourceUrl: 'https://doi.org/10.1093/braincomms/fcad012', year: 2023 },
]

// ── Registry demo data (anonymized, illustrative) ──
export const REGISTRY: RegistryRow[] = [
  { case_id: 'FR-IDF-001', family: 'FIRES', region: 'Île-de-France', country: 'France', lat: 48.86, lon: 2.35, seizure_onset: 'J0 — Status réfractaire', severity_1to5: 5, outcome_12m: 'Épilepsie chronique', age_months: 48, sex: 'F' },
  { case_id: 'FR-IDF-002', family: 'FIRES', region: 'Île-de-France', country: 'France', lat: 48.82, lon: 2.28, seizure_onset: 'J1 — TC généralisées', severity_1to5: 4, outcome_12m: 'Séquelles cognitives', age_months: 72, sex: 'M' },
  { case_id: 'FR-LYO-003', family: 'PIMS', region: 'Rhône-Alpes', country: 'France', lat: 45.76, lon: 4.83, seizure_onset: 'J3 — Focales', severity_1to5: 3, outcome_12m: 'Rémission', age_months: 84, sex: 'F' },
  { case_id: 'UK-LON-004', family: 'EAIS', region: 'London', country: 'UK', lat: 51.51, lon: -0.12, seizure_onset: 'J2 — Anti-NMDAR', severity_1to5: 4, outcome_12m: 'Déficits cognitifs', age_months: 168, sex: 'M' },
  { case_id: 'UK-LON-005', family: 'EAIS', region: 'London', country: 'UK', lat: 51.48, lon: -0.08, seizure_onset: 'J1 — Anti-NMDAR', severity_1to5: 3, outcome_12m: 'Rémission partielle', age_months: 120, sex: 'F' },
  { case_id: 'DE-BER-006', family: 'NORSE', region: 'Berlin', country: 'Allemagne', lat: 52.52, lon: 13.41, seizure_onset: 'J0 — Super-réfractaire', severity_1to5: 5, outcome_12m: 'Décès', age_months: 36, sex: 'M' },
  { case_id: 'BR-SPO-007', family: 'PIMS', region: 'São Paulo', country: 'Brésil', lat: -23.55, lon: -46.63, seizure_onset: 'J2 — Myoclonies', severity_1to5: 3, outcome_12m: 'Rémission', age_months: 96, sex: 'F' },
  { case_id: 'JP-TKO-008', family: 'FIRES', region: 'Tokyo', country: 'Japon', lat: 35.68, lon: 139.69, seizure_onset: 'J0 — Status réfractaire', severity_1to5: 5, outcome_12m: 'Épilepsie chronique', age_months: 60, sex: 'M' },
  { case_id: 'SE-STO-009', family: 'MOGAD', region: 'Stockholm', country: 'Suède', lat: 59.33, lon: 18.07, seizure_onset: 'J1 — ADEM', severity_1to5: 2, outcome_12m: 'Rémission', age_months: 48, sex: 'F' },
  { case_id: 'NO-OSL-010', family: 'MOGAD', region: 'Oslo', country: 'Norvège', lat: 59.91, lon: 10.75, seizure_onset: 'J0 — Névrite optique', severity_1to5: 2, outcome_12m: 'Rechute M+8', age_months: 36, sex: 'M' },
  { case_id: 'US-BOS-011', family: 'FIRES', region: 'Boston', country: 'USA', lat: 42.36, lon: -71.06, seizure_onset: 'J0 — Status réfractaire', severity_1to5: 4, outcome_12m: 'Séquelles cognitives', age_months: 84, sex: 'F' },
  { case_id: 'CA-TOR-012', family: 'EAIS', region: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38, seizure_onset: 'J3 — Anti-LGI1', severity_1to5: 3, outcome_12m: 'Rémission', age_months: 144, sex: 'M' },
  { case_id: 'AU-SYD-013', family: 'PIMS', region: 'Sydney', country: 'Australie', lat: -33.87, lon: 151.21, seizure_onset: 'J4 — TC généralisées', severity_1to5: 3, outcome_12m: 'Rémission', age_months: 108, sex: 'F' },
  { case_id: 'IN-DEL-014', family: 'FIRES', region: 'Delhi', country: 'Inde', lat: 28.61, lon: 77.23, seizure_onset: 'J0 — Super-réfractaire', severity_1to5: 5, outcome_12m: 'Épilepsie réfractaire', age_months: 42, sex: 'M' },
  { case_id: 'FR-BOR-015', family: 'MOGAD', region: 'Bordeaux', country: 'France', lat: 44.84, lon: -0.58, seizure_onset: 'J2 — ADEM récurrente', severity_1to5: 3, outcome_12m: 'Rechute M+14', age_months: 60, sex: 'F' },
]
