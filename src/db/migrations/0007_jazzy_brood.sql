CREATE TABLE IF NOT EXISTS "manual_cl_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_de" text NOT NULL,
	"title_en" text NOT NULL,
	"description_de" text,
	"description_en" text,
	"start_date_time" timestamp with time zone NOT NULL,
	"end_date_time" timestamp with time zone,
	"organizer" text NOT NULL,
	"url" text,
	"instagram" text,
	"event_url" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
