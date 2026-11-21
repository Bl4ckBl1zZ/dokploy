ALTER TABLE "organization_role" ADD COLUMN "allowed_domains" text[];--> statement-breakpoint
ALTER TABLE "organization_role" ADD COLUMN "require_https" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lastSessionAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deactivatedAt" timestamp;--> statement-breakpoint
UPDATE "user" SET "lastSessionAt" = now() at time zone 'utc';