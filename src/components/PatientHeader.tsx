'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Picto from '@/components/Picto'
import { exportPatientPDF } from '@/lib/exportPDF'
import type { PatientState } from '@/lib/engines/PatientState'

interface PatientHeaderProps {
  ps: PatientState
  patientId: string
  patientName: string
}

export default function PatientHeader({ ps, patientId, patientName }: PatientHeaderProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExportPDF() {
    setExporting(true)
    try {
      await exportPatientPDF(patientName, {
        priority: 'P1',
        service: 'Réa Neuro Pédiatrique',
        phase: ps.hospDay <= 3 ? 'Phase aiguë précoce' : ps.hospDay <= 10 ? 'Phase aiguë' : 'Phase subaiguë',
        diagnostic: ps.csf.antibodies === 'nmdar' ? 'Anti-NMDAR'
          : ps.csf.antibodies === 'mog' ? 'MOGAD'
          : ps.neuro.seizureType === 'refractory_status' ? 'FIRES'
          : ps.pims?.confirmed ? 'PIMS'
          : 'En cours d\'évaluation',
        jour: ps.hospDay,
        vpsScore: ps.vpsResult?.synthesis.score ?? 0,
        alertesCritiques: ps.alerts.filter(a => a.severity === 'critical').length,
        age: `${Math.floor(ps.ageMonths / 12)} ans`,
        sexe: ps.sex === 'female' ? 'F' : 'M',
        poids: `${ps.weightKg} kg`,
        gcs: ps.neuro.gcs,
      })
    } finally {
      setTimeout(() => setExporting(false), 1500)
    }
  }

  const vps = ps.vpsResult?.synthesis.score ?? 0
  const vpsColor = vps >= 70 ? '#8B5CF6' : vps >= 50 ? '#FFA502' : vps >= 30 ? '#FFB347' : '#2ED573'
  const vpsLevel = vps >= 70 ? 'CRITIQUE' : vps >= 50 ? 'SÉVÈRE' : vps >= 30 ? 'MODÉRÉ' : 'STABLE'
  const critAlerts = ps.alerts.filter(a => a.severity === 'critical').length
  const syndrome = ps.csf.antibodies === 'nmdar' ? 'Anti-NMDAR'
    : ps.csf.antibodies === 'mog' ? 'MOGAD'
    : ps.neuro.seizureType === 'refractory_status' ? 'FIRES'
    : ps.pims?.confirmed ? 'PIMS'
    : 'En cours'

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,18,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${critAlerts > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(108,124,255,0.06)'}`,
      padding: '8px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        {/* LEFT: Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back to file active */}
          <Link href="/patients" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(108,124,255,0.06)', textDecoration: 'none',
            transition: 'background 0.2s',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--p-text-dim)' }}>←</span>
          </Link>

          {/* VPS ring mini */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${vpsColor}12`, border: `2px solid ${vpsColor}40`,
            position: 'relative',
          }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 900, fontSize: '12px', color: vpsColor }}>{vps}</span>
            {critAlerts > 0 && (
              <div className="dot-critical" style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '8px', height: '8px', background: '#8B5CF6',
                boxShadow: '0 0 6px rgba(139,92,246,0.6)',
              }} />
            )}
          </div>

          {/* Name + meta */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--p-white)' }}>{patientName}</span>
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
                padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                background: `${vpsColor}12`, color: vpsColor, letterSpacing: '0.5px',
              }}>{vpsLevel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
                {Math.floor(ps.ageMonths / 12)} ans · {ps.sex === 'female' ? 'F' : 'M'} · {ps.weightKg}kg
              </span>
              <span style={{ color: 'rgba(108,124,255,0.15)' }}>|</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', fontWeight: 700 }}>
                {syndrome}
              </span>
              <span style={{ color: 'rgba(108,124,255,0.15)' }}>|</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: ps.hospDay <= 3 ? '#8B5CF6' : 'var(--p-text-dim)', fontWeight: 600 }}>
                J+{ps.hospDay}
              </span>
              <span style={{ color: 'rgba(108,124,255,0.15)' }}>|</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
                GCS {ps.neuro.gcs}/15
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Critical alerts */}
        {critAlerts > 0 && (
          <div className="animate-breathe" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '8px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <Picto name="warning" size={14} glow glowColor="rgba(139,92,246,0.4)" />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: '#8B5CF6' }}>
              {critAlerts} ALERTE{critAlerts > 1 ? 'S' : ''} CRITIQUE{critAlerts > 1 ? 'S' : ''}
            </span>
          </div>
        )}

        {/* RIGHT: Quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              padding: '5px 12px', borderRadius: '8px',
              background: exporting ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.08)',
              border: `1px solid rgba(16,185,129,${exporting ? '0.1' : '0.2'})`,
              fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
              color: exporting ? 'rgba(16,185,129,0.4)' : '#10B981',
              letterSpacing: '0.5px', cursor: exporting ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
            title="Exporter le dossier patient en PDF"
          >
            <span style={{ fontSize: '11px' }}>{exporting ? '⏳' : '📄'}</span>
            {exporting ? 'EXPORT...' : 'PDF'}
          </button>
          <Link href={`/patient/${patientId}/cockpit`} style={{
            padding: '5px 12px', borderRadius: '8px', textDecoration: 'none',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#8B5CF6',
            letterSpacing: '0.5px',
          }}>COCKPIT</Link>
          <Link href={`/patient/${patientId}/synthese`} style={{
            padding: '5px 12px', borderRadius: '8px', textDecoration: 'none',
            background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#6C7CFF',
            letterSpacing: '0.5px',
          }}>SYNTHÈSE</Link>
        </div>
      </div>
    </div>
  )
}
