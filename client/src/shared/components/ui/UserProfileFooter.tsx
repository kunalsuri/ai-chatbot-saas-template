/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState } from 'react';
import { 
  User, 
  Crown, 
  Settings, 
  Palette, 
  HelpCircle, 
  LogOut, 
  ChevronUp,
  ChevronDown 
} from 'lucide-react';
import { useAuthContext } from '@/features/auth';
import { cn } from '@/lib/utils';

// CSS Module styles for responsive design
const styles = {
  container: 'bg-sidebar-background border-t border-sidebar-border',
  expandedMenu: 'px-4 py-3 space-y-1 border-b border-sidebar-border',
  menuButton: 'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors duration-200',
  logoutButton: 'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200',
  profileSection: 'px-4 py-4',
  avatar: 'w-10 h-10 rounded-full object-cover border-2 border-sidebar-border',
  avatarFallback: 'w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm',
  planBadge: 'absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center',
  upgradeButton: 'px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105',
  expandButton: 'p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200'
};

interface UserProfileFooterProps {
  className?: string;
  isCollapsed?: boolean;
}

export function UserProfileFooter({ className, isCollapsed = false }: UserProfileFooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get user from auth context
  const { user, logout } = useAuthContext();

  if (!user) {
    return null;
  }

  // Type assertion to access additional properties from /api/auth/me
  const userWithProfile = user as typeof user & { name?: string; avatar?: string };

  const handleUpgrade = () => {
    console.log('Navigate to upgrade plan');
    // In a real app, navigate to upgrade page
  };

  const handleCustomize = () => {
    console.log('Navigate to customize');
    // In a real app, navigate to customization page
  };

  const handleSettings = () => {
    console.log('Navigate to settings');
    // In a real app, navigate to settings page
  };

  const handleHelp = () => {
    console.log('Navigate to help');
    // In a real app, navigate to help page
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
        // Redirect to landing page after logout
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const showUpgradeButton = (userWithProfile as any).plan === 'free';

  // Collapsed state - show only avatar
  if (isCollapsed) {
    return (
      <div className={cn(styles.container, "px-2 py-3", className)}>
        <div className="flex justify-center">
          <div className="relative flex-shrink-0 group">
            {userWithProfile.avatar ? (
              <img
                src={userWithProfile.avatar}
                alt={(userWithProfile.name || userWithProfile.username) as string}
                className="w-8 h-8 rounded-full object-cover border-2 border-sidebar-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn(
              "w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs",
              userWithProfile.avatar ? "hidden" : ""
            )}>
              {((userWithProfile.name || userWithProfile.username) as string).charAt(0).toUpperCase()}
            </div>
            
            {/* Plan Badge */}
            {(userWithProfile as any).plan !== 'free' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {userWithProfile.name || userWithProfile.username} - {(userWithProfile as any).plan || 'free'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.container, className)}>
      {/* Expandable Menu */}
      {isExpanded && (
        <div className={styles.expandedMenu}>
          {showUpgradeButton && (
            <button
              onClick={handleUpgrade}
              className={styles.menuButton}
            >
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>Upgrade Plan</span>
            </button>
          )}
          
          <button
            onClick={handleCustomize}
            className={styles.menuButton}
          >
            <Palette className="w-4 h-4" />
            <span>Customize</span>
          </button>

          <button
            onClick={handleSettings}
            className={styles.menuButton}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleHelp}
            className={styles.menuButton}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>

          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* User Profile Section */}
      <div className={styles.profileSection}>
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="relative flex-shrink-0">
            {userWithProfile.avatar ? (
              <img
                src={userWithProfile.avatar}
                alt={(userWithProfile.name || userWithProfile.username) as string}
                className={styles.avatar}
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn(
              styles.avatarFallback,
              userWithProfile.avatar ? "hidden" : ""
            )}>
              {((userWithProfile.name || userWithProfile.username) as string).charAt(0).toUpperCase()}
            </div>
            
            {/* Plan Badge */}
            {(userWithProfile as any).plan !== 'free' && (
              <div className={styles.planBadge}>
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {((userWithProfile.name || userWithProfile.username) as string).charAt(0).toUpperCase()}
              </div>
              {showUpgradeButton && (
                <button
                  onClick={handleUpgrade}
                  className={styles.upgradeButton}
                >
                  Upgrade
                </button>
              )}
            </div>
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {userWithProfile.name || userWithProfile.username}
            </div>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {(userWithProfile as any).email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-sidebar-foreground/60">
                {(userWithProfile as any).role || 'user'}
              </span>
              <span className="text-xs text-sidebar-foreground/40">•</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                (userWithProfile as any).plan === 'free' 
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  : (userWithProfile as any).plan === 'pro'
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              )}>
                {(userWithProfile as any).plan || 'free'}
              </span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.expandButton}
            aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
