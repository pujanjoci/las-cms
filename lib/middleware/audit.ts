import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';

const AUDITABLE_ACTIONS: Record<string, string> = {
  'POST':   'CREATE',
  'PUT':    'UPDATE',
  'PATCH':  'UPDATE',
  'DELETE': 'DELETE'
};

const ENTITY_TYPE_MAP: Record<string, string> = {
  '/borrowers':    'borrower',
  '/proposals':    'proposal',
  '/users':        'user',
  '/risk-scores':  'risk_score',
  '/workflow':     'workflow',
  '/roles':        'role',
  '/departments':  'department',
  '/workflow/chains': 'config',
};

function resolveEntityType(path: string) {
  for (const [key, value] of Object.entries(ENTITY_TYPE_MAP)) {
    if (path.includes(key)) return value;
  }
  return 'system';
}

export function withAudit(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const clonedReq = req.clone();
    const response = await handler(req, ...args);
    
    (async () => {
      try {
        const session = await getSession();
        const action = AUDITABLE_ACTIONS[clonedReq.method];
        
        if (action && session) {
          let entityId = null;
          let entityLabel = null;
          
          try {
            const body = await response.clone().json();
            entityId = body.id || null;
            entityLabel = body.proposal_no || body.borrower_code || body.full_name || null;
          } catch (e) {}

          const ip = clonedReq.headers.get('x-forwarded-for') || '127.0.0.1';
          const ua = clonedReq.headers.get('user-agent') || 'Unknown';

          await supabase.from('audit_logs').insert([{
            user_id: session.id,
            user_name: session.full_name,
            user_role: session.roles.join(', '),
            action,
            entity_type: resolveEntityType(new URL(clonedReq.url).pathname),
            entity_id: entityId ? String(entityId) : null,
            entity_label: entityLabel,
            ip_address: ip,
            user_agent: ua
          }]);
        }
      } catch (err) {
        console.error('Audit Log Error:', err);
      }
    })();

    return response;
  };
}

export async function auditFieldChanges(
  entityType: string, 
  entityId: string, 
  entityLabel: string | null, 
  before: any, 
  after: any, 
  session: any, 
  ip: string
) {
  const changedFields = Object.keys(after).filter(
    key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
  );
  
  const auditEntries = changedFields.map(field => ({
    user_id: session.id,
    user_name: session.full_name,
    user_role: session.roles.join(', '),
    action: 'UPDATE',
    entity_type: entityType,
    entity_id: String(entityId),
    entity_label: entityLabel,
    field_name: field,
    before_value: String(before[field] ?? ''),
    after_value: String(after[field] ?? ''),
    ip_address: ip
  }));
  
  if (auditEntries.length > 0) {
    await supabase.from('audit_logs').insert(auditEntries);
  }
}
