"use client"

import * as React from "react"
import {Check, ChevronsUpDown, Paintbrush} from "lucide-react"
import {cn} from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useTranslation} from "react-i18next"
import {ProjectInterface} from "@/interfaces/ProjectInterface.tsx"

// Define the shape of each item in the combobox
interface ComboboxItem {
    value: string // Unique identifier (e.g., "project:datastrip" or "topic:backend:datastrip")
    label: string // Display text (e.g., "datastrip" or "backend (datastrip)")
}

interface CreateTaskFormComboboxProps {
    projects: ProjectInterface[]
    onColorChange?: (color: string) => void // Optional callback for color changes
}

export const CreateTaskFormCombobox = ({projects, onColorChange}: CreateTaskFormComboboxProps) => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("") // Project/topic selection
    const [colorOpen, setColorOpen] = React.useState(false) // Color picker popover
    const [color, setColor] = React.useState("gray") // Default color
    const [t] = useTranslation()

    // Generate combobox items from projects and their topics
    const items: ComboboxItem[] = projects.flatMap((project) => [
        {
            value: `project:${project.name}`,
            label: project.name,
        },
        ...project.topics.map((topic) => ({
            value: `topic:${topic.name}:${project.name}`,
            label: `${topic.name} (${project.name})`,
        })),
    ])

    // Handle color selection
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value
        setColor(newColor)
        onColorChange?.(newColor) // Call callback if provided
    }

    return (
        <div className="flex items-center gap-2">
            {/* Project/Topic Combobox */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
          <span
              role="combobox"
              aria-expanded={open}
              className="h-[100%] text-sm pl-3 pr-3 justify-between flex border-1 p-1 items-center rounded-[7px] cursor-pointer"
          >
            {value
                ? items.find((item) => item.value === value)?.label || t("Project")
                : t("Project")}
              <ChevronsUpDown size="1em" className="opacity-50"/>
          </span>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder={t("Search project or topic...")} className="h-9"/>
                        <CommandList>
                            <CommandEmpty>{t("No project or topic found.")}</CommandEmpty>
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Color Picker */}
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
                <PopoverTrigger asChild>
                    <div
                        className="flex items-center gap-1 p-1 w-f border-1 rounded-[7px] cursor-pointer"
                        style={{backgroundColor: color}}
                        title={t("Select task color")}
                    >
                        <Paintbrush size="1em" className="text-black"/>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[100px] p-2">
                    <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                        className="w-full h-8 border-none p-0 cursor-pointer"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}