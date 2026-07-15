import { createHash } from "node:crypto";

export const TAILSCALE_TRANSLATED_CIDR_CANDIDATES = [
	"10.240.0.0/12",
	"172.20.0.0/14",
	"198.18.0.0/15",
] as const;

interface ParsedCidr {
	address: number;
	prefix: number;
	mask: number;
	network: number;
	broadcast: number;
}

const parseIpv4 = (value: string): number => {
	const octets = value.split(".").map(Number);
	if (
		octets.length !== 4 ||
		octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
	) {
		throw new Error(`Invalid IPv4 address: ${value}`);
	}
	return octets.reduce((result, octet) => ((result << 8) | octet) >>> 0, 0);
};

const formatIpv4 = (value: number): string =>
	[24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");

export const parseIpv4Cidr = (value: string): ParsedCidr => {
	const [addressText, prefixText] = value.trim().split("/");
	const prefix = Number(prefixText);
	if (!addressText || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
		throw new Error(`Invalid IPv4 CIDR: ${value}`);
	}
	const address = parseIpv4(addressText);
	const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
	const network = (address & mask) >>> 0;
	const broadcast = (network | (~mask >>> 0)) >>> 0;
	return { address, prefix, mask, network, broadcast };
};

export const cidrsOverlap = (left: string, right: string): boolean => {
	const a = parseIpv4Cidr(left);
	const b = parseIpv4Cidr(right);
	return a.network <= b.broadcast && b.network <= a.broadcast;
};

export const selectTranslatedCidr = (
	knownCidrs: readonly string[],
	candidates: readonly string[] = TAILSCALE_TRANSLATED_CIDR_CANDIDATES,
): string | null => {
	const validKnown = knownCidrs.filter((cidr) => {
		try {
			parseIpv4Cidr(cidr);
			return true;
		} catch {
			return false;
		}
	});
	return (
		candidates.find(
			(candidate) =>
				!validKnown.some((known) => cidrsOverlap(candidate, known)),
		) ?? null
	);
};

export const selectOrganizationTranslatedCidr = (
	knownCidrs: readonly string[],
	organizationId: string,
	candidates: readonly string[] = TAILSCALE_TRANSLATED_CIDR_CANDIDATES,
): string | null => {
	const validKnown = knownCidrs.filter((cidr) => {
		try {
			parseIpv4Cidr(cidr);
			return true;
		} catch {
			return false;
		}
	});
	const seed = createHash("sha256")
		.update(organizationId)
		.digest()
		.readUInt32BE(0);
	for (const candidate of candidates) {
		const pool = parseIpv4Cidr(candidate);
		const subnetPrefix = Math.max(24, pool.prefix);
		const subnetSize = 2 ** (32 - subnetPrefix);
		const subnetCount = 2 ** (subnetPrefix - pool.prefix);
		for (let attempt = 0; attempt < subnetCount; attempt += 1) {
			const index = (seed + attempt) % subnetCount;
			const subnet = `${formatIpv4(
				(pool.network + index * subnetSize) >>> 0,
			)}/${subnetPrefix}`;
			if (!validKnown.some((known) => cidrsOverlap(subnet, known)))
				return subnet;
		}
	}
	return null;
};

export const allocateTranslatedIp = (
	cidr: string,
	stableKey: string,
	occupied: ReadonlySet<string>,
): string => {
	const parsed = parseIpv4Cidr(cidr);
	const hostCount = parsed.broadcast - parsed.network - 1;
	if (hostCount < 2) throw new Error(`Translated CIDR ${cidr} is too small`);
	const digest = createHash("sha256").update(stableKey).digest();
	const seed = digest.readUInt32BE(0);
	for (let attempt = 0; attempt < hostCount; attempt += 1) {
		const offset = 1 + ((seed + attempt) % hostCount);
		const address = formatIpv4((parsed.network + offset) >>> 0);
		if (!occupied.has(address)) return address;
	}
	throw new Error(`Translated CIDR ${cidr} has no free addresses`);
};
