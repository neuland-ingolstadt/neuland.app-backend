CREATE VIEW "public"."future_meals" AS (
    SELECT m.id AS meal_id,
           m.name_de,
           m.name_en,
           m.category,
           m.restaurant,
           m.allergens,
           m.flags,
           m.original_language,
           m.static,
           m.updated_at,
           d.date AS meal_date,
           n.nutrition_kj,
           n.nutrition_kcal,
           n.nutrition_fat,
           n.nutrition_fat_saturated,
           n.nutrition_carbs,
           n.nutrition_sugar,
           n.nutrition_fiber,
           n.nutrition_protein,
           n.nutrition_salt,
           v.id                                AS variant_id,
           v.name_de                           AS variant_name_de,
           v.name_en                           AS variant_name_en,
           v.allergens                         AS variant_allergens,
           v.flags                             AS variant_flags,
           v.original_language                 AS variant_original_language,
           v.additional                        AS variant_additional,
           v.price_guest                       AS variant_price_guest,
           v.price_student                     AS variant_price_student,
           v.price_employee                    AS variant_price_employee,
           COALESCE(avg(r.rating), 0::numeric) AS average_rating
    FROM meals m
             LEFT JOIN meal_nutrition n ON m.id = n.meal_id
             LEFT JOIN meal_variants v ON m.id = v.base_meal_id
             LEFT JOIN meal_reviews r ON m.id = r.meal_id
             JOIN meal_days d ON m.id = d.meal_id
    WHERE d.date >= CURRENT_DATE
    GROUP BY m.id, m.name_de, m.name_en, m.category, m.restaurant, m.allergens, m.flags, m.original_language, m.static,
             m.updated_at, d.date, n.nutrition_kj, n.nutrition_kcal, n.nutrition_fat, n.nutrition_fat_saturated,
             n.nutrition_carbs, n.nutrition_sugar, n.nutrition_fiber, n.nutrition_protein, n.nutrition_salt, v.id,
             v.name_de, v.name_en, v.allergens, v.flags, v.original_language, v.additional, v.price_guest, v.price_student,
             v.price_employee
  );