/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Modern User Management Hook - State-of-the-Art React/TypeScript 2025
 * Reactive, type-safe user data management with optimistic updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CompleteUser,
  CreateUser,
  UpdateUserProfile,
  UserQuery,
  UserListResponse,
} from '../types/user-management';
import { UserActivity } from '../types/user-activity';
import { UserPreferences, UpdateUserPreferences, PublicUser, SessionUser } from '../types/user-management';
import { secureGet, securePost, securePut } from "@/features/auth/utils/secureApi";

// Query keys for React Query
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (query: UserQuery) => [...userQueryKeys.lists(), query] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  me: () => [...userQueryKeys.all, 'me'] as const,
} as const;

/**
 * Hook for managing current user data
 */
export function useCurrentUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: async (): Promise<SessionUser> => {
      const response = await secureGet('/api/auth/me');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user data');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: UpdateUserProfile): Promise<SessionUser> => {
      const response = await securePut('/api/users/profile', updates);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }
      return response.data;
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.me() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<SessionUser>(userQueryKeys.me());

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<SessionUser>(userQueryKeys.me(), {
          ...previousUser,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userQueryKeys.me(), context.previousUser);
      }
      toast.error('Failed to update profile: ' + error.message);
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      // Invalidate related queries - make sure to invalidate both me() and details()
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.details() });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UpdateUserPreferences): Promise<SessionUser> => {
      const response = await securePut('/api/users/preferences', preferences);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update preferences');
      }
      return response.data;
    },
    onMutate: async (preferences) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.me() });
      const previousUser = queryClient.getQueryData<SessionUser>(userQueryKeys.me());

      if (previousUser) {
        // Create a safe copy with preferences
        const updatedUser = {
          ...previousUser,
          preferences: {
            ...(previousUser.preferences || {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: false,
                marketing: false,
                security: true
              }
            }),
            ...preferences,
          },
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData<SessionUser>(userQueryKeys.me(), updatedUser);
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userQueryKeys.me(), context.previousUser);
      }
      toast.error('Failed to update preferences: ' + error.message);
    },
    onSuccess: (data) => {
      toast.success('Preferences updated successfully');
      // Explicitly invalidate the me() query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
    },
  });

  const updateProfile = useCallback(
    (updates: UpdateUserProfile) => updateProfileMutation.mutate(updates),
    [updateProfileMutation]
  );

  const updatePreferences = useCallback(
    (preferences: UpdateUserPreferences) => updatePreferencesMutation.mutate(preferences),
    [updatePreferencesMutation]
  );

  return {
    user,
    isLoading,
    error,
    refetch,
    updateProfile,
    updatePreferences,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}

/**
 * Hook for managing user list with filtering and pagination
 */
export function useUserList(query: UserQuery) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userQueryKeys.list(query),
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await secureGet(`/api/users?${params.toString()}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for managing individual user details
 */
export function useUser(userId: string) {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: async (): Promise<PublicUser> => {
      const response = await secureGet(`/api/users/${userId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for user search functionality
 */
export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<UserQuery>>({});
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const query: UserQuery = useMemo(() => ({
    page: 1,
    limit: 20,
    search: debouncedQuery || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...filters,
  }), [debouncedQuery, filters]);

  const { users, pagination, isLoading, error } = useUserList(query);

  const updateFilters = useCallback((newFilters: Partial<UserQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
    users,
    pagination,
    isLoading,
    error,
    hasActiveFilters: Object.keys(filters).length > 0 || searchQuery.length > 0,
  };
}

/**
 * Hook for user analytics and insights
 */
export function useUserAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 'analytics'],
    queryFn: async () => {
      const response = await secureGet('/api/users/analytics');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    analytics: data,
    isLoading,
    error,
  };
}

/**
 * Hook for user preferences with theme integration
 */
export function useUserPreferences() {
  const { user, updatePreferences, isUpdatingPreferences } = useCurrentUser();

  const updateTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
    
    // Apply theme immediately to document
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [updatePreferences]);

  const updateLanguage = useCallback((language: string) => {
    updatePreferences({ language });
    // You could integrate with i18n here
  }, [updatePreferences]);

  const updateNotifications = useCallback((notifications: Partial<{
    email: boolean;
    push: boolean;
    marketing: boolean;
    security: boolean;
  }>) => {
    // Create a safe default if notifications don't exist
    const currentNotifications = user?.preferences?.notifications || {
      email: false,
      push: false,
      marketing: false,
      security: true
    };
    
    updatePreferences({
      notifications: {
        ...currentNotifications,
        ...notifications,
      },
    });
  }, [user?.preferences, updatePreferences]);

  return {
    preferences: user?.preferences,
    updateTheme,
    updateLanguage,
    updateNotifications,
    isUpdating: isUpdatingPreferences,
  };
}

/**
 * Hook for user avatar management
 */
export function useUserAvatar() {
  const { user, updateProfile, isUpdatingProfile } = useCurrentUser();

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result = await response.json();
      return result.data.url;
    },
    onSuccess: (avatarUrl) => {
      // Update profile with the new avatar URL
      updateProfile({ avatar: avatarUrl });
      toast.success('Avatar updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload avatar: ' + error.message);
    },
  });

  const removeAvatar = useCallback(() => {
    updateProfile({ avatar: null });
  }, [updateProfile]);

  return {
    avatar: user?.avatar,
    uploadAvatar: uploadAvatarMutation.mutate,
    removeAvatar,
    isUploading: uploadAvatarMutation.isPending,
    isUpdating: isUpdatingProfile,
  };
}

/**
 * Hook for fetching and managing user activity data
 */
export function useUserActivity(userId?: string) {
  const {
    data: activity,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', 'activity', userId],
    queryFn: async (): Promise<UserActivity> => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await secureGet(`/api/user-activity/${userId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user activity');
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    activity,
    isLoading,
    error,
    refetch,
  };
}
