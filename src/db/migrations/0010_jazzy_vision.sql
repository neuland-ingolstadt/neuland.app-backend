CREATE TABLE IF NOT EXISTS "neulandEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_de" text NOT NULL,
	"title_en" text NOT NULL,
	"description_de" text,
	"description_en" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"rrule" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_start_time" ON "neulandEvents" USING btree ("start_time");