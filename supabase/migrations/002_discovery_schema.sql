-- ============================================================
-- PULSAR V18 — Discovery Engine Schema
-- Tables: discovery_signals, discovery_hypotheses, discovery_articles
-- Phase A : signals + articles (hypotheses prepared for Phase C)
-- ============================================================

-- ── 13. Discovery Signals ──
CREATE TABLE IF NOT EXISTS discovery_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('correlation', 'temporal_pattern', 'cluster', 'anomaly', 'treatment_response', 'biomarker_predictor')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  strength TEXT NOT NULL CHECK (strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'monitoring', 'archived', 'rejected')),
  statistics JSONB NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{}',
  patients_data JSONB NOT NULL DEFAULT '{}',
  chart_data JSONB,
  source TEXT NOT NULL DEFAULT 'pattern_miner',
  evidence_level TEXT NOT NULL DEFAULT 'observational',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 14. Discovery Hypotheses (Phase C — prepared) ──
CREATE TABLE IF NOT EXISTS discovery_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'marker',
  description TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'in_review', 'validated', 'published', 'rejected')),
  signal_ids UUID[] DEFAULT '{}',
  literature_refs JSONB DEFAULT '[]',
  reasoning TEXT,
  suggested_action TEXT,
  impact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 15. Discovery Articles (Phase B — prepared) ──
CREATE TABLE IF NOT EXISTS discovery_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pmid TEXT,
  doi TEXT,
  title TEXT NOT NULL,
  authors TEXT,
  journal TEXT,
  year INTEGER,
  abstract TEXT,
  relevance_score NUMERIC(3,2) DEFAULT 0.0,
  matched_signals UUID[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_disc_signals_type ON discovery_signals(type);
CREATE INDEX IF NOT EXISTS idx_disc_signals_status ON discovery_signals(status);
CREATE INDEX IF NOT EXISTS idx_disc_signals_strength ON discovery_signals(strength);
CREATE INDEX IF NOT EXISTS idx_disc_signals_created ON discovery_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disc_hypotheses_status ON discovery_hypotheses(status);
CREATE INDEX IF NOT EXISTS idx_disc_articles_pmid ON discovery_articles(pmid);

-- ── RLS Policies ──
ALTER TABLE discovery_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_articles ENABLE ROW LEVEL SECURITY;

-- Read: tous les utilisateurs authentifiés
CREATE POLICY "discovery_signals_read" ON discovery_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "discovery_hypotheses_read" ON discovery_hypotheses FOR SELECT TO authenticated USING (true);
CREATE POLICY "discovery_articles_read" ON discovery_articles FOR SELECT TO authenticated USING (true);

-- Write: tous les utilisateurs authentifiés (le moteur tourne côté client)
CREATE POLICY "discovery_signals_write" ON discovery_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "discovery_signals_update" ON discovery_signals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "discovery_hypotheses_write" ON discovery_hypotheses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "discovery_hypotheses_update" ON discovery_hypotheses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "discovery_articles_write" ON discovery_articles FOR INSERT TO authenticated WITH CHECK (true);

-- ── Updated_at trigger ──
CREATE OR REPLACE FUNCTION update_discovery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_disc_signals_updated
  BEFORE UPDATE ON discovery_signals
  FOR EACH ROW EXECUTE FUNCTION update_discovery_updated_at();

CREATE TRIGGER trg_disc_hypotheses_updated
  BEFORE UPDATE ON discovery_hypotheses
  FOR EACH ROW EXECUTE FUNCTION update_discovery_updated_at();
