/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exampleTemplatesSchema } from '@shared/types/example-templates';
import { sendErrorResponse, sendSuccessResponse } from '../../../shared/middleware/errorHandler.js';
import { asyncHandler } from '../../../shared/middleware/errorHandler.js';
import { createValidationError } from '../../../shared/utils/errors.js';

/**
 * GET /api/example-templates
 * Returns example templates filtered by category
 */
export const getExampleTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    
    // Read templates from file
    const filePath = path.join(process.cwd(), 'data', 'example-templates.json');
    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (error: any) {
      return sendErrorResponse(res, createExternalServiceError(`Failed to read example templates file: ${error.message}`, 'file-system'), req);
    }
    const templates = JSON.parse(fileContent);
    
    // Validate templates against schema
    const validationResult = exampleTemplatesSchema.safeParse(templates);
    
    if (!validationResult.success) {
      throw createExternalServiceError('Invalid template data format', 'templates', validationResult.error);
    }
    
    // Filter by category if provided
    const filteredTemplates = category 
      ? templates.filter((template: any) => template.category === category)
      : templates;
    
    // Send response
    sendSuccessResponse(res, {
      templates: filteredTemplates
    });
  } catch (error: any) {
    sendErrorResponse(res, error, req);
  }
};
