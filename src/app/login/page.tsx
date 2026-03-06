'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LanguageContext'
import { validateInvite, setInviteCookie } from '@/lib/invites'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/patients')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--p-space-3) var(--p-space-4)',
    background: 'var(--p-input-bg)',
    border: 'var(--p-border)',
    borderRadius: 'var(--p-radius-md)',
    color: 'var(--p-text)',
    fontSize: 'var(--p-text-base)',
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--p-bg)',
      padding: 'var(--p-space-4)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--p-bg-card)',
        border: 'var(--p-border)',
        borderRadius: 'var(--p-radius-xl)',
        padding: 'var(--p-space-10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 'var(--p-text-2xl)', fontWeight: 800,
              color: 'var(--p-vps)', letterSpacing: '0.1em',
            }}>
              PULSAR
            </span>
          </Link>
          <p style={{
            color: 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)',
            marginTop: 'var(--p-space-2)',
          }}>
            {t('Connexion à votre espace', 'Sign in to your workspace')}
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="medecin@hopital.fr"
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--p-critical-bg)',
              color: 'var(--p-critical)',
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              fontSize: 'var(--p-text-sm)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              background: loading ? 'var(--p-gray-2)' : 'var(--p-vps)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 'var(--p-text-base)',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 'var(--p-space-2)',
            }}
          >
            {loading ? t('Connexion...', 'Signing in...') : t('Se connecter', 'Sign in')}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--p-space-6)',
          fontSize: 'var(--p-text-sm)',
          color: 'var(--p-text-dim)',
        }}>
          {t('Accès sur invitation uniquement', 'Invite-only access')}
        </p>

        <div style={{ marginTop: 'var(--p-space-4)', paddingTop: 'var(--p-space-4)', borderTop: 'var(--p-border)' }}>
          {/* Invite code */}
          <div style={{ marginBottom: 'var(--p-space-3)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder={t('Code d\'invitation', 'Invite code')}
                style={{ ...inputStyle, flex: 1, fontSize: '13px', fontFamily: 'var(--p-font-mono, monospace)', letterSpacing: '0.5px' }}
              />
              <button
                onClick={() => {
                  const invite = validateInvite(inviteCode)
                  if (invite) {
                    setInviteCookie(invite.code, invite.name)
                    router.push('/patients')
                  } else {
                    setError(t('Code d\'invitation invalide', 'Invalid invite code'))
                  }
                }}
                disabled={!inviteCode}
                style={{
                  padding: '0 16px', borderRadius: 'var(--p-radius-md)',
                  background: inviteCode ? '#6C7CFF' : 'var(--p-gray-2)',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
                  cursor: inviteCode ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}
              >
                {t('Entrer', 'Enter')}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              router.push('/?demo=true')
            }}
            style={{
              width: '100%',
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              background: 'transparent',
              color: 'var(--p-tde)',
              border: '1px solid var(--p-tde)',
              fontWeight: 600,
              fontSize: 'var(--p-text-sm)',
              cursor: 'pointer',
            }}
          >
            {t('Découvrir PULSAR — Démo', 'Discover PULSAR — Demo')}
          </button>
        </div>
      </div>
    </div>
  )
}
