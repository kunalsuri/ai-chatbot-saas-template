/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Router, type Request, Response } from 'express';
import { checkOllamaHealth, getAvailableModels, testOllamaConnection } from '../services/ollama';
import { log } from '../../../shared/utils/logger';
import { ApiResponse } from '@shared/types/api';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const enableLogging = req.query.enableLogging === 'true';
    const healthCheck = await checkOllamaHealth(enableLogging);
    
    const response: ApiResponse<typeof healthCheck> = {
      success: true,
      data: healthCheck,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    log.error('Ollama health check failed', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Get available models endpoint
router.get('/models', async (req: Request, res: Response) => {
  try {
    const enableLogging = req.query.enableLogging === 'true';
    const models = await getAvailableModels(enableLogging);
    
    const response: ApiResponse<{ models: string[] }> = {
      success: true,
      data: { models: models.map(m => m.name) },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    log.error('Failed to fetch Ollama models', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Test connection endpoint
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Model parameter is required',
        timestamp: new Date().toISOString()
      };
      res.status(400).json(response);
      return;
    }
    
    const testResult = await testOllamaConnection(model);
    
    const response: ApiResponse<typeof testResult> = {
      success: true,
      data: testResult,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    log.error('Ollama connection test failed', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;
