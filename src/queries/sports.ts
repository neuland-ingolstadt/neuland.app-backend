import { db } from '../..'

export async function sports(): Promise<UniversitySports[]> {
    const data = await db.select('*').from('university_sports')

    return data.map((sport) => ({
        id: sport.id,
        title: {
            de: sport.title_de,
            en: sport.title_en,
        },
        description: {
            de: sport.description_de,
            en: sport.description_en,
        },
        campus: sport.campus,
        location: sport.location,
        weekday: sport.weekday,
        startTime: sport.start_time,
        endTime: sport.end_time,
        requiresRegistration: sport.requires_registration,
        contact: sport.contact,
        createdAt: sport.created_at,
        updatedAt: sport.updated_at,
    }))
}
