/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useMemo, memo, useCallback, ComponentType } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/shared/components/layout/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavigationGroupProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: NavigationItem[];
  defaultExpanded?: boolean;
  isCollapsed?: boolean;
}

const NavigationGroup = memo(function NavigationGroup({ title, icon, items, defaultExpanded = false, isCollapsed = false }: NavigationGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [location] = useLocation();

  // Memoize expensive computations
  const hasActiveChild = useMemo(() => 
    items.some(item => 
      location === item.href || (item.href !== "/" && location.startsWith(item.href))
    ), [items, location]
  );

  // Auto-expand if has active child
  const shouldExpand = isExpanded || hasActiveChild;

  // Memoize click handler to prevent unnecessary re-renders
  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const { isMobile, closeSidebar } = useSidebar();

  // Don't render group header when collapsed on desktop
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && closeSidebar()}
              className={cn(
                "group flex items-center justify-center px-2 py-3 rounded-lg font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon && React.createElement(item.icon, { 
                className: "w-5 h-5 flex-shrink-0" 
              })}
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Parent Group Header */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 group",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          hasActiveChild
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
        aria-expanded={shouldExpand}
        aria-controls={`nav-group-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {icon && React.createElement(icon, { className: "w-5 h-5 transition-colors mr-3" })}
        <span className="text-sm font-semibold flex-1 text-left">{title}</span>
        <div className="transition-transform duration-200 ml-2">
          {shouldExpand ? (
            <ChevronDown className="w-4 h-4 text-xs" />
          ) : (
            <ChevronRight className="w-4 h-4 text-xs" />
          )}
        </div>
      </button>

      {/* Child Items */}
      <AnimatePresence initial={false}>
        {shouldExpand && (
          <motion.div 
            className="overflow-hidden"
            id={`nav-group-${title.toLowerCase().replace(/\s+/g, '-')}`}
            role="group"
            aria-labelledby={`nav-group-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
        <div className="ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-sidebar-border space-y-1">
          {items.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const testId = `nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && closeSidebar()}
                className={cn(
                  "flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm border border-sidebar-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                data-testid={testId}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon && React.createElement(item.icon, { className: `w-4 h-4 text-xs flex-shrink-0 ${isActive ? 'text-sidebar-primary' : ''}` })}
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-sidebar-primary rounded-full flex-shrink-0"></div>
                )}
              </Link>
            );
          })}
        </div>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export { NavigationGroup };
