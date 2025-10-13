import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { auditLog } from '@/db/schema/auditLog'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'

export async function auditLogQuery(
    _: unknown,
    args: { limit?: number; offset?: number },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<AuditLogEntry[]> {
    checkAuthorization(contextValue, adminRole)
    const { limit = 100, offset = 0 } = args
    const rows = await db
        .select()
        .from(auditLog)
        .orderBy(desc(auditLog.created_at))
        .limit(limit)
        .offset(offset)

    return rows.map((row) => ({
        id: row.id,
        entity: row.entity,
        entityId: row.entity_id,
        operation: row.operation,
        name: row.name,
        userId: row.user_id,
        createdAt: row.created_at
    }))
}
