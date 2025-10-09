/* eslint-disable @typescript-eslint/no-explicit-any */

import translate from 'deepl'
import type { ExtendedMealData, PreFoodData, TempMealData } from '@/types/food'

const deeplApiKey = Bun.env.DEEPL_API_KEY || ''
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
		const result = await translate({
			auth_key: deeplApiKey,
			// @ts-expect-error: DeepL also accepts arrays of strings, but the type definition is not correct
			text,
			free_api: true,
			target_lang: 'EN-GB',
			source_lang: 'DE',
			split_sentences: '1'
		})

		// map the result to the original meals using the index of the text array
		result.data.translations.forEach((translation, index) => {
			translations[text[index]] = translation.text
		})
	} catch (error) {
		console.error('Error translating meals with DeepL:', error)
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
