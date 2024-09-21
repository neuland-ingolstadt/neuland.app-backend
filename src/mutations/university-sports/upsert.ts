import { db } from '@/index'

export async function upsertUniversitySport(
    _: any,
    { id, input }: { id: string | undefined; input: UniversitySportInput }
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

    let event

    if (id != null) {
        // Perform update
        ;[event] = await db('university_sports')
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
    } else {
        // Perform insert
        ;[event] = await db('university_sports')
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
    }

    return {
        id: event.id,
        title: {
            de: event.title_de,
            en: event.title_en,
        },
        description: {
            de: event.description_de,
            en: event.description_en,
        },
        campus: event.campus,
        location: event.location,
        weekday: event.weekday,
        startTime: event.start_time,
        endTime: event.end_time,
        requiresRegistration: event.requires_registration,
        contact: event.contact,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
    }
}
