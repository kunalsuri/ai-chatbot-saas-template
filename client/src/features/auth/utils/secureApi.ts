/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Secure API utility with automatic session handling and server restart detection
 * Follows React + TypeScript best practices (2025)
 */

import { getCsrfToken, clearCsrfToken } from './csrf';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ServerRestartError extends Error {
  constructor(message: string = 'Server restarted - please log in again') {
    super(message);
    this.name = 'ServerRestartError';
  }
}

/**
 * Secure fetch wrapper that handles authentication and server restart scenarios
 */
export async function secureApiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Add credentials for session cookies
    const requestOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add CSRF token for non-GET requests
    if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
      try {
        const csrfToken = await getCsrfToken();
        requestOptions.headers = {
          ...requestOptions.headers,
          'X-CSRF-Token': csrfToken,
        };
      } catch (csrfError) {
        // If CSRF token fails, likely server restart
        clearCsrfToken();
        throw new ServerRestartError('Failed to obtain CSRF token - server may have restarted');
      }
    }

    const response = await fetch(url, requestOptions);

    // Handle authentication failures
    if (response.status === 401) {
      clearCsrfToken();
      throw new AuthenticationError('Session expired or invalid');
    }

    // Handle CSRF failures (likely server restart)
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.includes('CSRF')) {
        clearCsrfToken();
        throw new ServerRestartError('CSRF token invalid - server may have restarted');
      }
      throw new Error(errorData.error || 'Forbidden');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;

  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
      throw error;
    }

    // Handle network errors (likely server down/restart)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ServerRestartError('Network error - server may be down or restarting');
    }

    // Handle other errors
    throw new Error(error instanceof Error ? error.message : 'Unknown API error');
  }
}

/**
 * Secure GET request with retry
 */
export async function secureGet<T = any>(url: string, retry: boolean = true): Promise<ApiResponse<T>> {
  return retry ? 
    secureApiCallWithRetry<T>(url, { method: 'GET' }) :
    secureApiCall<T>(url, { method: 'GET' });
}

/**
 * Secure POST request with retry
 */
export async function securePost<T = any>(
  url: string,
  data?: any,
  retry: boolean = true
): Promise<ApiResponse<T>> {
  const options = {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  };
  
  return retry ? 
    secureApiCallWithRetry<T>(url, options) :
    secureApiCall<T>(url, options);
}

/**
 * Secure PUT request
 */
export async function securePut<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return secureApiCall<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Secure DELETE request
 */
export async function secureDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  return secureApiCall<T>(url, { method: 'DELETE' });
}

/**
 * Hook for handling API errors in React components
 */
export function useApiErrorHandler() {
  return (error: Error) => {
    if (error instanceof AuthenticationError) {
      // Trigger re-authentication
      window.dispatchEvent(new CustomEvent('auth:required'));
      return 'Please log in to continue';
    }

    if (error instanceof ServerRestartError) {
      // Trigger re-authentication with server restart message
      window.dispatchEvent(new CustomEvent('auth:server-restart'));
      return 'Server restarted - please log in again';
    }

    return error.message;
  };
}

/**
 * Enhanced secure API call with automatic retry for authentication failures
 */
export async function secureApiCallWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 1
): Promise<ApiResponse<T>> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await secureApiCall<T>(url, options);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry for non-auth errors or on last attempt
      if (!(error instanceof AuthenticationError) || attempt === maxRetries) {
        throw error;
      }
      
      // Clear CSRF token and wait before retry
      clearCsrfToken();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw lastError!;
}
