/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// AI agents: See /AI-PROJECT-MANIFEST.md for complete project context
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, logMessage } from "./vite";
import { globalErrorHandler, notFoundHandler, requestIdMiddleware } from "./shared/middleware/errorHandler";
import { requestLoggingMiddleware, performanceLoggingMiddleware } from "./shared/middleware/logging";
import { environmentValidationMiddleware, featureAvailabilityMiddleware, environmentSecurityMiddleware, serviceAvailabilityMiddleware, createHealthCheckHandler } from "./shared/middleware/environment";
import { log as logger } from "./shared/utils/logger";
import { config, validateConfiguration } from "./shared/config/environment";

const app = express();

// Validate environment configuration on startup
const configValidation = validateConfiguration();
if (!configValidation.isValid) {
  console.error('❌ Server configuration validation failed:');
  configValidation.errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

if (configValidation.warnings.length > 0) {
  console.warn('⚠️  Server configuration warnings:');
  configValidation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

// Add environment security headers
app.use(environmentSecurityMiddleware());

// Add request ID middleware for error tracking
app.use(requestIdMiddleware);

// Add feature availability context
app.use(featureAvailabilityMiddleware());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add structured logging middleware
app.use(requestLoggingMiddleware);
app.use(performanceLoggingMiddleware);

// Add service availability checks
app.use(serviceAvailabilityMiddleware());

// Health check endpoint
app.get('/health', createHealthCheckHandler());

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use(globalErrorHandler);
  
  // 404 handler
  app.use(notFoundHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Use validated configuration.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = config.port;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server started successfully`, { port, host: config.host, environment: config.nodeEnv });
    logMessage(`serving on port ${port}`);
  });
})();
