import http from 'node:http'
import pdf from 'pdf-parse'
import type { CanisiusBlock, MealData } from '@/types/food'
import {
    getMealDayHash,
    isEmpty,
    mergeMealVariants,
    unifyFoodEntries
} from '@/utils/food-utils'
import { translateMeals } from '@/utils/translation-utils'

const url =
    'http://www.canisiusstiftung.de/wp-content/uploads/Speiseplan/speiseplan.pdf'
const dateRegex = /[0-9]{1,2}.[0-9]{1,2}.[0-9]{4}/gm
const newLineRegex = /(?:\r\n|\r|\n)/g
const dishSplitterRegex =
    /\s+€[ ]{1,}[0-9]+.[0-9]+\s+€[ ]{1,}[0-9]+.[0-9]+\s+€[ ]{1,}[0-9]+.[0-9]+\s*/g
const priceRegex = /(?!€)(?! )+[\d.]+/g

/**
 * Extracts the prices from the text
 * @param {string} text The text to extract the prices from
 * @returns {number[]} The extracted prices
 */
function getPrices(text: string): number[] {
    return (
        text.match(priceRegex)?.map((price) => Number.parseFloat(price)) ?? []
    )
}

/**
 * Fetches the PDF file from the Canisius website
 * @returns {Buffer} The PDF file
 */
async function getPdf(): Promise<Buffer> {
    // http get request to retrieve the PDF file from the url
    // chunk data to databuffer and return that
    return await new Promise((resolve, reject) => {
        http.get(url, (res) => {
            const data: Buffer[] = []
            res.on('data', (chunk) => {
                data.push(chunk as Buffer)
            })

            res.on('end', () => {
                resolve(Buffer.concat(data))
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
}

/**
 * Extracts the meals from the text
 * @param {string} text The text to extract the meals from
 * @returns {CanisiusBlock[]} The extracted meals
 */
function getMealsFromBlock(text: string): CanisiusBlock[] {
    const dayDishes = text.trim().split(dishSplitterRegex).slice(0, -1)
    const prices = (text.match(dishSplitterRegex) ?? []).map((price) =>
        getPrices(price)
    )

    return dayDishes.map((dish, index) => {
        const dishPrices = prices[index]
        return {
            name: dish.trim(),
            prices: {
                /**
                 * There are three different prices for each dish:
                 * 1. internal student price => not used for THI students
                 * 2. external student price => used for THI students
                 * 3. guest price => used for guests and THI employees
                 */
                student: dishPrices[1],
                employee: dishPrices[2],
                guest: dishPrices[2]
            }
        }
    })
}

/**
 * Fetches the Canisius meal plan.
 * @returns {Promise<MealData[]>} The Canisius meal plan
 */
export async function getCanisiusPlan(): Promise<MealData[]> {
    const pdfBuffer = await getPdf()
    const mealPlan = await pdf(pdfBuffer).then((data) => {
        const text = data.text.replace(newLineRegex, ' ')
        if (isEmpty(text)) {
            // during the summer break the pdf is completely empty
            console.warn('Canisius pdf is empty, returning empty array')
            return []
        }

        // Use regex to find all date positions with their matches
        const dateMatches: Array<{ date: string; index: number }> = []
        const globalDateRegex = new RegExp(dateRegex.source, 'g')

        let match: RegExpMatchArray | null = globalDateRegex.exec(text)
        while (match !== null && dateMatches.length < 5) {
            if (match.index !== undefined) {
                dateMatches.push({
                    date: match[0],
                    index: match.index
                })
            }
            match = globalDateRegex.exec(text)
        }

        if (dateMatches.length < 5) {
            if (text.toLowerCase().includes('geschlossen')) {
                console.warn(
                    'Canisius restaurant is closed, returning empty array'
                )
                return []
            }
            return []
        }

        // Sort by position to ensure correct order
        dateMatches.sort((a, b) => a.index - b.index)

        // Extract and format dates (DD.MM.YYYY -> YYYY-MM-DD) in the correct order
        const extractedDates: string[] = []
        for (const dateMatch of dateMatches) {
            const dateParts = dateMatch.date.split('.')
            extractedDates.push(
                `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            )
        }

        // Split text at date positions to get day segments
        // Start each segment after the date pattern (date index + date length)
        const days: string[] = []
        for (let i = 0; i < dateMatches.length; i++) {
            const dateStart = dateMatches[i].index
            const dateLength = dateMatches[i].date.length
            const start = dateStart + dateLength // Start after the date
            const end =
                i < dateMatches.length - 1
                    ? dateMatches[i + 1].index
                    : text.length
            const daySegment = text.substring(start, end)
            days.push(daySegment)
        }

        if (days.length < 5 || extractedDates.length < 5) {
            return []
        }

        // split last day into friday and weekly salad menu
        const fridaySaladSplit = days[4]?.split('Salate der Saison vom Büfett')

        let salads: CanisiusBlock[] = []
        if (fridaySaladSplit && fridaySaladSplit.length >= 2) {
            days[4] = fridaySaladSplit[0]
            salads = getMealsFromBlock(String(fridaySaladSplit[1]))
        } else {
            // No salad menu found, just use the day as is
            days[4] = days[4] || ''
        }

        // trim whitespace and split into dishes
        const dishes = days.map(getMealsFromBlock)
        return dishes.map((day, index) => {
            const dayDishes = day.map((dish) => ({
                name: dish.name,
                id: getMealDayHash(extractedDates[index], dish.name),
                category: 'Essen',
                prices: dish.prices,
                allergens: null,
                flags: null,
                nutrition: null,
                restaurant: 'Canisius'
            }))

            const daySalads = salads.map((salad) => ({
                name: salad.name,
                id: getMealDayHash(extractedDates[index], salad.name),
                originalLanguage: 'de',
                category: 'Salat',
                prices: salad.prices,
                allergens: null,
                flags: null,
                nutrition: null,
                restaurant: 'Canisius'
            }))

            return {
                timestamp: extractedDates[index],
                meals: dayDishes.length > 0 ? [...dayDishes, ...daySalads] : []
            }
        })
    })

    const mergedMeal = mergeMealVariants(mealPlan)
    const translatedMeals = await translateMeals(mergedMeal)
    return unifyFoodEntries(translatedMeals)
}
