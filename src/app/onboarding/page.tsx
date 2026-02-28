'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Picto from '@/components/Picto'

const FEATURES = [
  { icon: 'brain', label: '5 Brain Engines', desc: 'VPS · TDE · PVE · EWE · TPE', color: 'var(--p-vps)' },
  { icon: 'chart', label: '4 couches/moteur', desc: 'Intention · Contexte · Règles · Courbe', color: 'var(--p-tde)' },
  { icon: 'shield', label: 'Pharmacovigilance', desc: 'Interactions & contre-indications temps réel', color: 'var(--p-pve)' },
  { icon: 'alert', label: 'Mode Urgence', desc: 'Score VPS immédiat en 3 minutes', color: 'var(--p-critical)' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [sex, setSex] = useState<'M' | 'F' | null>(null)
  const [launching, setLaunching] = useState(false)

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--p-space-6)' }}>
      <div className="page-enter" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>

        {/* Step 0: Welcome splash */}
        {step === 0 && (
          <div>
            <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={100} height={100} style={{ borderRadius: 20, margin: '0 auto var(--p-space-5)', display: 'block', filter: 'drop-shadow(0 0 30px rgba(108,124,255,0.4))' }} />
            <h1 style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde), var(--p-pve))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--p-space-2)' }}>PULSAR</h1>
            <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-2)' }}>Pediatric Urgent Limbic &amp; Systemic Alert Response</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-8)' }}>Version 15 — Fusion Définitive</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-6)', textAlign: 'left' }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="glass-card" style={{ padding: 'var(--p-space-4)', display: 'flex', gap: 'var(--p-space-3)', alignItems: 'center' }}>
                  <Picto name={f.icon} size={28} glow glowColor={f.color} />
                  <div>
                    <div style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, color: f.color }}>{f.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(1)} style={{
              padding: '14px 48px', borderRadius: 'var(--p-radius-lg)', border: 'none',
              background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde))', color: '#fff',
              fontSize: 'var(--p-text-base)', fontWeight: 800, cursor: 'pointer',
              boxShadow: 'var(--p-shadow-glow-vps)', transition: 'all 200ms',
            }}>Commencer</button>
          </div>
        )}

        {/* Step 1: Sex selection with silhouettes */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-2)' }}>Profil patient</h2>
            <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-6)' }}>Sélectionnez le profil pour adapter les normes vitales</p>

            <div style={{ display: 'flex', gap: 'var(--p-space-5)', justifyContent: 'center', marginBottom: 'var(--p-space-6)' }}>
              {([['M', 'Garçon', '/assets/silhouette-boy.jpg', 'var(--p-vps)'], ['F', 'Fille', '/assets/silhouette-girl.jpg', 'var(--p-pve)']] as const).map(([s, label, img, color]) => (
                <button key={s} onClick={() => setSex(s)} style={{
                  width: '200px', padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)', cursor: 'pointer',
                  border: sex === s ? `3px solid ${color}` : '2px solid var(--p-gray-2)',
                  background: sex === s ? `${color}10` : 'var(--p-bg-elevated)', transition: 'all 200ms',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--p-space-3)',
                }}>
                  <img src={img} alt={label} width={120} height={160} style={{ borderRadius: 12, objectFit: 'cover', filter: sex === s ? `drop-shadow(0 0 20px ${color})` : 'brightness(0.7)', transition: 'all 200ms' }} />
                  <span style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: sex === s ? color : 'var(--p-text-muted)' }}>{label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center' }}>
              <button onClick={() => setStep(0)} style={{ padding: '10px 24px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text-muted)', cursor: 'pointer', fontSize: 'var(--p-text-sm)' }}>Retour</button>
              <button onClick={() => sex && setStep(2)} disabled={!sex} style={{
                padding: '10px 32px', borderRadius: 'var(--p-radius-md)', border: 'none',
                background: sex ? 'linear-gradient(135deg, var(--p-vps), var(--p-tde))' : 'var(--p-gray-2)',
                color: sex ? '#fff' : 'var(--p-text-dim)', cursor: sex ? 'pointer' : 'not-allowed',
                fontSize: 'var(--p-text-sm)', fontWeight: 700,
              }}>Continuer</button>
            </div>
          </div>
        )}

        {/* Step 2: Launch */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 'var(--p-space-6)' }}>
              <Picto name="brain" size={64} glow glowColor="var(--p-vps)" />
            </div>
            <h2 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>Système prêt</h2>
            <p style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-5)' }}>
              5 moteurs chargés · Normes {sex === 'M' ? 'garçon' : 'fille'} · Pipeline actif
            </p>

            <div className="glass-card" style={{ padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-6)', display: 'flex', justifyContent: 'space-around' }}>
              {['VPS', 'TDE', 'PVE', 'EWE', 'TPE'].map((eng, i) => (
                <div key={eng} style={{ textAlign: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: `var(--p-${eng.toLowerCase()})`, margin: '0 auto 4px', boxShadow: `0 0 8px var(--p-${eng.toLowerCase()})` }} />
                  <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--p-font-mono)', color: `var(--p-${eng.toLowerCase()})` }}>{eng}</div>
                  <div style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>Ready</div>
                </div>
              ))}
            </div>

            {launching ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid var(--p-vps)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-vps)', fontWeight: 600 }}>Initialisation du pipeline...</span>
              </div>
            ) : (
              <button onClick={handleLaunch} style={{
                padding: '16px 64px', borderRadius: 'var(--p-radius-lg)', border: 'none',
                background: 'linear-gradient(135deg, var(--p-vps), var(--p-tde), var(--p-pve))', color: '#fff',
                fontSize: 'var(--p-text-lg)', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 0 30px rgba(108,124,255,0.3)', transition: 'all 200ms',
              }}>Lancer PULSAR</button>
            )}
          </div>
        )}

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'var(--p-space-6)' }}>
          {[0, 1, 2].map(s => (
            <div key={s} style={{
              width: step === s ? '24px' : '8px', height: '8px', borderRadius: '4px',
              background: step >= s ? 'var(--p-vps)' : 'var(--p-gray-2)', transition: 'all 300ms',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
