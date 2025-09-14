/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { log, SecuritySeverity } from '../utils/logger';
import { AppError, isAppError, createStandardError, createValidationError, isOperationalError, getErrorSeverity, getErrorCategory, isRetryableError } from '../utils/errors';
import { StandardErrorResponse, ErrorResponse, ValidationError, ErrorContext } from '@shared/types/api';
import { AuthenticatedRequest } from '../types/express.d';
import { nanoid } from 'nanoid';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

// Generate unique request ID for error tracking
export function generateRequestId(): string {
  return uuidv4();
}

// Extract error context from request
export function extractErrorContext(req: Request): ErrorContext {
  return {
    userId: (req as AuthenticatedRequest).user?.id,
    requestId: (req as any).requestId || generateRequestId(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    path: req.path,
    query: req.query as Record<string, unknown>,
    body: req.method !== 'GET' ? req.body : undefined,
    headers: {
      'content-type': req.get('Content-Type') || '',
      'authorization': req.get('Authorization') ? '[REDACTED]' : '',
      'user-agent': req.get('User-Agent') || ''
    }
  };
}

// Standardized error response format
export function formatErrorResponse(
  error: AppError | Error,
  context?: ErrorContext,
  includeStack: boolean = false
): StandardErrorResponse {
  const timestamp = new Date().toISOString();
  const severity = getErrorSeverity(error);
  const category = getErrorCategory(error) as StandardErrorResponse['category'];
  const retryable = isRetryableError(error);

  const baseResponse: StandardErrorResponse = {
    success: false,
    error: config.isProduction && !isAppError(error)
      ? 'Internal server error' 
      : error.message,
    timestamp,
    severity,
    category,
    retryable,
    requestId: context?.requestId,
    path: context?.path
  };

  if (isAppError(error)) {
    baseResponse.code = error.code;
    
    // Add validation details if it's a validation error
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      baseResponse.details = error.details as ValidationError[];
    }
  }

  // Include stack trace in development
  if (includeStack && error.stack) {
    baseResponse.stack = error.stack;
  }

  return baseResponse;
}

// Global error handler middleware
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isDevelopment = config.isDevelopment;
  const context = extractErrorContext(req);
  
  // Determine status code
  let statusCode = 500;
  if (isAppError(error)) {
    statusCode = error.statusCode;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  }

  // Format error response
  const errorResponse = formatErrorResponse(error, context, isDevelopment);

  // Enhanced error logging with full context
  const severity = getErrorSeverity(error);
  const category = getErrorCategory(error);
  
  log.error('Unhandled application error', error, {
    ...context,
    statusCode,
    category,
    retryable: isRetryableError(error),
    operational: isOperationalError(error)
  });

  // Send error response
  res.status(statusCode).json(errorResponse);

  // Log critical errors for monitoring
  if (!isOperationalError(error) || severity === 'critical') {
    const securitySeverity = severity === 'critical' ? SecuritySeverity.CRITICAL : SecuritySeverity.HIGH;
    log.security('Critical error occurred', securitySeverity, {
      error: error.message,
      stack: error.stack,
      requestId: context.requestId,
      userId: context.userId,
      path: context.path,
      method: context.method,
      category
    });
  }
}

// Request ID middleware to track errors across requests
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

// Async error wrapper for route handlers with enhanced error context
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      // Add request context to error for better tracking
      const context = extractErrorContext(req);
      (error as any).requestContext = context;
      next(error);
    });
  };
}

// Standardized success response helper
export function sendSuccessResponse<T>(
  res: Response, 
  data: T, 
  message?: string, 
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
}

// Standardized error response helper
export function sendErrorResponse(
  res: Response, 
  error: Error | AppError, 
  req?: Request
): void {
  const context = req ? extractErrorContext(req) : undefined;
  const statusCode = isAppError(error) ? error.statusCode : 500;
  const errorResponse = formatErrorResponse(error, context, config.isDevelopment);
  
  res.status(statusCode).json(errorResponse);
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  const context = extractErrorContext(req);
  
  const errorResponse: StandardErrorResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    code: 'NOT_FOUND',
    severity: 'low',
    category: 'not_found',
    retryable: false,
    requestId: context.requestId,
    path: context.path
  };

  log.warn('Route not found', {
    ...context,
    statusCode: 404
  });

  res.status(404).json(errorResponse);
}

// Validation error handler for express-validator
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // This will be used with express-validator if needed
  next();
}
