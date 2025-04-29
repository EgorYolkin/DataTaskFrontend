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
import {ArrowUpDown, ChevronDown, Circle, CircleCheck} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {KanbanInterface, TaskInterface} from "@/interfaces/TasksInterfase.tsx"
import {useTranslation} from "react-i18next";

// @ts-ignore
const fuzzyFilter = (row, columnId, filterValue) => {
    const title = row.original.title?.toLowerCase() ?? "";
    const description = row.original.description?.toLowerCase() ?? "";
    const search = filterValue.toLowerCase();

    return title.includes(search) || description.includes(search);
};

// Update the columns to work with TaskInterface
// @ts-ignore
export const columns: ColumnDef<TaskInterface>[] = [
    {
        id: "select",
        header: () => <></>,
        cell: ({row}) => (
            <div>
                {row.original.isCompleted ? (
                    <CircleCheck
                        className="text-green-500 cursor-pointer"
                        size="20"
                    />
                ) : (
                    <Circle
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        size="20"
                    />
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        filterFn: "fuzzy",
        header: ({column}) => (
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Task Title
                <ArrowUpDown size="1em"/>
            </div>
        ),
        cell: ({row}) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({row}) => <div>{row.getValue("description")}</div>,
    },
    {
        accessorKey: "users",
        header: "Assigned Users",
        cell: ({row}) => (
            <div>
                {(row.getValue("users") as any[])?.map(user => user.name).join(", ") || "None"}
            </div>
        ),
    },
    {
        accessorKey: "isCompleted",
        header: "Status",
        cell: ({row}) => (
            <div>
                {row.getValue("isCompleted") ? "Completed" : "Pending"}
            </div>
        ),
    },
]

// Update component to receive KanbanInterface as props
export function DashboardTasks({kanban}: { kanban: KanbanInterface }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [t] = useTranslation();

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
        filterFns: {
            fuzzy: fuzzyFilter,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder={t('Filter tasks') + "..."}
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center ml-auto cursor-pointer gap-2">
                            Columns <ChevronDown size="1em"/>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
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
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {t('No tasks found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}