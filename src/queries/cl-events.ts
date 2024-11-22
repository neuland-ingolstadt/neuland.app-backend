import { db } from '@/db'
import { manualClEvents } from '@/db/schema/manualClEvents'
import { cache } from '@/index'
import getClEvents from '@/scraping/cl-event'
import { gte } from 'drizzle-orm'

const CACHE_TTL = 60 * 60 * 24 // 24 hours

export async function clEvents(): Promise<ClEvent[]> {
    let clEvents: ClEvent[] | undefined = await cache.get('clEvents')

    if (clEvents === undefined || clEvents === null) {
        clEvents = await getClEvents()
        cache.set(`clEvents`, clEvents, CACHE_TTL)
    }

    const addionalClEvents = await db
        .select()
        .from(manualClEvents)
        .where(gte(manualClEvents.start_date_time, new Date()))

    const dbClEvents = addionalClEvents.map((event) => {
        return {
            id: event.id.toString(),
            organizer: event.organizer,
            host: {
                name: event.organizer,
                website: event.host_url,
                instagram: event.host_instagram,
            },
            title: {
                de: event.title_de,
                en: event.title_en,
            },
            description:
                event.description_de != null && event.description_en != null
                    ? { de: event.description_de, en: event.description_en }
                    : null,
            begin: event.start_date_time,

            end: event.end_date_time,
            location: null,

            eventWebsite: event.event_url,
            isMoodleEvent: false,
        } satisfies ClEvent
    })
    clEvents = clEvents.concat(dbClEvents).sort((a, b) => {
        return a.begin.getTime() - b.begin.getTime()
    })

    return clEvents
}
