// TaskRow.tsx
"use client";

import React from "react";
import {TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {CheckStatus} from "@/components/internal/tasks/components/CheckStatus.tsx";
import {TaskDialog} from "@/components/internal/dialogs/TaskDialog.tsx";
import {useTranslation} from "react-i18next";

async function updateTask(taskData: any, taskID: number) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/task/${taskID}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Authorization": localStorage.getItem("accessToken") || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            console.error("Ошибка от сервера:", errorData);
            throw new Error(errorData?.message || `Ошибка обновления задачи: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка обновления задачи: ${response.status}`);
        }
    }

    const responseData = await response.json();
    return responseData;
}

async function deleteTask(taskID: number) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/task/${taskID}`, {
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
            console.error("Ошибка от сервера:", errorData);
            throw new Error(errorData?.message || `Ошибка удаления задачи: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка удаления задачи: ${response.status}`);
        }
    }

    window.location.reload();
    const responseData = await response.json();
    return responseData;
}

interface TaskRowProps {
    task: TaskInterface;
    columnVisibility: {
        title: boolean;
        description: boolean;
        users: boolean;
    };
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error) {
        return {hasError: true, error};
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 text-red-500">
                    <h2>Something went wrong.</h2>
                    <p>{this.state.error?.message || "Unknown error"}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export const TaskRow: React.FC<TaskRowProps> = ({task, columnVisibility}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [isEditingTitle, setIsEditingTitle] = React.useState(false)
    const [isEditingDescription, setIsEditingDescription] = React.useState(false)
    const [editingTitle, setEditingTitle] = React.useState(task.title)
    const [editingDescription, setEditingDescription] = React.useState(task.description || "")
    const [isCompleted, setIsCompleted] = React.useState(task.is_completed)
    const [t] = useTranslation();

    React.useEffect(() => {
        setEditingTitle(task.title)
        setEditingDescription(task.description || "")
        setIsCompleted(task.is_completed)
    }, [task])

    const handleSave = async () => {
        const updatedTask = {
            ...task,
            title: editingTitle,
            description: editingDescription,
        }
        try {
            await updateTask(updatedTask, task.id)
            setIsEditingTitle(false)
            setIsEditingDescription(false)
        } catch (error) {
            console.error("Ошибка при обновлении задачи:", error)
        }
    }

    const handleTaskUpdate = async () => {
        try {
            await updateTask({
                ...task,
                is_completed: !isCompleted,
            }, task.id)
            setIsCompleted(!isCompleted)
        } catch (error) {
            console.error("Ошибка при обновлении задачи:", error)
        }
    }

    return (
        <div
            className="border flex rounded-lg p-3 bg-white cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="flex items-center gap-5">
                <ErrorBoundary>
                    <div onClick={handleTaskUpdate}>
                        <CheckStatus taskID={task.id} isCompleted={task.is_completed}/>
                    </div>
                </ErrorBoundary>
            </div>

            <div onClick={() => setIsModalOpen(true)} className="flex items-center justify-between gap-5 w-full">
                <div className="flex items-center gap-5 justify-between w-full">
                    {columnVisibility.title && (
                        <div className="font-semibold text-sm">{task.title}</div>
                    )}
                    {columnVisibility.description && task.description && (
                        <div className="text-gray-600 text-sm">{task.description}</div>
                    )}
                </div>
                {columnVisibility.users && (
                    <div className="text-sm text-gray-500 w-fit">
                        {task.users?.map((user) => user.name).join(", ") || ""}
                    </div>
                )}
            </div>

            <TaskDialog
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                task={task}
                isEditingTitle={isEditingTitle}
                setIsEditingTitle={setIsEditingTitle}
                isEditingDescription={isEditingDescription}
                setIsEditingDescription={setIsEditingDescription}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                editingDescription={editingDescription}
                setEditingDescription={setEditingDescription}
                isCompleted={isCompleted}
                setIsCompleted={setIsCompleted}
                handleSave={handleSave}
                handleTaskUpdate={handleTaskUpdate}
                deleteTask={deleteTask}
                t={t}
            />
        </div>
    );
};