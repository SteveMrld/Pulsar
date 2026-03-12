'use client'
import { type ReactNode } from 'react'
import { useProfile, type Permission } from '@/contexts/ProfileContext'

interface RoleGateProps {
  /** Permission requise pour afficher le contenu */
  require?: Permission
  /** Plusieurs permissions — au moins une suffit */
  requireAny?: Permission[]
  /** Toutes les permissions requises */
  requireAll?: Permission[]
  /** Contenu affiché si pas autorisé (optionnel) */
  fallback?: ReactNode
  /** Enfants affichés si autorisé */
  children: ReactNode
}

/**
 * Conditionne l'affichage d'un bloc selon les permissions de l'utilisateur.
 *
 * Usage:
 *   <RoleGate require="medication.prescribe">
 *     <PrescriptionButton />
 *   </RoleGate>
 *
 *   <RoleGate requireAny={['alert.acknowledge', 'alert.resolve']}>
 *     <AlertActions />
 *   </RoleGate>
 */
export default function RoleGate({ require, requireAny, requireAll, fallback, children }: RoleGateProps) {
  const { can, canAny, canAll } = useProfile()

  let authorized = true

  if (require) authorized = can(require)
  if (requireAny) authorized = canAny(...requireAny)
  if (requireAll) authorized = canAll(...requireAll)

  if (!authorized) return fallback ? <>{fallback}</> : null

  return <>{children}</>
}

/**
 * Affiche un badge de rôle compact
 */
export function RoleBadge() {
  const { roleLabel, roleColor, isDemo } = useProfile()

  // Ne pas afficher le badge DÉMO sur les patients intake (session valide sans profil DB)
  if (isDemo) return null

  return (
    <span style={{
      fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
      padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px',
      background: `${roleColor}15`, color: roleColor,
      border: `1px solid ${roleColor}30`,
    }}>
      {roleLabel.toUpperCase()}
    </span>
  )
}

/**
 * Message "accès refusé" stylé PULSAR
 */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div style={{
      padding: '40px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    }}>
      <div style={{ fontSize: '24px' }}>🔒</div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: 'var(--p-text)' }}>
        Accès restreint
      </div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', maxWidth: '300px' }}>
        {message || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette section.'}
      </div>
    </div>
  )
}
