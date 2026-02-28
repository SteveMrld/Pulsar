'use client'
import Picto from '@/components/Picto';
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

export default function SynthesePage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => { const p = new PatientState(DEMO_PATIENTS[scenario].data); runPipeline(p); return p }, [scenario])
  const toggle = (id: string) => setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const vps = ps.vpsResult!, tde = ps.tdeResult!, pve = ps.pveResult!
  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)' }

  function Section({ id, title, icon, color, children }: { id: string; title: string; icon: string; color: string; children: React.ReactNode }) {
    const isOpen = !collapsed.has(id)
    return (
      <div className="glass-card" style={card}>
        <button onClick={() => toggle(id)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text)', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Picto name={icon} size={20} glow glowColor={color} />
            <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color }}>{title}</span>
          </div>
          <span style={{ color: 'var(--p-text-dim)', transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
        </button>
        {isOpen && <div style={{ marginTop: 'var(--p-space-4)' }}>{children}</div>}
      </div>
    )
  }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="clipboard" size={36} glow />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Synthèse globale</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-pve)', fontFamily: 'var(--p-font-mono)' }}>Phase 5 — Vue consolidée du dossier</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-lg)', border: scenario === k ? '2px solid var(--p-pve)' : 'var(--p-border)', background: scenario === k ? 'var(--p-pve-dim)' : 'var(--p-bg-elevated)', color: scenario === k ? 'var(--p-pve)' : 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>

      {/* Patient Header */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, borderLeft: '4px solid var(--p-vps)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800 }}>{DEMO_PATIENTS[scenario].label}</div>
            <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
              {Math.round(ps.ageMonths / 12)} ans · {ps.weightKg} kg · J{ps.hospDay} d'hospitalisation · GCS {ps.neuro.gcs}/15
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { n: 'VPS', s: vps.synthesis.score, c: 'var(--p-vps)' },
              { n: 'TDE', s: tde.synthesis.score, c: 'var(--p-tde)' },
              { n: 'PVE', s: pve.synthesis.score, c: 'var(--p-pve)' },
            ].map(e => (
              <div key={e.n} style={{ textAlign: 'center', padding: '6px 14px', borderRadius: 'var(--p-radius-lg)', background: `${e.c}10`, border: `1px solid ${e.c}30` }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{e.n}</div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: 'var(--p-text-lg)', color: e.c }}>{e.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Diagnostic */}
      <Section id="diag" title="Diagnostic" icon="dna" color="var(--p-tde)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {tde.intention.patterns.filter(p => p.confidence > 0.3).map((p, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 'var(--p-radius-md)', background: p.confidence >= 0.7 ? 'var(--p-critical-bg)' : 'var(--p-bg-elevated)', borderLeft: `3px solid ${p.confidence >= 0.7 ? 'var(--p-critical)' : 'var(--p-warning)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: p.confidence >= 0.7 ? 'var(--p-critical)' : 'var(--p-warning)' }}>{Math.round(p.confidence * 100)}%</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.description}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--p-text-muted)' }}>
          <strong>Niveau TDE :</strong> {tde.synthesis.level} · <strong>Score :</strong> {tde.synthesis.score}/100
        </div>
      </Section>

      {/* Section 2: Pronostic vital */}
      <Section id="vps" title="Pronostic vital" icon="brain" color="var(--p-vps)">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {vps.intention.fields.map((f, i) => (
            <div key={i} style={{ flex: '1 1 150px', padding: '8px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{f.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: f.color }}>{f.intensity}%</span>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--p-dark-4)' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: f.color, width: `${f.intensity}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--p-text-muted)' }}>
          <strong>Score VPS :</strong> {vps.synthesis.score}/100 — <strong>{vps.synthesis.level}</strong> · Contexte ×{vps.context.contextModifier.toFixed(2)}
        </div>
      </Section>

      {/* Section 3: Traitements */}
      <Section id="tx" title="Traitements en cours" icon="pill" color="var(--p-ewe)">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {ps.drugs.map((d, i) => (
            <span key={i} style={{ padding: '4px 12px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)', fontSize: '12px', fontWeight: 500 }}>{d.name}</span>
          ))}
        </div>
        {ps.treatmentHistory.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: '6px' }}>HISTORIQUE</div>
            {ps.treatmentHistory.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.response === 'none' ? 'var(--p-critical)' : t.response === 'partial' ? 'var(--p-warning)' : 'var(--p-success)' }} />
                <span>{t.treatment}</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{t.response}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Section 4: Pharmacovigilance */}
      <Section id="pve" title="Pharmacovigilance" icon="shield" color="var(--p-pve)">
        <div style={{ fontSize: '12px', marginBottom: '8px' }}><strong>Score PVE :</strong> {pve.synthesis.score}/100 — {pve.synthesis.level}</div>
        {pve.synthesis.alerts.length > 0 ? pve.synthesis.alerts.map((a, i) => (
          <div key={i} style={{ padding: '6px 12px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: 'var(--p-bg-elevated)', fontSize: '12px' }}>
            <strong>{a.title}</strong> — <span style={{ color: 'var(--p-text-dim)' }}>{a.body}</span>
          </div>
        )) : <div style={{ fontSize: '12px', color: 'var(--p-success)' }}>Aucune interaction détectée</div>}
      </Section>

      {/* Section 5: Alertes */}
      <Section id="alerts" title={`Alertes (${ps.alerts.length})`} icon="warning" color="var(--p-warning)">
        {ps.alerts.length > 0 ? ps.alerts.slice(0, 10).map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', marginBottom: '4px', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: 'var(--p-bg-elevated)', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, flex: 1 }}>{a.title}</span>
            <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.source}</span>
          </div>
        )) : <div style={{ color: 'var(--p-success)', fontSize: '12px' }}>Aucune alerte active</div>}
      </Section>

      {/* Section 6: Recommandations */}
      <Section id="reco" title={`Recommandations (${ps.recommendations.length})`} icon="clipboard" color="var(--p-info)">
        {ps.recommendations.length > 0 ? ps.recommendations.map((r, i) => (
          <div key={i} style={{ padding: '8px 12px', marginBottom: '6px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ padding: '1px 8px', borderRadius: 'var(--p-radius-full)', background: r.priority === 'urgent' ? 'var(--p-critical)' : r.priority === 'high' ? 'var(--p-warning)' : 'var(--p-info)', color: '#fff', fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>{r.priority}</span>
              <span style={{ fontWeight: 600, fontSize: '12px' }}>{r.title}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>{r.body}</div>
            {r.reference && <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginTop: '2px' }}>Réf: {r.reference}</div>}
          </div>
        )) : <div style={{ color: 'var(--p-text-dim)', fontSize: '12px' }}>Aucune recommandation</div>}
      </Section>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>PULSAR V15 — Synthèse globale · Ne se substitue pas au jugement clinique</div>
    </div>
  )
}
