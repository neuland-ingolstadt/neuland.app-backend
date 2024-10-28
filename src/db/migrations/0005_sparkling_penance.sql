CREATE TYPE "public"."app_platform" AS ENUM('ANDROID', 'IOS', 'WEB', 'WEB_DEV');--> statement-breakpoint
CREATE TYPE "public"."user_kind" AS ENUM('STUDENT', 'EMPLOYEE', 'GUEST');--> statement-breakpoint
ALTER TABLE "app_announcements" ADD COLUMN "platform" app_platform[] NOT NULL;
ALTER TABLE "app_announcements" ADD COLUMN "user_kind" user_kind[] NOT NULL;