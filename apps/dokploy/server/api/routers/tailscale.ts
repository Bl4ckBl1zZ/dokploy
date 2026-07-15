import { db } from "@dokploy/server/db";
import {
	apiConfirmTailscaleRetag,
	apiConnectTailscale,
	apiInspectTailscaleGateway,
	apiReconcileTailscale,
	apiUpdateTailscaleTranslatedCidr,
	server,
	tailscaleConfig,
} from "@dokploy/server/db/schema";
import { checkPermission } from "@dokploy/server/services/permission";
import {
	cidrsOverlap,
	parseIpv4Cidr,
	selectOrganizationTranslatedCidr,
} from "@dokploy/server/services/tailscale/cidr";
import { createTailscaleClient } from "@dokploy/server/services/tailscale/client";
import { discoverKnownNetworkCidrs } from "@dokploy/server/services/tailscale/data-plane";
import {
	confirmTailscaleGatewayRetag,
	disconnectTailscale,
	findTailscaleConfigForOrg,
	listTailscaleState,
	provisionTailscaleGateway,
	purgeTailscale,
	reconcileTailscaleOrganization,
} from "@dokploy/server/services/tailscale/orchestrator";
import {
	inspectPanelTailscaleClient,
	inspectTailscaleClient,
} from "@dokploy/server/setup/tailscale-setup";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";

const toTrpcError = (error: unknown) =>
	new TRPCError({
		code: "BAD_REQUEST",
		message:
			error instanceof Error ? error.message : "Tailscale operation failed",
		cause: error,
	});

export const tailscaleRouter = createTRPCRouter({
	getConfig: withPermission("tailscale", "read").query(async ({ ctx }) => {
		const config = await findTailscaleConfigForOrg(
			ctx.session.activeOrganizationId,
		);
		if (!config) return null;
		const { oauthClientSecret, ...safe } = config;
		return { ...safe, hasSecret: Boolean(oauthClientSecret) };
	}),

	validate: withPermission("tailscale", "read")
		.input(apiConnectTailscale)
		.mutation(async ({ input }) => {
			try {
				return await createTailscaleClient(input).validateCredentials();
			} catch (error) {
				throw toTrpcError(error);
			}
		}),

	connect: protectedProcedure
		.input(apiConnectTailscale)
		.mutation(async ({ ctx, input }) => {
			const organizationId = ctx.session.activeOrganizationId;
			const existing = await findTailscaleConfigForOrg(organizationId);
			await checkPermission(ctx, {
				tailscale: [existing ? "update" : "create"],
			});
			if (existing && existing.tailnet !== input.tailnet) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Changing tailnets requires purging the retained Tailscale state first.",
				});
			}
			try {
				const validation =
					await createTailscaleClient(input).validateCredentials();
				const organizationServers = await db.query.server.findMany({
					where: eq(server.organizationId, organizationId),
					columns: { serverId: true },
				});
				const allocatedCidrs = await db.query.tailscaleConfig.findMany({
					where: (config, { ne }) => ne(config.organizationId, organizationId),
					columns: { translatedCidr: true },
				});
				const knownCidrs = await discoverKnownNetworkCidrs([
					null,
					...organizationServers.map((entry) => entry.serverId),
				]);
				knownCidrs.push(
					...allocatedCidrs
						.map((entry) => entry.translatedCidr)
						.filter((entry): entry is string => Boolean(entry)),
				);
				const translatedCidr =
					existing?.translatedCidr ??
					selectOrganizationTranslatedCidr(knownCidrs, organizationId);
				const cidrError = translatedCidr
					? null
					: "All managed private address pools overlap known routes or Docker networks. Set a non-conflicting translated CIDR to enable private routing.";
				const now = new Date().toISOString();
				if (existing) {
					await db
						.update(tailscaleConfig)
						.set({
							tailnet: input.tailnet,
							dnsSuffix: input.dnsSuffix,
							oauthClientId: input.oauthClientId,
							oauthClientSecret: input.oauthClientSecret,
							deviceTag: input.deviceTag,
							enabled: true,
							translatedCidr,
							lastError: cidrError,
							verifiedAt: now,
							updatedAt: now,
						})
						.where(
							eq(tailscaleConfig.tailscaleConfigId, existing.tailscaleConfigId),
						);
				} else {
					await db.insert(tailscaleConfig).values({
						organizationId,
						tailnet: input.tailnet,
						dnsSuffix: input.dnsSuffix,
						oauthClientId: input.oauthClientId,
						oauthClientSecret: input.oauthClientSecret,
						deviceTag: input.deviceTag,
						enabled: true,
						translatedCidr,
						lastError: cidrError,
						verifiedAt: now,
					});
				}
				const reconciliation = await reconcileTailscaleOrganization(
					organizationId,
				).catch(async (error) => {
					const message =
						error instanceof Error
							? error.message
							: "Initial reconciliation failed";
					await db
						.update(tailscaleConfig)
						.set({ lastError: message.slice(0, 1000) })
						.where(eq(tailscaleConfig.organizationId, organizationId));
					return { gateways: 0, endpoints: 0, status: "degraded" as const };
				});
				return { ok: true, validation, reconciliation };
			} catch (error) {
				throw toTrpcError(error);
			}
		}),

	inspectGateway: withPermission("tailscale", "read")
		.input(apiInspectTailscaleGateway)
		.query(async ({ ctx, input }) => {
			if (!input.serverId) {
				return inspectPanelTailscaleClient(ctx.session.activeOrganizationId);
			}
			const row = await db.query.server.findFirst({
				where: and(
					eq(server.serverId, input.serverId),
					eq(server.organizationId, ctx.session.activeOrganizationId),
				),
			});
			if (!row)
				throw new TRPCError({ code: "NOT_FOUND", message: "Server not found" });
			return inspectTailscaleClient(input.serverId);
		}),

	provisionGateway: withPermission("tailscale", "update")
		.input(apiInspectTailscaleGateway)
		.mutation(({ ctx, input }) =>
			provisionTailscaleGateway(
				ctx.session.activeOrganizationId,
				input.serverId ?? null,
			),
		),

	confirmRetag: withPermission("tailscale", "update")
		.input(apiConfirmTailscaleRetag)
		.mutation(({ ctx, input }) =>
			confirmTailscaleGatewayRetag(
				ctx.session.activeOrganizationId,
				input.tailscaleGatewayId,
			),
		),

	reconcile: withPermission("tailscale", "update")
		.input(apiReconcileTailscale)
		.mutation(({ ctx, input }) =>
			reconcileTailscaleOrganization(ctx.session.activeOrganizationId, input),
		),

	list: withPermission("tailscale", "read").query(({ ctx }) =>
		listTailscaleState(ctx.session.activeOrganizationId),
	),

	updateTranslatedCidr: withPermission("tailscale", "update")
		.input(apiUpdateTailscaleTranslatedCidr)
		.mutation(async ({ ctx, input }) => {
			try {
				parseIpv4Cidr(input.translatedCidr);
			} catch (error) {
				throw toTrpcError(error);
			}
			const organizationServers = await db.query.server.findMany({
				where: eq(server.organizationId, ctx.session.activeOrganizationId),
				columns: { serverId: true },
			});
			const allocatedCidrs = await db.query.tailscaleConfig.findMany({
				where: (config, { ne }) =>
					ne(config.organizationId, ctx.session.activeOrganizationId),
				columns: { translatedCidr: true },
			});
			const knownCidrs = await discoverKnownNetworkCidrs([
				null,
				...organizationServers.map((entry) => entry.serverId),
			]);
			knownCidrs.push(
				...allocatedCidrs
					.map((entry) => entry.translatedCidr)
					.filter((entry): entry is string => Boolean(entry)),
			);
			if (
				knownCidrs.some((known) => cidrsOverlap(input.translatedCidr, known))
			) {
				throw new TRPCError({
					code: "CONFLICT",
					message:
						"The translated CIDR overlaps a known server route or Docker network",
				});
			}
			const [updated] = await db
				.update(tailscaleConfig)
				.set({ translatedCidr: input.translatedCidr, lastError: null })
				.where(
					eq(tailscaleConfig.organizationId, ctx.session.activeOrganizationId),
				)
				.returning({ translatedCidr: tailscaleConfig.translatedCidr });
			if (!updated)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tailscale is not configured",
				});
			return updated;
		}),

	disconnect: withPermission("tailscale", "delete").mutation(({ ctx }) =>
		disconnectTailscale(ctx.session.activeOrganizationId),
	),

	purge: withPermission("tailscale", "delete").mutation(({ ctx }) =>
		purgeTailscale(ctx.session.activeOrganizationId),
	),
});
