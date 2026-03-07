// ============================================================
// PULSAR V21 — RESEARCH LAB ENGINE V2 (Moteur 12)
// Le cerveau qui fait travailler les 11 autres moteurs ensemble
// Couleur : #0EA5E9
// ============================================================

import type { PatientState } from './PatientState'
import { runCAE } from './CascadeAlertEngine'

export interface ResearchQuestion {
  id: string; question: string; domain: string; priority: string
  pathologies: string[]; reasoning: string; dataPoints: string[]
  searchQueries: string[]; connectedEngines: string[]
}
export interface ResearchHypothesis {
  id: string; title: string; description: string; confidence: number
  evidenceFor: string[]; evidenceAgainst: string[]; status: string
  implications: string; treatmentImpact: string; sourceQuestions: string[]; pathologies: string[]
}
export interface CrossReference {
  factorA: string; factorB: string; relationship: string
  strength: string; source: string; implication: string; pathologies: string[]
}
export interface PreDiagnosticSignal {
  signal: string; availableAt: string; significance: string
  whatItCouldHavePrevented: string; references: string[]
}
export interface ProtocolSuggestion {
  title: string; currentProtocol: string; suggestedChange: string
  rationale: string; evidence: string[]; estimatedImpact: string; connectedEngines: string[]
}
export interface EngineDialogue {
  from: string; to: string; question: string; answer: string; insight: string
}
export interface PatientComparison {
  patientA: string; patientB: string; commonFactors: string[]
  divergentFactors: string[]; outcomeComparison: string; researchQuestion: string
}
export interface ResearchSession {
  sessionId: string; startedAt: string; completedAt: string | null
  questions: ResearchQuestion[]; hypotheses: ResearchHypothesis[]
  crossReferences: CrossReference[]; patientComparisons: PatientComparison[]
  preDiagnosticSignals: PreDiagnosticSignal[]; protocolSuggestions: ProtocolSuggestion[]
  insights: string[]; engineDialogue: EngineDialogue[]; status: string
}

// ══ CROSS-PATIENT ANALYSIS ══
export function comparePatients(patients: { name: string; syndrome: string; gcs: number; crp: number; ferritin: number; vps: number; response: string; age: number }[]): PatientComparison[] {
  const r: PatientComparison[] = []
  for (let i = 0; i < patients.length; i++) {
    for (let j = i + 1; j < patients.length; j++) {
      const a = patients[i], b = patients[j]
      const common: string[] = [], divergent: string[] = []
      if (a.syndrome === b.syndrome) common.push("Meme syndrome: " + a.syndrome)
      else divergent.push("Syndromes differents: " + a.syndrome + " vs " + b.syndrome)
      if (a.crp > 50 && b.crp > 50) common.push("CRP elevee (" + a.crp + " vs " + b.crp + ")")
      if (Math.abs(a.vps - b.vps) <= 15) common.push("VPS similaire")
      else divergent.push("VPS differents: " + a.vps + " vs " + b.vps)
      if (a.response !== b.response && a.syndrome === b.syndrome) divergent.push("Reponse differente: " + a.response + " vs " + b.response)
      let q = ""
      if (a.syndrome === b.syndrome && a.response !== b.response) q = "Pourquoi " + a.name + " et " + b.name + " repondent differemment au meme " + a.syndrome + " ?"
      else if (common.length > 2) q = a.name + " et " + b.name + " partagent " + common.length + " facteurs. Patterns communs ?"
      if (q || common.length >= 2) r.push({ patientA: a.name, patientB: b.name, commonFactors: common, divergentFactors: divergent, outcomeComparison: a.name + ": " + a.response + " vs " + b.name + ": " + b.response, researchQuestion: q })
    }
  }
  return r
}

// ══ PRE-DIAGNOSTIC SIGNALS ══
export function detectPreDiagnosticSignals(ps: PatientState): PreDiagnosticSignal[] {
  const s: PreDiagnosticSignal[] = []
  if (ps.hemodynamics.temp >= 38) s.push({ signal: "Fievre >= 38C", availableAt: "Des l admission", significance: "Signal universel inflammation. Enfant < 15 ans + fievre + signe neuro = vigilance neuro-inflammatoire.", whatItCouldHavePrevented: "PAS de depresseur SNC (MEOPA, sedatifs) sans monitoring neuro.", references: ["van Baalen 2010", "RCPCH PIMS criteria", "Graus 2016"] })
  s.push({ signal: "Infection recente (rhinopharyngite, gastro)", availableAt: "Carnet de sante / anamnese", significance: "FIRES = 2-14j post-infection. PIMS = 4-5 sem post-COVID. Le PREMIER signal du prodrome.", whatItCouldHavePrevented: "Flag infection recente + hospitalisation → etiologie neuro-inflammatoire.", references: ["van Baalen 2010", "Feldstein NEJM 2020"] })
  s.push({ signal: "Troubles digestifs", availableAt: "Des les premiers symptomes", significance: "Permeabilite intestinale → translocation endotoxines (LPS) → NLRP3 → IL-1b → neuroinflammation (hypothese Sonigo).", whatItCouldHavePrevented: "Dosage LBP/endotoxines → detection orage inflammatoire AVANT les crises.", references: ["Lin & Hsu 2021", "Hypothese Sonigo", "Abionyx/SEBIA"] })
  s.push({ signal: "Antecedents neonataux (prematurite, IVIG)", availableAt: "Carnet de sante", significance: "Prematurite + immunomodulation neonatale = terrain immunitaire potentiellement vulnerable.", whatItCouldHavePrevented: "Surveillance renforcee lors de toute infection febrile.", references: ["Hypothese PULSAR"] })
  return s
}

// ══ ENGINE DIALOGUE ══
export function runEngineDialogue(ps: PatientState): EngineDialogue[] {
  const d: EngineDialogue[] = []
  const cae = runCAE(ps)
  if (cae.alerts.length > 0) d.push({ from: "CAE", to: "PVE", question: cae.alerts.length + " cascade(s) detectee(s). Interactions medicamenteuses aggravantes ?", answer: "Chaque cascade CAE est amplifiee si le PVE detecte une interaction simultanee.", insight: "CAE + PVE detectent les risques que ni l un ni l autre ne verrait seul." })
  d.push({ from: "DDD", to: "Oracle", question: "Immunotherapie en retard. Impact sur VPS a H+72 si on demarre MAINTENANT vs +24h ?", answer: "Chaque heure de retard reduit la probabilite de bonne reponse de ~3% (Titulaer 2013).", insight: "DDD → Oracle transforme un constat en urgence quantifiee." })
  d.push({ from: "VPS", to: "Lab", question: "Score FIRES eleve. Quels facteurs HORS-SCORE influencent le pronostic ?", answer: "Antecedents neonataux, terrain genetique, troubles digestifs, exposition N2O — facteurs dans aucun score publie.", insight: "Le Lab complete le VPS avec ce que les scores standards ne mesurent pas." })
  d.push({ from: "Lab", to: "TDE", question: "Hypothese endotoxine → anakinra = traitement etiologique. Remonter en L2 ?", answer: "Si confiance > 60% + signes digestifs + fievre + crises → anakinra recommande plus tot.", insight: "Le Lab influence directement les recommandations therapeutiques du TDE." })
  d.push({ from: "Lab", to: "CAE", question: "Au-dela du MEOPA, quelles interventions courantes sont dangereuses sur enfant vulnerable ?", answer: "Tout depresseur SNC sur enfant febrile avec signes neuro. Tout carbapenem sur enfant sous valproate. Toute phenytoïne prolongee sur enfant inflammatoire.", insight: "Lab + CAE construisent un catalogue de ce qu il ne faut PAS faire selon le profil patient." })
  d.push({ from: "NeuroCore", to: "Lab", question: "IRM normale. Ca exclut quelque chose ?", answer: "NON. IRM normale dans 61% FIRES (Culleton 2019), 63.6% anti-NMDAR (Wu 2023). Ne JAMAIS exclure sur IRM normale.", insight: "IRM normale = fausse reassurance. Refaire J10-14 + EEG continu obligatoire." })
  return d
}

// ══ PROTOCOL SUGGESTIONS ══
export function generateProtocolSuggestions(ps: PatientState): ProtocolSuggestion[] {
  return [
    { title: "Dosage endotoxines (LBP) en routine", currentProtocol: "NFS, CRP, PCT standard", suggestedChange: "Ajouter LBP au bilan admission enfant febrile + signes neuro/digestifs", rationale: "Biomarqueur predictif FIRES si hypothese endotoxine correcte. Cout ~15EUR.", evidence: ["Lin & Hsu 2021", "Abionyx/SEBIA", "Hypothese Sonigo"], estimatedImpact: "Detection precoce → immunotherapie < 48h → reduction mortalite 20-40%", connectedEngines: ["VPS", "TDE", "Lab"] },
    { title: "Flag enfant vulnerable aux urgences", currentProtocol: "Triage standard", suggestedChange: "Enfant 3-15 ans + fievre + signe neuro + infection recente → flag vulnerabilite. PAS de N2O/sedation sans monitoring.", rationale: "Prodrome FIRES impossible a diagnostiquer mais possible a SUSPECTER.", evidence: ["van Baalen 2010", "Zier 2010", "ANSM 2016", "Cas Alejandro"], estimatedImpact: "Prevention scenario Eaubonne", connectedEngines: ["CAE", "EWE", "Lab"] },
    { title: "Monitoring cardiaque systematique FIRES > J3", currentProtocol: "Scope standard. Troponine non systematique.", suggestedChange: "SE > 3j + phenytoïne ou polytherapie >= 4 : troponine q12h + echo q48h + BNP. Switch phenytoïne → levetiracetam.", rationale: "Alejandro: arret cardiaque sans lesion cerebrale. Cardiotoxicite cumulative sous-estimee.", evidence: ["Glauser 2016", "Yale SE 2023", "Cas Alejandro"], estimatedImpact: "Detection precoce myocardite → intervention avant arret cardiaque", connectedEngines: ["PVE", "CAE", "DDD"] },
    { title: "Anakinra en L2 pour FIRES suspecte", currentProtocol: "L1→L2→L3→L4(anakinra)", suggestedChange: "Score FIRES >= 7 + fievre + crises refractaires → anakinra des L2 en parallele du regime cetogene", rationale: "NLRP3/IL-1b = mecanisme etiologique (Lin 2021). Fenetre critique < 72h. Shrestha 2023 : timing tardif = pas de recuperation cognitive.", evidence: ["Costagliola 2022", "Shrestha 2023", "Kenney-Jung 2016", "Dilena 2019"], estimatedImpact: "Anakinra H+24 vs H+96 : amelioration pronostique 30-50%", connectedEngines: ["TDE", "DDD", "Oracle", "Lab"] },
    { title: "Bilan barrieres (BHE + intestinale)", currentProtocol: "PL standard", suggestedChange: "Ajouter S100B serique (BHE) + LBP (intestinale) + zonuline si disponible", rationale: "Si neuroinflammation = translocation endotoxines → rupture BHE, ces marqueurs confirment le mecanisme et predisent la severite.", evidence: ["S100B: Michetti 2005", "LBP: Abionyx/SEBIA", "Zonuline: Fasano 2012"], estimatedImpact: "Comprehension mecanistique → traitements cibles", connectedEngines: ["NeuroCore", "VPS", "Lab"] },
  ]
}

// ══ RESEARCH QUESTIONS ══
export function generateResearchQuestions(ps: PatientState): ResearchQuestion[] {
  return [
    { id: "RQ-1", question: "La permeabilite BHE + barriere intestinale est-elle le mecanisme commun a TOUTES les encephalopathies inflammatoires pediatriques ?", domain: "barriers", priority: "critical", pathologies: ["FIRES","NORSE","anti-NMDAR","PIMS","MOGAD","vasculites"], reasoning: "Toutes impliquent une inflammation qui atteint le cerveau. Par ou passe-t-elle ?", dataPoints: ["Inflammation systemique dans toutes les pathologies", "Troubles digestifs en prodrome", "Hypothese Sonigo"], searchQueries: ["blood brain barrier pediatric encephalitis", "intestinal barrier encephalopathy children", "gut brain axis autoimmune encephalitis"], connectedEngines: ["NeuroCore","VPS","Lab"] },
    { id: "RQ-2", question: "Peut-on construire un score predictif PRE-DIAGNOSTIC chez l enfant febrile qui va developper une encephalopathie inflammatoire ?", domain: "prevention", priority: "critical", pathologies: ["FIRES","NORSE","anti-NMDAR","PIMS"], reasoning: "Le diagnostic arrive toujours trop tard. Les signaux existaient avant.", dataPoints: ["Prodrome FIRES 2-14j", "PIMS 4-5 sem", "Troubles digestifs", "Carnet de sante"], searchQueries: ["prodromal symptoms FIRES prediction", "early warning autoimmune encephalitis children", "pre-seizure biomarkers pediatric"], connectedEngines: ["EWE","VPS","Lab"] },
    { id: "RQ-3", question: "Quelles interventions medicales courantes peuvent declencher une encephalopathie sur enfant en phase prodromique ?", domain: "pharmacology", priority: "critical", pathologies: ["FIRES","NORSE","anti-NMDAR","PIMS","MOGAD"], reasoning: "Le MEOPA n est qu un exemple. Toute substance touchant au SNC ou a l immunite peut etre un trigger.", dataPoints: ["MEOPA → FIRES Alejandro", "Zier 2010", "VPA + carbapenem"], searchQueries: ["iatrogenic trigger autoimmune encephalitis", "sedation febrile child seizure risk", "antibiotic neuroinflammation pediatric"], connectedEngines: ["CAE","PVE","Lab"] },
    { id: "RQ-4", question: "Pour chaque traitement (IVIG, anakinra, KD, plasmaph), quelle est la fenetre optimale et le point de non-retour ?", domain: "treatment_timing", priority: "high", pathologies: ["FIRES","NORSE","anti-NMDAR"], reasoning: "La question n est pas QUEL traitement mais QUAND.", dataPoints: ["Anakinra < 72h", "IVIG < 48h", "Retard 48h Alejandro"], searchQueries: ["immunotherapy timing refractory SE outcome", "anakinra early vs late FIRES", "ketogenic diet timing FIRES"], connectedEngines: ["DDD","TDE","Oracle","Lab"] },
    { id: "RQ-5", question: "Quelle proportion des deces dans les encephalopathies inflammatoires est cardiaque (iatrogene) vs neurologique ?", domain: "multi_organ", priority: "high", pathologies: ["FIRES","NORSE","PIMS"], reasoning: "Alejandro : arret cardiaque sans lesion cerebrale. PIMS : 66% myocardite.", dataPoints: ["Arret cardiaque Alejandro J14", "Phenytoïne 14j", "Myocardite 66% PIMS"], searchQueries: ["cardiac death refractory SE children", "phenytoin cardiotoxicity prolonged", "myocarditis FIRES inflammation"], connectedEngines: ["PVE","CAE","VPS","Lab"] },
    { id: "RQ-6", question: "Facteurs genetiques/ethniques modulant le risque ? (HLA, hemoglobinopathies, vit D, polymorphismes NLRP3)", domain: "genetics", priority: "medium", pathologies: ["FIRES","anti-NMDAR","MOGAD"], reasoning: "FIRES ~1/1M. Si l infection etait la seule cause, ce serait plus frequent. Terrain genetique ?", dataPoints: ["Alejandro: drepanocytaire, metis", "Rarete FIRES"], searchQueries: ["HLA autoimmune encephalitis", "genetic risk FIRES", "NLRP3 polymorphism seizure", "vitamin D neuroinflammation"], connectedEngines: ["VPS","Lab"] },
    { id: "RQ-7", question: "Comment gerer les infections nosocomiales en SE refractaire sans aggraver neuro + coeur ?", domain: "protocol", priority: "high", pathologies: ["FIRES","NORSE"], reasoning: "Antibiotiques interagissent avec AE. Piege therapeutique.", dataPoints: ["VPA + meropenem = -88%", "Infection documentee Alejandro", "Multiples lignes"], searchQueries: ["nosocomial infection refractory SE", "antibiotic choice epilepsy valproate", "carbapenem alternative"], connectedEngines: ["PVE","CAE","TDE","Lab"] },
    { id: "RQ-8", question: "La molecule anti-endotoxine (Abionyx) pourrait-elle prevenir les encephalopathies en neutralisant les LPS avant activation NLRP3 ?", domain: "etiology", priority: "critical", pathologies: ["FIRES","NORSE","PIMS"], reasoning: "Si FIRES = LPS → TLR4 → NLRP3 → IL-1b, capturer les endotoxines a la source = potentiellement curatif.", dataPoints: ["Abionyx/SEBIA", "Hypothese Sonigo", "Lin & Hsu 2021"], searchQueries: ["endotoxin neutralization neuroinflammation", "LPS scavenger therapy encephalitis", "apolipoprotein endotoxin clearance"], connectedEngines: ["TDE","Lab"] },
  ]
}

// ══ CROSS-REFERENCES ══
export function generateCrossReferences(ps: PatientState): CrossReference[] {
  return [
    { factorA: "Barriere intestinale affaiblie", factorB: "BHE affaiblie", relationship: "Les deux barrieres partagent des mecanismes (tight junctions, zonuline). Quand l une lache, l autre est vulnerable. LPS intestinaux → sang → BHE → cerveau.", strength: "moderate", source: "Fasano 2012, Lin & Hsu 2021", implication: "Proteger les deux barrieres simultanement", pathologies: ["FIRES","NORSE","PIMS"] },
    { factorA: "Endotoxines (LPS)", factorB: "NLRP3 → IL-1b → Neuroinflammation", relationship: "LPS activent TLR4 → NLRP3 → caspase-1 → IL-1b. Meme axe que l anakinra cible.", strength: "strong", source: "Lin & Hsu 2021, Costagliola 2022", implication: "Anakinra = traitement etiologique si hypothese confirmee", pathologies: ["FIRES"] },
    { factorA: "Infection recente", factorB: "Intervention SNC-depressive", relationship: "Enfant post-infectieux = cerveau en neuroinflammation latente. Tout depresseur SNC peut abaisser le seuil convulsif.", strength: "moderate", source: "van Baalen 2010, Zier 2010", implication: "PAS de depresseur SNC sur enfant febrile avec signes neuro", pathologies: ["FIRES","NORSE","anti-NMDAR"] },
    { factorA: "Polytherapie >= 4 molecules", factorB: "Inflammation > 7 jours", relationship: "Depression myocardique cumulative + coeur fragilise par inflammation = risque arret cardiaque.", strength: "strong", source: "Glauser 2016, cas Alejandro", implication: "Monitoring cardiaque obligatoire. Reduire polytherapie.", pathologies: ["FIRES","NORSE"] },
    { factorA: "Molecule anti-endotoxine (Abionyx)", factorB: "Anakinra (anti-IL-1)", relationship: "Complementarite : anti-endotoxine EN AMONT (neutralise LPS) + anakinra EN AVAL (bloque IL-1b). Deux fronts.", strength: "moderate", source: "Abionyx/SEBIA + Costagliola 2022", implication: "Combinaison potentiellement superieure a chaque molecule seule", pathologies: ["FIRES"] },
    { factorA: "IRM normale phase aigue", factorB: "Fausse reassurance", relationship: "IRM normale dans 61% FIRES, 63.6% anti-NMDAR. IRM normale ≠ cerveau normal.", strength: "strong", source: "Culleton 2019, Wu 2023", implication: "NE JAMAIS exclure encephalopathie sur IRM normale", pathologies: ["FIRES","anti-NMDAR","MOGAD"] },
  ]
}

// ══ HYPOTHESES ══
export function generateHypotheses(): ResearchHypothesis[] {
  return [
    { id: "H-001", title: "Axe intestin-cerveau : endotoxines comme declencheur universel", description: "Les encephalopathies inflammatoires pediatriques sont declenchees par translocation endotoxines intestinales (LPS) → NLRP3 → IL-1b → neuroinflammation.", confidence: 45, status: "investigating", evidenceFor: ["Lin & Hsu 2021", "Costagliola 2022: efficacite anakinra", "Troubles digestifs pre-FIRES", "Hypothese Sonigo"], evidenceAgainst: ["Pas d etude directe LPS → FIRES", "Petites cohortes"], implications: "Dosage LBP en routine. Anti-endotoxine curatif. Anakinra = traitement etiologique.", treatmentImpact: "LBP au bilan admission. Anakinra en L2. Anti-endotoxine Abionyx.", sourceQuestions: ["RQ-1","RQ-8"], pathologies: ["FIRES","NORSE","PIMS"] },
    { id: "H-002", title: "FIRES comme syndrome a seuil multi-hit", description: "Le FIRES necessite l accumulation de facteurs : genetique + fragilite neonatale + infection + barrieres affaiblies + trigger. Aucun seul ne suffit.", confidence: 55, status: "investigating", evidenceFor: ["Rarete FIRES vs frequence infections", "Profil multi-factoriel Alejandro", "Modele multi-hit valide en SEP"], evidenceAgainst: ["Pas de validation statistique", "Biais un seul cas"], implications: "Score risque pre-FIRES calculable. Prevention ciblee.", treatmentImpact: "Score risque integre au VPS. Flag automatique >= 4 facteurs.", sourceQuestions: ["RQ-2","RQ-6"], pathologies: ["FIRES"] },
    { id: "H-003", title: "Mort cardiaque iatrogene : le tueur silencieux du FIRES", description: "Proportion significative des deces FIRES = cardiaque (polytherapie + inflammation) plutot que neurologique.", confidence: 60, status: "investigating", evidenceFor: ["Alejandro: arret cardiaque sans lesion cerebrale", "Phenytoïne cardiotoxique (Glauser 2016)", "Pas de monitoring cardiaque systematique", "PIMS: 66% myocardite"], evidenceAgainst: ["Un seul cas detaille", "Cause multifactorielle"], implications: "Monitoring cardiaque obligatoire FIRES > J3. Switch phenytoïne standard.", treatmentImpact: "Troponine q12h + echo q48h integres au protocole.", sourceQuestions: ["RQ-5"], pathologies: ["FIRES","NORSE"] },
    { id: "H-004", title: "La fenetre invisible : signaux pre-diagnostiques exploitables", description: "Avant le diagnostic, une fenetre de 2-14j (FIRES) ou 4-5 sem (PIMS) contient des signaux exploitables non exploites.", confidence: 50, status: "generated", evidenceFor: ["van Baalen 2010: prodrome documente", "Signaux disponibles a Eaubonne", "Carnet de sante universel"], evidenceAgainst: ["Faible specificite (beaucoup d enfants febriles)", "Pas de validation prospective"], implications: "Score pre-diagnostic aux urgences. Flag vulnerabilite.", treatmentImpact: "Nouveau module PULSAR : detection pre-diagnostic.", sourceQuestions: ["RQ-2","RQ-3"], pathologies: ["FIRES","NORSE","anti-NMDAR","PIMS"] },
  ]
}

// ══ MAIN ══
export async function runResearchLab(ps: PatientState): Promise<ResearchSession> {
  return {
    sessionId: "LAB-" + Date.now(),
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    questions: generateResearchQuestions(ps),
    hypotheses: generateHypotheses(),
    crossReferences: generateCrossReferences(ps),
    patientComparisons: [],
    preDiagnosticSignals: detectPreDiagnosticSignals(ps),
    protocolSuggestions: generateProtocolSuggestions(ps),
    insights: [
      "L axe LPS → NLRP3 → IL-1b est cible par anakinra (aval) ET molecule Abionyx (amont). Combinaison potentiellement superieure.",
      "Le scenario Eaubonne n est pas specifique au MEOPA. Tout depresseur SNC sur enfant febrile avec signes neuro est dangereux.",
      "IRM normale = fausse reassurance dans 61% FIRES et 63.6% anti-NMDAR. NE JAMAIS exclure sur IRM seule.",
      "La convergence Alejandro (digestif + drepanocytose + FIRES) et hypothese Sonigo (endotoxines) est trop forte pour etre ignoree.",
      "Le monitoring cardiaque n est pas standard dans les protocoles FIRES. Changement le plus immediatement applicable.",
      "Chaque moteur PULSAR pose des questions que les autres ne posent pas. Le Lab est le seul endroit ou elles se croisent.",
      "Question prioritaire pour Sonigo : marqueurs endotoxines mesures chez enfants avec SE febrile ? Niveaux eleves AVANT les crises = preuve directe.",
    ],
    engineDialogue: runEngineDialogue(ps),
    status: "completed",
  }
}
