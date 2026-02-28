'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'

/* ══════════════════════════════════════════════════════════════
   APP SHELL — Header minimal hors-patient
   Plus de sidebar, plus de PatientBanner global.
   Le patient layout gère son propre header + tabs + PulsarAI.
   ══════════════════════════════════════════════════════════════ */

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = ['/', '/login', '/signup'].includes(pathname)
  const isPatient = pathname.startsWith('/patient/')

  useEffect(() => {
    if (isPublic) { setLoading(false); return }
    if (typeof window !== 'undefined' && localStorage.getItem('pulsar-demo') === 'true') {
      setUser('demo@pulsar.app')
      setLoading(false)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setUser(data.user.email || 'Utilisateur') }
      else { router.push('/login') }
      setLoading(false)
    })
  }, [isPublic, router])

  if (isPublic) return <>{children}</>

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--p-bg)', color: 'var(--p-vps)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem', fontWeight: 800,
            fontFamily: 'var(--p-font-mono)', marginBottom: '8px',
            letterSpacing: '0.1em',
          }}>PULSAR</div>
          <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>Chargement…</div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    document.cookie = 'pulsar-demo=; path=/; max-age=0'
    localStorage.removeItem('pulsar-demo')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Patient pages: le layout patient gère tout, on fournit juste l'auth
  if (isPatient) {
    return <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>{children}</div>
  }

  // Pages internes hors-patient : header minimal
  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', display: 'flex', flexDirection: 'column' }}>
      <header className="glass" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 var(--p-space-5)',
        borderBottom: '1px solid rgba(108,124,255,0.06)',
        height: '52px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <Link href="/patients" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <img
              src="/assets/logo-pulsar.jpg" alt="PULSAR"
              width={28} height={28}
              style={{ borderRadius: 6, filter: 'drop-shadow(0 0 6px rgba(108,124,255,0.3))' }}
            />
            <span style={{
              fontSize: '15px', fontWeight: 800, color: 'var(--p-vps)',
              letterSpacing: '0.1em', fontFamily: 'var(--p-font-mono)',
            }}>PULSAR</span>
          </Link>
          <span style={{ color: 'var(--p-text-dim)', fontSize: '11px' }}>›</span>
          <span style={{ fontSize: '12px', color: 'var(--p-text-muted)', fontFamily: 'var(--p-font-mono)' }}>
            {pathname === '/patients' ? 'File active' : pathname.replace('/', '')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <ThemeToggle />
          <span style={{
            fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)',
            fontFamily: 'var(--p-font-mono)',
          }}>{user}</span>
          <button onClick={handleLogout} style={{
            padding: 'var(--p-space-1) var(--p-space-3)',
            background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
            borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)',
            cursor: 'pointer', fontSize: 'var(--p-text-xs)', transition: 'all 0.2s',
          }}>Déconnexion</button>
        </div>
      </header>

      <main className="bg-mesh" style={{ flex: 1, position: 'relative' }}>
        <div key={pathname} className="page-enter">{children}</div>
      </main>
    </div>
  )
}
