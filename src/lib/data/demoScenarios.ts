// ============================================================
// PULSAR V15 — Demo Scenarios (shared across modules)
// 4 patients couvrant les pathologies FIRES/NMDAR/CYTOKINE/STABLE
// ============================================================

export const DEMO_PATIENTS: Record<string, { label: string; data: Record<string, any> }> = {
  FIRES: {
    label: 'Inès — FIRES (4 ans)',
    data: {
      ageMonths: 48, weightKg: 16, hospDay: 4, sex: 'female',
      gcs: 7, gcsHistory: [12, 9], pupils: 'sluggish',
      seizures24h: 12, seizureDuration: 45, seizureType: 'refractory_status',
      crp: 85, pct: 1.2, ferritin: 680, wbc: 18, platelets: 195, lactate: 3.5,
      heartRate: 155, sbp: 80, dbp: 45, spo2: 93, temp: 39.2, respRate: 32,
      csfCells: 120, csfProtein: 0.78, csfAntibodies: 'negative',
      drugs: [{ name: 'Midazolam' }, { name: 'Levetiracetam' }, { name: 'Méthylprednisolone' }, { name: 'Céfotaxime' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J1-J3', response: 'none' }],
    },
  },
  NMDAR: {
    label: 'Lucas — Anti-NMDAR (14 ans)',
    data: {
      ageMonths: 168, weightKg: 48, hospDay: 7, sex: 'male',
      gcs: 11, gcsHistory: [13, 12], pupils: 'reactive',
      seizures24h: 3, seizureDuration: 5, seizureType: 'focal_impaired',
      crp: 12, pct: 0.15, ferritin: 180, wbc: 8.5, platelets: 220, lactate: 1.2,
      heartRate: 88, sbp: 110, dbp: 70, spo2: 98, temp: 37.4, respRate: 18,
      csfCells: 45, csfProtein: 0.55, csfAntibodies: 'nmdar',
      drugs: [{ name: 'Levetiracetam' }, { name: 'Rituximab' }, { name: 'Méthylprednisolone' }, { name: 'Oméprazole' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J1-J3', response: 'partial' }, { treatment: 'IVIg', period: 'J2-J6', response: 'partial' }],
    },
  },
  CYTOKINE: {
    label: 'Mila — Orage cytokinique (6 ans)',
    data: {
      ageMonths: 72, weightKg: 22, hospDay: 5, sex: 'female',
      gcs: 10, gcsHistory: [14, 13], pupils: 'sluggish',
      seizures24h: 6, seizureDuration: 12, seizureType: 'generalized_tonic_clonic',
      crp: 210, pct: 4.5, ferritin: 8500, wbc: 2.8, platelets: 65, lactate: 5.2,
      heartRate: 165, sbp: 70, dbp: 38, spo2: 91, temp: 40.1, respRate: 38,
      csfCells: 8, csfProtein: 0.42, csfAntibodies: 'pending',
      drugs: [{ name: 'Valproate' }, { name: 'Méropénème' }, { name: 'Midazolam' }, { name: 'Noradrénaline' }, { name: 'Méthylprednisolone' }, { name: 'Amikacine' }],
      treatmentHistory: [{ treatment: 'Méthylprednisolone IV', period: 'J2-J4', response: 'none' }],
    },
  },
  STABLE: {
    label: 'Léo — Stable (10 ans)',
    data: {
      ageMonths: 120, weightKg: 32, hospDay: 2, sex: 'male',
      gcs: 14, gcsHistory: [14, 14], pupils: 'reactive',
      seizures24h: 0, seizureDuration: 0, seizureType: 'none',
      crp: 3, pct: 0.08, ferritin: 90, wbc: 9, platelets: 280, lactate: 0.9,
      heartRate: 85, sbp: 105, dbp: 65, spo2: 99, temp: 37.1, respRate: 18,
      csfCells: 2, csfProtein: 0.28, csfAntibodies: 'negative',
      drugs: [{ name: 'Levetiracetam' }, { name: 'Paracétamol' }],
      treatmentHistory: [],
    },
  },
}
