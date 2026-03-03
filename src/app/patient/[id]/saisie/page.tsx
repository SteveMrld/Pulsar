'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import { vitalsService, labService } from '@/lib/services'
import Picto from '@/components/Picto'
import VitalsForm from '@/components/VitalsForm'
import LabForm from '@/components/LabForm'
import NoteForm from '@/components/NoteForm'
import type { Vitals, LabResult } from '@/lib/types/database'

/* ══════════════════════════════════════════════════════════════
   SAISIE — Constantes · Biologie · Notes cliniques
   Page de saisie temps réel pour le personnel soignant
   ══════════════════════════════════════════════════════════════ */

function VitalsHistory({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<Vitals[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await vitalsService.getHistory(patientId, 10)
      setHistory(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [patientId])

  if (loading) return <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', padding: '12px' }}>Chargement...</div>
  if (history.length === 0) return null

  const fmt = (v: number | null | undefined) => v != null ? String(v) : '—'
  const fmtT = (v: number | null | undefined) => v != null ? v.toFixed(1) : '—'

  return (
    <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#FFB347', letterSpacing: '0.5px', marginBottom: '10px' }}>
        HISTORIQUE CONSTANTES ({history.length})
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-font-mono)', fontSize: '10px' }}>
          <thead>
            <tr style={{ color: 'var(--p-text-dim)', borderBottom: '1px solid var(--p-dark-4)' }}>
              <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 700 }}>Heure</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>GCS</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>Pupilles</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>Crises</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>FC</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>PA</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>SpO₂</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>T°</th>
              <th style={{ textAlign: 'center', padding: '4px 4px' }}>FR</th>
            </tr>
          </thead>
          <tbody>
            {history.map(v => {
              const time = new Date(v.recorded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              const date = new Date(v.recorded_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
              const gcsColor = (v.gcs || 15) <= 8 ? '#FF4757' : (v.gcs || 15) <= 12 ? '#FFB347' : 'var(--p-text)'
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--p-dark-4)' }}>
                  <td style={{ padding: '5px 6px', color: 'var(--p-text-dim)' }}>{date} {time}</td>
                  <td style={{ textAlign: 'center', color: gcsColor, fontWeight: 800 }}>{fmt(v.gcs)}</td>
                  <td style={{ textAlign: 'center', color: v.pupils === 'fixed_both' ? '#FF4757' : 'var(--p-text-dim)' }}>
                    {v.pupils === 'reactive' ? '○○' : v.pupils === 'sluggish' ? '◐◐' : v.pupils === 'fixed_one' ? '●○' : v.pupils === 'fixed_both' ? '●●' : '—'}
                  </td>
                  <td style={{ textAlign: 'center', color: (v.seizures_24h || 0) > 3 ? '#FF4757' : 'var(--p-text)' }}>{v.seizures_24h || 0}</td>
                  <td style={{ textAlign: 'center' }}>{fmt(v.heart_rate)}</td>
                  <td style={{ textAlign: 'center' }}>{v.sbp && v.dbp ? `${v.sbp}/${v.dbp}` : '—'}</td>
                  <td style={{ textAlign: 'center', color: (v.spo2 || 100) < 92 ? '#FF4757' : 'var(--p-text)' }}>{fmt(v.spo2)}</td>
                  <td style={{ textAlign: 'center', color: (v.temp || 37) >= 38.5 ? '#FF4757' : 'var(--p-text)' }}>{fmtT(v.temp)}</td>
                  <td style={{ textAlign: 'center' }}>{fmt(v.resp_rate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LabHistory({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<LabResult[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await labService.getHistory(patientId, 5)
      setHistory(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [patientId])

  if (loading || history.length === 0) return null

  const fmt = (v: number | null | undefined) => v != null ? String(v) : ''
  const highlight = (v: number | null | undefined, lo: number, hi: number) => {
    if (v == null) return 'var(--p-text-dim)'
    return v < lo || v > hi ? '#FF4757' : 'var(--p-text)'
  }

  return (
    <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#B96BFF', letterSpacing: '0.5px', marginBottom: '10px' }}>
        HISTORIQUE BIOLOGIE ({history.length})
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--p-font-mono)', fontSize: '10px' }}>
          <thead>
            <tr style={{ color: 'var(--p-text-dim)', borderBottom: '1px solid var(--p-dark-4)' }}>
              <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 700 }}>Date</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>CRP</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>PCT</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>GB</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>Plaq</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>Lact</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>Ferrit</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>LCR cel</th>
              <th style={{ textAlign: 'center', padding: '4px' }}>LCR prot</th>
            </tr>
          </thead>
          <tbody>
            {history.map(l => {
              const date = new Date(l.recorded_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
              const time = new Date(l.recorded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              return (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--p-dark-4)' }}>
                  <td style={{ padding: '5px 6px', color: 'var(--p-text-dim)' }}>{date} {time}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.crp, 0, 10) }}>{fmt(l.crp)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.pct, 0, 0.5) }}>{fmt(l.pct)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.wbc, 4, 12) }}>{fmt(l.wbc)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.platelets, 150, 450) }}>{fmt(l.platelets)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.lactate, 0, 2) }}>{fmt(l.lactate)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.ferritin, 0, 500) }}>{fmt(l.ferritin)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.csf_cells, 0, 5) }}>{fmt(l.csf_cells)}</td>
                  <td style={{ textAlign: 'center', color: highlight(l.csf_protein, 0, 0.45) }}>{fmt(l.csf_protein)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SaisiePage() {
  const { t } = useLang()
  const { info } = usePatient()
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="edit" size={28} glow glowColor="rgba(255,107,138,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Saisie temps réel</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Constantes · Biologie · Notes {'\u00b7'} {info.displayName} {'\u00b7'} J+{info.hospDay}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Formulaire constantes */}
        <VitalsForm patientId={info.id} onSaved={refresh} />

        {/* Historique constantes */}
        <VitalsHistory key={`vh-${refreshKey}`} patientId={info.id} />

        {/* Formulaire biologie */}
        <LabForm patientId={info.id} onSaved={refresh} />

        {/* Historique biologie */}
        <LabHistory key={`lh-${refreshKey}`} patientId={info.id} />

        {/* Notes cliniques */}
        <NoteForm patientId={info.id} onSaved={refresh} />
      </div>
    </div>
  )
}
