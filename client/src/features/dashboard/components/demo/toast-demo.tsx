/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Button } from "@/shared/components/ui/button"
import { useToast } from "@/shared/hooks/use-toast"
import { ToastAction } from "@/shared/components/ui/toast"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Scheduled: Catch up",
              description: "Friday, February 10, 2023 at 5:57 PM",
            })
          }}
        >
          Show Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Uh oh! Something went wrong.",
              description: "There was a problem with your request.",
              variant: "destructive",
            })
          }}
        >
          Show Destructive Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Event has been created",
              description: "Monday, January 3rd at 6:00pm",
              action: (
                <ToastAction
                  altText="Goto schedule to undo"
                  onClick={() => console.log("Undo action clicked")}
                >
                  Undo
                </ToastAction>
              ),
            })
          }}
        >
          Show Toast with Action
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Login Successful",
              description: "Welcome back to your dashboard.",
            })
          }}
        >
          Show Success Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Update Available",
              description: "A new version is available for download.",
              action: (
                <ToastAction
                  altText="Update now"
                  onClick={() => console.log("Update action clicked")}
                >
                  Update
                </ToastAction>
              ),
            })
          }}
        >
          Show Update Toast
        </Button>
      </div>
    </div>
  )
}
