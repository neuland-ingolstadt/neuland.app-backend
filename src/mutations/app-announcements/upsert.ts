import { db } from '@/db'
import { appAnnouncements } from '@/db/schema/universitySports'
import { announcementRole } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

export async function upsertAppAnnouncement(
    _: unknown,
    {
        id,
        input,
    }: {
        id: number | undefined
        input: AnnouncementInput
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{
    id: number
}> {
    if (!contextValue.jwtPayload) {
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    if (!contextValue.jwtPayload.groups.includes(announcementRole)) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }

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
                updated_at: new Date(),
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
                created_at: new Date(),
                updated_at: new Date(),
            })

            .returning({
                id: appAnnouncements.id,
            })
    }

    return {
        id: announcement.id,
    }
}
