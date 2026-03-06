'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { RoleBadge } from './RoleGate'
import ConnectionStatus from './ConnectionStatus'
import PulsarGuide from './PulsarGuide'
import { LanguageProvider, LangToggle, useLang } from '@/contexts/LanguageContext'

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()

  const isPublic = ['/', '/login', '/invite'].includes(pathname) || pathname.startsWith('/case/')
  const isPatient = pathname.startsWith('/patient/')

  useEffect(() => {
    if (isPublic) { setLoading(false); return }
    // Check invite cookie first
    if (typeof window !== 'undefined') {
      const inviteMatch = document.cookie.match(/pulsar-invite=([^;]+)/)
      if (inviteMatch) {
        const nameMatch = document.cookie.match(/pulsar-invite-name=([^;]+)/)
        setUser(nameMatch ? decodeURIComponent(nameMatch[1]) : 'Invité')
        setLoading(false)
        return
      }
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
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--p-font-mono)', marginBottom: '8px', letterSpacing: '0.1em' }}>PULSAR</div>
          <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>{t('Chargement…', 'Loading…')}</div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    document.cookie = 'pulsar-invite=; path=/; max-age=0'
    document.cookie = 'pulsar-invite-name=; path=/; max-age=0'
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isPatient) {
    return <ProfileProvider><div style={{ minHeight: '100vh', background: 'var(--p-bg)', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,124,255,0.03) 0%, transparent 70%)' }}>{children}</div></ProfileProvider>
  }

  const breadcrumb = pathname === '/patients' ? t('File active', 'Active Patients')
    : pathname === '/dashboard' ? 'Dashboard'
    : pathname === '/admin' ? 'Admin'
    : pathname === '/research' ? 'Discovery Engine'
    : pathname === '/staff' ? t('Équipe', 'Staff')
    : pathname === '/observatory' ? t('Observatoire', 'Observatory')
    : pathname === '/neurocore' ? 'NeuroCore'
    : pathname === '/export' ? 'Export'
    : pathname === '/bilan' ? t('Bilan', 'Assessment')
    : pathname === '/case-matching' ? 'Case Matching'
    : pathname === '/cross-pathologie' ? t('Cross-Pathologie', 'Cross-Pathology')
    : pathname.replace('/', '')

  return (
    <ProfileProvider>
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,124,255,0.03) 0%, transparent 70%)', display: 'flex', flexDirection: 'column' }}>
      <header className="glass" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 var(--p-space-5)',
        borderBottom: '1px solid rgba(108,124,255,0.06)',
        height: '52px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <Link href="/patients" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={32} height={32}
              style={{ filter: 'drop-shadow(0 0 8px rgba(108,124,255,0.4))', display: 'block', objectFit: 'contain' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em', fontFamily: 'var(--p-font-mono)' }}>PULSAR</span>
          </Link>
          <span style={{ color: 'var(--p-text-dim)', fontSize: '11px' }}>›</span>
          <span style={{ fontSize: '12px', color: 'var(--p-text-muted)', fontFamily: 'var(--p-font-mono)' }}>{breadcrumb}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link href="/dashboard" style={{
            padding: '3px 8px', borderRadius: 'var(--p-radius-sm)', textDecoration: 'none',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
            color: pathname === '/dashboard' ? '#6C7CFF' : 'var(--p-text-dim)',
            background: pathname === '/dashboard' ? '#6C7CFF15' : 'transparent',
          }}>Dashboard</Link>
          <Link href="/patients" style={{
            padding: '3px 8px', borderRadius: 'var(--p-radius-sm)', textDecoration: 'none',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
            color: pathname === '/patients' ? '#6C7CFF' : 'var(--p-text-dim)',
            background: pathname === '/patients' ? '#6C7CFF15' : 'transparent',
          }}>{t('File active', 'Patients')}</Link>
          <Link href="/research" style={{
            padding: '3px 8px', borderRadius: 'var(--p-radius-sm)', textDecoration: 'none',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
            color: pathname === '/research' ? '#10B981' : 'var(--p-text-dim)',
            background: pathname === '/research' ? '#10B98115' : 'transparent',
          }}>Discovery</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
          <LangToggle />
          <ThemeToggle />
          <RoleBadge />
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{user}</span>
          <button onClick={handleLogout} style={{
            padding: 'var(--p-space-1) var(--p-space-3)',
            background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
            borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)',
            cursor: 'pointer', fontSize: 'var(--p-text-xs)', transition: 'all 0.2s',
          }}>{t('Déconnexion', 'Sign out')}</button>
        </div>
      </header>
      <main className="bg-mesh" style={{ flex: 1, position: 'relative' }}>
        <div key={pathname} className="page-enter">{children}</div>
      </main>
      <ConnectionStatus />
      <PulsarGuide />
    </div>
    </ProfileProvider>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppShellInner>{children}</AppShellInner>
    </LanguageProvider>
  )
}
