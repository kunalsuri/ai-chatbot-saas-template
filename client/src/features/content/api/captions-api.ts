/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { securePost } from "@/features/auth";
import type { GeneratedCaption } from "@/types";

export const captionsApi = {
  generateCaption: async (params: {
    quoteText: string;
    platform?: string;
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    tone?: string;
  }): Promise<GeneratedCaption> => {
    const response = await securePost<GeneratedCaption>("/api/captions/generate", params);
    return response.data!;
  },
};
