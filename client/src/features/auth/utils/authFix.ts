/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost, AuthenticationError, ServerRestartError } from './secureApi';
import { getCsrfToken, clearCsrfToken } from './csrf';

/**
 * Force authentication check and auto-login if needed
 */
export async function forceAuthCheck(): Promise<boolean> {
  try {
    // First ensure we have a valid CSRF token
    try {
      clearCsrfToken(); // Clear existing token to force refresh
      await getCsrfToken(); // Get a fresh token
    } catch (csrfError) {
      console.warn('CSRF token refresh failed, continuing with auth check');
    }

    // Try to get current user
    const response = await secureGet('/api/auth/me', false); // Don't retry to avoid loops
    return response.success;
  } catch (error) {
    // If auth fails, try to auto-login in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Clear any existing CSRF token first
        clearCsrfToken();
        
        // Get a fresh CSRF token
        const csrfToken = await fetch('/api/auth/csrf-token', {
          credentials: 'include'
        }).then(res => res.json()).then(data => data.data?.csrfToken);
        
        if (!csrfToken) {
          throw new Error('Failed to get CSRF token');
        }
        
        // Attempt login with admin credentials
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          })
        });
        
        if (!loginResponse.ok) {
          throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const userData = await loginResponse.json();
        console.log('Auto-login successful:', userData.data?.username);
        return true;
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Initialize authentication on app startup
 */
export async function initializeAuth(): Promise<void> {
  try {
    // First check if session-init endpoint is available
    const initResponse = await fetch('/api/auth/session-init', {
      credentials: 'include'
    });
    
    if (initResponse.ok) {
      console.log('Session initialization successful');
    }
  } catch (error) {
    console.warn('Session initialization endpoint not available');
  }
  
  // Now try authentication
  const isAuthenticated = await forceAuthCheck();
  if (!isAuthenticated) {
    console.warn('Authentication initialization failed');
  }
}

/**
 * Handle authentication errors and trigger re-authentication
 */
export function handleAuthError(error: Error): void {
  if (error instanceof AuthenticationError) {
    // Trigger re-authentication
    window.dispatchEvent(new CustomEvent('auth:required'));
    forceAuthCheck().catch(e => console.error('Re-authentication failed:', e));
  } else if (error instanceof ServerRestartError) {
    // Clear token and trigger re-authentication
    clearCsrfToken();
    window.dispatchEvent(new CustomEvent('auth:server-restart'));
    forceAuthCheck().catch(e => console.error('Re-authentication after server restart failed:', e));
  }
}
