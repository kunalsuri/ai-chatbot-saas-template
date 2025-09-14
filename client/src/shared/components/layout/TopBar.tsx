/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Button } from "@/shared/components/ui/button";
import { useLocation } from "wouter";
import { useAuthContext } from "@/features/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { LogOut, Settings, User, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { MobileMenuButton } from "@/shared/components/ui/MobileMenuButton";
import { useSidebar } from "@/shared/components/layout/SidebarContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onCreatePost?: () => void;
  onShowNotifications?: () => void;
}

export function TopBar({ onCreatePost, onShowNotifications }: TopBarProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuthContext();
  const { toggleSidebar, isMobile } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  const getBreadcrumb = () => {
    const paths = {
      "/": "Overview",
      "/create-post": "Create Post",
      "/create-post-ollama": "Create Post (Ollama)",
      "/calendar": "Content Calendar",
      "/templates": "Template Library",
      "/settings": "Settings",
    };
    
    return {
      section: "Dashboard",
      page: paths[location as keyof typeof paths] || "Overview",
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="h-16 bg-background border-b border-border flex items-center justify-between px-3 sm:px-6 backdrop-blur-sm">
      {/* Mobile Menu Button + Breadcrumb */}
      <div className="flex items-center space-x-3">
        <MobileMenuButton />
        
        {/* Enhanced Breadcrumb */}
        <div className={cn(
          "flex items-center space-x-2 text-sm",
          "hidden sm:flex" // Hide on very small screens
        )} data-testid="breadcrumb">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground font-medium">{breadcrumb.section}</span>
            <i className="fas fa-chevron-right text-muted-foreground/50 text-xs"></i>
            <span className="text-foreground font-semibold">{breadcrumb.page}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Top Actions */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/25 flex items-center justify-center"
          data-testid="button-dashboard"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowNotifications}
          className="p-3 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-all duration-200 hover:scale-105 relative group"
          data-testid="button-notifications"
        >
          <i className="fas fa-bell text-lg"></i>
          <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Button>
        
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {typeof user?.username === 'string' ? user.username.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{typeof user?.username === 'string' ? user.username : "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.username ? `${user.username}@marketmagic.com` : "user@marketmagic.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
