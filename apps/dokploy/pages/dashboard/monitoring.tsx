import { IS_CLOUD } from "@dokploy/server/constants";
import { validateRequest } from "@dokploy/server/lib/auth";
import { hasPermission } from "@dokploy/server/services/permission";
import type { GetServerSidePropsContext } from "next";
import type { ReactElement } from "react";
import { MonitoringPage } from "@/components/dashboard/monitoring/monitoring-page";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
	return (
		<div className="space-y-4 pb-10">
			<Card className="bg-sidebar p-2.5 rounded-xl mx-auto">
				<div className="rounded-xl bg-background shadow-md p-6">
					<MonitoringPage />
				</div>
			</Card>
		</div>
	);
};

export default Dashboard;

Dashboard.getLayout = (page: ReactElement) => {
	return <DashboardLayout>{page}</DashboardLayout>;
};

export async function getServerSideProps(
	ctx: GetServerSidePropsContext<{ serviceId: string }>,
) {
	if (IS_CLOUD) {
		return {
			redirect: {
				permanent: false,
				destination: "/dashboard/home",
			},
		};
	}
	const { user, session } = await validateRequest(ctx.req);
	if (!user) {
		return {
			redirect: {
				permanent: false,
				destination: "/",
			},
		};
	}

	const permissionCtx = {
		user: { id: user.id },
		session: { activeOrganizationId: session?.activeOrganizationId || "" },
	};
	const [canReadMonitoring, canReadDocker] = await Promise.all([
		hasPermission(permissionCtx, { monitoring: ["read"] }),
		hasPermission(permissionCtx, { docker: ["read"] }),
	]);
	const canView = canReadMonitoring && canReadDocker;

	if (!canView) {
		return {
			redirect: {
				permanent: false,
				destination: "/dashboard/home",
			},
		};
	}

	return {
		props: {},
	};
}
