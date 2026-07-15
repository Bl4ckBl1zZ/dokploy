import type { TailscaleResourceType, TailscaleStatus } from "./internal-types";
import {
	buildTailscaleReferenceKey,
	buildTailscaleServiceName,
	tailscaleServiceFqdn,
} from "./naming";
import {
	type DiscoveredTailscalePort,
	discoverApplicationPorts,
	discoverComposePorts,
	discoverDatabasePorts,
} from "./ports";

export interface ExistingEndpointIdentity {
	ownerKey: string;
	readableName: string;
	serviceName: string;
	fqdn: string;
}

export interface DesiredEndpoint {
	ownerKey: string;
	organizationId: string;
	projectId: string;
	resourceType: TailscaleResourceType;
	resourceId: string;
	composeService?: string;
	referenceKey: string;
	readableName: string;
	serviceName: string;
	fqdn: string;
	serverId: string | null;
	targetHost: string;
	targetNetwork: string;
	ports: DiscoveredTailscalePort[];
	status: TailscaleStatus;
	warning: string | null;
}

interface BaseDesiredResource {
	organizationId: string;
	projectId: string;
	projectName: string;
	environmentName: string;
	resourceId: string;
	name: string;
	appName: string;
	serverId: string | null;
	status: "idle" | "running" | "done" | "error";
}

export type DesiredResource =
	| (BaseDesiredResource & {
			resourceType: "application";
			ports: Array<{ targetPort: number; protocol: "tcp" | "udp" }>;
			domains: Array<{ port: number | null; https?: boolean | null }>;
	  })
	| (BaseDesiredResource & {
			resourceType: "compose";
			composeFile: string;
			composeType: "docker-compose" | "stack";
			isolatedDeployment: boolean;
			domains: Array<{
				serviceName: string | null;
				port: number | null;
				https?: boolean | null;
			}>;
	  })
	| (BaseDesiredResource & {
			resourceType:
				| "postgres"
				| "mysql"
				| "mariadb"
				| "mongo"
				| "redis"
				| "libsql";
	  })
	| (BaseDesiredResource & {
			resourceType: "preview";
			previewPort: number | null;
			domainPort: number | null;
	  });

const desiredStatus = (
	status: BaseDesiredResource["status"],
	hasPorts: boolean,
): TailscaleStatus => {
	if (!hasPorts) return "pending";
	if (status === "done") return "provisioning";
	if (status === "running") return "provisioning";
	return "offline";
};

const endpointIdentity = (input: {
	resource: BaseDesiredResource;
	resourceType: TailscaleResourceType;
	composeService?: string;
	dnsSuffix: string;
	existing: Map<string, ExistingEndpointIdentity>;
	reservedNames: Set<string>;
}) => {
	const ownerKey = `${input.resourceType}:${input.resource.resourceId}:${input.composeService ?? ""}`;
	const previous = input.existing.get(ownerKey);
	if (previous) {
		input.reservedNames.add(previous.serviceName);
		return previous;
	}
	const readableName = [
		input.resource.projectName,
		input.resource.environmentName,
		input.resource.name,
		input.composeService,
	]
		.filter(Boolean)
		.join(" / ");
	const serviceName = buildTailscaleServiceName(
		{
			project: input.resource.projectName,
			environment: input.resource.environmentName,
			resource: input.resource.name,
			resourceId: input.resource.resourceId,
			composeService: input.composeService,
			preview: input.resourceType === "preview",
		},
		input.reservedNames,
	);
	input.reservedNames.add(serviceName);
	return {
		ownerKey,
		readableName,
		serviceName,
		fqdn: tailscaleServiceFqdn(serviceName, input.dnsSuffix),
	};
};

const composeNetwork = (
	resource: Extract<DesiredResource, { resourceType: "compose" }>,
) =>
	resource.isolatedDeployment
		? resource.appName
		: `${resource.appName}_default`;

export const buildDesiredTailscaleEndpoints = (input: {
	resources: DesiredResource[];
	dnsSuffix: string;
	existing?: ExistingEndpointIdentity[];
}): DesiredEndpoint[] => {
	const existing = new Map(
		(input.existing ?? []).map((endpoint) => [endpoint.ownerKey, endpoint]),
	);
	const reservedNames = new Set(
		(input.existing ?? []).map((endpoint) => endpoint.serviceName),
	);
	const desired: DesiredEndpoint[] = [];

	for (const resource of input.resources) {
		if (resource.resourceType === "compose") {
			const discovered = discoverComposePorts(resource.composeFile);
			const byService = new Map<string, DiscoveredTailscalePort[]>();
			for (const port of discovered.ports) {
				if (!port.composeService) continue;
				const entries = byService.get(port.composeService) ?? [];
				entries.push(port);
				byService.set(port.composeService, entries);
			}
			for (const domain of resource.domains) {
				if (!domain.serviceName || domain.port === null) continue;
				const entries = byService.get(domain.serviceName) ?? [];
				const existingPort = entries.find(
					(port) => port.targetPort === domain.port,
				);
				if (existingPort) existingPort.scheme = "http";
				else {
					entries.push({
						targetPort: domain.port,
						scheme: "http",
						composeService: domain.serviceName,
					});
				}
				byService.set(domain.serviceName, entries);
			}
			for (const [service, ports] of byService) {
				const identity = endpointIdentity({
					resource,
					resourceType: "compose",
					composeService: service,
					dnsSuffix: input.dnsSuffix,
					existing,
					reservedNames,
				});
				desired.push({
					...identity,
					organizationId: resource.organizationId,
					projectId: resource.projectId,
					resourceType: "compose",
					resourceId: resource.resourceId,
					composeService: service,
					referenceKey: buildTailscaleReferenceKey({
						appName: resource.appName,
						composeService: service,
					}),
					serverId: resource.serverId,
					targetHost: service,
					targetNetwork: composeNetwork(resource),
					ports,
					status: desiredStatus(resource.status, ports.length > 0),
					warning: discovered.warnings.length
						? discovered.warnings.join("; ")
						: null,
				});
			}
			continue;
		}

		let ports: DiscoveredTailscalePort[];
		let warnings: string[] = [];
		if (resource.resourceType === "application") {
			const discovery = discoverApplicationPorts(resource);
			ports = discovery.ports;
			warnings = discovery.warnings;
		} else if (resource.resourceType === "preview") {
			const port = resource.domainPort ?? resource.previewPort;
			ports = port ? [{ targetPort: port, scheme: "http" }] : [];
			if (!port) warnings.push("Preview has no configured TCP port");
		} else {
			ports = discoverDatabasePorts(resource.resourceType);
		}

		const identity = endpointIdentity({
			resource,
			resourceType: resource.resourceType,
			dnsSuffix: input.dnsSuffix,
			existing,
			reservedNames,
		});
		desired.push({
			...identity,
			organizationId: resource.organizationId,
			projectId: resource.projectId,
			resourceType: resource.resourceType,
			resourceId: resource.resourceId,
			referenceKey:
				resource.resourceType === "preview"
					? resource.appName
					: buildTailscaleReferenceKey({ appName: resource.appName }),
			serverId: resource.serverId,
			targetHost: resource.appName,
			targetNetwork: "dokploy-network",
			ports,
			status: desiredStatus(resource.status, ports.length > 0),
			warning: warnings.length ? warnings.join("; ") : null,
		});
	}

	return desired;
};
