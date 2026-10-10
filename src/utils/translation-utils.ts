/** biome-ignore-all lint/suspicious/noExplicitAny: tbd */

import type { ExtendedMealData, PreFoodData, TempMealData } from '@/types/food'

const deeplApiKey = Bun.env.DEEPL_API_KEY || ''
const deeplServerUrl =
    Bun.env.DEEPL_SERVER_URL ||
    (deeplApiKey.endsWith(':fx')
        ? 'https://api-free.deepl.com'
        : 'https://api.deepl.com')
const enableDevTranslations =
    Bun.env.ENABLE_DEV_TRANSLATIONS === 'true' || false
const disableFallbackWarning =
    Bun.env.DISABLE_FALLBACK_WARNING === 'true' || false
const isDev = Bun.env.NODE_ENV !== 'production'

/**
 * Brings the given meal plan into the correct format as if it was translated by DeepL.
 * @param {Object} meals The meal plan
 * @returns {Object} The translated meal plan
 **/
function translateMealsFallback(meals: PreFoodData[]): TempMealData[] {
    return meals.map((day: any) => {
        const meals = day.meals.map((meal: any) => {
            return {
                ...meal,
                name: {
                    de: meal.name,
                    en:
                        isDev && !disableFallbackWarning
                            ? `FALLBACK: ${meal.name}`
                            : meal.name
                },
                originalLanguage: 'de',
                variants: meal.variants?.map((variant: any) => {
                    return {
                        ...variant,
                        name: {
                            de: variant.name,
                            en:
                                isDev && !disableFallbackWarning
                                    ? `FALLBACK: ${variant.name}`
                                    : variant.name
                        }
                    }
                })
            }
        })

        return {
            ...day,
            meals
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
        return translateMealsFallback(meals)
    }

    if (deeplApiKey === '') {
        console.warn('DeepL is not configured.')
        console.warn(
            'To enable DeepL, set the deeplApiKey in your .env.local file.'
        )
        return translateMealsFallback(meals)
    }

    // populates a flat array of all meal and variant names for translation
    const text: string[] = []
    meals.forEach((day) => {
        day.meals.forEach((meal) => {
            text.push(meal.name)
            meal.variants?.forEach((variant: any) => {
                text.push(variant.name)
            })
        })
    })

    const translations: Record<string, string> = {}
    try {
        const response = await fetch(`${deeplServerUrl}/v2/translate`, {
            method: 'POST',
            headers: {
                Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                target_lang: 'EN-GB',
                source_lang: 'DE',
                split_sentences: '1'
            })
        })

        if (!response.ok) {
            let details = ''
            try {
                const errorBody = (await response.json()) as {
                    message?: string
                }
                if (errorBody?.message) {
                    details = `: ${errorBody.message}`
                }
            } catch {
                // response body is not JSON, ignore
            }
            const traceId = response.headers.get('x-trace-id')
            throw new Error(
                `DeepL API request failed with status ${response.status}${details}` +
                    (traceId ? ` (trace id: ${traceId})` : '')
            )
        }

        const result = (await response.json()) as {
            translations: Array<{
                text: string
                detected_source_language: string
            }>
        }

        // map the result to the original meals using the index of the text array
        result.translations.forEach(
            (
                translation: { text: string; detected_source_language: string },
                index: number
            ) => {
                translations[text[index]] = translation.text
            }
        )
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                  ? String(error.message)
                  : 'Unknown error'
        console.error('Error translating meals with DeepL:', errorMessage)
        console.warn('Falling back to untranslated meals')
        return translateMealsFallback(meals)
    }

    return meals.map((day) => {
        const meals = day.meals.map((meal) => ({
            ...meal,
            name: {
                de: meal.name,
                en: translations[meal.name] || meal.name
            },
            variants:
                meal.variants !== undefined
                    ? meal.variants.map((variant: any) => ({
                          ...variant,
                          name: {
                              de: variant.name,
                              en: translations[variant.name] || variant.name
                          }
                      }))
                    : [],
            originalLanguage: 'de'
        }))

        return {
            ...day,
            meals
        }
    }) as TempMealData[]
}
