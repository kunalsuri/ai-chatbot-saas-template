/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/shared/components/layout/SidebarContext';
import { cn } from '@/lib/utils';

interface MobileMenuButtonProps {
  className?: string;
}

export function MobileMenuButton({ className }: MobileMenuButtonProps) {
  const { isOpen, isMobile, toggleSidebar } = useSidebar();

  if (!isMobile) return null;

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "p-2 rounded-lg text-foreground hover:bg-accent/50 transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "md:hidden", // Only show on mobile
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <Menu className="w-6 h-6" />
      )}
    </button>
  );
}
