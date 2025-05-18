"use client"

import * as React from "react"
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx"
import {Kanban} from "@/components/internal/kanban/Kanban.tsx";

interface ProjectDashboardTasksProps {
    kanban: KanbanInterface
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void
}

export const ProjectDashboardTasks: React.FC<ProjectDashboardTasksProps> = React.memo(
    ({kanban, onKanbanNameChange}) => {

        return (
            <div className="min-w-[300px] max-w-[450px]">
                <div className="rounded-md border">
                    <Kanban
                        kanban={kanban}
                        onKanbanNameChange={onKanbanNameChange}
                    />
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        return prevProps.kanban === nextProps.kanban && prevProps.onKanbanNameChange === nextProps.onKanbanNameChange
    }
)