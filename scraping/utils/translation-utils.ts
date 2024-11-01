/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from '@/index'
import translate, { type DeeplLanguages } from 'deepl'

import type {
    ExtendedMealData,
    MealData,
    PreFoodData,
    TempMealData,
} from '../types/food'
import { FoodLanguage } from './food-utils'

const deeplEndpoint = 'https://api-free.deepl.com/v2/translate'
const deeplApiKey = Bun.env.DEEPL_API_KEY || ''
const enableDevTranslations =
    Bun.env.ENABLE_DEV_TRANSLATIONS === 'true' || false
const disableFallbackWarning =
    Bun.env.DISABLE_FALLBACK_WARNING === 'true' || false
const translationsCacheTTL = 60 * 60 * 24 * 14 // 14 days
const isDev = Bun.env.NODE_ENV !== 'production'

/**
 * Gets a translation from the cache or translates it using DeepL.
 * @param {String} text The text to translate
 * @param {String} target The target language
 * @returns {String} The translated text or the original text if DeepL is not configured or returns an error
 **/
async function getTranslation(text: string, target: string): Promise<string> {
    const cacheData = await cache.get(`food__${text}__${target}`)
    if (cacheData !== undefined && cacheData !== null) {
        return cacheData as string
    } else {
        const result = await translateText(text, target)
        cache.set(`food__${text}__${target}`, result, translationsCacheTTL)
        return result
    }
}

/**
 * translates a text using DeepL.
 * @param {String} text The text to translate
 * @param {String} target The target language
 * @returns {String} The translated text
 * @throws {Error} If DeepL is not configured or returns an error
 */
async function translateText(text: string, target: string): Promise<string> {
    try {
        const data = await translate({
            text,
            free_api: true,
            target_lang: target as DeeplLanguages,
            auth_key: deeplApiKey,
            source_lang: FoodLanguage.DE,
        })
        return data.data.translations[0].text
    } catch (err) {
        console.error(err)
        return isDev && !disableFallbackWarning ? `FALLBACK: ${text}` : text
    }
}

/**
 * Brings the given meal plan into the correct format as if it was translated by DeepL.
 * @param {Object} meals The meal plan
 * @returns {Object} The translated meal plan
 **/
function translateFallback(meals: PreFoodData[]): MealData[] {
    return meals.map((day: any) => {
        const meals = day.meals.map((meal: any) => {
            return {
                ...meal,
                name: {
                    de: meal.name,
                    en:
                        isDev && !disableFallbackWarning
                            ? `FALLBACK: ${meal.name}`
                            : meal.name,
                },
                originalLanguage: FoodLanguage.DE,
                variants: meal.variants?.map((variant: any) => {
                    return {
                        ...variant,
                        name: {
                            de: variant.name,
                            en:
                                isDev && !disableFallbackWarning
                                    ? `FALLBACK: ${variant.name}`
                                    : variant.name,
                        },
                    }
                }),
            }
        })

        return {
            ...day,
            meals,
        }
    })
}

/**
 * Translates all meals in the given plan using DeepL.
 * @param {Object} meals The meal plan
 * @returns {Object} The translated meal plan
 */
export async function translateMeals(
    meals: ExtendedMealData[]
): Promise<TempMealData[]> {
    if (isDev && !enableDevTranslations) {
        console.warn('DeepL is disabled in development mode.')
        console.warn(
            'To enable DeepL in development mode, set ENABLE_DEV_TRANSLATIONS=true in your .env.local file.'
        )
        return translateFallback(meals)
    }

    if (deeplEndpoint.length === 0 || deeplApiKey === '') {
        console.warn('DeepL is not configured.')
        console.warn(
            'To enable DeepL, set the deeplApiKey in your .env.local file.'
        )
        return translateFallback(meals)
    }

    return (await Promise.all(
        meals.map(async (day) => {
            const meals = await Promise.all(
                day.meals.map(async (meal) => {
                    return {
                        ...meal,
                        name: {
                            de: meal.name,
                            en: await getTranslation(meal.name, 'EN-GB'),
                        },
                        variants:
                            meal.variants !== undefined
                                ? await Promise.all(
                                      meal.variants.map(
                                          async (variant: any) => {
                                              return {
                                                  ...variant,
                                                  name: {
                                                      de: variant.name,
                                                      en: await getTranslation(
                                                          variant.name,
                                                          'EN-GB'
                                                      ),
                                                  },
                                              }
                                          }
                                      )
                                  )
                                : [],
                        originalLanguage: FoodLanguage.DE,
                    }
                })
            )

            return {
                ...day,
                meals,
            }
        })
    )) as TempMealData[]
}
