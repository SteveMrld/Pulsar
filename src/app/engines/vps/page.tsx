'use client'
import EnginePageWrapper from '@/components/EnginePageWrapper'

export default function VPSPage() {
  return <EnginePageWrapper config={{
    engineKey: 'vpsResult',
    name: 'VPS',
    fullName: 'Vital Prognosis Score',
    subtitle: '4 champs sémantiques · 5 patterns · 4 règles métier — #6C7CFF',
    color: 'var(--p-vps)',
    icon: '💜',
  }} />
}
