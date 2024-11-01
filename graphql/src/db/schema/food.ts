import {
    boolean,
    decimal,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core'

// Enums
export const restaurantEnum = pgEnum('restaurant', [
    'INGOLSTADT_MENSA',
    'NEUBURG_MENSA',
    'REIMANNS',
    'CANISIUS',
])

export const mealCategoryEnum = pgEnum('meal_category', [
    'MAIN',
    'SIDE',
    'SOUP',
    'SALAD',
    'DESSERT',
])

export const mealReportReasonEnum = pgEnum('meal_report_reason', [
    'WRONG_PRICE',
    'WRONG_INGREDIENTS',
    'NOT_AVAILABLE',
    'OTHER',
])

export const languageCodeEnum = pgEnum('language_code', ['DE', 'EN'])

export const meals = pgTable(
    'meals',
    {
        id: serial('id').primaryKey(),
        nameDe: text('name_de').notNull(),
        nameEn: text('name_en'),
        category: mealCategoryEnum('category').notNull(),
        restaurant: restaurantEnum('restaurant').notNull(),
        allergens: text('allergens').array(),
        flags: text('flags').array(),
        originalLanguage: languageCodeEnum('original_language').notNull(),
        static: boolean('static').notNull(),
        updatedAt: timestamp('updated_at'),
    },
    (table) => ({
        uniqueNameCategoryRestaurant: uniqueIndex(
            'unique_name_category_restaurant'
        ).on(table.nameDe, table.category, table.restaurant),
    })
)

export const mealVariants = pgTable(
    'meal_variants',
    {
        id: serial('id').primaryKey(),
        baseMealId: integer('base_meal_id')
            .references(() => meals.id)
            .notNull(),
        nameDe: text('name_de').notNull(),
        nameEn: text('name_en'),
        allergens: text('allergens').array(),
        flags: text('flags').array(),
        originalLanguage: languageCodeEnum('original_language').notNull(),
        additional: boolean('additional').notNull(),
        static: boolean('static').notNull(),
        priceGuest: decimal('price_guest', { precision: 10, scale: 2 }),
        priceStudent: decimal('price_student', { precision: 10, scale: 2 }),
        priceEmployee: decimal('price_employee', { precision: 10, scale: 2 }),
    },
    (table) => ({
        uniqueBaseMealNameDe: uniqueIndex('unique_base_meal_name_de').on(
            table.baseMealId,
            table.nameDe
        ),
    })
)

export const mealNutrition = pgTable('meal_nutrition', {
    id: serial('id').primaryKey(),
    mealId: integer('meal_id')
        .references(() => meals.id)
        .unique(), // One-to-one relationship
    nutritionKj: integer('nutrition_kj'),
    nutritionKcal: integer('nutrition_kcal'),
    nutritionFat: decimal('nutrition_fat', { precision: 5, scale: 2 }),
    nutritionFatSaturated: decimal('nutrition_fat_saturated', {
        precision: 5,
        scale: 2,
    }),
    nutritionCarbs: decimal('nutrition_carbs', { precision: 5, scale: 2 }),
    nutritionSugar: decimal('nutrition_sugar', { precision: 5, scale: 2 }),
    nutritionFiber: decimal('nutrition_fiber', { precision: 5, scale: 2 }),
    nutritionProtein: decimal('nutrition_protein', { precision: 5, scale: 2 }),
    nutritionSalt: decimal('nutrition_salt', { precision: 5, scale: 2 }),
})

export const mealDays = pgTable(
    'meal_days',
    {
        id: serial('id').primaryKey(),
        mealId: integer('meal_id').references(() => meals.id),
        date: timestamp('date'),
        priceGuest: decimal('price_guest', { precision: 10, scale: 2 }),
        priceStudent: decimal('price_student', { precision: 10, scale: 2 }),
        priceEmployee: decimal('price_employee', { precision: 10, scale: 2 }),
    },
    (table) => ({
        uniqueMealDate: uniqueIndex('unique_meal_date').on(
            table.mealId,
            table.date
        ),
    })
)

export const mealReviews = pgTable('meal_reviews', {
    id: serial('id').primaryKey(),
    mealId: integer('meal_id').references(() => meals.id),
    userId: integer('user_id').references(() => foodUsers.id),
    rating: integer('rating'),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
})

export const mealProblemReports = pgTable('meal_problem_reports', {
    id: serial('id').primaryKey(),
    mealDayId: integer('meal_day_id').references(() => mealDays.id),
    userId: integer('user_id').references(() => foodUsers.id),
    reason: mealReportReasonEnum('reason'),
    createdAt: timestamp('created_at'),
})

export const foodUsers = pgTable('food_users', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at'),
})
