-- ============================================================
-- PULSAR V18 — Schema initial
-- 12 tables · RLS · Triggers · Realtime
-- ============================================================

create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILS UTILISATEURS
-- ═══════════════════════════════════════════════════════════════

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'intern'
    check (role in ('admin', 'senior', 'intern', 'nurse', 'viewer')),
  service text default 'Neuropédiatrie',
  hospital text default 'CH Bray-sur-Seine',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'intern'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 2. PATIENTS
-- ═══════════════════════════════════════════════════════════════

create table public.patients (
  id uuid default uuid_generate_v4() primary key,
  display_name text not null,
  date_of_birth date,
  age_months integer not null,
  sex text not null check (sex in ('male', 'female')),
  weight_kg numeric(5,1),
  height_cm numeric(5,1),
  room text default 'Non assigné',
  bed text,
  hosp_day integer default 1,
  admission_date timestamptz default now(),
  discharge_date timestamptz,
  status text default 'active'
    check (status in ('active', 'discharged', 'transferred', 'deceased')),
  syndrome text,
  phase text default 'acute'
    check (phase in ('acute', 'stabilization', 'monitoring', 'recovery')),
  allergies text[] default '{}',
  medical_history jsonb default '{}',
  is_transfer boolean default false,
  transfer_from text,
  triage_score integer,
  triage_priority text check (triage_priority in ('P1', 'P2', 'P3', 'P4')),
  triage_data jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_patients_status on public.patients(status);
create index idx_patients_triage on public.patients(triage_priority, triage_score desc);

-- ═══════════════════════════════════════════════════════════════
-- 3. CONSTANTES VITALES
-- ═══════════════════════════════════════════════════════════════

create table public.vitals (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  gcs integer check (gcs between 3 and 15),
  pupils text check (pupils in ('reactive', 'sluggish', 'fixed_one', 'fixed_both')),
  seizures_24h integer default 0,
  seizure_duration integer,
  seizure_type text,
  consciousness text,
  focal_signs text[] default '{}',
  heart_rate integer,
  sbp integer,
  dbp integer,
  spo2 integer,
  temp numeric(3,1),
  resp_rate integer,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz default now()
);

create index idx_vitals_patient on public.vitals(patient_id, recorded_at desc);

-- ═══════════════════════════════════════════════════════════════
-- 4. RÉSULTATS BIOLOGIQUES
-- ═══════════════════════════════════════════════════════════════

create table public.lab_results (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  crp numeric(6,1),
  pct numeric(5,2),
  ferritin numeric(8,1),
  wbc numeric(5,1),
  platelets integer,
  lactate numeric(4,1),
  csf_cells integer,
  csf_protein numeric(4,2),
  csf_antibodies text,
  csf_glucose numeric(4,1),
  sodium numeric(5,1),
  potassium numeric(4,1),
  glycemia numeric(5,1),
  creatinine numeric(5,1),
  ast integer,
  alt integer,
  troponin numeric(8,1),
  d_dimers numeric(6,1),
  pro_bnp numeric(8,1),
  lab_name text,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz default now()
);

create index idx_lab_patient on public.lab_results(patient_id, recorded_at desc);

-- ═══════════════════════════════════════════════════════════════
-- 5. MÉDICAMENTS
-- ═══════════════════════════════════════════════════════════════

create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  drug_name text not null,
  dose text,
  route text check (route in ('IV', 'PO', 'IM', 'SC', 'IR', 'IN', 'other')),
  frequency text,
  start_date timestamptz default now(),
  end_date timestamptz,
  is_active boolean default true,
  prescribed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index idx_meds_patient_active on public.medications(patient_id, is_active);

-- ═══════════════════════════════════════════════════════════════
-- 6. HISTORIQUE TRAITEMENTS
-- ═══════════════════════════════════════════════════════════════

create table public.treatment_history (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  treatment text not null,
  period text,
  line_number integer,
  response text check (response in ('none', 'partial', 'good', 'complete')),
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. ANALYSES INTAKE
-- ═══════════════════════════════════════════════════════════════

create table public.intake_analyses (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  intake_data jsonb not null,
  urgency_score integer,
  urgency_level text,
  differentials jsonb,
  red_flags jsonb,
  history_alerts jsonb,
  exam_recommendations jsonb,
  exam_gaps jsonb,
  similar_cases jsonb,
  engine_readiness jsonb,
  clinical_summary text,
  completeness integer,
  is_transfer boolean default false,
  triage_score integer,
  triage_priority text,
  triage_data jsonb,
  analyzed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. RÉSULTATS MOTEURS
-- ═══════════════════════════════════════════════════════════════

create table public.engine_results (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  engine text not null
    check (engine in ('VPS', 'TDE', 'PVE', 'EWE', 'TPE', 'NCE')),
  score integer,
  level text,
  result_data jsonb not null,
  computed_at timestamptz default now()
);

create index idx_engine_patient on public.engine_results(patient_id, engine, computed_at desc);

-- ═══════════════════════════════════════════════════════════════
-- 9. ALERTES
-- ═══════════════════════════════════════════════════════════════

create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  title text not null,
  body text,
  source text,
  acknowledged boolean default false,
  acknowledged_by uuid references public.profiles(id),
  acknowledged_at timestamptz,
  resolved boolean default false,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index idx_alerts_patient_active on public.alerts(patient_id, resolved, severity);

-- ═══════════════════════════════════════════════════════════════
-- 10. EEG / IMAGERIE
-- ═══════════════════════════════════════════════════════════════

create table public.neuro_exams (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  exam_type text not null
    check (exam_type in ('EEG', 'MRI', 'CT', 'SSEP', 'VEP', 'TCD', 'PET')),
  status text,
  findings jsonb,
  raw_report text,
  performed_at timestamptz default now(),
  reported_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 11. NOTES CLINIQUES
-- ═══════════════════════════════════════════════════════════════

create table public.clinical_notes (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  note_type text default 'observation'
    check (note_type in ('observation', 'prescription', 'decision', 'handoff', 'family', 'other')),
  content text not null,
  author_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 12. AUDIT TRAIL
-- ═══════════════════════════════════════════════════════════════

create table public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz default now()
);

create index idx_audit_user on public.audit_log(user_id, created_at desc);
create index idx_audit_entity on public.audit_log(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.vitals enable row level security;
alter table public.lab_results enable row level security;
alter table public.medications enable row level security;
alter table public.treatment_history enable row level security;
alter table public.intake_analyses enable row level security;
alter table public.engine_results enable row level security;
alter table public.alerts enable row level security;
alter table public.neuro_exams enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.audit_log enable row level security;

-- Profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Patients
create policy "patients_select" on public.patients for select
  using (auth.role() = 'authenticated');
create policy "patients_insert" on public.patients for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'senior', 'intern'))
);
create policy "patients_update" on public.patients for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'senior', 'intern'))
);

-- Clinical data — authenticated read/write
create policy "vitals_select" on public.vitals for select using (auth.role() = 'authenticated');
create policy "vitals_insert" on public.vitals for insert with check (auth.role() = 'authenticated');

create policy "labs_select" on public.lab_results for select using (auth.role() = 'authenticated');
create policy "labs_insert" on public.lab_results for insert with check (auth.role() = 'authenticated');

create policy "meds_select" on public.medications for select using (auth.role() = 'authenticated');
create policy "meds_insert" on public.medications for insert with check (auth.role() = 'authenticated');
create policy "meds_update" on public.medications for update using (auth.role() = 'authenticated');

create policy "treatment_select" on public.treatment_history for select using (auth.role() = 'authenticated');
create policy "treatment_insert" on public.treatment_history for insert with check (auth.role() = 'authenticated');

create policy "intake_select" on public.intake_analyses for select using (auth.role() = 'authenticated');
create policy "intake_insert" on public.intake_analyses for insert with check (auth.role() = 'authenticated');

create policy "engine_select" on public.engine_results for select using (auth.role() = 'authenticated');
create policy "engine_insert" on public.engine_results for insert with check (auth.role() = 'authenticated');

create policy "alerts_select" on public.alerts for select using (auth.role() = 'authenticated');
create policy "alerts_insert" on public.alerts for insert with check (auth.role() = 'authenticated');
create policy "alerts_update" on public.alerts for update using (auth.role() = 'authenticated');

create policy "exams_select" on public.neuro_exams for select using (auth.role() = 'authenticated');
create policy "exams_insert" on public.neuro_exams for insert with check (auth.role() = 'authenticated');

create policy "notes_select" on public.clinical_notes for select using (auth.role() = 'authenticated');
create policy "notes_insert" on public.clinical_notes for insert with check (auth.role() = 'authenticated');

create policy "audit_select" on public.audit_log for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "audit_insert" on public.audit_log for insert with check (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS updated_at
-- ═══════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_patients_updated_at before update on public.patients
  for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════════

alter publication supabase_realtime add table public.patients;
alter publication supabase_realtime add table public.vitals;
alter publication supabase_realtime add table public.alerts;
