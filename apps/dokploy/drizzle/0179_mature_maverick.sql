CREATE TYPE "public"."tailscaleGatewayLocation" AS ENUM('panel', 'server', 'build');--> statement-breakpoint
CREATE TYPE "public"."tailscaleGatewayOwnership" AS ENUM('managed', 'adopted', 'parallel', 'pending_retag');--> statement-breakpoint
CREATE TYPE "public"."tailscaleResourceType" AS ENUM('application', 'compose', 'postgres', 'mysql', 'mariadb', 'mongo', 'redis', 'libsql', 'preview');--> statement-breakpoint
CREATE TYPE "public"."tailscaleStatus" AS ENUM('pending', 'provisioning', 'ready', 'degraded', 'offline', 'disabled');--> statement-breakpoint
CREATE TABLE "tailscale_config" (
	"tailscaleConfigId" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"tailnet" text NOT NULL,
	"dnsSuffix" text NOT NULL,
	"oauthClientId" text NOT NULL,
	"oauthClientSecret" text NOT NULL,
	"deviceTag" text DEFAULT 'tag:dokploy' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"translatedCidr" text,
	"lastError" text,
	"verifiedAt" text,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailscale_endpoint" (
	"tailscaleEndpointId" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"projectId" text NOT NULL,
	"resourceType" "tailscaleResourceType" NOT NULL,
	"resourceId" text NOT NULL,
	"composeService" text,
	"ownerKey" text NOT NULL,
	"referenceKey" text NOT NULL,
	"readableName" text NOT NULL,
	"serviceName" text NOT NULL,
	"fqdn" text NOT NULL,
	"translatedIp" text,
	"status" "tailscaleStatus" DEFAULT 'pending' NOT NULL,
	"lastError" text,
	"warning" text,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailscale_endpoint_port" (
	"tailscaleEndpointPortId" text PRIMARY KEY NOT NULL,
	"tailscaleEndpointId" text NOT NULL,
	"targetPort" integer NOT NULL,
	"scheme" text DEFAULT 'tcp' NOT NULL,
	"secret" boolean DEFAULT false NOT NULL,
	"composeService" text,
	"createdAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailscale_gateway" (
	"tailscaleGatewayId" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"serverId" text,
	"gatewayKey" text NOT NULL,
	"location" "tailscaleGatewayLocation" NOT NULL,
	"ownership" "tailscaleGatewayOwnership" DEFAULT 'managed' NOT NULL,
	"deviceId" text,
	"deviceName" text,
	"statePath" text,
	"socketPath" text,
	"interfaceName" text,
	"unitName" text,
	"networkNamespace" text,
	"installSource" text,
	"version" text,
	"tailnet" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"serveConfig" text,
	"status" "tailscaleStatus" DEFAULT 'pending' NOT NULL,
	"lastError" text,
	"checkedAt" text,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailscale_endpoint_host" (
	"tailscaleEndpointHostId" text PRIMARY KEY NOT NULL,
	"tailscaleEndpointId" text NOT NULL,
	"tailscaleGatewayId" text NOT NULL,
	"advertised" boolean DEFAULT false NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"status" "tailscaleStatus" DEFAULT 'pending' NOT NULL,
	"lastError" text,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "tailscalePreviewEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tailscale_config" ADD CONSTRAINT "tailscale_config_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_endpoint" ADD CONSTRAINT "tailscale_endpoint_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_endpoint" ADD CONSTRAINT "tailscale_endpoint_projectId_project_projectId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("projectId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_endpoint_port" ADD CONSTRAINT "tailscale_endpoint_port_tailscaleEndpointId_tailscale_endpoint_tailscaleEndpointId_fk" FOREIGN KEY ("tailscaleEndpointId") REFERENCES "public"."tailscale_endpoint"("tailscaleEndpointId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_gateway" ADD CONSTRAINT "tailscale_gateway_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_gateway" ADD CONSTRAINT "tailscale_gateway_serverId_server_serverId_fk" FOREIGN KEY ("serverId") REFERENCES "public"."server"("serverId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_endpoint_host" ADD CONSTRAINT "tailscale_endpoint_host_tailscaleEndpointId_tailscale_endpoint_tailscaleEndpointId_fk" FOREIGN KEY ("tailscaleEndpointId") REFERENCES "public"."tailscale_endpoint"("tailscaleEndpointId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailscale_endpoint_host" ADD CONSTRAINT "tailscale_endpoint_host_tailscaleGatewayId_tailscale_gateway_tailscaleGatewayId_fk" FOREIGN KEY ("tailscaleGatewayId") REFERENCES "public"."tailscale_gateway"("tailscaleGatewayId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_config_organizationId_unique" ON "tailscale_config" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_endpoint_serviceName_unique" ON "tailscale_endpoint" USING btree ("serviceName");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_endpoint_owner_key_unique" ON "tailscale_endpoint" USING btree ("ownerKey");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_endpoint_org_reference_unique" ON "tailscale_endpoint" USING btree ("organizationId","referenceKey");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_endpoint_port_endpoint_target_unique" ON "tailscale_endpoint_port" USING btree ("tailscaleEndpointId","targetPort");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_gateway_key_unique" ON "tailscale_gateway" USING btree ("gatewayKey");--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_gateway_org_location_panel_unique" ON "tailscale_gateway" USING btree ("organizationId","location") WHERE "tailscale_gateway"."serverId" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_gateway_org_server_location_unique" ON "tailscale_gateway" USING btree ("organizationId","serverId","location") WHERE "tailscale_gateway"."serverId" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "tailscale_endpoint_host_unique" ON "tailscale_endpoint_host" USING btree ("tailscaleEndpointId","tailscaleGatewayId");
