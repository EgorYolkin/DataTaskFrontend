"use client"

import * as React from "react"
import {
    Settings2,
    CheckIcon,
    Frame
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {useTranslation} from "react-i18next";
import {CommandSeparator} from "cmdk";
import {Link} from "react-router-dom";

export function Command() {
    const [open, setOpen] = React.useState(false)

    const [t] = useTranslation();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..."/>
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading={t('Suggestions')}>
                        <Link to={"/dashboard"} onClick={() => {setOpen(false)}}>
                            <CommandItem>
                                <CheckIcon/>
                                <span className="text-[black]">{t('Current tasks')}</span>
                            </CommandItem>
                        </Link>
                        <Link to={"/dashboard/settings"} onClick={() => {setOpen(false)}} >
                            <CommandItem>
                                <Settings2/>
                                <span className="text-[black]">{t('Settings')}</span>
                            </CommandItem>
                        </Link>
                    </CommandGroup>
                    <CommandSeparator/>
                    <CommandGroup heading={t('Projects')}>
                        <CommandItem>
                            <Frame/>
                            <span>{t('Datastrip')}</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
