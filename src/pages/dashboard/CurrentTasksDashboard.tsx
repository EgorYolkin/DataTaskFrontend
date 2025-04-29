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
import {Input} from "@/components/ui/input.tsx";
import {CreateTaskFormCombobox} from "@/components/internal/forms/CreateTaskFormCombobox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {SendHorizontal} from "lucide-react";
import {DashboardTasks} from "@/components/internal/tasks/DashboardTasks.tsx";
import {DefaultKanban} from "@/App.tsx";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";

interface CurrentTasksDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    user: UserInterface;
}

export const CurrentTasksDashboard: React.FC<CurrentTasksDashboardProps> = ({navMain, projects, user}) => {
    const [t] = useTranslation();

    return (
        <SidebarProvider>
            <AppSidebar navMain={navMain} user={user} projects={projects} />
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
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full items-center p-[20px]">
                    <div className="border-1 rounded-xl w-[100%] xl:w-[60%] p-3">
                        <div className="flex justify-center text-sm gap-2 flex-wrap ">
                            <Input type="email" placeholder={t("Task") + "..."}/>
                            <div className="flex w-full gap-1">
                                <div className="w-[40%] sm:w-auto">
                                    <CreateTaskFormCombobox projects={projects} />
                                </div>
                                <Button className="w-[60%] sm:w-auto">
                                    {t('Publish')} <SendHorizontal/>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-[20px]">
                            <Separator orientation="horizontal" className="mr-2 h-4 "/>
                        </div>
                        <div className="flex justify-center gap-2">
                            <DashboardTasks kanban={DefaultKanban}/>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
