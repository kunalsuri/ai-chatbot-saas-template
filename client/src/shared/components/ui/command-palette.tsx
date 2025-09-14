/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react"
import {
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/shared/components/ui/command"
import { useCommandPalette } from "@/shared/hooks/use-command-palette"

interface CommandItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut?: string
  href?: string
  action?: string
}

interface CommandGroup {
  group: string
  items: CommandItem[]
}

const commands: CommandGroup[] = [
  {
    group: "Navigation",
    items: [
      { icon: Home, label: "Dashboard", shortcut: "D", href: "/" },
      { icon: MessageSquare, label: "Chat", shortcut: "C", href: "/chat" },
      { icon: FileText, label: "Documents", shortcut: "O", href: "/documents" },
      { icon: Calendar, label: "Calendar", shortcut: "L", href: "/calendar" },
      { icon: Users, label: "Team", shortcut: "T", href: "/team" },
      { icon: Settings, label: "Settings", shortcut: ",", href: "/settings" },
    ],
  },
  {
    group: "Actions",
    items: [
      { icon: Sparkles, label: "Generate Quote", shortcut: "G", action: "generate-quote" },
      { icon: Sparkles, label: "Create Image", shortcut: "I", action: "create-image" },
      { icon: Calendar, label: "Schedule Post", shortcut: "S", action: "schedule-post" },
    ],
  },
]

export function CommandPalette() {
  const { open, setOpen, runCommand } = useCommandPalette()

  return (
    <>
      <p className="text-sm text-muted-foreground hidden md:block">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commands.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => {
                    if (item.href) {
                      runCommand(() => {
                        window.location.href = item.href!
                      })
                    } else if (item.action) {
                      runCommand(() => {
                        // Handle action
                        console.log(`Executing action: ${item.action}`)
                      })
                    }
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
