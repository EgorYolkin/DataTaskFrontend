// DashboardTasks.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TaskInterface } from "@/interfaces/TasksInterfase.tsx";
import { useTranslation } from "react-i18next";
import { TaskRow } from "@/components/internal/tasks/TaskRow";
import {Separator} from "@/components/ui/separator.tsx"; // Import TaskRow

// Global filter function (остается без изменений)
const globalFilterFn = (task: TaskInterface, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const title = task.title ? task.title.toLowerCase() : "";
    const description = task.description ? task.description.toLowerCase() : "";
    return title.includes(search) || description.includes(search);
};

export function DashboardTasks({ tasks }: { tasks: TaskInterface[] }) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
    const [columnVisibility, setColumnVisibility] = useState({
        title: true,
        description: true,
        users: true,
    });
    const [t] = useTranslation();

    useEffect(() => {
        console.log("Tasks received:", tasks);
        console.log("Filtered tasks:", filteredTasks);
    }, [tasks, globalFilter]);


    const filteredTasks = useMemo(() => {
        let filtered: TaskInterface[] = [];

        if (tasks) {
            filtered = tasks.filter((task) => globalFilterFn(task, globalFilter));
        }

        if (sortDirection) {
            filtered.sort((a, b) => {
                const comparison = a.title.localeCompare(b.title);
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [tasks, globalFilter, sortDirection]);

    const toggleSort = () => {
        if (sortDirection === "asc") {
            setSortDirection("desc");
        } else if (sortDirection === "desc") {
            setSortDirection(null);
        } else {
            setSortDirection("asc");
        }
    };

    const toggleColumnVisibility = (column: keyof typeof columnVisibility) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    return (
        <div className="w-full p-4">

            <span className="text-2xl font-semibold">{t('All tasks')}</span>
            <Separator className="mt-4"/>
            <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
                <Input
                    placeholder={`${t("Filter tasks")}...`}
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm w-full"
                />
                <div className="flex items-center gap-4">
                    <div
                        className="flex font-semibold items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 bg-black text-white rounded-[15px]"
                        onClick={toggleSort}
                    >
                        {t("Sort by Title")}
                        <ArrowUpDown size="1em" />
                        {sortDirection && (
                            <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex font-semibold items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 bg-black text-white rounded-[15px]">
                                {t("Columns")} <ChevronDown size="1em" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.keys(columnVisibility).map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column}
                                    className="capitalize"
                                    checked={columnVisibility[column as keyof typeof columnVisibility]}
                                    onCheckedChange={() => toggleColumnVisibility(column as keyof typeof columnVisibility)}
                                >
                                    {column}u
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Separator/>
            <div className="space-y-2">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskRow key={task.id} task={task} columnVisibility={columnVisibility} />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {t("No tasks found")}
                    </div>
                )}
            </div>
        </div>
    );
}