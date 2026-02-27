'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'

type LogEntry = {
  id: number; time: string; day: number; user: string; role: string
  action: string; module: string; icon: string; color: string; detail: string; severity: 'info' | 'warning' | 'critical'
}

const AUDIT_LOG: LogEntry[] = [
  { id: 1, time: '08:02', day: 0, user: 'Dr. Martin', role: 'Urgentiste', action: 'Admission patient', module: 'Admission', icon: 'clipboard', color: 'var(--p-vps)', detail: 'Création dossier — Inès, 7 ans, crises TC fébriles', severity: 'info' },
  { id: 2, time: '08:05', day: 0, user: 'PULSAR', role: 'Système', action: 'Pipeline initialisé', module: 'VPS', icon: 'brain', color: 'var(--p-vps)', detail: '5 moteurs activés — VPS+TDE+PVE+EWE+TPE, couche 1 chargée', severity: 'info' },
  { id: 3, time: '08:15', day: 0, user: 'IDE Dupont', role: 'Infirmier', action: 'Bilan lancé', module: 'Bilan', icon: 'microscope', color: 'var(--p-pve)', detail: 'NFS, CRP, PCT, iono, lactates, bilan hépatique — 8 tubes', severity: 'info' },
  { id: 4, time: '09:30', day: 0, user: 'PULSAR', role: 'Système', action: 'ALERTE CRITIQUE', module: 'VPS', icon: 'alert', color: 'var(--p-critical)', detail: 'État de mal épileptique détecté — 2ème crise TC > 5 min', severity: 'critical' },
  { id: 5, time: '09:32', day: 0, user: 'Dr. Martin', role: 'Urgentiste', action: 'Traitement administré', module: 'Urgence', icon: 'pill', color: 'var(--p-ewe)', detail: 'Midazolam 0.15 mg/kg IV — protocole état de mal', severity: 'warning' },
  { id: 6, time: '10:00', day: 0, user: 'Dr. Leblanc', role: 'Neuropédiatre', action: 'Traitement prescrit', module: 'Recommandations', icon: 'pill', color: 'var(--p-ewe)', detail: 'Lévétiracétam 40 mg/kg IV — charge antiépileptique L1', severity: 'info' },
  { id: 7, time: '10:05', day: 0, user: 'PULSAR', role: 'Système', action: 'PVE — Vérification', module: 'PVE', icon: 'shield', color: 'var(--p-pve)', detail: 'LEV : pas de CI identifiée, dose conforme poids 25kg', severity: 'info' },
  { id: 8, time: '14:00', day: 0, user: 'Labo', role: 'Biologie', action: 'Résultats reçus', module: 'Bilan', icon: 'blood', color: 'var(--p-tde)', detail: 'CRP 35 mg/L, PCT 0.8 ng/mL, ferritine 280 µg/L', severity: 'info' },
  { id: 9, time: '14:02', day: 0, user: 'PULSAR', role: 'Système', action: 'TDE — Hypothèse', module: 'TDE', icon: 'dna', color: 'var(--p-tde)', detail: 'Pattern inflammatoire compatible FIRES/EAIS — panel anticorps recommandé', severity: 'warning' },
  { id: 10, time: '16:00', day: 0, user: 'PULSAR', role: 'Système', action: 'ALERTE ESCALADE', module: 'VPS', icon: 'warning', color: 'var(--p-warning)', detail: '4 crises en 8h malgré LEV + MDZ — escalade thérapeutique nécessaire', severity: 'critical' },
  { id: 11, time: '17:00', day: 0, user: 'PULSAR', role: 'Système', action: 'VPS calculé', module: 'VPS', icon: 'brain', color: 'var(--p-vps)', detail: 'VPS = 68/100 — Niveau SÉVÈRE, pattern détérioration progressive', severity: 'critical' },
  { id: 12, time: '08:00', day: 1, user: 'Dr. Leblanc', role: 'Neuropédiatre', action: 'Immunothérapie L1', module: 'Recommandations', icon: 'pill', color: 'var(--p-ewe)', detail: 'Méthylprednisolone 30 mg/kg IV — J1/5', severity: 'warning' },
  { id: 13, time: '08:05', day: 1, user: 'PULSAR', role: 'Système', action: 'EWE — Monitoring', module: 'EWE', icon: 'eeg', color: 'var(--p-ewe)', detail: 'EEG patterns : GPD bilatéraux, pas d\'extreme delta brush', severity: 'info' },
  { id: 14, time: '10:00', day: 2, user: 'Dr. Leblanc', role: 'Neuropédiatre', action: 'IgIV prescrites', module: 'Recommandations', icon: 'pill', color: 'var(--p-ewe)', detail: 'IgIV 2 g/kg — perfusion 12h', severity: 'info' },
  { id: 15, time: '10:05', day: 2, user: 'PULSAR', role: 'Système', action: 'PVE — Alerte', module: 'PVE', icon: 'shield', color: 'var(--p-pve)', detail: 'IgIV : risque méningite aseptique, surveillance céphalées', severity: 'warning' },
  { id: 16, time: '08:00', day: 3, user: 'PULSAR', role: 'Système', action: 'VPS recalculé', module: 'VPS', icon: 'brain', color: 'var(--p-tde)', detail: 'VPS = 45/100 — Amélioration modérée, 2 crises/24h vs 12 à J0', severity: 'info' },
]

const SEVERITY_STYLES = {
  info: { bg: 'var(--p-bg-elevated)', dot: 'var(--p-info)' },
  warning: { bg: 'rgba(255,179,71,0.06)', dot: 'var(--p-warning)' },
  critical: { bg: 'rgba(255,71,87,0.06)', dot: 'var(--p-critical)' },
}

export default function AuditPage() {
  const [filterModule, setFilterModule] = useState('Tous')
  const [filterUser, setFilterUser] = useState('Tous')

  const modules = ['Tous', ...new Set(AUDIT_LOG.map(e => e.module))]
  const users = ['Tous', ...new Set(AUDIT_LOG.map(e => e.user))]

  const filtered = AUDIT_LOG.filter(e => {
    if (filterModule !== 'Tous' && e.module !== filterModule) return false
    if (filterUser !== 'Tous' && e.user !== filterUser) return false
    return true
  })

  const days = [...new Set(filtered.map(e => e.day))].sort()

  return (
    <div className="page-enter" style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="clipboard" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Audit Trail</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{AUDIT_LOG.length} événements tracés · Traçabilité complète</span>
        </div>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-5)' }}>Historique complet des actions humaines et système. Chaque décision est horodatée et attribuée.</p>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-5)', display: 'flex', gap: 'var(--p-space-4)', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '10px', color: 'var(--p-text-dim)', display: 'block', marginBottom: '4px' }}>Module</label>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-xs)' }}>
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', color: 'var(--p-text-dim)', display: 'block', marginBottom: '4px' }}>Utilisateur</label>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-xs)' }}>
            {users.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          {(['info', 'warning', 'critical'] as const).map(s => {
            const count = filtered.filter(e => e.severity === s).length
            return (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SEVERITY_STYLES[s].dot, margin: '0 auto 4px' }} />
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{count}</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
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
    </div>
  )
}
