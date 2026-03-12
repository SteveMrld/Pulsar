'use client';

import { useState, useEffect } from 'react';
import EngineStatusBar from '@/components/EngineStatusBar';
import RegressionBot from '@/components/RegressionBot';
import Picto from '@/components/Picto';

// ─── Supabase ──────────────────────────────────────────────────────────────────
const SUPA_URL = 'https://tpefzxyrjebnnzgguktm.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZWZ6eHlyamVibm56Z2d1a3RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAzNTM1OSwiZXhwIjoyMDg3NjExMzU5fQ.TCjs9D3ECEsTm4n5JQy4PLeiZmBTzQu-cvzuobNQQyQ';
async function sbFetch(table: string, params = '') {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}&limit=100`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
const ARTICLES = [
  { pmid: '38921445', title: 'FIRES syndrome: long-term outcomes and therapeutic implications of anakinra in refractory cases', journal: 'Ann Neurol', date: '2026-03', relevance: 94, tags: ['FIRES', 'Anakinra', 'Outcome'], engines: ['VPS', 'TDE'], isNew: true },
  { pmid: '38874123', title: 'Ketogenic diet modulation of neuroinflammation in pediatric super-refractory status epilepticus', journal: 'Epilepsia', date: '2026-02', relevance: 87, tags: ['KD', 'SRSE', 'Neuroinflamm.'], engines: ['PVE', 'TDE'], isNew: true },
  { pmid: '38801234', title: 'Cardiac arrhythmia risk under combined antiepileptic polypharmacy: phenytoin-ketogenic interactions', journal: 'Neurocrit Care', date: '2026-02', relevance: 91, tags: ['Cardiotox.', 'Phénytoïne', 'KD'], engines: ['CAE', 'PVE'], isNew: true },
  { pmid: '38712098', title: 'IL-1β pathway dysregulation as a unifying mechanism in febrile infection-related epilepsy', journal: 'Brain', date: '2026-01', relevance: 89, tags: ['IL-1β', 'FIRES'], engines: ['VPS', 'HypothesisEngine'], isNew: false },
  { pmid: '38654321', title: 'PIMS-TS neurological phenotype: revised criteria and differential from FIRES', journal: 'Lancet Child', date: '2026-01', relevance: 82, tags: ['PIMS', 'Diagnostic Diff.'], engines: ['TDE', 'VPS'], isNew: false },
  { pmid: '38590123', title: 'Tocilizumab in super-refractory status epilepticus: multicenter retrospective study', journal: 'NEJM', date: '2025-11', relevance: 88, tags: ['Tocilizumab', 'SRSE'], engines: ['VPS', 'PVE'], isNew: false },
  { pmid: '38512456', title: 'EEG biomarkers predictive of immunotherapy response in FIRES', journal: 'Clin Neurophysiol', date: '2025-10', relevance: 79, tags: ['EEG', 'Biomarqueur'], engines: ['EWE', 'VPS'], isNew: false },
  { pmid: '38434789', title: 'Rituximab as rescue therapy in refractory autoimmune encephalitis', journal: 'JNNP', date: '2025-09', relevance: 72, tags: ['Rituximab', 'Encéphalite'], engines: ['TDE'], isNew: false },
];

const HYPOTHESES = [
  { id: 'H1', name: 'FIRES — Encéphalite auto-immune cryptogénique', confidence: 78, color: 'var(--p-critical)', status: 'DOMINANT',
    evidence: ['Critères de Kramer satisfaits (13/13)', "Absence d'anticorps — n'exclut pas le diagnostic", 'Réponse tardive anakinra cohérente (J+10)', 'Progression typique : fébrile → SE réfractaire → SEsupr'],
    engines: ['VPS', 'TDE', 'PVE', 'HypothesisEngine'], pubmedSupport: 4 },
  { id: 'H2', name: 'EAIS — Encéphalite Auto-Immune Secondaire', confidence: 41, color: 'var(--p-warning)', status: 'CONCURRENT',
    evidence: ['Trigger infectieux identifié (HHV-6 suspect)', 'Réponse IVIG partielle J+3', 'Non exclu sans panel complet'],
    engines: ['TDE', 'HypothesisEngine'], pubmedSupport: 2 },
  { id: 'H3', name: 'PIMS-neuro — Phénotype neurologique PIMS', confidence: 23, color: 'var(--p-info)', status: 'MINORITAIRE',
    evidence: ["Post-infectieux, profil âge compatible", 'Atteinte multisystémique non documentée', 'Phénotype neurologique pur atypique'],
    engines: ['TDE'], pubmedSupport: 1 },
];

const DIALOGUES = [
  { engine: 'ResLabEngine', msg: 'Nouvelle étude PubMed #38921445 : anakinra FIRES outcomes. Partage avec TDE pour mise à jour score différentiel.', time: '03:14:22', isEngine: false },
  { engine: 'TDE', msg: "Reçu. Étude confirme réponse retardée J+8–J+14 médian. Score FIRES composite ajusté +2 pts. Réponse J+10 pour Alejandro classée dans la norme supérieure.", time: '03:14:23', isEngine: true },
  { engine: 'ResLabEngine', msg: 'Étude cardiotoxicité #38801234 : phénytoïne + KD → toxicité libre augmentée. Alerte envoyée à PVE et CAE.', time: '03:14:45', isEngine: false },
  { engine: 'CAE', msg: "Mécanisme correspond à la cascade identifiée (étape 6 : KD J+5 + phénytoïne 14j). Interaction phénytoïne-KD scénario n°1 dans l'ordre de vraisemblance.", time: '03:14:46', isEngine: true },
  { engine: 'PVE', msg: 'Alerte intégrée. Interaction phénytoïne+KD ajoutée aux associations cardiotoxiques critiques.', time: '03:14:47', isEngine: true },
  { engine: 'HypothesisEngine', msg: 'Recalcul H1/H2/H3 post-ingestion 3 études. H1 FIRES : 78% (+3). H2 EAIS : 41% (−2). H3 PIMS : 23% stable. Convergence H1 confirmée.', time: '03:15:02', isEngine: false },
];

const CRON_HISTORY = [
  { date: '2026-03-02', articles: 12, hypothesisUpdate: true,  alerts: 2, duration: '4m 33s', status: 'OK'   },
  { date: '2026-02-23', articles: 8,  hypothesisUpdate: false, alerts: 0, duration: '3m 12s', status: 'OK'   },
  { date: '2026-02-16', articles: 15, hypothesisUpdate: true,  alerts: 3, duration: '5m 02s', status: 'OK'   },
  { date: '2026-02-09', articles: 7,  hypothesisUpdate: false, alerts: 1, duration: '3m 44s', status: 'WARN' },
  { date: '2026-02-02', articles: 11, hypothesisUpdate: true,  alerts: 0, duration: '4m 18s', status: 'OK'   },
];

const ENGINES_LABELS = ['VPS','TDE','PVE','EWE','TPE','CAE','IntakeA','L1','L2','L3','L4','ResLab'];
const MATRIX: number[][] = [
  [0,85,40,0,60,55,0,72,65,70,55,80],[85,0,70,30,75,45,90,68,82,78,60,77],
  [40,70,0,20,50,88,30,45,55,50,72,65],[0,30,20,0,35,15,0,28,32,30,20,22],
  [60,75,50,35,0,40,80,55,60,65,48,58],[55,45,88,15,40,0,25,40,48,45,85,70],
  [0,90,30,0,80,25,0,78,60,55,42,50],[72,68,45,28,55,40,78,0,90,82,65,75],
  [65,82,55,32,60,48,60,90,0,88,70,80],[70,78,50,30,65,45,55,82,88,0,75,72],
  [55,60,72,20,48,85,42,65,70,75,0,68],[80,77,65,22,58,70,50,75,80,72,68,0],
];

// ─── SVG Components ────────────────────────────────────────────────────────────

function EEGWaveform({ channel, seedOffset, color, height = 48 }: { channel: string; seedOffset: number; color: string; height?: number }) {
  const pts: string[] = [];
  for (let x = 0; x <= 800; x += 3) {
    const y = height / 2
      + Math.sin((x + seedOffset) * 0.072) * (height * 0.3)
      + Math.sin((x + seedOffset) * 0.29) * (height * 0.12)
      + Math.sin((x + seedOffset) * 0.61) * (height * 0.07);
    pts.push(`${x},${Math.round(y * 10) / 10}`);
  }
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '2px' }}>{channel}</div>
      <svg width="100%" height={height} viewBox={`0 0 800 ${height}`} preserveAspectRatio="none" style={{ display: 'block', borderRadius: '4px', background: 'var(--p-bg)' }}>
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.4" opacity="0.9" />
      </svg>
    </div>
  );
}

function RadarSVG() {
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const axes = 5;
  const R = 90;
  const vals = [0.87, 0.82, 0.78, 0.91, 0.74];
  const colors = ['var(--p-disc)', 'var(--p-info)', 'var(--p-critical)', 'var(--p-tpe)', 'var(--p-pve)'];
  const labels = ['PatternMiner', 'LiteratureScan', 'HypothesisEng', 'TreatmentPath', 'Visualisations'];
  const angle = (i: number) => (i * 2 * Math.PI / axes) - Math.PI / 2;
  const pt = (r: number, i: number) => ({ x: r * Math.cos(angle(i)), y: r * Math.sin(angle(i)) });

  const polyPoints = vals.map((v, i) => pt(R * v, i)).map(p => `${p.x},${p.y}`).join(' ');
  const labelPts = vals.map((_, i) => pt(R * 1.22, i));

  return (
    <svg width="260" height="260" viewBox="-130 -130 260 260" style={{ display: 'block', margin: '0 auto' }}>
      {levels.map(l => (
        <polygon key={l} fill="none" stroke="var(--p-dark-4)" strokeWidth="1"
          points={Array.from({ length: axes }, (_, i) => pt(R * l, i)).map(p => `${p.x},${p.y}`).join(' ')} />
      ))}
      {Array.from({ length: axes }, (_, i) => (
        <line key={i} x1={0} y1={0} x2={pt(R, i).x} y2={pt(R, i).y} stroke="var(--p-dark-4)" strokeWidth="1" />
      ))}
      <polygon points={polyPoints} fill="rgba(16,185,129,0.1)" stroke="var(--p-disc)" strokeWidth="2" />
      {vals.map((v, i) => (
        <circle key={i} cx={pt(R * v, i).x} cy={pt(R * v, i).y} r="4" fill={colors[i]} />
      ))}
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          fill="var(--p-text-dim)" fontSize="8.5" fontFamily="var(--p-font-mono)">{labels[i]}</text>
      ))}
    </svg>
  );
}

function CronBar({ val, max }: { val: number; max: number }) {
  return (
    <div style={{ height: '28px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
      {CRON_HISTORY.slice().reverse().map((run, i) => (
        <div key={i} title={`${run.date} — ${run.articles} articles`} style={{
          flex: 1, height: `${Math.max(20, (run.articles / max) * 100)}%`,
          background: run.status === 'WARN' ? 'var(--p-warning)' : 'var(--p-disc)',
          borderRadius: '3px 3px 0 0', opacity: 0.8, transition: 'opacity 0.2s',
          cursor: 'pointer',
        }} />
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function LabPage() {
  const [tab, setTab] = useState<'l1'|'l2'|'l3'|'l4'|'visu'|'export'|'settings'|'regression'>('l1');
  const [expandedH, setExpandedH] = useState<string|null>('H1');
  const [matrixHover, setMatrixHover] = useState<[number,number]|null>(null);
  const [articles, setArticles] = useState(ARTICLES);
  const [hypotheses, setHypotheses] = useState(HYPOTHESES);
  const [dialogues, setDialogues] = useState(DIALOGUES);

  useEffect(() => {
    sbFetch('research_lab_articles', 'order=created_at.desc').then((rows: any[]) => {
      if (rows.length > 0) setArticles(rows.map((r: any) => ({
        pmid: r.pmid || '', title: r.title, journal: r.journal || '', date: r.pub_date?.slice(0,7) || '',
        relevance: r.relevance || 0, tags: r.tags || [], engines: r.engines || [], isNew: r.is_new ?? false,
      })));
    });
    sbFetch('research_hypotheses', 'order=confidence.desc').then((rows: any[]) => {
      if (rows.length > 0) setHypotheses(rows.map((r: any) => ({
        id: r.hypothesis_id || r.id, name: r.name, confidence: r.confidence || 0,
        color: r.color || 'var(--p-critical)', status: r.status || '',
        evidence: r.evidence || [], engines: r.engines || [], pubmedSupport: r.pubmed_support || 0,
      })));
    });
    sbFetch('research_dialogues', 'order=created_at.asc').then((rows: any[]) => {
      if (rows.length > 0) setDialogues(rows.map((r: any) => ({
        engine: r.engine, msg: r.message, time: r.created_at?.slice(11,19) || '', isEngine: r.is_engine ?? false,
      })));
    });
  }, []);

  const newCount = articles.filter(a => a.isNew).length;

  const TABS = [
    { id: 'l1',       label: 'L1 · PatternMiner',        color: 'var(--p-disc)' },
    { id: 'l2',       label: 'L2 · LiteratureScanner',   color: 'var(--p-info)' },
    { id: 'l3',       label: 'L3 · HypothesisEngine',    color: 'var(--p-pve)'  },
    { id: 'l4',       label: 'L4 · TreatmentPathfinder', color: 'var(--p-tpe)'  },
    { id: 'visu',     label: 'Visualisations',            color: 'var(--p-vps)'  },
    { id: 'export',   label: 'Export · CRON',             color: 'var(--p-text-dim)' },
    { id: 'settings',   label: 'Settings',                  color: 'var(--p-text-dim)' },
    { id: 'regression', label: '🤖 Bot Régression',          color: '#10B981' },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--p-bg)', color: 'var(--p-text)', fontFamily: 'var(--p-font-body)' }}>
      <style>{`
        .lab-tab:hover { color: var(--p-text) !important; }
        div::-webkit-scrollbar { display: none; }
        .pub-row { transition: border-color 0.15s, background 0.15s; }
        .pub-row:hover { border-color: rgba(16,185,129,0.4) !important; background: var(--p-bg-elevated) !important; }
        .mx-cell { transition: filter 0.1s, transform 0.1s; cursor: pointer; }
        .mx-cell:hover { filter: brightness(1.4); transform: scale(1.06); }
        .btn-export { transition: background 0.15s, border-color 0.15s; }
        .btn-export:hover { background: var(--p-disc-dim) !important; border-color: var(--p-disc) !important; }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="glass" style={{ padding: '22px 32px 0', borderBottom: '1px solid var(--p-dark-4)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>

          {/* Title block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--p-disc-dim)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Picto name="microscope" size={22} style={{ opacity: 0.9 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 900, fontFamily: 'var(--p-font-mono)', letterSpacing: '0.08em', color: 'var(--p-text)' }}>
                  DISCOVERY ENGINE
                </h1>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, background: 'var(--p-disc-dim)', color: 'var(--p-disc)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '5px', padding: '2px 7px' }}>v4.0</span>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', background: 'var(--p-bg-elevated)', border: '1px solid var(--p-dark-4)', borderRadius: '5px', padding: '2px 7px' }}>4 662 L · 12 fichiers</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--p-text-dim)' }}>
                L1 PatternMiner · L2 LiteratureScanner · L3 HypothesisEngine · L4 TreatmentPathfinder
              </div>
            </div>
          </div>

          {/* Right: CRON + EngineStatusBar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="dot-alive" />
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-disc)' }}>CRON ACTIF</span>
              </div>
              <div style={{ width: '1px', height: '18px', background: 'var(--p-dark-4)' }} />
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>
                Dernier <span style={{ fontFamily: 'var(--p-font-mono)', color: 'var(--p-text)' }}>02 mars · 03:00</span>
              </div>
              <div style={{ width: '1px', height: '18px', background: 'var(--p-dark-4)' }} />
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>
                Prochain <span style={{ fontFamily: 'var(--p-font-mono)', color: 'var(--p-warning)' }}>08 mars · 03:00 UTC</span>
              </div>
              <div style={{ width: '1px', height: '18px', background: 'var(--p-dark-4)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Picto name="books" size={11} />
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 900, color: 'var(--p-disc)' }}>{newCount}</span>
                <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>nouvelles</span>
              </div>
            </div>
            <EngineStatusBar />
          </div>
        </div>

        {/* Pipeline visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px' }}>
          {[
            { id: 'l1', label: 'L1', name: 'PatternMiner',       color: 'var(--p-disc)' },
            { id: 'l2', label: 'L2', name: 'LiteratureScanner',  color: 'var(--p-info)' },
            { id: 'l3', label: 'L3', name: 'HypothesisEngine',   color: 'var(--p-pve)'  },
            { id: 'l4', label: 'L4', name: 'TreatmentPathfinder',color: 'var(--p-tpe)'  },
          ].map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setTab(l.id as typeof tab)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', border: `1px solid ${tab === l.id ? l.color : 'var(--p-dark-4)'}`,
                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === l.id ? 'transparent' : 'transparent',
                backgroundImage: tab === l.id ? `linear-gradient(135deg, ${l.color}10 0%, transparent 100%)` : 'none',
              }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tab === l.id ? l.color : 'var(--p-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 900, color: tab === l.id ? 'var(--p-bg)' : 'var(--p-text-dim)' }}>{l.label}</span>
                </div>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: tab === l.id ? l.color : 'var(--p-text-dim)' }}>{l.name}</span>
              </button>
              {i < 3 && (
                <svg width="24" height="12" viewBox="0 0 24 12" style={{ flexShrink: 0 }}>
                  <path d="M0 6h20M15 2l5 4-5 4" stroke="var(--p-dark-4)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '-1px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} className="lab-tab" onClick={() => setTab(t.id as typeof tab)} style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
              color: tab === t.id ? t.color : 'var(--p-text-dim)',
              borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', maxWidth: '1280px' }}>

        {/* ── L1 PatternMiner ─────────────────────────────────────────────── */}
        {tab === 'l1' && (
          <div className="animate-in">
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Paramètres analysés', val: '34', sub: 'Pearson r > 0.65 retenus', color: 'var(--p-disc)', picto: 'chart' },
                { label: 'Clusters k-means', val: 'k = 3', sub: 'Phénotypes A / B / C', color: 'var(--p-info)', picto: 'cycle' },
                { label: 'Seuil z-score', val: '2.5σ', sub: '12 outliers cette semaine', color: 'var(--p-warning)', picto: 'alert' },
                { label: 'Patients indexés', val: '50', sub: 'Cohorte FIRES 2019–2025', color: 'var(--p-pve)', picto: 'family' },
              ].map(m => (
                <div key={m.label} className="glass-card hover-lift card-interactive" style={{ padding: '16px 18px', borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '24px', fontWeight: 900, color: 'var(--p-text)' }}>{m.val}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: m.color, textTransform: 'uppercase', marginTop: '3px', letterSpacing: '0.08em' }}>{m.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '5px' }}>{m.sub}</div>
                    </div>
                    <Picto name={m.picto} size={22} style={{ opacity: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Correlations */}
              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Corrélations Pearson — Top 8 paramètres FIRES</div>
                {[
                  { param: 'Ferritine > 500 ng/mL', r: 0.87, col: 'var(--p-critical)' },
                  { param: 'IL-6 élevée', r: 0.81, col: 'var(--p-warning)' },
                  { param: 'Absence CSF pleocytosis', r: 0.76, col: 'var(--p-disc)' },
                  { param: 'Âge 5–15 ans', r: 0.71, col: 'var(--p-info)' },
                  { param: 'EEG delta > 2.5Hz', r: 0.68, col: 'var(--p-pve)' },
                  { param: 'Fièvre prodrome > 7j', r: 0.64, col: 'var(--p-warning)' },
                  { param: 'Absence étiologie', r: 0.61, col: 'var(--p-disc)' },
                  { param: 'Durée SE initial > 24h', r: 0.58, col: 'var(--p-text-dim)' },
                ].map(r => (
                  <div key={r.param} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: '1px solid var(--p-dark-3)' }}>
                    <div style={{ flex: 1, fontSize: '11px', color: 'var(--p-text-dim)' }}>{r.param}</div>
                    <div style={{ width: '90px', height: '4px', background: 'var(--p-dark-4)', borderRadius: '2px', flexShrink: 0, overflow: 'hidden' }}>
                      <div className="progress-fill" style={{ height: '100%', background: r.col, borderRadius: '2px', width: `${r.r * 100}%` }} />
                    </div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: r.col, width: '42px', textAlign: 'right' }}>r = {r.r}</div>
                  </div>
                ))}
              </div>

              {/* K-means phenotypes */}
              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Clustering k-means — 3 phénotypes</div>
                {[
                  { id: 'A', name: 'Inflammatoire sévère', n: 23, pct: 46, color: 'var(--p-critical)',
                    feats: ['IL-6 > 100 pg/mL', 'Ferritine > 500', 'Onset < 48h', 'Non-répondant stéroïdes'] },
                  { id: 'B', name: 'Modéré répondant', n: 18, pct: 36, color: 'var(--p-warning)',
                    feats: ['Anakinra répondant', 'CSF normal', 'Fièvre < 5j', 'GCS > 8 initial'] },
                  { id: 'C', name: 'Atypique tardif', n: 9, pct: 18, color: 'var(--p-info)',
                    feats: ['Onset > J7', 'EEG focal', 'Âge > 12 ans', 'Évolution lente'] },
                ].map((p, pi) => (
                  <div key={p.id} className={`animate-in stagger-${pi + 1}`} style={{
                    background: 'var(--p-bg)', border: `1px solid var(--p-dark-4)`,
                    borderLeft: `3px solid ${p.color}`,
                    borderRadius: '8px', padding: '12px 14px', marginBottom: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 900, color: 'var(--p-bg)' }}>{p.id}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{p.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, background: 'var(--p-bg-elevated)', padding: '2px 7px', borderRadius: '4px', color: p.color }}>n = {p.n}</span>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{p.pct}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                      {p.feats.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--p-text-dim)' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Z-score grid */}
            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Détection anomalies — Z-score &gt; 2.5σ · 12 outliers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
                {[
                  { param: 'Ferritine', z: 3.8, col: 'var(--p-critical)' },
                  { param: 'IL-6', z: 3.1, col: 'var(--p-critical)' },
                  { param: 'Durée SE', z: 2.9, col: 'var(--p-warning)' },
                  { param: 'Crises/h', z: 2.8, col: 'var(--p-warning)' },
                  { param: 'CRP', z: 2.7, col: 'var(--p-warning)' },
                  { param: 'GCS onset', z: 2.6, col: 'var(--p-info)' },
                  { param: 'EEG freq', z: 2.6, col: 'var(--p-info)' },
                  { param: 'Temp max', z: 2.5, col: 'var(--p-text-dim)' },
                  { param: 'Leucocytes', z: 2.5, col: 'var(--p-text-dim)' },
                  { param: 'PCT', z: 2.5, col: 'var(--p-text-dim)' },
                  { param: 'LDH', z: 2.5, col: 'var(--p-text-dim)' },
                  { param: 'Plaquettes', z: 2.5, col: 'var(--p-text-dim)' },
                ].map(z => (
                  <div key={z.param} className="card-interactive" style={{ background: 'var(--p-bg)', border: `1px solid var(--p-dark-4)`, borderTop: `2px solid ${z.col}`, borderRadius: '7px', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>{z.param}</div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '15px', fontWeight: 900, color: z.col }}>{z.z}σ</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── L2 LiteratureScanner ──────────────────────────────────────── */}
        {tab === 'l2' && (
          <div className="animate-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Publications PULSAR', val: '25', color: 'var(--p-info)', picto: 'books' },
                { label: 'Nouvelles ce cycle', val: String(newCount), color: 'var(--p-disc)', picto: 'alert' },
                { label: 'Essais NCT actifs', val: '3', color: 'var(--p-warning)', picto: 'microscope' },
                { label: 'Contradictions TDE', val: '2', color: 'var(--p-critical)', picto: 'warning' },
              ].map(m => (
                <div key={m.label} className="glass-card hover-lift" style={{ padding: '16px 18px', borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: 'var(--p-text)' }}>{m.val}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: m.color, textTransform: 'uppercase', marginTop: '3px', letterSpacing: '0.08em' }}>{m.label}</div>
                    </div>
                    <Picto name={m.picto} size={20} style={{ opacity: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
              {/* Articles list */}
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Publications PubMed — Bibliographie PULSAR</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                  {articles.map((a, i) => (
                    <div key={i} className="pub-row" style={{
                      padding: '12px 14px', background: a.isNew ? 'rgba(16,185,129,0.04)' : 'var(--p-bg-card)',
                      border: `1px solid ${a.isNew ? 'rgba(16,185,129,0.3)' : 'var(--p-dark-4)'}`,
                      borderRadius: '8px', cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--p-text)', lineHeight: 1.45, marginBottom: '6px' }}>{a.title}</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '5px' }}>
                            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-info)' }}>{a.journal}</span>
                            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.date}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {a.tags.map(t => <span key={t} style={{ fontSize: '9px', fontWeight: 700, background: 'var(--p-dark-4)', color: 'var(--p-text-dim)', borderRadius: '4px', padding: '2px 6px' }}>{t}</span>)}
                            {a.engines.map(e => <span key={e} style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(185,107,255,0.12)', color: 'var(--p-pve)', borderRadius: '4px', padding: '2px 6px', border: '1px solid rgba(185,107,255,0.2)' }}>{e}</span>)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                          {a.isNew && <span style={{ fontSize: '9px', fontWeight: 800, background: 'var(--p-disc-dim)', color: 'var(--p-disc)', borderRadius: '4px', padding: '2px 7px', border: '1px solid rgba(16,185,129,0.3)' }}>NEW</span>}
                          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: a.relevance >= 90 ? 'var(--p-critical)' : a.relevance >= 80 ? 'var(--p-warning)' : 'var(--p-text-dim)' }}>{a.relevance}%</div>
                          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>relevance</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* NCT */}
                <div className="glass-card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Essais NCT actifs</div>
                  {[
                    { id: 'NCT05234567', title: 'Anakinra in Pediatric FIRES — Phase II', status: 'Recruiting', col: 'var(--p-disc)', n: 48, end: '2026-09' },
                    { id: 'NCT04891234', title: 'IL-6 Blockade in Refractory SE', status: 'Active', col: 'var(--p-info)', n: 32, end: '2025-12' },
                    { id: 'NCT05567890', title: 'Ketogenic Diet Timing in Febrile SE', status: 'Recruiting', col: 'var(--p-disc)', n: 60, end: '2027-03' },
                  ].map(t => (
                    <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--p-dark-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, background: `${t.col}18`, color: t.col, borderRadius: '4px', padding: '2px 7px', border: `1px solid ${t.col}33` }}>{t.status}</span>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>n={t.n} · {t.end}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--p-text)', lineHeight: 1.3, marginBottom: '3px' }}>{t.title}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>{t.id}</div>
                    </div>
                  ))}
                </div>

                {/* Contradictions */}
                <div className="glass-card" style={{ padding: '18px 20px', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-critical)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Contradictions TDE détectées</div>
                  {[
                    { study: '#38801234', msg: 'Phénytoïne+KD → toxicité libre augmentée. Contredit protocole actuel étape 6.' },
                    { study: '#38712098', msg: 'IL-1β voie unique : nuance apportée sur les formes atypiques EAIS.' },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', padding: '9px 10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '7px', marginBottom: '8px' }}>
                      <Picto name="warning" size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-critical)', fontWeight: 700, marginBottom: '3px' }}>{c.study}</div>
                        <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', lineHeight: 1.5 }}>{c.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── L3 HypothesisEngine ──────────────────────────────────────────── */}
        {tab === 'l3' && (
          <div className="animate-in">
            {/* Engine banner */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(185,107,255,0.2)', backgroundImage: 'linear-gradient(135deg, rgba(185,107,255,0.04) 0%, transparent 60%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Picto name="pulsar-ai" size={28} glow glowColor="var(--p-pve-glow)" />
                  <div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '13px', fontWeight: 900, color: 'var(--p-text)', marginBottom: '3px' }}>HypothesisEngine · Claude Sonnet · L3</div>
                    <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>3 hypothèses germes · Workflow validation · Recalcul post-ingestion littérature</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(185,107,255,0.12)', color: 'var(--p-pve)', borderRadius: '4px', padding: '3px 8px', border: '1px solid rgba(185,107,255,0.25)' }}>Active</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, background: 'var(--p-disc-dim)', color: 'var(--p-disc)', borderRadius: '4px', padding: '3px 8px', border: '1px solid rgba(16,185,129,0.25)' }}>Dernier recalcul 03:15</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                {hypotheses.map((h, i) => {
                  const isExp = expandedH === h.id;
                  return (
                    <div key={i} className="glass-card card-interactive" style={{ marginBottom: '12px', padding: '16px 18px', borderLeft: `3px solid ${h.color}`, cursor: 'pointer' }}
                      onClick={() => setExpandedH(isExp ? null : h.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 900, background: `${h.color}18`, color: h.color, borderRadius: '5px', padding: '3px 8px', border: `1px solid ${h.color}33` }}>{h.id}</span>
                            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: h.color }}>{h.status}</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--p-dark-4)', minWidth: '20px' }} />
                            {h.engines.map(e => (
                              <span key={e} style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(185,107,255,0.1)', color: 'var(--p-pve)', borderRadius: '4px', padding: '1px 5px', border: '1px solid rgba(185,107,255,0.2)' }}>{e}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)', marginBottom: '8px' }}>{h.name}</div>
                          <div style={{ height: '5px', background: 'var(--p-dark-4)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div className="progress-fill" style={{ height: '100%', width: `${h.confidence}%`, background: `linear-gradient(90deg, ${h.color}66, ${h.color})`, borderRadius: '3px' }} />
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '5px' }}>PubMed : {h.pubmedSupport} études · Cliquer pour détails</div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '20px', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '32px', fontWeight: 900, color: h.color, lineHeight: 1 }}>{h.confidence}%</div>
                          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>confiance</div>
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--p-dark-4)' }}>
                          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Arguments cliniques</div>
                          {h.evidence.map((e, j) => (
                            <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '5px', lineHeight: 1.45 }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: h.color, marginTop: '5px', flexShrink: 0 }} />
                              {e}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dialogues bubbles */}
              <div className="glass-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Dialogues inter-moteurs — CRON 03:14</div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px' }}>
                  {dialogues.map((d, i) => (
                    <div key={i} className={`animate-in stagger-${Math.min(i+1,8)}`} style={{ display: 'flex', flexDirection: 'column', alignItems: d.isEngine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '90%', padding: '9px 12px',
                        borderRadius: d.isEngine ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                        background: d.isEngine ? 'var(--p-disc-dim)' : 'var(--p-bg-elevated)',
                        border: `1px solid ${d.isEngine ? 'rgba(16,185,129,0.25)' : 'var(--p-dark-4)'}`,
                        fontSize: '11px', color: 'var(--p-text)', lineHeight: 1.5,
                      }}>{d.msg}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '3px' }}>
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
        {tab === 'l4' && (
          <div className="animate-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Protocoles évalués', val: '5', color: 'var(--p-tpe)', picto: 'pill' },
                { label: 'Score max — Anakinra', val: '87', color: 'var(--p-critical)', picto: 'shield' },
                { label: 'Mises à jour post-ingestion', val: '+2', color: 'var(--p-disc)', picto: 'cycle' },
              ].map(m => (
                <div key={m.label} className="glass-card hover-lift" style={{ padding: '16px 18px', borderTop: `2px solid ${m.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: 'var(--p-text)' }}>{m.val}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: m.color, textTransform: 'uppercase', marginTop: '3px' }}>{m.label}</div>
                    </div>
                    <Picto name={m.picto} size={20} style={{ opacity: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { name: 'Anakinra', type: 'Anti-IL-1 · Inhibiteur IL-1β', score: 87, color: 'var(--p-critical)',
                  moa: 'Blocage compétitif du récepteur IL-1 — réduction neuro-inflammation aiguë',
                  dose: '2–4 mg/kg/j SC ou IV · max 100 mg/j',
                  evidence: 'Grade A — 12 études randomisées · NCT05234567',
                  update: '+3 pts post-ingestion #38921445' },
                { name: 'Tocilizumab', type: 'Anti-IL-6 · Anticorps monoclonal', score: 74, color: 'var(--p-warning)',
                  moa: "Blocage du récepteur soluble et membranaire de l'IL-6",
                  dose: '8 mg/kg IV q4w · max 800 mg',
                  evidence: 'Grade B — 8 études · 2 case series', update: null },
                { name: 'Régime cétogène', type: 'Métabolique · Anti-convulsivant', score: 68, color: 'var(--p-disc)',
                  moa: 'Corps cétoniques → inhibition NLRP3 → réduction IL-1β + effet anti-convulsivant',
                  dose: 'Ratio 4:1 lipides/CHO · initiation progressive J+5',
                  evidence: 'Grade B — 5 études observationnelles', update: null },
                { name: 'Combo Anakinra + KD', type: 'Combinaison · Synergie', score: 61, color: 'var(--p-pve)',
                  moa: 'Synergie immunomodulation (IL-1β) + inhibition NLRP3 métabolique',
                  dose: 'Anakinra standard + KD ratio 3:1 adapté',
                  evidence: 'Grade C — 3 case reports · données précliniques',
                  update: 'ALERTE #38801234 : toxicité phénytoïne augmentée sous KD' },
                { name: 'Rituximab', type: 'Anti-CD20 · Déplétion B', score: 45, color: 'var(--p-text-dim)',
                  moa: 'Déplétion lymphocytes B — réduction auto-anticorps et présentation antigénique',
                  dose: '375 mg/m² IV × 4 doses hebdomadaires',
                  evidence: 'Grade C — cas résistants atypiques uniquement', update: null },
              ].map((tx, i) => (
                <div key={tx.name} className={`glass-card card-interactive animate-in stagger-${i+1}`} style={{ padding: '16px 18px', borderLeft: `3px solid ${tx.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--p-text)' }}>{tx.name}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: tx.color, marginTop: '3px' }}>{tx.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: tx.color, lineHeight: 1 }}>{tx.score}</div>
                      <div style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>éligibilité</div>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'var(--p-dark-4)', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ height: '100%', width: `${tx.score}%`, background: `linear-gradient(90deg, ${tx.color}55, ${tx.color})`, borderRadius: '2px' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', lineHeight: 1.5, marginBottom: '6px' }}>{tx.moa}</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--p-text-muted)' }}>Dose : </span>{tx.dose}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: tx.update ? '8px' : '0' }}>
                    <span style={{ fontWeight: 700, color: 'var(--p-text-muted)' }}>Evidence : </span>{tx.evidence}
                  </div>
                  {tx.update && (
                    <div style={{ padding: '5px 9px', background: `${tx.color}0D`, border: `1px solid ${tx.color}25`, borderRadius: '5px', fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: tx.color }}>{tx.update}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Visualisations ───────────────────────────────────────────────── */}
        {tab === 'visu' && (
          <div className="animate-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Radar */}
              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Radar Discovery Engine — Activité moteurs</div>
                <RadarSVG />
              </div>

              {/* Matrice */}
              <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Couplage inter-moteurs (%)</div>
                  {matrixHover && (
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-disc)' }}>
                      {ENGINES_LABELS[matrixHover[0]]} → {ENGINES_LABELS[matrixHover[1]]} : {MATRIX[matrixHover[0]][matrixHover[1]]}%
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'separate', borderSpacing: '2px', fontFamily: 'var(--p-font-mono)', fontSize: '8px' }}>
                    <thead>
                      <tr>
                        <td style={{ padding: '3px 5px', color: 'var(--p-text-dim)' }} />
                        {ENGINES_LABELS.map(e => <td key={e} style={{ padding: '3px 5px', color: 'var(--p-text-dim)', textAlign: 'center', fontWeight: 700 }}>{e}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {MATRIX.map((row, ri) => (
                        <tr key={ri}>
                          <td style={{ padding: '3px 6px', color: 'var(--p-text-dim)', fontWeight: 700, whiteSpace: 'nowrap' }}>{ENGINES_LABELS[ri]}</td>
                          {row.map((val, ci) => {
                            const alpha = val > 0 ? Math.round(val * 2.2).toString(16).padStart(2, '0') : '00';
                            return (
                              <td key={ci} className={val > 0 ? 'mx-cell' : ''}
                                style={{ padding: '4px 5px', textAlign: 'center', borderRadius: '4px', cursor: val > 0 ? 'pointer' : 'default',
                                  background: val > 0 ? `rgba(16,185,129,${val/200})` : 'var(--p-dark-3)',
                                  color: val > 70 ? 'var(--p-bg)' : val > 0 ? 'var(--p-text)' : 'var(--p-dark-4)',
                                  fontWeight: val > 0 ? 700 : 400,
                                  outline: matrixHover?.[0] === ri && matrixHover?.[1] === ci ? '1px solid var(--p-disc)' : 'none',
                                }}
                                onMouseEnter={() => val > 0 && setMatrixHover([ri, ci])}
                                onMouseLeave={() => setMatrixHover(null)}
                              >{val > 0 ? val : '·'}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* EEG Waveforms */}
            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EEG Waveform — FIRES phénotype A · Delta continu bitemporal</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(139,92,246,0.12)', color: 'var(--p-critical)', borderRadius: '4px', padding: '2px 7px', border: '1px solid rgba(139,92,246,0.25)' }}>Seizure</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>1–2 Hz dominant</span>
                </div>
              </div>
              <EEGWaveform channel="EEG Fp1–F7" seedOffset={0}   color="var(--p-critical)" height={44} />
              <EEGWaveform channel="EEG F7–T3"  seedOffset={137} color="var(--p-warning)"  height={44} />
              <EEGWaveform channel="EEG T3–T5"  seedOffset={274} color="var(--p-info)"     height={40} />
              <EEGWaveform channel="ECG"         seedOffset={411} color="var(--p-tde)"      height={38} />
            </div>
          </div>
        )}

        {/* ── Export & CRON ────────────────────────────────────────────────── */}
        {tab === 'export' && (
          <div className="animate-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
              {[
                { format: 'Markdown Brief', ext: '.MD',   desc: 'Rapport clinique FR/EN — Hypothèses · Traitements · Bibliographie', color: 'var(--p-info)',     picto: 'clipboard' },
                { format: 'JSON Structuré', ext: '.JSON', desc: 'Données moteurs API-ready — Schéma v4.0 · Supabase-compatible',      color: 'var(--p-disc)',     picto: 'chart' },
                { format: 'BibTeX',         ext: '.BIB',  desc: '25 références PULSAR — Format LaTeX · Citations normalisées',         color: 'var(--p-pve)',      picto: 'books' },
              ].map(e => (
                <div key={e.format} className="glass-card hover-lift" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Picto name={e.picto} size={30} glow />
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, background: `${e.color}15`, color: e.color, borderRadius: '5px', padding: '3px 8px', border: `1px solid ${e.color}33` }}>{e.ext}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--p-text)', marginBottom: '7px' }}>{e.format}</div>
                  <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', lineHeight: 1.55, flex: 1 }}>{e.desc}</div>
                  <button className="btn-export" style={{ marginTop: '16px', padding: '9px', background: 'var(--p-bg)', border: `1px solid ${e.color}33`, borderRadius: '8px', color: e.color, cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800 }}>
                    Exporter
                  </button>
                </div>
              ))}
            </div>

            {/* CRON history */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Historique CRON — Exécutions hebdomadaires</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div className="dot-alive" />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-disc)' }}>Actif</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-warning)' }}>Prochain : dim. 08 mars · 03:00 UTC</span>
                </div>
              </div>

              {/* Mini bar chart */}
              <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'var(--p-bg)', borderRadius: '8px', border: '1px solid var(--p-dark-4)' }}>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: '8px' }}>Articles ingérés par cycle</div>
                <CronBar val={15} max={15} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {CRON_HISTORY.slice().reverse().map((r, i) => (
                    <div key={i} style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', textAlign: 'center', flex: 1 }}>{r.date.slice(5)}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '18px' }}>
                {CRON_HISTORY.map((run, i) => (
                  <div key={i} className="card-interactive" style={{ background: 'var(--p-bg)', border: `1px solid ${run.status === 'WARN' ? 'rgba(255,165,2,0.3)' : 'var(--p-dark-4)'}`, borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '8px' }}>{run.date}</div>
                    {[
                      { label: 'Articles', val: String(run.articles), col: 'var(--p-disc)' },
                      { label: 'Alertes', val: String(run.alerts), col: run.alerts > 0 ? 'var(--p-warning)' : 'var(--p-text-dim)' },
                      { label: 'Durée', val: run.duration, col: 'var(--p-text-dim)' },
                    ].map(x => (
                      <div key={x.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{x.label}</span>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: x.col }}>{x.val}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, background: run.status === 'OK' ? 'var(--p-disc-dim)' : 'rgba(255,165,2,0.12)', color: run.status === 'OK' ? 'var(--p-disc)' : 'var(--p-warning)', borderRadius: '4px', padding: '2px 6px' }}>{run.status}</span>
                      {run.hypothesisUpdate && <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(185,107,255,0.12)', color: 'var(--p-pve)', borderRadius: '4px', padding: '2px 6px' }}>H update</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card" style={{ padding: '14px 18px', border: '1px solid rgba(16,185,129,0.2)', backgroundImage: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 60%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>Prochaine exécution planifiée</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--p-disc)' }}>Dimanche 8 mars 2026 · 03:00 UTC</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--p-text-dim)', lineHeight: 1.8 }}>
                  10 requêtes PubMed · 25 publications<br />
                  Moteurs : VPS · TDE · PVE · CAE · HypothesisEngine
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { title: 'L1 PatternMiner', color: 'var(--p-disc)', params: [
                { key: 'Seuil z-score', val: '2.5σ', desc: 'Détection anomalies statistiques' },
                { key: 'Pearson minimum', val: 'r = 0.65', desc: 'Corrélation minimale retenue' },
                { key: 'k-means clusters', val: 'k = 3', desc: 'Phénotypes A / B / C' },
                { key: 'Paramètres analysés', val: '34', desc: 'Variables clinico-biologiques' },
                { key: 'Cohorte référence', val: '50 patients', desc: 'FIRES 2019–2025' },
              ]},
              { title: 'L2 · L3 · L4 & CRON', color: 'var(--p-pve)', params: [
                { key: 'Publications PULSAR', val: '25', desc: 'Bibliographie de référence (L2)' },
                { key: 'NCT trials suivis', val: '3', desc: 'Essais cliniques actifs (L2)' },
                { key: 'Hypothèses germes', val: 'H1 / H2 / H3', desc: 'Claude Sonnet · validation (L3)' },
                { key: 'Modèle IA', val: 'claude-sonnet-4-20250514', desc: 'HypothesisEngine (L3)' },
                { key: 'CRON schedule', val: 'Dim. 03:00 UTC', desc: 'Mise à jour littérature auto.' },
              ]},
            ].map(section => (
              <div key={section.title} className="glass-card" style={{ padding: '18px 20px', borderTop: `2px solid ${section.color}` }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: section.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{section.title}</div>
                {section.params.map(s => (
                  <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--p-dark-3)' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)' }}>{s.key}</div>
                      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{s.desc}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, background: `${section.color}12`, color: section.color, borderRadius: '5px', padding: '3px 8px', border: `1px solid ${section.color}25`, flexShrink: 0, marginLeft: '12px' }}>{s.val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'regression' && (
          <RegressionBot />
        )}

      </div>
    </div>
  );
}
