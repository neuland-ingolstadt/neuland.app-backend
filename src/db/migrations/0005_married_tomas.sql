CREATE TYPE "public"."meal_category" AS ENUM('MAIN', 'SIDE', 'SOUP', 'SALAD', 'DESSERT');--> statement-breakpoint
CREATE TYPE "public"."meal_report_reason" AS ENUM('WRONG_PRICE', 'WRONG_INGREDIENTS', 'NOT_AVAILABLE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."restaurant" AS ENUM('IngolstadtMensa', 'NeuburgMensa', 'Reimanns', 'Canisius');--> statement-breakpoint
CREATE TYPE "public"."room_report_reason" AS ENUM('WRONG_DESCRIPTION', 'WRONG_LOCATION', 'NOT_EXISTING', 'MISSING', 'OTHER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "error_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_day_id" integer,
	"user_id" integer,
	"reason" "meal_report_reason",
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer,
	"date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_de" text,
	"name_en" text,
	"category" "meal_category",
	"restaurant" "restaurant"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_day_id" integer,
	"price_guest" numeric(10, 2),
	"price_student" numeric(10, 2),
	"price_employee" numeric(10, 2),
	"change_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer,
	"user_id" integer,
	"rating" integer,
	"report" boolean DEFAULT false,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"room" text NOT NULL,
	"reason" "room_report_reason" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "error_reports" ADD CONSTRAINT "error_reports_meal_day_id_meal_days_id_fk" FOREIGN KEY ("meal_day_id") REFERENCES "public"."meal_days"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "error_reports" ADD CONSTRAINT "error_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_days" ADD CONSTRAINT "meal_days_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_history" ADD CONSTRAINT "price_history_meal_day_id_meal_days_id_fk" FOREIGN KEY ("meal_day_id") REFERENCES "public"."meal_days"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
