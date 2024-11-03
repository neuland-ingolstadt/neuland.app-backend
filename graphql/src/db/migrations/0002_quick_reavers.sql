DROP VIEW "public"."future_meals";--> statement-breakpoint
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
           json_agg(json_build_object(
                'variant_id', v.id,
                'variant_name_de', v.name_de,
                'variant_name_en', v.name_en,
                'variant_allergens', v.allergens,
                'variant_flags', v.flags,
                'variant_original_language', v.original_language,
                'variant_additional', v.additional,
                'variant_price_guest', v.price_guest,
                'variant_price_student', v.price_student,
                'variant_price_employee', v.price_employee
            )) AS variants,
            COALESCE(avg(r.rating), 0::numeric) AS averageRating
    FROM meals m
             LEFT JOIN meal_nutrition n ON m.id = n.meal_id
             LEFT JOIN meal_variants v ON m.id = v.base_meal_id
             LEFT JOIN meal_reviews r ON m.id = r.meal_id
             JOIN meal_days d ON m.id = d.meal_id
    WHERE d.date >= CURRENT_DATE
    GROUP BY m.id, m.name_de, m.name_en, m.category, m.restaurant, m.allergens, m.flags, m.original_language, m.static,
             m.updated_at, d.date, n.nutrition_kj, n.nutrition_kcal, n.nutrition_fat, n.nutrition_fat_saturated,
             n.nutrition_carbs, n.nutrition_sugar, n.nutrition_fiber, n.nutrition_protein, n.nutrition_salt
  );