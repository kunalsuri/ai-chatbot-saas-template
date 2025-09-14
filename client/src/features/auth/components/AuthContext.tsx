/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { secureGet, securePost, AuthenticationError, ServerRestartError } from "@/features/auth/utils/secureApi";
import { initializeAuth, handleAuthError } from "@/features/auth/utils/authFix";
import { useToast } from "@/shared/hooks/use-toast";
import { getCsrfToken, clearCsrfToken } from "@/features/auth/utils/csrf";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session with enhanced error handling
  const checkAuth = async () => {
    try {
      // First check session status
      try {
        await fetch('/api/auth/session-status', {
          credentials: 'include'
        });
      } catch (sessionError) {
        console.warn('Session status check failed:', sessionError);
      }
      
      // Then try to get current user
      const response = await secureGet("/api/auth/me", false); // Don't retry auth check
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Session expired or invalid - clear user state
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      
      if (error instanceof AuthenticationError) {
        // Session expired - show user-friendly message
        setUser(null);
        toast({
          title: "Session Expired",
          description: "Please log in to continue.",
          variant: "default",
        });
      } else if (error instanceof ServerRestartError) {
        // Server restarted - clear session and show message
        clearCsrfToken();
        setUser(null);
        toast({
          title: "Server Restarted",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        // Network or other error
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on app start and set up auth event listeners
  useEffect(() => {
    const setupAuth = async () => {
      setIsLoading(true);
      
      try {
        // First initialize the session
        try {
          await fetch('/api/auth/session-init', {
            credentials: 'include'
          });
        } catch (initError) {
          console.warn('Session initialization failed:', initError);
        }
        
        // Then initialize auth system
        await initializeAuth();
        
        // Finally check authentication
        await checkAuth();
      } catch (error) {
        console.error('Auth setup failed:', error);
        setIsLoading(false);
      }
    };
    
    setupAuth();
    
    // Listen for auth events from secure API
    const handleAuthRequired = () => {
      setUser(null);
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "default",
      });
    };
    
    const handleServerRestart = () => {
      clearCsrfToken();
      setUser(null);
      toast({
        title: "Server Restarted",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      
      // Try to re-initialize session after server restart
      fetch('/api/auth/session-init', {
        credentials: 'include'
      }).catch(e => console.warn('Failed to reinitialize session after restart:', e));
    };
    
    window.addEventListener('auth:required', handleAuthRequired);
    window.addEventListener('auth:server-restart', handleServerRestart);
    
    return () => {
      window.removeEventListener('auth:required', handleAuthRequired);
      window.removeEventListener('auth:server-restart', handleServerRestart);
    };
  }, [toast]);

  // Set up periodic auth checks to detect server restarts
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const response = await secureGet("/api/auth/me", false);
        if (!response.success) {
          // Session lost - likely server restart
          setUser(null);
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        }
      } catch (error) {
        if (error instanceof ServerRestartError) {
          setUser(null);
          toast({
            title: "Server Restarted",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
        } else if (error instanceof AuthenticationError) {
          setUser(null);
        }
        // Don't show toast for network errors during periodic checks
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, toast]);

  const login = async (username: string, password: string) => {
    try {
      // Clear any existing CSRF token
      clearCsrfToken();
      
      // Initialize session first
      try {
        await fetch('/api/auth/session-init', {
          credentials: 'include'
        });
      } catch (initError) {
        console.warn('Session initialization failed:', initError);
      }
      
      // Get fresh CSRF token
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const { data: userData } = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      // Clear any existing CSRF token
      clearCsrfToken();
      
      // Initialize session first
      try {
        await fetch('/api/auth/session-init', {
          credentials: 'include'
        });
      } catch (initError) {
        console.warn('Session initialization failed:', initError);
      }
      
      // Get fresh CSRF token
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const { data: userData } = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Get CSRF token
      const csrfToken = await getCsrfToken();
      
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear CSRF token after logout
      clearCsrfToken();
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}