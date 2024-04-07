/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { getCanisiusPlan } from '@/scraping/canisius'
import { getMensaPlan } from '@/scraping/mensa'
import { getReimannsPlan } from '@/scraping/reimanns'
import type { FoodData, FoodLocation, MealData } from '@/types/food'

import { cache } from '../..'

const CACHE_TTL = 60 * 30 // 30 minutes

export async function food(): Promise<FoodData[]> {
    let [mensa, canisius, reimanns]: Array<MealData[] | undefined> =
        await Promise.all([
            cache.get('mensa'),
            cache.get('canisius'),
            cache.get('reimanns'),
        ])
    if (mensa === undefined || mensa === null) {
        mensa = await getMensaPlan()
        cache.set(`mensa`, mensa, CACHE_TTL)
    }

    if (reimanns === undefined || reimanns === null) {
        reimanns = await getReimannsPlan()
        cache.set(`reimanns`, reimanns, CACHE_TTL)
    }

    if (canisius === undefined || canisius === null) {
        canisius = await getCanisiusPlan()
        cache.set('canisius', canisius, CACHE_TTL)
    }

    const data = { mensa, reimanns, canisius }

    const mergedData: Record<string, FoodData> = {}
    for (const location in data) {
        for (const food of data[location as keyof typeof data]) {
            if (mergedData[food.timestamp] === undefined) {
                mergedData[food.timestamp] = {
                    timestamp: food.timestamp,
                    mensa: [],
                    reimanns: [],
                    canisius: [],
                }
            }

            mergedData[food.timestamp][location as keyof FoodLocation].push(
                // @ts-expect-error food.meals is not a MealData[]
                ...food.meals
            )
        }
    }

    return Object.values(mergedData)
}
