/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Modern User Management Types - State-of-the-Art 2025
 * Unified, type-safe, and scalable user data architecture
 */

import { z } from 'zod';
import { RoleSchema } from '@/features/auth';

// Core User Schema with strict validation
export const UserCoreSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format'),
  email: z.string().email('Invalid email format'),
  emailVerified: z.boolean().default(false),
  createdAt: z.string().datetime('Invalid date format'),
  updatedAt: z.string().datetime('Invalid date format'),
  lastLogin: z.string().datetime('Invalid date format').nullable(),
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('suspended'), z.literal('pending')]).default('active'),
});

// Authentication Schema (server-side only)
export const UserAuthSchema = UserCoreSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordResetToken: z.string().nullable().optional(),
  passwordResetExpires: z.string().datetime().nullable().optional(),
  twoFactorSecret: z.string().nullable().optional(),
  twoFactorEnabled: z.boolean().default(false),
});

// Profile Schema (client-safe)
export const UserProfileSchema = UserCoreSchema.extend({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url('Invalid avatar URL').nullable().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid website URL').optional(),
  company: z.string().max(100).optional(),
  role: RoleSchema.optional(),
});

// Subscription & Plan Schema
export const UserSubscriptionSchema = z.object({
  plan: z.union([z.literal('free'), z.literal('pro'), z.literal('premium'), z.literal('enterprise')]).default('free'),
  planStartDate: z.string().datetime().nullable(),
  planEndDate: z.string().datetime().nullable(),
  isTrialing: z.boolean().default(false),
  trialEndDate: z.string().datetime().nullable(),
  subscriptionId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
});

// Preferences Schema
export const UserPreferencesSchema = z.object({
  theme: z.union([z.literal('light'), z.literal('dark'), z.literal('system')]).default('system'),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
    security: z.boolean().default(true),
  }).default({}),
  privacy: z.object({
    profileVisibility: z.union([z.literal('public'), z.literal('private'), z.literal('friends')]).default('public'),
    showEmail: z.boolean().default(false),
    showActivity: z.boolean().default(true),
  }).default({}),
});

// Analytics & Usage Schema
export const UserAnalyticsSchema = z.object({
  loginCount: z.number().int().min(0).default(0),
  lastActiveAt: z.string().datetime().nullable(),
  sessionsToday: z.number().int().min(0).default(0),
  totalSessions: z.number().int().min(0).default(0),
  featuresUsed: z.array(z.string()).default([]),
  apiUsage: z.object({
    requestsToday: z.number().int().min(0).default(0),
    requestsThisMonth: z.number().int().min(0).default(0),
    totalRequests: z.number().int().min(0).default(0),
  }).default({}),
});

// Complete User Schema (server-side)
export const CompleteUserSchema = UserAuthSchema
  .merge(UserProfileSchema)
  .merge(UserSubscriptionSchema)
  .merge(UserPreferencesSchema)
  .merge(UserAnalyticsSchema);

// Public User Schema (client-safe, no sensitive data)
export const PublicUserSchema = UserProfileSchema
  .merge(UserSubscriptionSchema.pick({ plan: true }))
  .merge(UserPreferencesSchema.pick({ theme: true, language: true }))
  .omit({ email: true }); // Email only visible to user themselves

// Session User Schema (authenticated user data)
export const SessionUserSchema = UserProfileSchema
  .merge(UserSubscriptionSchema)
  .merge(UserPreferencesSchema.pick({ theme: true, language: true, notifications: true }));

// Type exports
export type UserCore = z.infer<typeof UserCoreSchema>;
export type UserAuth = z.infer<typeof UserAuthSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export type CompleteUser = z.infer<typeof CompleteUserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type SessionUser = z.infer<typeof SessionUserSchema>;

// User creation and update schemas
export const CreateUserSchema = UserAuthSchema.pick({
  username: true,
  email: true,
  password: true,
}).extend({
  name: z.string().min(1).max(100).optional(),
});

export const UpdateUserProfileSchema = UserProfileSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserPreferencesSchema = UserPreferencesSchema.partial();

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserPreferences = z.infer<typeof UpdateUserPreferencesSchema>;

// User query and filter schemas
export const UserQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('suspended'), z.literal('pending')]).optional(),
  plan: z.union([z.literal('free'), z.literal('pro'), z.literal('premium'), z.literal('enterprise')]).optional(),
  sortBy: z.union([z.literal('createdAt'), z.literal('lastLogin'), z.literal('username'), z.literal('email'), z.literal('role'), z.literal('plan'), z.literal('status')]).default('createdAt'),
  sortOrder: z.union([z.literal('asc'), z.literal('desc')]).default('desc'),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;

// API Response schemas
export const UserListResponseSchema = z.object({
  users: z.array(PublicUserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;
