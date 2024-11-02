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
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name_category_restaurant" ON "meals" USING btree ("name_de","category","restaurant");