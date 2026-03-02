// ============================================================
// PULSAR V18 — Clinical Notes & Neuro Exams Service
// Notes d'observation + examens (EEG, IRM, etc.)
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { ClinicalNote, NoteType, NeuroExam, ExamType } from '@/lib/types/database'
import { logAudit } from './auditService'

// ── Notes cliniques ──

export const noteService = {

  async create(patientId: string, content: string, noteType: NoteType = 'observation'): Promise<ClinicalNote> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('clinical_notes')
      .insert({
        patient_id: patientId,
        note_type: noteType,
        content,
        author_id: user?.id || null,
      })
      .select()
      .single()

    if (error) throw new Error(`[NoteService] create: ${error.message}`)

    await logAudit('note.create', 'clinical_notes', data.id, {
      patient_id: patientId,
      type: noteType,
      length: content.length,
    })

    return data
  },

  async getByPatient(patientId: string, limit: number = 50): Promise<ClinicalNote[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`[NoteService] getByPatient: ${error.message}`)
    return data || []
  },

  async getByType(patientId: string, noteType: NoteType): Promise<ClinicalNote[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .eq('note_type', noteType)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`[NoteService] getByType: ${error.message}`)
    return data || []
  },

  // Notes de transmission (handoff)
  async getHandoffs(patientId: string): Promise<ClinicalNote[]> {
    return noteService.getByType(patientId, 'handoff')
  },
}

// ── Examens neuro ──

export const examService = {

  async record(
    patientId: string,
    examType: ExamType,
    status: string,
    findings?: Record<string, unknown>,
    rawReport?: string
  ): Promise<NeuroExam> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('neuro_exams')
      .insert({
        patient_id: patientId,
        exam_type: examType,
        status,
        findings: findings || null,
        raw_report: rawReport || null,
        reported_by: user?.id || null,
      })
      .select()
      .single()

    if (error) throw new Error(`[ExamService] record: ${error.message}`)

    await logAudit('exam.record', 'neuro_exams', data.id, {
      patient_id: patientId,
      type: examType,
      status,
    })

    return data
  },

  async getByPatient(patientId: string): Promise<NeuroExam[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('neuro_exams')
      .select('*')
      .eq('patient_id', patientId)
      .order('performed_at', { ascending: false })

    if (error) throw new Error(`[ExamService] getByPatient: ${error.message}`)
    return data || []
  },

  async getLatestByType(patientId: string, examType: ExamType): Promise<NeuroExam | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('neuro_exams')
      .select('*')
      .eq('patient_id', patientId)
      .eq('exam_type', examType)
      .order('performed_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`[ExamService] getLatestByType: ${error.message}`)
    }
    return data
  },
}
