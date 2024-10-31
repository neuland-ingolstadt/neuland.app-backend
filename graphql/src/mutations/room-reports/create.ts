import { GraphQLError } from 'graphql'

import { db } from '../../db'
import { roomReports } from '../../db/schema/roomReports'

export async function createRoomReport(
    _: unknown,
    {
        input,
    }: {
        input: RoomReportInput
    }
): Promise<{ id: number }> {
    const validReasons = [
        'WRONG_DESCRIPTION',
        'WRONG_LOCATION',
        'NOT_EXISTING',
        'MISSING',
        'OTHER',
    ]
    const { room, reason, description } = input
    if (!validReasons.includes(reason)) {
        throw new GraphQLError(
            'Invalid report reason. Must be one of: ' + validReasons.join(', ')
        )
    }
    try {
        const [report] = await db
            .insert(roomReports)
            .values({
                room,
                reason,
                description,
                created_at: new Date(),
            })
            .returning({
                id: roomReports.id,
            })
        console.log(report)
        return {
            id: report.id,
        }
    } catch (error) {
        console.error(error)
        throw new GraphQLError(`Failed to create room report: ${error}`)
    }
}
