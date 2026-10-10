import { GraphQLError } from 'graphql'
import { db } from '@/db'
import { roomReports } from '@/db/schema/roomReports'
import type { RoomReportInput } from '@/types/roomReport'
import { logger } from '@/utils/logger'

export async function createRoomReport(
    _: unknown,
    {
        input
    }: {
        input: RoomReportInput
    }
): Promise<{ id: number }> {
    const validReasons = [
        'WRONG_DESCRIPTION',
        'WRONG_LOCATION',
        'NOT_EXISTING',
        'MISSING',
        'OTHER'
    ]
    const { room, reason, description } = input
    if (!validReasons.includes(reason)) {
        throw new GraphQLError(
            `Invalid report reason. Must be one of: ${validReasons.join(', ')}`
        )
    }
    try {
        const [report] = await db
            .insert(roomReports)
            .values({
                room,
                reason,
                description,
                created_at: new Date()
            })
            .returning({
                id: roomReports.id
            })
        logger.debug('Room report created', { id: report.id, room })
        return {
            id: report.id
        }
    } catch (error) {
        logger.error('Failed to create room report', { err: error })
        throw new GraphQLError(`Failed to create room report: ${error}`)
    }
}
