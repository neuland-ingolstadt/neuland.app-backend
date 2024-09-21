import { db } from '@/index'

export async function deleteAppAnnouncement(
    _: any,
    { id }: { id: number }
): Promise<boolean> {
    try {
        const rowsDeleted = await db('app_announcements').where({ id }).del()

        return rowsDeleted > 0
    } catch (error) {
        throw new Error('Failed to delete the sports event')
    }
}
