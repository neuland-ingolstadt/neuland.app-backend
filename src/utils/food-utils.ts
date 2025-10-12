import { xxh3, xxh32 } from '@node-rs/xxhash'
import flagContradictions from '@/data/flag-contradictions.json'
import stopWords from '@/data/stop-words.json'
import type {
    ExtendedMeal,
    ExtendedMealData,
    Meal,
    MealData,
    Name,
    TempMeal,
    TempMealData
} from '@/types/food'

/**
 * Cleans the meal flags to remove wrong flags (e.g. "veg" (vegan) and "R" (Beef) at the same time => remove "veg")
 * @param {string[]} flags Meal flags
 * @returns {string[]} Cleaned meal flags
 **/

function cleanMealFlags(flags: string[] | null): string[] | null {
    if (flags == null) return null

    // find contradictions
    const typedContradictions: Record<string, string[]> = flagContradictions
    const contradictions = flags.filter((x) =>
        typedContradictions[x]?.some((y) => flags?.includes(y))
    )

    // remove contradictions
    const newFlags =
        flags !== undefined
            ? flags.filter((x) => !contradictions.includes(x))
            : []
    return newFlags
}

/**
 * Capitalizes the first letter of the meal names
 * @param {object} mealNames Meal names
 * @returns {object} Capitalized meal names
 * @example { de: 'veganer burger', en: 'vegan burger' } => { de: 'Veganer burger', en: 'Vegan burger' }
 */
function capitalize(mealNames: Name): Name {
    const capitalizedEntries = Object.entries(mealNames).map(([key, value]) => [
        key,
        value.charAt(0).toUpperCase() + value.slice(1)
    ])

    if (
        !capitalizedEntries.some(([key]) => key === 'de') ||
        !capitalizedEntries.some(([key]) => key === 'en')
    ) {
        throw new Error('mealNames must have both de and en properties')
    }

    return Object.fromEntries(capitalizedEntries)
}
/**
 * Unifies the meal plan entries to a common format
 * @param {MealData[]} entries Meal plan entries
 * @returns {object[]} Unified meal plan entries
 */
export function unifyFoodEntries(entries: TempMealData[]): MealData[] {
    return entries.map((entry) => ({
        timestamp: entry.timestamp,
        meals: entry.meals.map((meal) => {
            return {
                ...unifyMeal(meal),
                variants: Array.isArray(meal.variants)
                    ? meal.variants.map((variant) =>
                          unifyMeal(variant as TempMeal, meal)
                      )
                    : []
            }
        })
    }))
}
/**
 * Unifies a single meal to a common format
 * @param {object} meal
 * @param {parent} [parentMeal] Parent meal (if meal is a variant of another meal)
 * @returns {object} Unified meal
 */
function unifyMeal(meal: TempMeal, parentMeal: Meal | null = null): TempMeal {
    const mealCategory = meal.category ?? parentMeal?.category ?? 'main'

    return {
        name: capitalize(meal.name),
        category: standardizeCategory(mealCategory),
        prices: meal.prices ?? {
            student: null,
            employee: null,
            guest: null
        },
        allergens: meal.allergens ?? null,
        flags: cleanMealFlags(meal.flags),
        nutrition: meal.nutrition ?? null,
        originalLanguage: meal.originalLanguage ?? 'de',
        static: meal.static ?? false,
        restaurant: meal.restaurant ?? parentMeal?.restaurant ?? null,
        additional: meal.additional ?? false,
        mealId: getMealHash(meal.name.de, mealCategory, meal.restaurant ?? ''),
        id: parentMeal !== null ? `${parentMeal.id}/${meal.id}` : meal.id,
        parent: reduceParentMeal(parentMeal)
    }
}

/**
 * Merges meals with a similar name and same category into one meal with variants (Week entries)
 * @param {PreFoodData[]} entries
 * @returns {PreFoodData[]} Merged meals
 */
export function mergeMealVariants(
    entries: ExtendedMealData[]
): ExtendedMealData[] {
    return entries.map((day) => {
        return {
            ...day,
            meals: mergeDayEntries(day.meals)
        }
    })
}

/**
 * Merge meals with a similar name and same category into one meal with variants (Day entries)
 * @param {object[]} dayEntries
 * @returns {object[]} Merged meals
 */
function mergeDayEntries(dayEntries: ExtendedMeal[]): ExtendedMeal[] {
    const variationKeys = dayEntries.map((meal) => {
        const comparingKeys = dayEntries.filter(
            (x) =>
                x.name !== meal.name &&
                x.name.startsWith(meal.name) &&
                x.category === meal.category
        )
        return {
            meal,
            variants: comparingKeys ?? []
        }
    })

    const mergedEntries = dayEntries.filter(
        (meal) =>
            !variationKeys
                .flatMap((keys) => keys.variants)
                .map((x) => x.name)
                .includes(meal.name)
    )

    // remove duplicate meals
    const noDuplicates = mergedEntries.filter(
        (meal, index, self) =>
            index === self.findIndex((x) => x.name === meal.name)
    )

    // add variants
    variationKeys
        .filter(({ variants }) => variants.length > 0)
        .forEach(({ meal, variants }) => {
            meal.variants = variants.map((variant) => {
                return {
                    ...variant,
                    name: cleanMealName(
                        variant.name.replace(meal.name, '').trim()
                    ),
                    prices: Object.fromEntries(
                        Object.entries(variant.prices).map(([key, value]) => [
                            key,
                            value !== null &&
                            meal.prices[
                                key as 'student' | 'employee' | 'guest'
                            ] !== null
                                ? value -
                                  // @ts-expect-error Object is possibly 'null'
                                  meal.prices[
                                      key as 'student' | 'employee' | 'guest'
                                  ]
                                : null
                        ])
                    ),
                    additional: true
                }
            })
        })

    return noDuplicates
}

/**
 * Removes german stop words from the given name
 * @param {*} name
 * @returns {string} Cleaned name
 */
function cleanMealName(name: string): string {
    return name
        .split(' ')
        .filter((x) => !stopWords.de.includes(x))
        .join(' ')
}

/**
 * Converts the given meal name and day to a pseudo-unique hash
 * @param {*} day Day in ISO format
 * @param {*} mealName Meal name
 * @returns {string} Meal hash (starts with a short version of the day and ends with a short hash of the meal name)
 */
export function getMealDayHash(day: string, mealName: string | object): string {
    const dayHash = day.replace(/-/g, '').slice(-2)
    const mealNameStr =
        typeof mealName === 'string' ? mealName : JSON.stringify(mealName)
    return `${dayHash}${xxh32(mealNameStr).toString(36).slice(0, 6)}`
}

/**
 * Converts the given meal to a unique hash (original language name, category and restaurant)
 * @param {string} mealName Meal name in the original language
 * @param {string} category Meal category
 * @param {string} restaurant Restaurant name
 * @returns {string} Meal hash as a hexadecimal string
 */
export function getMealHash(
    mealName: string,
    category: string,
    restaurant: string
): string {
    const input = `${mealName}-${category}-${restaurant}`
    return xxh3.xxh128(input).toString(36)
}

/**
 * Only keeps the name, category and id of the given meal
 * @param {*} parentMeal Meal to reduce
 * @returns {object} Reduced meal object
 */
function reduceParentMeal(parentMeal: Meal | null): {
    name: object
    category: string
    id: string
} | null {
    if (parentMeal == null) return null

    return {
        name: parentMeal.name,
        category: parentMeal.category ?? 'main',
        id: parentMeal.id
    }
}

/**
 * Standardizes the meal category
 * @param {string} category Meal category
 * @returns {string} Standardized category
 */
function standardizeCategory(category: string): string {
    const validCategories = ['main', 'soup', 'salad']

    if (validCategories.includes(category)) {
        return category
    }

    if (category.includes('Suppe')) {
        return 'soup'
    }

    if (category.includes('Salat')) {
        return 'salad'
    }

    return 'main'
}

/**
 * Parses a float like "1,5".
 * @returns {number}
 */
export function parseGermanFloat(str: string | undefined): number | null {
    if (str === undefined) {
        return null
    }
    const parsedFloat = Number.parseFloat(str.replace(',', '.'))
    return Number.isNaN(parsedFloat) ? null : parsedFloat
}

/**
 * Parses an XML node containing a float.
 * @returns {number}
 */
export function parseXmlFloat(str: { _text?: string }): number {
    const parsedFloat =
        str._text != null && str._text.length > 0
            ? parseGermanFloat(str._text)
            : null
    return parsedFloat ?? 0
}

/**
 * Checks whether a value is empty.
 * @param {*} value
 * @returns {Boolean}
 */
export function isEmpty(value: unknown): boolean {
    return (
        value == null ||
        (typeof value === 'string' && value.trim().length === 0)
    )
}
