/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { nanoid } from 'nanoid';
import { log, LogContext, LogType, SecuritySeverity } from '../utils/logger';
import { config } from '../../config';
import { AuthenticatedRequest } from '../types/express.d';
import * as fs from 'fs';
import * as path from 'path';

// Request context storage for correlation
const requestContext = new AsyncLocalStorage<LogContext>();

// Helper function to determine if request should be logged
function shouldLogRequest(req: Request): boolean {
  const path = req.path;
  
  // In development, filter out static file requests to reduce noise
  if (config.isDevelopment) {
    // Skip logging for static assets
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    if (staticExtensions.some(ext => path.endsWith(ext))) {
      return false;
    }
    
    // Skip logging for common static paths
    const staticPaths = ['/assets/', '/favicon.svg', '/manifest.json'];
    if (staticPaths.some(staticPath => path.startsWith(staticPath))) {
      return false;
    }
  }
  
  return true;
}

// Request logging middleware with enhanced typing
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = nanoid();
  const shouldLog = shouldLogRequest(req);
  
  // Extract request context with proper typing
  const context: LogContext = {
    requestId,
    userId: (req as AuthenticatedRequest).user?.id as string | undefined,
    sessionId: req.sessionID,
    userAgent: req.get('User-Agent') || undefined,
    ip: req.ip || req.connection.remoteAddress || undefined
  };

  // Run the request within the context
  requestContext.run(context, () => {
    // Only log API requests and important requests
    if (shouldLog && req.path.startsWith('/api/')) {
      log.http('API Request', {
        method: req.method,
        path: req.path,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        type: LogType.REQUEST_START
      });
    }

    // Override res.end to log response with proper typing
    const originalEnd = res.end;
    res.end = function(chunk?: unknown, encoding?: BufferEncoding | (() => void), cb?: () => void): Response {
      const duration = Date.now() - startTime;
      
      // Only log API requests or errors
      if (shouldLog && (req.path.startsWith('/api/') || res.statusCode >= 400)) {
        // Log API request completion (single log entry)
        log.apiRequest(req.method, req.path, res.statusCode, duration, context.userId);
      }

      // Call original end method with proper return type
      return originalEnd.call(this, chunk, encoding as BufferEncoding, cb) as Response;
    };

    next();
  });
};

// Error logging middleware with enhanced typing
export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const context = requestContext.getStore();
  
  log.error('Request Error', err, {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    requestId: context?.requestId,
    userId: context?.userId,
    success: false,
    retryable: err.name !== 'ValidationError' && err.name !== 'AuthenticationError',
    type: LogType.REQUEST_ERROR
  });

  next(err);
};

// Load performance configuration
let performanceConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'server/config/performance.json');
  if (fs.existsSync(configPath)) {
    performanceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.warn(`Performance config not found at: ${configPath}`);
  }
} catch (error) {
  console.warn('Failed to load performance config, using defaults');
}

// Get endpoint-specific threshold
function getThresholdForEndpoint(path: string, defaultThreshold: number): number {
  const endpointThresholds = performanceConfig.endpointSpecificThresholds || {};
  
  // Check for exact match first
  if (endpointThresholds[path]) {
    return endpointThresholds[path];
  }
  
  // Check for prefix matches
  for (const [endpoint, threshold] of Object.entries(endpointThresholds)) {
    if (path.startsWith(endpoint)) {
      return threshold as number;
    }
  }
  
  // Check if it's an AI-related endpoint
  const aiEndpoints = ['/api/chat/', '/api/ollama/', '/api/lmstudio/', '/api/prompt-improver', '/api/translate'];
  if (aiEndpoints.some(endpoint => path.startsWith(endpoint))) {
    const envConfig = performanceConfig[config.nodeEnv] || {};
    return envConfig.aiOperationThreshold || defaultThreshold * 3;
  }
  
  return defaultThreshold;
}

// Performance monitoring middleware with enhanced metrics
export const performanceLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Get environment-specific and endpoint-specific thresholds
    const envConfig = performanceConfig[config.nodeEnv] || {};
    const baseSlowThreshold = envConfig.slowRequestThreshold || config.performance.slowRequestThreshold;
    const baseCriticalThreshold = envConfig.criticalRequestThreshold || config.performance.criticalRequestThreshold;
    
    const slowThreshold = getThresholdForEndpoint(req.path, baseSlowThreshold);
    const criticalThreshold = getThresholdForEndpoint(req.path, baseCriticalThreshold);
    
    if (duration > criticalThreshold) {
      log.error('Critical Performance Issue', undefined, {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode,
        threshold: criticalThreshold,
        severity: SecuritySeverity.CRITICAL,
        type: LogType.PERFORMANCE_WARNING
      });
    } else if (duration > slowThreshold) {
      // Only log if it's significantly over threshold to reduce noise
      const significantThreshold = slowThreshold * 1.5;
      if (duration > significantThreshold) {
        log.warn('Slow Request Detected', {
          method: req.method,
          path: req.path,
          duration,
          statusCode: res.statusCode,
          threshold: slowThreshold,
          severity: duration > slowThreshold * 2 ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM,
          type: LogType.PERFORMANCE_WARNING
        });
      }
    }
  });
  
  next();
};

// Request correlation middleware for distributed tracing
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = req.get('x-trace-id') || nanoid();
  const spanId = nanoid();
  
  // Set correlation headers for downstream services
  res.set('x-trace-id', traceId);
  res.set('x-span-id', spanId);
  
  // Add to request context
  const existingContext = requestContext.getStore() || {};
  const enhancedContext: LogContext = {
    ...existingContext,
    traceId,
    spanId
  };
  
  requestContext.run(enhancedContext, () => {
    next();
  });
};

// Memory usage monitoring middleware
export const memoryLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const memoryBefore = process.memoryUsage();
  
  res.on('finish', () => {
    const memoryAfter = process.memoryUsage();
    const memoryDelta = {
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      external: memoryAfter.external - memoryBefore.external
    };
    
    // Log significant memory increases
    const memoryThreshold = config.performance.memoryThreshold; // 50MB
    if (memoryDelta.heapUsed > memoryThreshold) {
      log.warn('High Memory Usage Detected', {
        method: req.method,
        path: req.path,
        memoryDelta,
        memoryAfter,
        type: LogType.PERFORMANCE_WARNING
      });
    }
  });
  
  next();
};
