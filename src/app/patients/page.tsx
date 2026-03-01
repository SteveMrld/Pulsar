'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

/* ══════════════════════════════════════════════════════════════
   FILE ACTIVE — PULSAR V17
   Tour de contrôle · Patients actifs · Mode démo · Admission
   ══════════════════════════════════════════════════════════════ */

interface PatientCard {
  id: string; name: string; age: string; sex: 'male' | 'female'
  syndrome: string; hospDay: number; room: string
  vps: number; gcs: number; critAlerts: number
  lastEvent: string; isDemo: boolean
}

const PATIENT_MAP: Record<string, { id: string; name: string; age: string; sex: 'male' | 'female'; room: string; syndrome: string }> = {
  FIRES:    { id: 'ines',  name: 'Inès M.',  age: '4 ans',  sex: 'female', room: 'Réa Neuro — Lit 3',  syndrome: 'FIRES' },
  NMDAR:    { id: 'lucas', name: 'Lucas R.', age: '14 ans', sex: 'male',   room: 'Réa Neuro — Lit 7',  syndrome: 'Anti-NMDAR' },
  CYTOKINE: { id: 'amara', name: 'Amara T.', age: '8 ans',  sex: 'female', room: 'Neuropéd. — Lit 12', syndrome: 'MOGAD' },
  STABLE:   { id: 'noah',  name: 'Noah B.',  age: '6 ans',  sex: 'male',   room: 'Neuropéd. — Lit 5',  syndrome: 'Épil. focale' },
}

function buildDemoPatients(): PatientCard[] {
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
      isDemo: true,
    }
  }).filter(Boolean) as PatientCard[]
}

/* ── Empty State ── */
function EmptyState({ onDemo, onNew }: { onDemo: () => void; onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(108,124,255,0.08)', border: '1px solid rgba(108,124,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Picto name="heart" size={36} glow glowColor="rgba(108,124,255,0.4)" />
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '8px' }}>
        Aucun patient actif
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--p-text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
        Admettez un nouveau patient pour commencer l&apos;analyse clinique,
        ou explorez la démo avec des cas fictifs.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button onClick={onNew} style={{
          padding: '14px 32px', borderRadius: 'var(--p-radius-lg)',
          background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--p-font-mono)', fontSize: '13px', fontWeight: 700,
          color: 'white', letterSpacing: '0.5px', width: '280px',
          boxShadow: '0 4px 20px rgba(108,124,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>+</span> Nouveau patient
        </button>
        <button onClick={onDemo} style={{
          padding: '12px 32px', borderRadius: 'var(--p-radius-lg)',
          background: 'var(--p-bg-elevated)',
          border: '1px solid rgba(108,124,255,0.15)', cursor: 'pointer',
          fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 600,
          color: 'var(--p-text-muted)', letterSpacing: '0.3px', width: '280px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>▶</span> Explorer avec des cas fictifs
        </button>
      </div>
    </div>
  )
}

/* ── Patient Row ── */
function PatientRow({ p }: { p: PatientCard }) {
  const vpsColor = p.vps >= 70 ? '#FF4757' : p.vps >= 50 ? '#FFA502' : p.vps >= 30 ? '#FFB347' : '#2ED573'
  return (
    <Link href={`/patient/${p.id}/cockpit`} style={{ textDecoration: 'none' }}>
      <div className="card-interactive" style={{
        padding: '14px 18px', borderRadius: 'var(--p-radius-lg)',
        background: 'var(--p-bg-card)',
        border: p.vps >= 70 ? '1px solid rgba(255,71,87,0.15)' : 'var(--p-border)',
        display: 'grid', gridTemplateColumns: '8px 1fr auto auto auto auto',
        alignItems: 'center', gap: '16px',
        boxShadow: p.vps >= 70 ? '0 0 20px rgba(255,71,87,0.05)' : 'none',
        transition: 'all 0.2s',
      }}>
        <div className={p.vps >= 50 ? 'dot-critical' : 'dot-alive'} style={{
          width: '8px', height: '8px', background: vpsColor, boxShadow: `0 0 6px ${vpsColor}`,
        }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--p-text)' }}>{p.name}</span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{p.age} · {p.room}</span>
            {p.isDemo && (
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
                padding: '1px 6px', borderRadius: 'var(--p-radius-full)',
                background: 'rgba(108,124,255,0.08)', color: 'var(--p-text-dim)',
                border: '1px solid rgba(108,124,255,0.1)',
              }}>DÉMO</span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{p.lastEvent}</div>
        </div>
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: 'rgba(108,124,255,0.08)', color: '#6C7CFF',
        }}>{p.syndrome}</span>
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: vpsColor }}>J+{p.hospDay}</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: p.gcs <= 8 ? '#FF4757' : 'var(--p-text)', lineHeight: 1 }}>{p.gcs}</div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>GCS</div>
        </div>
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
}

/* ── Main ── */
export default function FileActivePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  const realPatients: PatientCard[] = []
  const demoPatients = useMemo(() => buildDemoPatients(), [])
  const activePatients = showDemo ? [...realPatients, ...demoPatients] : realPatients

  const filtered = activePatients
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.syndrome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.vps - a.vps)

  const criticalCount = activePatients.filter(p => p.vps >= 70).length
  const warningCount = activePatients.filter(p => p.vps >= 40 && p.vps < 70).length
  const totalAlerts = activePatients.reduce((s, p) => s + p.critAlerts, 0)
  const hasPatients = activePatients.length > 0

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setShowDemo(!showDemo)} style={{
            padding: '6px 14px', borderRadius: 'var(--p-radius-full)',
            background: showDemo ? 'rgba(108,124,255,0.12)' : 'transparent',
            border: showDemo ? '1px solid rgba(108,124,255,0.25)' : '1px solid var(--p-border)',
            cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 600,
            color: showDemo ? '#6C7CFF' : 'var(--p-text-dim)',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: showDemo ? '#6C7CFF' : 'var(--p-text-dim)',
              boxShadow: showDemo ? '0 0 6px rgba(108,124,255,0.5)' : 'none',
            }} />
            Démo
          </button>
          {/* Observatory link */}
          <Link href="/observatory" style={{
            padding: '6px 14px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(47,209,200,0.08)', border: '1px solid rgba(47,209,200,0.15)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 600,
            color: '#2FD1C8', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Picto name="dna" size={12} />
            Observatory
          </Link>
          {hasPatients && criticalCount > 0 && (
            <div className="animate-breathe" style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#FF4757',
            }}>{criticalCount} critique{criticalCount > 1 ? 's' : ''}</div>
          )}
          {hasPatients && warningCount > 0 && (
            <div style={{
              padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
              background: 'rgba(255,165,2,0.08)', border: '1px solid rgba(255,165,2,0.15)',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: '#FFA502',
            }}>{warningCount} vigilance</div>
          )}
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)',
          }}>{activePatients.length} patient{activePatients.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {!hasPatients ? (
        <EmptyState onDemo={() => setShowDemo(true)} onNew={() => router.push('/patients/admission')} />
      ) : (
        <div style={{ padding: '20px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
            }}>
              <Picto name="microscope" size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un patient..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'var(--p-font-body)', fontSize: '13px', color: 'var(--p-text)' }}
              />
            </div>
            <button onClick={() => router.push('/patients/admission')} style={{
              padding: '10px 20px', borderRadius: 'var(--p-radius-lg)',
              background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700,
              color: 'white', letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(108,124,255,0.3)',
            }}>+ Nouveau patient</button>
          </div>

          {totalAlerts > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'rgba(255,71,87,0.04)', border: '1px solid rgba(255,71,87,0.12)',
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <Picto name="alert" size={18} glow glowColor="rgba(255,71,87,0.4)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#FF4757', letterSpacing: '0.5px' }}>
                  {totalAlerts} ALERTE{totalAlerts > 1 ? 'S' : ''} CRITIQUE{totalAlerts > 1 ? 'S' : ''}
                </div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                  {filtered.filter(p => p.critAlerts > 0).map(p => p.name).join(' · ')}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(p => <PatientRow key={p.id} p={p} />)}
          </div>

          {showDemo && (
            <div style={{
              marginTop: '20px', padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'rgba(108,124,255,0.04)', border: '1px solid rgba(108,124,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
                Mode démo actif — {demoPatients.length} cas fictifs
              </span>
              <button onClick={() => setShowDemo(false)} style={{
                padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
                background: 'rgba(108,124,255,0.08)', border: '1px solid rgba(108,124,255,0.15)',
                cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '9px',
                color: '#6C7CFF', fontWeight: 600,
              }}>Masquer la démo</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
