"use client"

import {
    ChevronsUpDown,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useTranslation} from "react-i18next"
import {UserInterface} from "@/interfaces/UserInterface.tsx"


export function NavUser({user}: { user: UserInterface }) {
    const {isMobile} = useSidebar()
    const [t] = useTranslation()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex bg-gray-200 p-3 rounded-xl gap-3 items-center cursor-pointer">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                <AvatarFallback className="rounded-lg bg-blue-200">{user.name[0]}{user.surname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                    <AvatarFallback className="rounded-lg bg-blue-200">{user.name[0]}{user.surname[0]}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name} {user.surname}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => {
                            localStorage.removeItem("accessToken");
                            window.location.reload();

                        }}>
                            <LogOut/>
                            {t('Log out')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}