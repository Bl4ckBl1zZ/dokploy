export type TailscaleStatus =
	| "pending"
	| "provisioning"
	| "ready"
	| "degraded"
	| "offline"
	| "disabled";

export type TailscaleResourceType =
	| "application"
	| "compose"
	| "postgres"
	| "mysql"
	| "mariadb"
	| "mongo"
	| "redis"
	| "libsql"
	| "preview";
