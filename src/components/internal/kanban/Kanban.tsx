import * as React from "react"
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx"
import {KanbanHeader} from "./KanbanHeader.tsx"
import {KanbanTask} from "./KanbanTask.tsx"
import {Input} from "@/components/ui/input"
import {useTranslation} from "react-i18next"
import {useCallback} from "react"
import {Separator} from "@/components/ui/separator.tsx"

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

interface KanbanProps {
    kanban: KanbanInterface
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void
}

export const Kanban: React.FC<KanbanProps> = ({kanban, onKanbanNameChange}) => {
    const [task, setTask] = React.useState<string | null>(null)
    const [t] = useTranslation()
    const [sortField, setSortField] = React.useState<"title" | "is_completed" | null>(null)
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
    const [filterText, setFilterText] = React.useState("")

    const handleTaskCreate = useCallback(async () => {
        try {
            if (task && task.trim()) {
                await createTask({
                    title: task.trim(),
                    description: "No description",
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

    // Sorting and filtering logic
    const sortedAndFilteredTasks = React.useMemo(() => {
        let tasks = [...(kanban.tasks || [])]

        // Apply filter
        if (filterText) {
            tasks = tasks.filter(task =>
                task.title.toLowerCase().includes(filterText.toLowerCase())
            )
        }

        // Apply sorting
        if (sortField) {
            tasks.sort((a, b) => {
                let comparison = 0
                if (sortField === "title") {
                    comparison = a.title.localeCompare(b.title)
                } else if (sortField === "is_completed") {
                    comparison = (a.is_completed ? 1 : 0) - (b.is_completed ? 1 : 0)
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return tasks
    }, [kanban.tasks, sortField, sortDirection, filterText])

    const toggleSort = (field: "title" | "is_completed") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    return (
        <div className="p-2">
            <KanbanHeader
                kanban={kanban}
                onKanbanNameChange={onKanbanNameChange}
            />

            <Separator className="mt-3 mb-3" />

            <div className="my-2">
                <Input
                    placeholder={t("Filter tasks...")}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="mb-2"
                />
                <div className="flex gap-2">
                    <div
                        onClick={() => toggleSort("title")}
                        className={`px-5 py-1 ${sortField === "title" ? "bg-black text-white" : "bg-gray-100"} rounded-xl cursor-pointer`}
                    >
                        {t("Sort by Title")} {sortField === "title" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </div>
                    <div
                        onClick={() => toggleSort("is_completed")}
                        className={`px-5 py-1 ${sortField === "is_completed" ? "bg-black text-white" : "bg-gray-100"} rounded-xl cursor-pointer`}
                    >
                        {t("Sort by Status")} {sortField === "is_completed" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </div>
                </div>
            </div>

            <Separator className="mt-3 mb-3" />

            <div className="flex flex-col gap-2">
                {sortedAndFilteredTasks.length ? (
                    sortedAndFilteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className="cursor-pointer hover:bg-gray-100 rounded-xl p-2 bg-gray-100"
                        >
                            <KanbanTask task={task} />
                        </div>
                    ))
                ) : (
                    <div className="p-2 text-center">{t("No tasks found")}</div>
                )}
            </div>

            <Separator className="mt-3 mb-3" />

            <div className="mt-2">
                <Input
                    placeholder={t("Create task")}
                    value={task || ""}
                    onChange={(e) => setTask(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleTaskCreate()
                        }
                    }}
                />
            </div>
        </div>
    )
}