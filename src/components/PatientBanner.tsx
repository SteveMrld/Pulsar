'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import Picto from './Picto'

/**
 * PatientBanner — bracelet patient numérique
 * Toujours visible en haut de chaque page.
 * Montre : identité, hypothèse, GCS, jour, alertes critiques.
 */
export default function PatientBanner() {
  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS['FIRES'].data)
    runPipeline(p)
    return p
  }, [])

  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')
  const warnAlerts = ps.alerts.filter(a => a.severity === 'warning')
  const totalAlerts = critAlerts.length + warnAlerts.length

  const hypothesis = 'FIRES suspecté'
  const topScore = `${ps.vpsResult?.synthesis.score ?? 0}/100`
  const gcs = ps.neuro.gcs
  const gcsColor = gcs <= 8 ? 'var(--p-critical)' : gcs <= 12 ? 'var(--p-warning)' : 'var(--p-success)'

  return (
    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
      <div className="glass" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--p-space-3)',
        padding: '6px var(--p-space-5)',
        borderBottom: '1px solid rgba(108,124,255,0.06)',
        fontSize: 'var(--p-text-xs)',
        cursor: 'pointer',
        transition: 'background 150ms',
        flexWrap: 'wrap',
        minHeight: '36px',
      }}>
        {/* Patient identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--p-success)',
            boxShadow: '0 0 6px var(--p-success)',
            animation: 'breathe 3s ease-in-out infinite',
          }} />
          <span style={{ fontWeight: 700, color: 'var(--p-text)' }}>
            Inès
          </span>
          <span style={{ color: 'var(--p-text-dim)' }}>·</span>
          <span style={{ color: 'var(--p-text-muted)' }}>4 ans · F</span>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '16px', background: 'var(--p-gray-1)' }} />

        {/* Hypothesis */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '10px',
            padding: '1px 8px', borderRadius: 'var(--p-radius-full)',
            background: 'var(--p-critical-bg)', color: 'var(--p-critical)',
          }}>
            {hypothesis}
          </span>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontWeight: 600, fontSize: '10px',
            color: 'var(--p-text-dim)',
          }}>
            {topScore}
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '16px', background: 'var(--p-gray-1)' }} />

        {/* GCS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--p-text-dim)', fontSize: '10px' }}>GCS</span>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px',
            color: gcsColor,
          }}>
            {gcs}/15
          </span>
        </div>

        {/* Day */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)',
        }}>
          J+1
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Active alerts */}
        {totalAlerts > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
            background: critAlerts.length > 0 ? 'var(--p-critical-bg)' : 'var(--p-warning-bg)',
          }}>
            <Picto name="warning" size={12} />
            <span style={{
              fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '10px',
              color: critAlerts.length > 0 ? 'var(--p-critical)' : 'var(--p-warning)',
            }}>
              {totalAlerts} alerte{totalAlerts > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
