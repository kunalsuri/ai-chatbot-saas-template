/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { 
  AppSettings, 
  OllamaConfig, 
  LMStudioConfig, 
  ExternalAIConfig 
} from '../types';

const API_BASE = '/api/settings';

export const settingsApi = {
  async getAppSettings(): Promise<AppSettings> {
    const response = await fetch(`${API_BASE}/app`);
    if (!response.ok) throw new Error('Failed to fetch app settings');
    return response.json();
  },

  async updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await fetch(`${API_BASE}/app`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update app settings');
    return response.json();
  },

  async getOllamaConfig(): Promise<OllamaConfig> {
    const response = await fetch(`${API_BASE}/ollama`);
    if (!response.ok) throw new Error('Failed to fetch Ollama config');
    return response.json();
  },

  async updateOllamaConfig(config: Partial<OllamaConfig>): Promise<OllamaConfig> {
    const response = await fetch(`${API_BASE}/ollama`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to update Ollama config');
    return response.json();
  },

  async getLMStudioConfig(): Promise<LMStudioConfig> {
    const response = await fetch(`${API_BASE}/lmstudio`);
    if (!response.ok) throw new Error('Failed to fetch LM Studio config');
    return response.json();
  },

  async updateLMStudioConfig(config: Partial<LMStudioConfig>): Promise<LMStudioConfig> {
    const response = await fetch(`${API_BASE}/lmstudio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to update LM Studio config');
    return response.json();
  },

  async getExternalAIConfig(): Promise<ExternalAIConfig> {
    const response = await fetch(`${API_BASE}/external-ai`);
    if (!response.ok) throw new Error('Failed to fetch external AI config');
    return response.json();
  },

  async updateExternalAIConfig(config: Partial<ExternalAIConfig>): Promise<ExternalAIConfig> {
    const response = await fetch(`${API_BASE}/external-ai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to update external AI config');
    return response.json();
  },

  async testConnection(provider: 'ollama' | 'lmstudio', config: any): Promise<boolean> {
    const response = await fetch(`${API_BASE}/test-connection/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Connection test failed');
    const result = await response.json();
    return result.success;
  },
};
