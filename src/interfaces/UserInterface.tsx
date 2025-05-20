export interface UserInterface {
    id: number;
    name: string;
    surname: string;
    email: string;
    avatarUrl: string;
}

export const DefaultUser: UserInterface = {
    id: 0,
    email: "",
    name: "",
    surname: "",
    avatarUrl: "",
};
