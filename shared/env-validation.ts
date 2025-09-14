/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';

// Environment validation enums for type safety
export const NodeEnvironment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
} as const;

// Base environment schema with strict validation
const baseEnvironmentSchema = z.object({
  // Core application settings
  NODE_ENV: z.union([z.literal('development'), z.literal('production'), z.literal('test')]).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  HOST: z.string().refine(
    (val) => val === '0.0.0.0' || val === 'localhost' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val),
    { message: 'HOST must be a valid IP address, localhost, or 0.0.0.0' }
  ).default('0.0.0.0'),
  
  // Logging configuration
  LOG_LEVEL: z.union([z.literal('error'), z.literal('warn'), z.literal('info'), z.literal('http'), z.literal('debug')]).default('info'),
  
  // Performance monitoring thresholds
  SLOW_REQUEST_THRESHOLD: z.coerce.number().int().min(100).max(30000).default(3000),
  CRITICAL_REQUEST_THRESHOLD: z.coerce.number().int().min(1000).max(60000).default(10000),
  MEMORY_THRESHOLD: z.coerce.number().int().min(1000000).max(1000000000).default(100000000),
  
  // URL configuration with proper validation
  FRONTEND_URL: z.string().url().default('http://localhost:5000'),
  BACKEND_URL: z.string().url().default('http://localhost:5000'),
  
  // Facebook/Instagram API version
  FACEBOOK_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default('v18.0'),
});

// Development environment schema - more permissive
const developmentEnvironmentSchema = baseEnvironmentSchema.extend({
  // Database - optional in development (uses in-memory storage)
  DATABASE_URL: z.string().url().optional(),
  
  // Session secret - can use default in development
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters').optional(),
  
  // AI Services - optional in development
  GEMINI_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().refine(
    (val) => !val || val.startsWith('sk-') || val.includes('your_') || val.includes('placeholder'),
    { message: 'OpenAI API key must start with "sk-" or be a placeholder' }
  ).optional(),
  
  // Image Services - optional in development
  PEXELS_API_KEY: z.string().min(10).optional(),
  PIXABAY_API_KEY: z.string().min(10).optional(),
  
  // Video Services - optional in development
  YOUTUBE_API_KEY: z.string().min(10).optional(),
  
  // Social Media - optional in development
  INSTAGRAM_CLIENT_ID: z.string().min(10).optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().min(10).optional(),
  REDIRECT_URI: z.string().url().default('http://localhost:5000/auth/instagram/callback'),
  
  // Ollama configuration - optional in development
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().min(1).default('llama3.2'),
  
  // Admin defaults - only for development
  DEFAULT_ADMIN_USERNAME: z.string().min(3).max(50).default('admin'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('admin123'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@marketmagic.com'),
});

// Production environment schema - strict requirements
const productionEnvironmentSchema = baseEnvironmentSchema.extend({
  // Database - required in production
  DATABASE_URL: z.string().url('Database URL is required in production'),
  
  // Session secret - required and strong in production
  SESSION_SECRET: z.string().min(64, 'Session secret must be at least 64 characters in production'),
  
  // AI Services - at least one required in production
  GEMINI_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().regex(/^sk-[A-Za-z0-9]{48}$/, 'Invalid OpenAI API key format').optional(),
  
  // Image Services - optional but validated if provided
  PEXELS_API_KEY: z.string().min(10).optional(),
  PIXABAY_API_KEY: z.string().min(10).optional(),
  
  // Video Services - optional but validated if provided
  YOUTUBE_API_KEY: z.string().min(10).optional(),
  
  // Social Media - required for Instagram features
  INSTAGRAM_CLIENT_ID: z.string().min(10, 'Instagram Client ID is required for social features'),
  INSTAGRAM_CLIENT_SECRET: z.string().min(10, 'Instagram Client Secret is required for social features'),
  REDIRECT_URI: z.string().url('Valid redirect URI is required'),
  
  // Ollama configuration - optional in production
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().min(1).default('llama3.2'),
  
  // Admin defaults - should not be used in production
  DEFAULT_ADMIN_USERNAME: z.string().optional(),
  DEFAULT_ADMIN_PASSWORD: z.string().optional(),
  DEFAULT_ADMIN_EMAIL: z.string().email().optional(),
}).refine(
  (data) => data.GEMINI_API_KEY || data.OPENAI_API_KEY,
  {
    message: 'At least one AI service API key (GEMINI_API_KEY or OPENAI_API_KEY) is required in production',
    path: ['GEMINI_API_KEY', 'OPENAI_API_KEY'],
  }
);

// Test environment schema - minimal requirements
const testEnvironmentSchema = baseEnvironmentSchema.extend({
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(16).default('test-session-secret-key'),
  
  // All external services optional in test
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  PIXABAY_API_KEY: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  REDIRECT_URI: z.string().url().default('http://localhost:5000/auth/instagram/callback'),
  
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama3.2'),
  
  DEFAULT_ADMIN_USERNAME: z.string().default('testadmin'),
  DEFAULT_ADMIN_PASSWORD: z.string().default('testpassword123'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('test@example.com'),
});

// Environment-specific schema selector
export function getEnvironmentSchema(nodeEnv: string) {
  switch (nodeEnv) {
    case NodeEnvironment.PRODUCTION:
      return productionEnvironmentSchema;
    case NodeEnvironment.TEST:
      return testEnvironmentSchema;
    case NodeEnvironment.DEVELOPMENT:
    default:
      return developmentEnvironmentSchema;
  }
}

// Type definitions
export type BaseEnvironment = z.infer<typeof baseEnvironmentSchema>;
export type DevelopmentEnvironment = z.infer<typeof developmentEnvironmentSchema>;
export type ProductionEnvironment = z.infer<typeof productionEnvironmentSchema>;
export type TestEnvironment = z.infer<typeof testEnvironmentSchema>;

export type ValidatedEnvironment = DevelopmentEnvironment | ProductionEnvironment | TestEnvironment;

// Environment validation error class
export class EnvironmentValidationError extends Error {
  constructor(
    public readonly issues: z.ZodIssue[],
    public readonly environment: string
  ) {
    const issueMessages = issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    
    super(`Environment validation failed for ${environment}:\n${issueMessages}`);
    this.name = 'EnvironmentValidationError';
  }
}

// Main validation function
export function validateEnvironment(env: Record<string, string | undefined> = process.env): ValidatedEnvironment {
  const nodeEnv = env.NODE_ENV || NodeEnvironment.DEVELOPMENT;
  const schema = getEnvironmentSchema(nodeEnv);
  
  const result = schema.safeParse(env);
  
  if (!result.success) {
    throw new EnvironmentValidationError(result.error.issues, nodeEnv);
  }
  
  return result.data;
}

// Environment validation with detailed error reporting
export function validateEnvironmentWithDetails(env: Record<string, string | undefined> = process.env): {
  success: boolean;
  data?: ValidatedEnvironment;
  error?: EnvironmentValidationError;
  warnings: string[];
} {
  const warnings: string[] = [];
  const nodeEnv = env.NODE_ENV || NodeEnvironment.DEVELOPMENT;
  
  // Add warnings for development environment
  if (nodeEnv === NodeEnvironment.DEVELOPMENT) {
    if (!env.SESSION_SECRET) {
      warnings.push('Using default session secret in development. Set SESSION_SECRET for better security.');
    }
    if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
      warnings.push('No AI service API keys configured. Some features may not work.');
    }
  }
  
  // Add warnings for production environment
  if (nodeEnv === NodeEnvironment.PRODUCTION) {
    if (env.DEFAULT_ADMIN_USERNAME || env.DEFAULT_ADMIN_PASSWORD) {
      warnings.push('Default admin credentials should not be used in production.');
    }
    if (env.SESSION_SECRET && env.SESSION_SECRET.length < 64) {
      warnings.push('Session secret should be at least 64 characters in production.');
    }
  }
  
  try {
    const data = validateEnvironment(env);
    return { success: true, data, warnings };
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      return { success: false, error, warnings };
    }
    throw error;
  }
}

// Utility function to check if environment is secure
export function isEnvironmentSecure(env: ValidatedEnvironment): boolean {
  if (env.NODE_ENV === NodeEnvironment.PRODUCTION) {
    return (
      env.SESSION_SECRET !== undefined &&
      env.SESSION_SECRET.length >= 64 &&
      !env.DEFAULT_ADMIN_PASSWORD &&
      (env.GEMINI_API_KEY || env.OPENAI_API_KEY) !== undefined
    );
  }
  
  return true; // Development and test environments are considered secure for their purposes
}

// Export schemas for testing
export {
  baseEnvironmentSchema,
  developmentEnvironmentSchema,
  productionEnvironmentSchema,
  testEnvironmentSchema,
};
