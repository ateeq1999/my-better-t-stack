import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Outlet } from "@tanstack/react-router";

function RouteComponent() {
	return (
		<DashboardLayout>
			<Outlet />
		</DashboardLayout>
	);
}
