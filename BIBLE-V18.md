# PULSAR V18 — Bible Technique Complète

**Version:** 18.0 — Persistance Supabase + Hospital-Ready
**Date:** 2 mars 2026
**Auteur:** Steve Moradel
**Statut:** Production — Build clean — 95/95 tests
**Prod:** pulsar-j63q.vercel.app
**GitHub:** SteveMrld/Pulsar

---

## Métriques

| Métrique | Valeur |
|----------|--------|
| Lignes TypeScript/TSX | 19 339 |
| Fichiers | 92 |
| Pages | 28 |
| Services Supabase | 12 |
| Tables SQL | 12 |
| Tests | 95/95 |
| Moteurs IA | 5+1 |
| Permissions | 23 |
| Rôles | 5 |

---

## Architecture V18

### Stack

- **Frontend:** Next.js 14.2 + TypeScript + Tailwind
- **Auth:** Supabase Auth
- **Base de données:** Supabase PostgreSQL (12 tables, RLS, realtime)
- **Déploiement:** Vercel (auto-deploy)
- **Moteurs IA:** 5+1 engines client-side (VPS, TDE, PVE, EWE, TPE + IntakeAnalyzer)

### Flux de données

```
Intake → IntakeAnalyzer → Bridge → PatientState → Pipeline (5 engines)
                ↓                                        ↓
        intakePersistenceService                  engineService
                ↓                                        ↓
    Supabase (12 tables) ←── Services Layer ──→ Pages/Composants
                ↓
         Audit Trail (automatique)
```

---

## Base de données — 12 Tables

### Schema: supabase/migrations/001_initial_schema.sql (378 lignes)

| Table | Rôle | Champs clés |
|-------|------|-------------|
| profiles | Utilisateurs + rôles | role (admin/senior/intern/nurse/viewer), service, hospital |
| patients | Identité + hospitalisation | display_name, age_months, sex, syndrome, phase, triage, medical_history (jsonb) |
| vitals | Constantes vitales (séries temporelles) | gcs, pupils, seizures_24h, heart_rate, spo2, temp |
| lab_results | Biologie | crp, pct, ferritin, wbc, platelets, lactate, csf_*, Na, K, glycemia, créat, AST/ALT, troponin, D-dimères, pro-BNP |
| medications | Prescriptions actives | drug_name, dose, route, frequency, is_active |
| treatment_history | Lignes thérapeutiques passées | treatment, line_number, response (none/partial/good/complete) |
| intake_analyses | Analyses intake sauvegardées | intake_data, urgency_score, differentials, red_flags, triage |
| engine_results | Snapshots moteurs | engine (VPS/TDE/PVE/EWE/TPE), score, level, result_data (jsonb) |
| alerts | Alertes critiques/warning/info | title, body, severity, acknowledged_*, resolved_* |
| neuro_exams | EEG/IRM/CT/etc | exam_type, status, findings (jsonb), raw_report |
| clinical_notes | Notes cliniques | note_type (observation/prescription/decision/handoff/family), content |
| audit_log | Trail complet | user_id, action, entity_type, entity_id, details (jsonb), ip_address |

### RLS Policies

- **profiles:** Tous lisent, chacun modifie le sien
- **patients:** Authenticated read, senior/intern/admin write
- **Données cliniques:** Authenticated read + write
- **audit_log:** Admin read only, tous écrivent

### Realtime

Activé sur: patients, vitals, alerts

---

## Services Layer — 12 Services (1 608 lignes)

| Service | Lignes | Fonctions principales |
|---------|--------|----------------------|
| patientService | 197 | getActive, getById, create, update, discharge, transfer, updateTriage, subscribeToChanges |
| vitalsService | 102 | record, getLatest, getHistory, getGcsHistory, subscribeToPatient |
| labService | 82 | record, getLatest, getHistory, getTrend |
| medicationService | 124 | prescribe, getActive, stop, getAll, recordTreatment, getTreatmentHistory |
| engineService | 84 | saveResults, getLatest, getLatestAll, getScoreHistory |
| alertService | 151 | create, createFromEngineAlerts, getActive, getAllCritical, acknowledge, resolve, countBySeverity |
| noteExamService | 139 | noteService (create, getByPatient, getByType, getHandoffs) + examService (record, getByPatient, getLatestByType) |
| profileService | 96 | getCurrent, getById, getAll, updateCurrent, setRole, hasMinRole |
| auditService | 42 | logAudit — appelé par tous les autres services |
| intakePersistenceService | 250 | admitFromIntake (décompose IntakeData en 6 tables), loadForEngines (reconstruit patientData) |
| historyService | 325 | getFullHistory (8 tables → timeline), getScoreEvolution, getGcsEvolution |
| index | 16 | Export centralisé |

---

## Moteurs IA — 5+1 (hérités de V17.3)

| Moteur | Score | Rôle |
|--------|-------|------|
| VPS | 0-100 | Vulnérabilité Patient Score — score de sévérité global |
| TDE | 0-100 | Therapeutic Decision Engine — priorisation thérapeutique |
| PVE | 0-100 | Pharmacovigilance Engine — interactions + sécurité |
| EWE | 0-100 | Early Warning Engine — prédictions crises/détérioration |
| TPE | 0-100 | Therapeutic Pathway Engine — trajectoires optimales |
| IntakeAnalyzer | — | Analyse intelligente à l'admission (1 248 lignes) |

### Triage

- **computeTriage():** 6 facteurs intake
- **computeTriageFromPipeline():** 6 facteurs pipeline
- Niveaux: P1 (critique) / P2 (urgent) / P3 (semi-urgent) / P4 (stable)
- Bridge intakeToPatientState: 217 lignes

### Tests

- 56/56 intake tests (8 crash tests)
- 39/39 pipeline tests
- **95/95 total**

---

## Pages (28)

### Pages globales

| Route | Rôle |
|-------|------|
| / | Landing page publique |
| /login | Connexion Supabase |
| /signup | Inscription |
| /patients | File active — liste patients + tri 6 modes |
| /patients/intake | Module d'admission intelligente |
| /dashboard | Vue chef de service — stats, alertes, triage |
| /admin | Gestion rôles utilisateurs (admin only) |

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
| saisie | **V18** — Formulaires constantes + bio + notes |
| historique | **V18** — Timeline + courbes évolution + filtres |
| audit | **V18** — Journal traçabilité (admin/senior) |
| export | **V18** — Dossier imprimable/PDF |

---

## Composants V18 nouveaux

| Composant | Lignes | Rôle |
|-----------|--------|------|
| VitalsForm | 182 | Saisie GCS, pupilles, crises, FC, PA, SpO₂, T°, FR |
| LabForm | 160 | 18 biomarqueurs en 5 sections |
| NoteForm | 95 | 5 types de notes cliniques |
| DossierSummary | 140 | Vue synthétique pour transmissions |
| RoleGate | 80 | Affichage conditionnel par permission + RoleBadge + AccessDenied |
| ErrorBoundary | 115 | Error boundary React + safeAsync + withRetry |
| ConnectionStatus | 70 | Détection online/offline + health check Supabase |

---

## Rôles et Permissions

### 5 Rôles

| Rôle | Droits clés |
|------|-------------|
| admin | Tous les droits + gestion rôles + settings |
| senior | Prescriptions + sorties + audit + export |
| intern | Saisie + prescriptions + admission |
| nurse | Saisie constantes + notes (pas de prescription) |
| viewer | Lecture seule |

### 23 Permissions

patient.view, patient.create, patient.edit, patient.discharge, vitals.view, vitals.record, lab.view, lab.record, medication.view, medication.prescribe, medication.stop, note.view, note.create, intake.analyze, intake.admit, engine.view, engine.run, alert.view, alert.acknowledge, alert.resolve, audit.view, admin.roles, admin.settings, history.view, history.export

---

## Déploiement

### Activation Supabase

1. Dashboard Supabase → SQL Editor
2. Copier-coller `001_initial_schema.sql`
3. Exécuter

### Push GitHub

```bash
cd Pulsar
git push origin main
```

### Variables d'environnement (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Mémorial

In memory of Alejandro R. (2019–2025).

---

## Évolution V17 → V18

| V17.3 | V18 |
|-------|-----|
| intakeStore (mémoire) | Supabase (12 tables) |
| Pas de persistance | Persistance complète |
| Pas de rôles | 5 rôles, 23 permissions |
| Pas de saisie | Formulaires constantes + bio + notes |
| Pas d'historique | Timeline + courbes + audit trail |
| Pas de dashboard | Dashboard chef de service |
| Pas d'export | Dossier imprimable/PDF |
| 14 835 lignes | 19 339 lignes (+30%) |
| 65 fichiers | 92 fichiers (+41%) |
