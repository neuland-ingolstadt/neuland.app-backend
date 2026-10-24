import type { components } from '@neuland-ingolstadt/backend-core-api'
import { GraphQLError } from 'graphql'
import type { RoomReportInput } from '@/types/roomReport'
import { coreApiFetch } from '@/utils/core-api'
import { logger } from '@/utils/logger'

type CreateRoomReportRequest = components['schemas']['CreateRoomReportRequest']
type RoomReportResponse = components['schemas']['RoomReportResponse']

const VALID_REASONS: CreateRoomReportRequest['reason'][] = [
    'WRONG_DESCRIPTION',
    'WRONG_LOCATION',
    'NOT_EXISTING',
    'MISSING',
    'OTHER'
]

export async function createRoomReport(
    _: unknown,
    {
        input
    }: {
        input: RoomReportInput
    }
): Promise<{ id: number }> {
    const { room, reason, description } = input

    if (!VALID_REASONS.includes(reason)) {
        throw new GraphQLError(
            `Invalid report reason. Must be one of: ${VALID_REASONS.join(', ')}`
        )
    }

    const body: CreateRoomReportRequest = {
        room,
        reason,
        description: description ?? null
    }

    try {
        const report = await coreApiFetch<RoomReportResponse>('/room-reports', {
            method: 'POST',
            body: JSON.stringify(body)
        })
        logger.debug('Room report created via Core API', {
            id: report.id,
            room
        })
        return { id: report.id }
    } catch (error) {
        if (error instanceof GraphQLError) {
            throw error
        }
        logger.error('Failed to create room report', { err: error })
        throw new GraphQLError(`Failed to create room report: ${error}`)
    }
}
