CREATE TYPE "public"."app_platform" AS ENUM('ANDROID', 'IOS', 'WEB', 'WEB_DEV');--> statement-breakpoint
CREATE TYPE "public"."user_kind" AS ENUM('STUDENT', 'EMPLOYEE', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('DE', 'EN');--> statement-breakpoint
CREATE TYPE "public"."meal_category" AS ENUM('MAIN', 'SIDE', 'SOUP', 'SALAD', 'DESSERT');--> statement-breakpoint
CREATE TYPE "public"."meal_report_reason" AS ENUM('WRONG_PRICE', 'WRONG_INGREDIENTS', 'NOT_AVAILABLE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."restaurant" AS ENUM('INGOLSTADT_MENSA', 'NEUBURG_MENSA', 'REIMANNS', 'CANISIUS');--> statement-breakpoint
CREATE TYPE "public"."room_report_reason" AS ENUM('WRONG_DESCRIPTION', 'WRONG_LOCATION', 'NOT_EXISTING', 'MISSING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."campus" AS ENUM('Ingolstadt', 'Neuburg');--> statement-breakpoint
CREATE TYPE "public"."sports_category" AS ENUM('Basketball', 'Soccer', 'Calisthenics', 'Dancing', 'StrengthTraining', 'Running', 'Jogging', 'Handball', 'Frisbee', 'Volleyball', 'Spikeball', 'FullBodyWorkout', 'Defense', 'Yoga', 'Meditation', 'Tennis', 'Badminton', 'Swimming', 'Waterpolo', 'Cycling', 'Climbing', 'Boxing', 'Kickboxing', 'MartialArts', 'TableTennis', 'Rowing', 'Baseball', 'Skateboarding', 'Parkour', 'Hockey', 'Hiking', 'Other');--> statement-breakpoint
CREATE TYPE "public"."weekday" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" app_platform[] NOT NULL,
	"user_kind" user_kind[] NOT NULL,
	"title_de" text NOT NULL,
	"title_en" text NOT NULL,
	"description_de" text NOT NULL,
	"description_en" text NOT NULL,
	"start_date_time" timestamp with time zone NOT NULL,
	"end_date_time" timestamp with time zone NOT NULL,
	"priority" integer NOT NULL,
	"url" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "food_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer,
	"date" date,
	"price_guest" numeric(10, 2),
	"price_student" numeric(10, 2),
	"price_employee" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_nutrition" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer,
	"nutrition_kj" integer,
	"nutrition_kcal" integer,
	"nutrition_fat" numeric(5, 2),
	"nutrition_fat_saturated" numeric(5, 2),
	"nutrition_carbs" numeric(5, 2),
	"nutrition_sugar" numeric(5, 2),
	"nutrition_fiber" numeric(5, 2),
	"nutrition_protein" numeric(5, 2),
	"nutrition_salt" numeric(5, 2),
	CONSTRAINT "meal_nutrition_meal_id_unique" UNIQUE("meal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_problem_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_day_id" integer,
	"user_id" integer,
	"reason" "meal_report_reason",
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer,
	"user_id" integer,
	"rating" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_meal_id" integer NOT NULL,
	"name_de" text NOT NULL,
	"name_en" text,
	"allergens" text[],
	"flags" text[],
	"original_language" "language_code" NOT NULL,
	"additional" boolean NOT NULL,
	"static" boolean NOT NULL,
	"price_guest" numeric(10, 2),
	"price_student" numeric(10, 2),
	"price_employee" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_de" text NOT NULL,
	"name_en" text,
	"category" "meal_category" NOT NULL,
	"restaurant" "restaurant" NOT NULL,
	"allergens" text[],
	"flags" text[],
	"original_language" "language_code" NOT NULL,
	"static" boolean NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"room" text NOT NULL,
	"reason" "room_report_reason" NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "university_sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_de" text NOT NULL,
	"description_de" text,
	"title_en" text NOT NULL,
	"description_en" text,
	"campus" "campus" NOT NULL,
	"location" text NOT NULL,
	"weekday" "weekday" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"requires_registration" boolean NOT NULL,
	"invitation_link" text,
	"e_mail" text,
	"sports_category" "sports_category" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_days" ADD CONSTRAINT "meal_days_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_nutrition" ADD CONSTRAINT "meal_nutrition_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_problem_reports" ADD CONSTRAINT "meal_problem_reports_meal_day_id_meal_days_id_fk" FOREIGN KEY ("meal_day_id") REFERENCES "public"."meal_days"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_problem_reports" ADD CONSTRAINT "meal_problem_reports_user_id_food_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."food_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_reviews" ADD CONSTRAINT "meal_reviews_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_reviews" ADD CONSTRAINT "meal_reviews_user_id_food_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."food_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_variants" ADD CONSTRAINT "meal_variants_base_meal_id_meals_id_fk" FOREIGN KEY ("base_meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_meal_date" ON "meal_days" USING btree ("meal_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_base_meal_name_de" ON "meal_variants" USING btree ("base_meal_id","name_de");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name_category_restaurant" ON "meals" USING btree ("name_de","category","restaurant");--> statement-breakpoint
CREATE VIEW "public"."future_meals" AS (
   SELECT m.id                                                                                                AS "mealId",
       d.id                                                                                                AS "dayId",
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
           THEN json_agg(json_build_object('id', v.id, 'variant_name_de', v.name_de, 'variant_name_en', v.name_en,
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