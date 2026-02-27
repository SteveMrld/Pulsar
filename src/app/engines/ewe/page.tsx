'use client'
import EnginePageWrapper from '@/components/EnginePageWrapper'

export default function EWEPage() {
  return <EnginePageWrapper config={{
    engineKey: 'eweResult',
    name: 'EWE',
    fullName: 'Early Warning Engine',
    subtitle: 'Détection précoce des détériorations · Alertes prédictives — #FF6B8A',
    color: 'var(--p-ewe)',
    icon: '🔴',
  }} />
}
