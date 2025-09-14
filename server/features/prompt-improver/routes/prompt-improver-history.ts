/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../../../shared/middleware/errorHandler';
import { requireAuth } from '../../../shared/middleware/auth';
import { csrfProtection } from '../../../shared/middleware/csrf';

// Define data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'prompt_improve_history.json');

// Type definitions
interface PromptImprovementHistoryItem {
  id: string;
  original: string;
  improved: string;
  model: string;
  provider: 'ollama' | 'lmstudio';
  tokens: number;
  userId: string;
  timestamp: string;
}

// Helper function to read prompt improvement history
const readPromptHistory = async (): Promise<PromptImprovementHistoryItem[]> => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.improvements || [];
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
};

// Helper function to write prompt improvement history
const writePromptHistory = async (history: PromptImprovementHistoryItem[]): Promise<void> => {
  // Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(HISTORY_FILE, JSON.stringify({ improvements: history }, null, 2), 'utf8');
};

// Get all prompt improvement history
export const getPromptHistory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const history = await readPromptHistory();
    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading prompt improvement history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load prompt improvement history',
      timestamp: new Date().toISOString()
    });
  }
});

// Get a specific prompt improvement by ID
export const getPromptById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const history = await readPromptHistory();
  const item = history.find(item => item.id === id);
  
  if (!item) {
    res.status(404).json({ 
      success: false,
      error: 'Prompt improvement not found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  res.json({
    success: true,
    data: item,
    timestamp: new Date().toISOString()
  });
});

// Save a new prompt improvement to history
export const savePromptImprovement = asyncHandler(async (req: Request, res: Response) => {
  const { original, improved, model, provider, tokens, userId } = req.body;
  
  if (!original || !improved || !model || !provider) {
    res.status(400).json({ 
      success: false,
      error: 'Missing required fields',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  const newItem: PromptImprovementHistoryItem = {
    id: uuidv4(),
    original,
    improved,
    model,
    provider,
    tokens: tokens || 0,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString()
  };
  
  const history = await readPromptHistory();
  history.unshift(newItem); // Add to beginning of array
  
  // Limit history to 100 items
  const limitedHistory = history.slice(0, 100);
  await writePromptHistory(limitedHistory);
  
  res.status(201).json({
    success: true,
    data: newItem,
    timestamp: new Date().toISOString()
  });
});

// Delete a prompt improvement from history
export const deletePromptImprovement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const history = await readPromptHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  
  if (history.length === updatedHistory.length) {
    res.status(404).json({ 
      success: false,
      error: 'Prompt improvement not found',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  await writePromptHistory(updatedHistory);
  res.status(200).json({ 
    success: true,
    data: { id },
    timestamp: new Date().toISOString()
  });
});