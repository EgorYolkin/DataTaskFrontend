"use client";

import * as React from "react";
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx";
import {TaskRow} from "@/components/internal/tasks/TaskRow.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useCallback} from "react";
import {useTranslation} from "react-i18next";
import {ListHeader} from "@/components/internal/list/ListHeader.tsx";

async function createTask(taskData: Record<string, string | number | boolean | undefined>) {
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

    const responseData = await response.json();
    return responseData;
}

interface ProjectListTasksProps {
    kanban: KanbanInterface; // Принимает массив канбан-досок
}

export const ProjectListTasks: React.FC<ProjectListTasksProps> = React.memo(
    ({kanban}) => {
        const [task, setTask] = React.useState<string | null>(null)
        const [t] = useTranslation();

        const handleTaskCreate = useCallback(async () => {
            try {
                if (task && task.trim()) {
                    await createTask({
                        title: task.trim(),
                        description: "",
                        kanban_id: kanban.id,
                        is_completed: false,
                    })
                    setTask("")
                    window.location.reload()
                }
            } catch (error: any) {
                console.error("Ошибка при создании задачи:", error)
            }
        }, [task, kanban.id])


        return (
            <div className="flex flex-col gap-2">
                {/*<div className="flex items-center justify-between">*/}
                {/*    <span className="text-[20px] font-semibold">*/}
                {/*        {kanban.name}*/}
                {/*    </span>*/}
                {/*    <span>*/}
                {/*        123*/}
                {/*    </span>*/}
                {/*</div>*/}
                <ListHeader kanban={kanban} onKanbanNameChange={() => {}} />
                {kanban.tasks.map(task => (
                    <TaskRow key={task.id} task={task} columnVisibility={
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
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleTaskCreate()
                            }
                        }}
                    />
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.kanban === nextProps.kanban;
    }
);