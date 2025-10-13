/** biome-ignore-all lint/suspicious/noExplicitAny: tbd */
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
    id: string
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
}

export interface TempMeal extends Meal {
    additional?: boolean
    variants?: Variant[]
    static: boolean
    mealId: string
}

export interface TempMealData {
    timestamp: string
    meals: TempMeal[]
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
    De = 'de',
    En = 'en'
}

export interface Prices {
    student: number | null
    employee: number | null
    guest: number | null
}

export interface StaticPrices {
    student: number
    employee: number
    guest: number
}
export interface StaticMeal {
    category: string
    static: boolean
    name: Name
    originalLanguage: string
    prices: StaticPrices
    variants: Variant[]
    restaurant: string
    id: string
}

export interface Variant {
    name: Name
    prices: Prices
    id: string
    additional?: boolean
}

export interface PreVariant {
    name: string
    prices: Record<string, number | null>
    id: string
    additional?: boolean
}
export interface XMLMensa {
    _attributes: Attributes
    item: Item[]
}
export interface XMLSpeiseplan {
    tag: XMLMensa[]
}

export interface XMLSourceData {
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
