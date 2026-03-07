// ============================================================
// PULSAR — DOSSIER ALEJANDRO R. COMPLET (CORRIGÉ)
// Sources : 66 documents analysés (photos, screenshots, vidéo,
// tableaux cliniques, EEG, scope, prescriptions)
// Date de compilation : 07/03/2026
// ============================================================

export const ALEJANDRO_COMPLETE = {
  // ── IDENTITÉ ──
  identity: {
    name: 'ROUQUETTE ALEJANDRO',
    dob: '2019-03-05',
    sex: 'M',
    weight: 24, // kg
    ageAtAdmission: '6 ans',
    hospitalId: '8012191066',
    room: 'CH-17', // Réa Pédiatrique Robert-Debré
    dateOfDeath: '2025-04-17',
    causeOfDeath: 'Arrêt cardiaque',
  },

  // ── ANTÉCÉDENTS ──
  history: {
    prematurity: '34 SA',
    delivery: 'Césarienne urgence (crise vaso-occlusive maternelle + tachycardie foetale)',
    motherSickleCellSS: true,
    neonatalThrombocytopenia: 32000, // plaquettes
    neonatalTreatment: 'TÉGÉLINE J2-J3',
    plateletsRecovery: '156 000 à J13',
    neonatalRespDistress: true,
    neonatalHypoglycemia: true,
    neonatalJaundice: true,
    dischargeDayOfLife: 14,
    neuroExamAtDischarge: 'Strictement normal',
    developmentUntil6: 'Parfaitement normal',
    sickleCellTrait: true,
    recentDigestiveSymptoms: true,
    recentRhinopharyngitis: true,
  },

  // ── CHRONOLOGIE CORRIGÉE ──
  timeline: [
    // PHASE PRODROMIQUE
    { date: '2025-03-29', day: 'J-5', events: 'Fièvre isolée (38.5°C). Enfant somnolent, irritabilité.', exams: 'T° élevée, pas de foyer infectieux clair.', treatments: 'Paracétamol', decisions: 'Début du suivi. Hypothèse virale commune.', vitals: null },
    { date: '2025-03-30', day: 'J-4', events: 'Fièvre persistante.', exams: null, treatments: 'Aucun changement', decisions: 'Pas de signes associés.', vitals: null },
    { date: '2025-03-31', day: 'J-3/J-2', events: 'État stable, fébrile fluctuant, aucune anomalie clinique.', exams: null, treatments: 'Paracétamol', decisions: 'Suivi ambulatoire.', vitals: null },

    // DÉCLENCHEMENT — EAUBONNE
    { date: '2025-04-02', day: 'J0', events: 'CRISE BRUTALE après Kalinox + Sevoflurane pour prélèvement sanguin. Effondrement brutal : désaturation, perte de conscience, incontinence. Chute brutale état neurologique.', exams: 'EEG désorganisé dès Eaubonne. Anomalies sévères.', treatments: 'Midazolam, Keppra (Lévétiracétam). Transfert SAMU vers Robert-Debré.', decisions: 'Début du coma. État de mal épileptique. Encéphalopathie aiguë suspectée.', vitals: null },

    // ROBERT-DEBRÉ
    { date: '2025-04-03', day: 'J+1', events: 'Arrivée Robert-Debré. Convulsions prolongées. Crise de 1h07.', exams: 'IRM cérébrale NORMALE. EEG sévèrement perturbé, non réactif. PL : liquide clair, fièvre persistante.', treatments: 'Midazolam, Kétamine, Sufentanil. DVE (Dérivation Ventriculaire Externe) posé. Ajout Thiopental, sédation profonde.', decisions: 'Méningite virale exclue. Suspicion de FIRES. Début discussions diagnostiques.', vitals: null },
    { date: '2025-04-04', day: 'J+2', events: 'EEG suppression de fond. Activité non réactive aux stimulations.', exams: 'PL réalisée : non contributive, pas d\'infection.', treatments: 'CORTICOÏDES DÉBUTÉS (méthylprednisolone). Sédation continue.', decisions: 'PL : pas d\'infection. Début immunomodulation.', vitals: { fc: 82, spo2: 95, pa: '88/48', pam: 61, etco2: 32, temp: null } },
    { date: '2025-04-05', day: 'J+3', events: 'EEG toujours très perturbé.', exams: 'Monitorage continu.', treatments: 'IVIG ADMINISTRÉES. Sédation continue.', decisions: 'Sédation continue.', vitals: { fc: 99, spo2: 94, pa: '93/54', pam: 67, etco2: 36, fr: 20 } },
    { date: '2025-04-06', day: 'J+4', events: 'Crises continues. État neurologique stationnaire sous sédation. EEG toujours non réactif.', exams: 'EEG toujours altéré.', treatments: 'Corticoïdes + IVIG en poursuite. Midazolam 3 ml/h, Kétamine 1.6 ml/h, Sufentanil 0.2 ml/h.', decisions: 'Hypothèse inflammatoire envisagée. Dr Giles (neurochirurgien) évoque encéphalite auto-immune, PIMS non exclue. Entretien téléphonique Steve M. et Dr Giles.', vitals: null },
    { date: '2025-04-07', day: 'J+5', events: 'HYPOTHÈSE FIRES POSÉE (90%). Réunion d\'équipe Robert-Debré.', exams: 'EEG : peu de changement. Pas d\'évolution à l\'IRM. Pas de cause infectieuse retrouvée.', treatments: 'DÉBUT RÉGIME CÉTOGÈNE. Début réflexion immunomodulateur.', decisions: 'Diagnostic FIRES privilégié. Virage stratégique. Parents informés par neurologue.', vitals: null },
    { date: '2025-04-08', day: 'J+6', events: 'Pas d\'amélioration clinique notable. EEG toujours sans rythme de fond, très perturbé. Doutes persistants équipe parallèle.', exams: 'Constantes stables. Corticoïdes IV maintenus.', treatments: 'Discussions Anakinra en cours.', decisions: 'Dr Giles et Pr Sonigo confirment : piste auto-immune séronégative doit rester envisagée. Légère baisse pics fébriles.', vitals: null },
    { date: '2025-04-09', day: 'J+7', events: 'Premiers signes discrets de réactivité : plissement des yeux, mouvement de doigt. EEG reste sévèrement altéré.', exams: 'EEG confirmé sévère. Amélioration subjective notée.', treatments: 'Anakinra envisagé (expertise externe). Sédation probablement intensifiée.', decisions: 'Fenêtre potentielle d\'intervention immunomodulatrice ouverte. Réflexion introduction Anakinra. Stabilisation partielle des constantes.', vitals: null },
    { date: '2025-04-10', day: 'J+8', events: 'Pas de réponse clinique significative malgré sédation maximale. EEG toujours critique. Introduction Dépakine + suspicion Thiopental.', exams: 'EEG non réactif. Tentative de thiopental.', treatments: 'Dépakine (VALPROATE) introduite. Thiopental. Préparation logistique Anakinra.', decisions: 'L\'échec des traitements classiques renforce hypothèse inflammatoire. Discussion active introduction Anakinra.', vitals: null },
    { date: '2025-04-11', day: 'J+9', events: 'EEG toujours altéré. Mise à jour perfusions. Réunion médicale multidisciplinaire.', exams: 'EEG très désorganisé. Revue croisée données par équipe multidisciplinaire.', treatments: 'Thiopental confirmé + Perampanel ajouté. Introduction probable de Thiopental.', decisions: 'Décision collégiale d\'introduire Anakinra malgré absence de confirmation sérologique.', vitals: { fc: 108, spo2: 97, pa: '122/107', pam: 114, etco2: 33, fr: 25, noradrenaline: '0.53 µg/kg/min' } },
    { date: '2025-04-12', day: 'J+10', events: 'ANAKINRA OFFICIELLEMENT ADMINISTRÉ. Début d\'immunothérapie ciblée.', exams: 'EEG toujours pathologique, mais éléments immuno-cliniques favorables à une EAIS.', treatments: 'Anakinra IV. Poursuite régime cétogène. Sédation maintenue.', decisions: 'Hypothèse retenue : encéphalite auto-immune séronégative. Objectif : casser la boucle inflammatoire. Début de réponse partielle.', vitals: null },
    { date: '2025-04-13', day: 'J+10-11', events: 'Apparition de signes cliniques subtils d\'amélioration (PGCS estimé > 7). Corrélation temporelle favorable avec Anakinra.', exams: null, treatments: 'Anakinra poursuivi.', decisions: null, vitals: null },
    { date: '2025-04-17', day: 'J+15', events: 'DÉCÈS par arrêt cardiaque.', exams: 'Pas de lésion cérébrale irréversible aux derniers examens.', treatments: null, decisions: 'Défaillance cardiaque.', vitals: null },
  ],

  // ── TRAITEMENTS RÉELLEMENT ADMINISTRÉS (corrigé) ──
  treatmentsAdministered: {
    corticosteroids: { administered: true, drug: 'Méthylprednisolone IV', startDay: 'J+2 (4 avril)', delay: '+24h vs recommandé 24h' },
    ivig: { administered: true, startDay: 'J+3 (5 avril)', delay: '+24h vs recommandé 48h' },
    ketogenicDiet: { administered: true, startDay: 'J+5 (7 avril)', delay: '+72h vs recommandé J+2' },
    anakinra: { administered: true, startDay: 'J+10 (12 avril)', delay: '+168h vs recommandé 72h (7 jours de retard)', logisticDelay: '4 jours entre discussion et administration' },
    valproate: { administered: true, drug: 'Dépakine', startDay: 'J+8 (10 avril)', note: 'ATTENTION: Valproate introduit alors que carbapénèmes possibles en parallèle' },
    thiopental: { administered: true, startDay: 'J+8 (10 avril)', note: 'Coma barbiturique, réponse très limitée' },
    perampanel: { administered: true, startDay: 'J+9 (11 avril)' },
    noradrenaline: { administered: true, dose: '0.53-0.80 µg/kg/min', note: 'Support hémodynamique continu' },
    arcticSun: { administered: true, target: '37.0°C', note: 'Contrôle température par pads' },
    antibodyPanel: { administered: true, result: 'Négatifs — mais ne permettent pas d\'exclure processus auto-immun', note: 'PL claire, anticorps non détectés' },
    midazolam: { administered: true, startDay: 'J0', dose: 'Jusqu\'à 3 ml/h', continuous: true },
    ketamine: { administered: true, startDay: 'J+1', dose: '250mg, 1.6 ml/h', continuous: true },
    sufentanil: { administered: true, startDay: 'J+1', dose: '250µg, 0.2 ml/h', continuous: true },
    phenytoin: { administered: true, startDay: 'J0 (Eaubonne)', drug: 'Dilantin', continuous: true, duration: '~14 jours' },
    phenobarbital: { administered: true, startDay: 'J0' },
    levetiracetam: { administered: true, drug: 'Keppra', startDay: 'J0 (Eaubonne)' },
    cefotaxime: { administered: true, note: 'Antibiothérapie large spectre pour méningite suspectée' },
    aciclovir: { administered: true, note: 'Couverture herpès encéphalite' },
    ssh: { administered: true, drug: 'Sérum Salé Hypertonique 5.85%', note: 'Pour oedème cérébral' },
  },

  // ── TROIS HYPOTHÈSES CONCURRENTES ──
  competingHypotheses: {
    fires: { team: 'Robert-Debré (équipe principale)', confidence: '90% à J+5', status: 'Hypothèse privilégiée' },
    eais: { team: 'Dr Giles M. (neurochirurgien) + équipe parallèle', confidence: 'Maintenue tout le séjour', status: 'Encéphalite auto-immune séronégative' },
    pimsNeuro: { team: 'Pr Pierre Sonigo', confidence: 'Évoquée', status: 'PIMS neurologique atypique' },
    finalDiagnosis: 'Encéphalite auto-immune séronégative (convergence des 3 hypothèses). FIRES retenu comme diagnostic principal.',
  },

  // ── DONNÉES SCOPE (extraites des photos) ──
  vitalSigns: [
    { date: '2025-04-04', day: 'J+2', fc: 82, spo2: 95, pa: '88/48', pam: 61, etco2: 32, source: 'Vidéo VID-20260306-WA0031' },
    { date: '2025-04-05', day: 'J+3', fc: 99, spo2: 94, pa: '93/54', pam: 67, etco2: 36, fr: 20, source: 'IMG_7730 HEIF' },
    { date: '2025-04-06', day: 'J+4', pumps: 'Midazolam 50mg, Kétamine 250mg/1.6ml/h, Sufentanil 250µg, SSH, Entretien SG', source: 'IMG_7734 + vidéo' },
    { date: '2025-04-11', day: 'J+9', fc: 108, spo2: 97, pa: '122/107', pam: 114, etco2: 33, fr: 25, noradrenaline: '0.53 µg/kg/min', source: 'Screenshot 091121' },
  ],

  // ── VENTILATION (Dräger Evita V800) ──
  ventilation: {
    mode: 'VC-VAC',
    earlyPhase: { ppeak: 25, fio2: 40, peep: 8.8, fr: 20, vte: 137, vmin: 2.75 },
    laterPhase: { ppeak: 27, fio2: 30, pplat: 15, pmoy: 11, fr: 25, vte: 130, vmin: 3.25, peep: 5.3 },
  },

  // ── EEG (ProFusion EEG, multiples enregistrements) ──
  eeg: [
    { date: '2025-04-02', description: 'Désorganisé dès Eaubonne après Kalinox/Sevoflurane.' },
    { date: '2025-04-03', description: 'Sévèrement perturbé, non réactif.' },
    { date: '2025-04-04', description: 'Suppression de fond. SpO2 oscillant autour de 0% (artefact?) sur tracé. Activité delta + sharp waves multifocales.' },
    { date: '2025-04-06', description: 'Non réactif, activité non réactive aux stimulations.' },
    { date: '2025-04-09', description: 'Toujours désorganisé. Plissement yeux + mouvement doigt (possible début réactivité réflexe).' },
    { date: '2025-04-10', description: 'Activité épileptique persistante. Réaction très limitée au barbiturique.' },
    { date: '2025-04-11', description: 'Toujours non réactif. Réunion médicale. Activité désorganisée. Aucune réactivité EEG. Ajout probable Perampanel.' },
    { date: '2025-04-11', description: 'Données ProFusion: Début ACQ 11/04/2025 12:38:18 → Fin ACQ 11/04/2025 18:47:46. Durée ACQ: 6h 4min 27s. Montage bipolar, 12 channels + ECG + DeltG + DeltD + Respi + SpO2. SpO2: 93 (rouge). Video-EEG en cours.' },
  ],

  // ── NUTRITION ──
  nutrition: {
    enteral: 'Sondalis Junior Energy Fibre (Nestlé) — 500ml. Nutrition entérale standard hypercalorique avec fibres.',
    ketogenicDiet: { started: '2025-04-07', day: 'J+5', note: 'Impact partiel selon documents.' },
  },

  // ── CE QUI CHANGE DANS L\'ANALYSE PULSAR ──
  pulsarCorrections: {
    previousErrors: [
      'ERREUR: "Aucune immunothérapie" → CORRIGÉ: IVIG administrées J+3',
      'ERREUR: "Pas de régime cétogène" → CORRIGÉ: KD débuté J+5',
      'ERREUR: "Pas d\'anakinra" → CORRIGÉ: Anakinra introduit J+10',
      'ERREUR: "FIRES absent du dossier" → CORRIGÉ: Hypothèse FIRES posée J+5 (90%)',
      'ERREUR: "MEOPA seul" → CORRIGÉ: Kalinox + Sevoflurane (deux agents)',
      'ERREUR: "5 molécules" → CORRIGÉ: Au minimum 8-10 molécules simultanées à J+8',
    ],
    revisedAnalysis: {
      dddRetards: [
        { action: 'IVIG', optimal: '< 48h', actual: 'J+3 (72h)', delay: '+24h', severity: 'moderate' },
        { action: 'Régime cétogène', optimal: 'J+2', actual: 'J+5', delay: '+72h', severity: 'high' },
        { action: 'Anakinra', optimal: '< 72h', actual: 'J+10 (240h)', delay: '+168h (7 jours)', severity: 'critical', note: '4 jours de préparation logistique entre décision et administration' },
        { action: 'Diagnostic FIRES', optimal: 'J0-J1', actual: 'J+5', delay: '+96-120h', severity: 'high', note: '3 hypothèses concurrentes ont retardé le diagnostic' },
      ],
      caeAlerts: [
        { alert: 'Kalinox + Sevoflurane sur enfant en prodrome FIRES', severity: 'critical', whatPulsarWouldSay: 'STOP — enfant fébrile + signes neuro = PAS de dépresseur SNC sans monitoring' },
        { alert: 'Valproate (Dépakine) introduit J+8 — risque interaction si carbapénèmes en parallèle', severity: 'warning' },
        { alert: 'Phénytoïne continue 14 jours + Thiopental + polythérapie → risque cardiaque cumulatif', severity: 'critical' },
      ],
      whatPulsarWouldHaveChangedNow: [
        'Diagnostic FIRES à J0 (score composite ≥ 8/13) au lieu de J+5',
        'IVIG + Corticoïdes à J0 (au lieu de J+2/J+3) — gain de 48-72h',
        'Régime cétogène à J+2 (au lieu de J+5) — gain de 72h',
        'Anakinra à J+1-J+2 (au lieu de J+10) — gain de 192h (8 JOURS)',
        'Monitoring cardiaque (troponine + écho) dès J+3 au lieu de jamais',
        'Alerte STOP Kalinox/Sevoflurane à Eaubonne — le déclencheur aurait pu être évité',
        'Alerte polythérapie cardiotoxique dès J+5 quand > 4 molécules sédatives',
      ],
    },
  },
}
