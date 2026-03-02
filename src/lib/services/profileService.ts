// ============================================================
// PULSAR V18 — Profile Service
// Profils utilisateurs, rôles, annuaire
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/lib/types/database'

export const profileService = {

  // Profil de l'utilisateur connecté
  async getCurrent(): Promise<Profile | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return null
    return data
  },

  // Profil par ID
  async getById(id: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },

  // Annuaire (tous les profils du service)
  async getAll(): Promise<Profile[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw new Error(`[ProfileService] getAll: ${error.message}`)
    return data || []
  },

  // Mettre à jour son profil
  async updateCurrent(updates: { full_name?: string; avatar_url?: string }): Promise<Profile> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('[ProfileService] Non authentifié')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw new Error(`[ProfileService] updateCurrent: ${error.message}`)
    return data
  },

  // Changer le rôle (admin seulement)
  async setRole(userId: string, role: UserRole): Promise<void> {
    const supabase = createClient()

    // Vérifier que l'appelant est admin
    const current = await profileService.getCurrent()
    if (!current || current.role !== 'admin') {
      throw new Error('[ProfileService] setRole: accès refusé — admin requis')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) throw new Error(`[ProfileService] setRole: ${error.message}`)
  },

  // Vérifier un rôle minimum
  async hasMinRole(minRole: UserRole): Promise<boolean> {
    const hierarchy: Record<UserRole, number> = {
      viewer: 0, nurse: 1, intern: 2, senior: 3, admin: 4,
    }
    const current = await profileService.getCurrent()
    if (!current) return false
    return hierarchy[current.role] >= hierarchy[minRole]
  },
}
