import staticMeals from '@/data/reimanns-meals.json'
import { db } from '@/db'
import { mealDays, meals } from '@/db/schema/mealRatings'
import type {
    MealData,
    PreFoodData,
    Prices,
    StaticMeal,
    TempMeal,
    TempMealData,
} from '@/types/food'
import * as cheerio from 'cheerio'

// Ensure this import is correct
import { addWeek, getDays, getWeek } from '../utils/date-utils'
import { getMealHash, unifyFoodEntries } from '../utils/food-utils'
import { translateMeals } from '../utils/translation-utils'

function toNum2(text: number | string): string {
    return Number(text.toString().trim()).toString().padStart(2, '0')
}

const ulrReimanns = 'http://reimanns.in/mittagsgerichte-wochenkarte/'

/**
 * Fetches and parses the Reimanns website
 * @returns {Promise<MealData[]>} The meal plan
 */
export async function getReimannsPlan(): Promise<MealData[]> {
    const resp = await fetch(ulrReimanns)
    const body = await resp.text()
    if (resp.status !== 200) {
        throw new Error('Reimanns data not available')
    }

    const $ = cheerio.load(body)
    const year = new Date().getFullYear()

    const lines = Array.from($('.entry-content').children()).flatMap((el_) => {
        const el = $(el_)

        // see https://github.com/cheeriojs/cheerio/issues/839
        const html = el.html()
        if (html === null) {
            throw new Error('Element not found')
        }
        const replacedHtml = html.replace(/<br\s*\/?>/gi, '___newline___')
        const content = cheerio
            .load(replacedHtml)
            .text()
            .replace(/___newline___/g, '\n')
            .trim()

        return content.split('\n')
    })

    // fill in all days (even if they are not on the website to add static meals)
    const [weekStart] = getWeek(new Date())
    const [, nextWeekEnd] = getWeek(addWeek(new Date(), 1))
    const allDays = getDays(weekStart, nextWeekEnd)

    const days: Record<string, string[]> = Object.fromEntries(
        allDays.map((day) => [day.toISOString().split('T')[0], []])
    )

    let day: string | null = null
    lines.forEach((content) => {
        content = content.trim().replace(/^(–|-)\s?(?=\S)/, '')
        const dayNameMatch = content.match(
            /montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag/iu
        )
        const numberDateMatch = content.match(/(\d{1,2})\.(\d{1,2})/iu)
        if (numberDateMatch !== null) {
            day = `${year}-${toNum2(numberDateMatch[2])}-${toNum2(
                numberDateMatch[1]
            )}`
            days[day] = []
        } else if (dayNameMatch !== null) {
            const weekDay = [
                'sonntag',
                'montag',
                'dienstag',
                'mittwoch',
                'donnerstag',
                'freitag',
                'samstag',
            ].indexOf(dayNameMatch[0].toLowerCase())

            const date = new Date()
            date.setDate(date.getDate() - date.getDay() + weekDay)
            day = `${date.getFullYear()}-${toNum2(date.getMonth() + 1)}-${toNum2(
                date.getDate()
            )}`
            days[day] = []
        } else if (
            /änderungen|sortiment|(jetzt neu)|geöffnet|geschlossen/iu.test(
                content
            )
        ) {
            // ignore
        } else if (day !== null && content.length > 0) {
            days[day].push(content)
        }
    })

    // convert format to the same as /api/mensa
    const mealPlan = Object.keys(days).map((day) => ({
        timestamp: day,
        meals: days[day].map((meal) => ({
            name: meal,
            id: getMealHash(day, meal),
            category: 'MAIN',
            prices: {
                student: 5.5,
                employee: 6.5,
                guest: 7.5,
            },
            allergens: null,
            flags: null,
            nutrition: null,
            restaurant: 'Reimanns',
        })),
    }))

    const scrapedMeals = await translateMeals(mealPlan as PreFoodData[])

    // add static meals (no need to translate)
    function processStaticMeals(day: TempMealData): StaticMeal[] {
        return staticMeals.map((meal) => ({
            ...meal,
            restaurant: 'REIMANNS',
            id: getMealHash(day.timestamp, meal.name),
            variants: meal.variants?.map((variant) => ({
                ...variant,
                id: getMealHash(day.timestamp, variant.name),
            })),
        }))
    }

    // TODO: add allergens, flags, nutrition (ask Reimanns for data)
    scrapedMeals.forEach((day) => {
        // skip days without meals (restaurant probably closed)
        if (day.meals.length === 0) {
            return
        }

        day.meals.push(...(processStaticMeals(day) as TempMeal[]))
    })
    const unifyedMeals = unifyFoodEntries(scrapedMeals)

    for (const day of unifyedMeals) {
        for (const meal of day.meals) {
            const mealId = await upsertMeal(meal.name.de, 'MAIN', 'REIMANNS')
            const mealDayId = await upsertMealDay(
                mealId,
                day.timestamp,
                meal.prices
            )
            meal.staticId = mealId
            meal.instanceId = mealDayId
        }
    }

    return unifyedMeals
}

// Function to upsert the meal if it doesn’t exist
export async function upsertMeal(
    name: string,
    category: 'MAIN' | 'SIDE' | 'SOUP' | 'SALAD' | 'DESSERT',
    restaurant: 'INGOLSTADT_MENSA' | 'NEUBURG_MENSA' | 'REIMANNS' | 'CANISIUS'
): Promise<number> {
    return await db.transaction(async (trx) => {
        const [newMeal] = await trx
            .insert(meals)
            .values({
                name_de: name,
                category: category,
                restaurant: restaurant,
            })
            .onConflictDoUpdate({
                target: [meals.name_de, meals.category, meals.restaurant],
                set: { name_de: name },
            })
            .returning({ id: meals.id })

        return newMeal.id
    })
}

// Function to upsert the meal day if it doesn’t exist
export async function upsertMealDay(
    mealId: number,
    date: string,
    prices: Prices
): Promise<number> {
    return await db.transaction(async (trx) => {
        const [newMealDay] = await trx
            .insert(mealDays)
            .values({
                meal_id: mealId,
                date: new Date(date),
                price_guest: prices.guest?.toFixed(2),
                price_student: prices.student?.toFixed(2),
                price_employee: prices.employee?.toFixed(2),
            })
            .onConflictDoNothing()
            .returning({ id: mealDays.id })

        return newMealDay.id
    })
}
