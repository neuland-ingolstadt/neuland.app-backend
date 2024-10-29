/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from '@/index'
import { getCanisiusPlan } from '@/scraping/canisius'
import { getMensaPlan } from '@/scraping/mensa'
import { getReimannsPlan } from '@/scraping/reimanns'
import type { MealData, ReturnData } from '@/types/food'

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
        'INGOLSTADT_MENSA',
        'NEUBURG_MENSA',
        'REIMANNS',
        'CANISIUS',
    ]
    const locations = args.locations.map((x) => x)
    const data = new Map<string, MealData[]>()
    const errors: Array<{ location: string; message: string }> = []

    for (const location of locations) {
        let meals: MealData[] | undefined = await cache.get(location)
        if (meals === undefined || meals === null) {
            try {
                switch (location) {
                    case 'IngolstadtMensa':
                    case 'INGOLSTADT_MENSA':
                        meals = await getMensaPlan('IngolstadtMensa')
                        break
                    case 'NeuburgMensa':
                    case 'NEUBURG_MENSA':
                        meals = await getMensaPlan('NeuburgMensa')
                        break
                    case 'Reimanns':
                    case 'REIMANNS':
                        meals = await getReimannsPlan()
                        break
                    case 'Canisius':
                    case 'CANISIUS':
                        meals = await getCanisiusPlan()
                        break
                    default:
                        throw new Error(
                            `Unknown location: ${location}. Valid locations are: ${validLocations.join(', ')} (PascalCase arguments are deprecated, and will be removed in the future)`
                        )
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

    return {
        foodData: Array.from(data, ([timestamp, meals]) => ({
            timestamp,
            meals,
        })) as any[],
        errors,
    }
}
