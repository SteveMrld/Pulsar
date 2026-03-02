// ============================================================
// PULSAR V18 — Intake Persistence Service
// Bridge entre le flow intake existant et Supabase
// Persiste patient + vitals + labs + meds + intake analysis + engine results
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { patientService } from './patientService'
import { vitalsService } from './vitalsService'
import { labService } from './labService'
import { medicationService } from './medicationService'
import { engineService } from './engineService'
import { alertService } from './alertService'
import { logAudit } from './auditService'
import type { IntakeData, IntakeAnalysis } from '@/lib/engines/IntakeAnalyzer'
import type { TriageResult } from '@/lib/engines/IntakeAnalyzer'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'

interface IntakeAdmissionResult {
  patientId: string
  patient: Awaited<ReturnType<typeof patientService.create>>
}

export const intakePersistenceService = {

  /**
   * Persiste un patient depuis le flow intake
   * Appelé au clic "Admettre ce patient" — remplace addIntakePatient()
   */
  async admitFromIntake(
    displayName: string,
    room: string,
    intakeData: Partial<IntakeData>,
    intakeAnalysis: IntakeAnalysis,
    patientData: Record<string, unknown>, // bridge output (pour les moteurs)
    triage: TriageResult,
  ): Promise<IntakeAdmissionResult> {

    // 1. Créer le patient
    const patient = await patientService.create({
      display_name: displayName,
      age_months: intakeData.ageMonths || 0,
      sex: (intakeData.sex as 'male' | 'female') || 'male',
      weight_kg: intakeData.weight || null,
      height_cm: null,
      room: room || 'Non assigné',
      bed: null,
      hosp_day: 1,
      status: 'active',
      syndrome: intakeAnalysis.differentials?.[0]?.syndrome || null,
      phase: 'acute',
      allergies: intakeData.history?.drugAllergies?.filter(Boolean) || [],
      medical_history: {
        patientData, // Sérialisation complète pour les moteurs
        intakeData,
      },
      is_transfer: intakeAnalysis.isTransfer || false,
      transfer_from: intakeData.transferHospital || null,
      triage_score: triage.score,
      triage_priority: triage.priority,
      triage_data: triage as unknown as Record<string, unknown>,
      created_by: null, // set by patientService
    })

    const pid = patient.id

    // 2. Sauvegarder les constantes initiales
    try {
      await vitalsService.record({
        patient_id: pid,
        gcs: intakeData.gcs || null,
        pupils: (intakeData.pupils as 'reactive' | 'sluggish' | 'fixed_one' | 'fixed_both') || null,
        seizures_24h: intakeData.seizures24h || 0,
        seizure_duration: null,
        seizure_type: intakeData.seizureType || null,
        consciousness: intakeData.consciousness || null,
        focal_signs: intakeData.focalSigns || [],
        heart_rate: intakeData.hr || null,
        sbp: null,
        dbp: null,
        spo2: intakeData.spo2 || null,
        temp: intakeData.temp || null,
        resp_rate: intakeData.rr || null,
        recorded_by: null,
      })
    } catch (e) { console.error('[IntakePersistence] vitals:', e) }

    // 3. Sauvegarder la biologie initiale
    try {
      await labService.record({
        patient_id: pid,
        crp: intakeData.crp || null,
        pct: intakeData.pct || null,
        ferritin: intakeData.ferritin || null,
        wbc: intakeData.wbc || null,
        platelets: intakeData.platelets || null,
        lactate: intakeData.lactate || null,
        csf_cells: intakeData.csfCells || null,
        csf_protein: intakeData.csfProtein || null,
        csf_antibodies: intakeData.csfAntibodies || null,
        csf_glucose: null,
        sodium: null,
        potassium: null,
        glycemia: null,
        creatinine: null,
        ast: null,
        alt: null,
        troponin: null,
        d_dimers: null,
        pro_bnp: null,
        lab_name: null,
        recorded_by: null,
      })
    } catch (e) { console.error('[IntakePersistence] labs:', e) }

    // 4. Sauvegarder les médicaments
    const drugs = intakeData.currentDrugs || []
    for (const drug of drugs) {
      try {
        await medicationService.prescribe({
          patient_id: pid,
          drug_name: typeof drug === 'string' ? drug : String(drug),
          dose: null,
          route: null,
          frequency: null,
          is_active: true,
          prescribed_by: null,
        })
      } catch (e) { console.error('[IntakePersistence] med:', e) }
    }

    // 5. Sauvegarder l'analyse intake
    try {
      const supabase = createClient()
      await supabase.from('intake_analyses').insert({
        patient_id: pid,
        intake_data: intakeData as unknown as Record<string, unknown>,
        urgency_score: intakeAnalysis.urgencyScore,
        urgency_level: intakeAnalysis.urgencyLevel,
        differentials: intakeAnalysis.differentials as unknown as Record<string, unknown>[],
        red_flags: intakeAnalysis.redFlags as unknown as Record<string, unknown>[],
        history_alerts: intakeAnalysis.historyAlerts as unknown as Record<string, unknown>[],
        exam_recommendations: intakeAnalysis.examRecommendations as unknown as Record<string, unknown>[],
        exam_gaps: intakeAnalysis.examGaps as unknown as Record<string, unknown>[],
        similar_cases: intakeAnalysis.similarCases as unknown as Record<string, unknown>[],
        engine_readiness: intakeAnalysis.engineReadiness as unknown as Record<string, unknown>[],
        clinical_summary: intakeAnalysis.clinicalSummary,
        completeness: intakeAnalysis.completeness,
        is_transfer: intakeAnalysis.isTransfer,
        triage_score: triage.score,
        triage_priority: triage.priority,
        triage_data: triage as unknown as Record<string, unknown>,
      })
    } catch (e) { console.error('[IntakePersistence] intake_analysis:', e) }

    // 6. Run pipeline et sauvegarder les résultats moteurs
    try {
      const ps = new PatientState(patientData)
      runPipeline(ps)

      const results = [
        { engine: 'VPS' as const, score: ps.vpsResult?.synthesis.score || 0, level: ps.vpsResult?.synthesis.level || '', data: ps.vpsResult as unknown as Record<string, unknown> },
        { engine: 'TDE' as const, score: ps.tdeResult?.synthesis.score || 0, level: ps.tdeResult?.synthesis.level || '', data: ps.tdeResult as unknown as Record<string, unknown> },
        { engine: 'PVE' as const, score: ps.pveResult?.synthesis.score || 0, level: ps.pveResult?.synthesis.level || '', data: ps.pveResult as unknown as Record<string, unknown> },
        { engine: 'EWE' as const, score: ps.eweResult?.synthesis.score || 0, level: ps.eweResult?.synthesis.level || '', data: ps.eweResult as unknown as Record<string, unknown> },
        { engine: 'TPE' as const, score: ps.tpeResult?.synthesis.score || 0, level: ps.tpeResult?.synthesis.level || '', data: ps.tpeResult as unknown as Record<string, unknown> },
      ]

      await engineService.saveResults(pid, results)

      // Sauvegarder les alertes moteurs
      const allAlerts = ps.alerts || []
      if (allAlerts.length > 0) {
        await alertService.createFromEngineAlerts(pid, allAlerts)
      }
    } catch (e) { console.error('[IntakePersistence] engine:', e) }

    await logAudit('intake.admit', 'patient', pid, {
      name: displayName,
      syndrome: intakeAnalysis.differentials?.[0]?.syndrome,
      triage: triage.priority,
      score: triage.score,
    })

    return { patientId: pid, patient }
  },

  /**
   * Charge un patient depuis Supabase et reconstruit le patientData pour les moteurs
   */
  async loadForEngines(patientId: string): Promise<{
    patientData: Record<string, unknown>
    patient: Awaited<ReturnType<typeof patientService.getById>>
  } | null> {
    const patient = await patientService.getById(patientId)
    if (!patient) return null

    // patientData est stocké dans medical_history
    const patientData = (patient.medical_history as Record<string, unknown>)?.patientData as Record<string, unknown>

    if (patientData) {
      // Mettre à jour hosp_day dynamiquement
      const admDate = new Date(patient.admission_date)
      const now = new Date()
      const daysDiff = Math.max(1, Math.ceil((now.getTime() - admDate.getTime()) / 86400000))
      patientData.hospDay = daysDiff

      return { patientData, patient }
    }

    // Fallback: reconstruire depuis les tables structurées
    const [vitals, labs, meds] = await Promise.all([
      vitalsService.getLatest(patientId),
      labService.getLatest(patientId),
      medicationService.getActive(patientId),
    ])

    const reconstructed: Record<string, unknown> = {
      ageMonths: patient.age_months,
      weightKg: patient.weight_kg,
      hospDay: patient.hosp_day,
      gcs: vitals?.gcs || 15,
      gcsHistory: [],
      pupils: vitals?.pupils || 'reactive',
      seizures24h: vitals?.seizures_24h || 0,
      seizureDuration: vitals?.seizure_duration || 0,
      seizureType: vitals?.seizure_type || 'none',
      crp: labs?.crp || 0,
      pct: labs?.pct || 0,
      ferritin: labs?.ferritin || 0,
      wbc: labs?.wbc || 8,
      platelets: labs?.platelets || 250,
      lactate: labs?.lactate || 1,
      heartRate: vitals?.heart_rate || 90,
      sbp: vitals?.sbp || 100,
      dbp: vitals?.dbp || 60,
      spo2: vitals?.spo2 || 98,
      temp: vitals?.temp || 37,
      respRate: vitals?.resp_rate || 18,
      csfCells: labs?.csf_cells || 0,
      csfProtein: labs?.csf_protein || 0.3,
      csfAntibodies: labs?.csf_antibodies || 'pending',
      drugs: meds.map(m => ({ name: m.drug_name })),
      treatmentHistory: [],
    }

    return { patientData: reconstructed, patient }
  },
}
