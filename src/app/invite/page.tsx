'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { validateInvite, setInviteCookie } from '@/lib/invites'
import { Suspense } from 'react'

function InviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code') || ''
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'expired'>('checking')
  const [name, setName] = useState('')
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [role, setRole] = useState('')
  const [inviteLang, setInviteLang] = useState<'fr'|'en'>('en')

  useEffect(() => {
    if (!code) { setStatus('invalid'); return }
    const invite = validateInvite(code)
    if (!invite) {
      setStatus('invalid')
    } else {
      setName(invite.name)
      setRole(invite.role)
      setInviteLang(invite.lang)
      setWelcomeMsg(invite.welcomeMsg || '')
      setInviteCookie(invite.code, invite.name)
      setStatus('valid')
      setTimeout(() => router.push('/patients'), 3500)
    }
  }, [code, router])

  const roleLabels: Record<string, string> = {
    tester: 'ALPHA TESTER',
    advisor: 'STRATEGIC ADVISOR',
    medical: 'CLINICAL EXPERT',
    investor: 'INVESTOR PREVIEW',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px' }}>
        <img src="/assets/pictos-v17/brain-hero-128.png" alt="PULSAR" width={64} height={64}
          style={{ filter: 'drop-shadow(0 0 16px rgba(108,124,255,0.5))', margin: '0 auto 24px', display: 'block' }} />

        {status === 'checking' && (
          <>
            <div className="animate-breathe" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6C7CFF', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--p-text-muted)', fontSize: '14px' }}>Vérification de votre invitation...</p>
          </>
        )}

        {status === 'valid' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: '24px', color: '#10B981' }}>✓</span>
            </div>
            {role && (
              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(108,124,255,0.1)', border: '1px solid rgba(108,124,255,0.2)', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1.5px' }}>EARLY ACCESS</span>
              </div>
            )}
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '12px' }}>
              {inviteLang === 'fr' ? 'Bienvenue,' : 'Welcome,'} {name}
            </h1>
            {welcomeMsg && (
              <p style={{ color: 'var(--p-text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>
                « {welcomeMsg} »
              </p>
            )}
            <p style={{ color: 'var(--p-text-dim)', fontSize: '12px', fontFamily: 'var(--p-font-mono)' }}>
              {inviteLang === 'fr' ? 'Redirection en cours...' : 'Redirecting...'}
            </p>
            <div style={{ marginTop: '20px', padding: '12px 20px', borderRadius: '12px', background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.12)' }}>
              <p style={{ fontSize: '11px', color: 'var(--p-text-dim)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#6C7CFF' }}>PRIVATE ALPHA</strong> — {inviteLang === 'fr'
                  ? 'Cette version est confidentielle. Merci de ne pas partager votre lien d\'accès.'
                  : 'This version is confidential. Please do not share your access link.'}
              </p>
            </div>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '8px' }}>
              Invitation invalide
            </h1>
            <p style={{ color: 'var(--p-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Ce lien d'invitation n'est pas valide ou a expiré.
            </p>
            <p style={{ color: 'var(--p-text-dim)', fontSize: '12px' }}>
              Contactez Steve Moradel pour obtenir un accès.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--p-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-breathe" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6C7CFF' }} />
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}
