'use client'
import { useState, useEffect, useMemo } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import EngineDetailView from '@/components/EngineDetailView'
import { EngineResult } from '@/lib/engines/PatientState'

interface EnginePageConfig {
  engineKey: 'vpsResult' | 'tdeResult' | 'pveResult' | 'eweResult' | 'tpeResult'
  name: string
  fullName: string
  subtitle: string
  color: string
  icon: string
}

export default function EnginePageWrapper({ config }: { config: EnginePageConfig }) {
  const [mounted, setMounted] = useState(false)
  const [scenario, setScenario] = useState('FIRES')
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const result = ps[config.engineKey] as EngineResult | null

  return (
    <div className="page-enter-stagger" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'var(--p-space-2)' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', background: config.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'var(--p-font-mono)',
        }}>{config.name}</div>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>{config.fullName}</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: config.color, fontFamily: 'var(--p-font-mono)' }}>{config.subtitle}</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-5) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => setScenario(k)} className="hover-lift" style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? `2px solid ${config.color}` : 'var(--p-border)',
            background: scenario === k ? `${config.color}15` : 'var(--p-bg-elevated)',
            color: scenario === k ? config.color : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      <EngineDetailView
        engineName={config.name}
        fullName={config.fullName}
        color={config.color}
        result={result}
        ps={ps}
      />

      <div style={{ textAlign: 'center', padding: 'var(--p-space-4)', color: 'var(--p-text-dim)', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>
        PULSAR V15 — {config.name} Engine · 4 couches · Pipeline séquentiel
      </div>
    </div>
  )
}
