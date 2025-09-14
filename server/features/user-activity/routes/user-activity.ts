/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import express from 'express';
import { userActivityService } from '../services/user-activity';
import { requireAuth } from '../../../shared/middleware/auth';
import { sendErrorResponse, sendSuccessResponse } from '../../../shared/utils/response';
import { z } from 'zod';
import { UserWithProfile } from '../../auth/types/api';

// Extend Express session type to include user property
declare module 'express-session' {
  interface Session {
    user?: UserWithProfile;
  }
}

const router = express.Router();

// Schema for activity tracking request
const TrackActivitySchema = z.object({
  userId: z.string(),
  activityType: z.enum(['login', 'api', 'feature']),
  endpoint: z.string().optional(),
  feature: z.string().optional(),
});

/**
 * Get activity for a specific user
 * GET /api/user-activity/:userId
 */
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Admin check - only admins can view other users' activity
    if (req.session.user?.role !== 'admin' && req.session.user?.id !== userId) {
      return sendErrorResponse(res, 403, 'Forbidden', 'You are not authorized to view this user\'s activity');
    }
    
    const activity = userActivityService.getUserActivity(userId);
    
    if (!activity) {
      return sendErrorResponse(res, 404, 'Not Found', 'User activity not found');
    }
    
    return sendSuccessResponse(res, { activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return sendErrorResponse(res, 500, 'Server Error', 'Failed to fetch user activity');
  }
});

/**
 * Get all user activities (admin only)
 * GET /api/user-activity
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Admin check
    if (req.session.user?.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Forbidden', 'Admin access required');
    }
    
    const activities = userActivityService.getAllUserActivities();
    return sendSuccessResponse(res, { activities });
  } catch (error) {
    console.error('Error fetching all user activities:', error);
    return sendErrorResponse(res, 500, 'Server Error', 'Failed to fetch user activities');
  }
});

/**
 * Track user activity
 * POST /api/user-activity/track
 */
router.post('/track', requireAuth, async (req, res) => {
  try {
    const validationResult = TrackActivitySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendErrorResponse(res, 400, 'Validation Error', validationResult.error.message);
    }
    
    const { userId, activityType, endpoint, feature } = validationResult.data;
    
    // Admin check - only admins can track activity for other users
    if (req.session.user?.role !== 'admin' && req.session.user?.id !== userId) {
      return sendErrorResponse(res, 403, 'Forbidden', 'You are not authorized to track activity for this user');
    }
    
    switch (activityType) {
      case 'login':
        userActivityService.trackLogin(userId);
        break;
      case 'api':
        if (!endpoint) {
          return sendErrorResponse(res, 400, 'Validation Error', 'Endpoint is required for API activity tracking');
        }
        userActivityService.trackApiRequest(userId, endpoint);
        break;
      case 'feature':
        if (!feature) {
          return sendErrorResponse(res, 400, 'Validation Error', 'Feature is required for feature usage tracking');
        }
        userActivityService.trackFeatureUsage(userId, feature);
        break;
    }
    
    return sendSuccessResponse(res, { success: true });
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return sendErrorResponse(res, 500, 'Server Error', 'Failed to track user activity');
  }
});

export default router;
