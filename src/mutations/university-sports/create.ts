import { db } from '@/index'

export async function createUniversitySport(
    _: any,
    { input }: { input: UniversitySportInput }
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

    const [newEvent] = await db('university_sports')
        .insert({
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
            created_at: db.fn.now(),
            updated_at: db.fn.now(),
        })
        .returning('*')

    return {
        id: newEvent.id,
        title: {
            de: newEvent.title_de,
            en: newEvent.title_en,
        },
        description: {
            de: newEvent.description_de,
            en: newEvent.description_en,
        },
        campus: newEvent.campus,
        location: newEvent.location,
        weekday: newEvent.weekday,
        startTime: newEvent.start_time,
        endTime: newEvent.end_time,
        requiresRegistration: newEvent.requires_registration,
        contact: newEvent.contact,
        createdAt: newEvent.created_at,
        updatedAt: newEvent.updated_at,
    }
}
