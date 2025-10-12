import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { manualClEvents } from '@/db/schema/manualClEvents'
import type { ManualClEventsInput } from '@/types/clEvents'
import { logAudit } from '@/utils/audit-utils'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'

export async function upsertManualClEvent(
    _: unknown,
    {
        id,
        input
    }: {
        id: number | undefined
        input: ManualClEventsInput
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{ id: number }> {
    const { host, title, description, begin, end, location, eventWebsite } =
        input
    console.log('upsertManualClEvent', id, input, contextValue)
    checkAuthorization(contextValue, adminRole)

    let event

    if (id != null) {
        ;[event] = await db
            .update(manualClEvents)
            .set({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                start_date_time: begin,
                end_date_time: end ?? null,
                organizer: host.name,
                location: location ?? null,
                host_url: host.website ?? null,
                host_instagram: host.instagram ?? null,
                event_url: eventWebsite ?? null,
                updated_at: new Date()
            })
            .where(eq(manualClEvents.id, id))
            .returning({
                id: manualClEvents.id
            })
        try {
            await logAudit('manual_cl_events', event.id, 'update', contextValue)
        } catch (error) {
            console.error('Audit logging failed for update operation:', error)
        }
    } else {
        ;[event] = await db
            .insert(manualClEvents)
            .values({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                start_date_time: begin,
                end_date_time: end ?? null,
                organizer: host.name,
                location: location ?? null,
                host_url: host.website ?? null,
                host_instagram: host.instagram ?? null,
                event_url: eventWebsite ?? null,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning({
                id: manualClEvents.id
            })
        try {
            await logAudit('manual_cl_events', event.id, 'insert', contextValue)
        } catch (error) {
            console.error('Audit logging failed for insert operation:', error)
        }
    }
    return {
        id: event.id
    }
}
