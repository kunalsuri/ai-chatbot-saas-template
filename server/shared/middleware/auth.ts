/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "../../storage";
import { AuthenticatedRequest, ApiErrorResponse } from "../types/express.d";
import { User } from "@shared/schema";
import { log } from "../utils/logger.js";

/**
 * Session validation result
 */
interface SessionValidationResult {
  isValid: boolean;
  user?: User;
  reason?: string;
}

/**
 * Validate session and get current user
 */
export async function validateSession(req: Request): Promise<SessionValidationResult> {
  // Check if session exists
  if (!req.session) {
    return { isValid: false, reason: 'No session found' };
  }

  // Check if session has userId
  if (!req.session.userId) {
    return { isValid: false, reason: 'No user ID in session' };
  }

  // Validate user exists in storage
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    // User was deleted but session still exists - invalidate session
    req.session.destroy(() => {});
    return { isValid: false, reason: 'User no longer exists' };
  }

  return { isValid: true, user };
}

/**
 * Get current user from session (legacy compatibility)
 */
export async function getCurrentUser(req: Request): Promise<User | null> {
  const validation = await validateSession(req);
  return validation.user || null;
}

/**
 * Authentication middleware - requires valid session
 * Enhanced with proper session validation and security logging
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = await validateSession(req);
    
    if (!validation.isValid) {
      log.authEvent('authentication_required', undefined, { 
        reason: validation.reason,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      
      const errorResponse: ApiErrorResponse = {
        error: "Authentication required",
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Attach user to request object
    (req as AuthenticatedRequest).user = validation.user!;
    
    // Log successful authentication for security monitoring
    log.authEvent('authentication_success', validation.user!.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    next();
  } catch (error) {
    log.authEvent('authentication_failed', undefined, { 
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    const errorResponse: ApiErrorResponse = {
      error: "Authentication failed",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}

/**
 * Optional authentication middleware - attaches user if session exists
 * Enhanced with proper validation and security logging
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = await validateSession(req);
    if (validation.isValid && validation.user) {
      (req as AuthenticatedRequest).user = validation.user;
      
      // Log optional authentication success
      log.debug('Optional authentication success', {
        userId: validation.user.id,
        path: req.path
      });
    } else if (validation.reason) {
      // Log why optional authentication failed (for debugging)
      log.debug('Optional authentication failed', {
        reason: validation.reason,
        path: req.path
      });
    }
    next();
  } catch (error) {
    log.debug('Optional authentication error', { 
      error: error instanceof Error ? error.message : String(error),
      path: req.path
    });
    // Don't fail the request for optional auth
    next();
  }
}

/**
 * Middleware to ensure session cleanup on logout
 */
export function ensureSessionCleanup(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Override session destroy to ensure complete cleanup
  const originalDestroy = req.session?.destroy;
  if (req.session && originalDestroy) {
    req.session.destroy = function(callback?: (err?: any) => void) {
      // Clear all session data
      this.userId = undefined;
      this.csrfSecret = undefined;
      
      // Call original destroy with proper callback handling
      return originalDestroy.call(this, callback || (() => {}));
    };
  }
  
  next();
}

/**
 * Rate limiting for authentication endpoints
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function authRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const attempts = authAttempts.get(clientId);
  
  // Clean up old attempts
  if (attempts && now - attempts.lastAttempt > LOCKOUT_DURATION) {
    authAttempts.delete(clientId);
  }
  
  const currentAttempts = authAttempts.get(clientId);
  
  if (currentAttempts && currentAttempts.count >= MAX_AUTH_ATTEMPTS) {
    log.authEvent('rate_limit_exceeded', undefined, {
      ip: req.ip,
      attempts: currentAttempts.count,
      userAgent: req.get('User-Agent')
    });
    
    const errorResponse: ApiErrorResponse = {
      error: "Too many authentication attempts. Please try again later.",
      timestamp: new Date().toISOString(),
    };
    res.status(429).json(errorResponse);
    return;
  }
  
  // Track this attempt
  const newCount = (currentAttempts?.count || 0) + 1;
  authAttempts.set(clientId, { count: newCount, lastAttempt: now });
  
  next();
}

/**
 * Clear auth attempts on successful login
 */
export function clearAuthAttempts(clientId: string): void {
  authAttempts.delete(clientId);
}
