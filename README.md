# PULSAR V15 — Pediatric Urgent Limbic & Systemic Alert Response

> Système d'aide à la décision en neurologie pédiatrique critique.
> 5 Brain Engines × 4 couches · 7/7 crash tests · 36 modules fonctionnels

![Version](https://img.shields.io/badge/Version-15-6C7CFF)
![Pages](https://img.shields.io/badge/Pages-36-2FD1C8)
![Engines](https://img.shields.io/badge/Engines-5-B96BFF)
![Tests](https://img.shields.io/badge/Crash_Tests-7%2F7-2ED573)

**Live** → [pulsar-lovat.vercel.app](https://pulsar-lovat.vercel.app)

---

## Qu'est-ce que PULSAR ?

PULSAR est un outil d'aide à la décision pour la prise en charge des **encéphalopathies inflammatoires pédiatriques** (FIRES, anti-NMDAR, NORSE, PIMS/MIS-C, MOGAD). Il accompagne les équipes médicales de l'admission aux urgences jusqu'au suivi à long terme.

**⚠️ PULSAR est un outil d'aide à la décision. Les résultats ne remplacent pas le jugement clinique.**

---

## Architecture — 5 Brain Engines

Chaque moteur pense en **4 couches** : Intention → Contexte → Règles métier → Courbe globale.

| Engine | Rôle | Couleur |
|--------|------|---------|
| **VPS** — Vital Prognosis Score | Sévérité globale, 4 champs sémantiques | `#6C7CFF` |
| **TDE** — Therapeutic Decision Engine | Escalade thérapeutique par pathologie | `#2FD1C8` |
| **PVE** — Pharmacovigilance Engine | Interactions, contre-indications temps réel | `#B96BFF` |
| **EWE** — Early Warning Engine | Détection précoce des détériorations | `#FF6B8A` |
| **TPE** — Therapeutic Prospection Engine | Prospection J+7/J+14 | `#FFB347` |

### Benchmark
- Francoeur C. et al. 2023 — PIMS/MIS-C outcomes (OR 1.85/2.18)
- Bilodeau P. et al. 2024 — MOGAD pédiatrique
- Shakeshaft A. et al. 2024 — EEG patterns (AUC 0.72)
- SPF 932 cas — Données épidémiologiques nationales

---

## Parcours patient — 7 phases

```
PHASE 1 — ARRIVÉE        Mode Urgence 3h · Bilan diagnostique (26 examens)
PHASE 2 — DIAGNOSTIC     Diagnostic IA · Interpellation · Case-Matching · Cross-Pathologie
PHASE 3 — TRAITEMENT     Recommandations · Pharmacovigilance
PHASE 4 — MONITORING     Cockpit vital · 5 Engines détaillés · Timeline · Suivi J+2/5/7
PHASE 5 — SYNTHÈSE       Synthèse globale · Espace Famille · Staff/RCP · Audit Trail · Export PDF
RESSOURCES               Evidence Vault (17 publications) · Consensus Expert · Démo Inès · About
```

---

## Stack technique

| Techno | Usage |
|--------|-------|
| **Next.js 14** | Framework React, SSR/SSG |
| **TypeScript** | Typage strict |
| **React 18** | UI composants |
| **Recharts** | Graphiques (courbes, area charts) |
| **Supabase** | Auth (login/signup) |
| **Vercel** | Déploiement auto (push → live) |
| **CSS custom** | Design system tokens (585L), glass morphism, neon glow |

Pas de Tailwind. Pas de UI library. 100% custom.

---

## Structure du projet

```
src/
├── app/                          # 36 pages (Next.js App Router)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + AppShell
│   ├── admission/                # Formulaire 15+ champs
│   ├── dashboard/                # Vue d'ensemble 5 moteurs
│   ├── urgence/                  # Score VPS immédiat
│   ├── bilan/                    # 26 examens, 6 catégories
│   ├── diagnostic/               # Arbre décisionnel IA
│   ├── cockpit/                  # Vitaux temps réel + silhouette
│   ├── engines/vps|tde|pve|ewe|tpe/  # Détail par moteur
│   ├── demo/                     # Scénario autopilot Inès
│   └── ...                       # 25 autres modules
├── components/                   # 7 composants réutilisables
│   ├── Picto.tsx                 # 20 pictos néon + glow + mapping
│   ├── Sidebar.tsx               # Navigation 30 routes, 7 phases
│   ├── Silhouette.tsx            # Corps humain SVG interactif
│   ├── EngineDetailView.tsx      # Vue détaillée moteur (309L)
│   └── ...
├── lib/
│   ├── engines/                  # Cœur du système
│   │   ├── VPSEngine.ts          # 257L — Vital Prognosis Score
│   │   ├── TDEEngine.ts          # 210L — Therapeutic Decision
│   │   ├── PVEEngine.ts          # 209L — Pharmacovigilance
│   │   ├── EWEEngine.ts          # 258L — Early Warning
│   │   ├── TPEEngine.ts          # 261L — Therapeutic Prospection
│   │   ├── BrainCore.ts          # 172L — Architecture 4 couches
│   │   ├── PatientState.ts       # 241L — Modèle de données
│   │   ├── pipeline.ts           # 62L — Orchestration séquentielle
│   │   └── crashTests.ts         # 188L — 7 scénarios validés
│   ├── data/
│   │   └── demoScenarios.ts      # 4 patients (FIRES, NMDAR, PIMS, MOGAD)
│   └── supabase/                 # Auth client + server
├── styles/
│   └── tokens.css                # 585L — Design system complet
└── public/
    └── assets/
        ├── organs/               # 20 pictos PNG néon (8 organes + 12 modules)
        ├── logo-pulsar.jpg       # Logo PULSAR
        ├── silhouette-boy.jpg    # Garçon néon (818×1064)
        └── silhouette-girl.jpg   # Fille néon (849×1064)
```

---

## Installation

```bash
git clone https://github.com/SteveMrld/Pulsar.git
cd Pulsar
npm install
```

### Variables d'environnement
Créer `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Développement
```bash
npm run dev        # http://localhost:3000
npm run build      # Build production
```

### Déploiement
Push sur `main` → Vercel déploie automatiquement.

---

## Scénarios de démonstration

| Patient | Pathologie | Sévérité | Crises |
|---------|-----------|----------|--------|
| Inès M., 7 ans | FIRES | Critique (VPS 68) | Status réfractaire |
| Léa T., 5 ans | anti-NMDAR | Sévère (VPS 55) | Focales répétées |
| Yanis K., 3 ans | PIMS/MIS-C | Modéré (VPS 42) | Fébriles |
| Sara L., 9 ans | MOGAD | Modéré (VPS 38) | Focales |

---

## Publications référencées

17 publications internationales intégrées dans les règles métier des moteurs. Sources principales :

- Titulaer M. et al. (2013) — Lancet Neurology — Encéphalite anti-NMDAR
- Graus F. et al. (2016) — Lancet Neurology — Critères diagnostiques
- Kramer U. et al. (2011) — Epilepsia — FIRES incidence et mortalité
- Francoeur C. et al. (2023) — JAMA Pediatrics — PIMS/MIS-C outcomes
- Shakeshaft A. et al. (2024) — Clinical Neurophysiology — EEG patterns

Liste complète dans le module **Evidence Vault** de l'application.

---

## Crédits

| Rôle | Auteur |
|------|--------|
| Conception & Direction | **Steve Moraldo** |
| Développement & IA | **Claude** (Anthropic) |
| Design Pictogrammes | **GPT-4o** (OpenAI) |

---

## In Memoriam

> *Pour Gabriel, et pour tous les enfants que le temps n'a pas attendus.*
>
> — Alejandro R. (2019–2025)

---

**PULSAR V15 · Fusion Définitive · Février 2026**
