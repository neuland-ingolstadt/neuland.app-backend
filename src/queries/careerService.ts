import { cache } from '@/index'
import getCareerServiceEvents from '@/scraping/careerService'
import type { CareerServiceEvent } from '@/types/careerServiceEvent'

const CACHE_TTL_RSS = 60 * 60 * 6 // 6 hours

export async function careerServiceEvents(): Promise<CareerServiceEvent[]> {
	let careerEvents: CareerServiceEvent[] | undefined =
		await cache.get('careerEvents')

	if (careerEvents) {
		return careerEvents
	}

	careerEvents = await getCareerServiceEvents()
	cache.set('careerEvents', careerEvents, CACHE_TTL_RSS)

	return careerEvents
}
