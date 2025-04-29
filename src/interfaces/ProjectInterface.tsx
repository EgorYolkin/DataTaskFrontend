import {KanbanInterface} from "@/interfaces/TasksInterfase.tsx";

export interface ProjectTopicInterface {
    name: string;
    color: string;
    description: string;
    kanbans: KanbanInterface[];
}

export interface ProjectAllowedUserInterface {
    id: number;
    avatarUrl: string;
    name: string;
    surname: string;
    email: string;
}

export interface ProjectInterface {
    name: string;
    color: string;
    description: string;
    allowedUsers: ProjectAllowedUserInterface[];
    topics: ProjectTopicInterface[];
}

