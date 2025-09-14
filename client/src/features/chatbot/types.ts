/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  provider?: 'local' | 'external';
  model?: string;
}

export interface ChatProvider {
  id: string;
  name: string;
  type: 'local' | 'external';
  status: 'online' | 'offline' | 'error';
  models: ChatModel[];
  config?: Record<string, any>;
}

export interface ChatModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  description?: string;
  capabilities?: string[];
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  model: string;
  provider: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
  metadata: {
    model: string;
    provider: string;
    tokens: number;
    processingTime: number;
  };
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  providers: ChatProvider[];
  selectedProvider: string | null;
  selectedModel: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}

// API Response Types
export interface ChatHistoryResponse {
  success: boolean;
  data: ChatSession[];
  timestamp: string;
}

export interface ChatMessageResponse {
  success: boolean;
  data: {
    response: string;
  };
  timestamp: string;
}
