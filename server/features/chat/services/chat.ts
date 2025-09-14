/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';
import { createValidationError } from '../../../shared/utils/errors.js';
import { log, LogType } from '../../../shared/utils/logger.js';
import { ChatMessage } from '@shared/types/api';
import { LMStudioModelsResponse, LMStudioChatResponse } from '@shared/types/external-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Generate chat response using Ollama
export async function generateChatResponse(
  message: string,
  context: ChatMessage[] = [],
  model: string = 'llama3.1:latest'
): Promise<string> {
  try {
    // Build context from previous messages
    const contextString = context
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const fullPrompt = contextString 
      ? `Previous conversation:\n${contextString}\n\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`;

    // Make a direct request to Ollama with the conversation context
    const chatResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: `You are a helpful AI assistant. Respond naturally and conversationally to the user's message. Be concise but informative.\n\n${fullPrompt}`,
        stream: false
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`Ollama API error: ${chatResponse.status}`);
    }

    const data = await chatResponse.json() as { response: string };
    return data.response || "I'm sorry, I couldn't generate a response at the moment.";
  } catch (error) {
    log.externalService('ollama', 'chat', false, undefined, error);
    throw error;
  }
}

// Generate chat response using LM Studio
export async function generateLMStudioResponse(
  message: string,
  context: ChatMessage[] = [],
  model: string = 'local-model'
): Promise<string> {
  try {
    // Build context from previous messages
    const contextMessages = context
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Add the current user message
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Respond naturally and conversationally to the user\'s messages. Be concise but informative.'
      },
      ...contextMessages,
      {
        role: 'user',
        content: message
      }
    ];

    // Make request to LM Studio API (default port 1234)
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model, // Use the specified model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as LMStudioChatResponse;
    return data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response at the moment.";
  } catch (error) {
    log.externalService('lm-studio', 'chat', false, undefined, error);
    throw new Error('Failed to connect to LM Studio. Make sure LM Studio is running and the server is started.');
  }
}

// Check if LM Studio is available
export async function checkLMStudioHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:1234/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Get available models from LM Studio
export async function getLMStudioModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:1234/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status}`);
    }

    const data = await response.json();
    const modelsData = data as LMStudioModelsResponse;
    return modelsData.data?.map((model) => model.id) || [];
  } catch (error) {
    log.externalService('lm-studio', 'fetch-models', false, undefined, error);
    return [];
  }
}
