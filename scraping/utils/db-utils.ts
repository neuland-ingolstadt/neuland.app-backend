import type { Meal } from '@/types/food'

import { pool } from '..'

export async function upsertMealWithNutrition3(
    meal: Meal,
    date: Date
): Promise<void> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // MERGE for main meal entry
        const mealIdResult = await client.query(
            `
            MERGE INTO meals AS target
            USING (VALUES ($1::text, $2::text, $3::meal_category, $4::restaurant, $5::text[], $6::text[], $7::language_code, $8::boolean, $9::timestamp))
            AS source (name_de, name_en, category, restaurant, allergens, flags, original_language, static, updated_at)
            ON target.name_de = source.name_de AND target.category = source.category AND target.restaurant = source.restaurant
            WHEN MATCHED THEN
                UPDATE SET name_en = source.name_en,
                           allergens = source.allergens,
                           flags = source.flags,
                           original_language = source.original_language,
                           static = source.static,
                           updated_at = source.updated_at
            WHEN NOT MATCHED THEN
                INSERT (name_de, name_en, category, restaurant, allergens, flags, original_language, static, updated_at)
                VALUES (source.name_de, source.name_en, source.category, source.restaurant,
                        source.allergens, source.flags, source.original_language, source.static, source.updated_at)
            RETURNING id;
            `,
            [
                meal.name.de,
                meal.name.en,
                meal.category,
                meal.restaurant,
                meal.allergens || [],
                meal.flags || [],
                meal.originalLanguage, // Adjusted as per updated schema
                meal.static,
                new Date(),
            ]
        )
        const mealId = mealIdResult.rows[0].id

        if (meal.nutrition) {
            await client.query(
                `
            MERGE INTO meal_nutrition AS target
            USING (VALUES ($1::integer, $2::integer, $3::integer, $4::numeric(5,2), $5::numeric(5,2), $6::numeric(5,2), $7::numeric(5,2), $8::numeric(5,2), $9::numeric(5,2), $10::numeric(5,2)))
            AS source (meal_id, nutrition_kj, nutrition_kcal, nutrition_fat, nutrition_fat_saturated,
                       nutrition_carbs, nutrition_sugar, nutrition_fiber, nutrition_protein, nutrition_salt)
            ON target.meal_id = source.meal_id
            WHEN MATCHED THEN
                UPDATE SET nutrition_kj = source.nutrition_kj,
                           nutrition_kcal = source.nutrition_kcal,
                           nutrition_fat = source.nutrition_fat,
                           nutrition_fat_saturated = source.nutrition_fat_saturated,
                           nutrition_carbs = source.nutrition_carbs,
                           nutrition_sugar = source.nutrition_sugar,
                           nutrition_fiber = source.nutrition_fiber,
                           nutrition_protein = source.nutrition_protein,
                           nutrition_salt = source.nutrition_salt
            WHEN NOT MATCHED THEN
                INSERT (meal_id, nutrition_kj, nutrition_kcal, nutrition_fat, nutrition_fat_saturated,
                        nutrition_carbs, nutrition_sugar, nutrition_fiber, nutrition_protein, nutrition_salt)
                VALUES (source.meal_id, source.nutrition_kj, source.nutrition_kcal, source.nutrition_fat,
                        source.nutrition_fat_saturated, source.nutrition_carbs, source.nutrition_sugar,
                        source.nutrition_fiber, source.nutrition_protein, source.nutrition_salt);
            `,
                [
                    mealId,
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
            )
        }

        // MERGE for meal variants
        if (meal.variants) {
            for (const variant of meal.variants) {
                await client.query(
                    `
                    MERGE INTO meal_variants AS target
                    USING (VALUES ($1::integer, $2::text, $3::text, $4::text[], $5::text[], $6::language_code, $7::boolean, $8::boolean, $9::numeric(10,2), $10::numeric(10,2), $11::numeric(10,2)))
                    AS source (base_meal_id, name_de, name_en, allergens, flags, original_language, additional, static, price_guest, price_student, price_employee)
                    ON target.base_meal_id = source.base_meal_id AND target.name_de = source.name_de
                    WHEN MATCHED THEN
                        UPDATE SET name_en = source.name_en,
                                   allergens = source.allergens,
                                   flags = source.flags,
                                   original_language = source.original_language,
                                   additional = source.additional,
                                   static = source.static,
                                   price_guest = source.price_guest,
                                   price_student = source.price_student,
                                   price_employee = source.price_employee
                    WHEN NOT MATCHED THEN
                        INSERT (base_meal_id, name_de, name_en, allergens, flags, original_language, additional, static, price_guest, price_student, price_employee)
                        VALUES (source.base_meal_id, source.name_de, source.name_en, source.allergens, source.flags,
                                source.original_language, source.additional, source.static, source.price_guest,
                                source.price_student, source.price_employee);
                    `,
                    [
                        mealId,
                        variant.name.de,
                        variant.name.en,
                        variant.allergens || [],
                        variant.flags || [],
                        variant.originalLanguage, // Adjusted as per updated schema
                        variant.additional,
                        variant.static,
                        variant.prices.guest,
                        variant.prices.student,
                        variant.prices.employee,
                    ]
                )
            }
        }

        // MERGE for meal days
        await client.query(
            `
            MERGE INTO meal_days AS target
            USING (VALUES ($1::integer, $2::date, $3::numeric(10,2), $4::numeric(10,2), $5::numeric(10,2)))
            AS source (meal_id, date, price_guest, price_student, price_employee)
            ON target.meal_id = source.meal_id AND target.date = source.date
            WHEN MATCHED THEN
                UPDATE SET price_guest = source.price_guest,
                           price_student = source.price_student,
                           price_employee = source.price_employee
            WHEN NOT MATCHED THEN
                INSERT (meal_id, date, price_guest, price_student, price_employee)
                VALUES (source.meal_id, source.date, source.price_guest, source.price_student, source.price_employee);
            `,
            [
                mealId,
                date,
                meal.prices.guest,
                meal.prices.student,
                meal.prices.employee,
            ]
        )

        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Error upserting meal with nutrition:', err)
    } finally {
        client.release()
    }
}

export async function removeOldMeals(currentMeals: Meal[], date: Date): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch current meal IDs from the database for the given date
        const result = await client.query(
            `
            SELECT meal_id
            FROM meal_days
            WHERE date = $1;
            `,
            [date]
        );
        const currentMealIds = result.rows.map((row) => row.meal_id);
        console.log('currentMealIds:', currentMeals);
        // Get the meal IDs from the currentMeals array
        const newMealIds = await Promise.all(
            currentMeals.map(async (meal) => {
                const result = await client.query(
                    `
                    SELECT id
                    FROM meals
                    WHERE name_de = $1 AND category = $2 AND restaurant = $3;
                    `,
                    [meal.name.de, meal.category, meal.restaurant]
                );
                return result.rows[0]?.id;
            })
        );

        console.log('newMealIds:', newMealIds);

        // Find the meal IDs that need to be removed
        const mealIdsToRemove = currentMealIds.filter((id) => !newMealIds.includes(id));
        console.log('mealIdsToRemove:', mealIdsToRemove);
        // Remove the old meals from the meal_days table
        if (mealIdsToRemove.length > 0) {
            await client.query(
                `
                DELETE FROM meal_days
                WHERE meal_id = ANY($1::integer[]);
                `,
                [mealIdsToRemove]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error removing old meals:', err);
    } finally {
        client.release();
    }
}