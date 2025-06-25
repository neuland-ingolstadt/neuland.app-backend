import { db } from '@/db'
import { universitySports } from '@/db/schema/universitySports'
import { logAudit } from '@/utils/audit-utils'
import { checkAuthorization, sportRole } from '@/utils/auth-utils'
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
    checkAuthorization(contextValue, sportRole)
    try {
        const rowsDeleted = await db
            .delete(universitySports)
            .where(eq(universitySports.id, id))
            .returning()

        if (rowsDeleted.length > 0) {
            try {
                await logAudit('university_sports', id, 'delete', contextValue)
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
            `Failed to delete the university sport with id ${id}: ${error}`
        )
    }
}
