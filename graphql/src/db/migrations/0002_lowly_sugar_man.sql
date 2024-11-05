DROP VIEW "public"."future_meals";--> statement-breakpoint
CREATE VIEW "public"."future_meals" AS (
   SELECT m.id                                                                                                AS "mealId",
       d.id                                                                                                AS "id",
       json_build_object('de', m.name_de, 'en', m.name_en)                                                 AS name,
       m.category,
       m.restaurant,
       m.allergens,
       m.flags,
       m.original_language                                                                                 AS "originalLanguage",
       m.static,
       m.updated_at                                                                                        AS "updatedAt",
       d.date                                                                                              AS "mealDate",
       json_build_object('guest', d.price_guest, 'student', d.price_student, 'employee', d.price_employee) AS prices,
       CASE
           WHEN n.nutrition_kj IS NOT NULL OR n.nutrition_kcal IS NOT NULL OR n.nutrition_fat IS NOT NULL
               OR n.nutrition_fat_saturated IS NOT NULL OR n.nutrition_carbs IS NOT NULL OR n.nutrition_sugar IS NOT NULL
               OR n.nutrition_fiber IS NOT NULL OR n.nutrition_protein IS NOT NULL OR n.nutrition_salt IS NOT NULL
           THEN json_build_object('kj', n.nutrition_kj, 'kcal', n.nutrition_kcal, 'fat', n.nutrition_fat, 'fatSaturated',
                                  n.nutrition_fat_saturated, 'carbs', n.nutrition_carbs, 'sugar', n.nutrition_sugar,
                                  'fiber', n.nutrition_fiber, 'protein', n.nutrition_protein, 'salt', n.nutrition_salt)
           ELSE NULL
       END                                                                                                AS nutrition,
       CASE
           WHEN COUNT(v.id) > 0
           THEN json_agg(json_build_object('id', v.id, json_build_object('de', v.name_de, 'en', v.name_en),
                                           'allergens', v.allergens, 'flags', v.flags,
                                           'originalLanguage', v.original_language, 'additional', v.additional,
                                           'prices', json_build_object('guest', v.price_guest, 'student', v.price_student,
                                                                       'employee', v.price_employee)))
           ELSE NULL
       END                                                                                                AS variants,
       COALESCE(avg(r.rating), 0::numeric)                                                                 AS "averageRating",
       count(r.rating)                                                                                     AS "ratingCount"
FROM meals m
         LEFT JOIN meal_nutrition n ON m.id = n.meal_id
         LEFT JOIN meal_variants v ON m.id = v.base_meal_id
         LEFT JOIN meal_reviews r ON m.id = r.meal_id
         JOIN meal_days d ON m.id = d.meal_id
WHERE d.date >= CURRENT_DATE
GROUP BY m.id, d.id, m.category, m.restaurant, m.allergens, m.flags, m.original_language, m.static, m.updated_at,
         d.date, d.price_guest, d.price_student, d.price_employee, n.nutrition_kj, n.nutrition_kcal, n.nutrition_fat,
         n.nutrition_fat_saturated, n.nutrition_carbs, n.nutrition_sugar, n.nutrition_fiber, n.nutrition_protein,
         n.nutrition_salt
HAVING (n.nutrition_kj IS NOT NULL OR n.nutrition_kcal IS NOT NULL OR n.nutrition_fat IS NOT NULL
        OR n.nutrition_fat_saturated IS NOT NULL OR n.nutrition_carbs IS NOT NULL OR n.nutrition_sugar IS NOT NULL
        OR n.nutrition_fiber IS NOT NULL OR n.nutrition_protein IS NOT NULL OR n.nutrition_salt IS NOT NULL)
   OR COUNT(v.id) > 0

  );