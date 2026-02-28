# PULSAR — Aide à la décision clinique pédiatrique

Système d'aide à la décision pour les urgences neuro-inflammatoires pédiatriques.

## Architecture

```
/                  Landing page
/login             Connexion (Supabase + mode démo)
/signup            Création de compte
/patients          File active (home après login)
/patient/[id]
  ├── /cockpit     Résumé vital, alertes, "que faire ?"
  ├── /urgence     Mode 0-3h (ABCDE, admission, bundles)
  ├── /diagnostic  Raisonnement (hypothèses IA, case-matching, red flags)
  ├── /traitement  Action (recommandations, pharmacovigilance, consensus)
  ├── /suivi       Trajectoire (pipeline 5 moteurs, timeline, audit trail)
  ├── /examens     Preuves (bilan, EEG, IRM, biomarqueurs, BrainMonitor)
  ├── /synthese    Communication (synthèse, staff/RCP, famille, export PDF)
  └── /ressources  Savoir (NeuroCore KB, observatory, evidence vault)
```

## Stack

- Next.js 14 (App Router)
- Supabase Auth
- 5 moteurs IA : VPS + TDE + PVE + EWE + TPE
- NeuroCore Knowledge Base (1023 entrées)

## Développement

```bash
npm install
npm run dev
```

## Production

https://pulsar-j63q.vercel.app

© 2026 Steve Moradel
