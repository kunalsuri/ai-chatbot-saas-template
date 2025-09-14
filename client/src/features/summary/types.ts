/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface SummaryRequest {
  prompt: string;
  content: string;
  model: string;
  provider: 'ollama' | 'lmstudio';
}

export interface SummaryResponse {
  summary: string;
  tokens?: number;
}

export interface SummaryHistoryItem {
  id: string;
  originalText: string;
  summary: string;
  model: string;
  tokens: number;
  timestamp: string;
  userId?: string;
}