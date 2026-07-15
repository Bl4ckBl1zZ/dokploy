import {
	allocateTranslatedIp,
	cidrsOverlap,
	parseIpv4Cidr,
	selectOrganizationTranslatedCidr,
	selectTranslatedCidr,
} from "@dokploy/server/services/tailscale/cidr";
import { buildDesiredTailscaleEndpoints } from "@dokploy/server/services/tailscale/desired-state";
import type { PrivateEnvironmentContext } from "@dokploy/server/services/tailscale/environment-template";
import {
	buildTailscaleReferenceKey,
	buildTailscaleServiceName,
	normalizeTailscaleLabel,
	TAILSCALE_SERVICE_LABEL_MAX,
} from "@dokploy/server/services/tailscale/naming";
import {
	discoverApplicationPorts,
	discoverComposePorts,
	discoverDatabasePorts,
} from "@dokploy/server/services/tailscale/ports";
import {
	decideTailscaleClientMode,
	isolatedTailscalePaths,
	MINIMUM_TAILSCALE_SERVICES_VERSION,
	parseTailscaleInspection,
	tailscaleInspectionScript,
} from "@dokploy/server/setup/tailscale-setup";
import { prepareEnvironmentVariables } from "@dokploy/server/utils/docker/utils";
import { describe, expect, it } from "vitest";

describe("Tailscale immutable naming", () => {
	it("normalizes labels, retains a suffix, truncates, and expands collisions", () => {
		expect(normalizeTailscaleLabel("Crème / API__One")).toBe("creme-api-one");
		const input = {
			project: "A very long project name ".repeat(8),
			environment: "Production Europe",
			resource: "Payments API",
			resourceId: "application_1234567890",
		};
		const first = buildTailscaleServiceName(input);
		expect(first.startsWith("svc:dokploy-")).toBe(true);
		expect(first.slice(4).length).toBeLessThanOrEqual(
			TAILSCALE_SERVICE_LABEL_MAX,
		);
		expect(first).toMatch(/34567890$/);
		const collision = buildTailscaleServiceName(input, new Set([first]));
		expect(collision).not.toBe(first);
		expect(collision).toMatch(/1234567890$/);
	});

	it("uses immutable appName reference keys for resources and Compose services", () => {
		expect(buildTailscaleReferenceKey({ appName: "app_immutable" })).toBe(
			"app_immutable",
		);
		expect(
			buildTailscaleReferenceKey({
				appName: "compose_immutable",
				composeService: "API Worker",
			}),
		).toBe("compose_immutable--api-worker");
	});
});

describe("Tailscale port discovery", () => {
	it("deduplicates application TCP/domain ports and rejects UDP", () => {
		const result = discoverApplicationPorts({
			ports: [
				{ targetPort: 8080, protocol: "tcp" },
				{ targetPort: 8080, protocol: "udp" },
			],
			domains: [{ port: 8080 }],
		});
		expect(result.ports).toEqual([{ targetPort: 8080, scheme: "http" }]);
		expect(result.warnings.join(" ")).toContain("UDP");
	});

	it("keeps no-port applications pending and groups Compose container ports", () => {
		expect(discoverApplicationPorts({}).ports).toEqual([]);
		expect(discoverApplicationPorts({}).warnings[0]).toContain("pending");
		const result = discoverComposePorts(`services:
  api:
    ports: ["127.0.0.1:8080:3000", { target: 3001, protocol: tcp }]
    expose: [3002, "5353/udp"]
  db:
    expose: [5432]
`);
		expect(result.ports).toEqual(
			expect.arrayContaining([
				{ targetPort: 3000, scheme: "tcp", composeService: "api" },
				{ targetPort: 3001, scheme: "tcp", composeService: "api" },
				{ targetPort: 3002, scheme: "tcp", composeService: "api" },
				{ targetPort: 5432, scheme: "tcp", composeService: "db" },
			]),
		);
		expect(result.warnings[0]).toContain("UDP");
	});

	it("maps every managed database to its native port and secret URL", () => {
		expect(discoverDatabasePorts("postgres")).toEqual([
			{ targetPort: 5432, scheme: "postgres", secret: true },
		]);
		expect(
			discoverDatabasePorts("libsql").map((port) => port.targetPort),
		).toEqual([8080, 5001]);
	});
});

describe("Tailscale desired state and private templates", () => {
	it("preserves an existing hostname across renames", () => {
		const existing = {
			ownerKey: "application:app-id:",
			readableName: "Old / Name",
			serviceName: "svc:dokploy-old-name-appid123",
			fqdn: "dokploy-old-name-appid123.example.ts.net",
		};
		const [endpoint] = buildDesiredTailscaleEndpoints({
			dnsSuffix: "example.ts.net",
			existing: [existing],
			resources: [
				{
					organizationId: "org",
					projectId: "project",
					projectName: "Renamed project",
					environmentName: "prod",
					resourceType: "application",
					resourceId: "app-id",
					name: "Renamed app",
					appName: "app_immutable",
					serverId: null,
					status: "done",
					ports: [{ targetPort: 8080, protocol: "tcp" }],
					domains: [],
				},
			],
		});
		expect(endpoint?.serviceName).toBe(existing.serviceName);
		expect(endpoint?.fqdn).toBe(existing.fqdn);
	});

	it("resolves self and same-project endpoint URLs and rejects unknown references", () => {
		const context: PrivateEnvironmentContext = {
			selfReferenceKey: "web_app",
			endpoints: {
				web_app: {
					host: "web.tail.ts.net",
					urls: { 8080: "http://web.tail.ts.net:8080" },
				},
				db_app: {
					host: "db.tail.ts.net",
					urls: { 5432: "postgres://db.tail.ts.net:5432" },
				},
			},
		};
		expect(
			prepareEnvironmentVariables(
				"SELF=${{private.self.host}}\nDATABASE_URL=${{private.db_app.url.5432}}",
				null,
				null,
				context,
			),
		).toEqual([
			"SELF=web.tail.ts.net",
			"DATABASE_URL=postgres://db.tail.ts.net:5432",
		]);
		expect(() =>
			prepareEnvironmentVariables(
				"BAD=${{private.other_project.host}}",
				null,
				null,
				context,
			),
		).toThrow("out-of-project");
	});
});

describe("Tailscale CIDR and client adoption matrix", () => {
	it("detects conflicts and allocates stable, isolated organization subnets", () => {
		expect(cidrsOverlap("10.240.1.0/24", "10.240.1.128/25")).toBe(true);
		expect(selectTranslatedCidr(["10.0.0.0/8"])).toBe("172.20.0.0/14");
		const first = selectOrganizationTranslatedCidr([], "org-one");
		const second = selectOrganizationTranslatedCidr(
			first ? [first] : [],
			"org-two",
		);
		expect(first).toMatch(/\/24$/);
		expect(second).not.toBe(first);
		const address = allocateTranslatedIp(
			first ?? "10.240.0.0/24",
			"endpoint",
			new Set(),
		);
		expect(address).not.toMatch(/\.0$|\.255$/);
	});

	it("rejects ambiguous or malformed IPv4 CIDRs", () => {
		expect(parseIpv4Cidr("1.2.3.4/24").network).toBeDefined();
		for (const malformed of [
			"1..3.4/24",
			"1e2.2.3.4/24",
			"0x10.2.3.4/24",
			"01.2.3.4/24",
			"1.2.3.4/24/extra",
		]) {
			expect(() => parseIpv4Cidr(malformed)).toThrow("Invalid IPv4 CIDR");
		}
	});

	it("adopts, requests retag, preserves another tailnet, and rejects old custom clients", () => {
		const base = {
			binary: "/usr/bin/tailscale",
			serviceActive: true,
			version: MINIMUM_TAILSCALE_SERVICES_VERSION,
			backendState: "Running",
			activeProfile: "example.com",
			tailnet: "example.com",
			tags: ["tag:dokploy"],
			deviceId: "device",
			dnsName: "host.example.ts.net",
			socket: "/var/run/tailscale/tailscaled.sock",
			installSource: "apt" as const,
			serveConfig: { version: "0.0.1", services: { "svc:user": {} } },
		};
		expect(
			decideTailscaleClientMode({
				inspection: base,
				tailnet: "example.com",
				deviceTag: "tag:dokploy",
			}).mode,
		).toBe("adopt");
		expect(
			decideTailscaleClientMode({
				inspection: { ...base, tags: [] },
				tailnet: "example.com",
				deviceTag: "tag:dokploy",
			}).mode,
		).toBe("retag");
		expect(
			decideTailscaleClientMode({
				inspection: { ...base, tailnet: "personal.example" },
				tailnet: "example.com",
				deviceTag: "tag:dokploy",
			}).mode,
		).toBe("parallel");
		expect(
			decideTailscaleClientMode({
				inspection: {
					...base,
					version: "1.20.0",
					installSource: "unknown",
				},
				tailnet: "example.com",
				deviceTag: "tag:dokploy",
			}).mode,
		).toBe("degraded");
	});

	it("uses dedicated parallel-client ownership paths and preserves user settings", () => {
		const paths = isolatedTailscalePaths("org/one", "server/two");
		expect(paths.statePath).toBe(
			"/var/lib/dokploy/tailscale/org/one/server/two",
		);
		expect(paths.socketPath).toBe(
			"/run/dokploy-tailscale/org/one/server/two.sock",
		);
		const inspection = tailscaleInspectionScript();
		expect(inspection).toContain("serve get-config --all");
		expect(inspection).toContain("jq -cn");
		expect(inspection).not.toContain("tailscale up --reset");
	});

	it("parses compact inspection output after shell noise and pretty JSON", () => {
		expect(
			parseTailscaleInspection(
				'login notice\n{"binary":"/usr/bin/tailscale","version":"1.98.8"}',
			).version,
		).toBe("1.98.8");
		expect(
			parseTailscaleInspection(
				JSON.stringify(
					{ binary: "/usr/bin/tailscale", version: "1.98.8" },
					null,
					2,
				),
			).binary,
		).toBe("/usr/bin/tailscale");
	});

	it("keeps the final isolated /30 inside the link-local address space", () => {
		const paths = isolatedTailscalePaths("org", "26156");
		expect(paths.hostAddress).toBe("169.254.255.253");
		expect(paths.namespaceAddress).toBe("169.254.255.254");
	});
});
