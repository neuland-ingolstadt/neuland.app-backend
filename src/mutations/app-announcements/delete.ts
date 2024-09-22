import { db } from '@/index'
import { GraphQLError } from 'graphql'

export async function deleteAppAnnouncement(
    _: unknown,
    {
        id,
    }: {
        id: number
    }
): Promise<boolean> {
    try {
        const rowsDeleted = await db('app_announcements').where({ id }).del()

        return rowsDeleted > 0
    } catch (error) {
        throw new GraphQLError(
            `Failed to delete the app announcement with id ${id}: ${error}`
        )
    }
}
