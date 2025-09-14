/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ApiResponse } from '@shared/types/api';

// Authentication Types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  plan: string;
}

export interface LoginResponse extends ApiResponse<AuthUser> {}
export interface SignupResponse extends ApiResponse<AuthUser> {}

export interface CsrfTokenData {
  csrfToken: string;
}

export interface CsrfTokenResponse extends ApiResponse<CsrfTokenData> {}

// Storage Types
export interface UserWithPassword {
  id: string;
  username: string;
  email: string;
  plan: string;
  password: string;
  lastLogin: string | null;
  createdAt?: Date | null;
}

export interface UserWithProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string | null;
  plan: string;
}
