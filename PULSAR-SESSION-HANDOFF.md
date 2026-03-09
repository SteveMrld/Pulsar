# PULSAR — Handoff Session · Mars 2026

## État prod
- **URL** : pulsar-lovat.vercel.app  
- **GitHub** : SteveMrld/Pulsar (branch: main)  
- **Supabase** : tpefzxyrjebnnzgguktm.supabase.co

---

## Ce qui a été fait — Session complète

### Bloc 1 ✅ — Crédibilité clinique
- BetaModal : disclaimer médical au premier accès (localStorage)
- VersionBadge : PULSAR v21.4 · β en bas à droite
- Page /methodology : arbre méthodologique 4 moteurs

### Bloc 2 ✅ — UX Clinicien
- Fix emoji corrompu bouton Fermer (dashboard)
- ThemeToggle branché dark/light + localStorage
- P1Alert : double bip sonore toutes les 8s si patient P1 actif
- ThemeToggle + P1Alert dans AppShell

### Bloc 3 ✅ — Traçabilité
- Table Supabase clinical_logs
- Table Supabase beta_feedback
- Hook useTrackAction
- FeedbackWidget 💬 : bouton violet flottant
- Migration SQL exécutée ✅

### Bloc 4 ✅ — Solidité
- lib/exportPDF.ts : export dossier patient
- Page /about : équipe, stack, Alejandro, disclaimer
- Liens /about + /methodology dans AppShell nav

### Autres ✅
- Avatars patients fille/garçon pushés + branchés
- Fond sonore landing (bouton mute/unmute)
- Document méthodologique N1→N4 complet

---

## PENDING — Prochaine session
- Brancher exportPDF dans PatientHeader (bouton sur chaque fiche)
- Brancher useTrackAction sur pages clés (dashboard, research, patient)
- Tester fond sonore sur iOS
- Renouveler token GitHub si expiré (Settings → Developer settings → Tokens)

---

## Architecture clé
```
src/
  app/
    page.tsx              ← Landing + fond sonore
    layout.tsx            ← BetaModal + VersionBadge + FeedbackWidget
    dashboard/page.tsx    ← Emoji fixes
    about/page.tsx        ← Page À propos
    methodology/page.tsx  ← Arbre méthodo
  components/
    BetaModal.tsx
    VersionBadge.tsx
    P1Alert.tsx
    ThemeToggle.tsx
    FeedbackWidget.tsx
    AppShell.tsx          ← Nav + liens about/methodology
  hooks/
    useTrackAction.ts
  lib/
    exportPDF.ts
```

## Supabase tables actives
- clinical_logs
- beta_feedback
- research_lab_articles
