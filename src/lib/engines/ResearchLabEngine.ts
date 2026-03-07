// ============================================================
// PULSAR V21 — RESEARCH LAB ENGINE (Moteur 12)
// "Le laboratoire qui ne dort jamais"
//
// Ce moteur croise TOUTES les données disponibles sur un patient
// et génère des hypothèses de recherche qu'il vérifie contre
// la littérature mondiale. Il travaille comme un chercheur :
// observer → questionner → chercher → hypothétiser → vérifier.
//
// Né de la question fondatrice : pourquoi personne n'a croisé
// la prématurité, la drépanocytose, le MEOPA, les troubles
// digestifs et le FIRES d'Alejandro ?
//
// Couleur identitaire : #0EA5E9 (sky blue — recherche)
// ============================================================

import type { PatientState } from './PatientState'

// ── Types ──

export interface ResearchQuestion {
  id: string
  question: string
  domain: 'etiology' | 'pharmacology' | 'genetics' | 'immunology' | 'epidemiology' | 'protocol'
  priority: 'critical' | 'high' | 'medium' | 'exploratory'
  reasoning: string          // Why this question matters
  dataPoints: string[]       // What patient data triggered this question
  searchQueries: string[]    // PubMed queries to investigate
}

export interface ResearchHypothesis {
  id: string
  title: string
  description: string
  confidence: number         // 0-100
  evidenceFor: string[]      // Publications supporting
  evidenceAgainst: string[]  // Publications contradicting
  status: 'generated' | 'investigating' | 'supported' | 'refuted' | 'inconclusive'
  implications: string       // What this means for treatment
  sourceQuestion: string     // Which question generated this
}

export interface ResearchSession {
  sessionId: string
  patientAnonId: string
  startedAt: string
  completedAt: string | null
  questions: ResearchQuestion[]
  hypotheses: ResearchHypothesis[]
  crossReferences: CrossReference[]
  insights: string[]
  status: 'running' | 'completed' | 'paused'
}

export interface CrossReference {
  factorA: string
  factorB: string
  relationship: string
  strength: 'strong' | 'moderate' | 'weak' | 'unknown'
  source: string
  implication: string
}

// ── Research Question Generator ──
// Analyzes ALL patient data and generates research questions

export function generateResearchQuestions(ps: PatientState): ResearchQuestion[] {
  const questions: ResearchQuestion[] = []
  let qId = 0

  // ── 1. GENETIC / ETHNIC FACTORS ──
  // Does the patient have sickle cell trait or other hemoglobinopathies?
  if ((ps as any).sickleCell || (ps as any).hemoglobinopathy) {
    questions.push({
      id: `RQ-${++qId}`,
      question: 'Existe-t-il un lien entre le trait drépanocytaire et la susceptibilité aux encéphalopathies inflammatoires pédiatriques (FIRES/NORSE) ?',
      domain: 'genetics',
      priority: 'high',
      reasoning: 'Le patient est porteur sain drépanocytaire. La drépanocytose est associée à une dysrégulation immunitaire et vasculaire. Un terrain inflammatoire chronique pourrait abaisser le seuil de déclenchement du FIRES.',
      dataPoints: ['Porteur sain drépanocytaire', 'Mère drépanocytaire SS'],
      searchQueries: ['sickle cell trait neuroinflammation pediatric', 'hemoglobinopathy seizure susceptibility', 'sickle cell encephalopathy children'],
    })
  }

  // Vitamin D deficiency (common in darker skin phenotypes)
  questions.push({
    id: `RQ-${++qId}`,
    question: 'Le déficit en vitamine D est-il un facteur de risque modifiable pour le FIRES ?',
    domain: 'immunology',
    priority: 'medium',
    reasoning: 'La vitamine D module la réponse immunitaire innée et adaptative. Un déficit est fréquent chez les enfants à peau foncée. Des études montrent une association entre déficit en vit D et susceptibilité aux infections et à l\'auto-immunité.',
    dataPoints: ['Phénotype métis', 'Carence potentielle en vitamine D'],
    searchQueries: ['vitamin D deficiency seizures pediatric', 'vitamin D neuroinflammation FIRES', 'vitamin D immune regulation encephalitis'],
  })

  // ── 2. NEONATAL HISTORY ──
  if ((ps as any).premature || ps.ageMonths <= 6) {
    questions.push({
      id: `RQ-${++qId}`,
      question: 'La prématurité et les complications néonatales (thrombopénie, TÉGÉLINE) prédisposent-elles au FIRES ultérieurement ?',
      domain: 'etiology',
      priority: 'high',
      reasoning: 'Le patient est né prématuré à 34 SA avec thrombopénie néonatale sévère traitée par immunoglobulines. Le traitement par TÉGÉLINE à la naissance a pu modifier la maturation immunitaire. La question est : ce terrain néonatal crée-t-il une vulnérabilité immunitaire latente qui se manifeste des années plus tard ?',
      dataPoints: ['Prématurité 34 SA', 'Thrombopénie néonatale 32 000', 'TÉGÉLINE J2-J3', 'Développement normal 6 ans puis FIRES'],
      searchQueries: ['prematurity autoimmune encephalitis risk', 'neonatal thrombocytopenia immune dysregulation', 'IVIG neonatal long term immune effects', 'prematurity epilepsy susceptibility'],
    })
  }

  // ── 3. GASTROINTESTINAL / MICROBIOME ──
  // This connects directly to Pierre Sonigo's endotoxin hypothesis
  if (ps.hemodynamics.temp >= 38 || (ps as any).digestiveSymptoms) {
    questions.push({
      id: `RQ-${++qId}`,
      question: 'Les troubles digestifs pré-FIRES sont-ils le signe d\'une translocation d\'endotoxines intestinales qui déclenche la cascade neuro-inflammatoire ?',
      domain: 'etiology',
      priority: 'critical',
      reasoning: 'Le patient avait des problèmes gastriques récents avant le déclenchement. L\'hypothèse endotoxine (Sonigo) propose que la flore intestinale relâche des endotoxines dans la circulation selon des facteurs déclenchants digestifs. Ces endotoxines activeraient l\'inflammasome NLRP3 → IL-1β → neuroinflammation → FIRES. C\'est cohérent avec l\'hypothèse de Lin & Hsu 2021 sur l\'axe IL-1β dans le FIRES.',
      dataPoints: ['Problèmes gastriques récents', 'Fièvre', 'CRP élevée', 'Prodrome infectieux'],
      searchQueries: ['gut microbiome FIRES epilepsy', 'endotoxin translocation neuroinflammation pediatric', 'intestinal permeability seizures children', 'NLRP3 inflammasome gut brain axis epilepsy', 'lipopolysaccharide blood brain barrier seizure threshold'],
    })

    questions.push({
      id: `RQ-${++qId}`,
      question: 'Le dosage des endotoxines sériques (LPS/LBP) pourrait-il servir de biomarqueur prédictif du FIRES avant les premières convulsions ?',
      domain: 'epidemiology',
      priority: 'critical',
      reasoning: 'Si l\'hypothèse endotoxine est correcte, un dosage de LPS-binding protein (LBP) ou d\'endotoxines circulantes chez un enfant fébrile avec troubles digestifs pourrait prédire le risque de FIRES AVANT les convulsions. Ce serait un changement de paradigme : passer de la réaction (traiter les crises) à la prévention (détecter le risque avant les crises).',
      dataPoints: ['Troubles digestifs', 'Fièvre', 'Infection récente', 'Prodrome FIRES'],
      searchQueries: ['LPS binding protein pediatric sepsis biomarker', 'endotoxin biomarker encephalitis prediction', 'LBP serum level febrile seizures', 'gut derived endotoxin neurological disease children'],
    })
  }

  // ── 4. MEOPA / N2O TRIGGER ──
  if ((ps as any).meopaExposed || ps.drugs?.some(d => d.name.toLowerCase().includes('meopa') || d.name.toLowerCase().includes('n2o'))) {
    questions.push({
      id: `RQ-${++qId}`,
      question: 'Le MEOPA (N2O) peut-il transformer un prodrome FIRES silencieux en FIRES déclaré via un mécanisme d\'hypoxie cérébrale transitoire ?',
      domain: 'pharmacology',
      priority: 'critical',
      reasoning: 'Le patient a reçu du MEOPA à Eaubonne alors qu\'il était en phase prodromique (fièvre + céphalées + douleurs abdominales). Arrêt respiratoire immédiat, puis convulsions, puis FIRES. La littérature (Zier 2010, ANSM 2016) documente des convulsions sous N2O pédiatrique. L\'hypothèse "double détente" : le N2O abaisse le seuil convulsif d\'un cerveau déjà en neuroinflammation latente.',
      dataPoints: ['MEOPA administré en prodrome', 'Arrêt respiratoire immédiat', 'Convulsions post-MEOPA', 'Fièvre + céphalées au moment de l\'administration'],
      searchQueries: ['nitrous oxide seizure threshold pediatric', 'N2O cerebral hypoxia convulsion mechanism', 'MEOPA adverse events febrile children', 'nitrous oxide FIRES trigger case report'],
    })
  }

  // ── 5. CARDIAC DEATH IN FIRES ──
  if (ps.hemodynamics.heartRate > 150 || ps.hemodynamics.map < 50 || (ps as any).cardiacArrest) {
    questions.push({
      id: `RQ-${++qId}`,
      question: 'Quelle est la fréquence réelle des décès par arrêt cardiaque (vs cérébral) dans le FIRES, et la phénytoïne en perfusion prolongée est-elle un facteur contributif sous-estimé ?',
      domain: 'pharmacology',
      priority: 'high',
      reasoning: 'Le patient est décédé d\'un arrêt cardiaque après 14 jours de phénytoïne en perfusion continue + cocktail 5 molécules sédatives + inflammation systémique non contrôlée. Les derniers examens cérébraux ne montraient pas de lésion irréversible. Question : combien de décès FIRES attribués à la "maladie" sont en réalité des complications iatrogènes cardiaques ?',
      dataPoints: ['Arrêt cardiaque J14', 'Phénytoïne 14 jours', 'Pas de lésion cérébrale irréversible', '5 molécules cardio-dépressives', 'Inflammation prolongée'],
      searchQueries: ['FIRES mortality cause cardiac arrest', 'phenytoin prolonged infusion cardiotoxicity pediatric', 'polytherapy cardiac depression refractory status epilepticus', 'myocarditis FIRES neuroinflammation', 'troponin monitoring status epilepticus children'],
    })
  }

  // ── 6. TREATMENT TIMING ──
  questions.push({
    id: `RQ-${++qId}`,
    question: 'Quel est le seuil temporel critique pour l\'anakinra dans le FIRES — au-delà duquel l\'efficacité chute significativement ?',
    domain: 'protocol',
    priority: 'high',
    reasoning: 'Les spécialistes internationaux consultés disent "j\'aurais donné l\'anakinra plus tôt". Shrestha 2023 montre que même avec anakinra, aucun patient n\'a retrouvé ses fonctions cognitives. Le timing est-il le facteur déterminant ? Si oui, quel est le seuil : H+24 ? H+48 ? H+72 ?',
    dataPoints: ['Anakinra jamais administré', 'Status epilepticus 14 jours', 'Retard immunothérapie +48h'],
    searchQueries: ['anakinra timing FIRES outcome', 'early vs late immunotherapy refractory status epilepticus', 'IL-1 receptor antagonist FIRES window', 'anakinra pediatric encephalitis timing critical'],
  })

  // ── 7. COMBINED VULNERABILITY MODEL ──
  questions.push({
    id: `RQ-${++qId}`,
    question: 'Le FIRES est-il un syndrome à seuil — nécessitant l\'accumulation de plusieurs facteurs de vulnérabilité (génétiques + néonataux + infectieux + environnementaux) pour se déclencher ?',
    domain: 'etiology',
    priority: 'critical',
    reasoning: 'Alejandro cumule : prématurité, terrain drépanocytaire, thrombopénie néonatale, TÉGÉLINE, phénotype métis (vit D ?), troubles digestifs récents, rhinopharyngite, MEOPA. Aucun de ces facteurs seul ne cause le FIRES. Mais la conjonction de tous crée-t-elle un profil de vulnérabilité cumulatif ? Si oui, peut-on calculer un score de risque pré-FIRES ?',
    dataPoints: ['Prématurité', 'Drépanocytose', 'Thrombopénie néonatale', 'TÉGÉLINE', 'Troubles digestifs', 'Rhinopharyngite', 'MEOPA', 'Phénotype métis'],
    searchQueries: ['FIRES risk factors cumulative model', 'multi-hit hypothesis neuroinflammation pediatric', 'febrile seizure susceptibility genetic environmental', 'FIRES prediction score risk stratification'],
  })

  return questions
}

// ── Cross-Reference Generator ──
// Finds connections between patient factors

export function generateCrossReferences(ps: PatientState): CrossReference[] {
  const refs: CrossReference[] = []

  refs.push({
    factorA: 'Troubles digestifs récents',
    factorB: 'Hypothèse endotoxine (Sonigo)',
    relationship: 'Les troubles digestifs peuvent refléter une perméabilité intestinale accrue → translocation d\'endotoxines (LPS) → activation NLRP3 → IL-1β → neuroinflammation',
    strength: 'moderate',
    source: 'Lin & Hsu 2021 (inflammasome NLRP3/IL-1β dans FIRES)',
    implication: 'Doser LPS-binding protein (LBP) chez tout enfant fébrile avec troubles digestifs + signes neuro',
  })

  refs.push({
    factorA: 'Prématurité + TÉGÉLINE néonatale',
    factorB: 'FIRES à 6 ans',
    relationship: 'La maturation immunitaire altérée par la prématurité + l\'immunomodulation néonatale par IVIG a pu créer un profil immunitaire vulnérable qui ne se manifeste que sous stress inflammatoire majeur',
    strength: 'weak',
    source: 'Hypothèse PULSAR — à investiguer',
    implication: 'Suivi immunologique à long terme des prématurés traités par IVIG néonatales',
  })

  refs.push({
    factorA: 'MEOPA (N2O)',
    factorB: 'Prodrome FIRES (neuroinflammation latente)',
    relationship: 'Le N2O abaisse le seuil convulsif (hypoxie transitoire + dépression SNC). Sur un cerveau en neuroinflammation latente (prodrome FIRES), il peut déclencher la cascade convulsive auto-entretenue.',
    strength: 'moderate',
    source: 'Zier 2010, ANSM 2016, van Baalen 2023',
    implication: 'Contre-indication MEOPA chez tout enfant fébrile avec signes neurologiques',
  })

  refs.push({
    factorA: 'Phénytoïne 14 jours + cocktail 5 molécules',
    factorB: 'Arrêt cardiaque (pas de lésion cérébrale irréversible)',
    relationship: 'La cardiotoxicité cumulative (phénytoïne + midazolam + sufentanil + phénobarbital + kétamine) sur un myocarde fragilisé par 14 jours d\'inflammation systémique a probablement contribué à l\'arrêt cardiaque.',
    strength: 'strong',
    source: 'Glauser 2016, Yale SE Algorithm 2023, RCP Dilantin',
    implication: 'Switch phénytoïne → lévétiracétam + monitoring cardiaque (troponine + écho q48h) obligatoire',
  })

  refs.push({
    factorA: 'Terrain drépanocytaire',
    factorB: 'Vulnérabilité endothéliale cérébrale',
    relationship: 'Le trait drépanocytaire, même chez les porteurs sains, est associé à une dysfonction endothéliale subtile. Cela pourrait faciliter la rupture de la barrière hémato-encéphalique (BHE) et l\'entrée des endotoxines/cytokines dans le SNC.',
    strength: 'weak',
    source: 'Hypothèse PULSAR — littérature drépanocytose + BHE à investiguer',
    implication: 'Inclure le statut hémoglobinique dans l\'évaluation de risque neuro-inflammatoire',
  })

  refs.push({
    factorA: 'Endotoxines intestinales (LPS)',
    factorB: 'Inflammasome NLRP3 / IL-1β',
    relationship: 'Les LPS bactériens activent le TLR4 → NLRP3 → caspase-1 → IL-1β mature → neuroinflammation. C\'est le même axe que celui impliqué dans le FIRES (Lin & Hsu 2021). Le lien intestin→cerveau pourrait être le mécanisme déclencheur manquant.',
    strength: 'strong',
    source: 'Lin & Hsu 2021, Costagliola 2022, littérature axe intestin-cerveau',
    implication: 'L\'anakinra (anti-IL-1) agirait sur le bon axe si l\'hypothèse endotoxine est correcte → renforce le rationnel pour l\'anakinra précoce',
  })

  return refs
}

// ── Research Lab Runner ──
// Executes a full research session

export async function runResearchLab(ps: PatientState): Promise<ResearchSession> {
  const sessionId = `RSRCH-${Date.now()}`
  const questions = generateResearchQuestions(ps)
  const crossRefs = generateCrossReferences(ps)

  // Generate initial hypotheses from cross-references
  const hypotheses: ResearchHypothesis[] = [
    {
      id: 'H-001',
      title: 'Hypothèse "Axe intestin-cerveau" dans le FIRES',
      description: 'Les troubles digestifs pré-FIRES reflètent une translocation d\'endotoxines (LPS) qui activent l\'inflammasome NLRP3 → IL-1β → neuroinflammation → abaissement du seuil convulsif. Le MEOPA (hypoxie transitoire) agit comme déclencheur final sur un cerveau déjà vulnérable.',
      confidence: 45,
      evidenceFor: ['Lin & Hsu 2021 (NLRP3/IL-1β dans FIRES)', 'Costagliola 2022 (efficacité anakinra anti-IL-1)', 'Troubles digestifs documentés pré-FIRES', 'Hypothèse Sonigo (endotoxines intestinales)'],
      evidenceAgainst: ['Pas d\'étude directe LPS → FIRES', 'Corrélation ≠ causalité', 'Petites cohortes FIRES'],
      status: 'investigating',
      implications: 'Si confirmé : (1) doser LBP/endotoxines en routine chez enfant fébrile, (2) protéger la BHE, (3) anakinra précoce rationnellement justifié, (4) molécule anti-endotoxine (Abionyx) potentiellement curative',
      sourceQuestion: 'RQ-4',
    },
    {
      id: 'H-002',
      title: 'Hypothèse "Vulnérabilité cumulée" — FIRES comme syndrome à seuil',
      description: 'Le FIRES ne se déclenche que lorsqu\'un nombre suffisant de facteurs de vulnérabilité sont réunis simultanément : terrain génétique (hémoglobinopathie, HLA ?) + fragilité néonatale (prématurité, immunomodulation précoce) + infection récente + facteur déclenchant (MEOPA, hyperthermie). Aucun facteur seul ne suffit.',
      confidence: 55,
      evidenceFor: ['Rareté du FIRES (~1/1M) malgré fréquence des infections fébriles', 'Profil multi-factoriel d\'Alejandro', 'Modèle multi-hit en neurologie (SEP, Parkinson)'],
      evidenceAgainst: ['Pas de validation statistique', 'Biais de sélection sur un seul cas', 'Facteurs non mesurés'],
      status: 'generated',
      implications: 'Si confirmé : (1) score de risque pré-FIRES calculable, (2) prévention ciblée chez enfants à haut risque, (3) dépistage néonatal enrichi',
      sourceQuestion: 'RQ-9',
    },
    {
      id: 'H-003',
      title: 'Hypothèse "Mort cardiaque iatrogène" dans le FIRES',
      description: 'Une proportion significative des décès dans le FIRES est due non pas à la maladie neurologique elle-même mais à la cardiotoxicité cumulative des traitements (phénytoïne + polythérapie sédative) sur un myocarde fragilisé par l\'inflammation systémique prolongée.',
      confidence: 60,
      evidenceFor: ['Alejandro : arrêt cardiaque sans lésion cérébrale irréversible', 'Cardiotoxicité documentée phénytoïne (Glauser 2016)', 'Pas de monitoring cardiaque systématique dans les protocoles FIRES', 'Myocardite infraclinique possible (Sakuma 2019)'],
      evidenceAgainst: ['Un seul cas documenté', 'Cause multifactorielle probable', 'Pas de troponine disponible pour confirmer'],
      status: 'investigating',
      implications: 'Si confirmé : (1) monitoring cardiaque obligatoire dans FIRES (troponine + écho q48h), (2) switch phénytoïne → lévétiracétam en standard, (3) réduction proactive de la polythérapie sédative, (4) potentiellement des vies sauvées immédiatement',
      sourceQuestion: 'RQ-7',
    },
  ]

  // Insights derived from cross-referencing
  const insights = [
    'L\'axe endotoxines intestinales → NLRP3 → IL-1β est le même axe que celui ciblé par l\'anakinra. Si l\'hypothèse Sonigo est correcte, l\'anakinra n\'est pas juste un traitement symptomatique — il agit sur le mécanisme étiologique.',
    'Le partenariat Abionyx/SEBIA sur le diagnostic du sepsis (dosage endotoxines) pourrait être directement applicable au dépistage pré-FIRES : un enfant fébrile avec endotoxines élevées + marqueurs inflammatoires + signes digestifs = alerte.',
    'La convergence entre le terrain drépanocytaire (dysfonction endothéliale) et l\'hypothèse endotoxine (translocation LPS) suggère que la BHE de ces enfants est plus perméable, facilitant l\'entrée des médiateurs inflammatoires dans le SNC.',
    'Le MEOPA comme déclencheur final dans un modèle multi-hit : le N2O n\'est pas la cause du FIRES mais le "dernier domino" chez un enfant dont le seuil convulsif est déjà abaissé par l\'accumulation de facteurs.',
    'Question pour Pierre Sonigo : ses marqueurs d\'endotoxines ont-ils été mesurés chez des enfants avec FIRES ou status epilepticus fébrile ? Si oui, les niveaux étaient-ils élevés AVANT les premières convulsions ?',
  ]

  return {
    sessionId,
    patientAnonId: 'PULSAR-000',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    questions,
    hypotheses,
    crossReferences: crossRefs,
    insights,
    status: 'completed',
  }
}
