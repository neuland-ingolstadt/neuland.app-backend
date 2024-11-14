/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PreFoodData {
    timestamp: string
    meals: PreMeal[]
}

export interface MealData {
    timestamp: string
    meals: Meal[]
}

export interface ReturnData {
    foodData: MealData[]
    errors: Array<{ location: string; message: string }>
}

export interface ExtendedMealData {
    timestamp: string
    meals: ExtendedMeal[]
}

export interface BaseMeal {
    prices: Prices | Record<string, number | null>
    allergens: string[] | null
    flags: string[] | null
    nutrition: Nutrition | null
    restaurant: string
}

export interface ExtendedMeal extends PreMeal {
    variants?: PreVariant[]
    additional?: boolean
    static?: boolean
    originalLanguage?: string
    parent?: any
}

export interface PreMeal extends BaseMeal {
    name: string
    category: string
}

export interface Meal extends BaseMeal {
    name: Name
    static: boolean
    originalLanguage: string
    category: string
    parent: any
    variants: Variant[]
}

export interface TempMeal extends Meal {
    additional?: boolean
    variants?: Variant[]
    static: boolean
}

export interface TempMealData {
    timestamp: string
    meals: Meal[]
}

export interface Name {
    de: string
    en: string
}

interface Nutrition {
    kj: number
    kcal: number
    fat: number
    fatSaturated: number
    carbs: number
    sugar: number
    fiber: number
    protein: number
    salt: number
}

export enum OriginalLanguage {
    De = 'DE',
    En = 'EN',
}

export interface Prices {
    student: number | null
    employee: number | null
    guest: number | null
}

export interface StaticMeal {
    category: string
    static: boolean
    name: Name
    originalLanguage: string
    prices: Prices
    variants: Variant[]
    restaurant: string
}

export interface Variant {
    name: Name
    prices: Prices
    additional: boolean
    allergens: string[]
    flags: string[]
    originalLanguage: string
    static: boolean
}

export interface PreVariant {
    name: string
    prices: Record<string, number | null>
    additional?: boolean
}
export interface XMLMensa {
    _attributes: Attributes
    item: Item[]
}
interface XMLSpeiseplan {
    tag: XMLMensa[]
}

interface XMLSourceData {
    speiseplan: XMLSpeiseplan
}
interface Attributes {
    timestamp: string
}

export interface Item {
    category: MensaText
    title: MensaText
    description: MensaText
    beilagen: null
    preis1: MensaText
    preis2: MensaText
    preis3: MensaText
    einheit: MensaText
    piktogramme: MensaText
    ballaststoffe: MensaText
    kj: MensaText
    kcal: MensaText
    fett: MensaText
    gesfett: MensaText
    kh: MensaText
    zucker: MensaText
    MensaText: MensaText
    eiweiss: MensaText
    salz: MensaText
    foto: null
}

interface MensaText {
    _text?: string
}

export interface CanisiusBlock {
    name: string
    prices: Prices
}
