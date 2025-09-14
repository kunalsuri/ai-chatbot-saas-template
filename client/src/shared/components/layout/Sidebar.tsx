/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Link, useLocation } from "wouter";
import { NavigationGroup } from "./NavigationGroup";
import React, { useMemo, memo, useEffect } from "react";
import { LayoutDashboard, Settings, MessageSquare, Languages, Sparkles, Cpu, Bot, Wand2, X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { UserProfileFooter } from "@/shared/components/ui/UserProfileFooter";
import { useSidebar } from "@/shared/components/layout/SidebarContext";
import { useAuthContext } from "@/features/auth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { canManageUsers, validateRole } from "@/features/auth";

interface SidebarProps {
  user?: {
    name: string;
    initials: string;
    plan: string;
  };
}

const Sidebar = memo(function Sidebar({ user = { name: "John Doe", initials: "JD", plan: "Pro Plan" } }: SidebarProps) {
  const [location] = useLocation();
  const { isOpen, isMobile, closeSidebar, toggleSidebar } = useSidebar();
  const { user: currentUser } = useAuthContext();

  // Get validated user role
  const userRole = validateRole(currentUser?.role);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, closeSidebar]);

  // Memoize navigation arrays to prevent recreation on every render
  const dashboardItem = useMemo(() => [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
  ], []);

  const settingsItem = useMemo(() => {
    const baseItems = [
      { href: "/settings", label: "Profile Settings", icon: Settings },
    ];

    // Add User Management for admin users only
    if (canManageUsers(userRole)) {
      baseItems.push({ href: "/settings/user-management", label: "User Management (Admin)", icon: Users });
    }

    return baseItems;
  }, [userRole]);

  const aiLocalItems = useMemo(() => [
    { href: "/ai-chatbot-local", label: "AI ChatBot", icon: MessageSquare },
    { href: "/summary-local", label: "Summary", icon: Sparkles },
    { href: "/translate-local", label: "Translate", icon: Languages },
    { href: "/prompt-improver-local", label: "Prompt Improver", icon: Sparkles }
  ], []);

  const aiExternalItems = useMemo(() => [
    { href: "/ai-chatbot-external", label: "AI ChatBot", icon: MessageSquare },
  ], []);

  const localLLMsItems = useMemo(() => [
    { href: "/local-model-mgmt", label: "Local Model Management", icon: Cpu },
    { href: "/external-model-mgmt", label: "External Model Management", icon: Bot },
  ], []);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        id="sidebar-nav"
        className={cn(
          "h-screen bg-sidebar border-r border-sidebar-border z-50",
          "flex flex-col prevent-overflow",
          // Mobile behavior - fixed overlay
          isMobile ? "fixed left-0 top-0" : "relative"
        )}
        role="complementary"
        aria-label="Main navigation sidebar"
        initial={false}
        animate={{
          width: isMobile ? 320 : (isOpen ? 320 : 64),
          x: isMobile ? (isOpen ? 0 : -320) : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Sticky Top Section - Logo & Brand */}
        <div className="sticky top-0 z-10 bg-sidebar-background border-b border-sidebar-border">
          <div className={cn(
            "flex items-center group cursor-pointer transition-all duration-300",
            isOpen ? "p-6 space-x-3" : "p-3 justify-center"
          )}>
            {/* Desktop Collapse/Expand Button */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 flex-shrink-0",
                  isOpen ? "ml-auto" : "mx-auto"
                )}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Wand2 className="w-5 h-5 text-white relative z-10" />
              </div>
              <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {(isOpen || !isMobile) && (
              <div className={cn(
                "flex flex-col transition-all duration-300",
                !isOpen && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>
                <h1 className="text-lg font-bold text-sidebar-foreground leading-tight whitespace-nowrap">AI ChatBot SaaS</h1>
                <span className="text-xs text-sidebar-foreground/60 font-medium tracking-wide whitespace-nowrap">AI-Powered Platform</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Middle Section - Navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent",
            "px-3 py-4 space-y-6",
            isMobile && "hide-scrollbar"
          )}
          role="navigation"
          aria-label="Main navigation menu"
        >
          <NavigationGroup
            title="Dashboard"
            icon={LayoutDashboard}
            items={dashboardItem}
            isCollapsed={!isOpen}
          />
          <NavigationGroup
            title="AI Tools (Local)"
            icon={Bot}
            items={aiLocalItems}
            isCollapsed={!isOpen}
          />
          <NavigationGroup
            title="AI Tools (External API)"
            icon={Bot}
            items={aiExternalItems}
            isCollapsed={!isOpen}
          />
          <NavigationGroup
            title="Model Management"
            icon={Cpu}
            items={localLLMsItems}
            isCollapsed={!isOpen}
          />
          <NavigationGroup
            title="Settings"
            icon={Settings}
            items={settingsItem}
            isCollapsed={!isOpen}
          />
        </nav>

        {/* Sticky Bottom Section - User Profile */}
        <div className="sticky bottom-0 z-10 bg-sidebar border-t border-sidebar-border">
          <UserProfileFooter isCollapsed={!isOpen} />
        </div>
      </motion.aside>
    </>
  );
});

export { Sidebar };
