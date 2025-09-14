/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Branded types for enhanced type safety
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

// User-related branded types
export type UserId = Brand<string, 'UserId'>;
export type UserEmail = Brand<string, 'UserEmail'>;
export type UserRole = Brand<string, 'UserRole'>;

// Message-related branded types
export type MessageId = Brand<string, 'MessageId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type MessageContent = Brand<string, 'MessageContent'>;

// Template-related branded types
export type TemplateId = Brand<string, 'TemplateId'>;
export type TemplateName = Brand<string, 'TemplateName'>;

// Utility functions for creating branded types
export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createUserEmail(email: string): UserEmail {
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return email as UserEmail;
}

export function createMessageId(id: string): MessageId {
  return id as MessageId;
}

export function createConversationId(id: string): ConversationId {
  return id as ConversationId;
}

// Advanced async state with discriminated unions
export type AsyncState<T, E = Error> = 
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: T; timestamp: Date }
  | { status: 'error'; error: E; retryCount: number };

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

// Enhanced component props with strict typing
export interface StrictComponentProps<T extends Record<string, unknown>> {
  data: T;
  onUpdate: (updates: Partial<T>) => void;
  onError: (error: Error) => void;
  loading?: boolean;
  className?: string;
}

// Type-safe event handlers
export type EventHandler<T = void> = T extends void 
  ? () => void 
  : (data: T) => void;

export type AsyncEventHandler<T = void> = T extends void
  ? () => Promise<void>
  : (data: T) => Promise<void>;

// Form validation types
export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  validators: ValidationRule<T>[];
}

export type FormState<T extends Record<string, unknown>> = {
  [K in keyof T]: FormField<T[K]>;
} & {
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
};
