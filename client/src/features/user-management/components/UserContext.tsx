/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, UserContextType } from '../types/user';
import { securePut } from "@/features/auth/utils/secureApi";
import { toast } from 'sonner';

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from API
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the proper API endpoint for authenticated user data
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If not authenticated or API fails, use fallback data for demo
        console.warn('Failed to load authenticated user data, using fallback data');
        const fallbackUser: User = {
          id: 'user-001',
          name: 'Alex Johnson',
          email: 'alex.johnson@metaxstudios.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          plan: 'Premium',
          bio: 'Product Manager with 5+ years experience',
          company: 'MetaX Studios',
          location: 'San Francisco, CA',
          website: 'https://alexjohnson.dev',
          emailVerified: true,
          preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: false,
              marketing: false,
              security: true
            }
          },
          createdAt: '2024-01-15T10:30:00.000Z',
          lastLogin: new Date().toISOString()
        };
        setUser(fallbackUser);
        return;
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        const userData = result.data;
        setUser({
          id: userData.id,
          name: userData.name || userData.username,
          email: userData.email,
          role: userData.role || 'free_user',
          avatar: userData.avatar,
          plan: userData.plan || 'Free',
          bio: userData.bio || '',
          company: userData.company || '',
          location: userData.location || '',
          website: userData.website || '',
          emailVerified: userData.emailVerified || false,
          preferences: userData.preferences || {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: false,
              marketing: false,
              security: true
            }
          },
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || new Date().toISOString()
        });
      }
    } catch (err) {
      // If fetch fails, use fallback data
      console.warn('Error loading user data from server, using fallback data', err);
      const fallbackUser: User = {
        id: 'user-001',
        name: 'Alex Johnson',
        email: 'alex.johnson@metaxstudios.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        plan: 'Pro',
        bio: 'Product Manager with 5+ years experience',
        company: 'MetaX Studios',
        location: 'San Francisco, CA',
        website: 'https://alexjohnson.dev',
        emailVerified: true,
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: false,
            marketing: false,
            security: true
          }
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        lastLogin: new Date().toISOString()
      };
      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // Determine if we're updating profile or preferences
      const profileFields = ['name', 'bio', 'company', 'location', 'website', 'avatar'];
      const preferencesFields = ['preferences'];
      
      let hasProfileUpdates = false;
      let hasPreferenceUpdates = false;
      let profileUpdates: any = {};
      let preferenceUpdates: any = {};
      
      // Separate updates into profile and preferences
      Object.keys(updates).forEach(key => {
        if (profileFields.includes(key)) {
          hasProfileUpdates = true;
          profileUpdates[key] = (updates as any)[key];
        } else if (key === 'preferences') {
          hasPreferenceUpdates = true;
          preferenceUpdates = updates.preferences;
        }
      });
      
      // Make API calls based on what's being updated
      if (hasProfileUpdates) {
        const response = await securePut('/api/users/profile', profileUpdates);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update profile');
        }
      }
      
      if (hasPreferenceUpdates) {
        const response = await securePut('/api/users/preferences', preferenceUpdates);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update preferences');
        }
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        ...updates,
      };

      setUser(updatedUser);
      
      toast.success("Your profile has been updated successfully.");
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user profile');
      
      toast.error(error instanceof Error ? error.message : "There was a problem updating your profile.");
    }
  }, [user]);

  // Write user profile to profile.json
  const writeProfileToFile = async (userData: User) => {
    try {
      // In a real app, this would be an API call to save the profile
      // For demonstration, we'll log the profile data
      const profileData = {
        ...userData,
        exportedAt: new Date().toISOString(),
        source: 'MetaX Studios Dashboard'
      };
      
      console.log('Profile data to be written to profile.json:', profileData);
      
      // Simulate file write (in a real app, this would be a server endpoint)
      localStorage.setItem('user-profile', JSON.stringify(profileData));
    } catch (err) {
      console.error('Error writing profile to file:', err);
      throw err;
    }
  };

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // Logout user
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user-profile');
    // In a real app, you would also clear auth tokens, etc.
    console.log('User logged out');
  }, []);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const contextValue: UserContextType = {
    user,
    loading,
    error,
    updateUser,
    refreshUser,
    logout
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
