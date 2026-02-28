'use client'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

export default function TraitementPage() {
  const { ps, info } = usePatient()
  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="pill" size={28} glow glowColor="rgba(47,209,200,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Traitement</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Décision thérapeutique · {info.displayName}</span>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #2FD1C8' }}>
        <p style={{ color: 'var(--p-text-muted)', fontSize: '13px' }}>Module en construction.</p>
      </div>
    </div>
  )
}
