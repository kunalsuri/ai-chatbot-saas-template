/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pro_user' | 'free_user' | undefined;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Premium';
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone?: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
      security: boolean;
    };
  };
  // Analytics fields
  loginCount?: number;
  totalSessions?: number;
  apiUsage?: {
    totalRequests: number;
  };
  featuresUsed?: string[];
  createdAt: string;
  lastLogin: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
  bio?: string;
  company?: string;
  location?: string;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}
