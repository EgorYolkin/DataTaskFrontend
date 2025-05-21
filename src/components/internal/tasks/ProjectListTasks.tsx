"use client";

import * as React from "react";
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {useTranslation} from "react-i18next";
import {TaskRow} from "@/components/internal/tasks/TaskRow.tsx";


interface ProjectListTasksProps {
    kanbans: KanbanInterface[]; // Принимает массив канбан-досок
}

export const ProjectListTasks: React.FC<ProjectListTasksProps> = React.memo(
    ({kanbans}) => {
        const [t] = useTranslation();

        // Собираем все задачи из всех канбанов в один плоский список
        const allTasks: TaskInterface[] = React.useMemo(() => {
            return kanbans.flatMap(kanban => kanban.tasks || []);
        }, [kanbans]);

        if (allTasks.length === 0) {
            return <p className="p-4 text-center text-gray-500">{t("No tasks found for this project/topic.")}</p>;
        }

        return (
            <div className="flex flex-col gap-2">
                {allTasks.map(task => (
                    <TaskRow key={task.id} task={task} columnVisibility={
                        {
                            title: true,
                            description: true,
                            users: false,
                        }
                    }/>
                ))}
            </div>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.kanbans === nextProps.kanbans;
    }
);