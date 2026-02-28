'use client'
import Picto from '@/components/Picto';
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

// ── Red Flag definitions ──
interface RedFlag {
  id: string; category: string; label: string; severity: 'critical' | 'warning' | 'info'
  condition: (ps: PatientState) => boolean
  detail: (ps: PatientState) => string
  action: string; reference: string
}

const RED_FLAGS: RedFlag[] = [
  // ── Neurologique ──
  { id: 'gcs_critical', category: 'Neurologique', label: 'GCS ≤ 8', severity: 'critical',
    condition: ps => ps.neuro.gcs <= 8, detail: ps => `GCS actuel: ${ps.neuro.gcs}/15`,
    action: 'Intubation/protection voies aériennes, appel réanimation', reference: 'Protocole réa pédiatrique' },
  { id: 'gcs_declining', category: 'Neurologique', label: 'GCS en déclin (≥3 pts)', severity: 'critical',
    condition: ps => { const h = ps.neuro.gcsHistory; return h.length > 0 && (h[0] - ps.neuro.gcs) >= 3 },
    detail: ps => `GCS: ${ps.neuro.gcsHistory.join('→')}→${ps.neuro.gcs}`,
    action: 'Réévaluation neurologique urgente, IRM si non fait', reference: 'van Baalen 2010' },
  { id: 'pupils_fixed', category: 'Neurologique', label: 'Pupilles fixes bilatérales', severity: 'critical',
    condition: ps => ps.neuro.pupils === 'fixed_both', detail: () => 'Mydriase bilatérale aréactive',
    action: 'URGENCE ABSOLUE — Neurochirurgie, TDM cérébral immédiat', reference: 'Guidelines ILAE' },
  { id: 'status_refractory', category: 'Neurologique', label: 'Status réfractaire / super-réfractaire', severity: 'critical',
    condition: ps => ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory',
    detail: ps => `Type: ${ps.neuro.seizureType}, Durée: ${ps.neuro.seizureDuration} min`,
    action: 'Protocole burst-suppression, transfert réanimation', reference: 'Trinka 2015' },
  { id: 'seizures_high', category: 'Neurologique', label: 'Crises ≥ 10/24h', severity: 'critical',
    condition: ps => ps.neuro.seizures24h >= 10, detail: ps => `${ps.neuro.seizures24h} crises/24h`,
    action: 'EEG continu, révision antiépileptiques', reference: 'Wickström 2022' },
  { id: 'seizures_multiple', category: 'Neurologique', label: 'Crises ≥ 5/24h', severity: 'warning',
    condition: ps => ps.neuro.seizures24h >= 5 && ps.neuro.seizures24h < 10, detail: ps => `${ps.neuro.seizures24h} crises/24h`,
    action: 'Surveillance EEG renforcée', reference: 'Guidelines ILAE' },

  // ── Inflammatoire ──
  { id: 'crp_extreme', category: 'Inflammatoire', label: 'CRP ≥ 200 mg/L', severity: 'critical',
    condition: ps => ps.biology.crp >= 200, detail: ps => `CRP: ${ps.biology.crp} mg/L`,
    action: 'Bilan infectieux complet, considérer MAS/orage cytokinique', reference: 'Kothur 2016' },
  { id: 'ferritin_extreme', category: 'Inflammatoire', label: 'Ferritine ≥ 5000 µg/L', severity: 'critical',
    condition: ps => ps.biology.ferritin >= 5000, detail: ps => `Ferritine: ${ps.biology.ferritin} µg/L`,
    action: 'Suspecter syndrome d\'activation macrophagique (MAS)', reference: 'Dizon 2023' },
  { id: 'fever_high', category: 'Inflammatoire', label: 'Fièvre ≥ 40°C', severity: 'warning',
    condition: ps => ps.hemodynamics.temp >= 40, detail: ps => `T°: ${ps.hemodynamics.temp}°C`,
    action: 'Antipyrétiques, PL si non fait, hémocultures', reference: 'Protocole infectieux' },
  { id: 'lactate_high', category: 'Hémodynamique', label: 'Lactates ≥ 4 mmol/L', severity: 'critical',
    condition: ps => ps.biology.lactate >= 4, detail: ps => `Lactates: ${ps.biology.lactate} mmol/L`,
    action: 'Remplissage, vasopresseurs si choc, bilan septique', reference: 'Surviving Sepsis 2020' },

  // ── Hémodynamique ──
  { id: 'spo2_low', category: 'Hémodynamique', label: 'SpO₂ < 92%', severity: 'critical',
    condition: ps => ps.hemodynamics.spo2 < 92, detail: ps => `SpO₂: ${ps.hemodynamics.spo2}%`,
    action: 'O₂ haut débit, ventilation si <88%', reference: 'Protocole réa pédiatrique' },
  { id: 'platelets_low', category: 'Hémodynamique', label: 'Plaquettes < 50 G/L', severity: 'warning',
    condition: ps => ps.biology.platelets < 50, detail: ps => `Plaquettes: ${ps.biology.platelets} G/L`,
    action: 'Transfusion si <20G/L ou saignement actif', reference: 'Consensus transfusion pédiatrique' },

  // ── Combinaisons ──
  { id: 'combo_fires', category: 'Combinaison', label: 'Score VPS ≥ 70 + crises réfractaires + J≥5', severity: 'critical',
    condition: ps => (ps.vpsResult?.synthesis.score ?? 0) >= 70 && (ps.neuro.seizureType === 'refractory_status' || ps.neuro.seizureType === 'super_refractory') && ps.hospDay >= 5,
    detail: ps => `VPS: ${ps.vpsResult?.synthesis.score}, J${ps.hospDay}`,
    action: 'Escalade thérapeutique urgente, considérer 3ème ligne', reference: 'Wickström 2022 + Sheikh 2023' },
  { id: 'combo_immuno', category: 'Combinaison', label: 'Échec immunothérapie + GCS déclin', severity: 'critical',
    condition: ps => ps.treatmentHistory.some(t => t.response === 'none') && ps.neuro.gcsHistory.length > 0 && ps.neuro.gcs < ps.neuro.gcsHistory[ps.neuro.gcsHistory.length - 1],
    detail: ps => `Échecs: ${ps.treatmentHistory.filter(t => t.response === 'none').length}, GCS↓`,
    action: 'RCP urgente, envisager plasmaphérèse ou anticorps monoclonaux', reference: 'Titulaer 2013' },
  { id: 'combo_poly', category: 'Combinaison', label: 'Polypharmacie ≥ 6 médicaments', severity: 'warning',
    condition: ps => ps.drugs.length >= 6, detail: ps => `${ps.drugs.length} médicaments actifs`,
    action: 'Revue pharmacovigilance, vérifier interactions', reference: 'PVE Engine' },
]

export default function InterpellationPage() {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all')
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set())
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const triggered = useMemo(() => {
    return RED_FLAGS.filter(rf => rf.condition(ps)).map(rf => ({ ...rf, detailText: rf.detail(ps) }))
  }, [ps])

  const filtered = filter === 'all' ? triggered : triggered.filter(t => t.severity === filter)
  const critCount = triggered.filter(t => t.severity === 'critical').length
  const warnCount = triggered.filter(t => t.severity === 'warning').length

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="warning" size={36} glow glowColor="rgba(255,179,71,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Interpellation</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Phase 2 — Drapeaux rouges & seuils critiques</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setAcknowledged(new Set()) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-warning)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-warning-bg)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-warning)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Summary Bar */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{
        ...card, marginBottom: 'var(--p-space-5)',
        borderLeft: `4px solid ${critCount > 0 ? 'var(--p-critical)' : warnCount > 0 ? 'var(--p-warning)' : 'var(--p-success)'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>DRAPEAUX ROUGES</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'var(--p-text-3xl)', fontWeight: 800, color: critCount > 0 ? 'var(--p-critical)' : 'var(--p-success)' }}>{triggered.length}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'var(--p-critical-bg)', color: 'var(--p-critical)',
              fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px',
            }}>{critCount} critique{critCount !== 1 ? 's' : ''}</span>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'var(--p-warning-bg)', color: 'var(--p-warning)',
              fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '12px',
            }}>{warnCount} attention</span>
          </div>
        </div>
        {critCount > 0 && (
          <div style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-full)',
            background: 'var(--p-critical)', color: '#fff',
            fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '11px',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>INTERVENTION REQUISE</div>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--p-space-4)' }}>
        {([['all', 'Tous'], ['critical', 'Critiques'], ['warning', 'Attention']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '4px 14px', borderRadius: 'var(--p-radius-full)',
            border: filter === k ? '1px solid var(--p-text-dim)' : 'var(--p-border)',
            background: filter === k ? 'var(--p-bg-elevated)' : 'transparent',
            color: filter === k ? 'var(--p-text)' : 'var(--p-text-dim)',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>{l} ({k === 'all' ? triggered.length : triggered.filter(t => t.severity === k).length})</button>
        ))}
      </div>

      {/* Alerts List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ ...card, textAlign: 'center', padding: 'var(--p-space-8)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
          <div style={{ fontWeight: 600, color: 'var(--p-success)' }}>Aucun drapeau rouge actif</div>
          <div style={{ fontSize: '12px', color: 'var(--p-text-dim)', marginTop: '4px' }}>Tous les paramètres sont dans les seuils acceptables</div>
        </div>
      ) : (
        filtered.map((rf, i) => {
          const isAcked = acknowledged.has(rf.id)
          const sc = rf.severity === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'
          return (
            <div key={rf.id} className={`glass-card card-interactive ${mounted ? `animate-in stagger-${Math.min(i + 1, 5)}` : ''}`} style={{
              ...card, marginBottom: '10px',
              borderLeft: `4px solid ${sc}`,
              opacity: isAcked ? 0.5 : 1,
              transition: 'opacity 300ms',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                      background: sc, color: '#fff',
                      fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                    }}>{rf.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION'}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                      background: 'var(--p-bg-elevated)',
                      fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)',
                    }}>{rf.category}</span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)' }}>{rf.label}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--p-font-mono)', color: sc, fontWeight: 600 }}>{rf.detailText}</span>
                  </div>

                  {/* CTA */}
                  <div style={{
                    padding: '8px 14px', borderRadius: 'var(--p-radius-md)',
                    background: `${sc}08`, border: `1px solid ${sc}20`,
                  }}>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: '3px' }}>ACTION RECOMMANDÉE</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{rf.action}</div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginTop: '2px' }}>Réf: {rf.reference}</div>
                  </div>
                </div>

                <button onClick={(e) => { e.stopPropagation(); setAcknowledged(prev => { const n = new Set(prev); isAcked ? n.delete(rf.id) : n.add(rf.id); return n }) }} style={{
                  padding: '6px 14px', borderRadius: 'var(--p-radius-lg)',
                  background: isAcked ? 'var(--p-success-bg)' : 'var(--p-bg-elevated)',
                  border: isAcked ? '1px solid var(--p-success)' : 'var(--p-border)',
                  color: isAcked ? 'var(--p-success)' : 'var(--p-text-dim)',
                  fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, cursor: 'pointer',
                  flexShrink: 0,
                }}>{isAcked ? '✓ Acquitté' : 'Acquitter'}</button>
              </div>
            </div>
          )
        })
      )}

      {/* Engine Alerts */}
      {ps.alerts.length > 0 && (
        <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{ ...card, marginTop: 'var(--p-space-5)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px' }}>
            ALERTES MOTEURS ({ps.alerts.length})
          </div>
          {ps.alerts.slice(0, 8).map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 12px', marginBottom: '4px',
              borderRadius: 'var(--p-radius-md)',
              borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--p-critical)' : a.severity === 'warning' ? 'var(--p-warning)' : 'var(--p-info)'}`,
              background: 'var(--p-bg-elevated)',
            }}>
              <span style={{ fontWeight: 600, fontSize: '11px', flex: 1 }}>{a.title}</span>
              <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.body}</span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', flexShrink: 0 }}>{a.source}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 'var(--p-space-6)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — Interpellation · Drapeaux rouges · Ne se substitue pas au jugement clinique
      </div>
    </div>
  )
}
