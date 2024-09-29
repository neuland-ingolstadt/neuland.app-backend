import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/universitySports'
import { announcementRole } from '@/utils/auth-utils'
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
    if (!contextValue.jwtPayload) {
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    if (!contextValue.jwtPayload.groups.includes(announcementRole)) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }
    try {
        const rowsDeleted = await db
            .delete(appAnnouncements)
            .where(eq(appAnnouncements.id, id))

        return rowsDeleted.length > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the app announcement with id ${id}: ${error}`
        )
    }
}
