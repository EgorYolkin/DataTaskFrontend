import {useState, useEffect} from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Separator} from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/internal/dashboard/AppSidebar.tsx";
import {useTranslation} from "react-i18next";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {DashboardTasks} from "@/components/internal/tasks/DashboardTasks.tsx";
import {TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";
import {Link} from "react-router-dom";
import {NotificationInterface} from "@/interfaces/NotificationInterface.tsx";

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
    notifications: NotificationInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

export const CurrentTasksDashboard: React.FC<CurrentTasksDashboardProps> = ({
                                                                                navMain,
                                                                                notifications,
                                                                                projects,
                                                                                sharedProjects,
                                                                                user
                                                                            }) => {
    const [t] = useTranslation();
    const [tasks, setTasks] = useState<TaskInterface[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const userTasks: FetchResponse = await fetchUserTasks(user.id);
                setTasks(userTasks.data);
            } catch (error) {
                console.error("Err or loading tasks:", error);
            }
        };

        loadTasks();
    }, [user.id]);

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
                                    <BreadcrumbPage>{t('Current tasks')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 pt-0 w-full items-center p-[20px]">
                    <div className="border-1 rounded-xl w-[100%] xl:w-[60%] p-3">
                        <div className="flex flex-col justify-center gap-2">
                            <DashboardTasks user={user} tasks={tasks}/>
                            <div className="flex-col m-4 mt-0">
                                {projects.length > 0 && (
                                    <Separator orientation="horizontal" className="mr-2 h-4 mb-6"/>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                                    {projects.length > 0 && (
                                        projects.reverse().map((project) => (
                                            <Link to={`/project/${project.name}`} key={project.id}
                                                  className="block">
                                                <div
                                                    className="flex-col border rounded-lg p-3 bg-white cursor-pointer hover:shadow-md transition-shadow flex justify-start gap-4 h-full"
                                                >
                                                    <div className="flex flex-col">
                                                    <span
                                                        className="text-sm text-white bg-black rounded-full w-fit p-1 pr-4 pl-4">
                                                        {project.parent_project_id ? (
                                                            t('Topic')
                                                        ) : (
                                                            t('Project')
                                                        )}
                                                    </span>
                                                        <br/>
                                                        <span className="font-semibold text-3xl text-black">
                                                        {project.name}
                                                    </span>
                                                        <span className="text-gray-600">
                                                        {project.description}
                                                    </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))

                                    )}
                                </div>
                            </div>
                            {sharedProjects.length > 0 && (
                                <div className="flex-col m-4 mt-0">
                                    <Separator orientation="horizontal" className="mr-2 h-4 mb-6"/>
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                                        {sharedProjects.length > 0 && (
                                            sharedProjects.reverse().map((sharedProject) => (
                                                <Link to={`/project/${sharedProject.name}`} key={sharedProject.id}
                                                      className="block">
                                                    <div
                                                        className="flex-col border rounded-lg p-3 bg-white cursor-pointer hover:shadow-md transition-shadow flex justify-start gap-4 h-full"
                                                    >
                                                        <div className="flex flex-col">
                                                    <span
                                                        className="text-sm text-white bg-black rounded-full w-fit p-1 pr-4 pl-4">
                                                        {sharedProject.parent_project_id ? (
                                                            t('Shared topic')
                                                        ) : (
                                                            t('Shared project')
                                                        )}
                                                    </span>
                                                            <br/>
                                                            <span className="font-semibold text-3xl text-black">
                                                        {sharedProject.name}
                                                    </span>
                                                            <span className="text-gray-600">
                                                        {sharedProject.description}
                                                    </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))

                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};