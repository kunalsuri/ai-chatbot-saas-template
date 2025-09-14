/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as LocalModelManagement } from './components/LocalModelManagement';
export { default as ExternalModelManagement } from './components/ExternalModelManagement';

// Hooks
export { useExternalModelManagement } from './hooks/useExternalModelManagement';

// API
export { modelManagementApi } from './api/modelManagementApi';

// Types
export type {
  AIModel,
  ModelProvider,
  ModelTestRequest,
  ModelTestResponse,
  ModelDownloadProgress,
  ModelManagementState,
  // External AI Types
  ExternalProvider,
  ExternalAIConfig,
  ExternalAIMessage,
  ExternalAIResponse,
  ExternalAIModel,
  ExternalAIHealthCheck,
  GoogleAIConfig,
  AnthropicConfig,
  MistralConfig,
  OpenAIConfig,
  ProviderConfig,
  ExternalAIModelStatusProps,
} from './types';
