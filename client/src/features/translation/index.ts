/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as TranslateLocal } from './components/TranslateLocal';
export { TranslationHistory } from './components/TranslationHistory';

// Hooks
export { useTranslationHistory } from './hooks/useTranslationHistory';

// API
export { translationApi } from './api/translation-api';

// Types
export type {
  TranslationRequest,
  TranslationResponse,
  TranslationHistoryItem,
} from './types';