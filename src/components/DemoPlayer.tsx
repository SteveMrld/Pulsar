'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ══════════════════════════════════════════════════════════════
// PULSAR CINEMATIC DEMO V2 — 5 actes · ~80 secondes
// ══════════════════════════════════════════════════════════════

interface DemoPlayerProps { open: boolean; onClose: () => void }

const C = {
  vps: '#6C7CFF', disc: '#10B981', cae: '#FF6B35', ddd: '#DC2626',
  oracle: '#E879F9', alex: '#F5A623', gold: '#F5A623', white: '#F0F2F5',
  dim: '#8892A4', bg: '#04070F', card: '#0B1220',
}

const SEQUENCES = [
  { id: 'intro',     act: 1, duration: 8000,  accentColor: C.vps },
  { id: 'cockpit',   act: 2, duration: 10000, accentColor: C.vps },
  { id: 'vps',       act: 2, duration: 9000,  accentColor: C.vps },
  { id: 'discovery', act: 2, duration: 10000, accentColor: C.disc },
  { id: 'cascade',   act: 2, duration: 9000,  accentColor: C.cae },
  { id: 'ddd',       act: 2, duration: 9000,  accentColor: C.ddd },
  { id: 'oracle',    act: 2, duration: 9000,  accentColor: C.oracle },

  { id: 'packshot',  act: 3, duration: 7000,  accentColor: C.vps },
  { id: 'hospitals', act: 4, duration: 8000,  accentColor: C.disc },
  { id: 'memorial',  act: 5, duration: 9000,  accentColor: C.gold },
]

const ACT_LABELS = ['', 'Introduction', 'La plateforme', 'Bilan', 'Déploiement', 'Mémorial']

function AlertRow({ severity, title, body, delay = 0 }: { severity: string; title: string; body: string; delay?: number }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  const col = severity === 'critical' ? '#EF4444' : severity === 'warning' ? '#F59E0B' : C.vps
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${col}`, background: `${col}08`, marginBottom: 6, opacity: v ? 1 : 0, transform: v ? 'translateX(0)' : 'translateX(-12px)', transition: 'all 0.4s ease' }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: col, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 9, color: C.dim, lineHeight: 1.4 }}>{body}</div>
    </div>
  )
}

function DataRow({ label, value, color, delay = 0 }: { label: string; value: string; color: string; delay?: number }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: v ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      <span style={{ fontSize: 9, color: C.dim, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

// ── ACTE I — INTRO ────────────────────────────────────────────
function SeqIntro() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [600, 2000, 4000, 6000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 24 }}>
      <div style={{ width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle, ${C.vps}40 0%, ${C.vps}10 50%, transparent 70%)`, border: `1px solid ${C.vps}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${C.vps}30`, opacity: p >= 1 ? 1 : 0, transform: p >= 1 ? 'scale(1)' : 'scale(0.4)', transition: 'all 1s ease' }}>
        <span style={{ fontSize: 50, fontWeight: 900, color: C.vps, fontFamily: 'monospace' }}>P</span>
      </div>
      <div style={{ opacity: p >= 2 ? 1 : 0, transition: 'opacity 0.8s' }}>
        <div style={{ fontSize: 50, fontWeight: 800, color: C.white, letterSpacing: -0.5, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>PULSAR</div>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 4, marginTop: 8, fontFamily: 'monospace' }}>PEDIATRIC ULTRA-RARE SYNDROME ANALYZER</div>
      </div>
      <div style={{ fontSize: 17, color: C.gold, fontStyle: 'italic', lineHeight: 1.7, maxWidth: 420, opacity: p >= 3 ? 1 : 0, transform: p >= 3 ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.8s ease' }}>
        "Dans les maladies ultra-rares, la différence entre<br/>les séquelles et la récupération se mesure en heures."
      </div>
      <div style={{ display: 'flex', gap: 32, opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.8s' }}>
        {[['12', 'MOTEURS IA'], ['95', 'TESTS VALIDÉS'], ['4,662', 'LIGNES MOTEUR']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.vps, fontFamily: 'monospace' }}>{n}</div>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: 2, fontFamily: 'monospace' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── COCKPIT ───────────────────────────────────────────────────
function SeqCockpit() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1200, 2500, 4000, 6000, 8000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])

  const engines = [
    { id: 'VPS', label: 'VPS Engine', score: 99, sub: 'CRITIQUE', color: '#EF4444' },
    { id: 'TDE', label: 'Triage & Diagnosis', score: 75, sub: 'ESCALADE', color: '#F59E0B' },
    { id: 'PVE', label: 'Pharmacovigilance', score: 48, sub: 'RISQUE FAIBLE', color: C.vps },
    { id: 'EWE', label: 'Early Warning', score: 94, sub: 'ALERTE PRÉCOCE', color: '#8B5CF6' },
    { id: 'TPE', label: 'Treatment Path', score: 32, sub: 'HYPOTH. DISPOS.', color: C.disc },
    { id: 'NCE', label: 'NeuroCore Engine', score: 76, sub: 'CRITIQUE', color: '#EF4444' },
    { id: 'DDD', label: 'Delay Detector', score: 80, sub: 'RETARD', color: C.ddd },
    { id: 'CAE', label: 'Cascade Alert', score: 68, sub: 'HIGH', color: C.cae },
  ]

  const signals = [
    { type: 'TRÈS FORT · anomaly', text: 'Profil orage cytokinique — Lucas B.', color: C.oracle },
    { type: 'FORT · correlation', text: 'Corrélation : Ferritine ↔↔ Fréquence des crises', color: '#F59E0B' },
    { type: 'FORT · treatment_response', text: 'Résistance L1 systématique dans FIRES', color: C.cae },
    { type: 'DUAL SIGNAL · NETWORKMAP', text: 'Anakinra (anti-IL-1) — Alejandro R.', color: C.disc },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.vps, letterSpacing: 2, marginBottom: 3 }}>COCKPIT — VUE GÉNÉRALE</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>12 Moteurs · Vue Unifiée en Temps Réel</div>
        <div style={{ fontSize: 10, color: C.dim }}>Inès M. · 4 ans · FIRES · Phase aiguë · J+4 · VPS 99 CRITIQUE</div>
      </div>

      {/* Grille moteurs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
        {engines.map((e, i) => (
          <div key={e.id} style={{
            padding: '8px 10px', borderRadius: 10, background: C.card,
            border: `1px solid ${e.color}25`,
            opacity: p >= 1 ? 1 : 0,
            transform: p >= 1 ? 'translateY(0)' : 'translateY(8px)',
            transition: `all 0.3s ease ${i * 80}ms`,
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 7, color: e.color, letterSpacing: 1, marginBottom: 4 }}>{e.id}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: e.color, lineHeight: 1 }}>{e.score}</span>
            </div>
            <div style={{ fontSize: 7, color: e.color, fontFamily: 'monospace', marginTop: 2, opacity: 0.8 }}>{e.sub}</div>
            <div style={{ marginTop: 4, height: 2, background: '#1A2235', borderRadius: 1 }}>
              <div style={{ width: `${e.score}%`, height: '100%', background: e.color, borderRadius: 1 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Visual Physiology + Discovery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, flex: 1 }}>

        {/* Silhouette schématique */}
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.vps}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, opacity: p >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 7, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>VISUAL PHYSIOLOGY</div>
          <div style={{ position: 'relative', width: 60, height: 110 }}>
            {/* Corps schématique SVG */}
            <svg viewBox="0 0 60 110" width="60" height="110">
              {/* Tête */}
              <circle cx="30" cy="12" r="10" fill="none" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.8" />
              <circle cx="30" cy="12" r="3" fill="#8B5CF6" opacity="0.6" />
              {/* Corps */}
              <rect x="18" y="24" width="24" height="36" rx="4" fill="none" stroke={C.vps} strokeWidth="1.5" opacity="0.6" />
              {/* Coeur */}
              <circle cx="27" cy="36" r="4" fill="#EF4444" opacity="0.8" style={{ filter: 'drop-shadow(0 0 4px #EF4444)' }} />
              {/* Poumons */}
              <ellipse cx="24" cy="32" rx="4" ry="5" fill="none" stroke={C.vps} strokeWidth="1" opacity="0.5" />
              <ellipse cx="36" cy="32" rx="4" ry="5" fill="none" stroke={C.vps} strokeWidth="1" opacity="0.5" />
              {/* Abdo */}
              <circle cx="30" cy="50" r="5" fill="#F59E0B" opacity="0.6" />
              {/* Jambes */}
              <line x1="24" y1="60" x2="20" y2="90" stroke={C.vps} strokeWidth="1.5" opacity="0.5" />
              <line x1="36" y1="60" x2="40" y2="90" stroke={C.vps} strokeWidth="1.5" opacity="0.5" />
              {/* Bras */}
              <line x1="18" y1="28" x2="8" y2="50" stroke={C.vps} strokeWidth="1.5" opacity="0.5" />
              <line x1="42" y1="28" x2="52" y2="50" stroke={C.vps} strokeWidth="1.5" opacity="0.5" />
            </svg>
            {/* Hotspots */}
            {p >= 3 && [
              { top: 6, left: 26, c: '#8B5CF6' },
              { top: 28, left: 22, c: '#EF4444' },
              { top: 26, left: 32, c: C.vps },
              { top: 42, left: 26, c: '#F59E0B' },
            ].map((h, i) => (
              <div key={i} style={{ position: 'absolute', top: h.top, left: h.left, width: 8, height: 8, borderRadius: '50%', background: h.c, boxShadow: `0 0 6px ${h.c}`, border: `1px solid ${h.c}` }} />
            ))}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#EF4444', marginTop: 6, fontWeight: 700 }}>CRITIQUE</div>
        </div>

        {/* Discovery signals */}
        <div style={{ display: 'flex', flexDirection: 'column', opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 7, color: C.disc, letterSpacing: 2, marginBottom: 8 }}>DISCOVERY ENGINE — 4 SIGNAUX PATIENT</div>
          {signals.map((s, i) => (
            <div key={i} style={{
              padding: '7px 10px', borderRadius: 8, marginBottom: 5,
              background: `${s.color}06`, border: `1px solid ${s.color}20`,
              opacity: p >= 5 ? 1 : 0,
              transform: p >= 5 ? 'translateX(0)' : 'translateX(8px)',
              transition: `all 0.3s ease ${i * 120}ms`,
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 7, color: s.color, letterSpacing: 1, marginBottom: 2 }}>{s.type}</div>
              <div style={{ fontSize: 10, color: C.white }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ACTE II — VPS ─────────────────────────────────────────────
function SeqVPS() {
  const [p, setP] = useState(0)
  const [score, setScore] = useState(0)
  useEffect(() => {
    const ts = [300, 1200, 2800, 4500].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    if (p >= 2) {
      let v = 0
      const iv = setInterval(() => { v = Math.min(99, v + 3); setScore(v); if (v >= 99) clearInterval(iv) }, 40)
      return () => clearInterval(iv)
    }
  }, [p])
  const pct = (score / 99) * 2 * Math.PI * 38
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.vps, letterSpacing: 2, marginBottom: 3 }}>MOTEUR 1 — VPS ENGINE</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Score de Sévérité en Temps Réel</div>
        <div style={{ fontSize: 10, color: C.dim }}>11 moteurs agrègent les données cliniques · Mis à jour en continu</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.vps}20` }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 12 }}>INÈS M. · 4 ANS · FIRES · J+4</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 96, height: 96 }}>
              <svg viewBox="0 0 96 96" style={{ width: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="48" cy="48" r="38" fill="none" stroke="#1A2235" strokeWidth="8" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray={`${pct} 999`} style={{ transition: 'stroke-dasharray 0.1s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#EF4444', fontFamily: 'monospace', lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 7, color: '#EF4444', fontFamily: 'monospace' }}>CRITIQUE</div>
              </div>
            </div>
          </div>
          <div style={{ opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}>
            {[['Neuro', '42/50', '#8B5CF6'], ['Cardio', '28/30', '#EF4444'], ['Inflam.', '18/20', '#F59E0B']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: C.dim, fontFamily: 'monospace' }}>{l}</span>
                <span style={{ fontSize: 9, color: c, fontFamily: 'monospace', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>10 ALERTES ACTIVES</div>
          <AlertRow severity="critical" title="🔴 VPS 99/100 — Protocole urgence" body="Seuil critique dépassé · 10 alertes convergentes" delay={800} />
          <AlertRow severity="critical" title="🔴 FIRES Score 9/13 — Suspicion forte" body="Immunothérapie L1 &lt; 48h · Escalade anakinra" delay={1800} />
          <AlertRow severity="warning" title="🟡 Cardiotoxicité cumulée — PVE alerte" body="5 molécules cardio-actives · Surveillance ECG" delay={2800} />
          <AlertRow severity="warning" title="🟡 Orage cytokinique — EWE précoce" body="Ferritine ↑↑ + IL-1β + pattern FIRES" delay={3800} />
        </div>
      </div>
    </div>
  )
}

// ── DISCOVERY ─────────────────────────────────────────────────
function SeqDiscovery() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1200, 2500, 4000, 6000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  const signals = [
    { t: 'Corrélation Ferritine ↔ Crises', v: 'r=0.76', c: C.disc },
    { t: 'Pattern BACM récurrent sur FIRES', v: 'p<0.001', c: C.oracle },
    { t: 'Profil orage cytokinique — 4 sigma', v: 'z=4.1', c: '#F59E0B' },
    { t: 'Résistance L1 systématique · FIRES', v: 'Lai 2020', c: C.cae },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.disc, letterSpacing: 2, marginBottom: 3 }}>MOTEUR 2 — DISCOVERY ENGINE v4.0</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Intelligence Diagnostique — 4 Niveaux d'Analyse</div>
        <div style={{ fontSize: 10, color: C.dim }}>PatternMiner · LiteratureScanner · HypothesisEngine · TreatmentPathfinder</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { n: 'N1', l: 'PatternMiner', d: 'Pearson · k-means · z-score', c: C.disc },
          { n: 'N2', l: 'LiteratureScanner', d: 'PubMed live · 12 000+ articles', c: C.oracle },
          { n: 'N3', l: 'HypothesisEngine', d: 'Claude Sonnet API · IA clinique', c: '#F59E0B' },
          { n: 'N4', l: 'TreatmentPathfinder', d: 'Anakinra · Tocilizumab · KD', c: C.cae },
        ].map(({ n, l, d, c }, i) => (
          <div key={n} style={{ padding: '10px 12px', borderRadius: 10, background: C.card, border: `1px solid ${c}25`, borderLeft: `3px solid ${c}`, opacity: p >= 1 ? 1 : 0, transform: p >= 1 ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.4s ease ${i * 150}ms` }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: c, letterSpacing: 1.5, marginBottom: 2 }}>{n} — {l}</div>
            <div style={{ fontSize: 9, color: C.dim }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>SIGNAUX DÉTECTÉS — INÈS M.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {signals.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${s.c}06`, borderRadius: 8, border: `1px solid ${s.c}20`, opacity: p >= 2 && i < p - 1 ? 1 : 0, transform: p >= 2 && i < p - 1 ? 'translateX(0)' : 'translateX(-10px)', transition: 'all 0.4s ease' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c, boxShadow: `0 0 6px ${s.c}`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: C.white, flex: 1 }}>{s.t}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: s.c, fontWeight: 700, background: `${s.c}12`, padding: '2px 8px', borderRadius: 20 }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CASCADE ───────────────────────────────────────────────────
function SeqCascade() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1500, 3000, 5000, 7000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  const chain = ['Phénytoïne IV (15 mg/kg) administrée', 'Inhibition canaux Na⁺ → allongement QT', 'Phénobarbital concomitant → potentialisation', 'PAM chute : 114 → 61 mmHg en 2h', '⚠ RISQUE ARRÊT CARDIAQUE IMMINENT']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.cae, letterSpacing: 2, marginBottom: 3 }}>MOTEUR 3 — CASCADE ALERT ENGINE</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Détection des Effets en Chaîne</div>
        <div style={{ fontSize: 10, color: C.dim }}>Intervention × Vulnérabilité × Littérature · OpenFDA temps réel</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>CHAÎNE — PHÉNYTOÏNE + PHÉNOBARBITAL</div>
          {chain.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, opacity: p >= 1 && i < p ? 1 : 0, transform: p >= 1 && i < p ? 'translateX(0)' : 'translateX(-8px)', transition: 'all 0.3s ease' }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: i === 4 ? '#EF444420' : `${C.cae}15`, border: `1px solid ${i === 4 ? '#EF4444' : C.cae}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: i === 4 ? '#EF4444' : C.cae, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 10, color: i === 4 ? '#EF4444' : C.white, lineHeight: 1.4, fontWeight: i === 4 ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 14, background: C.card, borderRadius: 12, border: `1px solid ${C.cae}20`, textAlign: 'center', opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.cae, marginBottom: 8, letterSpacing: 1 }}>RISQUE CARDIOTOXICITÉ</div>
            <div style={{ fontFamily: 'monospace', fontSize: 38, fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>97<span style={{ fontSize: 14 }}>%</span></div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 8, lineHeight: 1.5 }}>5 molécules cardio-actives actives simultanément</div>
          </div>
          <div style={{ padding: '10px 12px', background: '#EF444408', borderRadius: 10, border: '1px solid #EF444430', opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>Alternative recommandée</div>
            <div style={{ fontSize: 9, color: C.dim }}>Levetiracetam IV — profil cardiotoxique minimal · Réf: Gaspard 2015</div>
          </div>
          <div style={{ padding: '8px 12px', background: `${C.disc}08`, borderRadius: 8, border: `1px solid ${C.disc}20`, opacity: p >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 9, color: C.disc, fontFamily: 'monospace' }}>↗ Confirmé OpenFDA FAERS en temps réel</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DDD ───────────────────────────────────────────────────────
function SeqDDD() {
  const [p, setP] = useState(0)
  const [hours, setHours] = useState(0)
  useEffect(() => {
    const ts = [300, 1500, 3000, 5500].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    if (p >= 2) {
      let h = 0; const iv = setInterval(() => { h = Math.min(120, h + 4); setHours(h); if (h >= 120) clearInterval(iv) }, 50)
      return () => clearInterval(iv)
    }
  }, [p])
  const delays = [
    { a: 'Diagnostic FIRES', o: 'J0', r: 'J+5', l: '+120h', s: 'critical' },
    { a: 'IVIg + Corticoïdes', o: '< 48h', r: 'J+3', l: '+24h', s: 'warning' },
    { a: 'Régime cétogène', o: 'J+2', r: 'J+5', l: '+72h', s: 'warning' },
    { a: 'Anakinra (escalade)', o: 'J+7 max', r: 'J+10', l: '+3 jours', s: 'critical' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.ddd, letterSpacing: 2, marginBottom: 3 }}>MOTEUR 4 — DIAGNOSTIC DELAY DETECTOR</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Le Garde-fou Contre l'Inertie Clinique</div>
        <div style={{ fontSize: 10, color: C.dim }}>8 règles sourées · Détection automatique · Alerte en temps réel</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>RETARDS — CAS ALEJANDRO RECONSTITUÉ</div>
          {delays.map((d, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 6, background: d.s === 'critical' ? '#EF444408' : '#F59E0B08', border: `1px solid ${d.s === 'critical' ? '#EF444420' : '#F59E0B20'}`, borderLeft: `3px solid ${d.s === 'critical' ? '#EF4444' : '#F59E0B'}`, opacity: p >= 2 ? 1 : 0, transform: p >= 2 ? 'translateX(0)' : 'translateX(-10px)', transition: `all 0.3s ease ${i * 150}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.white }}>{d.a}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 800, color: d.s === 'critical' ? '#EF4444' : '#F59E0B' }}>{d.l}</span>
              </div>
              <div style={{ fontSize: 9, color: C.dim }}>{d.o} recommandé · {d.r} réel</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 16, background: C.card, borderRadius: 12, border: `1px solid ${C.ddd}20`, textAlign: 'center', opacity: p >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>HEURES PERDUES</div>
            <div style={{ fontFamily: 'monospace', fontSize: 50, fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>{hours}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#EF4444', marginTop: 4 }}>HEURES</div>
          </div>
          <div style={{ padding: '10px 14px', background: `${C.disc}08`, borderRadius: 10, border: `1px solid ${C.disc}20`, opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.disc, letterSpacing: 1.5, marginBottom: 6 }}>AVEC PULSAR</div>
            <DataRow label="Diagnostic FIRES" value="J0 au lieu de J+5" color={C.disc} delay={0} />
            <DataRow label="Signal anakinra" value="J+1 au lieu de J+10" color={C.disc} delay={100} />
            <DataRow label="Gain estimé" value="−120h perdues" color={C.disc} delay={200} />
          </div>
          <div style={{ padding: '8px 12px', background: `${C.ddd}08`, borderRadius: 8, border: `1px solid ${C.ddd}20`, opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 10, color: C.ddd, fontStyle: 'italic', lineHeight: 1.5 }}>"Le problème n'était pas l'absence d'action. C'était la vitesse de reconnaissance."</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ORACLE ────────────────────────────────────────────────────
function SeqOracle() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1500, 3000, 5000, 7000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  const pts = [
    { h: '0h', v: 99, c: '#EF4444' }, { h: '6h', v: 94, c: '#EF4444' },
    { h: '12h', v: 82, c: '#F59E0B' }, { h: '24h', v: 71, c: '#F59E0B' },
    { h: '48h', v: 54, c: C.disc }, { h: '72h', v: 38, c: C.disc },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.oracle, letterSpacing: 2, marginBottom: 3 }}>MOTEUR 5 — ORACLE ENGINE</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Projection Pronostique sur 72 Heures</div>
        <div style={{ fontSize: 10, color: C.dim }}>Simulation de trajectoires · Comparaison scénarios · Score de récupération</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>TRAJECTOIRE VPS — PROTOCOLE OPTIMAL</div>
          <div style={{ height: 130, position: 'relative', marginBottom: 8 }}>
            <svg viewBox="0 0 270 110" style={{ width: '100%', height: '100%' }}>
              {[0, 35, 70, 105].map(y => <line key={y} x1="0" y1={y} x2="270" y2={y} stroke="#1A2235" strokeWidth="1" />)}
              {p >= 2 && <polyline points={pts.map((pt, i) => `${i * 54},${(100 - pt.v) * 1.1}`).join(' ')} fill="none" stroke={C.oracle} strokeWidth="2.5" />}
              {p >= 3 && pts.map((pt, i) => <circle key={i} cx={i * 54} cy={(100 - pt.v) * 1.1} r="4" fill={pt.c} style={{ filter: `drop-shadow(0 0 4px ${pt.c})` }} />)}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {pts.map(pt => (
                <div key={pt.h} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 8, color: pt.c, fontWeight: 700 }}>{pt.v}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 7, color: C.dim }}>{pt.h}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '8px 12px', background: `${C.disc}08`, borderRadius: 8, border: `1px solid ${C.disc}20`, opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.disc, letterSpacing: 1, marginBottom: 4 }}>PROJECTION H+72</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.disc }}>VPS 38 — STABILISATION</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>Si protocole L2 initié dans les 6 prochaines heures</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 4 }}>3 SCÉNARIOS SIMULÉS</div>
          {[
            { l: 'L1 actuel — Sans ajustement', o: 'VPS 82 à H+24', r: 0.31, c: '#EF4444', d: 0 },
            { l: 'L2 — Anakinra + KD immédiat', o: 'VPS 38 à H+72', r: 0.78, c: C.disc, d: 300 },
            { l: 'L3 — Rituximab + Plasmaphérèse', o: 'VPS 24 à H+72', r: 0.89, c: C.oracle, d: 600 },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 12px', background: C.card, borderRadius: 10, border: `1px solid ${s.c}25`, borderLeft: `3px solid ${s.c}`, opacity: p >= 3 ? 1 : 0, transition: `opacity 0.4s ease ${s.d}ms` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.white, marginBottom: 6 }}>{s.l}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: C.dim }}>{s.o}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 48, height: 4, background: '#1A2235', borderRadius: 2 }}>
                    <div style={{ width: `${s.r * 100}%`, height: '100%', background: s.c, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 9, color: s.c, fontFamily: 'monospace', fontWeight: 700 }}>{Math.round(s.r * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 4, padding: '8px 12px', background: `${C.oracle}08`, borderRadius: 8, border: `1px solid ${C.oracle}20`, opacity: p >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 10, color: C.oracle, fontStyle: 'italic' }}>"Oracle donne au clinicien une longueur d'avance de 72 heures."</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ALEJANDRO ─────────────────────────────────────────────────
function SeqAlejandro() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1500, 3500, 5500, 7500].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.alex, letterSpacing: 2, marginBottom: 3 }}>PATIENT 0 — CAS FONDATEUR</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Alejandro R. — Ce que PULSAR aurait changé</div>
        <div style={{ fontSize: 10, color: C.dim }}>FIRES · 6 ans · Eaubonne → Robert-Debré · 03/04 – 17/04/2025</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#EF4444', letterSpacing: 2, marginBottom: 8 }}>CE QUI S'EST PASSÉ</div>
          {[
            { d: 'J+5', t: 'Diagnostic FIRES — 5 jours après les premiers signaux', c: '#EF4444' },
            { d: 'J+3', t: 'IVIg — 24h de retard sur la fenêtre optimale', c: '#F59E0B' },
            { d: 'J+10', t: 'Anakinra — 3 jours après signal d\'escalade PULSAR', c: '#F59E0B' },
            { d: 'J+15', t: 'Arrêt cardiaque — 5 causes convergentes', c: '#EF4444' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, opacity: p >= 1 ? 1 : 0, transition: `opacity 0.3s ease ${i * 150}ms` }}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 800, color: e.c, minWidth: 32, paddingTop: 2 }}>{e.d}</div>
              <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.4 }}>{e.t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.disc, letterSpacing: 2, marginBottom: 8 }}>AVEC PULSAR — SIMULATION</div>
          {[
            { l: 'Diagnostic FIRES', b: 'J+5', a: 'J0', g: '−120h', c: C.disc },
            { l: 'Alerte anakinra', b: 'J+10', a: 'J+1', g: '−9j', c: C.disc },
            { l: 'Cardiotoxicité', b: 'Non détectée', a: 'J+3 alerte', g: '✓', c: C.oracle },
            { l: 'VPS synthétique', b: 'Inconnu', a: '100 CRITIQUE', g: 'Visible', c: '#EF4444' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '7px 10px', background: `${r.c}06`, borderRadius: 8, border: `1px solid ${r.c}20`, marginBottom: 6, opacity: p >= 2 ? 1 : 0, transition: `opacity 0.3s ease ${i * 150}ms` }}>
              <div style={{ fontSize: 9, color: C.dim, marginBottom: 2 }}>{r.l}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: '#EF4444', textDecoration: 'line-through', opacity: 0.6 }}>{r.b}</span>
                <span style={{ fontSize: 9, color: C.white }}>→</span>
                <span style={{ fontSize: 10, color: r.c, fontWeight: 700 }}>{r.a}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: r.c, fontWeight: 800 }}>{r.g}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', background: `${C.alex}08`, borderRadius: 10, border: `1px solid ${C.alex}30`, opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.6s' }}>
            <div style={{ fontSize: 10, color: C.alex, lineHeight: 1.6, fontStyle: 'italic' }}>"PULSAR n'est pas un meilleur médecin. C'est un système qui empêche que des signaux connus se perdent dans la complexité d'une réanimation."</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 16, justifyContent: 'center', opacity: p >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}>
        {[['100', 'VPS CRITIQUE', '#EF4444'], ['14', 'ALERTES', '#F59E0B'], ['4', 'DDD', C.ddd], ['11', 'MOTEURS', C.vps]].map(([n, l, c]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: c }}>{n}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 7, color: C.dim, letterSpacing: 1.5 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PACK SHOT ─────────────────────────────────────────────────
function SeqPackshot() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [300, 1000, 2000, 3000, 4500].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 20 }}>
      <div style={{ opacity: p >= 1 ? 1 : 0, transition: 'opacity 0.8s' }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: C.dim, letterSpacing: 4, marginBottom: 8 }}>UNE PLATEFORME. UNE MISSION.</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.white, letterSpacing: -0.5, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>PULSAR</div>
        <div style={{ fontSize: 12, color: C.vps, marginTop: 6, fontStyle: 'italic' }}>Pediatric Ultra-Rare Syndrome Analyzer · V21.4</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 480, width: '100%', opacity: p >= 2 ? 1 : 0, transition: 'opacity 0.8s 0.2s' }}>
        {[['12', 'MOTEURS IA', C.vps], ['95', 'TESTS VALIDÉS', C.disc], ['4,662', 'LIGNES MOTEUR', C.oracle], ['5', 'PATHOLOGIES', '#F59E0B'], ['∞', 'PATIENTS LIVE', C.cae], ['0', 'SAISIE REQUISE', C.disc]].map(([n, l, c]) => (
          <div key={l} style={{ padding: '12px 8px', background: C.card, borderRadius: 12, border: `1px solid ${c}20` }}>
            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: c }}>{n}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 7, color: C.dim, letterSpacing: 1.5, marginTop: 4, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ opacity: p >= 3 ? 1 : 0, transition: 'opacity 0.8s', fontSize: 11, color: C.dim, lineHeight: 1.8 }}>
        Intelligence artificielle clinique · Littérature médicale temps réel · Pharmacovigilance OpenFDA<br />Analyse de cohorte · Prédiction pronostique · Détection de retard diagnostique
      </div>
      <div style={{ display: 'flex', gap: 8, opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.8s' }}>
        {[['NEXT.JS 14', C.vps], ['SUPABASE', C.disc], ['CLAUDE API', C.oracle], ['OPENFDA', C.alex]].map(([l, c]) => (
          <div key={l} style={{ padding: '5px 14px', borderRadius: 20, background: `${c}15`, border: `1px solid ${c}30`, fontSize: 9, color: c, fontFamily: 'monospace', fontWeight: 700 }}>{l}</div>
        ))}
      </div>
      <div style={{ opacity: p >= 5 ? 1 : 0, transition: 'opacity 0.8s', padding: '8px 18px', borderRadius: 10, background: `${C.vps}08`, border: `1px solid ${C.vps}20` }}>
        <div style={{ fontSize: 10, color: C.vps, fontFamily: 'monospace' }}>pulsar-lovat.vercel.app · Beta fermée · Invitation uniquement</div>
      </div>
    </div>
  )
}

// ── HOSPITALS ─────────────────────────────────────────────────
function SeqHospitals() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [400, 1500, 3000, 5000, 6500].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  const hospitals = [
    { f: '🇫🇷', c: 'France', s: 'Neurologie pédiatrique' },
    { f: '🇬🇧', c: 'Royaume-Uni', s: 'Maladies rares pédiatriques' },
    { f: '🇺🇸', c: 'États-Unis', s: 'Neuro-immunologie' },
    { f: '🇨🇦', c: 'Canada', s: 'Réanimation pédiatrique' },
    { f: '🇩🇪', c: 'Allemagne', s: 'Épilepsie réfractaire' },
    { f: '🇧🇪', c: 'Belgique', s: 'FIRES / NORSE' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 18 }}>
      <div style={{ opacity: p >= 1 ? 1 : 0, transition: 'opacity 0.8s' }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: C.disc, letterSpacing: 4, marginBottom: 10 }}>PROCHAINEMENT</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.white, lineHeight: 1.4 }}>
          PULSAR sera bêta-testé dans<br /><span style={{ color: C.disc }}>plusieurs hôpitaux internationaux</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', opacity: p >= 2 ? 1 : 0, transition: 'opacity 0.8s' }}>
        {hospitals.map((h, i) => (
          <div key={i} style={{ padding: '10px 12px', background: C.card, borderRadius: 10, border: '1px solid rgba(108,124,255,0.15)', textAlign: 'left', opacity: p >= 3 ? 1 : 0, transform: p >= 3 ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.4s ease ${i * 100}ms` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{h.f}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.white }}>{h.c}</div>
            <div style={{ fontSize: 9, color: C.vps, marginTop: 4, fontFamily: 'monospace' }}>{h.s}</div>
          </div>
        ))}
      </div>
      <div style={{ opacity: p >= 4 ? 1 : 0, transition: 'opacity 0.8s', fontSize: 11, color: C.dim, lineHeight: 1.8, maxWidth: 460 }}>
        Protocole de bêta-test en cours de finalisation<br />Intégration aux systèmes hospitaliers · Formation des équipes médicales
      </div>
      <div style={{ display: 'flex', gap: 24, opacity: p >= 5 ? 1 : 0, transition: 'opacity 0.8s' }}>
        {[['2026', 'LANCEMENT BETA'], ['6+', 'HÔPITAUX'], ['3', 'CONTINENTS']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: C.disc }}>{n}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: C.dim, letterSpacing: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MEMORIAL ──────────────────────────────────────────────────
function SeqMemorial() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const ts = [600, 2000, 3500, 5500, 7000].map((d, i) => setTimeout(() => setP(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 24 }}>
      <div style={{ width: 1, height: 50, background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)`, opacity: p >= 1 ? 1 : 0, transition: 'opacity 1s' }} />
      <div style={{ opacity: p >= 2 ? 1 : 0, transition: 'opacity 1.2s' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: C.dim, letterSpacing: 4, marginBottom: 18 }}>À LA MÉMOIRE DE</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: C.gold, letterSpacing: -1, lineHeight: 1.1 }}>Alejandro R.</div>
        <div style={{ fontSize: 16, color: C.dim, marginTop: 12, letterSpacing: 6, fontFamily: 'monospace' }}>2019 — 2025</div>
      </div>
      <div style={{ opacity: p >= 3 ? 1 : 0, transition: 'opacity 1s', maxWidth: 460 }}>
        <div style={{ fontSize: 14, color: C.white, lineHeight: 2, fontStyle: 'italic' }}>
          "Sa vie a donné naissance à PULSAR.<br />PULSAR donnera une chance à ceux qui viendront."
        </div>
      </div>
      <div style={{ width: 1, height: 50, background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)`, opacity: p >= 1 ? 1 : 0, transition: 'opacity 1s' }} />
      <div style={{ opacity: p >= 4 ? 1 : 0, transition: 'opacity 1s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.vps, letterSpacing: -0.5, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>PULSAR</div>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 3, fontFamily: 'monospace' }}>PEDIATRIC ULTRA-RARE SYNDROME ANALYZER</div>
      </div>
      <div style={{ opacity: p >= 5 ? 1 : 0, transition: 'opacity 1s', fontSize: 10, color: C.dim, fontFamily: 'monospace', letterSpacing: 2 }}>
        pulsar-lovat.vercel.app · Closed Beta · 2026
      </div>
    </div>
  )
}

function SequenceContent({ id }: { id: string }) {
  switch (id) {
    case 'intro':     return <SeqIntro />
    case 'cockpit':   return <SeqCockpit />
    case 'vps':       return <SeqVPS />
    case 'discovery': return <SeqDiscovery />
    case 'cascade':   return <SeqCascade />
    case 'ddd':       return <SeqDDD />
    case 'oracle':    return <SeqOracle />
    case 'alejandro': return <SeqAlejandro />
    case 'packshot':  return <SeqPackshot />
    case 'hospitals': return <SeqHospitals />
    case 'memorial':  return <SeqMemorial />
    default:          return null
  }
}

// ── PLAYER ────────────────────────────────────────────────────
export default function DemoPlayer({ open, onClose }: DemoPlayerProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  const total = SEQUENCES.length
  const seq = SEQUENCES[current]

  const goTo = useCallback((i: number) => { setCurrent(Math.max(0, Math.min(total - 1, i))); setProgress(0) }, [total])
  const advance = useCallback(() => { setCurrent(c => { if (c >= total - 1) return c; setProgress(0); return c + 1 }) }, [total])

  useEffect(() => {
    if (!open || paused) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(advance, seq.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [open, paused, current, seq.duration, advance])

  useEffect(() => {
    if (!open || paused) return
    setProgress(0)
    const step = 100; const inc = 100 / (seq.duration / step); let p = 0
    progressRef.current = setInterval(() => { p = Math.min(100, p + inc); setProgress(p); if (p >= 100 && progressRef.current) clearInterval(progressRef.current) }, step)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [open, paused, current, seq.duration])

  useEffect(() => { if (open) { setCurrent(0); setProgress(0); setPaused(false) } }, [open])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 840, background: C.bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${seq.accentColor}25`, boxShadow: `0 0 80px ${seq.accentColor}15, 0 24px 80px rgba(0,0,0,0.6)`, display: 'flex', flexDirection: 'column', height: '86vh', maxHeight: 620 }}>

        {/* Top bar */}
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${seq.accentColor}15`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 800, color: seq.accentColor, letterSpacing: 2 }}>PULSAR</span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: C.dim, letterSpacing: 2 }}>ACTE {seq.act} — {ACT_LABELS[seq.act].toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPaused(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 14, padding: '2px 8px' }}>{paused ? '▶' : '⏸'}</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 20, padding: '0 6px', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 2, background: '#0F1828', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: seq.accentColor, transition: 'width 0.1s linear', boxShadow: `0 0 8px ${seq.accentColor}` }} />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '7px 0 3px', flexShrink: 0 }}>
          {SEQUENCES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? s.accentColor : i < current ? `${s.accentColor}50` : '#1A2235', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Content */}
        <div key={current} style={{ flex: 1, padding: '10px 20px 14px', overflow: 'hidden', animation: 'demoFade 0.4s ease' }}>
          <style>{`@keyframes demoFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <SequenceContent id={seq.id} />
        </div>

        {/* Bottom nav */}
        <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderTop: `1px solid ${seq.accentColor}10` }}>
          <button onClick={() => goTo(current - 1)} disabled={current === 0} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${seq.accentColor}30`, background: 'none', color: current === 0 ? '#2A3040' : seq.accentColor, fontFamily: 'monospace', fontSize: 11, cursor: current === 0 ? 'default' : 'pointer', fontWeight: 700 }}>‹ Précédent</button>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: C.dim }}>{current + 1} / {total}</span>
          {current < total - 1
            ? <button onClick={() => goTo(current + 1)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${seq.accentColor}30`, background: `${seq.accentColor}10`, color: seq.accentColor, fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Suivant ›</button>
            : <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: seq.accentColor, color: '#fff', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', fontWeight: 800 }}>Fermer ×</button>
          }
        </div>
      </div>
    </div>
  )
}
