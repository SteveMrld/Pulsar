# PULSAR V14 — Design & UX Release

> Aide à la décision en réanimation pédiatrique neuro-inflammatoire.
> Chaque pixel sauve du temps. Chaque seconde sauve une vie.

---

## Vue d'ensemble

PULSAR est un cockpit clinique qui analyse en temps réel des données de réanimation pédiatrique (FIRES, encéphalites auto-immunes) et transforme la complexité en décision lisible : scores, tendances, recommandations et pharmacovigilance.

**V14** est la refonte complète du design et de l'UX, construite sur l'architecture moteur V13 stable (33/33 tests).

### Principes directeurs

- **Règle des 3 secondes** — Un médecin de garde comprend la sévérité du patient en moins de 3 secondes
- **Densité intelligente** — Résumé → détail → données brutes (jamais plus de 3 niveaux)
- **Couleurs sémantiques invariantes** — Les niveaux de gravité gardent la même couleur en dark et light
- **Confiance par la transparence** — Chaque score décompose en 4 couches visibles

---

## Livrables

| Fichier | Taille | Description |
|---|---|---|
| `PULSAR_V14_COMPLET.html` | 197 KB | **Livrable principal.** Landing + App + Démo embarqués (overlay base64). Fichier unique autonome. |
| `PULSAR_V14_APP.html` | 81 KB | Dashboard complet. 3 moteurs V13 réels, 5 scénarios, 33 crash tests, vues détaillées 4 couches. |
| `PULSAR_V14_DEMO.html` | 56 KB | Démo autopilotée Inès. 13 scènes, 5 phases, typing effect, auto-advance. |
| `PULSAR_V14_LANDING.html` | 15 KB | Page d'accueil. Présentation, pipeline, fonctionnalités, aperçu patient. |
| `PULSAR_V14_CODE.html` | 29 KB | Galerie de composants UI (référence design system). |
| `PULSAR_V14_BIBLE.md` | 3 KB | Documentation des points d'intégration V13 → V14. |

### Règle de fonctionnement

Chaque fichier HTML **fonctionne seul** (ouvrir dans un navigateur suffit). Le COMPLET les embarque tous dans un fichier unique avec navigation par overlay.

---

## Architecture

### Pipeline moteur (V13, inchangé)

```
PatientState → VPS → TDE → PVE → PatientState enrichi
                ↓      ↓      ↓
             Score   Score   Score
             Alertes Recos   Interactions
```

**3 moteurs séquentiels, 4 couches par moteur :**

| Couche | Rôle | Contenu |
|---|---|---|
| **Intention** | Champs sémantiques | Signaux bruts → normalisés → interprétation |
| **Contexte** | Modificateurs | Tendance GCS, durée hospitalisation, facteurs aggravants |
| **Règles** | Garde-fous | Validations, corrections, seuils d'alerte |
| **Courbe** | Trajectoire | Score projeté sur J1→Jn, zones de danger |

### 5 scénarios cliniques

| Scénario | VPS | TDE | PVE | Profil |
|---|---|---|---|---|
| **FIRES** | 70-100 | ≥60 | Variable | Critique, patterns Détérioration + FIRES |
| **NMDAR** | 10-40 | ≥40 | Variable | Modéré, anticorps confirmés |
| **CYTOKINE** | 75-100 | ≥50 | 50-100 | Critique, orage cytokinique, interactions VPA+Méropénème |
| **REBOND** | 25-55 | 20-55 | 0-35 | Réaggravation post-sevrage |
| **STABLE** | 0-25 | 0-30 | 0-20 | Contrôle négatif, aucun pattern |

### 33 crash tests

Les 5 scénarios × vérifications par moteur = 33 checks exécutés sur les vrais moteurs V13. Accessible depuis l'onglet "Crash Tests" dans l'APP.

---

## Design System V14

### Palette sémantique (invariante dark/light)

| Token | Hex | Usage |
|---|---|---|
| `--critical` | `#D63C3C` | Score ≥70, alertes critiques |
| `--severe` | `#F08A2B` | Score 50-69, warnings |
| `--moderate` | `#E5C84B` | Score 30-49 |
| `--mild` | `#5FA8FF` | Score 15-29 |
| `--stable` | `#3BC17A` | Score 0-14, validations |

### Teintes identitaires moteurs

| Token | Hex | Moteur |
|---|---|---|
| `--vps` | `#6C7CFF` | Visual Physiology System |
| `--tde` | `#2FD1C8` | Therapeutic Decision Engine |
| `--pve` | `#B96BFF` | Pharmacovigilance Engine |

### Typographie

- **UI** : Inter (400-800)
- **Données** : JetBrains Mono (400-800)
- Source : Google Fonts uniquement

### Neutrales (switchent entre thèmes)

| Token | Dark | Light |
|---|---|---|
| `--bg0` | `#0B0F14` | `#F7F8FA` |
| `--bg1` | `#0F1520` | `#F0F2F5` |
| `--card` | `#101827` | `#FFFFFF` |
| `--border` | `#233046` | `#D9E0EA` |
| `--text` | `#E8EEF7` | `#101828` |
| `--text2` | `#A9B6CC` | `#344054` |
| `--text3` | `#7F8CA6` | `#667085` |

---

## Navigation

### COMPLET (fichier unique)

```
Landing
  ├── "Entrer dans le dashboard" → overlay → APP
  ├── "Explorer la démo"         → overlay → DEMO
  └── "← Retour Landing" / ESC  → ferme overlay
```

### APP (dashboard)

```
Cockpit (vue par défaut)
  ├── 3 Score Cards (VPS / TDE / PVE) → clic = vue moteur
  ├── Alertes actives
  ├── Recommandations
  └── Timeline GCS

Vues moteur (VPS / TDE / PVE)
  ├── Couche 1 : Champs sémantiques (expand/collapse)
  ├── Couche 2 : Contexte + Patterns
  ├── Couche 3 : Règles déclenchées
  └── Couche 4 : Courbe trajectoire SVG

Crash Tests
  └── 5 scénarios × vérifications = 33 checks
```

### DEMO (Inès)

```
13 scènes en 5 phases :
  ① Arrivée & Évaluation (scènes 0-2)
  ② Diagnostic (scènes 3-6)
  ③ Traitement (scènes 7-8)
  ④ Monitoring (scènes 9-10)
  ⑤ Synthèse (scènes 11-12)
  + Conclusion (scène 13)
```

---

## Contraintes techniques

- **HTML standalone** — Aucun build, aucun serveur, aucun framework
- **CSS pur** — Variables CSS custom, `color-mix(in oklab)`, pas de SASS
- **JavaScript vanilla** — Pas de React/Vue/Angular
- **Google Fonts uniquement** — Inter + JetBrains Mono
- **Zéro dépendance externe** — Tout est embarqué
- **Navigateurs cibles** — Chrome, Safari, Firefox (dernières versions)

---

## Historique des versions

| Version | Focus | Tests |
|---|---|---|
| V11 | Landing + Demo Inès + assemblage base64 | — |
| V12 | 3 moteurs cerveau (VPS+TDE+PVE), 4 couches | 32/32 |
| V13 | Architecture stabilisée, pipeline séquentiel | 33/33 |
| **V14** | **Refonte Design & UX complète** | **33/33** |

### Ce qui change en V14

- Design system complet (tokens, palette, typographie)
- Mode dark/light avec couleurs sémantiques invariantes
- Cockpit 3 scores lisibles à 2 mètres
- Vues moteur détaillées (4 couches expand/collapse)
- Alertes structurées avec source moteur et CTA
- Sélecteur de scénarios intégré
- Crash tests dans l'interface (pas un fichier séparé)
- Navigation sidebar + tabs + breadcrumb
- Responsive tablet (sidebar collapse) et mobile
- Logo SVG (cercles concentriques gradient accent→pve)
- Démo Inès reskinée design system V14

### Ce qui ne change PAS

- 3 moteurs V13 (code identique)
- 4 couches par moteur (Intention → Contexte → Règles → Courbe)
- Pipeline séquentiel VPS → TDE → PVE
- 5 scénarios cliniques
- 33 crash tests (mêmes vérifications)
- Narratif Inès (13 scènes, même contenu)

---

## Prochaines étapes (V15+)

- Command Center (multi-patients)
- Clinical Pilot (données réelles anonymisées)
- Motion design avancé (cf. PULSAR_V14_BRIEF.md)
- Certification dispositif médical

---

*PULSAR — Outil d'aide à la décision. Ne se substitue pas au jugement clinique.*
*© 2026*
