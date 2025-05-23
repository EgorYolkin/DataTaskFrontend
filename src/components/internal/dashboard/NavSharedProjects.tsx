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
import {Link} from "react-router-dom";

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

export function NavSharedProjects({items}: { items: ProjectNavItem[] }) {
    const [t] = useTranslation();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("Shared projects")}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={true}>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.description || item.title}
                                style={{backgroundColor: item.color ? `${item.color}20` : undefined}}
                            >
                                <div className="flex w-full">
                                    <Link to={item.url} className="flex items-center gap-1">
                                        {item.icon && <item.icon className="text-black" width="1em"/>}
                                        <span className="text-black">
                                                    {t(item.title)}
                                            {item.taskCount ? ` (${item.taskCount})` : ""}
                                                </span>
                                    </Link>
                                </div>
                            </SidebarMenuButton>
                            {item.items?.length ? (
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link to={subItem.url}>
                                                        <span className="text-black">{t(subItem.title)}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            ) : null}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}