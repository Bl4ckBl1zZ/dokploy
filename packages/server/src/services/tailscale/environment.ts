import { db, eq, tailscaleEndpoint } from "@dokploy/server/db";
import type { PrivateEnvironmentContext } from "./environment-template";
import { buildPrivatePortUrl } from "./ports";

export * from "./environment-template";

export const getPrivateEnvironmentContext = async (
	projectId: string | null | undefined,
	selfReferenceKey: string,
): Promise<PrivateEnvironmentContext> => {
	if (!projectId) return { selfReferenceKey, endpoints: {} };
	const endpoints = await db.query.tailscaleEndpoint.findMany({
		where: eq(tailscaleEndpoint.projectId, projectId),
		with: { ports: true },
	});

	return {
		selfReferenceKey,
		endpoints: Object.fromEntries(
			endpoints.map((endpoint) => [
				endpoint.referenceKey,
				{
					host: endpoint.fqdn,
					urls: Object.fromEntries(
						endpoint.ports.map((port) => [
							port.targetPort,
							buildPrivatePortUrl({
								fqdn: endpoint.fqdn,
								targetPort: port.targetPort,
								scheme: port.scheme,
							}),
						]),
					),
				},
			]),
		),
	};
};
