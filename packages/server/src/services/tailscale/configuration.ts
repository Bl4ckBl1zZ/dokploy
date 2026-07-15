import { db } from "@dokploy/server/db";
import {
	type apiConnectTailscale,
	server,
	tailscaleConfig,
} from "@dokploy/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import {
	cidrsOverlap,
	parseIpv4Cidr,
	selectOrganizationTranslatedCidr,
} from "./cidr";
import { createTailscaleClient } from "./client";
import { discoverKnownNetworkCidrs } from "./data-plane";
import {
	findTailscaleConfigForOrg,
	reconcileTailscaleOrganization,
} from "./orchestrator";

type ConnectTailscaleInput = z.infer<typeof apiConnectTailscale>;

const discoverUnavailableCidrs = async (organizationId: string) => {
	const [organizationServers, allocatedCidrs] = await Promise.all([
		db.query.server.findMany({
			where: eq(server.organizationId, organizationId),
			columns: { serverId: true },
		}),
		db.query.tailscaleConfig.findMany({
			where: (config, { ne }) => ne(config.organizationId, organizationId),
			columns: { translatedCidr: true },
		}),
	]);
	const knownCidrs = await discoverKnownNetworkCidrs([
		null,
		...organizationServers.map((entry) => entry.serverId),
	]);
	knownCidrs.push(
		...allocatedCidrs
			.map((entry) => entry.translatedCidr)
			.filter((entry): entry is string => Boolean(entry)),
	);
	return knownCidrs;
};

export const connectTailscaleOrganization = async (
	organizationId: string,
	input: ConnectTailscaleInput,
) => {
	const existing = await findTailscaleConfigForOrg(organizationId);
	if (existing && existing.tailnet !== input.tailnet) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message:
				"Changing tailnets requires purging the retained Tailscale state first.",
		});
	}

	const deviceTag = input.deviceTag ?? "tag:dokploy";
	const validation = await createTailscaleClient({
		...input,
		deviceTag,
	}).validateCredentials();
	const knownCidrs = await discoverUnavailableCidrs(organizationId);
	const translatedCidr =
		existing?.translatedCidr ??
		selectOrganizationTranslatedCidr(knownCidrs, organizationId);
	const cidrError = translatedCidr
		? null
		: "All managed private address pools overlap known routes or Docker networks. Set a non-conflicting translated CIDR to enable private routing.";
	const now = new Date().toISOString();
	const values = {
		tailnet: input.tailnet,
		dnsSuffix: input.dnsSuffix,
		oauthClientId: input.oauthClientId,
		oauthClientSecret: input.oauthClientSecret,
		deviceTag,
		enabled: true,
		translatedCidr,
		lastError: cidrError,
		verifiedAt: now,
		updatedAt: now,
	};
	if (existing) {
		await db
			.update(tailscaleConfig)
			.set(values)
			.where(eq(tailscaleConfig.tailscaleConfigId, existing.tailscaleConfigId));
	} else {
		await db.insert(tailscaleConfig).values({ organizationId, ...values });
	}

	const reconciliation = cidrError
		? { gateways: 0, endpoints: 0, status: "degraded" as const }
		: await reconcileTailscaleOrganization(organizationId).catch(
				async (error) => {
					const message =
						error instanceof Error
							? error.message
							: "Initial reconciliation failed";
					await db
						.update(tailscaleConfig)
						.set({ lastError: message.slice(0, 1000) })
						.where(eq(tailscaleConfig.organizationId, organizationId));
					return { gateways: 0, endpoints: 0, status: "degraded" as const };
				},
			);
	return { ok: true, validation, reconciliation };
};

export const updateTailscaleTranslatedCidr = async (
	organizationId: string,
	translatedCidr: string,
) => {
	parseIpv4Cidr(translatedCidr);
	const knownCidrs = await discoverUnavailableCidrs(organizationId);
	if (knownCidrs.some((known) => cidrsOverlap(translatedCidr, known))) {
		throw new TRPCError({
			code: "CONFLICT",
			message:
				"The translated CIDR overlaps a known server route or Docker network",
		});
	}
	const [updated] = await db
		.update(tailscaleConfig)
		.set({ translatedCidr, lastError: null })
		.where(eq(tailscaleConfig.organizationId, organizationId))
		.returning({ translatedCidr: tailscaleConfig.translatedCidr });
	if (!updated) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Tailscale is not configured",
		});
	}
	return updated;
};
