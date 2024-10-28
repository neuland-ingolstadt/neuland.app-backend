ALTER TABLE "room_reports" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "room_reports" ADD COLUMN "resolved_at" timestamp with time zone;