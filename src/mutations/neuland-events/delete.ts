import { db } from '@/db'
import { neulandEvents } from '@/db/schema/neulandEvents'
import { checkAuthorization, eventRole } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function deleteNeulandEvent(
    _: unknown,
    {
        id,
    }: {
        id: number
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<boolean> {
    checkAuthorization(contextValue, eventRole)
    try {
        const rowsDeleted = await db
            .delete(neulandEvents)
            .where(eq(neulandEvents.id, id))
            .returning()
        return rowsDeleted.length > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the event with id ${id}: ${error}`
        )
    }
}
