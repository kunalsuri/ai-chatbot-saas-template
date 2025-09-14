/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { 
  ChatSession, 
  ChatMessage, 
  ChatRequest, 
  ChatResponse, 
  ChatProvider, 
  ChatModel 
} from '../types';

const API_BASE = '/api/chat';

export const chatApi = {
  async getSessions(): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE}/sessions`);
    if (!response.ok) throw new Error('Failed to fetch chat sessions');
    return response.json();
  },

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch chat session');
    return response.json();
  },

  async createSession(title?: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create chat session');
    return response.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete chat session');
  },

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async streamMessage(request: ChatRequest): Promise<ReadableStream<ChatMessage>> {
    const response = await fetch(`${API_BASE}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true }),
    });
    if (!response.ok) throw new Error('Failed to start stream');
    return response.body as ReadableStream<ChatMessage>;
  },

  async getProviders(): Promise<ChatProvider[]> {
    const response = await fetch(`${API_BASE}/providers`);
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  },

  async getModels(providerId: string): Promise<ChatModel[]> {
    const response = await fetch(`${API_BASE}/providers/${providerId}/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },
};
