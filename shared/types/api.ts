/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Generic API Response Types - Shared Infrastructure Only
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: ValidationError[];
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Generic Error Types
export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  code?: string;
  details?: ValidationError[];
  stack?: string;
  requestId?: string;
  path?: string;
}

// Generic Error Object for type-safe error handling
export interface GenericError {
  message: string;
  code?: string;
  name?: string;
  stack?: string;
}

// Standardized API Error Response
export interface StandardErrorResponse extends ErrorResponse {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'conflict' | 'rate_limit' | 'external_service' | 'database' | 'internal';
  retryable: boolean;
}

// Error Context for logging
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  path?: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// External Service Error Types
export interface ExternalServiceError extends GenericError {
  service: string;
  statusCode?: number;
  response?: unknown;
}

// Generic JSON extraction result
export interface JsonExtractionResult {
  success: boolean;
  data: Record<string, unknown> | null;
  error?: string;
}

// Translation History Types
export interface TranslationHistoryItem {
  id: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  tokens: number;
  userId: string;
  timestamp: string;
}

// Chat Session Types
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// User Types with Password
export interface UserWithPassword {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  plan: string;
  createdAt: string;
  lastLogin?: string;
}


