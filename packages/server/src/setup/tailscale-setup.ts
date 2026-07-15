import { createHash } from "node:crypto";
import { quote } from "shell-quote";
import { execAsync, execAsyncRemote } from "../utils/process/execAsync";

export const MINIMUM_TAILSCALE_SERVICES_VERSION = "1.86.0";

export interface TailscaleInspection {
	binary: string | null;
	serviceActive: boolean;
	version: string | null;
	backendState: string | null;
	activeProfile: string | null;
	tailnet: string | null;
	tags: string[];
	deviceId: string | null;
	dnsName: string | null;
	socket: string;
	installSource:
		| "apt"
		| "rpm"
		| "pacman"
		| "apk"
		| "docker"
		| "unknown"
		| "missing";
	serveConfig: Record<string, unknown> | null;
}

export type TailscaleClientDecision =
	| { mode: "install"; ownership: "managed"; reason: string }
	| { mode: "enroll"; ownership: "managed"; reason: string }
	| { mode: "adopt"; ownership: "adopted"; reason: string }
	| { mode: "retag"; ownership: "pending_retag"; reason: string }
	| { mode: "parallel"; ownership: "parallel"; reason: string }
	| { mode: "degraded"; ownership: "managed"; reason: string };

const normalizeVersion = (version: string | null): number[] =>
	(version?.match(/\d+(?:\.\d+){1,3}/)?.[0] ?? "0.0.0").split(".").map(Number);

export const compareTailscaleVersions = (
	left: string | null,
	right: string,
): number => {
	const a = normalizeVersion(left);
	const b = normalizeVersion(right);
	for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
		const delta = (a[index] ?? 0) - (b[index] ?? 0);
		if (delta !== 0) return delta;
	}
	return 0;
};

export const decideTailscaleClientMode = (input: {
	inspection: TailscaleInspection;
	tailnet: string;
	deviceTag: string;
	forceIsolated?: boolean;
}): TailscaleClientDecision => {
	const { inspection } = input;
	if (!inspection.binary) {
		return {
			mode: "install",
			ownership: "managed",
			reason: "Tailscale is not installed",
		};
	}
	if (
		inspection.installSource === "unknown" &&
		compareTailscaleVersions(
			inspection.version,
			MINIMUM_TAILSCALE_SERVICES_VERSION,
		) < 0
	) {
		return {
			mode: "degraded",
			ownership: "managed",
			reason: `Custom Tailscale ${inspection.version ?? "version unknown"} is below ${MINIMUM_TAILSCALE_SERVICES_VERSION}; upgrade it manually`,
		};
	}
	if (input.forceIsolated) {
		return {
			mode: "parallel",
			ownership: "parallel",
			reason: "This gateway requires an organization-isolated client",
		};
	}
	if (!inspection.tailnet || inspection.backendState !== "Running") {
		return {
			mode: "enroll",
			ownership: "managed",
			reason: "The existing client is inactive or logged out",
		};
	}
	if (inspection.tailnet !== input.tailnet) {
		return {
			mode: "parallel",
			ownership: "parallel",
			reason: `The host client belongs to ${inspection.tailnet}; preserving it and creating an isolated client`,
		};
	}
	if (!inspection.tags.includes(input.deviceTag)) {
		return {
			mode: "retag",
			ownership: "pending_retag",
			reason: `The client is on the correct tailnet but is not owned by ${input.deviceTag}`,
		};
	}
	return {
		mode: "adopt",
		ownership: "adopted",
		reason: "The existing tagged client is compatible",
	};
};

export const tailscaleInspectionScript = (
	socket = "/var/run/tailscale/tailscaled.sock",
) => `
set +e
TS_SOCKET=${quote([socket])}
if ! command -v tailscale >/dev/null 2>&1; then
	printf '%s\n' '{"binary":null,"serviceActive":false,"version":null,"backendState":null,"activeProfile":null,"tailnet":null,"tags":[],"deviceId":null,"dnsName":null,"socket":"${socket}","installSource":"missing","serveConfig":null}'
	exit 0
fi
TS_BINARY=$(command -v tailscale)
TS_VERSION=$(tailscale version 2>/dev/null | head -n1 | tr -d '\r')
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet tailscaled.service; then TS_ACTIVE=true; else TS_ACTIVE=false; fi
if command -v dpkg-query >/dev/null 2>&1 && dpkg-query -W -f='\${Status}' tailscale 2>/dev/null | grep -q 'install ok installed'; then
	TS_SOURCE=apt
elif command -v rpm >/dev/null 2>&1 && rpm -q tailscale >/dev/null 2>&1; then
	TS_SOURCE=rpm
elif command -v pacman >/dev/null 2>&1 && pacman -Q tailscale >/dev/null 2>&1; then
	TS_SOURCE=pacman
elif command -v apk >/dev/null 2>&1 && apk info -e tailscale >/dev/null 2>&1; then
	TS_SOURCE=apk
else
	TS_SOURCE=unknown
fi
TS_STATUS=$(tailscale --socket="$TS_SOCKET" status --json 2>/dev/null || printf '{}')
TS_SERVE=$(tailscale --socket="$TS_SOCKET" serve get-config --all 2>/dev/null || printf 'null')
if command -v jq >/dev/null 2>&1; then
	jq -n \
		--arg binary "$TS_BINARY" \
		--argjson serviceActive "$TS_ACTIVE" \
		--arg version "$TS_VERSION" \
		--arg socket "$TS_SOCKET" \
		--arg installSource "$TS_SOURCE" \
		--argjson status "$TS_STATUS" \
		--argjson serveConfig "$TS_SERVE" \
		'{binary:$binary,serviceActive:$serviceActive,version:$version,backendState:($status.BackendState // null),activeProfile:($status.CurrentTailnet.Name // null),tailnet:($status.CurrentTailnet.Name // null),tags:($status.Self.Tags // []),deviceId:($status.Self.ID // null),dnsName:($status.Self.DNSName // null),socket:$socket,installSource:$installSource,serveConfig:$serveConfig}'
else
	# Setup Server installs jq. This fallback remains valid JSON and avoids guessing at status JSON.
	printf '{"binary":"%s","serviceActive":%s,"version":"%s","backendState":null,"activeProfile":null,"tailnet":null,"tags":[],"deviceId":null,"dnsName":null,"socket":"%s","installSource":"%s","serveConfig":null}\n' "$TS_BINARY" "$TS_ACTIVE" "$TS_VERSION" "$TS_SOCKET" "$TS_SOURCE"
fi
`;

const parseInspection = (stdout: string): TailscaleInspection => {
	const lines = stdout.trim().split("\n");
	for (let index = lines.length - 1; index >= 0; index -= 1) {
		try {
			return JSON.parse(lines[index] ?? "") as TailscaleInspection;
		} catch {
			// Installation scripts can write before the final structured result.
		}
	}
	throw new Error("Tailscale inspection did not return structured JSON");
};

const runGatewayCommand = async (
	serverId: string | null,
	command: string,
	onData?: (data: string) => void,
) =>
	serverId ? execAsyncRemote(serverId, command, onData) : execAsync(command);

export const inspectTailscaleClient = async (
	serverId: string | null,
	socket?: string,
): Promise<TailscaleInspection> => {
	const result = await runGatewayCommand(
		serverId,
		tailscaleInspectionScript(socket),
	);
	return parseInspection(result.stdout);
};

export const upgradeTailscalePackage = async (
	serverId: string | null,
	installSource: TailscaleInspection["installSource"],
	onData?: (data: string) => void,
): Promise<void> => {
	const commandBySource: Partial<
		Record<TailscaleInspection["installSource"], string>
	> = {
		apt: "$SUDO apt-get update -y >/dev/null && $SUDO apt-get install --only-upgrade -y tailscale",
		rpm: "$SUDO sh -c 'command -v dnf >/dev/null && dnf upgrade -y tailscale || yum update -y tailscale'",
		pacman: "$SUDO pacman -Syu --noconfirm tailscale",
		apk: "$SUDO apk upgrade tailscale",
	};
	const command = commandBySource[installSource];
	if (!command) {
		throw new Error(
			"Unknown/custom Tailscale installations must be upgraded manually",
		);
	}
	await runGatewayCommand(
		serverId,
		`set -eu; if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi; ${command}`,
		onData,
	);
};

const nativeInstallScript = `
set -eu
if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi
if ! command -v tailscale >/dev/null 2>&1; then
	curl -fsSL https://tailscale.com/install.sh | sh
fi
if command -v systemctl >/dev/null 2>&1; then
	$SUDO systemctl enable --now tailscaled.service
elif command -v rc-service >/dev/null 2>&1; then
	$SUDO rc-update add tailscale default >/dev/null 2>&1 || true
	$SUDO rc-service tailscale start
else
	echo 'No supported service manager was found for tailscaled' >&2
	exit 1
fi
`;

export const enrollNativeTailscaleClient = async (input: {
	serverId: string | null;
	authKey: string;
	deviceTag: string;
	install?: boolean;
	onData?: (data: string) => void;
}): Promise<TailscaleInspection> => {
	if (input.install) {
		await runGatewayCommand(input.serverId, nativeInstallScript, input.onData);
	}
	const authKey = quote([input.authKey]);
	const tag = quote([input.deviceTag]);
	await runGatewayCommand(
		input.serverId,
		`set -eu; if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi; $SUDO tailscale up --auth-key=${authKey} --advertise-tags=${tag} --reset=false`,
		input.onData,
	);
	return inspectTailscaleClient(input.serverId);
};

export interface IsolatedTailscalePaths {
	statePath: string;
	socketPath: string;
	interfaceName: string;
	unitName: string;
	networkNamespace: string;
	hostInterface: string;
	namespaceInterface: string;
	hostAddress: string;
	namespaceAddress: string;
}

export const isolatedTailscalePaths = (
	organizationId: string,
	serverId: string,
): IsolatedTailscalePaths => {
	const org = organizationId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
	const srv = serverId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
	const hash = createHash("sha256")
		.update(`${organizationId}:${serverId}`)
		.digest();
	const id = hash.toString("hex").slice(0, 7);
	const subnet = 4 * (1 + (hash[0] ?? 1) * 64 + ((hash[1] ?? 1) % 64));
	const third = Math.floor(subnet / 256);
	const fourth = subnet % 256;
	return {
		statePath: `/var/lib/dokploy/tailscale/${organizationId}/${serverId}`,
		socketPath: `/run/dokploy-tailscale/${organizationId}/${serverId}.sock`,
		interfaceName: `dkts${id}`.slice(0, 15),
		unitName: `dokploy-tailscale-${org}-${srv}.service`,
		networkNamespace: `dokploy-ts-${org}-${srv}`,
		hostInterface: `dtsh${id}`.slice(0, 15),
		namespaceInterface: `dtsn${id}`.slice(0, 15),
		hostAddress: `169.254.${third}.${fourth + 1}`,
		namespaceAddress: `169.254.${third}.${fourth + 2}`,
	};
};

const isolatedSetupScript = (input: {
	paths: IsolatedTailscalePaths;
	authKey: string;
	deviceTag: string;
}) => {
	const p = input.paths;
	const unitPath = `/etc/systemd/system/${p.unitName}`;
	const networkScript = `/usr/local/libexec/${p.unitName.replace(/\.service$/, "")}-network`;
	const unit = `[Unit]
Description=Dokploy isolated Tailscale gateway
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStartPre=${networkScript}
ExecStart=/usr/bin/ip netns exec ${p.networkNamespace} /usr/bin/tailscaled --state=${p.statePath}/tailscaled.state --socket=${p.socketPath} --tun=${p.interfaceName}
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
`;
	const network = `#!/bin/sh
set -eu
ip netns add ${p.networkNamespace} 2>/dev/null || true
ip link show ${p.hostInterface} >/dev/null 2>&1 || ip link add ${p.hostInterface} type veth peer name ${p.namespaceInterface}
ip link set ${p.namespaceInterface} netns ${p.networkNamespace} 2>/dev/null || true
ip address replace ${p.hostAddress}/30 dev ${p.hostInterface}
ip link set ${p.hostInterface} up
ip -n ${p.networkNamespace} link set lo up
ip -n ${p.networkNamespace} address replace ${p.namespaceAddress}/30 dev ${p.namespaceInterface}
ip -n ${p.networkNamespace} link set ${p.namespaceInterface} up
ip -n ${p.networkNamespace} route replace default via ${p.hostAddress}
sysctl -p /etc/sysctl.d/90-dokploy-tailscale-${p.interfaceName}.conf >/dev/null
nft list table inet dokploy_tailscale >/dev/null 2>&1 || nft add table inet dokploy_tailscale
nft list chain inet dokploy_tailscale forward >/dev/null 2>&1 || nft 'add chain inet dokploy_tailscale forward { type filter hook forward priority filter; policy accept; }'
nft list table ip dokploy_tailscale_nat >/dev/null 2>&1 || nft add table ip dokploy_tailscale_nat
nft list chain ip dokploy_tailscale_nat postrouting >/dev/null 2>&1 || nft 'add chain ip dokploy_tailscale_nat postrouting { type nat hook postrouting priority srcnat; policy accept; }'
nft list chain inet dokploy_tailscale forward | grep -q 'dokploy-${p.interfaceName}-out' || nft add rule inet dokploy_tailscale forward iifname ${p.hostInterface} accept comment 'dokploy-${p.interfaceName}-out'
nft list chain inet dokploy_tailscale forward | grep -q 'dokploy-${p.interfaceName}-in' || nft add rule inet dokploy_tailscale forward oifname ${p.hostInterface} ct state related,established accept comment 'dokploy-${p.interfaceName}-in'
nft list chain ip dokploy_tailscale_nat postrouting | grep -q 'dokploy-${p.interfaceName}-nat' || nft add rule ip dokploy_tailscale_nat postrouting ip saddr ${p.namespaceAddress}/32 masquerade comment 'dokploy-${p.interfaceName}-nat'
`;
	const unitBase64 = Buffer.from(unit).toString("base64");
	const networkBase64 = Buffer.from(network).toString("base64");
	const authKey = quote([input.authKey]);
	const tag = quote([input.deviceTag]);
	return `
set -eu
if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi
command -v systemctl >/dev/null 2>&1 || { echo 'Parallel Tailscale clients require systemd' >&2; exit 1; }
command -v ip >/dev/null 2>&1 || { echo 'Parallel Tailscale clients require iproute2' >&2; exit 1; }
command -v nft >/dev/null 2>&1 || { echo 'Parallel Tailscale clients require nftables' >&2; exit 1; }
if ! command -v tailscale >/dev/null 2>&1; then curl -fsSL https://tailscale.com/install.sh | sh; fi
$SUDO mkdir -p ${quote([p.statePath])} ${quote([p.socketPath.slice(0, p.socketPath.lastIndexOf("/"))])} /usr/local/libexec
printf '%s' ${quote([unitBase64])} | base64 -d | $SUDO tee ${quote([unitPath])} >/dev/null
printf '%s' ${quote([networkBase64])} | base64 -d | $SUDO tee ${quote([networkScript])} >/dev/null
$SUDO chmod 0755 ${quote([networkScript])}
printf '%s\n' 'net.ipv4.ip_forward=1' | $SUDO tee /etc/sysctl.d/90-dokploy-tailscale-${p.interfaceName}.conf >/dev/null
$SUDO systemctl daemon-reload
$SUDO systemctl enable --now ${quote([p.unitName])}
for i in $(seq 1 30); do [ -S ${quote([p.socketPath])} ] && break; sleep 1; done
$SUDO ip netns exec ${quote([p.networkNamespace])} tailscale --socket=${quote([p.socketPath])} up --auth-key=${authKey} --advertise-tags=${tag} --reset=false
`;
};

export const setupIsolatedTailscaleClient = async (input: {
	serverId: string | null;
	organizationId: string;
	gatewayKey: string;
	authKey: string;
	deviceTag: string;
	onData?: (data: string) => void;
}): Promise<{
	paths: IsolatedTailscalePaths;
	inspection: TailscaleInspection;
}> => {
	const paths = isolatedTailscalePaths(input.organizationId, input.gatewayKey);
	await runGatewayCommand(
		input.serverId,
		isolatedSetupScript({
			paths,
			authKey: input.authKey,
			deviceTag: input.deviceTag,
		}),
		input.onData,
	);
	return {
		paths,
		inspection: await inspectTailscaleClient(input.serverId, paths.socketPath),
	};
};

export const applyTailscaleServeConfig = async (input: {
	serverId: string | null;
	socketPath: string;
	config: Record<string, unknown>;
	onData?: (data: string) => void;
}): Promise<void> => {
	const encoded = Buffer.from(JSON.stringify(input.config)).toString("base64");
	const command = `set -eu; tmp=$(mktemp); trap 'rm -f "$tmp"' EXIT; printf '%s' ${quote([encoded])} | base64 -d > "$tmp"; tailscale --socket=${quote([input.socketPath])} serve set-config --all "$tmp"`;
	await runGatewayCommand(input.serverId, command, input.onData);
};

export const advertiseTailscaleService = async (input: {
	serverId: string | null;
	socketPath: string;
	serviceName: string;
	drain?: boolean;
}): Promise<void> => {
	const action = input.drain
		? `serve drain ${quote([input.serviceName])}`
		: `serve advertise ${quote([input.serviceName])}`;
	await runGatewayCommand(
		input.serverId,
		`tailscale --socket=${quote([input.socketPath])} ${action}`,
	);
};

export const panelTailscaleContainerName = (organizationId: string): string =>
	`dokploy-tailscale-${organizationId
		.replace(/[^a-zA-Z0-9]/g, "")
		.slice(0, 12)
		.toLowerCase()}`;

export const inspectPanelTailscaleClient = async (
	organizationId: string,
): Promise<TailscaleInspection> => {
	const container = panelTailscaleContainerName(organizationId);
	const exists = await execAsync(
		`docker inspect ${quote([container])} >/dev/null 2>&1 && printf yes || printf no`,
	);
	if (exists.stdout.trim() !== "yes") {
		return {
			binary: null,
			serviceActive: false,
			version: null,
			backendState: null,
			activeProfile: null,
			tailnet: null,
			tags: [],
			deviceId: null,
			dnsName: null,
			socket: "/var/run/tailscale/tailscaled.sock",
			installSource: "missing",
			serveConfig: null,
		};
	}
	const [statusResult, versionResult, serveResult, runningResult] =
		await Promise.all([
			execAsync(
				`docker exec ${quote([container])} tailscale status --json 2>/dev/null || printf '{}'`,
			),
			execAsync(
				`docker exec ${quote([container])} tailscale version 2>/dev/null | head -n1`,
			),
			execAsync(
				`docker exec ${quote([container])} tailscale serve get-config --all 2>/dev/null || printf 'null'`,
			),
			execAsync(
				`docker inspect -f '{{.State.Running}}' ${quote([container])} 2>/dev/null || printf false`,
			),
		]);
	const status = JSON.parse(statusResult.stdout || "{}") as {
		BackendState?: string;
		CurrentTailnet?: { Name?: string };
		Self?: { Tags?: string[]; ID?: string; DNSName?: string };
	};
	return {
		binary: "/usr/local/bin/tailscale",
		serviceActive: runningResult.stdout.trim() === "true",
		version: versionResult.stdout.trim() || null,
		backendState: status.BackendState ?? null,
		activeProfile: status.CurrentTailnet?.Name ?? null,
		tailnet: status.CurrentTailnet?.Name ?? null,
		tags: status.Self?.Tags ?? [],
		deviceId: status.Self?.ID ?? null,
		dnsName: status.Self?.DNSName ?? null,
		socket: "/var/run/tailscale/tailscaled.sock",
		installSource: "docker",
		serveConfig: JSON.parse(serveResult.stdout || "null") as Record<
			string,
			unknown
		> | null,
	};
};

export const setupPanelTailscaleClient = async (input: {
	organizationId: string;
	authKey: string;
	deviceTag: string;
	onData?: (data: string) => void;
}): Promise<TailscaleInspection> => {
	const container = panelTailscaleContainerName(input.organizationId);
	const volume = `${container}-state`;
	input.onData?.(
		"Provisioning organization-isolated panel Tailscale gateway…\n",
	);
	await execAsync("docker pull tailscale/tailscale:stable");
	await execAsync(
		"docker network inspect dokploy-network >/dev/null 2>&1 || docker network create --attachable dokploy-network",
	);
	const exists = await execAsync(
		`docker inspect ${quote([container])} >/dev/null 2>&1 && printf yes || printf no`,
	);
	if (exists.stdout.trim() !== "yes") {
		await execAsync(
			`docker run -d --name ${quote([container])} --restart unless-stopped --network dokploy-network --cap-add NET_ADMIN --cap-add NET_RAW --device /dev/net/tun -v ${quote([`${volume}:/var/lib/tailscale`])} --label com.dokploy.managed=true --label com.dokploy.role=tailscale-panel-gateway tailscale/tailscale:stable tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock`,
		);
	} else {
		await execAsync(`docker start ${quote([container])} >/dev/null`);
	}
	const authKey = quote([input.authKey]);
	const tag = quote([input.deviceTag]);
	await execAsync(
		`docker exec ${quote([container])} tailscale up --auth-key=${authKey} --advertise-tags=${tag} --reset=false`,
	);
	return inspectPanelTailscaleClient(input.organizationId);
};

export const applyPanelTailscaleServeConfig = async (input: {
	organizationId: string;
	config: Record<string, unknown>;
}): Promise<void> => {
	const container = panelTailscaleContainerName(input.organizationId);
	const encoded = Buffer.from(JSON.stringify(input.config)).toString("base64");
	await execAsync(
		`docker exec ${quote([container])} sh -c ${quote([`printf '%s' ${quote([encoded])} | base64 -d > /tmp/dokploy-serve.json && tailscale serve set-config --all /tmp/dokploy-serve.json && rm -f /tmp/dokploy-serve.json`])}`,
	);
};

export const advertisePanelTailscaleService = async (input: {
	organizationId: string;
	serviceName: string;
	drain?: boolean;
}): Promise<void> => {
	const container = panelTailscaleContainerName(input.organizationId);
	const action = input.drain ? "drain" : "advertise";
	await execAsync(
		`docker exec ${quote([container])} tailscale serve ${action} ${quote([input.serviceName])}`,
	);
};

export const purgeTailscaleGatewayClient = async (input: {
	organizationId: string;
	serverId: string | null;
	ownership: "managed" | "adopted" | "parallel" | "pending_retag";
	unitName?: string | null;
	networkNamespace?: string | null;
	statePath?: string | null;
	socketPath?: string | null;
}): Promise<void> => {
	if (input.ownership === "adopted" || input.ownership === "pending_retag") {
		return;
	}
	if (!input.serverId) {
		const container = panelTailscaleContainerName(input.organizationId);
		await execAsync(
			`docker rm -f ${quote([container])} >/dev/null 2>&1 || true; docker volume rm ${quote([`${container}-state`])} >/dev/null 2>&1 || true`,
		);
		return;
	}
	if (input.ownership === "parallel") {
		if (
			!input.unitName ||
			!input.networkNamespace ||
			!input.statePath ||
			!input.socketPath
		) {
			throw new Error(
				"Refusing to remove an isolated Tailscale client with incomplete ownership metadata",
			);
		}
		const unit = input.unitName ?? "";
		const namespace = input.networkNamespace ?? "";
		const statePath = input.statePath ?? "";
		const socketPath = input.socketPath ?? "";
		await execAsyncRemote(
			input.serverId,
			`set +e; if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi; $SUDO systemctl disable --now ${quote([unit])}; $SUDO rm -f ${quote([`/etc/systemd/system/${unit}`])} ${quote([socketPath])}; $SUDO rm -rf ${quote([statePath])}; $SUDO ip netns delete ${quote([namespace])}; $SUDO systemctl daemon-reload`,
		);
		return;
	}
	await execAsyncRemote(
		input.serverId,
		`set +e; if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo -n"; fi; $SUDO tailscale logout`,
	);
};
