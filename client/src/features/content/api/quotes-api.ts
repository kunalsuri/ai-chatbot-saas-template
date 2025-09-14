/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { securePost } from "@/features/auth";
import type { Quote } from "@/types";

export const quotesApi = {
  generateQuote: async (params: {
    category?: string;
    theme?: string;
    tone?: string;
    keywords?: string[];
  }): Promise<Quote> => {
    const response = await securePost<Quote>("/api/quotes/generate", params);
    return response.data!;
  },

  generateCustomQuoteOllama: async (prompt: string, model?: string): Promise<{ quote?: string; text?: string }> => {
    const response = await securePost<{ quote?: string; text?: string }>("/api/quotes/generate-custom-ollama", {
      prompt,
      model: model || "llama3.2"
    });
    return response.data!;
  },

  generateQuoteOllama: async (params: {
    category?: string;
    theme?: string;
    tone?: string;
    keywords?: string[];
  }): Promise<Quote> => {
    const response = await securePost<Quote>("/api/quotes/generate-ollama", params);
    return response.data!;
  },
};
