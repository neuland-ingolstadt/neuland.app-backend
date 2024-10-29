import {
    decimal,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core'

export const restaurantType = pgEnum('restaurant', [
    'INGOLSTADT_MENSA',
    'NEUBURG_MENSA',
    'REIMANNS',
    'CANISIUS',
])

export const categoryType = pgEnum('meal_category', [
    'MAIN',
    'SIDE',
    'SOUP',
    'SALAD',
    'DESSERT',
])

export const reportReasonType = pgEnum('meal_report_reason', [
    'WRONG_PRICE',
    'WRONG_INGREDIENTS',
    'NOT_AVAILABLE',
    'OTHER',
])

export const meals = pgTable(
    'meals',
    {
        id: serial('id').primaryKey(),
        name_de: text('name_de').notNull(),
        category: categoryType('category').notNull(),
        restaurant: restaurantType('restaurant').notNull(),
    },
    (table) => {
        return {
            uniqueMeal: unique().on(
                table.name_de,
                table.category,
                table.restaurant
            ),
        }
    }
)

export const mealDays = pgTable('meal_days', {
    id: serial('id').primaryKey(),
    meal_id: integer('meal_id').references(() => meals.id),
    date: timestamp('date'),
    price_guest: decimal('price_guest', { precision: 10, scale: 2 }),
    price_student: decimal('price_student', { precision: 10, scale: 2 }),
    price_employee: decimal('price_employee', { precision: 10, scale: 2 }),
})

export const mealRatings = pgTable('meal_reviews', {
    id: serial('id').primaryKey(),
    meal_id: integer('meal_id').references(() => meals.id),
    user_id: integer('user_id').references(() => foodUsers.id),
    rating: integer('rating'),
    created_at: timestamp('created_at'),
    updated_at: timestamp('updated_at'),
})

export const mealProblemReports = pgTable('meal_problem_reports', {
    id: serial('id').primaryKey(),
    meal_day_id: integer('meal_day_id').references(() => mealDays.id),
    user_id: integer('user_id').references(() => foodUsers.id),
    reason: reportReasonType('reason'),
    created_at: timestamp('created_at'),
})

export const foodUsers = pgTable('food_users', {
    id: serial('id').primaryKey(),
    created_at: timestamp('created_at'),
})
