/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';

// Weekly activity schema
export const WeeklyActivitySchema = z.object({
  week: z.string(),
  apiCalls: z.number(),
  logins: z.number()
});

export type WeeklyActivity = z.infer<typeof WeeklyActivitySchema>;

// Feature usage schema
export const FeatureUsageSchema = z.object({
  count: z.number(),
  lastUsed: z.string().datetime()
});

export type FeatureUsage = z.infer<typeof FeatureUsageSchema>;

// API requests schema
export const ApiRequestsSchema = z.object({
  total: z.number(),
  byEndpoint: z.record(z.string(), z.number())
});

export type ApiRequests = z.infer<typeof ApiRequestsSchema>;

// Features used schema
export const FeaturesUsedSchema = z.object({
  chat: FeatureUsageSchema,
  translate: FeatureUsageSchema,
  promptImprover: FeatureUsageSchema,
  localLLMs: FeatureUsageSchema
}).partial();

export type FeaturesUsed = z.infer<typeof FeaturesUsedSchema>;

// User activity schema
export const UserActivitySchema = z.object({
  totalLogins: z.number().default(0),
  lastLogin: z.string().datetime().optional(),
  totalSessions: z.number().default(0),
  averageSessionDuration: z.number().default(0),
  apiRequests: ApiRequestsSchema.default({
    total: 0,
    byEndpoint: {}
  }),
  featuresUsed: FeaturesUsedSchema.default({}),
  weeklyActivity: z.array(WeeklyActivitySchema).default([])
});

export type UserActivity = z.infer<typeof UserActivitySchema>;

// User activity record schema
export const UserActivityRecordSchema = z.object({
  userId: z.string(),
  activity: UserActivitySchema
});

export type UserActivityRecord = z.infer<typeof UserActivityRecordSchema>;

// User activities collection schema
export const UserActivitiesSchema = z.object({
  users: z.array(UserActivityRecordSchema)
});

export type UserActivities = z.infer<typeof UserActivitiesSchema>;
