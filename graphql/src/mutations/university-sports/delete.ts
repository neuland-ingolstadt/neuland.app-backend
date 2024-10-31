import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { db } from '../../db'
import { universitySports } from '../../db/schema/universitySports'
import { checkAuthorization, sportRole } from '../../utils/auth-utils'

export async function deleteUniversitySport(
    _: unknown,
    {
        id,
    }: {
        id: number
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<boolean> {
    checkAuthorization(contextValue, sportRole)
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
