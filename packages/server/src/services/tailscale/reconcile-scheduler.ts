import {
	applications,
	compose,
	db,
	eq,
	libsql,
	mariadb,
	mongo,
	mysql,
	postgres,
	projects,
	redis,
} from "@dokploy/server/db";

const scheduledOrganizations = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Coalesce lifecycle mutations without ever making a public deployment depend
 * on Tailscale availability. Reconciliation records any resulting degradation.
 */
export const scheduleTailscaleReconciliation = (
	organizationId: string,
): void => {
	if (scheduledOrganizations.has(organizationId)) return;
	const timer = setTimeout(() => {
		scheduledOrganizations.delete(organizationId);
		void import("./orchestrator")
			.then(({ reconcileTailscaleOrganization }) =>
				reconcileTailscaleOrganization(organizationId),
			)
			.catch((error) =>
				console.warn("Tailscale background reconciliation failed:", error),
			);
	}, 250);
	timer.unref?.();
	scheduledOrganizations.set(organizationId, timer);
};

export const scheduleTailscaleReconciliationForProject = async (
	projectId: string,
): Promise<void> => {
	try {
		const project = await db.query.projects.findFirst({
			where: eq(projects.projectId, projectId),
			columns: { organizationId: true },
		});
		if (project) scheduleTailscaleReconciliation(project.organizationId);
	} catch (error) {
		if (process.env.NODE_ENV !== "test") {
			console.warn(
				"Could not schedule Tailscale project reconciliation:",
				error,
			);
		}
	}
};

export type TailscaleResourceLookupType =
	| "application"
	| "compose"
	| "postgres"
	| "mysql"
	| "mariadb"
	| "mongo"
	| "redis"
	| "libsql";

const resourceOrganization = async (
	resourceType: TailscaleResourceLookupType,
	resourceId: string,
): Promise<string | null> => {
	const relation = { environment: { with: { project: true } } } as const;
	switch (resourceType) {
		case "application":
			return (
				(
					await db.query.applications.findFirst({
						where: eq(applications.applicationId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "compose":
			return (
				(
					await db.query.compose.findFirst({
						where: eq(compose.composeId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "postgres":
			return (
				(
					await db.query.postgres.findFirst({
						where: eq(postgres.postgresId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "mysql":
			return (
				(
					await db.query.mysql.findFirst({
						where: eq(mysql.mysqlId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "mariadb":
			return (
				(
					await db.query.mariadb.findFirst({
						where: eq(mariadb.mariadbId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "mongo":
			return (
				(
					await db.query.mongo.findFirst({
						where: eq(mongo.mongoId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "redis":
			return (
				(
					await db.query.redis.findFirst({
						where: eq(redis.redisId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
		case "libsql":
			return (
				(
					await db.query.libsql.findFirst({
						where: eq(libsql.libsqlId, resourceId),
						with: relation,
					})
				)?.environment.project.organizationId ?? null
			);
	}
};

export const scheduleTailscaleReconciliationForResource = async (
	resourceType: TailscaleResourceLookupType,
	resourceId: string,
): Promise<void> => {
	try {
		const organizationId = await resourceOrganization(resourceType, resourceId);
		if (organizationId) scheduleTailscaleReconciliation(organizationId);
	} catch (error) {
		if (process.env.NODE_ENV !== "test") {
			console.warn(
				"Could not schedule Tailscale resource reconciliation:",
				error,
			);
		}
	}
};
