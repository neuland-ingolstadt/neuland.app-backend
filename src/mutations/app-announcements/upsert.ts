import { db } from '@/index'

export async function upsertAppAnnouncement(
    _: unknown,
    {
        id,
        input,
    }: {
        id: string | undefined
        input: AnnouncementInput
    }
): Promise<Announcement> {
    const { title, description, startDateTime, endDateTime, priority, url } =
        input

    let announcement

    if (id != null) {
        // Perform update
        ;[announcement] = await db('app_announcements')
            .where({ id })
            .update({
                title_de: title.de,
                title_en: title.en,
                description_de: description.de,
                description_en: description.en,
                start_time: startDateTime,
                end_time: endDateTime,
                priority,
                url,
            })
            .returning('*')
    } else {
        // Perform insert
        ;[announcement] = await db('app_announcements')
            .insert({
                title_de: title.de,
                title_en: title.en,
                description_de: description.de,
                description_en: description.en,
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                priority,
                url,
            })
            .returning('*')
    }

    return {
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
    }
}
