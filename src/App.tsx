import './App.css'

import {LoginPage} from "@/pages/authorization/LoginPage.tsx";
import {RegisterPage} from "@/pages/authorization/RegisterPage.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import './i18n';
import {CurrentTasksDashboard} from "@/pages/dashboard/CurrentTasksDashboard.tsx";
import {Command} from "@/components/internal/command/CommandDialog.tsx";
import {LocalSettingsDashboard} from "@/pages/dashboard/LocalSettingsDashboard.tsx";
import {ProjectDashboard} from "@/pages/dashboard/ProjectDashboard.tsx";

function App() {
    const isAuth = true;

    return (
        <Router>
            <div className="w-[100vw]">
                <Routes>
                    <Route
                        path="/auth/login"
                        element={<LoginPage/>}
                    />
                    <Route
                        path="/auth/register"
                        element={<RegisterPage/>}
                    />

                    {isAuth && (
                        <>
                            <Route
                                path="/dashboard"
                                element={<CurrentTasksDashboard/>}
                            />

                            <Route
                                path="/dashboard/project"
                                element={<ProjectDashboard/>}
                            />

                            <Route
                                path="/dashboard/settings"
                                element={<LocalSettingsDashboard/>}
                            />
                        </>
                    )}
                </Routes>
            </div>
            {isAuth && (
                <>
                {/*<span*/}
                {/*    className="text-sm text-muted-foreground fixed right-[20px] top-[20px] bg-gray-100 p-2 rounded-lg cursor-pointer">*/}
                {/*        Press{" "}*/}
                {/*            <kbd*/}
                {/*                className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">*/}
                {/*            <span className="text-xs">⌘</span>J*/}
                {/*        </kbd>*/}
                {/*    </span>*/}
                    <Command></Command>
                </>
            )}
        </Router>
    )
}

export default App
