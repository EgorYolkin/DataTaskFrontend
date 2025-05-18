"use client"

import * as React from "react"
import { Settings2, CheckIcon, Frame, Folder } from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandList,
    CommandItem,
    CommandInput,
} from "@/components/ui/command"
import { useTranslation } from "react-i18next"
import { CommandSeparator } from "cmdk"
import { useNavigate } from "react-router-dom"
import { ProjectInterface } from "@/interfaces/ProjectInterface"

interface CommandProps {
    projects: ProjectInterface[];
}

export function Command({ projects }: CommandProps) {
    const [open, setOpen] = React.useState(false)
    const [t] = useTranslation()
    const navigate = useNavigate()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
            if (e.key === "Escape") {
                setOpen(false)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const createSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-')
    }

    const handleSelectItem = (url: string) => {
        setOpen(false)
        navigate(url)
    }

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder={t('Type a command or search') + "..."} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading={t('Suggestions')}>
                        <CommandItem onSelect={() => handleSelectItem("/dashboard")}>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            <span className="text-[black]">{t('Current tasks')}</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelectItem("/dashboard/settings")}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            <span className="text-[black]">{t('Settings')}</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {projects.map(project => {
                        const projectUUID = crypto.randomUUID()

                        return (
                            <CommandGroup key={projectUUID} heading={project.name}>
                                <CommandItem
                                    key={crypto.randomUUID()}
                                    onSelect={() =>
                                        handleSelectItem(`/project/${createSlug(project.name)}`)
                                    }
                                >
                                    <Frame className="mr-2 h-4 w-4" />
                                    <span>{project.name} main</span>
                                </CommandItem>

                                {project.topics.map(topic => (
                                    <CommandItem
                                        key={crypto.randomUUID()}
                                        onSelect={() =>
                                            handleSelectItem(`/project/${createSlug(project.name)}/${createSlug(topic.name)}`)
                                        }
                                        className="pl-8"
                                    >
                                        <Folder className="mr-2 h-4 w-4" />
                                        <span>{topic.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )
                    })}
                </CommandList>
            </CommandDialog>
        </>
    )
}