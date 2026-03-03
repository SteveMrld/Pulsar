# PULSAR V19

**Pediatric Unified Longitudinal System for Assessment and Research**

> Chaque enfant mérite que l'IA se batte pour lui.

*In memory of Alejandro R. (2019–2025)*

---

## La promesse

Chaque année, des milliers d'enfants en parfaite santé sont foudroyés par des maladies neuro-inflammatoires — FIRES, NORSE, encéphalites auto-immunes. Le FIRES frappe 1 enfant sur 1 million. La mortalité atteint 12 à 30%. Plus de 90% des survivants gardent des déficits cognitifs permanents. Moins de 18% conservent une cognition normale.

Face à ces urgences, les traitements de première ligne échouent dans la majorité des cas. Chaque heure perdue aggrave les séquelles. PULSAR est né pour donner au clinicien l'intelligence de **décider plus vite, mieux, et plus tôt**.

## Architecture

PULSAR V19 est un système d'aide à la décision clinique en neurologie pédiatrique. Il combine 6+1 moteurs d'intelligence artificielle et un Discovery Engine de recherche translationnelle.

**Stack** : Next.js 14 · TypeScript · Supabase · Vercel

**Métriques** : 24 935 lignes · 107 fichiers · 32 routes · 15 tables SQL · 95/95 tests

**Production** : [pulsar-j63q.vercel.app](https://pulsar-j63q.vercel.app)

## Moteurs IA (6+1)

| Moteur | Fonction |
|--------|----------|
| **VPS** — Vital Prognosis Score | Score de sévérité global via 4 champs sémantiques |
| **TDE** — Therapeutic Decision Engine | Escalade thérapeutique L1→L4 par pathologie |
| **PVE** — Pharmacovigilance Engine | Interactions médicamenteuses critiques |
| **EWE** — Early Warning Engine | Détection précoce des détériorations |
| **TPE** — Therapeutic Prospection Engine | Projections J+7/J+14 |
| **IntakeAnalyzer** | 34 ATCD, 32 alertes, 26 examens, triage P1-P4 |
| **Discovery Engine v4.0** | Recherche translationnelle 4 niveaux |

## Discovery Engine v4.0

- **N1 — Pattern Mining** : Pearson 34 params, k-means k=3, z-score 2.5σ
- **N2 — Literature Scanner** : PubMed live + ClinicalTrials.gov + contradictions TDE
- **N3 — Hypothesis Engine** : Claude API, croisement N1×N2, workflow validation
- **N4 — Treatment Pathfinder** : Matching patient↔essais, scoring éligibilité

Fonctionnalités : Veille PubMed live · ClinicalTrials.gov · Export Brief FR/EN + JSON + BibTeX · Enrichissement TDE · Intégration cockpit patient

## Pathologies

FIRES · Anti-NMDAR · NORSE · PIMS/MIS-C · MOGAD/ADEM

## Sources épidémiologiques

- Gaspard N. et al. (2018). Epilepsia 59(4):745–752.
- Frontiers in Neurology (2024). Systematic review pediatric AIE epidemiology.
- NORD. NORSE/FIRES.
- PMC (2021). FIRES workshop proposal.

## Auteur

**Steve Moradel** — © 2026
