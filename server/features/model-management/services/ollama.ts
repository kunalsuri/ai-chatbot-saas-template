/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { log, LogType } from '../../../shared/utils/logger';
import { ExternalServiceError, createExternalServiceError } from '../../../shared/utils/errors';
import { 
  OllamaModelsResponse, 
  OllamaGenerateResponse, 
  OllamaHealthCheck,
  OllamaTestResult
} from '../types/api';
import { JsonExtractionResult, GenericError } from '@shared/types/api';
import { config } from '../../../shared/config/environment';

// Ollama configuration from validated environment
const OLLAMA_BASE_URL = config.ollama.baseUrl;
const OLLAMA_MODEL = config.ollama.model;

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 10000;

async function checkOllamaConnection(enableLogging: boolean = false): Promise<boolean> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    log.externalService('ollama', 'connection_check', response.ok, duration);
    return response.ok;
  } catch (error) {
    const duration = Date.now() - Date.now();
    // Only log as warning if logging is enabled (health check is ON)
    if (enableLogging) {
      log.warn('Service Health Check: Ollama Not Available - This is normal if Ollama is not running', {
        service: 'ollama',
        operation: 'connection_check',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return false;
  }
}

export async function checkOllamaHealth(enableLogging: boolean = false): Promise<OllamaHealthCheck> {
  try {
    const isConnected = await checkOllamaConnection(enableLogging);
    
    if (!isConnected) {
      return {
        connected: false,
        isOnline: false,
        models: [],
        error: 'Ollama service is not running or unreachable',
        latency: 0
      };
    }

    // Get available models
    const models = await getAvailableModels(enableLogging);
    
    return {
      connected: true,
      isOnline: true,
      models: models.map(m => m.name),
      latency: 0 // Could be enhanced to measure actual latency
    };
  } catch (error) {
    if (enableLogging) {
      log.error('Ollama health check failed', error);
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

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw createExternalServiceError(
        `Ollama API returned ${response.status}: ${response.statusText}`,
        'ollama'
      );
    }

    const data = await response.json() as OllamaModelsResponse;
    
    log.externalService('ollama', 'fetch-models', true, duration);
    return data.models || [];
  } catch (error) {
    const duration = Date.now() - Date.now();
    
    if (enableLogging) {
      log.externalService('ollama', 'fetch-models', false, duration, error instanceof Error ? error : new Error(String(error)));
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createExternalServiceError('Request to Ollama timed out', 'ollama');
    }
    
    throw createExternalServiceError(
      error instanceof Error ? error.message : 'Failed to fetch models from Ollama',
      'ollama'
    );
  }
}

export async function testOllamaConnection(model: string): Promise<OllamaTestResult> {
  try {
    const startTime = Date.now();
    
    // First check if the service is available
    const isConnected = await checkOllamaConnection(true);
    if (!isConnected) {
      return {
        connected: false,
        error: 'Ollama service is not running or unreachable',
        latency: 0
      };
    }

    // Test with a simple prompt
    const testPrompt = 'Hello, respond with just "Hello back!" and nothing else.';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for generation

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: testPrompt,
        stream: false
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

    const data = await response.json() as OllamaGenerateResponse;
    
    return {
      connected: true,
      response: data.response,
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

export async function callOllama(prompt: string, model: string = OLLAMA_MODEL): Promise<string> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log.externalService('ollama', 'generate', false, duration, new Error(`${response.status}: ${errorText}`));
      throw createExternalServiceError(
        `Ollama API error: ${response.status} - ${errorText}`,
        'ollama'
      );
    }

    const data = await response.json() as OllamaGenerateResponse;
    log.externalService('ollama', 'generate', true, duration);
    
    return data.response || '';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      log.externalService('ollama', 'generate', false, 60000, new Error('Request timeout'));
      throw createExternalServiceError('Request to Ollama timed out', 'ollama');
    }
    
    log.externalService('ollama', 'generate', false, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
