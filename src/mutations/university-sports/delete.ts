import { db } from '@/index'

export async function deleteUniversitySport(
    _: any,
    { id }: { id: number }
): Promise<boolean> {
    try {
        const rowsDeleted = await db('university_sports').where({ id }).del()

        return rowsDeleted > 0
    } catch (error) {
        throw new Error('Failed to delete the sports event')
    }
}
