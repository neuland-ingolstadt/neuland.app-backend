import { db } from '@/db'
import { universitySports } from '@/db/schema/appAnnouncements'
import { sportRole } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteUniversitySport(
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

    if (!contextValue.jwtPayload.groups.includes(sportRole)) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }

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
