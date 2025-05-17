"use client"

import React, {useCallback, useMemo, useState} from "react" // Import useMemo
import {useParams} from "react-router-dom"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/internal/dashboard/AppSidebar.tsx"
import {useTranslation} from "react-i18next"
import {Badge} from "@/components/ui/badge"
import {ProjectDashboardTasks} from "@/components/internal/tasks/ProjectDashboardTasks.tsx"
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx"
import {UserInterface} from "@/interfaces/UserInterface.tsx"
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx"
import {Button} from "@/components/ui/button.tsx";

interface ProjectDashboardProps {
    navMain: DashboardSidebarItemInterface[]
    projects: ProjectInterface[]
    sharedProjects: ProjectInterface[]
    user: UserInterface
}

export const ProjectTopicDashboard: React.FC<ProjectDashboardProps> = ({navMain, projects, sharedProjects, user}) => {
    const {projectName, topicName} = useParams<{ projectName?: string; topicName?: string }>()
    const [t] = useTranslation()

    // Validate route parameters
    if (!projectName || !topicName) {
        // ... (оставь этот блок без изменений)
        return (
            <SidebarProvider>
                <AppSidebar navMain={navMain} user={user} projects={projects} sharedProjects={sharedProjects}/>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-5">
                            <SidebarTrigger className="-ml-1"/>
                            <Separator orientation="vertical" className="mr-2 h-4"/>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">{t("Review")}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block"/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{t("Not Found")}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex items-center justify-center w-full p-[20px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">{t("Invalid URL")}</h2>
                            <p>{t("Please provide a valid project and topic in the URL.")}</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    // --- Using useMemo for optimization ---
    const foundProjectAndTopic = useMemo(() => {
        if (!projects || projects.length === 0) {
            // Handle case where projects data is not yet loaded or is empty
            return {project: undefined, topic: undefined, isLoading: true}; // Indicate loading or no data
        }

        const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
        const topic = project?.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());

        return {project, topic, isLoading: false};

    }, [projects, projectName, topicName]); // Dependencies: re-run memo only if these change

    const {project, topic, isLoading} = foundProjectAndTopic;
    // --- End useMemo ---

    // You could potentially add a loading state UI here if isLoading is true
    if (isLoading) {
        // Optional: Render a specific loading message or spinner
        // For now, the "Not Found" block below also covers the empty projects case.
        // If you want a dedicated loading UI, uncomment/add it here.
        /*
        return (
             <SidebarProvider>
                 <AppSidebar navMain={navMain} user={user} projects={projects}/>
                 <SidebarInset>
                      <div className="flex items-center justify-center w-full p-[20px]">
                         <p>{t("Loading projects...")}</p> // Example loading message
                      </div>
                 </SidebarInset>
             </SidebarProvider>
        );
        */
    }

    if (!project || !topic) {
        return (
            <SidebarProvider>
                <AppSidebar navMain={navMain} user={user} projects={projects}/>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-5">
                            <SidebarTrigger className="-ml-1"/>
                            <Separator orientation="vertical" className="mr-2 h-4"/>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">{t("Review")}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block"/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{t("Not Found")}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex items-center justify-center w-full p-[20px]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">{t("Project or Topic Not Found")}</h2>
                            <p>{t("Please check the URL or select a valid project.")}</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    const kanbans: KanbanInterface[] = topic.kanbans || [];

    return (
        <SidebarProvider>
            {/* Pass found projects to sidebar if needed, or the original list */}
            <AppSidebar navMain={navMain} user={user} projects={projects}/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-5">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="md:block">
                                    <BreadcrumbLink href="#">{t("Review")}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {/* Ensure project and topic are not null/undefined before accessing properties */}
                                        {project.name} / {topic.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex items-center justify-center w-full p-[20px]"
                     onClick={() => console.log("Клик по главному контейнеру")}>
                    <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
                        <div className="flex-col m-[20px] mb-0">
                            <span className="text-2xl font-semibold flex items-center gap-3">
                                {/* Ensure topic and project are not null/undefined */}
                                {topic.name} ({project.name})
                            </span>
                            <span>
                                {/* Ensure project is not null/undefined */}
                                {project.description}
                            </span>
                            <br/><br/>
                            <div className="flex gap-1">
                                <Badge>#{t("Project")}</Badge>
                                {/* Ensure topic is not null/undefined */}
                                <Badge>#{topic.name}</Badge>
                            </div>
                        </div>
                        <Separator orientation="horizontal" className="mr-2 h-4"/>
                        <div className="p-5 mt-[-20px]">
                            <span className="text-2xl font-semibold flex items-center gap-3">
                                {/* Ensure topic is not null/undefined */}
                                {t("Kanban")} - {topic.name}
                            </span>
                            <br/>
                            <div className="flex gap-5 overflow-auto max-w-[100vw]">
                                {kanbans.length > 0 ? (
                                    kanbans.map((kanban) => (
                                        <ProjectDashboardTasks
                                            onKanbanNameChange={() => {
                                            }} key={kanban.name} kanban={kanban}
                                        />
                                    ))
                                ) : (
                                    <p>{t("No Kanban boards found for this topic.")}</p>
                                )}
                            </div>
                            <div className="items-center justify-center mt-[32px]">
                                <CreateKanbanDialog projectID={topic.id}></CreateKanbanDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}


async function createKanban(kanbanData: Record<string, string | number | undefined>) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/kanban/`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Authorization": localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(kanbanData),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            console.error("Ошибка от сервера:", errorData);
            throw new Error(errorData?.message || `Ошибка создания проекта: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка создания проекта: ${response.status}`);
        }
    }

    const responseData = await response.json();

    return responseData;
}

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input.tsx";

interface CreateKanbanDialogProps {
    projectID: number;
}

export const CreateKanbanDialog: React.FC<CreateKanbanDialogProps> = ({projectID}) => {
    const [kanbanName, setKanbanName] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [t] = useTranslation();

    const handleKanbanCreate = useCallback(async () => {
        setErrorMessage(null);

        const kanbanDataToSend = {
            name: kanbanName,
            project_id: projectID,
        };

        try {
            await createKanban(kanbanDataToSend);
            window.location.reload();

        } catch (error: any) {
            console.error("Ошибка при создании канбана:", error);
            setErrorMessage(error.message || t('An error occurred during create kanban'));
        }
    }, [t, kanbanName, projectID]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="bg-black text-white w-fit pr-3 pl-3 pt-1 pb-1 rounded-sm cursor-pointer">
                    {t('Create kanban')}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('Create kanban')}</DialogTitle>
                </DialogHeader>
                <div>
                    {errorMessage && (
                        <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md mb-[10px]">
                            {errorMessage}
                        </div>
                    )}
                    <Input onChange={
                        (e) => setKanbanName(e.target.value)
                    } type="text" placeholder={t('Kanban name')}/>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <div className="flex gap-2">
                            <Button type="button" className="text-white" variant="secondary">
                                {t('Close')}
                            </Button>
                            <div
                                onClick={handleKanbanCreate}
                                className="bg-green-500 text-white w-fit pr-3 pl-3 pt-1 pb-1 rounded-sm cursor-pointer">
                                {t('Create')}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
