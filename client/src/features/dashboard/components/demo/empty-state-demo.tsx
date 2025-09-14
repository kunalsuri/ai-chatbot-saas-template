/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react"
import { EmptyState } from "@/shared/components/ui/empty-state"
import { Button } from "@/shared/components/ui/button"
import { 
  FileText, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Search 
} from "lucide-react"

export function EmptyStateDemo() {
  const [activeDemo, setActiveDemo] = React.useState(0)
  
  const demos = [
    {
      title: "No documents found",
      description: "Get started by creating a new document.",
      icon: FileText,
      action: {
        label: "Create Document",
        onClick: () => console.log("Create document")
      }
    },
    {
      title: "No team members",
      description: "Invite team members to collaborate on your projects.",
      icon: Users,
      action: {
        label: "Invite Members",
        onClick: () => console.log("Invite members")
      }
    },
    {
      title: "No events scheduled",
      description: "Schedule events to keep your team organized.",
      icon: Calendar,
      action: {
        label: "Create Event",
        onClick: () => console.log("Create event")
      }
    },
    {
      title: "No images found",
      description: "Upload images to share with your team.",
      icon: ImageIcon
    },
    {
      title: "No results found",
      description: "Try adjusting your search to find what you're looking for.",
      icon: Search
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        {demos.map((_, index) => (
          <Button 
            key={index} 
            variant={activeDemo === index ? "default" : "outline"}
            onClick={() => setActiveDemo(index)}
          >
            Demo {index + 1}
          </Button>
        ))}
      </div>
      <EmptyState
        title={demos[activeDemo].title}
        description={demos[activeDemo].description}
        icon={demos[activeDemo].icon}
        action={demos[activeDemo].action}
        className="w-full max-w-md mx-auto"
      />
    </div>
  )
}
