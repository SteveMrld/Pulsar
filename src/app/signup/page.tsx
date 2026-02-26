'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caractères'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
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

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--p-bg)', padding: 'var(--p-space-4)',
      }}>
        <div style={{
          maxWidth: '400px', background: 'var(--p-bg-card)', border: 'var(--p-border)',
          borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-10)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--p-space-4)' }}>✉️</div>
          <h2 style={{ color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>Vérifiez votre email</h2>
          <p style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)' }}>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.
            Cliquez dessus pour activer votre compte.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--p-bg)', padding: 'var(--p-space-4)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: 'var(--p-bg-card)',
        border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-vps)', letterSpacing: '0.1em' }}>
              PULSAR
            </span>
          </Link>
          <p style={{ color: 'var(--p-text-muted)', fontSize: 'var(--p-text-sm)', marginTop: 'var(--p-space-2)' }}>
            Créer un compte
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="medecin@hopital.fr" />
          </div>
          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Mot de passe
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="Minimum 6 caractères" />
          </div>
          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Confirmer
            </label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} placeholder="••••••••" />
          </div>

          {error && (
            <div style={{ background: 'var(--p-critical-bg)', color: 'var(--p-critical)', padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-md)', fontSize: 'var(--p-text-sm)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: 'var(--p-space-3)', borderRadius: 'var(--p-radius-md)',
            background: loading ? 'var(--p-gray-2)' : 'var(--p-vps)',
            color: '#fff', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 'var(--p-space-2)',
          }}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--p-space-6)', fontSize: 'var(--p-text-sm)', color: 'var(--p-text-dim)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--p-vps)', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
