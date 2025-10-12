import { db } from '@/db'
import { auditLog } from '@/db/schema/auditLog'

export async function logAudit(
  entity: string,
  entityId: number | null,
  operation: 'insert' | 'update' | 'delete',
  contextValue: {
    jwtPayload?: { email?: string; sub?: string; [key: string]: unknown }
  }
): Promise<void> {
  const name = contextValue.jwtPayload?.email ?? null
  const userId = contextValue.jwtPayload?.sub ?? null
  await db.insert(auditLog).values({
    entity,
    entity_id: entityId ?? null,
    operation,
    name: name,
    user_id: userId,
    created_at: new Date()
  })
}
