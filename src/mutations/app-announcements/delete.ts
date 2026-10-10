import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/appAnnouncements'
import { logAudit } from '@/utils/audit-utils'
import { announcementRole, checkAuthorization } from '@/utils/auth-utils'
import { logger } from '@/utils/logger'

export async function deleteAppAnnouncement(
    _: unknown,
    {
        id
    }: {
        id: number
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<boolean> {
    checkAuthorization(contextValue, announcementRole)
    try {
        const rowsDeleted = await db
            .delete(appAnnouncements)
            .where(eq(appAnnouncements.id, id))
            .returning()

        if (rowsDeleted.length > 0) {
            try {
                await logAudit('app_announcements', id, 'delete', contextValue)
            } catch (error) {
                logger.warn('Audit logging failed for delete operation', {
                    entity: 'app_announcements',
                    entityId: id,
                    err: error
                })
            }
        }

        return rowsDeleted.length > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the app announcement with id ${id}: ${error}`
        )
    }
}
