'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

/* ══════════════════════════════════════════════════════════════
   FILE ACTIVE — PULSAR
   Tour de contrôle · Patients actifs · Alertes critiques
   ══════════════════════════════════════════════════════════════ */

interface PatientCard {
  id: string; name: string; age: string; sex: 'male' | 'female'
  syndrome: string; hospDay: number; room: string
  vps: number; gcs: number; critAlerts: number
  lastEvent: string
}

const PATIENT_MAP: Record<string, { id: string; name: string; age: string; sex: 'male' | 'female'; room: string; syndrome: string }> = {
  FIRES:    { id: 'ines',  name: 'Inès M.',  age: '4 ans',  sex: 'female', room: 'Réa Neuro — Lit 3',  syndrome: 'FIRES' },
  NMDAR:    { id: 'lucas', name: 'Lucas R.', age: '14 ans', sex: 'male',   room: 'Réa Neuro — Lit 7',  syndrome: 'Anti-NMDAR' },
  CYTOKINE: { id: 'amara', name: 'Amara T.', age: '8 ans',  sex: 'female', room: 'Neuropéd. — Lit 12', syndrome: 'MOGAD' },
  STABLE:   { id: 'noah',  name: 'Noah B.',  age: '6 ans',  sex: 'male',   room: 'Neuropéd. — Lit 5',  syndrome: 'Épil. focale' },
}

export default function FileActivePage() {
  const [search, setSearch] = useState('')

  const patients: PatientCard[] = useMemo(() => {
    return Object.entries(DEMO_PATIENTS).map(([key, demo]) => {
      const meta = PATIENT_MAP[key]
      if (!meta) return null
      const ps = new PatientState(demo.data)
      runPipeline(ps)
      return {
        ...meta,
        hospDay: ps.hospDay,
        vps: ps.vpsResult?.synthesis.score ?? 0,
        gcs: ps.neuro.gcs,
        critAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
        lastEvent: ps.neuro.seizureType.includes('refractory') ? 'Status réfractaire en cours'
          : ps.neuro.seizures24h > 3 ? `${ps.neuro.seizures24h} crises/24h`
          : ps.neuro.gcs <= 8 ? 'GCS critique'
          : 'Stable',
      }
    }).filter(Boolean) as PatientCard[]
  }, [])

  const sorted = patients
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.syndrome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.vps - a.vps)

  const criticalCount = patients.filter(p => p.vps >= 70).length
  const warningCount = patients.filter(p => p.vps >= 40 && p.vps < 70).length
  const totalAlerts = patients.reduce((s, p) => s + p.critAlerts, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', padding: '0' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Picto name="brain" size={28} glow glowColor="rgba(108,124,255,0.5)" />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-text)', margin: 0, lineHeight: 1.2 }}>PULSAR</h1>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>FILE ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Summary badges */}
          {criticalCount > 0 && (
            <div className="animate-breathe" style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#FF4757',
            }}>🔴 {criticalCount} critique{criticalCount > 1 ? 's' : ''}</div>
          )}
          {warningCount > 0 && (
            <div style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'rgba(255,165,2,0.08)', border: '1px solid rgba(255,165,2,0.15)',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: '#FFA502',
            }}>⚠ {warningCount} vigilance</div>
          )}
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)',
          }}>{patients.length} patients</div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── SEARCH + NEW PATIENT ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: 'var(--p-radius-lg)',
            background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
          }}>
            <span style={{ color: 'var(--p-text-dim)', fontSize: '14px' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un patient..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--p-font-body)', fontSize: '13px', color: 'var(--p-text)',
              }}
            />
          </div>
          <button style={{
            padding: '10px 20px', borderRadius: 'var(--p-radius-lg)',
            background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700,
            color: 'white', letterSpacing: '0.5px',
            boxShadow: '0 4px 16px rgba(108,124,255,0.3)',
          }}>+ Nouveau patient</button>
        </div>

        {/* ── CRITICAL ALERTS BANNER ── */}
        {totalAlerts > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
            background: 'rgba(255,71,87,0.04)', border: '1px solid rgba(255,71,87,0.12)',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '18px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#FF4757', letterSpacing: '0.5px' }}>
                {totalAlerts} ALERTE{totalAlerts > 1 ? 'S' : ''} CRITIQUE{totalAlerts > 1 ? 'S' : ''}
              </div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                {sorted.filter(p => p.critAlerts > 0).map(p => p.name).join(' · ')}
              </div>
            </div>
          </div>
        )}

        {/* ── PATIENT CARDS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map(p => {
            const vpsColor = p.vps >= 70 ? '#FF4757' : p.vps >= 50 ? '#FFA502' : p.vps >= 30 ? '#FFB347' : '#2ED573'
            return (
              <Link key={p.id} href={`/patient/${p.id}/cockpit`} style={{ textDecoration: 'none' }}>
                <div className="card-interactive" style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--p-radius-lg)',
                  background: 'var(--p-bg-card)',
                  border: p.vps >= 70 ? '1px solid rgba(255,71,87,0.15)' : 'var(--p-border)',
                  display: 'grid',
                  gridTemplateColumns: '8px 1fr auto auto auto auto',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: p.vps >= 70 ? '0 0 20px rgba(255,71,87,0.05)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {/* Status dot */}
                  <div className={p.vps >= 50 ? 'dot-critical' : 'dot-alive'} style={{
                    width: '8px', height: '8px', background: vpsColor,
                    boxShadow: `0 0 6px ${vpsColor}`,
                  }} />

                  {/* Identity */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--p-text)' }}>{p.name}</span>
                      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{p.age} · {p.room}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                      {p.lastEvent}
                    </div>
                  </div>

                  {/* Syndrome */}
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
                    background: 'rgba(108,124,255,0.08)', color: '#6C7CFF',
                  }}>{p.syndrome}</span>

                  {/* Day */}
                  <span style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
                    color: vpsColor,
                  }}>J+{p.hospDay}</span>

                  {/* GCS */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: p.gcs <= 8 ? '#FF4757' : 'var(--p-text)', lineHeight: 1 }}>{p.gcs}</div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>GCS</div>
                  </div>

                  {/* VPS */}
                  <div style={{
                    textAlign: 'center', padding: '6px 12px', borderRadius: 'var(--p-radius-md)',
                    background: `${vpsColor}10`, border: `1px solid ${vpsColor}20`, minWidth: '50px',
                  }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: vpsColor, lineHeight: 1 }}>{p.vps}</div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: vpsColor, opacity: 0.7 }}>VPS</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
