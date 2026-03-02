// ============================================================
// PULSAR V18 — Audit Service
// Traçabilité de chaque action utilisateur
// ============================================================

import { createClient } from '@/lib/supabase/client'

export type AuditAction =
  | 'patient.create' | 'patient.update' | 'patient.discharge' | 'patient.transfer'
  | 'vitals.record'
  | 'lab.record'
  | 'medication.prescribe' | 'medication.stop'
  | 'treatment.record'
  | 'intake.analyze' | 'intake.admit'
  | 'engine.compute'
  | 'alert.acknowledge' | 'alert.resolve'
  | 'exam.record'
  | 'note.create'
  | 'auth.login' | 'auth.logout'
  | 'discovery.signals.save' | 'discovery.signal.update'

export async function logAudit(
  action: AuditAction,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('audit_log').insert({
      user_id: user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    })
  } catch (err) {
    // Audit never blocks — log silently
    console.error('[AUDIT] Erreur:', err)
  }
}
