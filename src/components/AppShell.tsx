'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from './Sidebar'
import PatientBanner from './PatientBanner'
import Picto from './Picto'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const noShell = ['/', '/login', '/signup']
  const isPublic = noShell.includes(pathname)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (isPublic) { setLoading(false); return }
    // Demo mode bypass
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-bg)', color: 'var(--p-vps)', fontSize: 'var(--p-text-lg)' }}>
        <div className="animate-breathe" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--p-font-mono)', marginBottom: '8px' }}>PULSAR</div>
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

  /* Rail = 64px on desktop, 0 on mobile */
  const railWidth = isMobile ? 0 : 64

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

      {/* Sidebar */}
      <div style={{
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms var(--p-ease)', width: '280px',
        } : {}),
      }}>
        <Sidebar
          collapsed={false}
          onToggle={() => isMobile ? setMobileOpen(false) : null}
          isMobile={isMobile}
        />
      </div>

      <div style={{
        flex: 1, marginLeft: `${railWidth}px`,
        transition: 'margin-left 250ms var(--p-ease)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header className="glass" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--p-space-2) var(--p-space-5)',
          borderBottom: '1px solid rgba(108,124,255,0.06)',
          height: '48px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)' }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{
                background: 'none', border: 'none', color: 'var(--p-text-muted)',
                cursor: 'pointer', fontSize: '20px', padding: '4px', display: 'flex', alignItems: 'center',
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

        {/* Patient Banner — toujours visible */}
        <PatientBanner />

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

/* ── Breadcrumb avec couloir ── */
function Breadcrumb({ pathname }: { pathname: string }) {
  const corridorMap: Record<string, { label: string; color: string }> = {
    '/urgence': { label: 'Urgence', color: '#FF4757' },
    '/admission': { label: 'Urgence', color: '#FF4757' },
    '/bilan': { label: 'Urgence', color: '#FF4757' },
    '/diagnostic': { label: 'Diagnostic', color: '#6C7CFF' },
    '/interpellation': { label: 'Diagnostic', color: '#6C7CFF' },
    '/case-matching': { label: 'Diagnostic', color: '#6C7CFF' },
    '/cross-pathologie': { label: 'Diagnostic', color: '#6C7CFF' },
    '/recommandations': { label: 'Traitement', color: '#2ED573' },
    '/pharmacovigilance': { label: 'Traitement', color: '#2ED573' },
    '/experts': { label: 'Traitement', color: '#2ED573' },
    '/cockpit': { label: 'Monitoring', color: '#2FD1C8' },
    '/engines/vps': { label: 'Monitoring', color: '#2FD1C8' },
    '/engines/tde': { label: 'Monitoring', color: '#2FD1C8' },
    '/engines/pve': { label: 'Monitoring', color: '#2FD1C8' },
    '/engines/ewe': { label: 'Monitoring', color: '#2FD1C8' },
    '/engines/tpe': { label: 'Monitoring', color: '#2FD1C8' },
    '/timeline': { label: 'Monitoring', color: '#2FD1C8' },
    '/suivi': { label: 'Monitoring', color: '#2FD1C8' },
  }

  const labels: Record<string, string> = {
    '/dashboard': 'Cockpit', '/project': 'Nouveau CDC', '/urgence': 'Mode Urgence 3h',
    '/bilan': 'Bilan diagnostique', '/diagnostic': 'Diagnostic IA', '/interpellation': 'Interpellation',
    '/case-matching': 'Case-Matching', '/recommandations': 'Recommandations',
    '/pharmacovigilance': 'Pharmacovigilance', '/cockpit': 'Cockpit Vital',
    '/engines/vps': 'VPS Engine', '/engines/tde': 'TDE Engine', '/engines/pve': 'PVE Engine',
    '/engines/ewe': 'EWE Engine', '/engines/tpe': 'TPE Engine',
    '/timeline': 'Timeline', '/suivi': 'Suivi J+2/5/7', '/synthese': 'Synthèse',
    '/famille': 'Espace Famille', '/staff': 'Staff / RCP', '/export': 'Export PDF',
    '/evidence': 'Evidence Vault', '/experts': 'Consensus Expert', '/demo': 'Démo Inès',
    '/about': 'About', '/admission': 'Admission', '/audit': 'Audit Trail',
    '/onboarding': 'Onboarding', '/cross-pathologie': 'Cross-Pathologie',
    '/observatory': 'Observatory',
  }

  const current = labels[pathname] || ''
  const corridor = corridorMap[pathname]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontWeight: 800, color: 'var(--p-vps)', fontSize: '13px', letterSpacing: '0.05em' }}>PULSAR</span>
      {corridor && <>
        <span style={{ color: 'var(--p-text-dim)', fontSize: '11px' }}>›</span>
        <span style={{ color: corridor.color, fontSize: '11px', fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{corridor.label}</span>
      </>}
      {current && <>
        <span style={{ color: 'var(--p-text-dim)', fontSize: '11px' }}>›</span>
        <span style={{ color: 'var(--p-text-muted)', fontSize: '12px' }}>{current}</span>
      </>}
    </div>
  )
}
