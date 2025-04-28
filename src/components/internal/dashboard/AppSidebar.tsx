"use client"

import * as React from "react"
import {
    Command,
    Frame,
    LifeBuoy,
    Send,
    Settings2,
    CheckIcon
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {NavMain} from "@/components/internal/dashboard/NavMain.tsx";
import {NavUser} from "@/components/internal/dashboard/NavUser.tsx";
import {NavProjects} from "@/components/internal/dashboard/NavProjects.tsx";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Current tasks",
            url: "/dashboard",
            icon: CheckIcon,
            isActive: true,
        },
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings2,
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: LifeBuoy,
        },
        {
            title: "Feedback",
            url: "#",
            icon: Send,
        },
    ],
    projects: [
        {
            title: "DataStrip",
            url: "#",
            icon: Frame,
            items: [
                {
                    title: "Backend",
                    url: "/dashboard/project",
                },
                {
                    title: "AI",
                    url: "/dashboard/project"
                },
                {
                    title: "Frontend",
                    url: "/dashboard/project"
                },
                {
                    title: "Managment",
                    url: "/dashboard/project"
                },
                {
                    title: "Design",
                    url: "/dashboard/project"
                }
            ]
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div
                                    className="flex aspect-square size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4"/>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-black">DataTask</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                <NavProjects items={data.projects}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
        </Sidebar>
    )
}
