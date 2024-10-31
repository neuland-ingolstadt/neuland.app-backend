import { cache } from '@/index'

import getClEvents from '../scraping/cl-event'
import type { ClEvent } from '../types/clEvents'

const CACHE_TTL = 60 * 60 * 24 // 24 hours

export async function clEvents(): Promise<ClEvent[]> {
    let clEvents: ClEvent[] | undefined = await cache.get('clEvents')

    if (clEvents === undefined || clEvents === null) {
        clEvents = await getClEvents()
        cache.set(`clEvents`, clEvents, CACHE_TTL)
    }

    return clEvents
}
