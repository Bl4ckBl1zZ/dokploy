import { db } from "@dokploy/server/db";
import {
	server,
	tailscaleConfig,
	tailscaleEndpoint,
	tailscaleEndpointHost,
	tailscaleEndpointPort,
	tailscaleGateway,
} from "@dokploy/server/db/schema";
import {
	advertisePanelTailscaleService,
	advertiseTailscaleService,
	applyPanelTailscaleServeConfig,
	applyTailscaleServeConfig,
	compareTailscaleVersions,
	decideTailscaleClientMode,
	enrollNativeTailscaleClient,
	inspectPanelTailscaleClient,
	inspectTailscaleClient,
	MINIMUM_TAILSCALE_SERVICES_VERSION,
	panelTailscaleContainerName,
	purgeTailscaleGatewayClient,
	setupIsolatedTailscaleClient,
	setupPanelTailscaleClient,
	type TailscaleInspection,
	upgradeTailscalePackage,
} from "@dokploy/server/setup/tailscale-setup";
import { and, eq, inArray } from "drizzle-orm";
import { allocateTranslatedIp } from "./cidr";
import { createTailscaleClient } from "./client";
import {
	attachTailscaleSourceWorkload,
	ensureTailscaleEndpointProxies,
	ensureTailscaleOrganizationNetwork,
	ensureTailscaleSourceProxy,
	purgeTailscaleOrganizationNetwork,
	removeTailscaleEndpointProxies,
	verifyTailscaleSourceEndpoint,
} from "./data-plane";
import {
	buildDesiredTailscaleEndpoints,
	type DesiredEndpoint,
	type DesiredResource,
} from "./desired-state";

const DEFAULT_NATIVE_SOCKET = "/var/run/tailscale/tailscaled.sock";
const locks = new Map<string, Promise<unknown>>();
const organizationLifecycleLockKey = (organizationId: string) =>
	`reconcile:${organizationId}`;

const errorMessage = (error: unknown): string =>
	(error instanceof Error ? error.message : String(error)).slice(0, 1000);

const withLock = async <T>(
	key: string,
	operation: () => Promise<T>,
): Promise<T> => {
	const previous = locks.get(key) ?? Promise.resolve();
	let release: () => void = () => undefined;
	const current = new Promise<void>((resolve) => {
		release = resolve;
	});
	const queued = previous.catch(() => undefined).then(() => current);
	locks.set(key, queued);
	await previous.catch(() => undefined);
	try {
		return await operation();
	} finally {
		release();
		if (locks.get(key) === queued) locks.delete(key);
	}
};

export const findTailscaleConfigForOrg = (organizationId: string) =>
	db.query.tailscaleConfig.findFirst({
		where: eq(tailscaleConfig.organizationId, organizationId),
	});

const gatewayKey = (organizationId: string, serverId: string | null) =>
	`${organizationId}:${serverId ?? "panel"}`;

const ensureGatewayRecord = async (input: {
	organizationId: string;
	serverId: string | null;
	location: "panel" | "server" | "build";
}) => {
	const key = gatewayKey(input.organizationId, input.serverId);
	const existing = await db.query.tailscaleGateway.findFirst({
		where: eq(tailscaleGateway.gatewayKey, key),
	});
	if (existing) return existing;
	const [created] = await db
		.insert(tailscaleGateway)
		.values({
			organizationId: input.organizationId,
			serverId: input.serverId,
			gatewayKey: key,
			location: input.location,
			ownership: input.location === "panel" ? "parallel" : "managed",
		})
		.returning();
	if (!created) throw new Error("Failed to create Tailscale gateway record");
	return created;
};

const updateGatewayInspection = async (
	gatewayId: string,
	inspection: TailscaleInspection,
	state?: Partial<typeof tailscaleGateway.$inferInsert>,
) => {
	const now = new Date().toISOString();
	await db
		.update(tailscaleGateway)
		.set({
			deviceId: inspection.deviceId,
			deviceName: inspection.dnsName,
			version: inspection.version,
			tailnet: inspection.tailnet,
			tags: inspection.tags,
			installSource: inspection.installSource,
			serveConfig: inspection.serveConfig
				? JSON.stringify(inspection.serveConfig)
				: null,
			checkedAt: now,
			updatedAt: now,
			...state,
		})
		.where(eq(tailscaleGateway.tailscaleGatewayId, gatewayId));
};

export const provisionTailscaleGateway = async (
	organizationId: string,
	serverId: string | null,
	onData?: (data: string) => void,
) =>
	withLock(`gateway:${gatewayKey(organizationId, serverId)}`, async () => {
		const config = await findTailscaleConfigForOrg(organizationId);
		if (!config?.enabled || !config.oauthClientSecret) {
			onData?.(
				"Tailscale is not configured for this organization — skipping.\n",
			);
			return null;
		}
		const serverRow = serverId
			? await db.query.server.findFirst({
					where: eq(server.serverId, serverId),
				})
			: null;
		if (serverId && serverRow?.organizationId !== organizationId) {
			throw new Error("Server does not belong to this organization");
		}
		const gateway = await ensureGatewayRecord({
			organizationId,
			serverId,
			location: !serverId
				? "panel"
				: serverRow?.serverType === "build"
					? "build"
					: "server",
		});
		await db
			.update(tailscaleGateway)
			.set({ status: "provisioning", lastError: null })
			.where(
				eq(tailscaleGateway.tailscaleGatewayId, gateway.tailscaleGatewayId),
			);

		const client = createTailscaleClient(config);
		try {
			if (!serverId) {
				let inspection = await inspectPanelTailscaleClient(organizationId);
				if (
					inspection.backendState !== "Running" ||
					inspection.tailnet !== config.tailnet ||
					!inspection.tags.includes(config.deviceTag)
				) {
					const authKey = await client.createAuthKey();
					inspection = await setupPanelTailscaleClient({
						organizationId,
						authKey: authKey.key,
						deviceTag: config.deviceTag,
						onData,
					});
				}
				await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
					ownership: "parallel",
					status: "ready",
					socketPath: inspection.socket,
					unitName: panelTailscaleContainerName(organizationId),
					lastError: null,
				});
				onData?.("Panel Tailscale gateway ready ✅\n");
				return { ...gateway, status: "ready" as const, inspection };
			}

			let inspection = await inspectTailscaleClient(
				serverId,
				gateway.ownership === "parallel" && gateway.socketPath
					? gateway.socketPath
					: undefined,
			);
			if (
				inspection.binary &&
				inspection.installSource !== "unknown" &&
				inspection.installSource !== "docker" &&
				compareTailscaleVersions(
					inspection.version,
					MINIMUM_TAILSCALE_SERVICES_VERSION,
				) < 0
			) {
				onData?.(
					`Upgrading Tailscale to ${MINIMUM_TAILSCALE_SERVICES_VERSION} or later…\n`,
				);
				await upgradeTailscalePackage(
					serverId,
					inspection.installSource,
					onData,
				);
				inspection = await inspectTailscaleClient(
					serverId,
					gateway.ownership === "parallel" && gateway.socketPath
						? gateway.socketPath
						: undefined,
				);
			}
			if (
				gateway.ownership === "parallel" &&
				inspection.backendState === "Running" &&
				inspection.tailnet === config.tailnet &&
				inspection.tags.includes(config.deviceTag)
			) {
				await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
					ownership: "parallel",
					status: "ready",
					lastError: null,
				});
				onData?.("Isolated Tailscale gateway ready ✅\n");
				return { ...gateway, status: "ready" as const, inspection };
			}
			if (gateway.ownership === "parallel") {
				const authKey = await client.createAuthKey();
				const isolated = await setupIsolatedTailscaleClient({
					serverId,
					organizationId,
					gatewayKey: serverId,
					authKey: authKey.key,
					deviceTag: config.deviceTag,
					onData,
				});
				inspection = isolated.inspection;
				await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
					ownership: "parallel",
					status: "ready",
					statePath: isolated.paths.statePath,
					socketPath: isolated.paths.socketPath,
					interfaceName: isolated.paths.interfaceName,
					unitName: isolated.paths.unitName,
					networkNamespace: isolated.paths.networkNamespace,
					lastError: null,
				});
				return { ...gateway, status: "ready" as const, inspection };
			}
			const decision = decideTailscaleClientMode({
				inspection,
				tailnet: config.tailnet,
				deviceTag: config.deviceTag,
			});
			onData?.(`${decision.reason}.\n`);
			if (decision.mode === "degraded") throw new Error(decision.reason);
			if (decision.mode === "retag") {
				await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
					ownership: "pending_retag",
					status: "pending",
					lastError:
						"Administrator confirmation is required before changing this device to tag ownership.",
				});
				return { ...gateway, status: "pending" as const, inspection };
			}
			if (decision.mode === "install" || decision.mode === "enroll") {
				const authKey = await client.createAuthKey();
				inspection = await enrollNativeTailscaleClient({
					serverId,
					authKey: authKey.key,
					deviceTag: config.deviceTag,
					install: decision.mode === "install",
					onData,
				});
			}
			if (decision.mode === "parallel") {
				const authKey = await client.createAuthKey();
				const isolated = await setupIsolatedTailscaleClient({
					serverId,
					organizationId,
					gatewayKey: serverId,
					authKey: authKey.key,
					deviceTag: config.deviceTag,
					onData,
				});
				inspection = isolated.inspection;
				await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
					ownership: "parallel",
					status: "ready",
					statePath: isolated.paths.statePath,
					socketPath: isolated.paths.socketPath,
					interfaceName: isolated.paths.interfaceName,
					unitName: isolated.paths.unitName,
					networkNamespace: isolated.paths.networkNamespace,
					lastError: null,
				});
				return { ...gateway, status: "ready" as const, inspection };
			}

			await updateGatewayInspection(gateway.tailscaleGatewayId, inspection, {
				ownership: decision.ownership,
				status: "ready",
				socketPath: DEFAULT_NATIVE_SOCKET,
				lastError: null,
			});
			onData?.("Tailscale gateway ready ✅\n");
			return { ...gateway, status: "ready" as const, inspection };
		} catch (error) {
			const message = errorMessage(error);
			await db
				.update(tailscaleGateway)
				.set({
					status: "degraded",
					lastError: message,
					checkedAt: new Date().toISOString(),
				})
				.where(
					eq(tailscaleGateway.tailscaleGatewayId, gateway.tailscaleGatewayId),
				);
			onData?.(`Tailscale gateway degraded: ${message}\n`);
			throw error;
		}
	});

export const confirmTailscaleGatewayRetag = async (
	organizationId: string,
	tailscaleGatewayId: string,
) => {
	const gateway = await db.query.tailscaleGateway.findFirst({
		where: and(
			eq(tailscaleGateway.tailscaleGatewayId, tailscaleGatewayId),
			eq(tailscaleGateway.organizationId, organizationId),
		),
	});
	const config = await findTailscaleConfigForOrg(organizationId);
	if (!gateway || !config || gateway.ownership !== "pending_retag") {
		throw new Error("No pending Tailscale ownership change was found");
	}
	if (!gateway.deviceId)
		throw new Error("The Tailscale device ID is unavailable");
	const client = createTailscaleClient(config);
	await client.setDeviceTags(gateway.deviceId, [config.deviceTag]);
	await db
		.update(tailscaleGateway)
		.set({
			ownership: "adopted",
			status: "ready",
			tags: [config.deviceTag],
			lastError: null,
		})
		.where(eq(tailscaleGateway.tailscaleGatewayId, gateway.tailscaleGatewayId));
	return provisionTailscaleGateway(organizationId, gateway.serverId);
};

export const collectTailscaleResources = async (
	organizationId: string,
): Promise<DesiredResource[]> => {
	const projects = await db.query.projects.findMany({
		where: (project, { eq }) => eq(project.organizationId, organizationId),
		with: {
			environments: {
				with: {
					applications: {
						with: {
							ports: true,
							domains: true,
							previewDeployments: { with: { domain: true } },
						},
					},
					compose: { with: { domains: true } },
					postgres: true,
					mysql: true,
					mariadb: true,
					mongo: true,
					redis: true,
					libsql: true,
				},
			},
		},
	});
	const resources: DesiredResource[] = [];
	for (const project of projects) {
		for (const environment of project.environments) {
			const base = {
				organizationId,
				projectId: project.projectId,
				projectName: project.name,
				environmentName: environment.name,
			};
			for (const application of environment.applications) {
				resources.push({
					...base,
					resourceType: "application",
					resourceId: application.applicationId,
					name: application.name,
					appName: application.appName,
					serverId: application.serverId,
					status: application.applicationStatus,
					ports: application.ports,
					domains: application.domains,
				});
				if (application.tailscalePreviewEnabled) {
					for (const preview of application.previewDeployments) {
						resources.push({
							...base,
							resourceType: "preview",
							resourceId: preview.previewDeploymentId,
							name: application.name,
							appName: preview.appName,
							serverId: application.serverId,
							status: preview.previewStatus,
							previewPort: application.previewPort,
							domainPort: preview.domain?.port ?? null,
						});
					}
				}
			}
			for (const compose of environment.compose) {
				resources.push({
					...base,
					resourceType: "compose",
					resourceId: compose.composeId,
					name: compose.name,
					appName: compose.appName,
					serverId: compose.serverId,
					status: compose.composeStatus,
					composeFile: compose.composeFile,
					composeType: compose.composeType,
					isolatedDeployment: compose.isolatedDeployment,
					domains: compose.domains,
				});
			}
			const databases = [
				...environment.postgres.map((resource) => ({
					resourceType: "postgres" as const,
					resourceId: resource.postgresId,
					resource,
				})),
				...environment.mysql.map((resource) => ({
					resourceType: "mysql" as const,
					resourceId: resource.mysqlId,
					resource,
				})),
				...environment.mariadb.map((resource) => ({
					resourceType: "mariadb" as const,
					resourceId: resource.mariadbId,
					resource,
				})),
				...environment.mongo.map((resource) => ({
					resourceType: "mongo" as const,
					resourceId: resource.mongoId,
					resource,
				})),
				...environment.redis.map((resource) => ({
					resourceType: "redis" as const,
					resourceId: resource.redisId,
					resource,
				})),
				...environment.libsql.map((resource) => ({
					resourceType: "libsql" as const,
					resourceId: resource.libsqlId,
					resource,
				})),
			];
			for (const entry of databases) {
				resources.push({
					...base,
					resourceType: entry.resourceType,
					resourceId: entry.resourceId,
					name: entry.resource.name,
					appName: entry.resource.appName,
					serverId: entry.resource.serverId,
					status: entry.resource.applicationStatus,
				});
			}
		}
	}
	return resources;
};

const persistDesiredEndpoints = async (
	organizationId: string,
	desired: DesiredEndpoint[],
) => {
	const now = new Date().toISOString();
	const rows: Array<
		typeof tailscaleEndpoint.$inferSelect & { desired: DesiredEndpoint }
	> = [];
	for (const endpoint of desired) {
		const row = await db.transaction(async (tx) => {
			let persisted = await tx.query.tailscaleEndpoint.findFirst({
				where: eq(tailscaleEndpoint.ownerKey, endpoint.ownerKey),
			});
			if (!persisted) {
				[persisted] = await tx
					.insert(tailscaleEndpoint)
					.values({
						organizationId,
						projectId: endpoint.projectId,
						resourceType: endpoint.resourceType,
						resourceId: endpoint.resourceId,
						composeService: endpoint.composeService,
						ownerKey: endpoint.ownerKey,
						referenceKey: endpoint.referenceKey,
						readableName: endpoint.readableName,
						serviceName: endpoint.serviceName,
						fqdn: endpoint.fqdn,
						status: endpoint.status,
						warning: endpoint.warning,
					})
					.returning();
			} else {
				[persisted] = await tx
					.update(tailscaleEndpoint)
					.set({
						projectId: endpoint.projectId,
						referenceKey: endpoint.referenceKey,
						status: endpoint.status === "offline" ? "offline" : "provisioning",
						warning: endpoint.warning,
						lastError: null,
						updatedAt: now,
					})
					.where(
						eq(
							tailscaleEndpoint.tailscaleEndpointId,
							persisted.tailscaleEndpointId,
						),
					)
					.returning();
			}
			if (!persisted) throw new Error("Failed to persist Tailscale endpoint");
			await tx
				.delete(tailscaleEndpointPort)
				.where(
					eq(
						tailscaleEndpointPort.tailscaleEndpointId,
						persisted.tailscaleEndpointId,
					),
				);
			if (endpoint.ports.length) {
				await tx.insert(tailscaleEndpointPort).values(
					endpoint.ports.map((port) => ({
						tailscaleEndpointId: persisted.tailscaleEndpointId,
						targetPort: port.targetPort,
						scheme: port.scheme,
						secret: port.secret ?? false,
						composeService: port.composeService,
					})),
				);
			}
			return persisted;
		});
		rows.push({ ...row, desired: endpoint });
	}
	return rows;
};

const reconcileGatewayEndpoints = async (input: {
	organizationId: string;
	serverId: string | null;
	rows: Array<
		typeof tailscaleEndpoint.$inferSelect & { desired: DesiredEndpoint }
	>;
	config: NonNullable<Awaited<ReturnType<typeof findTailscaleConfigForOrg>>>;
	replaceAllManagedServices: boolean;
}) => {
	const gateway = await db.query.tailscaleGateway.findFirst({
		where: eq(
			tailscaleGateway.gatewayKey,
			gatewayKey(input.organizationId, input.serverId),
		),
	});
	if (!gateway || gateway.status !== "ready" || !gateway.deviceId) {
		return { failed: input.rows.length > 0 };
	}
	const client = createTailscaleClient(input.config);
	const inspection = input.serverId
		? await inspectTailscaleClient(
				input.serverId,
				gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
			)
		: await inspectPanelTailscaleClient(input.organizationId);
	const currentConfig = inspection.serveConfig ?? {
		version: "0.0.1",
		services: {},
	};
	const serveConfig = structuredClone(currentConfig) as {
		version?: string;
		services?: Record<string, unknown>;
	};
	serveConfig.version ??= "0.0.1";
	serveConfig.services ??= {};
	if (input.replaceAllManagedServices) {
		for (const name of Object.keys(serveConfig.services)) {
			if (name.startsWith("svc:dokploy-")) delete serveConfig.services[name];
		}
	}
	const failedEndpointIds = new Set<string>();

	for (const row of input.rows) {
		const desired = row.desired;
		const previousService = serveConfig.services[row.serviceName];
		try {
			if (!desired.ports.length) {
				delete serveConfig.services[row.serviceName];
				continue;
			}
			const proxies = await ensureTailscaleEndpointProxies({
				organizationId: input.organizationId,
				serverId: input.serverId,
				endpointId: row.tailscaleEndpointId,
				targetHost: desired.targetHost,
				targetNetwork: desired.targetNetwork,
				ports: desired.ports.map((port) => port.targetPort),
			});
			serveConfig.services[row.serviceName] = {
				endpoints: Object.fromEntries(
					proxies.map((proxy) => [
						`tcp:${proxy.targetPort}`,
						`tcp://${proxy.proxyIp}:${proxy.targetPort}`,
					]),
				),
			};
			const service = await client.upsertService({
				name: row.serviceName,
				ports: desired.ports.map((port) => port.targetPort),
				comment: `Dokploy managed endpoint ${row.tailscaleEndpointId}; organization ${input.organizationId}`,
			});
			if (!row.translatedIp && input.config.translatedCidr) {
				const occupiedRows = await db.query.tailscaleEndpoint.findMany({
					where: eq(tailscaleEndpoint.organizationId, input.organizationId),
				});
				const translatedIp = allocateTranslatedIp(
					input.config.translatedCidr,
					row.ownerKey,
					new Set(
						occupiedRows
							.map((entry) => entry.translatedIp)
							.filter((entry): entry is string => Boolean(entry)),
					),
				);
				await db
					.update(tailscaleEndpoint)
					.set({ translatedIp })
					.where(
						eq(tailscaleEndpoint.tailscaleEndpointId, row.tailscaleEndpointId),
					);
			}
			await db
				.insert(tailscaleEndpointHost)
				.values({
					tailscaleEndpointId: row.tailscaleEndpointId,
					tailscaleGatewayId: gateway.tailscaleGatewayId,
					status: desired.status === "offline" ? "offline" : "provisioning",
				})
				.onConflictDoUpdate({
					target: [
						tailscaleEndpointHost.tailscaleEndpointId,
						tailscaleEndpointHost.tailscaleGatewayId,
					],
					set: {
						status: desired.status === "offline" ? "offline" : "provisioning",
						lastError: null,
						updatedAt: new Date().toISOString(),
					},
				});
			if (
				service.addrs?.[0] &&
				!row.translatedIp &&
				!input.config.translatedCidr
			) {
				await db
					.update(tailscaleEndpoint)
					.set({ translatedIp: service.addrs[0] })
					.where(
						eq(tailscaleEndpoint.tailscaleEndpointId, row.tailscaleEndpointId),
					);
			}
		} catch (error) {
			failedEndpointIds.add(row.tailscaleEndpointId);
			if (input.replaceAllManagedServices || previousService === undefined) {
				delete serveConfig.services[row.serviceName];
			} else {
				serveConfig.services[row.serviceName] = previousService;
			}
			const message = errorMessage(error);
			await db
				.update(tailscaleEndpoint)
				.set({ status: "degraded", lastError: message })
				.where(
					eq(tailscaleEndpoint.tailscaleEndpointId, row.tailscaleEndpointId),
				);
		}
	}

	if (input.serverId) {
		await applyTailscaleServeConfig({
			serverId: input.serverId,
			socketPath: gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
			config: serveConfig,
		});
	} else {
		await applyPanelTailscaleServeConfig({
			organizationId: input.organizationId,
			config: serveConfig,
		});
	}

	for (const row of input.rows) {
		if (!row.desired.ports.length) continue;
		if (failedEndpointIds.has(row.tailscaleEndpointId)) continue;
		try {
			if (input.serverId) {
				await advertiseTailscaleService({
					serverId: input.serverId,
					socketPath: gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
					serviceName: row.serviceName,
					drain: row.desired.status === "offline",
				});
			} else {
				await advertisePanelTailscaleService({
					organizationId: input.organizationId,
					serviceName: row.serviceName,
					drain: row.desired.status === "offline",
				});
			}
			if (row.desired.status !== "offline") {
				await client.setServiceHostApproval(
					row.serviceName,
					gateway.deviceId,
					true,
				);
			}
			const status = row.desired.status === "offline" ? "offline" : "ready";
			await Promise.all([
				db
					.update(tailscaleEndpoint)
					.set({ status, lastError: null, updatedAt: new Date().toISOString() })
					.where(
						eq(tailscaleEndpoint.tailscaleEndpointId, row.tailscaleEndpointId),
					),
				db
					.update(tailscaleEndpointHost)
					.set({
						status,
						advertised: status === "ready",
						approved: status === "ready",
						lastError: null,
					})
					.where(
						and(
							eq(
								tailscaleEndpointHost.tailscaleEndpointId,
								row.tailscaleEndpointId,
							),
							eq(
								tailscaleEndpointHost.tailscaleGatewayId,
								gateway.tailscaleGatewayId,
							),
						),
					),
			]);
		} catch (error) {
			failedEndpointIds.add(row.tailscaleEndpointId);
			const message = errorMessage(error);
			await db
				.update(tailscaleEndpoint)
				.set({ status: "degraded", lastError: message })
				.where(
					eq(tailscaleEndpoint.tailscaleEndpointId, row.tailscaleEndpointId),
				);
		}
	}
	return { failed: failedEndpointIds.size > 0 };
};

export const reconcileTailscaleOrganization = async (
	organizationId: string,
	filter?: { serverId?: string | null; tailscaleEndpointId?: string },
) =>
	withLock(organizationLifecycleLockKey(organizationId), async () => {
		const config = await findTailscaleConfigForOrg(organizationId);
		if (!config)
			return { gateways: 0, endpoints: 0, status: "disabled" as const };
		if (!config.enabled) {
			await db
				.update(tailscaleEndpoint)
				.set({ status: "disabled" })
				.where(eq(tailscaleEndpoint.organizationId, organizationId));
			return { gateways: 0, endpoints: 0, status: "disabled" as const };
		}

		const existing = await db.query.tailscaleEndpoint.findMany({
			where: eq(tailscaleEndpoint.organizationId, organizationId),
		});
		const resources = await collectTailscaleResources(organizationId);
		const desired = buildDesiredTailscaleEndpoints({
			resources,
			dnsSuffix: config.dnsSuffix,
			existing,
		});
		const persisted = await persistDesiredEndpoints(organizationId, desired);
		const desiredOwners = new Set(desired.map((endpoint) => endpoint.ownerKey));
		const orphans = existing.filter(
			(endpoint) => !desiredOwners.has(endpoint.ownerKey),
		);
		const client = createTailscaleClient(config);
		const servers = await db.query.server.findMany({
			where: eq(server.organizationId, organizationId),
		});
		for (const orphan of orphans) {
			const service = await client
				.getService(orphan.serviceName)
				.catch(() => null);
			if (
				service?.comment?.includes(
					`Dokploy managed endpoint ${orphan.tailscaleEndpointId}`,
				)
			) {
				await client.deleteService(orphan.serviceName).catch(() => undefined);
			}
			for (const sourceServerId of [
				null,
				...servers.map((entry) => entry.serverId),
			]) {
				await removeTailscaleEndpointProxies({
					serverId: sourceServerId,
					endpointId: orphan.tailscaleEndpointId,
				});
			}
			await db
				.delete(tailscaleEndpoint)
				.where(
					eq(tailscaleEndpoint.tailscaleEndpointId, orphan.tailscaleEndpointId),
				);
		}

		const requestedGatewayIds =
			filter && "serverId" in filter
				? [filter.serverId ?? null]
				: [null, ...servers.map((row) => row.serverId)];
		let hasFailures = false;
		for (const id of requestedGatewayIds) {
			try {
				const provisioned = await provisionTailscaleGateway(organizationId, id);
				if (!provisioned || provisioned.status !== "ready") hasFailures = true;
			} catch {
				hasFailures = true;
			}
		}

		for (const id of requestedGatewayIds) {
			let rows = persisted.filter((row) => row.desired.serverId === id);
			if (filter?.tailscaleEndpointId) {
				rows = rows.filter(
					(row) => row.tailscaleEndpointId === filter.tailscaleEndpointId,
				);
			}
			try {
				const result = await reconcileGatewayEndpoints({
					organizationId,
					serverId: id,
					rows,
					config,
					replaceAllManagedServices: !filter?.tailscaleEndpointId,
				});
				if (result.failed) hasFailures = true;
			} catch (error) {
				hasFailures = true;
				const message = errorMessage(error);
				if (rows.length) {
					await db
						.update(tailscaleEndpoint)
						.set({ status: "degraded", lastError: message })
						.where(
							inArray(
								tailscaleEndpoint.tailscaleEndpointId,
								rows.map((row) => row.tailscaleEndpointId),
							),
						);
				}
			}
		}

		const consumableEndpoints = await Promise.all(
			persisted
				.filter((row) => row.desired.ports.length > 0)
				.map(async (row) => {
					const service = await client.getService(row.serviceName).catch(() => {
						hasFailures = true;
						return null;
					});
					return { row, service };
				}),
		);
		for (const id of requestedGatewayIds) {
			const gateway = await db.query.tailscaleGateway.findFirst({
				where: eq(tailscaleGateway.gatewayKey, gatewayKey(organizationId, id)),
			});
			if (!gateway || gateway.status !== "ready") {
				hasFailures = true;
				continue;
			}
			try {
				await ensureTailscaleOrganizationNetwork({
					organizationId,
					serverId: id,
				});
				for (const resource of resources.filter(
					(resource) => resource.serverId === id,
				)) {
					await attachTailscaleSourceWorkload({
						organizationId,
						serverId: id,
						appName: resource.appName,
						compose: resource.resourceType === "compose",
					});
				}
				for (const { row, service } of consumableEndpoints) {
					const tailVip = service?.addrs?.[0];
					if (!tailVip) continue;
					await ensureTailscaleSourceProxy({
						organizationId,
						serverId: id,
						endpointId: row.tailscaleEndpointId,
						fqdn: row.fqdn,
						tailVip,
						ports: row.desired.ports.map((port) => port.targetPort),
						parallel: gateway.ownership === "parallel",
					});
					if (row.desired.status !== "offline") {
						await verifyTailscaleSourceEndpoint({
							organizationId,
							serverId: id,
							fqdn: row.fqdn,
							port: row.desired.ports[0]?.targetPort ?? 0,
						});
					}
					for (const composeResource of resources) {
						if (
							composeResource.serverId !== id ||
							composeResource.resourceType !== "compose"
						) {
							continue;
						}
						await ensureTailscaleSourceProxy({
							organizationId,
							serverId: id,
							endpointId: row.tailscaleEndpointId,
							fqdn: row.fqdn,
							tailVip,
							ports: row.desired.ports.map((port) => port.targetPort),
							parallel: gateway.ownership === "parallel",
							sourceNetwork: composeResource.isolatedDeployment
								? composeResource.appName
								: `${composeResource.appName}_default`,
						});
					}
				}
			} catch (error) {
				hasFailures = true;
				await db
					.update(tailscaleGateway)
					.set({
						status: "degraded",
						lastError: `Private workload routing failed: ${errorMessage(error)}`,
						updatedAt: new Date().toISOString(),
					})
					.where(
						eq(tailscaleGateway.tailscaleGatewayId, gateway.tailscaleGatewayId),
					);
			}
		}
		return {
			gateways: requestedGatewayIds.length,
			endpoints: persisted.length,
			status: hasFailures ? ("degraded" as const) : ("ready" as const),
		};
	});

export const disconnectTailscale = async (organizationId: string) =>
	withLock(organizationLifecycleLockKey(organizationId), async () => {
		const state = await listTailscaleState(organizationId);
		for (const endpoint of state.endpoints) {
			for (const host of endpoint.hosts) {
				if (host.gateway.serverId) {
					await advertiseTailscaleService({
						serverId: host.gateway.serverId,
						socketPath: host.gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
						serviceName: endpoint.serviceName,
						drain: true,
					}).catch(() => undefined);
				} else {
					await advertisePanelTailscaleService({
						organizationId,
						serviceName: endpoint.serviceName,
						drain: true,
					}).catch(() => undefined);
				}
			}
			for (const gateway of state.gateways) {
				await removeTailscaleEndpointProxies({
					serverId: gateway.serverId,
					endpointId: endpoint.tailscaleEndpointId,
				});
			}
		}
		for (const gateway of state.gateways) {
			await purgeTailscaleOrganizationNetwork({
				organizationId,
				serverId: gateway.serverId,
			});
		}
		await db
			.update(tailscaleConfig)
			.set({
				enabled: false,
				oauthClientSecret: "",
				updatedAt: new Date().toISOString(),
			})
			.where(eq(tailscaleConfig.organizationId, organizationId));
		await Promise.all([
			db
				.update(tailscaleGateway)
				.set({ status: "disabled" })
				.where(eq(tailscaleGateway.organizationId, organizationId)),
			db
				.update(tailscaleEndpoint)
				.set({ status: "disabled" })
				.where(eq(tailscaleEndpoint.organizationId, organizationId)),
		]);
		return { ok: true };
	});

export const listTailscaleState = async (organizationId: string) => {
	const [gateways, endpoints] = await Promise.all([
		db.query.tailscaleGateway.findMany({
			where: eq(tailscaleGateway.organizationId, organizationId),
			with: { server: true },
		}),
		db.query.tailscaleEndpoint.findMany({
			where: eq(tailscaleEndpoint.organizationId, organizationId),
			with: { ports: true, hosts: { with: { gateway: true } } },
		}),
	]);
	return { gateways, endpoints };
};

export const purgeTailscale = async (organizationId: string) =>
	withLock(organizationLifecycleLockKey(organizationId), async () => {
		const config = await findTailscaleConfigForOrg(organizationId);
		const { gateways, endpoints } = await listTailscaleState(organizationId);
		const client =
			config?.oauthClientSecret && config.tailnet
				? createTailscaleClient(config)
				: null;

		for (const endpoint of endpoints) {
			if (client) {
				const remote = await client
					.getService(endpoint.serviceName)
					.catch(() => null);
				if (
					remote?.comment?.includes(
						`Dokploy managed endpoint ${endpoint.tailscaleEndpointId}`,
					)
				) {
					await client
						.deleteService(endpoint.serviceName)
						.catch(() => undefined);
				}
			}
			for (const sourceServerId of [
				...new Set(gateways.map((gateway) => gateway.serverId)),
			]) {
				await removeTailscaleEndpointProxies({
					serverId: sourceServerId,
					endpointId: endpoint.tailscaleEndpointId,
				});
			}
		}

		for (const gateway of gateways) {
			await purgeTailscaleOrganizationNetwork({
				organizationId,
				serverId: gateway.serverId,
			});
			if (
				gateway.ownership === "adopted" ||
				gateway.ownership === "pending_retag"
			) {
				try {
					const inspection = gateway.serverId
						? await inspectTailscaleClient(
								gateway.serverId,
								gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
							)
						: await inspectPanelTailscaleClient(organizationId);
					const serveConfig = structuredClone(
						inspection.serveConfig ?? { version: "0.0.1", services: {} },
					) as { services?: Record<string, unknown> };
					serveConfig.services ??= {};
					for (const name of Object.keys(serveConfig.services)) {
						if (name.startsWith("svc:dokploy-")) {
							delete serveConfig.services[name];
						}
					}
					if (gateway.serverId) {
						await applyTailscaleServeConfig({
							serverId: gateway.serverId,
							socketPath: gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
							config: serveConfig,
						});
					}
				} catch {
					// Preserve adopted clients even when cleanup cannot be completed.
				}
			}
			if (
				client &&
				gateway.deviceId &&
				gateway.ownership !== "adopted" &&
				gateway.ownership !== "pending_retag"
			) {
				await client.deleteDevice(gateway.deviceId).catch(() => undefined);
			}
			await purgeTailscaleGatewayClient({
				organizationId,
				serverId: gateway.serverId,
				ownership: gateway.ownership,
				unitName: gateway.unitName,
				networkNamespace: gateway.networkNamespace,
				statePath: gateway.statePath,
				socketPath: gateway.socketPath,
			}).catch(() => undefined);
		}

		await db
			.delete(tailscaleConfig)
			.where(eq(tailscaleConfig.organizationId, organizationId));
		return { gateways: gateways.length, endpoints: endpoints.length };
	});

export const removeTailscaleServer = async (
	organizationId: string,
	serverId: string,
) =>
	withLock(organizationLifecycleLockKey(organizationId), async () => {
		const gateway = await db.query.tailscaleGateway.findFirst({
			where: and(
				eq(tailscaleGateway.organizationId, organizationId),
				eq(tailscaleGateway.serverId, serverId),
			),
		});
		if (!gateway) return { removed: false };
		const hostedEndpoints = await db.query.tailscaleEndpointHost.findMany({
			where: eq(
				tailscaleEndpointHost.tailscaleGatewayId,
				gateway.tailscaleGatewayId,
			),
			with: { endpoint: true },
		});
		for (const host of hostedEndpoints) {
			await advertiseTailscaleService({
				serverId,
				socketPath: gateway.socketPath ?? DEFAULT_NATIVE_SOCKET,
				serviceName: host.endpoint.serviceName,
				drain: true,
			}).catch(() => undefined);
			await removeTailscaleEndpointProxies({
				serverId,
				endpointId: host.endpoint.tailscaleEndpointId,
			});
		}
		const config = await findTailscaleConfigForOrg(organizationId);
		if (
			config?.oauthClientSecret &&
			gateway.deviceId &&
			gateway.ownership !== "adopted" &&
			gateway.ownership !== "pending_retag"
		) {
			await createTailscaleClient(config)
				.deleteDevice(gateway.deviceId)
				.catch(() => undefined);
		}
		await purgeTailscaleGatewayClient({
			organizationId,
			serverId,
			ownership: gateway.ownership,
			unitName: gateway.unitName,
			networkNamespace: gateway.networkNamespace,
			statePath: gateway.statePath,
			socketPath: gateway.socketPath,
		}).catch(() => undefined);
		await purgeTailscaleOrganizationNetwork({
			organizationId,
			serverId,
		});
		await db
			.delete(tailscaleGateway)
			.where(
				eq(tailscaleGateway.tailscaleGatewayId, gateway.tailscaleGatewayId),
			);
		return { removed: true };
	});
