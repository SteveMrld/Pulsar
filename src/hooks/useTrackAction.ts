import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useTrackAction() {
  const supabase = createClient();

  const track = useCallback(async (
    action: string,
    resource?: string,
    patientId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('clinical_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action,
        resource: resource ?? null,
        patient_id: patientId ?? null,
        metadata: metadata ?? {},
      });
    } catch {
      // Silencieux — ne jamais bloquer l'UI pour un log
    }
  }, [supabase]);

  return { track };
}
