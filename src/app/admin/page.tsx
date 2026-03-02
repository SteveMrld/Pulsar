'use client'
import { useState, useEffect } from 'react'
import { useProfile, ROLE_LABELS, ROLE_COLORS } from '@/contexts/ProfileContext'
import { profileService } from '@/lib/services'
import { AccessDenied } from '@/components/RoleGate'
import Picto from '@/components/Picto'
import type { Profile, UserRole } from '@/lib/types/database'

/* ══════════════════════════════════════════════════════════════
   ADMIN — Gestion des rôles et utilisateurs
   ══════════════════════════════════════════════════════════════ */

const ROLES: UserRole[] = ['admin', 'senior', 'intern', 'nurse', 'viewer']

export default function AdminPage() {
  const { can, role: myRole, roleLabel } = useProfile()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await profileService.getAll()
        setProfiles(data)
      } catch (err) { console.error('[Admin]', err) }
      setLoading(false)
    }
    load()
  }, [])

  if (!can('admin.roles')) {
    return <AccessDenied message="La gestion des rôles est réservée aux administrateurs." />
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId)
    try {
      await profileService.setRole(userId, newRole)
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p))
    } catch (err) {
      console.error('[Admin] setRole:', err)
    }
    setUpdating(null)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Picto name="shield" size={28} glow glowColor="rgba(255,71,87,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Administration</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Gestion des rôles · {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''} · Vous : {roleLabel}
          </span>
        </div>
      </div>

      {/* Role legend */}
      <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '8px' }}>
          NIVEAUX DE PERMISSIONS
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ROLES.map(r => (
            <div key={r} style={{
              padding: '4px 10px', borderRadius: 'var(--p-radius-md)',
              background: `${ROLE_COLORS[r]}10`, border: `1px solid ${ROLE_COLORS[r]}25`,
            }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: ROLE_COLORS[r] }}>
                {ROLE_LABELS[r]}
              </span>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                {r === 'admin' && 'Tous les droits + gestion rôles'}
                {r === 'senior' && 'Prescriptions + sorties + audit'}
                {r === 'intern' && 'Saisie + prescriptions + admission'}
                {r === 'nurse' && 'Saisie constantes + notes'}
                {r === 'viewer' && 'Lecture seule'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
          Chargement...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {profiles.map(p => {
            const isMe = p.role === myRole && p.id === profiles[0]?.id // rough check
            return (
              <div key={p.id} className="glass-card" style={{
                padding: '12px 14px', borderRadius: 'var(--p-radius-lg)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: `3px solid ${ROLE_COLORS[p.role as UserRole] || '#6C7CFF'}`,
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>
                    {p.full_name}
                  </div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
                    {p.email} · {p.service} · {p.hospital}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={p.role}
                    onChange={e => handleRoleChange(p.id, e.target.value as UserRole)}
                    disabled={updating === p.id}
                    style={{
                      padding: '4px 8px', borderRadius: 'var(--p-radius-md)',
                      background: 'var(--p-bg)', border: 'var(--p-border)',
                      fontFamily: 'var(--p-font-mono)', fontSize: '10px',
                      color: ROLE_COLORS[p.role as UserRole] || 'var(--p-text)',
                      cursor: 'pointer', fontWeight: 700,
                    }}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  {updating === p.id && (
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#FFB347' }}>...</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
