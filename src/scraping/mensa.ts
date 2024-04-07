import type { ExtendedMealData, MealData, XMLMensa } from '@/types/food'
import xmljs from 'xml-js'

import { formatISODate } from '../utils/date-utils'
import {
    getMealHash,
    mergeMealVariants,
    parseGermanFloat,
    parseXmlFloat,
    unifyFoodEntries,
} from '../utils/food-utils'
import { translateMeals } from '../utils/translation-utils'

const ulrMensa =
    'https://www.max-manager.de/daten-extern/sw-erlangen-nuernberg/xml/mensa-ingolstadt.xml'

/**
 * Parses the XML meal plan.
 * @param {string} xml The XML meal plan
 * @returns {ExtendedMealData[]} The parsed meal plan
 */
function parseDataFromXml(xml: string): ExtendedMealData[] {
    const sourceData = xmljs.xml2js(xml, { compact: true }) as any
    const now = Date.now()

    let sourceDays = sourceData.speiseplan.tag as XMLMensa[]
    if (sourceDays == null) {
        return []
    } else if (!Array.isArray(sourceDays)) {
        sourceDays = [sourceDays]
    }
    const days = sourceDays
        .map((day: XMLMensa) => {
            const date = new Date(Number(day._attributes.timestamp) * 1000)

            if (now - date.getTime() > 24 * 60 * 60 * 1000) {
                return null
            }

            let sourceItems = day.item
            if (!Array.isArray(sourceItems)) {
                sourceItems = [sourceItems]
            }

            const addInReg = /\s*\((.*?)\)\s*/
            const meals = sourceItems.map((item) => {
                // sometimes, the title is undefined (see #123)
                let text: string = item.title._text ?? ''
                const allergens = new Set<string>()
                while (addInReg.test(text)) {
                    const match = text.match(addInReg)
                    if (match !== null) {
                        const [addInText, addIn] = match
                        text = text.replace(addInText, ' ')

                        const newAllergens = addIn.split(',')
                        newAllergens.forEach((newAll) => allergens.add(newAll))
                    }
                }

                // convert 'Suppe 1' -> 'Suppe', 'Essen 3' -> 'Essen', etc.
                let category = null
                if (item.category._text !== undefined) {
                    category = item.category._text.split(' ')[0]
                }

                const flags = [] as string[]
                if (
                    item.piktogramme._text !== null &&
                    item.piktogramme._text !== undefined
                ) {
                    const matches = item.piktogramme._text.match(
                        /class='infomax-food-icon .*?'/g
                    )
                    if (matches !== null) {
                        matches.forEach((x) => {
                            const [, end] = x.split(' ')
                            flags.push(end.substr(0, end.length - 1))
                        })
                    }
                }

                const nutrition = {
                    kj: parseXmlFloat(item.kj),
                    kcal: parseXmlFloat(item.kcal),
                    fat: parseXmlFloat(item.fett),
                    fatSaturated: parseXmlFloat(item.gesfett),
                    carbs: parseXmlFloat(item.kh),
                    sugar: parseXmlFloat(item.zucker),
                    fiber: parseXmlFloat(item.ballaststoffe),
                    protein: parseXmlFloat(item.eiweiss),
                    salt: parseXmlFloat(item.salz),
                }

                return {
                    name: text.trim(),
                    id: getMealHash(formatISODate(date), text.trim()),
                    category,
                    prices: {
                        student: parseGermanFloat(item.preis1._text),
                        employee: parseGermanFloat(item.preis2._text),
                        guest: parseGermanFloat(item.preis3._text),
                    },
                    allergens: [...allergens].sort((a, b) =>
                        a.localeCompare(b)
                    ),
                    flags,
                    nutrition,
                    restaurant: 'mensa',
                }
            })

            return {
                timestamp: formatISODate(date),
                meals,
            }
        })
        .filter((x) => x !== null) as ExtendedMealData[]

    return days
}

/**
 * Fetches the mensa plan.
 * @returns {Promise<MealData[]>} The mensa plan
 */
export async function getMensaPlan(): Promise<MealData[]> {
    const resp = await fetch(ulrMensa)

    if (resp.status !== 200) {
        throw new Error('Data source returned an error: ' + (await resp.text()))
    }
    const mealPlan = parseDataFromXml(await resp.text())
    const mergedMeals = mergeMealVariants(mealPlan)
    const translatedMeals = await translateMeals(mergedMeals)
    return unifyFoodEntries(translatedMeals)
}
