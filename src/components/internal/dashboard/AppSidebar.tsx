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
import {NavMain} from "@/components/internal/dashboard/NavMain.tsx";
import {NavUser} from "@/components/internal/dashboard/NavUser.tsx";
import {NavProjects, ProjectNavItem} from "@/components/internal/dashboard/NavProjects.tsx";
import logo from "/DataTask.svg";
import {Separator} from "@/components/ui/separator.tsx";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {Folder} from "lucide-react";
import {NavSharedProjects} from "@/components/internal/dashboard/NavSharedProjects.tsx";
import {Link} from "react-router-dom";
import {NotificationInterface} from "@/interfaces/NotificationInterface.tsx";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain: DashboardSidebarItemInterface[];
    notifications: NotificationInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

const productVersion = import.meta.env.VITE_PRODUCT_VERSION;

export function AppSidebar({navMain, notifications, projects, sharedProjects, user, ...props}: AppSidebarProps) {
    const projectItems: ProjectNavItem[] = projects && projects.length > 0
        ? projects.map((project) => ({
            id: project.id,
            title: project.name,
            url: `/project/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
            icon: Folder,
            color: project.color,
            description: project.description,
            isActive: false,
            parentProjectID: project.parent_project_id,
            items: project.topics.map((topic) => ({
                title: topic.name,
                url: `/project/${project.name.toLowerCase().replace(/\s+/g, "-")}/${topic.name.toLowerCase().replace(/\s+/g, "-")}`,
            })),
        }))
        : [];

    const sharedProjectItems: ProjectNavItem[] = sharedProjects && sharedProjects.length > 0
        ? sharedProjects.map((project) => ({
            id: project.id,
            title: project.name,
            url: `/project/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
            icon: Folder,
            color: project.color,
            description: project.description,
            parentProjectID: project.parent_project_id,
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link to="/">
                                        <img src={logo} width="150px" alt=""/>
                                    </Link>
                                </div>
                                <div className="font-semibold text-sm text-gray-300">
                                    {productVersion}
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <div className="flex items-center justify-center">
                <div className="w-[85%]">
                    <Separator/>
                </div>
            </div>
            <SidebarContent>
                <NavMain items={navMain}/>
                <NavProjects items={projectItems}/>
                <NavSharedProjects items={sharedProjectItems}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
        </Sidebar>
    );
}