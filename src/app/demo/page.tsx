'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

interface Scene {
  id: number; title: string; module: string; phase: string; icon: string; color: string
  narrative: string; duration: number // ms
  render: (ps: PatientState) => React.ReactNode
}

// Build Inès patient state (FIRES scenario)
function getInesPS(overrides?: Partial<any>): PatientState {
  const data = JSON.parse(JSON.stringify(DEMO_PATIENTS['FIRES'].data))
  if (overrides) Object.assign(data, overrides)
  const ps = new PatientState(data)
  runPipeline(ps)
  return ps
}

const SCENES: Scene[] = [
  {
    id: 1, title: 'Admission', module: 'Urgence', phase: 'Phase 1', icon: '🚨', color: 'var(--p-critical)', duration: 12000,
    narrative: 'Inès M., 5 ans, est admise aux urgences pédiatriques. Fièvre à 39.2°C depuis 48h, première crise convulsive tonico-clonique il y a 6 heures. GCS 7/15 à l\'arrivée.',
    render: ps => <InfoGrid items={[{ l: 'Patiente', v: 'Inès M., 5 ans' }, { l: 'Poids', v: `${ps.weightKg} kg` }, { l: 'GCS', v: `${ps.neuro.gcs}/15`, c: 'var(--p-critical)' }, { l: 'T°', v: `${ps.hemodynamics.temp}°C`, c: 'var(--p-warning)' }, { l: 'Crises', v: `${ps.neuro.seizures24h}/24h` }, { l: 'Type', v: 'Status réfractaire', c: 'var(--p-critical)' }]} />,
  },
  {
    id: 2, title: 'Mode Urgence 3h', module: 'Urgence', phase: 'Phase 1', icon: '⏱️', color: 'var(--p-critical)', duration: 10000,
    narrative: 'Le protocole urgence 3h est activé. Les 6 champs essentiels sont saisis en 30 secondes. Le premier score VPS est calculé automatiquement.',
    render: ps => {
      const vps = ps.vpsResult!
      return <div>
        <ScoreBar label="VPS" score={vps.synthesis.score} level={vps.synthesis.level} color="var(--p-vps)" />
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--p-text-muted)' }}>Protocole urgence : 6 champs → score VPS immédiat → alertes en temps réel</div>
      </div>
    },
  },
  {
    id: 3, title: 'Bilan initial', module: 'Bilan', phase: 'Phase 1', icon: '🔬', color: 'var(--p-pve)', duration: 10000,
    narrative: 'Le bilan diagnostique est lancé : NFS, CRP 85 mg/L, PCT 2.1, ferritine 680 µg/L. LCR : pléiocytose 120 cell/µL, protéinorachie élevée. Anticorps en cours.',
    render: ps => <InfoGrid items={[{ l: 'CRP', v: `${ps.biology.crp} mg/L`, c: 'var(--p-warning)' }, { l: 'PCT', v: `${ps.biology.pct} ng/mL` }, { l: 'Ferritine', v: `${ps.biology.ferritin} µg/L`, c: 'var(--p-warning)' }, { l: 'Pléiocytose', v: `${ps.csf.cells} cell/µL`, c: 'var(--p-critical)' }, { l: 'Anticorps', v: ps.csf.antibodies, c: 'var(--p-tpe)' }, { l: 'Protéinorachie', v: 'Élevée' }]} />,
  },
  {
    id: 4, title: 'Diagnostic IA', module: 'Diagnostic', phase: 'Phase 2', icon: '🧬', color: 'var(--p-tde)', duration: 12000,
    narrative: 'PULSAR analyse les données. Hypothèse FIRES : score 10/13 (élevé). Critères activés : âge, fièvre, status réfractaire, GCS<12, pléiocytose, Ac négatifs. Le TDE détecte un pattern FIRES avec 80% de confiance.',
    render: ps => {
      const tde = ps.tdeResult!
      const fire = tde.intention.patterns.find(p => p.name === 'FIRES')
      return <div>
        <ScoreBar label="TDE" score={tde.synthesis.score} level={tde.synthesis.level} color="var(--p-tde)" />
        {fire && <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-critical-bg)', borderLeft: '3px solid var(--p-critical)' }}>
          <span style={{ fontWeight: 700, fontSize: '12px' }}>Pattern FIRES détecté</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', marginLeft: '8px', color: 'var(--p-critical)' }}>{Math.round(fire.confidence * 100)}%</span>
          <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{fire.description}</div>
        </div>}
      </div>
    },
  },
  {
    id: 5, title: 'Interpellation', module: 'Interpellation', phase: 'Phase 2', icon: '⚠️', color: 'var(--p-warning)', duration: 10000,
    narrative: 'PULSAR déclenche 5 drapeaux rouges : GCS ≤ 8, status réfractaire, crises ≥10/24h, CRP élevée, et combinaison VPS critique. Intervention requise.',
    render: ps => <div>
      {[
        { label: 'GCS ≤ 8', detail: `GCS: ${ps.neuro.gcs}`, sev: 'critical' },
        { label: 'Status réfractaire', detail: ps.neuro.seizureType, sev: 'critical' },
        { label: `Crises ≥10/24h`, detail: `${ps.neuro.seizures24h} crises`, sev: 'critical' },
        { label: 'VPS Critique + Crises + J≥5', detail: `Score VPS: ${ps.vpsResult?.synthesis.score}`, sev: 'critical' },
      ].map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', borderLeft: '3px solid var(--p-critical)', background: 'var(--p-critical-bg)' }}>
          <span style={{ padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-critical)', color: '#fff', fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>CRITIQUE</span>
          <span style={{ fontWeight: 600, fontSize: '12px' }}>{f.label}</span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-critical)' }}>{f.detail}</span>
        </div>
      ))}
    </div>,
  },
  {
    id: 6, title: 'Case-Matching', module: 'Case-Matching', phase: 'Phase 2', icon: '🔄', color: 'var(--p-info)', duration: 10000,
    narrative: 'Le profil d\'Inès est comparé aux 4 cas de référence. Similarité la plus élevée avec Alejandro R. (FIRES, 6 ans) : 78%. Le cas d\'Alejandro rappelle l\'importance d\'une escalade rapide.',
    render: () => <div>
      {[{ name: 'Alejandro R. (FIRES)', sim: 78, color: 'var(--p-critical)' }, { name: 'Emma S. (FIRES+Orage)', sim: 62, color: 'var(--p-warning)' }, { name: 'Lina B. (NMDAR)', sim: 35, color: 'var(--p-tde)' }, { name: 'Noah (PIMS)', sim: 18, color: 'var(--p-tpe)' }].map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color: c.color, width: '40px' }}>{c.sim}%</span>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--p-dark-4)' }}><div style={{ height: '100%', borderRadius: '3px', background: c.color, width: `${c.sim}%`, transition: 'width 1s' }} /></div>
          <span style={{ fontSize: '12px', width: '160px' }}>{c.name}</span>
        </div>
      ))}
    </div>,
  },
  {
    id: 7, title: '1ère ligne', module: 'Recommandations', phase: 'Phase 3', icon: '💊', color: 'var(--p-ewe)', duration: 10000,
    narrative: 'PULSAR recommande la 1ère ligne : Méthylprednisolone 30mg/kg/j × 3-5 jours + IgIV 0.4g/kg/j × 5 jours. Monitoring glycémie et TA.',
    render: ps => <div>
      {[{ drug: 'Méthylprednisolone IV', dose: `${Math.round(ps.weightKg * 30)} mg/j`, dur: '3-5 jours' }, { drug: 'IgIV', dose: `${(ps.weightKg * 0.4).toFixed(1)} g/j`, dur: '5 jours (total 2g/kg)' }].map((d, i) => (
        <div key={i} style={{ padding: '8px 12px', marginBottom: '6px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', borderLeft: '3px solid var(--p-success)' }}>
          <div style={{ fontWeight: 700, fontSize: '12px' }}>{d.drug}</div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{d.dose} · {d.dur}</div>
        </div>
      ))}
    </div>,
  },
  {
    id: 8, title: 'Pharmacovigilance', module: 'Pharmacovigilance', phase: 'Phase 3', icon: '🛡️', color: 'var(--p-pve)', duration: 10000,
    narrative: 'Le PVE Engine détecte l\'interaction Valproate + Méropénème : chute VPA de -66 à -88% en 24h. Action : switch vers LEV, dosage VPA urgent.',
    render: ps => {
      const pve = ps.pveResult!
      return <div>
        <ScoreBar label="PVE" score={pve.synthesis.score} level={pve.synthesis.level} color="var(--p-pve)" />
        {pve.synthesis.alerts.slice(0, 3).map((a, i) => (
          <div key={i} style={{ marginTop: '8px', padding: '8px 12px', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: a.severity === 'critical' ? 'var(--p-critical-bg)' : 'var(--p-warning-bg)' }}>
            <div style={{ fontWeight: 700, fontSize: '12px' }}>{a.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{a.body}</div>
          </div>
        ))}
      </div>
    },
  },
  {
    id: 9, title: 'Cockpit J3', module: 'Cockpit', phase: 'Phase 4', icon: '📊', color: 'var(--p-vps)', duration: 10000,
    narrative: 'J3 d\'hospitalisation. Le cockpit vital montre : VPS 82 (CRITIQUE), TDE 75 (ESCALADE URGENTE). Les crises persistent. La 1ère ligne n\'a pas suffi.',
    render: ps => <div>
      {[{ n: 'VPS', s: ps.vpsResult!, c: 'var(--p-vps)' }, { n: 'TDE', s: ps.tdeResult!, c: 'var(--p-tde)' }, { n: 'PVE', s: ps.pveResult!, c: 'var(--p-pve)' }].map((e, i) => (
        <ScoreBar key={i} label={e.n} score={e.s.synthesis.score} level={e.s.synthesis.level} color={e.c} />
      ))}
    </div>,
  },
  {
    id: 10, title: 'Échec L1 → Escalade', module: 'Recommandations', phase: 'Phase 3', icon: '⬆️', color: 'var(--p-warning)', duration: 12000,
    narrative: 'Échec de la 1ère ligne confirmé. Le TDE recommande l\'escalade : 2ème ligne — Rituximab 375mg/m² ou Plasmaphérèse 5-7 sessions. Considérer régime cétogène.',
    render: ps => <div>
      <div style={{ padding: '10px 14px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-critical-bg)', borderLeft: '3px solid var(--p-critical)', marginBottom: '10px' }}>
        <span style={{ fontWeight: 700, color: 'var(--p-critical)', fontSize: '12px' }}>ÉCHEC 1ÈRE LIGNE → ESCALADE</span>
      </div>
      {[{ drug: 'Rituximab', dose: `375 mg/m²/sem × 4`, ref: 'Sheikh 2023' }, { drug: 'Plasmaphérèse', dose: '5-7 sessions', ref: 'Koh 2021' }, { drug: 'Régime cétogène', dose: 'Ratio 3:1', ref: 'Wickström 2022' }].map((d, i) => (
        <div key={i} style={{ padding: '6px 12px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', borderLeft: '3px solid var(--p-tde)' }}>
          <span style={{ fontWeight: 700, fontSize: '12px' }}>{d.drug}</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginLeft: '8px' }}>{d.dose}</span>
          <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginLeft: '8px' }}>Réf: {d.ref}</span>
        </div>
      ))}
    </div>,
  },
  {
    id: 11, title: 'Suivi J+5', module: 'Suivi', phase: 'Phase 4', icon: '📈', color: 'var(--p-tpe)', duration: 10000,
    narrative: 'J5 : amélioration partielle. GCS remonte de 7 à 9. CRP en baisse à 55 mg/L. Crises réduites à 6/24h. La 2ème ligne montre des premiers effets.',
    render: () => <div>
      {[{ l: 'GCS', j0: '7', j5: '9', delta: '+2', good: true }, { l: 'CRP', j0: '85', j5: '55', delta: '-30', good: true }, { l: 'Crises/24h', j0: '12', j5: '6', delta: '-6', good: true }, { l: 'Ferritine', j0: '680', j5: '520', delta: '-160', good: true }].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', marginBottom: '6px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
          <span style={{ width: '80px', fontSize: '12px', fontWeight: 600 }}>{r.l}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>J0: {r.j0}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>→</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700 }}>J5: {r.j5}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: r.good ? 'var(--p-success)' : 'var(--p-critical)' }}>{r.delta}</span>
        </div>
      ))}
    </div>,
  },
  {
    id: 12, title: 'RCP', module: 'Staff', phase: 'Phase 5', icon: '👥', color: 'var(--p-info)', duration: 10000,
    narrative: 'Réunion pluridisciplinaire. Le cas est présenté avec les scores PULSAR. Consensus : poursuivre Rituximab, ajouter régime cétogène, IRM contrôle à J+7.',
    render: () => <div>
      {['Poursuivre Rituximab (cycle 2/4)', 'Initier régime cétogène ratio 3:1', 'IRM contrôle à J+7', 'EEG continu maintenu', 'Réévaluation J+7 avec Dr Wirrell'].map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', borderLeft: '3px solid var(--p-success)' }}>
          <span style={{ color: 'var(--p-success)', fontWeight: 700, fontSize: '12px' }}>✓</span>
          <span style={{ fontSize: '12px' }}>{d}</span>
        </div>
      ))}
    </div>,
  },
  {
    id: 13, title: 'Synthèse & Export', module: 'Synthèse', phase: 'Phase 5', icon: '📑', color: 'var(--p-pve)', duration: 15000,
    narrative: 'Le parcours d\'Inès est synthétisé. Rapport exporté pour le centre de référence. PULSAR a accompagné l\'équipe de l\'admission à la RCP en 13 étapes.\n\n« Pour Gabriel, et pour tous les enfants que le temps n\'a pas attendus. »\n\nIn memory of Alejandro R. (2019–2025)',
    render: ps => <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>PARCOURS COMPLET</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
        {[{ n: 'VPS', s: ps.vpsResult!.synthesis.score, c: 'var(--p-vps)' }, { n: 'TDE', s: ps.tdeResult!.synthesis.score, c: 'var(--p-tde)' }, { n: 'PVE', s: ps.pveResult!.synthesis.score, c: 'var(--p-pve)' }].map(e => (
          <div key={e.n} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{e.n}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-xl)', fontWeight: 800, color: e.c }}>{e.s}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', fontStyle: 'italic', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
        « Pour Gabriel, et pour tous les enfants que le temps n'a pas attendus. »
      </div>
      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '8px', fontFamily: 'var(--p-font-mono)' }}>In memory of Alejandro R. (2019–2025)</div>
    </div>,
  },
]

// ── Helper Components ──
function InfoGrid({ items }: { items: { l: string; v: string | number; c?: string }[] }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
    {items.map((it, i) => (
      <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
        <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{it.l}</div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '13px', color: it.c || 'var(--p-text)' }}>{it.v}</div>
      </div>
    ))}
  </div>
}

function ScoreBar({ label, score, level, color }: { label: string; score: number; level: string; color: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
    <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '11px', color, width: '30px' }}>{label}</span>
    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--p-dark-4)' }}><div style={{ height: '100%', borderRadius: '4px', background: color, width: `${score}%`, transition: 'width 1s' }} /></div>
    <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color, width: '30px' }}>{score}</span>
    <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', width: '120px' }}>{level}</span>
  </div>
}

export default function DemoPage() {
  const [mounted, setMounted] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [typedText, setTypedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typeRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => setMounted(true), [])

  const ps = getInesPS()
  const scene = SCENES[currentScene]

  // Typing effect
  useEffect(() => {
    setTypedText('')
    let i = 0
    const txt = scene.narrative
    typeRef.current = setInterval(() => {
      if (i < txt.length) { setTypedText(txt.slice(0, i + 1)); i++ }
      else if (typeRef.current) clearInterval(typeRef.current)
    }, 25)
    return () => { if (typeRef.current) clearInterval(typeRef.current) }
  }, [currentScene])

  // Auto-advance
  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return }
    timerRef.current = setTimeout(() => {
      if (currentScene < SCENES.length - 1) setCurrentScene(prev => prev + 1)
      else setPlaying(false)
    }, scene.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, currentScene])

  const goTo = useCallback((i: number) => { setCurrentScene(i); setPlaying(false) }, [])

  const card: React.CSSProperties = { background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: 'var(--p-space-5)' }}>
      {/* Scene sidebar */}
      <div style={{ width: '200px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>13 SCÈNES</div>
          {SCENES.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '6px 10px', marginBottom: '2px',
              borderRadius: 'var(--p-radius-md)', border: 'none', cursor: 'pointer',
              background: i === currentScene ? `${s.color}15` : 'transparent',
              color: i === currentScene ? s.color : i < currentScene ? 'var(--p-text-dim)' : 'var(--p-text-muted)',
              fontWeight: i === currentScene ? 700 : 400, fontSize: '11px', textAlign: 'left',
            }}>
              <span style={{ fontSize: '12px' }}>{s.icon}</span>
              <span>{s.id}. {s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--p-space-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Démo — Inès M.</h1>
            <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>5 ans · Suspicion FIRES · 13 scènes · ~3 minutes</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { if (currentScene > 0) goTo(currentScene - 1) }} style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-lg)', border: 'var(--p-border)', background: 'var(--p-bg-card)', color: 'var(--p-text-dim)', cursor: 'pointer', fontSize: '12px' }}>← Préc.</button>
            <button onClick={() => setPlaying(!playing)} style={{ padding: '6px 20px', borderRadius: 'var(--p-radius-lg)', border: 'none', background: playing ? 'var(--p-critical)' : 'var(--p-success)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>{playing ? '⏸ Pause' : '▶ Play'}</button>
            <button onClick={() => { if (currentScene < SCENES.length - 1) goTo(currentScene + 1) }} style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-lg)', border: 'var(--p-border)', background: 'var(--p-bg-card)', color: 'var(--p-text-dim)', cursor: 'pointer', fontSize: '12px' }}>Suiv. →</button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)', marginBottom: 'var(--p-space-4)' }}>
          <div style={{ height: '100%', borderRadius: '2px', background: scene.color, width: `${((currentScene + 1) / SCENES.length) * 100}%`, transition: 'width 0.5s' }} />
        </div>

        {/* Scene Header */}
        <div className={mounted ? 'animate-in' : ''} style={{ ...card, borderLeft: `4px solid ${scene.color}`, marginBottom: 'var(--p-space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>{scene.icon}</span>
            <div>
              <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800 }}>Scène {scene.id} — {scene.title}</div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: scene.color }}>{scene.phase} · {scene.module}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--p-text-muted)', whiteSpace: 'pre-line' }}>{typedText}<span style={{ animation: 'pulse-glow 1s infinite', color: scene.color }}>|</span></div>
        </div>

        {/* Scene Content */}
        <div className={mounted ? 'animate-in stagger-1' : ''} style={{ ...card }}>
          {scene.render(ps)}
        </div>

        <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
          PULSAR V15 — Démo Inès · Scène {currentScene + 1}/{SCENES.length}
        </div>
      </div>
    </div>
  )
}
