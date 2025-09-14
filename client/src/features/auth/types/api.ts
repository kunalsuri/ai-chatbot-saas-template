/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Authentication Types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  plan: string;
}

export interface LoginResponse {
  success: boolean;
  data?: AuthUser;
  error?: string;
  timestamp: string;
}

export interface SignupResponse {
  success: boolean;
  data?: AuthUser;
  error?: string;
  timestamp: string;
}

export interface CsrfTokenData {
  csrfToken: string;
}

export interface CsrfTokenResponse {
  success: boolean;
  data?: CsrfTokenData;
  error?: string;
  timestamp: string;
}
