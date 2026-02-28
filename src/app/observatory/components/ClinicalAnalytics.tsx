'use client'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { AggregateData } from '@/lib/data/observatoryTypes'
import Picto from '@/components/Picto'

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })

const COLORS: Record<string, string> = {
  FIRES: '#FF4757', EAIS: '#6C7CFF', NORSE: '#FF6B8A', PIMS: '#2FD1C8', MOGAD: '#FFB347',
}

export default function ClinicalAnalytics({ aggregates }: { aggregates: AggregateData[] }) {
  const cohortData = useMemo(() =>
    aggregates.map(a => ({ name: a.family, cohort: a.cohortSize, color: COLORS[a.family] || '#888' }))
  , [aggregates])

  return (
    <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--p-space-4)' }}>
        <Picto name="heart" size={22} glow glowColor="var(--p-tde)" />
        <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Clinical Analytics</span>
      </div>

      {/* Aggregates table */}
      <div style={{ overflowX: 'auto', marginBottom: 'var(--p-space-4)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--p-text-xs)' }}>
          <thead>
            <tr>
              {['Pathologie', 'Incidence', 'Mortalité', 'Âge médian', 'Cohorte', 'Source'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', color: 'var(--p-text-dim)', fontWeight: 600, fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aggregates.map(a => (
              <tr key={a.family}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', fontWeight: 700, color: COLORS[a.family] || 'var(--p-text)' }}>{a.family}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-muted)' }}>{a.incidence}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-muted)' }}>{a.mortality}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', color: 'var(--p-text-muted)' }}>{a.medianAge}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-text)' }}>{a.cohortSize}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-dark-4)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cohort size bar chart */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>TAILLE DES COHORTES</div>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={cohortData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,124,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--p-text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis tick={{ fill: 'var(--p-text-dim)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'var(--p-bg-elevated)', border: 'var(--p-border)', borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="cohort" radius={[6, 6, 0, 0]}>
              {cohortData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
