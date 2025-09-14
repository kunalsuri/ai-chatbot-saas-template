/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ComponentId } from "@/shared/types/advanced-types";
import { useGestureAnimations, useRespectMotionPreferences, advancedVariants } from "@/hooks/use-advanced-animations";

interface AdvancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  componentId: ComponentId;
  variant?: 'default' | 'interactive' | 'gesture' | 'morphing';
  hover?: boolean;
  interactive?: boolean;
  gestureEnabled?: boolean;
  morphOnHover?: boolean;
  children: React.ReactNode;
}

const AdvancedCard = React.forwardRef<HTMLDivElement, AdvancedCardProps>(
  ({ 
    className, 
    componentId,
    variant = 'default',
    hover = false, 
    interactive = false, 
    gestureEnabled = false,
    morphOnHover = false,
    children,
    ...props 
  }, ref) => {
    const { prefersReducedMotion, safeVariants } = useRespectMotionPreferences();
    const gestureProps = useGestureAnimations(componentId);

    if (prefersReducedMotion) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            hover && "hover:shadow-lg",
            interactive && "cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    const getVariants = () => {
      switch (variant) {
        case 'interactive':
          return safeVariants(advancedVariants.cardHover);
        case 'gesture':
          return safeVariants(advancedVariants.cardHover);
        case 'morphing':
          return {
            initial: { borderRadius: '8px', scale: 1 },
            hover: { 
              borderRadius: '24px', 
              scale: 1.02,
              transition: { type: 'spring', stiffness: 300, damping: 20 }
            }
          };
        default:
          return safeVariants(advancedVariants.cardHover);
      }
    };

    const cardProps = gestureEnabled ? {
      drag: true,
      dragConstraints: gestureProps.dragConstraints,
      dragElastic: gestureProps.dragElastic,
      onDragStart: gestureProps.handleDragStart,
      onDragEnd: gestureProps.handleDragEnd,
      style: {
        x: gestureProps.dragX,
        y: gestureProps.dragY,
        scale: gestureProps.scale,
        rotate: gestureProps.rotate,
        opacity: gestureProps.opacity,
      }
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
          hover && "hover:shadow-lg hover:shadow-primary/5",
          interactive && "cursor-pointer",
          gestureEnabled && "select-none",
          className
        )}
        variants={getVariants()}
        initial="initial"
        whileHover={hover || interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        {...cardProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AdvancedCard.displayName = "AdvancedCard";

// Enhanced card components with advanced animations
const AdvancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { staggerIndex?: number }
>(({ className, staggerIndex = 0, children, ...props }, ref) => {
  const { safeVariants } = useRespectMotionPreferences();
  
  return (
    <motion.div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      variants={safeVariants({
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { delay: staggerIndex * 0.05 }
        }
      })}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AdvancedCardHeader.displayName = "AdvancedCardHeader";

const AdvancedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { morphing?: boolean }
>(({ className, morphing = false, children, ...props }, ref) => {
  const { safeVariants } = useRespectMotionPreferences();

  return (
    <motion.div
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      variants={morphing ? safeVariants({
        initial: { scale: 1, letterSpacing: '0em' },
        hover: { 
          scale: 1.05, 
          letterSpacing: '0.05em',
          transition: { type: 'spring', stiffness: 400, damping: 25 }
        }
      }) : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AdvancedCardTitle.displayName = "AdvancedCardTitle";

const AdvancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    staggerChildren?: boolean;
    staggerIndex?: number;
  }
>(({ className, staggerChildren = false, staggerIndex = 0, children, ...props }, ref) => {
  const { safeVariants } = useRespectMotionPreferences();

  return (
    <motion.div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      variants={staggerChildren ? safeVariants({
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: staggerIndex * 0.05,
          }
        }
      }) : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AdvancedCardContent.displayName = "AdvancedCardContent";

// Animated list container for cards
interface AnimatedCardListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

function AnimatedCardList({ children, className, staggerDelay = 0.1 }: AnimatedCardListProps) {
  const { safeVariants } = useRespectMotionPreferences();

  return (
    <motion.div
      className={cn("space-y-4", className)}
      variants={safeVariants({
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          }
        }
      })}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={safeVariants(advancedVariants.listItem)}
          custom={index}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { 
  AdvancedCard, 
  AdvancedCardHeader, 
  AdvancedCardTitle, 
  AdvancedCardContent,
  AnimatedCardList
};
