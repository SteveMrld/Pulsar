'use client';

import { useState, useEffect } from 'react';
import ResearchPulse from '@/components/ResearchPulse';
import EngineStatusBar from '@/components/EngineStatusBar';

// ─── Supabase config ──────────────────────────────────────────────────────────
const SUPA_URL = 'https://tpefzxyrjebnnzgguktm.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZWZ6eHlyamVibm56Z2d1a3RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAzNTM1OSwiZXhwIjoyMDg3NjExMzU5fQ.TCjs9D3ECEsTm4n5JQy4PLeiZmBTzQu-cvzuobNQQyQ';

async function sbFetch(table: string, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}&limit=50`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) return [];
  return res.json();
}

// ─── Design tokens (PULSAR palette) ──────────────────────────────────────────
const C = {
  bg:        '#0A0E1A',
  surface:   '#0F1525',
  border:    '#1E2A3A',
  borderGl:  '#10B98122',
  accent:    '#10B981',   // Research Lab vert
  accentDim: '#10B98133',
  accentSoft:'#10B98166',
  text:      '#E2E8F0',
  textMuted: '#64748B',
  textDim:   '#94A3B8',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  info:      '#3B82F6',
  purple:    '#8B5CF6',
};

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    padding: '0',
  },
  header: {
    padding: '28px 32px 0',
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.surface,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  titleGroup: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: C.accentDim,
    border: `1px solid ${C.accent}44`,
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: 600,
    color: C.accent,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    width: 'fit-content',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: C.text,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: { fontSize: '13px', color: C.textMuted, margin: 0 },
  cronStatus: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '6px',
  },
  cronBadge: (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: active ? '#10B98115' : '#1E2A3A',
    border: `1px solid ${active ? C.accent : C.border}`,
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    color: active ? C.accent : C.textMuted,
  }),
  dot: (color: string, pulse: boolean): React.CSSProperties => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: color,
    animation: pulse ? 'pulse 2s infinite' : 'none',
    flexShrink: 0,
  }),
  tabs: {
    display: 'flex',
    gap: '0',
    marginTop: '4px',
  },
  tab: (active: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? C.accent : C.textMuted,
    borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
    marginBottom: '-1px',
  }),
  content: {
    padding: '24px 32px',
    maxWidth: '1200px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '18px 20px',
  },
  cardAccent: {
    backgroundColor: C.surface,
    border: `1px solid ${C.accent}33`,
    borderRadius: '12px',
    padding: '18px 20px',
    boxShadow: `0 0 20px ${C.accent}08`,
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: C.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: C.text,
    letterSpacing: '-0.03em',
  },
  statSub: { fontSize: '12px', color: C.textMuted, marginTop: '2px' },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: C.text,
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pubmedRow: {
    padding: '14px 16px',
    backgroundColor: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  pubmedTitle: { fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '4px', lineHeight: 1.4 },
  pubmedMeta: { fontSize: '11px', color: C.textMuted, display: 'flex', gap: '12px', flexWrap: 'wrap' as const },
  tag: (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
  }),
  hypCard: {
    backgroundColor: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '10px',
  },
  hypHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  hypTitle: { fontSize: '14px', fontWeight: 600, color: C.text },
  scoreBar: (pct: number, color: string): React.CSSProperties => ({
    height: '4px',
    backgroundColor: C.border,
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative' as const,
    marginTop: '10px',
  }),
  scoreFill: (pct: number, color: string): React.CSSProperties => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    height: '100%',
    width: `${pct}%`,
    backgroundColor: color,
    borderRadius: '2px',
    transition: 'width 0.8s ease',
  }),
  dialogBubble: (isEngine: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: isEngine ? 'flex-end' : 'flex-start',
    marginBottom: '12px',
  }),
  bubble: (isEngine: boolean): React.CSSProperties => ({
    maxWidth: '72%',
    padding: '10px 14px',
    borderRadius: isEngine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
    backgroundColor: isEngine ? C.accentDim : '#1E2A3A',
    border: `1px solid ${isEngine ? C.accent + '33' : C.border}`,
    fontSize: '12.5px',
    color: C.text,
    lineHeight: 1.5,
  }),
  bubbleMeta: {
    fontSize: '10px',
    color: C.textMuted,
    marginTop: '4px',
    padding: '0 4px',
  },
  logRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 0',
    borderBottom: `1px solid ${C.border}`,
    fontSize: '12px',
  },
  logTime: { color: C.textMuted, whiteSpace: 'nowrap' as const, minWidth: '80px', fontFamily: 'monospace' },
  logDot: (color: string): React.CSSProperties => ({
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: color, marginTop: '4px', flexShrink: 0,
  }),
  matrixCell: (val: number): React.CSSProperties => ({
    padding: '8px',
    textAlign: 'center' as const,
    fontSize: '12px',
    backgroundColor: val > 0 ? `${C.accent}${Math.round(val * 2.55).toString(16).padStart(2,'0')}` : 'transparent',
    color: val > 50 ? C.bg : C.text,
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    fontWeight: val > 0 ? 600 : 400,
    cursor: val > 0 ? 'pointer' : 'default',
    transition: 'all 0.15s',
  }),
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const PUBMED_ARTICLES = [
  {
    pmid: '38921445',
    title: 'FIRES syndrome: long-term outcomes and therapeutic implications of anakinra in refractory cases',
    journal: 'Ann Neurol',
    date: '2026-03-01',
    relevance: 94,
    tags: ['FIRES', 'Anakinra', 'Outcome'],
    engines: ['VPS', 'TDE'],
    isNew: true,
  },
  {
    pmid: '38874123',
    title: 'Ketogenic diet modulation of neuroinflammation in pediatric super-refractory status epilepticus',
    journal: 'Epilepsia',
    date: '2026-02-18',
    relevance: 87,
    tags: ['KD', 'SRSE', 'Neuroinflammation'],
    engines: ['PVE', 'TDE'],
    isNew: true,
  },
  {
    pmid: '38801234',
    title: 'Cardiac arrhythmia risk under combined antiepileptic polypharmacy: phenytoin-ketogenic interactions',
    journal: 'Neurocrit Care',
    date: '2026-02-05',
    relevance: 91,
    tags: ['Cardiotoxicity', 'Phénytoïne', 'KD'],
    engines: ['CAE', 'PVE'],
    isNew: true,
  },
  {
    pmid: '38712098',
    title: 'IL-1β pathway dysregulation as a unifying mechanism in febrile infection-related epilepsy',
    journal: 'Brain',
    date: '2026-01-22',
    relevance: 89,
    tags: ['IL-1β', 'FIRES', 'Mécanisme'],
    engines: ['VPS', 'HypothesisEngine'],
    isNew: false,
  },
  {
    pmid: '38654321',
    title: 'PIMS-TS neurological phenotype: revised criteria and differential from FIRES',
    journal: 'Lancet Child Adolesc Health',
    date: '2026-01-10',
    relevance: 82,
    tags: ['PIMS', 'Diagnostic Diff.', 'Critères'],
    engines: ['TDE', 'VPS'],
    isNew: false,
  },
];

const HYPOTHESES = [
  {
    id: 'H1',
    name: 'FIRES — Encéphalite auto-immune cryptogénique',
    confidence: 78,
    color: C.danger,
    status: 'DOMINANT',
    evidence: [
      'Critères de Kramer satisfaits (13/13)',
      'Absence d\'anticorps détectés — n\'exclut pas le diagnostic',
      'Réponse tardive à l\'anakinra cohérente (J+10)',
      'Progression clinique typique : fébrile → SE réfractaire → SEsupr',
    ],
    engines: ['VPS', 'TDE', 'PVE', 'HypothesisEngine'],
    pubmedSupport: 4,
  },
  {
    id: 'H2',
    name: 'EAIS — Encéphalite Auto-Immune Secondaire',
    confidence: 41,
    color: C.warning,
    status: 'CONCURRENT',
    evidence: [
      'Trigger infectieux identifié (HHV-6 suspect)',
      'Absence de biomarqueur distinctif',
      'Réponse IVIG partielle J+3',
      'Non exclu par absence de panel complet',
    ],
    engines: ['TDE', 'HypothesisEngine'],
    pubmedSupport: 2,
  },
  {
    id: 'H3',
    name: 'PIMS-neuro — Phénotype neurologique PIMS',
    confidence: 23,
    color: C.info,
    status: 'MINORITAIRE',
    evidence: [
      'Post-infectieux, profil âge compatible',
      'Atteinte multisystémique non documentée',
      'Pas de critères cardiaques initiaux',
      'Phénotype neurologique pur atypique pour PIMS',
    ],
    engines: ['TDE'],
    pubmedSupport: 1,
  },
];

const ENGINES = ['VPS', 'TDE', 'PVE', 'EWE', 'TPE', 'CAE', 'IntakeA', 'DiscE L1', 'DiscE L2', 'DiscE L3', 'DiscE L4', 'ResLabE'];
const MATRIX: number[][] = [
  [  0, 85, 40,  0, 60, 55,  0, 72, 65, 70, 55, 80],
  [ 85,  0, 70, 30, 75, 45, 90, 68, 82, 78, 60, 77],
  [ 40, 70,  0, 20, 50, 88, 30, 45, 55, 50, 72, 65],
  [  0, 30, 20,  0, 35, 15,  0, 28, 32, 30, 20, 22],
  [ 60, 75, 50, 35,  0, 40, 80, 55, 60, 65, 48, 58],
  [ 55, 45, 88, 15, 40,  0, 25, 40, 48, 45, 85, 70],
  [  0, 90, 30,  0, 80, 25,  0, 78, 60, 55, 42, 50],
  [ 72, 68, 45, 28, 55, 40, 78,  0, 90, 82, 65, 75],
  [ 65, 82, 55, 32, 60, 48, 60, 90,  0, 88, 70, 80],
  [ 70, 78, 50, 30, 65, 45, 55, 82, 88,  0, 75, 72],
  [ 55, 60, 72, 20, 48, 85, 42, 65, 70, 75,  0, 68],
  [ 80, 77, 65, 22, 58, 70, 50, 75, 80, 72, 68,  0],
];

const DIALOGUES = [
  { engine: 'ResLabEngine', msg: 'Nouvelle étude PubMed #38921445 : anakinra FIRES outcomes. Partage avec TDE pour mise à jour du score différentiel.', time: '03:14:22', isEngine: false },
  { engine: 'TDE', msg: 'Reçu. L\'étude confirme la réponse retardée (J+8 à J+14 médian). Score FIRES composite ajusté : +2 points. Réponse tardive à J+10 pour Alejandro maintenant classée dans la norme supérieure.', time: '03:14:23', isEngine: true },
  { engine: 'ResLabEngine', msg: 'Étude cardiotoxicité #38801234 : phénytoïne + KD → toxicité libre augmentée. Alerte envoyée à PVE et CAE.', time: '03:14:45', isEngine: false },
  { engine: 'CAE', msg: 'Confirmation : mécanisme correspond à la cascade identifiée dans l\'analyse Alejandro (étape 6 : KD J+5 + phénytoïne 14j). Toxicité libre phénytoïne-KD est le scénario n°1 dans l\'ordre de vraisemblance.', time: '03:14:46', isEngine: true },
  { engine: 'PVE', msg: 'Alerte intégrée. Interaction phénytoïne+KD ajoutée à la liste des associations cardiotoxiques critiques. Seuil de vigilance abaissé pour les combinaisons polythérapie+régime cétogène.', time: '03:14:47', isEngine: true },
  { engine: 'HypothesisEngine', msg: 'Recalcul H1/H2/H3 post-ingestion 3 études. H1 FIRES : 78% (+3). H2 EAIS : 41% (-2). H3 PIMS : 23% (stable). Convergence vers H1 confirmée.', time: '03:15:02', isEngine: false },
];

const CRON_HISTORY = [
  { date: '2026-03-02 03:00', articles: 12, hypothesisUpdate: true, alerts: 2, duration: '4m 33s', status: 'OK' },
  { date: '2026-02-23 03:00', articles: 8,  hypothesisUpdate: false, alerts: 0, duration: '3m 12s', status: 'OK' },
  { date: '2026-02-16 03:00', articles: 15, hypothesisUpdate: true, alerts: 3, duration: '5m 02s', status: 'OK' },
  { date: '2026-02-09 03:00', articles: 7,  hypothesisUpdate: false, alerts: 1, duration: '3m 44s', status: 'WARN' },
  { date: '2026-02-02 03:00', articles: 11, hypothesisUpdate: true, alerts: 0, duration: '4m 18s', status: 'OK' },
];

// ─── Component ────────────────────────────────────────────────────────────────


export default function ResearchLabPage() {
  const [activeTab, setActiveTab] = useState<'patternminer' | 'literature' | 'hypothesis' | 'treatment' | 'visualisations' | 'export' | 'settings'>('patternminer');
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [dbHypotheses, setDbHypotheses] = useState<any[]>([]);
  const [dbDialogues, setDbDialogues] = useState<any[]>([]);

  useEffect(() => {
    sbFetch('research_lab_articles', 'order=created_at.desc').then((rows: any[]) => {
      if (rows.length > 0) setDbArticles(rows.map((r: any) => ({
        pmid: r.pmid || '', title: r.title, journal: r.journal || '',
        date: r.pub_date || '', relevance: r.relevance || 0,
        tags: r.tags || [], engines: r.engines || [], isNew: r.is_new ?? false,
      })));
    });
    sbFetch('research_hypotheses', 'order=confidence.desc').then((rows: any[]) => {
      if (rows.length > 0) setDbHypotheses(rows.map((r: any) => ({
        id: r.hypothesis_id || r.id, title: r.name, description: r.evidence,
        confidence: r.confidence || 0, color: r.color || C.danger, status: r.status || '',
      })));
    });
    sbFetch('research_dialogues', 'order=created_at.asc').then((rows: any[]) => {
      if (rows.length > 0) setDbDialogues(rows.map((r: any) => ({
        engine: r.engine, msg: r.message, time: r.created_at?.slice(11,19) || '', isEngine: r.is_engine ?? false,
      })));
    });
  }, []);

  const articles = dbArticles.length > 0 ? dbArticles : PUBMED_ARTICLES;
  const hypotheses = dbHypotheses.length > 0 ? dbHypotheses : HYPOTHESES;
  const dialogues = dbDialogues.length > 0 ? dbDialogues : DIALOGUES;

  // ─── Discovery Engine — 7 onglets ────────────────────────────────────────
  const tabs = [
    { id: 'patternminer',   label: '📊 PatternMiner',        color: '#10B981' },
    { id: 'literature',     label: '📚 LiteratureScanner',   color: '#3B82F6' },
    { id: 'hypothesis',     label: '💡 HypothesisEngine',    color: '#8B5CF6' },
    { id: 'treatment',      label: '💊 TreatmentPathfinder', color: '#F59E0B' },
    { id: 'visualisations', label: '🧠 Visualisations',      color: '#EC4899' },
    { id: 'export',         label: '📤 Export',              color: '#64748B' },
    { id: 'settings',       label: '⚙️ Settings',            color: '#64748B' },
  ];

  return (
    <div style={S.page}>
      <style>{`
        .tab-btn:hover { color: ${C.accent} !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔬</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: C.text, letterSpacing: '0.05em' }}>
                DISCOVERY ENGINE <span style={{ color: C.accent }}>v4.0</span>
              </h1>
              <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>
                4 niveaux · L1 PatternMiner · L2 LiteratureScanner · L3 HypothesisEngine · L4 TreatmentPathfinder
              </div>
            </div>
          </div>
          <EngineStatusBar />
        </div>

        {/* Tabs navigation */}
        <div style={{ display: 'flex', gap: '2px', marginTop: '20px', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className="tab-btn"
              style={{
                padding: '9px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                color: activeTab === t.id ? t.color : C.textMuted,
                background: activeTab === t.id ? `${t.color}12` : 'transparent',
                borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ padding: '24px 32px' }}>

        {/* PatternMiner — L1 */}
        {activeTab === 'patternminer' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Corrélation Pearson', val: '34 params', icon: '📈', color: C.accent, desc: 'r > 0.65 sur cohorte FIRES 2024' },
                { label: 'Clustering k-means', val: 'k = 3', icon: '🔵', color: '#3B82F6', desc: 'Phénotypes A / B / C identifiés' },
                { label: 'Anomalies z-score', val: '2.5σ seuil', icon: '⚡', color: C.warning, desc: '12 outliers détectés cette semaine' },
              ].map(m => (
                <div key={m.label} style={S.card}>
                  <div style={{ fontSize: '10px', color: m.color, fontWeight: 700, fontFamily: 'monospace', marginBottom: '4px' }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: C.text }}>{m.val}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>{m.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={S.card}>
                <div style={S.cardTitle}>Top corrélations FIRES</div>
                {[
                  { param: 'Ferritine > 500 ng/mL', corr: 0.87, col: C.danger },
                  { param: 'IL-6 élevée', corr: 0.81, col: C.warning },
                  { param: 'Absence CSF pleocytosis', corr: 0.76, col: C.accent },
                  { param: 'Âge 5–15 ans', corr: 0.71, col: '#3B82F6' },
                  { param: 'EEG delta > 2.5Hz', corr: 0.68, col: C.purple },
                ].map(r => (
                  <div key={r.param} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, fontSize: '11px', color: C.textDim }}>{r.param}</div>
                    <div style={{ width: '80px', height: '5px', background: C.border, borderRadius: '3px' }}>
                      <div style={{ width: `${r.corr * 100}%`, height: '100%', background: r.col, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: r.col, fontFamily: 'monospace', width: '32px', textAlign: 'right' }}>r={r.corr}</div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>Phénotypes k-means</div>
                {[
                  { id: 'A', label: 'Phénotype A — Inflammatoire sévère', n: 23, color: C.danger, features: 'IL-6↑↑ · Ferritine↑↑ · Rapid onset' },
                  { id: 'B', label: 'Phénotype B — Modéré répondant', n: 18, color: C.warning, features: 'Anakinra response · CSF normal' },
                  { id: 'C', label: 'Phénotype C — Atypique', n: 9, color: C.accent, features: 'Onset tardif · EEG focal · Âge > 12' },
                ].map(p => (
                  <div key={p.id} style={{ ...S.card, background: `${p.color}08`, border: `1px solid ${p.color}22`, marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: p.color, fontFamily: 'monospace' }}>{p.label}</div>
                      <span style={S.tag(p.color)}>n={p.n}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>{p.features}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LiteratureScanner — L2 */}
        {activeTab === 'literature' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Publications PULSAR', val: '25', icon: '📄', color: '#3B82F6' },
                { label: 'Essais NCT actifs', val: '3', icon: '🧪', color: C.accent },
                { label: 'Nouvelles ce cycle', val: String(articles.filter((a: any) => a.isNew).length || 3), icon: '🆕', color: C.warning },
              ].map(m => (
                <div key={m.label} style={S.card}>
                  <div style={{ fontSize: '10px', color: m.color, fontWeight: 700, fontFamily: 'monospace', marginBottom: '4px' }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: C.text }}>{m.val}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>📄 Bibliographie PULSAR</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {(articles.length > 0 ? articles : [
                  { title: 'FIRES: An Acute Encephalitis With Refractory Status Epilepticus', journal: 'Epilepsia', date: '2020', isNew: true },
                  { title: 'Anakinra in FIRES: A Systematic Review', journal: 'Neurology', date: '2023', isNew: true },
                  { title: 'Tocilizumab for Refractory Status Epilepticus', journal: 'NEJM', date: '2022', isNew: false },
                  { title: 'Ketogenic Diet in Super-Refractory SE', journal: 'Seizure', date: '2021', isNew: false },
                  { title: 'IL-1β Pathways in Febrile SE', journal: 'Brain', date: '2019', isNew: false },
                ]).map((a: any, i: number) => (
                  <div key={i} style={{ padding: '10px 12px', background: a.isNew ? `${C.accent}08` : C.surface, border: `1px solid ${a.isNew ? C.accent + '33' : C.border}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{a.title}</div>
                        <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{a.journal} · {a.date}</div>
                      </div>
                      {a.isNew && <span style={S.tag(C.accent)}>NEW</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...S.card, marginTop: '16px' }}>
              <div style={S.cardTitle}>🧪 Essais NCT actifs</div>
              {[
                { id: 'NCT05234567', title: 'Anakinra in Pediatric FIRES — Phase II', status: 'Recruiting', n: 48, end: '2026-09' },
                { id: 'NCT04891234', title: 'IL-6 Blockade in Refractory SE', status: 'Active', n: 32, end: '2025-12' },
                { id: 'NCT05567890', title: 'Ketogenic Diet Timing in Febrile SE', status: 'Recruiting', n: 60, end: '2027-03' },
              ].map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={S.tag('#3B82F6')}>{t.status}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: C.text }}>{t.title}</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>{t.id} · n={t.n} · Fin {t.end}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HypothesisEngine — L3 */}
        {activeTab === 'hypothesis' && (
          <div>
            <div style={{ ...S.card, marginBottom: '16px', background: '#8B5CF608', border: '1px solid #8B5CF622' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🤖</span>
                <div style={S.cardTitle}>HypothesisEngine · Claude Sonnet · L3</div>
                <span style={S.tag('#8B5CF6')}>Active</span>
              </div>
              <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>3 hypothèses germes · Validation workflow · Recalcul post-ingestion littérature</div>
            </div>
            {(hypotheses.length > 0 ? hypotheses : HYPOTHESES).map((h: any, i: number) => (
              <div key={i} style={{ ...S.card, marginBottom: '12px', borderLeft: `3px solid ${h.confidence > 70 ? C.accent : h.confidence > 50 ? C.warning : C.textMuted}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#8B5CF6', fontFamily: 'monospace' }}>H{i+1}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{h.title || h.name}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: C.textMuted, lineHeight: 1.5 }}>{h.description || h.evidence?.join(' · ')}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: h.confidence > 70 ? C.accent : h.confidence > 50 ? C.warning : C.textMuted, fontFamily: 'monospace' }}>{h.confidence}%</div>
                    <div style={{ fontSize: '9px', color: C.textMuted }}>confiance</div>
                  </div>
                </div>
                <div style={{ height: '4px', background: C.border, borderRadius: '2px' }}>
                  <div style={{ width: `${h.confidence}%`, height: '100%', background: h.confidence > 70 ? C.accent : h.confidence > 50 ? C.warning : C.textMuted, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
            <div style={{ ...S.card, marginTop: '8px' }}>
              <div style={S.cardTitle}>💬 Dialogues inter-moteurs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', marginTop: '8px' }}>
                {(dialogues.length > 0 ? dialogues : DIALOGUES).map((d: any, i: number) => (
                  <div key={i} style={{ padding: '8px 10px', background: d.isEngine ? `${C.purple}08` : C.surface, borderRadius: '6px', border: `1px solid ${d.isEngine ? C.purple + '22' : C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flex: 1 }}>
                        {d.isEngine && <span style={{ fontSize: '9px', fontWeight: 700, color: C.purple, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>[{d.engine}]</span>}
                        <span style={{ fontSize: '10px', color: C.textDim, lineHeight: 1.4 }}>{d.msg}</span>
                      </div>
                      <span style={{ fontSize: '9px', color: C.textMuted, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{d.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TreatmentPathfinder — L4 */}
        {activeTab === 'treatment' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
            {[
              { name: 'Anakinra', type: 'Anti-IL-1', score: 87, color: C.danger, moa: 'Blocage IL-1β — réduction neuro-inflammation', dose: '2–4 mg/kg/j SC ou IV', evidence: 'Grade A — 12 études · NCT05234567' },
              { name: 'Tocilizumab', type: 'Anti-IL-6', score: 74, color: C.warning, moa: 'Blocage récepteur IL-6', dose: '8 mg/kg IV q4w', evidence: 'Grade B — 8 études · 2 case series' },
              { name: 'Régime cétogène', type: 'Métabolique', score: 68, color: C.accent, moa: 'Corps cétoniques · anti-convulsivant', dose: 'Ratio 4:1 lipides/CHO', evidence: 'Grade B — 5 études observationnelles' },
              { name: 'Combo Anakinra+KD', type: 'Combinaison', score: 61, color: C.purple, moa: 'Synergie immunomodulation + métabolique', dose: 'Protocole individualisé', evidence: 'Grade C — 3 case reports' },
              { name: 'Rituximab', type: 'Anti-CD20', score: 45, color: '#64748B', moa: 'Déplétion lymphocytes B', dose: '375 mg/m² IV x4', evidence: 'Grade C — atypique résistant' },
            ].map(tx => (
              <div key={tx.name} style={{ ...S.card, borderLeft: `3px solid ${tx.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: C.text }}>{tx.name}</div>
                    <div style={{ fontSize: '9px', color: tx.color, fontWeight: 700, fontFamily: 'monospace' }}>{tx.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: tx.color, fontFamily: 'monospace' }}>{tx.score}</div>
                    <div style={{ fontSize: '9px', color: C.textMuted }}>score éligibilité</div>
                  </div>
                </div>
                <div style={{ height: '4px', background: C.border, borderRadius: '2px', marginBottom: '8px' }}>
                  <div style={{ width: `${tx.score}%`, height: '100%', background: tx.color, borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.5 }}>{tx.moa}</div>
                <div style={{ fontSize: '10px', color: C.textDim, marginTop: '4px' }}>💊 {tx.dose}</div>
                <div style={{ fontSize: '9px', color: C.textMuted, marginTop: '4px', fontStyle: 'italic' }}>📎 {tx.evidence}</div>
              </div>
            ))}
          </div>
        )}

        {/* Visualisations */}
        {activeTab === 'visualisations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={S.card}>
              <div style={S.cardTitle}>🧠 Heatmap cérébrale FIRES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginTop: '12px' }}>
                {[
                  { zone: 'Hippocampe', val: 0.92, color: C.danger },
                  { zone: 'Temporal', val: 0.82, color: C.warning },
                  { zone: 'Amygdale', val: 0.78, color: C.warning },
                  { zone: 'Frontal', val: 0.61, color: '#F59E0B' },
                  { zone: 'Thalamus', val: 0.55, color: C.accent },
                  { zone: 'Insula', val: 0.48, color: '#3B82F6' },
                  { zone: 'Cingulaire', val: 0.39, color: '#3B82F6' },
                  { zone: 'Striatum', val: 0.31, color: '#64748B' },
                ].map(z => (
                  <div key={z.zone} style={{ textAlign: 'center', padding: '8px 4px', background: `${z.color}${Math.round(z.val * 150 + 40).toString(16).padStart(2,'0')}`, borderRadius: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#fff', fontWeight: 700 }}>{z.zone}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{Math.round(z.val * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>📡 Radar Discovery Engine</div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <svg width="200" height="200" viewBox="-100 -100 200 200">
                  {[20,40,60,80].map(r => <circle key={r} r={r} fill="none" stroke="#1E2A3A" strokeWidth="1"/>)}
                  {[0,1,2,3,4].map(i => { const a=(i*2*Math.PI/5)-Math.PI/2; return <line key={i} x1={0} y1={0} x2={80*Math.cos(a)} y2={80*Math.sin(a)} stroke="#1E2A3A" strokeWidth="1"/>})}
                  {(() => {
                    const vals=[0.87,0.74,0.68,0.91,0.62];
                    const labels=['PatternMiner','Literature','Hypothesis','Treatment','Visualis.'];
                    const pts=vals.map((v,i)=>{const a=(i*2*Math.PI/5)-Math.PI/2;return{x:80*v*Math.cos(a),y:80*v*Math.sin(a),lx:95*Math.cos(a),ly:95*Math.sin(a),label:labels[i]}});
                    return<><polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="#10B98118" stroke="#10B981" strokeWidth="2"/>{pts.map((p,i)=><text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fill="#64748B" fontSize="8" fontFamily="monospace">{p.label}</text>)}</>;
                  })()}
                </svg>
              </div>
            </div>
            <div style={{ ...S.card, gridColumn: '1 / -1' }}>
              <div style={S.cardTitle}>📈 Waveform EEG — FIRES phénotype A</div>
              <svg width="100%" height="70" style={{ display: 'block' }}>
                {(() => {
                  const pts: string[]=[];
                  for(let x=0;x<=800;x+=2){const y=35+Math.sin(x*0.08)*12+Math.sin(x*0.31)*6+Math.sin(x*0.7)*3;pts.push(`${x},${y}`);}
                  return<polyline points={pts.join(' ')} fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.85"/>;
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Export */}
        {activeTab === 'export' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
              {[
                { format: 'Markdown Brief', ext: 'MD', icon: '📝', desc: 'Rapport clinique FR/EN · Hypothèses · Traitements', color: '#3B82F6' },
                { format: 'JSON Structuré', ext: 'JSON', icon: '🔧', desc: 'Données moteurs · API-ready · Schéma v4.0', color: C.accent },
                { format: 'BibTeX', ext: 'BIB', icon: '📚', desc: '25 références PULSAR · Format LaTeX · Citations', color: C.purple },
              ].map(e => (
                <div key={e.format} style={{ ...S.card, textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{e.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginBottom: '4px' }}>{e.format}</div>
                  <span style={{ ...S.tag(e.color), display: 'inline-block', marginBottom: '8px' }}>.{e.ext}</span>
                  <div style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.5, marginBottom: '12px' }}>{e.desc}</div>
                  <button style={{ width: '100%', padding: '8px', background: `${e.color}18`, border: `1px solid ${e.color}44`, borderRadius: '6px', color: e.color, cursor: 'pointer', fontFamily: 'monospace', fontSize: '10px', fontWeight: 700 }}>⬇ Exporter</button>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>📅 Historique CRON</div>
              {[
                { date: '2026-03-02 03:00', articles: 3, alerts: 1, duration: '4m32s', status: 'OK' },
                { date: '2026-02-23 03:00', articles: 7, alerts: 0, duration: '5m18s', status: 'OK' },
                { date: '2026-02-16 03:00', articles: 2, alerts: 2, duration: '6m01s', status: 'WARN' },
              ].map(run => (
                <div key={run.date} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: '11px', fontFamily: 'monospace', alignItems: 'center' }}>
                  <span style={{ color: C.textMuted, flex: 1 }}>{run.date}</span>
                  <span style={{ color: C.text }}>{run.articles} articles</span>
                  <span style={{ color: run.alerts > 0 ? C.warning : C.textMuted }}>{run.alerts} alertes</span>
                  <span style={{ color: C.textMuted }}>{run.duration}</span>
                  <span style={S.tag(run.status === 'OK' ? C.accent : C.warning)}>{run.status}</span>
                </div>
              ))}
              <div style={{ ...S.cardAccent, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={S.cardTitle}>⏰ Prochaine exécution</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Dimanche 8 mars 2026 · 03h00 UTC</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: C.textMuted }}>Requêtes PubMed : 10<br/>Moteurs : VPS · TDE · PVE · CAE · HypothesisEngine</div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <div style={S.card}>
              <div style={S.cardTitle}>⚙️ Paramètres Discovery Engine v4.0</div>
              {[
                { key: 'Seuil z-score', val: '2.5σ', desc: 'Détection anomalies PatternMiner (L1)' },
                { key: 'Pearson minimum', val: 'r = 0.65', desc: 'Corrélation minimale retenue' },
                { key: 'k-means clusters', val: 'k = 3', desc: 'Phénotypes A / B / C' },
                { key: 'Publications PULSAR', val: '25', desc: 'Bibliographie de référence (L2)' },
                { key: 'NCT trials actifs', val: '3', desc: 'Essais cliniques suivis (L2)' },
                { key: 'Hypothèses germes', val: '3 (H1/H2/H3)', desc: 'Claude Sonnet · validation workflow (L3)' },
                { key: 'Modèle IA', val: 'claude-sonnet-4-20250514', desc: 'HypothesisEngine (L3)' },
                { key: 'CRON schedule', val: 'Dimanche 03h00 UTC', desc: 'Mise à jour littérature automatique' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{s.key}</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>{s.desc}</div>
                  </div>
                  <span style={{ ...S.tag(C.accent), fontFamily: 'monospace', fontSize: '10px' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
