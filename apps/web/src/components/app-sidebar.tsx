import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Folder, FileText, Settings, MessageSquare, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Projects",
        url: "/dashboard/projects",
        icon: Folder,
    },
    {
        title: "Marketplace",
        url: "/dashboard/search",
        icon: Search,
    },
    {
        title: "Documents",
        url: "/dashboard/documents",
        icon: FileText,
    },
    {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
    },
    {
        title: "Admin",
        url: "/dashboard/admin",
        icon: Shield,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    const location = useLocation();
    // @ts-ignore - role is added dynamically
    const { data: session } = authClient.useSession();
    const userRole = session?.user?.role as string | undefined;

    const filteredItems = items.filter((item) => {
        if (!userRole) return false;
        if (userRole === "admin") return true; // Admin sees all
        if (userRole === "developer") {
            return ["Dashboard", "Projects", "Documents", "Settings", "Chat"].includes(item.title);
        }
        if (userRole === "broker") {
            return ["Dashboard", "Marketplace", "Chat", "Settings"].includes(item.title);
        }
        return false;
    });

    return (
        <aside className="hidden w-64 flex-col border-r bg-white dark:bg-gray-950 md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    Estaty
                </span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                        <Link
                            key={item.title}
                            to={item.url}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
