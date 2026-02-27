'use client'
import EnginePageWrapper from '@/components/EnginePageWrapper'

export default function PVEPage() {
  return <EnginePageWrapper config={{
    engineKey: 'pveResult',
    name: 'PVE',
    fullName: 'Pharmacovigilance Engine',
    subtitle: '3 champs · Interactions critiques · Patterns cocktail/immunosuppresseur — #B96BFF',
    color: 'var(--p-pve)',
    icon: '💟',
  }} />
}
