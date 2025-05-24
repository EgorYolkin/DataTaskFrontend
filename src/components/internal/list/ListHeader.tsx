import * as React from "react"
import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx"
import {Input} from "@/components/ui/input"
import {TrashIcon} from "lucide-react"
import {useTranslation} from "react-i18next";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

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

interface DeleteKanbanDialogProps {
    kanbanID: number;
    deleteKanban: (taskID: number) => void;
}

export const DeleteKanbanDialog: React.FC<DeleteKanbanDialogProps> = ({kanbanID, deleteKanban}) => {
    const [t] = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="text-red-500 w-fit cursor-pointer"
                >
                    <TrashIcon className="w-5 h-5"/>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('Delete kanban')}?</DialogTitle>
                    <DialogDescription>
                        {t('Confirm deletion of the kanban')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <div className="flex gap-2">
                            <Button type="button" className="text-white" variant="secondary">
                                {t('Cancel')}
                            </Button>
                            <div
                                onClick={() => {
                                    deleteKanban(kanbanID);
                                }}
                                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white  pr-4 pl-4 pt-1 pb-1 rounded-sm">
                                {t('Delete kanban')}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface ListHeaderProps {
    kanban: KanbanInterface
    onKanbanNameChange: (kanban: KanbanInterface, newName: string) => void
}

export const ListHeader: React.FC<ListHeaderProps> = ({kanban, onKanbanNameChange}) => {
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
        <div className="flex items-center text-[20px] justify-between cursor-pointer p-2">
            <div
                className="cursor-pointer font-bold hover:opacity-80"
                onClick={startEditing}
            >
                {editingName || kanban?.name || "Backlog"}
            </div>
            {kanban?.id && (
                <DeleteKanbanDialog deleteKanban={deleteKanban} kanbanID={kanban.id}/>
            )}
        </div>
    )
}
