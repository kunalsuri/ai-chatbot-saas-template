/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';
import { createValidationError } from '../../../shared/utils/errors.js';
import { log } from '../../../shared/utils/logger.js';
import { callOllama } from '../../model-management/services/ollama';
import { TranslationRequest, TranslationResult } from '../types/api';

export interface TranslationResponse {
  translation: string;
  tokens: number;
  model: string;
  sourceLang: string;
  targetLang: string;
}

// Language mapping constant to avoid recreation
const LANGUAGE_MAP: { [key: string]: string } = {
  'fr': 'French',
  'en': 'English',
  'es': 'Spanish',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
};

// Translation cache for performance
const translationCache = new Map<string, { result: TranslationResponse; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour
const pendingRequests = new Map<string, Promise<TranslationResponse>>();

export class TranslationService {

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, sourceLang, targetLang, model, isCasual } = request;

    // Create cache key
    const cacheKey = `${text}:${sourceLang}:${targetLang}:${model}:${isCasual}`;
    
    // Check cache first
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      log.info('Translation cache hit', { sourceLang, targetLang, model });
      return cached.result;
    }

    // Check if there's already a pending request for the same translation
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      log.info('Translation request already pending, waiting for result', { sourceLang, targetLang, model });
      return pending;
    }

    // Create the translation promise
    const translationPromise = this.performTranslation(request);
    
    // Store the promise to prevent duplicate requests
    pendingRequests.set(cacheKey, translationPromise);

    try {
      const result = await translationPromise;
      
      // Cache the result
      translationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  }

  private async performTranslation(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, sourceLang, targetLang, model, isCasual } = request;

    // Validate input
    if (!text?.trim()) {
      throw createValidationError('Text is required for translation');
    }

    if (sourceLang === targetLang) {
      return {
        translation: text,
        tokens: 0,
        model,
        sourceLang,
        targetLang
      };
    }

    // Get language names
    const sourceLanguage = LANGUAGE_MAP[sourceLang] || sourceLang;
    const targetLanguage = LANGUAGE_MAP[targetLang] || targetLang;

    // Create translation prompt
    const tone = isCasual ? 'casual and conversational' : 'formal and professional';
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Use a ${tone} tone. Only return the translation, nothing else.

Text to translate: ${text}

Translation:`;

    try {
      log.info('Starting translation', { 
        sourceLang: sourceLanguage, 
        targetLang: targetLanguage, 
        model,
        textLength: text.length,
        tone 
      });

      const response = await callOllama(prompt, model);
      
      if (!response) {
        throw new Error('Empty response from translation service');
      }

      // Clean up the response (remove any extra formatting)
      const translation = response.trim();

      log.info('Translation completed successfully', { 
        sourceLang: sourceLanguage, 
        targetLang: targetLanguage, 
        model,
        originalLength: text.length,
        translationLength: translation.length
      });

      return {
        translation,
        tokens: 0, // Ollama doesn't provide token count in this format
        model,
        sourceLang,
        targetLang
      };

    } catch (error) {
      log.error('Translation failed', error, { 
        sourceLang: sourceLanguage, 
        targetLang: targetLanguage, 
        model,
        textLength: text.length 
      });
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Translation service is currently unavailable');
    }
  }

  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    return Object.entries(LANGUAGE_MAP).map(([code, name]) => ({
      code,
      name
    }));
  }

  // Clean up old cache entries periodically
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of translationCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        translationCache.delete(key);
      }
    }
  }
}
