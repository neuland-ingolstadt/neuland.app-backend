CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" serial PRIMARY KEY NOT NULL,
    "entity" text NOT NULL,
    "entity_id" integer,
    "operation" text NOT NULL,
    "email" text,
    "user_id" text,
    "created_at" timestamp with time zone NOT NULL
);
