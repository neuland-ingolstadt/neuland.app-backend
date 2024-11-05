import type { Meal } from '@/types/food'

import { pool } from '..'

export async function upsertMealWithNutrition(
    meal: Meal,
    date: Date
): Promise<void> {
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

// export async function upsertMealWithNutrition2(
//     meal: Meal,
//     date: Date
// ): Promise<void> {
//     const client = await pool.connect()
//     try {
//         await client.query('BEGIN')

//         // Update or insert main meal entry
//         let mealId: number
//         const updateMealResult = await client.query(
//             `
//             UPDATE meals
//             SET name_en = $1, allergens = $2, flags = $3,
//                 original_language = $4, static = $5, updated_at = $6
//             WHERE name_de = $7 AND category = $8 AND restaurant = $9
//             RETURNING id;
//             `,
//             [
//                 meal.name.en,
//                 meal.allergens || [],
//                 meal.flags || [],
//                 meal.originalLanguage,
//                 meal.static,
//                 new Date(),
//                 meal.name.de,
//                 meal.category,
//                 meal.restaurant,
//             ]
//         )

//         if (updateMealResult.rowCount === 0) {
//             const insertMealResult = await client.query(
//                 `
//                 INSERT INTO meals (name_de, name_en, category, restaurant,
//                     allergens, flags, original_language, static, updated_at)
//                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//                 RETURNING id;
//                 `,
//                 [
//                     meal.name.de,
//                     meal.name.en,
//                     meal.category,
//                     meal.restaurant,
//                     meal.allergens || [],
//                     meal.flags || [],
//                     meal.originalLanguage,
//                     meal.static,
//                     new Date(),
//                 ]
//             )
//             mealId = insertMealResult.rows[0].id
//         } else {
//             mealId = updateMealResult.rows[0].id
//         }

//         // Update or insert nutrition data
//         const updateNutritionResult = await client.query(
//             `
//             UPDATE meal_nutrition
//             SET nutrition_kj = $1, nutrition_kcal = $2, nutrition_fat = $3,
//                 nutrition_fat_saturated = $4, nutrition_carbs = $5,
//                 nutrition_sugar = $6, nutrition_fiber = $7,
//                 nutrition_protein = $8, nutrition_salt = $9
//             WHERE meal_id = $10;
//             `,
//             [
//                 meal.nutrition?.kj,
//                 meal.nutrition?.kcal,
//                 meal.nutrition?.fat,
//                 meal.nutrition?.fatSaturated,
//                 meal.nutrition?.carbs,
//                 meal.nutrition?.sugar,
//                 meal.nutrition?.fiber,
//                 meal.nutrition?.protein,
//                 meal.nutrition?.salt,
//                 mealId,
//             ]
//         )

//         if (updateNutritionResult.rowCount === 0) {
//             await client.query(
//                 `
//                 INSERT INTO meal_nutrition (meal_id, nutrition_kj, nutrition_kcal,
//                     nutrition_fat, nutrition_fat_saturated, nutrition_carbs,
//                     nutrition_sugar, nutrition_fiber, nutrition_protein, nutrition_salt)
//                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
//                 `,
//                 [
//                     mealId,
//                     meal.nutrition?.kj,
//                     meal.nutrition?.kcal,
//                     meal.nutrition?.fat,
//                     meal.nutrition?.fatSaturated,
//                     meal.nutrition?.carbs,
//                     meal.nutrition?.sugar,
//                     meal.nutrition?.fiber,
//                     meal.nutrition?.protein,
//                     meal.nutrition?.salt,
//                 ]
//             )
//         }

//         // Update or insert meal variants
//         if (meal.variants) {
//             for (const variant of meal.variants) {
//                 const updateVariantResult = await client.query(
//                     `
//                     UPDATE meal_variants
//                     SET name_en = $1, allergens = $2, flags = $3,
//                         original_language = $4, additional = $5, static = $6,
//                         price_guest = $7, price_student = $8, price_employee = $9
//                     WHERE base_meal_id = $10 AND name_de = $11;
//                     `,
//                     [
//                         variant.name.en,
//                         variant.allergens || [],
//                         variant.flags || [],
//                         variant.originalLanguage,
//                         variant.additional,
//                         variant.static,
//                         variant.prices.guest,
//                         variant.prices.student,
//                         variant.prices.employee,
//                         mealId,
//                         variant.name.de,
//                     ]
//                 )

//                 if (updateVariantResult.rowCount === 0) {
//                     await client.query(
//                         `
//                         INSERT INTO meal_variants (base_meal_id, name_de, name_en, allergens,
//                             flags, original_language, additional, static, price_guest,
//                             price_student, price_employee)
//                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
//                         `,
//                         [
//                             mealId,
//                             variant.name.de,
//                             variant.name.en,
//                             variant.allergens || [],
//                             variant.flags || [],
//                             variant.originalLanguage,
//                             variant.additional,
//                             variant.static,
//                             variant.prices.guest,
//                             variant.prices.student,
//                             variant.prices.employee,
//                         ]
//                     )
//                 }
//             }
//         }

//         // Update or insert meal days
//         const updateMealDaysResult = await client.query(
//             `
//             UPDATE meal_days
//             SET price_guest = $1, price_student = $2, price_employee = $3
//             WHERE meal_id = $4 AND date = $5;
//             `,
//             [
//                 meal.prices.guest,
//                 meal.prices.student,
//                 meal.prices.employee,
//                 mealId,
//                 date,
//             ]
//         )

//         if (updateMealDaysResult.rowCount === 0) {
//             await client.query(
//                 `
//                 INSERT INTO meal_days (meal_id, date, price_guest, price_student, price_employee)
//                 VALUES ($1, $2, $3, $4, $5);
//                 `,
//                 [
//                     mealId,
//                     date,
//                     meal.prices.guest,
//                     meal.prices.student,
//                     meal.prices.employee,
//                 ]
//             )
//         }

//         await client.query('COMMIT')
//     } catch (err) {
//         await client.query('ROLLBACK')
//         console.error('Error upserting meal with nutrition:', err)
//     } finally {
//         client.release()
//     }
// }

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
