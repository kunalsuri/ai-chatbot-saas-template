/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../../storage';
import { hashPassword, verifyPassword } from '../services/password';
import { validateBody } from '../../../shared/middleware/validation';
import { requireAuth, getCurrentUser, authRateLimit, clearAuthAttempts, ensureSessionCleanup } from '../../../shared/middleware/auth';
import { csrfProtection, addCsrfToken } from '../../../shared/middleware/csrf';
import { asyncHandler, sendSuccessResponse } from '../../../shared/middleware/errorHandler';
import { log } from '../../../shared/utils/logger';
import { AuthenticationError, ValidationError } from '../../../shared/utils/errors';
import { loginSchema, signupSchema } from '@shared/validation';
import { UserWithProfile } from '../types/api';

const router = Router();

// Authentication routes
router.post("/login", 
  authRateLimit,
  validateBody(loginSchema),
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await storage.authenticateUser(username, password);

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Set session
    req.session.userId = user.id;

    // Clear rate limiting on successful login
    clearAuthAttempts(req.ip || 'unknown');

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan
      },
      timestamp: new Date().toISOString()
    });
    
    log.authEvent('login_success', user.id, { username: user.username, ip: req.ip });
  })
);

router.post("/signup", 
  authRateLimit,
  validateBody(signupSchema),
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await storage.createUser({
      username,
      email,
      password: hashedPassword
    });

    // Set session
    req.session.userId = newUser.id;

    // Clear rate limiting on successful signup
    clearAuthAttempts(req.ip || 'unknown');

    res.json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        plan: newUser.plan
      },
      timestamp: new Date().toISOString()
    });
    
    log.authEvent('signup_success', newUser.id, { username: newUser.username, email: newUser.email, ip: req.ip });
  })
);

router.post("/logout", 
  ensureSessionCleanup,
  csrfProtection,
  (req, res) => {
    const userId = req.session?.userId;
    req.session.destroy(() => {
      res.json({ 
        success: true,
        timestamp: new Date().toISOString()
      });
    });
    
    if (userId) {
      log.authEvent('logout_success', userId, { ip: req.ip });
    }
  }
);

router.get("/me", asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: (user as UserWithProfile).name || user.username,
      role: user.role,
      avatar: (user as UserWithProfile).avatar || null,
      plan: user.plan
    },
    timestamp: new Date().toISOString()
  });
}));

// CSRF token endpoint
router.get("/csrf-token", (req, res) => {
  res.json({
    success: true,
    data: {
      csrfToken: req.csrfToken!()
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
