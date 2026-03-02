// ============================================================
// PULSAR V18 — Database Types
// Généré depuis 001_initial_schema.sql
// ============================================================

// ── Rôles ──
export type UserRole = 'admin' | 'senior' | 'intern' | 'nurse' | 'viewer'
export type PatientStatus = 'active' | 'discharged' | 'transferred' | 'deceased'
export type ClinicalPhase = 'acute' | 'stabilization' | 'monitoring' | 'recovery'
export type TriagePriority = 'P1' | 'P2' | 'P3' | 'P4'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type MedRoute = 'IV' | 'PO' | 'IM' | 'SC' | 'IR' | 'IN' | 'other'
export type TreatmentResponse = 'none' | 'partial' | 'good' | 'complete'
export type PupilStatus = 'reactive' | 'sluggish' | 'fixed_one' | 'fixed_both'
export type EngineName = 'VPS' | 'TDE' | 'PVE' | 'EWE' | 'TPE' | 'NCE'
export type ExamType = 'EEG' | 'MRI' | 'CT' | 'SSEP' | 'VEP' | 'TCD' | 'PET'
export type NoteType = 'observation' | 'prescription' | 'decision' | 'handoff' | 'family' | 'other'

// ── 1. Profile ──
export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  service: string
  hospital: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ── 2. Patient ──
export interface Patient {
  id: string
  display_name: string
  date_of_birth: string | null
  age_months: number
  sex: 'male' | 'female'
  weight_kg: number | null
  height_cm: number | null
  room: string
  bed: string | null
  hosp_day: number
  admission_date: string
  discharge_date: string | null
  status: PatientStatus
  syndrome: string | null
  phase: ClinicalPhase
  allergies: string[]
  medical_history: Record<string, unknown>
  is_transfer: boolean
  transfer_from: string | null
  triage_score: number | null
  triage_priority: TriagePriority | null
  triage_data: Record<string, unknown> | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PatientInsert = {
  display_name: string
  age_months: number
  sex: 'male' | 'female'
  weight_kg?: number | null
  height_cm?: number | null
  room?: string
  bed?: string | null
  hosp_day?: number
  admission_date?: string
  discharge_date?: string | null
  status?: PatientStatus
  syndrome?: string | null
  phase?: ClinicalPhase
  allergies?: string[]
  medical_history?: Record<string, unknown>
  is_transfer?: boolean
  transfer_from?: string | null
  triage_score?: number | null
  triage_priority?: TriagePriority | string | null
  triage_data?: Record<string, unknown> | null
  created_by?: string | null
  date_of_birth?: string | null
}

export type PatientUpdate = Partial<Omit<Patient, 'id' | 'created_at'>>

// ── 3. Vitals ──
export interface Vitals {
  id: string
  patient_id: string
  gcs: number | null
  pupils: PupilStatus | null
  seizures_24h: number
  seizure_duration: number | null
  seizure_type: string | null
  consciousness: string | null
  focal_signs: string[]
  heart_rate: number | null
  sbp: number | null
  dbp: number | null
  spo2: number | null
  temp: number | null
  resp_rate: number | null
  recorded_by: string | null
  recorded_at: string
}

export type VitalsInsert = {
  patient_id: string
  gcs?: number | null
  pupils?: PupilStatus | null
  seizures_24h?: number
  seizure_duration?: number | null
  seizure_type?: string | null
  consciousness?: string | null
  focal_signs?: string[]
  heart_rate?: number | null
  sbp?: number | null
  dbp?: number | null
  spo2?: number | null
  temp?: number | null
  resp_rate?: number | null
  recorded_by?: string | null
  recorded_at?: string
}

// ── 4. Lab Results ──
export interface LabResult {
  id: string
  patient_id: string
  crp: number | null
  pct: number | null
  ferritin: number | null
  wbc: number | null
  platelets: number | null
  lactate: number | null
  csf_cells: number | null
  csf_protein: number | null
  csf_antibodies: string | null
  csf_glucose: number | null
  sodium: number | null
  potassium: number | null
  glycemia: number | null
  creatinine: number | null
  ast: number | null
  alt: number | null
  troponin: number | null
  d_dimers: number | null
  pro_bnp: number | null
  lab_name: string | null
  recorded_by: string | null
  recorded_at: string
}

export type LabResultInsert = {
  patient_id: string
  crp?: number | null
  pct?: number | null
  ferritin?: number | null
  wbc?: number | null
  platelets?: number | null
  lactate?: number | null
  csf_cells?: number | null
  csf_protein?: number | null
  csf_antibodies?: string | null
  csf_glucose?: number | null
  sodium?: number | null
  potassium?: number | null
  glycemia?: number | null
  creatinine?: number | null
  ast?: number | null
  alt?: number | null
  troponin?: number | null
  d_dimers?: number | null
  pro_bnp?: number | null
  lab_name?: string | null
  recorded_by?: string | null
  recorded_at?: string
}

// ── 5. Medication ──
export interface Medication {
  id: string
  patient_id: string
  drug_name: string
  dose: string | null
  route: MedRoute | null
  frequency: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  prescribed_by: string | null
  created_at: string
}

export type MedicationInsert = {
  patient_id: string
  drug_name: string
  dose?: string | null
  route?: MedRoute | null
  frequency?: string | null
  start_date?: string
  end_date?: string | null
  is_active?: boolean
  prescribed_by?: string | null
}

// ── 6. Treatment History ──
export interface TreatmentHistoryRow {
  id: string
  patient_id: string
  treatment: string
  period: string | null
  line_number: number | null
  response: TreatmentResponse | null
  notes: string | null
  recorded_by: string | null
  created_at: string
}

export type TreatmentHistoryInsert = {
  patient_id: string
  treatment: string
  period?: string | null
  line_number?: number | null
  response?: TreatmentResponse | null
  notes?: string | null
  recorded_by?: string | null
}

// ── 7. Intake Analysis ──
export interface IntakeAnalysisRow {
  id: string
  patient_id: string
  intake_data: Record<string, unknown>
  urgency_score: number | null
  urgency_level: string | null
  differentials: Record<string, unknown>[] | null
  red_flags: Record<string, unknown>[] | null
  history_alerts: Record<string, unknown>[] | null
  exam_recommendations: Record<string, unknown>[] | null
  exam_gaps: Record<string, unknown>[] | null
  similar_cases: Record<string, unknown>[] | null
  engine_readiness: Record<string, unknown>[] | null
  clinical_summary: string | null
  completeness: number | null
  is_transfer: boolean
  triage_score: number | null
  triage_priority: string | null
  triage_data: Record<string, unknown> | null
  analyzed_by: string | null
  created_at: string
}

// ── 8. Engine Result ──
export interface EngineResultRow {
  id: string
  patient_id: string
  engine: EngineName
  score: number | null
  level: string | null
  result_data: Record<string, unknown>
  computed_at: string
}

// ── 9. Alert ──
export interface Alert {
  id: string
  patient_id: string
  severity: AlertSeverity
  title: string
  body: string | null
  source: string | null
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export type AlertUpdate = Partial<Pick<Alert,
  'acknowledged' | 'acknowledged_by' | 'acknowledged_at' |
  'resolved' | 'resolved_by' | 'resolved_at'
>>

// ── 10. Neuro Exam ──
export interface NeuroExam {
  id: string
  patient_id: string
  exam_type: ExamType
  status: string | null
  findings: Record<string, unknown> | null
  raw_report: string | null
  performed_at: string
  reported_by: string | null
  created_at: string
}

// ── 11. Clinical Note ──
export interface ClinicalNote {
  id: string
  patient_id: string
  note_type: NoteType
  content: string
  author_id: string | null
  created_at: string
}

// ── 12. Audit Log ──
export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// ── Database (pour typage Supabase client) ──
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      patients: { Row: Patient; Insert: PatientInsert; Update: PatientUpdate }
      vitals: { Row: Vitals; Insert: VitalsInsert; Update: Partial<Vitals> }
      lab_results: { Row: LabResult; Insert: LabResultInsert; Update: Partial<LabResult> }
      medications: { Row: Medication; Insert: MedicationInsert; Update: Partial<Medication> }
      treatment_history: { Row: TreatmentHistoryRow; Insert: TreatmentHistoryInsert; Update: Partial<TreatmentHistoryRow> }
      intake_analyses: { Row: IntakeAnalysisRow; Insert: Partial<IntakeAnalysisRow>; Update: Partial<IntakeAnalysisRow> }
      engine_results: { Row: EngineResultRow; Insert: Partial<EngineResultRow>; Update: Partial<EngineResultRow> }
      alerts: { Row: Alert; Insert: Partial<Alert>; Update: AlertUpdate }
      neuro_exams: { Row: NeuroExam; Insert: Partial<NeuroExam>; Update: Partial<NeuroExam> }
      clinical_notes: { Row: ClinicalNote; Insert: Partial<ClinicalNote>; Update: Partial<ClinicalNote> }
      audit_log: { Row: AuditLogEntry; Insert: Partial<AuditLogEntry>; Update: never }
    }
  }
}
