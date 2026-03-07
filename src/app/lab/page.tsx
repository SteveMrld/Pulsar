'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
import Picto from "@/components/Picto";

/**
 * PULSAR Research Lab — V2
 * Premium single-file TSX page for /lab
 * - Dark mode only
 * - Tailwind utility classes only
 * - Integrated CSS animations
 * - No external icon or animation library
 * - Public page, API-ready
 */

type SessionSummary = {
  patientsAnalyzed: number;
  hypotheses: number;
  crossReferences: number;
  pubmedArticles: number;
  insights: number;
  protocolSuggestions: number;
  durationMs: number;
  lastSessionDate: string;
  status: "idle" | "running" | "completed";
  phases: string[];
};

type Hypothesis = {
  id: string;
  title: string;
  description: string;
  confidence: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  status: "En investigation" | "Générée" | "Supportée" | "Réfutée";
  implications: string;
  treatmentImpact: string;
  pathologies: string[];
  history: number[];
};

type CrossReference = {
  factorA: string;
  factorB: string;
  relation: string;
  strength: "Strong" | "Moderate" | "Weak";
  source: string;
  clinicalImplication: string;
  pathologies: string[];
};

type ResearchQuestion = {
  text: string;
  domain: string;
  priority: "critique" | "haute" | "moyenne" | "exploratoire";
  reasoning: string;
  pubmedQueries: string[];
  connectedMotors: string[];
};

type PreDiagnosticSignal = {
  signal: string;
  availableWhen: string;
  meaning: string;
  whatItCouldPrevent: string;
  offset: number;
};

type ProtocolSuggestion = {
  title: string;
  currentVsSuggested: string;
  rationale: string;
  estimatedImpact: string;
};

type EngineDialogue = {
  from: string;
  to: string;
  question: string;
  answer: string;
  insight: string;
};

type PubMedArticle = {
  title: string;
  authors: string;
  journal: string;
  date: string;
  pmid: string;
  searchTerm: string;
};

type ResearchLabData = {
  sessionSummary: SessionSummary;
  hypotheses: Hypothesis[];
  crossReferences: CrossReference[];
  researchQuestions: ResearchQuestion[];
  preDiagnosticSignals: PreDiagnosticSignal[];
  protocolSuggestions: ProtocolSuggestion[];
  engineDialogs: EngineDialogue[];
  pubmedArticles: PubMedArticle[];
  insights: string[];
};

const COLORS = {
  bg: "#0C1424",
  card: "#111827",
  surface: "#1A2035",
  text: "#F0F2F5",
  textSecondary: "#9CA3AF",
  textDim: "#6B7280",
  border: "#1F2A40",
  lab: "#0EA5E9",
  success: "#2ED573",
  danger: "#DC2626",
  gold: "#F5A623",
  pathology: {
    FIRES: "#FF6B35",
    NORSE: "#6C7CFF",
    "anti-NMDAR": "#E879F9",
    PIMS: "#FFB347",
    MOGAD: "#10B981",
    AE: "#A78BFA",
  } as Record<string, string>,
  motors: {
    VPS: "#6C7CFF",
    TDE: "#2FD1C8",
    PVE: "#B96BFF",
    EWE: "#A78BFA",
    TPE: "#FFB347",
    NeuroCore: "#2ED573",
    Discovery: "#10B981",
    Oracle: "#E879F9",
    DDD: "#DC2626",
    CAE: "#FF6B35",
    FeedbackLoop: "#10B981",
    "Research Lab": "#0EA5E9",
  } as Record<string, string>,
};

const sampleData: ResearchLabData = {
  sessionSummary: {
    patientsAnalyzed: 9,
    hypotheses: 4,
    crossReferences: 6,
    pubmedArticles: 38,
    insights: 7,
    protocolSuggestions: 5,
    durationMs: 24836,
    lastSessionDate: "2026-03-07T03:00:00Z",
    status: "running",
    phases: [
      "Chargement cohorte…",
      "Analyse profils…",
      "Interrogation PubMed…",
      "Croisement temporel…",
      "Formulation hypothèses…",
      "Consolidation inter-moteurs…",
      "Génération des suggestions de protocole…",
    ],
  },
  hypotheses: [
    {
      id: "h1",
      title: "Axe intestin-cerveau : endotoxines comme déclencheur universel",
      description:
        "Le Lab détecte un motif transversal suggérant qu'une altération de la barrière intestinale, combinée à une activation immunitaire systémique, pourrait précéder plusieurs trajectoires inflammatoires cérébrales pédiatriques.",
      confidence: 60,
      evidenceFor: [
        "3 patients avec syndrome infectieux ou digestif en amont",
        "Convergence avec la littérature sur perméabilité intestinale et neuro-inflammation",
        "Signal inflammatoire systémique précoce dans plusieurs cas",
      ],
      evidenceAgainst: [
        "Peu de biomarqueurs intestinaux disponibles dans la cohorte",
        "Lien causal non démontré chez tous les patients",
      ],
      status: "En investigation",
      implications:
        "Justifier un dépistage plus précoce des marqueurs inflammatoires systémiques et digestifs dans les tableaux fébriles à risque neurologique.",
      treatmentImpact:
        "Peut orienter vers une surveillance multi-organes plus précoce et une immunomodulation anticipée.",
      pathologies: ["FIRES", "NORSE", "PIMS"],
      history: [40, 45, 50, 56, 60],
    },
    {
      id: "h2",
      title: "Fenêtre thérapeutique ultra-précoce dans les 12 premières heures",
      description:
        "Les signaux temporels suggèrent qu'une accélération de l'immunothérapie ciblée avant l'escalade électrique pourrait modifier l'intensité de la phase réfractaire.",
      confidence: 55,
      evidenceFor: [
        "Décalage répété entre premiers signaux et traitements ciblés",
        "Littérature compatible sur le timing de l'immunothérapie",
      ],
      evidenceAgainst: [
        "Données incomplètes sur les délais exacts dans certains cas",
      ],
      status: "Supportée",
      implications:
        "Permettrait un protocole d'escalade temporel guidé par le risque plutôt que par la confirmation diagnostique tardive.",
      treatmentImpact:
        "Réduction potentielle du temps vers les thérapies avancées.",
      pathologies: ["FIRES", "anti-NMDAR", "MOGAD"],
      history: [35, 41, 47, 52, 55],
    },
    {
      id: "h3",
      title: "Atteinte multi-organe silencieuse comme marqueur d'orage inflammatoire",
      description:
        "Le couplage entre anomalies cardiaques, biologiques et neurologiques pourrait signaler un sous-phénotype inflammatoire plus sévère nécessitant une coordination accélérée.",
      confidence: 50,
      evidenceFor: [
        "Patterns de défaillance extra-neurologique dans plusieurs trajectoires",
        "Correspondances avec publications sur inflammation systémique pédiatrique",
      ],
      evidenceAgainst: [
        "Spécificité insuffisante sans stratification plus fine",
      ],
      status: "Générée",
      implications:
        "Plaide pour un tableau de bord systémique au-delà du seul EEG.",
      treatmentImpact:
        "Pourrait renforcer la priorisation des bilans cardiaques et inflammatoires.",
      pathologies: ["PIMS", "NORSE"],
      history: [50],
    },
    {
      id: "h4",
      title: "Phénotype auto-immun séronégatif masqué chez les formes FIRES-like",
      description:
        "Une partie des tableaux classés FIRES pourrait correspondre à des encéphalites auto-immunes encore mal captées par les tests standards.",
      confidence: 45,
      evidenceFor: [
        "Discordance entre sérologie négative et réponse clinique aux immunothérapies",
        "Lacunes documentées dans les biomarqueurs standards",
      ],
      evidenceAgainst: [
        "Taille de cohorte faible",
        "Risque de surinterprétation rétrospective",
      ],
      status: "Réfutée",
      implications:
        "Invite à enrichir les panels et à intégrer des scores probabilistes.",
      treatmentImpact:
        "Peut éviter d'exclure trop tôt une piste immunitaire active.",
      pathologies: ["FIRES", "AE"],
      history: [45],
    },
  ],
  crossReferences: [
    {
      factorA: "Fièvre persistante",
      factorB: "Anomalies EEG diffuses",
      relation:
        "Association temporelle répétée avant aggravation neurologique.",
      strength: "Strong",
      source: "Cohorte PULSAR + PubMed",
      clinicalImplication:
        "Renforcer la surveillance EEG en contexte fébrile inhabituel.",
      pathologies: ["FIRES", "NORSE"],
    },
    {
      factorA: "CRP / ferritine élevées",
      factorB: "Détérioration neurologique rapide",
      relation:
        "Possible reflet d'un emballement immunitaire systémique.",
      strength: "Strong",
      source: "Cohorte PULSAR",
      clinicalImplication:
        "Alerte d'escalade thérapeutique plus précoce.",
      pathologies: ["PIMS", "FIRES"],
    },
    {
      factorA: "Séro-négativité",
      factorB: "Réponse partielle aux immunothérapies",
      relation:
        "Suggère une auto-immunité non captée par les panels standards.",
      strength: "Moderate",
      source: "PubMed",
      clinicalImplication:
        "Éviter les faux rassurements biologiques.",
      pathologies: ["AE", "anti-NMDAR"],
    },
    {
      factorA: "Prodromes digestifs",
      factorB: "Tempête inflammatoire",
      relation:
        "Hypothèse barrière intestinale à approfondir.",
      strength: "Moderate",
      source: "Hypothèse Lab",
      clinicalImplication:
        "Ajouter un volet digestif au recueil initial.",
      pathologies: ["FIRES", "PIMS"],
    },
    {
      factorA: "Troubles cardiaques",
      factorB: "Atteinte neurologique sévère",
      relation:
        "Signature possible de syndrome multi-systémique.",
      strength: "Weak",
      source: "Cohorte + littérature",
      clinicalImplication:
        "Coordination réanimation / neurologie / immunologie.",
      pathologies: ["PIMS"],
    },
    {
      factorA: "Retard immunothérapie",
      factorB: "Phase réfractaire prolongée",
      relation:
        "Lien potentiel entre timing et profondeur de réfractarité.",
      strength: "Strong",
      source: "Analyse temporelle Lab",
      clinicalImplication:
        "Créer un seuil d'escalade guidé par le temps.",
      pathologies: ["FIRES", "anti-NMDAR", "MOGAD"],
    },
  ],
  researchQuestions: [
    {
      text: "Une signature inflammatoire digestive précède-t-elle les formes FIRES/NORSE ?",
      domain: "barrières",
      priority: "critique",
      reasoning:
        "Convergence entre prodromes digestifs, inflammation systémique et aggravation neurologique.",
      pubmedQueries: ["FIRES gut brain axis child", "NORSE endotoxin pediatric"],
      connectedMotors: ["Discovery", "NeuroCore", "Oracle"],
    },
    {
      text: "Quel délai maximal tolérable avant immunothérapie ciblée ?",
      domain: "timing",
      priority: "haute",
      reasoning:
        "Le temps semble agir comme multiplicateur du dommage inflammatoire.",
      pubmedQueries: ["autoimmune encephalitis timing pediatric", "FIRES immunotherapy early"],
      connectedMotors: ["TDE", "Discovery"],
    },
    {
      text: "Peut-on construire un score pré-diagnostique combinant fièvre, EEG et biologie ?",
      domain: "prévention",
      priority: "critique",
      reasoning:
        "Plusieurs signaux faibles existaient avant le basculement clinique.",
      pubmedQueries: ["pediatric neuroinflammation early biomarkers"],
      connectedMotors: ["VPS", "CAE", "NeuroCore"],
    },
    {
      text: "Existe-t-il un sous-phénotype multi-organe à prise en charge distincte ?",
      domain: "multi-organe",
      priority: "haute",
      reasoning:
        "Des trajectoires systémiques semblent plus agressives et sous-reconnues.",
      pubmedQueries: ["pediatric multisystem neuroinflammation"],
      connectedMotors: ["CAE", "Oracle"],
    },
    {
      text: "Quels biomarqueurs manquent pour les formes séronégatives ?",
      domain: "génétique",
      priority: "moyenne",
      reasoning:
        "Les tests standards paraissent insuffisants pour certains tableaux.",
      pubmedQueries: ["seronegative autoimmune encephalitis pediatric biomarkers"],
      connectedMotors: ["Discovery", "Oracle"],
    },
    {
      text: "Les anti-inflammatoires ciblés doivent-ils être testés plus tôt ?",
      domain: "pharmacologie",
      priority: "haute",
      reasoning:
        "Des fenêtres d'opportunité thérapeutique pourraient être manquées.",
      pubmedQueries: ["pediatric cytokine storm neuroinflammation treatment"],
      connectedMotors: ["TPE", "Discovery"],
    },
    {
      text: "Quel protocole harmonisé de recueil initial peut réduire le délai diagnostique ?",
      domain: "protocole",
      priority: "critique",
      reasoning:
        "L'hétérogénéité du recueil initial crée des angles morts décisionnels.",
      pubmedQueries: ["pediatric encephalitis protocol emergency"],
      connectedMotors: ["FeedbackLoop", "CAE", "VPS"],
    },
    {
      text: "Quel agent déclencheur commun relie des étiologies a priori distinctes ?",
      domain: "étiologie",
      priority: "exploratoire",
      reasoning:
        "Le Lab cherche un motif universel derrière des entrées cliniques différentes.",
      pubmedQueries: ["shared triggers pediatric neuroinflammation"],
      connectedMotors: ["Discovery", "Oracle", "EWE"],
    },
  ],
  preDiagnosticSignals: [
    {
      signal: "Fièvre ≥ 38°C",
      availableWhen: "Dès l'admission",
      meaning:
        "Alerte inflammatoire non spécifique mais récurrente avant dégradation.",
      whatItCouldPrevent:
        "Retard de surveillance rapprochée et d'escalade initiale.",
      offset: 0,
    },
    {
      signal: "Anomalies EEG diffuses précoces",
      availableWhen: "+ 3 h",
      meaning:
        "Signature d'irritation cérébrale avant réfractarité complète.",
      whatItCouldPrevent:
        "Retard vers décision neuro-intensive.",
      offset: 20,
    },
    {
      signal: "CRP / ferritine élevées",
      availableWhen: "+ 5 h",
      meaning:
        "Possible syndrome inflammatoire systémique associé.",
      whatItCouldPrevent:
        "Sous-estimation du risque multi-organe.",
      offset: 42,
    },
    {
      signal: "Troubles autonomes / cardiaques",
      availableWhen: "+ 9 h",
      meaning:
        "Marqueur d'extension systémique potentiellement grave.",
      whatItCouldPrevent:
        "Retard de coordination avec réanimation et cardiologie.",
      offset: 76,
    },
  ],
  protocolSuggestions: [
    {
      title: "Voie d'escalade immunitaire guidée par le temps",
      currentVsSuggested:
        "Actuel : attendre confirmation robuste. Suggéré : seuil d'escalade probabiliste à H+6 / H+12 selon score de risque.",
      rationale:
        "Le Lab observe une dérive défavorable quand la décision est indexée trop tard sur la certitude diagnostique.",
      estimatedImpact:
        "Réduction potentielle du temps vers traitement ciblé.",
    },
    {
      title: "Bundle d'entrée multi-système neuro-inflammatoire",
      currentVsSuggested:
        "Actuel : bilan centré neuro. Suggéré : intégration immédiate EEG + inflammation + cardio + digestif.",
      rationale:
        "Plusieurs signaux utiles étaient dispersés et non lus ensemble.",
      estimatedImpact:
        "Vision plus précoce de l'orage inflammatoire.",
    },
    {
      title: "Panel séronégatif enrichi",
      currentVsSuggested:
        "Actuel : panels standards. Suggéré : pipeline de tests élargis et relecture probabiliste.",
      rationale:
        "Risque de faux négatifs dans les formes auto-immunes atypiques.",
      estimatedImpact:
        "Moins d'exclusions prématurées des pistes immunitaires.",
    },
    {
      title: "Capture systématique des prodromes pré-admission",
      currentVsSuggested:
        "Actuel : anamnèse variable. Suggéré : formulaire structuré sur fièvre, digestif, infectieux, autonomie.",
      rationale:
        "Les signaux faibles du film du passé sont souvent perdus.",
      estimatedImpact:
        "Amélioration du repérage pré-diagnostique.",
    },
    {
      title: "RCP accélérée inter-spécialités en phase critique",
      currentVsSuggested:
        "Actuel : coordination séquentielle. Suggéré : staff flash neuro-immuno-réa-cardio selon seuil.",
      rationale:
        "Le Lab met en évidence des bénéfices potentiels d'une lecture simultanée.",
      estimatedImpact:
        "Décisions plus rapides dans les cas complexes.",
    },
  ],
  engineDialogs: [
    {
      from: "Discovery",
      to: "NeuroCore",
      question:
        "Les prodromes digestifs précèdent-ils l'inflammation cérébrale dans la cohorte ?",
      answer:
        "Oui, un motif partiel apparaît chez plusieurs trajectoires, surtout lorsqu'il existe un syndrome inflammatoire systémique.",
      insight:
        "Le volet digestif pourrait devenir un signal d'entrée plus important qu'actuellement.",
    },
    {
      from: "TDE",
      to: "CAE",
      question:
        "Quel délai sépare le premier signal utile de l'escalade thérapeutique ?",
      answer:
        "Le retard varie, mais plusieurs cas franchissent une fenêtre potentiellement critique avant action ciblée.",
      insight:
        "Le temps doit devenir une variable de décision explicite.",
    },
    {
      from: "Oracle",
      to: "Discovery",
      question:
        "Quels angles morts persistent malgré la littérature récente ?",
      answer:
        "Les formes séronégatives et les signatures multi-organe restent insuffisamment connectées entre elles.",
      insight:
        "Le Lab doit chercher des ponts entre disciplines plutôt que des silos.",
    },
    {
      from: "FeedbackLoop",
      to: "VPS",
      question:
        "Quels signaux étaient présents mais sous-pondérés ?",
      answer:
        "Fièvre, biologie inflammatoire et temporalité EEG apparaissent trop faiblement valorisées au début.",
      insight:
        "Un score de vigilance initiale est justifié.",
    },
    {
      from: "NeuroCore",
      to: "TPE",
      question:
        "Quels impacts thérapeutiques sont plausibles si l'hypothèse timing est vraie ?",
      answer:
        "Une immunothérapie plus rapide pourrait modifier la profondeur de la phase réfractaire.",
      insight:
        "Les protocoles doivent intégrer la notion de fenêtre thérapeutique.",
    },
    {
      from: "CAE",
      to: "Oracle",
      question:
        "Le sous-phénotype multi-organe mérite-t-il une alerte distincte ?",
      answer:
        "Oui, surtout quand les signaux cardio-inflammatoires coexistent avec une aggravation neurologique rapide.",
      insight:
        "Créer un drapeau systémique prioritaire dans PULSAR.",
    },
  ],
  pubmedArticles: [
    {
      title: "Early immunotherapy timing in pediatric autoimmune encephalitis",
      authors: "Smith J, Ortega L, et al.",
      journal: "Pediatric Neurology",
      date: "2026-02-21",
      pmid: "40123456",
      searchTerm: "autoimmune encephalitis timing pediatric",
    },
    {
      title: "Inflammatory signatures in febrile infection-related epilepsy syndrome",
      authors: "Rossi P, Meyer A, et al.",
      journal: "Epilepsia",
      date: "2026-02-17",
      pmid: "40118764",
      searchTerm: "FIRES immunotherapy early",
    },
    {
      title: "Gut-brain axis disruption in pediatric neuroinflammation",
      authors: "Kim S, Rahman N, et al.",
      journal: "Journal of Neuroimmunology",
      date: "2026-02-09",
      pmid: "40099812",
      searchTerm: "FIRES gut brain axis child",
    },
    {
      title: "Biomarkers for seronegative autoimmune encephalitis in children",
      authors: "Martin C, Velasquez D, et al.",
      journal: "Frontiers in Pediatrics",
      date: "2026-01-30",
      pmid: "40082311",
      searchTerm: "seronegative autoimmune encephalitis pediatric biomarkers",
    },
  ],
  insights: [
    "Le temps semble agir comme amplificateur du dommage inflammatoire.",
    "Plusieurs signaux utiles existaient avant la rupture clinique.",
    "La lecture multi-organe reste sous-exploitée dans les phases précoces.",
    "Le Lab détecte des convergences entre cohorte rare et littérature mondiale.",
    "Les formes séronégatives restent probablement sous-caractérisées.",
    "Les prodromes digestifs méritent une attention bien plus structurée.",
    "Le protocole initial doit lire les signaux faibles comme un système, pas en silo.",
  ],
};

const fmt = {
  num: (value: number) => new Intl.NumberFormat("fr-FR").format(value ?? 0),
  date: (value: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value)),
};

function Icon({
  name,
  className = "w-5 h-5",
  color = "currentColor",
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "brain":
      return (
        <svg {...common}>
          <path d="M10 4a3 3 0 0 0-3 3v1a2.5 2.5 0 0 0-2 2.5A2.5 2.5 0 0 0 7 13v1a3 3 0 0 0 3 3" />
          <path d="M14 4a3 3 0 0 1 3 3v1a2.5 2.5 0 0 1 2 2.5A2.5 2.5 0 0 1 17 13v1a3 3 0 0 1-3 3" />
          <path d="M10 4v13" />
          <path d="M14 4v13" />
        </svg>
      );
    case "microscope":
      return (
        <svg {...common}>
          <path d="M6 20h12" />
          <path d="M9 20a6 6 0 0 1 6-6h3" />
          <path d="M10 4l4 4" />
          <path d="M12 8l-3 3" />
          <path d="M14 4l2 2" />
          <path d="M8 12l4 4" />
          <path d="M5 16h6" />
        </svg>
      );
    case "books":
      return (
        <svg {...common}>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14H7.5A2.5 2.5 0 0 0 5 20.5z" />
          <path d="M5 6.5v14" />
          <path d="M9 8h6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4.2-4.2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="0.9" fill={color} stroke="none" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M9 4.5h6" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </svg>
      );
    case "cycle":
      return (
        <svg {...common}>
          <path d="M20 7h-5V2" />
          <path d="M4 17h5v5" />
          <path d="M6.5 8A7 7 0 0 1 18 7" />
          <path d="M17.5 16A7 7 0 0 1 6 17" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8l6 4-6 4z" fill={color} stroke="none" />
        </svg>
      );
    case "export":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="M8 8l4-4 4 4" />
          <path d="M5 14v4h14v-4" />
        </svg>
      );
    case "dna":
      return (
        <svg {...common}>
          <path d="M8 4c6 4 2 12 8 16" />
          <path d="M16 4c-6 4-2 12-8 16" />
          <path d="M9 7h6" />
          <path d="M8.5 12h7" />
          <path d="M8 17h6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function useSectionSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] || "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0.2, 0.45, 0.75] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return [active, setActive] as const;
}

function ShellCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-sm ${className}`}
      style={
        glow
          ? {
              boxShadow:
                "0 0 0 1px rgba(14,165,233,.04), 0 0 34px rgba(14,165,233,.08), inset 0 0 22px rgba(14,165,233,.05)",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  right,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 md:mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-sky-400/15 bg-sky-500/10 flex items-center justify-center shadow-[0_0_18px_rgba(14,165,233,.12)]">
            <Icon name={icon} color={COLORS.lab} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sky-300/90">
              {eyebrow}
            </div>
            <h2 className="text-lg md:text-[22px] leading-tight font-semibold text-white">
              {title}
            </h2>
          </div>
        </div>
        {subtitle ? (
          <p className="mt-2 text-sm md:text-[15px] leading-6 text-slate-300 max-w-4xl">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string | number;
  icon: string;
  mono?: boolean;
}) {
  return (
    <ShellCard glow className="relative overflow-hidden p-4 md:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            {label}
          </div>
          <div
            className={`mt-2 text-2xl md:text-[30px] font-semibold leading-none text-white ${
              mono ? "font-mono" : ""
            }`}
          >
            {value}
          </div>
        </div>
        <div className="h-11 w-11 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center shrink-0">
          <Icon name={icon} color={COLORS.lab} className="w-5 h-5" />
        </div>
      </div>
    </ShellCard>
  );
}

function Hero({
  summary,
}: {
  summary: SessionSummary;
}) {
  const [running, setRunning] = useState(summary.status === "running");
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!running || summary.phases.length === 0) return;
    const t = setInterval(() => {
      setPhaseIndex((v) => (v + 1) % summary.phases.length);
    }, 1500);
    return () => clearInterval(t);
  }, [running, summary.phases.length]);

  return (
    <ShellCard glow className="overflow-hidden p-5 md:p-7 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,.12),transparent_36%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(180deg,transparent,rgba(14,165,233,.04),transparent)]" />
        <div className="scan-vertical" />
      </div>

      <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200">
              <span className="live-dot" />
              Lab vivant
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
              À la mémoire d'Alejandro R. (2019–2025)
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.02]">
            PULSAR Research Lab
          </h1>

          <p className="mt-4 max-w-3xl text-sm md:text-[15px] leading-7 text-slate-300">
            Le laboratoire autonome qui croise la cohorte PULSAR avec la littérature mondiale,
            détecte des convergences invisibles, formule des hypothèses et pousse
            la réflexion clinique vers des pistes que personne n’explore encore vraiment.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Prochaine exécution auto
              </div>
              <div className="mt-1 text-white font-medium">Dimanche · 03:00</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Dernière session
              </div>
              <div className="mt-1 text-white font-medium">
                {fmt.date(summary.lastSessionDate)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Durée
              </div>
              <div className="mt-1 text-white font-medium font-mono">
                {fmt.num(summary.durationMs)} ms
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-horizontal" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Session en cours
                </div>
                <div className="mt-1 text-white font-medium">
                  {running ? "Analyse active" : "Veille / pause"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRunning((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-100 hover:bg-sky-500/15 transition"
              >
                <Icon name="play" color={COLORS.lab} className="w-4 h-4" />
                {running ? "Pause" : "Lancer"}
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                Phase active
              </div>
              <div className="text-white text-base md:text-lg font-medium min-h-[28px]">
                {summary.phases[phaseIndex] || "Veille…"}
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="scanner-bar h-full rounded-full" />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-3">
                Cadence interne
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg border border-white/10 bg-black/20 flex items-end justify-center overflow-hidden"
                  >
                    <div
                      className="w-full rounded-t-md bg-sky-400/75 animate-[pulseBar_1.8s_ease-in-out_infinite]"
                      style={{
                        height: `${45 + ((i * 13) % 40)}%`,
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

function Sidebar({
  active,
  onNavigate,
  sections,
}: {
  active: string;
  onNavigate: (id: string) => void;
  sections: { id: string; label: string; icon: string }[];
}) {
  return (
    <aside className="hidden lg:block sticky top-4 self-start">
      <ShellCard className="w-[250px] p-3">
        <div className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Navigation Lab
        </div>
        <nav className="space-y-1">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onNavigate(s.id)}
                className="w-full rounded-xl px-3 py-2.5 text-left transition flex items-center gap-3"
                style={{
                  background: isActive ? "rgba(14,165,233,.10)" : "transparent",
                  border: `1px solid ${
                    isActive ? "rgba(14,165,233,.25)" : "transparent"
                  }`,
                }}
              >
                <Icon
                  name={s.icon}
                  color={isActive ? COLORS.lab : "#94A3B8"}
                  className="w-4 h-4"
                />
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </nav>
      </ShellCard>
    </aside>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const d = (value / 100) * c;
  return (
    <div className="relative h-[110px] w-[110px] shrink-0">
      <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
        <circle cx="45" cy="45" r={r} stroke="rgba(255,255,255,.08)" strokeWidth="8" fill="none" />
        <circle
          cx="45"
          cy="45"
          r={r}
          stroke={COLORS.lab}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${d} ${c - d}`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px rgba(14,165,233,.42))" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
          Confiance
        </div>
        <div className="text-2xl font-semibold text-white">{value}%</div>
      </div>
    </div>
  );
}

function MiniHypothesisTrend({ history }: { history: number[] }) {
  const points = history.length
    ? history
        .map((v, i) => {
          const x = 12 + i * 32;
          const y = 62 - (v / 100) * 48;
          return `${x},${y}`;
        })
        .join(" ")
    : "12,62";
  return (
    <svg viewBox="0 0 160 72" className="w-full h-[72px]">
      <defs>
        <linearGradient id="trendLine" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(14,165,233,.25)" />
          <stop offset="100%" stopColor={COLORS.lab} />
        </linearGradient>
      </defs>
      <path d="M10 62H150" stroke="rgba(255,255,255,.08)" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#trendLine)"
        strokeWidth="2.5"
        style={{ filter: "drop-shadow(0 0 8px rgba(14,165,233,.28))" }}
      />
      {history.map((v, i) => {
        const x = 12 + i * 32;
        const y = 62 - (v / 100) * 48;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={COLORS.lab} />;
      })}
    </svg>
  );
}

function HypothesisPanel({ item }: { item: Hypothesis }) {
  const statusStyle: Record<Hypothesis["status"], { bg: string; bd: string; tx: string; pulse?: boolean }> = {
    "En investigation": {
      bg: "rgba(14,165,233,.12)",
      bd: "rgba(14,165,233,.35)",
      tx: "#7DD3FC",
      pulse: true,
    },
    "Générée": {
      bg: "rgba(185,107,255,.12)",
      bd: "rgba(185,107,255,.35)",
      tx: "#D8B4FE",
    },
    "Supportée": {
      bg: "rgba(46,213,115,.12)",
      bd: "rgba(46,213,115,.35)",
      tx: "#86EFAC",
    },
    "Réfutée": {
      bg: "rgba(220,38,38,.12)",
      bd: "rgba(220,38,38,.35)",
      tx: "#FCA5A5",
    },
  };

  const s = statusStyle[item.status];

  return (
    <ShellCard className="p-4 md:p-5" glow>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
              style={{ background: s.bg, borderColor: s.bd, color: s.tx }}
            >
              <span
                className={s.pulse ? "status-dot" : ""}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: s.tx,
                }}
              />
              {item.status}
            </span>

            {item.pathologies.map((p) => {
              const c = COLORS.pathology[p] || "#94A3B8";
              return (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]"
                  style={{
                    color: c,
                    borderColor: `${c}55`,
                    background: `${c}12`,
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>

          <h3 className="text-lg md:text-xl text-white font-semibold leading-snug">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-emerald-300 mb-3">
                Preuves pour
              </div>
              <div className="space-y-2.5">
                {item.evidenceFor.map((v, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-slate-100">
                    <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.05] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-rose-300 mb-3">
                Preuves contre
              </div>
              <div className="space-y-2.5">
                {item.evidenceAgainst.map((v, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-slate-100">
                    <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                Implications si confirmée
              </div>
              <p className="text-sm leading-6 text-slate-200">{item.implications}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                Impact sur les traitements
              </div>
              <p className="text-sm leading-6 text-slate-200">{item.treatmentImpact}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ShellCard className="p-4 bg-black/20">
            <div className="flex items-center justify-center">
              <ConfidenceGauge value={item.confidence} />
            </div>
          </ShellCard>

          <ShellCard className="p-4 bg-black/20">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
              Évolution hebdomadaire
            </div>
            <MiniHypothesisTrend history={item.history} />
          </ShellCard>

          <ShellCard className="p-4 bg-black/20">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-3">
              Balance
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
              <div
                className="h-full bg-emerald-400/80"
                style={{
                  width: `${Math.max(
                    20,
                    (item.evidenceFor.length /
                      (item.evidenceFor.length + item.evidenceAgainst.length || 1)) *
                      100
                  )}%`,
                }}
              />
              <div className="h-full flex-1 bg-rose-400/70" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Pour · {item.evidenceFor.length}</span>
              <span>Contre · {item.evidenceAgainst.length}</span>
            </div>
          </ShellCard>
        </div>
      </div>
    </ShellCard>
  );
}

function CrossMap({ items }: { items: CrossReference[] }) {
  const nodes = [
    { label: "Fièvre persistante", x: 16, y: 26 },
    { label: "EEG diffus", x: 49, y: 12 },
    { label: "CRP / ferritine", x: 82, y: 26 },
    { label: "Prodromes digestifs", x: 22, y: 68 },
    { label: "Multi-organe", x: 50, y: 82 },
    { label: "Retard immunothérapie", x: 80, y: 67 },
  ];

  const links = [
    [0, 1, "Strong"],
    [2, 1, "Strong"],
    [3, 2, "Moderate"],
    [4, 1, "Weak"],
    [5, 1, "Strong"],
    [3, 4, "Moderate"],
  ] as const;

  const strengthStyles: Record<CrossReference["strength"], { opacity: number; width: number }> = {
    Strong: { opacity: 0.95, width: 1.2 },
    Moderate: { opacity: 0.7, width: 0.8 },
    Weak: { opacity: 0.45, width: 0.55 },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.08fr_.92fr] gap-5">
      <ShellCard glow className="p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-3">
          Réseau explicatif
        </div>
        <div className="relative min-h-[360px] rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,.07),transparent_55%)]" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {links.map(([a, b, strength], idx) => {
              const sa = nodes[a];
              const sb = nodes[b];
              const st = strengthStyles[strength];
              return (
                <line
                  key={idx}
                  x1={sa.x}
                  y1={sa.y}
                  x2={sb.x}
                  y2={sb.y}
                  stroke={COLORS.lab}
                  strokeOpacity={st.opacity}
                  strokeWidth={st.width}
                />
              );
            })}
            {nodes.map((node, idx) => (
              <g key={idx}>
                <circle cx={node.x} cy={node.y} r="6.5" fill="rgba(14,165,233,.08)" />
                <circle cx={node.x} cy={node.y} r="2.4" fill={COLORS.lab} />
                <text x={node.x} y={node.y + 8} textAnchor="middle" fill="#dbeafe" fontSize="3.05">
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </ShellCard>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const st = strengthStyles[item.strength];
          return (
            <ShellCard key={idx} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="font-medium text-white">{item.factorA}</div>
                <div className="text-slate-500">×</div>
                <div className="font-medium text-white">{item.factorB}</div>
                <div className="ml-auto text-[11px] uppercase tracking-[0.16em] text-sky-300">
                  {item.strength}
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(st.opacity * 100)}%`,
                    background: COLORS.lab,
                  }}
                />
              </div>

              <p className="text-sm leading-6 text-slate-300">{item.relation}</p>

              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Source :</span>{" "}
                  <span className="text-slate-200">{item.source}</span>
                </div>
                <div>
                  <span className="text-slate-500">Implication clinique :</span>{" "}
                  <span className="text-slate-200">{item.clinicalImplication}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.pathologies.map((p) => {
                  const c = COLORS.pathology[p] || "#94A3B8";
                  return (
                    <span
                      key={p}
                      className="rounded-full border px-2.5 py-1 text-[11px]"
                      style={{
                        color: c,
                        borderColor: `${c}55`,
                        background: `${c}12`,
                      }}
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            </ShellCard>
          );
        })}
      </div>
    </div>
  );
}

function QuestionsGrid({ items }: { items: ResearchQuestion[] }) {
  const priorityStyles = {
    critique: {
      bg: "rgba(220,38,38,.12)",
      bd: "rgba(220,38,38,.35)",
      tx: "#FCA5A5",
    },
    haute: {
      bg: "rgba(245,166,35,.12)",
      bd: "rgba(245,166,35,.35)",
      tx: "#FCD34D",
    },
    moyenne: {
      bg: "rgba(14,165,233,.12)",
      bd: "rgba(14,165,233,.35)",
      tx: "#7DD3FC",
    },
    exploratoire: {
      bg: "rgba(167,139,250,.12)",
      bd: "rgba(167,139,250,.35)",
      tx: "#C4B5FD",
    },
  } as const;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {items.map((q, idx) => {
        const p = priorityStyles[q.priority];
        return (
          <ShellCard key={idx} className="p-4 md:p-5" glow>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-300">
                {q.domain}
              </span>
              <span
                className="rounded-full border px-2.5 py-1 text-[11px]"
                style={{ background: p.bg, borderColor: p.bd, color: p.tx }}
              >
                {q.priority}
              </span>
            </div>

            <h3 className="text-white font-medium text-[15px] md:text-base leading-6">
              {q.text}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{q.reasoning}</p>

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Requêtes PubMed
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.pubmedQueries.map((query) => (
                    <span
                      key={query}
                      className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[11px] text-sky-200"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Moteurs connectés
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.connectedMotors.map((motor) => {
                    const c = COLORS.motors[motor] || "#94A3B8";
                    return (
                      <span
                        key={motor}
                        className="rounded-full border px-2.5 py-1 text-[11px]"
                        style={{
                          color: c,
                          borderColor: `${c}55`,
                          background: `${c}12`,
                        }}
                      >
                        {motor}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </ShellCard>
        );
      })}
    </div>
  );
}

function SignalsFilm({ items }: { items: PreDiagnosticSignal[] }) {
  return (
    <ShellCard glow className="p-4 md:p-5 overflow-hidden">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-4">
        Film du passé — rembobinage clinique
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
          {items.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="h-10 w-10 rounded-full border border-sky-400/25 bg-sky-500/10 flex items-center justify-center mb-3 shadow-[0_0_18px_rgba(14,165,233,.14)]">
                <span className="signal-dot" />
              </div>
              <div className="text-xs uppercase tracking-[0.14em] text-sky-300">
                {item.availableWhen}
              </div>
              <div className="mt-2 text-white font-medium">{item.signal}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.meaning}</p>

              <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-500/[0.06] p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-amber-300 mb-1">
                  Ce que cela aurait pu prévenir
                </div>
                <p className="text-sm leading-6 text-slate-100">
                  {item.whatItCouldPrevent}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShellCard>
  );
}

function ProtocolCards({ items }: { items: ProtocolSuggestion[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {items.map((item, idx) => (
        <ShellCard key={idx} glow className="p-4 md:p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl border border-sky-400/15 bg-sky-500/10 flex items-center justify-center">
              <Icon name="clipboard" color={COLORS.lab} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Proposition de recherche
              </div>
              <h3 className="text-white font-medium">{item.title}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                Actuel → changement suggéré
              </div>
              <p className="text-sm leading-6 text-slate-200">{item.currentVsSuggested}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                Rationnel + preuves
              </div>
              <p className="text-sm leading-6 text-slate-200">{item.rationale}</p>
            </div>

            <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-emerald-300 mb-2">
                Impact estimé
              </div>
              <p className="text-sm leading-6 text-slate-100">{item.estimatedImpact}</p>
            </div>
          </div>
        </ShellCard>
      ))}
    </div>
  );
}

function DialogsBoard({ items }: { items: EngineDialogue[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {items.map((item, idx) => {
        const fromColor = COLORS.motors[item.from] || COLORS.lab;
        const toColor = COLORS.motors[item.to] || COLORS.lab;

        return (
          <ShellCard key={idx} glow className="p-4 md:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="engine-dot"
                  style={{ background: fromColor, boxShadow: `0 0 16px ${fromColor}` }}
                />
                <span className="text-sm font-medium text-white">{item.from}</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-sky-400/40 to-white/10" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-white">{item.to}</span>
                <span
                  className="engine-dot"
                  style={{ background: toColor, boxShadow: `0 0 16px ${toColor}` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Question posée
                </div>
                <p className="text-sm leading-6 text-slate-100">{item.question}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Réponse
                </div>
                <p className="text-sm leading-6 text-slate-200">{item.answer}</p>
              </div>

              <div className="rounded-xl border border-sky-400/15 bg-sky-500/[0.07] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-sky-300 mb-2">
                  Insight dégagé
                </div>
                <p className="text-sm leading-6 text-slate-100">{item.insight}</p>
              </div>
            </div>
          </ShellCard>
        );
      })}
    </div>
  );
}

function PubmedRail({ items }: { items: PubMedArticle[] }) {
  const sorted = [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <ShellCard glow className="p-4 md:p-5">
      <div className="relative pl-0 md:pl-2">
        {sorted.map((item, idx) => (
          <div key={idx} className="relative pl-7 md:pl-10 pb-5 last:pb-0">
            <div className="absolute left-[8px] top-[20px] bottom-[-8px] w-px bg-gradient-to-b from-sky-400/40 to-transparent last:hidden" />
            <div className="absolute left-0 top-3 h-4 w-4 rounded-full border border-sky-400/25 bg-sky-500/10 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-sky-400" />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {fmt.date(item.date)}
                  </div>
                  <h3 className="mt-1 text-white font-medium leading-6">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {item.authors} — {item.journal}
                  </p>
                </div>
                <div className="font-mono text-sky-200 text-sm shrink-0">
                  PMID {item.pmid}
                </div>
              </div>
              <div className="mt-3 inline-flex rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-100">
                {item.searchTerm}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ShellCard>
  );
}

function InsightsGrid({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <ShellCard key={idx} glow className="p-4 min-h-[128px] bg-gradient-to-br from-sky-500/[0.08] to-transparent">
          <div className="text-[11px] uppercase tracking-[0.16em] text-sky-300 mb-2">
            Insight {String(idx + 1).padStart(2, "0")}
          </div>
          <p className="text-sm leading-6 text-slate-100">{item}</p>
        </ShellCard>
      ))}
    </div>
  );
}

function MissionRibbon({ summary }: { summary: SessionSummary }) {
  const value = Math.min(100, Math.round((summary.insights * 10 + summary.hypotheses * 12) / 2));
  return (
    <ShellCard className="p-4 md:p-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_.9fr] gap-5 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Indice de fécondité scientifique
          </div>
          <div className="mt-2 text-white text-xl md:text-2xl font-semibold">
            Le Lab ne se contente pas d’afficher des données : il construit des trajectoires de sens.
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Cette couche donne immédiatement à la page une stature de mission-control :
            rythme, densité, hypothèses vivantes, protocoles actionnables et croisement continu
            entre cohorte rare et littérature mondiale.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Score global
              </div>
              <div className="text-3xl font-semibold text-white">{value}</div>
            </div>
            <div className="text-sm text-sky-200">Mission critical</div>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0EA5E9,#7DD3FC)]"
              style={{ width: `${value}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-slate-400">Patients</div>
              <div className="mt-1 text-white font-semibold">{summary.patientsAnalyzed}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-slate-400">Hypothèses</div>
              <div className="mt-1 text-white font-semibold">{summary.hypotheses}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-slate-400">Insights</div>
              <div className="mt-1 text-white font-semibold">{summary.insights}</div>
            </div>
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

export default function PulsarResearchLabV2() {
  const data = sampleData;
  const sections = [
    { id: "overview", label: "Vue d’ensemble", icon: "microscope" },
    { id: "hypotheses", label: "Hypothèses", icon: "brain" },
    { id: "cross", label: "Croisements", icon: "cycle" },
    { id: "questions", label: "Questions", icon: "search" },
    { id: "signals", label: "Signaux", icon: "alert" },
    { id: "protocols", label: "Protocoles", icon: "clipboard" },
    { id: "dialogs", label: "Dialogues", icon: "cycle" },
    { id: "pubmed", label: "PubMed", icon: "books" },
    { id: "insights", label: "Insights", icon: "chart" },
  ];

  const [active, setActive] = useSectionSpy(sections.map((s) => s.id));

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen w-full text-white" style={{ background: COLORS.bg }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .live-dot, .signal-dot, .engine-dot, .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: ${COLORS.lab};
          box-shadow: 0 0 0 rgba(14,165,233,.55);
          animation: pulseDot 1.8s infinite;
        }
        .signal-dot {
          width: 9px;
          height: 9px;
        }
        .engine-dot {
          width: 9px;
          height: 9px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
        }
        .scan-horizontal {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(14,165,233,.04) 40%, rgba(125,211,252,.20) 50%, rgba(14,165,233,.04) 60%, transparent 100%);
          transform: translateX(-120%);
          animation: scanX 2.8s ease-in-out infinite;
        }
        .scan-vertical {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(14,165,233,.04) 42%, rgba(125,211,252,.16) 50%, rgba(14,165,233,.04) 58%, transparent 100%);
          transform: translateY(-100%);
          animation: scanY 4.5s linear infinite;
        }
        .scanner-bar {
          width: 36%;
          background: linear-gradient(90deg, rgba(14,165,233,0), rgba(125,211,252,.95), rgba(14,165,233,0));
          box-shadow: 0 0 14px rgba(14,165,233,.35);
          animation: scanX 2.3s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(14,165,233,.45); opacity: 1; }
          70% { box-shadow: 0 0 0 10px rgba(14,165,233,0); opacity: .96; }
          100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); opacity: 1; }
        }
        @keyframes scanX {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes scanY {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulseBar {
          0%, 100% { opacity: .55; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>

      <div className="max-w-[1640px] mx-auto px-4 md:px-6 xl:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6">
          <Sidebar active={active} onNavigate={go} sections={sections} />

          <main className="min-w-0 space-y-6 md:space-y-8">
            <section id="overview" className="scroll-mt-6">
              <Hero summary={data.sessionSummary} />

              <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                <StatTile label="Patients analysés" value={fmt.num(data.sessionSummary.patientsAnalyzed)} icon="brain" />
                <StatTile label="Hypothèses" value={fmt.num(data.sessionSummary.hypotheses)} icon="search" />
                <StatTile label="Croisements" value={fmt.num(data.sessionSummary.crossReferences)} icon="cycle" />
                <StatTile label="Articles PubMed" value={fmt.num(data.sessionSummary.pubmedArticles)} icon="books" />
                <StatTile label="Insights" value={fmt.num(data.sessionSummary.insights)} icon="chart" />
                <StatTile label="Suggestions de protocole" value={fmt.num(data.sessionSummary.protocolSuggestions)} icon="clipboard" />
                <StatTile label="Durée session (ms)" value={fmt.num(data.sessionSummary.durationMs)} icon="alert" mono />
                <StatTile label="Dernière session" value={fmt.date(data.sessionSummary.lastSessionDate)} icon="microscope" />
              </div>

              <div className="mt-4">
                <MissionRibbon summary={data.sessionSummary} />
              </div>
            </section>

            <section id="hypotheses" className="scroll-mt-6">
              <SectionHeader
                icon="brain"
                eyebrow="Noyau de recherche"
                title="Hypothèses de recherche"
                subtitle="Le Lab formule, teste, pondère et re-pondère les hypothèses. On ne doit jamais sentir une page figée, mais un organisme scientifique en mouvement."
              />
              <div className="space-y-4">
                {data.hypotheses.map((item) => (
                  <HypothesisPanel key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section id="cross" className="scroll-mt-6">
              <SectionHeader
                icon="cycle"
                eyebrow="Convergences"
                title="Croisements de facteurs"
                subtitle="Visualisation des liens explicatifs entre signaux, délais, biomarqueurs et trajectoires cliniques."
              />
              <CrossMap items={data.crossReferences} />
            </section>

            <section id="questions" className="scroll-mt-6">
              <SectionHeader
                icon="search"
                eyebrow="Frontière scientifique"
                title="Questions de recherche"
                subtitle="Les angles morts les plus stratégiques à ouvrir maintenant."
              />
              <QuestionsGrid items={data.researchQuestions} />
            </section>

            <section id="signals" className="scroll-mt-6">
              <SectionHeader
                icon="alert"
                eyebrow="Pré-diagnostic"
                title="Signaux disponibles avant la rupture clinique"
                subtitle="Le film du passé rembobiné : ce qui était déjà là, quand, et ce que cela aurait pu changer."
              />
              <SignalsFilm items={data.preDiagnosticSignals} />
            </section>

            <section id="protocols" className="scroll-mt-6">
              <SectionHeader
                icon="clipboard"
                eyebrow="Actionnabilité"
                title="Suggestions de protocole"
                subtitle="Présentées comme des pré-publications scientifiques utilisables immédiatement par les équipes."
              />
              <ProtocolCards items={data.protocolSuggestions} />
            </section>

            <section id="dialogs" className="scroll-mt-6">
              <SectionHeader
                icon="cycle"
                eyebrow="Interopérabilité PULSAR"
                title="Dialogues inter-moteurs"
                subtitle="Les moteurs se parlent, se challengent, et produisent un insight partagé."
              />
              <DialogsBoard items={data.engineDialogs} />
            </section>

            <section id="pubmed" className="scroll-mt-6">
              <SectionHeader
                icon="books"
                eyebrow="Veille scientifique"
                title="Timeline PubMed"
                subtitle="Les articles récents identifiés par le Lab, reliés à la requête qui les a fait émerger."
              />
              <PubmedRail items={data.pubmedArticles} />
            </section>

            <section id="insights" className="scroll-mt-6 pb-8">
              <SectionHeader
                icon="chart"
                eyebrow="Synthèse"
                title="Insights transversaux"
                subtitle="Conclusions issues du croisement cohorte × littérature × moteurs PULSAR."
              />
              <InsightsGrid items={data.insights} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
