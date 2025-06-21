CREATE TABLE IF NOT EXISTS "app_versions" (
        "id" serial PRIMARY KEY NOT NULL,
        "warning_version" text NOT NULL,
        "deprecated_version" text NOT NULL,
        "created_at" timestamp with time zone NOT NULL,
        "updated_at" timestamp with time zone NOT NULL
);
