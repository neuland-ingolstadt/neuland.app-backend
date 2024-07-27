import type { CanisiusBlock, MealData } from '@/types/food'
import {
    getMealHash,
    mergeMealVariants,
    unifyFoodEntries,
} from '@/utils/food-utils'
import { translateMeals } from '@/utils/translation-utils'
import http from 'http'
import pdf from 'pdf-parse'

const url =
    'https://www.canisiusstiftung.de/wp-content/uploads/Speiseplan/speiseplan.pdf'
const titleRegex = /[A-Z][a-z]*, den [0-9]{1,2}.[0-9]{1,2}.[0-9]{4}/gm
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
    return text.match(priceRegex)?.map((price) => parseFloat(price)) ?? []
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
 * Extracts the date from the title
 * @param {string} title The title to extract the date from
 * @returns {string} The extracted date
 */
function getDateFromTitle(title: string): string {
    const match = title.match(dateRegex)
    if (match === null) {
        throw new Error('No date found in title')
    }
    const date = match[0].split('.')
    // return date in format YYYY-MM-DD
    return `${date[2]}-${date[1]}-${date[0]}`
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
                guest: dishPrices[2],
            },
        }
    })
}

/**
 * Fetches the Canisius meal plan.
 * @returns {Promise<MealData[]>} The Canisius meal plan
 */
export async function getCanisiusPlan(): Promise<MealData[]> {
    const pdfBuffer = await getPdf()
    const mealPlan = await pdf(pdfBuffer).then(function (data) {
        const text = data.text.replace(newLineRegex, ' ')

        let days = text.split(titleRegex)
        let dates: string[] | null = text.match(titleRegex)

        if (days === null || dates === null) {
            throw new Error(
                'Unexpected/Malformed pdf from the Canisius website!'
            )
        }
        dates = dates.map(getDateFromTitle)

        // keep days only
        days = days.slice(1, 6)

        // split last day into friday and weekly salad menu
        const fridaySaladSplit = days[4].split('Salate der Saison vom Büfett')

        days[4] = fridaySaladSplit[0]

        const salads = getMealsFromBlock(String(fridaySaladSplit[1]))

        // trim whitespace and split into dishes
        const dishes = days.map(getMealsFromBlock)
        return dishes.map((day, index) => {
            const dayDishes = day.map((dish) => ({
                name: dish.name,
                id: getMealHash(dates[index], dish.name),
                category: 'Essen',
                prices: dish.prices,
                allergens: null,
                flags: null,
                nutrition: null,
                restaurant: 'Canisius',
            }))

            const daySalads = salads.map((salad) => ({
                name: salad.name,
                id: getMealHash(dates[index], salad.name),
                originalLanguage: 'de',
                category: 'Salat',
                prices: salad.prices,
                allergens: null,
                flags: null,
                nutrition: null,
                restaurant: 'Canisius',
            }))

            return {
                timestamp: dates[index],
                meals: dayDishes.length > 0 ? [...dayDishes, ...daySalads] : [],
            }
        })
    })

    const mergedMeal = mergeMealVariants(mealPlan)
    const translatedMeals = await translateMeals(mergedMeal)
    return unifyFoodEntries(translatedMeals)
}
