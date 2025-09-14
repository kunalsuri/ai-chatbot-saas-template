/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react"
import { Button } from "@/shared/components/ui/button"
import { FormModal } from "@/shared/components/ui/form-modal"
import { useToast } from "@/shared/hooks/use-toast"

export function FormModalDemo() {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data)
    toast({
      title: "Form Submitted",
      description: `Thank you, ${data.name}. We'll contact you at ${data.email}.`,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setOpen(true)}>Open Form Modal</Button>
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title="Contact Us"
        description="Fill out the form below and we'll get back to you as soon as possible."
        onSubmit={handleSubmit}
        submitText="Send Message"
        cancelText="Cancel"
      />
    </div>
  )
}
