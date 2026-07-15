import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { z } from "zod";
import { organization } from "./account";
import { projects } from "./project";
import { server } from "./server";
import { encryptedText } from "./utils";

export const tailscaleGatewayLocation = pgEnum("tailscaleGatewayLocation", [
	"panel",
	"server",
	"build",
]);

export const tailscaleGatewayOwnership = pgEnum("tailscaleGatewayOwnership", [
	"managed",
	"adopted",
	"parallel",
	"pending_retag",
]);

export const tailscaleStatus = pgEnum("tailscaleStatus", [
	"pending",
	"provisioning",
	"ready",
	"degraded",
	"offline",
	"disabled",
]);

export const tailscaleResourceType = pgEnum("tailscaleResourceType", [
	"application",
	"compose",
	"postgres",
	"mysql",
	"mariadb",
	"mongo",
	"redis",
	"libsql",
	"preview",
]);

export const tailscaleConfig = pgTable(
	"tailscale_config",
	{
		tailscaleConfigId: text("tailscaleConfigId")
			.notNull()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		tailnet: text("tailnet").notNull(),
		dnsSuffix: text("dnsSuffix").notNull(),
		oauthClientId: text("oauthClientId").notNull(),
		oauthClientSecret: encryptedText("oauthClientSecret").notNull(),
		deviceTag: text("deviceTag").notNull().default("tag:dokploy"),
		enabled: boolean("enabled").notNull().default(true),
		translatedCidr: text("translatedCidr"),
		lastError: text("lastError"),
		verifiedAt: text("verifiedAt"),
		createdAt: text("createdAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updatedAt: text("updatedAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("tailscale_config_organizationId_unique").on(
			table.organizationId,
		),
	],
);

export const tailscaleGateway = pgTable(
	"tailscale_gateway",
	{
		tailscaleGatewayId: text("tailscaleGatewayId")
			.notNull()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		serverId: text("serverId").references(() => server.serverId, {
			onDelete: "cascade",
		}),
		gatewayKey: text("gatewayKey").notNull(),
		location: tailscaleGatewayLocation("location").notNull(),
		ownership: tailscaleGatewayOwnership("ownership")
			.notNull()
			.default("managed"),
		deviceId: text("deviceId"),
		deviceName: text("deviceName"),
		statePath: text("statePath"),
		socketPath: text("socketPath"),
		interfaceName: text("interfaceName"),
		unitName: text("unitName"),
		networkNamespace: text("networkNamespace"),
		installSource: text("installSource"),
		version: text("version"),
		tailnet: text("tailnet"),
		tags: text("tags").array().notNull().default([]),
		serveConfig: text("serveConfig"),
		status: tailscaleStatus("status").notNull().default("pending"),
		lastError: text("lastError"),
		checkedAt: text("checkedAt"),
		createdAt: text("createdAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updatedAt: text("updatedAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("tailscale_gateway_key_unique").on(table.gatewayKey),
		uniqueIndex("tailscale_gateway_org_server_location_unique").on(
			table.organizationId,
			table.serverId,
			table.location,
		),
	],
);

export const tailscaleEndpoint = pgTable(
	"tailscale_endpoint",
	{
		tailscaleEndpointId: text("tailscaleEndpointId")
			.notNull()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		projectId: text("projectId")
			.notNull()
			.references(() => projects.projectId, { onDelete: "cascade" }),
		resourceType: tailscaleResourceType("resourceType").notNull(),
		resourceId: text("resourceId").notNull(),
		composeService: text("composeService"),
		ownerKey: text("ownerKey").notNull(),
		referenceKey: text("referenceKey").notNull(),
		readableName: text("readableName").notNull(),
		serviceName: text("serviceName").notNull(),
		fqdn: text("fqdn").notNull(),
		translatedIp: text("translatedIp"),
		status: tailscaleStatus("status").notNull().default("pending"),
		lastError: text("lastError"),
		warning: text("warning"),
		createdAt: text("createdAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updatedAt: text("updatedAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("tailscale_endpoint_serviceName_unique").on(table.serviceName),
		uniqueIndex("tailscale_endpoint_owner_key_unique").on(table.ownerKey),
		uniqueIndex("tailscale_endpoint_org_reference_unique").on(
			table.organizationId,
			table.referenceKey,
		),
	],
);

export const tailscaleEndpointPort = pgTable(
	"tailscale_endpoint_port",
	{
		tailscaleEndpointPortId: text("tailscaleEndpointPortId")
			.notNull()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		tailscaleEndpointId: text("tailscaleEndpointId")
			.notNull()
			.references(() => tailscaleEndpoint.tailscaleEndpointId, {
				onDelete: "cascade",
			}),
		targetPort: integer("targetPort").notNull(),
		scheme: text("scheme").notNull().default("tcp"),
		secret: boolean("secret").notNull().default(false),
		composeService: text("composeService"),
		createdAt: text("createdAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("tailscale_endpoint_port_endpoint_target_unique").on(
			table.tailscaleEndpointId,
			table.targetPort,
		),
	],
);

export const tailscaleEndpointHost = pgTable(
	"tailscale_endpoint_host",
	{
		tailscaleEndpointHostId: text("tailscaleEndpointHostId")
			.notNull()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		tailscaleEndpointId: text("tailscaleEndpointId")
			.notNull()
			.references(() => tailscaleEndpoint.tailscaleEndpointId, {
				onDelete: "cascade",
			}),
		tailscaleGatewayId: text("tailscaleGatewayId")
			.notNull()
			.references(() => tailscaleGateway.tailscaleGatewayId, {
				onDelete: "cascade",
			}),
		advertised: boolean("advertised").notNull().default(false),
		approved: boolean("approved").notNull().default(false),
		status: tailscaleStatus("status").notNull().default("pending"),
		lastError: text("lastError"),
		updatedAt: text("updatedAt")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("tailscale_endpoint_host_unique").on(
			table.tailscaleEndpointId,
			table.tailscaleGatewayId,
		),
	],
);

export const tailscaleConfigRelations = relations(
	tailscaleConfig,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [tailscaleConfig.organizationId],
			references: [organization.id],
		}),
		gateways: many(tailscaleGateway, {
			relationName: "tailscaleConfigGateways",
		}),
		endpoints: many(tailscaleEndpoint, {
			relationName: "tailscaleConfigEndpoints",
		}),
	}),
);

export const tailscaleGatewayRelations = relations(
	tailscaleGateway,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [tailscaleGateway.organizationId],
			references: [organization.id],
		}),
		config: one(tailscaleConfig, {
			fields: [tailscaleGateway.organizationId],
			references: [tailscaleConfig.organizationId],
			relationName: "tailscaleConfigGateways",
		}),
		server: one(server, {
			fields: [tailscaleGateway.serverId],
			references: [server.serverId],
		}),
		hosts: many(tailscaleEndpointHost),
	}),
);

export const tailscaleEndpointRelations = relations(
	tailscaleEndpoint,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [tailscaleEndpoint.organizationId],
			references: [organization.id],
		}),
		config: one(tailscaleConfig, {
			fields: [tailscaleEndpoint.organizationId],
			references: [tailscaleConfig.organizationId],
			relationName: "tailscaleConfigEndpoints",
		}),
		project: one(projects, {
			fields: [tailscaleEndpoint.projectId],
			references: [projects.projectId],
		}),
		ports: many(tailscaleEndpointPort),
		hosts: many(tailscaleEndpointHost),
	}),
);

export const tailscaleEndpointPortRelations = relations(
	tailscaleEndpointPort,
	({ one }) => ({
		endpoint: one(tailscaleEndpoint, {
			fields: [tailscaleEndpointPort.tailscaleEndpointId],
			references: [tailscaleEndpoint.tailscaleEndpointId],
		}),
	}),
);

export const tailscaleEndpointHostRelations = relations(
	tailscaleEndpointHost,
	({ one }) => ({
		endpoint: one(tailscaleEndpoint, {
			fields: [tailscaleEndpointHost.tailscaleEndpointId],
			references: [tailscaleEndpoint.tailscaleEndpointId],
		}),
		gateway: one(tailscaleGateway, {
			fields: [tailscaleEndpointHost.tailscaleGatewayId],
			references: [tailscaleGateway.tailscaleGatewayId],
		}),
	}),
);

export const apiConnectTailscale = z.object({
	tailnet: z.string().trim().min(1),
	dnsSuffix: z
		.string()
		.trim()
		.toLowerCase()
		.regex(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.ts\.net$/),
	oauthClientId: z.string().trim().min(1),
	oauthClientSecret: z.string().min(1),
	deviceTag: z
		.string()
		.trim()
		.toLowerCase()
		.regex(/^tag:[a-z0-9][a-z0-9-]*$/)
		.default("tag:dokploy"),
});

export const apiInspectTailscaleGateway = z.object({
	serverId: z.string().min(1).nullable().optional(),
});

export const apiConfirmTailscaleRetag = z.object({
	tailscaleGatewayId: z.string().min(1),
});

export const apiReconcileTailscale = z.object({
	serverId: z.string().min(1).nullable().optional(),
	tailscaleEndpointId: z.string().min(1).optional(),
});

export const apiUpdateTailscaleTranslatedCidr = z.object({
	translatedCidr: z.string().trim().min(1),
});
