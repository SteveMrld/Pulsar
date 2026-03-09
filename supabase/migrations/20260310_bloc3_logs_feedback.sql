-- Migration PULSAR Bloc 3 — Traçabilité + Feedback clinicien
-- À exécuter dans Supabase SQL Editor (tpefzxyrjebnnzgguktm)

-- Table 1 : Log des actions clinicien
CREATE TABLE IF NOT EXISTS clinical_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,        -- 'view_patient' | 'run_engine' | 'export_pdf' | 'login' etc.
  resource TEXT,               -- ex: 'patient/alejandro' | 'research' | 'dashboard'
  patient_id TEXT,             -- si applicable
  metadata JSONB DEFAULT '{}'  -- données supplémentaires
);

ALTER TABLE clinical_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own logs" ON clinical_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own logs" ON clinical_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table 2 : Feedbacks cliniciens bêta
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  page TEXT NOT NULL,          -- page où le feedback est soumis
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  category TEXT,               -- 'bug' | 'ux' | 'contenu' | 'suggestion' | 'autre'
  message TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE
);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert feedback" ON beta_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read feedback" ON beta_feedback FOR SELECT USING (auth.uid() IS NOT NULL);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_logs_user ON clinical_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_action ON clinical_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_page ON beta_feedback(page, created_at DESC);
