import {
    boolean,
    decimal,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'

export const RestaurantType = pgEnum('restaurant', [
    'IngolstadtMensa',
    'NeuburgMensa',
    'Reimanns',
    'Canisius',
])

export const CategoryType = pgEnum('meal_category', [
    'MAIN',
    'SIDE',
    'SOUP',
    'SALAD',
    'DESSERT',
])

export const ReportReasonType = pgEnum('meal_report_reason', [
    'WRONG_PRICE',
    'WRONG_INGREDIENTS',
    'NOT_AVAILABLE',
    'OTHER',
])

export const Meals = pgTable('meals', {
    id: serial('id').primaryKey(),
    name_de: text('name_de'),
    name_en: text('name_en'),
    category: CategoryType('category'),
    restaurant: RestaurantType('restaurant'),
})

export const MealDays = pgTable('meal_days', {
    id: serial('id').primaryKey(),
    meal_id: integer('meal_id').references(() => Meals.id),
    date: timestamp('date'),
})

export const Reviews = pgTable('reviews', {
    id: serial('id').primaryKey(),
    meal_id: integer('meal_id').references(() => Meals.id),
    user_id: integer('user_id').references(() => Users.id),
    rating: integer('rating'),
    report: boolean('report').default(false),
    created_at: timestamp('created_at'),
    updated_at: timestamp('updated_at'),
})

export const ErrorReports = pgTable('error_reports', {
    id: serial('id').primaryKey(),
    meal_day_id: integer('meal_day_id').references(() => MealDays.id),
    user_id: integer('user_id').references(() => Users.id),
    reason: ReportReasonType('reason'),
    created_at: timestamp('created_at'),
})

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    created_at: timestamp('created_at'),
})

export const PriceHistory = pgTable('price_history', {
    id: serial('id').primaryKey(),
    meal_day_id: integer('meal_day_id').references(() => MealDays.id),
    price_guest: decimal('price_guest', { precision: 10, scale: 2 }),
    price_student: decimal('price_student', { precision: 10, scale: 2 }),
    price_employee: decimal('price_employee', { precision: 10, scale: 2 }),
    change_date: timestamp('change_date'),
})
