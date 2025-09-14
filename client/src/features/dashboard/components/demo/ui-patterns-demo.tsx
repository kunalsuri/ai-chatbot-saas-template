/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react"
import { CommandPalette } from "@/shared/components/ui/command-palette"
import { DataTableDemo } from "./data-table-demo"
import { ToastDemo } from "./toast-demo"
import { FormModalDemo } from "./form-modal-demo"
import { EmptyStateDemo } from "./empty-state-demo"
import { ProgressiveDisclosureDemo } from "./progressive-disclosure-demo"
import { SkeletonDemo } from "./skeleton-demo"
import { Toaster } from "@/shared/components/ui/toaster"

export default function UIPatternsDemo() {
  return (
    <div className="container mx-auto py-10 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">UI Patterns Demo</h1>
        <p className="text-muted-foreground mb-6">
          This page demonstrates all the UI patterns implemented in the SaaS ChatBot AI dashboard.
        </p>
        
        <div className="mb-4">
          <CommandPalette />
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Data Tables</h2>
        <DataTableDemo />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
        <ToastDemo />
        <Toaster />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Modal/Drawer Forms</h2>
        <FormModalDemo />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Empty States</h2>
        <EmptyStateDemo />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Progressive Disclosure</h2>
        <ProgressiveDisclosureDemo />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Skeleton Loading</h2>
        <SkeletonDemo />
      </section>
    </div>
  )
}
