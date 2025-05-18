import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {CheckIcon, LucideIcon, Settings2, PlusIcon} from "lucide-react";

export interface DashboardSidebarItemInterface {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive: boolean;
}

export interface DashboardSidebarInterface {
    user: UserInterface;
    navMain: DashboardSidebarItemInterface[]
}

export const DefaultDashboardSidebarItems: DashboardSidebarItemInterface[] = [
    {
        title: "Current tasks",
        url: "/",
        icon: CheckIcon,
        isActive: true,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
        isActive: false,
    },
    {
        title: "Create project",
        url: "/project/create",
        icon: PlusIcon,
        isActive: false,
    }
]
