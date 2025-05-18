import * as React from "react"
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx"
import {Input} from "@/components/ui/input"
import {TrashIcon} from "lucide-react"

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

interface KanbanHeaderProps {
    kanban: KanbanInterface
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({kanban, onKanbanNameChange}) => {
    const [isEditing, setIsEditing] = React.useState(false)
    const [editingName, setEditingName] = React.useState(kanban.name)

    React.useEffect(() => {
        if (!isEditing) {
            setEditingName(kanban.name)
        }
    }, [kanban.name, isEditing])

    const startEditing = () => {
        setIsEditing(true)
        setEditingName(kanban.name)
    }

    const saveEditing = () => {
        const trimmedName = editingName.trim()
        if (trimmedName && trimmedName !== kanban.name) {
            onKanbanNameChange(kanban, trimmedName)
        } else {
            setEditingName(kanban.name)
        }
        setIsEditing(false)
    }

    const cancelEditing = () => {
        setEditingName(kanban.name)
        setIsEditing(false)
    }

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
        <div className="flex items-center justify-between cursor-pointer p-2">
            <div
                className="cursor-pointer font-bold hover:opacity-80"
                onClick={startEditing}
            >
                {editingName || kanban?.name || "Backlog"}
            </div>
            <div onClick={() => deleteKanban(kanban.id)}>
                <TrashIcon className="w-4 text-red-500"/>
            </div>
        </div>
    )
}