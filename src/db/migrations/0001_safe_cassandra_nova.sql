ALTER TABLE "meals" ALTER COLUMN "name_de" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "restaurant" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_name_de_category_restaurant_unique" UNIQUE("name_de","category","restaurant");