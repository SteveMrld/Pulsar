'use client'
import EnginePageWrapper from '@/components/EnginePageWrapper'

export default function TDEPage() {
  return <EnginePageWrapper config={{
    engineKey: 'tdeResult',
    name: 'TDE',
    fullName: 'Therapeutic Decision Engine',
    subtitle: '2 champs · 4 patterns (FIRES/NMDAR/MOGAD/Échec) · Escalade 4 lignes — #2FD1C8',
    color: 'var(--p-tde)',
    icon: '💚',
  }} />
}
