/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang: string;
  model: string;
  isCasual: boolean;
}

export interface TranslationResponse {
  translation: string;
  tokens?: number;
}

export interface TranslationHistoryItem {
  id: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  tokens: number;
  timestamp: string;
  userId?: string;
}