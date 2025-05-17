"use client"

import {useParams} from "react-router-dom";
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
import React from 'react';

interface ProjectDashboardProps {
    navMain: DashboardSidebarItemInterface[]
    projects: ProjectInterface[]
    sharedProjects: ProjectInterface[]
    user: UserInterface
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({navMain, projects, sharedProjects, user}) => {
    const {projectName, topicName} = useParams<{ projectName?: string; topicName?: string }>();
    const [t] = useTranslation();

    if (!projectName) {
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
                            <p>{t("Please provide a valid project in the URL")}</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    let project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());

    if (!project) {
        project = sharedProjects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
    }

    if (!project) {
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
                            <h2 className="text-2xl font-semibold">{t("Project Not Found")}</h2>
                            <p>{t("Please check the URL or select a valid project.")}</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    // If topicName exists, we are on the subproject/topic page
    if (topicName) {
        const topic = project.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());

        if (!topic) {
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
                                <h2 className="text-2xl font-semibold">{t("Topic Not Found")}</h2>
                                <p>{t("Please check the URL or select a valid topic.")}</p>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            );
        }

        const kanbans: KanbanInterface[] = topic.kanbans || [];

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
                                        <BreadcrumbPage>{project.name} / {topic.name}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex items-center justify-center w-full p-[20px]">
                        <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
                            <div className="flex-col m-[20px] mb-0">
                                <span className="text-2xl font-semibold flex items-center gap-3">
                                    {topic.name} ({project.name})
                                </span>
                                <span>
                                    {project.description}
                                </span>
                                <br/><br/>
                                <div className="flex gap-1">
                                    <Badge>#{t("Project")}</Badge>
                                    <Badge>#{topic.name}</Badge>
                                </div>
                            </div>
                            <Separator orientation="horizontal" className="mr-2 h-4"/>
                            <div className="p-5 mt-[-20px]">
                                <span className="text-2xl font-semibold flex items-center gap-3">
                                    {t("Kanban")} - {topic.name}
                                </span>
                                <div className="flex gap-5 overflow-auto max-w-[100vw]">
                                    {kanbans.length > 0 ? (
                                        kanbans.map((kanban) => (
                                            <ProjectDashboardTasks onKanbanNameChange={() => {
                                            }} key={kanban.name} kanban={kanban}/>
                                        ))
                                    ) : (
                                        <p>{t("No Kanban boards found for this topic.")}</p>
                                    )}
                                    <div className="items-center justify-center mt-[32px]">
                                        <Button>Create kanban</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    // If only projectName exists, we are on the project page
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
                                    <BreadcrumbPage>
                                        {project.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex items-center justify-center w-full p-[20px]">
                    <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
                        <div className="flex-col m-[20px] mb-0">
                            <span className="text-2xl font-semibold flex items-center gap-3">
                                {project.name}
                            </span>
                            <span>
                                {project.description}
                            </span>
                            <br/><br/>
                            <div className="flex gap-1">
                                <Badge>#{t("Project")}</Badge>
                                <Badge>#{project.name}</Badge>
                            </div>
                            <br/>
                            <DeleteProjectDialog projectID={project.id}></DeleteProjectDialog>
                            <br/>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};


import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

async function deleteProject(projectID: number) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/project/${projectID}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
            "Authorization": localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            throw new Error(errorData?.message || `Ошибка удаления проекта: ${response.status}`);
        } catch (e) {
            throw new Error(`Ошибка удаления проекта: ${response.status}`);
        }
    }

    window.location.reload();
}

interface DeleteProjectDialogProps {
    projectID: number;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({projectID}) => {
    const [t] = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="bg-red-400 text-white w-fit pr-3 pl-3 pt-1 pb-1 rounded-sm cursor-pointer">
                    {t('Delete project')}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('Delete project')}?</DialogTitle>
                    <DialogDescription>
                        {t('Confirm deletion of the project')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <div className="flex gap-2">
                            <Button type="button" className="text-white" variant="secondary">
                                {t('Cancel')}
                            </Button>
                            <div
                                onClick={() => {deleteProject(projectID)}}
                                className="bg-red-400 text-white w-fit pr-3 pl-3 pt-1 pb-1 rounded-sm cursor-pointer">
                                {t('Delete project')}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}