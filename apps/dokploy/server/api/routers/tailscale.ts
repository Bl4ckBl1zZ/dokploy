import { db } from "@dokploy/server/db";
import {
	apiConfirmTailscaleRetag,
	apiConnectTailscale,
	apiInspectTailscaleGateway,
	apiReconcileTailscale,
	apiUpdateTailscaleTranslatedCidr,
	server,
} from "@dokploy/server/db/schema";
import { checkPermission } from "@dokploy/server/services/permission";
import { createTailscaleClient } from "@dokploy/server/services/tailscale/client";
import {
	connectTailscaleOrganization,
	updateTailscaleTranslatedCidr,
} from "@dokploy/server/services/tailscale/configuration";
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
	error instanceof TRPCError
		? error
		: new TRPCError({
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
				return await createTailscaleClient({
					...input,
					deviceTag: input.deviceTag ?? "tag:dokploy",
				}).validateCredentials();
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
			try {
				return await connectTailscaleOrganization(organizationId, input);
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
				return await updateTailscaleTranslatedCidr(
					ctx.session.activeOrganizationId,
					input.translatedCidr,
				);
			} catch (error) {
				throw toTrpcError(error);
			}
		}),

	disconnect: withPermission("tailscale", "delete").mutation(({ ctx }) =>
		disconnectTailscale(ctx.session.activeOrganizationId),
	),

	purge: withPermission("tailscale", "delete").mutation(({ ctx }) =>
		purgeTailscale(ctx.session.activeOrganizationId),
	),
});
