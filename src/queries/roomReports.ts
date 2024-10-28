import { db } from '@/db'
import { roomReports } from '@/db/schema/roomReports'
import { adminRole } from '@/utils/auth-utils'
import { GraphQLError } from 'graphql'

export async function roomReportsQuery(
    _: unknown,
    __: unknown,
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<RoomReport[]> {
    if (!contextValue.jwtPayload) {
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    if (!contextValue.jwtPayload.groups.includes(adminRole)) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }
    const data = await db.select().from(roomReports)

    return data.map((report) => ({
        id: report.id,
        room: report.room,
        reason: report.reason,
        description: report.description,
        createdAt: report.created_at,
        resolvedAt: report.resolved_at || null,
    }))
}
