/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Advanced TypeScript patterns for 2025 best practices
// Brand types for type safety
export type Brand<T, B> = T & { readonly __brand: B };

// Branded primitive types
export type UserId = Brand<string, 'UserId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type ComponentId = Brand<string, 'ComponentId'>;
export type Timestamp = Brand<number, 'Timestamp'>;

// Template literal types for type-safe routing
export type AppRoutes = 
  | '/dashboard'
  | '/ai-chatbot'
  | '/prompt-improver'
  | '/local-model-mgmt'
  | '/translate'
  | '/summary'
  | '/settings'
  | '/settings/user-management'
  | `/user/${UserId}`
  | `/chat/${SessionId}`;

// Advanced conditional types for API responses
export type ApiState<T> = 
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: T; timestamp: Timestamp }
  | { status: 'error'; error: string; code?: string; retryable?: boolean };

// Utility types for better type inference
export type NonEmptyArray<T> = [T, ...T[]];
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Type-safe event system
export interface TypedEventMap {
  'user:login': { userId: UserId; timestamp: Timestamp };
  'user:logout': { userId: UserId; sessionDuration: number };
  'ui:interaction': { 
    component: ComponentId; 
    action: string; 
    metadata?: Record<string, unknown> 
  };
  'performance:metric': { 
    name: string; 
    value: number; 
    category: 'render' | 'network' | 'memory' | 'user-interaction' 
  };
  'ai:suggestion': {
    suggestionId: string;
    component: ComponentId;
    confidence: number;
    applied: boolean;
  };
}

// Advanced function overloads for type safety
export interface TypedEventEmitter {
  <K extends keyof TypedEventMap>(event: K, data: TypedEventMap[K]): void;
  <K extends keyof TypedEventMap>(event: K): TypedEventMap[K][];
}

// Discriminated unions for component states
export type ComponentState<T = unknown> =
  | { type: 'loading'; message?: string }
  | { type: 'error'; error: string; recoverable: boolean }
  | { type: 'success'; data: T }
  | { type: 'empty'; reason?: string };

// Advanced generic constraints
export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface Versioned {
  version: number;
}

// Utility type for creating branded constructors
export function createBrand<T, B extends string>(
  value: T,
  brand: B
): Brand<T, B> {
  return value as Brand<T, B>;
}

// Type guards for runtime type checking
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

export function isMessageId(value: unknown): value is MessageId {
  return typeof value === 'string' && value.length > 0;
}

export function isApiSuccess<T>(state: ApiState<T>): state is Extract<ApiState<T>, { status: 'success' }> {
  return state.status === 'success';
}

export function isApiError<T>(state: ApiState<T>): state is Extract<ApiState<T>, { status: 'error' }> {
  return state.status === 'error';
}

// Advanced mapped types for form validation
export type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[K]) => string | null;
  };
};

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// Type-safe configuration objects
export interface TypeSafeConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    density: 'compact' | 'comfortable' | 'spacious';
  };
  performance: {
    enableMetrics: boolean;
    sampleRate: number;
    maxMemoryUsage: number;
  };
}

// Advanced tuple types for better array handling
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];
export type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;

// Recursive types for nested structures
export interface NestedMenuItem {
  id: ComponentId;
  label: string;
  icon?: string;
  route?: AppRoutes;
  children?: NestedMenuItem[];
  permissions?: string[];
}

// Type-safe builder pattern
export class TypeSafeQueryBuilder<T> {
  private filters: Array<(item: T) => boolean> = [];
  private sorters: Array<(a: T, b: T) => number> = [];

  where<K extends keyof T>(key: K, value: T[K]): this {
    this.filters.push(item => item[key] === value);
    return this;
  }

  orderBy<K extends keyof T>(key: K, direction: 'asc' | 'desc' = 'asc'): this {
    this.sorters.push((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return this;
  }

  execute(data: T[]): T[] {
    let result = data;
    
    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(filter);
    }
    
    // Apply sorting
    for (const sorter of this.sorters) {
      result = result.sort(sorter);
    }
    
    return result;
  }
}

// Export utility functions
export const TypeUtils = {
  createBrand,
  isUserId,
  isMessageId,
  isApiSuccess,
  isApiError,
};
