import { db } from '@/db'
import { universitySports } from '@/db/schema/appAnnouncements'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteUniversitySport({
    id,
}: {
    id: number
}): Promise<boolean> {
    try {
        const rowsDeleted = await db
            .delete(universitySports)
            .where(eq(universitySports.id, id))
        return rowsDeleted.length > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the university sport with id ${id}: ${error}`
        )
    }
}
