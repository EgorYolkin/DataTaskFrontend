import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/internal/dashboard/AppSidebar.tsx";
import {useTranslation} from "react-i18next";
import * as React from "react"

import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {NotificationInterface} from "@/interfaces/NotificationInterface.tsx";
import {Notification} from "@/components/internal/notifications/Notification.tsx";

interface LocalSettingsDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    notifications: NotificationInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[]
    user: UserInterface;
}

export const NotificationsDashboard: React.FC<LocalSettingsDashboardProps> = ({
                                                                                  navMain,
                                                                                  notifications,
                                                                                  projects,
                                                                                  sharedProjects,
                                                                                  user
                                                                              }) => {
    const [t] = useTranslation();

    return (
        <SidebarProvider>
            <AppSidebar notifications={notifications} navMain={navMain} user={user} projects={projects} sharedProjects={sharedProjects}/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-5">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        {t('Review')}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('Notifications')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex items-center justify-center w-full p-[20px]">
                    <div className="flex flex-col p-4 gap-5  w-[100%] border-1 rounded-xl">
                        <span className="text-2xl font-semibold">{t('Notifications')}</span>
                        <div className="flex flex-col gap-2">
                            {notifications.map(notification => (
                                <Notification notification={notification} key={notification.id} />
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
