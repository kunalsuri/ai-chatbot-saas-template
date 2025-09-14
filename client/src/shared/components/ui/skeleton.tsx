/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "relative overflow-hidden rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "",
        text: "h-4 w-full",
        title: "h-6 w-3/4 mb-2",
        heading: "h-8 w-1/2 mb-4",
        avatar: "rounded-full h-10 w-10",
        button: "h-9 w-24 rounded-md",
        input: "h-9 w-full rounded-md",
        card: "h-32 w-full rounded-lg",
        list: "h-16 w-full rounded-lg",
        image: "aspect-video w-full rounded-lg"
      },
      effect: {
        none: "",
        pulse: "animate-pulse",
        shimmer: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent"
      }
    },
    defaultVariants: {
      variant: "default",
      effect: "shimmer"
    }
  }
)

export interface SkeletonProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  isLoading?: boolean
  children?: React.ReactNode
  count?: number
  containerClassName?: string
}

function Skeleton({
  className,
  variant,
  effect,
  isLoading = true,
  children,
  count = 1,
  containerClassName,
  ...props
}: SkeletonProps) {
  if (!isLoading && children) {
    return <>{children}</>
  }

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(skeletonVariants({ variant, effect, className }))}
      data-skeleton={isLoading ? "" : undefined}
      aria-busy={isLoading}
      aria-live="polite"
      {...props}
    />
  ))

  return count > 1 ? (
    <div className={cn("space-y-2", containerClassName)}>{skeletons}</div>
  ) : (
    skeletons[0]
  )
}

export { Skeleton, skeletonVariants }
