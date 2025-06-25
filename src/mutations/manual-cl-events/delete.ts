import { db } from '@/db'
import { manualClEvents } from '@/db/schema/manualClEvents'
import { logAudit } from '@/utils/audit-utils'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteManualClEvent(
    _: unknown,
    {
        id,
    }: {
        id: number
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<boolean> {
    checkAuthorization(contextValue, adminRole)
    try {
        const rowsDeleted = await db
            .delete(manualClEvents)
            .where(eq(manualClEvents.id, id))
            .returning()

        if (rowsDeleted.length > 0) {
            try {
                await logAudit('manual_cl_events', id, 'delete', contextValue)
            } catch (error) {
                console.error(
                    'Audit logging failed for delete operation:',
                    error
                )
            }
        }

        return rowsDeleted.length > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the manual campus life event with id ${id}: ${error}`
        )
    }
}
