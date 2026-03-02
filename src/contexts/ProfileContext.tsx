'use client'
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/lib/types/database'

// ── Permission system ──
export type Permission =
  | 'patient.view' | 'patient.create' | 'patient.edit' | 'patient.discharge'
  | 'vitals.view' | 'vitals.record'
  | 'lab.view' | 'lab.record'
  | 'medication.view' | 'medication.prescribe' | 'medication.stop'
  | 'note.view' | 'note.create'
  | 'intake.analyze' | 'intake.admit'
  | 'engine.view' | 'engine.run'
  | 'alert.view' | 'alert.acknowledge' | 'alert.resolve'
  | 'audit.view'
  | 'admin.roles' | 'admin.settings'
  | 'history.view' | 'history.export'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'patient.view', 'patient.create', 'patient.edit', 'patient.discharge',
    'vitals.view', 'vitals.record',
    'lab.view', 'lab.record',
    'medication.view', 'medication.prescribe', 'medication.stop',
    'note.view', 'note.create',
    'intake.analyze', 'intake.admit',
    'engine.view', 'engine.run',
    'alert.view', 'alert.acknowledge', 'alert.resolve',
    'audit.view',
    'admin.roles', 'admin.settings',
    'history.view', 'history.export',
  ],
  senior: [
    'patient.view', 'patient.create', 'patient.edit', 'patient.discharge',
    'vitals.view', 'vitals.record',
    'lab.view', 'lab.record',
    'medication.view', 'medication.prescribe', 'medication.stop',
    'note.view', 'note.create',
    'intake.analyze', 'intake.admit',
    'engine.view', 'engine.run',
    'alert.view', 'alert.acknowledge', 'alert.resolve',
    'audit.view',
    'history.view', 'history.export',
  ],
  intern: [
    'patient.view', 'patient.create', 'patient.edit',
    'vitals.view', 'vitals.record',
    'lab.view', 'lab.record',
    'medication.view', 'medication.prescribe',
    'note.view', 'note.create',
    'intake.analyze', 'intake.admit',
    'engine.view', 'engine.run',
    'alert.view', 'alert.acknowledge',
    'history.view',
  ],
  nurse: [
    'patient.view',
    'vitals.view', 'vitals.record',
    'lab.view', 'lab.record',
    'medication.view',
    'note.view', 'note.create',
    'alert.view', 'alert.acknowledge',
    'history.view',
  ],
  viewer: [
    'patient.view',
    'vitals.view',
    'lab.view',
    'medication.view',
    'note.view',
    'engine.view',
    'alert.view',
    'history.view',
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  senior: 'Médecin senior',
  intern: 'Interne',
  nurse: 'Infirmier(e)',
  viewer: 'Observateur',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#FF4757',
  senior: '#6C7CFF',
  intern: '#2FD1C8',
  nurse: '#FF6B8A',
  viewer: '#FFB347',
}

// ── Context ──
interface ProfileContextValue {
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  role: UserRole
  permissions: Permission[]
  can: (permission: Permission) => boolean
  canAny: (...permissions: Permission[]) => boolean
  canAll: (...permissions: Permission[]) => boolean
  roleLabel: string
  roleColor: string
  refresh: () => Promise<void>
}

const ProfileCtx = createContext<ProfileContextValue | null>(null)

// ── Demo profile (when not authenticated) ──
const DEMO_PROFILE: Profile = {
  id: 'demo',
  email: 'demo@pulsar.dev',
  full_name: 'Mode Démo',
  role: 'senior',
  service: 'Neuropédiatrie',
  hospital: 'CH Bray-sur-Seine',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setIsDemo(false)
          setLoading(false)
          return
        }
      }

      // Fallback: demo mode
      setProfile(DEMO_PROFILE)
      setIsDemo(true)
    } catch {
      setProfile(DEMO_PROFILE)
      setIsDemo(true)
    }
    setLoading(false)
  }

  useEffect(() => { loadProfile() }, [])

  const role = (profile?.role as UserRole) || 'viewer'
  const permissions = ROLE_PERMISSIONS[role] || []

  const value: ProfileContextValue = {
    profile,
    loading,
    isDemo,
    role,
    permissions,
    can: (p) => permissions.includes(p),
    canAny: (...ps) => ps.some(p => permissions.includes(p)),
    canAll: (...ps) => ps.every(p => permissions.includes(p)),
    roleLabel: ROLE_LABELS[role] || role,
    roleColor: ROLE_COLORS[role] || '#6C7CFF',
    refresh: loadProfile,
  }

  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileCtx)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}

export function useProfileSafe() {
  return useContext(ProfileCtx)
}

// ── Helper exports ──
export { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS }
