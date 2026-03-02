'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Indicateur de connexion Supabase.
 * Affiche un banner quand la connexion est perdue.
 */
export default function ConnectionStatus() {
  const [online, setOnline] = useState(true)
  const [supabaseOk, setSupabaseOk] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    // Browser online/offline
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    setOnline(navigator.onLine)

    // Supabase health check every 30s
    // Skip if Supabase URL is not configured (placeholder or missing)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const isConfigured = supabaseUrl.length > 10 && !supabaseUrl.includes('xxx')

    if (!isConfigured) {
      setSupabaseOk(true) // Don't show warning if not configured
      return () => {
        window.removeEventListener('online', goOnline)
        window.removeEventListener('offline', goOffline)
      }
    }

    const check = async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('profiles').select('id').limit(1)
        setSupabaseOk(!error)
      } catch {
        setSupabaseOk(false)
      }
      setLastCheck(new Date())
    }

    check()
    const interval = setInterval(check, 30000)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      clearInterval(interval)
    }
  }, [])

  const isOk = online && supabaseOk

  if (isOk) return null

  return (
    <div style={{
      position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '8px 20px', borderRadius: 'var(--p-radius-lg)',
      background: online ? 'rgba(255,165,2,0.95)' : 'rgba(255,71,87,0.95)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: '#fff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: '8px',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: '#fff', animation: 'pulse 2s infinite',
      }} />
      {!online ? 'Hors ligne — mode dégradé activé' : 'Base de données inaccessible — reconnexion...'}
    </div>
  )
}
