import { db } from '@/index'

export async function upsertAppAnnouncement(
    _: any,
    { id, input }: { id: string | undefined; input: AnnouncementInput }
): Promise<Announcement> {
    const { title, description, startDateTime, endDateTime, priority, url } =
        input

    const formattedStartTime = new Date(Number(startDateTime) * 1000)
        .toISOString()
        .replace('Z', '')
        .replace('T', ' ')

    const formattedEndTime = new Date(Number(endDateTime) * 1000)
        .toISOString()
        .replace('Z', '')
        .replace('T', ' ')

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
                start_time: formattedStartTime,
                end_time: formattedEndTime,
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
                start_time: formattedStartTime,
                end_time: formattedEndTime,
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
        startDateTime: announcement.start_time,
        endDateTime: announcement.end_time,
        priority: announcement.priority,
        url: announcement.url,
    }
}
