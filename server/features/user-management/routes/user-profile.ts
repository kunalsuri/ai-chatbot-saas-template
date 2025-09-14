/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * User Profile API Routes
 * Handles user profile updates and preferences
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../../shared/middleware/auth.js';
import { simpleUserManagementService } from '../services/user-management-simple';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Validation schemas
const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

const UpdatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    marketing: z.boolean().optional(),
    security: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showEmail: z.boolean().optional(),
    showActivity: z.boolean().optional(),
  }).optional(),
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const profileData = UpdateProfileSchema.parse(req.body);
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const updatedUser = await simpleUserManagementService.updateUser(req.user.id, profileData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return sanitized user data
    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        plan: updatedUser.plan,
        bio: updatedUser.bio,
        company: updatedUser.company,
        location: updatedUser.location,
        website: updatedUser.website,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const preferencesData = UpdatePreferencesSchema.parse(req.body);
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get current user to access current preferences
    const currentUser = await simpleUserManagementService.getUserById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Merge existing preferences with updates
    const currentPreferences = currentUser.preferences || {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        marketing: false,
        security: true
      }
    };
    
    // Ensure notifications is an object, not a boolean
    const currentNotifications = typeof currentPreferences.notifications === 'boolean' 
      ? { email: true, push: false, marketing: false, security: true }
      : currentPreferences.notifications || { email: true, push: false, marketing: false, security: true };

    const updatedPreferences = {
      ...currentPreferences,
      ...preferencesData,
      notifications: {
        ...currentNotifications,
        ...(preferencesData.notifications || {})
      }
    };

    // Update user with new preferences
    const updatedUser = await simpleUserManagementService.updateUser(req.user.id, {
      preferences: updatedPreferences
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        plan: updatedUser.plan,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
      }
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid preferences data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// POST /api/users/avatar - Upload user avatar
router.post('/avatar', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // In a real app, this would handle file uploads
    // For this implementation, we'll assume the avatar URL is sent in the request body
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'Avatar URL is required'
      });
    }

    const updatedUser = await simpleUserManagementService.updateUser(req.user.id, {
      avatar: avatarUrl
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        url: avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
});

export { router as userProfileRoutes };
