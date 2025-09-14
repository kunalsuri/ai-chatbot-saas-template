/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { z } from 'zod';
import { createEnhancementPrompt, cleanEnhancedPrompt } from '../services/promptEnhancement';
import { generateChatResponse } from '../../chat/services/chat';
import { validateBody } from '../../../shared/middleware/validation';
import { requireAuth } from '../../../shared/middleware/auth';
import { csrfProtection } from '../../../shared/middleware/csrf';
import { asyncHandler } from '../../../shared/middleware/errorHandler';
import { ExternalServiceError } from '../../../shared/utils/errors';
import { promptImprovementSchema } from '@shared/validation';
import { getPromptHistory, getPromptById, savePromptImprovement, deletePromptImprovement } from './prompt-improver-history';

const router = Router();

// Prompt improvement endpoint
router.post("/improve", 
  validateBody(promptImprovementSchema),
  requireAuth,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { prompt, context, style, model } = req.body;
    
    try {
      const enhancementPrompt = createEnhancementPrompt(prompt, { format: 'text' });
      const improvedPrompt = await generateChatResponse(enhancementPrompt, [], model || 'llama3.2');

      if (!improvedPrompt) {
        throw new ExternalServiceError('Failed to generate improved prompt', 'prompt-improver');
      }

      const cleanedPrompt = cleanEnhancedPrompt(improvedPrompt);

      res.json({
        success: true,
        data: {
          originalPrompt: prompt,
          improvedPrompt: cleanedPrompt,
          metadata: {
            model: model || 'llama3.2',
            style: style || 'professional'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      throw new ExternalServiceError(
        error instanceof Error ? error.message : 'Failed to improve prompt',
        'prompt-improver'
      );
    }
  })
);

// History endpoints
router.get("/history", requireAuth, getPromptHistory);
router.get("/history/:id", requireAuth, getPromptById);
router.post("/history", requireAuth, csrfProtection, savePromptImprovement);
router.delete("/history/:id", requireAuth, csrfProtection, deletePromptImprovement);

export default router;
