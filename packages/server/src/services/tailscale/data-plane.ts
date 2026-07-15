import { createHash } from "node:crypto";
import { quote } from "shell-quote";
import {
	isolatedTailscalePaths,
	panelTailscaleContainerName,
} from "../../setup/tailscale-setup";
import { execAsync, execAsyncRemote } from "../../utils/process/execAsync";

const run = (
	serverId: string | null,
	command: string,
	onData?: (data: string) => void,
) =>
	serverId ? execAsyncRemote(serverId, command, onData) : execAsync(command);

const short = (value: string) =>
	value
		.replace(/[^a-zA-Z0-9]/g, "")
		.slice(-10)
		.toLowerCase();

export const discoverKnownNetworkCidrs = async (
	serverIds: Array<string | null>,
): Promise<string[]> => {
	const results = await Promise.all(
		serverIds.map((serverId) =>
			run(
				serverId,
				`{ ip -o -4 route show 2>/dev/null | awk '{print $1}'; ids=$(docker network ls -q 2>/dev/null); [ -z "$ids" ] || docker network inspect -f '{{range .IPAM.Config}}{{println .Subnet}}{{end}}' $ids 2>/dev/null; } || true`,
			).catch(() => ({ stdout: "" })),
		),
	);
	return [
		...new Set(
			results.flatMap((result) =>
				result.stdout
					.split(/\s+/)
					.map((entry) => entry.trim())
					.filter((entry) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(entry)),
			),
		),
	];
};

export const tailscaleProxyContainerName = (
	endpointId: string,
	port: number,
): string => `dokploy-ts-proxy-${short(endpointId)}-${port}`;

export const tailscaleOrganizationNetworkName = (
	organizationId: string,
): string => `dokploy-ts-${short(organizationId)}`;

const tailscaleSourceProxyContainerName = (
	organizationId: string,
	endpointId: string,
	sourceNetwork: string,
): string =>
	`dokploy-ts-src-${short(organizationId)}-${short(endpointId)}-${short(
		createHash("sha256").update(sourceNetwork).digest("hex"),
	).slice(0, 6)}`;

export const ensureTailscaleOrganizationNetwork = async (input: {
	organizationId: string;
	serverId: string | null;
}): Promise<string> => {
	const network = tailscaleOrganizationNetworkName(input.organizationId);
	await run(
		input.serverId,
		`docker network inspect ${quote([network])} >/dev/null 2>&1 || docker network create --attachable --label com.dokploy.managed=true --label com.dokploy.role=tailscale-organization-network --label ${quote([`com.dokploy.organization=${input.organizationId}`])} ${quote([network])} >/dev/null`,
	);
	if (!input.serverId) {
		const gateway = panelTailscaleContainerName(input.organizationId);
		await run(
			null,
			`docker network connect ${quote([network])} ${quote([gateway])} >/dev/null 2>&1 || true; docker exec ${quote([gateway])} sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true`,
		);
	}
	return network;
};

export const attachTailscaleSourceWorkload = async (input: {
	organizationId: string;
	serverId: string | null;
	appName: string;
	compose?: boolean;
}): Promise<void> => {
	const network = await ensureTailscaleOrganizationNetwork(input);
	if (input.compose) {
		// Compose networks remain isolated. Reconciliation adds only the narrowly
		// scoped source proxy interface to the Compose network.
		return;
	}
	const networkId = await run(
		input.serverId,
		`docker network inspect -f '{{.Id}}' ${quote([network])}`,
	);
	await run(
		input.serverId,
		`targets=$(docker service inspect -f '{{range .Spec.TaskTemplate.Networks}}{{println .Target}}{{end}}' ${quote([input.appName])} 2>/dev/null || true); printf '%s\n' "$targets" | grep -Fxq ${quote([networkId.stdout.trim()])} || docker service update --detach=false --network-add ${quote([network])} ${quote([input.appName])} >/dev/null`,
	);
};

export const ensureTailscaleSourceProxy = async (input: {
	organizationId: string;
	serverId: string | null;
	endpointId: string;
	fqdn: string;
	tailVip: string;
	ports: number[];
	parallel: boolean;
	sourceNetwork?: string;
}): Promise<void> => {
	const network = await ensureTailscaleOrganizationNetwork(input);
	const sourceNetwork = input.sourceNetwork ?? network;
	if (sourceNetwork !== network) {
		await run(
			input.serverId,
			`docker network inspect ${quote([sourceNetwork])} >/dev/null`,
		);
	}
	const name = tailscaleSourceProxyContainerName(
		input.organizationId,
		input.endpointId,
		sourceNetwork,
	);
	const ports = [...new Set(input.ports)].sort((a, b) => a - b);
	if (!ports.length) return;
	let routeCommand = "";
	if (!input.serverId) {
		const gateway = panelTailscaleContainerName(input.organizationId);
		const gatewayAddress = await run(
			null,
			`docker inspect -f ${quote([`{{with index .NetworkSettings.Networks "${network}"}}{{.IPAddress}}{{end}}`])} ${quote([gateway])}`,
		);
		if (!gatewayAddress.stdout.trim()) {
			throw new Error(
				"Panel Tailscale gateway has no organization-network address",
			);
		}
		routeCommand = `ip route replace ${input.tailVip}/32 via ${gatewayAddress.stdout.trim()}; `;
	} else if (input.parallel) {
		const paths = isolatedTailscalePaths(input.organizationId, input.serverId);
		await run(
			input.serverId,
			`set -eu; if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi; $SUDO ip route replace ${quote([`${input.tailVip}/32`])} via ${quote([paths.namespaceAddress])} dev ${quote([paths.hostInterface])}`,
		);
	}
	const command = `${routeCommand}${ports
		.map(
			(port) =>
				`socat TCP-LISTEN:${port},fork,reuseaddr TCP:${input.tailVip}:${port} &`,
		)
		.join(" ")} wait`;
	const specification = createHash("sha256")
		.update(`${input.fqdn}:${input.tailVip}:${ports.join(",")}:${routeCommand}`)
		.digest("hex");
	const current = await run(
		input.serverId,
		`docker inspect -f '{{index .Config.Labels "com.dokploy.spec"}}' ${quote([name])} 2>/dev/null || true`,
	);
	if (current.stdout.trim() === specification) {
		await run(
			input.serverId,
			`docker start ${quote([name])} >/dev/null 2>&1 || true`,
		);
		if (sourceNetwork !== network) {
			await run(
				input.serverId,
				`docker network connect --alias ${quote([input.fqdn])} ${quote([sourceNetwork])} ${quote([name])} >/dev/null 2>&1 || true`,
			);
		}
		return;
	}
	await run(
		input.serverId,
		`docker rm -f ${quote([name])} >/dev/null 2>&1 || true; docker run -d --name ${quote([name])} --restart unless-stopped --cap-add NET_ADMIN --network ${quote([network])} --network-alias ${quote([input.fqdn])} --label com.dokploy.managed=true --label com.dokploy.role=tailscale-source-proxy --label ${quote([`com.dokploy.organization=${input.organizationId}`])} --label ${quote([`com.dokploy.endpoint=${input.endpointId}`])} --label ${quote([`com.dokploy.spec=${specification}`])} --entrypoint sh alpine/socat -c ${quote([command])}`,
	);
	if (sourceNetwork !== network) {
		await run(
			input.serverId,
			`docker network connect --alias ${quote([input.fqdn])} ${quote([sourceNetwork])} ${quote([name])}`,
		);
	}
};

export const verifyTailscaleSourceEndpoint = async (input: {
	organizationId: string;
	serverId: string | null;
	fqdn: string;
	port: number;
	sourceNetwork?: string;
}): Promise<void> => {
	const network =
		input.sourceNetwork ??
		(await ensureTailscaleOrganizationNetwork({
			organizationId: input.organizationId,
			serverId: input.serverId,
		}));
	await run(
		input.serverId,
		`docker run --rm --network ${quote([network])} alpine:3.20 sh -c ${quote([`getent hosts ${quote([input.fqdn])} >/dev/null && nc -z -w 5 ${quote([input.fqdn])} ${input.port}`])}`,
	);
};

export interface TailscaleProxyTarget {
	targetPort: number;
	proxyHost: string;
	proxyIp: string;
}

export const ensureTailscaleEndpointProxies = async (input: {
	organizationId: string;
	serverId: string | null;
	endpointId: string;
	targetHost: string;
	targetNetwork: string;
	ports: number[];
	onData?: (data: string) => void;
}): Promise<TailscaleProxyTarget[]> => {
	await run(
		input.serverId,
		`docker network inspect ${quote([input.targetNetwork])} >/dev/null`,
	);
	const targets: TailscaleProxyTarget[] = [];
	for (const port of [...new Set(input.ports)].sort((a, b) => a - b)) {
		const name = tailscaleProxyContainerName(input.endpointId, port);
		const specification = createHash("sha256")
			.update(
				`${input.organizationId}:${input.endpointId}:${input.targetNetwork}:${input.targetHost}:${port}`,
			)
			.digest("hex");
		const current = await run(
			input.serverId,
			`docker inspect -f '{{index .Config.Labels "com.dokploy.spec"}}' ${quote([name])} 2>/dev/null || true`,
		);
		if (current.stdout.trim() !== specification) {
			await run(
				input.serverId,
				`docker rm -f ${quote([name])} >/dev/null 2>&1 || true; docker run -d --name ${quote([name])} --restart unless-stopped --network ${quote([input.targetNetwork])} --label com.dokploy.managed=true --label com.dokploy.role=tailscale-endpoint-proxy --label ${quote([`com.dokploy.organization=${input.organizationId}`])} --label ${quote([`com.dokploy.endpoint=${input.endpointId}`])} --label ${quote([`com.dokploy.spec=${specification}`])} alpine/socat TCP-LISTEN:${port},fork,reuseaddr TCP:${input.targetHost}:${port}`,
				input.onData,
			);
		} else {
			await run(
				input.serverId,
				`docker start ${quote([name])} >/dev/null 2>&1 || true`,
			);
		}
		const address = await run(
			input.serverId,
			`docker inspect -f ${quote([`{{with index .NetworkSettings.Networks "${input.targetNetwork}"}}{{.IPAddress}}{{end}}`])} ${quote([name])}`,
		);
		const proxyIp = address.stdout.trim();
		if (!proxyIp) throw new Error(`Proxy ${name} has no address`);
		targets.push({ targetPort: port, proxyHost: name, proxyIp });
	}

	if (!input.serverId && input.targetNetwork !== "dokploy-network") {
		const gateway = panelTailscaleContainerName(input.organizationId);
		await run(
			null,
			`docker network connect ${quote([input.targetNetwork])} ${quote([gateway])} >/dev/null 2>&1 || true`,
		);
	}
	return targets;
};

export const removeTailscaleEndpointProxies = async (input: {
	serverId: string | null;
	endpointId: string;
}): Promise<void> => {
	await run(
		input.serverId,
		`ids=$(docker ps -aq --filter ${quote([`label=com.dokploy.endpoint=${input.endpointId}`])}); [ -z "$ids" ] || docker rm -f $ids >/dev/null`,
	).catch(() => undefined);
};

export const purgeTailscaleOrganizationNetwork = async (input: {
	organizationId: string;
	serverId: string | null;
}): Promise<void> => {
	const network = tailscaleOrganizationNetworkName(input.organizationId);
	await run(
		input.serverId,
		`ids=$(docker ps -aq --filter ${quote([`label=com.dokploy.organization=${input.organizationId}`])} --filter label=com.dokploy.role=tailscale-source-proxy); [ -z "$ids" ] || docker rm -f $ids >/dev/null 2>&1; network_id=$(docker network inspect -f '{{.Id}}' ${quote([network])} 2>/dev/null || true); [ -z "$network_id" ] && exit 0; for service_id in $(docker service ls -q 2>/dev/null); do targets=$(docker service inspect -f '{{range .Spec.TaskTemplate.Networks}}{{println .Target}}{{end}}' "$service_id" 2>/dev/null || true); printf '%s\n' "$targets" | grep -Fxq "$network_id" && docker service update --detach=false --network-rm ${quote([network])} "$service_id" >/dev/null 2>&1 || true; done; for container_id in $(docker network inspect -f '{{range $id, $_ := .Containers}}{{println $id}}{{end}}' ${quote([network])} 2>/dev/null); do docker network disconnect -f ${quote([network])} "$container_id" >/dev/null 2>&1 || true; done; docker network rm ${quote([network])} >/dev/null 2>&1 || true`,
	).catch(() => undefined);
};
