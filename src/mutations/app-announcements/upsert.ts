import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/universitySports'
import { eq } from 'drizzle-orm'

export async function upsertAppAnnouncement(
    _: unknown,
    {
        id,
        input,
    }: {
        id: number | undefined
        input: AnnouncementInput
    }
): Promise<{
    id: number
}> {
    const { title, description, startDateTime, endDateTime, priority, url } =
        input

    let announcement

    if (id != null) {
        // Perform update
        ;[announcement] = await db
            .update(appAnnouncements)
            .set({
                title_de: title.de,
                title_en: title.en,
                description_de: description.de,
                description_en: description.en,
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                priority,
                url,
            })
            .where(eq(appAnnouncements.id, id))

            .returning({
                id: appAnnouncements.id,
            })
    } else {
        // Perform insert
        ;[announcement] = await db
            .insert(appAnnouncements)
            .values({
                title_de: title.de,
                title_en: title.en,
                description_de: description.de,
                description_en: description.en,
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                priority,
                url,
            })

            .returning({
                id: appAnnouncements.id,
            })
    }

    return {
        id: announcement.id,
    }
}
