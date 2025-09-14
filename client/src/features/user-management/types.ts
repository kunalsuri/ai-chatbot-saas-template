/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  password: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'viewer';
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserFilters {
  role?: 'admin' | 'user' | 'viewer';
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
}

export interface UserManagementState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
}
