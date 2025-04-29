"use client"

import * as React from "react"
import {Settings2, CheckIcon, Frame, Folder} from "lucide-react" // Ensure Folder is imported
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandList,
    CommandItem,
    CommandInput,
} from "@/components/ui/command"
import {useTranslation} from "react-i18next";
import {CommandSeparator} from "cmdk";
import {useNavigate} from "react-router-dom"; // CHANGE: Import useNavigate instead of Link
// NO LONGER NEED: import { Link } from "react-router-dom";
import {ProjectInterface} from "@/interfaces/ProjectInterface";

// Define props interface
interface CommandProps {
    projects: ProjectInterface[];
}

// Update the component to accept projects prop
export function Command({projects}: CommandProps) {
    const [open, setOpen] = React.useState(false)
    const [t] = useTranslation();
    const navigate = useNavigate(); // Get the navigate function from react-router-dom

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) { // Cmd+J or Ctrl+J
                e.preventDefault()
                setOpen((open) => !open)
            }
            // Optional: Add Escape key to close if not already handled by CommandDialog
            if (e.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Helper function to create a URL slug from the project/topic name
    const createSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-'); // Replace spaces with hyphens
    }

    // Function to handle item selection (called by cmdk on Enter/Click)
    const handleSelectItem = (url: string) => {
        setOpen(false); // Close the dialog
        navigate(url); // Navigate to the URL using react-router-dom's navigate
    }


    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder={t('Type a command or search') + "..."}/>
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading={t('Suggestions')}>
                        {/* Use onSelect for navigation */}
                        <CommandItem onSelect={() => handleSelectItem("/dashboard")}>
                            <CheckIcon className="mr-2 h-4 w-4"/>
                            <span className="text-[black]">{t('Current tasks')}</span>
                        </CommandItem>
                        {/* Use onSelect for navigation */}
                        <CommandItem onSelect={() => handleSelectItem("/dashboard/settings")}>
                            <Settings2 className="mr-2 h-4 w-4"/>
                            <span className="text-[black]">{t('Settings')}</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator/>

                    {/* Loop through projects to create groups and items */}
                    {projects.map(project => (
                        <CommandGroup key={project.name} heading={project.name}>

                            {/* CommandItem for the project itself */}
                            {/* Use onSelect for navigation */}
                            <CommandItem
                                key={`project-${project.name}`} // Unique key on CommandItem
                                onSelect={() => handleSelectItem(`/project/${createSlug(project.name)}`)} // Navigate using onSelect
                            >
                                <Frame className="mr-2 h-4 w-4"/> {/* Frame icon for the project */}
                                <span>main</span> {/* Display "main" for the project item */}
                            </CommandItem>


                            {project.topics.map(topic => (
                                // CommandItem for each topic
                                <CommandItem
                                    key={`topic-${project.name}-${topic.name}`} // Unique key on CommandItem
                                    onSelect={() => handleSelectItem(`/project/${createSlug(project.name)}/topic/${createSlug(topic.name)}`)} // Navigate using onSelect
                                    className="pl-8" // Add left padding for visual hierarchy
                                >
                                    <Folder className="mr-2 h-4 w-4"/> {/* Folder icon for topics */}
                                    <span>{topic.name}</span> {/* Display topic name */}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}

                </CommandList>
            </CommandDialog>
        </>
    )
}