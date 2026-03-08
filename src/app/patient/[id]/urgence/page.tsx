'use client'
import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

const ABCDE = [
  { step: 'A', label: 'Airway', desc: 'Voies aériennes libres ? Intubation nécessaire ?', color: '#8B5CF6' },
  { step: 'B', label: 'Breathing', desc: 'FR, SpO₂, tirage, auscultation', color: '#A78BFA' },
  { step: 'C', label: 'Circulation', desc: 'FC, PA, TRC, accès veineux ×2', color: '#FFB347' },
  { step: 'D', label: 'Disability', desc: 'GCS, pupilles, glycémie, convulsions', color: '#6C7CFF' },
  { step: 'E', label: 'Exposure', desc: 'Température, éruption, signes méningés', color: '#B96BFF' },
]

const BUNDLES = [
  { label: 'Bilan sanguin complet', icon: 'microscope', done: false },
  { label: 'Ponction lombaire', icon: 'dna', done: false },
  { label: 'EEG urgent', icon: 'eeg', done: false },
  { label: 'IRM cérébrale', icon: 'brain', done: false },
  { label: 'Voie IV sécurisée', icon: 'heart', done: false },
  { label: 'Anti-épileptique 1ère ligne', icon: 'pill', done: false },
  { label: 'Méthylprednisolone IV si suspicion AI', icon: 'shield', done: false },
  { label: 'Contact réanimation', icon: 'alert', done: false },
]

export default function UrgencePage() {
  const { t } = useLang()
  const { ps, info } = usePatient()
  const [checks, setChecks] = useState<boolean[]>(ABCDE.map(() => false))
  const [bundles, setBundles] = useState(BUNDLES.map(b => ({ ...b })))

  const toggle = (i: number) => setChecks(c => c.map((v, j) => j === i ? !v : v))
  const toggleBundle = (i: number) => setBundles(b => b.map((v, j) => j === i ? { ...v, done: !v.done } : v))

  const vps = ps.vpsResult?.synthesis.score ?? 0
  const isEmergency = vps >= 50 || ps.neuro.seizureType === 'refractory_status'
  const done = checks.filter(Boolean).length
  const bundleDone = bundles.filter(b => b.done).length

  return (
    <div className="page-enter-stagger">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Picto name="alert" size={28} glow glowColor="rgba(139,92,246,0.5)" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Mode Urgence</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Protocole 0–3h · {info.displayName} · J+{info.hospDay}
          </span>
        </div>
        {isEmergency && (
          <div className="animate-breathe" style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-full)',
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#8B5CF6',
          }}><Picto name="alert" size={14} glow glowColor="rgba(139,92,246,0.5)" /> URGENCE ACTIVE</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* LEFT: ABCDE Checklist */}
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderTop: '3px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '1px' }}>STABILISATION ABCDE</span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{done}/5</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ABCDE.map((a, i) => (
              <div key={a.step} onClick={() => toggle(i)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                background: checks[i] ? `${a.color}10` : 'var(--p-bg-elevated)',
                border: checks[i] ? `1px solid ${a.color}30` : 'var(--p-border)',
                opacity: checks[i] ? 0.7 : 1, transition: 'all 0.2s',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: checks[i] ? a.color : `${a.color}15`,
                  color: checks[i] ? 'white' : a.color,
                  fontWeight: 900, fontSize: '12px', fontFamily: 'var(--p-font-mono)',
                  transition: 'all 0.2s',
                }}>{checks[i] ? '✓' : a.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--p-text)', textDecoration: checks[i] ? 'line-through' : 'none' }}>{a.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '1px' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Bundles + Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Current status */}
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderLeft: `3px solid ${vps >= 70 ? '#8B5CF6' : '#6C7CFF'}` }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>ÉTAT PATIENT À L&apos;ARRIVÉE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'GCS', value: `${ps.neuro.gcs}/15`, color: ps.neuro.gcs <= 8 ? '#8B5CF6' : '#6C7CFF' },
                { label: 'Crises/24h', value: `${ps.neuro.seizures24h}`, color: ps.neuro.seizures24h > 6 ? '#8B5CF6' : '#FFB347' },
                { label: 'VPS', value: `${vps}`, color: vps >= 70 ? '#8B5CF6' : '#6C7CFF' },
                { label: 'FC', value: `${ps.hemodynamics.heartRate}`, color: ps.hemodynamics.heartRate > 140 ? '#8B5CF6' : '#2ED573' },
                { label: 'SpO₂', value: `${ps.hemodynamics.spo2}%`, color: ps.hemodynamics.spo2 < 95 ? '#8B5CF6' : '#2FD1C8' },
                { label: 'Temp', value: `${ps.hemodynamics.temp}°C`, color: ps.hemodynamics.temp >= 38.5 ? '#8B5CF6' : '#B96BFF' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: `${m.color}08` }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bundle checklist */}
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderTop: '3px solid #FFB347', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#FFB347', letterSpacing: '1px' }}>BUNDLE INITIAL</span>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{bundleDone}/{bundles.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {bundles.map((b, i) => (
                <div key={i} onClick={() => toggleBundle(i)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                  background: b.done ? 'rgba(46,213,115,0.06)' : 'transparent',
                  opacity: b.done ? 0.6 : 1, transition: 'all 0.2s',
                }}>
                  <Picto name={b.icon} size={14} />
                  <span style={{
                    flex: 1, fontSize: '11px', color: 'var(--p-text-muted)',
                    textDecoration: b.done ? 'line-through' : 'none',
                  }}>{b.label}</span>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    border: b.done ? '2px solid #2ED573' : '2px solid rgba(108,124,255,0.15)',
                    background: b.done ? '#2ED573' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', color: 'white', fontWeight: 800,
                  }}>{b.done ? '✓' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {ps.alerts.filter(a => a.severity === 'critical').length > 0 && (
            <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)', borderLeft: '3px solid #8B5CF6' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#8B5CF6', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>
                ALERTES CRITIQUES
              </div>
              {ps.alerts.filter(a => a.severity === 'critical').slice(0, 4).map((a, i) => (
                <div key={i} style={{
                  padding: '6px 8px', marginBottom: '4px', borderRadius: '6px',
                  background: 'rgba(139,92,246,0.06)', fontSize: '10px', color: 'var(--p-text-muted)',
                }}>
                  <span style={{ fontWeight: 700, color: '#8B5CF6' }}>{a.title}</span> — {a.body}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ILLUSTRATION BBB ── */}
      <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,107,53,0.2)', background: 'rgba(0,0,0,0.3)' }}>
        <img src="/assets/illustrations/PULSAR_BBB_FIRES_detailed.png" alt="Barrière hémato-encéphalique FIRES" style={{ width: '100%', display: 'block', opacity: 0.9 }} />
        <div style={{ padding: '8px 14px', fontFamily: 'var(--p-font-mono)', fontSize: 9, color: 'rgba(255,107,53,0.7)', borderTop: '1px solid rgba(255,107,53,0.1)' }}>Barrière hémato-encéphalique · Perméabilité +340% · CAE Engine</div>
      </div>
    </div>
  )
}
