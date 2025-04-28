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
import {Badge} from "@/components/ui/badge"
import {ProjectDashboardTasks} from "@/components/internal/tasks/ProjectDashboardTasks.tsx";

export const ProjectDashboard = () => {
    const [t] = useTranslation();

    return (
        <SidebarProvider>
            <AppSidebar/>
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
                                    <BreadcrumbPage>{t('Current tasks')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex items-center justify-center w-full p-[20px]">
                    <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
                        <div className="flex-col m-[20px]">
                            <span className="text-2xl font-semibold flex items-center gap-3">
                                DataStrip
                            </span>
                            <br/>
                            <div className="flex gap-1">
                                <Badge >#{t('Project')}</Badge>
                                <Badge >#{t('Parent project')}</Badge>
                            </div>
                            <Badge>
                                Какое-то длинное, <br/> но не слишком, описание проекта
                            </Badge>
                        </div>
                        <Separator orientation="horizontal" className="mr-2 h-4"/>
                        <div className="p-5">
                            <span className="text-2xl font-semibold flex items-center gap-3">
                                Kanban
                            </span>
                            <div className="flex gap-5 overflow-auto max-w-[100vw]">
                                <ProjectDashboardTasks></ProjectDashboardTasks>
                                <ProjectDashboardTasks></ProjectDashboardTasks>
                                <ProjectDashboardTasks></ProjectDashboardTasks>
                                <ProjectDashboardTasks></ProjectDashboardTasks>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
