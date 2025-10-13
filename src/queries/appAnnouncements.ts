import { and, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/appAnnouncements'
import type {
    Announcement,
    AppPlatformEnum,
    UserKindEnum
} from '@/types/announcement'

export async function appAnnouncementsQuery(
    _: unknown,
    args: {
        active: boolean
    }
): Promise<Announcement[]> {
    const { active } = args
    const now = new Date()

    const data = await (active
        ? db
              .select()
              .from(appAnnouncements)
              .where(
                  and(
                      lte(appAnnouncements.start_date_time, now),
                      gte(appAnnouncements.end_date_time, now)
                  )
              )
        : db.select().from(appAnnouncements))

    const announcements = data.map((announcement) => ({
        platform: announcement.platform as AppPlatformEnum[],
        userKind: announcement.user_kind as UserKindEnum[],
        id: announcement.id,
        title: {
            de: announcement.title_de,
            en: announcement.title_en
        },
        description: {
            de: announcement.description_de,
            en: announcement.description_en
        },
        startDateTime: announcement.start_date_time,
        endDateTime: announcement.end_date_time,
        priority: announcement.priority,
        url: announcement.url,
        imageUrl: announcement.image_url,
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at
    }))

    return announcements
}
