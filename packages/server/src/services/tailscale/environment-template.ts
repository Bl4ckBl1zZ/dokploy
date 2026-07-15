export interface PrivateEnvironmentEndpoint {
	host: string;
	urls: Record<number, string>;
}

export interface PrivateEnvironmentContext {
	selfReferenceKey: string;
	endpoints: Record<string, PrivateEnvironmentEndpoint>;
}

const privateReferencePattern =
	/\$\{\{private\.([a-zA-Z0-9_-]+)\.(host|url\.([0-9]+))\}\}/g;

export const resolvePrivateEnvironmentReferences = (
	value: string,
	context?: PrivateEnvironmentContext,
): string =>
	value.replace(
		privateReferencePattern,
		(_match, requestedKey: string, selector: string, portText?: string) => {
			if (!context) {
				throw new Error(
					`Private environment reference private.${requestedKey}.${selector} cannot be resolved outside a project deployment`,
				);
			}

			const referenceKey =
				requestedKey === "self" ? context.selfReferenceKey : requestedKey;
			const endpoint = context.endpoints[referenceKey];
			if (!endpoint) {
				throw new Error(
					`Invalid or out-of-project private endpoint reference: private.${requestedKey}`,
				);
			}
			if (selector === "host") return endpoint.host;

			const port = Number(portText);
			const url = endpoint.urls[port];
			if (!url) {
				throw new Error(
					`Private endpoint ${referenceKey} does not expose TCP port ${port}`,
				);
			}
			return url;
		},
	);
