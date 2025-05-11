import {UserInterface} from "@/interfaces/UserInterface.tsx";

export interface KanbanInterface {
    name: string;
    tasks: TaskInterface[]
}

export interface TaskInterface {
    taskID: number;
    title: string;
    description: string;
    users: UserInterface[];
    isCompleted: boolean;
}