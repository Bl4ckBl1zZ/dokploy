import { parse } from "yaml";

export interface DiscoveredTailscalePort {
	targetPort: number;
	scheme: string;
	composeService?: string;
	secret?: boolean;
}

export interface PortDiscoveryResult {
	ports: DiscoveredTailscalePort[];
	warnings: string[];
}

const validPort = (value: unknown): value is number =>
	typeof value === "number" &&
	Number.isInteger(value) &&
	value > 0 &&
	value <= 65_535;

const addPort = (
	map: Map<string, DiscoveredTailscalePort>,
	port: DiscoveredTailscalePort,
) => {
	if (!validPort(port.targetPort)) return;
	const key = `${port.composeService ?? ""}:${port.targetPort}`;
	const existing = map.get(key);
	if (!existing || (existing.scheme === "tcp" && port.scheme === "http")) {
		map.set(key, port);
	}
};

export const discoverApplicationPorts = (input: {
	ports?: Array<{ targetPort: number; protocol: "tcp" | "udp" }>;
	domains?: Array<{ port: number | null; https?: boolean | null }>;
}): PortDiscoveryResult => {
	const ports = new Map<string, DiscoveredTailscalePort>();
	const warnings: string[] = [];
	for (const port of input.ports ?? []) {
		if (port.protocol === "udp") {
			warnings.push(
				`UDP port ${port.targetPort} is not supported by Tailscale Services`,
			);
			continue;
		}
		addPort(ports, { targetPort: port.targetPort, scheme: "tcp" });
	}
	for (const domain of input.domains ?? []) {
		if (domain.port !== null) {
			addPort(ports, { targetPort: domain.port, scheme: "http" });
		}
	}
	if (ports.size === 0) {
		warnings.push(
			"No TCP target port is declared; private networking will remain pending",
		);
	}
	return { ports: [...ports.values()], warnings: [...new Set(warnings)] };
};

const parsePortToken = (
	value: string | number,
): { ports: number[]; protocol: string } | null => {
	const source = String(value).trim();
	const [withoutProtocol, protocol = "tcp"] = source.split("/");
	const target = withoutProtocol?.split(":").at(-1);
	if (!target) return null;
	const [rangeStart, rangeEnd] = target.split("-").map(Number);
	if (!validPort(rangeStart)) return null;
	if (rangeEnd === undefined) return { ports: [rangeStart], protocol };
	if (
		!validPort(rangeEnd) ||
		rangeEnd < rangeStart ||
		rangeEnd - rangeStart > 100
	) {
		return null;
	}
	return {
		ports: Array.from(
			{ length: rangeEnd - rangeStart + 1 },
			(_, index) => rangeStart + index,
		),
		protocol,
	};
};

const discoverComposeEntry = (
	entry: unknown,
): { ports: number[]; protocol: string } | null => {
	if (typeof entry === "string" || typeof entry === "number") {
		return parsePortToken(entry);
	}
	if (!entry || typeof entry !== "object") return null;
	const mapping = entry as { target?: unknown; protocol?: unknown };
	const target =
		typeof mapping.target === "string" || typeof mapping.target === "number"
			? parsePortToken(mapping.target)
			: null;
	if (!target) return null;
	return {
		ports: target.ports,
		protocol:
			typeof mapping.protocol === "string"
				? mapping.protocol.toLowerCase()
				: target.protocol,
	};
};

export const discoverComposePorts = (
	composeFile: string,
): PortDiscoveryResult => {
	const ports = new Map<string, DiscoveredTailscalePort>();
	const warnings: string[] = [];
	let document: unknown;
	try {
		document = parse(composeFile);
	} catch (error) {
		return {
			ports: [],
			warnings: [
				`Compose ports could not be parsed: ${error instanceof Error ? error.message : "invalid YAML"}`,
			],
		};
	}
	if (!document || typeof document !== "object") {
		return { ports: [], warnings: ["Compose file has no services"] };
	}
	const services = (document as { services?: unknown }).services;
	if (!services || typeof services !== "object") {
		return { ports: [], warnings: ["Compose file has no services"] };
	}

	for (const [serviceName, rawService] of Object.entries(services)) {
		if (!rawService || typeof rawService !== "object") continue;
		const service = rawService as { ports?: unknown; expose?: unknown };
		const entries = [
			...(Array.isArray(service.ports) ? service.ports : []),
			...(Array.isArray(service.expose) ? service.expose : []),
		];
		for (const entry of entries) {
			const discovered = discoverComposeEntry(entry);
			if (!discovered) continue;
			for (const targetPort of discovered.ports) {
				if (discovered.protocol.toLowerCase() === "udp") {
					warnings.push(
						`Compose service ${serviceName} declares unsupported UDP port ${targetPort}`,
					);
					continue;
				}
				addPort(ports, {
					targetPort,
					scheme: "tcp",
					composeService: serviceName,
				});
			}
		}
	}

	return { ports: [...ports.values()], warnings: [...new Set(warnings)] };
};

const DATABASE_PORTS: Record<
	"postgres" | "mysql" | "mariadb" | "mongo" | "redis" | "libsql",
	Array<{ targetPort: number; scheme: string }>
> = {
	postgres: [{ targetPort: 5432, scheme: "postgres" }],
	mysql: [{ targetPort: 3306, scheme: "mysql" }],
	mariadb: [{ targetPort: 3306, scheme: "mariadb" }],
	mongo: [{ targetPort: 27017, scheme: "mongodb" }],
	redis: [{ targetPort: 6379, scheme: "redis" }],
	libsql: [
		{ targetPort: 8080, scheme: "libsql" },
		{ targetPort: 5001, scheme: "libsql" },
	],
};

export const discoverDatabasePorts = (
	type: keyof typeof DATABASE_PORTS,
): DiscoveredTailscalePort[] =>
	DATABASE_PORTS[type].map((port) => ({ ...port, secret: true }));

export const buildPrivatePortUrl = (input: {
	fqdn: string;
	targetPort: number;
	scheme: string;
}): string => `${input.scheme}://${input.fqdn}:${input.targetPort}`;
