'use client'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

export default function RessourcesPage() {
  const { ps, info } = usePatient()
  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="books" size={28} glow glowColor="rgba(255,179,71,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Ressources & Connaissances</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>NeuroCore KB · Guidelines · {info.displayName}</span>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #FFB347' }}>
        <p style={{ color: 'var(--p-text-muted)', fontSize: '13px' }}>Module en construction.</p>
      </div>
    </div>
  )
}
