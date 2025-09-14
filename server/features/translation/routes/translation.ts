/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { TranslationService } from '../services/translation';
import { getTranslationHistory, getTranslationById, saveTranslation, deleteTranslation } from './translation-history';
import { validateBody } from '../../../shared/middleware/validation';
import { requireAuth } from '../../../shared/middleware/auth';
import { csrfProtection } from '../../../shared/middleware/csrf';
import { asyncHandler } from '../../../shared/middleware/errorHandler';
import { translationSchema } from '@shared/validation';

const router = Router();
const translationService = new TranslationService();

router.post("/", 
  validateBody(translationSchema),
  requireAuth,
  csrfProtection,
  asyncHandler(async (req, res) => {
    const { text, targetLang, sourceLang, isCasual, model } = req.body;
    
    const result = await translationService.translate({
      text,
      targetLang: targetLang,
      sourceLang: sourceLang,
      isCasual: isCasual ?? true,
      model: model || 'llama3.2'
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  })
);

router.get("/languages", requireAuth, asyncHandler(async (req, res) => {
  const languages = await translationService.getSupportedLanguages();
  res.json({ 
    success: true,
    data: { languages },
    timestamp: new Date().toISOString()
  });
}));

// Translation History endpoints
router.get("/history", requireAuth, getTranslationHistory);
router.get("/history/:id", requireAuth, getTranslationById);
router.post("/history", requireAuth, csrfProtection, saveTranslation);
router.delete("/history/:id", requireAuth, csrfProtection, deleteTranslation);

export default router;
