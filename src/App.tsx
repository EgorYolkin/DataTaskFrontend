import './App.css'
import {LoginPage} from "@/pages/authorization/LoginPage.tsx"
import {RegisterPage} from "@/pages/authorization/RegisterPage.tsx"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './i18n'
import {CurrentTasksDashboard} from "@/pages/dashboard/CurrentTasksDashboard.tsx"
import {Command} from "@/components/internal/command/CommandDialog.tsx" // Correct import
import {LocalSettingsDashboard} from "@/pages/dashboard/LocalSettingsDashboard.tsx"
import {ProjectDashboard} from "@/pages/dashboard/ProjectDashboard.tsx"
import {Navigate} from "react-router-dom"
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx" // Import ProjectInterface
import {UserInterface} from "@/interfaces/UserInterface.tsx"
import {DefaultDashboardSidebarItems} from "@/interfaces/DashboardSidebarInterface.tsx"

export function ProtectedRoute({isAuth, children}: { isAuth: boolean; children: React.ReactNode }) {
    if (!isAuth) {
        return <Navigate to="/auth/login" replace/>
    }
    return <>{children}</>
}

const testUser: UserInterface = {
    id: 1,
    name: "Egor",
    surname: "Yolkin",
    email: "egy@datastrip.cloud",
    avatarUrl: "https://google.com",
}
const testUser2: UserInterface = {
    id: 2,
    name: "Evgeniy",
    surname: "Novoslov",
    email: "evg@datastrip.cloud",
    avatarUrl: "https://google.com",
}
const testTask: TaskInterface = {
    title: "Сделать что-то",
    description: "Описание этого всего",
    isCompleted: true,
    users: [testUser, testUser2],
}
const testTask2: TaskInterface = {
    title: "Выполнить sql запросы",
    description: "Ну хотя бы попробовать",
    isCompleted: false,
    users: [],
}
export const DefaultKanban: KanbanInterface = {
    name: "Backlog",
    tasks: [testTask, testTask2]
}
export const DefaultKanban2: KanbanInterface = {
    name: "Backend",
    tasks: [testTask2],
}
const testProject: ProjectInterface = { // Define testProject
    name: "datastrip",
    color: "#FFFFFF",
    description: "AI-powered cloud & dashboard",
    allowedUsers: [
        {
            id: 1,
            avatarUrl: "https://google.com",
            name: "Egor",
            surname: "Yolkin",
            email: "egor@gmail.com",
        },
    ],
    topics: [
        {
            name: "Backend",
            color: "#FAFAFA",
            description: "Ba",
            kanbans: [DefaultKanban, DefaultKanban2]
        },
        {
            name: "Frontend",
            color: "#FAFAFA",
            description: "Fr",
            kanbans: [DefaultKanban]
        },
    ],
}

const projects: ProjectInterface[] = [testProject]; // Array of projects to pass

function App() {
    const isAuth = true // Assuming authenticated for dashboard access

    return (
        <Router>
            <div className="w-[100vw]">
                <Routes>
                    <Route path="/auth/login" element={<LoginPage/>}/>
                    <Route path="/auth/register" element={<RegisterPage/>}/>

                    {/* Route for the main dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <CurrentTasksDashboard
                                    navMain={DefaultDashboardSidebarItems}
                                    projects={projects}
                                    user={testUser}
                                />
                            </ProtectedRoute>
                        }
                    />

                    {/* Route for a specific project topic */}
                    {/* Note: Consider if you need a default topic redirect or a separate project overview route */}
                    <Route
                        path="/project/:projectName/topic/:topicName"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <ProjectDashboard
                                    navMain={DefaultDashboardSidebarItems}
                                    projects={projects}
                                    user={testUser}
                                />
                            </ProtectedRoute>
                        }
                    />

                    {/* NEW Route for navigating directly to a project by name */}
                    {/* You might want to add logic in ProjectDashboard to handle this route,
                         e.g., redirect to the first topic or show a project overview */}
                    <Route
                        path="/project/:projectName"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                {/* Reusing ProjectDashboard, adjust if needed */}
                                <ProjectDashboard
                                    navMain={DefaultDashboardSidebarItems}
                                    projects={projects}
                                    user={testUser}
                                />
                            </ProtectedRoute>
                        }
                    />


                    {/* Route for dashboard settings */}
                    <Route
                        path="/dashboard/settings"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <LocalSettingsDashboard
                                    navMain={DefaultDashboardSidebarItems}
                                    projects={projects}
                                    user={testUser}
                                />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
            {/* Pass the projects data to the Command component */}
            {isAuth && <Command projects={projects}/>}
        </Router>
    )
}

export default App;