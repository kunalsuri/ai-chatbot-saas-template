/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useLocation } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [, navigate] = useLocation();

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleShowNotifications = () => {
    // TODO: Implement notification panel
    console.log("Show notifications panel");
  };


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip Links for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#sidebar-nav"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to navigation
      </a>
      
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          onCreatePost={handleCreatePost} 
          onShowNotifications={handleShowNotifications}
        />
        <main 
          id="main-content"
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            // Responsive padding
            "p-3 sm:p-4 md:p-6"
          )}
          role="main"
          aria-label="Main content area"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
