# PULSAR BIBLE V21.1
## Clinical Foresight Platform — Pédiatrie Neurologique

**Version** : V21.1 — Mars 2026
**Auteur** : Steve Moradel
**Prod** : https://pulsar-j63q.vercel.app
**GitHub** : SteveMrld/Pulsar
**Mémorial** : À la mémoire d'Alejandro R. (2019-2025)

---

## MÉTRIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Routes | 37 |
| Fichiers TS/TSX | 127 |
| Lignes totales | 31 406 |
| Lignes engines | 9 042 |
| Moteurs IA | 11 |
| Pages patient | 21 |
| Tests | 95/95 |
| Tables Supabase | 15 |
| i18n | FR/EN 100% |
| API routes | /api/pubmed, /api/trials, /api/drugs |

---

## 11 MOTEURS

### Pipeline principal (6 moteurs séquentiels)
1. **VPS** — Vital Priority Score (296 lignes) — Score 0-100, 4 niveaux
2. **TDE** — Therapeutic Decision Engine (300 lignes) — Patterns FIRES/NMDAR/MOGAD/PIMS, lignes thérapeutiques
3. **PVE** — Pharmacovigilance Engine (242 lignes) — Interactions, cocktails, cardiotoxicité
4. **EWE** — Early Warning Engine (302 lignes) — Fenêtres pré-critiques, signaux FIRES
5. **TPE** — Therapeutic Prospection Engine (326 lignes) — Hypothèses thérapeutiques innovantes
6. **NeuroCore** — BrainCore (172 lignes) — Cartographie cérébrale, biomarqueurs neuro

### Moteurs avancés (5 moteurs)
7. **Discovery Engine v4.0** — 4 niveaux (1 541 lignes total) :
   - N1 PatternMiner (507) — Pearson, k-means, z-score 2.5σ
   - N2 LiteratureScanner (347) — PubMed live, 10 requêtes
   - N3 HypothesisEngine (313) — Claude API, hypothèses
   - N4 TreatmentPathfinder (324) — ClinicalTrials.gov, chemins innovants
8. **FeedbackLoop** (618 lignes) — Snapshots anonymisés, Patient 0 (Alejandro), learnings
9. **Oracle** (568 lignes) — Simulation clinique, 4 scénarios à H+6/H+12/H+24/H+72
10. **DDD** — Diagnostic Delay Detector (442 lignes) — 8 règles, retards sourés, fenêtres
11. **CAE** — Cascade Alert Engine (586 lignes) — Effets en chaîne intervention × vulnérabilité × littérature

### Connecteur live
- **DrugDatabase** (338 lignes) — OpenFDA FAERS + BDPM ANSM, traduction FR→EN 50+ médicaments

---

## CAE — CASCADE ALERT ENGINE (Moteur 11)

### Né du cas Alejandro
MEOPA administré à un enfant en prodrome FIRES → arrêt respiratoire → convulsions → FIRES.
Le CAE aurait levé une alerte CRITIQUE avant l'administration.

### Fonctionnement
1. **Détection de vulnérabilités** (6 profils) : Prodrome FIRES, Seuil convulsif abaissé, Fragilité cardiaque, Fragilité respiratoire, Contexte inflammatoire, Prématurité
2. **Croisement** : intervention planifiée ou en cours × vulnérabilité détectée × littérature
3. **Alerte cascade** : chaîne d'effet étape par étape + alternative recommandée + références

### Règles codées
- MEOPA × Prodrome FIRES → CRITIQUE (Zier 2010, ANSM 2016)
- MEOPA × Seuil convulsif → HIGH (Babl 2010)
- MEOPA × Fragilité respiratoire → HIGH
- Phénytoïne × Fragilité cardiaque → CRITIQUE (Glauser 2016, RCP Dilantin)
- Phénobarbital × Fragilité cardiaque → HIGH
- Midazolam × Fragilité cardiaque → HIGH

### Live enrichment
`runCAELive()` interroge OpenFDA FAERS en temps réel pour chaque médicament et croise avec le profil patient.

### Couleur : #FF6B35 (orange vif)

---

## PAGES PATIENT (17)

| Page | Description |
|------|-------------|
| cockpit | Monitoring temps réel, VPS, vitales, alertes |
| urgence | Protocole urgence phase aiguë |
| diagnostic | Analyse diagnostique |
| traitement | Plan thérapeutique TDE |
| oracle | Simulation 4 scénarios (NEW V21) |
| cascade | Cascade Alert Engine — test interventions (NEW V21.1) |
| examens | Bilans, EEG, IRM |
| suivi | Follow-up |
| synthese | Synthèse pipeline |
| ressources | Littérature, guidelines |
| saisie | Saisie de données (vitales, bio, LCR, cytokines) |
| historique | Historique patient |
| feedback | FeedbackLoop — snapshots, Patient 0, learnings, cohorte (NEW V21.1) |
| rapport | Rapport auto-généré 11 moteurs (NEW V21.1) |
| export | Export MD/JSON/BibTeX |
| audit | Audit trail |

---

## LANDING PAGE
- Splash cinématique (P-U-L-S-A-R lettre par lettre + neural-bg.mp4)
- Vidéo particules en fond (data-particles.mp4)
- Mémorial Alejandro
- Démo 11 slides autoplay (incluant CAE)
- 2 boutons : Accéder à PULSAR + Voir la démo

---

## SÉCURITÉ
- Invite-only (cookie + Supabase auth)
- Toutes les pages non publiques → redirect /login
- RBAC 5 rôles, 23 permissions
- RLS Supabase
- Pages publiques : /, /login, /invite uniquement

---

## API ROUTES

### /api/pubmed
Recherche PubMed live. Utilisé par Discovery N2.

### /api/trials
Recherche ClinicalTrials.gov. Utilisé par Discovery N4.

### /api/drugs
Recherche OpenFDA FAERS + BDPM ANSM. Profil de sécurité temps réel.
- `?drug=phenytoin` — profil unique
- `?batch=phenytoin,midazolam,ketamine` — batch (max 20)

---

## PATIENT ZERO — ALEJANDRO R.

Premier cas réel ingéré dans le FeedbackLoop. Seed pour tous les futurs cas FIRES.

- PULSAR-000, FIRES, 6 ans, IDF
- VPS 100/100, 14 alertes, 3 critiques
- DDD : 4 retards, 48h perdues
- CAE : 2 cascades (phénytoïne × cœur, MEOPA × prodrome)
- 8 learnings codés pour enrichir les futurs diagnostics

---

## STACK TECHNIQUE
- Next.js 14, TypeScript 5.5, Tailwind CSS 4
- Supabase (15 tables, RLS, auth)
- Vercel (prod)
- Claude API (Discovery N3)
- OpenFDA API (DrugDatabase)
- PubMed API (Discovery N2)
- ClinicalTrials.gov API (Discovery N4)

---

## HISTORIQUE V21

| Commit | Description |
|--------|-------------|
| V21.0 | Oracle + DDD + Consult + landing cinématique + 4 vidéos Runway |
| V21.0.1 | Splash PULSAR lettre par lettre + neural-bg.mp4 |
| V21.0.2 | Démo 10 slides autoplay + fond neural |
| V21.0.3 | Sécurité landing (0 faille) + boutons nettoyés |
| V21.1.0 | CAE (Cascade Alert Engine) — 11ème moteur |
| V21.1.1 | DrugDatabase (OpenFDA + BDPM) + /api/drugs |
| V21.1.2 | Page /cascade + Page /rapport + Patient Zero + BIBLE V21 |
