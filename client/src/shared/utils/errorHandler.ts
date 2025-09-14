/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ErrorResponse, GenericError } from '@shared/types/api';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Client-side error types
export interface ClientError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  API = 'api',
  UI = 'ui',
  EXTERNAL_SERVICE = 'external_service'
}

class ClientErrorHandler {
  private errors: ClientError[] = [];
  private maxErrors = 100; // Keep last 100 errors

  // Log error to console and store
  logError(error: unknown, context?: Record<string, unknown>, severity: ErrorSeverity = 'medium'): ClientError {
    const clientError: ClientError = {
      message: this.extractErrorMessage(error),
      code: this.extractErrorCode(error),
      severity,
      timestamp: new Date().toISOString(),
      context,
      stack: error instanceof Error ? error.stack : undefined
    };

    // Add to error collection
    this.errors.unshift(clientError);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Log to console based on severity
    const logMethod = this.getLogMethod(severity);
    logMethod(`[${severity.toUpperCase()}] ${clientError.message}`, {
      code: clientError.code,
      context: clientError.context,
      timestamp: clientError.timestamp
    });

    return clientError;
  }

  // Handle API errors specifically
  handleApiError(response: Response, errorData?: ErrorResponse): ClientError {
    const message = errorData?.error || `API Error: ${response.status} ${response.statusText}`;
    const severity = this.getApiErrorSeverity(response.status);
    
    return this.logError(new Error(message), {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      category: ErrorCategory.API
    }, severity);
  }

  // Handle network errors
  handleNetworkError(error: unknown, url?: string): ClientError {
    return this.logError(error, {
      url,
      category: ErrorCategory.NETWORK
    }, 'high');
  }

  // Handle validation errors
  handleValidationError(message: string, field?: string): ClientError {
    return this.logError(new Error(message), {
      field,
      category: ErrorCategory.VALIDATION
    }, 'low');
  }

  // Handle authentication errors
  handleAuthError(message: string): ClientError {
    return this.logError(new Error(message), {
      category: ErrorCategory.AUTHENTICATION
    }, 'high');
  }

  // Get recent errors
  getRecentErrors(limit = 10): ClientError[] {
    return this.errors.slice(0, limit);
  }

  // Get errors by severity
  getErrorsBySeverity(severity: ErrorSeverity): ClientError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Clear error history
  clearErrors(): void {
    this.errors = [];
  }

  // Extract error message from various error types
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const typedError = error as GenericError;
      return typedError.message;
    }
    return 'Unknown error occurred';
  }

  // Extract error code if available
  private extractErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      const typedError = error as GenericError;
      return typedError.code;
    }
    return undefined;
  }

  // Get appropriate console log method based on severity
  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      case 'low':
        return console.info;
      default:
        return console.log;
    }
  }

  // Determine API error severity based on status code
  private getApiErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'critical';
    if (status >= 400 && status < 500) return 'high';
    if (status >= 300 && status < 400) return 'medium';
    return 'low';
  }
}

// Global error handler instance
export const errorHandler = new ClientErrorHandler();

// Global error event listener
window.addEventListener('error', (event) => {
  errorHandler.logError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    category: ErrorCategory.UI
  }, 'high');
});

// Unhandled promise rejection listener
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.logError(event.reason, {
    category: ErrorCategory.UI,
    type: 'unhandled_promise_rejection'
  }, 'high');
});

// Error boundary hook for React components
export function useErrorHandler() {
  return {
    logError: errorHandler.logError.bind(errorHandler),
    handleApiError: errorHandler.handleApiError.bind(errorHandler),
    handleNetworkError: errorHandler.handleNetworkError.bind(errorHandler),
    handleValidationError: errorHandler.handleValidationError.bind(errorHandler),
    handleAuthError: errorHandler.handleAuthError.bind(errorHandler),
    getRecentErrors: errorHandler.getRecentErrors.bind(errorHandler),
    clearErrors: errorHandler.clearErrors.bind(errorHandler)
  };
}

// Utility function for async error handling
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.logError(error, context);
      throw error;
    }
  }) as T;
}
