/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/db'
import { futureMealsView } from '@/db/schema/food'
import { cache } from '@/index'
import { inArray } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import type { MealData, ReturnData } from '../types/food'


export async function food(
    _: unknown,
    args: { locations: string[] }
): Promise<ReturnData> {
    const locations = args?.locations ?? []

    const data = new Map<string, MealData[]>()
    const errors: Array<{ location: string; message: string }> = []

    async function getFutureMealsByLocations(locations: string[]) {
        console.log('fetching future meals for locations:', locations)
        try {
            const rows = await db
                .select()
                .from(futureMealsView)
                .where(inArray(futureMealsView.restaurant, locations))

            return rows
        } catch (error) {
            console.error('Error fetching future meals:', error)
            throw new GraphQLError('Error fetching future meals')
        }
    }

    const futureMeals = await getFutureMealsByLocations(locations)
    // group meals by mealDate
    futureMeals.forEach((meal) => {
        const existingMeals = data.get(meal.mealDate) ?? ([] as any[])
        data.set(meal.mealDate, existingMeals.concat(meal))
    })


    return {
        foodData: Array.from(data, ([timestamp, meals]) => ({
            timestamp,
            meals,
        })) as any[],
        errors,
    }
}
