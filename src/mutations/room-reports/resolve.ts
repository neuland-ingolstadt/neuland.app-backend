import { db } from '@/db'
import { roomReports } from '@/db/schema/roomReports'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function resolveRoomReport(
    _: unknown,
    {
        id,
        resolved,
    }: {
        id: number
        resolved: boolean
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{ id: number }> {
    checkAuthorization(contextValue, adminRole)

    try {
        const [report] = await db
            .update(roomReports)
            .set({
                resolved_at: resolved ? new Date() : null,
            })
            .where(eq(roomReports.id, id))
            .returning({
                id: roomReports.id,
            })
        return {
            id: report.id,
        }
    } catch (error) {
        if (error instanceof TypeError) {
            throw new GraphQLError(
                `Failed to update room report: Report with id ${id} not found`
            )
        }
        throw new GraphQLError(`Failed to update room report: ${error}`)
    }
}
