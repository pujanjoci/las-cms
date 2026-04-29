import 'server-only';
import { supabase } from './db';

/**
 * Append-only audit log — never updates or deletes entries.
 * Called from all mutation Server Actions and Route Handlers.
 */
export async function auditLog(params: {
  entityType: string;
  entityId: number;
  action: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  actorId: number;
  ipAddress?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    before_value: params.before || null,
    after_value: params.after || null,
    actor_id: params.actorId,
    ip_address: params.ipAddress || null,
  });

  if (error) {
    console.error('Failed to insert audit log:', error);
  }
}
