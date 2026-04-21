CREATE TYPE "partnership_package" AS ENUM ('SHARING', 'SOCIALIZING', 'INFLUENCING');
--> statement-breakpoint
CREATE TYPE "social_support_option" AS ENUM (
  'CONTENT_PRODUCTION',
  'EVENT_GRAPHICS_FLYERS',
  'SOCIAL_MEDIA_TRAINING',
  'FULL_MEDIA_MANAGEMENT'
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_profile" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "business_name" text NOT NULL,
  "main_point_of_contact" text NOT NULL,
  "instagram_handle" text NOT NULL,
  "partnership_package" "partnership_package" NOT NULL,
  "additional_support" "social_support_option"[] NOT NULL DEFAULT '{}'::social_support_option[],
  "goals" text NOT NULL,
  "completed_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "client_profile_organization_id_fk"
    FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "client_profile_organization_id_idx"
  ON "client_profile" USING btree ("organization_id");
