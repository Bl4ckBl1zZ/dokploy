import { validateRequest } from "@dokploy/server";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSidePropsContext } from "next";
import type { ReactElement } from "react";
import superjson from "superjson";
import { ShowTailscale } from "@/components/dashboard/settings/tailscale/show-tailscale";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { appRouter } from "@/server/api/root";

const Page = () => <ShowTailscale />;

export default Page;

Page.getLayout = (page: ReactElement) => (
	<DashboardLayout metaName="Tailscale">{page}</DashboardLayout>
);

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const { user, session } = await validateRequest(ctx.req);
	if (!user) {
		return { redirect: { permanent: false, destination: "/" } };
	}
	const helpers = createServerSideHelpers({
		router: appRouter,
		ctx: {
			req: ctx.req as never,
			res: ctx.res as never,
			db: null as never,
			session: session as never,
			user: user as never,
		},
		transformer: superjson,
	});
	const userPermissions = await helpers.user.getPermissions.fetch();
	if (!userPermissions?.tailscale?.read) {
		return { redirect: { permanent: false, destination: "/" } };
	}
	return { props: { trpcState: helpers.dehydrate() } };
}
