'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const noShell = ['/', '/login', '/signup']
  const isPublic = noShell.includes(pathname)

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (isPublic) { setLoading(false); return }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-bg)', color: 'var(--p-vps)', fontSize: 'var(--p-text-lg)' }}>
        <div className="animate-breathe" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--p-font-mono)', marginBottom: '8px' }}>PULSAR</div>
          <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)' }}>Chargement…</div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const sidebarWidth = isMobile ? 0 : (collapsed ? 60 : 240)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 99, backdropFilter: 'blur(4px)',
          animation: 'fadeInSlow 0.2s ease both',
        }} />
      )}

      {/* Sidebar - hidden on mobile unless drawer open */}
      <div style={{
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms var(--p-ease)',
          width: '280px',
        } : {}),
      }}>
        <Sidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={() => isMobile ? setMobileOpen(false) : setCollapsed(!collapsed)}
          isMobile={isMobile}
        />
      </div>

      <div style={{
        flex: 1,
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 250ms var(--p-ease)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header className="glass" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--p-space-3) var(--p-space-6)',
          borderBottom: '1px solid rgba(108,124,255,0.06)',
          height: '60px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
            {/* Mobile hamburger */}
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{
                background: 'none', border: 'none', color: 'var(--p-text-muted)',
                cursor: 'pointer', fontSize: '20px', padding: '4px',
                display: 'flex', alignItems: 'center',
              }}>☰</button>
            )}
            <Breadcrumb pathname={pathname} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
            <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{user}</span>
            <button onClick={handleLogout} style={{
              padding: 'var(--p-space-1) var(--p-space-3)',
              background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
              borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)',
              cursor: 'pointer', fontSize: 'var(--p-text-xs)',
            }}>Déconnexion</button>
          </div>
        </header>
        {/* Content */}
        <main className="bg-mesh" style={{ flex: 1, padding: isMobile ? 'var(--p-space-4)' : 'var(--p-space-6)', position: 'relative' }}>
          <div key={pathname} className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const labels: Record<string, string> = {
    '/dashboard': 'Dashboard', '/project': 'Nouveau CDC', '/urgence': 'Mode Urgence 3h',
    '/bilan': 'Bilan diagnostique', '/diagnostic': 'Diagnostic IA', '/interpellation': 'Interpellation',
    '/case-matching': 'Case-Matching', '/recommandations': 'Recommandations',
    '/pharmacovigilance': 'Pharmacovigilance', '/cockpit': 'Cockpit Vital',
    '/engines/vps': 'VPS Engine', '/engines/tde': 'TDE Engine', '/engines/pve': 'PVE Engine',
    '/engines/ewe': 'EWE Engine', '/engines/tpe': 'TPE Engine',
    '/timeline': 'Timeline', '/suivi': 'Suivi J+2/5/7', '/synthese': 'Synthèse',
    '/famille': 'Espace Famille', '/staff': 'Staff / RCP', '/export': 'Export PDF',
    '/evidence': 'Evidence Vault', '/experts': 'Consensus Expert', '/demo': 'Démo Inès',
    '/about': 'About / Mémorial', '/admission': 'Admission', '/audit': 'Audit Trail',
    '/onboarding': 'Onboarding', '/cross-pathologie': 'Cross-Pathologie',
  }
  const current = labels[pathname] || ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
      <img src="/assets/logo-pulsar.jpg" alt="PULSAR" width={24} height={24} style={{ borderRadius: 6, filter: 'drop-shadow(0 0 6px rgba(108,124,255,0.3))' }} />
      <span style={{ fontWeight: 800, color: 'var(--p-vps)', fontSize: 'var(--p-text-sm)', letterSpacing: '0.05em' }}>PULSAR</span>
      {current && <>
        <span style={{ color: 'var(--p-text-dim)', fontSize: '12px' }}>›</span>
        <span style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)' }}>{current}</span>
      </>}
    </div>
  )
}
