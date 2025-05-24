"use client";

import * as React from "react";
import { KanbanInterface, TaskInterface } from "@/interfaces/TasksInterfase.tsx"; // Предположим, что TaskInterface определен
import { TaskRow } from "@/components/internal/tasks/TaskRow.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useState } from "react"; // useState добавлен
import { useTranslation } from "react-i18next";
import { ListHeader } from "@/components/internal/list/ListHeader.tsx";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";

// Функция createTask должна возвращать созданную задачу (TaskInterface)
async function createTask(taskData: Record<string, string | number | boolean | undefined>): Promise<TaskInterface> { // Уточняем тип возвращаемого значения
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/task/`, {
        method: "POST",
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
            throw new Error(errorData?.message || `Ошибка создания задачи: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка создания задачи: ${response.status}`);
        }
    }

    const responseData: FetchResponse = await response.json();
    return responseData.data;
}

interface TasksListProps {
    kanban: KanbanInterface;
    onTaskAdded: (newTask: TaskInterface, kanbanId: string | number) => void;
}

export const TasksList: React.FC<TasksListProps> = React.memo(
    ({ kanban, onTaskAdded }) => {
        const [newTaskTitle, setNewTaskTitle] = useState<string>(""); // Состояние для инпута новой задачи
        const [isCreating, setIsCreating] = useState<boolean>(false); // Состояние для индикации загрузки
        const [t] = useTranslation();

        const handleTaskCreate = useCallback(async () => {
            if (newTaskTitle && newTaskTitle.trim() && !isCreating) {
                setIsCreating(true);
                try {
                    const createdTask: TaskInterface = await createTask({
                        title: newTaskTitle.trim(),
                        description: "",
                        kanban_id: kanban.id,
                        is_completed: false,
                    });
                    onTaskAdded(createdTask, kanban.id);
                    setNewTaskTitle("");
                } catch (error: any) {
                    console.error("Ошибка при создании задачи:", error);
                    // Здесь можно показать уведомление об ошибке пользователю
                } finally {
                    setIsCreating(false);
                }
            }
        }, [newTaskTitle, kanban.id, onTaskAdded, isCreating]);


        return (
            <div className="flex flex-col gap-2">
                <ListHeader kanban={kanban} onKanbanNameChange={() => {
                    console.log("Kanban name change requested for:", kanban.id);
                }}/>
                {kanban.tasks.map(task => (
                    <TaskRow key={task.id || 0} task={task} columnVisibility={
                        {
                            title: true,
                            description: true,
                            users: false,
                        }
                    }/>
                ))}
                <div className="mt-2">
                    <Input
                        placeholder={t("Create task")}
                        value={newTaskTitle} // Управляем значением инпута
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !isCreating) {
                                handleTaskCreate();
                            }
                        }}
                        disabled={isCreating} // Блокируем инпут во время создания
                    />
                    {isCreating && <p className="text-sm text-gray-500 mt-1">{t("Creating task...")}</p>}
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.kanban === nextProps.kanban && prevProps.onTaskAdded === nextProps.onTaskAdded;
    }
);