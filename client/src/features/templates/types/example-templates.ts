/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';

/**
 * Template category types
 */
export type TemplateCategory = 'chat' | 'translate' | 'prompt' | 'summary';

/**
 * Example template interface
 */
export interface ExampleTemplate {
  id: string;
  category: TemplateCategory;
  label: string;
  text: string;
}

/**
 * Zod schema for validating example templates
 */
export const exampleTemplateSchema = z.object({
  id: z.string(),
  category: z.union([z.literal('chat'), z.literal('translate'), z.literal('prompt'), z.literal('summary')]),
  label: z.string().min(1),
  text: z.string().min(1)
});

/**
 * Zod schema for validating an array of example templates
 */
export const exampleTemplatesSchema = z.array(exampleTemplateSchema);

/**
 * Type for API response containing example templates
 */
export interface ExampleTemplatesResponse {
  templates: ExampleTemplate[];
}
