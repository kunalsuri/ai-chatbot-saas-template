/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Simplified User Management Service
 * Works with existing users.json structure
 */

import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { RoleSchema } from '../../../shared/types/rbac';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Simple user type that matches our actual data
export interface SimpleUser {
  id: string;
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  role: 'admin' | 'pro_user' | 'free_user';
  plan: 'free' | 'pro' | 'premium' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  preferences?: {
    theme: string;
    language: string;
    notifications?: {
      email: boolean;
      push: boolean;
      marketing: boolean;
      security: boolean;
    };
  };
  createdAt: string;
  lastLogin?: string | null;
}

// Public user type (without sensitive data)
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  preferences?: {
    theme: string;
    language: string;
    notifications?: {
      email: boolean;
      push: boolean;
      marketing: boolean;
      security: boolean;
    };
  };
  name?: string;
  avatar?: string;
  role: 'admin' | 'pro_user' | 'free_user';
  plan: 'free' | 'pro' | 'premium' | 'enterprise';
  createdAt: string;
  lastLogin?: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

// Query interface
export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'pro_user' | 'free_user';
  plan?: 'free' | 'pro' | 'premium' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

// Response interface
export interface UserListResponse {
  users: PublicUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Create user interface
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'pro_user' | 'free_user';
  plan?: 'free' | 'pro' | 'premium' | 'enterprise';
}

class SimpleUserManagementService {
  private cache = new Map<string, SimpleUser>();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Load users from file
   */
  private async loadUsers(): Promise<SimpleUser[]> {
    try {
      const content = await fs.readFile(USERS_FILE, 'utf-8');
      const users = JSON.parse(content);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.warn('Failed to load users file:', error);
      return [];
    }
  }

  /**
   * Save users to file
   */
  private async saveUsers(users: SimpleUser[]): Promise<void> {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    this.clearCache();
  }

  /**
   * Clear cache
   */
  private clearCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Convert SimpleUser to PublicUser
   */
  private toPublicUser(user: SimpleUser): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      emailVerified: user.emailVerified,
      role: user.role,
      plan: user.plan,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      status: user.status || 'active', // Use actual status or default to active
    };
  }

  /**
   * Get user list with filtering and pagination
   */
  async getUserList(query: UserQuery = {}): Promise<UserListResponse> {
    const users = await this.loadUsers();
    let filteredUsers = users;

    // Apply search filter
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply role filter
    if (query.role) {
      filteredUsers = filteredUsers.filter(user => user.role === query.role);
    }

    // Apply plan filter
    if (query.plan) {
      filteredUsers = filteredUsers.filter(user => user.plan === query.plan);
    }

    // Apply status filter
    if (query.status) {
      filteredUsers = filteredUsers.filter(user => (user.status || 'active') === query.status);
    }

    // Calculate pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // Convert to public format
    const publicUsers = paginatedUsers.map(user => this.toPublicUser(user));

    return {
      users: publicUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<PublicUser | null> {
    const users = await this.loadUsers();
    const user = users.find(u => u.id === userId);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserData): Promise<SimpleUser> {
    const users = await this.loadUsers();

    // Check for existing user
    const existingUser = users.find(u => 
      u.email === userData.email || u.username === userData.username
    );
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create new user
    const newUser: SimpleUser = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'free_user',
      plan: userData.plan || 'free',
      status: 'active',
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          marketing: false,
          security: true
        },
      },
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    await this.saveUsers(users);

    return newUser;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<SimpleUser>): Promise<SimpleUser | null> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return null;
    }

    const user = users[userIndex];
    const updatedUser = {
      ...user,
      ...updates,
      id: user.id, // Prevent ID changes
      password: user.password, // Prevent password changes through this method
    };

    users[userIndex] = updatedUser;
    await this.saveUsers(users);

    return updatedUser;
  }

  /**
   * Update user password (admin only)
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<SimpleUser | null> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return null;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = users[userIndex];
    const updatedUser = {
      ...user,
      password: hashedPassword,
    };

    users[userIndex] = updatedUser;
    await this.saveUsers(users);

    return updatedUser;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    users.splice(userIndex, 1);
    await this.saveUsers(users);

    return true;
  }

  /**
   * Get user by email or username (for authentication)
   */
  async getUser(identifier: string): Promise<SimpleUser | null> {
    const users = await this.loadUsers();
    return users.find(u => 
      u.email === identifier || u.username === identifier
    ) || null;
  }
}

// Export singleton instance
export const simpleUserManagementService = new SimpleUserManagementService();
