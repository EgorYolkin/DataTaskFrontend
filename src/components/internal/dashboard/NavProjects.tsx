"use client"

import {type LucideIcon,} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {useTranslation} from "react-i18next";

export interface ProjectNavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    color?: string;
    description?: string;
    taskCount?: number;
    isActive?: boolean;
    items?: { title: string; url: string }[]; // Подпроекты
}

export function NavProjects({items}: { items: ProjectNavItem[] }) {
    const [t] = useTranslation();

    // Отфильтровываем элементы, у которых есть подпроекты (items)
    // @ts-ignore
    const mainProjects = items.filter(item => item.items?.length > 0);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("Projects")}</SidebarGroupLabel>
            <SidebarMenu>
                {mainProjects.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={true}>
                        <SidebarMenuItem>
                            {item.items?.length ? (
                                <>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.description || item.title}
                                        style={{backgroundColor: item.color ? `${item.color}20` : undefined}}
                                    >
                                        <div className="flex w-full">
                                            <a href={item.url} className="flex items-center gap-1">
                                                {item.icon && <item.icon className="text-black" width="1em"/>}
                                                <span className="text-black">
                                                    {t(item.title)}
                                                    {item.taskCount ? ` (${item.taskCount})` : ""}
                                                </span>
                                            </a>
                                        </div>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild>
                                                            <a href={subItem.url}>
                                                                <span className="text-black">{t(subItem.title)}</span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    ) : null}
                                </>
                            ) : null}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}