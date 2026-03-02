'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'
import { labService } from '@/lib/services'
import type { LabResultInsert } from '@/lib/types/database'

interface LabFormProps {
  patientId: string
  onSaved?: () => void
}

const FIELDS = [
  { key: 'crp', label: 'CRP', unit: 'mg/L', section: 'inflammatoire', step: '0.1' },
  { key: 'pct', label: 'PCT', unit: 'ng/mL', section: 'inflammatoire', step: '0.01' },
  { key: 'ferritin', label: 'Ferritine', unit: 'ng/mL', section: 'inflammatoire', step: '1' },
  { key: 'wbc', label: 'GB', unit: 'G/L', section: 'inflammatoire', step: '0.1' },
  { key: 'platelets', label: 'Plaquettes', unit: 'G/L', section: 'inflammatoire', step: '1' },
  { key: 'lactate', label: 'Lactate', unit: 'mmol/L', section: 'inflammatoire', step: '0.1' },
  { key: 'csf_cells', label: 'LCR cellules', unit: '/mm³', section: 'lcr', step: '1' },
  { key: 'csf_protein', label: 'LCR protéines', unit: 'g/L', section: 'lcr', step: '0.01' },
  { key: 'csf_glucose', label: 'LCR glucose', unit: 'mmol/L', section: 'lcr', step: '0.1' },
  { key: 'sodium', label: 'Na+', unit: 'mmol/L', section: 'metabolique', step: '0.1' },
  { key: 'potassium', label: 'K+', unit: 'mmol/L', section: 'metabolique', step: '0.1' },
  { key: 'glycemia', label: 'Glycémie', unit: 'mmol/L', section: 'metabolique', step: '0.1' },
  { key: 'creatinine', label: 'Créatinine', unit: 'µmol/L', section: 'metabolique', step: '1' },
  { key: 'ast', label: 'AST', unit: 'UI/L', section: 'hepatique', step: '1' },
  { key: 'alt', label: 'ALT', unit: 'UI/L', section: 'hepatique', step: '1' },
  { key: 'troponin', label: 'Troponine', unit: 'ng/L', section: 'cardiaque', step: '0.1' },
  { key: 'd_dimers', label: 'D-Dimères', unit: 'ng/mL', section: 'cardiaque', step: '1' },
  { key: 'pro_bnp', label: 'Pro-BNP', unit: 'pg/mL', section: 'cardiaque', step: '1' },
] as const

const SECTIONS: { key: string; label: string; color: string }[] = [
  { key: 'inflammatoire', label: 'INFLAMMATOIRE / NFS', color: '#FF6B8A' },
  { key: 'lcr', label: 'LCR', color: '#6C7CFF' },
  { key: 'metabolique', label: 'MÉTABOLIQUE', color: '#FFB347' },
  { key: 'hepatique', label: 'HÉPATIQUE', color: '#2ED573' },
  { key: 'cardiaque', label: 'CARDIAQUE (PIMS)', color: '#B96BFF' },
]

export default function LabForm({ patientId, onSaved }: LabFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [csf_antibodies, setCsfAntibodies] = useState('')

  const setValue = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const data: LabResultInsert = { patient_id: patientId }
      for (const f of FIELDS) {
        const v = values[f.key]
        if (v !== undefined && v !== '') {
          (data as Record<string, unknown>)[f.key] = parseFloat(v)
        }
      }
      if (csf_antibodies) data.csf_antibodies = csf_antibodies

      await labService.record(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setValues({})
      setCsfAntibodies('')
      onSaved?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const filledCount = Object.values(values).filter(v => v !== '' && v !== undefined).length + (csf_antibodies ? 1 : 0)

  const inputStyle = {
    padding: '7px 8px', borderRadius: 'var(--p-radius-md)',
    background: 'var(--p-bg)', border: 'var(--p-border)',
    fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'var(--p-text)',
    width: '100%', outline: 'none',
  }
  const labelStyle = {
    fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700 as const,
    color: 'var(--p-text-dim)', letterSpacing: '0.3px', marginBottom: '3px', display: 'block' as const,
  }

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Picto name="blood" size={16} glow glowColor="rgba(108,124,255,0.5)" />
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#6C7CFF' }}>
          SAISIE BIOLOGIE
        </span>
        {filledCount > 0 && (
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
            ({filledCount} valeurs)
          </span>
        )}
      </div>

      {SECTIONS.map(section => {
        const sectionFields = FIELDS.filter(f => f.section === section.key)
        return (
          <div key={section.key} style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: section.color, letterSpacing: '0.5px', marginBottom: '6px' }}>
              {section.label}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {sectionFields.map(f => (
                <div key={f.key} style={{ flex: '1 1 90px', minWidth: '80px' }}>
                  <label style={labelStyle}>{f.label} <span style={{ opacity: 0.5 }}>({f.unit})</span></label>
                  <input type="number" step={f.step}
                    value={values[f.key] || ''}
                    onChange={e => setValue(f.key, e.target.value)}
                    placeholder="—" style={inputStyle} />
                </div>
              ))}
              {section.key === 'lcr' && (
                <div style={{ flex: '1 1 120px', minWidth: '100px' }}>
                  <label style={labelStyle}>LCR anticorps</label>
                  <select value={csf_antibodies} onChange={e => setCsfAntibodies(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">—</option>
                    <option value="negative">Négatif</option>
                    <option value="anti-NMDAR">Anti-NMDAR</option>
                    <option value="anti-LGI1">Anti-LGI1</option>
                    <option value="anti-CASPR2">Anti-CASPR2</option>
                    <option value="anti-GAD">Anti-GAD</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
        <button onClick={handleSave} disabled={saving || filledCount === 0} style={{
          padding: '10px 24px', borderRadius: 'var(--p-radius-lg)', border: 'none',
          cursor: saving || filledCount === 0 ? 'not-allowed' : 'pointer',
          background: saved ? '#2ED573' : filledCount > 0 ? 'linear-gradient(135deg, #6C7CFF, #B96BFF)' : 'var(--p-bg-elevated)',
          fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800,
          color: filledCount > 0 || saved ? '#fff' : 'var(--p-text-dim)',
          letterSpacing: '0.5px', transition: 'all 0.3s',
          boxShadow: saved ? '0 4px 16px rgba(46,213,115,0.3)' : filledCount > 0 ? '0 4px 16px rgba(108,124,255,0.3)' : 'none',
        }}>
          {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer la biologie'}
        </button>
        {error && (
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FF4757' }}>{error}</span>
        )}
      </div>
    </div>
  )
}
