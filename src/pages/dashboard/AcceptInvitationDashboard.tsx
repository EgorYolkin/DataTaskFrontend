import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/internal/dashboard/AppSidebar.tsx";
import {useParams, useNavigate} from "react-router-dom";
import {DashboardSidebarItemInterface} from "@/interfaces/DashboardSidebarInterface.tsx";
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx";
import {UserInterface} from "@/interfaces/UserInterface.tsx";
import {CheckCircleIcon, AlertTriangleIcon} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "sonner"

async function acceptInvitation(projectID: number, t: any) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/project_users/${projectID}/accept`, {
        method: "POST",
        credentials: "include",
        headers: {
            Authorization: localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            console.error("Ошибка от сервера:", errorData);
            throw new Error(
                errorData?.message || `${t('Invitation acceptance error')}: ${response.status}`
            );
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`${t('Invitation acceptance error')}: ${response.status}`);
        }
    }

    const responseData = await response.json();
    return responseData;
}

interface AcceptInvitationDashboardProps {
    navMain: DashboardSidebarItemInterface[];
    projects: ProjectInterface[];
    sharedProjects: ProjectInterface[];
    user: UserInterface;
}

export const AcceptInvitationDashboard: React.FC<AcceptInvitationDashboardProps> = ({
                                                                                        navMain,
                                                                                        projects,
                                                                                        sharedProjects,
                                                                                        user,
                                                                                    }) => {
    const {projectID: projectIdFromUrl} = useParams<{ projectID?: string }>();
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptanceResult, setAcceptanceResult] = useState<"success" | "error" | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (projectIdFromUrl) {
            const projectIdNumber = parseInt(projectIdFromUrl, 10);
            if (!isNaN(projectIdNumber)) {
                setIsAccepting(true);
                acceptInvitation(projectIdNumber, t)
                    .then(() => {
                        setAcceptanceResult("success");
                        toast(t("Invitation accepted"));
                        setTimeout(() => navigate("/"), 3000);
                    })
                    .catch((error) => {
                        console.error("Error accepting invitation:", error);
                        setAcceptanceResult("error");
                        setErrorMessage(error.message);
                        toast(t("Failed to accept invitation"));
                    })
                    .finally(() => setIsAccepting(false));
            } else {
                setAcceptanceResult("error");
                setErrorMessage(t("Invalid Project ID in URL."));
                toast(t("Invalid URL"));
            }
        } else {
            setAcceptanceResult("error");
            setErrorMessage(t("Project ID not found in URL."));
            toast(t("Invalid URL"));
        }
    }, [projectIdFromUrl, navigate, t, toast]);

    return (
        <SidebarProvider>
            <AppSidebar
                navMain={navMain}
                user={user}
                projects={projects}
                sharedProjects={sharedProjects}
            />
            <SidebarInset className="flex flex-col items-center justify-center h-[90vh] p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="flex flex-col space-y-1">
                        <CardTitle
                            className="text-2xl font-semibold tracking-tight">{t('Accept project invite')}</CardTitle>
                        <CardDescription>{t('Processing your invitation...')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {isAccepting && (
                            <div className="flex items-center justify-center">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 dark:border-gray-700"></div>
                            </div>
                        )}

                        {acceptanceResult === "success" && (
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <CheckCircleIcon className="w-10 h-10 text-green-500"/>
                                <p className="text-lg font-medium text-center">{t('Invite accepted successfully!')}</p>
                                <p className="text-sm text-muted-foreground text-center">{t('Redirecting to dashboard...')}</p>
                            </div>
                        )}

                        {acceptanceResult === "error" && (
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <AlertTriangleIcon className="w-10 h-10 text-red-500"/>
                                <p className="text-lg font-medium text-center">{t('Failed to accept invitation.')}</p>
                                {errorMessage &&
                                    <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>}
                                <div className="cursor-pointer bg-black rounded-xl p-2 text-white" onClick={() => navigate("/")}>
                                    {t('Go to Dashboard')}
                                </div>
                            </div>
                        )}

                        {acceptanceResult === null && !isAccepting && (
                            <p className="text-center text-muted-foreground">{t('Waiting for processing...')}</p>
                        )}
                    </CardContent>
                </Card>
            </SidebarInset>
        </SidebarProvider>
    );
};