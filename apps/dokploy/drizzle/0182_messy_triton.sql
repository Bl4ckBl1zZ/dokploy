CREATE TYPE "public"."DnsProviderType" AS ENUM('cloudflare', 'route53', 'porkbun', 'infomaniak', 'ovh');--> statement-breakpoint
CREATE TYPE "public"."VaultProviderType" AS ENUM('hashicorp', 'infisical', 'aws', 'aws-parameter-store', 'doppler', 'azure', 'scaleway', 'phase');--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "dns_provider" (
	"dnsProviderId" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"providerType" "DnsProviderType" NOT NULL,
	"config" jsonb NOT NULL,
	"organizationId" text NOT NULL,
	"createdAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vault_provider" (
	"vaultProviderId" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"providerType" "VaultProviderType" NOT NULL,
	"config" jsonb NOT NULL,
	"assignments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"organizationId" text NOT NULL,
	"createdAt" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webServerSettings" ALTER COLUMN "whitelabelingConfig" SET DEFAULT '{"appName":null,"appDescription":null,"logoUrl":null,"faviconUrl":null,"customCss":null,"loginLogoUrl":null,"supportUrl":null,"docsUrl":null,"errorPageTitle":null,"errorPageDescription":null,"footerText":null,"ogImageUrl":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "default_role" text;--> statement-breakpoint
ALTER TABLE "compose" ADD COLUMN "createEnvFile" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "compose" ADD COLUMN "pullImages" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "github" ADD COLUMN "githubUrl" text DEFAULT 'https://github.com' NOT NULL;--> statement-breakpoint
ALTER TABLE "network" ADD COLUMN "dockerId" text;--> statement-breakpoint
ALTER TABLE "network" ADD COLUMN "mtu" integer;--> statement-breakpoint
ALTER TABLE "sso_provider" ADD COLUMN "domain_verified" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboardingCompletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dns_provider" ADD CONSTRAINT "dns_provider_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_provider" ADD CONSTRAINT "vault_provider_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dns_provider_org_name_idx" ON "dns_provider" USING btree ("organizationId","name");--> statement-breakpoint
CREATE UNIQUE INDEX "vault_provider_org_name_idx" ON "vault_provider" USING btree ("organizationId","name");;--> statement-breakpoint
-- Grant "server.terminal" to custom roles that already have "server.read", which is
-- what surfaced the terminal in the UI before the permission existed.
UPDATE "organization_role" AS r
SET "permission" = jsonb_set(
	r."permission"::jsonb,
	'{server}',
	(r."permission"::jsonb->'server') || '["terminal"]'::jsonb
)::text
WHERE jsonb_typeof(r."permission"::jsonb->'server') = 'array'
AND r."permission"::jsonb->'server' @> '["read"]'::jsonb
AND NOT r."permission"::jsonb->'server' @> '["terminal"]'::jsonb;--> statement-breakpoint
-- Backfill only, so existing users skip the onboarding wizard; new users keep NULL.
UPDATE "user" SET "onboardingCompletedAt" = now() WHERE "onboardingCompletedAt" IS NULL;
