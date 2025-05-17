"use client"

import * as React from "react"
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TaskInterface } from "@/interfaces/TasksInterfase.tsx"
import { useTranslation } from "react-i18next";
import { CheckStatus } from "@/components/internal/tasks/components/CheckStatus.tsx";

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
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

// Global filter function with null/undefined protection
const globalFilterFn = (row: Row<TaskInterface>, filterValue: string) => {
    const task = row.original;
    const search = filterValue.toLowerCase();
    const title = task.title ? task.title.toLowerCase() : "";
    const description = task.description ? task.description.toLowerCase() : "";
    return title.includes(search) || description.includes(search);
};

// Column definitions
export const columns: ColumnDef<TaskInterface>[] = [
    {
        id: "select",
        header: () => <></>,
        cell: ({ row }) => (
            <div>
                <ErrorBoundary>
                    <CheckStatus taskID={row.original.id} isCompleted={row.original.is_completed} />
                </ErrorBoundary>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Task Title
                <ArrowUpDown size="1em" />
            </div>
        ),
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
        accessorKey: "users",
        header: "Assigned Users",
        cell: ({ row }) => {
            const users = row.getValue("users") as any[] | undefined;
            return <div>{users?.map(user => user.name).join(", ") || "No users"}</div>;
        },
    },
];

export function DashboardTasks({ tasks }: { tasks: TaskInterface[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [t] = useTranslation();

    // Debugging logs
    React.useEffect(() => {
        console.log("Tasks received:", tasks);
        console.log("Filtered rows:", table?.getRowModel().rows.map(row => row.original));
    }, [tasks, globalFilter]);

    const table = useReactTable({
        data: tasks,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: globalFilterFn,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <ErrorBoundary>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <Input
                        placeholder={t('Filter tasks') + "..."}
                        value={table.getState().globalFilter ?? ""}
                        onChange={(event) => table.setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center ml-auto cursor-pointer gap-2">
                                Columns <ChevronDown size="1em" />
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
        </ErrorBoundary>
    )
}