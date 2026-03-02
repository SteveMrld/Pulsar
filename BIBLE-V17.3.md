# PULSAR V17.3 — BIBLE TECHNIQUE

> Pediatric Universal Lateralized Surveillance & Alert Runtime
> Production : [pulsar-j63q.vercel.app](https://pulsar-j63q.vercel.app)
> GitHub : [SteveMrld/Pulsar](https://github.com/SteveMrld/Pulsar) (branche `main`)
> Date : 1er mars 2026
> In memory of Alejandro R. (2019–2025)

---

## 1. IDENTITÉ

| Champ | Valeur |
|---|---|
| Stack | Next.js 14.2 + TypeScript + Supabase Auth + Vercel |
| Design | Custom CSS tokens (pas de Tailwind), inline styles, Picto SVG |
| Fonts | Mono pour médical/technique, body pour prose |
| Thème | Dark-first, tokens `--p-*`, glass-card morphism |
| Deploy | Vercel auto-deploy sur push `main` |
| Build | `npm run build` — 0 erreur, 0 warning |
| Tagline landing | "L'intelligence clinique qui devance l'urgence" |

---

## 2. ARCHITECTURE

### 2.1 Métriques globales

| Métrique | Valeur |
|---|---|
| Fichiers source | 65 (.ts/.tsx) |
| Lignes de code | 14 835 |
| Routes (pages) | 22 |
| Routes patient dynamiques | 9 (`/patient/[id]/*`) |
| Composants réutilisables | 10 |
| Moteurs d'analyse | 5+1 (VPS, TDE, PVE, EWE, TPE + BrainCore) |
| IntakeAnalyzer | 1 248 lignes |
| NeuroCore KB | 1 023 lignes |
| Tests automatisés | 95 checks (95 pass, 0 fail) |
| Patients démo | 4 (Inès, Lucas, Amara, Noah) |

### 2.2 Arborescence routes

```
/                          Landing page
/login                     Authentification Supabase
/signup                    Inscription
/patients                  File active (tour de contrôle)
/patients/intake           Analyse Intelligente (formulaire admission)
/patients/admission        Admission classique
/patient/[id]/cockpit      Cockpit patient (page d'accueil)
/patient/[id]/urgence      Mode urgence
/patient/[id]/diagnostic   Diagnostic IA multi-pathologique
/patient/[id]/traitement   Recommandations thérapeutiques
/patient/[id]/suivi        Monitoring + courbes
/patient/[id]/examens      Bilan paraclinique
/patient/[id]/synthese     Synthèse clinique
/patient/[id]/ressources   Références + protocoles
/observatory               Vue globale multi-patients
/neurocore                 Base de connaissances neuro
/case-matching             Cas similaires registre
/cross-pathologie          Analyse croisée pathologies
/bilan                     Bilan d'examens
/export                    Export données
/staff                     Experts / équipe
```

### 2.3 Composants

| Composant | Lignes | Rôle |
|---|---|---|
| BrainMonitor | 578 | Moniteur ICU temps réel (waveforms, vitaux, EEG) |
| EngineDetailView | 309 | Vue détaillée résultat moteur (intention/context/rules/curve) |
| PulsarAI | 295 | Assistant IA intégré |
| SilhouetteNeon | 294 | Silhouette anatomique avec hotspots vitaux |
| BrainHeatmap | 209 | Heatmap cérébrale zones affectées |
| PulsarAIFloat | 143 | Bouton flottant assistant IA |
| Picto | 138 | Système d'icônes SVG unifié (20+ pictos néon GPT) |
| PatientHeader | 124 | Header patient avec phase, VPS, navigation |
| AppShell | 119 | Layout principal avec sidebar/topbar |
| ThemeToggle | 37 | Toggle dark/light |

---

## 3. MOTEURS D'ANALYSE

### 3.1 Pipeline

Ordre d'exécution : `VPS → TDE → TPE → PVE → EWE`

Chaque moteur produit un `EngineResult` unifié :
- **Intention** : fields (signaux normalisés) + patterns (signatures détectées)
- **Context** : tendance + contextModifier multiplicateur
- **Rules** : gardes, corrections, validations
- **Curve** : trajectoire, position, trend
- **Synthesis** : score 0-100, level, alertes, recommandations

### 3.2 Détail moteurs

| Moteur | Lignes | Score | Rôle |
|---|---|---|---|
| **VPS** (Vital Prognosis) | 294 | 0-100 | Pronostic vital composite : neuro 40% + bio 25% + hémo 20% + contexte 15% |
| **TDE** (Therapeutic Decision) | 224 | 0-100 | Décision thérapeutique : patterns pathologiques, lignes de traitement |
| **TPE** (Therapeutic Prospection) | 278 | 0-100 | Prospection : hypothèses immunothérapie, cytokines, escalade |
| **PVE** (Paraclinical Vigilance) | 225 | 0-100 | Pharmacovigilance : interactions, cocktails critiques, ajustements |
| **EWE** (Early Warning) | 277 | 0-100 | Alerte précoce : fenêtres de risque, trajectoire prédictive |
| **BrainCore** | 172 | 0-100 | Score neuro-inflammatoire composite |

### 3.3 IntakeAnalyzer V17.3

1 248 lignes — Moteur d'analyse à l'admission.

**Entrées** : IntakeData (identité, neuro, bio, constantes, imagerie, ATCD, transfert)

**Sorties** (IntakeAnalysis) :
- `urgencyScore` (0-100) + `urgencyLevel` (critical/high/moderate/low)
- `differentials[]` : diagnostic différentiel multi-syndromique avec confiance
- `redFlags[]` : signaux d'alarme (GCS, status, mydriase, lactate, ATCD critiques)
- `historyAlerts[]` : 34 paramètres ATCD scannés, implications cliniques
- `examRecommendations[]` + `examGaps[]` : gap analysis bilan
- `similarCases[]` : cas registre proches
- `engineReadiness[]` : état de préparation des 5 moteurs
- `triage` : score composite P1-P4 (voir §5)
- `clinicalSummary` : résumé texte

**ATCD couverts** (34) : drépanocytose, méningite, encéphalite, herpès, COVID, épilepsie, immunodéficience, auto-immunité, convulsions fébriles, prématurité, retard développemental, allergies, consanguinité, ATCD familiaux, infection récente, tératome ovarien, VIH, cancer, tuberculose, ADEM, névrite optique, myélite, voyage tropical, piqûre tique, transplant, hydrocéphalie, EBV/CMV, diabète T1, Kawasaki, TSA, trauma crânien récent...

### 3.4 NeuroCore KB

5 syndromes neuro-inflammatoires pédiatriques :
- **FIRES** : Febrile Infection-Related Epilepsy Syndrome
- **EAIS** (Anti-NMDAR) : Encéphalite auto-immune anti-NMDAR
- **NORSE** : New-Onset Refractory Status Epilepticus
- **MOGAD** : Myelin Oligodendrocyte Glycoprotein Antibody Disease
- **PIMS** (MIS-C) : Syndrome inflammatoire multi-systémique post-COVID

Chaque syndrome : critères diagnostiques pondérés (major/minor/supportive), red flags globaux, examens recommandés.

---

## 4. PATIENTS

### 4.1 Patients démo

| Patient | Syndrome | VPS | Triage | GCS | Jour |
|---|---|---|---|---|---|
| Inès M. (4 ans, F) | FIRES | 92 | P1 (87) | 7 | J4 |
| Amara T. (8 ans, F) | MOGAD/Cytokine | 98 | P1 (91) | 10 | J5 |
| Lucas R. (14 ans, M) | Anti-NMDAR | 18 | P4 (24) | 11 | J7 |
| Noah B. (6 ans, M) | Épilepsie focale | 2 | P4 (1) | 14 | J2 |

Avatars GPT : `/assets/avatars/avatar-{ines,lucas,amara,noah}.png`

### 4.2 Patients dynamiques

Créés via Analyse Intelligente (intake). Stockage client-side via `intakeStore.ts` (Map partagée, persiste pendant la session).

Format ID : `intake-{timestamp36}-{counter}`

Flux complet :
1. Formulaire intake (identité + neuro + bio + imagerie + ATCD)
2. IntakeAnalyzer analyse en temps réel
3. Bouton "Admettre" → `intakeToPatientState()` bridge
4. Patient ajouté au store → redirect cockpit
5. PatientContext charge depuis store → pipeline 5 moteurs
6. Patient visible dans file active

### 4.3 Phases cliniques

| Phase | Jours | VPS | Couleur | Description |
|---|---|---|---|---|
| Acute | J0–J3 | ≥70 override | #FF4757 | Urgence, stabilisation, bilan initial |
| Stabilization | J3–J7 | 50-70 | #FFB347 | Ajustement thérapeutique |
| Monitoring | J7–J14 | 30-50 | #6C7CFF | Suivi évolutif, réévaluation |
| Recovery | J14+ | <30 | #2ED573 | Consolidation, préparation sortie |

---

## 5. SYSTÈME DE TRIAGE

### 5.1 Triage Intake (`computeTriage`)

Score composite 0-100 calculé depuis IntakeAnalysis :

| Facteur | Points max | Source |
|---|---|---|
| Urgence clinique | 50 | urgencyScore × 0.50 |
| Red flags | 15 | critiques ×4, warnings ×2 |
| Antécédents | 10 | ATCD critiques ×4, warnings ×1 |
| Examens en attente | 10 | immédiats ×3, urgents ×1 |
| Gaps diagnostiques | 10 | critiques ×5, élevés ×2 |
| Incertitude diagnostique | 5 | top 2 diagnostics proches en confiance |

### 5.2 Triage Pipeline (`computeTriageFromPipeline`)

Score composite 0-100 calculé depuis PatientState post-pipeline :

| Facteur | Points max | Source |
|---|---|---|
| Gravité clinique | 50 | VPS × 0.50 |
| Alertes moteurs | 15 | critiques ×4, warnings ×2 |
| Neuro critique | 10 | GCS, status, crises |
| Instabilité hémodynamique | 10 | SpO₂, MAP, T°, lactate |
| Risque évolutif | 10 | EWE × 0.10 |
| Actions urgentes | 5 | recommandations urgentes ×2 |

### 5.3 Niveaux de priorité

| Priorité | Score | Label | Délai max | Couleur |
|---|---|---|---|---|
| **P1** | ≥75 | Immédiat | < 15 min | #FF4757 |
| **P2** | ≥50 | Urgent | < 30 min | #FFA502 |
| **P3** | ≥25 | Semi-urgent | < 1h | #FFB347 |
| **P4** | <25 | Standard | File normale | #2ED573 |

### 5.4 Affichage

- **Intake** : panneau triage sous la jauge d'urgence (badge P1-P4 + score + facteurs)
- **File active** : colonne triage dans chaque PatientRow
- **Cockpit** : badge triage à droite du titre (facteurs en tooltip)
- **Tri file active** : 6 modes (triage, VPS, GCS, alertes, phase, jour)

---

## 6. BRIDGE INTAKE → PATIENTSTATE

`intakeToPatientState.ts` (217 lignes) — Convertit IntakeData + IntakeAnalysis en données constructeur PatientState.

Mappings :
- **Démographiques** : ageMonths, weightKg, hospDay=1, sex
- **Neuro** : gcs, gcsHistory, pupils, seizures24h, seizureDuration, seizureType
- **Biologie** : crp, pct, ferritin, wbc, platelets, lactate
- **Hémodynamique** : heartRate, sbp, dbp, spo2, temp, respRate
- **LCR** : csfCells, csfProtein, csfAntibodies
- **Médicaments** : drugs[], treatmentHistory[]
- **MOGAD data** : previousADEM, opticNeuritis, myelitis
- **PIMS data** : recentCovid, previousKawasaki
- **EEG** : eegDone + status mapping
- **IRM** : mriDone + findings mapping

---

## 7. TESTS

### 7.1 Pipeline Crash Tests (5 cas × 5 moteurs)

| Cas | Checks | Résultat |
|---|---|---|
| FIRES | 11 | 11/11 ✓ |
| NMDAR | 6 | 6/6 ✓ |
| CYTOKINE | 8 | 8/8 ✓ |
| REBOND | 6 | 6/6 ✓ |
| STABLE | 8 | 8/8 ✓ |
| **Total** | **39** | **39/39 ✓** |

### 7.2 Intake Crash Tests (8 scénarios)

| Cas | Checks | Ce qu'il vérifie |
|---|---|---|
| INTAKE_FIRES | 13 | Urgence critical, FIRES top 3, red flags, triage P1/P2 |
| INTAKE_NMDAR_TERATOME | 7 | NMDAR 91%, alertes tératome+herpès, triage P2/P3 |
| INTAKE_MINIMAL | 6 | Pas de crash données vides, triage P4 |
| INTAKE_TRANSFER | 5 | Mode transfert, gaps EEG/IRM |
| INTAKE_DREPANO | 4 | Drépanocytose fébrile, red flag critique |
| INTAKE_TROPICAL_HIV | 4 | VIH + tropical + fièvre, 3 red flags |
| BRIDGE_FIRES | 9 | 9 champs mappés correctement |
| FULLFLOW_NMDAR | 8 | Pipeline 5 moteurs complet, aucun crash |
| **Total** | **56** | **56/56 ✓** |

**Bilan global : 95/95 (100%)**

Commande : `npx tsx src/lib/engines/runTests.ts`

---

## 8. DESIGN SYSTEM

### 8.1 Tokens CSS

```
--p-bg, --p-bg-card, --p-bg-elevated
--p-text, --p-text-dim, --p-text-muted
--p-border, --p-radius-md, --p-radius-lg, --p-radius-xl, --p-radius-full
--p-font-mono, --p-font-body
--p-critical (#FF4757), --p-critical-bg
--p-space-3, --p-space-4
--p-ease (transition easing)
```

### 8.2 Couleurs sémantiques

| Couleur | Hex | Usage |
|---|---|---|
| Rouge | #FF4757 | Critique, P1, VPS≥70 |
| Orange | #FFA502 | Warning, P2, VPS 50-70 |
| Orange clair | #FFB347 | P3, VPS 30-50, TPE |
| Bleu indigo | #6C7CFF | VPS engine, primaire UI |
| Violet | #B96BFF | PVE, NCE |
| Cyan | #2FD1C8 | TDE, monitoring |
| Rose | #FF6B8A | EWE, cardiaque |
| Vert | #2ED573 | P4, stable, recovery |

### 8.3 Conventions

- **Pas de Tailwind** — CSS tokens + inline styles
- **Picto** pour toutes les icônes (SVG inline, props: name, size, glow, glowColor)
- **Mono** pour tout le contenu médical/technique
- **glass-card** + **card-interactive** classes CSS
- **animate-breathe** pour éléments pulsants critiques
- 20 pictos néon GPT + 4 avatars patients + logo intégrés

---

## 9. FICHIERS CLÉS

### 9.1 Moteurs & Analyse

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/lib/engines/IntakeAnalyzer.ts` | 1 248 | Analyse intake + triage |
| `src/lib/engines/intakeCrashTests.ts` | 436 | 8 scénarios de test intake |
| `src/lib/engines/VPSEngine.ts` | 294 | Pronostic vital |
| `src/lib/engines/TPEEngine.ts` | 278 | Prospection thérapeutique |
| `src/lib/engines/EWEEngine.ts` | 277 | Alerte précoce |
| `src/lib/engines/PatientState.ts` | 267 | Objet patient central |
| `src/lib/engines/PVEEngine.ts` | 225 | Pharmacovigilance |
| `src/lib/engines/TDEEngine.ts` | 224 | Décision thérapeutique |
| `src/lib/engines/intakeToPatientState.ts` | 217 | Bridge intake → PatientState |
| `src/lib/engines/crashTests.ts` | 188 | Tests pipeline 5 moteurs |
| `src/lib/engines/BrainCore.ts` | 172 | Score neuro-inflammatoire |
| `src/lib/engines/pipeline.ts` | 69 | Orchestrateur 5 moteurs |

### 9.2 Contextes & Store

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/contexts/PatientContext.tsx` | 364 | Provider patient, phases, timeline, tabs, triage |
| `src/lib/intakeStore.ts` | 61 | Store client-side patients dynamiques |

### 9.3 Pages principales

| Fichier | Rôle |
|---|---|
| `src/app/patients/page.tsx` | File active + tri 6 modes + triage badges |
| `src/app/patients/intake/page.tsx` | Formulaire Analyse Intelligente |
| `src/app/patient/[id]/cockpit/page.tsx` | Cockpit patient + badge triage |

---

## 10. V17.3 CHANGELOG

7 commits, 10 fichiers modifiés/créés, +1 227 lignes.

| # | Commit | Impact |
|---|---|---|
| 1 | Flux intake → patient → cockpit | intakeStore + intakeToPatientState + wiring 3 pages |
| 2 | Crash tests IntakeAnalyzer | 8 scénarios, 56/56 pass |
| 3 | Score de triage P1-P4 | computeTriage() 6 facteurs, affichage intake + file active |
| 4 | Badge triage cockpit | Conditionnel dans header cockpit |
| 5 | Triage auto patients démo | computeTriageFromPipeline(), 4 démos avec triage |
| 6 | Options de tri file active | 6 modes (triage/VPS/GCS/alertes/phase/jour) |
| 7 | Fix VPS calibration | Skip neuro-monitoring sans données EEG → 95/95 tests |

---

## 11. MIDDLEWARE & AUTH

`middleware.ts` : protection routes `/patient/*` et `/patients/*` via Supabase session.
Format ID patient intake `intake-xxx` compatible avec le matcher `path.startsWith('/patient/')`.
Pages publiques : `/`, `/login`, `/signup`.

---

## 12. CONVENTIONS DE DÉVELOPPEMENT

- Commits en français
- Build vérifié (`npm run build`) avant chaque commit
- Tests (`npx tsx src/lib/engines/runTests.ts`) avant push
- Pas de `localStorage` dans les artifacts
- Dynamic imports pour Recharts (SSR-safe)
- Types explicites, pas de `any` sauf `Record<string, any>` pour PatientState data
- Emojis → Pictos SVG (migration complète depuis V17)
