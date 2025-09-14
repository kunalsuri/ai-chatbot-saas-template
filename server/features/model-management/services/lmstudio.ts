/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { log, LogType } from '../../../shared/utils/logger';
import { ExternalServiceError, createExternalServiceError } from '../../../shared/utils/errors';
import { 
  LMStudioHealthCheck,
  OllamaTestResult
} from '../types/api';
import { config } from '../../../shared/config/environment';

// LM Studio configuration from validated environment
const LMSTUDIO_BASE_URL = config.lmstudio.baseUrl;

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 10000;

async function checkLMStudioConnection(enableLogging: boolean = false): Promise<boolean> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/models`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    log.externalService('lmstudio', 'connection_check', response.ok, duration);
    return response.ok;
  } catch (error) {
    const duration = Date.now() - Date.now();
    // Only log as warning if logging is enabled (health check is ON)
    if (enableLogging) {
      log.warn('Service Health Check: LM Studio Not Available - This is normal if LM Studio is not running', {
        service: 'lmstudio',
        operation: 'connection_check',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return false;
  }
}

export async function checkLMStudioHealth(enableLogging: boolean = false): Promise<LMStudioHealthCheck> {
  try {
    const isConnected = await checkLMStudioConnection(enableLogging);
    
    if (!isConnected) {
      return {
        connected: false,
        isOnline: false,
        models: [],
        error: 'LM Studio service is not running or unreachable',
        latency: 0
      };
    }

    // Get available models
    const models = await getAvailableModels(enableLogging);
    
    return {
      connected: true,
      isOnline: true,
      models: models.map(m => m.id || m.name || 'Unknown Model'),
      latency: 0 // Could be enhanced to measure actual latency
    };
  } catch (error) {
    if (enableLogging) {
      log.error('LM Studio health check failed', error);
    }
    return {
      connected: false,
      isOnline: false,
      models: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: 0
    };
  }
}

export async function getAvailableModels(enableLogging: boolean = false): Promise<any[]> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);

    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/models`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw createExternalServiceError(
        `LM Studio API returned ${response.status}: ${response.statusText}`,
        'lmstudio'
      );
    }

    const data = await response.json();
    
    log.externalService('lmstudio', 'fetch-models', true, duration);
    return data.data || [];
  } catch (error) {
    const duration = Date.now() - Date.now();
    
    if (enableLogging) {
      log.externalService('lmstudio', 'fetch-models', false, duration, error instanceof Error ? error : new Error(String(error)));
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createExternalServiceError('Request to LM Studio timed out', 'lmstudio');
    }
    
    throw createExternalServiceError(
      error instanceof Error ? error.message : 'Failed to fetch models from LM Studio',
      'lmstudio'
    );
  }
}

export async function testLMStudioConnection(model: string): Promise<OllamaTestResult> {
  try {
    const startTime = Date.now();
    
    // First check if the service is available
    const isConnected = await checkLMStudioConnection(true);
    if (!isConnected) {
      return {
        connected: false,
        error: 'LM Studio service is not running or unreachable',
        latency: 0
      };
    }

    // Test with a simple prompt
    const testPrompt = 'Hello, respond with just "Hello back!" and nothing else.';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for generation

    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 50,
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        connected: true,
        error: `Model test failed: ${response.status} - ${errorText}`,
        model,
        latency
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || 'No response';
    
    return {
      connected: true,
      response: responseText,
      model,
      latency
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        connected: true,
        error: 'Request timed out - model may be loading',
        model,
        latency: 30000
      };
    }

    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      model,
      latency: 0
    };
  }
}

export async function loadModel(model: string): Promise<{ success: boolean; message?: string }> {
  try {
    // LM Studio doesn't have a specific load endpoint, but we can check if model is available
    const models = await getAvailableModels(true);
    const modelExists = models.some(m => m.id === model || m.name === model);
    
    if (modelExists) {
      return { success: true, message: `Model ${model} is available` };
    } else {
      return { success: false, message: `Model ${model} not found in LM Studio` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to load model' 
    };
  }
}

export async function unloadModel(model: string): Promise<{ success: boolean; message?: string }> {
  try {
    // LM Studio doesn't have a specific unload endpoint
    return { success: true, message: `Model management not supported by LM Studio API` };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to unload model' 
    };
  }
}

export async function callLMStudio(prompt: string, model: string): Promise<string> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log.externalService('lmstudio', 'generate', false, duration, new Error(`${response.status}: ${errorText}`));
      throw createExternalServiceError(
        `LM Studio API error: ${response.status} - ${errorText}`,
        'lmstudio'
      );
    }

    const data = await response.json();
    log.externalService('lmstudio', 'generate', true, duration);
    
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      log.externalService('lmstudio', 'generate', false, 60000, new Error('Request timeout'));
      throw createExternalServiceError('Request to LM Studio timed out', 'lmstudio');
    }
    
    log.externalService('lmstudio', 'generate', false, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
