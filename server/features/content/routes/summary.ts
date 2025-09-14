/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../../../shared/middleware/errorHandler.js';
import { AuthenticatedRequest } from '../../../shared/types/auth.js';
import { requireAuth } from '../../../shared/middleware/auth.js';
import { csrfProtection } from '../../../shared/middleware/csrf.js';
import { ChatMessage } from '../../chat/types/api';

// Define data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

const HISTORY_FILE = path.join(DATA_DIR, 'summary_history.json');

// Type definitions
interface SummaryItem {
  id: string;
  prompt: string;
  content: string;
  summary: string;
  model: string;
  provider: 'ollama' | 'lmstudio';
  timestamp: string;
  tokens: number;
}

// Helper function to read summary history
const readSummaryHistory = async (): Promise<SummaryItem[]> => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
};

// Helper function to write summary history
const writeSummaryHistory = async (history: SummaryItem[]): Promise<void> => {
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
};

// Get all summary history
export const getSummaryHistory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const history = await readSummaryHistory();
    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading summary history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load summary history',
      timestamp: new Date().toISOString()
    });
  }
});

// Get a specific summary by ID
export const getSummaryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const history = await readSummaryHistory();
  const summary = history.find(item => item.id === id);

  if (!summary) {
    res.status(404).json({
      success: false,
      error: 'Summary not found',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.json({
    success: true,
    data: summary,
    timestamp: new Date().toISOString()
  });
});

// Save a new summary to history
export const saveSummary = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, content, summary, model, provider, tokens } = req.body;

  if (!prompt || !content || !summary || !model || !provider) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const newSummary: SummaryItem = {
    id: uuidv4(),
    prompt,
    content,
    summary,
    model,
    provider,
    timestamp: new Date().toISOString(),
    tokens: tokens || 0
  };

  const history = await readSummaryHistory();
  history.unshift(newSummary); // Add to beginning of array

  // Limit history to 100 items
  const limitedHistory = history.slice(0, 100);
  await writeSummaryHistory(limitedHistory);

  res.status(201).json({
    success: true,
    data: newSummary,
    timestamp: new Date().toISOString()
  });
});

// Delete a summary from history
export const deleteSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const history = await readSummaryHistory();
  const updatedHistory = history.filter(item => item.id !== id);

  if (history.length === updatedHistory.length) {
    res.status(404).json({
      success: false,
      error: 'Summary not found',
      timestamp: new Date().toISOString()
    });
    return;
  }

  await writeSummaryHistory(updatedHistory);
  res.status(200).json({
    success: true,
    data: { id },
    timestamp: new Date().toISOString()
  });
});

// Generate a summary using AI
export const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, content, model, provider } = req.body;

  if (!prompt || !content || !model || !provider) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // Create a system prompt for summarization
    const systemPrompt = `You are an AI assistant specialized in summarizing text. 
Your task is to summarize the provided content according to the user's instructions.
Follow these guidelines:
1. Maintain the key points and main ideas from the original text
2. Be concise but comprehensive
3. Use clear and simple language
4. Follow any specific style or format instructions provided by the user
5. Ensure the summary is coherent and flows well`;

    // Generate the summary using the appropriate service based on provider
    let result: string;
    if (provider === 'lmstudio') {
      // Import the LM Studio function
      const { generateLMStudioResponse } = await import('../../chat/services/chat');

      // Create properly formatted messages for LM Studio
      const messages: ChatMessage[] = [
        {
          id: 'system-prompt',
          role: 'system',
          content: systemPrompt,
          timestamp: new Date()
        },
        {
          id: 'user-request',
          role: 'user',
          content: `Instructions for summarization: ${prompt}\n\nText to summarize:\n${content}`,
          timestamp: new Date()
        }
      ];

      // For LM Studio, we'll use the messages array directly in the prompt
      result = await generateLMStudioResponse(
        `Instructions for summarization: ${prompt}\n\nText to summarize:\n${content}`,
        messages,
        model
      );
    } else {
      // For Ollama, we need to format the prompt with system message
      const { generateChatResponse } = await import('../../chat/services/chat');

      // Format the prompt for Ollama with system message as part of the prompt
      const promptText = `[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\nInstructions for summarization: ${prompt}\n\nText to summarize:\n${content}\n[/INST]`;

      result = await generateChatResponse(
        promptText,
        [], // No additional context needed as we're including everything in the prompt
        model
      );
    }

    // Calculate token count (rough estimate)
    const tokens = Math.ceil((prompt.length + content.length + result.length) / 4);

    res.json({
      success: true,
      data: {
        summary: result,
        tokens
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate summary',
      timestamp: new Date().toISOString()
    });
  }
});

// Register all routes
export const registerSummaryRoutes = (app: any) => {
  // Apply authentication to all routes
  app.get('/api/summary/history', requireAuth, getSummaryHistory);
  app.get('/api/summary/history/:id', requireAuth, getSummaryById);
  app.post('/api/summary/history', requireAuth, csrfProtection, saveSummary);
  app.delete('/api/summary/history/:id', requireAuth, csrfProtection, deleteSummary);
  app.post('/api/summary/generate', requireAuth, csrfProtection, generateSummary);
};
