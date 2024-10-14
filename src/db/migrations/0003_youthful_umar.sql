-- Step 1: Add the new enum value
BEGIN;
ALTER TYPE "sports_category" ADD VALUE 'Other';
COMMIT;

-- Step 2: Update the table to use the new enum value
BEGIN;
UPDATE "university_sports" SET "sports_category" = 'Other' WHERE "sports_category" IS NULL;
COMMIT;

-- Step 3: Alter the column to set it as NOT NULL
BEGIN;
ALTER TABLE "university_sports" ALTER COLUMN "sports_category" SET NOT NULL;
COMMIT;