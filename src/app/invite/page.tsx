'use client'
import PulsarLogo from '@/components/PulsarLogo'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { validateInvite, setInviteCookie, getInviteFromCookie } from '@/lib/invites'
import { Suspense } from 'react'

function InviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code') || ''

  const [status, setStatus] = useState<'checking' | 'verify' | 'granted' | 'wrong_email' | 'invalid'>('checking')
  const [name, setName] = useState('')
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [inviteLang, setInviteLang] = useState<'fr' | 'en'>('en')
  const [inviteEmail, setInviteEmail] = useState('')
  const [typedEmail, setTypedEmail] = useState('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!code) { setStatus('invalid'); return }

    const invite = validateInvite(code)
    if (!invite) { setStatus('invalid'); return }

    setName(invite.name)
    setInviteLang(invite.lang)
    setWelcomeMsg(invite.welcomeMsg || '')
    setInviteEmail(invite.email.toLowerCase())

    // Already has cookie for this code → skip verification
    const existingCookie = getInviteFromCookie()
    if (existingCookie === code) {
      setStatus('granted')
      setTimeout(() => router.push('/dashboard'), 2000)
      return
    }

    // No email registered → allow access (generic tester codes)
    if (!invite.email) {
      setInviteCookie(invite.code, invite.name)
      setStatus('granted')
      setTimeout(() => router.push('/dashboard'), 2500)
      return
    }

    // Has email → need verification
    setStatus('verify')
  }, [code, router])

  const handleVerify = useCallback(() => {
    const clean = typedEmail.trim().toLowerCase()
    if (clean === inviteEmail) {
      setInviteCookie(code, name)
      setStatus('granted')
      setTimeout(() => router.push('/dashboard'), 2500)
    } else {
      setAttempts(a => a + 1)
      setStatus('wrong_email')
      if (attempts >= 2) {
        // Lock after 3 wrong attempts
        setStatus('invalid')
      }
    }
  }, [typedEmail, inviteEmail, code, name, router, attempts])

  const fr = inviteLang === 'fr'

  const inputS: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    background: 'var(--p-input-bg, rgba(255,255,255,0.05))', border: '1px solid rgba(108,124,255,0.2)',
    color: 'var(--p-text)', fontSize: '15px', outline: 'none', textAlign: 'center',
    fontFamily: 'var(--p-font-mono)', letterSpacing: '0.3px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px', width: '100%' }}>

        

        {/* ── CHECKING ── */}
        {status === 'checking' && (
          <>
            <div className="animate-breathe" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6C7CFF', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--p-text-muted)', fontSize: '14px' }}>
              {fr ? 'Vérification de votre invitation...' : 'Verifying your invitation...'}
            </p>
          </>
        )}

        {/* ── EMAIL VERIFICATION ── */}
        {(status === 'verify' || status === 'wrong_email') && (
          <>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(108,124,255,0.1)', border: '1px solid rgba(108,124,255,0.2)', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1.5px' }}>EARLY ACCESS</span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '12px' }}>
              {fr ? 'Bienvenue,' : 'Welcome,'} {name}
            </h1>

            {welcomeMsg && (
              <p style={{ color: 'var(--p-text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px', fontStyle: 'italic' }}>
                &laquo; {welcomeMsg} &raquo;
              </p>
            )}

            <p style={{ color: 'var(--p-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              {fr
                ? 'Pour accéder à PULSAR, veuillez confirmer votre adresse email.'
                : 'To access PULSAR, please confirm your email address.'}
            </p>

            <div style={{ display: 'flex', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
              <input
                type="email"
                value={typedEmail}
                onChange={e => { setTypedEmail(e.target.value); if (status === 'wrong_email') setStatus('verify') }}
                onKeyDown={e => { if (e.key === 'Enter') handleVerify() }}
                placeholder={fr ? 'votre@email.com' : 'your@email.com'}
                style={inputS}
                autoFocus
              />
              <button onClick={handleVerify} disabled={!typedEmail.includes('@')} style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: typedEmail.includes('@') ? '#6C7CFF' : 'rgba(108,124,255,0.2)',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                cursor: typedEmail.includes('@') ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}>
                {fr ? 'Valider' : 'Verify'}
              </button>
            </div>

            {status === 'wrong_email' && (
              <p style={{ color: '#8B5CF6', fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>
                {fr
                  ? `Cet email ne correspond pas à votre invitation. ${3 - attempts - 1} tentative${3 - attempts - 1 > 1 ? 's' : ''} restante${3 - attempts - 1 > 1 ? 's' : ''}.`
                  : `This email doesn't match your invitation. ${3 - attempts - 1} attempt${3 - attempts - 1 > 1 ? 's' : ''} remaining.`}
              </p>
            )}

            <div style={{ marginTop: '24px', padding: '12px 20px', borderRadius: '12px', background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.12)' }}>
              <p style={{ fontSize: '11px', color: 'var(--p-text-dim)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#6C7CFF' }}>PRIVATE ALPHA</strong> — {fr
                  ? 'Cette version est confidentielle. Merci de ne pas partager votre lien d\'accès.'
                  : 'This version is confidential. Please do not share your access link.'}
              </p>
            </div>
          </>
        )}

        {/* ── ACCESS GRANTED ── */}
        {status === 'granted' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: '24px', color: '#10B981' }}>✓</span>
            </div>

            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(108,124,255,0.1)', border: '1px solid rgba(108,124,255,0.2)', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1.5px' }}>EARLY ACCESS</span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '12px' }}>
              {fr ? 'Bienvenue,' : 'Welcome,'} {name}
            </h1>

            {welcomeMsg && (
              <p style={{ color: 'var(--p-text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>
                &laquo; {welcomeMsg} &raquo;
              </p>
            )}

            <p style={{ color: 'var(--p-text-dim)', fontSize: '12px', fontFamily: 'var(--p-font-mono)' }}>
              {fr ? 'Redirection en cours...' : 'Redirecting...'}
            </p>
          </>
        )}

        {/* ── INVALID ── */}
        {status === 'invalid' && (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '8px' }}>
              {fr ? 'Accès refusé' : 'Access denied'}
            </h1>
            <p style={{ color: 'var(--p-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              {attempts >= 3
                ? (fr ? 'Trop de tentatives. Ce lien est temporairement bloqué.' : 'Too many attempts. This link is temporarily blocked.')
                : (fr ? "Ce lien d'invitation n'est pas valide ou a expiré." : 'This invitation link is not valid or has expired.')}
            </p>
            <p style={{ color: 'var(--p-text-dim)', fontSize: '12px' }}>
              {fr ? 'Contactez Steve Moradel pour obtenir un accès.' : 'Contact Steve Moradel to request access.'}
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
