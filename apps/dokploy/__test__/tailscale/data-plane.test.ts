import { ensureTailscaleSourceProxy } from "@dokploy/server/services/tailscale/data-plane";
import { execAsyncRemote } from "@dokploy/server/utils/process/execAsync";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@dokploy/server/utils/process/execAsync", () => ({
	execAsync: vi.fn(),
	execAsyncRemote: vi.fn(),
}));

describe("Tailscale source proxies", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("cleans a stale proxy and skips a missing Compose source network", async () => {
		const remote = vi.mocked(execAsyncRemote);
		remote
			.mockResolvedValueOnce({ stdout: "", stderr: "" })
			.mockResolvedValueOnce({ stdout: "no", stderr: "" })
			.mockResolvedValueOnce({ stdout: "", stderr: "" });

		await ensureTailscaleSourceProxy({
			organizationId: "organization",
			serverId: "server",
			endpointId: "endpoint",
			fqdn: "service.example.ts.net",
			tailVip: "100.100.100.100",
			ports: [8080],
			parallel: false,
			sourceNetwork: "removed-compose_default",
		});

		expect(remote).toHaveBeenCalledTimes(3);
		expect(remote.mock.calls[1]?.[1]).toContain(
			"docker network inspect removed-compose_default",
		);
		expect(remote.mock.calls[2]?.[1]).toContain("docker rm -f");
		expect(
			remote.mock.calls.some(([, command]) =>
				command.includes("docker run -d"),
			),
		).toBe(false);
	});
});
