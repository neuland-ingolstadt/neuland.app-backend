DO $$ BEGIN
 CREATE TYPE "public"."campus" AS ENUM('Ingolstadt', 'Neuburg');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."weekday" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_de" text NOT NULL,
	"title_en" text NOT NULL,
	"description_de" text NOT NULL,
	"description_en" text NOT NULL,
	"start_date_time" timestamp with time zone NOT NULL,
	"end_date_time" timestamp with time zone NOT NULL,
	"priority" integer NOT NULL,
	"url" text
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
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
