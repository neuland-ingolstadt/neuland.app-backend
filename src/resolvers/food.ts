/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { getCanisiusPlan } from '@/scraping/canisius'
import { getMensaPlan } from '@/scraping/mensa'
import { getReimannsPlan } from '@/scraping/reimanns'
import type { MealData } from '@/types/food'
import { GraphQLError } from 'graphql'

import { cache } from '../..'

const CACHE_TTL = 60 * 30 // 30 minutes

export async function food(
    _: any,
    args: { locations: string[] }
): Promise<MealData[]> {
    const validLocations = ['mensa', 'reimanns', 'canisius']
    const locations = args?.locations.filter((arg) =>
        validLocations.includes(arg)
    )
    if (locations.length !== args.locations.length) {
        throw new GraphQLError(
            'Invalid location provided. Valid locations are: mensa, reimanns, canisius'
        )
    }

    let data: MealData[] = []

    for (const location of locations) {
        let meals: MealData[] | undefined = await cache.get(location)
        if (meals === undefined || meals === null) {
            switch (location) {
                case 'mensa':
                    meals = await getMensaPlan()
                    break
                case 'reimanns':
                    meals = await getReimannsPlan()
                    break
                case 'canisius':
                    meals = await getCanisiusPlan()
                    break
            }
            cache.set(location, meals, CACHE_TTL)
        }
        if (meals !== undefined) data = data.concat(meals)
    }
    return data
}
