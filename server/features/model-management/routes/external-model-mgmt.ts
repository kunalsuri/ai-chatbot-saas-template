/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { externalAIService } from '../services/external-ai-service';
import { ExternalProvider } from '../../../shared/types/external-ai';
import { ApiResponse } from '@shared/types/api';
import { log } from '../../../shared/utils/logger';

const router = Router();

// Get all available providers and their models
router.get('/providers', async (req, res) => {
  try {
    const providers = externalAIService.getSupportedProviders();
    const providerData = await Promise.all(
      providers.map(async (provider) => {
        const isConfigured = externalAIService.isProviderConfigured(provider);
        const models = isConfigured ? await externalAIService.getAvailableModels(provider) : [];
        const defaultModel = externalAIService.getDefaultModel(provider);
        const health = await externalAIService.checkProviderHealth(provider);

        return {
          provider,
          isConfigured,
          models,
          defaultModel,
          health,
        };
      })
    );

    const response: ApiResponse<typeof providerData> = {
      success: true,
      data: providerData,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    log.error('Failed to get providers', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get models for a specific provider
router.get('/providers/:provider/models', async (req, res) => {
  try {
    const provider = req.params.provider as ExternalProvider;
    
    if (!externalAIService.getSupportedProviders().includes(provider)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Unsupported provider: ${provider}`,
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    if (!externalAIService.isProviderConfigured(provider)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Provider ${provider} is not configured`,
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const models = await externalAIService.getAvailableModels(provider);
    
    const response: ApiResponse<typeof models> = {
      success: true,
      data: models,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    log.error(`Failed to get models for provider ${req.params.provider}`, error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Test a specific model
router.post('/providers/:provider/models/:model/test', async (req, res) => {
  try {
    const provider = req.params.provider as ExternalProvider;
    const model = req.params.model;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Message is required and must be a string',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    if (!externalAIService.getSupportedProviders().includes(provider)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Unsupported provider: ${provider}`,
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    if (!externalAIService.isProviderConfigured(provider)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Provider ${provider} is not configured`,
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const testMessages = [
      { role: 'user' as const, content: message }
    ];

    const startTime = Date.now();
    const result = await externalAIService.generateResponse(provider, testMessages, { model });
    const responseTime = Date.now() - startTime;

    const response: ApiResponse<{
      result: typeof result;
      responseTime: number;
    }> = {
      success: true,
      data: {
        result,
        responseTime,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    log.error(`Failed to test model ${req.params.model} for provider ${req.params.provider}`, error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get health status for a specific provider
router.get('/providers/:provider/health', async (req, res) => {
  try {
    const provider = req.params.provider as ExternalProvider;
    
    if (!externalAIService.getSupportedProviders().includes(provider)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Unsupported provider: ${provider}`,
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const healthCheck = await externalAIService.checkProviderHealth(provider);
    
    const response: ApiResponse<typeof healthCheck> = {
      success: true,
      data: healthCheck,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    log.error(`Failed to check health for provider ${req.params.provider}`, error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

export default router;
