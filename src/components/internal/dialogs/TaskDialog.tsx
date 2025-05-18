import * as React from "react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {CheckStatus} from "@/components/internal/tasks/components/CheckStatus.tsx";
import {TaskInterface} from "@/interfaces/TasksInterfase.tsx";
import {TFunction} from "i18next";
import {TrashIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useTranslation} from "react-i18next";

interface DeleteTaskDialogProps {
    taskID: number;
    deleteTask: (taskID: number) => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({taskID, deleteTask}) => {
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
                    <DialogTitle>{t('Delete task')}?</DialogTitle>
                    <DialogDescription>
                        {t('Confirm deletion of the task')}
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
                                    deleteTask(taskID);
                                }}
                                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white  pr-4 pl-4 pt-1 pb-1 rounded-sm">
                                {t('Delete task')}
                            </div>
                        </div>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface CommentInterface {
    id: number;
    author: {
        id: number;
        name?: string;
        surname?: string;
        email: string;
        avatar_url?: string | null;
        created_at?: string;
        updated_at?: string;
    };
    text: string;
    created_at: string;
    updated_at: string;
}

interface TaskDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskInterface | null;
    isEditingTitle: boolean;
    setIsEditingTitle: (isEditing: boolean) => void;
    isEditingDescription: boolean;
    setIsEditingDescription: (isEditing: boolean) => void;
    editingTitle: string;
    setEditingTitle: (title: string) => void;
    editingDescription: string;
    setEditingDescription: (description: string) => void;
    isCompleted: boolean;
    setIsCompleted: (isCompleted: boolean) => void;
    handleSave: () => Promise<void>;
    handleTaskUpdate: () => Promise<void>;
    deleteTask: (taskID: number) => Promise<void>;
    t: TFunction;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
                                                          isOpen,
                                                          onOpenChange,
                                                          task,
                                                          isEditingTitle,
                                                          setIsEditingTitle,
                                                          isEditingDescription,
                                                          setIsEditingDescription,
                                                          editingTitle,
                                                          setEditingTitle,
                                                          editingDescription,
                                                          setEditingDescription,
                                                          isCompleted,
                                                          setIsCompleted,
                                                          handleSave,
                                                          handleTaskUpdate,
                                                          deleteTask,
                                                          t,
                                                      }) => {
    const [comments, setComments] = React.useState<CommentInterface[]>([]);
    const [newCommentText, setNewCommentText] = React.useState("");
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const handleStatusClick = async () => {
        if (task) {
            setIsCompleted(!isCompleted);
            await handleTaskUpdate();
        }
    };

    const fetchComments = React.useCallback(async () => {
        if (task?.id) {
            try {
                const response = await fetch(`${apiUrl}/api/${apiVersion}/comment/forTask/${task.id}`, { // Используем правильный маршрут
                    method: "GET",
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
                        console.error("Ошибка при получении комментариев:", errorData);
                        throw new Error(errorData?.message || `Ошибка получения комментариев: ${response.status}`);
                    } catch (e) {
                        console.error("Ошибка при обработке ответа об ошибке:", e);
                        throw new Error(`Ошибка получения комментариев: ${response.status}`);
                    }
                }
                const data = await response.json();
                if (data.success) {
                    setComments(data.data as CommentInterface[]);
                } else {
                    console.error("Ошибка при получении комментариев:", data.error);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        }
    }, [task?.id, apiUrl, apiVersion]);

    const handleCreateComment = async () => {
        if (task?.id && newCommentText.trim()) {
            try {
                const response = await fetch(`${apiUrl}/api/${apiVersion}/comment/forTask`, { // Используем правильный маршрут
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Authorization": localStorage.getItem("accessToken") || "",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: newCommentText,
                        task_id: task.id,
                    }),
                });
                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                        console.error("Ошибка при создании комментария:", errorData);
                        throw new Error(errorData?.message || `Ошибка создания комментария: ${response.status}`);
                    } catch (e) {
                        console.error("Ошибка при обработке ответа об ошибке:", e);
                        throw new Error(`Ошибка создания комментария: ${response.status}`);
                    }
                }
                const data = await response.json();
                if (data.success) {
                    setNewCommentText("");
                    await fetchComments(); // Обновляем список комментариев
                } else {
                    console.error("Ошибка при создании комментария:", data.error);
                }
            } catch (error) {
                console.error("Error creating comment:", error);
            }
        }
    };

    React.useEffect(() => {
        if (isOpen && task?.id) {
            fetchComments();
        }
    }, [isOpen, task?.id, fetchComments]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                                        e.preventDefault();
                                        handleSave();
                                    } else if (e.key === "Escape") {
                                        e.preventDefault();
                                        setIsEditingTitle(false);
                                    }
                                }}
                                autoFocus
                                className="text-xl font-semibold"
                            />
                        ) : (
                            <span
                                className="text-xl font-semibold cursor-pointer"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                {task?.title}
                            </span>
                        )}
                        {isEditingDescription ? (
                            <textarea
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSave();
                                    } else if (e.key === "Escape") {
                                        e.preventDefault();
                                        setIsEditingDescription(false);
                                    }
                                }}
                                autoFocus
                                className="text-sm text-gray-700 w-full"
                            />
                        ) : (
                            <span
                                className="text-sm text-gray-700 cursor-pointer"
                                onClick={() => setIsEditingDescription(true)}
                            >
                                {task?.description || t("No description provided.")}
                            </span>
                        )}
                    </div>
                    <div className="w-[30%] flex justify-end">
                        {task?.id && (
                            <DeleteTaskDialog taskID={task.id} deleteTask={deleteTask}/>
                        )}
                    </div>
                </div>
                {task && (
                    <div className="space-y-4 mt-4">
                        <div>
                            <h4 className="font-semibold">{t("Status")}</h4>
                            <span
                                className="flex items-center gap-2 mt-2 cursor-pointer"
                                onClick={handleStatusClick}
                            >
                                <CheckStatus
                                    isCompleted={isCompleted}
                                    taskID={task.id}
                                />
                                <span className="text-sm font-semibold">
                                    {isCompleted ? t("Completed") : t("Don't completed")}
                                </span>
                            </span>
                        </div>

                        {/* Секция комментариев */}
                        <div>
                            <h4 className="font-semibold">{t("Comments")}</h4>
                            <ScrollArea className="h-40 w-full rounded-md pr-2">
                                <div className="mt-2 space-y-2">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="p-3 bg-gray-100 rounded-md">
                                            <p className="text-sm text-gray-500">
                                                {comment.author.name || comment.author.email} -{" "}
                                                {new Date(comment.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-gray-800">{comment.text}</p>
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <p className="text-sm text-gray-500">{t("No comments yet.")}</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Добавление нового комментария */}
                        <div className="mt-4 flex gap-2">
                            <Textarea
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder={t("Add a comment...")}
                                className="w-full"
                            />
                            <Button onClick={handleCreateComment} className="min-w-fit">
                                {t("Post")}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
