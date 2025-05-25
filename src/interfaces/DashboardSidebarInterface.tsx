import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {LucideIcon} from "lucide-react";

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
