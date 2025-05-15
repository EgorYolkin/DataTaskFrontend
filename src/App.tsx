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
import React, {useState, useEffect} from 'react'; // Import useState and useEffect

export function ProtectedRoute({isAuth, children}: { isAuth: boolean; children: React.ReactNode }) {
    if (!isAuth) {
        return <Navigate to="/auth/login" replace/>
    }
    return <>{children}</>
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
        // Получаем сабтопики
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

        const topics = subtopicsData.map((topic: any) => ({
            id: topic.id,
            name: topic.name,
            color: topic.color,
            description: topic.description,
            kanbans: [],
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

// Внутри App()
function App() {
    const isAuth = true;

    const userDecoded: jwtDecodedI = jwtDecode(localStorage.getItem('accessToken') || "");

    const user: UserInterface = {
        id: userDecoded.user_id,
        email: userDecoded.user_email,
        name: "",
        surname: "",
        avatarUrl: "",
    };

    const [projects, setProjects] = useState<ProjectInterface[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects(user.id);
                setProjects(data);
            } catch (error) {
                console.error("Ошибка при получении проектов:", error);
            }
        };

        fetchProjects();
    }, [user.id]);

    return (
        <Router>
            <div className="w-[100vw]">
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
                                    user={user}
                                />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
            {isAuth && <Command projects={projects}/>}
        </Router>
    );
}

export default App;