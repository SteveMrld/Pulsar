'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import { PHASES, type ClinicalPhase } from '@/contexts/PatientContext'

/* ══════════════════════════════════════════════════════════════
   FILE ACTIVE — PULSAR V17
   Tour de contrôle · Avatars · Phases · Quick access · Démo
   ══════════════════════════════════════════════════════════════ */

interface PatientCard {
  id: string; name: string; age: string; sex: 'male' | 'female'
  syndrome: string; hospDay: number; room: string
  vps: number; gcs: number; critAlerts: number
  phase: ClinicalPhase; lastEvent: string; isDemo: boolean
  vpsHistory: number[]
}

const PATIENT_MAP: Record<string, { id: string; name: string; age: string; sex: 'male' | 'female'; room: string; syndrome: string }> = {
  FIRES:    { id: 'ines',  name: 'Inès M.',  age: '4 ans',  sex: 'female', room: 'Réa Neuro — Lit 3',  syndrome: 'FIRES' },
  NMDAR:    { id: 'lucas', name: 'Lucas R.', age: '14 ans', sex: 'male',   room: 'Réa Neuro — Lit 7',  syndrome: 'Anti-NMDAR' },
  CYTOKINE: { id: 'amara', name: 'Amara T.', age: '8 ans',  sex: 'female', room: 'Neuropéd. — Lit 12', syndrome: 'MOGAD' },
  STABLE:   { id: 'noah',  name: 'Noah B.',  age: '6 ans',  sex: 'male',   room: 'Neuropéd. — Lit 5',  syndrome: 'Épil. focale' },
}

function detectPhase(hospDay: number, vps: number): ClinicalPhase {
  if (vps >= 70) return 'acute'
  if (hospDay <= 3) return 'acute'
  if (hospDay <= 7) return 'stabilization'
  if (hospDay <= 14) return 'monitoring'
  return 'recovery'
}

function buildDemoPatients(): PatientCard[] {
  return Object.entries(DEMO_PATIENTS).map(([key, demo]) => {
    const meta = PATIENT_MAP[key]
    if (!meta) return null
    const ps = new PatientState(demo.data)
    runPipeline(ps)
    const vps = ps.vpsResult?.synthesis.score ?? 0
    const vpsHistory = ps.vpsResult?.curve?.curveData?.slice(-6) ?? [vps]
    return {
      ...meta,
      hospDay: ps.hospDay,
      vps,
      gcs: ps.neuro.gcs,
      critAlerts: ps.alerts.filter(a => a.severity === 'critical').length,
      phase: detectPhase(ps.hospDay, vps),
      lastEvent: ps.neuro.seizureType.includes('refractory') ? 'Status réfractaire en cours'
        : ps.neuro.seizures24h > 3 ? `${ps.neuro.seizures24h} crises/24h`
        : ps.neuro.gcs <= 8 ? 'GCS critique'
        : 'Stable',
      isDemo: true,
      vpsHistory,
    }
  }).filter(Boolean) as PatientCard[]
}

/* ── Mini Avatar SVG ── */
function MiniAvatar({ sex, vpsColor, size = 36, name }: { sex: 'male' | 'female'; vpsColor: string; size?: number; name?: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : sex === 'female' ? 'F' : 'M'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${vpsColor}12`, border: `2px solid ${vpsColor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 0 12px ${vpsColor}15`,
    }}>
      <span style={{
        fontFamily: 'var(--p-font-mono)', fontWeight: 900,
        fontSize: size * 0.4, color: vpsColor, lineHeight: 1,
      }}>{initial}</span>
    </div>
  )
}

/* ── Mini VPS Sparkline ── */
function VPSSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 100)
  const w = 48, h = 20
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ opacity: 0.7 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * h} r="2" fill={color} />
    </svg>
  )
}

/* ── Phase Bar ── */
function PhaseBar({ phase }: { phase: ClinicalPhase }) {
  const p = PHASES[phase]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
      <div style={{
        width: '40px', height: '3px', borderRadius: '2px',
        background: p.color, boxShadow: `0 0 6px ${p.color}40`,
      }} />
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: p.color, fontWeight: 700 }}>{p.label}</span>
    </div>
  )
}

/* ── Patient Card Row ── */
function PatientRow({ p }: { p: PatientCard }) {
  const vpsColor = p.vps >= 70 ? '#FF4757' : p.vps >= 50 ? '#FFA502' : p.vps >= 30 ? '#FFB347' : '#2ED573'
  return (
    <Link href={`/patient/${p.id}/cockpit`} style={{ textDecoration: 'none' }}>
      <div className="card-interactive" style={{
        padding: '14px 18px', borderRadius: 'var(--p-radius-lg)',
        background: 'var(--p-bg-card)',
        border: p.vps >= 70 ? '1px solid rgba(255,71,87,0.15)' : 'var(--p-border)',
        display: 'grid', gridTemplateColumns: '44px 1fr auto auto auto auto auto',
        alignItems: 'center', gap: '14px',
        boxShadow: p.vps >= 70 ? '0 0 20px rgba(255,71,87,0.05)' : 'none',
        transition: 'all 0.2s',
      }}>
        {/* Avatar */}
        <MiniAvatar sex={p.sex} vpsColor={vpsColor} size={40} name={p.name} />

        {/* Identity + phase */}
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
          <PhaseBar phase={p.phase} />
        </div>

        {/* Syndrome */}
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: 'rgba(108,124,255,0.08)', color: '#6C7CFF',
        }}>{p.syndrome}</span>

        {/* Sparkline */}
        <VPSSparkline data={p.vpsHistory} color={vpsColor} />

        {/* Day */}
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: vpsColor }}>J+{p.hospDay}</span>

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
}

/* ── Pulsing Brain Animation ── */
function PulsingBrain() {
  return (
    <div className="animate-breathe" style={{
      width: '100px', height: '100px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(108,124,255,0.15) 0%, rgba(108,124,255,0.03) 70%, transparent 100%)',
      border: '1px solid rgba(108,124,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 0 40px rgba(108,124,255,0.1), inset 0 0 30px rgba(108,124,255,0.05)',
    }}>
      <Picto name="brain" size={44} glow glowColor="rgba(108,124,255,0.6)" />
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ onDemo, onNew }: { onDemo: () => void; onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <PulsingBrain />

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
          color: 'white', letterSpacing: '0.5px', width: '300px',
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
          color: 'var(--p-text-muted)', letterSpacing: '0.3px', width: '300px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>▶</span> Explorer avec des cas fictifs
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '48px',
        padding: '16px 0', borderTop: '1px solid var(--p-border)',
      }}>
        {[
          { value: '5', label: 'Moteurs IA' },
          { value: '59', label: 'Références' },
          { value: '5', label: 'Pathologies' },
          { value: '15', label: 'Cas registre' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color: '#6C7CFF', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px',
      }}>
        {[
          { href: '/observatory', label: 'Observatory', icon: 'dna', color: '#2FD1C8' },
          { href: '/neurocore', label: 'NeuroCore', icon: 'brain', color: '#B96BFF' },
          { href: '/cross-pathologie', label: 'Cross-Patho', icon: 'virus', color: '#FF6B8A' },
        ].map((link, i) => (
          <Link key={i} href={link.href} style={{
            padding: '8px 16px', borderRadius: 'var(--p-radius-lg)',
            background: `${link.color}08`, border: `1px solid ${link.color}15`,
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 600,
            color: link.color, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Picto name={link.icon} size={12} />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
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

          {/* Quick tools */}
          <div style={{
            display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap',
          }}>
            {[
              { href: '/neurocore', label: 'NeuroCore', icon: 'brain', color: '#B96BFF' },
              { href: '/case-matching', label: 'Case Matching', icon: 'heart', color: '#FF6B8A' },
              { href: '/cross-pathologie', label: 'Cross-Patho', icon: 'virus', color: '#FFB347' },
              { href: '/bilan', label: 'Bilan', icon: 'clipboard', color: '#2FD1C8' },
              { href: '/export', label: 'Export', icon: 'shield', color: '#6C7CFF' },
              { href: '/staff', label: 'Experts', icon: 'books', color: '#2ED573' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                padding: '6px 14px', borderRadius: 'var(--p-radius-full)',
                background: `${link.color}08`, border: `1px solid ${link.color}15`,
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600,
                color: link.color, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <Picto name={link.icon} size={11} />
                {link.label}
              </Link>
            ))}
          </div>

          {showDemo && (
            <div style={{
              marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
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
