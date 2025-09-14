/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet } from "@/features/auth";

export const instagramApi = {
  getInstagramAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await secureGet<{ authUrl: string }>("/api/instagram/auth-url");
    return response.data!;
  },
};
