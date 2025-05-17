import './App.css'
import {LoginPage} from "@/pages/authorization/LoginPage.tsx"
import {RegisterPage} from "@/pages/authorization/RegisterPage.tsx"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './i18n'
import {CurrentTasksDashboard} from "@/pages/dashboard/CurrentTasksDashboard.tsx"
import {Command} from "@/components/internal/command/CommandDialog.tsx"
import {LocalSettingsDashboard} from "@/pages/dashboard/LocalSettingsDashboard.tsx"
import {ProjectTopicDashboard} from "@/pages/dashboard/ProjectTopicDashboard.tsx"
import {Navigate} from "react-router-dom"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx"
import {UserInterface} from "@/interfaces/UserInterface.tsx"
import {DefaultDashboardSidebarItems} from "@/interfaces/DashboardSidebarInterface.tsx"
import {ProjectDashboard} from "@/pages/dashboard/ProjectDashboard.tsx";
import {CreateProjectDashboard} from "@/pages/dashboard/CreateProjectDashboard.tsx";
import {jwtDecode, JwtPayload} from "jwt-decode";
import React, {useState, useEffect} from 'react';
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";
import {AcceptInvitationDashboard} from "@/pages/dashboard/AcceptInvitationDashboard.tsx";
import {Toaster} from "@/components/ui/sonner"

export function ProtectedRoute({isAuth, children}: { isAuth: boolean; children: React.ReactNode }) {
    if (!isAuth) {
        return <Navigate to="/auth/login" replace/>
    }
    return <>{children}</>
}

const apiUrl = import.meta.env.VITE_API_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const createHeaders = () => ({
    Authorization: localStorage.getItem("accessToken") || "",
    "Content-Type": "application/json",
});

const fetchWithErrorHandling = async (
    url: string,
    method: string = "GET"
) => {
    const response = await fetch(url, {
        method,
        credentials: "include",
        headers: createHeaders(),
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            console.error("Server error:", errorData);
            throw new Error(
                errorData?.message || `Request failed: ${response.status}`
            );
        } catch (e) {
            console.error("Error parsing response:", e);
            throw new Error(`Request failed: ${response.status}`);
        }
    }

    return response.json();
};

const fetchProjectUsers = async (projectId: number): Promise<UserInterface[]> => {
    try {
        const response: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/project_users/${projectId}`
        );
        return response.data || [];
    } catch (err) {
        console.warn(`Failed to fetch users for project ${projectId}`);
        return [];
    }
};

const processTopic = async (topic: any): Promise<any> => {
    let kanbans: KanbanInterface[] = [];

    try {
        const kanbanResponse: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/kanban/project/${topic.id}`
        );
        const kanbansRaw = Array.isArray(kanbanResponse.data)
            ? kanbanResponse.data
            : kanbanResponse.data
                ? [kanbanResponse.data]
                : [];

        kanbans = await Promise.all(
            kanbansRaw.map(async (kanban: any) => {
                let tasks: TaskInterface[] = [];
                try {
                    const tasksResponse: FetchResponse = await fetchWithErrorHandling(
                        `${apiUrl}/api/${apiVersion}/kanban_tasks/${kanban.id}`
                    );
                    tasks = tasksResponse.data || [];
                } catch (err) {
                    console.warn(`Failed to fetch tasks for kanban ${kanban.id}`);
                }
                return {
                    id: kanban.id,
                    name: kanban.name,
                    tasks,
                };
            })
        );
    } catch (err) {
        console.warn(`Failed to fetch kanbans for topic ${topic.id}`);
    }

    return {
        id: topic.id,
        name: topic.name,
        color: topic.color,
        description: topic.description,
        kanbans,
    };
};

const processProject = async (project: any): Promise<ProjectInterface> => {
    let subtopicsData: any[] = [];
    try {
        const subtopicsResponse: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/project_subprojects/${project.id}`
        );
        subtopicsData = subtopicsResponse.data || [];
    } catch (err) {
        console.warn(`Failed to fetch subtopics for project ${project.id}`);
    }

    const allowedUsers: UserInterface[] = await fetchProjectUsers(project.id);
    const topics = await Promise.all(subtopicsData.map(processTopic));

    return {
        id: project.id,
        name: project.name,
        color: project.color,
        description: project.description,
        allowedUsers: allowedUsers,
        topics,
    };
};

async function getProjects(userID: number): Promise<ProjectInterface[]> {
    const response: FetchResponse = await fetchWithErrorHandling(
        `${apiUrl}/api/${apiVersion}/user_projects/${userID}`
    );
    const projectsRaw = response.data || [];

    return Promise.all(projectsRaw.map(processProject));
}

async function getSharedProjects(
    userID: number
): Promise<ProjectInterface[]> {
    const response: FetchResponse = await fetchWithErrorHandling(
        `${apiUrl}/api/${apiVersion}/user_shared_projects/${userID}`
    );
    const projectsRaw = response.data || [];

    return Promise.all(projectsRaw.map(processProject));
}

interface jwtDecodedI extends JwtPayload {
    user_id: number
    user_email: string
}

function App() {
    let isAuth = false;

    let user: UserInterface = {
        id: 0,
        email: "",
        name: "",
        surname: "",
        avatarUrl: "",
    };

    if (localStorage.getItem('accessToken')) {
        const userDecoded: jwtDecodedI = jwtDecode(localStorage.getItem('accessToken') || "");
        isAuth = true;

        const userIdStr = String(userDecoded.user_id);

        user = {
            id: userDecoded.user_id,
            email: userDecoded.user_email,
            name: userIdStr,
            surname: "",
            avatarUrl: "",
        };
    }

    const [projects, setProjects] = useState<ProjectInterface[]>([]);
    const [sharedProjects, setSharedProjects] = useState<ProjectInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [fadeClass, setFadeClass] = useState('fade-in active');

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setFadeClass('fade-out active');
            await new Promise(resolve => setTimeout(resolve, 300));
            try {
                const data = await getProjects(user.id);
                setProjects(data);
            } catch (error) {
                console.error("Ошибка при получении проектов:", error);
            } finally {
                setLoading(false);
                setFadeClass('fade-in active');
            }
        };

        const fetchSharedProjects = async () => {
            setLoading(true);
            setFadeClass('fade-out active');
            await new Promise(resolve => setTimeout(resolve, 300));
            try {
                const data = await getSharedProjects(user.id);
                setSharedProjects(data);
            } catch (error) {
                console.error("Ошибка при получении совместных проектов:", error);
            } finally {
                setLoading(false);
                setFadeClass('fade-in active');
            }
        };

        fetchProjects();
        fetchSharedProjects();
    }, [user.id]);

    return (
        <Router>
            <div className={`w-[100vw] ${fadeClass}`}>
                <Toaster/>
                {loading ? (
                    <div className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center z-50">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/auth/login" element={<LoginPage/>}/>
                        <Route path="/auth/register" element={<RegisterPage/>}/>

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <CurrentTasksDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:projectID/invite/accept"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <AcceptInvitationDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:projectName/topic/:topicName"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <ProjectTopicDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:projectName"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <ProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/create"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <CreateProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:projectName/:topicName"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <ProjectTopicDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/dashboard/settings"
                            element={
                                <ProtectedRoute isAuth={isAuth}>
                                    <LocalSettingsDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                )}
            </div>
            {isAuth && <Command projects={projects}/>}
        </Router>
    );
}

export default App;