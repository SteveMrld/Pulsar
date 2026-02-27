'use client'
import EnginePageWrapper from '@/components/EnginePageWrapper'

export default function TPEPage() {
  return <EnginePageWrapper config={{
    engineKey: 'tpeResult',
    name: 'TPE',
    fullName: 'Therapeutic Prospection Engine',
    subtitle: 'Prospection thérapeutique · Recommandations à J+7/14 — #FFB347',
    color: 'var(--p-tpe)',
    icon: '🟠',
  }} />
}
