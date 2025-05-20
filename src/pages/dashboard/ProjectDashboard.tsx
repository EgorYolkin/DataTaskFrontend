"use client";

import React, {useCallback, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
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
import {ProjectDashboardTasks} from "@/components/internal/tasks/ProjectDashboardTasks.tsx";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input.tsx";
import {UserPlus} from "lucide-react";
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

interface ProjectDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

const NotFoundContent: React.FC<{ message: string }> = ({message}) => {
    const [t] = useTranslation();
    return (
        <div className="flex items-center justify-center w-full p-[20px]">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">{t("Not Found")}</h2>
                <p>{message}</p>
            </div>
        </div>
    );
};

const DashboardHeader: React.FC = () => {
    const [t] = useTranslation();
    return (
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
    );
};

interface ProjectTopicInfoProps {
    project: ProjectInterface;
    user: UserInterface;
    topic: ProjectInterface;
}

const ProjectTopicInfo: React.FC<ProjectTopicInfoProps> = ({
                                                               project,
                                                               user,
                                                               topic,
                                                           }) => {
    const [t] = useTranslation();
    const kanbans = topic.kanbans || [];

    return (
        <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
            <div className="flex flex-col m-[20px] mb-0 gap-3">
                <div>
                    <span className="text-2xl font-semibold flex items-center gap-3">
                      {topic.name} ({project.name})
                    </span>
                    <span>{project.description}</span>
                </div>
                <div className="flex-col gap-10">
                    <div className="flex items-center flex-wrap gap-2">
                        {topic.allowedUsers.map((user) => (
                            <div
                                className="flex items-center gap-2 cursor-pointer  bg-black text-white w-fit pr-6 pl-1 pt-1 pb-1 rounded-[15px]">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatarUrl} alt={user.avatarUrl}/>
                                    <AvatarFallback
                                        className="rounded-lg bg-gray-500">{user.name[0].toUpperCase()}{user.name[1].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {user.name} {user.surname}
                            </div>
                        ))}
                        <div
                            className="flex items-center gap-2 cursor-pointer  bg-black text-white  pr-1 pl-1 pt-1 pb-1 rounded-[15px]">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback
                                    className="rounded-lg bg-black">
                                    <InviteUserDialog projectID={project.id}></InviteUserDialog>
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {project.owner_id == user.id && (
                            <div
                                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white  pr-1 pl-1 pt-1 pb-1 rounded-[15px]">
                                <Avatar className="h-8 w-[130px] rounded-lg">
                                    <AvatarFallback
                                        className="rounded-lg bg-red-500">
                                        <DeleteProjectDialog projectID={project.id}></DeleteProjectDialog>
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Separator orientation="horizontal" className="mr-2 h-4"/>
            <div className="p-5 mt-[-20px]">
        <span className="text-2xl font-semibold flex items-center gap-3">
          {t("Kanban")} - {topic.name}
        </span>
                <br/>
                <div className="flex gap-5 overflow-auto max-w-[100vw]">
                    {kanbans.length > 0 ? (
                        kanbans.map((kanban) => (
                            <ProjectDashboardTasks
                                onKanbanNameChange={() => {
                                }}
                                key={kanban.name}
                                kanban={kanban}
                            />
                        ))
                    ) : (
                        <p>{t("No Kanban boards found for this topic.")}</p>
                    )}
                </div>
                <div className="items-center justify-center mt-[32px]">
                    <CreateKanbanDialog projectID={topic.id}/>
                </div>
            </div>
        </div>
    );
};

async function deleteProject(projectID: number, t: (tr: string) => string) {
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
            toast(t('Delete project error') + `: ${errorData.error}`);
            throw new Error(errorData?.message || `Ошибка удаления проекта: ${response.status}`);
        } catch (e) {
            throw new Error(`Ошибка удаления проекта: ${response.status}`);
        }
    }

    window.location.href = "/";
}

interface DeleteProjectDialogProps {
    projectID: number;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({projectID}) => {
    const [t] = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <span>{t('Delete project')}</span>
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
                                onClick={() => {
                                    deleteProject(projectID, t)
                                }}
                                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white  pr-4 pl-4 pt-1 pb-1 rounded-sm">
                                {t('Delete project')}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ProjectInfo: React.FC<ProjectTopicInfoProps> = ({
                                                          project,
                                                          user
                                                      }) => {
    const [t] = useTranslation();
    const kanbans = project.kanbans || [];

    return (
        <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
            <div className="flex flex-col m-[20px] mb-0 gap-3">
                <div>
                    <span className="text-2xl font-semibold flex items-center gap-3">
                      {project.name}
                    </span>
                    <span>{project.description}</span>
                </div>
                <div className="flex-col gap-10">
                    <div className="flex items-center flex-wrap gap-2">
                        {project.allowedUsers.map((user) => (
                            <div
                                className="flex items-center gap-2 cursor-pointer  bg-black text-white w-fit pr-6 pl-1 pt-1 pb-1 rounded-[15px]">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatarUrl} alt={user.avatarUrl}/>
                                    <AvatarFallback
                                        className="rounded-lg bg-gray-500">{user.name[0].toUpperCase()}{user.surname[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {user.name} {user.surname}
                            </div>
                        ))}
                        <div
                            className="flex items-center gap-2 cursor-pointer  bg-black text-white  pr-1 pl-1 pt-1 pb-1 rounded-[15px]">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback
                                    className="rounded-lg bg-black">
                                    <InviteUserDialog projectID={project.id}></InviteUserDialog>
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {project.owner_id == user.id && (
                            <div
                                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white  pr-1 pl-1 pt-1 pb-1 rounded-[15px]">
                                <Avatar className="h-8 w-[130px] rounded-lg">
                                    <AvatarFallback
                                        className="rounded-lg bg-red-500">
                                        <DeleteProjectDialog projectID={project.id}></DeleteProjectDialog>
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Separator orientation="horizontal" className="mr-2 h-4"/>
            <div className="p-5 mt-[-20px]">
        <span className="text-2xl font-semibold flex items-center gap-3">
          {t("Kanban")} - {project.name}
        </span>
                <br/>
                <div className="flex gap-5 overflow-auto max-w-[100vw]">
                    {kanbans.length > 0 ? (
                        kanbans.map((kanban) => (
                            <ProjectDashboardTasks
                                onKanbanNameChange={() => {
                                }}
                                key={kanban.name}
                                kanban={kanban}
                            />
                        ))
                    ) : (
                        <p>{t("No Kanban boards found for this topic.")}</p>
                    )}
                </div>
                <div className="items-center justify-center mt-[32px]">
                    <CreateKanbanDialog projectID={project.id}/>
                </div>
            </div>
        </div>
    );
};

async function createKanban(
    kanbanData: Record<string, string | number | undefined>
) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/kanban/`, {
        method: "POST",
        credentials: "include",
        headers: {
            Authorization: localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(kanbanData),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            console.error("Ошибка от сервера:", errorData);
            throw new Error(
                errorData?.message || `Ошибка создания проекта: ${response.status}`
            );
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка создания проекта: ${response.status}`);
        }
    }

    const responseData = await response.json();

    return responseData;
}

interface CreateKanbanDialogProps {
    projectID: number;
}

export const CreateKanbanDialog: React.FC<CreateKanbanDialogProps> = ({
                                                                          projectID,
                                                                      }) => {
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
            setErrorMessage(
                error.message || t("An error occurred during create kanban")
            );
        }
    }, [t, kanbanName, projectID]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="bg-black text-white w-fit pr-3 pl-3 pt-1 pb-1 rounded-sm cursor-pointer">
                    {t("Create kanban")}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("Create kanban")}</DialogTitle>
                </DialogHeader>
                <div>
                    {errorMessage && (
                        <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md mb-[10px]">
                            {t(errorMessage)}
                        </div>
                    )}
                    <Input
                        onChange={(e) => setKanbanName(e.target.value)}
                        type="text"
                        placeholder={t("Kanban name")}
                    />
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <div className="flex gap-2">
                            <Button type="button" className="text-white" variant="secondary">
                                {t("Close")}
                            </Button>
                            <div
                                onClick={handleKanbanCreate}
                                className="bg-green-500 text-white w-fit pr-3 font-semibold pl-3 pt-1 pb-1 rounded-sm cursor-pointer flex items-center justify-center"
                            >
                                {t("Create")}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

async function inviteUser(
    inviteData: any,
    projectID: number,
    t: (key: string) => string,
) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/project_users/${projectID}/invite`, {
        method: "POST",
        credentials: "include",
        headers: {
            Authorization: localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteData),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            throw new Error(
                errorData?.message || `Ошибка приглашения пользователя: ${response.status}`
            );
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            toast(`Ошибка приглашения пользователя: ${response.status}`);
        }
    }

    toast(t("Successfully invited invitation"));

    const responseData = await response.json();
    return responseData;
}

interface InviteUserDialogProps {
    projectID: number;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({projectID}) => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successfulMessage, setSuccessfulMessage] = useState<string | null>(null);
    const [t] = useTranslation();

    const handleUserInvite = useCallback(async () => {
        if (userEmail === null) {
            setErrorMessage(t("Please enter a user email"));
            return;
        }

        setErrorMessage(null);

        const inviteDataToSend = {
            permission: "read",
            project_id: projectID,
            user_email: userEmail,
        };

        try {
            await inviteUser(inviteDataToSend, projectID, t);

            let link = window.location.host + "/project/" + projectID + "/invite/accept";
            setSuccessfulMessage(t('Invitation created. The user must click on the link to join the project') + ': ' + link);
        } catch (error: any) {
            setErrorMessage(
                error.message || t("An error occurred while inviting the user")
            );
        }
    }, [t, userEmail, projectID]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <UserPlus className="w-5 h-5"/>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("Invite user in project")}</DialogTitle>
                </DialogHeader>
                <div>
                    {errorMessage && (
                        <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md mb-[10px]">
                            {t(errorMessage)}
                        </div>
                    )}
                    {successfulMessage && (
                        <div className="p-2 text-sm text-green-600 bg-green-100 rounded-md mb-[10px]">
                            {successfulMessage}
                        </div>
                    )}
                    <Input
                        onChange={(e) => setUserEmail(e.target.value)}
                        type="text"
                        placeholder={t("User email")}
                    />
                </div>
                <DialogFooter className="sm:justify-start">
                    <div className="flex gap-2">
                        <DialogClose asChild>

                            <Button type="button" className="text-white" variant="secondary">
                                {t("Close")}
                            </Button>
                        </DialogClose>
                        <div
                            onClick={handleUserInvite}
                            className="bg-green-500 text-white w-fit pr-3 font-semibold pl-3 pt-1 pb-1 rounded-sm cursor-pointer flex items-center justify-center"
                        >
                            {t("Invite")}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
                                                                      navMain,
                                                                      projects,
                                                                      sharedProjects,
                                                                      user,
                                                                  }) => {
    const {projectName, topicName} = useParams<{
        projectName?: string;
        topicName?: string;
    }>();
    const [t] = useTranslation();

    if (!projectName && !topicName) {
        return (
            <SidebarProvider>
                <AppSidebar
                    navMain={navMain}
                    user={user}
                    projects={projects}
                    sharedProjects={sharedProjects}
                />
                <SidebarInset>
                    <DashboardHeader/>
                    <NotFoundContent message={t("Please provide a valid project and topic in the URL.")}/>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const foundProjectAndTopic = useMemo(() => {
        if ((!projects || projects.length === 0) && (!sharedProjects || sharedProjects.length === 0)) {
            return {project: undefined, topic: undefined, isLoading: true};
        }

        let project = undefined;
        let topic = undefined;

        if (projectName) {
            project = projects.find(
                (p) => p.name.toLowerCase() === projectName.toLowerCase()
            );

        }
        if (topicName) {
            topic = project?.topics.find(
                (t) => t.name.toLowerCase() === topicName.toLowerCase()
            );
        }

        if (!project) {
            if (projectName) {
                project = sharedProjects.find(
                    (p) => p.name.toLowerCase() === projectName.toLowerCase()
                );
            }

            if (topicName) {
                topic = project?.topics.find(
                    (t) => t.name.toLowerCase() === topicName.toLowerCase()
                );
            }
        }

        return {project, topic, isLoading: false};
    }, [projects, sharedProjects, projectName, topicName]);

    const {project, topic} = foundProjectAndTopic;

    if (!project && !topic) {
        return (
            <SidebarProvider>
                <AppSidebar
                    navMain={navMain}
                    user={user}
                    projects={projects}
                    sharedProjects={sharedProjects}
                />
                <SidebarInset>
                    <DashboardHeader/>
                    <NotFoundContent message={t("Please check the URL or select a valid project.")}/>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (project && !topic) {
        return (
            <SidebarProvider>
                <AppSidebar
                    navMain={navMain}
                    user={user}
                    projects={projects}
                    sharedProjects={sharedProjects}
                />
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
                                            {project.name}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div
                        className="flex items-center justify-center w-full p-[20px]"
                        onClick={() => console.log("Клик по главному контейнеру")}
                    >
                        <ProjectInfo user={user} project={project} topic={project}/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    } else if (project && topic) {
        return (
            <SidebarProvider>
                <AppSidebar
                    navMain={navMain}
                    user={user}
                    projects={projects}
                    sharedProjects={sharedProjects}
                />
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
                                            {project.name} / {topic.name}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div
                        className="flex items-center justify-center w-full p-[20px]"
                        onClick={() => console.log("Клик по главному контейнеру")}
                    >
                        <ProjectTopicInfo user={user} project={project} topic={topic}/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    } else {
        return (
            <SidebarProvider>
                <AppSidebar
                    navMain={navMain}
                    user={user}
                    projects={projects}
                    sharedProjects={sharedProjects}
                />
                <SidebarInset>
                    <DashboardHeader/>
                    <NotFoundContent message={t("Please check the URL or select a valid project.")}/>
                </SidebarInset>
            </SidebarProvider>
        );
    }
};