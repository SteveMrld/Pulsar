'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface UserMeta {
  email?: string
}

const statCards = [
  { label: 'Patients analysés', value: '0', icon: '👤', color: 'var(--p-vps)' },
  { label: 'Alertes critiques', value: '0', icon: '🚨', color: 'var(--p-critical)' },
  { label: 'Moteurs actifs', value: '5/5', icon: '🧠', color: 'var(--p-tde)' },
  { label: 'Crash tests', value: '7/7', icon: '✅', color: 'var(--p-success)' },
]

const engineStatus = [
  { name: 'VPS', full: 'Vital Prognosis Score', color: '#6C7CFF', status: 'ready' },
  { name: 'TDE', full: 'Therapeutic Decision', color: '#2FD1C8', status: 'ready' },
  { name: 'PVE', full: 'Pharmacovigilance', color: '#B96BFF', status: 'ready' },
  { name: 'EWE', full: 'Early Warning', color: '#FF6B8A', status: 'ready' },
  { name: 'TPE', full: 'Therapeutic Prospection', color: '#FFB347', status: 'ready' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<UserMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email })
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--p-bg)', color: 'var(--p-vps)', fontSize: 'var(--p-text-lg)',
      }}>
        Chargement des moteurs…
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── Top bar ── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--p-space-4) var(--p-space-6)',
        borderBottom: 'var(--p-border)',
        background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)' }}>
          <span style={{ fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em', fontSize: 'var(--p-text-lg)' }}>
            PULSAR
          </span>
          <span style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-xs)', fontFamily: 'var(--p-font-mono)' }}>
            Dashboard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <ThemeToggle />
          <span style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)' }}>
            {user?.email}
          </span>
          <button onClick={handleLogout} style={{
            background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
            borderRadius: 'var(--p-radius-md)',
            padding: 'var(--p-space-2) var(--p-space-3)',
            color: 'var(--p-text-muted)', cursor: 'pointer', fontSize: 'var(--p-text-sm)',
          }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--p-space-8) var(--p-space-6)' }}>
        {/* ── Stats Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--p-space-4)',
          marginBottom: 'var(--p-space-8)',
        }}>
          {statCards.map((s, i) => (
            <div key={i} style={{
              background: 'var(--p-bg-card)',
              border: 'var(--p-border)',
              borderRadius: 'var(--p-radius-lg)',
              padding: 'var(--p-space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-1)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: s.color }}>
                    {s.value}
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Engine Status ── */}
        <div style={{
          background: 'var(--p-bg-card)',
          border: 'var(--p-border)',
          borderRadius: 'var(--p-radius-xl)',
          padding: 'var(--p-space-6)',
          marginBottom: 'var(--p-space-8)',
        }}>
          <h2 style={{
            fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)',
            marginBottom: 'var(--p-space-5)',
          }}>
            Moteurs Cerveau — Pipeline V15
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
            {engineStatus.map((e) => (
              <div key={e.name} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)',
                padding: 'var(--p-space-3) var(--p-space-4)',
                background: 'var(--p-bg-elevated)',
                borderRadius: 'var(--p-radius-md)',
                borderLeft: `3px solid ${e.color}`,
              }}>
                <span style={{
                  fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                  color: e.color, minWidth: '3rem',
                }}>
                  {e.name}
                </span>
                <span style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', flex: 1 }}>
                  {e.full}
                </span>
                <span style={{
                  fontSize: 'var(--p-text-xs)',
                  fontFamily: 'var(--p-font-mono)',
                  padding: 'var(--p-space-1) var(--p-space-2)',
                  borderRadius: 'var(--p-radius-full)',
                  background: 'var(--p-success-bg)',
                  color: 'var(--p-success)',
                }}>
                  ● READY
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Empty State — New Analysis CTA ── */}
        <div style={{
          background: 'var(--p-bg-card)',
          border: '2px dashed var(--p-gray-1)',
          borderRadius: 'var(--p-radius-xl)',
          padding: 'var(--p-space-12)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--p-space-4)' }}>🧬</div>
          <h3 style={{
            fontSize: 'var(--p-text-xl)', fontWeight: 700, color: 'var(--p-text)',
            marginBottom: 'var(--p-space-3)',
          }}>
            Aucun patient analysé
          </h3>
          <p style={{
            color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)',
            marginBottom: 'var(--p-space-6)', maxWidth: '400px', margin: '0 auto var(--p-space-6)',
          }}>
            Créez votre premier cahier des charges clinique pour lancer l&apos;analyse complète via les 5 moteurs cerveau.
          </p>
          <Link href="/project" style={{
            display: 'inline-block',
            padding: 'var(--p-space-3) var(--p-space-8)',
            borderRadius: 'var(--p-radius-lg)',
            background: 'var(--p-vps)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            boxShadow: 'var(--p-shadow-glow-vps)',
          }}>
            Nouveau CDC
          </Link>
        </div>
      </main>
    </div>
  )
}
