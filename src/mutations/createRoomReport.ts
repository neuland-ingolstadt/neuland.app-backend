import { db } from '@/db'
import { roomReports } from '@/db/schema/roomReports'
import { GraphQLError } from 'graphql'

export async function createRoomReport(
    _: unknown,
    {
        input,
    }: {
        input: RoomReportInput
    }
): Promise<{ id: number }> {
    const { room, reason, description } = input
    console.log(input)
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
