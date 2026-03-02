'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'
import { vitalsService } from '@/lib/services'
import type { VitalsInsert } from '@/lib/types/database'

interface VitalsFormProps {
  patientId: string
  onSaved?: () => void
  compact?: boolean
}

const SEIZURE_TYPES = [
  { value: '', label: 'Aucune' },
  { value: 'focal_aware', label: 'Focale simple' },
  { value: 'focal_impaired', label: 'Focale complexe' },
  { value: 'generalized_tonic_clonic', label: 'GTC' },
  { value: 'status', label: 'Status epilepticus' },
  { value: 'refractory_status', label: 'Status réfractaire' },
  { value: 'super_refractory', label: 'Super-réfractaire' },
]

const PUPIL_OPTIONS = [
  { value: 'reactive', label: 'Réactives' },
  { value: 'sluggish', label: 'Lentes' },
  { value: 'fixed_one', label: 'Fixe unilatérale' },
  { value: 'fixed_both', label: 'Fixes bilatérales' },
]

export default function VitalsForm({ patientId, onSaved, compact }: VitalsFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [gcs, setGcs] = useState<string>('')
  const [pupils, setPupils] = useState('reactive')
  const [seizures24h, setSeizures24h] = useState<string>('0')
  const [seizureType, setSeizureType] = useState('')
  const [heartRate, setHeartRate] = useState<string>('')
  const [sbp, setSbp] = useState<string>('')
  const [dbp, setDbp] = useState<string>('')
  const [spo2, setSpo2] = useState<string>('')
  const [temp, setTemp] = useState<string>('')
  const [respRate, setRespRate] = useState<string>('')

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const data: VitalsInsert = {
        patient_id: patientId,
        gcs: gcs ? parseInt(gcs) : null,
        pupils: pupils as VitalsInsert['pupils'],
        seizures_24h: parseInt(seizures24h) || 0,
        seizure_type: seizureType || null,
        heart_rate: heartRate ? parseInt(heartRate) : null,
        sbp: sbp ? parseInt(sbp) : null,
        dbp: dbp ? parseInt(dbp) : null,
        spo2: spo2 ? parseInt(spo2) : null,
        temp: temp ? parseFloat(temp) : null,
        resp_rate: respRate ? parseInt(respRate) : null,
      }
      await vitalsService.record(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Reset
      setGcs(''); setHeartRate(''); setSbp(''); setDbp('')
      setSpo2(''); setTemp(''); setRespRate(''); setSeizures24h('0'); setSeizureType('')
      onSaved?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    padding: '8px 10px', borderRadius: 'var(--p-radius-md)',
    background: 'var(--p-bg)', border: 'var(--p-border)',
    fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'var(--p-text)',
    width: '100%', outline: 'none',
  }
  const labelStyle = {
    fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700 as const,
    color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '4px', display: 'block' as const,
  }
  const selectStyle = { ...inputStyle, cursor: 'pointer' as const }
  const groupStyle = { flex: 1, minWidth: compact ? '80px' : '100px' }

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Picto name="heart" size={16} glow glowColor="rgba(255,107,138,0.5)" />
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#FF6B8A' }}>
          SAISIE CONSTANTES
        </span>
      </div>

      {/* Neuro */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ ...labelStyle, color: '#6C7CFF', fontSize: '8px', marginBottom: '8px' }}>NEUROLOGIQUE</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={groupStyle}>
            <label style={labelStyle}>GCS (3-15)</label>
            <input type="number" min={3} max={15} value={gcs} onChange={e => setGcs(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Pupilles</label>
            <select value={pupils} onChange={e => setPupils(e.target.value)} style={selectStyle}>
              {PUPIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Crises /24h</label>
            <input type="number" min={0} value={seizures24h} onChange={e => setSeizures24h(e.target.value)}
              style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Type crises</label>
            <select value={seizureType} onChange={e => setSeizureType(e.target.value)} style={selectStyle}>
              {SEIZURE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Hémodynamique */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ ...labelStyle, color: '#FF6B8A', fontSize: '8px', marginBottom: '8px' }}>HÉMODYNAMIQUE</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={groupStyle}>
            <label style={labelStyle}>FC (bpm)</label>
            <input type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>PAS (mmHg)</label>
            <input type="number" value={sbp} onChange={e => setSbp(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>PAD (mmHg)</label>
            <input type="number" value={dbp} onChange={e => setDbp(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>SpO₂ (%)</label>
            <input type="number" min={0} max={100} value={spo2} onChange={e => setSpo2(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>T° (°C)</label>
            <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>FR (/min)</label>
            <input type="number" value={respRate} onChange={e => setRespRate(e.target.value)}
              placeholder="—" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '10px 24px', borderRadius: 'var(--p-radius-lg)', border: 'none', cursor: saving ? 'wait' : 'pointer',
          background: saved ? '#2ED573' : 'linear-gradient(135deg, #FF6B8A, #FF4757)',
          fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#fff',
          letterSpacing: '0.5px', transition: 'all 0.3s',
          boxShadow: saved ? '0 4px 16px rgba(46,213,115,0.3)' : '0 4px 16px rgba(255,71,87,0.3)',
        }}>
          {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer les constantes'}
        </button>
        {error && (
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FF4757' }}>{error}</span>
        )}
      </div>
    </div>
  )
}
