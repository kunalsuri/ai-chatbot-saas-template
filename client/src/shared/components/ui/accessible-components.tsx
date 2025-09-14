/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ComponentId } from "@/shared/types/advanced-types";
import { useAdvancedA11y, useFocusManagement, useARIAAttributes } from "@/hooks/use-advanced-accessibility";

// Enhanced accessible button
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  componentId: ComponentId;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    componentId, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    loadingText = 'Loading...', 
    children, 
    className, 
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const { context, announce } = useAdvancedA11y(componentId);
    const { ariaAttributes, setPressed } = useARIAAttributes(componentId);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return;
      
      // Announce action for screen readers
      if (context.screenReaderActive) {
        announce(`Button ${children} activated`, 'polite', 'navigation');
      }
      
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        setPressed(true);
        setTimeout(() => setPressed(false), 100);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // High contrast support
          context.highContrast && "border-2 border-current",
          // Size variants
          size === 'sm' && "h-9 px-3 text-sm",
          size === 'md' && "h-10 px-4 py-2",
          size === 'lg' && "h-11 px-8 text-lg",
          // Color variants
          variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        whileHover={!context.reducedMotion ? { scale: 1.02 } : undefined}
        whileTap={!context.reducedMotion ? { scale: 0.98 } : undefined}
        {...ariaAttributes}
        aria-busy={isLoading}
        aria-describedby={isLoading ? `${componentId}-loading` : undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <motion.div
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              animate={!context.reducedMotion ? { rotate: 360 } : undefined}
              transition={!context.reducedMotion ? { duration: 1, repeat: Infinity, ease: "linear" } : undefined}
              aria-hidden="true"
            />
            <span id={`${componentId}-loading`} className="sr-only">
              {loadingText}
            </span>
            {loadingText}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

// Enhanced accessible modal
interface AccessibleModalProps {
  componentId: ComponentId;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function AccessibleModal({ 
  componentId, 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  className 
}: AccessibleModalProps) {
  const { context, announce } = useAdvancedA11y(componentId);
  const { containerRef, savePreviousFocus, restorePreviousFocus, focusFirstElement } = useFocusManagement({
    trapFocus: true,
    restoreFocus: true,
  });

  // Announce modal state changes
  React.useEffect(() => {
    if (isOpen) {
      savePreviousFocus();
      announce(`Modal ${title} opened`, 'assertive', 'navigation');
      setTimeout(focusFirstElement, 100);
    } else {
      restorePreviousFocus();
      announce(`Modal ${title} closed`, 'polite', 'navigation');
    }
  }, [isOpen, title, announce, savePreviousFocus, restorePreviousFocus, focusFirstElement]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              className={cn(
                "bg-background border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto",
                context.highContrast && "border-2",
                className
              )}
              initial={!context.reducedMotion ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
              animate={!context.reducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
              exit={!context.reducedMotion ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 0 }}
              transition={{ duration: context.reducedMotion ? 0 : 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${componentId}-title`}
              aria-describedby={description ? `${componentId}-description` : undefined}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    id={`${componentId}-title`}
                    className="text-lg font-semibold"
                  >
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close modal"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                
                {description && (
                  <p 
                    id={`${componentId}-description`}
                    className="text-sm text-muted-foreground mb-4"
                  >
                    {description}
                  </p>
                )}
                
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced accessible form field
interface AccessibleFormFieldProps {
  componentId: ComponentId;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

function AccessibleFormField({ 
  componentId, 
  label, 
  error, 
  hint, 
  required = false, 
  children, 
  className 
}: AccessibleFormFieldProps) {
  const { context } = useAdvancedA11y(componentId);
  const { ariaAttributes, setInvalid } = useARIAAttributes(componentId);

  React.useEffect(() => {
    setInvalid(!!error, error);
  }, [error, setInvalid]);

  const childWithProps = React.cloneElement(children, {
    id: `${componentId}-input`,
    'aria-labelledby': `${componentId}-label`,
    'aria-describedby': [
      hint && `${componentId}-hint`,
      error && `${componentId}-error`
    ].filter(Boolean).join(' ') || undefined,
    'aria-required': required,
    ...ariaAttributes,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        id={`${componentId}-label`}
        htmlFor={`${componentId}-input`}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          context.highContrast && "font-bold"
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {hint && (
        <p 
          id={`${componentId}-hint`}
          className="text-xs text-muted-foreground"
        >
          {hint}
        </p>
      )}
      
      {childWithProps}
      
      {error && (
        <p 
          id={`${componentId}-error`}
          className="text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Live region for announcements
interface LiveRegionProps {
  announcements: Array<{ message: string; priority: 'polite' | 'assertive' }>;
}

function LiveRegion({ announcements }: LiveRegionProps) {
  return (
    <>
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map((announcement, index) => (
            <div key={index}>{announcement.message}</div>
          ))
        }
      </div>
      
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="alert"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map((announcement, index) => (
            <div key={index}>{announcement.message}</div>
          ))
        }
      </div>
    </>
  );
}

export { 
  AccessibleButton, 
  AccessibleModal, 
  AccessibleFormField, 
  LiveRegion 
};
