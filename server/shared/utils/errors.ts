/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Custom Error Classes for different error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;
  
  constructor(message: string, service: string, details?: unknown) {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR', details);
    this.service = service;
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(`Database error: ${message}`, 500, 'DATABASE_ERROR', details);
  }
}

// Error type guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}

export function isExternalServiceError(error: unknown): error is ExternalServiceError {
  return error instanceof ExternalServiceError;
}

export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (isAppError(error) && (error as any).severity) {
    return (error as any).severity;
  }
  
  // Default severity based on status code
  if (isAppError(error)) {
    if (error.statusCode >= 500) return 'critical';
    if (error.statusCode >= 400) return 'high';
    if (error.statusCode >= 300) return 'medium';
  }
  
  return 'medium';
}

export function getErrorCategory(error: unknown): string {
  if (isAppError(error) && (error as any).category) {
    return (error as any).category;
  }
  
  // Default category based on error type
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof AuthenticationError) return 'authentication';
  if (error instanceof AuthorizationError) return 'authorization';
  if (error instanceof NotFoundError) return 'not_found';
  if (error instanceof ConflictError) return 'conflict';
  if (error instanceof RateLimitError) return 'rate_limit';
  if (error instanceof ExternalServiceError) return 'external_service';
  if (error instanceof DatabaseError) return 'database';
  
  return 'internal';
}

export function isRetryableError(error: unknown): boolean {
  if (isAppError(error) && (error as any).retryable !== undefined) {
    return (error as any).retryable;
  }
  
  // Default retryable logic
  if (isAppError(error)) {
    // 5xx errors are generally retryable
    if (error.statusCode >= 500) return true;
    // Rate limit errors are retryable
    if (error instanceof RateLimitError) return true;
    // Some external service errors are retryable
    if (error instanceof ExternalServiceError) return true;
  }
  
  return false;
}

// Error factory functions
export const createValidationError = (message: string, details?: unknown) => 
  new ValidationError(message, details);

export const createNotFoundError = (resource?: string) => 
  new NotFoundError(resource);

export const createAuthError = (message?: string) => 
  new AuthenticationError(message);

export const createExternalServiceError = (message: string, service: string, details?: unknown) => 
  new ExternalServiceError(message, service, details);

// Enhanced error factory with severity and category
export const createStandardError = (
  message: string, 
  statusCode: number, 
  code: string, 
  category: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'conflict' | 'rate_limit' | 'external_service' | 'database' | 'internal',
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  retryable: boolean = false,
  details?: unknown
) => {
  const error = new AppError(message, statusCode, code, details);
  (error as any).category = category;
  (error as any).severity = severity;
  (error as any).retryable = retryable;
  return error;
};
