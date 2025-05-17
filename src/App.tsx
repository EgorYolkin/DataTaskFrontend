import './App.css'
import {LoginPage} from "@/pages/authorization/LoginPage.tsx"
import {RegisterPage} from "@/pages/authorization/RegisterPage.tsx"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './i18n'
import {CurrentTasksDashboard} from "@/pages/dashboard/CurrentTasksDashboard.tsx"
import {Command} from "@/components/internal/command/CommandDialog.tsx" // Correct import
import {LocalSettingsDashboard} from "@/pages/dashboard/LocalSettingsDashboard.tsx"
import {ProjectTopicDashboard} from "@/pages/dashboard/ProjectTopicDashboard.tsx"
import {Navigate} from "react-router-dom"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx" // Import ProjectInterface
import {UserInterface} from "@/interfaces/UserInterface.tsx"
import {DefaultDashboardSidebarItems} from "@/interfaces/DashboardSidebarInterface.tsx"
import {ProjectDashboard} from "@/pages/dashboard/ProjectDashboard.tsx";
import {CreateProjectDashboard} from "@/pages/dashboard/CreateProjectDashboard.tsx";
import {jwtDecode, JwtPayload} from "jwt-decode";
import React, {useState, useEffect} from 'react';
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx"; // Import useState and useEffect

export function ProtectedRoute({isAuth, children}: { isAuth: boolean; children: React.ReactNode }) {
    if (!isAuth) {
        return <Navigate to="/auth/login" replace/>
    }
    return <>{children}</>
}

async function getSharedProjects(userID: number): Promise<ProjectInterface[]> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/user_shared_projects/${userID}`, {
        method: "GET",
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
            console.error("Ошибка от сервера:", errorData);
            throw new Error(errorData?.message || `Ошибка получения проектов: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка получения проектов: ${response.status}`);
        }
    }

    const responseData: FetchResponse = await response.json();
    const projectsRaw: any = responseData.data;

    const projects: ProjectInterface[] = await Promise.all(projectsRaw.map(async (project: any) => {
        const subtopicsResp = await fetch(`${apiUrl}/api/${apiVersion}/project_subprojects/${project.id}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Authorization": localStorage.getItem("accessToken") || "",
                "Content-Type": "application/json",
            },
        });

        let subtopicsData = [];
        if (subtopicsResp.ok) {
            const subtopicsJson = await subtopicsResp.json();
            subtopicsData = subtopicsJson.data || [];
        } else {
            console.warn(`Не удалось получить субтопики для проекта ID ${project.id}`);
        }

        const topics = await Promise.all(subtopicsData.map(async (topic: any) => {
            let kanbans: KanbanInterface[] = [];

            try {
                const kanbanResp = await fetch(`${apiUrl}/api/${apiVersion}/kanban/project/${topic.id}`, {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Authorization": localStorage.getItem("accessToken") || "",
                        "Content-Type": "application/json",
                    },
                });

                if (kanbanResp.ok) {
                    const kanbanJson = await kanbanResp.json();
                    const kanbansRaw = Array.isArray(kanbanJson.data) ? kanbanJson.data : (kanbanJson.data ? [kanbanJson.data] : []);

                    kanbans = await Promise.all(kanbansRaw.map(async (kanban: any) => {
                        let tasks: TaskInterface[] = [];
                        try {
                            const tasksResp = await fetch(`${apiUrl}/api/${apiVersion}/kanban_tasks/${kanban.id}`, {
                                method: "GET",
                                credentials: 'include',
                                headers: {
                                    "Authorization": localStorage.getItem("accessToken") || "",
                                    "Content-Type": "application/json",
                                },
                            });

                            if (tasksResp.ok) {
                                const tasksJson = await tasksResp.json();
                                tasks = tasksJson.data || [];

                                console.log(tasks);
                            } else {
                                console.warn(`Не удалось получить задачи для канбана ${kanban.id}`);
                            }
                        } catch (err) {
                            console.error("Ошибка при получении задач:", err);
                        }
                        return {
                            id: kanban.id,
                            name: kanban.name,
                            tasks: tasks,
                        };
                    }));
                } else {
                    console.warn(`Не удалось получить канбаны для topic ${topic.id}`);
                }
            } catch (err) {
                console.error("Ошибка при получении канбанов:", err);
            }

            return {
                id: topic.id,
                name: topic.name,
                color: topic.color,
                description: topic.description,
                kanbans,
            };
        }));

        return {
            id: project.id,
            name: project.name,
            color: project.color,
            description: project.description,
            allowedUsers: [],
            topics,
        };
    }));

    return projects;
}

async function getProjects(userID: number): Promise<ProjectInterface[]> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/user_projects/${userID}`, {
        method: "GET",
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
            console.error("Ошибка от сервера:", errorData);
            throw new Error(errorData?.message || `Ошибка получения проектов: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка получения проектов: ${response.status}`);
        }
    }

    const responseData = await response.json();
    const projectsRaw = responseData.data;

    const projects: ProjectInterface[] = await Promise.all(projectsRaw.map(async (project: any) => {
        const subtopicsResp = await fetch(`${apiUrl}/api/${apiVersion}/project_subprojects/${project.id}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Authorization": localStorage.getItem("accessToken") || "",
                "Content-Type": "application/json",
            },
        });

        let subtopicsData = [];
        if (subtopicsResp.ok) {
            const subtopicsJson = await subtopicsResp.json();
            subtopicsData = subtopicsJson.data || [];
        } else {
            console.warn(`Не удалось получить субтопики для проекта ID ${project.id}`);
        }

        const topics = await Promise.all(subtopicsData.map(async (topic: any) => {
            let kanbans: KanbanInterface[] = [];

            try {
                const kanbanResp = await fetch(`${apiUrl}/api/${apiVersion}/kanban/project/${topic.id}`, {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Authorization": localStorage.getItem("accessToken") || "",
                        "Content-Type": "application/json",
                    },
                });

                if (kanbanResp.ok) {
                    const kanbanJson = await kanbanResp.json();
                    const kanbansRaw = Array.isArray(kanbanJson.data) ? kanbanJson.data : (kanbanJson.data ? [kanbanJson.data] : []);

                    kanbans = await Promise.all(kanbansRaw.map(async (kanban: any) => {
                        let tasks: TaskInterface[] = [];
                        try {
                            const tasksResp = await fetch(`${apiUrl}/api/${apiVersion}/kanban_tasks/${kanban.id}`, {
                                method: "GET",
                                credentials: 'include',
                                headers: {
                                    "Authorization": localStorage.getItem("accessToken") || "",
                                    "Content-Type": "application/json",
                                },
                            });

                            if (tasksResp.ok) {
                                const tasksJson = await tasksResp.json();
                                tasks = tasksJson.data || [];

                                console.log(tasks);
                            } else {
                                console.warn(`Не удалось получить задачи для канбана ${kanban.id}`);
                            }
                        } catch (err) {
                            console.error("Ошибка при получении задач:", err);
                        }
                        return {
                            id: kanban.id,
                            name: kanban.name,
                            tasks: tasks,
                        };
                    }));
                } else {
                    console.warn(`Не удалось получить канбаны для topic ${topic.id}`);
                }
            } catch (err) {
                console.error("Ошибка при получении канбанов:", err);
            }

            return {
                id: topic.id,
                name: topic.name,
                color: topic.color,
                description: topic.description,
                kanbans,
            };
        }));

        return {
            id: project.id,
            name: project.name,
            color: project.color,
            description: project.description,
            allowedUsers: [],
            topics,
        };
    }));

    return projects;
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
        user = {
            id: userDecoded.user_id,
            email: userDecoded.user_email,
            name: userDecoded.user_id,
            surname: "",
            avatarUrl: "",
        };
    }


    const [projects, setProjects] = useState<ProjectInterface[]>([]);
    const [sharedProjects, setSharedProjects] = useState<ProjectInterface[]>([]);
    const [loading, setLoading] = useState(true);
    // const location = useLocation();
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

    }, [user.id, location.pathname]);

    return (
        <Router>
            <div className={`w-[100vw] ${fadeClass}`}>
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
