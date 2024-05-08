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
    args: { locations: string[] | undefined }
): Promise<MealData[]> {
    const validLocations = [
        'IngolstadtMensa',
        'NeuburgMensa',
        'Reimanns',
        'Canisius',
    ]
    const locations =
        args?.locations?.filter((arg) => validLocations.includes(arg)) ??
        validLocations

    const invalidLocations =
        args.locations?.filter((arg) => !validLocations.includes(arg)) ?? []

    if (invalidLocations.length > 0) {
        throw new GraphQLError(
            'Invalid location provided. Valid locations are: ' +
                validLocations.join(', ')
        )
    }

    const data = new Map<string, MealData[]>()

    for (const location of locations) {
        let meals: MealData[] | undefined = await cache.get(location)
        if (meals === undefined || meals === null) {
            switch (location) {
                case 'IngolstadtMensa':
                    meals = await getMensaPlan('IngolstadtMensa')
                    break
                case 'NeuburgMensa':
                    meals = await getMensaPlan('NeuburgMensa')
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
        if (meals !== undefined) {
            meals.forEach((meal) => {
                const existingMeals = data.get(meal.timestamp) ?? ([] as any[])
                data.set(meal.timestamp, existingMeals.concat(meal.meals))
            })
        }
    }
    return Array.from(data, ([timestamp, meals]) => ({
        timestamp,
        meals,
    })) as any[]
}
