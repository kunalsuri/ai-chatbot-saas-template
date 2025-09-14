/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ApiResponse } from '@shared/types/api';

// Prompt Improvement Types
export interface PromptImprovementRequest {
  prompt: string;
  context?: string;
  style?: 'professional' | 'casual' | 'technical';
  model?: string;
}

export interface PromptImprovementResult {
  originalPrompt: string;
  improvedPrompt: string;
  metadata: {
    model: string;
    style: string;
  };
}

export interface PromptImprovementResponse extends ApiResponse<PromptImprovementResult> {}
