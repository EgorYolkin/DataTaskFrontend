import { useState, useEffect } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/internal/dashboard/AppSidebar.tsx";
import { useTranslation } from "react-i18next";
// import { Input } from "@/components/ui/input.tsx";
// import { CreateTaskFormCombobox } from "@/components/internal/forms/CreateTaskFormCombobox.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { SendHorizontal } from "lucide-react";
import { DashboardSidebarItemInterface } from "@/interfaces/DashboardSidebarInterface.tsx";
import { UserInterface } from "@/interfaces/UserInterface.tsx";
import { ProjectInterface } from "@/interfaces/ProjectInterface.tsx";
import { DashboardTasks } from "@/components/internal/tasks/DashboardTasks.tsx";
import { TaskInterface } from "@/interfaces/TasksInterfase.tsx";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";

async function fetchUserTasks(userId: number): Promise<FetchResponse> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/user/${userId}/tasks`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData: FetchResponse = await response.json();
        throw new Error(errorData?.error || `Error fetching tasks: ${response.status}`);
    }

    return response.json();
}

interface CurrentTasksDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

export const CurrentTasksDashboard: React.FC<CurrentTasksDashboardProps> = ({ navMain, projects, sharedProjects, user }) => {
    const [t] = useTranslation();
    const [tasks, setTasks] = useState<TaskInterface[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const userTasks: FetchResponse = await fetchUserTasks(user.id);
                setTasks(userTasks.data);
            } catch (error) {
                console.error("Error loading tasks:", error);
            }
        };

        loadTasks();
    }, [user.id]);

    return (
        <SidebarProvider>
            <AppSidebar navMain={navMain} user={user} projects={projects} sharedProjects={sharedProjects} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-5">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        {t('Review')}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('Current tasks')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 pt-0 w-full items-center p-[20px]">
                    <div className="border-1 rounded-xl w-[100%] xl:w-[60%] p-3">
                        <div className="flex justify-center gap-2">
                            <DashboardTasks tasks={tasks} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};