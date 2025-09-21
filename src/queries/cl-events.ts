import { cache } from '@/index'
import getClEvents from '@/scraping/cl-event'

const CACHE_TTL_SECONDS = 60 * 60 * 1 // 1 hour

export async function clEvents(): Promise<ClEvent[]> {
    const cachedEvents: ClEvent[] | undefined = await cache.get('clEvents')

    if (cachedEvents !== undefined && cachedEvents !== null) {
        return cachedEvents
    }

    const events = await getClEvents()

    cache.set('clEvents', events, CACHE_TTL_SECONDS)

    return events
}
