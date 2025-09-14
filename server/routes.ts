/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import path from 'path';
import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';

// Feature imports
import authRoutes from './features/auth/routes/auth';
import { initializeSession, checkSessionStatus } from './features/auth/routes/auth-session';
import chatRoutes from './features/chat/routes/chat';
import translationRoutes from './features/translation/routes/translation';
import { userManagementRoutes } from './features/user-management/routes/user-management';
import userActivityRoutes from './features/user-activity/routes/user-activity';
import { userProfileRoutes } from './features/user-management/routes/user-profile';
import { registerSummaryRoutes } from './features/content/routes/summary';
import promptImproverRoutes from './features/prompt-improver/routes/prompt-improver';
import externalAIRoutes from './features/model-management/routes/external-ai';
import externalModelMgmtRoutes from './features/model-management/routes/external-model-mgmt';
import modelManagementRoutes from './features/model-management/routes/model-management';
import ollamaRoutes from './features/model-management/routes/ollama';
import lmstudioRoutes from './features/model-management/routes/lmstudio';
import { getExampleTemplates } from './features/content/routes/example-templates';

// Shared infrastructure imports
import { config } from './shared/config/environment';
import { initializeAuthSystem, ensureSessionInit, autoLoginDev } from './shared/middleware/session-init';
import { addCsrfToken } from './shared/middleware/csrf';

const MemoryStoreSession = MemoryStore(session);

export function registerRoutes(app: Express): Server {
  // Session configuration
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize authentication system
  initializeAuthSystem();

  // Session initialization middleware
  app.use(ensureSessionInit);

  // Auto-login for development
  if (config.nodeEnv === 'development') {
    app.use(autoLoginDev);
  }

  // Add CSRF token to all responses
  app.use(addCsrfToken);

  // Serve static files from dist/public
  const clientDistPath = path.join(process.cwd(), 'dist', 'public');
  app.use(express.static(clientDistPath));

  // Feature-based route mounting
  app.post("/api/session/init", initializeSession);
  app.get("/api/session/status", checkSessionStatus);
  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/translate", translationRoutes);
  app.use("/api/users", userManagementRoutes);
  app.use("/api/user-activity", userActivityRoutes);
  app.use("/api/user-profile", userProfileRoutes);
  app.use("/api/external-ai", externalAIRoutes);
  app.use("/api/external-model-mgmt", externalModelMgmtRoutes);
  app.use("/api/model-management", modelManagementRoutes);
  app.use("/api/ollama", ollamaRoutes);
  app.use("/api/lmstudio", lmstudioRoutes);

  // Register summary routes
  registerSummaryRoutes(app);

  // Register prompt improver routes
  app.use("/api/prompt-improver", promptImproverRoutes);

  // Example templates
  app.get("/api/example-templates", getExampleTemplates);

  // Catch-all handler for client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath);
  });

  const httpServer = createServer(app);
  return httpServer;
}