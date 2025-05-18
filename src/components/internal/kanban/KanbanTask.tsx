import * as React from "react"
import {TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {UserInterface} from "@/interfaces/UserInterface.tsx"
import {CheckStatus} from "@/components/internal/tasks/components/CheckStatus.tsx"
import {TaskDialog} from "@/components/internal/dialogs/TaskDialog.tsx"
import {useTranslation} from "react-i18next"

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

interface KanbanTaskProps {
    task: TaskInterface
}

export const KanbanTask: React.FC<KanbanTaskProps> = ({task}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [isEditingTitle, setIsEditingTitle] = React.useState(false)
    const [isEditingDescription, setIsEditingDescription] = React.useState(false)
    const [editingTitle, setEditingTitle] = React.useState(task.title)
    const [editingDescription, setEditingDescription] = React.useState(task.description || "")
    const [isCompleted, setIsCompleted] = React.useState(task.is_completed)
    const [t] = useTranslation()

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
        <>
            <div className="p-2">
                <div className="font-medium text-wrap flex gap-2 justify-between">
                    <span onClick={() => setIsModalOpen(true)}>{task.title}</span>
                    <div className="flex flex-wrap gap-2 text-white">
                        {task.users && Array.isArray(task.users) && (
                            task.users.map((user: UserInterface) => (
                                <Avatar key={user.id} className="w-6 h-6">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback className="bg-gray-600">
                                        {user.name[0] + user.surname[0]}
                                    </AvatarFallback>
                                </Avatar>
                            ))
                        )}
                    </div>
                    <div onClick={handleTaskUpdate}>
                        <CheckStatus taskID={task.id} isCompleted={isCompleted} />
                    </div>
                </div>
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
        </>
    )
}