import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/appAnnouncements'
import { announcementRole, checkAuthorization } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteAppAnnouncement(
    _: unknown,
    {
        id,
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

        return rowsDeleted.length > 0
    } catch (error) {
        console.error(
            `Failed to delete the app announcement with id ${id}: ${error}`
        )
        throw new GraphQLError(
            `Failed to delete the app announcement with id ${id}: ${error}`
        )
    }
}
