import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/login" });
    }
    // @ts-ignore
    const role = session.data.user.role;

    if (role === "broker") {
      throw redirect({ to: "/dashboard/search" });
    }
    if (role === "admin") {
      throw redirect({ to: "/dashboard/admin" });
    }
    if (role === "developer") {
      throw redirect({ to: "/dashboard/projects" });
    }
    // Default fallback
    throw redirect({ to: "/dashboard/projects" });
  },
});

function DashboardHome() {
  return <div className="flex h-full items-center justify-center">Loading...</div>;
}
