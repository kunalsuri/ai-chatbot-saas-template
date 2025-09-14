/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';

// Client-side environment validation schema
const clientEnvironmentSchema = z.object({
  // Vite environment variables (must be prefixed with VITE_)
  VITE_API_BASE_URL: z.string().url().default('http://localhost:5000'),
  VITE_APP_NAME: z.string().min(1).default('AI ChatBot SaaS'),
  VITE_APP_VERSION: z.string().min(1).default('1.0.0'),
  VITE_ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
  
  // Feature flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_MOCK_DATA: z.string().transform(val => val === 'true').default('false'),
  
  // External service configurations (public keys only)
  VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  
  // Development settings
  VITE_DEV_TOOLS: z.string().transform(val => val === 'true').default('false'),
  VITE_HOT_RELOAD: z.string().transform(val => val === 'true').default('true'),
});

// Environment validation error class
export class ClientEnvironmentValidationError extends Error {
  constructor(
    public readonly issues: z.ZodIssue[],
    public readonly environment: string
  ) {
    const issueMessages = issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    
    super(`Client environment validation failed for ${environment}:\n${issueMessages}`);
    this.name = 'ClientEnvironmentValidationError';
  }
}

// Validate client environment
function validateClientEnvironment() {
  const env = import.meta.env;
  const result = clientEnvironmentSchema.safeParse(env);
  
  if (!result.success) {
    throw new ClientEnvironmentValidationError(result.error.issues, env.VITE_ENVIRONMENT || 'development');
  }
  
  return result.data;
}

// Validated environment configuration
let validatedEnv: z.infer<typeof clientEnvironmentSchema>;

try {
  validatedEnv = validateClientEnvironment();
  
  if (validatedEnv.VITE_ENABLE_DEBUG) {
    console.log('✅ Client environment validated successfully:', {
      environment: validatedEnv.VITE_ENVIRONMENT,
      apiBaseUrl: validatedEnv.VITE_API_BASE_URL,
      appName: validatedEnv.VITE_APP_NAME,
      features: {
        analytics: validatedEnv.VITE_ENABLE_ANALYTICS,
        debug: validatedEnv.VITE_ENABLE_DEBUG,
        mockData: validatedEnv.VITE_ENABLE_MOCK_DATA,
      },
    });
  }
} catch (error) {
  console.error('❌ Client environment validation failed:', error);
  // In production, we might want to show a user-friendly error page
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem; border-radius: 8px; background: #fee; border: 1px solid #fcc;">
          <h1 style="color: #c33; margin-bottom: 1rem;">Configuration Error</h1>
          <p style="color: #666;">The application is not properly configured. Please contact support.</p>
        </div>
      </div>
    `;
    throw error;
  }
  // In development, show detailed error
  throw error;
}

// Type-safe client configuration
export const clientConfig = {
  // API configuration
  api: {
    baseUrl: validatedEnv.VITE_API_BASE_URL,
    timeout: 30000, // 30 seconds
  },
  
  // Application metadata
  app: {
    name: validatedEnv.VITE_APP_NAME,
    version: validatedEnv.VITE_APP_VERSION,
    environment: validatedEnv.VITE_ENVIRONMENT,
    isDevelopment: validatedEnv.VITE_ENVIRONMENT === 'development',
    isProduction: validatedEnv.VITE_ENVIRONMENT === 'production',
    isTest: validatedEnv.VITE_ENVIRONMENT === 'test',
  },
  
  // Feature flags
  features: {
    analytics: validatedEnv.VITE_ENABLE_ANALYTICS,
    debug: validatedEnv.VITE_ENABLE_DEBUG,
    mockData: validatedEnv.VITE_ENABLE_MOCK_DATA,
    devTools: validatedEnv.VITE_DEV_TOOLS,
    hotReload: validatedEnv.VITE_HOT_RELOAD,
  },
  
  // External services
  services: {
    googleAnalytics: {
      id: validatedEnv.VITE_GOOGLE_ANALYTICS_ID,
      enabled: Boolean(validatedEnv.VITE_GOOGLE_ANALYTICS_ID),
    },
    sentry: {
      dsn: validatedEnv.VITE_SENTRY_DSN,
      enabled: Boolean(validatedEnv.VITE_SENTRY_DSN),
    },
  },
  
  // Development settings
  development: {
    enableDevTools: validatedEnv.VITE_DEV_TOOLS && validatedEnv.VITE_ENVIRONMENT === 'development',
    enableHotReload: validatedEnv.VITE_HOT_RELOAD && validatedEnv.VITE_ENVIRONMENT === 'development',
    showDebugInfo: validatedEnv.VITE_ENABLE_DEBUG,
  },
} as const;

// Utility functions
export function isFeatureEnabled(feature: keyof typeof clientConfig.features): boolean {
  return clientConfig.features[feature];
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = clientConfig.api.baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
}

export function isDevelopment(): boolean {
  return clientConfig.app.isDevelopment;
}

export function isProduction(): boolean {
  return clientConfig.app.isProduction;
}

// Export types
export type ClientConfig = typeof clientConfig;
export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;

// Export validated environment for direct access if needed
export { validatedEnv as clientEnv };
