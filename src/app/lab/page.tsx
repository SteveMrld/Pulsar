'use client';

import { useState, useEffect, useRef } from 'react';
import EngineStatusBar from '@/components/EngineStatusBar';
import BrainHeatmap from '@/components/BrainHeatmap';
import Picto from '@/components/Picto';

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPA_URL = 'https://tpefzxyrjebnnzgguktm.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZWZ6eHlyamVibm56Z2d1a3RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAzNTM1OSwiZXhwIjoyMDg3NjExMzU5fQ.TCjs9D3ECEsTm4n5JQy4PLeiZmBTzQu-cvzuobNQQyQ';
async function sbFetch(table: string, params = '') {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}&limit=100`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0A0E1A', surface: '#0F1525', elevated: '#131B2E',
  border: '#1E2A3A', borderAccent: '#10B98122',
  accent: '#10B981', accentDim: '#10B98115', accentGlow: '#10B98140',
  text: '#E2E8F0', textMuted: '#64748B', textDim: '#94A3B8',
  warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', purple: '#8B5CF6',
};

// ─── Mock data ─────────────────────────────────────────────────────────────────
const PUBMED_ARTICLES = [
  { pmid: '38921445', title: 'FIRES syndrome: long-term outcomes and therapeutic implications of anakinra in refractory cases', journal: 'Ann Neurol', date: '2026-03', relevance: 94, tags: ['FIRES', 'Anakinra', 'Outcome'], engines: ['VPS', 'TDE'], isNew: true },
  { pmid: '38874123', title: 'Ketogenic diet modulation of neuroinflammation in pediatric super-refractory status epilepticus', journal: 'Epilepsia', date: '2026-02', relevance: 87, tags: ['KD', 'SRSE', 'Neuroinflamm.'], engines: ['PVE', 'TDE'], isNew: true },
  { pmid: '38801234', title: 'Cardiac arrhythmia risk under combined antiepileptic polypharmacy: phenytoin-ketogenic interactions', journal: 'Neurocrit Care', date: '2026-02', relevance: 91, tags: ['Cardiotox.', 'Phénytoïne', 'KD'], engines: ['CAE', 'PVE'], isNew: true },
  { pmid: '38712098', title: 'IL-1β pathway dysregulation as a unifying mechanism in febrile infection-related epilepsy', journal: 'Brain', date: '2026-01', relevance: 89, tags: ['IL-1β', 'FIRES', 'Mécanisme'], engines: ['VPS', 'HypothesisEngine'], isNew: false },
  { pmid: '38654321', title: 'PIMS-TS neurological phenotype: revised criteria and differential from FIRES', journal: 'Lancet Child', date: '2026-01', relevance: 82, tags: ['PIMS', 'Diagnostic Diff.'], engines: ['TDE', 'VPS'], isNew: false },
  { pmid: '38590123', title: 'Tocilizumab in super-refractory status epilepticus: multicenter retrospective study', journal: 'NEJM', date: '2025-11', relevance: 88, tags: ['Tocilizumab', 'SRSE'], engines: ['VPS', 'PVE'], isNew: false },
  { pmid: '38512456', title: 'EEG biomarkers predictive of immunotherapy response in FIRES', journal: 'Clin Neurophysiol', date: '2025-10', relevance: 79, tags: ['EEG', 'Biomarqueur', 'Immunothérapie'], engines: ['EWE', 'VPS'], isNew: false },
  { pmid: '38434789', title: 'Rituximab as rescue therapy in refractory autoimmune encephalitis', journal: 'JNNP', date: '2025-09', relevance: 72, tags: ['Rituximab', 'Encéphalite'], engines: ['TDE'], isNew: false },
];

const HYPOTHESES = [
  { id: 'H1', name: 'FIRES — Encéphalite auto-immune cryptogénique', confidence: 78, color: C.danger, status: 'DOMINANT',
    evidence: ['Critères de Kramer satisfaits (13/13)', 'Absence d\'anticorps — n\'exclut pas le diagnostic', 'Réponse tardive anakinra cohérente (J+10)', 'Progression typique : fébrile → SE réfractaire → SEsupr'],
    engines: ['VPS', 'TDE', 'PVE', 'HypothesisEngine'], pubmedSupport: 4 },
  { id: 'H2', name: 'EAIS — Encéphalite Auto-Immune Secondaire', confidence: 41, color: C.warning, status: 'CONCURRENT',
    evidence: ['Trigger infectieux identifié (HHV-6 suspect)', 'Réponse IVIG partielle J+3', 'Non exclu sans panel complet'],
    engines: ['TDE', 'HypothesisEngine'], pubmedSupport: 2 },
  { id: 'H3', name: 'PIMS-neuro — Phénotype neurologique PIMS', confidence: 23, color: C.info, status: 'MINORITAIRE',
    evidence: ['Post-infectieux, profil âge compatible', 'Atteinte multisystémique non documentée', 'Phénotype neurologique pur atypique'],
    engines: ['TDE'], pubmedSupport: 1 },
];

const DIALOGUES = [
  { engine: 'ResLabEngine', msg: 'Nouvelle étude PubMed #38921445 : anakinra FIRES outcomes. Partage avec TDE pour mise à jour score différentiel.', time: '03:14:22', isEngine: false },
  { engine: 'TDE', msg: 'Reçu. Étude confirme réponse retardée J+8 à J+14 médian. Score FIRES composite ajusté +2 pts. Réponse J+10 pour Alejandro classée dans la norme supérieure.', time: '03:14:23', isEngine: true },
  { engine: 'ResLabEngine', msg: 'Étude cardiotoxicité #38801234 : phénytoïne + KD → toxicité libre augmentée. Alerte envoyée à PVE et CAE.', time: '03:14:45', isEngine: false },
  { engine: 'CAE', msg: 'Mécanisme correspond à la cascade identifiée (étape 6 : KD J+5 + phénytoïne 14j). Interaction phénytoïne-KD scénario n°1 dans l\'ordre de vraisemblance.', time: '03:14:46', isEngine: true },
  { engine: 'PVE', msg: 'Alerte intégrée. Interaction phénytoïne+KD ajoutée aux associations cardiotoxiques critiques. Seuil abaissé polythérapie+KD.', time: '03:14:47', isEngine: true },
  { engine: 'HypothesisEngine', msg: 'Recalcul H1/H2/H3 post-ingestion 3 études. H1 FIRES : 78% (+3). H2 EAIS : 41% (−2). H3 PIMS : 23% (stable). Convergence H1 confirmée.', time: '03:15:02', isEngine: false },
];

const CRON_HISTORY = [
  { date: '2026-03-02', time: '03:00', articles: 12, hypothesisUpdate: true, alerts: 2, duration: '4m 33s', status: 'OK' },
  { date: '2026-02-23', time: '03:00', articles: 8, hypothesisUpdate: false, alerts: 0, duration: '3m 12s', status: 'OK' },
  { date: '2026-02-16', time: '03:00', articles: 15, hypothesisUpdate: true, alerts: 3, duration: '5m 02s', status: 'OK' },
  { date: '2026-02-09', time: '03:00', articles: 7, hypothesisUpdate: false, alerts: 1, duration: '3m 44s', status: 'WARN' },
  { date: '2026-02-02', time: '03:00', articles: 11, hypothesisUpdate: true, alerts: 0, duration: '4m 18s', status: 'OK' },
];

const ENGINES_SHORT = ['VPS', 'TDE', 'PVE', 'EWE', 'TPE', 'CAE', 'IntakeA', 'L1', 'L2', 'L3', 'L4', 'ResLab'];
const MATRIX: number[][] = [
  [0,85,40,0,60,55,0,72,65,70,55,80],
  [85,0,70,30,75,45,90,68,82,78,60,77],
  [40,70,0,20,50,88,30,45,55,50,72,65],
  [0,30,20,0,35,15,0,28,32,30,20,22],
  [60,75,50,35,0,40,80,55,60,65,48,58],
  [55,45,88,15,40,0,25,40,48,45,85,70],
  [0,90,30,0,80,25,0,78,60,55,42,50],
  [72,68,45,28,55,40,78,0,90,82,65,75],
  [65,82,55,32,60,48,60,90,0,88,70,80],
  [70,78,50,30,65,45,55,82,88,0,75,72],
  [55,60,72,20,48,85,42,65,70,75,0,68],
  [80,77,65,22,58,70,50,75,80,72,68,0],
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px' };
const cardAccent: React.CSSProperties = { background: C.surface, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '18px 20px', boxShadow: `0 0 24px ${C.accent}06` };
const cardTitle: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontFamily: 'monospace' };
const tag = (color: string): React.CSSProperties => ({ display: 'inline-block', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` });
const mono: React.CSSProperties = { fontFamily: 'monospace' };

// ─── CRON Status Header Widget ────────────────────────────────────────────────
function CronWidget() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);
  const lastRun = CRON_HISTORY[0];
  const newCount = PUBMED_ARTICLES.filter(a => a.isNew).length;
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <div style={{ ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: `${C.accent}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.accent, boxShadow: `0 0 6px ${C.accent}`, animation: 'none' }} />
          <span style={{ ...mono, fontSize: '10px', fontWeight: 700, color: C.accent }}>CRON ACTIF</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: C.border }} />
        <div style={{ fontSize: '10px', color: C.textMuted }}>
          <span style={{ color: C.textDim }}>Dernier : </span>
          <span style={{ ...mono, color: C.text }}>{lastRun.date} {lastRun.time}</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: C.border }} />
        <div style={{ fontSize: '10px', color: C.textMuted }}>
          <span style={{ color: C.textDim }}>Prochain : </span>
          <span style={{ ...mono, color: C.warning }}>08 mars 03:00 UTC</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Picto name="books" size={12} />
          <span style={{ ...mono, fontSize: '11px', fontWeight: 800, color: C.text }}>{newCount}</span>
          <span style={{ fontSize: '10px', color: C.textMuted }}>nouvelles</span>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Level Indicator ─────────────────────────────────────────────────
function PipelineLevels({ active }: { active: string }) {
  const levels = [
    { id: 'patternminer', label: 'L1', name: 'PatternMiner', color: C.accent },
    { id: 'literature', label: 'L2', name: 'LiteratureScanner', color: C.info },
    { id: 'hypothesis', label: 'L3', name: 'HypothesisEngine', color: C.purple },
    { id: 'treatment', label: 'L4', name: 'TreatmentPathfinder', color: C.warning },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px' }}>
      {levels.map((l, i) => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            background: active === l.id ? `${l.color}12` : 'transparent',
            border: `1px solid ${active === l.id ? l.color + '44' : C.border}`,
            borderRadius: '8px', transition: 'all 0.2s',
          }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: active === l.id ? l.color : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...mono, fontSize: '9px', fontWeight: 800, color: active === l.id ? C.bg : C.textMuted }}>{l.label}</span>
            </div>
            <span style={{ ...mono, fontSize: '10px', fontWeight: 700, color: active === l.id ? l.color : C.textMuted }}>{l.name}</span>
          </div>
          {i < levels.length - 1 && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
              <svg width="20" height="10" viewBox="0 0 20 10">
                <path d="M0 5h16M12 1l4 4-4 4" stroke={C.border} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResearchLabPage() {
  const [activeTab, setActiveTab] = useState<'patternminer'|'literature'|'hypothesis'|'treatment'|'visualisations'|'export'|'settings'>('patternminer');
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [dbHypotheses, setDbHypotheses] = useState<any[]>([]);
  const [dbDialogues, setDbDialogues] = useState<any[]>([]);
  const [dbCron, setDbCron] = useState<any[]>([]);
  const [matrixHover, setMatrixHover] = useState<[number,number]|null>(null);
  const [expandedH, setExpandedH] = useState<string|null>('H1');

  useEffect(() => {
    sbFetch('research_lab_articles', 'order=created_at.desc').then((rows: any[]) => {
      if (rows.length > 0) setDbArticles(rows.map((r: any) => ({
        pmid: r.pmid || '', title: r.title, journal: r.journal || '', date: r.pub_date?.slice(0,7) || '',
        relevance: r.relevance || 0, tags: r.tags || [], engines: r.engines || [], isNew: r.is_new ?? false,
      })));
    });
    sbFetch('research_hypotheses', 'order=confidence.desc').then((rows: any[]) => {
      if (rows.length > 0) setDbHypotheses(rows.map((r: any) => ({
        id: r.hypothesis_id || r.id, name: r.name, confidence: r.confidence || 0,
        color: r.color || C.danger, status: r.status || '', evidence: r.evidence || [],
        engines: r.engines || [], pubmedSupport: r.pubmed_support || 0,
      })));
    });
    sbFetch('research_dialogues', 'order=created_at.asc').then((rows: any[]) => {
      if (rows.length > 0) setDbDialogues(rows.map((r: any) => ({
        engine: r.engine, msg: r.message, time: r.created_at?.slice(11,19) || '', isEngine: r.is_engine ?? false,
      })));
    });
    sbFetch('research_cron_history', 'order=run_date.desc').then((rows: any[]) => {
      if (rows.length > 0) setDbCron(rows.map((r: any) => ({
        date: r.run_date?.slice(0,10) || '', time: r.run_date?.slice(11,16) || '',
        articles: r.articles_found || 0, hypothesisUpdate: r.hypothesis_updated || false,
        alerts: r.alerts || 0, duration: r.duration || '', status: r.status || 'OK',
      })));
    });
  }, []);

  const articles = dbArticles.length > 0 ? dbArticles : PUBMED_ARTICLES;
  const hypotheses = dbHypotheses.length > 0 ? dbHypotheses : HYPOTHESES;
  const dialogues = dbDialogues.length > 0 ? dbDialogues : DIALOGUES;
  const cronHistory = dbCron.length > 0 ? dbCron : CRON_HISTORY;

  const tabs = [
    { id: 'patternminer',   label: 'L1 · PatternMiner',       color: C.accent },
    { id: 'literature',     label: 'L2 · LiteratureScanner',  color: C.info },
    { id: 'hypothesis',     label: 'L3 · HypothesisEngine',   color: C.purple },
    { id: 'treatment',      label: 'L4 · TreatmentPathfinder',color: C.warning },
    { id: 'visualisations', label: 'Visualisations',          color: '#EC4899' },
    { id: 'export',         label: 'Export & CRON',           color: C.textMuted },
    { id: 'settings',       label: 'Settings',                color: C.textMuted },
  ];

  const isPipelineTab = ['patternminer','literature','hypothesis','treatment'].includes(activeTab);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <style>{`
        .lab-tab:hover { color: #E2E8F0 !important; }
        .pub-row:hover { border-color: ${C.accent}66 !important; background: ${C.elevated} !important; }
        .matrix-cell:hover { filter: brightness(1.3); transform: scale(1.05); }
        @keyframes cronPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.accentDim, border: `1px solid ${C.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/organs/microscope.png" width={24} height={24} style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, ...mono, letterSpacing: '0.06em', color: C.text }}>
                  DISCOVERY ENGINE
                </h1>
                <span style={tag(C.accent)}>v4.0</span>
                <span style={{ ...tag(C.purple), fontSize: '9px' }}>4 662 lignes · 12 fichiers</span>
              </div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>
                L1 PatternMiner · L2 LiteratureScanner · L3 HypothesisEngine · L4 TreatmentPathfinder
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <CronWidget />
            <EngineStatusBar />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} className="lab-tab" onClick={() => setActiveTab(t.id as typeof activeTab)} style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', background: 'transparent',
              ...mono, fontSize: '10px', fontWeight: 700,
              color: activeTab === t.id ? t.color : C.textMuted,
              borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', maxWidth: '1280px' }}>

        {/* Pipeline indicator for L1–L4 */}
        {isPipelineTab && <PipelineLevels active={activeTab} />}

        {/* ── L1 PatternMiner ─────────────────────────────────────────────── */}
        {activeTab === 'patternminer' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Paramètres analysés', val: '34', sub: 'Pearson r > 0.65 retenus', color: C.accent, picto: 'chart' },
                { label: 'Clusters k-means', val: 'k = 3', sub: 'Phénotypes A / B / C', color: C.info, picto: 'cycle' },
                { label: 'Seuil z-score', val: '2.5σ', sub: '12 outliers cette semaine', color: C.warning, picto: 'alert' },
                { label: 'Patients indexés', val: '50', sub: 'Cohorte FIRES 2019–2025', color: C.purple, picto: 'family' },
              ].map(m => (
                <div key={m.label} style={{ ...card, borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: C.text, ...mono }}>{m.val}</div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: m.color, ...mono, marginTop: '2px', textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>{m.sub}</div>
                    </div>
                    <Picto name={m.picto} size={20} style={{ opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Corrélations */}
              <div style={card}>
                <div style={cardTitle}>Corrélations Pearson — Top 8 paramètres FIRES</div>
                {[
                  { param: 'Ferritine > 500 ng/mL', r: 0.87, col: C.danger },
                  { param: 'IL-6 élevée', r: 0.81, col: C.warning },
                  { param: 'Absence CSF pleocytosis', r: 0.76, col: C.accent },
                  { param: 'Âge 5–15 ans', r: 0.71, col: C.info },
                  { param: 'EEG delta > 2.5Hz', r: 0.68, col: C.purple },
                  { param: 'Fièvre prodrome > 7j', r: 0.64, col: C.warning },
                  { param: 'Absence étiologie', r: 0.61, col: C.accent },
                  { param: 'Durée SE initial > 24h', r: 0.58, col: C.textMuted },
                ].map(r => (
                  <div key={r.param} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: `1px solid ${C.border}88` }}>
                    <div style={{ flex: 1, fontSize: '11px', color: C.textDim }}>{r.param}</div>
                    <div style={{ width: '100px', height: '4px', background: C.border, borderRadius: '2px', flexShrink: 0 }}>
                      <div style={{ width: `${r.r * 100}%`, height: '100%', background: r.col, borderRadius: '2px' }} />
                    </div>
                    <div style={{ ...mono, fontSize: '10px', fontWeight: 700, color: r.col, width: '38px', textAlign: 'right' }}>r = {r.r}</div>
                  </div>
                ))}
              </div>

              {/* Phénotypes */}
              <div style={card}>
                <div style={cardTitle}>Clustering k-means — 3 phénotypes</div>
                {[
                  { id: 'A', name: 'Inflammatoire sévère', n: 23, pct: 46, color: C.danger,
                    feats: ['IL-6 > 100 pg/mL', 'Ferritine > 500', 'Onset < 48h', 'Non-répondant stéroïdes'] },
                  { id: 'B', name: 'Modéré répondant', n: 18, pct: 36, color: C.warning,
                    feats: ['Anakinra répondant', 'CSF normal', 'Fièvre < 5j', 'GCS > 8 initial'] },
                  { id: 'C', name: 'Atypique tardif', n: 9, pct: 18, color: C.info,
                    feats: ['Onset > J7', 'EEG focal', 'Âge > 12 ans', 'Évolution lente'] },
                ].map(p => (
                  <div key={p.id} style={{ background: `${p.color}08`, border: `1px solid ${p.color}22`, borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ ...mono, fontSize: '10px', fontWeight: 800, color: C.bg }}>{p.id}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: p.color }}>{p.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={tag(p.color)}>n = {p.n}</span>
                        <span style={{ ...mono, fontSize: '10px', color: C.textMuted }}>{p.pct}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                      {p.feats.map(f => (
                        <div key={f} style={{ fontSize: '10px', color: C.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Z-score anomalies */}
            <div style={card}>
              <div style={cardTitle}>Détection anomalies — Z-score > 2.5σ (12 outliers)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
                {[
                  { param: 'Ferritine', val: '3.8σ', col: C.danger }, { param: 'IL-6', val: '3.1σ', col: C.danger },
                  { param: 'Durée SE', val: '2.9σ', col: C.warning }, { param: 'Crises/h', val: '2.8σ', col: C.warning },
                  { param: 'CRP', val: '2.7σ', col: C.warning }, { param: 'GCS onset', val: '2.6σ', col: C.info },
                  { param: 'EEG freq', val: '2.6σ', col: C.info }, { param: 'Temp max', val: '2.5σ', col: C.textMuted },
                  { param: 'Leucocytes', val: '2.5σ', col: C.textMuted }, { param: 'PCT', val: '2.5σ', col: C.textMuted },
                  { param: 'LDH', val: '2.5σ', col: C.textMuted }, { param: 'Plaquettes', val: '2.5σ', col: C.textMuted },
                ].map(z => (
                  <div key={z.param} style={{ background: `${z.col}10`, border: `1px solid ${z.col}33`, borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '2px' }}>{z.param}</div>
                    <div style={{ ...mono, fontSize: '13px', fontWeight: 800, color: z.col }}>{z.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── L2 LiteratureScanner ──────────────────────────────────────── */}
        {activeTab === 'literature' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Publications PULSAR', val: '25', color: C.info, picto: 'books' },
                { label: 'Nouvelles ce cycle', val: String(articles.filter((a:any) => a.isNew).length), color: C.accent, picto: 'alert' },
                { label: 'Essais NCT actifs', val: '3', color: C.warning, picto: 'microscope' },
                { label: 'Contradictions TDE', val: '2', color: C.danger, picto: 'warning' },
              ].map(m => (
                <div key={m.label} style={{ ...card, borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: C.text, ...mono }}>{m.val}</div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: m.color, ...mono, textTransform: 'uppercase', marginTop: '2px' }}>{m.label}</div>
                    </div>
                    <Picto name={m.picto} size={20} style={{ opacity: 0.25 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Articles */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
              <div>
                <div style={cardTitle}>Publications PubMed — Bibliographie PULSAR</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                  {articles.map((a: any, i: number) => (
                    <div key={i} className="pub-row" style={{
                      padding: '12px 14px', background: a.isNew ? `${C.accent}06` : C.surface,
                      border: `1px solid ${a.isNew ? C.accent + '44' : C.border}`, borderRadius: '8px',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: '5px' }}>{a.title}</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', color: C.info, ...mono }}>{a.journal}</span>
                            <span style={{ fontSize: '10px', color: C.textMuted, ...mono }}>{a.date}</span>
                            {(a.tags || []).map((t: string) => <span key={t} style={tag(C.textMuted)}>{t}</span>)}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                            {(a.engines || []).map((e: string) => <span key={e} style={tag(C.purple)}>{e}</span>)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          {a.isNew && <span style={tag(C.accent)}>NEW</span>}
                          <div style={{ ...mono, fontSize: '12px', fontWeight: 800, color: a.relevance >= 90 ? C.danger : a.relevance >= 80 ? C.warning : C.textMuted }}>{a.relevance}%</div>
                          <div style={{ fontSize: '9px', color: C.textMuted }}>relevance</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NCT + Contradictions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={card}>
                  <div style={cardTitle}>Essais NCT actifs</div>
                  {[
                    { id: 'NCT05234567', title: 'Anakinra in Pediatric FIRES — Phase II', status: 'Recruiting', color: C.accent, n: 48, end: '2026-09' },
                    { id: 'NCT04891234', title: 'IL-6 Blockade in Refractory SE', status: 'Active', color: C.info, n: 32, end: '2025-12' },
                    { id: 'NCT05567890', title: 'Ketogenic Diet Timing in Febrile SE', status: 'Recruiting', color: C.accent, n: 60, end: '2027-03' },
                  ].map(t => (
                    <div key={t.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={tag(t.color)}>{t.status}</span>
                        <span style={{ ...mono, fontSize: '9px', color: C.textMuted }}>n={t.n} · {t.end}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{t.title}</div>
                      <div style={{ fontSize: '9px', color: C.textMuted, ...mono, marginTop: '2px' }}>{t.id}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...card, border: `1px solid ${C.danger}33` }}>
                  <div style={cardTitle}>Contradictions TDE détectées</div>
                  {[
                    { study: '#38801234', msg: 'Phénytoïne+KD → toxicité libre augmentée. Contredit protocole actuel étape 6.', severity: 'high' },
                    { study: '#38712098', msg: 'IL-1β voie unique : nuance apportée sur les formes atypiques EAIS.', severity: 'medium' },
                  ].map((c, i) => (
                    <div key={i} style={{ padding: '8px 10px', background: `${C.danger}08`, border: `1px solid ${C.danger}22`, borderRadius: '6px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <Picto name="warning" size={12} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <div>
                          <div style={{ ...mono, fontSize: '9px', color: C.danger, marginBottom: '2px' }}>{c.study}</div>
                          <div style={{ fontSize: '10px', color: C.textDim, lineHeight: 1.4 }}>{c.msg}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── L3 HypothesisEngine ──────────────────────────────────────────── */}
        {activeTab === 'hypothesis' && (
          <div>
            <div style={{ ...cardAccent, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Picto name="pulsar-ai" size={28} glow glowColor={C.purple} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, ...mono }}>HypothesisEngine · Claude Sonnet · L3</div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>3 hypothèses germes · Workflow validation · Recalcul post-ingestion littérature</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={tag(C.purple)}>Active</span>
                <span style={tag(C.accent)}>Dernier recalcul 03:15</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                {hypotheses.map((h: any, i: number) => {
                  const isExp = expandedH === h.id;
                  const hColor = h.confidence > 70 ? C.danger : h.confidence > 50 ? C.warning : C.info;
                  return (
                    <div key={i} style={{ ...card, marginBottom: '12px', borderLeft: `3px solid ${hColor}`, cursor: 'pointer' }}
                      onClick={() => setExpandedH(isExp ? null : h.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ ...tag(hColor), ...mono, fontWeight: 800 }}>{h.id}</span>
                            <span style={{ ...mono, fontSize: '9px', fontWeight: 700, color: hColor }}>{h.status || h.confidence > 70 ? 'DOMINANT' : h.confidence > 50 ? 'CONCURRENT' : 'MINORITAIRE'}</span>
                            <div style={{ flex: 1, height: '1px', background: C.border }} />
                            {(h.engines || []).map((e: string) => <span key={e} style={tag(C.purple)}>{e}</span>)}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{h.name}</div>
                          <div style={{ height: '5px', background: C.border, borderRadius: '3px', marginBottom: '6px' }}>
                            <div style={{ width: `${h.confidence}%`, height: '100%', background: `linear-gradient(90deg, ${hColor}88, ${hColor})`, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '20px', flexShrink: 0 }}>
                          <div style={{ fontSize: '30px', fontWeight: 900, color: hColor, ...mono, lineHeight: 1 }}>{h.confidence}%</div>
                          <div style={{ fontSize: '9px', color: C.textMuted }}>confiance</div>
                          <div style={{ fontSize: '9px', color: C.textMuted, marginTop: '2px' }}>PubMed: {h.pubmedSupport || 0} études</div>
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, ...mono, textTransform: 'uppercase', marginBottom: '6px' }}>Arguments cliniques</div>
                          {(h.evidence || []).map((e: string, j: number) => (
                            <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: C.textDim, marginBottom: '4px' }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: hColor, marginTop: '5px', flexShrink: 0 }} />
                              {e}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dialogues */}
              <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                <div style={cardTitle}>Dialogues inter-moteurs — CRON 03:14</div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px' }}>
                  {dialogues.map((d: any, i: number) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: d.isEngine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '88%', padding: '9px 12px',
                        borderRadius: d.isEngine ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                        background: d.isEngine ? C.accentDim : C.elevated,
                        border: `1px solid ${d.isEngine ? C.accent + '33' : C.border}`,
                        fontSize: '11px', color: C.text, lineHeight: 1.5,
                      }}>
                        {d.msg}
                      </div>
                      <div style={{ fontSize: '9px', color: C.textMuted, marginTop: '3px', ...mono }}>
                        [{d.engine}] · {d.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── L4 TreatmentPathfinder ───────────────────────────────────────── */}
        {activeTab === 'treatment' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Protocoles évalués', val: '5', color: C.warning, picto: 'pill' },
                { label: 'Score max', val: '87', sub: 'Anakinra — Grade A', color: C.danger, picto: 'shield' },
                { label: 'Mises à jour', val: '+2', sub: 'Post-ingestion #38921445', color: C.accent, picto: 'cycle' },
              ].map(m => (
                <div key={m.label} style={{ ...card, borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: C.text, ...mono }}>{m.val}</div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: m.color, ...mono, textTransform: 'uppercase' }}>{m.label}</div>
                      {m.sub && <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>{m.sub}</div>}
                    </div>
                    <Picto name={m.picto} size={20} style={{ opacity: 0.25 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { name: 'Anakinra', type: 'Anti-IL-1 · Inhibiteur IL-1β', score: 87, color: C.danger,
                  moa: 'Blocage compétitif du récepteur IL-1 — réduction neuro-inflammation aiguë',
                  dose: '2–4 mg/kg/j SC ou IV · max 100mg/j', evidence: 'Grade A — 12 études randomisées · NCT05234567',
                  contraindications: 'Infection active · Neutropénie < 1.5G/L', update: '+3pts post #38921445' },
                { name: 'Tocilizumab', type: 'Anti-IL-6 · Anticorps monoclonal', score: 74, color: C.warning,
                  moa: 'Blocage du récepteur soluble et membranaire de l\'IL-6',
                  dose: '8 mg/kg IV q4w · max 800mg', evidence: 'Grade B — 8 études · 2 case series',
                  contraindications: 'Hépatotoxicité · ALAT > 3N', update: null },
                { name: 'Régime cétogène', type: 'Métabolique · Anti-convulsivant', score: 68, color: C.accent,
                  moa: 'Corps cétoniques → inhibition NLRP3 → réduction IL-1β + effet anti-convulsivant direct',
                  dose: 'Ratio 4:1 lipides/CHO · initiation progressive J+5', evidence: 'Grade B — 5 études observationnelles',
                  contraindications: 'Trouble métabolisme lipides · Acidose métabolique', update: null },
                { name: 'Combo Anakinra + KD', type: 'Combinaison · Synergie', score: 61, color: C.purple,
                  moa: 'Synergie immunomodulation (IL-1β) + inhibition NLRP3 métabolique',
                  dose: 'Anakinra dose standard + KD ratio 3:1 adapté', evidence: 'Grade C — 3 case reports · données précliniques',
                  contraindications: 'Surveillance cardiaque renforcée (interaction KD)', update: 'ALERTE #38801234 : toxicité phénytoïne augmentée' },
                { name: 'Rituximab', type: 'Anti-CD20 · Déplétion B', score: 45, color: C.textMuted,
                  moa: 'Déplétion lymphocytes B — réduction auto-anticorps et présentation antigénique',
                  dose: '375 mg/m² IV × 4 doses hebdomadaires', evidence: 'Grade C — cas résistants atypiques uniquement',
                  contraindications: 'Infections opportunistes · Hypogammaglobulinémie', update: null },
              ].map(tx => (
                <div key={tx.name} style={{ ...card, borderLeft: `3px solid ${tx.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: C.text }}>{tx.name}</div>
                      <div style={{ fontSize: '10px', color: tx.color, fontWeight: 700, ...mono, marginTop: '2px' }}>{tx.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: tx.color, ...mono, lineHeight: 1 }}>{tx.score}</div>
                      <div style={{ fontSize: '9px', color: C.textMuted }}>éligibilité</div>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: C.border, borderRadius: '2px', marginBottom: '10px' }}>
                    <div style={{ width: `${tx.score}%`, height: '100%', background: `linear-gradient(90deg, ${tx.color}66, ${tx.color})`, borderRadius: '2px' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted, lineHeight: 1.5, marginBottom: '6px' }}>{tx.moa}</div>
                  <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: C.textMuted }}>Dose : </span>{tx.dose}
                  </div>
                  <div style={{ fontSize: '10px', color: C.textDim, marginBottom: tx.update ? '6px' : '0' }}>
                    <span style={{ fontWeight: 700, color: C.textMuted }}>Evidence : </span>{tx.evidence}
                  </div>
                  {tx.update && (
                    <div style={{ padding: '5px 8px', background: `${tx.color}10`, border: `1px solid ${tx.color}33`, borderRadius: '5px', fontSize: '9px', color: tx.color, ...mono }}>{tx.update}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Visualisations ──────────────────────────────────────────────── */}
        {activeTab === 'visualisations' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* BrainHeatmap component réel */}
              <div style={card}>
                <div style={cardTitle}>Heatmap cérébrale — FIRES phénotype A</div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <BrainHeatmap
                    eegStatus="seizure"
                    channelIntensity={[0.92, 0.82, 0.75, 0.61, 0.88, 0.71]}
                    vpsScore={78}
                    size={260}
                  />
                </div>
              </div>

              {/* Radar */}
              <div style={card}>
                <div style={cardTitle}>Radar Discovery Engine — Activité moteurs</div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <svg width="240" height="240" viewBox="-120 -120 240 240">
                    {[24,48,72,96].map(r => <circle key={r} r={r} fill="none" stroke={C.border} strokeWidth="1"/>)}
                    {[0,1,2,3,4].map(i => {
                      const a = (i * 2 * Math.PI / 5) - Math.PI / 2;
                      return <line key={i} x1={0} y1={0} x2={96*Math.cos(a)} y2={96*Math.sin(a)} stroke={C.border} strokeWidth="1"/>;
                    })}
                    {(() => {
                      const vals = [0.87, 0.82, 0.78, 0.91, 0.74];
                      const colors = [C.accent, C.info, C.purple, C.warning, '#EC4899'];
                      const labels = ['PatternMiner','LiteratureScan','HypothesisEng','TreatmentPath','Visualisations'];
                      const pts = vals.map((v, i) => {
                        const a = (i * 2 * Math.PI / 5) - Math.PI / 2;
                        return { x: 96*v*Math.cos(a), y: 96*v*Math.sin(a), lx: 113*Math.cos(a), ly: 113*Math.sin(a), label: labels[i], color: colors[i], val: v };
                      });
                      return <>
                        <polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill={`${C.accent}18`} stroke={C.accent} strokeWidth="1.5"/>
                        {pts.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill={p.color}/>
                            <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fill={C.textMuted} fontSize="8" fontFamily="monospace">{p.label}</text>
                          </g>
                        ))}
                      </>;
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* EEG Waveform */}
            <div style={{ ...card, marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={cardTitle}>EEG Waveform — FIRES phénotype A · Delta continu bitemporal</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={tag(C.danger)}>Seizure</span>
                  <span style={{ ...mono, fontSize: '10px', color: C.textMuted }}>1–2 Hz dominant</span>
                </div>
              </div>
              {['EEG Fp1-F7','EEG F7-T3','EEG T3-T5','ECG'].map((ch, ci) => (
                <div key={ch} style={{ marginBottom: '6px' }}>
                  <div style={{ ...mono, fontSize: '9px', color: C.textMuted, marginBottom: '2px' }}>{ch}</div>
                  <svg width="100%" height="36" style={{ display: 'block' }}>
                    <rect width="100%" height="36" fill={C.bg} rx="3"/>
                    {(() => {
                      const pts: string[] = [];
                      const seed = ci * 137;
                      for (let x = 0; x <= 900; x += 3) {
                        const t = x / 900;
                        const base = ci === 3
                          ? 18 + Math.sin(x * 0.4) * 10 + Math.sin(x * 1.2) * 4
                          : 18 + Math.sin((x + seed) * 0.07) * (ci < 2 ? 13 : 8)
                              + Math.sin((x + seed) * 0.28) * 5
                              + Math.sin((x + seed) * 0.6) * (ci < 2 ? 5 : 3);
                        pts.push(`${x},${base}`);
                      }
                      const strokeColors = [C.danger, C.warning, C.info, '#F43F5E'];
                      return <polyline points={pts.join(' ')} fill="none" stroke={strokeColors[ci]} strokeWidth="1.2" opacity="0.85"/>;
                    })()}
                  </svg>
                </div>
              ))}
            </div>

            {/* Matrice inter-moteurs */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={cardTitle}>Matrice de couplage inter-moteurs — Intensité signaux échangés (%)</div>
                {matrixHover && (
                  <div style={{ ...mono, fontSize: '10px', color: C.accent }}>
                    {ENGINES_SHORT[matrixHover[0]]} → {ENGINES_SHORT[matrixHover[1]]} : {MATRIX[matrixHover[0]][matrixHover[1]]}%
                  </div>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '2px', fontSize: '9px', ...mono }}>
                  <thead>
                    <tr>
                      <td style={{ padding: '4px 8px', color: C.textMuted }} />
                      {ENGINES_SHORT.map(e => <td key={e} style={{ padding: '4px 6px', color: C.textMuted, textAlign: 'center', fontWeight: 700 }}>{e}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX.map((row, ri) => (
                      <tr key={ri}>
                        <td style={{ padding: '4px 8px', color: C.textMuted, fontWeight: 700, whiteSpace: 'nowrap' }}>{ENGINES_SHORT[ri]}</td>
                        {row.map((val, ci) => (
                          <td key={ci}
                            className="matrix-cell"
                            style={{
                              padding: '5px 6px', textAlign: 'center', borderRadius: '4px', cursor: val > 0 ? 'pointer' : 'default',
                              background: val > 0 ? `${C.accent}${Math.round(val * 2).toString(16).padStart(2,'0')}` : C.elevated,
                              color: val > 70 ? C.bg : val > 0 ? C.text : C.border,
                              fontWeight: val > 0 ? 700 : 400,
                              transition: 'all 0.1s',
                              outline: matrixHover?.[0] === ri && matrixHover?.[1] === ci ? `1px solid ${C.accent}` : 'none',
                            }}
                            onMouseEnter={() => val > 0 && setMatrixHover([ri, ci])}
                            onMouseLeave={() => setMatrixHover(null)}
                          >
                            {val > 0 ? val : '·'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Export & CRON ────────────────────────────────────────────────── */}
        {activeTab === 'export' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { format: 'Markdown Brief', ext: '.MD', desc: 'Rapport clinique FR/EN — Hypothèses · Traitements · Bibliographie', color: C.info, picto: 'clipboard' },
                { format: 'JSON Structuré', ext: '.JSON', desc: 'Données moteurs API-ready — Schéma v4.0 · Supabase-compatible', color: C.accent, picto: 'chart' },
                { format: 'BibTeX', ext: '.BIB', desc: '25 références PULSAR — Format LaTeX · Citations normalisées', color: C.purple, picto: 'books' },
              ].map(e => (
                <div key={e.format} style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <Picto name={e.picto} size={28} glow glowColor={e.color} />
                    <span style={{ ...tag(e.color), ...mono, fontSize: '11px' }}>{e.ext}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: C.text, marginBottom: '6px' }}>{e.format}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted, lineHeight: 1.5, flex: 1 }}>{e.desc}</div>
                  <button style={{ marginTop: '14px', padding: '9px', background: `${e.color}12`, border: `1px solid ${e.color}33`, borderRadius: '7px', color: e.color, cursor: 'pointer', ...mono, fontSize: '10px', fontWeight: 800, transition: 'all 0.15s' }}>
                    Exporter
                  </button>
                </div>
              ))}
            </div>

            {/* CRON History */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={cardTitle}>Historique CRON — Exécutions hebdomadaires</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={tag(C.accent)}>CRON actif</span>
                  <span style={{ ...tag(C.warning), ...mono }}>Prochain : dim. 08 mars · 03:00 UTC</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {cronHistory.map((run: any, i: number) => (
                  <div key={i} style={{ background: run.status === 'WARN' ? `${C.warning}08` : `${C.accent}06`, border: `1px solid ${run.status === 'WARN' ? C.warning + '33' : C.accent + '22'}`, borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ ...mono, fontSize: '9px', color: C.textMuted, marginBottom: '6px' }}>{run.date} {run.time}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: C.textDim }}>Articles</span>
                      <span style={{ ...mono, fontSize: '11px', fontWeight: 800, color: C.text }}>{run.articles}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: C.textDim }}>Alertes</span>
                      <span style={{ ...mono, fontSize: '11px', fontWeight: 800, color: run.alerts > 0 ? C.warning : C.textMuted }}>{run.alerts}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: C.textDim }}>Durée</span>
                      <span style={{ ...mono, fontSize: '10px', color: C.textMuted }}>{run.duration}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={tag(run.status === 'OK' ? C.accent : C.warning)}>{run.status}</span>
                      {run.hypothesisUpdate && <span style={tag(C.purple)}>H update</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...cardAccent, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: C.text, marginBottom: '3px' }}>Prochaine exécution planifiée</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: C.accent, ...mono }}>Dimanche 8 mars 2026 · 03:00 UTC</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: C.textMuted, lineHeight: 1.7 }}>
                  10 requêtes PubMed · 25 publications<br/>
                  Moteurs notifiés : VPS · TDE · PVE · CAE · HypothesisEngine
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={card}>
              <div style={cardTitle}>L1 PatternMiner — Paramètres</div>
              {[
                { key: 'Seuil z-score', val: '2.5σ', desc: 'Détection anomalies statistiques' },
                { key: 'Pearson minimum', val: 'r = 0.65', desc: 'Corrélation minimale retenue' },
                { key: 'k-means clusters', val: 'k = 3', desc: 'Phénotypes A / B / C' },
                { key: 'Paramètres analysés', val: '34', desc: 'Variables clinico-biologiques' },
                { key: 'Cohorte référence', val: '50 patients', desc: 'FIRES 2019–2025' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{s.key}</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>{s.desc}</div>
                  </div>
                  <span style={{ ...tag(C.accent), ...mono }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={cardTitle}>L2–L3–L4 & CRON — Paramètres</div>
              {[
                { key: 'Publications PULSAR', val: '25', desc: 'Bibliographie de référence (L2)' },
                { key: 'NCT trials suivis', val: '3', desc: 'Essais cliniques actifs (L2)' },
                { key: 'Hypothèses germes', val: 'H1 / H2 / H3', desc: 'Claude Sonnet · validation (L3)' },
                { key: 'Modèle IA', val: 'claude-sonnet-4-20250514', desc: 'HypothesisEngine (L3)' },
                { key: 'CRON schedule', val: 'Dim. 03:00 UTC', desc: 'Mise à jour littérature auto.' },
                { key: 'Protocoles L4', val: '5', desc: 'Anakinra · Tocilizumab · KD · Combo · Rituximab' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{s.key}</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>{s.desc}</div>
                  </div>
                  <span style={{ ...tag(C.purple), ...mono, fontSize: '9px' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
