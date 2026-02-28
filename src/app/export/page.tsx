'use client'
import Picto from '@/components/Picto'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

export default function ExportPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [sections, setSections] = useState({ identity: true, scores: true, diagnostic: true, treatments: true, pharmacovigilance: true, alerts: true, recommendations: true, timeline: true })
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => { const p = new PatientState(DEMO_PATIENTS[scenario].data); runPipeline(p); return p }, [scenario])
  const vps = ps.vpsResult!, tde = ps.tdeResult!, pve = ps.pveResult!

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)' }

  const handlePrint = () => {
    const el = document.getElementById('export-preview')
    if (!el) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>PULSAR V15 — Rapport ${DEMO_PATIENTS[scenario].label}</title><style>
      body{font-family:Inter,system-ui,sans-serif;color:#1a1a2e;padding:32px;max-width:800px;margin:0 auto;font-size:12px;line-height:1.5}
      h1{font-size:18px;border-bottom:2px solid #6C7CFF;padding-bottom:8px;margin-bottom:16px}
      h2{font-size:14px;color:#6C7CFF;margin:16px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px}
      .score-box{display:inline-block;padding:4px 12px;border-radius:6px;font-weight:700;font-family:monospace;margin:2px 4px}
      .alert{padding:6px 12px;border-left:3px solid #FF4757;margin:4px 0;background:#fff5f5;border-radius:4px}
      .alert.warning{border-color:#FFA502;background:#fff8e8}
      .reco{padding:6px 12px;margin:4px 0;background:#f8f9fa;border-radius:4px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      td,th{padding:4px 8px;border:1px solid #eee;text-align:left;font-size:11px}
      th{background:#f8f9fa;font-weight:600}
      .footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#666}
    </style></head><body>`)
    w.document.write(el.innerHTML)
    w.document.write(`<div class="footer">PULSAR V15 © 2026 — Outil d'aide à la décision. Ne se substitue pas au jugement clinique.<br>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>`)
    w.document.write('</body></html>')
    w.document.close()
    setTimeout(() => { w.print() }, 300)
  }

  const handleCSV = () => {
    const rows = [
      ['Paramètre', 'Valeur'],
      ['Patient', DEMO_PATIENTS[scenario].label],
      ['Âge (mois)', String(ps.ageMonths)],
      ['Poids (kg)', String(ps.weightKg)],
      ['Jour hospitalisation', String(ps.hospDay)],
      ['GCS', String(ps.neuro.gcs)],
      ['Crises/24h', String(ps.neuro.seizures24h)],
      ['CRP', String(ps.biology.crp)],
      ['Ferritine', String(ps.biology.ferritin)],
      ['VPS Score', String(vps.synthesis.score)],
      ['VPS Niveau', vps.synthesis.level],
      ['TDE Score', String(tde.synthesis.score)],
      ['TDE Niveau', tde.synthesis.level],
      ['PVE Score', String(pve.synthesis.score)],
      ['PVE Niveau', pve.synthesis.level],
      ['Nb médicaments', String(ps.drugs.length)],
      ['Nb alertes', String(ps.alerts.length)],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `pulsar_${scenario.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="brain" size={40} glow glowColor="#FFB347" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Export PDF / Expert</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-tpe)', fontFamily: 'var(--p-font-mono)' }}>Phase 5 — Rapport pour centre de référence</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} style={{ padding: '6px 16px', borderRadius: 'var(--p-radius-lg)', border: scenario === k ? '2px solid var(--p-tpe)' : 'var(--p-border)', background: scenario === k ? 'var(--p-tpe-dim)' : 'var(--p-bg-elevated)', color: scenario === k ? 'var(--p-tpe)' : 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer' }}>{v.label}</button>
        ))}
      </div>

      {/* Section Selector + Actions */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>SECTIONS À INCLURE</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.entries(sections).map(([k, v]) => (
              <button key={k} onClick={() => setSections(prev => ({ ...prev, [k]: !prev[k as keyof typeof prev] }))} style={{
                padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
                background: v ? 'var(--p-tpe-dim)' : 'var(--p-bg-elevated)',
                border: v ? '1px solid var(--p-tpe)' : 'var(--p-border)',
                color: v ? 'var(--p-tpe)' : 'var(--p-text-dim)',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              }}>{v ? '✓ ' : ''}{k.charAt(0).toUpperCase() + k.slice(1)}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrint} style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-tpe)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>📄 Imprimer / PDF</button>
          <button onClick={handleCSV} style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', border: 'var(--p-border)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Export CSV</button>
        </div>
      </div>

      {/* Preview */}
      <div id="export-preview" className={`glass-card ${mounted ? 'animate-in stagger-1' : ''}`} style={{ ...card, background: 'var(--p-bg-elevated)' }}>
        <h1 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 800, borderBottom: '2px solid var(--p-vps)', paddingBottom: '8px', marginBottom: '16px' }}>
          PULSAR V15 — Rapport clinique
        </h1>

        {sections.identity && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px' }}>1. Identité patient</h2>
            <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
              <strong>Patient :</strong> {DEMO_PATIENTS[scenario].label} · <strong>Âge :</strong> {Math.round(ps.ageMonths / 12)} ans · <strong>Poids :</strong> {ps.weightKg} kg · <strong>Jour :</strong> J{ps.hospDay} · <strong>GCS :</strong> {ps.neuro.gcs}/15
            </div>
          </>
        )}

        {sections.scores && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>2. Scores moteurs</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[{ n: 'VPS', s: vps.synthesis.score, l: vps.synthesis.level, c: 'var(--p-vps)' }, { n: 'TDE', s: tde.synthesis.score, l: tde.synthesis.level, c: 'var(--p-tde)' }, { n: 'PVE', s: pve.synthesis.score, l: pve.synthesis.level, c: 'var(--p-pve)' }].map(e => (
                <span key={e.n} style={{ padding: '4px 14px', borderRadius: '6px', background: `${e.c}10`, fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px', color: e.c }}>{e.n}: {e.s}/100 — {e.l}</span>
              ))}
            </div>
          </>
        )}

        {sections.diagnostic && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>3. Diagnostic</h2>
            {tde.intention.patterns.filter(p => p.confidence > 0.3).map((p, i) => (
              <div key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>• <strong>{p.name}</strong> — confiance {Math.round(p.confidence * 100)}% : {p.description}</div>
            ))}
          </>
        )}

        {sections.treatments && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>4. Traitements</h2>
            <div style={{ fontSize: '12px' }}><strong>Actifs :</strong> {ps.drugs.map(d => d.name).join(', ')}</div>
            {ps.treatmentHistory.length > 0 && <div style={{ fontSize: '12px', marginTop: '4px' }}><strong>Historique :</strong> {ps.treatmentHistory.map(t => `${t.treatment} (${t.response})`).join(', ')}</div>}
          </>
        )}

        {sections.pharmacovigilance && pve.synthesis.alerts.length > 0 && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>5. Pharmacovigilance</h2>
            {pve.synthesis.alerts.map((a, i) => (
              <div key={i} style={{ fontSize: '12px', padding: '4px 10px', marginBottom: '4px', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`, background: 'var(--p-bg-elevated)', borderRadius: '4px' }}>
                <strong>{a.title}</strong> — {a.body}
              </div>
            ))}
          </>
        )}

        {sections.alerts && ps.alerts.length > 0 && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>6. Alertes</h2>
            {ps.alerts.slice(0, 8).map((a, i) => (
              <div key={i} style={{ fontSize: '12px', marginBottom: '2px' }}>• [{a.severity}] {a.title} — {a.body} ({a.source})</div>
            ))}
          </>
        )}

        {sections.recommendations && ps.recommendations.length > 0 && (
          <>
            <h2 style={{ fontSize: '13px', color: 'var(--p-vps)', borderBottom: '1px solid var(--p-dark-4)', paddingBottom: '4px', marginTop: '16px' }}>7. Recommandations</h2>
            {ps.recommendations.map((r, i) => (
              <div key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>• [{r.priority}] <strong>{r.title}</strong> — {r.body} {r.reference && `(${r.reference})`}</div>
            ))}
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>PULSAR V15 — Export · Ne se substitue pas au jugement clinique</div>
    </div>
  )
}
