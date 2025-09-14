/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ApiResponse } from '@shared/types/api';

// Translation Types
export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
}

export interface TranslationHistoryItem {
  id: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  model?: string;
  tokens?: number;
  timestamp: Date;
  userId?: string;
}

export interface TranslationResponse extends ApiResponse<TranslationResult> {}
export interface LanguagesResponse extends ApiResponse<{ languages: SupportedLanguage[] }> {}
export interface TranslationHistoryResponse extends ApiResponse<TranslationHistoryItem[]> {}

// Translation Service Types
export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  isCasual?: boolean;
}

export interface TranslationServiceError {
  message: string;
  code?: string;
  name?: string;
  stack?: string;
  service: 'translation';
  originalRequest?: TranslationRequest;
}
