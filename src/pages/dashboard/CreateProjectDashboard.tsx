"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/internal/dashboard/AppSidebar.tsx";
import {useTranslation} from "react-i18next";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import React, {useCallback, useState} from "react";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CreateProjectDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[]
    user: UserInterface;
}

async function createProject(projectData: Record<string, string | number | undefined>) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/project/`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Authorization": localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
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

export const CreateProjectDashboard: React.FC<CreateProjectDashboardProps> = ({navMain, projects, sharedProjects, user}) => {
    const [t] = useTranslation();

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [parentProjectID, setParentProjectID] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleProjectCreate = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        const projectDataToSend = {
            name: projectName,
            description: projectDescription,
            parent_project_id: parentProjectID,
        };

        try {
            console.log(parentProjectID);
            await createProject(projectDataToSend);

            document.location = "/dashboard";

        } catch (error: any) {
            console.error("Ошибка при создании проекта:", error);
            setErrorMessage(error.message || t('An error occurred during create project'));
        } finally {
            setIsLoading(false);
        }
    }, [projectName, projectDescription, t, parentProjectID]);

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
                                        {t('Create project')}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex items-center justify-center w-full p-[20px]">
                    <div className="flex flex-col xl:p-4 gap-5 w-[100%] xl:w-[60%] border-1 rounded-xl">
                        <div className="flex-col m-[20px] mb-0">
                            <div>
                                <span className="text-[20px] font-semibold">{t("Create project")}</span>
                            </div>
                            <br/>
                            <Separator/>
                            <br/>
                            {errorMessage && (
                                <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md mb-[10px]">
                                    {errorMessage}
                                </div>
                            )}
                            <span className="text-2xl flex items-center gap-3">
                                <Input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    type="text"
                                    placeholder={t("Project Name")}
                                />
                            </span>
                            <div className="grid w-full gap-2 mt-[10px]">
                                <Textarea
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    placeholder={t('Come up with a description')}
                                />
                                <SelectParentProject projects={projects} setParentProjectID={setParentProjectID}/>
                                <br/>
                                <Button onClick={handleProjectCreate} disabled={isLoading}>
                                    {isLoading ? t('Creating...') : t('Create')}
                                </Button>
                            </div>
                            <div></div>
                            <br/><br/>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

interface SelectParentProjectProps {
    setParentProjectID?: (projectID: number | undefined) => void;
    projects: ProjectInterface[];
}

export const SelectParentProject: React.FC<SelectParentProjectProps> = ({setParentProjectID, projects}) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string | undefined>(undefined);
    const [t] = useTranslation();

    const selectedProject = projects.find((project) => project.id.toString() === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <span
                    role="combobox"
                    aria-expanded={open}
                    className="min-w-[180px] h-[100%] text-sm pl-3 pr-3 justify-between flex border-1 p-1 items-center rounded-[7px] cursor-pointer"
                >
  {selectedProject ? selectedProject.name : t("Select parent project")}
                    <ChevronsUpDown size="1em" className="opacity-50"/>
</span>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={t("Search project...")} className="h-9"/>
                    <CommandList>
                        <CommandEmpty>{t("No project found")}</CommandEmpty>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.id.toString()}
                                    onSelect={(currentValue) => {
                                        const selectedID = currentValue === value ? undefined : currentValue;
                                        setValue(selectedID);
                                        setOpen(false);
                                        setParentProjectID?.(
                                            selectedID ? parseInt(selectedID) : undefined
                                        );
                                    }}
                                >
                                    {project.name}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === project.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};