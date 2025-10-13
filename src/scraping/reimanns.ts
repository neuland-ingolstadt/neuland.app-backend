import { graphql } from '@/__generated__'
import type { Day, Meal } from '@/__generated__/graphql'
import staticMeals from '@/data/reimanns-meals.json'
import type { MealData, StaticMeal, TempMealData, Variant } from '@/types/food'
import { executeGql } from '@/utils/api-utils'

import { getMealDayHash, unifyFoodEntries } from '../utils/food-utils'

const REIMANNS_ENDPOINT = 'https://reimanns-api.neuland.app/graphql'

const REIMANNS_QUERY = graphql(`
  query Menu {
    menu {
      days {
        date
        meals {
          name_de
          name_en
        }
      }
    }
  }
`)

/**
 * Fetches and parses the Reimanns website
 * @returns {Promise<MealData[]>} The meal plan
 */
export async function getReimannsPlan(): Promise<MealData[]> {
    const result = (await executeGql(REIMANNS_ENDPOINT, REIMANNS_QUERY)).data

    const days = result.menu?.days
    if (!days) {
        throw new Error('No data received from Reimanns')
    }
    function isValidMeal(
        meal: Meal | null
    ): meal is { name_de: string; name_en: string } {
        return (
            typeof meal?.name_de === 'string' &&
            typeof meal?.name_en === 'string'
        )
    }

    function isValidDay(
        day: Day | null
    ): day is { date: string; meals: Meal[] } {
        return typeof day?.date === 'string' && Array.isArray(day?.meals)
    }

    const mealPlan = days.filter(isValidDay).map((day) => ({
        timestamp: day?.date as string,
        meals:
            day?.meals?.filter(isValidMeal).map((meal) => ({
                name: {
                    de: meal.name_de,
                    en: meal.name_en
                },
                id: getMealDayHash(day?.date, meal.name_de),
                category: 'Essen',
                prices: {
                    student: 6.9,
                    employee: 7.9,
                    guest: 8.9
                },
                allergens: null,
                flags: null,
                nutrition: null,
                restaurant: 'Reimanns'
            })) ?? []
    }))

    const hashedStaticMeals = (date: string): StaticMeal[] => {
        return staticMeals.map((meal) => ({
            ...meal,
            restaurant: 'Reimanns',
            id: getMealDayHash(date, meal.name),
            variants: meal.variants?.map((variant) => ({
                ...variant,
                id: getMealDayHash(date, variant.name)
            })) as Variant[]
        }))
    }

    // biome-ignore lint/suspicious/noExplicitAny: -- Food types need a rework anyway
    const final = mealPlan as any[]
    final.forEach((day) => {
        // skip days without meals (restaurant probably closed)
        if (!day.meals || day.meals.length === 0) {
            return
        }

        day.meals.push(...hashedStaticMeals(day.timestamp))
    })

    const unifyedMeals = unifyFoodEntries(mealPlan as TempMealData[])
    return unifyedMeals
}
