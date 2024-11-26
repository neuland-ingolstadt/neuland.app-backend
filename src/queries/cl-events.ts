import { db } from '@/db'
import { manualClEvents } from '@/db/schema/manualClEvents'
import { cache } from '@/index'
import getClEvents from '@/scraping/cl-event'
import { gte } from 'drizzle-orm'

const CACHE_TTL_MOODLE = 60 * 60 * 24 // 24 hours
const CACHE_TTL_TOTAL = 60 * 60 * 3 // 3 hours

export async function clEvents(): Promise<ClEvent[]> {
    let combinedClEvents: ClEvent[] | undefined =
        await cache.get('combinedClEvents')

    if (combinedClEvents !== undefined && combinedClEvents !== null) {
        return combinedClEvents
    }

    let clEvents: ClEvent[] | undefined = await cache.get('clEventsMoodle')

    if (clEvents === undefined || clEvents === null) {
        clEvents = await getClEvents()
        cache.set('clEventsMoodle', clEvents, CACHE_TTL_MOODLE)
    }

    const additionalClEvents = await db
        .select()
        .from(manualClEvents)
        .where(gte(manualClEvents.start_date_time, new Date()))

    const dbClEvents = additionalClEvents.map((event) => {
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

    combinedClEvents = clEvents.concat(dbClEvents).sort((a, b) => {
        return a.begin.getTime() - b.begin.getTime()
    })

    cache.set('combinedClEvents', combinedClEvents, CACHE_TTL_TOTAL)

    return combinedClEvents
}
