import {
	TailscaleApiError,
	TailscaleClient,
} from "@dokploy/server/services/tailscale/client";
import { describe, expect, it, vi } from "vitest";

const json = (value: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(value), {
		status: 200,
		headers: { "Content-Type": "application/json" },
		...init,
	});

describe("Tailscale OAuth client", () => {
	it("requests exact scopes/tags and validates one-use preauthorized keys", async () => {
		const requests: Array<{ url: string; init?: RequestInit }> = [];
		const fetchMock = vi.fn(
			async (url: string | URL | Request, init?: RequestInit) => {
				const target = String(url);
				requests.push({ url: target, init });
				if (target.endsWith("/oauth/token")) {
					return json({
						access_token: "access-token",
						expires_in: 3600,
						scope: "auth_keys services devices:core",
						token_type: "Bearer",
					});
				}
				if (target.endsWith("/devices")) return json({ devices: [] });
				if (target.endsWith("/services")) return json({ vipServices: [] });
				if (target.endsWith("/keys") && init?.method === "POST") {
					return json({ id: "key-id", key: "tskey-auth-secret" });
				}
				if (target.endsWith("/keys/key-id"))
					return new Response(null, { status: 204 });
				throw new Error(`Unexpected request ${target}`);
			},
		) as typeof fetch;
		const client = new TailscaleClient({
			clientId: "client-id",
			clientSecret: "client-secret",
			tailnet: "example.com",
			deviceTag: "tag:dokploy",
			fetch: fetchMock,
		});

		await expect(client.validateCredentials()).resolves.toMatchObject({
			tailnet: "example.com",
			tag: "tag:dokploy",
		});
		const tokenBody = requests[0]?.init?.body?.toString() ?? "";
		expect(tokenBody).toContain("scope=auth_keys+services+devices%3Acore");
		expect(tokenBody).toContain("tags=tag%3Adokploy");
		const keyRequest = requests.find(
			(request) =>
				request.url.endsWith("/keys") && request.init?.method === "POST",
		);
		const keyBody = JSON.parse(String(keyRequest?.init?.body));
		expect(keyBody.capabilities.devices.create).toEqual({
			reusable: false,
			ephemeral: false,
			preauthorized: true,
			tags: ["tag:dokploy"],
		});
	});

	it("caches tokens, refreshes before expiry, and backs off for rate limits", async () => {
		let now = 0;
		let tokenCount = 0;
		let devicesCount = 0;
		const sleep = vi.fn(async () => undefined);
		const fetchMock = vi.fn(async (url: string | URL | Request) => {
			const target = String(url);
			if (target.endsWith("/oauth/token")) {
				tokenCount += 1;
				return json({
					access_token: `token-${tokenCount}`,
					expires_in: 120,
					scope: "auth_keys services devices:core",
					token_type: "Bearer",
				});
			}
			devicesCount += 1;
			if (devicesCount === 1) {
				return json(
					{ message: "slow down" },
					{ status: 429, headers: { "Retry-After": "2" } },
				);
			}
			return json({ devices: [] });
		}) as typeof fetch;
		const client = new TailscaleClient({
			clientId: "id",
			clientSecret: "secret",
			tailnet: "example.com",
			fetch: fetchMock,
			now: () => now,
			sleep,
		});

		await client.listDevices();
		await client.listDevices();
		expect(tokenCount).toBe(1);
		expect(sleep).toHaveBeenCalledWith(2000);
		now = 61_000;
		await client.listDevices();
		expect(tokenCount).toBe(2);
	});

	it("never includes OAuth secrets in API errors", async () => {
		const client = new TailscaleClient({
			clientId: "id",
			clientSecret: "super-secret-value",
			tailnet: "example.com",
			fetch: vi.fn(async () => json({}, { status: 401 })) as typeof fetch,
			sleep: async () => undefined,
		});
		const error = await client.listDevices().catch((caught) => caught);
		expect(error).toBeInstanceOf(TailscaleApiError);
		expect(String(error)).not.toContain("super-secret-value");
	});
});
