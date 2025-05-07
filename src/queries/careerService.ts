import { cache } from '@/index'
import getCareerServiceEvents from '@/scraping/careerService'

const CACHE_TTL_MOODLE = 60 * 60 * 12 // 12 hours

export async function careerServiceEvents(): Promise<CareerServiceEvent[]> {
    let careerEvents: CareerServiceEvent[] | undefined =
        await cache.get('careerEvents')

    if (careerEvents) {
        return careerEvents
    }

    careerEvents = await getCareerServiceEvents()
    cache.set('careerEvents', careerEvents, CACHE_TTL_MOODLE)

    return careerEvents
}
