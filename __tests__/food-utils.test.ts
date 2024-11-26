import { describe, expect, it } from 'vitest'

import {
    capitalize,
    cleanMealFlags,
    getMealDayHash,
    getMealHash,
    isEmpty,
    mergeMealVariants,
    parseGermanFloat,
    parseXmlFloat,
    unifyFoodEntries,
} from '../src/utils/food-utils'

describe('cleanMealFlags', () => {
    it('should remove contradictory flags', () => {
        const flags = ['veg', 'R']
        expect(cleanMealFlags(flags)).toEqual(['R'])
    })
    it('should return null if flags are null', () => {
        expect(cleanMealFlags(null)).toBeNull()
    })
})

describe('capitalize', () => {
    it('should capitalize the first letter of meal names', () => {
        const mealNames = { de: 'veganer burger', en: 'vegan burger' }
        expect(capitalize(mealNames)).toEqual({
            de: 'Veganer burger',
            en: 'Vegan burger',
        })
    })
    it('should throw an error if mealNames do not have both de and en properties', () => {
        const mealNames = { de: 'veganer burger' }
        // @ts-expect-error - Testing for error
        expect(() => capitalize(mealNames)).toThrow(
            'mealNames must have both de and en properties'
        )
    })
})

describe('unifyFoodEntries', () => {
    it('should unify food entries', () => {
        const entries = [
            {
                timestamp: '12-12-2020',
                meals: [
                    {
                        name: { de: 'burger', en: 'burger' },
                        category: 'main',
                        prices: { student: 1.5, employee: 2.5, guest: 3.5 },
                        allergens: null,
                        flags: ['veg'],
                        nutrition: null,
                        originalLanguage: 'de',
                        static: false,
                        restaurant: 'test',
                        additional: false,
                        mealId: 'test-id',
                        id: '1',
                        parent: null,
                    },
                ],
            },
        ]
        expect(unifyFoodEntries(entries)).toEqual([
            {
                timestamp: '12-12-2020',
                meals: [
                    {
                        name: { de: 'Burger', en: 'Burger' },
                        category: 'main',
                        prices: { student: 1.5, employee: 2.5, guest: 3.5 },
                        allergens: null,
                        flags: ['veg'],
                        nutrition: null,
                        originalLanguage: 'de',
                        static: false,
                        restaurant: 'test',
                        additional: false,
                        mealId: expect.any(String),
                        id: '1',
                        parent: null,
                        variants: null,
                    },
                ],
            },
        ])
    })
})

describe('mergeMealVariants', () => {
    it('should merge meal variants', () => {
        const entries = [
            {
                timestamp: '12-12-2020',
                meals: [
                    {
                        name: 'name',
                        category: 'main',
                        prices: { student: 1.5, employee: 2.5, guest: 3.5 },
                        allergens: null,
                        flags: ['veg'],
                        nutrition: null,
                        originalLanguage: 'de',
                        static: false,
                        restaurant: 'test',
                        additional: false,
                        mealId: 'test-id',
                        id: '1',
                        parent: null,
                    },
                ],
            },
        ]
        expect(mergeMealVariants(entries)).toEqual(entries)
    })
})

describe('getMealDayHash', () => {
    it('should generate a pseudo-unique hash', () => {
        const day = '2023-10-01'
        const mealName = 'burger'
        expect(getMealDayHash(day, mealName)).toMatch(/^\d{2}[a-z0-9]{6}$/)
    })
})

describe('getMealHash', () => {
    it('should generate a unique hash', () => {
        const mealName = 'burger'
        const category = 'main'
        const restaurant = 'test'
        expect(getMealHash(mealName, category, restaurant)).toMatch(
            /^[a-z0-9]+$/
        )
    })
})

describe('parseGermanFloat', () => {
    it('should parse a German float', () => {
        expect(parseGermanFloat('1,5')).toBe(1.5)
    })
    it('should return null for undefined input', () => {
        expect(parseGermanFloat(undefined)).toBeNull()
    })
})

describe('parseXmlFloat', () => {
    it('should parse an XML float', () => {
        expect(parseXmlFloat({ _text: '1,5' })).toBe(1.5)
    })
    it('should return 0 for null input', () => {
        expect(parseXmlFloat({ _text: 'null' })).toBe(0)
    })
})

describe('isEmpty', () => {
    it('should return true for empty values', () => {
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty('')).toBe(true)
        expect(isEmpty('   ')).toBe(true)
    })
    it('should return false for non-empty values', () => {
        expect(isEmpty('test')).toBe(false)
        expect(isEmpty(123)).toBe(false)
    })
})
