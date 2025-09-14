/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ApiResponse } from '@shared/types/api';

// Editor Types
export interface EditorDesignData {
  [key: string]: unknown;
}

export interface SavedDesign {
  id: string;
  userId: string;
  title: string;
  data: EditorDesignData;
  createdAt: string;
  updatedAt: string;
}

export interface EditorResponse extends ApiResponse<{
  fonts: string[];
  presetColors: string[];
}> {}

export interface SaveDesignResponse extends ApiResponse<SavedDesign> {}
