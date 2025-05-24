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
import {List, LayoutDashboard, UserPlus, Trash} from "lucide-react";
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {TasksList} from "@/components/internal/list/TasksList.tsx";
import {Textarea} from "@/components/ui/textarea";
import {TaskInterface} from "@/interfaces/TasksInterfase.tsx";

interface ProjectDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

// Режимы отображения
type DisplayMode = 'kanban' | 'list';

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

const DashboardHeader: React.FC<{
    currentProjectName?: string;
    currentTopicName?: string;
    displayMode: string;
    onDisplayModeChange: (mode: DisplayMode) => void;
}> = ({currentProjectName, currentTopicName, displayMode, onDisplayModeChange}) => {
    React.useEffect(() => {
        localStorage.setItem("displayMode", displayMode);
    }, [displayMode]);

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
                            <BreadcrumbPage>
                                {currentProjectName && currentTopicName
                                    ? `${currentProjectName} / ${currentTopicName}`
                                    : currentProjectName
                                        ? currentProjectName
                                        : t("Not Found")}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-auto mr-5 flex gap-2">
                <div
                    className="flex items-center pr-4 pl-4 bg-black text-white cursor-pointer rounded-xl w-full p-2"
                    onClick={() => onDisplayModeChange('kanban')}
                >
                    <LayoutDashboard className="h-4 w-4 mr-2"/>
                    {t("Kanban")}
                </div>
                <div
                    className="flex items-center pr-4 pl-4 bg-black text-white cursor-pointer rounded-xl w-full p-2"
                    onClick={() => onDisplayModeChange('list')}
                >
                    <List className="h-4 w-4 mr-2"/>
                    {t("List")}
                </div>
            </div>
        </header>
    );
};

// --- Компонент для inline редактирования ---
interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    className?: string;
    isHeading?: boolean;
    canEdit: boolean;
    placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({value, onSave, className, isHeading, canEdit, placeholder}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const handleSave = async () => {
        if (currentValue.trim() !== value.trim()) {
            try {
                await onSave(currentValue.trim());
                toast.success("Изменения сохранены!");
            } catch (error) {
                toast.error("Ошибка при сохранении изменений.");
                setCurrentValue(value); // Откатываем изменения при ошибке
            }
        }
        setIsEditing(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey && !isHeading) {
            inputRef.current?.blur();
        }
    };

    const handleBlur = () => {
        handleSave();
    };

    const handleClick = () => {
        if (canEdit) {
            setIsEditing(true);
        }
    };

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div className={className} onClick={handleClick} style={{cursor: canEdit ? 'pointer' : 'default'}}>
            {isEditing && canEdit ? (
                isHeading ? (
                    <Input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="text-xl font-semibold"
                        placeholder={placeholder}
                    />
                ) : (
                    <Textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="text-sm text-gray-700 w-full min-h-[100px]"
                        rows={1}
                        placeholder={placeholder}
                    />
                )
            ) : (
                isHeading ? (
                    <span className="text-2xl font-semibold flex items-center gap-3">
                        {value || placeholder}
                    </span>
                ) : (
                    <span>{value || placeholder}</span>
                )
            )}
        </div>
    );
};

// --- Единая функция для обновления проекта или топика ---
async function updateEntity(
    entityID: number,
    data: { name?: string; description?: string; },
    t: (key: string) => string
) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const endpoint = `${apiUrl}/api/${apiVersion}/project/${entityID}`;

    const response = await fetch(endpoint, {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Authorization": localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            toast.error(t(`Update project error`) + `: ${errorData.error || errorData.message}`);
            throw new Error(errorData?.message || `Ошибка обновления project: ${response.status}`);
        } catch (e) {
            toast.error(t(`Update project error`) + `: ${response.status}`);
            throw new Error(`Ошибка обновления project: ${response.status}`);
        }
    }
    if (data.name) {
        window.location.href = `/project/${data.name}`;
    }
}

interface ProjectTopicInfoProps {
    project: ProjectInterface;
    user: UserInterface;
    topic: ProjectInterface; // Assuming ProjectInterface is used for topics as well
    displayMode: string;
}

const ProjectTopicInfo: React.FC<ProjectTopicInfoProps> = ({
                                                               project,
                                                               user,
                                                               topic,
                                                               displayMode,
                                                           }) => {
    const [t] = useTranslation();
    const [kanbans, setKanbans] = useState(project.kanbans || []);

    const onTaskAdded = (newTask: TaskInterface, kanbanId: string | number): void => {
        setKanbans(prevKanbans =>
            prevKanbans.map(kanban => {
                if (kanban.id === kanbanId) {
                    return {
                        ...kanban,
                        tasks: [...(kanban.tasks || []), newTask],
                    };
                }
                return kanban;
            })
        );
    };

    const isProjectOwner = project.owner_id === user.id; // Only project owner can edit topics

    const handleTopicNameSave = useCallback(async (newName: string) => {
        await updateEntity(topic.id, {name: newName}, t);
    }, [topic.id, t]);

    const handleTopicDescriptionSave = useCallback(async (newDescription: string) => {
        await updateEntity(topic.id, {description: newDescription}, t);
    }, [topic.id, t]);


    return (
        <div className="flex flex-col p-4 gap-5 w-[100%] border-1 rounded-xl">
            <div className="flex flex-col m-[20px] mb-0 gap-3">
                <div>
                    <EditableText
                        value={topic.name}
                        onSave={handleTopicNameSave}
                        className="flex items-center gap-3"
                        isHeading
                        canEdit={isProjectOwner}
                        placeholder={t("Enter topic name")}
                    />
                    <EditableText
                        value={topic.description || ""}
                        onSave={handleTopicDescriptionSave}
                        className=""
                        canEdit={isProjectOwner}
                        placeholder={t("Enter topic description")}
                    />
                    <span className="text-sm text-gray-500">({project.name})</span> {/* Display project name statically */}
                </div>
                <div className="flex-col gap-10">
                    <div className="flex items-center flex-wrap gap-2">
                        {topic.allowedUsers.map((user) => (
                            <div
                                key={user.id}
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
          {t(displayMode === 'kanban' ? "Kanban" : "List")} - {topic.name}
        </span>
                <br/>
                {displayMode === 'kanban' ? (
                    <div className="flex gap-5 overflow-auto max-w-[100vw]">
                        {kanbans.length > 0 ? (
                            kanbans.map((kanban) => (
                                <ProjectDashboardTasks
                                    onKanbanNameChange={() => {
                                    }}
                                    key={kanban.id}
                                    kanban={kanban}
                                />
                            ))
                        ) : (
                            <p>{t("No Kanban boards found for this topic.")}</p>
                        )}
                    </div>
                ) : (
                    <div className="flex gap-5 overflow-auto max-w-[100vw]">
                        {kanbans.length > 0 ? (
                            kanbans.map((kanban) => (
                                <TasksList onTaskAdded={onTaskAdded} kanban={kanban}/>
                            ))
                        ) : (
                            <p>{t("No Kanban boards found for this topic.")}</p>
                        )}
                    </div>
                )}
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
                <Trash className="cursor-pointer w-4 h-4"></Trash>
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
                                                          user,
                                                          displayMode
                                                      }) => {
    const [t] = useTranslation();

    const [kanbans, setKanbans] = useState(project.kanbans || []);

    const onTaskAdded = (newTask: TaskInterface, kanbanId: string | number): void => {
        setKanbans(prevKanbans =>
            prevKanbans.map(kanban => {
                if (kanban.id === kanbanId) {
                    return {
                        ...kanban,
                        tasks: [...(kanban.tasks || []), newTask],
                    };
                }
                return kanban;
            })
        );
    };

    const isProjectOwner = project.owner_id === user.id;

    const handleProjectNameSave = useCallback(async (newName: string) => {
        await updateEntity(project.id, {name: newName}, t);
    }, [project.id, t]);

    const handleProjectDescriptionSave = useCallback(async (newDescription: string) => {
        await updateEntity(project.id, {description: newDescription}, t);
    }, [project.id, t]);

    return (
        <div className="flex flex-col gap-5 border-1 rounded-xl w-[100%]">
            <div className="flex flex-col m-[20px] mb-0 gap-3">
                <div>
                    <EditableText
                        value={project.name}
                        onSave={handleProjectNameSave}
                        className="text-2xl font-semibold flex items-center gap-3"
                        isHeading
                        canEdit={isProjectOwner}
                        placeholder={t("Enter project name")}
                    />
                    <EditableText
                        value={project.description || ""}
                        onSave={handleProjectDescriptionSave}
                        className=""
                        canEdit={isProjectOwner}
                        placeholder={t("Enter project description")}
                    />
                </div>
                <div className="flex-col gap-10">
                    <div className="flex items-center flex-wrap gap-2">
                        {project.allowedUsers.map((user) => (
                            <div
                                key={user.id}
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
                    </div>
                </div>
            </div>
            <Separator orientation="horizontal" className="mr-2 h-4"/>
            <div className="p-5 mt-[-20px] ">
                <span className="text-2xl font-semibold flex items-center gap-3">
                  {t(displayMode === 'kanban' ? "Kanban" : "List")} - {project.name}
                </span>
                <br/>
                {displayMode === 'kanban' ? (
                    <div className="flex gap-5 overflow-auto ">
                        {kanbans.length > 0 ? (
                            kanbans.map((kanban) => (
                                <ProjectDashboardTasks
                                    onKanbanNameChange={() => {
                                    }}
                                    key={kanban.id}
                                    kanban={kanban}
                                />
                            ))
                        ) : (
                            <p>{t("No Kanban boards found for this topic.")}</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col overflow-auto ">
                        {kanbans.length > 0 ? (
                            kanbans.map((kanban) => (
                                <>
                                    <div>
                                        <TasksList onTaskAdded={onTaskAdded} kanban={kanban}/>
                                    </div>
                                    <Separator className="mt-8 mb-3"/>
                                </>
                            ))
                        ) : (
                            <p>{t("No Lists found for this topic.")}</p>
                        )}
                    </div>
                )}
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
                    {t("Create kanban") + " / " + t("list")}
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
    const [displayMode, setDisplayMode] = useState<string>(localStorage.getItem("displayMode") || "kanban");

    const handleDisplayModeChange = useCallback((mode: DisplayMode) => {
        setDisplayMode(mode);
    }, []);

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
                    <DashboardHeader
                        displayMode={displayMode}
                        onDisplayModeChange={handleDisplayModeChange}
                    />
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
                    <DashboardHeader
                        displayMode={displayMode}
                        onDisplayModeChange={handleDisplayModeChange}
                    />
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
                    className="w-[20%]"
                />
                <SidebarInset className="w-[80%]">
                    <DashboardHeader
                        currentProjectName={project.name}
                        displayMode={displayMode}
                        onDisplayModeChange={handleDisplayModeChange}
                    />
                    <div
                        className="flex items-center justify-center p-[20px] max-w-[100%]"
                    >
                        <ProjectInfo user={user} project={project} topic={project} displayMode={displayMode}/>
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
                    <DashboardHeader
                        currentProjectName={project.name}
                        currentTopicName={topic.name}
                        displayMode={displayMode}
                        onDisplayModeChange={handleDisplayModeChange}
                    />
                    <div
                        className="flex items-center justify-center w-full p-[20px]"
                        onClick={() => console.log("Клик по главному контейнеру")}
                    >
                        <ProjectTopicInfo user={user} project={project} topic={topic} displayMode={displayMode}/>
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
                    <DashboardHeader
                        displayMode={displayMode}
                        onDisplayModeChange={handleDisplayModeChange}
                    />
                    <NotFoundContent message={t("Please check the URL or select a valid project.")}/>
                </SidebarInset>
            </SidebarProvider>
        );
    }
};