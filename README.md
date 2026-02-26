# PULSAR V15 — Pediatric Urgent Lifesaving System for Acute Response

> 5 Brain Engines × 4 Layers — Clinical Decision Support for Pediatric Neuroinflammatory Emergencies

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing (hero + 3 features + CTA)
│   ├── layout.tsx            # Root layout + theme
│   ├── login/page.tsx        # Auth login
│   ├── signup/page.tsx       # Auth signup
│   ├── dashboard/page.tsx    # Stats cards + engine status + empty state
│   ├── project/page.tsx      # CDC placeholder (Session 2)
│   └── api/auth/callback/    # Supabase auth callback
├── components/
│   └── ThemeToggle.tsx       # Dark/Light toggle (persisté localStorage)
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client (cookies SSR)
│   └── engines/              # ← 5 MOTEURS CERVEAU
│       ├── BrainCore.ts      # Classe abstraite 4 couches
│       ├── PatientState.ts   # Objet central patient
│       ├── VPSEngine.ts      # Vital Prognosis Score (#6C7CFF)
│       ├── TDEEngine.ts      # Therapeutic Decision (#2FD1C8)
│       ├── PVEEngine.ts      # Pharmacovigilance (#B96BFF)
│       ├── EWEEngine.ts      # Early Warning (#FF6B8A)
│       ├── TPEEngine.ts      # Therapeutic Prospection (#FFB347)
│       ├── pipeline.ts       # VPS → TDE → PVE → EWE → TPE
│       ├── crashTests.ts     # 5 scénarios × 5 moteurs
│       └── runTests.ts       # Runner CLI
└── styles/
    └── tokens.css            # 80+ CSS variables, dark par défaut
```

## Moteurs Cerveau — 4 Couches

Chaque moteur pense en 4 couches (pas une calculatrice) :

| Couche | Rôle | Technique |
|--------|------|-----------|
| **1. Intention** | Comprendre le "pourquoi" | Champs sémantiques (10-15 signaux) |
| **2. Contexte** | Mémoire de ce qui précède | État patient enrichi à chaque étape |
| **3. Règles** | Expertise métier codifiée | Protocoles cliniques, garde-fous |
| **4. Courbe** | Trajectoire globale | Scoring pondéré, tendances |

## 5 Pathologies couvertes

- **FIRES** — Febrile Infection-Related Epilepsy Syndrome
- **anti-NMDAR** — Encéphalite à anticorps anti-NMDAR
- **NORSE** — New-Onset Refractory Status Epilepticus
- **PIMS/MIS-C** — Syndrome inflammatoire multisystémique
- **MOGAD/ADEM** — Encéphalomyélite aiguë disséminée

## Déploiement sur Vercel

1. Push ce contenu sur `SteveMrld/Pulsar`
2. Dans Vercel : importe le repo, ajoute les 2 variables d'env Supabase
3. Dans Supabase Dashboard : active Email/Password + ajoute le callback URL

```bash
# Variables d'environnement requises
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

## Tests moteurs

```bash
npm install
npx tsx src/lib/engines/runTests.ts
```

## Benchmark scientifique

- 59 références cliniques
- Francoeur JAMA 2024 (3,568 patients, 46 centres) — OR 1.85/2.18
- Bilodeau 2024 — MOGAD diagnostic
- Shakeshaft — EEG AUC 0.72
- Santé publique France — 932 cas PIMS

## Licence

© 2026 Steve Moradel — Tous droits réservés
