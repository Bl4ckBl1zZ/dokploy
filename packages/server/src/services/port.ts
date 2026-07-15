import { db } from "@dokploy/server/db";
import { type apiCreatePort, ports } from "@dokploy/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { scheduleTailscaleReconciliationForResource } from "./tailscale/reconcile-scheduler";

export type Port = typeof ports.$inferSelect;

export const createPort = async (input: z.infer<typeof apiCreatePort>) => {
	const newPort = await db
		.insert(ports)
		.values({
			...input,
		})
		.returning()
		.then((value) => value[0]);

	if (!newPort) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Error input: Inserting port",
		});
	}
	void scheduleTailscaleReconciliationForResource(
		"application",
		newPort.applicationId,
	);

	return newPort;
};

export const finPortById = async (portId: string) => {
	const result = await db.query.ports.findFirst({
		where: eq(ports.portId, portId),
		with: {
			application: {
				with: {
					environment: {
						with: {
							project: true,
						},
					},
				},
			},
		},
	});
	if (!result) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Port not found",
		});
	}
	return result;
};

export const removePortById = async (portId: string) => {
	const port = await finPortById(portId);
	const result = await db
		.delete(ports)
		.where(eq(ports.portId, portId))
		.returning();
	void scheduleTailscaleReconciliationForResource(
		"application",
		port.applicationId,
	);

	return result[0];
};

export const updatePortById = async (
	portId: string,
	portData: Partial<Port>,
) => {
	const port = await finPortById(portId);
	const result = await db
		.update(ports)
		.set({
			...portData,
		})
		.where(eq(ports.portId, portId))
		.returning();
	void scheduleTailscaleReconciliationForResource(
		"application",
		port.applicationId,
	);

	return result[0];
};
