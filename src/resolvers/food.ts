/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { getCanisiusPlan } from '@/scraping/canisius'
import { getMensaPlan } from '@/scraping/mensa'
import { getReimannsPlan } from '@/scraping/reimanns'
import type { MealData } from '@/types/food'
import { GraphQLError } from 'graphql'

import { cache } from '../..'

const CACHE_TTL = 60 * 30 // 30 minutes
const ulrMensa =
    'https://www.max-manager.de/daten-extern/sw-erlangen-nuernberg/xml/mensa-ingolstadt.xml'
const ulrNeuburg =
    'https://www.max-manager.de/daten-extern/sw-erlangen-nuernberg/xml/cafeteria-neuburg.xml'

export async function food(
    _: any,
    args: { locations: string[] }
): Promise<MealData[]> {
    const validLocations = [
        'IngolstadtMensa',
        'NeuburgMensa',
        'Reimanns',
        'Canisius',
    ]
    const locations = args?.locations.filter((arg) =>
        validLocations.includes(arg)
    )
    if (locations.length !== args.locations.length) {
        throw new GraphQLError(
            'Invalid location provided. Valid locations are: ' +
                validLocations.join(', ')
        )
    }

    let data: MealData[] = []

    for (const location of locations) {
        let meals: MealData[] | undefined = await cache.get(location)
        if (meals === undefined || meals === null) {
            switch (location) {
                case 'IngolstadtMensa':
                    meals = await getMensaPlan(ulrMensa)
                    break
                case 'NeuburgMensa':
                    meals = await getMensaPlan(ulrNeuburg)
                    break
                case 'Reimanns':
                    meals = await getReimannsPlan()
                    break
                case 'Canisius':
                    meals = await getCanisiusPlan()
                    break
            }
            cache.set(location, meals, CACHE_TTL)
        }
        if (meals !== undefined) data = data.concat(meals)
    }
    return data
}
