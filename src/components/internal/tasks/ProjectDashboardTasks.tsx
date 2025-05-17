"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {useTranslation} from "react-i18next"
import {CheckStatus} from "@/components/internal/tasks/components/CheckStatus.tsx"
import {TrashIcon} from "lucide-react";
import {useCallback} from "react";

interface KanbanNameHeaderMeta {
    kanban: KanbanInterface
    isEditing: boolean
    editingName: string
    startEditing: () => void
    saveEditing: () => void
    cancelEditing: () => void
    setEditingName: (name: string) => void
}

function getColumns(): ColumnDef<TaskInterface>[] {
    return [
        {
            accessorKey: "title",
            header: ({table}) => {
                const {
                    isEditing,
                    editingName,
                    startEditing,
                    saveEditing,
                    cancelEditing,
                    setEditingName,
                    kanban,
                } = table.options.meta as KanbanNameHeaderMeta

                if (isEditing) {
                    return (
                        <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    saveEditing()
                                } else if (e.key === "Escape") {
                                    e.preventDefault()
                                    cancelEditing()
                                }
                            }}
                            autoFocus
                            className="h-6 text-sm p-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )
                }

                return (
                    <div className="flex items-center justify-between cursor-pointer">
                        <div
                            className="cursor-pointer font-bold hover:opacity-80 flex justify-between"
                            onClick={startEditing}
                        >
                            {editingName || kanban?.name || "Backlog"}
                        </div>
                        <div onClick={() => {
                            deleteKanban(kanban.id)
                        }}>
                            <TrashIcon className="w-4 text-red-500"></TrashIcon>
                        </div>
                    </div>
                )
            },
            cell: ({row}) => {
                const task = row.original
                return (
                    <div className="font-medium text-wrap flex flex-col gap-2 justify-center">
                        {task.title}
                        <div className="flex flex-wrap gap-2 text-white">
                            {task.users && Array.isArray(task.users) && (
                                task.users.map((user) => (
                                    <Avatar key={user.id} className="w-6 h-6">
                                        <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                        <AvatarFallback className="bg-gray-600">
                                            {user.name[0] + user.surname[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                ))
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            id: "select",
            header: () => <></>,
            cell: ({row}) => (
                <CheckStatus taskID={row.original.id} isCompleted={row.original.is_completed}/>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ]
}

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

async function deleteKanban(kanbanID: number) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/kanban/${kanbanID}`, {
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
            throw new Error(errorData?.message || `Ошибка удаления канбана: ${response.status}`);
        } catch (e) {
            console.error("Ошибка при обработке ответа об ошибке:", e);
            throw new Error(`Ошибка удаления канбана: ${response.status}`);
        }
    }

    window.location.reload();
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

interface ProjectDashboardTasksProps {
    kanban: KanbanInterface
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void
}

export const ProjectDashboardTasks: React.FC<ProjectDashboardTasksProps> = React.memo(
    ({kanban, onKanbanNameChange}) => {
        const [sorting, setSorting] = React.useState<SortingState>([])
        const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
        const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
        const [rowSelection, setRowSelection] = React.useState({})
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        const [selectedTask, setSelectedTask] = React.useState<TaskInterface | null>(null)
        const [selectedTaskIsComplete, setSelectedTaskIsComplete] = React.useState<boolean>(selectedTask?.is_completed || false)
        const [task, setTask] = React.useState<string | null>(null)
        const [t] = useTranslation()

        const [isEditingKanbanName, setIsEditingKanbanName] = React.useState(false)
        const [editingKanbanName, setEditingKanbanName] = React.useState(kanban.name)

        const [isEditingTitle, setIsEditingTitle] = React.useState(false)
        const [isEditingDescription, setIsEditingDescription] = React.useState(false)
        const [editingTitle, setEditingTitle] = React.useState(selectedTask?.title || "")
        const [editingDescription, setEditingDescription] = React.useState(selectedTask?.description || "")

        React.useEffect(() => {
            if (selectedTask) {
                setEditingTitle(selectedTask.title)
                setEditingDescription(selectedTask.description || "")
            }
        }, [selectedTask])

        React.useEffect(() => {
            setSelectedTaskIsComplete(selectedTask?.is_completed || false)
        }, [selectedTask])

        React.useEffect(() => {
            if (!isEditingKanbanName) {
                setEditingKanbanName(kanban.name)
            }
        }, [kanban.name, isEditingKanbanName])

        const startEditingKanbanName = React.useCallback(() => {
            setIsEditingKanbanName(true)
            setEditingKanbanName(kanban.name)
        }, [kanban.name])

        const saveEditingKanbanName = React.useCallback(() => {
            const trimmedName = editingKanbanName.trim()
            if (trimmedName && trimmedName !== kanban.name) {
                onKanbanNameChange(kanban, trimmedName)
            } else {
                setEditingKanbanName(kanban.name)
            }
            setIsEditingKanbanName(false)
        }, [kanban, editingKanbanName, onKanbanNameChange])

        const cancelEditingKanbanName = React.useCallback(() => {
            setEditingKanbanName(kanban.name)
            setIsEditingKanbanName(false)
        }, [kanban.name])

        const table = useReactTable({
            data: kanban.tasks || [],
            columns: getColumns(),
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            onColumnVisibilityChange: setColumnVisibility,
            onRowSelectionChange: setRowSelection,
            state: {
                sorting,
                columnFilters,
                columnVisibility,
                rowSelection,
            },
            meta: {
                kanban,
                isEditing: isEditingKanbanName,
                editingName: editingKanbanName,
                startEditing: startEditingKanbanName,
                saveEditing: saveEditingKanbanName,
                cancelEditing: cancelEditingKanbanName,
                setEditingName: setEditingKanbanName,
            },
        })

        const handleRowClick = React.useCallback((task: TaskInterface) => {
            setSelectedTask(task)
            setSelectedTaskIsComplete(task.is_completed || false)
            setIsModalOpen(true)
        }, [setSelectedTask, setIsModalOpen])

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
        }, [t, task, kanban.id])

        const handleTaskUpdate = useCallback(async () => {
            if (selectedTask?.id) {
                try {
                    await updateTask({
                        title: selectedTask.title,
                        description: selectedTask.description,
                        kanban_id: kanban.id,
                        is_completed: !selectedTaskIsComplete,
                    }, selectedTask.id)
                } catch (error: any) {
                    console.error("Ошибка при обновлении задачи:", error)
                }
            } else {
                console.warn("ID выбранной задачи не определен, невозможно обновить.")
            }
        }, [selectedTask, selectedTaskIsComplete, kanban.id])

        const handleSave = async () => {
            if (selectedTask) {
                const updatedTask = {
                    ...selectedTask,
                    title: editingTitle,
                    description: editingDescription,
                }
                try {
                    await updateTask(updatedTask, selectedTask.id)
                    setSelectedTask(updatedTask)
                    setIsEditingTitle(false)
                    setIsEditingDescription(false)
                } catch (error) {
                    console.error("Ошибка при обновлении задачи:", error)
                }
            }
        }

        return (
            <div className="min-w-[250px] max-w-[250px]">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table?.getRowModel()?.rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleRowClick(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length}>
                                        {t("No tasks found")}
                                    </TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length}>
                                    <Input
                                        placeholder={t('Create task')}
                                        value={task || ""}
                                        onChange={(e) => {
                                            setTask(e.target.value)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleTaskCreate()
                                            }
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <div className="flex justify-between">
                            <div className="flex flex-col w-[70%]">
                                {isEditingTitle ? (
                                    <Input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={handleSave}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleSave()
                                            } else if (e.key === "Escape") {
                                                e.preventDefault()
                                                setIsEditingTitle(false)
                                            }
                                        }}
                                        autoFocus
                                        className="text-xl font-semibold"
                                    />
                                ) : (
                                    <span
                                        className="text-xl font-semibold"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        {selectedTask?.title}
                                    </span>
                                )}
                                {isEditingDescription ? (
                                    <textarea
                                        value={editingDescription}
                                        onChange={(e) => setEditingDescription(e.target.value)}
                                        onBlur={handleSave}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleSave()
                                            } else if (e.key === "Escape") {
                                                e.preventDefault()
                                                setIsEditingDescription(false)
                                            }
                                        }}
                                        autoFocus
                                        className="text-sm text-gray-700 w-full"
                                    />
                                ) : (
                                    <span
                                        className="text-sm text-gray-700"
                                        onClick={() => setIsEditingDescription(true)}
                                    >
                                        {selectedTask?.description || t("No description provided.")}
                                    </span>
                                )}
                            </div>
                            <div className="w-[30%] flex justify-end">
                                <div
                                    className="text-red-500 w-fit cursor-pointer"
                                    onClick={() => {
                                        if (selectedTask?.id) {
                                            deleteTask(selectedTask.id)
                                        } else {
                                            console.warn("ID задачи не найден при попытке удаления.")
                                        }
                                    }}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        {selectedTask && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">{t("Status")}</h4>
                                    <span className="flex items-center gap-2 mt-2 cursor-pointer"
                                          onClick={handleTaskUpdate}>
                                        <CheckStatus
                                            isCompleted={selectedTaskIsComplete}
                                            taskID={selectedTask.id}
                                        />
                                        {selectedTaskIsComplete ? (
                                            <span className="text-sm font-semibold">{t("Completed")}</span>
                                        ) : (
                                            <span className="text-sm font-semibold">{t("Don't completed")}</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        )
    },
    (prevProps, nextProps) => {
        return prevProps.kanban === nextProps.kanban && prevProps.onKanbanNameChange === nextProps.onKanbanNameChange
    }
)