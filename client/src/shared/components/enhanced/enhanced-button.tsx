/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/shared/components/ui/button";

// Enhanced button with advanced animations and accessibility
interface EnhancedButtonProps extends Omit<ButtonProps, 'onDrag'> {
  withAdvancedAnimations?: boolean;
  withGestures?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    withAdvancedAnimations = true, 
    withGestures = false,
    isLoading,
    loadingText,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    if (!withAdvancedAnimations) {
      return (
        <Button
          ref={ref}
          className={className}
          isLoading={isLoading}
          loadingText={loadingText}
          disabled={disabled}
          onClick={onClick}
          {...props}
        >
          {children}
        </Button>
      );
    }

    const motionProps: HTMLMotionProps<"button"> = {
      className: cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        className
      ),
      disabled: disabled || isLoading,
      whileHover: !disabled ? { y: -1, scale: 1.02 } : undefined,
      whileTap: !disabled ? { scale: 0.98 } : undefined,
      transition: { type: "spring", stiffness: 400, damping: 17 },
      onClick,
    };

    if (withGestures) {
      motionProps.drag = true;
      motionProps.dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 };
      motionProps.dragElastic = 0.1;
    }

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
