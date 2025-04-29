"use client"

import * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/internal/dashboard/NavMain.tsx";
import { NavUser } from "@/components/internal/dashboard/NavUser.tsx";
import { NavProjects, ProjectNavItem } from "@/components/internal/dashboard/NavProjects.tsx";
import logo from "/DataTask.svg";
import { Separator } from "@/components/ui/separator.tsx";
import { DashboardSidebarItemInterface } from "@/interfaces/DashboardSidebarInterface.tsx";
import { ProjectInterface } from "@/interfaces/ProjectInterface.tsx";
import { UserInterface } from "@/interfaces/UserInterface.tsx";
import { Folder } from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    user: UserInterface;
}

export function AppSidebar({ navMain, projects, user, ...props }: AppSidebarProps) {
    // Добавляем защиту от undefined
    const projectItems: ProjectNavItem[] = projects && projects.length > 0
        ? projects.map((project) => ({
            title: project.name,
            url: `/project/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
            icon: Folder,
            color: project.color,
            description: project.description,
            isActive: false,
            items: project.topics.map((topic) => ({
                title: topic.name,
                url: `/project/${project.name.toLowerCase().replace(/\s+/g, "-")}/${topic.name.toLowerCase().replace(/\s+/g, "-")}`,
            })),
        }))
        : [];

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <div className="flex items-center">
                                <a href="/">
                                    <img src={logo} width="150px" alt="" />
                                </a>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <div className="flex items-center justify-center">
                <div className="w-[85%]">
                    <Separator />
                </div>
            </div>
            <SidebarContent>
                <NavMain items={navMain} />
                <NavProjects items={projectItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}