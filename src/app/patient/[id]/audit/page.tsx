'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import { createClient } from '@/lib/supabase/client'
import Picto from '@/components/Picto'
import RoleGate, { AccessDenied } from '@/components/RoleGate'

/* ══════════════════════════════════════════════════════════════
   AUDIT TRAIL — Journal complet des actions (admin)
   ══════════════════════════════════════════════════════════════ */

interface AuditEntry {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  'patient.create': '#2ED573',
  'patient.update': '#6C7CFF',
  'patient.discharge': '#FFB347',
  'patient.transfer': '#B96BFF',
  'vitals.record': '#FF6B8A',
  'lab.record': '#B96BFF',
  'medication.prescribe': '#2FD1C8',
  'medication.stop': '#FFB347',
  'treatment.record': '#2FD1C8',
  'intake.admit': '#6C7CFF',
  'engine.compute': '#FFB347',
  'alert.acknowledge': '#FF4757',
  'alert.resolve': '#2ED573',
  'exam.record': '#B96BFF',
  'note.create': '#6C7CFF',
}

export default function AuditPage() {
  const { t } = useLang()
  const { info } = usePatient()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .eq('entity_id', info.id)
        .order('created_at', { ascending: false })
        .limit(100)

      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [info.id])

  return (
    <RoleGate require="audit.view" fallback={<AccessDenied message="L'audit trail est réservé aux administrateurs et médecins seniors." />}>
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="shield" size={28} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Audit trail</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Traçabilité complète {'\u00b7'} {info.displayName} {'\u00b7'} {entries.length} actions
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
          Chargement...
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
            Aucune action enregistrée
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {entries.map(e => {
            const color = ACTION_COLORS[e.action] || '#6C7CFF'
            const date = new Date(e.created_at)
            const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
            const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            const detailStr = e.details ? Object.entries(e.details)
              .filter(([, v]) => v != null && v !== '')
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')
              : ''

            return (
              <div key={e.id} style={{
                display: 'flex', gap: '10px', padding: '8px 12px', alignItems: 'flex-start',
                borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ minWidth: '70px' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>{dateStr}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text)' }}>{timeStr}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
                    padding: '1px 6px', borderRadius: '4px',
                    background: `${color}15`, color,
                  }}>
                    {e.action}
                  </span>
                  {detailStr && (
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '3px' }}>
                      {detailStr}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </RoleGate>
  )
}
