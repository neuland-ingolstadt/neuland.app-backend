import { db } from '@/index'

export async function updateUniversitySport(
    _: any,
    { id, input }: { id: string; input: UniversitySportInput }
): Promise<UniversitySports> {
    const {
        title,
        description,
        campus,
        location,
        weekday,
        startTime,
        endTime,
        requiresRegistration,
        contact,
    } = input

    const formattedStartTime = new Date(Number(startTime) * 1000)
        .toISOString()
        .replace('Z', '')
        .replace('T', ' ')

    const formattedEndTime =
        endTime != null
            ? new Date(Number(endTime) * 1000)
                  .toISOString()
                  .replace('Z', '')
                  .replace('T', ' ')
            : null

    const [updatedEvent] = await db('university_sports')
        .where({ id })
        .update({
            title_de: title.de,
            title_en: title.en,
            description_de: description?.de ?? null,
            description_en: description?.en ?? null,
            campus,
            location,
            weekday,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            requires_registration: requiresRegistration,
            contact,
            updated_at: db.fn.now(),
        })
        .returning('*')

    return {
        id: updatedEvent.id,
        title: {
            de: updatedEvent.title_de,
            en: updatedEvent.title_en,
        },
        description: {
            de: updatedEvent.description_de,
            en: updatedEvent.description_en,
        },
        campus: updatedEvent.campus,
        location: updatedEvent.location,
        weekday: updatedEvent.weekday,
        startTime: updatedEvent.start_time,
        endTime: updatedEvent.end_time,
        requiresRegistration: updatedEvent.requires_registration,
        contact: updatedEvent.contact,
        createdAt: updatedEvent.created_at,
        updatedAt: updatedEvent.updated_at,
    }
}
