/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ApiResponse } from '@shared/types/api';

// Prompt Improvement Types
export interface PromptImprovementResult {
  improvedPrompt: string;
  originalPrompt: string;
  model: string;
}

export interface PromptImprovementResponse extends ApiResponse<PromptImprovementResult> {}
