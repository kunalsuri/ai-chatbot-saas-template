/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from "express";
import csrf from "csrf";
import { ApiErrorResponse } from "../types/express";
import { log, SecuritySeverity } from "../utils/logger.js";

// Create CSRF instance
const tokens = new csrf();

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  try {
    // Check if session exists
    if (!req.session) {
      const errorResponse: ApiErrorResponse = {
        error: "Session required for CSRF protection",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Get or create CSRF secret for session
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }

    const secret = req.session.csrfSecret;
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;

    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "CSRF token missing",
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(errorResponse);
      return;
    }

    if (!tokens.verify(secret, token)) {
      const errorResponse: ApiErrorResponse = {
        error: "Invalid CSRF token",
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(errorResponse);
      return;
    }

    next();
  } catch (error) {
    log.security('csrf_validation_failed', SecuritySeverity.MEDIUM, { error: error instanceof Error ? error.message : String(error) });
    
    const errorResponse: ApiErrorResponse = {
      error: "CSRF validation failed",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}

/**
 * Generate CSRF token for client
 */
export function generateCsrfToken(req: Request): string {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
  }
  
  return tokens.create(req.session.csrfSecret);
}

/**
 * Middleware to add CSRF token to request object
 */
export function addCsrfToken(req: Request, res: Response, next: NextFunction): void {
  req.csrfToken = () => generateCsrfToken(req);
  next();
}
