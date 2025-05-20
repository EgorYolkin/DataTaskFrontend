import {UserInterface} from "@/interfaces/UserInterface.tsx";

export interface KanbanInterface {
    id: number;
    name: string;
    tasks: TaskInterface[]
}

export interface TaskInterface {
    id: number;
    title: string;
    description: string;
    users: UserInterface[];
    is_completed: boolean;

    created_at: string;
    updated_at: string;
}