'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'
import { noteService } from '@/lib/services'
import type { NoteType } from '@/lib/types/database'

interface NoteFormProps {
  patientId: string
  onSaved?: () => void
}

const NOTE_TYPES: { value: NoteType; label: string; icon: string; color: string }[] = [
  { value: 'observation', label: 'Observation', icon: 'eye', color: '#6C7CFF' },
  { value: 'prescription', label: 'Prescription', icon: 'pill', color: '#A78BFA' },
  { value: 'decision', label: 'Décision', icon: 'brain', color: '#B96BFF' },
  { value: 'handoff', label: 'Transmission', icon: 'transfer', color: '#FFB347' },
  { value: 'family', label: 'Entretien famille', icon: 'heart', color: '#2ED573' },
]

export default function NoteForm({ patientId, onSaved }: NoteFormProps) {
  const [noteType, setNoteType] = useState<NoteType>('observation')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await noteService.create(patientId, content.trim(), noteType)
      setSaved(true)
      setContent('')
      setTimeout(() => setSaved(false), 3000)
      onSaved?.()
    } catch (err) {
      console.error('[NoteForm]', err)
    } finally {
      setSaving(false)
    }
  }

  const active = NOTE_TYPES.find(t => t.value === noteType)

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Picto name="note" size={16} glow glowColor="rgba(108,124,255,0.5)" />
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#6C7CFF' }}>
          NOTE CLINIQUE
        </span>
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {NOTE_TYPES.map(t => (
          <button key={t.value} onClick={() => setNoteType(t.value)} style={{
            padding: '5px 10px', borderRadius: 'var(--p-radius-md)', border: 'none', cursor: 'pointer',
            background: noteType === t.value ? `${t.color}20` : 'transparent',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
            color: noteType === t.value ? t.color : 'var(--p-text-dim)',
            transition: 'all 0.2s',
            outline: noteType === t.value ? `1px solid ${t.color}40` : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={`Saisir ${active?.label.toLowerCase() || 'note'}...`}
        rows={3}
        style={{
          width: '100%', padding: '10px', borderRadius: 'var(--p-radius-md)',
          background: 'var(--p-bg)', border: 'var(--p-border)', resize: 'vertical',
          fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'var(--p-text)',
          outline: 'none', minHeight: '60px',
        }}
      />

      <button onClick={handleSave} disabled={saving || !content.trim()} style={{
        marginTop: '8px', padding: '8px 20px', borderRadius: 'var(--p-radius-lg)', border: 'none',
        cursor: !content.trim() || saving ? 'not-allowed' : 'pointer',
        background: saved ? '#2ED573' : content.trim() ? (active?.color || '#6C7CFF') : 'var(--p-bg-elevated)',
        fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800,
        color: content.trim() || saved ? '#fff' : 'var(--p-text-dim)',
        transition: 'all 0.3s',
      }}>
        {saving ? '...' : saved ? '✓ Enregistré' : 'Enregistrer'}
      </button>
    </div>
  )
}
