/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../../storage';
import { generateChatResponse, generateLMStudioResponse } from '../services/chat';
import { validateBody, validateParams } from '../../../shared/middleware/validation';
import { requireAuth } from '../../../shared/middleware/auth';
import { csrfProtection } from '../../../shared/middleware/csrf';
import { asyncHandler } from '../../../shared/middleware/errorHandler';
import { ValidationError } from '../../../shared/utils/errors';
import { chatMessageSchema, chatSessionSchema, chatSessionIdSchema } from '@shared/validation';

const router = Router();

// Chat API endpoints
router.get("/history", requireAuth, asyncHandler(async (req, res) => {
  const chatHistory = await storage.getChatHistory();
  res.json({
    success: true,
    data: chatHistory,
    timestamp: new Date().toISOString()
  });
}));

router.post("/save", 
  validateBody(chatSessionSchema),
  requireAuth,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const chatSession = req.body;
    await storage.saveChatSession(chatSession);
    res.json({ 
      success: true,
      timestamp: new Date().toISOString()
    });
  })
);

router.delete("/history/:sessionId", 
  validateParams(z.object({ sessionId: chatSessionIdSchema })),
  requireAuth,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    await storage.deleteChatSession(sessionId);
    res.json({ 
      success: true,
      timestamp: new Date().toISOString()
    });
  })
);

router.post("/message", 
  validateBody(chatMessageSchema),
  requireAuth,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { message, provider, model, context } = req.body;
    let response: string;

    if (provider === 'ollama') {
      response = await generateChatResponse(message, context || [], model);
    } else if (provider === 'lmstudio') {
      response = await generateLMStudioResponse(message, context || [], model);
    } else {
      throw new ValidationError('Invalid AI provider');
    }

    res.json({ 
      success: true,
      data: { response },
      timestamp: new Date().toISOString()
    });
  })
);

export default router;
