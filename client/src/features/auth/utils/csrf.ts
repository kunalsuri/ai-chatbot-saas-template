/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * CSRF token utility for secure API calls
 */

let csrfToken: string | null = null;

/**
 * Fetch CSRF token from server
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/csrf-token', {
      credentials: 'include', // Include session cookies
    });
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    csrfToken = data.data.csrfToken;
    return csrfToken as string;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Get current CSRF token, fetch if not available
 */
export async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    await fetchCsrfToken();
  }
  if (!csrfToken) {
    throw new Error('Failed to obtain CSRF token');
  }
  return csrfToken;
}

/**
 * Create headers with CSRF token for secure API calls
 */
export async function createSecureHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    ...additionalHeaders,
  };
}

/**
 * Make a secure POST request with CSRF token
 */
export async function securePost(url: string, data: any, options: RequestInit = {}): Promise<Response> {
  const headers = await createSecureHeaders(options.headers as Record<string, string>);
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Make a secure DELETE request with CSRF token
 */
export async function secureDelete(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await createSecureHeaders(options.headers as Record<string, string>);
  
  return fetch(url, {
    method: 'DELETE',
    headers,
    ...options,
  });
}

/**
 * Clear cached CSRF token (useful for logout or token refresh)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

