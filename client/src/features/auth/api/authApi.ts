/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { 
  AuthUser, 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from '../types';

const API_BASE = '/api/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Logout failed');
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${API_BASE}/me`);
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Password reset failed');
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Password change failed');
  },
};
