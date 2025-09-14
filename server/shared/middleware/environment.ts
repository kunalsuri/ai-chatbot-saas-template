/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from 'express';
import { config, validateConfiguration } from '../config/environment';
import logger from '../utils/logger';

/**
 * Environment validation middleware that runs on server startup
 * Ensures all required environment variables are properly configured
 */
export function environmentValidationMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = validateConfiguration();
    
    if (!validation.isValid) {
      logger.error('Environment validation failed', {
        errors: validation.errors,
        warnings: validation.warnings,
        environment: config.nodeEnv,
      });
      
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: config.isDevelopment 
          ? 'Environment validation failed. Check server logs for details.'
          : 'Server configuration error',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn('Environment validation warnings', {
        warnings: validation.warnings,
        environment: config.nodeEnv,
      });
    }
    
    next();
  };
}

/**
 * Feature availability middleware
 * Adds feature flags to request context for conditional functionality
 */
export function featureAvailabilityMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Add feature flags to request context
    (req as any).features = config.features;
    (req as any).config = {
      environment: config.nodeEnv,
      isDevelopment: config.isDevelopment,
      isProduction: config.isProduction,
    };
    
    next();
  };
}

/**
 * Security headers middleware based on environment
 */
export function environmentSecurityMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set security headers based on environment
    if (config.isProduction) {
      res.setHeader('X-Environment', 'production');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    } else if (config.isDevelopment) {
      res.setHeader('X-Environment', 'development');
      // More permissive headers for development
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    next();
  };
}

/**
 * Service availability check middleware
 * Validates that required external services are configured
 */
export function serviceAvailabilityMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path;
    const method = req.method;
    
    // Check AI service availability for AI-related endpoints
    if (path.includes('/api/chat') || path.includes('/api/translate') || path.includes('/api/improve-prompt')) {
      if (!config.features.aiChat) {
        logger.warn('AI service endpoint accessed without configured providers', {
          path,
          method,
          userAgent: req.get('User-Agent'),
        });
        
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'AI services are not configured. Please configure GEMINI_API_KEY or OPENAI_API_KEY.',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }
    
    // Check image service availability for image-related endpoints
    if (path.includes('/api/images')) {
      if (!config.features.imageSearch) {
        logger.warn('Image service endpoint accessed without configured providers', {
          path,
          method,
          userAgent: req.get('User-Agent'),
        });
        
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'Image services are not configured. Please configure PEXELS_API_KEY or PIXABAY_API_KEY.',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }
    
    // Check social auth availability for auth endpoints
    if (path.includes('/auth/instagram')) {
      if (!config.features.socialAuth) {
        logger.warn('Social auth endpoint accessed without configured providers', {
          path,
          method,
          userAgent: req.get('User-Agent'),
        });
        
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'Social authentication is not configured. Please configure INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET.',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }
    
    next();
  };
}

/**
 * Environment health check endpoint
 */
export function createHealthCheckHandler() {
  return (req: Request, res: Response): void => {
    const validation = validateConfiguration();
    const health = {
      status: validation.isValid ? 'healthy' : 'unhealthy',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      features: config.features,
      services: {
        database: config.database.isConfigured,
        ai: config.ai.hasAnyProvider,
        images: config.images.hasAnyProvider,
        video: config.video.youtube.isConfigured,
        social: config.social.instagram.isConfigured,
        ollama: config.ollama.isConfigured,
      },
      security: {
        isSecure: config.security.isSecure,
        hasStrongSecret: config.security.hasStrongSessionSecret,
      },
      warnings: validation.warnings,
      ...(config.isDevelopment && {
        errors: validation.errors,
        configuration: {
          port: config.port,
          host: config.host,
          logLevel: config.logLevel,
        },
      }),
    };
    
    const statusCode = validation.isValid ? 200 : 503;
    res.status(statusCode).json(health);
  };
}
