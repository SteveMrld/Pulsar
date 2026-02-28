'use client'
import { useState, useMemo, useEffect } from 'react'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

type LogEntry = {
  id: number; time: string; day: number; user: string; role: string
  action: string; module: string; icon: string; color: string; detail: string; severity: 'info' | 'warning' | 'critical'
}

function generateAuditLog(ps: PatientState): LogEntry[] {
  const log: LogEntry[] = []
  let id = 1
  const add = (day: number, time: string, user: string, role: string, action: string, module: string, icon: string, color: string, detail: string, severity: 'info' | 'warning' | 'critical') => {
    log.push({ id: id++, day, time, user, role, action, module, icon, color, detail, severity })
  }

  // J0 — Admission
  const age = ps.ageMonths < 24 ? `${ps.ageMonths} mois` : `${Math.floor(ps.ageMonths / 12)} ans`
  add(0, '08:02', 'Dr. Martin', 'Urgentiste', 'Admission patient', 'Admission', 'clipboard', 'var(--p-vps)',
    `Création dossier — ${ps.sex === 'male' ? 'Garçon' : 'Fille'}, ${age}, ${ps.weightKg}kg, T° ${ps.hemodynamics.temp}°C, GCS ${ps.neuro.gcs}`, 'info')

  add(0, '08:05', 'PULSAR', 'Système', 'Pipeline initialisé', 'VPS', 'brain', 'var(--p-vps)',
    '5 moteurs activés — VPS+TDE+PVE+EWE+TPE, couche 1 chargée', 'info')

  // Bilan biologique
  add(0, '08:15', 'IDE Dupont', 'Infirmier', 'Bilan lancé', 'Bilan', 'microscope', 'var(--p-pve)',
    `NFS, CRP (${ps.biology.crp}), PCT (${ps.biology.pct}), ferritine (${ps.biology.ferritin}), iono, lactates`, 'info')

  // Neurological alerts
  if (ps.neuro.seizures24h > 0) {
    add(0, '09:30', 'PULSAR', 'Système', 'ALERTE CRITIQUE', 'VPS', 'alert', 'var(--p-critical)',
      `${ps.neuro.seizures24h} crise(s) détectée(s) — type: ${ps.neuro.seizureType}, GCS ${ps.neuro.gcs}`, 'critical')
  }

  // Drugs administered
  ps.drugs.forEach((d, i) => {
    add(0, `09:${32 + i * 5}`, 'Dr. Martin', 'Urgentiste', 'Traitement administré', 'Urgence', 'pill', 'var(--p-ewe)',
      `${d.name} ${d.dose || ''} — ${d.route || 'IV'}`, 'warning')
  })

  // PVE check
  if (ps.pveResult) {
    const interactions = ps.pveResult.rules.find(r => r.adjustment?.detectedInteractions)
    add(0, '10:05', 'PULSAR', 'Système', 'PVE — Vérification', 'PVE', 'shield', 'var(--p-pve)',
      interactions ? `${(interactions.adjustment!.detectedInteractions as any[]).length} interaction(s) détectée(s)` : `Aucune interaction critique détectée — ${ps.drugs.length} médicaments vérifiés`, 'info')
  }

  // Biology results
  add(0, '14:00', 'Labo', 'Biologie', 'Résultats reçus', 'Bilan', 'blood', 'var(--p-tde)',
    `CRP ${ps.biology.crp} mg/L, PCT ${ps.biology.pct} ng/mL, ferritine ${ps.biology.ferritin} µg/L`, 'info')

  // TDE hypothesis
  if (ps.tdeResult) {
    add(0, '14:02', 'PULSAR', 'Système', 'TDE — Hypothèse', 'TDE', 'dna', 'var(--p-tde)',
      `${ps.tdeResult.synthesis.level} — Score ${ps.tdeResult.synthesis.score}/100`, 'warning')
  }

  // VPS Score
  if (ps.vpsResult) {
    const vps = ps.vpsResult.synthesis.score
    add(0, '17:00', 'PULSAR', 'Système', 'VPS calculé', 'VPS', 'brain', 'var(--p-vps)',
      `VPS = ${vps}/100 — ${ps.vpsResult.synthesis.level}`, vps >= 75 ? 'critical' : vps >= 50 ? 'warning' : 'info')
  }

  // EWE analysis
  if (ps.eweResult) {
    add(1, '08:05', 'PULSAR', 'Système', 'EWE — Monitoring', 'EWE', 'eeg', 'var(--p-ewe)',
      `Score ${ps.eweResult.synthesis.score}/100 — ${ps.eweResult.synthesis.level}`, 'info')
  }

  // TPE environment
  if (ps.tpeResult) {
    add(1, '09:00', 'PULSAR', 'Système', 'TPE — Environnement', 'TPE', 'thermo', 'var(--p-tpe)',
      `Score ${ps.tpeResult.synthesis.score}/100 — ${ps.tpeResult.synthesis.level}`, 'info')
  }

  // Treatment history
  ps.treatmentHistory.forEach((t, i) => {
    const responseLabel = t.response === 'none' ? 'ÉCHEC' : t.response === 'partial' ? 'PARTIEL' : 'BON'
    add(1 + i, '10:00', 'Dr. Leblanc', 'Neuropédiatre', `Bilan traitement: ${t.treatment}`, 'Recommandations', 'pill', 'var(--p-ewe)',
      `${t.period} — Réponse: ${responseLabel}`, t.response === 'none' ? 'critical' : 'info')
  })

  // Recommendations
  const recs = ps.tdeResult?.synthesis.recommendations || []
  recs.filter(r => r.priority === 'urgent').forEach((r, i) => {
    add(Math.max(1, ps.hospDay - 1), `${11 + i}:00`, 'PULSAR', 'Système', 'Recommandation urgente', 'Recommandations', 'warning', 'var(--p-warning)',
      `${r.title}: ${r.body.slice(0, 80)}…`, 'warning')
  })

  // Critical alerts
  const alerts = ps.vpsResult?.synthesis.alerts || []
  alerts.filter(a => a.severity === 'critical').forEach((a, i) => {
    add(ps.hospDay, `${8 + i}:00`, 'PULSAR', 'Système', 'ALERTE CRITIQUE', 'VPS', 'alert', 'var(--p-critical)', `${a.title}: ${a.body}`, 'critical')
  })

  return log.sort((a, b) => a.day !== b.day ? a.day - b.day : a.time.localeCompare(b.time))
}

const SEVERITY_STYLES = {
  info: { bg: 'var(--p-bg-elevated)', dot: 'var(--p-info)' },
  warning: { bg: 'rgba(255,179,71,0.06)', dot: 'var(--p-warning)' },
  critical: { bg: 'rgba(255,71,87,0.06)', dot: 'var(--p-critical)' },
}

export default function AuditPage() {
  const [filterModule, setFilterModule] = useState('Tous')
  const [filterUser, setFilterUser] = useState('Tous')
  const [scenario, setScenario] = useState('FIRES')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const auditLog = useMemo(() => generateAuditLog(ps), [ps])

  const modules = ['Tous', ...new Set(auditLog.map(e => e.module))]
  const users = ['Tous', ...new Set(auditLog.map(e => e.user))]

  const filtered = auditLog.filter(e => {
    if (filterModule !== 'Tous' && e.module !== filterModule) return false
    if (filterUser !== 'Tous' && e.user !== filterUser) return false
    return true
  })

  const days = [...new Set(filtered.map(e => e.day))].sort()

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="clipboard" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Audit Trail</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{auditLog.length} événements tracés · Pipeline connecté</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setFilterModule('Tous'); setFilterUser('Tous') }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)', display: 'flex', gap: 'var(--p-space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '10px', color: 'var(--p-text-dim)', display: 'block', marginBottom: '4px', fontFamily: 'var(--p-font-mono)' }}>MODULE</label>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-xs)' }}>
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', color: 'var(--p-text-dim)', display: 'block', marginBottom: '4px', fontFamily: 'var(--p-font-mono)' }}>UTILISATEUR</label>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-xs)' }}>
            {users.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          {(['info', 'warning', 'critical'] as const).map(s => {
            const count = filtered.filter(e => e.severity === s).length
            return (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SEVERITY_STYLES[s].dot, margin: '0 auto 4px' }} />
                <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline by day */}
      {days.map(day => (
        <div key={day} style={{ marginBottom: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-vps)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--p-space-3)', fontFamily: 'var(--p-font-mono)' }}>Jour {day}</div>
          <div style={{ borderLeft: '2px solid var(--p-gray-2)', paddingLeft: 'var(--p-space-4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.filter(e => e.day === day).map(entry => {
              const sev = SEVERITY_STYLES[entry.severity]
              return (
                <div key={entry.id} style={{ display: 'flex', gap: 'var(--p-space-3)', alignItems: 'flex-start', padding: '8px 14px', borderRadius: 'var(--p-radius-md)', background: sev.bg, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '14px', width: '8px', height: '8px', borderRadius: '50%', background: sev.dot, border: '2px solid var(--p-bg)' }} />
                  <div style={{ minWidth: '42px', fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', paddingTop: '2px' }}>{entry.time}</div>
                  <Picto name={entry.icon} size={18} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, color: entry.color }}>{entry.action}</span>
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-bg-elevated)', color: 'var(--p-text-dim)' }}>{entry.module}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--p-text-muted)' }}>{entry.detail}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{entry.user} · {entry.role}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Audit Trail · Traçabilité complète · Pipeline connecté
      </div>
    </div>
  )
}
