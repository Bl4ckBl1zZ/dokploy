import { dirname, join } from "node:path";
import type { PrivateEnvironmentContext } from "@dokploy/server/services/tailscale/environment-template";
import { encodeBase64, prepareEnvironmentVariables } from "../docker/utils";

export const createEnvFileCommand = (
	directory: string,
	env: string | null,
	projectEnv?: string | null,
	environmentEnv?: string | null,
	privateContext?: PrivateEnvironmentContext,
) => {
	const envFileContent = prepareEnvironmentVariables(
		env,
		projectEnv,
		environmentEnv,
		privateContext,
	).join("\n");

	const encodedContent = encodeBase64(envFileContent || "");
	const envFilePath = join(dirname(directory), ".env");

	return `echo "${encodedContent}" | base64 -d > "${envFilePath}";`;
};
