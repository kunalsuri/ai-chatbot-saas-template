/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response } from 'express';
import translationHistoryService from '../services/translationHistory';
import { GenericError } from '@shared/types/api';
import { asyncHandler, sendSuccessResponse } from '../../../shared/middleware/errorHandler';
import { createValidationError, createExternalServiceError, createNotFoundError } from '../../../shared/utils/errors';

// GET /api/translate/history - Get translation history
export const getTranslationHistory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.user?.id;
    const history = translationHistoryService.getHistory(userId);
    sendSuccessResponse(res, history);
  } catch (error: unknown) {
    const typedError = error as GenericError;
    throw createExternalServiceError(typedError.message || 'Failed to get translation history', 'translation_history');
  }
});

// GET /api/translate/history/:id - Get specific translation
export const getTranslationById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.session as any)?.user?.id;
    const translation = translationHistoryService.getTranslationById(id);
    
    if (!translation || (userId && translation.userId !== userId)) {
      throw createNotFoundError('Translation not found');
    }
    
    sendSuccessResponse(res, translation);
  } catch (error: unknown) {
    if ((error as any).name === 'NotFoundError') {
      throw error;
    }
    const typedError = error as GenericError;
    throw createExternalServiceError(typedError.message || 'Failed to get translation', 'translation_history');
  }
});

// DELETE /api/translate/history/:id - Delete translation from history
export const deleteTranslation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.session as any)?.user?.id;
    const success = translationHistoryService.deleteTranslation(id, userId);
    
    if (!success) {
      throw createNotFoundError('Translation not found or you do not have permission to delete it');
    }
    
    sendSuccessResponse(res, { success: true });
  } catch (error: unknown) {
    if ((error as any).name === 'NotFoundError') {
      throw error;
    }
    const typedError = error as GenericError;
    throw createExternalServiceError(typedError.message || 'Failed to delete translation', 'translation_history');
  }
});

// POST /api/translate/history - Save translation to history
export const saveTranslation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { original, translated, sourceLang, targetLang, model, tokens } = req.body;
    const userId = (req.session as any)?.user?.id;
    
    if (!original || !translated || !sourceLang || !targetLang) {
      throw createValidationError('Missing required parameters: original, translated, sourceLang, targetLang');
    }
    
    // Force reload history to get latest state
    translationHistoryService.loadHistory();
    
    // Check for duplicates before saving
    const normalizedOriginal = original.trim();
    const normalizedTranslated = translated.trim();
    
    // Get all translations to check for duplicates
    const allTranslations = translationHistoryService.getHistory();
    const existingTranslation = allTranslations.find(item => 
      item.original.trim() === normalizedOriginal && 
      item.translated.trim() === normalizedTranslated && 
      item.sourceLang === sourceLang && 
      item.targetLang === targetLang
    );
    
    if (existingTranslation) {
      console.log('Duplicate translation found, returning existing one');
      return sendSuccessResponse(res, existingTranslation);
    }
    
    // No duplicate found, create new translation
    const newTranslation = translationHistoryService.addTranslation({
      original,
      translated,
      sourceLang,
      targetLang,
      model,
      tokens,
      userId
    });
    
    sendSuccessResponse(res, newTranslation);
  } catch (error: unknown) {
    const typedError = error as GenericError;
    throw createExternalServiceError(typedError.message || 'Failed to save translation', 'translation_history');
  }
});
