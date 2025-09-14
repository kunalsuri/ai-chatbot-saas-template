/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router } from 'express';
import { z } from 'zod';
import { externalAIService } from '../services/external-ai-service';
import { ExternalProvider, ExternalAIMessage } from '@shared/types/external-ai';
import { createValidationError } from '../../../shared/utils/errors.js';
import { log } from '../../../shared/utils/logger.js';

const router = Router();

// Validation schemas
const generateMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  provider: z.enum(['google', 'anthropic', 'mistral', 'openai']),
  model: z.string().optional(),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().or(z.date()).optional()
  })).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional()
});

const healthCheckSchema = z.object({
  provider: z.enum(['google', 'anthropic', 'mistral', 'openai']).optional()
});

// Generate chat response
router.post('/message', async (req, res) => {
  try {
    const validatedData = generateMessageSchema.parse(req.body);
    const { message, provider, model, context = [], temperature, maxTokens } = validatedData;

    // Convert context to ExternalAIMessage format
    const messages: ExternalAIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Respond naturally and conversationally to the user\'s messages. Be concise but informative.'
      },
      ...context.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const response = await externalAIService.generateResponse(
      provider,
      messages,
      {
        model,
        temperature,
        maxTokens
      }
    );

    res.json({
      success: true,
      data: {
        response: response.content,
        model: response.model,
        provider: response.provider,
        usage: response.usage
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log.error('External AI message generation failed', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate response',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for specific provider or all providers
router.get('/health', async (req, res) => {
  try {
    const { provider } = healthCheckSchema.parse(req.query);

    if (provider) {
      const health = await externalAIService.checkProviderHealth(provider);
      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });
    } else {
      const allHealth = await externalAIService.checkAllProvidersHealth();
      res.json({
        success: true,
        data: allHealth,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    log.error('External AI health check failed', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Get available models for a provider
router.get('/models/:provider', async (req, res) => {
  try {
    const provider = req.params.provider as ExternalProvider;
    
    if (!['google', 'anthropic', 'mistral', 'openai'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider',
        timestamp: new Date().toISOString()
      });
    }

    const models = await externalAIService.getAvailableModels(provider);
    
    res.json({
      success: true,
      data: {
        provider,
        models
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log.error(`Failed to get models for ${req.params.provider}`, error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get models',
      timestamp: new Date().toISOString()
    });
  }
});

// Get supported providers
router.get('/providers', async (req, res) => {
  try {
    const providers = externalAIService.getSupportedProviders();
    const providerStatus = await Promise.all(
      providers.map(async (provider) => ({
        provider,
        configured: externalAIService.isProviderConfigured(provider),
        defaultModel: externalAIService.getDefaultModel(provider)
      }))
    );

    res.json({
      success: true,
      data: {
        providers: providerStatus
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log.error('Failed to get providers', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get providers',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
