import { universitySports } from '@/db/schema'

import { drizzleDB } from '../..'

export async function sports(): Promise<UniversitySports[]> {
    const data = await drizzleDB.select().from(universitySports)

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
        invitationLink: sport.invitation_link,
        eMail: sport.e_mail,
        createdAt: sport.created_at,
        updatedAt: sport.updated_at,
    }))
}
