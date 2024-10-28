import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/appAnnouncements'

export async function appAnnouncementsQuery(): Promise<Announcement[]> {
    const data = await db.select().from(appAnnouncements)

    return data.map((announcement) => ({
        platform: announcement.platform as AppPlatformEnum[],
        userKind: announcement.user_kind as UserKindEnum[],
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
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at,
    }))
}
