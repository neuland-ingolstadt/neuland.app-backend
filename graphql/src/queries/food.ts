/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/db'
import { futureMealsView } from '@/db/schema/food'
import { cache } from '@/index'
import { GraphQLError } from 'graphql'

import { getCanisiusPlan } from '../scraping/canisius'
import { getMensaPlan } from '../scraping/mensa'
import { getReimannsPlan } from '../scraping/reimanns'
import type { MealData, ReturnData } from '../types/food'

const CACHE_TTL = 60 * 30 // 30 minutes

export async function food(
    _: unknown,
    args: { locations: string[] }
): Promise<ReturnData> {
    const validLocations = [
        'IngolstadtMensa',
        'NeuburgMensa',
        'Reimanns',
        'Canisius',
    ]
    const locations =
        args?.locations?.filter((arg) => validLocations.includes(arg)) ?? []

    if (locations.length !== args.locations.length) {
        throw new GraphQLError(
            'Invalid location provided. Valid locations are: ' +
                validLocations.join(', ')
        )
    }

    const data = new Map<string, MealData[]>()
    const errors: Array<{ location: string; message: string }> = []

    for (const location of locations) {
        let meals: MealData[] | undefined = await cache.get(location)
        if (meals === undefined || meals === null) {
            try {
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
            } catch (error) {
                const typedError = error as Error
                console.error(`Error fetching meals for ${location}:`, error)
                errors.push({
                    location,
                    message: typedError.message ?? 'Unknown error',
                })
                continue
            }
        }
        if (meals !== undefined) {
            meals.forEach((meal) => {
                const existingMeals = data.get(meal.timestamp) ?? ([] as any[])
                data.set(meal.timestamp, existingMeals.concat(meal.meals))
            })
        }
    }

    db.select()
        .from(futureMealsView)
        .then((rows) => {
            console.log(rows)
        })
    return {
        foodData: Array.from(data, ([timestamp, meals]) => ({
            timestamp,
            meals,
        })) as any[],
        errors,
    }
}
