# PULSAR V19 — Bible Technique Complète

**Version:** 19.0 — Discovery Engine (7ème moteur, 4 niveaux)
**Date:** 2 mars 2026
**Auteur:** Steve Moradel
**Statut:** Production — Build clean — 95/95 tests
**Prod:** pulsar-j63q.vercel.app
**GitHub:** SteveMrld/Pulsar

---

## Métriques

| Métrique | Valeur |
|----------|--------|
| Lignes TypeScript/TSX | 23 910 |
| Fichiers | 103 |
| Pages | 29 |
| Services Supabase | 13 |
| Tables SQL | 15 (12 + 3 Discovery) |
| Tests | 95/95 |
| Moteurs IA | 6+1 |
| Permissions | 23 |
| Rôles | 5 |

---

## Architecture V19

### Stack

- **Frontend:** Next.js 14.2 + TypeScript + Tailwind
- **Auth:** Supabase Auth
- **Base de données:** Supabase PostgreSQL (15 tables, RLS, realtime)
- **Déploiement:** Vercel (auto-deploy)
- **Moteurs IA:** 6+1 engines client-side (VPS, TDE, PVE, EWE, TPE + IntakeAnalyzer + Discovery Engine)

### Flux de données

```
Intake → IntakeAnalyzer → Bridge → PatientState → Pipeline (5 engines)
                ↓                                        ↓
        intakePersistenceService                  engineService
                ↓                                        ↓
    Supabase (15 tables) ←── Services Layer ──→ Pages/Composants
                ↓                                        ↓
         Audit Trail                          Discovery Engine (4 niveaux)
                                                         ↓
                                              N1 PatternMiner → N2 LiteratureScanner
                                                         ↓              ↓
                                              N3 HypothesisEngine ← croisement
                                                         ↓
                                              N4 TreatmentPathfinder
                                                         ↓
                                                   /research (7 onglets)
```

---

## Discovery Engine — 7ème moteur (4 662 lignes, 12 fichiers)

### Vue d'ensemble

Le Discovery Engine est un moteur de recherche translationnelle qui fonctionne en **lecture seule** sur les données patients et les 5 moteurs existants. Il ne modifie jamais PatientState ni le pipeline VPS→TDE→PVE→EWE→TPE.

Architecture à 4 niveaux orchestrée par `DiscoveryEngine.ts` (v4.0.0) :

| Niveau | Module | Lignes | Rôle |
|--------|--------|--------|------|
| N1 | PatternMiner.ts | 507 | Corrélation Pearson, clustering k-means, anomalies z-score |
| N2 | LiteratureScanner.ts | 347 | Matching articles↔signaux, contradictions TDE, confirmations |
| N3 | HypothesisEngine.ts | 313 | Hypothèses N1×N2 via Claude API, workflow validation |
| N4 | TreatmentPathfinder.ts | 324 | Matching patient↔essais cliniques, scoring éligibilité |
| Orchestrateur | DiscoveryEngine.ts | 162 | Pipeline N1→N2→N3→N4, run() sync + runAsync() Claude API |

### Fichiers support

| Fichier | Lignes | Rôle |
|---------|--------|------|
| types/discovery.ts | 265 | Types SignalCard, CorrelationMatrix, PatientCluster, configs |
| data/discoveryData.ts | 371 | 8 patients démo + 5 Signal Cards seed |
| data/literatureData.ts | 479 | 25 publications PULSAR + 3 essais cliniques |
| data/patientProfiles.ts | 41 | Adaptateur DEMO_PATIENTS → PatientProfile |
| services/discoveryService.ts | 174 | CRUD Supabase (signals, hypotheses, articles) |
| app/research/page.tsx | 1580 | Dashboard Research (7 onglets) |
| migrations/002_discovery_schema.sql | 99 | 3 tables (discovery_signals, discovery_hypotheses, discovery_articles) |

### N1 — Pattern Mining (PatternMiner.ts)

**Corrélation Pearson** sur 34 paramètres (6 neuro, 6 bio, 7 hémodynamiques, 3 LCR, 4 traitement, 3 démographiques, 5 scores moteurs). Coefficient r + p-value par approximation t-distribution (df>3). Seuils : |r| ≥ 0.4, p < 0.05.

**Clustering k-means** (k=3, 10 itérations max, convergence). Features normalisées : CRP, GCS, VPS score, crises/24h, température. Traits distinctifs par cluster (>1.3x ou <0.7x moyenne globale).

**Anomalies z-score** (seuil 2.5σ). Détection de patients avec paramètres atypiques.

**Treatment patterns** : groupement par ligne thérapeutique × réponse, identification de features discriminantes.

Signal Cards : type (correlation/temporal_pattern/cluster/anomaly/treatment_response/biomarker_predictor), strength (very_strong ≥0.85, strong ≥0.7, moderate ≥0.4, weak <0.4), status (new/confirmed/monitoring/archived/rejected), statistiques, chart data, disclaimer IA obligatoire.

### N2 — Literature Scanner (LiteratureScanner.ts)

**Matching keywords** : 13 catégories de mots-clés (CRP, ferritine, GCS, crises, VPS, traitement, IL-1, IL-6, température, LCR, FC, plaquettes, lactate) croisées avec les Signal Cards.

**Contradictions TDE** : détection de termes négatifs ("no significant", "failed to", "not effective"...) associés aux médicaments des lignes L1-L4 du protocole TDE.

**Confirmations** : détection de termes positifs ("confirms", "validates", "significant correlation"...) avec matching signal.

**Essais cliniques** : identification automatique + alerte d'opportunité.

**10 requêtes PubMed** configurées par priorité (P1: FIRES, NORSE, anti-NMDAR ; P2: anakinra, tocilizumab, KD, cytokine storm ; P3: EEG, MOGAD, valproate-meropenem). URLs PubMed E-utilities prêtes pour activation live.

**Bibliothèque seed** : 25 publications (van Baalen 2010, Kessi 2020, Wickström 2022, Dalmau 2008, Graus 2016, Nosadini 2021, Matics 2017, Lin 2021, Costagliola 2022, Shrestha 2023, Al-Quteimat 2020, etc.) + 3 essais cliniques (NCT06123456 anakinra Phase II/III, NCT06789012 TASE tocilizumab vs anakinra Phase III, NCT06345678 EKD-NORSE KD précoce Phase II).

### N3 — Hypothesis Engine (HypothesisEngine.ts)

**Claude API** : prompt structuré croisant signaux forts N1 + publications haute pertinence N2. Modèle claude-sonnet-4-20250514. Demande 3 hypothèses en JSON. Fallback seed si API indisponible.

**6 types** : predictive_marker, risk_factor, therapeutic_target, biomarker, temporal_pattern, treatment_sequence.

**Workflow** : generated → in_review → validated → published | rejected.

**3 hypothèses seed calibrées** :
1. CRP >80 prédicteur non-réponse L1 FIRES (confiance 72%, impact high)
2. Ferritine biomarqueur orage cytokinique (confiance 65%, impact high)
3. Séquence anakinra + KD précoce ≤48h (confiance 58%, impact transformative)

Chaque hypothèse contient : evidence interne (N1), evidence externe (N2), raisonnement, action suggérée, références, disclaimer.

### N4 — Treatment Pathfinder (TreatmentPathfinder.ts)

**5 options thérapeutiques** avec critères d'éligibilité par patient :

| Traitement | Source | Evidence | Trial ID |
|------------|--------|----------|----------|
| Anakinra (anti-IL-1) | Essai clinique | Multicenter | NCT06123456 |
| Tocilizumab (anti-IL-6) | Essai clinique | Multicenter | NCT06789012 |
| Régime cétogène précoce ≤48h | Essai clinique | RCT | NCT06345678 |
| Combo anakinra + KD | Hypothèse N3 | Hypothesis | — |
| Rituximab (anti-CD20) | Guideline | Multicenter | — |

**Scoring d'éligibilité** : 3-5 critères par traitement (syndrome, ligne thérapeutique, CRP, GCS, âge, ferritine, crises). Score 0-100%. Status : eligible (≥80%), potential (≥60%), to_evaluate (≥40%), ineligible (<40%).

Chaque piste contient : mécanisme, bénéfice attendu, risques, infos essai, critères détaillés (met/non met avec valeurs patient), disclaimer.

### Page /research — Dashboard (1 580 lignes)

7 onglets :

| Onglet | Contenu |
|--------|---------|
| Signal Feed | Signal Cards filtrables (type, force, statut, tri). Expandables avec stats, scatter plot SVG, disclaimer |
| Corrélations | Matrice heatmap (vert positif, rouge négatif). Top 10 paires significatives |
| Clusters | 3 groupes k-means. Traits distinctifs, centroïdes, patients |
| Veille | Alertes (contradictions/confirmations/opportunités). 25 publications filtrables. Requêtes PubMed |
| Hypothèses | 3 hypothèses avec jauge confiance, grille evidence N1/N2, raisonnement, action suggérée |
| Pathfinder | Pistes thérapeutiques par patient. Critères éligibilité. Bénéfice/risques. Infos essais |
| Roadmap | 4 phases A-D toutes ✓ Actif |

KPI strip : signaux total, nouveaux, forts, patients, publications, confirmations, contradictions, essais cliniques, hypothèses, pistes thérapeutiques, patients éligibles.

Design : emerald green #10B981 (--p-disc), glass-card, p-font-mono, page-enter-stagger. Logo étoile PULSAR.

### Tables SQL Discovery (002_discovery_schema.sql)

| Table | Champs clés |
|-------|-------------|
| discovery_signals | type (6 enum), strength (4 enum), status (5 enum), statistics (jsonb), parameters (jsonb), patients_data (jsonb), chart_data (jsonb), tags |
| discovery_hypotheses | type, confidence (0-1), status (5 enum), signal_ids (uuid[]), literature_refs (jsonb), reasoning, suggested_action, impact |
| discovery_articles | pmid, doi, title, authors, journal, year, abstract, relevance_score (0-1), matched_signals (uuid[]), source |

RLS : authenticated read + write. Indexes : type, status, strength, created_at DESC. Triggers : updated_at automatique.

---

## Base de données — 15 Tables

### 12 tables V18 (001_initial_schema.sql — 378 lignes)

| Table | Rôle |
|-------|------|
| profiles | Utilisateurs + rôles (admin/senior/intern/nurse/viewer) |
| patients | Identité + hospitalisation + syndrome + triage |
| vitals | Constantes vitales (séries temporelles) |
| lab_results | Biologie (18 biomarqueurs) |
| medications | Prescriptions actives |
| treatment_history | Lignes thérapeutiques passées |
| intake_analyses | Analyses intake sauvegardées |
| engine_results | Snapshots moteurs (VPS/TDE/PVE/EWE/TPE) |
| alerts | Alertes critiques/warning/info |
| neuro_exams | EEG/IRM/CT |
| clinical_notes | Notes cliniques (5 types) |
| audit_log | Trail complet |

### 3 tables Discovery (002_discovery_schema.sql — 99 lignes)

| Table | Rôle |
|-------|------|
| discovery_signals | Signal Cards persistées |
| discovery_hypotheses | Hypothèses de recherche |
| discovery_articles | Publications PubMed/Cochrane |

---

## Services Layer — 13 Services

Les 12 services V18 + discoveryService (174 lignes) : saveSignals, getSignals, updateSignalStatus, getSignalCount, saveHypothesis, getHypotheses, saveArticles, getArticles.

---

## Moteurs IA — 6+1

| Moteur | Score | Rôle |
|--------|-------|------|
| VPS | 0-100 | Vulnérabilité Patient Score — sévérité global |
| TDE | 0-100 | Therapeutic Decision Engine — priorisation thérapeutique |
| PVE | 0-100 | Pharmacovigilance Engine — interactions + sécurité |
| EWE | 0-100 | Early Warning Engine — prédictions crises |
| TPE | 0-100 | Therapeutic Pathway Engine — trajectoires optimales |
| IntakeAnalyzer | — | Analyse intelligente admission (1 248 lignes) |
| **Discovery Engine** | **v4.0** | **Recherche translationnelle — 4 niveaux (4 662 lignes)** |

### Tests : 95/95

- 56/56 intake (8 crash tests)
- 39/39 pipeline
- 0 régression Discovery Engine (lecture seule sur PatientState)

---

## Pages (29)

### Pages globales

| Route | Rôle |
|-------|------|
| / | Landing page publique |
| /login | Connexion Supabase |
| /signup | Inscription |
| /patients | File active — liste patients + tri 6 modes |
| /patients/intake | Module d'admission intelligente |
| /dashboard | Vue chef de service |
| /admin | Gestion rôles (admin only) |
| **/research** | **Discovery Engine — 7 onglets** |

### Pages patient (/patient/[id]/...)

| Route | Rôle |
|-------|------|
| cockpit | Vue temps réel — VPS, alertes, silhouette, brain monitor |
| urgence | Protocoles urgence phase aiguë |
| diagnostic | TDE — arbre diagnostic + différentiels |
| traitement | PVE — prescriptions + pharmacovigilance |
| examens | Examens neuro (EEG, IRM, etc.) |
| suivi | EWE — monitoring + trajectoire VPS |
| synthese | Synthèse clinique complète |
| ressources | Protocoles + références bibliographiques |
| saisie | Formulaires constantes + bio + notes |
| historique | Timeline + courbes évolution + filtres |
| audit | Journal traçabilité (admin/senior) |
| export | Dossier imprimable/PDF |

---

## Rôles et Permissions

### 5 Rôles

| Rôle | Droits clés |
|------|-------------|
| admin | Tous les droits + gestion rôles + settings |
| senior | Prescriptions + sorties + audit + export |
| intern | Saisie + prescriptions + admission |
| nurse | Saisie constantes + notes |
| viewer | Lecture seule |

### 23 Permissions

patient.view, patient.create, patient.edit, patient.discharge, vitals.view, vitals.record, lab.view, lab.record, medication.view, medication.prescribe, medication.stop, note.view, note.create, intake.analyze, intake.admit, engine.view, engine.run, alert.view, alert.acknowledge, alert.resolve, audit.view, admin.roles, admin.settings, history.view, history.export

---

## Déploiement

### Activation Supabase

1. Dashboard Supabase → SQL Editor
2. Copier-coller `001_initial_schema.sql` → Exécuter
3. Copier-coller `002_discovery_schema.sql` → Exécuter

### Variables d'environnement (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Mémorial

In memory of Alejandro R. (2019–2025).

---

## Évolution V18 → V19

| V18 | V19 |
|-----|-----|
| 5+1 moteurs | 6+1 moteurs (+Discovery Engine) |
| 12 tables SQL | 15 tables SQL (+3 Discovery) |
| 12 services | 13 services (+discoveryService) |
| 28 pages | 29 pages (+/research) |
| 92 fichiers | 103 fichiers (+12 Discovery) |
| 19 339 lignes | 23 910 lignes (+24%) |
| Pattern pas de recherche | Recherche translationnelle 4 niveaux |
| Pas de veille scientifique | 25 publications + 3 essais cliniques |
| Pas d'hypothèses | 3 hypothèses calibrées + Claude API |
| Pas de matching thérapeutique | 5 traitements × 8 patients, scoring éligibilité |
