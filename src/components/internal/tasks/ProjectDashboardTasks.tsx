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
import {Circle, CircleCheck} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input" // Make sure Input is imported
import {Button} from "@/components/ui/button"
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {useTranslation} from "react-i18next"

interface Comment {
    id: number
    text: string
    user: string
    timestamp: string
}

// Define the props needed for the Kanban name header cell
interface KanbanNameHeaderMeta {
    kanban: KanbanInterface;
    isEditing: boolean;
    editingName: string;
    startEditing: () => void;
    saveEditing: () => void;
    cancelEditing: () => void;
    setEditingName: (name: string) => void; // Add setter for input change
}

// Define the columns outside the component, using meta
export const columns: ColumnDef<TaskInterface>[] = [
    {
        accessorKey: "title",
        header: ({table}) => {
            // Access the meta object provided to the table
            const meta = table.options.meta as KanbanNameHeaderMeta;

            // Render input if editing, otherwise render clickable div
            if (meta.isEditing) {
                return (
                    <Input
                        value={meta.editingName}
                        onChange={(e) => meta.setEditingName(e.target.value)} // Update state on input change
                        onBlur={meta.saveEditing} // Save when input loses focus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent default form submission
                                meta.saveEditing(); // Save on Enter key
                            } else if (e.key === 'Escape') {
                                e.preventDefault(); // Prevent default Escape behavior
                                meta.cancelEditing(); // Cancel on Escape key
                            }
                        }}
                        autoFocus // Automatically focus the input when it appears
                        className="h-6 text-sm p-1 w-full" // Basic styling, adjust as needed
                        // Optional: Prevent click propagation that might interfere
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            }

            // Display the Kanban name when not editing, make it clickable
            return (
                <div
                    className="cursor-pointer font-bold hover:opacity-80" // Add cursor and hover effect
                    onClick={meta.startEditing} // Start editing on click
                >
                    {/* Display the currently edited name (or original if not edited yet) */}
                    {meta.editingName || meta.kanban?.name || "Backlog"}
                </div>
            );
        },
        cell: ({row}) => {
            const task = row.original
            return (
                <div className="font-medium text-wrap flex flex-col gap-2 justify-center">
                    {task.title}
                    <div className="flex flex-wrap gap-2 text-white">
                        {task.users.map((user) => (
                            <Avatar key={user.id} className="w-6 h-6"> {/* Add key */}
                                <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                <AvatarFallback className="bg-gray-600">
                                    {user.name[0] + user.surname[0]}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            )
        },
    },
    {
        id: "select",
        header: () => <></>,
        cell: ({row}) => (
            <div>
                {row.original.isCompleted ? (
                    <CircleCheck className="text-green-500 cursor-pointer" size="20"/>
                ) : (
                    <Circle className="text-gray-400 hover:text-gray-600 cursor-pointer" size="20"/>
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

// Define the props interface for ProjectDashboardTasks, including the new prop
interface ProjectDashboardTasksProps {
    kanban: KanbanInterface;
    // Callback function to notify parent of name change
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void;
}

// Update the component to accept the new prop
export function ProjectDashboardTasks({kanban, onKanbanNameChange}: ProjectDashboardTasksProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [selectedTask, setSelectedTask] = React.useState<TaskInterface | null>(null)
    const [commentText, setCommentText] = React.useState("")
    const [t] = useTranslation()
    const [comments, setComments] = React.useState<Comment[]>([
        {
            id: 1,
            text: "This task looks good, but we need to clarify the requirements.",
            user: "Egor Yolkin", // Example user
            timestamp: "2025-04-29 10:00",
        },
    ])

    // State for Kanban name editing
    const [isEditingKanbanName, setIsEditingKanbanName] = React.useState(false);
    const [editingKanbanName, setEditingKanbanName] = React.useState(kanban.name);

    // Effect to update the internal editing state if the kanban prop changes
    // This is important if the parent updates the kanban object externally
    React.useEffect(() => {
        if (!isEditingKanbanName) { // Only update if not currently in editing mode
            setEditingKanbanName(kanban.name);
        }
    }, [kanban.name, isEditingKanbanName]); // Re-run if kanban name prop or editing state changes

    // Handlers for Kanban name editing
    const startEditingKanbanName = () => {
        setIsEditingKanbanName(true);
        // Set the editing name to the current kanban name when starting edit
        setEditingKanbanName(kanban.name);
    };

    const saveEditingKanbanName = () => {
        const trimmedName = editingKanbanName.trim();

        // Only save if the name has changed and is not empty
        if (trimmedName && trimmedName !== kanban.name) {
            onKanbanNameChange(kanban, trimmedName); // Call the parent handler
        } else {
            // Revert to the original name if empty or unchanged
            setEditingKanbanName(kanban.name);
        }

        setIsEditingKanbanName(false); // Exit editing mode
    };

    const cancelEditingKanbanName = () => {
        // Revert to the original name and exit editing mode
        setEditingKanbanName(kanban.name);
        setIsEditingKanbanName(false);
    };


    const table = useReactTable({
        data: kanban.tasks,
        columns,
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
        // Pass editing state and handlers to the column definitions via meta
        meta: {
            kanban,
            isEditing: isEditingKanbanName,
            editingName: editingKanbanName,
            startEditing: startEditingKanbanName,
            saveEditing: saveEditingKanbanName,
            cancelEditing: cancelEditingKanbanName,
            setEditingName: setEditingKanbanName, // Pass the setter
        } as KanbanNameHeaderMeta, // Explicitly type meta

    })

    const handleRowClick = (task: TaskInterface) => {
        setSelectedTask(task)
        setIsModalOpen(true)
    }

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            setComments([
                ...comments,
                {
                    id: comments.length + 1,
                    text: commentText,
                    user: "Current User", // Replace with actual user data in a real app
                    timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                },
            ])
            setCommentText("")
        }
    }

    return (
        <div className="min-w-[250px] max-w-[250px]">
            <div className="flex items-center py-4">
                {/* Column Visibility Dropdown - Keep as is */}
                <DropdownMenu>
                    {/* ... DropdownMenuTrigger etc. */}
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
                        {table.getRowModel().rows?.length ? (
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t("No tasks found")}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Task Detail Modal - Keep as is */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex flex-col gap-2">{selectedTask?.title}</div>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTask?.description || t("No description provided.")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4">
                            {/* ... Task details and comments section - Keep as is */}
                            <div>
                                <h4 className="font-semibold">{t("Status")}</h4>
                                <span className="flex items-center gap-2 mt-2">
                                    {selectedTask.isCompleted ? (
                                        <>
                                            <CircleCheck className="text-green-500" size="20"/>
                                            <span className="text-sm font-semibold">{t("Completed")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Circle className="text-gray-400" size="20"/>
                                            <span className="text-sm font-semibold">{t("Don't completed")}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-semibold">{t("Assigned users")}</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedTask.users.length > 0 ? (
                                        selectedTask.users.map((user) => (
                                            <Badge
                                                key={user.id}
                                                className="rounded-full pt-1 pb-1 pr-5 flex gap-2 items-center"
                                            >
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                                    <AvatarFallback className="bg-gray-600">
                                                        {user.name[0] + user.surname[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.name} {user.surname}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-600">{t("No users assigned")}</span>
                                    )}
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div>
                                <h4 className="font-semibold">{t("Comments")}</h4>
                                <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="border-l-2 border-gray-200 pl-3 py-1"
                                            >
                                                <p className="text-sm font-medium">{comment.user}</p>
                                                <p className="text-sm text-gray-600">{comment.text}</p>
                                                <p className="text-xs text-gray-400">{comment.timestamp}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">{t("No comments yet.")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Comment Form */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t("Add a comment") + "..."}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <Button onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                                    {t("Publish")}
                                </Button>
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}