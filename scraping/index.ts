import NodeCache from 'node-cache'
import { Pool } from 'pg'

import { getMensaPlan } from './food/mensa'
import type { Meal } from './types/food'

const pool = new Pool({
    host: Bun.env.DB_HOST,
    port: Number(Bun.env.DB_PORT),
    user: Bun.env.POSTGRES_USER,
    password: Bun.env.POSTGRES_PASSWORD,
    database: Bun.env.POSTGRES_DB,
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

async function upsertMealWithNutrition(meal: Meal, date: Date): Promise<void> {
    const client = await pool.connect()
    try {
        const query = `
        WITH upserted_meal AS (
          INSERT INTO meals (name_de, name_en, category, restaurant, allergens, flags, original_language, static, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (name_de, category, restaurant)
          DO UPDATE SET
            name_en = EXCLUDED.name_en,
            allergens = EXCLUDED.allergens,
            flags = EXCLUDED.flags,
            original_language = EXCLUDED.original_language,
            static = EXCLUDED.static,
            updated_at = EXCLUDED.updated_at
          RETURNING id
        )
        INSERT INTO meal_nutrition (meal_id, nutrition_kj, nutrition_kcal, nutrition_fat, nutrition_fat_saturated, 
                                    nutrition_carbs, nutrition_sugar, nutrition_fiber, nutrition_protein, nutrition_salt)
        VALUES (
          (SELECT id FROM upserted_meal), $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (meal_id)
        DO UPDATE SET
          nutrition_kj = EXCLUDED.nutrition_kj,
          nutrition_kcal = EXCLUDED.nutrition_kcal,
          nutrition_fat = EXCLUDED.nutrition_fat,
          nutrition_fat_saturated = EXCLUDED.nutrition_fat_saturated,
          nutrition_carbs = EXCLUDED.nutrition_carbs,
          nutrition_sugar = EXCLUDED.nutrition_sugar,
          nutrition_fiber = EXCLUDED.nutrition_fiber,
          nutrition_protein = EXCLUDED.nutrition_protein,
          nutrition_salt = EXCLUDED.nutrition_salt
        RETURNING *;
      `

        const values = [
            meal.name.de,
            meal.name.en,
            meal.category,
            meal.restaurant,
            meal.allergens || [],
            meal.flags || [],
            meal.originalLanguage,
            meal.static,
            new Date(),
            meal.nutrition?.kj,
            meal.nutrition?.kcal,
            meal.nutrition?.fat,
            meal.nutrition?.fatSaturated,
            meal.nutrition?.carbs,
            meal.nutrition?.sugar,
            meal.nutrition?.fiber,
            meal.nutrition?.protein,
            meal.nutrition?.salt,
        ]
        const res = await client.query(query, values)
        const mealId = res.rows[0].meal_id

        // Upsert meal variants if they exist
        if (meal.variants) {
            for (const variant of meal.variants) {
                await client.query(
                    `
                    INSERT INTO meal_variants (base_meal_id, name_de, name_en, allergens, flags, original_language, additional, static, price_guest, price_student, price_employee)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (base_meal_id, name_de)
                    DO UPDATE SET
                        name_en = EXCLUDED.name_en,
                        allergens = EXCLUDED.allergens,
                        flags = EXCLUDED.flags,
                        original_language = EXCLUDED.original_language,
                        additional = EXCLUDED.additional,
                        static = EXCLUDED.static,
                        price_guest = EXCLUDED.price_guest,
                        price_student = EXCLUDED.price_student,
                        price_employee = EXCLUDED.price_employee
                `,
                    [
                        mealId,
                        variant.name.de,
                        variant.name.en,
                        variant.allergens || [],
                        variant.flags || [],
                        variant.originalLanguage,
                        variant.additional,
                        variant.static,
                        variant.prices.guest,
                        variant.prices.student,
                        variant.prices.employee,
                    ]
                )
            }
        }
        // Insert or update the meal in the meal_days table
        await client.query(
            `
            INSERT INTO meal_days (meal_id, date, price_guest, price_student, price_employee)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (meal_id, date)
            DO UPDATE SET
                price_guest = EXCLUDED.price_guest,
                price_student = EXCLUDED.price_student,
                price_employee = EXCLUDED.price_employee
        `,
            [
                mealId,
                date,
                meal.prices.guest,
                meal.prices.student,
                meal.prices.employee,
            ]
        )
    } catch (err) {
        console.error('Error upserting meal with nutrition:', err)
    } finally {
        client.release()
    }
}

// Example usage
const meals = await getMensaPlan('INGOLSTADT_MENSA')
for (const day of meals) {
    console.log(day.timestamp)
    for (const meal of day.meals) {
        await upsertMealWithNutrition(meal, new Date(day.timestamp))
    }
}
