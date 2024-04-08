import getClEvents from '@/scraping/cl-event'
import type { ClEvent } from '@/types/clEvents'

import { cache } from '../..'

const CACHE_TTL = 60 * 60 * 24 // 24 hours

export async function clEvents(): Promise<ClEvent[]> {
    let clEvents: ClEvent[] | undefined = await cache.get('mensa')

    if (clEvents === undefined || clEvents === null) {
        clEvents = await getClEvents()
        cache.set(`mensa`, clEvents, CACHE_TTL)
    }

    return clEvents
}
