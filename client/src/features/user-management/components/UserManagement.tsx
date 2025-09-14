/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * User Management Page - Admin Only
 * State-of-the-Art 2025 Implementation with Modern UX
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secureGet, securePost, securePut, secureDelete } from '@/features/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'react-hot-toast';

// Import modular components
import { UserStats } from './UserStats';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserPagination } from './UserPagination';
import { UserFormDialog } from './UserFormDialog';
import { UserActivityDialog, transformUserActivityToItems } from './UserActivityDialog';
import { UserAnalyticsDashboard } from './UserAnalyticsDashboard';
import { EnhancedUserFilters } from './EnhancedUserFilters';
import { UserManagementErrorBoundary } from './ErrorBoundary';
import { UserManagementHeader } from './UserManagementHeader';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { BulkActionDialog } from './BulkActionDialog';
import { UserManagementLoadingState } from './UserManagementLoadingState';
import { UserManagementErrorState } from './UserManagementErrorState';

// Import types
import { CompleteUser, UserQuery } from '../types/user-management';
import { Role } from '@/features/auth';
import { UserActivity } from '../types/user-activity';
import { cn } from '@/lib/utils';

// Import hooks
import { useUserManagementWebSocket } from '../hooks/useWebSocket';
import { useDebouncedSearch } from '../hooks/useDebounce';

export function UserManagement() {
  const queryClient = useQueryClient();

  // Real-time updates via WebSocket
  const { isConnected: wsConnected, connectionStatus } = useUserManagementWebSocket();

  // Enhanced search with debouncing
  const { searchValue, setSearchValue, debouncedValue } = useDebouncedSearch('', 300);

  // State for filters, sorting, and pagination
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'suspended' | 'pending' | 'all_statuses'>('all_statuses');
  const [roleFilter, setRoleFilter] = useState<Role | 'all_roles'>('all_roles');
  const [filteredUsers, setFilteredUsers] = useState<CompleteUser[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  type SortField = 'status' | 'plan' | 'createdAt' | 'lastLogin' | 'username' | 'email' | 'role';
  const [sorting, setSorting] = useState({ sortBy: 'createdAt' as SortField, sortDirection: 'desc' as 'asc' | 'desc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for selected users (for bulk actions)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // State for dialogs
  const [userFormDialog, setUserFormDialog] = useState({
    isOpen: false,
    user: undefined as CompleteUser | undefined,
  });

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  // Confirmation dialog states
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    isOpen: false,
    userId: '',
    username: '',
  });

  const [bulkActionDialog, setBulkActionDialog] = useState({
    isOpen: false,
    action: '' as 'activate' | 'deactivate' | '',
  });

  // User Management API functions
  const userManagementApi = {
    getUsers: async (query: UserQuery): Promise<{ users: CompleteUser[]; pagination: any }> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await secureGet(`/api/users?${params.toString()}`);
      if (!response.success) throw new Error(response.error || 'Failed to fetch users');
      return response.data;
    },

    createUser: async (userData: Partial<CompleteUser>): Promise<CompleteUser> => {
      const response = await securePost('/api/users', userData);
      if (!response.success) throw new Error(response.error || 'Failed to create user');
      return response.data;
    },

    updateUser: async (id: string, userData: Partial<CompleteUser>): Promise<CompleteUser> => {
      const response = await securePut(`/api/users/${id}`, userData);
      if (!response.success) throw new Error(response.error || 'Failed to update user');
      return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
      const response = await secureDelete(`/api/users/${id}`);
      if (!response.success) throw new Error(response.error || 'Failed to delete user');
    },

    getUserActivity: async (userId: string): Promise<UserActivity> => {
      const response = await secureGet(`/api/user-activity/${userId}`);
      if (!response.success) throw new Error(response.error || 'Failed to fetch user activity');
      return response.data.activity;
    },

    bulkActivateUsers: async (userIds: string[]): Promise<void> => {
      const response = await securePost('/api/users/bulk-activate', { userIds });
      if (!response.success) throw new Error(response.error || 'Failed to activate users');
    },

    bulkDeactivateUsers: async (userIds: string[]): Promise<void> => {
      const response = await securePost('/api/users/bulk-deactivate', { userIds });
      if (!response.success) throw new Error(response.error || 'Failed to deactivate users');
    },

    changeUserStatus: async (userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<CompleteUser> => {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to change user status' }));
        throw new Error(errorData.error || 'Failed to change user status');
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to change user status');
      return result.data;
    },
  };

  // Combine all query parameters
  const queryParams = useMemo(() => ({
    search: debouncedValue,
    status: statusFilter !== 'all_statuses' ? statusFilter : undefined,
    role: roleFilter !== 'all_roles' ? roleFilter : undefined,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortDirection,
    page: currentPage,
    limit: pageSize
  }), [debouncedValue, statusFilter, roleFilter, sorting, currentPage, pageSize]);

  // Main users query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', debouncedValue, statusFilter, roleFilter, sorting, currentPage, pageSize, 'admin-panel'],
    queryFn: () => userManagementApi.getUsers(queryParams),
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
    staleTime: 30000, // Cache for 30 seconds for better performance
  });

  // User activity query
  const { data: activityData, isLoading: isLoadingActivity } = useQuery<UserActivity>({
    queryKey: ['userActivity', selectedUserId],
    queryFn: () => userManagementApi.getUserActivity(selectedUserId),
    enabled: !!selectedUserId && isActivityDialogOpen
  });

  // Initialize component and ensure fresh data on mount
  React.useEffect(() => {
    // Invalidate all user queries to ensure fresh data when component mounts
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [queryClient]);

  // Ensure component re-initializes when route changes
  React.useEffect(() => {
    // Force a refetch when the component mounts or route changes
    refetch();
  }, [refetch]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: Partial<CompleteUser>) => userManagementApi.createUser(userData),
    onSuccess: () => {
      toast.success('User created successfully');
      setUserFormDialog({ isOpen: false, user: undefined });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<CompleteUser> }) =>
      userManagementApi.updateUser(id, userData),
    onSuccess: () => {
      toast.success('User updated successfully');
      setUserFormDialog({ isOpen: false, user: undefined });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userManagementApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      setDeleteConfirmDialog({ isOpen: false, userId: '', username: '' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
  });

  const bulkActivateUsersMutation = useMutation({
    mutationFn: (userIds: string[]) => userManagementApi.bulkActivateUsers(userIds),
    onSuccess: () => {
      toast.success('Users activated successfully');
      setBulkActionDialog({ isOpen: false, action: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Error activating users: ${error.message}`);
    },
  });

  const bulkDeactivateUsersMutation = useMutation({
    mutationFn: (userIds: string[]) => userManagementApi.bulkDeactivateUsers(userIds),
    onSuccess: () => {
      toast.success('Users deactivated successfully');
      setBulkActionDialog({ isOpen: false, action: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Error deactivating users: ${error.message}`);
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' | 'suspended' }) =>
      userManagementApi.changeUserStatus(userId, status),
    onSuccess: (data, variables) => {
      const statusText = variables.status === 'active' ? 'activated' :
        variables.status === 'inactive' ? 'deactivated' : 'suspended';
      toast.success(`User ${statusText} successfully`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(`Error changing user status: ${error.message}`);
    },
  });

  // Event handlers
  const handleSearch = (search: string) => {
    setSearchValue(search);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (status: 'active' | 'inactive' | 'suspended' | 'pending' | 'all_statuses') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: Role | 'all_roles') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: SortField) => {
    setSorting(prev => ({
      sortBy,
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  const handleUserSelection = (userId: string, isSelected: boolean) => {
    setSelectedUsers(prev =>
      isSelected
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAllUsers = (isSelected: boolean) => {
    setSelectedUsers(
      isSelected && data?.users
        ? data.users.map(user => user.id)
        : []
    );
  };

  const handleCreateUser = () => {
    setUserFormDialog({ isOpen: true, user: undefined });
  };

  const handleEditUser = (user: CompleteUser) => {
    setUserFormDialog({ isOpen: true, user });
  };

  const handleViewActivity = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setIsActivityDialogOpen(true);
  };

  const handleDeleteUserClick = (userId: string, username: string) => {
    setDeleteConfirmDialog({ isOpen: true, userId, username });
  };

  const handleDeleteUserConfirm = () => {
    if (deleteConfirmDialog.userId) {
      deleteUserMutation.mutate(deleteConfirmDialog.userId);
    }
  };

  const handleBulkActionClick = (action: 'activate' | 'deactivate') => {
    setBulkActionDialog({ isOpen: true, action });
  };

  const handleBulkActionConfirm = () => {
    if (!selectedUsers.length) return;

    if (bulkActionDialog.action === 'activate') {
      bulkActivateUsersMutation.mutate(selectedUsers);
    } else if (bulkActionDialog.action === 'deactivate') {
      bulkDeactivateUsersMutation.mutate(selectedUsers);
    }
  };

  const handleChangeStatus = (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    changeStatusMutation.mutate({ userId, status });
  };

  const handleUserFormSubmit = (data: Partial<CompleteUser>) => {
    if (userFormDialog.user) {
      // Update existing user
      updateUserMutation.mutate({
        id: userFormDialog.user.id,
        userData: data,
      });
    } else {
      // Create new user
      createUserMutation.mutate(data);
    }
  };

  // Compute user stats for the stats component
  const userStats = useMemo(() => {
    if (!data?.users) return {
      totalUsers: 0,
      activeUsers: 0,
      usersByPlan: {}
    };

    const totalUsers = data.users.length;
    const activeUsers = data.users.filter(user => user.status === 'active').length;

    const usersByPlan = data.users.reduce((acc: Record<string, number>, user) => {
      const plan = user.plan || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      usersByPlan
    };
  }, [data?.users]);

  // Loading state
  if (isLoading && !data) {
    return <UserManagementLoadingState />;
  }

  // Error state
  if (error && !data) {
    return (
      <UserManagementErrorState
        error={error}
        isLoading={isLoading}
        onRetry={() => refetch()}
        onRefreshPage={() => window.location.reload()}
      />
    );
  }

  return (
    <UserManagementErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <UserManagementHeader
          wsConnected={wsConnected}
          showAnalytics={showAnalytics}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          onCreateUser={handleCreateUser}
        />

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <UserAnalyticsDashboard users={data?.users || []} />
        )}

        {/* User Stats */}
        <UserStats
          users={data?.users || []}
          totalUsers={userStats.totalUsers}
        />

        {/* Enhanced User Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedUserFilters
              users={data?.users || []}
              onFilteredUsersChange={setFilteredUsers}
              selectedUsers={selectedUsers}
              onBulkAction={(action) => {
                if (action === 'export') {
                  // Export handled in the component
                } else {
                  handleBulkActionClick(action);
                }
              }}
            />

            {/* User Table */}
            <div className="mt-4">
              <UserTable
                users={filteredUsers.length > 0 ? filteredUsers : data?.users || []}
                isLoading={isLoading}
                sortBy={sorting.sortBy}
                sortDirection={sorting.sortDirection}
                selectedUsers={selectedUsers}
                onSelectUser={handleUserSelection}
                onSelectAll={handleSelectAllUsers}
                onEditUser={handleEditUser}
                onViewActivity={(userId: string) => {
                  const user = (filteredUsers.length > 0 ? filteredUsers : data?.users || []).find(u => u.id === userId);
                  if (user) handleViewActivity(userId, user.username);
                }}
                onDeleteUser={handleDeleteUserClick}
                onChangeStatus={handleChangeStatus}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Pagination */}
            {data?.pagination && (
              <div className="mt-4">
                <UserPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  totalItems={data.pagination.total}
                  totalPages={data.pagination.totalPages}
                  isLoading={isLoading}
                />
              </div>
            )}
          </CardContent>
        </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        isOpen={userFormDialog.isOpen}
        onClose={() => setUserFormDialog({ isOpen: false, user: undefined })}
        {...(userFormDialog.user ? { user: userFormDialog.user } : {})}
        onSubmit={handleUserFormSubmit}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {isActivityDialogOpen && (
        <UserActivityDialog
          isOpen={isActivityDialogOpen}
          onClose={() => setIsActivityDialogOpen(false)}
          userId={selectedUserId}
          username={selectedUsername}
          activities={transformUserActivityToItems(activityData)}
          isLoading={isLoadingActivity}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteConfirmDialog.isOpen}
        username={deleteConfirmDialog.username}
        isDeleting={deleteUserMutation.isPending}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, userId: '', username: '' })}
        onConfirm={handleDeleteUserConfirm}
      />

      <BulkActionDialog
        isOpen={bulkActionDialog.isOpen}
        action={bulkActionDialog.action}
        selectedUserCount={selectedUsers.length}
        isProcessing={bulkActivateUsersMutation.isPending || bulkDeactivateUsersMutation.isPending}
        onCancel={() => setBulkActionDialog({ isOpen: false, action: '' })}
        onConfirm={handleBulkActionConfirm}
      />
      </div>
    </UserManagementErrorBoundary>
  );
}

export default UserManagement;
