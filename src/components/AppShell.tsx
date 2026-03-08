'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { RoleBadge } from './RoleGate'
import ConnectionStatus from './ConnectionStatus'
import PulsarGuide from './PulsarGuide'
import { LanguageProvider, LangToggle, useLang } from '@/contexts/LanguageContext'
import PulsarLogo from '@/components/PulsarLogo'
import PulsarAI from '@/components/PulsarAI'
import Picto from '@/components/Picto'

function NavLink({ href, label, color = '#6C7CFF', pathname }: { href: string; label: string; color?: string; pathname: string }) {
  const active = pathname === href
  return (
    <Link href={href} style={{
      padding: '3px 10px', borderRadius: '4px', textDecoration: 'none',
      fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
      color: active ? color : 'var(--p-text-dim)',
      background: active ? `${color}18` : 'transparent',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>{label}</Link>
  )
}

function AnalyseMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const analyseRoutes = ['/observatory', '/case-matching', '/cross-pathologie', '/bilan']
  const isActive = analyseRoutes.includes(pathname)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding: '3px 10px', borderRadius: '4px', border: 'none',
        fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
        color: isActive ? '#F59E0B' : 'var(--p-text-dim)',
        background: isActive ? '#F59E0B18' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        transition: 'all 0.15s',
      }}>
        {t('Analyse', 'Analysis')}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: '#0F1525', border: '1px solid rgba(108,124,255,0.15)',
          borderRadius: '8px', padding: '4px', zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '180px',
        }}>
          {[
            { href: '/observatory', picto: 'chart', label: t('Observatoire', 'Observatory'), desc: t('Vue multi-patients', 'Multi-patient view') },
            { href: '/case-matching', picto: 'cycle', label: 'Case Matching', desc: t('Cas similaires', 'Similar cases') },
            { href: '/cross-pathologie', picto: 'dna', label: t('Cross-Pathologie', 'Cross-Pathology'), desc: t('5 pathologies croisées', '5 cross pathologies') },
            { href: '/bilan', picto: 'microscope', label: t('Bilan', 'Assessment'), desc: t('Examens diagnostiques', 'Diagnostic workup') },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              padding: '7px 10px', borderRadius: '6px', textDecoration: 'none',
              background: pathname === item.href ? '#F59E0B0A' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s',
            }}>
              <Picto name={item.picto} size={14} style={{ opacity: pathname === item.href ? 1 : 0.5 }} />
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: pathname === item.href ? '#F59E0B' : '#E2E8F0' }}>{item.label}</div>
                <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '1px' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiOpen, setAiOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()

  const isPublic = ['/', '/login', '/invite'].includes(pathname) || pathname === '/lab' || pathname.startsWith('/usecase')
  const isPatient = pathname.startsWith('/patient/')

  useEffect(() => {
    if (isPublic) { setLoading(false); return }
    if (typeof window !== 'undefined') {
      const inviteMatch = document.cookie.match(/pulsar-invite=([^;]+)/)
      if (inviteMatch) {
        const nameMatch = document.cookie.match(/pulsar-invite-name=([^;]+)/)
        setUser(nameMatch ? decodeURIComponent(nameMatch[1]) : 'Invité')
        setLoading(false); return
      }
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user.email || 'Utilisateur')
      else router.push('/login')
      setLoading(false)
    })
  }, [isPublic, router])

  if (isPublic) return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
        {/* Minimal public nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: '44px',
          background: 'rgba(4,7,15,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(108,124,255,0.06)',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={22} height={22}
              style={{ filter: 'drop-shadow(0 0 6px rgba(108,124,255,0.4))', objectFit: 'contain' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#6C7CFF', fontFamily: 'var(--p-font-mono)', letterSpacing: '0.1em' }}>PULSAR</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/usecase/alejandro" style={{ fontSize: 10, color: '#F5A623', textDecoration: 'none', fontFamily: 'var(--p-font-mono)', padding: '4px 10px', borderRadius: 6, background: 'rgba(245,166,35,0.08)' }}>Alejandro</Link>
            <Link href="/lab" style={{ fontSize: 10, color: '#10B981', textDecoration: 'none', fontFamily: 'var(--p-font-mono)', padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.08)' }}>Lab</Link>
            <Link href="/login" style={{ fontSize: 10, color: '#6C7CFF', textDecoration: 'none', fontFamily: 'var(--p-font-mono)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(108,124,255,0.2)' }}>Connexion</Link>
          </div>
        </div>
        {children}
      </div>
    </LanguageProvider>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <PulsarLogo size="md" />
        <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', marginTop: '8px', fontFamily: 'var(--p-font-mono)' }}>{t('Chargement…', 'Loading…')}</div>
      </div>
    </div>
  )

  const handleLogout = async () => {
    document.cookie = 'pulsar-invite=; path=/; max-age=0'
    document.cookie = 'pulsar-invite-name=; path=/; max-age=0'
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isPatient) return (
    <ProfileProvider>
      <div style={{ minHeight: '100vh', background: 'var(--p-bg)', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,124,255,0.03) 0%, transparent 70%)' }}>
        {/* Patient mini-nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: '44px',
          background: 'rgba(4,7,15,0.9)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(108,124,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/patients" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#6C7CFF' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#6C7CFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>File active</span>
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>›</span>
            <span style={{ fontSize: 10, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
              {pathname.split('/').pop()?.toUpperCase() || 'PATIENT'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/dashboard" style={{ fontSize: 10, color: 'var(--p-text-dim)', textDecoration: 'none', fontFamily: 'var(--p-font-mono)', padding: '3px 8px', borderRadius: 5, background: 'rgba(108,124,255,0.06)' }}>Dashboard</Link>
            <Link href="/patients" style={{ fontSize: 10, color: 'var(--p-text-dim)', textDecoration: 'none', fontFamily: 'var(--p-font-mono)', padding: '3px 8px', borderRadius: 5, background: 'rgba(108,124,255,0.06)' }}>Patients</Link>
            <button onClick={() => setAiOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px' }}>
              <img src="/assets/pictos-v17/pulsar-ai-icon-128.png" alt="AI" width={18} height={18} style={{ opacity: 0.6, objectFit: 'contain' }} />
            </button>
          </div>
        </div>
        {children}
        <PulsarAIFloat open={aiOpen} setOpen={setAiOpen} />
      </div>
    </ProfileProvider>
  )

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
          height: '52px', position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '170px' }}>
            <Link href="/patients" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={26} height={26}
                style={{ filter: 'drop-shadow(0 0 8px rgba(108,124,255,0.4))', display: 'block', objectFit: 'contain' }} />
              <PulsarLogo size="md" />
            </Link>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '11px', color: 'var(--p-text-muted)', fontFamily: 'var(--p-font-mono)' }}>{breadcrumb}</span>
          </div>

          {/* CENTER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <NavLink href="/dashboard" label="Dashboard" pathname={pathname} />
            <NavLink href="/patients" label={t('File active', 'Patients')} pathname={pathname} />
            <NavLink href="/research" label="Discovery" color="#10B981" pathname={pathname} />
            <AnalyseMenu pathname={pathname} />
            <NavLink href="/lab" label="Lab" color="#10B981" pathname={pathname} />
            <NavLink href="/neurocore" label="NeuroCore" color="#8B5CF6" pathname={pathname} />
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '170px', justifyContent: 'flex-end' }}>

            {/* Staff */}
            <Link href="/staff" title={t('Équipe soignante', 'Care Team')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '6px', textDecoration: 'none',
              background: pathname === '/staff' ? '#6C7CFF18' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <img src="/assets/pictos-v17/staff-group-128.png" alt="Staff" width={16} height={16}
                style={{ opacity: pathname === '/staff' ? 1 : 0.45, objectFit: 'contain' }} />
            </Link>

            {/* PulsarAI */}
            <button onClick={() => setAiOpen(o => !o)} title="PulsarAI" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '6px', border: 'none',
              background: aiOpen ? '#10B98118' : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <img src="/assets/pictos-v17/pulsar-ai-icon-128.png" alt="AI" width={16} height={16}
                style={{ opacity: aiOpen ? 1 : 0.45, objectFit: 'contain' }} />
            </button>

            <LangToggle />
            <ThemeToggle />
            <RoleBadge />
            <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user}</span>
            <button onClick={handleLogout} style={{
              padding: '3px 8px', background: 'var(--p-bg-elevated)', border: 'var(--p-border)',
              borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-muted)',
              cursor: 'pointer', fontSize: '9px', fontFamily: 'var(--p-font-mono)', transition: 'all 0.2s',
            }}>{t('Déco', 'Out')}</button>
          </div>
        </header>

        <main className="bg-mesh" style={{ flex: 1, position: 'relative' }}>
          <div key={pathname} className="page-enter">{children}</div>
        </main>

        <ConnectionStatus />
        <PulsarGuide />
        <PulsarAIFloat open={aiOpen} setOpen={setAiOpen} />
      </div>
    </ProfileProvider>
  )
}

function PulsarAIFloat({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 500,
      width: '380px', maxHeight: '560px',
      background: '#0F1525', border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(16,185,129,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(16,185,129,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/pictos-v17/pulsar-ai-icon-128.png" alt="AI" width={22} height={22} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>PULSAR AI</div>
            <div style={{ fontSize: '9px', color: '#64748B' }}>Assistant neurologique</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{
          background: 'transparent', border: 'none', color: '#64748B',
          cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px',
        }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PulsarAI />
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppShellInner>{children}</AppShellInner>
    </LanguageProvider>
  )
}
