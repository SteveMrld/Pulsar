'use client'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

export default function ExamensPage() {
  const { ps, info } = usePatient()
  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="microscope" size={28} glow glowColor="rgba(185,107,255,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Examens & Biomarqueurs</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Preuves objectives · {info.displayName}</span>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #B96BFF' }}>
        <p style={{ color: 'var(--p-text-muted)', fontSize: '13px' }}>Module en construction.</p>
      </div>
    </div>
  )
}
