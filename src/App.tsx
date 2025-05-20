import './App.css'
import {LoginPage} from "@/pages/authorization/LoginPage.tsx"
import {RegisterPage} from "@/pages/authorization/RegisterPage.tsx"
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom"
import './i18n'
import {CurrentTasksDashboard} from "@/pages/dashboard/CurrentTasksDashboard.tsx"
import {Command} from "@/components/internal/command/CommandDialog.tsx"
import {LocalSettingsDashboard} from "@/pages/dashboard/LocalSettingsDashboard.tsx"
import {Navigate} from "react-router-dom"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx"
import {DefaultUser, UserInterface} from "@/interfaces/UserInterface.tsx"
import {DefaultDashboardSidebarItems} from "@/interfaces/DashboardSidebarInterface.tsx"
import {CreateProjectDashboard} from "@/pages/dashboard/CreateProjectDashboard.tsx"
import React, {useState, useEffect} from 'react'
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {FetchResponse} from "@/interfaces/FetchResponse.tsx"
import {AcceptInvitationDashboard} from "@/pages/dashboard/AcceptInvitationDashboard.tsx"
import {Toaster} from "@/components/ui/sonner"
import {ProjectDashboard} from "@/pages/dashboard/ProjectDashboard.tsx";
import {toast} from "sonner";

export function ProtectedRoute({isAuth, children}: { isAuth: boolean; children: React.ReactNode }) {
    if (!isAuth) {
        return <Navigate to="/auth/login" replace/>
    }
    return <>{children}</>
}

const apiUrl = import.meta.env.VITE_API_URL
const apiVersion = import.meta.env.VITE_API_VERSION

const createHeaders = () => ({
    Authorization: localStorage.getItem("accessToken") || "",
    "Content-Type": "application/json",
})

const fetchWithErrorHandling = async (
    url: string,
    method: string = "GET"
) => {
    const response = await fetch(url, {
        method,
        credentials: "include",
        headers: createHeaders(),
    })

    if (!response.ok) {
        try {
            const errorData = await response.json()
            console.error("Server error:", errorData)
            throw new Error(
                errorData?.message || `Request failed: ${response.status}`
            )
        } catch (e) {
            console.error("Error parsing response:", e)
            throw new Error(`Request failed: ${response.status}`)
        }
    }

    return response.json()
}

const fetchProjectUsers = async (projectId: number): Promise<UserInterface[]> => {
    try {
        const response: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/project_users/${projectId}`
        )
        return response.data || []
    } catch (err) {
        console.warn(`Failed to fetch users for project ${projectId}`)
        return []
    }
}

const fetchTopicUsers = async (topicId: number): Promise<UserInterface[]> => {
    try {
        const response: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/project_users/${topicId}`
        )
        return response.data || []
    } catch (err) {
        console.warn(`Failed to fetch users for topic ${topicId}`)
        return []
    }
}

const processTopic = async (topic: any): Promise<any> => {
    let kanbans: KanbanInterface[] = []

    try {
        const kanbanResponse: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/kanban/project/${topic.id}`
        )
        const kanbansRaw = Array.isArray(kanbanResponse.data)
            ? kanbanResponse.data
            : kanbanResponse.data
                ? [kanbanResponse.data]
                : []

        kanbans = await Promise.all(
            kanbansRaw.map(async (kanban: any) => {
                let tasks: TaskInterface[] = []
                try {
                    const tasksResponse: FetchResponse = await fetchWithErrorHandling(
                        `${apiUrl}/api/${apiVersion}/kanban_tasks/${kanban.id}`
                    )
                    tasks = tasksResponse.data || []
                } catch (err) {
                    console.warn(`Failed to fetch tasks for kanban ${kanban.id}`)
                }
                return {
                    id: kanban.id,
                    name: kanban.name,
                    tasks,
                }
            })
        )
    } catch (err) {
        console.warn(`Failed to fetch kanbans for topic ${topic.id}`)
    }

    const allowedUsers = await fetchTopicUsers(topic.id)

    return {
        id: topic.id,
        name: topic.name,
        owner_id: topic.owner_id,
        parent_project_id: topic.parent_project_id,
        color: topic.color,
        description: topic.description,
        kanbans,
        allowedUsers: allowedUsers, // Добавляем поле allowedUsers
    }
}

const processProject = async (project: any): Promise<ProjectInterface> => {
    let subtopicsData: any[] = []
    try {
        const subtopicsResponse: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/project_subprojects/${project.id}`
        )
        subtopicsData = subtopicsResponse.data || []
    } catch (err) {
        console.warn(`Failed to fetch subtopics for project ${project.id}`)
    }

    let kanbans: KanbanInterface[] = []

    try {
        const kanbanResponse: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/kanban/project/${project.id}`
        )
        const kanbansRaw = Array.isArray(kanbanResponse.data)
            ? kanbanResponse.data
            : kanbanResponse.data
                ? [kanbanResponse.data]
                : []

        kanbans = await Promise.all(
            kanbansRaw.map(async (kanban: any) => {
                let tasks: TaskInterface[] = []
                try {
                    const tasksResponse: FetchResponse = await fetchWithErrorHandling(
                        `${apiUrl}/api/${apiVersion}/kanban_tasks/${kanban.id}`
                    )
                    tasks = tasksResponse.data || []
                } catch (err) {
                    console.warn(`Failed to fetch tasks for kanban ${kanban.id}`)
                }
                return {
                    id: kanban.id,
                    name: kanban.name,
                    tasks,
                }
            })
        )
    } catch (err) {
        console.warn(`Failed to fetch kanbans for topic ${project.id}`)
    }

    const allowedUsers: UserInterface[] = await fetchProjectUsers(project.id)
    const topics = await Promise.all(subtopicsData.map(processTopic))

    return {
        id: project.id,
        owner_id: project.owner_id,
        parent_project_id: project.parent_project_id,
        name: project.name,
        color: project.color,
        description: project.description,
        allowedUsers: allowedUsers,
        kanbans: kanbans,
        topics: topics,
    }
}

async function getProjects(userID: number): Promise<ProjectInterface[]> {
    const response: FetchResponse = await fetchWithErrorHandling(
        `${apiUrl}/api/${apiVersion}/user_projects/${userID}`
    )
    const projectsRaw = response.data || []

    return Promise.all(projectsRaw.map(processProject))
}

async function getSharedProjects(
    userID: number
): Promise<ProjectInterface[]> {
    const response: FetchResponse = await fetchWithErrorHandling(
        `${apiUrl}/api/${apiVersion}/user_shared_projects/${userID}`
    )
    const projectsRaw = response.data || []

    return Promise.all(projectsRaw.map(processProject))
}

const RouteTransition: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const location = useLocation()
    const [displayedChildren, setDisplayedChildren] = useState(children)
    const [fadeClass, setFadeClass] = useState('fade-in')

    useEffect(() => {
        setFadeClass('fade-out')
        const timer = setTimeout(() => {
            setDisplayedChildren(children)
            setFadeClass('fade-in')
        }, 100)
        return () => clearTimeout(timer)
    }, [location.pathname, children])

    return (
        <div className="route-wrapper">
            <div className={`route-container ${fadeClass}`} key={location.pathname}>
                {displayedChildren}
            </div>
        </div>
    )
}

const fetchUser = async (): Promise<UserInterface> => {
    try {
        const response: FetchResponse = await fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/user/me`
        );
        return response.data || DefaultUser;
    } catch (err) {
        toast(`Failed to fetch user`);
        return DefaultUser;
    }
};

function App() {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<UserInterface>(DefaultUser);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndFetchUser = async () => {
            setIsLoading(true);
            if (localStorage.getItem('accessToken')) {
                try {
                    const fetchedUser = await fetchUser();
                    setUser(fetchedUser);
                    setIsAuth(true);
                } catch (err) {
                    toast('Auth error');
                    localStorage.removeItem('accessToken');
                    setIsAuth(false);
                    setUser(DefaultUser);
                }
            } else {
                setIsAuth(false);
                setUser(DefaultUser);
            }
            setIsLoading(false);
        };

        checkAuthAndFetchUser();
    }, []);

    const [projects, setProjects] = useState<ProjectInterface[]>([])
    const [sharedProjects, setSharedProjects] = useState<ProjectInterface[]>([])

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects(user.id)
                setProjects(data)
                console.log("pr", projects)
            } catch (error) {
                toast('Get projects error')
            }
        }

        const fetchSharedProjects = async () => {
            try {
                const data = await getSharedProjects(user.id)
                setSharedProjects(data)
                console.log("srp", sharedProjects)
            } catch (error) {
                toast('Get shared projects error')
            }
        }

        const fetchData = async () => {
            await Promise.all([fetchProjects(), fetchSharedProjects()])
            setIsLoading(false)
        }

        fetchData()
    }, [user.id])

    return (
        <Router>
            <Toaster/>
            {isLoading ? (
                <div className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <Routes>
                    <Route
                        path="/auth/login"
                        element={<RouteTransition><LoginPage/></RouteTransition>}
                    />
                    <Route
                        path="/auth/register"
                        element={<RouteTransition><RegisterPage/></RouteTransition>}
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <CurrentTasksDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/:projectID/invite/accept"
                        element={
                            <ProtectedRoute isAuth={true}>
                                <RouteTransition>
                                    <AcceptInvitationDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/:projectName/topic/:topicName"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <ProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/:projectName"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <ProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/create"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <CreateProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/project/:projectName/:topicName"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <ProjectDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/settings"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RouteTransition>
                                    <LocalSettingsDashboard
                                        navMain={DefaultDashboardSidebarItems}
                                        projects={projects}
                                        sharedProjects={sharedProjects}
                                        user={user}
                                    />
                                </RouteTransition>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            )}
            {isAuth && <Command projects={projects}/>}
        </Router>
    )
}

export default App