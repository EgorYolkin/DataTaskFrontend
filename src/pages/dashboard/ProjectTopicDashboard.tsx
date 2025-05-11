"use client"

import React, { useMemo } from "react" // Import useMemo
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
    projects: ProjectInterface[] // Assume projects might be empty or loading initially
    user: UserInterface
    // Consider adding an isLoading prop if data fetching is handled outside
    // isLoading?: boolean;
}

export const ProjectTopicDashboard: React.FC<ProjectDashboardProps> = ({navMain, projects, user}) => {
    const {projectName, topicName} = useParams<{ projectName?: string; topicName?: string }>()
    const [t] = useTranslation()

    // Validate route parameters
    if (!projectName || !topicName) {
        // ... (оставь этот блок без изменений)
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
            return { project: undefined, topic: undefined, isLoading: true }; // Indicate loading or no data
        }

        const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
        const topic = project?.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase());

        return { project, topic, isLoading: false };

    }, [projects, projectName, topicName]); // Dependencies: re-run memo only if these change

    const { project, topic, isLoading } = foundProjectAndTopic;
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


    // Find the project and topic (This logic is now inside useMemo)
    // const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase())
    // const topic = project?.topics.find((t) => t.name.toLowerCase() === topicName.toLowerCase())


    if (!project || !topic) {
        // This block handles both "project/topic not found" AND the initial
        // state where 'projects' was empty or null before loading,
        // leading to 'project' and 'topic' being undefined.
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
                            {/* Maybe add a link back to the dashboard/projects list */}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    // Use kanbans from the topic
    // Ensure topic.kanbans is an array, default to empty array if null/undefined
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
                                {/* Removed the hidden md:block class from the first item if it was meant to be visible */}
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
                <div className="flex items-center justify-center w-full p-[20px]">
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
                            <div className="flex gap-5 overflow-auto max-w-[100vw]">
                                {kanbans.length > 0 ? (
                                    kanbans.map((kanban) => (
                                        <ProjectDashboardTasks onKanbanNameChange={() => {}} key={kanban.name} kanban={kanban}/>
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
    )
}