'use client'


import React, { useState, useEffect, useRef, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════
// PULSAR DEMO PLAYER — Cinematic product tour
// Inspiré de Linear / Vercel / Loom
// Chaque scène = reproduction fidèle de l'UI + narration explicative
// ═══════════════════════════════════════════════════════════════════

const SCENES = [
  {
    id: 'intro', chapter: 'Admission', chapterN: '01', color: '#6C7CFF',
    headline: 'Un enfant arrive aux urgences. Le temps compte.',
    narration: 'PULSAR reçoit les premières données à l\'admission. En quelques secondes, 12 moteurs s\'activent simultanément.',
    ui: 'admission',
  },
  {
    id: 'vps', chapter: 'Score VPS', chapterN: '02', color: '#EF4444',
    headline: 'VPS 92 — Alerte critique déclenchée automatiquement.',
    narration: 'Le Vital Prognosis Score agrège 34 paramètres. Un score > 85 place le patient en P1 immédiat et déclenche la cascade d\'alertes.',
    ui: 'vps',
  },
  {
    id: 'physio', chapter: 'Corps · Zones d\'alerte', chapterN: '03', color: '#B96BFF',
    headline: 'Le corps d\'Inès. Chaque système atteint visualisé.',
    narration: 'PULSAR cartographie les systèmes en défaillance en temps réel. Neurologique, cardiaque, inflammatoire — le clinicien voit tout d\'un coup d\'œil.',
    ui: 'physio',
  },
  {
    id: 'neuron', chapter: 'Neurones FIRES', chapterN: '04', color: '#B96BFF',
    headline: 'Ce que FIRES fait aux neurones. Heure par heure.',
    narration: 'L\'inflammation IL-1β est 4 fois supérieure à la norme. La barrière hémato-encéphalique cède. PULSAR quantifie ce que l\'œil ne voit pas.',
    ui: 'neuron',
  },
  {
    id: 'brain', chapter: 'Cerveau · Heatmap', chapterN: '05', color: '#FF6B35',
    headline: 'Carte thermique cérébrale. Cortex temporal : 94%.',
    narration: 'NeuroCore génère une heatmap des zones inflammatoires à partir de l\'EEG et des biomarqueurs. Ce que l\'IRM montre en 48h, PULSAR l\'estime en minutes.',
    ui: 'brain',
  },
  {
    id: 'timeline', chapter: 'Timeline DDD', chapterN: '06', color: '#EF4444',
    headline: '3 fenêtres thérapeutiques manquées. Identifiées rétrospectivement.',
    narration: 'Le moteur DDD reconstruit la chronologie heure par heure. Chaque délai évitable est nommé, daté, sourcé. Pour que ça n\'arrive plus.',
    ui: 'timeline',
  },
  {
    id: 'cascade', chapter: 'Alertes CAE', chapterN: '07', color: '#FF6B35',
    headline: '2 cascades critiques détectées avant qu\'elles se produisent.',
    narration: 'Le Cascade Alert Engine modélise les effets en chaîne. Il détecte que l\'association MEOPA + midazolam va provoquer une dépression respiratoire dans 18 minutes.',
    ui: 'cascade',
  },
  {
    id: 'anakinra', chapter: 'Mécanisme Anakinra', chapterN: '08', color: '#10B981',
    headline: 'Anakinra. Score 94. Mécanisme d\'action visualisé.',
    narration: 'PULSAR ne se contente pas de recommander — il explique. Le mécanisme d\'action, la posologie, les interactions, la fenêtre. Le médecin comprend pourquoi.',
    ui: 'anakinra',
  },
  {
    id: 'oracle', chapter: 'Simulation ORACLE', chapterN: '09', color: '#E879F9',
    headline: '5 scénarios. Voir le futur avant d\'agir.',
    narration: 'ORACLE simule l\'évolution à J+30 selon chaque décision. Le médecin voit l\'impact de ce qu\'il décide maintenant — avant d\'agir.',
    ui: 'oracle',
  },
  {
    id: 'gutbrain', chapter: 'Axe intestin-cerveau', chapterN: '10', color: '#2FD1C8',
    headline: 'Nouvelle hypothèse. Axe intestin-cerveau. 3 essais NCT actifs.',
    narration: 'Le Discovery Engine L3 génère des hypothèses que la littérature n\'a pas encore validées. Dysbiose intestinale J-7 corrèle avec l\'activation microgliale chez Inès.',
    ui: 'gutbrain',
  },
  {
    id: 'discovery', chapter: 'Discovery Engine', chapterN: '11', color: '#10B981',
    headline: 'Chaque patient enrichit la science mondiale.',
    narration: 'Les données anonymisées d\'Inès enrichissent 847 dossiers dans 12 pays. L\'enfant traité à Pointe-à-Pitre améliore la décision prise demain à Lyon.',
    ui: 'discovery',
  },
]


// ── UI SCREENS ─────────────────────────────────────────────────────

function ScreenAdmission() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0, fontFamily: 'system-ui, sans-serif' }}>
      {/* App header */}
      <div style={{ height: 36, background: 'rgba(108,124,255,0.08)', borderBottom: '1px solid rgba(108,124,255,0.12)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace', letterSpacing: 2 }}>✦ PULSAR</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>ADMISSION EN COURS</div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 44, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 6 }}>
          {['◉','⬡','△','◈','○','⊕'].map((ic,i) => (
            <div key={i} style={{ width: 28, height: 28, borderRadius: 7, background: i===0?'rgba(108,124,255,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 11, color: i===0?'#6C7CFF':'rgba(255,255,255,0.2)', cursor:'pointer' }}>{ic}</div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Nouvelle admission · Réa Neurologique</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { l: 'Prénom', v: 'Inès' },
              { l: 'Âge', v: '4 ans' },
              { l: 'Unité', v: 'Réa Neuro · Lit 3' },
              { l: 'Admission', v: 'J+0 · 14h32' },
            ].map((f,i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '7px 10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{f.l}</div>
                <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(108,124,255,0.06)', borderRadius: 8, padding: 10, border: '1px solid rgba(108,124,255,0.12)' }}>
            <div style={{ fontSize: 9, color: '#6C7CFF', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>MOTEURS IA ACTIVÉS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {[['VPS','#6C7CFF'],['TDE','#2FD1C8'],['CAE','#FF6B35'],['TPE','#FFB347'],['EWE','#A78BFA'],['PVE','#B96BFF'],['DDD','#DC2626'],['ORACLE','#E879F9']].map(([n,c],i) => (
                <div key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${c}15`, border: `1px solid ${c}25`, fontSize: 8, fontWeight: 800, color: c as string, fontFamily: 'monospace' }}>{n}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(16,185,129,0.06)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>✓ Analyse en cours — 8 moteurs actifs</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '73%', height: '100%', background: 'linear-gradient(90deg,#10B981,#2FD1C8)', borderRadius: 2, animation: 'load 2s ease infinite' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenVPS() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · VPS CRITIQUE</div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 8, fontWeight: 800, color: '#EF4444', fontFamily: 'monospace' }}>P1 · CRITIQUE</div>
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
        {/* VPS big score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#EF4444', fontFamily: 'monospace', lineHeight: 1 }}>92</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>VPS</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg,#6C7CFF,#EF4444)', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
              <span>0 — Stable</span><span style={{ color: '#FFB347' }}>70 — Sévère</span><span style={{ color: '#EF4444' }}>85+ Critique</span>
            </div>
          </div>
        </div>
        {/* 4 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { field: 'Neurologique', score: 28, max: 30, color: '#EF4444', items: ['Status epilepticus J+4','8 crises/24h','GCS 7'] },
            { field: 'Hémodynamique', score: 24, max: 25, color: '#F59E0B', items: ['PAM 114 mmHg','FC 128 bpm','SpO2 94%'] },
            { field: 'Inflammatoire', score: 22, max: 25, color: '#FF6B35', items: ['CRP 187','IL-6 élevée','Fièvre J+4'] },
            { field: 'Thérapeutique', score: 18, max: 20, color: '#8B5CF6', items: ['Phénobarbital','Midazolam','Levetiracetam'] },
          ].map((f,i) => (
            <div key={i} style={{ background: `${f.color}08`, borderRadius: 8, padding: 9, border: `1px solid ${f.color}18` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: f.color }}>{f.field}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: f.color, fontFamily: 'monospace' }}>{f.score}/{f.max}</div>
              </div>
              {f.items.map((it,j) => (
                <div key={j} style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>· {it}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenDiagnostic() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#8B5CF6', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · Diagnostic TDE</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Diagnostic différentiel — 34 paramètres analysés</div>
        {[
          { dx: 'FIRES', pct: 87, color: '#EF4444', detail: 'Fever Induced Refractory Epileptic Encephalopathy' },
          { dx: 'NORSE', pct: 9, color: '#8B5CF6', detail: 'New Onset Refractory Status Epilepticus' },
          { dx: 'Anti-NMDAR', pct: 3, color: '#6C7CFF', detail: 'Encéphalite auto-immune' },
          { dx: 'Méningo-encéphalite', pct: 1, color: '#2FD1C8', detail: 'Infectieux · À écarter' },
        ].map((d,i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: i===0?'rgba(239,68,68,0.07)':'rgba(255,255,255,0.02)', border: `1px solid ${i===0?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.04)'}` }}>
            <div style={{ minWidth: 58, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: d.color, fontFamily: 'monospace' }}>{d.pct}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{d.dx}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{d.detail}</div>
            </div>
            <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
        <div style={{ padding: 10, background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#EF4444', marginBottom: 6 }}>⚠ DÉLAIS DIAGNOSTIQUES IDENTIFIÉS PAR DDD</div>
          {['J-3 : Myalgies non documentées → profil pro-inflammatoire manqué','J+1 : Hypothèse virale maintenue 18h → retard d\'immunothérapie','J+2 : FIRES évoqué tardivement → fenêtre anakinra réduite à 6h'].map((d,i) => (
            <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>✗ {d}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenCascade() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(255,107,53,0.08)', borderBottom: '1px solid rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#FF6B35', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · Alertes CAE</div>
        <div style={{ marginLeft: 8, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', fontSize: 8, fontWeight: 800, color: '#EF4444', fontFamily: 'monospace' }}>14 ALERTES</div>
      </div>
      <div style={{ flex: 1, padding: 10, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          { level: '🔴', type: 'CAE ACTIF', label: 'Cascade cardiorespiratoire imminente', detail: 'MEOPA + midazolam → dépression resp. estimée dans 18 min', engine: 'CAE', time: 'Il y a 4 min' },
          { level: '🔴', type: 'VPS CRITIQUE', label: 'Score > 90 — Intervention immédiate', detail: 'Seuil dépassé depuis 22 minutes · Escalade requise', engine: 'VPS', time: 'Il y a 22 min' },
          { level: '🔴', type: 'STATUS EPI', label: 'Status epilepticus réfractaire J+4', detail: 'Résistance aux benzodiazépines documentée', engine: 'TDE', time: 'Il y a 35 min' },
          { level: '🟠', type: 'HÉMODYNAMIQUE', label: 'PAM 114 mmHg · Hyperpression', detail: 'EWE détecte tendance ascendante sur 2h · Seuil : 110', engine: 'EWE', time: 'Il y a 48 min' },
          { level: '🟠', type: 'FENÊTRE THÉRAP.', label: 'Anakinra — 6h restantes', detail: 'Au-delà, éligibilité chute à 34%. Agir maintenant.', engine: 'TPE', time: 'Il y a 1h' },
        ].map((a,i) => (
          <div key={i} style={{ padding: '9px 11px', borderRadius: 9, background: i<3?'rgba(239,68,68,0.07)':'rgba(245,158,11,0.06)', border: `1px solid ${i<3?'rgba(239,68,68,0.18)':'rgba(245,158,11,0.15)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{a.level}</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: i<3?'#EF4444':'#F59E0B', fontFamily: 'monospace', letterSpacing: 0.5 }}>{a.type}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>{a.time}</span>
              <span style={{ fontSize: 7, fontWeight: 800, color: '#6C7CFF', background: 'rgba(108,124,255,0.1)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>{a.engine}</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{a.label}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{a.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenTraitement() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#10B981', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · Protocoles TPE</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Fenêtre warning */}
        <div style={{ padding: '8px 12px', background: 'rgba(255,107,53,0.08)', borderRadius: 8, border: '1px solid rgba(255,107,53,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>⏱</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#FF6B35' }}>Fenêtre thérapeutique critique</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Anakinra optimal : 6h restantes · Au-delà → efficacité −60%</div>
          </div>
        </div>
        {[
          { drug: 'Anakinra', score: 94, status: 'RECOMMANDÉ', color: '#10B981', posologie: '2–4 mg/kg/j IV', mecanisme: 'IL-1 inhibiteur · Anti-inflammatoire ciblé FIRES', interactions: 0 },
          { drug: 'Tocilizumab', score: 78, status: 'À CONSIDÉRER', color: '#6C7CFF', posologie: '8 mg/kg IV dose unique', mecanisme: 'IL-6 inhibiteur · Si anakinra insuffisant', interactions: 1 },
          { drug: 'Régime cétogène', score: 71, status: 'À CONSIDÉRER', color: '#F59E0B', posologie: 'Ratio 4:1 · Surveillance biologique', mecanisme: 'Neuroprotection métabolique', interactions: 0 },
          { drug: 'Rituximab', score: 42, status: 'DIFFÉRER', color: '#8B5CF6', posologie: 'En attente biomarqueurs B-cell', mecanisme: 'Anti-CD20 · Pas d\'indication immédiate', interactions: 0 },
        ].map((t,i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: `${t.color}07`, border: `1px solid ${t.color}18` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: t.color, fontFamily: 'monospace' }}>{t.score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{t.drug}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{t.posologie}</div>
              </div>
              <span style={{ fontSize: 7, fontWeight: 800, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}25`, padding: '3px 7px', borderRadius: 4, fontFamily: 'monospace' }}>{t.status}</span>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)' }}>{t.mecanisme}</div>
            {t.interactions > 0 && <div style={{ fontSize: 8, color: '#F59E0B', marginTop: 4 }}>⚠ {t.interactions} interaction détectée par PVE</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenOracle() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(232,121,249,0.08)', borderBottom: '1px solid rgba(232,121,249,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#E879F9', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · ORACLE — Simulation</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Simulation prédictive J+30 — 5 scénarios comparés</div>
        {/* Chart */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <svg viewBox="0 0 280 80" style={{ width: '100%', height: 80 }}>
            <line x1="0" y1="75" x2="280" y2="75" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            {['J0','J+7','J+14','J+21','J+30'].map((l,i) => (
              <text key={i} x={i*70} y="80" fontSize="7" fill="rgba(255,255,255,0.2)" textAnchor="middle">{l}</text>
            ))}
            {/* Anakinra - best */}
            <polyline points="0,65 70,52 140,35 210,22 280,14" fill="none" stroke="#10B981" strokeWidth="2.5"/>
            {/* Tocilizumab */}
            <polyline points="0,65 70,55 140,42 210,32 280,24" fill="none" stroke="#6C7CFF" strokeWidth="1.5"/>
            {/* KD */}
            <polyline points="0,65 70,57 140,46 210,37 280,30" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
            {/* No treatment */}
            <polyline points="0,65 70,68 140,70 210,72 280,74" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,3"/>
            {/* Final dot Anakinra */}
            <circle cx="280" cy="14" r="3.5" fill="#10B981"/>
          </svg>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {[['Anakinra','#10B981'],['Tocilizumab','#6C7CFF'],['KD','#F59E0B'],['Sans traitement','#EF4444']].map(([l,c],i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ width: 14, height: 2, background: c as string, borderRadius: 1 }}/>
                {l}
              </div>
            ))}
          </div>
        </div>
        {/* Best scenario result */}
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#10B981', marginBottom: 6 }}>Scénario optimal · Anakinra J+0</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[['VPS J+30','18','#10B981'],['Récupération','73%','#10B981'],['Séquelles','Faibles','#F59E0B']].map(([l,v,c],i) => (
              <div key={i} style={{ textAlign: 'center', padding: 6, background: `${c}08`, borderRadius: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: c as string, fontFamily: 'monospace' }}>{v}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenDiscovery() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(47,209,200,0.08)', borderBottom: '1px solid rgba(47,209,200,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#2FD1C8', fontWeight: 700, fontFamily: 'monospace' }}>Discovery Engine · Recherche</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ padding: '8px 12px', background: 'rgba(47,209,200,0.06)', borderRadius: 8, border: '1px solid rgba(47,209,200,0.15)', fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
          Les données anonymisées d'Inès enrichissent la base de 847 patients FIRES dans 12 pays. <span style={{ color: '#2FD1C8', fontWeight: 700 }}>Chaque enfant traité améliore le suivant.</span>
        </div>
        {[
          { n: 'L1', label: 'PatternMiner', color: '#6C7CFF', result: '12 patterns détectés · Cluster FIRES inflammatoire confirmé', badge: '12 patterns', detail: 'Pearson 34 params · k-means k=3 · z-score 2.5σ' },
          { n: 'L2', label: 'LiteratureScanner', color: '#2FD1C8', result: '47 publications pertinentes · 3 essais NCT actifs trouvés', badge: '47 refs', detail: 'PubMed live · ClinicalTrials.gov · Veille temps réel' },
          { n: 'L3', label: 'HypothesisEngine', color: '#10B981', result: 'Hypothèse : Sur-activation IL-1β précoce comme marqueur FIRES', badge: '3 hyp.', detail: 'Claude API · Validation workflow · Peer review IA' },
          { n: 'L4', label: 'TreatmentPathfinder', color: '#F59E0B', result: 'Anakinra précoce J0 corrèle avec récupération à 73% à J+30', badge: 'actif', detail: 'Scoring éligibilité · Fenêtres thérap. · Essais NCT' },
        ].map((l,i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: `${l.color}07`, border: `1px solid ${l.color}15` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: `${l.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: l.color, fontFamily: 'monospace' }}>{l.n}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{l.label}</div>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: l.color, background: `${l.color}15`, border: `1px solid ${l.color}25`, padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace' }}>{l.badge}</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>→ {l.result}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{l.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenBrain() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(255,107,53,0.08)', borderBottom: '1px solid rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#FF6B35', fontWeight: 700, fontFamily: 'monospace' }}>Inès M. · NeuroCore — Carte cérébrale</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Brain illustration */}
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,107,53,0.2)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(108,124,255,0.2)' }}>
            <img src="/assets/illustrations/PULSAR_BRAIN_NORMAL_VS_FIRES.png" alt="Cerveau FIRES" />
          </div>
          <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 9px', borderRadius: 5, background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,107,53,0.3)', fontSize: 8, fontWeight: 800, color: '#FF6B35', fontFamily: 'monospace' }}>PULSAR NEUROCORE · FIRES J+4</div>
        </div>
        {/* Heatmap zones */}
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>ZONES D'INFLAMMATION DÉTECTÉES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { zone: 'Cortex temporal bilatéral', level: 94, color: '#EF4444', status: 'CRITIQUE' },
            { zone: 'Hippocampe gauche', level: 78, color: '#FF6B35', status: 'SÉVÈRE' },
            { zone: 'Thalamus', level: 61, color: '#F59E0B', status: 'MODÉRÉ' },
            { zone: 'Cortex frontal', level: 38, color: '#6C7CFF', status: 'SURVEILLÉ' },
          ].map((z, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 7, background: `${z.color}08`, border: `1px solid ${z.color}18` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{z.zone}</div>
              </div>
              <div style={{ width: 70, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${z.level}%`, height: '100%', background: z.color, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: z.color, fontFamily: 'monospace', minWidth: 32, textAlign: 'right' }}>{z.level}%</span>
              <span style={{ fontSize: 7, color: z.color, background: `${z.color}12`, border: `1px solid ${z.color}20`, padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontWeight: 700 }}>{z.status}</span>
            </div>
          ))}
        </div>
        {/* BBB */}
        <div style={{ padding: '8px 12px', background: 'rgba(139,92,246,0.07)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.15)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#8B5CF6', marginBottom: 4 }}>BARRIÈRE HÉMATO-ENCÉPHALIQUE</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Perméabilité estimée : <span style={{ color: '#EF4444', fontWeight: 700 }}>+340% vs norme</span> · Infiltration lymphocytaire détectée</div>
        </div>
      </div>
    </div>
  )
}


function ScreenVisualPhysio() {
  const [tick, setTick] = React.useState(0)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Canvas: supprime les pixels gris du fond
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = data.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2]
        const avg = (r + g + b) / 3
        const diff = Math.max(Math.abs(r-g), Math.abs(r-b), Math.abs(g-b))
        // Supprime fond blanc, gris clair et gris moyen (faible saturation)
        if (diff < 40 && avg > 40) {
          // Fondu progressif : plus le pixel est clair, plus il devient transparent
          const alpha = avg > 160 ? 0 : Math.round(((160 - avg) / 120) * 255)
          d[i+3] = alpha
        }
      }
      ctx.putImageData(data, 0, 0)
    }
    img.src = '/assets/avatars/body-girl.jpg'
  }, [])

  React.useEffect(() => {
    const t = setInterval(() => setTick((x: number) => x + 1), 1200)
    return () => clearInterval(t)
  }, [])
  const zones = [
    { label: 'NEURO', icon: '🧠', x: 48, y: 18, color: '#EF4444', level: 2 },
    { label: 'CARDIO', icon: '❤️', x: 48, y: 42, color: '#FF6B35', level: 2 },
    { label: 'RESP', icon: '🫁', x: 48, y: 55, color: '#F59E0B', level: 1 },
    { label: 'INFLAM', icon: '🔥', x: 75, y: 38, color: '#EF4444', level: 2 },
    { label: 'TEMP', icon: '🌡', x: 75, y: 52, color: '#10B981', level: 0 },
  ]
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 36, background: "rgba(108,124,255,0.08)", borderBottom: "1px solid rgba(108,124,255,0.15)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "#6C7CFF", fontFamily: "monospace" }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/</div>
        <div style={{ fontSize: 9, color: "#B96BFF", fontWeight: 700, fontFamily: "monospace" }}>Inès M. · Visual Physiology System</div>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel */}
        <div style={{ width: 130, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 7, borderRight: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { l: "NEURO", ic: "🧠", c: "#EF4444", dots: [2,2] },
            { l: "CARDIO", ic: "❤️", c: "#FF6B35", dots: [2,2] },
            { l: "RESP", ic: "🫁", c: "#F59E0B", dots: [1,2] },
          ].map((z, i) => (
            <div key={i} style={{ padding: "7px 10px", borderRadius: 8, background: `${z.c}10`, border: `1px solid ${z.c}22`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>{z.ic}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: z.c, fontFamily: "monospace", flex: 1 }}>{z.l}</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: j <= z.dots[0] ? z.c : "rgba(255,255,255,0.1)", boxShadow: j <= z.dots[0] ? `0 0 5px ${z.c}` : "none", transition: "all 0.4s" }} />)}
              </div>
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "8px 10px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontSize: 8, color: "#EF4444", fontWeight: 800, marginBottom: 4 }}>VPS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#EF4444", fontFamily: "monospace" }}>92</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>CRITIQUE</div>
          </div>
        </div>
        {/* Center: patient silhouette */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
          <div style={{ position: "relative", height: "100%", maxHeight: 280 }}>
            <canvas ref={canvasRef} style={{ display: 'block', height: '100%', maxHeight: 280, width: 'auto' }} />
            {/* Hotspots */}
            {[
              { top: "12%", left: "48%", c: "#EF4444" },
              { top: "38%", left: "44%", c: "#FF6B35" },
              { top: "52%", left: "52%", c: "#F59E0B" },
            ].map((h, i) => (
              <div key={i} style={{ position: "absolute", top: h.top, left: h.left, transform: "translate(-50%,-50%)" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: `${h.c}30`, border: `2px solid ${h.c}`, boxShadow: `0 0 ${tick % 2 === 0 ? 10 : 16}px ${h.c}`, transition: "box-shadow 0.4s" }} />
              </div>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div style={{ width: 120, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 7, borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { l: "INFLAM", ic: "🔥", c: "#EF4444", dots: [2,2] },
            { l: "TEMP", ic: "🌡", c: "#10B981", dots: [0,2] },
          ].map((z, i) => (
            <div key={i} style={{ padding: "7px 10px", borderRadius: 8, background: `${z.c}10`, border: `1px solid ${z.c}22`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>{z.ic}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: z.c, fontFamily: "monospace", flex: 1 }}>{z.l}</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: j <= z.dots[0] ? z.c : "rgba(255,255,255,0.1)", boxShadow: j <= z.dots[0] ? `0 0 5px ${z.c}` : "none" }} />)}
              </div>
            </div>
          ))}
          {/* EEG mini */}
          <div style={{ marginTop: "auto", padding: "8px 10px", borderRadius: 8, background: "rgba(108,124,255,0.08)", border: "1px solid rgba(108,124,255,0.2)" }}>
            <div style={{ fontSize: 8, color: "#6C7CFF", fontWeight: 700, marginBottom: 4, fontFamily: "monospace" }}>EEG</div>
            <svg viewBox="0 0 80 20" style={{ width: "100%", height: 20 }}>
              <polyline points="0,10 8,10 10,2 12,18 14,10 22,10 24,4 26,16 28,10 36,10 38,3 40,17 42,10 50,10 52,5 54,15 56,10 64,10 66,2 68,18 70,10 78,10 80,10" fill="none" stroke="#EF4444" strokeWidth="1.2" opacity="0.8"/>
            </svg>
            <div style={{ fontSize: 7, color: "#EF4444", fontWeight: 700 }}>SEIZURE</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenIRM() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ height: 36, background: "rgba(47,209,200,0.08)", borderBottom: "1px solid rgba(47,209,200,0.15)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "#6C7CFF", fontFamily: "monospace" }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/</div>
        <div style={{ fontSize: 9, color: "#2FD1C8", fontWeight: 700, fontFamily: "monospace" }}>Inès M. · Cartographie cérébrale</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* BBB illustration */}
        <div className="pulsar-illus-wrap" style={{ border: "1px solid rgba(47,209,200,0.25)" }}>
          <img src="/assets/illustrations/PULSAR_IRM_FIRES.png" alt="IRM cérébrale FIRES — 4 séquences" />
        </div>
        {/* Brain zones heatmap */}
        <div style={{ padding: "10px 12px", background: "rgba(47,209,200,0.06)", borderRadius: 9, border: "1px solid rgba(47,209,200,0.15)" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#2FD1C8", marginBottom: 8, letterSpacing: 1 }}>CARTOGRAPHIE — ZONES INFLAMMATOIRES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { z: "Temporal G", v: 94, c: "#EF4444" },
              { z: "Temporal D", v: 89, c: "#EF4444" },
              { z: "Hippocampe", v: 78, c: "#FF6B35" },
              { z: "Thalamus", v: 61, c: "#F59E0B" },
              { z: "Frontal", v: 38, c: "#6C7CFF" },
              { z: "Occipital", v: 12, c: "#10B981" },
            ].map((z, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", minWidth: 62 }}>{z.z}</div>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${z.v}%`, height: "100%", background: z.c, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 8, color: z.c, fontFamily: "monospace", minWidth: 24, textAlign: "right", fontWeight: 700 }}>{z.v}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenTimeline() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, fontFamily: 'monospace' }}>DDD · Chronologie FIRES</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Le moteur DDD reconstruit chaque heure. Chaque délai évitable est identifié.</div>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <img src="/assets/illustrations/PULSAR_FIRES_TIMELINE.png" alt="Timeline FIRES" />
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 9, border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#EF4444', marginBottom: 6 }}>3 FENÊTRES THÉRAPEUTIQUES MANQUÉES</div>
          {['J-3 : Signal pro-inflammatoire précoce non capturé','J0→J+1 : Diagnostic différentiel FIRES retardé 18h','J+2 : Anakinra initié après fermeture de la fenêtre optimale'].map((t,i) => (
            <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 4, display: 'flex', gap: 6 }}>
              <span style={{ color: '#EF4444' }}>✗</span>{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenNeuron() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(185,107,255,0.08)', borderBottom: '1px solid rgba(185,107,255,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#B96BFF', fontWeight: 700, fontFamily: 'monospace' }}>NeuroCore · Ce que FIRES fait aux neurones</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(185,107,255,0.2)' }}>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(108,124,255,0.2)' }}>
            <img src="/assets/illustrations/PULSAR_NEURON_FIRES.png" alt="Neurones FIRES" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: 'Activité épileptique', v: '8 crises/24h', c: '#EF4444' },
            { l: 'Inflammation IL-1β', v: '+420%', c: '#FF6B35' },
            { l: 'Perméabilité BBB', v: '+340%', c: '#B96BFF' },
            { l: 'Mort neuronale', v: 'Zone critique', c: '#F59E0B' },
          ].map((s,i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: `${s.c}08`, border: `1px solid ${s.c}18` }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: 'monospace' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenAnakinra() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#10B981', fontWeight: 700, fontFamily: 'monospace' }}>TPE · Mécanisme Anakinra — Score 94/100</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
            <img src="/assets/illustrations/PULSAR_ANAKINRA_MECHANISM.png" alt="Mécanisme Anakinra" />
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.07)', borderRadius: 9, border: '1px solid rgba(16,185,129,0.18)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#10B981', marginBottom: 6 }}>PULSAR RECOMMANDE · Anakinra · Score 94</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Inhibiteur IL-1 · Bloque la cascade inflammatoire à la source · 2–4 mg/kg/j IV · <span style={{ color: '#FF6B35', fontWeight: 700 }}>Fenêtre : 6h restantes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenGutBrain() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ height: 36, background: 'rgba(47,209,200,0.08)', borderBottom: '1px solid rgba(47,209,200,0.15)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#6C7CFF', fontFamily: 'monospace' }}>✦ PULSAR</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/</div>
        <div style={{ fontSize: 9, color: '#2FD1C8', fontWeight: 700, fontFamily: 'monospace' }}>Discovery · Axe intestin-cerveau</div>
      </div>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(47,209,200,0.2)' }}>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(47,209,200,0.2)' }}>
            <img src="/assets/illustrations/PULSAR_GUT_BRAIN_AXIS.png" alt="Axe intestin-cerveau" />
          </div>
          <div className="pulsar-illus-wrap" style={{ border: '1px solid rgba(255,107,53,0.25)', marginTop: 8 }}>
            <img src="/assets/illustrations/PULSAR_INTESTINAL_BARRIER.png" alt="Barrière intestinale — Leaky Gut FIRES" />
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(47,209,200,0.06)', borderRadius: 9, border: '1px solid rgba(47,209,200,0.15)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#2FD1C8', marginBottom: 5 }}>HYPOTHÈSE DISCOVERY ENGINE L3</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Dysbiose intestinale détectée J-7 corrèle avec l'activation microgliale. Nouvelle piste thérapeutique identifiée dans 3 études NCT actives.
          </div>
        </div>
      </div>
    </div>
  )
}

const UI_MAP: Record<string, () => JSX.Element> = {
  admission: ScreenAdmission,
  vps: ScreenVPS,
  physio: ScreenVisualPhysio,
  neuron: ScreenNeuron,
  diagnostic: ScreenDiagnostic,
  timeline: ScreenTimeline,
  brain: ScreenBrain,
  irm: ScreenIRM,
  cascade: ScreenCascade,
  traitement: ScreenTraitement,
  anakinra: ScreenAnakinra,
  oracle: ScreenOracle,
  gutbrain: ScreenGutBrain,
  discovery: ScreenDiscovery,
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────

interface DemoPlayerProps {
  open: boolean
  onClose: () => void
}

export default function DemoPlayer({ open, onClose }: DemoPlayerProps) {
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const DURATION = 7000

  const goTo = useCallback((n: number) => {
    setScene(n)
    setProgress(0)
    setPlaying(true)
  }, [])

  const next = useCallback(() => {
    setScene(s => {
      const n = s < SCENES.length - 1 ? s + 1 : 0
      setProgress(0)
      return n
    })
  }, [])

  // Autoplay + progress bar
  useEffect(() => {
    if (!open || !playing) { 
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
      return 
    }
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0 }
        return p + (100 / (DURATION / 50))
      })
    }, 50)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [open, playing, scene, next])

  useEffect(() => {
    if (open) { setScene(0); setProgress(0); setPlaying(true) }
  }, [open])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') { next() }
      if (e.key === 'ArrowLeft') { setScene(s => Math.max(0, s-1)); setProgress(0) }
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
    }
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose, next])

  if (!open) return null

  const cur = SCENES[scene]
  const UIScreen = UI_MAP[cur.ui]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }} />

      <div className="demo-modal" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9999,
        width: '96%', maxWidth: 860,
        maxHeight: '90vh',
        background: '#0A0D1A',
        border: `1px solid ${cur.color}25`,
        borderRadius: 18,
        boxShadow: `0 40px 100px rgba(0,0,0,0.85), 0 0 60px ${cur.color}12`,
        display: 'flex',
        overflow: 'hidden',
        animation: 'demoIn .3s cubic-bezier(.22,1,.36,1)',
      }}>

        {/* ── LEFT: Narration panel ── */}
        <div className="demo-narration" style={{
          width: 280, flexShrink: 0,
          background: 'rgba(0,0,0,0.4)',
          borderRight: `1px solid ${cur.color}15`,
          display: 'flex', flexDirection: 'column',
          padding: 0,
        }}>
          {/* Header */}
          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cur.color, boxShadow: `0 0 12px ${cur.color}` }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: cur.color, fontFamily: 'monospace', letterSpacing: 2 }}>
                {cur.chapterN} / {String(SCENES.length).padStart(2,'0')}
              </span>
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: cur.color, fontFamily: 'monospace', letterSpacing: 3, marginBottom: 8 }}>
              {cur.chapter.toUpperCase()}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.35, marginBottom: 14 }}>
              {cur.headline}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
              {cur.narration}
            </div>
          </div>

          {/* Chapters list */}
          <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
            {SCENES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8,
                background: i === scene ? `${s.color}14` : 'transparent',
                border: `1px solid ${i === scene ? `${s.color}25` : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: i <= scene ? s.color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                <div style={{ fontSize: 9, fontWeight: i === scene ? 700 : 400, color: i === scene ? s.color : i < scene ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)' }}>
                  {s.chapter}
                </div>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => { setScene(s => Math.max(0,s-1)); setProgress(0) }}
                style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11 }}>←</button>
              <button onClick={() => setPlaying(p => !p)}
                style={{ flex: 1, padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 11 }}>
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
              <button onClick={() => { if (scene < SCENES.length-1) { next() } else onClose() }}
                style={{ padding: '6px 10px', borderRadius: 7, border: 'none', background: cur.color, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                {scene < SCENES.length-1 ? '→' : '✓'}
              </button>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: 8 }}>← → espace · ESC pour fermer</div>
          </div>
        </div>

        {/* ── RIGHT: UI Screen ── */}
        <div className="demo-ui-screen" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${cur.color}, ${cur.color}80)`, transition: 'width 0.05s linear' }} />
          </div>
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 10px 0', flexShrink: 0 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 6px' }}>×</button>
          </div>
          {/* Screen */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <UIScreen />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes demoIn { from { opacity:0; transform:translate(-50%,-50%) scale(.96) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes load { 0%{width:20%} 50%{width:85%} 100%{width:20%} }
        @media (max-width: 640px) {
          .demo-modal {
            top: 0 !important; left: 0 !important;
            transform: none !important;
            width: 100% !important; max-width: 100% !important;
            max-height: 100% !important; height: 100% !important;
            border-radius: 0 !important;
            animation: demoInMobile .3s cubic-bezier(.22,1,.36,1) !important;
          }
          @keyframes demoInMobile { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
          .demo-narration { width: 100% !important; }
          .demo-ui-screen { display: none !important; }
        }
      `}</style>
    </>
  )
}
