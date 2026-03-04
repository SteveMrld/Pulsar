'use client'
import { useState, useEffect } from 'react'
import { usePatient } from '@/contexts/PatientContext'
import { vitalsService, labService, medicationService, alertService } from '@/lib/services'
import { historyService } from '@/lib/services/historyService'
import Picto from '@/components/Picto'
import type { Vitals, LabResult, Medication, Alert } from '@/lib/types/database'

/* ══════════════════════════════════════════════════════════════
   DOSSIER PATIENT — Vue synthétique pour transmissions/handoffs
   Dernières constantes · Dernière bio · Traitements actifs · Alertes
   ══════════════════════════════════════════════════════════════ */

export default function DossierSummary({ patientId }: { patientId: string }) {
  const [vitals, setVitals] = useState<Vitals | null>(null)
  const [labs, setLabs] = useState<LabResult | null>(null)
  const [meds, setMeds] = useState<Medication[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [v, l, m, a] = await Promise.all([
          vitalsService.getLatest(patientId),
          labService.getLatest(patientId),
          medicationService.getActive(patientId),
          alertService.getActive(patientId),
        ])
        setVitals(v)
        setLabs(l)
        setMeds(m)
        setAlerts(a)
      } catch (err) { console.error('[Dossier]', err) }
      setLoading(false)
    }
    load()
  }, [patientId])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
        Chargement du dossier...
      </div>
    )
  }

  const fmt = (v: number | null | undefined, unit?: string) => v != null ? `${v}${unit || ''}` : '—'
  const fmtT = (v: number | null | undefined) => v != null ? `${v.toFixed(1)}°C` : '—'
  const critAlerts = alerts.filter(a => a.severity === 'critical')

  const kv = (label: string, value: string, color?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: color || 'var(--p-text)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Alertes critiques */}
      {critAlerts.length > 0 && (
        <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)', border: '1px solid #8B5CF630' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.5px', marginBottom: '6px' }}>
            ⚠ {critAlerts.length} ALERTE{critAlerts.length > 1 ? 'S' : ''} CRITIQUE{critAlerts.length > 1 ? 'S' : ''}
          </div>
          {critAlerts.slice(0, 3).map(a => (
            <div key={a.id} style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#8B5CF6', padding: '2px 0' }}>
              {a.title}
            </div>
          ))}
        </div>
      )}

      {/* Dernières constantes */}
      {vitals && (
        <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#A78BFA', letterSpacing: '0.5px', marginBottom: '6px' }}>
            DERNIÈRES CONSTANTES
            <span style={{ fontWeight: 400, marginLeft: '6px', color: 'var(--p-text-dim)' }}>
              {new Date(vitals.recorded_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {kv('GCS', fmt(vitals.gcs), vitals.gcs && vitals.gcs <= 8 ? '#8B5CF6' : undefined)}
          {kv('Pupilles', vitals.pupils || '—', vitals.pupils === 'fixed_both' ? '#8B5CF6' : undefined)}
          {kv('Crises /24h', String(vitals.seizures_24h || 0), vitals.seizures_24h > 3 ? '#8B5CF6' : undefined)}
          {kv('FC', fmt(vitals.heart_rate, ' bpm'))}
          {kv('PA', vitals.sbp && vitals.dbp ? `${vitals.sbp}/${vitals.dbp}` : '—')}
          {kv('SpO₂', fmt(vitals.spo2, '%'), vitals.spo2 && vitals.spo2 < 92 ? '#8B5CF6' : undefined)}
          {kv('T°', fmtT(vitals.temp), vitals.temp && vitals.temp >= 38.5 ? '#8B5CF6' : undefined)}
        </div>
      )}

      {/* Dernière biologie */}
      {labs && (
        <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#B96BFF', letterSpacing: '0.5px', marginBottom: '6px' }}>
            DERNIÈRE BIOLOGIE
            <span style={{ fontWeight: 400, marginLeft: '6px', color: 'var(--p-text-dim)' }}>
              {new Date(labs.recorded_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {labs.crp != null && kv('CRP', `${labs.crp} mg/L`, labs.crp > 50 ? '#8B5CF6' : undefined)}
          {labs.wbc != null && kv('GB', `${labs.wbc} G/L`)}
          {labs.lactate != null && kv('Lactate', `${labs.lactate} mmol/L`, labs.lactate > 2 ? '#8B5CF6' : undefined)}
          {labs.csf_cells != null && kv('LCR cellules', `${labs.csf_cells} /mm³`, labs.csf_cells > 10 ? '#FFB347' : undefined)}
          {labs.ferritin != null && kv('Ferritine', `${labs.ferritin} ng/mL`, labs.ferritin > 500 ? '#8B5CF6' : undefined)}
        </div>
      )}

      {/* Traitements actifs */}
      {meds.length > 0 && (
        <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#2FD1C8', letterSpacing: '0.5px', marginBottom: '6px' }}>
            TRAITEMENTS ACTIFS ({meds.length})
          </div>
          {meds.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text)' }}>
                {m.drug_name}
              </span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
                {[m.dose, m.route, m.frequency].filter(Boolean).join(' · ') || '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!vitals && !labs && meds.length === 0 && alerts.length === 0 && (
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
            Aucune donnée enregistrée pour ce patient
          </div>
        </div>
      )}
    </div>
  )
}
