import { db } from '@/db'
import { neulandEvents } from '@/db/schema/neulandEvents'
import { checkAuthorization, eventRole } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'

export async function upsertNeulandEvent(
    _: unknown,
    {
        id,
        input,
    }: {
        id: number | undefined
        input: NeulandEventInput
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{ id: number }> {
    const { title, description, location, startTime, endTime, rrule } = input

    checkAuthorization(contextValue, eventRole)

    let event

    if (id != null) {
        ;[event] = await db
            .update(neulandEvents)
            .set({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                location: location ?? null,
                start_time: startTime,
                end_time: endTime,
                rrule: rrule ?? null,
                updated_at: new Date(),
            })
            .where(eq(neulandEvents.id, id))
            .returning({
                id: neulandEvents.id,
            })
    } else {
        ;[event] = await db
            .insert(neulandEvents)
            .values({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                location: location ?? null,
                start_time: startTime,
                end_time: endTime,
                rrule: rrule ?? null,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning({
                id: neulandEvents.id,
            })
    }
    return {
        id: event.id,
    }
}
