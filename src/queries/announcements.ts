import { db } from '../..'

export async function announcements(): Promise<Announcement[]> {
    const data = await db.select('*').from('app_announcements')

    return data.map((announcement) => ({
        id: announcement.id,
        title: {
            de: announcement.title_de,
            en: announcement.title_en,
        },
        description: {
            de: announcement.description_de,
            en: announcement.description_en,
        },
        startDateTime: announcement.start_date_time,
        endDateTime: announcement.end_date_time,
        priority: announcement.priority,
        url: announcement.url,
    }))
}
