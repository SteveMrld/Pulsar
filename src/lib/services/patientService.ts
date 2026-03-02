// ============================================================
// PULSAR V18 — Patient Service
// CRUD patients persisté Supabase + audit trail
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { Patient, PatientInsert, PatientUpdate, ClinicalPhase } from '@/lib/types/database'
import { logAudit } from './auditService'

// ── Helpers ──
function detectPhase(hospDay: number, vps: number): ClinicalPhase {
  if (vps >= 70 || hospDay <= 3) return 'acute'
  if (hospDay <= 7 || vps >= 50) return 'stabilization'
  if (hospDay <= 14 || vps >= 30) return 'monitoring'
  return 'recovery'
}

// ── Service ──
export const patientService = {

  // Récupérer tous les patients actifs
  async getActive(): Promise<Patient[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('status', 'active')
      .order('triage_score', { ascending: false, nullsFirst: false })

    if (error) throw new Error(`[PatientService] getActive: ${error.message}`)
    return data || []
  },

  // Récupérer un patient par ID
  async getById(id: string): Promise<Patient | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // not found
      throw new Error(`[PatientService] getById: ${error.message}`)
    }
    return data
  },

  // Créer un patient (depuis intake ou admission directe)
  async create(patient: PatientInsert): Promise<Patient> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const row = {
      ...patient,
      created_by: user?.id || null,
      phase: detectPhase(patient.hosp_day || 1, 0),
    }

    const { data, error } = await supabase
      .from('patients')
      .insert(row)
      .select()
      .single()

    if (error) throw new Error(`[PatientService] create: ${error.message}`)

    await logAudit('patient.create', 'patient', data.id, {
      name: data.display_name,
      syndrome: data.syndrome,
      triage: data.triage_priority,
    })

    return data
  },

  // Mettre à jour un patient
  async update(id: string, updates: PatientUpdate): Promise<Patient> {
    const supabase = createClient()

    // Recalculer la phase si hosp_day change
    if (updates.hosp_day != null) {
      updates.phase = detectPhase(updates.hosp_day, updates.triage_score || 0)
    }

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`[PatientService] update: ${error.message}`)

    await logAudit('patient.update', 'patient', id, updates)

    return data
  },

  // Sortie patient
  async discharge(id: string): Promise<Patient> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('patients')
      .update({
        status: 'discharged' as const,
        discharge_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`[PatientService] discharge: ${error.message}`)

    await logAudit('patient.discharge', 'patient', id, { name: data.display_name })

    return data
  },

  // Transfert patient
  async transfer(id: string, destination: string): Promise<Patient> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('patients')
      .update({
        status: 'transferred' as const,
        discharge_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`[PatientService] transfer: ${error.message}`)

    await logAudit('patient.transfer', 'patient', id, {
      name: data.display_name,
      destination,
    })

    return data
  },

  // Mettre à jour le triage
  async updateTriage(id: string, triageScore: number, triagePriority: string, triageData: Record<string, unknown>): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('patients')
      .update({
        triage_score: triageScore,
        triage_priority: triagePriority,
        triage_data: triageData,
      })
      .eq('id', id)

    if (error) throw new Error(`[PatientService] updateTriage: ${error.message}`)
  },

  // Incrémenter le jour d'hospitalisation (cron ou manuel)
  async incrementHospDay(id: string): Promise<void> {
    const patient = await patientService.getById(id)
    if (!patient || patient.status !== 'active') return

    await patientService.update(id, { hosp_day: patient.hosp_day + 1 })
  },

  // Compter par statut
  async countByStatus(): Promise<Record<string, number>> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('patients')
      .select('status')

    if (error) throw new Error(`[PatientService] countByStatus: ${error.message}`)

    const counts: Record<string, number> = { active: 0, discharged: 0, transferred: 0, deceased: 0 }
    data?.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1 })
    return counts
  },

  // Subscribe realtime (file active)
  subscribeToChanges(callback: (payload: unknown) => void) {
    const supabase = createClient()
    return supabase
      .channel('patients-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patients',
        filter: 'status=eq.active',
      }, callback)
      .subscribe()
  },
}
