/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { hashPassword } from '../services/password';
import { log } from '../utils/logger';

/**
 * Initialize default user and session data on server startup
 */
export async function initializeAuthSystem(): Promise<void> {
  try {
    // Admin user creation is disabled - we use the existing admin-001 user
    log.info('Auth system initialized - using existing admin user');
  } catch (error) {
    log.error('Failed to initialize auth system', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Middleware to ensure session is properly initialized
 */
export function ensureSessionInit(req: Request, res: Response, next: NextFunction): void {
  // Ensure session object exists
  if (!req.session) {
    log.error('Session middleware not properly configured');
    res.status(500).json({
      error: 'Session configuration error',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Initialize session properties if they don't exist
  if (!req.session.hasOwnProperty('userId')) {
    req.session.userId = undefined;
  }
  
  if (!req.session.hasOwnProperty('csrfSecret')) {
    req.session.csrfSecret = undefined;
  }
  
  next();
}

/**
 * Auto-login middleware for development environment - DISABLED
 * Users should always authenticate through the proper login flow
 */
export async function autoLoginDev(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Auto-login is disabled - users must authenticate properly
  next();
}
