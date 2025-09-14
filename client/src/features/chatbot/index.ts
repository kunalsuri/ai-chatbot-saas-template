/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as AIChatBotLocal } from './components/AIChatBotLocal';
export { default as AIChatBotExternal } from './components/AIChatBotExternal';
export { LocalAIModelStatus } from './components/ai/LocalAIModelStatus';

// Hooks
export { useExternalAI } from './hooks/useExternalAI';

// API
export { chatApi } from './api/chatApi';

// Types
export type {
  ChatMessage,
  ChatSession,
  ChatProvider,
  ChatModel,
  ChatRequest,
  ChatResponse,
  ChatState,
  ChatHistoryResponse,
  ChatMessageResponse,
} from './types';
