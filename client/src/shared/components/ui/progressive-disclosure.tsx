/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ProgressiveDisclosureProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function ProgressiveDisclosure({
  title,
  defaultOpen = false,
  children,
  className,
  ...props
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("rounded-lg border", className)} {...props}>
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  )
}
