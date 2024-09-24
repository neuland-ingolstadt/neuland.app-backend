import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/universitySports'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteAppAnnouncement(
    _: unknown,
    {
        id,
    }: {
        id: number
    }
): Promise<boolean> {
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
