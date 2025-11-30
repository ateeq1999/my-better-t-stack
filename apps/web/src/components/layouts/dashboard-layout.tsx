import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({ to: "/login" });
                },
            },
        });
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-gray-950">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Estaty
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {session?.user.email}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
