/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet } from "@/features/auth";
import type { Template } from "@/types";
import { ExampleTemplate } from '../types/example-templates';

export const templatesApi = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await secureGet<Template[]>("/api/templates");
    return response.data!;
  },

  getPopularTemplates: async (): Promise<Template[]> => {
    const response = await secureGet<Template[]>("/api/templates/popular");
    return response.data!;
  },

  getExampleTemplates: async (category?: string): Promise<ExampleTemplate[]> => {
    const url = category ? `/api/example-templates?category=${encodeURIComponent(category)}` : '/api/example-templates';
    const response = await secureGet<{ templates: ExampleTemplate[] }>(url);
    return response.data!.templates;
  },
};
