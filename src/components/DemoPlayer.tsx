'use client'
import { useState, useEffect, useCallback } from 'react'

// ══════════════════════════════════════════════════════════════
// DEMO PLAYER — Modal inline sur la landing
// 8 scènes, autoplay 6s, navigation libre
// ══════════════════════════════════════════════════════════════

const SCENES = [
  {
    id: 'patients',
    label: 'File active',
    color: '#6C7CFF',
    title: 'La file active',
    desc: '4 patients en cours. Scores VPS en temps réel. 22 alertes critiques détectées.',
    screen: () => (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Amara T.', age: '8 ans', syndrome: 'MOGAD', vps: 98, p: 'P1', color: '#EF4444', phase: 'Phase aiguë', j: 'J+5' },
          { name: 'Inès M.', age: '4 ans', syndrome: 'FIRES', vps: 92, p: 'P1', color: '#EF4444', phase: 'Phase aiguë', j: 'J+4' },
          { name: 'Lucas R.', age: '14 ans', syndrome: 'Anti-NMDAR', vps: 18, p: 'P3', color: '#F59E0B', phase: 'Stabilisation', j: 'J+7' },
          { name: 'Noah B.', age: '6 ans', syndrome: 'Épil. focale', vps: 2, p: 'P4', color: '#10B981', phase: 'Phase aiguë', j: 'J+2' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${p.color}20` }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: p.color, fontWeight: 800 }}>{p.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.name} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{p.age} · {p.j}</span></div>
              <div style={{ fontSize: 10, color: p.color, marginTop: 2 }}>{p.phase}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '4px 8px', borderRadius: 6, background: `${p.color}15`, border: `1px solid ${p.color}30` }}>
              <div style={{ fontSize: 9, color: p.color, fontWeight: 800 }}>{p.p}</div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', minWidth: 60, textAlign: 'right' }}>{p.syndrome}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: p.color, minWidth: 36, textAlign: 'right' }}>{p.vps}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontFamily: 'monospace', fontSize: 10, color: '#8B5CF6', textAlign: 'center' }}>2 critiques</div>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.15)', fontFamily: 'monospace', fontSize: 10, color: '#FFA502', textAlign: 'center' }}>1 vigilance</div>
          <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)', fontFamily: 'monospace', fontSize: 10, color: '#6C7CFF', textAlign: 'center' }}>4 patients</div>
        </div>
      </div>
    ),
  },
  {
    id: 'cockpit',
    label: 'Cockpit Inès',
    color: '#EF4444',
    title: 'Cockpit patient — VPS 92',
    desc: 'Inès, 4 ans. FIRES suspecté. Constantes vitales, EEG, score de gravité en temps réel.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { l: 'VPS', v: '92', c: '#EF4444', sub: 'CRITIQUE' },
            { l: 'GCS', v: '7', c: '#F59E0B', sub: 'Altéré' },
            { l: 'Crises/24h', v: '8', c: '#EF4444', sub: 'Réfractaire' },
            { l: 'J. hospit.', v: 'J+4', c: '#6C7CFF', sub: 'Phase aiguë' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${s.c}10`, border: `1px solid ${s.c}25`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: 'monospace' }}>{s.v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
              <div style={{ fontSize: 8, color: s.c, marginTop: 2, fontWeight: 700 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, color: '#EF4444', fontFamily: 'monospace', fontWeight: 700, marginBottom: 8 }}>EEG — ACTIVITÉ EN COURS</div>
          <svg viewBox="0 0 300 40" style={{ width: '100%', height: 40 }}>
            <polyline points="0,20 15,20 20,5 25,35 30,20 45,20 50,8 55,32 60,20 75,20 80,12 85,28 90,20 105,20 110,6 115,34 120,20 135,20 140,10 145,30 150,20 165,20 170,7 175,33 180,20 195,20 200,9 205,31 210,20 225,20 230,5 235,35 240,20 255,20 260,11 265,29 270,20 285,20 290,8 295,32 300,20" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.8"/>
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['FC', '128 bpm', '#F59E0B'], ['SpO2', '94%', '#EF4444'], ['PAM', '114 mmHg', '#EF4444']].map(([l, v, c], i) => (
            <div key={i} style={{ flex: 1, background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: c as string, fontFamily: 'monospace' }}>{v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'urgence',
    label: 'Alertes',
    color: '#FF6B35',
    title: '14 alertes actives — 2 CAE détectés',
    desc: 'Le moteur CAE identifie les cascades critiques avant la dégradation. Chaque alerte est classée et sourcée.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { level: '🔴', label: 'CAE — Cascade cardiorespiratoire imminente', engine: 'CAE', time: 'Il y a 4 min' },
          { level: '🔴', label: 'VPS > 90 — Intervention immédiate requise', engine: 'VPS', time: 'Il y a 8 min' },
          { level: '🔴', label: 'Status epilepticus réfractaire J+4', engine: 'TDE', time: 'Il y a 12 min' },
          { level: '🟠', label: 'PAM 114 — Hyperpression artérielle', engine: 'EWE', time: 'Il y a 18 min' },
          { level: '🟠', label: 'Fenêtre thérapeutique anakinra — 6h restantes', engine: 'TPE', time: 'Il y a 22 min' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: i < 3 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${i < 3 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
            <span style={{ fontSize: 14 }}>{a.level}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{a.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{a.time}</div>
            </div>
            <span style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 800, color: '#6C7CFF', background: 'rgba(108,124,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{a.engine}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'diagnostic',
    label: 'Diagnostic',
    color: '#8B5CF6',
    title: 'Diagnostic différentiel — TDE',
    desc: '34 paramètres croisés. FIRES 87%. 4 délais diagnostiques évitables identifiés.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { dx: 'FIRES', pct: 87, color: '#EF4444' },
          { dx: 'Anti-NMDAR', pct: 11, color: '#8B5CF6' },
          { dx: 'NORSE', pct: 2, color: '#6C7CFF' },
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 100, fontSize: 12, fontWeight: 700, color: d.color }}>{d.dx}</div>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
            <div style={{ minWidth: 36, fontSize: 12, fontWeight: 800, color: d.color, textAlign: 'right', fontFamily: 'monospace' }}>{d.pct}%</div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#EF4444', marginBottom: 8 }}>4 DÉLAIS DIAGNOSTIQUES DÉTECTÉS</div>
          {['J-3 : Myalgies récurrentes non documentées', 'J-1 : MEOPA → effondrement non anticipé', 'J+1 : Hypothèse virale maintenue 18h', 'J+2 : FIRES évoqué tardivement'].map((d, i) => (
            <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4, display: 'flex', gap: 8 }}>
              <span style={{ color: '#EF4444' }}>✗</span>{d}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'traitement',
    label: 'Traitement',
    color: '#10B981',
    title: 'Protocoles thérapeutiques — TPE',
    desc: 'Éligibilité scorée. Interactions vérifiées. Fenêtres thérapeutiques calculées.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { drug: 'Anakinra', score: 94, status: 'RECOMMANDÉ', color: '#10B981', detail: 'IL-1 inhibiteur · 2–4 mg/kg/j IV' },
          { drug: 'Tocilizumab', score: 78, status: 'À CONSIDÉRER', color: '#6C7CFF', detail: 'IL-6 inhibiteur · 8 mg/kg IV dose unique' },
          { drug: 'Régime cétogène', score: 71, status: 'À CONSIDÉRER', color: '#F59E0B', detail: 'Ratio 4:1 · Surveillance biologique' },
          { drug: 'Rituximab', score: 42, status: 'DIFFÉRER', color: '#8B5CF6', detail: 'Anti-CD20 · En attente biomarqueurs' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: `${t.color}08`, border: `1px solid ${t.color}20` }}>
            <div style={{ minWidth: 40, height: 40, borderRadius: 8, background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: t.color, fontFamily: 'monospace' }}>{t.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.drug}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{t.detail}</div>
            </div>
            <span style={{ fontSize: 8, fontWeight: 800, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}25`, padding: '3px 7px', borderRadius: 4, fontFamily: 'monospace' }}>{t.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'oracle',
    label: 'ORACLE',
    color: '#E879F9',
    title: 'ORACLE — Simulation prédictive',
    desc: '5 scénarios comparés. L\'impact de chaque décision thérapeutique simulé avant d\'agir.',
    screen: () => (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <svg viewBox="0 0 300 100" style={{ width: '100%', height: 100 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#10B981" stopOpacity="0.3"/></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0.3"/></linearGradient>
              <linearGradient id="g3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3"/></linearGradient>
            </defs>
            {/* Anakinra - best */}
            <polyline points="0,80 50,72 100,55 150,35 200,22 250,15 300,12" fill="none" stroke="#10B981" strokeWidth="2"/>
            {/* No treatment - worst */}
            <polyline points="0,80 50,82 100,85 150,88 200,90 250,93 300,95" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,3"/>
            {/* Tocilizumab */}
            <polyline points="0,80 50,74 100,62 150,48 200,38 250,30 300,25" fill="none" stroke="#6C7CFF" strokeWidth="1.5"/>
            {/* KD */}
            <polyline points="0,80 50,75 100,65 150,52 200,43 250,36 300,31" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
            <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['Anakinra', '#10B981'], ['Tocilizumab', '#6C7CFF'], ['KD', '#F59E0B'], ['Sans traitement', '#EF4444']].map(([l, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ width: 16, height: 2, background: c as string, borderRadius: 1 }} />
              {l}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(232,121,249,0.08)', borderRadius: 10, border: '1px solid rgba(232,121,249,0.2)' }}>
          <div style={{ fontSize: 10, color: '#E879F9', fontWeight: 700 }}>Projection J+30 · Anakinra</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>VPS estimé : 18 · Probabilité de récupération : 73%</div>
        </div>
      </div>
    ),
  },
  {
    id: 'discovery',
    label: 'Discovery',
    color: '#10B981',
    title: 'Discovery Engine — Recherche translationnelle',
    desc: 'PubMed live · ClinicalTrials.gov · Hypothèses IA. Chaque patient enrichit la science.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { level: 'L1', label: 'PatternMiner', detail: '34 paramètres · k-means k=3 · z-score 2.5σ', color: '#6C7CFF', badge: '12 patterns' },
          { level: 'L2', label: 'LiteratureScanner', detail: '25 publications · 3 essais NCT · PubMed live', color: '#2FD1C8', badge: '47 refs' },
          { level: 'L3', label: 'HypothesisEngine', detail: 'Claude API · 3 hypothèses · validation workflow', color: '#10B981', badge: '3 hyp.' },
          { level: 'L4', label: 'TreatmentPathfinder', detail: 'Anakinra/Tocilizumab/KD · scoring éligibilité', color: '#F59E0B', badge: 'actif' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: `${l.color}08`, border: `1px solid ${l.color}18` }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: l.color, fontFamily: 'monospace', minWidth: 22 }}>{l.level}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{l.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{l.detail}</div>
            </div>
            <span style={{ fontSize: 8, color: l.color, background: `${l.color}15`, border: `1px solid ${l.color}25`, padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700 }}>{l.badge}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'alejandro',
    label: 'Alejandro',
    color: '#F5A623',
    title: 'Alejandro R. · 2019–2025',
    desc: 'C\'est pour lui que PULSAR existe. 15 jours. Ce que le système aurait vu, heure par heure.',
    screen: () => (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#F5A623', marginBottom: 4 }}>En mémoire d'Alejandro R.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>2019 – 2025</div>
        </div>
        {[
          { j: 'J-3', label: 'Myalgies récurrentes · Rhinite · Fièvre', pulsar: 'HPO signal — profil inflammatoire précoce', c: '#6C7CFF' },
          { j: 'J0', label: 'Admission Réa Robert-Debré · Intubation', pulsar: 'VPS 87 — FIRES probabilité 74%', c: '#F59E0B' },
          { j: 'J+1', label: '6 convulsions · PAM 61 · Œdème cérébral', pulsar: 'CAE déclenché — escalade thérapeutique', c: '#EF4444' },
          { j: 'J+4', label: 'FIRES posé · Début kétogène', pulsar: 'Délai DDD : 4 jours · Fenêtre anakinra passée', c: '#EF4444' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8, background: `${e.c}08`, border: `1px solid ${e.c}18` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: e.c, fontFamily: 'monospace', minWidth: 30 }}>{e.j}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{e.label}</div>
              <div style={{ fontSize: 9, color: e.c, marginTop: 2 }}>→ {e.pulsar}</div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(245,166,35,0.6)', fontStyle: 'italic', marginTop: 4 }}>
          « Je ferai quelque chose pour que ça n'arrive plus jamais. »
        </div>
      </div>
    ),
  },
]

interface DemoPlayerProps {
  open: boolean
  onClose: () => void
}

export default function DemoPlayer({ open, onClose }: DemoPlayerProps) {
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(true)

  const current = SCENES[scene]

  // Autoplay
  useEffect(() => {
    if (!open || !playing) return
    const t = setInterval(() => {
      setScene(s => s < SCENES.length - 1 ? s + 1 : 0)
    }, 6000)
    return () => clearInterval(t)
  }, [open, playing])

  // Reset on open
  useEffect(() => {
    if (open) { setScene(0); setPlaying(true) }
  }, [open])

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  const Screen = current.screen

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9999, width: '95%', maxWidth: 480,
        background: '#0C1020',
        border: `1px solid ${current.color}30`,
        borderRadius: 20,
        boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 40px ${current.color}15`,
        overflow: 'hidden',
        animation: 'demoIn 0.3s cubic-bezier(.22,1,.36,1)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div key={scene} style={{
            height: '100%',
            background: `linear-gradient(90deg, ${current.color}, ${current.color}80)`,
            animation: playing ? 'demoProgress 6s linear forwards' : 'none',
            width: playing ? undefined : `${((scene + 1) / SCENES.length) * 100}%`,
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: current.color, boxShadow: `0 0 10px ${current.color}` }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: current.color, fontFamily: 'monospace', letterSpacing: 2 }}>
              PULSAR DÉMO · {scene + 1}/{SCENES.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPlaying(p => !p)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>{playing ? '⏸' : '▶'}</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: '0 6px', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Title */}
        <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{current.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{current.desc}</div>
        </div>

        {/* Screen */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Screen />
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 5 }}>
            {SCENES.map((s, i) => (
              <button key={i} onClick={() => { setScene(i); setPlaying(false) }} style={{
                width: i === scene ? 20 : 6, height: 6, borderRadius: 3,
                background: i === scene ? current.color : i < scene ? `${current.color}50` : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s',
              }} />
            ))}
          </div>
          {/* Arrows */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setScene(s => Math.max(0, s - 1)); setPlaying(false) }}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12 }}>←</button>
            <button onClick={() => { if (scene < SCENES.length - 1) { setScene(s => s + 1); setPlaying(false) } else onClose() }}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: current.color, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {scene < SCENES.length - 1 ? 'Suivant →' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes demoIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.95); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes demoProgress { from { width:0 } to { width:100% } }
      `}</style>
    </>
  )
}
