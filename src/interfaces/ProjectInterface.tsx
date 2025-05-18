import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx";

export interface ProjectAllowedUserInterface {
    id: number;
    avatarUrl: string;
    name: string;
    surname: string;
    email: string;
}

export interface ProjectInterface {
    id: number;
    name: string;
    color: string;
    description: string;
    allowedUsers: ProjectAllowedUserInterface[];
    kanbans: KanbanInterface[];
    topics: ProjectInterface[];
}

