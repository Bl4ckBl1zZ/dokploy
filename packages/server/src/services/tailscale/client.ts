import { createHash } from "node:crypto";

const DEFAULT_API_BASE = "https://api.tailscale.com/api/v2";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 10_000;
const REQUIRED_SCOPES = ["auth_keys", "services", "devices:core"] as const;

export interface TailscaleClientOptions {
	clientId: string;
	clientSecret: string;
	tailnet: string;
	deviceTag?: string;
	apiBase?: string;
	timeoutMs?: number;
	fetch?: typeof fetch;
	now?: () => number;
	sleep?: (ms: number) => Promise<void>;
}

interface OAuthToken {
	accessToken: string;
	expiresAt: number;
	scopes: string[];
}

interface OAuthTokenResponse {
	access_token: string;
	expires_in: number;
	scope?: string;
	token_type: string;
}

export interface TailscaleDevice {
	id: string;
	stableID?: string;
	name?: string;
	hostname?: string;
	addresses?: string[];
	tags?: string[];
	user?: string;
	os?: string;
	clientVersion?: string;
	lastSeen?: string;
	connectedToControl?: boolean;
}

export interface TailscaleService {
	name: string;
	addrs?: string[];
	comment?: string;
	ports?: string[];
	tags?: string[];
}

export interface TailscaleServiceHost {
	stableNodeID: string;
	approvalLevel: "not-approved" | "approved:auto" | "approved:manual";
	configured: string;
}

export interface TailscaleAuthKey {
	id: string;
	key: string;
	expires?: string;
}

export class TailscaleApiError extends Error {
	readonly status: number;
	readonly retryable: boolean;
	readonly retryAfterMs: number | null;

	constructor(input: {
		message: string;
		status: number;
		retryable: boolean;
		retryAfterMs?: number | null;
	}) {
		super(input.message);
		this.name = "TailscaleApiError";
		this.status = input.status;
		this.retryable = input.retryable;
		this.retryAfterMs = input.retryAfterMs ?? null;
	}
}

const parseRetryAfter = (value: string | null, now: number): number | null => {
	if (!value) return null;
	const seconds = Number(value);
	if (Number.isFinite(seconds)) {
		return Math.min(Math.max(0, seconds * 1000), MAX_BACKOFF_MS);
	}
	const date = Date.parse(value);
	if (Number.isNaN(date)) return null;
	return Math.min(Math.max(0, date - now), MAX_BACKOFF_MS);
};

const isRetryable = (status: number) => status === 429 || status >= 500;

const defaultSleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

const normalizeScopes = (scope: string | undefined): string[] =>
	(scope ?? "")
		.split(/\s+/)
		.map((entry) => entry.trim())
		.filter(Boolean);

export class TailscaleClient {
	private readonly clientId: string;
	private readonly clientSecret: string;
	private readonly tailnet: string;
	private readonly deviceTag: string;
	private readonly apiBase: string;
	private readonly timeoutMs: number;
	private readonly fetchImpl: typeof fetch;
	private readonly now: () => number;
	private readonly sleep: (ms: number) => Promise<void>;
	private token: OAuthToken | null = null;
	private tokenPromise: Promise<OAuthToken> | null = null;

	constructor(options: TailscaleClientOptions) {
		this.clientId = options.clientId;
		this.clientSecret = options.clientSecret;
		this.tailnet = options.tailnet;
		this.deviceTag = options.deviceTag ?? "tag:dokploy";
		this.apiBase = (options.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, "");
		this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		this.fetchImpl = options.fetch ?? fetch;
		this.now = options.now ?? Date.now;
		this.sleep = options.sleep ?? defaultSleep;
	}

	private async fetchWithRetry(
		url: string,
		init: RequestInit,
	): Promise<Response> {
		let backoff = 500;
		for (let attempt = 0; ; attempt += 1) {
			let response: Response;
			try {
				response = await this.fetchImpl(url, {
					...init,
					signal: AbortSignal.timeout(this.timeoutMs),
				});
			} catch (error) {
				if (attempt < MAX_RETRIES) {
					await this.sleep(backoff);
					backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
					continue;
				}
				throw new TailscaleApiError({
					message:
						error instanceof Error && error.name === "TimeoutError"
							? "Tailscale API request timed out"
							: "Tailscale API request failed",
					status: 0,
					retryable: true,
				});
			}

			if (response.ok) return response;
			const retryAfterMs = parseRetryAfter(
				response.headers.get("retry-after"),
				this.now(),
			);
			if (isRetryable(response.status) && attempt < MAX_RETRIES) {
				await this.sleep(retryAfterMs ?? backoff);
				backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
				continue;
			}

			throw new TailscaleApiError({
				message: `Tailscale API returned HTTP ${response.status}`,
				status: response.status,
				retryable: isRetryable(response.status),
				retryAfterMs,
			});
		}
	}

	private async requestToken(): Promise<OAuthToken> {
		const body = new URLSearchParams({
			client_id: this.clientId,
			client_secret: this.clientSecret,
			grant_type: "client_credentials",
			scope: REQUIRED_SCOPES.join(" "),
			tags: this.deviceTag,
		});
		const response = await this.fetchWithRetry(`${this.apiBase}/oauth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});
		const payload = (await response.json()) as OAuthTokenResponse;
		if (!payload.access_token || !payload.expires_in) {
			throw new TailscaleApiError({
				message: "Tailscale OAuth response was incomplete",
				status: response.status,
				retryable: false,
			});
		}
		return {
			accessToken: payload.access_token,
			expiresAt: this.now() + payload.expires_in * 1000,
			scopes: normalizeScopes(payload.scope),
		};
	}

	private async getToken(): Promise<OAuthToken> {
		if (this.token && this.token.expiresAt - 60_000 > this.now()) {
			return this.token;
		}
		if (!this.tokenPromise) {
			this.tokenPromise = this.requestToken().then((token) => {
				this.token = token;
				return token;
			});
		}
		try {
			return await this.tokenPromise;
		} finally {
			this.tokenPromise = null;
		}
	}

	private tailnetPath(path: string): string {
		return `/tailnet/${encodeURIComponent(this.tailnet)}${path}`;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: unknown,
	): Promise<T> {
		let token = await this.getToken();
		try {
			const response = await this.fetchWithRetry(`${this.apiBase}${path}`, {
				method,
				headers: {
					Authorization: `Bearer ${token.accessToken}`,
					"Content-Type": "application/json",
				},
				body: body === undefined ? undefined : JSON.stringify(body),
			});
			if (
				response.status === 204 ||
				response.headers.get("content-length") === "0"
			) {
				return undefined as T;
			}
			const text = await response.text();
			return (text ? JSON.parse(text) : undefined) as T;
		} catch (error) {
			if (error instanceof TailscaleApiError && error.status === 401) {
				this.token = null;
				token = await this.getToken();
				const response = await this.fetchWithRetry(`${this.apiBase}${path}`, {
					method,
					headers: {
						Authorization: `Bearer ${token.accessToken}`,
						"Content-Type": "application/json",
					},
					body: body === undefined ? undefined : JSON.stringify(body),
				});
				const text = await response.text();
				return (text ? JSON.parse(text) : undefined) as T;
			}
			throw error;
		}
	}

	async validateCredentials(): Promise<{
		tailnet: string;
		tag: string;
		scopes: string[];
	}> {
		const token = await this.getToken();
		const scopeSet = new Set(token.scopes);
		if (
			!scopeSet.has("all") &&
			REQUIRED_SCOPES.some((scope) => !scopeSet.has(scope))
		) {
			throw new TailscaleApiError({
				message: `Tailscale OAuth client must grant ${REQUIRED_SCOPES.join(", ")}`,
				status: 403,
				retryable: false,
			});
		}

		await Promise.all([this.listDevices(), this.listServices()]);
		const validationKey = await this.createAuthKey({
			description: "Dokploy credential validation",
			expirySeconds: 300,
		});
		await this.deleteKey(validationKey.id).catch(() => undefined);
		return { tailnet: this.tailnet, tag: this.deviceTag, scopes: token.scopes };
	}

	async listDevices(): Promise<TailscaleDevice[]> {
		const result = await this.request<{ devices?: TailscaleDevice[] }>(
			"GET",
			this.tailnetPath("/devices"),
		);
		return result.devices ?? [];
	}

	async setDeviceTags(deviceId: string, tags: string[]): Promise<void> {
		await this.request("POST", `/device/${encodeURIComponent(deviceId)}/tags`, {
			tags,
		});
	}

	async deleteDevice(deviceId: string): Promise<void> {
		await this.request("DELETE", `/device/${encodeURIComponent(deviceId)}`);
	}

	async createAuthKey(options?: {
		description?: string;
		expirySeconds?: number;
	}): Promise<TailscaleAuthKey> {
		return this.request<TailscaleAuthKey>("POST", this.tailnetPath("/keys"), {
			keyType: "auth",
			description: options?.description ?? "Dokploy gateway enrollment",
			expirySeconds: options?.expirySeconds ?? 600,
			capabilities: {
				devices: {
					create: {
						reusable: false,
						ephemeral: false,
						preauthorized: true,
						tags: [this.deviceTag],
					},
				},
			},
		});
	}

	async deleteKey(keyId: string): Promise<void> {
		await this.request(
			"DELETE",
			`${this.tailnetPath("/keys")}/${encodeURIComponent(keyId)}`,
		);
	}

	async listServices(): Promise<TailscaleService[]> {
		const result = await this.request<{ vipServices?: TailscaleService[] }>(
			"GET",
			this.tailnetPath("/services"),
		);
		return result.vipServices ?? [];
	}

	async getService(name: string): Promise<TailscaleService | null> {
		try {
			return await this.request<TailscaleService>(
				"GET",
				`${this.tailnetPath("/services")}/${encodeURIComponent(name)}`,
			);
		} catch (error) {
			if (error instanceof TailscaleApiError && error.status === 404)
				return null;
			throw error;
		}
	}

	async upsertService(service: {
		name: string;
		ports: number[];
		comment: string;
		tags?: string[];
	}): Promise<TailscaleService> {
		return this.request<TailscaleService>(
			"PUT",
			`${this.tailnetPath("/services")}/${encodeURIComponent(service.name)}`,
			{
				name: service.name,
				ports: service.ports.map((port) => `tcp:${port}`),
				comment: service.comment,
				tags: service.tags ?? [],
			},
		);
	}

	async deleteService(name: string): Promise<void> {
		await this.request(
			"DELETE",
			`${this.tailnetPath("/services")}/${encodeURIComponent(name)}`,
		);
	}

	async listServiceHosts(name: string): Promise<TailscaleServiceHost[]> {
		const result = await this.request<{ hosts?: TailscaleServiceHost[] }>(
			"GET",
			`${this.tailnetPath("/services")}/${encodeURIComponent(name)}/devices`,
		);
		return result.hosts ?? [];
	}

	async setServiceHostApproval(
		name: string,
		deviceId: string,
		approved: boolean,
	): Promise<{ approved: boolean; autoApproved: boolean }> {
		return this.request(
			"POST",
			`${this.tailnetPath("/services")}/${encodeURIComponent(name)}/device/${encodeURIComponent(deviceId)}/approved`,
			{ approved },
		);
	}
}

const sharedClients = new Map<
	string,
	{ client: TailscaleClient; accessedAt: number }
>();

export const createTailscaleClient = (config: {
	oauthClientId: string;
	oauthClientSecret: string;
	tailnet: string;
	deviceTag: string;
}) => {
	const key = createHash("sha256")
		.update(
			`${config.oauthClientId}\0${config.oauthClientSecret}\0${config.tailnet}\0${config.deviceTag}`,
		)
		.digest("hex");
	const cached = sharedClients.get(key);
	if (cached) {
		cached.accessedAt = Date.now();
		return cached.client;
	}
	const client = new TailscaleClient({
		clientId: config.oauthClientId,
		clientSecret: config.oauthClientSecret,
		tailnet: config.tailnet,
		deviceTag: config.deviceTag,
	});
	sharedClients.set(key, { client, accessedAt: Date.now() });
	for (const [candidate, entry] of sharedClients) {
		if (Date.now() - entry.accessedAt > 3_600_000)
			sharedClients.delete(candidate);
	}
	return client;
};

export { REQUIRED_SCOPES as TAILSCALE_REQUIRED_SCOPES };
