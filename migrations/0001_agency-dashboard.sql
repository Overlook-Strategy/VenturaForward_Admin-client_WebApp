ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "display_name" text DEFAULT '';
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "billing_email" text;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "meta_brand_tag" text;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "monthly_ad_quota" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;

--> statement-breakpoint
UPDATE "organization" SET "display_name" = COALESCE(NULLIF("display_name", ''), "id");

--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "display_name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "display_name" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "monthly_ad_quota" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "monthly_ad_quota" SET DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "is_active" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "is_active" SET DEFAULT true;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_user" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "user_id" text NOT NULL,
  "role" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "organization_user_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_post" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "source_event_id" text,
  "post_url" text NOT NULL,
  "caption" text,
  "posted_at" timestamp NOT NULL,
  "like_count" integer DEFAULT 0 NOT NULL,
  "comment_count" integer DEFAULT 0 NOT NULL,
  "impression_count" integer DEFAULT 0 NOT NULL,
  "engagement_count" integer DEFAULT 0 NOT NULL,
  "raw_payload" jsonb,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "meta_post_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "stripe_customer_id" text,
  "stripe_invoice_id" text,
  "amount_due" integer DEFAULT 0 NOT NULL,
  "amount_paid" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'usd' NOT NULL,
  "status" text NOT NULL,
  "due_date" timestamp,
  "paid_at" timestamp,
  "period_start" timestamp,
  "period_end" timestamp,
  "raw_payload" jsonb,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "payment_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monthly_summary" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "year" integer NOT NULL,
  "month" integer NOT NULL,
  "post_count" integer NOT NULL,
  "quota_target" integer NOT NULL,
  "quota_fulfilled" boolean DEFAULT false NOT NULL,
  "payment_status_summary" text NOT NULL,
  "sent_to_email" text,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "monthly_summary_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_member_idx" ON "organization_user" USING btree ("organization_id", "user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "meta_brand_tag_idx" ON "organization" USING btree ("meta_brand_tag");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "meta_post_source_event_idx" ON "meta_post" USING btree ("source_event_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_stripe_invoice_id_idx" ON "payment" USING btree ("stripe_invoice_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_summary_unique_idx" ON "monthly_summary" USING btree ("organization_id", "year", "month");
