/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import dotenv from 'dotenv';
import { validateEnvironmentWithDetails, ValidatedEnvironment, EnvironmentValidationError } from '@shared/env-validation';
import logger from '../utils/logger';
import crypto from 'crypto';

// Load environment variables early
if (process.env.NODE_ENV === 'development' || !process.env.REPL_SLUG) {
  dotenv.config();
}

// Validate environment and create typed configuration
let validatedEnv: ValidatedEnvironment;
let environmentWarnings: string[] = [];

try {
  const validation = validateEnvironmentWithDetails(process.env);
  
  if (!validation.success) {
    console.error('❌ Environment validation failed:');
    console.error(validation.error?.message);
    process.exit(1);
  }
  
  validatedEnv = validation.data!;
  environmentWarnings = validation.warnings;
  
  // Log warnings if any
  if (environmentWarnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    environmentWarnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`✅ Environment validated successfully for ${validatedEnv.NODE_ENV}`);
  
} catch (error) {
  console.error('❌ Critical environment validation error:', error);
  process.exit(1);
}

// Type-safe configuration object with computed values
export const config = {
  // Core application settings
  nodeEnv: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  host: validatedEnv.HOST,
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isProduction: validatedEnv.NODE_ENV === 'production',
  isTest: validatedEnv.NODE_ENV === 'test',
  
  // Logging configuration
  logLevel: validatedEnv.LOG_LEVEL,
  
  // Performance monitoring
  performance: {
    slowRequestThreshold: validatedEnv.SLOW_REQUEST_THRESHOLD,
    criticalRequestThreshold: validatedEnv.CRITICAL_REQUEST_THRESHOLD,
    memoryThreshold: validatedEnv.MEMORY_THRESHOLD,
  },
  
  // Database configuration
  database: {
    url: validatedEnv.DATABASE_URL,
    isConfigured: Boolean(validatedEnv.DATABASE_URL),
  },
  
  // Session configuration
  session: {
    secret: validatedEnv.SESSION_SECRET || generateSecureSecret(),
    isSecure: validatedEnv.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // URL configuration
  urls: {
    frontend: validatedEnv.FRONTEND_URL,
    backend: validatedEnv.BACKEND_URL,
    redirect: validatedEnv.REDIRECT_URI,
  },
  
  // AI Services configuration
  ai: {
    gemini: {
      apiKey: validatedEnv.GEMINI_API_KEY,
      isConfigured: Boolean(validatedEnv.GEMINI_API_KEY),
    },
    openai: {
      apiKey: validatedEnv.OPENAI_API_KEY,
      isConfigured: Boolean(validatedEnv.OPENAI_API_KEY),
    },
    hasAnyProvider: Boolean(validatedEnv.GEMINI_API_KEY || validatedEnv.OPENAI_API_KEY),
  },
  
  // Image services configuration
  images: {
    pexels: {
      apiKey: validatedEnv.PEXELS_API_KEY,
      isConfigured: Boolean(validatedEnv.PEXELS_API_KEY),
    },
    pixabay: {
      apiKey: validatedEnv.PIXABAY_API_KEY,
      isConfigured: Boolean(validatedEnv.PIXABAY_API_KEY),
    },
    hasAnyProvider: Boolean(validatedEnv.PEXELS_API_KEY || validatedEnv.PIXABAY_API_KEY),
  },
  
  // Video services configuration
  video: {
    youtube: {
      apiKey: validatedEnv.YOUTUBE_API_KEY,
      isConfigured: Boolean(validatedEnv.YOUTUBE_API_KEY),
    },
  },
  
  // Social media configuration
  social: {
    instagram: {
      clientId: validatedEnv.INSTAGRAM_CLIENT_ID,
      clientSecret: validatedEnv.INSTAGRAM_CLIENT_SECRET,
      isConfigured: Boolean(validatedEnv.INSTAGRAM_CLIENT_ID && validatedEnv.INSTAGRAM_CLIENT_SECRET),
    },
    facebook: {
      apiVersion: validatedEnv.FACEBOOK_API_VERSION,
    },
  },
  
  // Ollama configuration
  ollama: {
    baseUrl: validatedEnv.OLLAMA_BASE_URL,
    model: validatedEnv.OLLAMA_MODEL,
    isConfigured: true, // Always has defaults
  },
  
  // LM Studio configuration
  lmstudio: {
    baseUrl: 'http://localhost:1234', // Default LM Studio port
    isConfigured: true,
  },
  
  // Admin configuration (development only)
  admin: {
    defaultUsername: validatedEnv.DEFAULT_ADMIN_USERNAME,
    defaultPassword: validatedEnv.DEFAULT_ADMIN_PASSWORD,
    defaultEmail: validatedEnv.DEFAULT_ADMIN_EMAIL,
    hasDefaults: Boolean(
      validatedEnv.DEFAULT_ADMIN_USERNAME && 
      validatedEnv.DEFAULT_ADMIN_PASSWORD && 
      validatedEnv.DEFAULT_ADMIN_EMAIL
    ),
  },
  
  // Security configuration
  security: {
    isSecure: validatedEnv.NODE_ENV === 'production',
    sessionSecretLength: validatedEnv.SESSION_SECRET?.length || 0,
    hasStrongSessionSecret: (validatedEnv.SESSION_SECRET?.length || 0) >= 64,
    shouldUseDefaults: validatedEnv.NODE_ENV === 'development',
  },
  
  // Feature flags based on configuration
  features: {
    aiChat: Boolean(validatedEnv.GEMINI_API_KEY || validatedEnv.OPENAI_API_KEY),
    imageSearch: Boolean(validatedEnv.PEXELS_API_KEY || validatedEnv.PIXABAY_API_KEY),
    videoSearch: Boolean(validatedEnv.YOUTUBE_API_KEY),
    socialAuth: Boolean(validatedEnv.INSTAGRAM_CLIENT_ID && validatedEnv.INSTAGRAM_CLIENT_SECRET),
    ollamaIntegration: true, // Always available with defaults
  },
} as const;

// Generate a secure session secret if none provided (development only)
function generateSecureSecret(): string {
  if (validatedEnv.NODE_ENV === 'production') {
    throw new Error('Session secret must be provided in production environment');
  }
  
  
  const secret = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  Generated temporary session secret for development. Set SESSION_SECRET environment variable.');
  return secret;
}

// Configuration validation function
export function validateConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [...environmentWarnings];
  
  // Production-specific validations
  if (config.isProduction) {
    if (!config.security.hasStrongSessionSecret) {
      errors.push('Production environment requires a session secret of at least 64 characters');
    }
    
    if (!config.ai.hasAnyProvider) {
      errors.push('Production environment requires at least one AI service provider');
    }
    
    if (config.admin.hasDefaults) {
      warnings.push('Default admin credentials should not be used in production');
    }
    
    if (!config.database.isConfigured) {
      errors.push('Production environment requires database configuration');
    }
  }
  
  // Development-specific warnings
  if (config.isDevelopment) {
    if (!config.ai.hasAnyProvider) {
      warnings.push('No AI service providers configured - some features will be unavailable');
    }
    
    if (!config.images.hasAnyProvider) {
      warnings.push('No image service providers configured - image search will be unavailable');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Export the validated environment for direct access if needed
export { validatedEnv };

// Export types
export type AppConfig = typeof config;
export type ConfigValidation = ReturnType<typeof validateConfiguration>;

// Log configuration summary on successful load
setTimeout(() => {
  if (logger) {
    logger.info('Configuration loaded', {
      environment: config.nodeEnv,
      features: config.features,
      security: {
        isSecure: config.security.isSecure,
        hasStrongSecret: config.security.hasStrongSessionSecret,
      },
    });
  }
}, 100); // Delay to ensure logger is initialized
