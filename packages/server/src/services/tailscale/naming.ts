import { createHash } from "node:crypto";

const SERVICE_LABEL_MAX = 63;
const SERVICE_PREFIX = "svc:";

export const normalizeTailscaleLabel = (value: string): string =>
	value
		.normalize("NFKD")
		.replace(/\p{M}+/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-|-$/g, "");

const truncateSegments = (segments: string[], budget: number): string => {
	const normalized = segments.map(normalizeTailscaleLabel).filter(Boolean);
	if (normalized.join("-").length <= budget) return normalized.join("-");

	const output = normalized.map((segment) => segment.split(""));
	while (
		output.reduce((total, segment) => total + segment.length, 0) +
			Math.max(0, output.length - 1) >
		budget
	) {
		const longest = output.reduce(
			(index, segment, candidate) =>
				segment.length > (output[index]?.length ?? 0) ? candidate : index,
			0,
		);
		if ((output[longest]?.length ?? 0) <= 1) break;
		output[longest]?.pop();
	}
	return output.map((segment) => segment.join("")).join("-");
};

export interface TailscaleServiceNameInput {
	project: string;
	environment: string;
	resource: string;
	resourceId: string;
	composeService?: string;
	preview?: boolean;
}

const resourceSuffix = (resourceId: string, length: number): string => {
	const normalized = normalizeTailscaleLabel(resourceId).replace(/-/g, "");
	if (normalized.length >= length) return normalized.slice(-length);
	return createHash("sha256").update(resourceId).digest("hex").slice(0, length);
};

const buildLabel = (
	input: TailscaleServiceNameInput,
	suffix: string,
): string => {
	const fixedLength = "dokploy--".length + suffix.length;
	const readable = truncateSegments(
		[
			input.project,
			input.environment,
			input.resource,
			...(input.composeService ? [input.composeService] : []),
			...(input.preview ? ["preview"] : []),
		],
		SERVICE_LABEL_MAX - fixedLength,
	);
	return `dokploy-${readable}-${suffix}`;
};

export const buildTailscaleServiceName = (
	input: TailscaleServiceNameInput,
	existingNames: ReadonlySet<string> = new Set(),
): string => {
	for (const suffixLength of [8, 12, 16]) {
		const serviceName = `${SERVICE_PREFIX}${buildLabel(
			input,
			resourceSuffix(input.resourceId, suffixLength),
		)}`;
		if (!existingNames.has(serviceName)) return serviceName;
	}

	const collisionSuffix = createHash("sha256")
		.update(
			[
				input.resourceId,
				input.composeService ?? "",
				input.preview ? "preview" : "",
			].join(":"),
		)
		.digest("hex")
		.slice(0, 20);
	return `${SERVICE_PREFIX}${buildLabel(input, collisionSuffix)}`;
};

export const tailscaleServiceFqdn = (
	serviceName: string,
	dnsSuffix: string,
): string => {
	const label = serviceName.startsWith(SERVICE_PREFIX)
		? serviceName.slice(SERVICE_PREFIX.length)
		: serviceName;
	return `${label}.${dnsSuffix.replace(/^\.+|\.+$/g, "").toLowerCase()}`;
};

export const buildTailscaleReferenceKey = (input: {
	appName: string;
	composeService?: string;
}): string =>
	input.composeService
		? `${input.appName}--${normalizeTailscaleLabel(input.composeService)}`
		: input.appName;

export { SERVICE_LABEL_MAX as TAILSCALE_SERVICE_LABEL_MAX };
