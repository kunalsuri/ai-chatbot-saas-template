/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * User Management API Routes - Admin Only
 * State-of-the-Art 2025 Implementation
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../../shared/middleware/auth';
import { simpleUserManagementService, UserQuery, CreateUserData } from '../services/user-management-simple';
import { canManageUsers, validateRole } from '../../../shared/utils/rbac';

// Simple validation schemas
const CreateUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['admin', 'pro_user', 'free_user']).optional(),
  plan: z.enum(['free', 'pro', 'premium', 'enterprise']).optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['admin', 'pro_user', 'free_user']).optional(),
  plan: z.enum(['free', 'pro', 'premium', 'enterprise']).optional(),
}).partial();

const UpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const router = Router();

// Middleware to check admin permissions
const requireAdmin = (req: any, res: any, next: any) => {
  const userRole = validateRole(req.user?.role);
  if (!canManageUsers(userRole)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Insufficient permissions. Admin access required.' 
    });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/users - List users with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const query: UserQuery = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      role: req.query.role as 'admin' | 'pro_user' | 'free_user',
      plan: req.query.plan as 'free' | 'pro' | 'premium' | 'enterprise',
      status: req.query.status as 'active' | 'inactive' | 'suspended' | 'pending',
    };

    const users = await simpleUserManagementService.getUserList(query);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const user = await simpleUserManagementService.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const userData = CreateUserSchema.parse(req.body);
    const newUser = await simpleUserManagementService.createUser(userData);
    
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const userData = UpdateUserSchema.parse(req.body);
    const updatedUser = await simpleUserManagementService.updateUser(req.params.id, userData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deleting the current user
    if (req.params.id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const deleted = await simpleUserManagementService.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// PATCH /api/users/:id/status - Update user status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const updatedUser = await simpleUserManagementService.updateUser(req.params.id, { status });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// PATCH /api/users/:id/password - Update user password (admin only)
router.patch('/:id/password', async (req, res) => {
  try {
    const { password } = UpdatePasswordSchema.parse(req.body);
    
    // Prevent changing your own password through admin interface
    if (req.params.id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'Use profile settings to change your own password'
      });
    }

    const updatedUser = await simpleUserManagementService.updateUserPassword(req.params.id, password);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
});

export { router as userManagementRoutes };
