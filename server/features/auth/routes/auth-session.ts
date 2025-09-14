/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response } from 'express';
import { asyncHandler, sendSuccessResponse } from '../../../shared/middleware/errorHandler';
import { log } from '../../../shared/utils/logger';
import { AuthenticatedRequest } from '../../../shared/types/express';

/**
 * Initialize session for client
 * This endpoint ensures the session is properly initialized
 */
export const initializeSession = asyncHandler(async (req: Request, res: Response) => {
  // Ensure session is initialized
  if (!req.session) {
    log.error('Session middleware not properly configured');
    res.status(500).json({
      success: false,
      error: 'Session configuration error',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Initialize session properties if they don't exist
  // Use type assertion to access session properties
  const session = req.session as any;
  
  if (!session.hasOwnProperty('userId')) {
    session.userId = undefined;
  }

  if (!session.hasOwnProperty('csrfSecret')) {
    session.csrfSecret = undefined;
  }

  // Send success response
  sendSuccessResponse(res, {
    initialized: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * Check session status
 */
export const checkSessionStatus = asyncHandler(async (req: Request, res: Response) => {
  // Use type assertion to access session properties
  const session = req.session as any;
  const isAuthenticated = session && session.userId !== undefined;
  
  sendSuccessResponse(res, {
    authenticated: isAuthenticated,
    sessionActive: !!session,
    timestamp: new Date().toISOString()
  });
});
