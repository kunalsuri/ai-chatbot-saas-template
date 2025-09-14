/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
});

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000, "Message must be less than 5000 characters"),
  provider: z.union([z.literal("ollama"), z.literal("lmstudio")], { required_error: "Provider must be either 'ollama' or 'lmstudio'" }),
  model: z.string().min(1, "Model name is required").max(100, "Model name must be less than 100 characters").optional(),
  context: z.array(z.object({
    id: z.string(),
    role: z.union([z.literal("user"), z.literal("assistant")]),
    content: z.string(),
    timestamp: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  })).optional().default([]),
});

export const chatSessionSchema = z.object({
  id: z.string().min(1, "Session ID is required"),
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters"),
  messages: z.array(z.object({
    id: z.string(),
    role: z.union([z.literal("user"), z.literal("assistant")]),
    content: z.string(),
    timestamp: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
    metadata: z.object({
      model: z.string().optional(),
      provider: z.string().optional(),
      responseTime: z.number().optional(),
    }).optional(),
  })),
  createdAt: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  updatedAt: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
});

// Translation schemas
export const translationSchema = z.object({
  text: z.string().min(1, "Text cannot be empty").max(10000, "Text must be less than 10000 characters"),
  sourceLang: z.string().min(2, "Source language code must be at least 2 characters").max(10, "Source language code must be less than 10 characters"),
  targetLang: z.string().min(2, "Target language code must be at least 2 characters").max(10, "Target language code must be less than 10 characters"),
  model: z.string().min(1, "Model name is required").max(100, "Model name must be less than 100 characters"),
  isCasual: z.boolean().optional().default(true),
});

// Prompt improvement schemas
export const promptImprovementSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(5000, "Prompt must be less than 5000 characters"),
  model: z.string().min(1, "Model name is required").max(100, "Model name must be less than 100 characters").optional(),
});

// Ollama schemas
export const ollamaTestSchema = z.object({
  model: z.string().min(1, "Model name is required").max(100, "Model name must be less than 100 characters"),
});

export const lmStudioTestSchema = z.object({
  model: z.string().min(1, "Model name is required").max(100, "Model name must be less than 100 characters"),
  message: z.string().min(1, "Test message is required").max(1000, "Test message must be less than 1000 characters").optional(),
});

// Editor schemas
export const editorSaveSchema = z.object({
  designData: z.record(z.string(), z.unknown()).refine(data => typeof data === 'object', "Invalid design data format"),
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters").optional(),
});

// External service schemas
export const ollamaGenerateSchema = z.object({
  model: z.string().min(1, "Model name is required"),
  prompt: z.string().min(1, "Prompt is required"),
  system: z.string().optional(),
  stream: z.boolean().optional().default(false),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    num_predict: z.number().int().min(1).optional(),
    top_k: z.number().int().min(1).optional(),
    repeat_penalty: z.number().min(0).optional(),
    seed: z.number().int().optional(),
  }).optional(),
});

export const ollamaChatSchema = z.object({
  model: z.string().min(1, "Model name is required"),
  messages: z.array(z.object({
    role: z.union([z.literal("system"), z.literal("user"), z.literal("assistant")]),
    content: z.string().min(1, "Message content is required"),
  })).min(1, "At least one message is required"),
  stream: z.boolean().optional().default(false),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    num_predict: z.number().int().min(1).optional(),
  }).optional(),
});

// Generic ID validation - Updated to support chat session ID format
export const uuidSchema = z.string().uuid("Invalid UUID format");
export const chatSessionIdSchema = z.string().min(1, "Session ID is required").regex(/^chat_\d+$/, "Invalid chat session ID format");

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").optional().default(20),
});

// Type exports
export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;
export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;
export type ChatSessionData = z.infer<typeof chatSessionSchema>;
export type TranslationRequest = z.infer<typeof translationSchema>;
export type PromptImprovementRequest = z.infer<typeof promptImprovementSchema>;
export type OllamaTestRequest = z.infer<typeof ollamaTestSchema>;
export type LMStudioTestRequest = z.infer<typeof lmStudioTestSchema>;
export type EditorSaveRequest = z.infer<typeof editorSaveSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type OllamaGenerateRequest = z.infer<typeof ollamaGenerateSchema>;
export type OllamaChatRequest = z.infer<typeof ollamaChatSchema>;
