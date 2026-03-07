'use client';

import { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState<'veille' | 'hypotheses' | 'croisements' | 'dialogues' | 'historique'>('veille');
  const [hoveredPmid, setHoveredPmid] = useState<string | null>(null);
  const [expandedHyp, setExpandedHyp] = useState<string | null>('H1');
  const [matrixHover, setMatrixHover] = useState<[number,number] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const tabs = [
    { id: 'veille',       label: '🔬 Veille PubMed',     count: PUBMED_ARTICLES.filter(a => a.isNew).length },
    { id: 'hypotheses',   label: '💡 Hypothèses',         count: 3 },
    { id: 'croisements',  label: '🔗 Croisements',        count: null },
    { id: 'dialogues',    label: '💬 Dialogues moteurs',  count: DIALOGUES.length },
    { id: 'historique',   label: '📅 Historique CRON',    count: null },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
        @keyframes fadeIn { from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
        .pubrow:hover { border-color: ${C.accent}66 !important; }
        .tab-btn:hover { color: ${C.accent} !important; }
        .hyp-card:hover { border-color: ${C.border} !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <div style={S.titleGroup}>
            <div style={S.badge}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.accent, display: 'inline-block' }} />
              Moteur #12
            </div>
            <h1 style={S.title}>Research Lab</h1>
            <p style={S.subtitle}>Veille scientifique automatisée · Hypothèses · Dialogues inter-moteurs</p>
          </div>
          <div style={S.cronStatus}>
            <div style={S.cronBadge(true)}>
              <span style={S.dot(C.accent, true)} />
              <span>CRON actif — dimanche 03h00</span>
            </div>
            <div style={{ fontSize: '11px', color: C.textMuted, textAlign: 'right' }}>
              Dernière exécution : 02 mar. 2026 · 03:15:02<br/>
              12 articles · 2 alertes · H1 +3pts
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              className="tab-btn"
              style={{
                ...S.tab(activeTab === t.id),
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', cursor: 'pointer', outline: 'none',
              }}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
            >
              {t.label}
              {t.count !== null && (
                <span style={{
                  backgroundColor: activeTab === t.id ? C.accent : C.border,
                  color: activeTab === t.id ? C.bg : C.textMuted,
                  borderRadius: '10px', padding: '1px 6px',
                  fontSize: '10px', fontWeight: 700,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={S.content}>

        {/* ══ TAB: VEILLE PUBMED ══ */}
        {activeTab === 'veille' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {/* Stats */}
            <div style={S.grid3}>
              <div style={S.cardAccent}>
                <div style={S.cardTitle}>
                  <span style={{ color: C.accent }}>📄</span> Articles cette semaine
                </div>
                <div style={S.statValue}>12</div>
                <div style={S.statSub}>+3 vs semaine précédente</div>
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>
                  <span>⚠️</span> Alertes moteurs
                </div>
                <div style={{ ...S.statValue, color: C.warning }}>2</div>
                <div style={S.statSub}>CAE + PVE notifiés</div>
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>
                  <span>🎯</span> Pertinence moyenne
                </div>
                <div style={{ ...S.statValue, color: C.accent }}>88<span style={{ fontSize: 16, fontWeight: 400 }}>%</span></div>
                <div style={S.statSub}>Seuil minimal : 70%</div>
              </div>
            </div>

            {/* Articles */}
            <div style={S.sectionTitle}>
              Articles récents <span style={{ ...S.tag(C.accent), marginLeft: 4 }}>3 nouveaux</span>
            </div>
            {PUBMED_ARTICLES.map(a => (
              <div
                key={a.pmid}
                className="pubrow"
                style={{
                  ...S.pubmedRow,
                  borderColor: hoveredPmid === a.pmid ? C.accent + '66' : C.border,
                }}
                onMouseEnter={() => setHoveredPmid(a.pmid)}
                onMouseLeave={() => setHoveredPmid(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {a.isNew && <span style={S.tag(C.accent)}>NOUVEAU</span>}
                      <div style={S.pubmedTitle}>{a.title}</div>
                    </div>
                    <div style={S.pubmedMeta}>
                      <span style={{ color: C.accent, fontFamily: 'monospace' }}>PMID {a.pmid}</span>
                      <span>{a.journal}</span>
                      <span>{a.date}</span>
                      <span>Moteurs : {a.engines.join(', ')}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {a.tags.map(t => (
                        <span key={t} style={S.tag(C.textDim)}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: '18px', fontWeight: 700,
                      color: a.relevance >= 90 ? C.accent : a.relevance >= 80 ? C.warning : C.textDim,
                    }}>
                      {a.relevance}%
                    </div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>pertinence</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB: HYPOTHÈSES ══ */}
        {activeTab === 'hypotheses' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={S.sectionTitle}>
                Hypothèses diagnostiques actives
              </div>
              <div style={{ ...S.tag(C.textMuted), marginLeft: 'auto', fontSize: '11px' }}>
                Recalcul : 02 mar. 2026 · 03:15:02
              </div>
            </div>

            {HYPOTHESES.map(h => (
              <div
                key={h.id}
                className="hyp-card"
                style={{
                  ...S.hypCard,
                  border: expandedHyp === h.id ? `1px solid ${h.color}44` : `1px solid ${C.border}`,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onClick={() => setExpandedHyp(expandedHyp === h.id ? null : h.id)}
              >
                <div style={S.hypHeader}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, fontFamily: 'monospace' }}>{h.id}</span>
                      <span style={S.tag(h.color)}>{h.status}</span>
                    </div>
                    <div style={S.hypTitle}>{h.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: h.color }}>{h.confidence}%</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>confiance</div>
                  </div>
                </div>

                {/* Score bar */}
                <div style={S.scoreBar(h.confidence, h.color)}>
                  {mounted && <div style={S.scoreFill(h.confidence, h.color)} />}
                </div>

                {/* Expanded */}
                {expandedHyp === h.id && (
                  <div style={{ marginTop: 14, animation: 'fadeIn 0.15s ease' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Arguments d'appui
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                      {h.evidence.map((e, i) => (
                        <li key={i} style={{ fontSize: '12.5px', color: C.textDim, marginBottom: 4, lineHeight: 1.5 }}>{e}</li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: C.textMuted }}>Moteurs :</span>
                      {h.engines.map(e => <span key={e} style={S.tag(C.accent)}>{e}</span>)}
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: C.textMuted }}>
                        {h.pubmedSupport} étude(s) PubMed récente(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB: CROISEMENTS ══ */}
        {activeTab === 'croisements' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={S.sectionTitle}>
              Matrice de croisements inter-moteurs
              <span style={{ fontSize: '12px', fontWeight: 400, color: C.textMuted, marginLeft: 6 }}>
                — Intensité du partage d'informations (0–100)
              </span>
            </div>

            <div style={{ ...S.card, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
                <thead>
                  <tr>
                    <td style={{ width: 72, padding: '4px 8px', fontSize: '10px', color: C.textMuted }} />
                    {ENGINES.map((e, ci) => (
                      <td key={e} style={{
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: matrixHover && (matrixHover[0] === ci || matrixHover[1] === ci) ? C.accent : C.textMuted,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
                      }}>{e}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ENGINES.map((rowE, ri) => (
                    <tr key={rowE}>
                      <td style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: matrixHover && (matrixHover[0] === ri || matrixHover[1] === ri) ? C.accent : C.textMuted,
                        whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
                      }}>{rowE}</td>
                      {ENGINES.map((_, ci) => (
                        <td
                          key={ci}
                          style={{
                            ...S.matrixCell(MATRIX[ri][ci]),
                            opacity: matrixHover ? (matrixHover[0] === ri || matrixHover[1] === ci ? 1 : 0.5) : 1,
                          }}
                          onMouseEnter={() => setMatrixHover([ri, ci])}
                          onMouseLeave={() => setMatrixHover(null)}
                          title={MATRIX[ri][ci] > 0 ? `${rowE} ↔ ${ENGINES[ci]} : ${MATRIX[ri][ci]}%` : '—'}
                        >
                          {MATRIX[ri][ci] > 0 ? MATRIX[ri][ci] : '·'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center', fontSize: '11px', color: C.textMuted }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: `${C.accent}22`, border: `1px solid ${C.border}` }} />
                Faible (1–40)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: `${C.accent}77` }} />
                Modéré (41–70)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: C.accent }} />
                Fort (71–100)
              </div>
              <div style={{ marginLeft: 'auto' }}>
                {matrixHover ? (
                  <span style={{ color: C.accent }}>
                    {ENGINES[matrixHover[1]]} ↔ {ENGINES[matrixHover[0]]} : <strong>{MATRIX[matrixHover[1]][matrixHover[0]]}%</strong>
                  </span>
                ) : (
                  'Survolez une cellule pour les détails'
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: DIALOGUES ══ */}
        {activeTab === 'dialogues' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={S.sectionTitle}>
                Dialogues inter-moteurs — Session 02 mar. 2026 · 03h14
              </div>
              <span style={S.tag(C.accent)}>CRON dimanche</span>
            </div>

            <div style={{
              ...S.card,
              minHeight: '400px',
              background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg}88 100%)`,
            }}>
              {DIALOGUES.map((d, i) => (
                <div key={i} style={S.dialogBubble(d.isEngine)}>
                  <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: 3, padding: '0 4px' }}>
                    {d.engine}
                  </div>
                  <div style={S.bubble(d.isEngine)}>{d.msg}</div>
                  <div style={S.bubbleMeta}>{d.time}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, fontSize: '11px', color: C.textMuted, display: 'flex', gap: 16 }}>
              <span>🟢 ResLabEngine → émetteur</span>
              <span>🔷 Moteurs spécialisés → répondeurs</span>
              <span style={{ marginLeft: 'auto' }}>6 échanges · 48 secondes</span>
            </div>
          </div>
        )}

        {/* ══ TAB: HISTORIQUE ══ */}
        {activeTab === 'historique' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={S.sectionTitle}>Historique des exécutions CRON</div>

            <div style={S.card}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 80px 120px 80px 80px 60px',
                gap: 8,
                padding: '8px 0 12px',
                borderBottom: `1px solid ${C.border}`,
                fontSize: '10px',
                fontWeight: 600,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                <span>Date</span><span>Articles</span><span>Hypothèses</span><span>Alertes</span><span>Durée</span><span>Statut</span>
              </div>

              {CRON_HISTORY.map((run, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 80px 120px 80px 80px 60px',
                  gap: 8,
                  padding: '12px 0',
                  borderBottom: `1px solid ${C.border}22`,
                  fontSize: '12.5px',
                  color: C.text,
                  alignItems: 'center',
                }}>
                  <span style={{ color: C.textDim, fontFamily: 'monospace', fontSize: '11px' }}>{run.date}</span>
                  <span style={{ fontWeight: 600 }}>{run.articles}</span>
                  <span>
                    {run.hypothesisUpdate
                      ? <span style={S.tag(C.accent)}>Mis à jour</span>
                      : <span style={{ color: C.textMuted }}>Stable</span>}
                  </span>
                  <span style={{ color: run.alerts > 0 ? C.warning : C.textMuted }}>{run.alerts}</span>
                  <span style={{ color: C.textMuted, fontFamily: 'monospace', fontSize: '11px' }}>{run.duration}</span>
                  <span style={S.tag(run.status === 'OK' ? C.accent : C.warning)}>{run.status}</span>
                </div>
              ))}
            </div>

            {/* Prochaine exécution */}
            <div style={{ ...S.cardAccent, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={S.cardTitle}>⏰ Prochaine exécution</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: C.text }}>
                    Dimanche 8 mars 2026 · 03h00 UTC
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: C.textMuted }}>
                  Requêtes PubMed planifiées : 10<br/>
                  Moteurs à notifier : VPS, TDE, PVE, CAE, HypothesisEngine
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
