DO $$ BEGIN
 CREATE TYPE "public"."sports_category" AS ENUM('Basketball', 'Soccer', 'Calisthenics', 'Dancing', 'StrengthTraining', 'Running', 'Jogging', 'Handball', 'Frisbee', 'Volleyball', 'Spikeball', 'FullBodyWorkout', 'Defense', 'Yoga', 'Meditation', 'Tennis', 'Badminton', 'Swimming', 'Waterpolo', 'Cycling', 'Climbing', 'Boxing', 'Kickboxing', 'MartialArts', 'TableTennis', 'Rowing', 'Baseball', 'Skateboarding', 'Parkour', 'Hiking');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "university_sports" ADD COLUMN "sports_category" "sports_category";